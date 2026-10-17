import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CreditCard, Lock, Plus, Check } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppButton } from '@/components/AppButton';
import { colors, radii, spacing, typography } from '@/theme/tokens';

const METHODS = [
  { id: 'v1', brand: 'Visa', last4: '4242', exp: '08/27' },
  { id: 'm1', brand: 'Mastercard', last4: '5566', exp: '11/26' },
];

export default function Payment() {
  const [selected, setSelected] = useState('v1');
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title="Payment" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={styles.card}>
          <Text style={{ color: colors.primaryForeground, opacity: 0.8, fontSize: 13 }}>Total to pay</Text>
          <Text style={{ color: colors.primaryForeground, fontSize: 36, fontWeight: '700', marginTop: 4 }}>$101.50</Text>
          <View style={styles.cardRow}>
            <View>
              <Text style={{ color: colors.primaryForeground, opacity: 0.8, fontSize: 13 }}>Dr. Amelia Hart</Text>
              <Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>Today · 11:30 AM</Text>
            </View>
            <View style={styles.pill}><Text style={{ fontSize: 22 }}>💊</Text></View>
          </View>
        </View>

        <Text style={{ ...typography.base, fontWeight: '700' }}>Payment method</Text>
        <View style={{ gap: 8 }}>
          {METHODS.map((m) => {
            const active = selected === m.id;
            return (
              <Pressable key={m.id} onPress={() => setSelected(m.id)} style={[styles.method, active && styles.methodActive]}>
                <View style={styles.methodIcon}><CreditCard size={20} color={colors.foreground} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...typography.sm, fontWeight: '700' }}>{m.brand} •••• {m.last4}</Text>
                  <Text style={{ ...typography.xs, color: colors.mutedForeground }}>Expires {m.exp}</Text>
                </View>
                <View style={[styles.radio, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {active && <Check size={14} color={colors.primaryForeground} />}
                </View>
              </Pressable>
            );
          })}
          <Pressable style={styles.addBtn}>
            <Plus size={20} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontWeight: '700', marginLeft: 8 }}>Add new card</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <Lock size={14} color={colors.mutedForeground} />
          <Text style={{ ...typography.xs, color: colors.mutedForeground }}>Secure & encrypted payment</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton onPress={() => router.replace('/tracking')}>Pay $101.50</AppButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: radii['3xl'], padding: spacing.lg },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.base, marginTop: spacing.base, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  pill: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  method: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, padding: spacing.base, borderRadius: radii['2xl'], borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  methodActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  methodIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: radii['2xl'], borderWidth: 2, borderColor: colors.borderStrong, borderStyle: 'dashed' },
  footer: { padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
