import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingModal } from '../components/OnboardingModal';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { ONBOARDING_KEY, PERIODS_KEY } from '../constants';
import { useLanguage } from '../i18n';
import { AddScreen } from '../screens/AddScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { styles } from '../theme/styles';
import type { RecoveryPeriod, RootTabParamList, UndoState } from '../types';
import { today } from '../utils/date';
import { getCurrentRunDays, getTotalCleanDays, normalizePeriod } from '../utils/period';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [periods, setPeriods] = useState<RecoveryPeriod[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [undo, setUndo] = useState<UndoState | undefined>();
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [periods],
  );

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
    if (loaded) {
      AsyncStorage.setItem(PERIODS_KEY, JSON.stringify(periods));
    }
  }, [loaded, periods]);

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

      if (period) {
        showUndo({
          message: t('deleted'),
          actionLabel: t('undo'),
          onUndo: () => {
            clearUndo();
            setPeriods((items) => [period, ...items.filter((item) => item.id !== period.id)]);
          },
        });
      }

      return current.filter((period) => period.id !== id);
    });
  };

  const resetPeriod = (id: string) => {
    setPeriods((current) =>
      current.map((period) => {
        if (period.id !== id) {
          return period;
        }

        const previousPeriod = period;
        showUndo({
          message: t('restarted'),
          actionLabel: t('undo'),
          onUndo: () => {
            clearUndo();
            setPeriods((items) => items.map((item) => (item.id === previousPeriod.id ? previousPeriod : item)));
          },
        });

        return {
          ...period,
          startDate: today(),
          cleanDaysBeforeCurrentRun: getTotalCleanDays(period),
          currentStreak: 0,
          bestStreak: Math.max(period.bestStreak, getCurrentRunDays(period)),
          relapses: period.relapses + 1,
        };
      }),
    );
  };

  const recordSlip = (id: string) => {
    Alert.alert(
      t('lapseTitle'),
      t('lapseBody'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('recordLapse'), style: 'destructive', onPress: () => resetPeriod(id) },
      ],
    );
  };

  const editPeriod = (id: string, updates: Partial<Pick<RecoveryPeriod, 'dailyCost' | 'title'>>) => {
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
    Alert.alert(
      t('milestoneSaved'),
      `${t('nextGoal')}՝ ${days} ${t('days')}.`,
      [{ text: t('continue') }],
    );
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
        <Tab.Screen name="Home" options={{ title: t('today') }}>
          {({ navigation }) => (
            <HomeScreen
              navigation={navigation}
              onSlip={recordSlip}
              periods={sortedPeriods}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Add" options={{ title: t('start') }}>
          {({ navigation }) => <AddScreen navigation={navigation} onAdd={addPeriod} />}
        </Tab.Screen>
        <Tab.Screen name="Progress" options={{ title: t('progress') }}>
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

      <UndoSnackbar undo={undo} bottom={60 + insets.bottom} onDismiss={clearUndo} />
      <OnboardingModal visible={showOnboarding} onComplete={completeOnboarding} />
    </NavigationContainer>
  );
}
