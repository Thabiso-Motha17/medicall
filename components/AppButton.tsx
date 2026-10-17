import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, typography } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'lg' | 'md' | 'sm';

interface AppButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const VARIANT_BG: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.primarySoft,
  outline: 'transparent',
  ghost: 'transparent',
  destructive: colors.destructive,
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: colors.primaryForeground,
  secondary: colors.primary,
  outline: colors.foreground,
  ghost: colors.foreground,
  destructive: colors.primaryForeground,
};

const SIZE: Record<Size, { height: number; padX: number; font: number; radius: number }> = {
  lg: { height: 56, padX: 24, font: 17, radius: radii['2xl'] },
  md: { height: 48, padX: 20, font: 15, radius: radii.xl },
  sm: { height: 40, padX: 16, font: 14, radius: radii.lg },
};

export function AppButton({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  style,
}: AppButtonProps) {
  const s = SIZE[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: VARIANT_BG[variant],
          height: s.height,
          paddingHorizontal: s.padX,
          borderRadius: s.radius,
          opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.borderStrong,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={VARIANT_TEXT[variant]} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <Text
            style={[
              typography.base,
              { color: VARIANT_TEXT[variant], fontSize: s.font, fontWeight: '700' },
            ]}
          >
            {children}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
