import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import PressableScale from '../components/PressableScale';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatINR } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'BankTransfer'>;

const DETAILS: [string, string][] = [
  ['Account name', 'Sikka Payments Pvt Ltd'],
  ['Account number', '9182 0046 7731 2054'],
  ['IFSC', 'SIKA0000091'],
  ['Type', 'Current · IMPS / NEFT / RTGS'],
];

export default function BankTransferScreen({ navigation, route }: Props) {
  const { amount } = route.params;
  const deposit = useStore((s) => s.deposit);
  const [confirming, setConfirming] = useState(false);

  const confirm = () => {
    setConfirming(true);
    setTimeout(() => {
      deposit(amount, 'bank', 'Bank transfer · IMPS');
      navigation.replace('Success', {
        title: 'Money added!',
        subtitle: `${formatINR(amount, { decimals: 0 })} credited via bank transfer`,
      });
    }, 2200);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Bank transfer</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.screen }}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.amountCard}>
          <Text style={styles.amountLabel}>Transfer exactly</Text>
          <Text style={styles.amount}>{formatINR(amount, { decimals: 0 })}</Text>
          <Text style={styles.amountSub}>from your registered bank account (HDFC ····4821)</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.detailsCard}>
          {DETAILS.map(([label, value], i) => (
            <View key={label} style={[styles.detailRow, i > 0 && styles.detailBorder]}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.noteRow}>
          <Ionicons name="information-circle" size={15} color={colors.textDim} />
          <Text style={styles.noteText}>
            IMPS credits within minutes. Money is auto-converted and secured the moment it lands —
            nothing else to do.
          </Text>
        </Animated.View>

        <View style={{ flex: 1 }} />
        <View style={styles.footer}>
          <Button
            title="I've made the transfer"
            loading={confirming}
            onPress={confirm}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTitle: { ...type.h3, color: colors.text },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCard: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: 20,
    marginTop: 16,
  },
  amountLabel: { ...type.tiny, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  amount: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 6, letterSpacing: -1 },
  amountSub: { ...type.sub, color: colors.textDim, marginTop: 6, textAlign: 'center' },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  detailRow: { paddingVertical: 13 },
  detailBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  detailLabel: { ...type.tiny, color: colors.textDim },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 3, letterSpacing: 0.3 },
  noteRow: { flexDirection: 'row', gap: 8, marginTop: 16, paddingHorizontal: 4 },
  noteText: { ...type.tiny, color: colors.textDim, flex: 1, lineHeight: 16 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 8 },
});
