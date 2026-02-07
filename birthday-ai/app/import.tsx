import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContactsStore } from '@/stores/contactsStore';
import { useColors } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { spacing, borderRadius, typography, shadows } from '@/constants/Theme';
import { Contact } from '@/types/contact';
import { vkImportFriends, okImportFriends, importDeviceContacts, importAllDeviceContacts } from '@/services/social';

type ImportSource = 'vk' | 'ok' | 'contacts' | 'contacts_all';
type ImportStatus = 'idle' | 'loading' | 'done' | 'error';

interface SourceConfig {
  id: ImportSource;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  importFn: () => Promise<Contact[]>;
}

const SOURCES: SourceConfig[] = [
  {
    id: 'vk',
    title: 'ВКонтакте',
    subtitle: 'Импорт друзей с датами рождения',
    icon: 'chatbubble',
    color: '#0077FF',
    importFn: vkImportFriends,
  },
  {
    id: 'ok',
    title: 'Одноклассники',
    subtitle: 'Импорт друзей с датами рождения',
    icon: 'ellipse',
    color: '#EE8208',
    importFn: okImportFriends,
  },
  {
    id: 'contacts',
    title: 'Контакты с ДР',
    subtitle: 'Только контакты с указанной датой рождения',
    icon: 'gift',
    color: '#10B981',
    importFn: importDeviceContacts,
  },
  {
    id: 'contacts_all',
    title: 'Все контакты телефона',
    subtitle: 'Имя, телефон, фото — дату ДР добавишь потом',
    icon: 'people',
    color: '#6366F1',
    importFn: importAllDeviceContacts,
  },
];

export default function ImportScreen() {
  const colors = useColors();
  const router = useRouter();
  const { contacts, addContact } = useContactsStore();

  const [statuses, setStatuses] = useState<Record<ImportSource, ImportStatus>>({
    vk: 'idle',
    ok: 'idle',
    contacts: 'idle',
    contacts_all: 'idle',
  });
  const [results, setResults] = useState<Record<ImportSource, { total: number; added: number }>>({
    vk: { total: 0, added: 0 },
    ok: { total: 0, added: 0 },
    contacts: { total: 0, added: 0 },
    contacts_all: { total: 0, added: 0 },
  });

  /**
   * Дедупликация: пропускаем контакт если уже есть с таким же source+sourceId
   * или с таким же именем + датой рождения
   */
  function isDuplicate(newContact: Contact): boolean {
    return contacts.some((existing) => {
      // Точное совпадение по источнику
      if (
        newContact.source === existing.source &&
        newContact.sourceId &&
        newContact.sourceId === existing.sourceId
      ) {
        return true;
      }
      // Совпадение по имени + дате
      if (
        newContact.name.toLowerCase() === existing.name.toLowerCase() &&
        newContact.birthday === existing.birthday
      ) {
        return true;
      }
      return false;
    });
  }

  async function handleImport(source: SourceConfig) {
    setStatuses((s) => ({ ...s, [source.id]: 'loading' }));

    try {
      const imported = await source.importFn();
      let added = 0;

      for (const contact of imported) {
        if (!isDuplicate(contact)) {
          await addContact(contact);
          added++;
        }
      }

      setResults((r) => ({ ...r, [source.id]: { total: imported.length, added } }));
      setStatuses((s) => ({ ...s, [source.id]: 'done' }));

      const skipped = imported.length - added;
      Alert.alert(
        'Импорт завершён',
        `Найдено: ${imported.length}\nДобавлено: ${added}${skipped > 0 ? `\nПропущено (дубли): ${skipped}` : ''}`,
      );
    } catch (err: any) {
      setStatuses((s) => ({ ...s, [source.id]: 'error' }));
      Alert.alert('Ошибка', err.message || 'Не удалось импортировать контакты');
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Импорт контактов',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Описание */}
        <View style={[styles.infoBlock, { backgroundColor: colors.secondaryLight }]}>
          <Ionicons name="information-circle" size={22} color={colors.secondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Нажми на источник — авторизуемся и загрузим друзей с датами рождения. Дубликаты пропускаются автоматически.
          </Text>
        </View>

        {/* Источники */}
        {SOURCES.map((source) => {
          const status = statuses[source.id];
          const result = results[source.id];

          return (
            <TouchableOpacity
              key={source.id}
              activeOpacity={0.7}
              disabled={status === 'loading'}
              onPress={() => handleImport(source)}
              style={[
                styles.sourceCard,
                {
                  backgroundColor: colors.card,
                  borderColor: status === 'done' ? colors.success : colors.borderLight,
                  borderWidth: status === 'done' ? 2 : 1,
                },
                shadows.md,
              ]}
            >
              <View style={[styles.sourceIcon, { backgroundColor: source.color + '15' }]}>
                <Ionicons name={source.icon as any} size={28} color={source.color} />
              </View>

              <View style={styles.sourceInfo}>
                <Text style={[styles.sourceTitle, { color: colors.text }]}>
                  {source.title}
                </Text>
                <Text style={[styles.sourceSubtitle, { color: colors.textSecondary }]}>
                  {source.subtitle}
                </Text>

                {/* Результат */}
                {status === 'done' && (
                  <Text style={[styles.sourceResult, { color: colors.success }]}>
                    +{result.added} контактов добавлено
                  </Text>
                )}
                {status === 'error' && (
                  <Text style={[styles.sourceResult, { color: colors.error }]}>
                    Ошибка. Нажми чтобы повторить
                  </Text>
                )}
              </View>

              {/* Правая часть */}
              {status === 'loading' ? (
                <ActivityIndicator size="small" color={source.color} />
              ) : status === 'done' ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              ) : (
                <View style={[styles.importBadge, { backgroundColor: source.color }]}>
                  <Text style={styles.importBadgeText}>Импорт</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Статистика */}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight },
          ]}
        >
          <Ionicons name="people" size={20} color={colors.textSecondary} />
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            Всего контактов в приложении: {contacts.length}
          </Text>
        </View>

        {/* Подсказка */}
        <Text style={[styles.footnote, { color: colors.textTertiary }]}>
          Для VK и OK потребуется авторизация. Мы получим только имена, фото и даты рождения друзей. Данные хранятся локально на устройстве.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    ...typography.subhead,
    lineHeight: 20,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  sourceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    ...typography.headline,
  },
  sourceSubtitle: {
    ...typography.caption1,
    marginTop: 2,
  },
  sourceResult: {
    ...typography.caption1,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  importBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  importBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statsText: {
    ...typography.callout,
  },
  footnote: {
    ...typography.footnote,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
});
