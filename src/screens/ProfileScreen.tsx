import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';

const HOW_IT_WORKS = [
  {
    icon: 'card' as const,
    title: 'You add rupees',
    desc: 'Via UPI or bank transfer — like any broking or payments app.',
  },
  {
    icon: 'sync' as const,
    title: 'We convert & custody',
    desc: 'Your money becomes USDC held in an insured custodial account. No wallet setup, no seed phrases, no gas fees.',
  },
  {
    icon: 'trending-up' as const,
    title: 'You trade in ₹',
    desc: 'Buy and sell crypto at live prices. Every settlement happens on-chain in the background — you can see the proof in any transaction.',
  },
  {
    icon: 'business' as const,
    title: 'Withdraw anytime',
    desc: 'Sell to rupees and withdraw to your bank via IMPS in minutes.',
  },
];

export default function ProfileScreen() {
  const user = useStore((s) => s.user);
  const resetAccount = useStore((s) => s.resetAccount);
  const [biometric, setBiometric] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const confirmReset = () => {
    Alert.alert('Reset demo data?', 'This clears your balance, holdings and history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAccount },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.name || 'S')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name || 'Sikka user'}</Text>
            <Text style={styles.userPhone}>+91 {user.phone}</Text>
          </View>
          <View style={styles.kycPill}>
            <Ionicons name="shield-checkmark" size={12} color={colors.accent} />
            <Text style={styles.kycText}>KYC verified</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>How Sikka works</Text>
        <View style={styles.card}>
          {HOW_IT_WORKS.map((step, i) => (
            <View key={step.title} style={[styles.stepRow, i > 0 && styles.stepBorder]}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Payments</Text>
        <View style={styles.card}>
          <Row icon="business-outline" title="Linked bank" value="HDFC Bank ····4821" />
          <Row icon="flash-outline" title="UPI ID" value={`${(user.name || 'user').split(' ')[0].toLowerCase()}@oksikka`} border />
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="finger-print-outline" size={18} color={colors.textDim} />
            </View>
            <Text style={styles.rowTitle}>Unlock with biometrics</Text>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ true: colors.accentDark, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowIcon}>
              <Ionicons name="notifications-outline" size={18} color={colors.textDim} />
            </View>
            <Text style={styles.rowTitle}>Price alerts</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.accentDark, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.card}>
          <Row icon="help-buoy-outline" title="Help & support" value="" chevron />
          <Row icon="document-text-outline" title="Terms & tax report" value="" chevron border />
        </View>

        <PressableScale onPress={confirmReset} style={styles.resetBtn}>
          <Ionicons name="refresh" size={16} color={colors.down} />
          <Text style={styles.resetText}>Reset demo data</Text>
        </PressableScale>

        <Text style={styles.version}>Sikka v1.0 · Demo build · Simulated markets</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  title,
  value,
  chevron,
  border,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  chevron?: boolean;
  border?: boolean;
}) {
  return (
    <View style={[styles.row, border && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.textDim} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      {!!value && <Text style={styles.rowValue}>{value}</Text>}
      {chevron && <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { ...type.h1, color: colors.text, paddingHorizontal: spacing.screen, paddingTop: 8 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: spacing.screen,
    marginTop: 18,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#06110D', fontSize: 18, fontWeight: '900' },
  userName: { ...type.h3, color: colors.text },
  userPhone: { ...type.sub, color: colors.textDim, marginTop: 2 },
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  kycText: { fontSize: 10, fontWeight: '800', color: colors.accent },
  sectionTitle: {
    ...type.h3,
    color: colors.text,
    paddingHorizontal: spacing.screen,
    marginTop: 26,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  stepBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  stepDesc: { color: colors.textDim, fontSize: 12, lineHeight: 17, marginTop: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowIcon: { width: 26, alignItems: 'center' },
  rowTitle: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  rowValue: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.screen,
    marginTop: 26,
    backgroundColor: colors.downSoft,
    borderRadius: radius.lg,
    height: 50,
  },
  resetText: { color: colors.down, fontSize: 14, fontWeight: '800' },
  version: { ...type.tiny, color: colors.textFaint, textAlign: 'center', marginTop: 20 },
});
