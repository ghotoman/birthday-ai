import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, getDay, getDaysInMonth, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useColors } from '@/hooks';
import { spacing, borderRadius, typography } from '@/constants/Theme';
import { Contact, GROUP_LABELS } from '@/types/contact';
import { getAge, getUpcomingAge } from '@/utils/dates';
import { Avatar } from '@/components/ui';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface BirthdayCalendarProps {
  contacts: Contact[];
  onContactPress: (contact: Contact) => void;
}

export function BirthdayCalendar({ contacts, onContactPress }: BirthdayCalendarProps) {
  const colors = useColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Карта: день месяца → контакты с ДР в этот день (в текущем отображаемом месяце)
  const birthdayMap = useMemo(() => {
    const map = new Map<number, Contact[]>();
    const month = currentMonth.getMonth() + 1; // 1-indexed

    contacts.forEach((c) => {
      const parts = c.birthday.split('-');
      const bMonth = parseInt(parts[1], 10);
      const bDay = parseInt(parts[2], 10);

      if (bMonth === month) {
        const existing = map.get(bDay) || [];
        existing.push(c);
        map.set(bDay, existing);
      }
    });

    return map;
  }, [contacts, currentMonth]);

  // Контакты для выбранной даты
  const selectedContacts = useMemo(() => {
    if (!selectedDate) return [];
    return birthdayMap.get(selectedDate.getDate()) || [];
  }, [selectedDate, birthdayMap]);

  // Данные для сетки
  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);

    // getDay: 0=Sun, нам нужно 0=Mon
    let startDay = getDay(firstDay) - 1;
    if (startDay < 0) startDay = 6;

    const cells: (number | null)[] = [];

    // Пустые ячейки до первого дня
    for (let i = 0; i < startDay; i++) {
      cells.push(null);
    }

    // Дни месяца
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    return cells;
  }, [currentMonth]);

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

  const totalBirthdays = birthdayMap.size;

  const goToPrev = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNext = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(null);
  };

  const handleDayPress = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate((prev) =>
      prev && prev.getDate() === day && prev.getMonth() === date.getMonth()
        ? null
        : date
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header с навигацией по месяцам */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={goToPrev} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.monthTitle}>
          <Text style={[typography.title3, { color: colors.text, textTransform: 'capitalize' }]}>
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </Text>
          {totalBirthdays > 0 && (
            <Text style={[typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
              {totalBirthdays} {pluralBirthdays(totalBirthdays)} в этом месяце
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNext} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Дни недели */}
      <View style={[styles.weekdayRow, { backgroundColor: colors.backgroundSecondary }]}>
        {WEEKDAYS.map((day, i) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                typography.caption1,
                {
                  color: i >= 5 ? colors.primary : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Сетка календаря */}
      <View style={[styles.grid, { backgroundColor: colors.card }]}>
        {calendarGrid.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const hasBirthday = birthdayMap.has(day);
          const birthdayCount = birthdayMap.get(day)?.length || 0;
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected =
            selectedDate?.getDate() === day &&
            selectedDate?.getMonth() === currentMonth.getMonth();
          const isWeekend = (index % 7) >= 5;

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayCell,
                isToday && { backgroundColor: colors.primaryLight },
                isSelected && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  typography.callout,
                  {
                    color: isSelected
                      ? '#FFF'
                      : isToday
                        ? colors.primary
                        : isWeekend
                          ? colors.primary
                          : colors.text,
                    fontWeight: isToday || hasBirthday ? '700' : '400',
                  },
                ]}
              >
                {day}
              </Text>

              {hasBirthday && (
                <View style={styles.dotRow}>
                  {birthdayCount <= 3 ? (
                    Array.from({ length: birthdayCount }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isSelected ? '#FFF' : colors.primary,
                          },
                        ]}
                      />
                    ))
                  ) : (
                    <>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isSelected ? '#FFF' : colors.primary },
                        ]}
                      />
                      <Text
                        style={[
                          typography.caption2,
                          {
                            color: isSelected ? '#FFF' : colors.primary,
                            fontWeight: '700',
                            marginLeft: 1,
                          },
                        ]}
                      >
                        {birthdayCount}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Список контактов под календарём */}
      {selectedDate && selectedContacts.length > 0 && (
        <View style={[styles.contactList, { backgroundColor: colors.card }]}>
          <Text style={[typography.headline, { color: colors.text, marginBottom: spacing.md }]}>
            🎂 {format(selectedDate, 'd MMMM', { locale: ru })}
          </Text>

          {selectedContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[styles.contactRow, { borderBottomColor: colors.borderLight }]}
              onPress={() => onContactPress(contact)}
              activeOpacity={0.6}
            >
              <Avatar name={contact.name} size={44} />
              <View style={styles.contactInfo}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                  {contact.name}
                </Text>
                <Text style={[typography.footnote, { color: colors.textSecondary }]}>
                  {GROUP_LABELS[contact.groupType]} · исполнится {getUpcomingAge(contact.birthday)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedDate && selectedContacts.length === 0 && (
        <View style={[styles.contactList, { backgroundColor: colors.card }]}>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            Нет дней рождения {format(selectedDate, 'd MMMM', { locale: ru })}
          </Text>
        </View>
      )}

      {/* Сводная таблица по месяцу */}
      {!selectedDate && birthdayMap.size > 0 && (
        <View style={[styles.contactList, { backgroundColor: colors.card }]}>
          <Text style={[typography.headline, { color: colors.text, marginBottom: spacing.md }]}>
            📋 Все ДР в {format(currentMonth, 'LLLL', { locale: ru })}
          </Text>

          {Array.from(birthdayMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([day, dayContacts]) =>
              dayContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[styles.contactRow, { borderBottomColor: colors.borderLight }]}
                  onPress={() => onContactPress(contact)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.dateChip, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[typography.caption1, { color: colors.primary, fontWeight: '700' }]}>
                      {day}
                    </Text>
                  </View>
                  <Avatar name={contact.name} size={40} />
                  <View style={styles.contactInfo}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                      {contact.name}
                    </Text>
                    <Text style={[typography.footnote, { color: colors.textSecondary }]}>
                      {GROUP_LABELS[contact.groupType]} · {getUpcomingAge(contact.birthday)} лет
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))
            )}
        </View>
      )}

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

function pluralBirthdays(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'дней рождения';
  if (last === 1) return 'день рождения';
  if (last > 1 && last < 5) return 'дня рождения';
  return 'дней рождения';
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    alignItems: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
  contactList: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  dateChip: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
