import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useContactsStore } from '@/stores/contactsStore';
import { useColors } from '@/hooks';
import { BirthdayCalendar } from '@/components/calendar/BirthdayCalendar';
import { EmptyState } from '@/components/ui';
import { Contact } from '@/types/contact';
import { useT } from '@/i18n';

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const t = useT();
  const { contacts, loaded, loadContacts } = useContactsStore();

  useEffect(() => {
    if (!loaded) loadContacts();
  }, [loaded]);

  const handleContactPress = (contact: Contact) => {
    router.push(`/contact/${contact.id}`);
  };

  if (loaded && contacts.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <EmptyState
          emoji="📅"
          title={t.calendar.emptyTitle}
          description={t.calendar.emptyDescription}
          actionTitle={t.calendar.addContact}
          onAction={() => router.push('/contact/new')}
        />
      </View>
    );
  }

  return (
    <BirthdayCalendar
      contacts={contacts}
      onContactPress={handleContactPress}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
