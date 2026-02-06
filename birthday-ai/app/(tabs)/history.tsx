import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGreetingsStore } from '@/stores/greetingsStore';
import { useColors } from '@/hooks';
import { Card, EmptyState, Badge } from '@/components/ui';
import { ShareBar } from '@/components/ui/ShareBar';
import { spacing, typography, borderRadius } from '@/constants/Theme';
import { TONE_LABELS, TONE_EMOJIS } from '@/types/contact';
import { FORMAT_LABELS, Greeting } from '@/types/greeting';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

function GreetingItem({ greeting }: { greeting: Greeting }) {
  const colors = useColors();

  return (
    <Card style={styles.greetingCard}>
      <View style={styles.greetingHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingName, { color: colors.text }]}>
            {greeting.contactName}
          </Text>
          <Text style={[styles.greetingDate, { color: colors.textSecondary }]}>
            {format(parseISO(greeting.createdAt), 'd MMM yyyy, HH:mm', {
              locale: ru,
            })}
          </Text>
        </View>
        <Badge
          label={TONE_LABELS[greeting.tone]}
          emoji={TONE_EMOJIS[greeting.tone]}
          variant="secondary"
        />
      </View>
      <Text
        style={[styles.greetingText, { color: colors.text }]}
        numberOfLines={4}
      >
        {greeting.greetingText}
      </Text>
      <View style={styles.greetingActions}>
        <ShareBar text={greeting.greetingText} compact />
      </View>
    </Card>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const { greetings, loaded, loadGreetings, getRecent } = useGreetingsStore();

  useEffect(() => {
    loadGreetings();
  }, []);

  const recent = getRecent(50);

  if (loaded && greetings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          emoji="📝"
          title="Пока пусто"
          description="Здесь будет история всех твоих поздравлений"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GreetingItem greeting={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['5xl'],
  },
  greetingCard: {
    marginBottom: 0,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  greetingName: {
    ...typography.headline,
  },
  greetingDate: {
    ...typography.caption1,
    marginTop: 2,
  },
  greetingText: {
    ...typography.body,
    lineHeight: 22,
  },
  greetingActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
