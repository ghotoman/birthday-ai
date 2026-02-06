import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks';
import { borderRadius, spacing, shadows } from '@/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
}

export function Card({ children, style, onPress, padded = true }: CardProps) {
  const colors = useColors();

  const cardStyle: ViewStyle[] = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.borderLight,
    },
    shadows.md,
    padded && styles.padded,
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
});
