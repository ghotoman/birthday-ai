import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContactsStore } from '@/stores/contactsStore';
import { useGreetingsStore } from '@/stores/greetingsStore';
import { useColors } from '@/hooks';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { spacing, borderRadius, typography, shadows } from '@/constants/Theme';
import {
  GROUP_LABELS,
  TONE_LABELS,
  TONE_EMOJIS,
  NOTIFICATION_LABELS,
  ATTRIBUTE_LABELS,
} from '@/types/contact';
import {
  formatBirthdayFull,
  getAge,
  daysUntilBirthday,
  birthdayCountdownText,
  getUpcomingAge,
} from '@/utils/dates';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const contact = useContactsStore((s) => s.getContact(id!));
  const deleteContact = useContactsStore((s) => s.deleteContact);
  const pastGreetings = useGreetingsStore((s) => s.getForContact(id!));

  if (!contact) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Контакт не найден</Text>
      </View>
    );
  }

  const days = daysUntilBirthday(contact.birthday);
  const isToday = days === 0;

  const handleDelete = () => {
    Alert.alert('Удалить контакт?', `${contact.name} будет удалён`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteContact(contact.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => router.push(`/contact/edit/${contact.id}`)}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Профиль */}
        <View style={styles.profile}>
          <Avatar name={contact.name} imageUrl={contact.avatarUrl} size="xl" />
          <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
          <Text style={[styles.birthday, { color: colors.textSecondary }]}>
            {formatBirthdayFull(contact.birthday)} · {getAge(contact.birthday)} лет
          </Text>
          <View
            style={[
              styles.countdownBadge,
              {
                backgroundColor: isToday ? colors.primaryLight : colors.accentLight,
              },
            ]}
          >
            <Text
              style={[
                styles.countdownText,
                { color: isToday ? colors.primary : '#B45309' },
              ]}
            >
              {birthdayCountdownText(contact.birthday)}
              {!isToday && ` · исполнится ${getUpcomingAge(contact.birthday)}`}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <Button
          title={isToday ? 'Поздравить! 🎉' : 'Подготовить поздравление'}
          onPress={() => router.push(`/generate/${contact.id}`)}
          variant="primary"
          size="lg"
          fullWidth
          icon={<Ionicons name="gift" size={20} color="#FFF" />}
          style={{ marginBottom: spacing.xl }}
        />

        {/* Инфо */}
        <Card style={{ marginBottom: spacing.md }}>
          <InfoRow label="Группа" value={GROUP_LABELS[contact.groupType]} />
          <InfoRow
            label="Тон"
            value={`${TONE_EMOJIS[contact.toneDefault]} ${TONE_LABELS[contact.toneDefault]}`}
          />
          <InfoRow label="Уведомления" value={NOTIFICATION_LABELS[contact.notificationLevel]} />
        </Card>

        {/* Атрибуты */}
        {contact.attributes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Атрибуты
            </Text>
            <View style={styles.attrList}>
              {contact.attributes.map((attr) => (
                <View key={attr.id} style={styles.attrRow}>
                  <Badge
                    label={ATTRIBUTE_LABELS[attr.category]}
                    variant="secondary"
                  />
                  <Text style={[styles.attrValue, { color: colors.text }]}>
                    {attr.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Прошлые поздравления */}
        {pastGreetings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Прошлые поздравления
            </Text>
            {pastGreetings.slice(0, 3).map((g) => (
              <Card key={g.id} style={{ marginBottom: spacing.sm }}>
                <Text style={[styles.pastDate, { color: colors.textSecondary }]}>
                  {format(parseISO(g.createdAt), 'd MMM yyyy', { locale: ru })}
                </Text>
                <Text
                  style={[styles.pastText, { color: colors.text }]}
                  numberOfLines={3}
                >
                  {g.greetingText}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  profile: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  name: {
    ...typography.title1,
    marginTop: spacing.md,
  },
  birthday: {
    ...typography.subhead,
    marginTop: spacing.xs,
  },
  countdownBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.subhead,
  },
  infoValue: {
    ...typography.subhead,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.title3,
    marginBottom: spacing.md,
  },
  attrList: {
    gap: spacing.sm,
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attrValue: {
    ...typography.body,
    flex: 1,
  },
  pastDate: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  pastText: {
    ...typography.body,
    lineHeight: 22,
  },
});
