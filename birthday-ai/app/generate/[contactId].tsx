import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContactsStore } from '@/stores/contactsStore';

import { useGreetingsStore } from '@/stores/greetingsStore';
import { useColors } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { ShareBar } from '@/components/ui/ShareBar';
import { QuestionCard, QuestionOption } from '@/components/generator/QuestionCard';
import { spacing, borderRadius, typography } from '@/constants/Theme';
import { ToneType, TONE_LABELS, TONE_EMOJIS } from '@/types/contact';
import {
  GreetingFormat,
  QuestionnaireAnswers,
  FORMAT_LABELS,
  FORMAT_DESCRIPTIONS,
} from '@/types/greeting';
import { generateGreeting, AIModelId, DEFAULT_MODEL, AI_MODELS } from '@/services/ai';
import { generateCard, saveCardToGallery, shareCard } from '@/services/cards';
import { getUpcomingAge } from '@/utils/dates';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Image } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODEL_STORAGE = '@birthdayai_model';

const TONE_OPTIONS: QuestionOption<ToneType>[] = [
  { value: 'warm', label: TONE_LABELS.warm, emoji: TONE_EMOJIS.warm, description: 'Душевное и искреннее' },
  { value: 'funny', label: TONE_LABELS.funny, emoji: TONE_EMOJIS.funny, description: 'Смешное и весёлое' },
  { value: 'sarcastic', label: TONE_LABELS.sarcastic, emoji: TONE_EMOJIS.sarcastic, description: 'С иронией и подколами' },
  { value: 'formal', label: TONE_LABELS.formal, emoji: TONE_EMOJIS.formal, description: 'Вежливо и уважительно' },
  { value: 'roast', label: TONE_LABELS.roast, emoji: TONE_EMOJIS.roast, description: 'Дерзко и остроумно' },
];

const FORMAT_OPTIONS: QuestionOption<GreetingFormat>[] = [
  { value: 'short', label: FORMAT_LABELS.short, emoji: '⚡', description: FORMAT_DESCRIPTIONS.short },
  { value: 'long', label: FORMAT_LABELS.long, emoji: '📝', description: FORMAT_DESCRIPTIONS.long },
  { value: 'poem', label: FORMAT_LABELS.poem, emoji: '🎭', description: FORMAT_DESCRIPTIONS.poem },
];

const BOOL_OPTIONS: QuestionOption<string>[] = [
  { value: 'yes', label: 'Да, жги 🔥', description: 'Возраст — отличная тема для шуток' },
  { value: 'no', label: 'Лучше нет', description: 'Обойдёмся без возрастных шуток' },
];

type Step = 'tone' | 'format' | 'ageJokes' | 'customNote' | 'generating' | 'result';

const STEP_ORDER: Step[] = ['tone', 'format', 'ageJokes', 'customNote'];

