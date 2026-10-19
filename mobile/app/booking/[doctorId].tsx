import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { Avatar } from '@/components/Atoms';
import { DOCTORS } from '@/lib/mockData';
import { colors, radii, spacing, typography } from '@/theme/tokens';

const TIMES = ['ASAP', '11:30', '12:15', '13:00', '14:30', '15:45', '16:30', '18:00'];
const DAYS = ['Today', 'Tomorrow', 'Wed 24', 'Thu 25', 'Fri 26'];

export default function Booking() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const router = useRouter();
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState('ASAP');
  const [reason, setReason] = useState('');
  if (!doctor) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title="Book visit" subtitle={`with ${doctor.name}`} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={styles.summary}>
          <Avatar name={doctor.name} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.base, fontWeight: '700' }}>{doctor.name}</Text>
            <Text style={{ ...typography.xs, color: colors.mutedForeground }}>{doctor.specialty}</Text>
          </View>
          <Text style={{ ...typography.base, fontWeight: '700', color: colors.primary }}>${doctor.priceUsd}</Text>
        </View>

        <Section icon={<Calendar size={18} color={colors.primary} />} title="Select date">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DAYS.map((d, i) => (
              <Pressable key={d} onPress={() => setDay(i)} style={[styles.optBig, day === i && styles.optActive]}>
                <Text style={[styles.optTxt, day === i && { color: colors.primaryForeground }]}>{d}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Section>

        <Section icon={<Clock size={18} color={colors.primary} />} title="Select time">
          <View style={styles.timeGrid}>
            {TIMES.map((t) => (
              <Pressable key={t} onPress={() => setTime(t)} style={[styles.optTime, time === t && styles.optActive]}>
                <Text style={[styles.optTxt, time === t && { color: colors.primaryForeground }]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section icon={<MapPin size={18} color={colors.primary} />} title="Visit address">
          <View style={styles.addr}>
            <Text style={{ ...typography.sm, fontWeight: '700' }}>123 Maple Street, Apt 4B</Text>
            <Text style={{ ...typography.xs, color: colors.mutedForeground, marginTop: 2 }}>Brooklyn, NY 11201</Text>
            <Pressable><Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8, fontSize: 14 }}>Change</Text></Pressable>
          </View>
        </Section>

        <Section icon={<FileText size={18} color={colors.primary} />} title="Reason for visit">
          <AppInput placeholder="e.g. Persistent fever, blood pressure check" value={reason} onChangeText={setReason} />
        </Section>

        <View style={styles.totals}>
          <Row label="Visit fee" value={`$${doctor.priceUsd}.00`} />
          <Row label="Service fee" value="$5.00" />
          <Row label="Tax" value="$7.50" />
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
          <Row label="Total" value={`$${doctor.priceUsd + 12.5}0`} bold />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton onPress={() => router.push('/payment')}>Continue to payment</AppButton>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <Text style={{ ...typography.sm, fontWeight: '700' }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: bold ? colors.foreground : colors.mutedForeground, fontWeight: bold ? '700' : '500', fontSize: bold ? 16 : 14 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: bold ? 18 : 14 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.base, backgroundColor: colors.surfaceMuted, borderRadius: radii['2xl'] },
  optBig: { height: 56, paddingHorizontal: 20, borderRadius: radii['2xl'], borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  optTime: { width: '31%', height: 56, borderRadius: radii['2xl'], borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  optActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optTxt: { fontWeight: '700', color: colors.foreground, fontSize: 14 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addr: { padding: spacing.base, backgroundColor: colors.surfaceMuted, borderRadius: radii['2xl'] },
  totals: { padding: spacing.base, borderRadius: radii['2xl'], borderWidth: 1, borderColor: colors.border, gap: 8 },
  footer: { padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
