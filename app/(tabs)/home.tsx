import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Bell, Star, Clock, MapPin } from 'lucide-react-native';
import { AppCard, Avatar, Badge } from '@/components/Atoms';
import { AppInput } from '@/components/AppInput';
import { DOCTORS, SPECIALTIES } from '@/lib/mockData';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function Home() {
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.greet}>
          <View>
            <Text style={{ ...typography.xs, color: colors.mutedForeground }}>Good morning,</Text>
            <Text style={{ ...typography.xl, fontWeight: '700', color: colors.foreground }}>Sarah Johnson</Text>
          </View>
          <Pressable style={styles.bell} accessibilityLabel="Notifications">
            <Bell size={20} color={colors.foreground} />
            <View style={styles.dot} />
          </Pressable>
        </View>

        <Pressable style={styles.locationRow}>
          <MapPin size={16} color={colors.primary} />
          <Text style={{ ...typography.xs, fontWeight: '700', color: colors.foreground }}>123 Maple Street</Text>
          <Text style={{ ...typography.xs, color: colors.mutedForeground }}>· Change</Text>
        </Pressable>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.base }}>
          <AppInput placeholder="Search doctor or symptom" leftIcon={<Search size={20} color={colors.mutedForeground} />} />
        </View>

        <View style={styles.urgent}>
          <View style={styles.urgentIcon}><Text style={{ fontSize: 24 }}>🚑</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 16 }}>Need urgent care?</Text>
            <Text style={{ color: colors.primaryForeground, opacity: 0.9, fontSize: 13 }}>Doctor at your door in 30 min</Text>
          </View>
          <Text style={{ color: colors.primaryForeground, fontSize: 22 }}>→</Text>
        </View>

        <SectionHeader title="Specialties" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {SPECIALTIES.map((s) => {
            const active = filter === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setFilter(s.id)}
                style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                <Text style={[styles.chipTxt, active && { color: colors.primaryForeground }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionHeader title="Available now" />
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg }}>
          {DOCTORS.map((d) => (
            <Pressable key={d.id} onPress={() => router.push(`/doctor/${d.id}`)}>
              <AppCard style={{ flexDirection: 'row', gap: spacing.base }}>
                <Avatar name={d.name} size={64} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...typography.base, fontWeight: '700', color: colors.foreground }} numberOfLines={1}>{d.name}</Text>
                      <Text style={{ ...typography.xs, color: colors.mutedForeground }} numberOfLines={1}>{d.specialty}</Text>
                    </View>
                    <Text style={{ ...typography.base, fontWeight: '700', color: colors.primary }}>${d.priceUsd}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <Star size={14} color={colors.warning} fill={colors.warning} />
                    <Text style={{ ...typography.xs, color: colors.foreground, fontWeight: '700' }}>{d.rating}</Text>
                    <Text style={{ ...typography.xs, color: colors.mutedForeground }}>({d.reviews}) · {d.distanceKm} km</Text>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <Badge tone="success">In {d.availableIn}</Badge>
                  </View>
                </View>
              </AppCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.md }}>
      <Text style={{ ...typography.lg, fontWeight: '700', color: colors.foreground }}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.base },
  bell: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.destructive },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, marginHorizontal: spacing.lg, marginTop: spacing.base, padding: spacing.lg, borderRadius: radii['2xl'], backgroundColor: colors.primary },
  urgentIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  chipsRow: { paddingHorizontal: spacing.lg, gap: 10, paddingBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: spacing.base, borderRadius: radii.pill, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  chipTxt: { fontWeight: '700', color: colors.foreground, fontSize: 14 },
});
