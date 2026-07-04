import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Keypad from '../components/Keypad';
import PressableScale from '../components/PressableScale';
import { useAmountInput } from '../hooks/useAmountInput';
import { RootStackParamList } from '../navigation/types';
import { MAX_DEPOSIT_INR, MIN_DEPOSIT_INR } from '../services/custody';
import { colors, radius, spacing, type } from '../theme';
import { formatINR } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFunds'>;

export const UPI_APPS = [
  { key: 'gpay', name: 'Google Pay', letter: 'G', color: '#4285F4' },
  { key: 'phonepe', name: 'PhonePe', letter: 'Pe', color: '#5F259F' },
  { key: 'paytm', name: 'Paytm', letter: 'P', color: '#00BAF2' },
  { key: 'bhim', name: 'BHIM', letter: 'B', color: '#F26722' },
] as const;

const QUICK = [500, 1000, 5000, 10000];

export default function AddFundsScreen({ navigation }: Props) {
  const { raw, value, onKey, setRaw } = useAmountInput(0, 7);
  const [error, setError] = useState('');
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const validate = (): boolean => {
    if (value < MIN_DEPOSIT_INR) {
      setError(`Minimum is ${formatINR(MIN_DEPOSIT_INR)}`);
    } else if (value > MAX_DEPOSIT_INR) {
      setError(`Maximum is ${formatINR(MAX_DEPOSIT_INR)} per transaction`);
    } else {
      return true;
    }
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    return false;
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Add money</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.amountBlock}>
          <Animated.View style={[styles.amountRow, shakeStyle]}>
            <Text style={[styles.rupee, { color: raw ? colors.text : colors.textFaint }]}>₹</Text>
            <Text style={[styles.amount, { color: raw ? colors.text : colors.textFaint }]}>
              {raw || '0'}
            </Text>
          </Animated.View>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.chips}>
          {QUICK.map((a) => (
            <PressableScale key={a} onPress={() => { setError(''); setRaw(String(a)); }} style={styles.chip}>
              <Text style={styles.chipText}>+ ₹{a >= 1000 ? `${a / 1000},000`.replace('.', ',') : a}</Text>
            </PressableScale>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pay using UPI</Text>
        <View style={styles.upiRow}>
          {UPI_APPS.map((app) => (
            <PressableScale
              key={app.key}
              style={styles.upiApp}
              onPress={() => {
                if (validate()) navigation.navigate('UpiPayment', { amount: value, app: app.key });
              }}
            >
              <View style={[styles.upiIcon, { backgroundColor: app.color }]}>
                <Text style={styles.upiLetter}>{app.letter}</Text>
              </View>
              <Text style={styles.upiName}>{app.name}</Text>
            </PressableScale>
          ))}
        </View>

        <PressableScale
          style={styles.bankCard}
          onPress={() => {
            if (validate()) navigation.navigate('BankTransfer', { amount: value });
          }}
        >
          <View style={styles.bankIcon}>
            <Ionicons name="business" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankTitle}>Bank transfer</Text>
            <Text style={styles.bankSub}>IMPS / NEFT · for larger amounts</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </PressableScale>

        <View style={styles.secureRow}>
          <Ionicons name="shield-checkmark" size={13} color={colors.textDim} />
          <Text style={styles.secureText}>
            Instant credit · Secured by bank-grade encryption
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <Keypad onKey={(k) => { setError(''); onKey(k); }} />
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
  amountBlock: { alignItems: 'center', marginTop: 20 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rupee: { fontSize: 28, fontWeight: '800', marginTop: 7 },
  amount: { fontSize: 52, fontWeight: '800', letterSpacing: -1.5 },
  error: { ...type.sub, color: colors.down, marginTop: 6, fontWeight: '700' },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  sectionTitle: { ...type.h3, color: colors.text, paddingHorizontal: spacing.screen, marginTop: 28, marginBottom: 12 },
  upiRow: { flexDirection: 'row', paddingHorizontal: spacing.screen, gap: 10 },
  upiApp: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  upiIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  upiLetter: { color: '#fff', fontSize: 16, fontWeight: '900' },
  upiName: { color: colors.textDim, fontSize: 11, fontWeight: '700' },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.screen,
    marginTop: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  bankIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  bankSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  secureText: { ...type.tiny, color: colors.textDim },
});
