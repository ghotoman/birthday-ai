import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useI18n, Language } from '@/i18n';
import { useColors } from '@/hooks';
import { spacing, borderRadius, typography } from '@/constants/Theme';

const LANGUAGES: { id: Language; flag: string; name: string; native: string }[] = [
  { id: 'ru', flag: '🇷🇺', name: 'Русский', native: 'Russian' },
  { id: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
];

export default function LanguageScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setLanguage, markLanguageChosen } = useI18n();
  const [selected, setSelected] = useState<Language>('ru');

  const handleContinue = async () => {
    await setLanguage(selected);
    await markLanguageChosen();
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.top}>
          <Text style={styles.emoji}>🌍</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Выбери язык
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your language
          </Text>
        </View>

        <View style={styles.options}>
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.langOption,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setSelected(lang.id)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.langInfo}>
                  <Text
                    style={[
                      styles.langName,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {lang.name !== lang.native && (
                    <Text style={[styles.langNative, { color: colors.textSecondary }]}>
                      {lang.native}
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>
              {selected === 'ru' ? 'Продолжить' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing['3xl'],
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  options: {
    gap: spacing.md,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
  },
  flag: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  langInfo: {
    flex: 1,
  },
  langName: {
    ...typography.headline,
    fontSize: 18,
  },
  langNative: {
    ...typography.footnote,
    marginTop: 2,
  },
  bottom: {
    flex: 1,
    justifyContent: 'center',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  continueText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
