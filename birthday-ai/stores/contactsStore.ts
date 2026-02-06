import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { Contact, ContactAttribute, GroupType, NotificationLevel, ToneType } from '@/types/contact';
import { daysUntilBirthday, isBirthdayToday } from '@/utils/dates';

const STORAGE_KEY = '@birthdayai_contacts';

interface ContactsState {
  contacts: Contact[];
  loaded: boolean;

  // Actions
  loadContacts: () => Promise<void>;
  addContact: (data: Omit<Contact, 'id' | 'createdAt' | 'source'> | Contact) => Promise<Contact>;
  importContact: (contact: Contact) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addAttribute: (contactId: string, attr: Omit<ContactAttribute, 'id'>) => Promise<void>;
  removeAttribute: (contactId: string, attrId: string) => Promise<void>;

  // Selectors
  getContact: (id: string) => Contact | undefined;
  getUpcoming: (limit?: number) => Contact[];
  getTodayBirthdays: () => Contact[];
  getByGroup: (group: GroupType) => Contact[];
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  loaded: false,

  loadContacts: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ contacts: JSON.parse(raw), loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch (e) {
      console.error('Failed to load contacts:', e);
      set({ loaded: true });
    }
  },

  addContact: async (data) => {
    // Если передан полный Contact (с id/source) — используем как есть
    const isFullContact = 'id' in data && 'source' in data && 'createdAt' in data;
    const contact: Contact = isFullContact
      ? (data as Contact)
      : {
          ...data,
          id: randomUUID(),
          source: 'manual' as const,
          createdAt: new Date().toISOString(),
        };
    const updated = [...get().contacts, contact];
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return contact;
  },

  importContact: async (contact) => {
    const updated = [...get().contacts, contact];
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updateContact: async (id, data) => {
    const updated = get().contacts.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteContact: async (id) => {
    const updated = get().contacts.filter((c) => c.id !== id);
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  addAttribute: async (contactId, attr) => {
    const fullAttr: ContactAttribute = { ...attr, id: randomUUID() };
    const updated = get().contacts.map((c) =>
      c.id === contactId
        ? { ...c, attributes: [...c.attributes, fullAttr] }
        : c
    );
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeAttribute: async (contactId, attrId) => {
    const updated = get().contacts.map((c) =>
      c.id === contactId
        ? { ...c, attributes: c.attributes.filter((a) => a.id !== attrId) }
        : c
    );
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getContact: (id) => get().contacts.find((c) => c.id === id),

  getUpcoming: (limit = 10) => {
    return [...get().contacts]
      .sort((a, b) => daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday))
      .slice(0, limit);
  },

  getTodayBirthdays: () => {
    return get().contacts.filter((c) => isBirthdayToday(c.birthday));
  },

  getByGroup: (group) => {
    return get().contacts.filter((c) => c.groupType === group);
  },
}));
