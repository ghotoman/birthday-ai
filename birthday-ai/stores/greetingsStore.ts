import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { Greeting, QuestionnaireAnswers } from '@/types/greeting';

const STORAGE_KEY = '@birthdayai_greetings';

interface GreetingsState {
  greetings: Greeting[];
  loaded: boolean;

  loadGreetings: () => Promise<void>;
  addGreeting: (data: Omit<Greeting, 'id' | 'createdAt' | 'sharedVia'>) => Promise<Greeting>;
  markShared: (id: string, via: string) => Promise<void>;
  getForContact: (contactId: string) => Greeting[];
  getRecent: (limit?: number) => Greeting[];
}

export const useGreetingsStore = create<GreetingsState>((set, get) => ({
  greetings: [],
  loaded: false,

  loadGreetings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ greetings: JSON.parse(raw), loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch (e) {
      console.error('Failed to load greetings:', e);
      set({ loaded: true });
    }
  },

  addGreeting: async (data) => {
    const greeting: Greeting = {
      ...data,
      id: randomUUID(),
      sharedVia: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [greeting, ...get().greetings];
    set({ greetings: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return greeting;
  },

  markShared: async (id, via) => {
    const updated = get().greetings.map((g) =>
      g.id === id ? { ...g, sharedVia: [...g.sharedVia, via] } : g
    );
    set({ greetings: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getForContact: (contactId) => {
    return get().greetings.filter((g) => g.contactId === contactId);
  },

  getRecent: (limit = 20) => {
    return get().greetings.slice(0, limit);
  },
}));
