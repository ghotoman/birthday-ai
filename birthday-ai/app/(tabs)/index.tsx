import React, { useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContactsStore } from '@/stores/contactsStore';
import { useColors } from '@/hooks';
import { UpcomingCarousel } from '@/components/home/UpcomingCarousel';
import { ContactCard } from '@/components/contacts/ContactCard';
import { EmptyState } from '@/components/ui';
import { spacing, typography, borderRadius, shadows } from '@/constants/Theme';
import { useT } from '@/i18n';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { contacts, loaded, loadContacts, getUpcoming, getTodayBirthdays } =
    useContactsStore();
  const t = useT();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const upcoming = getUpcoming(10);
  const todayBirthdays = getTodayBirthdays();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  if (loaded && contacts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          emoji="🎂"
          title={t.home.emptyTitle}
          description={t.home.emptyDescription}
          actionTitle={t.home.emptyAction}
          onAction={() => router.push('/contact/new')}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Сегодняшние ДР — акцентный блок */}
      {todayBirthdays.length > 0 && (
        <View
          style={[
            styles.todayBlock,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <Text style={styles.todayEmoji}>🎉</Text>
          <Text style={[styles.todayTitle, { color: colors.primary }]}>
            {t.home.todayBirthday}
          </Text>
          {todayBirthdays.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.todayCard,
                { backgroundColor: colors.primary },
                shadows.md,
              ]}
              activeOpacity={0.8}
              onPress={() => router.push(`/generate/${c.id}`)}
            >
              <Text style={styles.todayName}>{c.name}</Text>
              <View style={styles.todayBtn}>
                <Ionicons name="gift" size={18} color="#FFF" />
                <Text style={styles.todayBtnText}>{t.home.congratulate}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Карусель ближайших ДР */}
      <UpcomingCarousel contacts={upcoming} />

      {/* Быстрые действия */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
            shadows.sm,
          ]}
          activeOpacity={0.7}
          onPress={() => router.push('/contact/new')}
        >
          <Ionicons name="person-add" size={22} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            {t.home.addContact}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
            shadows.sm,
          ]}
          activeOpacity={0.7}
          onPress={() => router.push('/import' as any)}
        >
          <Ionicons name="cloud-download" size={22} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            {t.home.import}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ближайшие (список) */}
      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t.home.upcoming}
          </Text>
          {upcoming.slice(0, 5).map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  todayBlock: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  todayEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  todayTitle: {
    ...typography.title3,
    marginBottom: spacing.md,
  },
  todayCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  todayName: {
    ...typography.headline,
    color: '#FFF',
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  todayBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  actionText: {
    ...typography.callout,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.title3,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
