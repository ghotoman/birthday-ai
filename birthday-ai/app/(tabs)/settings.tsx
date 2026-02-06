import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks';
import { spacing, borderRadius, typography, shadows } from '@/constants/Theme';
import { AI_MODELS, AIModelId, DEFAULT_MODEL } from '@/services/ai';

const MODEL_STORAGE = '@birthdayai_model';

function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  rightElement,
}: {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
      ]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: iconColor + '20' }]}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<AIModelId>(DEFAULT_MODEL);

  useEffect(() => {
    AsyncStorage.getItem(MODEL_STORAGE).then((v) => {
      if (v) setSelectedModel(v as AIModelId);
    });
  }, []);

  const selectModel = async (model: AIModelId) => {
    setSelectedModel(model);
    await AsyncStorage.setItem(MODEL_STORAGE, model);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Выбор модели */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        МОДЕЛЬ ДЛЯ ГЕНЕРАЦИИ
      </Text>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.borderLight },
          shadows.sm,
        ]}
      >
        {(Object.entries(AI_MODELS) as [AIModelId, typeof AI_MODELS[AIModelId]][]).map(
          ([id, model]) => {
            const isSelected = selectedModel === id;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.modelRow,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => selectModel(id)}
              >
                <Text style={styles.modelEmoji}>{model.emoji}</Text>
                <View style={styles.modelInfo}>
                  <Text
                    style={[
                      styles.modelName,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {model.label}
                  </Text>
                  <Text style={[styles.modelProvider, { color: colors.textTertiary }]}>
                    {model.provider}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          }
        )}
      </View>

      {/* Общие */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        ОБЩИЕ
      </Text>
      <View style={styles.rowGroup}>
        <SettingsRow
          icon="notifications"
          iconColor={colors.warning}
          title="Уведомления"
          subtitle="Настроить напоминания о ДР"
          onPress={() => {}}
        />
        <SettingsRow
          icon="cloud-download"
          iconColor={colors.secondary}
          title="Импорт контактов"
          subtitle="VK, OK, Контакты телефона"
          onPress={() => router.push('/import' as any)}
        />
        <SettingsRow
          icon="color-palette"
          iconColor="#F472B6"
          title="Тема оформления"
          subtitle="Авто (по системе)"
        />
      </View>

      {/* О приложении */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        О ПРИЛОЖЕНИИ
      </Text>
      <View style={styles.rowGroup}>
        <SettingsRow
          icon="information-circle"
          iconColor={colors.primary}
          title="BirthdayAI"
          subtitle="Версия 1.0.0"
        />
      </View>
    </ScrollView>
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
  sectionLabel: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
    marginLeft: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  modelEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 15,
  },
  modelProvider: {
    fontSize: 12,
    marginTop: 1,
  },
  rowGroup: {
    gap: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...typography.callout,
    fontWeight: '600',
  },
  rowSubtitle: {
    ...typography.caption1,
    marginTop: 2,
  },
});
