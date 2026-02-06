import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContactsStore } from '@/stores/contactsStore';
import { useColors } from '@/hooks';
import { ContactCard } from '@/components/contacts/ContactCard';
import { EmptyState } from '@/components/ui';
import { spacing, borderRadius, typography } from '@/constants/Theme';
import { Contact, GroupType, GROUP_LABELS } from '@/types/contact';
import { daysUntilBirthday } from '@/utils/dates';
import { useT } from '@/i18n';

export default function ContactsScreen() {
  const colors = useColors();
  const router = useRouter();
  const t = useT();
  const { contacts, loaded, loadContacts } = useContactsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GroupType | 'all'>('all');

  const GROUP_FILTERS: { key: GroupType | 'all'; label: string }[] = [
    { key: 'all', label: t.contacts.all },
    { key: 'family', label: t.contacts.family },
    { key: 'close_friend', label: t.contacts.closeFriends },
    { key: 'friend', label: t.contacts.friends },
    { key: 'colleague', label: t.contacts.colleagues },
    { key: 'acquaintance', label: t.contacts.acquaintances },
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  const filtered = contacts
    .filter((c) => {
      if (filter !== 'all' && c.groupType !== filter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Поиск */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t.contacts.search}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/contact/new')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Фильтры */}
      <FlatList
        horizontal
        data={GROUP_FILTERS}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundSecondary,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? '#FFF' : colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Список */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="👥"
          title={contacts.length === 0 ? t.contacts.noContacts : t.contacts.nothingFound}
          description={
            contacts.length === 0
              ? t.contacts.noContactsDesc
              : t.contacts.nothingFoundDesc
          }
          actionTitle={contacts.length === 0 ? t.contacts.addContact : undefined}
          onAction={
            contacts.length === 0
              ? () => router.push('/contact/new')
              : undefined
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactCard contact={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: spacing['5xl'],
  },
});
