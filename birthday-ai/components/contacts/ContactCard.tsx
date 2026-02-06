import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Contact, GROUP_LABELS } from '@/types/contact';
import { useColors } from '@/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { spacing, borderRadius, typography, shadows } from '@/constants/Theme';
import {
  birthdayCountdownText,
  daysUntilBirthday,
  formatBirthday,
  getAge,
} from '@/utils/dates';

interface ContactCardProps {
  contact: Contact;
  compact?: boolean;
}

export function ContactCard({ contact, compact = false }: ContactCardProps) {
  const colors = useColors();
  const router = useRouter();
  const days = daysUntilBirthday(contact.birthday);
  const isToday = days === 0;
  const isSoon = days <= 7;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/contact/${contact.id}`)}
      style={[
        styles.container,
        {
          backgroundColor: isToday ? colors.primaryLight : colors.card,
          borderColor: isToday ? colors.primary : colors.borderLight,
        },
        shadows.md,
      ]}
    >
      <Avatar name={contact.name} imageUrl={contact.avatarUrl} size={compact ? 'sm' : 'md'} />

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatBirthday(contact.birthday)} · {getAge(contact.birthday)} лет
        </Text>
        {!compact && contact.attributes.length > 0 && (
          <View style={styles.tags}>
            {contact.attributes.slice(0, 2).map((attr) => (
              <Badge
                key={attr.id}
                label={attr.value}
                variant="neutral"
                style={{ marginRight: spacing.xs, marginTop: spacing.xs }}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.countdown,
            {
              color: isToday
                ? colors.primary
                : isSoon
                ? colors.warning
                : colors.textTertiary,
            },
          ]}
        >
          {birthdayCountdownText(contact.birthday)}
        </Text>
        {isToday && (
          <TouchableOpacity
            style={[styles.greetBtn, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation?.();
              router.push(`/generate/${contact.id}`);
            }}
          >
            <Ionicons name="gift" size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.headline,
  },
  date: {
    ...typography.footnote,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  countdown: {
    ...typography.caption1,
    fontWeight: '600',
  },
  greetBtn: {
    marginTop: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
