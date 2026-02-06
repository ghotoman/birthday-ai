import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/constants/Theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  icon,
  style,
  ...props
}: InputProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: colors.backgroundSecondary,
          },
          focused && styles.focused,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            icon ? { paddingLeft: 0 } : undefined,
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.hint, { color: colors.error }]}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.textTertiary }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  focused: {
    borderWidth: 2,
  },
  icon: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
  },
  hint: {
    fontSize: 13,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
