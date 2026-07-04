import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Keypad from '../components/Keypad';
import PressableScale from '../components/PressableScale';
import { useAmountInput } from '../hooks/useAmountInput';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatINR } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Withdraw'>;

export default function WithdrawScreen({ navigation }: Props) {
  const inrBalance = useStore((s) => s.inrBalance);
  const withdraw = useStore((s) => s.withdraw);
  const { raw, value, onKey, setRaw } = useAmountInput(2, 7);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const confirm = () => {
    if (value < 100) {
      setError('Minimum withdrawal is ₹100');
    } else if (value > inrBalance) {
      setError('Amount exceeds your cash balance');
    } else {
      setPlacing(true);
      setTimeout(() => {
        const res = withdraw(value);
        setPlacing(false);
        if (!res.ok) return setError(res.error ?? 'Something went wrong');
        navigation.replace('Success', {
          title: 'Withdrawal on its way!',
          subtitle: `${formatINR(value, { decimals: 0 })} will reach HDFC ····4821 within minutes`,
          txId: res.txId,
        });
      }, 700);
      return;
    }
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Withdraw to bank</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.amountBlock}>
        <Animated.View style={[styles.amountRow, shakeStyle]}>
          <Text style={[styles.rupee, { color: raw ? colors.text : colors.textFaint }]}>₹</Text>
          <Text style={[styles.amount, { color: raw ? colors.text : colors.textFaint }]}>
            {raw || '0'}
          </Text>
        </Animated.View>
        <Text style={styles.balance}>Available: {formatINR(inrBalance, { decimals: 2 })}</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.chips}>
        <PressableScale
          onPress={() => { setError(''); setRaw(inrBalance > 0 ? String(Math.floor(inrBalance * 100) / 100) : ''); }}
          style={styles.chip}
        >
          <Text style={styles.chipText}>Withdraw all</Text>
        </PressableScale>
      </View>

      <View style={styles.bankRow}>
        <View style={styles.bankIcon}>
          <Ionicons name="business" size={18} color={colors.accent} />
        </View>
        <View>
          <Text style={styles.bankName}>HDFC Bank ····4821</Text>
          <Text style={styles.bankSub}>IMPS · usually under 10 minutes · free</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <Keypad onKey={(k) => { setError(''); onKey(k); }} />
      <View style={styles.footer}>
        <Button
          title={value > 0 ? `Withdraw ${formatINR(value, { decimals: 0 })}` : 'Enter amount'}
          disabled={value <= 0}
          loading={placing}
          onPress={confirm}
        />
      </View>
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
  amountBlock: { alignItems: 'center', marginTop: 26 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rupee: { fontSize: 28, fontWeight: '800', marginTop: 7 },
  amount: { fontSize: 52, fontWeight: '800', letterSpacing: -1.5 },
  balance: { ...type.body, color: colors.textDim, marginTop: 8 },
  error: { ...type.sub, color: colors.down, marginTop: 8, fontWeight: '700' },
  chips: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.screen,
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  bankIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  bankSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 8 },
});
