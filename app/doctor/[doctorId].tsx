import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Award, Languages, ShieldCheck, MapPin, MessageCircle } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Avatar, Badge } from '@/components/Atoms';
import { AppButton } from '@/components/AppButton';
import { DOCTORS } from '@/lib/mockData';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function DoctorProfile() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const router = useRouter();
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  if (!doctor) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Doctor not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title="Doctor profile" />
      <ScrollView>
        <View style={styles.hero}>
          <Avatar name={doctor.name} size={96} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.base }}>
            <Text style={{ ...typography['2xl'], fontWeight: '700' }}>{doctor.name}</Text>
            {doctor.verified && <ShieldCheck size={20} color={colors.primary} />}
          </View>
          <Text style={{ ...typography.sm, color: colors.mutedForeground }}>{doctor.specialty}</Text>

          <View style={styles.stats}>
            <Stat icon={<Star size={20} color={colors.warning} fill={colors.warning} />} value={doctor.rating.toFixed(1)} label={`${doctor.reviews} reviews`} />
            <Stat icon={<Award size={20} color={colors.primary} />} value={`${doctor.experienceYears}+`} label="Years exp." />
            <Stat icon={<MapPin size={20} color={colors.primary} />} value={`${doctor.distanceKm} km`} label="Away" />
          </View>
        </View>

        <Section title="About">
          <Text style={{ ...typography.sm, color: colors.mutedForeground, lineHeight: 22 }}>{doctor.bio}</Text>
        </Section>

        <Section title="Languages" icon={<Languages size={18} color={colors.primary} />}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {doctor.languages.map((l) => <Badge key={l} tone="primary">{l}</Badge>)}
          </View>
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.msgBtn}><MessageCircle size={20} color={colors.foreground} /></Pressable>
        <View style={{ flex: 1 }}>
          <AppButton onPress={() => router.push(`/booking/${doctor.id}`)}>Book · ${doctor.priceUsd}</AppButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={{ ...typography.base, fontWeight: '700', marginTop: 4 }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <Text style={{ ...typography.base, fontWeight: '700' }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  stats: { flexDirection: 'row', gap: 8, width: '100%', marginTop: spacing.lg },
  stat: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceMuted, padding: spacing.md, borderRadius: radii['2xl'] },
  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, marginTop: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  msgBtn: { width: 56, height: 56, borderRadius: radii['2xl'], backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
});
