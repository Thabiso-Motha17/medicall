import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Stethoscope, MapPin, ShieldCheck } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { colors, radii, spacing, typography } from '@/theme/tokens';

const slides = [
  {
    icon: Stethoscope,
    title: 'Doctors at your door',
    body: 'Licensed physicians visit your home in under 30 minutes — no waiting rooms, no stress.',
  },
  {
    icon: MapPin,
    title: 'Track in real time',
    body: 'See exactly when your doctor is arriving with live location and ETA updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Vetted & insured',
    body: 'Every doctor is board-certified, background checked, and fully insured.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <Pressable onPress={() => router.replace('/auth')} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Icon size={80} color={colors.primary} strokeWidth={1.6} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <AppButton
          onPress={() => (isLast ? router.replace('/auth') : setStep((s) => s + 1))}
        >
          {isLast ? 'Get started' : 'Continue'}
        </AppButton>
        <Text style={styles.footerHint}>
          Already have an account?{' '}
          <Link href="/auth" style={{ color: colors.primary, fontWeight: '700' }}>
            Sign in
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.lg },
  skip: { ...typography.sm, color: colors.mutedForeground, fontWeight: '600', padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconWrap: {
    width: 176, height: 176, borderRadius: 40, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing['2xl'],
  },
  title: { ...typography['3xl'], fontWeight: '700', color: colors.foreground, textAlign: 'center', maxWidth: 300 },
  body: { ...typography.base, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.base, maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: spacing.xl },
  dot: { height: 8, width: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotActive: { width: 32, backgroundColor: colors.primary },
  footer: { padding: spacing.lg, gap: spacing.md },
  footerHint: { textAlign: 'center', color: colors.mutedForeground, ...typography.sm },
});
