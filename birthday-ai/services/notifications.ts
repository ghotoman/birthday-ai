import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Contact, NotificationLevel } from '@/types/contact';
import { getNextBirthday, getUpcomingAge } from '@/utils/dates';
import { subDays } from 'date-fns';

// Конфигурация уведомлений
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
 * Запрос разрешений на Push-уведомления
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Android: создаём канал уведомлений
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('birthdays', {
      name: 'Дни рождения',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF4D6D',
      sound: 'default',
    });
  }

  return true;
}

/**
 * Маппинг NotificationLevel → за сколько дней до ДР отправлять уведомления
 */
function getNotificationDays(level: NotificationLevel): number[] {
  switch (level) {
    case 'week':
      return [7, 1]; // за неделю и за день
    case '3days':
      return [3, 0]; // за 3 дня и в день
    case 'day_before':
      return [1]; // за день
    case 'same_day':
      return [0]; // в день
    case 'none':
      return [];
  }
}

/**
 * Текст уведомления
 */
function getNotificationBody(contact: Contact, daysBefore: number): { title: string; body: string } {
  const age = getUpcomingAge(contact.birthday);

  if (daysBefore === 0) {
    return {
      title: `🎂 Сегодня день рождения!`,
      body: `${contact.name} исполняется ${age}! Не забудь поздравить`,
    };
  }
  if (daysBefore === 1) {
    return {
      title: `🎁 Завтра день рождения`,
      body: `${contact.name} завтра исполнится ${age}. Подготовь поздравление!`,
    };
  }
  if (daysBefore === 3) {
    return {
      title: `📅 Через 3 дня — день рождения`,
      body: `${contact.name} скоро исполнится ${age}`,
    };
  }
  return {
    title: `📅 Через ${daysBefore} дней — день рождения`,
    body: `${contact.name} скоро исполнится ${age}. Время подготовить поздравление!`,
  };
}

/**
 * Идентификатор уведомления для контакта+дней
 */
function notificationId(contactId: string, daysBefore: number): string {
  return `bday_${contactId}_${daysBefore}`;
}

/**
 * Планировать уведомления для одного контакта
 */
export async function scheduleContactNotifications(contact: Contact): Promise<void> {
  const days = getNotificationDays(contact.notificationLevel);

  // Удалить старые уведомления для этого контакта
  await cancelContactNotifications(contact.id);

  if (days.length === 0) return;

  const nextBirthday = getNextBirthday(contact.birthday);
  const now = new Date();

  for (const daysBefore of days) {
    const notifDate = daysBefore === 0
      ? new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate(), 9, 0, 0)
      : subDays(nextBirthday, daysBefore);

    // Ставим на 9:00
    notifDate.setHours(9, 0, 0, 0);

    // Не планируем уведомления в прошлом
    if (notifDate <= now) continue;

    const { title, body } = getNotificationBody(contact, daysBefore);

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId(contact.id, daysBefore),
      content: {
        title,
        body,
        data: { contactId: contact.id, type: 'birthday_reminder' },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'birthdays' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifDate,
      },
    });
  }
}

/**
 * Отменить уведомления для конкретного контакта
 */
export async function cancelContactNotifications(contactId: string): Promise<void> {
  const allDays = [0, 1, 3, 7];
  for (const d of allDays) {
    await Notifications.cancelScheduledNotificationAsync(notificationId(contactId, d)).catch(() => {});
  }
}

/**
 * Переплаировать уведомления для всех контактов
 */
export async function rescheduleAllNotifications(contacts: Contact[]): Promise<void> {
  // Сначала удаляем все запланированные
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Планируем заново
  for (const contact of contacts) {
    await scheduleContactNotifications(contact);
  }
}

/**
 * Получить количество запланированных уведомлений
 */
export async function getScheduledCount(): Promise<number> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}
