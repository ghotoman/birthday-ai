import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VK_APP_ID, VK_REDIRECT_URI, VK_API_VERSION } from './config';
import { Contact } from '@/types/contact';
import { randomUUID } from 'expo-crypto';

const VK_TOKEN_KEY = '@birthdayai_vk_token';

interface VKFriend {
  id: number;
  first_name: string;
  last_name: string;
  bdate?: string; // "D.M" или "D.M.YYYY"
  photo_200?: string;
}

/**
 * OAuth авторизация VK через браузер.
 * Возвращает access_token или null.
 */
export async function vkLogin(): Promise<string | null> {
  const authUrl =
    `https://oauth.vk.com/authorize?` +
    `client_id=${VK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(VK_REDIRECT_URI)}` +
    `&display=mobile` +
    `&scope=friends` +
    `&response_type=token` +
    `&v=${VK_API_VERSION}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, VK_REDIRECT_URI);

  if (result.type === 'success' && result.url) {
    // Токен в fragment: ...#access_token=XXX&expires_in=0&user_id=123
    const hash = result.url.split('#')[1];
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (token) {
      await AsyncStorage.setItem(VK_TOKEN_KEY, token);
      return token;
    }
  }
  return null;
}

/**
 * Получить сохранённый токен
 */
export async function vkGetToken(): Promise<string | null> {
  return AsyncStorage.getItem(VK_TOKEN_KEY);
}

/**
 * Выйти из VK
 */
export async function vkLogout(): Promise<void> {
  await AsyncStorage.removeItem(VK_TOKEN_KEY);
}

/**
 * Парсинг даты VK "D.M.YYYY" или "D.M" → "YYYY-MM-DD"
 */
function parseVKDate(bdate: string): string | null {
  const parts = bdate.split('.');
  if (parts.length < 2) return null;

  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts.length === 3 ? parts[2] : '2000'; // если год не указан — ставим дефолт

  return `${year}-${month}-${day}`;
}

/**
 * Загрузить друзей VK с датами рождения.
 * Возвращает готовые Contact объекты.
 */
export async function vkFetchFriends(token: string): Promise<Contact[]> {
  const url =
    `https://api.vk.com/method/friends.get?` +
    `fields=bdate,photo_200,first_name,last_name` +
    `&order=name` +
    `&count=5000` +
    `&v=${VK_API_VERSION}` +
    `&access_token=${token}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.error_msg || 'VK API error');
  }

  const friends: VKFriend[] = data.response?.items ?? [];

  // Только те, у кого указана дата рождения
  return friends
    .filter((f) => f.bdate)
    .map((f) => {
      const birthday = parseVKDate(f.bdate!);
      if (!birthday) return null;

      return {
        id: randomUUID(),
        name: `${f.first_name} ${f.last_name}`,
        avatarUrl: f.photo_200,
        birthday,
        groupType: 'friend' as const,
        notificationLevel: 'same_day' as const,
        toneDefault: 'warm' as const,
        attributes: [],
        source: 'vk' as const,
        sourceId: String(f.id),
        createdAt: new Date().toISOString(),
      };
    })
    .filter(Boolean) as Contact[];
}

/**
 * Полный flow: авторизация + загрузка друзей одной кнопкой
 */
export async function vkImportFriends(): Promise<Contact[]> {
  let token = await vkGetToken();

  if (!token) {
    token = await vkLogin();
  }

  if (!token) {
    throw new Error('Не удалось авторизоваться в VK');
  }

  return vkFetchFriends(token);
}
