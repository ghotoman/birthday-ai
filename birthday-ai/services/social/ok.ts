import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OK_APP_ID, OK_REDIRECT_URI } from './config';
import { Contact } from '@/types/contact';
import { randomUUID } from 'expo-crypto';

const OK_TOKEN_KEY = '@birthdayai_ok_token';

interface OKUser {
  uid: string;
  first_name: string;
  last_name: string;
  birthday?: string; // "YYYY-MM-DD"
  pic190x190?: string;
}

/**
 * OAuth авторизация OK через браузер
 */
export async function okLogin(): Promise<string | null> {
  const authUrl =
    `https://connect.ok.ru/oauth/authorize?` +
    `client_id=${OK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(OK_REDIRECT_URI)}` +
    `&scope=VALUABLE_ACCESS;FRIENDS` +
    `&response_type=token` +
    `&layout=m`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, OK_REDIRECT_URI);

  if (result.type === 'success' && result.url) {
    const hash = result.url.split('#')[1];
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (token) {
      await AsyncStorage.setItem(OK_TOKEN_KEY, token);
      return token;
    }
  }
  return null;
}

export async function okGetToken(): Promise<string | null> {
  return AsyncStorage.getItem(OK_TOKEN_KEY);
}

export async function okLogout(): Promise<void> {
  await AsyncStorage.removeItem(OK_TOKEN_KEY);
}

/**
 * Загрузить друзей из OK с датами рождения
 */
export async function okFetchFriends(token: string): Promise<Contact[]> {
  // 1. Получить список ID друзей
  const friendsRes = await fetch(
    `https://api.ok.ru/fb.do?method=friends.get&access_token=${token}&format=json`
  );
  const friendsIds: string[] = await friendsRes.json();

  if (!Array.isArray(friendsIds) || friendsIds.length === 0) {
    return [];
  }

  // 2. Получить инфо о друзьях (батчами по 100)
  const allContacts: Contact[] = [];
  const batchSize = 100;

  for (let i = 0; i < friendsIds.length; i += batchSize) {
    const batch = friendsIds.slice(i, i + batchSize);
    const uids = batch.join(',');

    const usersRes = await fetch(
      `https://api.ok.ru/fb.do?method=users.getInfo` +
        `&uids=${uids}` +
        `&fields=FIRST_NAME,LAST_NAME,BIRTHDAY,PIC190X190` +
        `&access_token=${token}` +
        `&format=json`
    );
    const users: OKUser[] = await usersRes.json();

    if (!Array.isArray(users)) continue;

    for (const u of users) {
      if (!u.birthday) continue;

      allContacts.push({
        id: randomUUID(),
        name: `${u.first_name} ${u.last_name}`,
        avatarUrl: u.pic190x190,
        birthday: u.birthday, // OK возвращает YYYY-MM-DD
        groupType: 'friend',
        notificationLevel: 'same_day',
        toneDefault: 'warm',
        attributes: [],
        source: 'ok',
        sourceId: u.uid,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return allContacts;
}

/**
 * Полный flow: авторизация + загрузка
 */
export async function okImportFriends(): Promise<Contact[]> {
  let token = await okGetToken();

  if (!token) {
    token = await okLogin();
  }

  if (!token) {
    throw new Error('Не удалось авторизоваться в OK');
  }

  return okFetchFriends(token);
}
