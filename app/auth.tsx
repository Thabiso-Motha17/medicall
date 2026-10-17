import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, User as UserIcon } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import { signIn, signUp } from '@/lib/auth';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@medicall.app');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandWrap}>
          <View style={styles.brand}><Text style={styles.brandTxt}>M</Text></View>
          <Text style={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.sub}>
            {mode === 'signin' ? 'Sign in to book a home visit' : 'Quality care, delivered to your door'}
          </Text>
        </View>

        <View style={styles.tabs}>
          {(['signin', 'signup'] as const).map((m) => (
            <Pressable key={m} onPress={() => { setMode(m); setError(null); }} style={[styles.tab, mode === m && styles.tabActive]}>
              <Text style={[styles.tabTxt, mode === m && { color: colors.foreground }]}>
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.base }}>
          {mode === 'signup' && (
            <AppInput
              label="Full name"
              placeholder="Sarah Johnson"
              value={name}
              onChangeText={setName}
              leftIcon={<UserIcon size={20} color={colors.mutedForeground} />}
            />
          )}
          <AppInput
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail size={20} color={colors.mutedForeground} />}
          />
          <AppInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock size={20} color={colors.mutedForeground} />}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          )}

          {mode === 'signin' && (
            <Pressable
              style={{ alignSelf: 'flex-end' }}
              onPress={() => Alert.alert('Forgot password', 'Reset flow not implemented in this demo.')}
            >
              <Text style={{ color: colors.primary, fontWeight: '700', ...typography.sm }}>Forgot password?</Text>
            </Pressable>
          )}

          <AppButton onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.primaryForeground} /> : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </AppButton>

          {mode === 'signin' && (
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Demo credentials</Text>
              <Text style={styles.demoLine}>demo@medicall.app  ·  demo1234</Text>
              <Text style={styles.demoLine}>doctor@medicall.app  ·  doctor1234</Text>
            </View>
          )}
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerTxt}>or continue with</Text>
          <View style={styles.line} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}><AppButton variant="outline" size="md">Apple</AppButton></View>
          <View style={{ flex: 1 }}><AppButton variant="outline" size="md">Google</AppButton></View>
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg },
  brandWrap: { alignItems: 'center', marginTop: spacing.base },
  brand: { width: 56, height: 56, borderRadius: radii.xl, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.base },
  brandTxt: { color: colors.primaryForeground, fontSize: 22, fontWeight: '700' },
  title: { ...typography['2xl'], fontWeight: '700', color: colors.foreground, textAlign: 'center' },
  sub: { ...typography.sm, color: colors.mutedForeground, marginTop: 4, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, padding: 4, borderRadius: radii['2xl'] },
  tab: { flex: 1, height: 44, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.surface, ...({ shadowOpacity: 0.06 } as any) },
  tabTxt: { color: colors.mutedForeground, fontWeight: '700', ...typography.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerTxt: { color: colors.mutedForeground, ...typography.xs },
  terms: { textAlign: 'center', color: colors.mutedForeground, ...typography.xs, paddingHorizontal: spacing.base },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: radii.lg, padding: spacing.md },
  errorTxt: { color: '#991B1B', ...typography.sm, fontWeight: '600' },
  demoBox: { backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.md, gap: 4 },
  demoTitle: { ...typography.xs, fontWeight: '700', color: colors.foreground, marginBottom: 2 },
  demoLine: { ...typography.xs, color: colors.mutedForeground, fontFamily: 'monospace' as any },
});
