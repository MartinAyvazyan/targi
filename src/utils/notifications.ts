import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { RecoveryPeriod } from '../types';
import { parseReminderTime } from './reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function getNotificationPeriodId(response: Notifications.NotificationResponse) {
  const periodId = response.notification.request.content.data?.periodId;
  return typeof periodId === 'string' ? periodId : undefined;
}

export function getNotificationRequestPeriodId(request: Notifications.NotificationRequest) {
  const periodId = request.content.data?.periodId;
  return typeof periodId === 'string' ? periodId : undefined;
}

export function notificationMatchesReminderTime(request: Notifications.NotificationRequest, reminderTime: string) {
  const trigger = request.trigger as { hour?: number; minute?: number } | null;
  const { hour, minute } = parseReminderTime(reminderTime);
  return trigger?.hour === hour && trigger?.minute === minute;
}

export async function ensureNotificationPermissions() {
  if (Platform.OS === 'web') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-check', {
      name: 'Օրվա ստուգում',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDailyCheckNotification(period: RecoveryPeriod) {
  if (Platform.OS === 'web') {
    return undefined;
  }

  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    return undefined;
  }

  const { hour, minute } = parseReminderTime(period.reminderTime);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ինչպե՞ս անցավ օրդ',
      body: `Բացիր Targi-ն ու նշիր «${period.title}» ընթացքի այսօրվա վիճակը:`,
      sound: 'default',
      data: {
        periodId: period.id,
        screen: 'Progress',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: 'daily-check',
      hour,
      minute,
    },
  });
}
