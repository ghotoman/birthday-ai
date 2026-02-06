import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks';
import { borderRadius, spacing } from '@/constants/Theme';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  emoji?: string;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', emoji, style }: BadgeProps) {
  const colors = useColors();

  const bgMap: Record<BadgeVariant, string> = {
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    accent: colors.accentLight,
    success: '#D1FAE5',
    warning: '#FEF3C7',
    error: '#FEE2E2',
    neutral: colors.backgroundTertiary,
  };

  const textMap: Record<BadgeVariant, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: '#B45309',
    success: '#065F46',
    warning: '#92400E',
    error: '#991B1B',
    neutral: colors.textSecondary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant] }, style]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.text, { color: textMap[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
