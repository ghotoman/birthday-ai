import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks';
import { spacing, borderRadius, typography } from '@/constants/Theme';
import { SHARE_TARGETS, ShareTarget, shareText } from '@/services/share';

interface ShareBarProps {
  text: string;
  onShared?: (target: ShareTarget) => void;
  compact?: boolean;
}

export function ShareBar({ text, onShared, compact = false }: ShareBarProps) {
  const colors = useColors();

  const handleShare = async (target: ShareTarget) => {
    const success = await shareText(text, target);
    if (success && onShared) {
      onShared(target);
    }
  };

  if (compact) {
    // Компактный вариант — иконки в ряд
    return (
      <View style={styles.compactRow}>
        {SHARE_TARGETS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.compactBtn, { backgroundColor: t.color + '15' }]}
            activeOpacity={0.7}
            onPress={() => handleShare(t.id)}
          >
            <Ionicons name={t.icon as any} size={18} color={t.color} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Полный вариант — иконки + подписи
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Отправить через
      </Text>
      <View style={styles.grid}>
        {SHARE_TARGETS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.gridItem}
            activeOpacity={0.7}
            onPress={() => handleShare(t.id)}
          >
            <View style={[styles.iconCircle, { backgroundColor: t.color + '15' }]}>
              <Ionicons name={t.icon as any} size={24} color={t.color} />
            </View>
            <Text
              style={[styles.itemLabel, { color: colors.text }]}
              numberOfLines={1}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.footnote,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    alignItems: 'center',
    width: '16%',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Compact variant
  compactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
