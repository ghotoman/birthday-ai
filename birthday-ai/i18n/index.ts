import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ru from './ru';
import en from './en';

export type Language = 'ru' | 'en';
export type Translations = typeof ru;

const translations: Record<Language, Translations> = { ru, en } as any;

const LANG_KEY = '@birthdayai_language';
const LANG_CHOSEN_KEY = '@birthdayai_language_chosen';

interface I18nState {
  language: Language;
  languageChosen: boolean; // первый раз выбрал язык?
  loaded: boolean;
  t: Translations;

  loadLanguage: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  markLanguageChosen: () => Promise<void>;
}

export const useI18n = create<I18nState>((set, get) => ({
  language: 'ru',
  languageChosen: false,
  loaded: false,
  t: ru,

  loadLanguage: async () => {
    try {
      const [lang, chosen] = await Promise.all([
        AsyncStorage.getItem(LANG_KEY),
        AsyncStorage.getItem(LANG_CHOSEN_KEY),
      ]);

      const language = (lang as Language) || 'ru';
      set({
        language,
        languageChosen: chosen === 'true',
        loaded: true,
        t: translations[language],
      });
    } catch {
      set({ loaded: true });
    }
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem(LANG_KEY, lang);
    set({ language: lang, t: translations[lang] });
  },

  markLanguageChosen: async () => {
    await AsyncStorage.setItem(LANG_CHOSEN_KEY, 'true');
    set({ languageChosen: true });
  },
}));

// Shortcut хук
export function useT() {
  return useI18n((s) => s.t);
}
