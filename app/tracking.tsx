import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { G, Path, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { Phone, MessageCircle, Shield, ChevronUp } from 'lucide-react-native';
import { Avatar } from '../components/Atoms';
import { colors, radii, spacing, typography } from '@/theme/tokens';

const STATUSES = [
  { key: 'confirmed', label: 'Booking confirmed', time: '11:02' },
  { key: 'preparing', label: 'Doctor preparing', time: '11:05' },
  { key: 'enroute', label: 'On the way', time: '11:12' },
  { key: 'arrived', label: 'Arrived at your door', time: '—' },
];

export default function Tracking() {
  const router = useRouter();
  const [step, setStep] = useState(2);
  const [eta, setEta] = useState(8);

  useEffect(() => {
    const t = setInterval(() => setEta((v) => Math.max(1, v - 1)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#16242E' }}>
      <SafeAreaView edges={['top']} style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1 }}>
          <MapMock />

          <View style={styles.topBar}>
            <Pressable onPress={() => router.replace('/(tabs)/home')} style={styles.iconBtn} accessibilityLabel="Close">
              <Text style={{ fontSize: 18 }}>✕</Text>
            </Pressable>
            <View style={styles.shieldPill}>
              <Shield size={16} color={colors.success} />
              <Text style={{ ...typography.xs, fontWeight: '700' }}>Trip protected</Text>
            </View>
          </View>

          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={{ ...typography.xs, color: colors.mutedForeground }}>Arriving in</Text>
                <Text style={{ fontSize: 34, fontWeight: '700', color: colors.foreground }}>
                  {eta} <Text style={{ fontSize: 18, color: colors.mutedForeground }}>min</Text>
                </Text>
              </View>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Details</Text>
                <ChevronUp size={16} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.docRow}>
              <Avatar name="Amelia Hart" size={56} />
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.sm, fontWeight: '700' }}>Dr. Amelia Hart</Text>
                <Text style={{ ...typography.xs, color: colors.mutedForeground }}>General Practitioner · ★ 4.9</Text>
              </View>
              <Pressable style={styles.actionBtn}><MessageCircle size={20} color={colors.foreground} /></Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                <Phone size={20} color={colors.primaryForeground} />
              </Pressable>
            </View>

            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {STATUSES.map((s, i) => {
                const done = i <= step;
                return (
                  <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.bullet, done && { backgroundColor: colors.primary }]} />
                    <Text style={{ flex: 1, ...typography.sm, color: done ? colors.foreground : colors.mutedForeground, fontWeight: done ? '700' : '500' }}>{s.label}</Text>
                    <Text style={{ ...typography.xs, color: colors.mutedForeground }}>{s.time}</Text>
                  </View>
                );
              })}
            </View>

            <Pressable onPress={() => setStep((i) => Math.min(STATUSES.length - 1, i + 1))} style={{ marginTop: 12 }}>
              <Text style={{ ...typography.xs, color: colors.mutedForeground }}>(demo: advance status)</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function MapMock() {
  const { width, height } = Dimensions.get('window');
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#D4E4E5' }]}>
      <Svg width={width} height={height} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <G stroke="#EFF5F5" strokeWidth={22} fill="none" strokeLinecap="round">
          <Path d="M-20 200 L420 240" />
          <Path d="M-20 480 L420 460" />
          <Path d="M80 -20 L60 820" />
          <Path d="M280 -20 L300 820" />
        </G>
        <G fill="#E1ECEC">
          <Rect x={100} y={260} width={160} height={80} rx={6} />
          <Rect x={100} y={500} width={160} height={100} rx={6} />
        </G>
        <Path d="M340 600 Q260 540 240 460 T200 320 Q170 280 120 260" stroke={colors.primary} strokeWidth={6} fill="none" strokeLinecap="round" />
        <G x={120} y={260}>
          <Circle r={14} fill={colors.primary} />
          <Circle r={6} fill="white" />
        </G>
        <G x={240} y={460}>
          <Circle r={22} fill="white" stroke={colors.primary} strokeWidth={4} />
          <SvgText x={0} y={6} textAnchor="middle" fontSize={22}>🚗</SvgText>
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  shieldPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 44, borderRadius: 22, backgroundColor: colors.surface },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.lg, paddingTop: 12, paddingBottom: spacing.xl },
  handle: { alignSelf: 'center', width: 48, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginBottom: spacing.base },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 12, backgroundColor: colors.surfaceMuted, borderRadius: radii['2xl'], marginTop: spacing.base },
  actionBtn: { width: 48, height: 48, borderRadius: radii['2xl'], backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  bullet: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.borderStrong },
});
