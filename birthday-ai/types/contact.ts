export type GroupType = 'family' | 'close_friend' | 'friend' | 'colleague' | 'acquaintance';

export type NotificationLevel = 'week' | '3days' | 'day_before' | 'same_day' | 'none';

export type ToneType = 'warm' | 'funny' | 'sarcastic' | 'formal' | 'roast';

export type AttributeCategory = 'hobby' | 'trait' | 'memory' | 'joke' | 'nickname' | 'other';

export interface ContactAttribute {
  id: string;
  category: AttributeCategory;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  birthday: string; // ISO date string YYYY-MM-DD, пустая строка если неизвестно
  groupType: GroupType;
  notificationLevel: NotificationLevel;
  toneDefault: ToneType;
  attributes: ContactAttribute[];
  source: 'manual' | 'vk' | 'ok' | 'calendar' | 'contacts';
  sourceId?: string;
  createdAt: string;
}

export const GROUP_LABELS: Record<GroupType, string> = {
  family: 'Семья',
  close_friend: 'Близкие друзья',
  friend: 'Друзья',
  colleague: 'Коллеги',
  acquaintance: 'Знакомые',
};

export const GROUP_ICONS: Record<GroupType, string> = {
  family: 'heart',
  close_friend: 'star',
  friend: 'people',
  colleague: 'briefcase',
  acquaintance: 'person',
};

export const TONE_LABELS: Record<ToneType, string> = {
  warm: 'Тёплый',
  funny: 'Весёлый',
  sarcastic: 'Саркастичный',
  formal: 'Формальный',
  roast: 'Дерзкий',
};

export const TONE_EMOJIS: Record<ToneType, string> = {
  warm: '🤗',
  funny: '😂',
  sarcastic: '😏',
  formal: '🎩',
  roast: '🔥',
};

export const ATTRIBUTE_LABELS: Record<AttributeCategory, string> = {
  hobby: 'Хобби',
  trait: 'Черта характера',
  memory: 'Общее воспоминание',
  joke: 'Внутренняя шутка',
  nickname: 'Прозвище',
  other: 'Другое',
};

export const NOTIFICATION_LABELS: Record<NotificationLevel, string> = {
  week: 'За неделю + за день',
  '3days': 'За 3 дня + в день',
  day_before: 'За день',
  same_day: 'В день',
  none: 'Без уведомлений',
};
