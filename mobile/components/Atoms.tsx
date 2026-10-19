import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, typography } from '@/theme/tokens';

export function Avatar({ name, src, size = 48 }: { name: string; src?: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} />
      ) : (
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: size * 0.4 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}

type Tone = 'neutral' | 'primary' | 'success' | 'warning';
const TONE_BG: Record<Tone, string> = {
  neutral: colors.muted,
  primary: colors.primarySoft,
  success: '#DAF1E6',
  warning: '#FBEDD0',
};
const TONE_FG: Record<Tone, string> = {
  neutral: colors.mutedForeground,
  primary: colors.primary,
  success: colors.success,
  warning: '#7A5A12',
};

export function Badge({
  children,
  tone = 'neutral',
  style,
}: {
  children: React.ReactNode;
  tone?: Tone;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: TONE_BG[tone] }, style]}>
      <Text style={{ color: TONE_FG[tone], fontWeight: '700', fontSize: 12 }}>{children}</Text>
    </View>
  );
}

export function AppCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
