import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

interface AppInputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function AppInput({ label, hint, error, leftIcon, rightIcon, ...props }: AppInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: spacing.sm }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          focused && { borderColor: colors.primary, backgroundColor: colors.surface },
          !!error && { borderColor: colors.destructive },
        ]}
      >
        {leftIcon}
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
          {...props}
        />
        {rightIcon}
      </View>
      {(error || hint) && (
        <Text style={[styles.hint, error ? { color: colors.destructive } : null]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.sm, fontWeight: '700', color: colors.foreground },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.base,
    borderRadius: radii['2xl'],
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  input: { flex: 1, ...typography.base, color: colors.foreground },
  hint: { ...typography.xs, color: colors.mutedForeground },
});