export default function GenerateScreen() {
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const colors = useColors();
  const router = useRouter();
  const contact = useContactsStore((s) => s.getContact(contactId!));
  const addGreeting = useGreetingsStore((s) => s.addGreeting);

  const [step, setStep] = useState<Step>('tone');
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({
    tone: contact?.toneDefault ?? 'warm',
    format: 'short',
    ageJokesOk: false,
    mentionAge: true,
    customNote: '',
    includeCard: false,
  });
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardUri, setCardUri] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  if (!contact) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Контакт не найден</Text>
      </View>
    );
  }

  const currentStepIdx = STEP_ORDER.indexOf(step as any);
  const progress =
    step === 'generating' || step === 'result'
      ? 1
      : (currentStepIdx + 1) / (STEP_ORDER.length + 1);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const idx = STEP_ORDER.indexOf(step as any);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
    } else {
      generate();
    }
  };

  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step as any);
    if (idx > 0) {
      setStep(STEP_ORDER[idx - 1]);
    } else {
      router.back();
    }
  };

  const generate = async () => {
    setStep('generating');
    setLoading(true);
    setError('');

    try {
      const savedModel = await AsyncStorage.getItem(MODEL_STORAGE);
      const model = (savedModel as AIModelId) || DEFAULT_MODEL;

      const fullAnswers: QuestionnaireAnswers = {
        tone: answers.tone ?? 'warm',
        format: answers.format ?? 'short',
        ageJokesOk: answers.ageJokesOk ?? false,
        mentionAge: answers.mentionAge ?? true,
        customNote: answers.customNote ?? '',
        includeCard: false,
      };

      const text = await generateGreeting({
        contact,
        answers: fullAnswers,
        model,
      });

      setGeneratedText(text);
      setStep('result');

      const modelInfo = AI_MODELS[model];

      // Сохраняем в историю
      await addGreeting({
        contactId: contact.id,
        contactName: contact.name,
        greetingText: text,
        tone: fullAnswers.tone,
        format: fullAnswers.format,
        aiProvider: model,
        questionnaire: fullAnswers,
        year: new Date().getFullYear(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.message || 'Что-то пошло не так');
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleShared = (target: string) => {
    // можно трекать через какой канал отправлено
  };

  const regenerate = () => {
    setGeneratedText('');
    setError('');
    setCardUri(null);
    setCardError('');
    generate();
  };

  const handleGenerateCard = async () => {
    setCardLoading(true);
    setCardError('');
    try {
      const fullAnswers: QuestionnaireAnswers = {
        tone: answers.tone ?? 'warm',
        format: answers.format ?? 'short',
        ageJokesOk: answers.ageJokesOk ?? false,
        mentionAge: answers.mentionAge ?? true,
        customNote: answers.customNote ?? '',
        includeCard: true,
      };
      const result = await generateCard(contact, fullAnswers);
      setCardUri(result.localUri || null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setCardError(err.message || 'Не удалось создать открытку');
    } finally {
      setCardLoading(false);
    }
  };

  const handleSaveCard = async () => {
    if (!cardUri) return;
    const saved = await saveCardToGallery(cardUri);
    if (saved) {
      Alert.alert('Готово', 'Открытка сохранена в галерею');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Ошибка', 'Нет разрешения на сохранение в галерею');
    }
  };

  const handleShareCard = async () => {
    if (!cardUri) return;
    try {
      await shareCard(cardUri);
    } catch {
      Alert.alert('Ошибка', 'Не удалось поделиться открыткой');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: contact.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Progress bar */}
        <View style={[styles.progressBg, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>

        {/* Контент */}
        <View style={styles.body}>
          {step === 'tone' && (
            <QuestionCard
              question="Какой тон поздравления?"
              subtitle={`Для ${contact.name}`}
              options={TONE_OPTIONS}
              selected={answers.tone ?? null}
              onSelect={(v) => {
                setAnswers({ ...answers, tone: v });
                setTimeout(goNext, 300);
              }}
            />
          )}

          {step === 'format' && (
            <QuestionCard
              question="Какой формат?"
              options={FORMAT_OPTIONS}
              selected={answers.format ?? null}
              onSelect={(v) => {
                setAnswers({ ...answers, format: v });
                setTimeout(goNext, 300);
              }}
            />
          )}

          {step === 'ageJokes' && (
            <QuestionCard
              question="Возраст — тема для шуток?"
              subtitle={`Исполняется ${getUpcomingAge(contact.birthday)}`}
              options={BOOL_OPTIONS}
              selected={answers.ageJokesOk ? 'yes' : 'no'}
              onSelect={(v) => {
                setAnswers({ ...answers, ageJokesOk: v === 'yes' });
                setTimeout(goNext, 300);
              }}
            />
          )}

          {step === 'customNote' && (
            <View style={styles.customNoteContainer}>
              <Text style={[styles.questionTitle, { color: colors.text }]}>
                Что-нибудь ещё?
              </Text>
              <Text style={[styles.questionSubtitle, { color: colors.textSecondary }]}>
                Упомяни что-то конкретное или оставь пустым
              </Text>
              <Input
                placeholder="Например: недавно вернулся из Японии..."
                value={answers.customNote ?? ''}
                onChangeText={(v) => setAnswers({ ...answers, customNote: v })}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
                containerStyle={{ marginTop: spacing.xl }}
              />
              <Button
                title="Сгенерировать! ✨"
                onPress={goNext}
                variant="primary"
                size="lg"
                fullWidth
                style={{ marginTop: spacing['2xl'] }}
              />
            </View>
          )}

          {step === 'generating' && (
            <View style={styles.generatingContainer}>
              <Text style={styles.generatingEmoji}>🎂</Text>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
              <Text style={[styles.generatingText, { color: colors.text }]}>
                Генерируем поздравление...
              </Text>
              <Text style={[styles.generatingHint, { color: colors.textSecondary }]}>
                Нейросеть подбирает слова
              </Text>
            </View>
          )}

          {step === 'result' && (
            <ScrollView
              style={styles.resultScroll}
              contentContainerStyle={styles.resultContent}
            >
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorEmoji}>😵</Text>
                  <Text style={[styles.errorTitle, { color: colors.error }]}>
                    Ошибка
                  </Text>
                  <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                    {error}
                  </Text>
                  <Button
                    title="Попробовать ещё"
                    onPress={regenerate}
                    variant="primary"
                    style={{ marginTop: spacing.xl }}
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.resultEmoji}>🎉</Text>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    Поздравление для {contact.name}
                  </Text>
                  <View
                    style={[
                      styles.resultCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Text style={[styles.resultText, { color: colors.text }]}>
                      {generatedText}
                    </Text>
                  </View>

                  {/* Шаринг */}
                  <ShareBar text={generatedText} onShared={handleShared} />

                  {/* Открытка */}
                  <View style={[styles.cardSection, { borderColor: colors.borderLight }]}>
                    {!cardUri && !cardLoading && (
                      <Button
                        title={cardError ? 'Попробовать снова 🎨' : 'Сгенерировать открытку 🎨'}
                        onPress={handleGenerateCard}
                        variant="secondary"
                        size="lg"
                        fullWidth
                        icon={<Ionicons name="image" size={20} color="#FFF" />}
                      />
                    )}
                    {cardError && !cardLoading && (
                      <Text style={[styles.cardError, { color: colors.error }]}>
                        {cardError}
                      </Text>
                    )}
                    {cardLoading && (
                      <View style={styles.cardLoadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.cardLoadingText, { color: colors.textSecondary }]}>
                          Рисуем открытку...
                        </Text>
                      </View>
                    )}
                    {cardUri && (
                      <View style={styles.cardResult}>
                        <Image
                          source={{ uri: cardUri }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={[styles.cardActionBtn, { backgroundColor: colors.primary }]}
                            onPress={handleSaveCard}
                          >
                            <Ionicons name="download-outline" size={20} color="#FFF" />
                            <Text style={styles.cardActionText}>Сохранить</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.cardActionBtn, { backgroundColor: colors.secondary }]}
                            onPress={handleShareCard}
                          >
                            <Ionicons name="share-outline" size={20} color="#FFF" />
                            <Text style={styles.cardActionText}>Поделиться</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.resultActions}>
                    <Button
                      title="Перегенерировать"
                      onPress={regenerate}
                      variant="outline"
                      size="md"
                      fullWidth
                      icon={
                        <Ionicons
                          name="refresh"
                          size={18}
                          color={colors.primary}
                        />
                      }
                    />
                    <Button
                      title="Другой тон"
                      onPress={() => setStep('tone')}
                      variant="ghost"
                      size="md"
                      fullWidth
                    />
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </View>

        {/* Навигация (кроме generating и result) */}
        {step !== 'generating' &&
          step !== 'result' &&
          step !== 'customNote' && (
            <View style={styles.navRow}>
              <TouchableOpacity onPress={goBack} style={styles.navBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.stepIndicator, { color: colors.textTertiary }]}>
                {currentStepIdx + 1} / {STEP_ORDER.length}
              </Text>
              <TouchableOpacity onPress={goNext} style={styles.navBtn}>
                <Ionicons name="arrow-forward" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
      </View>
    </>
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
  progressBg: {
    height: 4,
    width: '100%',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  body: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Custom note step
  customNoteContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  questionTitle: {
    ...typography.title2,
    textAlign: 'center',
  },
  questionSubtitle: {
    ...typography.subhead,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // Generating
  generatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingEmoji: {
    fontSize: 80,
  },
  generatingText: {
    ...typography.title3,
    marginTop: spacing.xl,
  },
  generatingHint: {
    ...typography.subhead,
    marginTop: spacing.sm,
  },
  // Result
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing['5xl'],
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  resultLabel: {
    ...typography.subhead,
    marginBottom: spacing.lg,
  },
  resultCard: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  resultText: {
    ...typography.body,
    lineHeight: 26,
  },
  resultActions: {
    width: '100%',
    gap: spacing.md,
  },
  // Card generation
  cardSection: {
    width: '100%',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardError: {
    ...typography.footnote,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  cardLoadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  cardLoadingText: {
    ...typography.subhead,
    marginTop: spacing.md,
  },
  cardResult: {
    width: '100%',
    alignItems: 'center',
  },
  cardImage: {
    width: SCREEN_WIDTH - spacing.lg * 2 - spacing.xl * 2,
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  cardActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Error
  errorContainer: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  errorEmoji: {
    fontSize: 56,
  },
  errorTitle: {
    ...typography.title3,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
