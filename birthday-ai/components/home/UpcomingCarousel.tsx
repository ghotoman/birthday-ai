import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Contact } from '@/types/contact';
import { useColors } from '@/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { spacing, borderRadius, typography, shadows } from '@/constants/Theme';
import {
  daysUntilBirthday,
  birthdayCountdownText,
  formatBirthday,
  getUpcomingAge,
} from '@/utils/dates';

interface UpcomingCarouselProps {
  contacts: Contact[];
}

export function UpcomingCarousel({ contacts }: UpcomingCarouselProps) {
  const colors = useColors();
  const router = useRouter();

  if (contacts.length === 0) return null;

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ближайшие дни рождения
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {contacts.map((contact) => {
          const days = daysUntilBirthday(contact.birthday);
          const isToday = days === 0;

          return (
            <TouchableOpacity
              key={contact.id}
              activeOpacity={0.7}
              onPress={() =>
                isToday
                  ? router.push(`/generate/${contact.id}`)
                  : router.push(`/contact/${contact.id}`)
              }
              style={[
                styles.card,
                {
                  backgroundColor: isToday ? colors.primary : colors.card,
                  borderColor: isToday ? colors.primary : colors.borderLight,
                },
                shadows.md,
              ]}
            >
              <Avatar
                name={contact.name}
                imageUrl={contact.avatarUrl}
                size="lg"
              />
              <Text
                style={[
                  styles.cardName,
                  { color: isToday ? '#FFF' : colors.text },
                ]}
                numberOfLines={1}
              >
                {contact.name}
              </Text>
              <Text
                style={[
                  styles.cardDate,
                  { color: isToday ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                ]}
              >
                {formatBirthday(contact.birthday)}
              </Text>
              <Text
                style={[
                  styles.cardAge,
                  { color: isToday ? 'rgba(255,255,255,0.7)' : colors.textTertiary },
                ]}
              >
                {getUpcomingAge(contact.birthday)} лет
              </Text>
              <View
                style={[
                  styles.countdownBadge,
                  {
                    backgroundColor: isToday
                      ? 'rgba(255,255,255,0.25)'
                      : days <= 7
                      ? colors.accentLight
                      : colors.backgroundTertiary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countdownText,
                    {
                      color: isToday
                        ? '#FFF'
                        : days <= 7
                        ? '#B45309'
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {birthdayCountdownText(contact.birthday)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.title3,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  card: {
    width: 140,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  cardName: {
    ...typography.headline,
    fontSize: 15,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cardDate: {
    ...typography.caption1,
    marginTop: 2,
  },
  cardAge: {
    ...typography.caption2,
    marginTop: 1,
  },
  countdownBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
