import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知处理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 初始化通知权限
 */
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get notification permissions');
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

/**
 * 任务提醒类型
 */
export type ReminderType = 'none' | '5min' | '15min' | '30min' | '1hour' | '1day';

/**
 * 获取提醒时间（分钟）
 */
function getReminderMinutes(type: ReminderType): number {
  const reminderMap: Record<ReminderType, number> = {
    none: 0,
    '5min': 5,
    '15min': 15,
    '30min': 30,
    '1hour': 60,
    '1day': 24 * 60,
  };
  return reminderMap[type];
}

/**
 * 获取提醒标签
 */
export function getReminderLabel(type: ReminderType): string {
  const labelMap: Record<ReminderType, string> = {
    none: '无提醒',
    '5min': '提前5分钟',
    '15min': '提前15分钟',
    '30min': '提前30分钟',
    '1hour': '提前1小时',
    '1day': '提前1天',
  };
  return labelMap[type];
}

/**
 * 调度任务提醒
 */
export async function scheduleTaskReminder(
  taskId: string,
  taskName: string,
  dueDate: string | undefined,
  reminderType: ReminderType
): Promise<string | null> {
  if (Platform.OS === 'web' || reminderType === 'none' || !dueDate) {
    return null;
  }

  try {
    // 取消之前的提醒
    await cancelTaskReminder(taskId);

    const dueDateObj = new Date(dueDate);
    const reminderMinutes = getReminderMinutes(reminderType);
    const triggerDate = new Date(dueDateObj.getTime() - reminderMinutes * 60 * 1000);

    // 如果提醒时间已过，不调度
    if (triggerDate <= new Date()) {
      return null;
    }

    const seconds = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '任务提醒',
        body: `任务"${taskName}"即将到期`,
        data: { taskId, type: 'task_reminder' },
      },
      trigger: Math.max(1, seconds) as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
    return null;
  }
}

/**
 * 取消任务提醒
 */
export async function cancelTaskReminder(taskId: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const taskReminders = notifications.filter(
      (notif) => notif.content.data?.taskId === taskId
    );

    for (const reminder of taskReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
  } catch (error) {
    console.error('Failed to cancel reminder:', error);
  }
}

/**
 * 取消所有提醒
 */
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all reminders:', error);
  }
}

/**
 * 获取所有已调度的通知
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}
