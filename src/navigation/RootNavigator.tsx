import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailyCheckInModal } from '../components/DailyCheckInModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { ONBOARDING_KEY, PERIODS_KEY } from '../constants';
import { AddScreen } from '../screens/AddScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { styles } from '../theme/styles';
import type { RecoveryPeriod, RootTabParamList, UndoState } from '../types';
import { addDays, today } from '../utils/date';
import {
  ensureNotificationPermissions,
  getNotificationPeriodId,
  getNotificationRequestPeriodId,
  notificationMatchesReminderTime,
  scheduleDailyCheckNotification,
} from '../utils/notifications';
import {
  getCurrentRunDays,
  getTotalCleanDays,
  isDueForCheckIn,
  normalizePeriod,
} from '../utils/period';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const insets = useSafeAreaInsets();
  const [periods, setPeriods] = useState<RecoveryPeriod[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [targetCheckInPeriodId, setTargetCheckInPeriodId] = useState<string | undefined>();
  const [undo, setUndo] = useState<UndoState | undefined>();
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [periods],
  );
  const checkInPeriods = useMemo(() => sortedPeriods.filter(isDueForCheckIn), [sortedPeriods]);
  const visibleCheckInPeriods = useMemo(() => {
    if (!targetCheckInPeriodId) {
      return checkInPeriods;
    }

    const targetPeriod = sortedPeriods.find((period) => period.id === targetCheckInPeriodId);
    return targetPeriod && isDueForCheckIn(targetPeriod) ? [targetPeriod] : [];
  }, [checkInPeriods, sortedPeriods, targetCheckInPeriodId]);

  useEffect(() => {
    const load = async () => {
      const storedPeriods = await AsyncStorage.getItem(PERIODS_KEY);
      const storedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (storedPeriods) {
        setPeriods(JSON.parse(storedPeriods).map(normalizePeriod));
      }

      setShowOnboarding(storedOnboarding !== 'done');
      setLoaded(true);
    };

    load();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    setShowCheckIn(false);
  }, [loaded, visibleCheckInPeriods.length]);

  useEffect(() => {
    if (!loaded || Platform.OS === 'web') {
      return;
    }

    const showDueCheckIn = () => {
      const duePeriods = sortedPeriods.filter(isDueForCheckIn);
      if (duePeriods.length > 0) {
        setTargetCheckInPeriodId(undefined);
      }
    };

    const openNotificationCheckIn = (response: Notifications.NotificationResponse) => {
      const periodId = getNotificationPeriodId(response);
      if (periodId) {
        setTargetCheckInPeriodId(periodId);
        return;
      }

      showDueCheckIn();
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      openNotificationCheckIn(lastResponse);
      Notifications.clearLastNotificationResponse();
    }

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        showDueCheckIn();
      }
    });

    const notificationSubscription =
      Notifications.addNotificationResponseReceivedListener(openNotificationCheckIn);

    return () => {
      appStateSubscription.remove();
      notificationSubscription.remove();
    };
  }, [loaded, sortedPeriods]);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(PERIODS_KEY, JSON.stringify(periods));
    }
  }, [loaded, periods]);

  useEffect(() => {
    if (!loaded || Platform.OS === 'web') {
      return;
    }

    let isCancelled = false;

    const syncNotifications = async () => {
      const hasPermission = await ensureNotificationPermissions();
      if (!hasPermission || isCancelled) {
        return;
      }

      const pendingRequests = await Notifications.getAllScheduledNotificationsAsync();
      const activePeriodIds = new Set(sortedPeriods.map((period) => period.id));
      const requestsByPeriod = new Map<string, Notifications.NotificationRequest[]>();

      await Promise.all(
        pendingRequests.map(async (request) => {
          const periodId = getNotificationRequestPeriodId(request);
          if (!periodId) {
            return;
          }

          if (!activePeriodIds.has(periodId)) {
            await Notifications.cancelScheduledNotificationAsync(request.identifier);
            return;
          }

          const existing = requestsByPeriod.get(periodId) ?? [];
          requestsByPeriod.set(periodId, [...existing, request]);
        }),
      );

      const nextNotificationIds = new Map<string, string | undefined>();

      for (const period of sortedPeriods) {
        const requests = requestsByPeriod.get(period.id) ?? [];
        const matchingRequest = requests.find((request) =>
          notificationMatchesReminderTime(request, period.reminderTime),
        );
        const keepIdentifier = matchingRequest?.identifier;

        await Promise.all(
          requests
            .filter((request) => request.identifier !== keepIdentifier)
            .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
        );

        if (keepIdentifier) {
          nextNotificationIds.set(period.id, keepIdentifier);
          continue;
        }

        const notificationId = await scheduleDailyCheckNotification(period);
        nextNotificationIds.set(period.id, notificationId);
      }

      if (isCancelled || nextNotificationIds.size === 0) {
        return;
      }

      setPeriods((current) => {
        let didChange = false;
        const nextPeriods = current.map((period) => {
          if (!nextNotificationIds.has(period.id)) {
            return period;
          }

          const notificationId = nextNotificationIds.get(period.id);
          if (period.notificationId === notificationId) {
            return period;
          }

          didChange = true;
          return {
            ...period,
            notificationId,
          };
        });

        return didChange ? nextPeriods : current;
      });
    };

    syncNotifications();

    return () => {
      isCancelled = true;
    };
  }, [loaded, sortedPeriods]);

  const addPeriod = (period: RecoveryPeriod) => {
    setPeriods((current) => [period, ...current]);
  };

  const showUndo = (nextUndo: UndoState) => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    setUndo(nextUndo);
    undoTimerRef.current = setTimeout(() => {
      setUndo(undefined);
      undoTimerRef.current = undefined;
    }, 5000);
  };

  const clearUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = undefined;
    }
    setUndo(undefined);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'done');
    setShowOnboarding(false);
  };

  const deletePeriod = (id: string) => {
    setPeriods((current) => {
      const period = current.find((item) => item.id === id);
      if (period?.notificationId) {
        Notifications.cancelScheduledNotificationAsync(period.notificationId);
      }

      if (period) {
        showUndo({
          message: 'Ընթացքը ջնջվեց',
          actionLabel: 'Հետարկել',
          onUndo: () => {
            clearUndo();
            setPeriods((items) => [period, ...items.filter((item) => item.id !== period.id)]);
          },
        });
      }

      return current.filter((period) => period.id !== id);
    });
  };

  const keepToday = (id: string) => {
    const checkDate = today();
    setPeriods((current) =>
      current.map((period) => {
        if (period.id !== id || period.lastCheckInDate === checkDate) {
          return period;
        }

        const isConsecutive = period.lastCheckInDate === addDays(checkDate, -1);
        const currentStreak = isConsecutive ? period.currentStreak + 1 : 1;

        return {
          ...period,
          lastCheckInDate: checkDate,
          currentStreak,
          bestStreak: Math.max(period.bestStreak, currentStreak),
          totalCleanDays: getTotalCleanDays(period) + 1,
        };
      }),
    );
  };

  const resetPeriod = (id: string) => {
    setPeriods((current) =>
      current.map((period) => {
        if (period.id !== id) {
          return period;
        }

        const previousPeriod = period;
        showUndo({
          message: 'Ընթացիկ շարքը սկսվեց նորից',
          actionLabel: 'Հետարկել',
          onUndo: () => {
            clearUndo();
            setPeriods((items) =>
              items.map((item) => (item.id === previousPeriod.id ? previousPeriod : item)),
            );
          },
        });

        return {
          ...period,
          startDate: today(),
          lastCheckInDate: today(),
          currentStreak: 0,
          bestStreak: Math.max(period.bestStreak, getCurrentRunDays(period)),
          relapses: period.relapses + 1,
        };
      }),
    );
  };

  const recordSlip = (id: string) => {
    resetPeriod(id);
    Alert.alert(
      'Սայթաքելը պարտություն չէ',
      'Կարեւորը շարունակելն է: Ընթացիկ շարքը սկսվում է նորից, իսկ քո ամբողջ ճանապարհը մնում է քեզ հետ:',
      [{ text: 'Շարունակել' }],
    );
  };

  const editPeriod = (
    id: string,
    updates: Partial<Pick<RecoveryPeriod, 'dailyCost' | 'title'>>,
  ) => {
    setPeriods((current) =>
      current.map((period) =>
        period.id === id
          ? {
              ...period,
              ...updates,
            }
          : period,
      ),
    );
  };

  const setNextMilestone = (id: string, days: number) => {
    Alert.alert('Նշաձողը պահված է', `Հիանալի քայլ էր: Հաջորդ նպատակը՝ ${days} օր:`, [
      { text: 'Շարունակել' },
    ]);
    setPeriods((current) =>
      current.map((period) =>
        period.id === id
          ? {
              ...period,
              completedMilestones: Array.from(
                new Set([...(period.completedMilestones ?? []), period.currentMilestoneDays]),
              ),
              currentMilestoneDays: days,
            }
          : period,
      ),
    );
  };

  const closeCheckIn = () => {
    setTargetCheckInPeriodId(undefined);
    setShowCheckIn(false);
  };

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        initialRouteName="Add"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#0f766e',
          tabBarInactiveTintColor: '#6b7280',
          tabBarIcon: ({ color, focused }) => {
            const iconName =
              route.name === 'Home'
                ? focused
                  ? 'home'
                  : 'home-outline'
                : route.name === 'Add'
                  ? focused
                    ? 'add-circle'
                    : 'add-circle-outline'
                  : focused
                    ? 'stats-chart'
                    : 'stats-chart-outline';

            return (
              <Ionicons
                name={iconName as ComponentProps<typeof Ionicons>['name']}
                size={22}
                color={color}
              />
            );
          },
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
        })}
      >
        <Tab.Screen name="Home" options={{ title: 'Այսօր' }}>
          {({ navigation }) => (
            <HomeScreen
              navigation={navigation}
              onKeep={keepToday}
              onSlip={recordSlip}
              periods={sortedPeriods}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Add" options={{ title: 'Սկսել' }}>
          {({ navigation }) => <AddScreen navigation={navigation} onAdd={addPeriod} />}
        </Tab.Screen>
        <Tab.Screen name="Progress" options={{ title: 'Ընթացք' }}>
          {() => (
            <ProgressScreen
              onDelete={deletePeriod}
              onEdit={editPeriod}
              periods={sortedPeriods}
              onReset={recordSlip}
              onSetMilestone={setNextMilestone}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <DailyCheckInModal
        visible={showCheckIn}
        periods={visibleCheckInPeriods}
        onKeep={keepToday}
        onRelapse={recordSlip}
        onClose={closeCheckIn}
      />
      <UndoSnackbar undo={undo} bottom={88 + insets.bottom} />
      <OnboardingModal visible={showOnboarding} onComplete={completeOnboarding} />
    </NavigationContainer>
  );
}
