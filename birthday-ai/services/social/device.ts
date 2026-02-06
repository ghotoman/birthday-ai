import * as Contacts from 'expo-contacts';
import { Contact as AppContact } from '@/types/contact';
import { randomUUID } from 'expo-crypto';

/**
 * Импорт контактов из телефонной книги устройства.
 * Возвращает только те, у кого указана дата рождения.
 */
export async function importDeviceContacts(): Promise<AppContact[]> {
  const { status } = await Contacts.requestPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Нет доступа к контактам. Разреши доступ в настройках устройства.');
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [
      Contacts.Fields.FirstName,
      Contacts.Fields.LastName,
      Contacts.Fields.Birthday,
      Contacts.Fields.Image,
    ],
  });

  return data
    .filter((c) => c.birthday)
    .map((c) => {
      const bd = c.birthday!;
      // expo-contacts birthday: { day, month, year? }
      const year = bd.year ?? 2000;
      const month = String(bd.month! + 1).padStart(2, '0'); // 0-indexed
      const day = String(bd.day!).padStart(2, '0');
      const birthday = `${year}-${month}-${day}`;

      const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Без имени';

      return {
        id: randomUUID(),
        name,
        avatarUrl: c.image?.uri,
        birthday,
        groupType: 'friend' as const,
        notificationLevel: 'same_day' as const,
        toneDefault: 'warm' as const,
        attributes: [],
        source: 'contacts' as const,
        sourceId: c.id,
        createdAt: new Date().toISOString(),
      };
    });
}
