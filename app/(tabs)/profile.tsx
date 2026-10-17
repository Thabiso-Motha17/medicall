import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight, CreditCard, Bell, HelpCircle, Shield, FileText, Heart, LogOut, Settings,
} from 'lucide-react-native';
import { Avatar } from '@/components/Atoms';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import { getSession, signOut, type User } from '@/lib/auth';

const groups = [
  { title: 'Health', items: [
    { icon: Heart, label: 'Medical history' },
    { icon: FileText, label: 'Visit records' },
  ]},
  { title: 'Account', items: [
    { icon: CreditCard, label: 'Payment methods' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy & security' },
  ]},
  { title: 'Support', items: [
    { icon: HelpCircle, label: 'Help center' },
    { icon: Settings, label: 'Settings' },
  ]},
];

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { getSession().then(setUser); }, []);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => { await signOut(); router.replace('/auth'); },
      },
    ]);
  };

  const displayName = user?.name ?? 'Guest';
  const displayEmail = user?.email ?? 'not signed in';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ ...typography['2xl'], fontWeight: '700', color: colors.foreground }}>Profile</Text>

        <View style={styles.idCard}>
          <Avatar name={displayName} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.lg, fontWeight: '700' }}>{displayName}</Text>
            <Text style={{ ...typography.sm, color: colors.mutedForeground }}>{displayEmail}</Text>
          </View>
          <Pressable style={styles.editBtn}><Text style={styles.editTxt}>Edit</Text></Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[['12', 'Visits'], ['3', 'Doctors'], ['A+', 'Member']].map(([v, l]) => (
            <View key={l} style={styles.stat}>
              <Text style={{ ...typography.xl, fontWeight: '700' }}>{v}</Text>
              <Text style={{ ...typography.xs, color: colors.mutedForeground }}>{l}</Text>
            </View>
          ))}
        </View>

        {groups.map((g) => (
          <View key={g.title}>
            <Text style={styles.groupLabel}>{g.title.toUpperCase()}</Text>
            <View style={styles.groupCard}>
              {g.items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <Pressable key={it.label} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <View style={styles.rowIcon}><Icon size={20} color={colors.foreground} /></View>
                    <Text style={{ flex: 1, ...typography.sm, fontWeight: '700' }}>{it.label}</Text>
                    <ChevronRight size={20} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable style={styles.signout} onPress={handleSignOut}>
          <LogOut size={20} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontWeight: '700', marginLeft: 8, ...typography.base }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  idCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, padding: spacing.lg, borderRadius: radii['3xl'], backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  editBtn: { height: 40, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  editTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  stat: { flex: 1, padding: spacing.base, borderRadius: radii['2xl'], borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  groupLabel: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 1, marginBottom: 8 },
  groupCard: { backgroundColor: colors.surface, borderRadius: radii['2xl'], borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, paddingHorizontal: spacing.base, paddingVertical: spacing.base },
  rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  signout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: radii['2xl'], borderWidth: 1, borderColor: colors.border },
});
