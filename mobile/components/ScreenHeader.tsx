import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, typography } from '@/theme/tokens';

export function ScreenHeader({
  title,
  subtitle,
  back = true,
  right,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
      ) : (
        <View style={{ width: 8 }} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    marginLeft: -8,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.base, fontWeight: '700', color: colors.foreground },
  subtitle: { ...typography.xs, color: colors.mutedForeground },
});
