import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { AppCard, Avatar, Badge } from '@/components/Atoms';
import { colors, spacing, typography } from '@/theme/tokens';

const upcoming = [
  { id: 'b1', name: 'Dr. Amelia Hart', spec: 'General Practitioner', when: 'Today · 11:30 AM', status: 'On the way', tone: 'success' as const, link: '/tracking' },
  { id: 'b2', name: 'Dr. Marcus Chen', spec: 'Pediatrician', when: 'Tomorrow · 09:00 AM', status: 'Confirmed', tone: 'primary' as const, link: '/' },
];

export default function Bookings() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ ...typography['2xl'], fontWeight: '700', color: colors.foreground }}>Bookings</Text>

        <View>
          <Text style={styles.sectionLabel}>UPCOMING</Text>
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            {upcoming.map((b) => (
              <Pressable key={b.id} onPress={() => router.push(b.link as any)}>
                <AppCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Avatar name={b.name} size={52} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...typography.base, fontWeight: '700' }}>{b.name}</Text>
                    <Text style={{ ...typography.xs, color: colors.mutedForeground }}>{b.spec}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Calendar size={13} color={colors.foreground} />
                      <Text style={{ ...typography.xs, color: colors.foreground }}>{b.when}</Text>
                    </View>
                  </View>
                  <Badge tone={b.tone}>{b.status}</Badge>
                </AppCard>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 1 },
});
