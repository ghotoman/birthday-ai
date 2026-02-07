import {
  differenceInYears,
  differenceInDays,
  format,
  setYear,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
  addYears,
} from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Есть ли дата рождения
 */
export function hasBirthday(birthday: string): boolean {
  return !!birthday && birthday.length >= 10;
}

/**
 * Получить возраст по дате рождения
 */
export function getAge(birthday: string): number {
  if (!hasBirthday(birthday)) return 0;
  return differenceInYears(new Date(), parseISO(birthday));
}

/**
 * Получить следующий день рождения (дату)
 */
export function getNextBirthday(birthday: string): Date {
  if (!hasBirthday(birthday)) return new Date(9999, 0, 1); // далеко в будущем
  const bday = parseISO(birthday);
  const today = startOfDay(new Date());
  const thisYear = today.getFullYear();

  let next = setYear(bday, thisYear);
  if (isBefore(startOfDay(next), today)) {
    next = setYear(bday, thisYear + 1);
  }
  return next;
}

/**
 * Дней до следующего ДР
 */
export function daysUntilBirthday(birthday: string): number {
  if (!hasBirthday(birthday)) return 9999;
  const next = getNextBirthday(birthday);
  const today = startOfDay(new Date());
  return differenceInDays(startOfDay(next), today);
}

/**
 * Сегодня ли ДР
 */
export function isBirthdayToday(birthday: string): boolean {
  if (!hasBirthday(birthday)) return false;
  return daysUntilBirthday(birthday) === 0;
}

/**
 * Форматировать дату рождения: "15 марта"
 */
export function formatBirthday(birthday: string): string {
  if (!hasBirthday(birthday)) return 'ДР не указан';
  return format(parseISO(birthday), 'd MMMM', { locale: ru });
}

/**
 * Форматировать дату рождения с годом: "15 марта 1990"
 */
export function formatBirthdayFull(birthday: string): string {
  if (!hasBirthday(birthday)) return 'Дата не указана';
  return format(parseISO(birthday), 'd MMMM yyyy', { locale: ru });
}

/**
 * Текст обратного отсчёта: "Сегодня!", "Завтра", "Через 5 дней"
 */
export function birthdayCountdownText(birthday: string): string {
  if (!hasBirthday(birthday)) return 'ДР не указан';
  const days = daysUntilBirthday(birthday);
  if (days === 0) return 'Сегодня! 🎉';
  if (days === 1) return 'Завтра';
  if (days <= 7) return `Через ${days} ${pluralDays(days)}`;
  if (days <= 30) return `Через ${days} ${pluralDays(days)}`;
  return formatBirthday(birthday);
}

/**
 * Склонение слова "день"
 */
function pluralDays(n: number): string {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;
  if (abs > 10 && abs < 20) return 'дней';
  if (lastDigit > 1 && lastDigit < 5) return 'дня';
  if (lastDigit === 1) return 'день';
  return 'дней';
}

/**
 * Какой возраст будет в следующий ДР
 */
export function getUpcomingAge(birthday: string): number {
  if (!hasBirthday(birthday)) return 0;
  const next = getNextBirthday(birthday);
  const bday = parseISO(birthday);
  return differenceInYears(next, bday);
}
