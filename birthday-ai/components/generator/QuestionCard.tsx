import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks';
import { spacing, borderRadius, typography, shadows } from '@/constants/Theme';

export interface QuestionOption<T extends string = string> {
  value: T;
  label: string;
  emoji?: string;
  description?: string;
}

interface QuestionCardProps<T extends string = string> {
  question: string;
  subtitle?: string;
  options: QuestionOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  multiSelect?: boolean;
  selectedMulti?: T[];
  onSelectMulti?: (values: T[]) => void;
}

export function QuestionCard<T extends string = string>({
  question,
  subtitle,
  options,
  selected,
  onSelect,
}: QuestionCardProps<T>) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      <View style={styles.options}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.7}
              onPress={() => onSelect(opt.value)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? colors.primaryLight
                    : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
                shadows.sm,
              ]}
            >
              {opt.emoji && <Text style={styles.emoji}>{opt.emoji}</Text>}
              <View style={styles.optionTextWrap}>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? colors.primary : colors.text,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    {opt.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  question: {
    ...typography.title2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subhead,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  optionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});
