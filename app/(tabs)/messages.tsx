import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Atoms';
import { colors, spacing, typography } from '@/theme/tokens';

const threads = [
  { name: 'Dr. Amelia Hart', last: "I'm 5 minutes away.", time: '11:24', unread: 1 },
  { name: 'Dr. Marcus Chen', last: 'Sounds good — see you tomorrow.', time: 'Yesterday', unread: 0 },
  { name: 'MediCall Support', last: 'Your receipt has been emailed.', time: 'Apr 18', unread: 0 },
];

export default function Messages() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Text style={styles.h1}>Messages</Text>
      <FlatList
        data={threads}
        keyExtractor={(t) => t.name}
        contentContainerStyle={{ paddingHorizontal: spacing.sm }}
        renderItem={({ item: t }) => (
          <Pressable style={styles.row}>
            <Avatar name={t.name} size={52} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...typography.sm, fontWeight: '700' }}>{t.name}</Text>
                <Text style={{ ...typography.xs, color: colors.mutedForeground }}>{t.time}</Text>
              </View>
              <Text style={{ ...typography.sm, color: colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>{t.last}</Text>
            </View>
            {t.unread > 0 && (
              <View style={styles.unread}><Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 12 }}>{t.unread}</Text></View>
            )}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { ...typography['2xl'], fontWeight: '700', color: colors.foreground, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 16 },
  unread: { minWidth: 24, height: 24, paddingHorizontal: 6, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
