import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import CoinIcon from '../components/CoinIcon';
import Keypad from '../components/Keypad';
import PressableScale from '../components/PressableScale';
import { coinById } from '../data/coins';
import { useAmountInput } from '../hooks/useAmountInput';
import { RootStackParamList } from '../navigation/types';
import { FEE_RATE, MIN_ORDER_INR, tradeFee } from '../services/custody';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatINR, formatQty } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Trade'>;

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function TradeScreen({ navigation, route }: Props) {
  const { coinId, side } = route.params;
  const coin = coinById(coinId);
  const quote = useStore((s) => s.market[coinId]);
  const inrBalance = useStore((s) => s.inrBalance);
  const holding = useStore((s) => s.holdings[coinId]);
  const buy = useStore((s) => s.buy);
  const sell = useStore((s) => s.sell);

  const { raw, value, onKey, setRaw } = useAmountInput(2);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (!quote) return null;

  const isBuy = side === 'buy';
  const accent = isBuy ? colors.accent : colors.down;
  const holdingValueInr = (holding?.qty ?? 0) * quote.priceInr;
  const maxInr = isBuy ? inrBalance : holdingValueInr;
  const fee = tradeFee(value);
  const estQty = value > 0 ? (isBuy ? (value - fee) / quote.priceInr : value / quote.priceInr) : 0;

  const showError = (msg: string) => {
    setError(msg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const confirm = () => {
    if (value < MIN_ORDER_INR) return showError(`Minimum order is ${formatINR(MIN_ORDER_INR)}`);
    if (value > maxInr + 0.01)
      return showError(
        isBuy ? 'Not enough balance — add money first' : `You only hold ${formatINR(holdingValueInr)} of ${coin.symbol}`,
      );

    setPlacing(true);
    setError('');
    // Small delay so the order feels deliberate, like a real broker.
    setTimeout(() => {
      const result = isBuy
        ? buy(coinId, value)
        : sell(coinId, Math.min(value / quote.priceInr, holding?.qty ?? 0));
      setPlacing(false);
      if (!result.ok) return showError(result.error ?? 'Something went wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.replace('Success', {
        title: isBuy ? `Bought ${coin.symbol}!` : `Sold ${coin.symbol}!`,
        subtitle: isBuy
          ? `${formatQty(estQty, coin.symbol)} added to your portfolio`
          : `${formatINR(value - fee, { decimals: 0 })} credited to your cash balance`,
        txId: result.txId,
      });
    }, 700);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.headerCenter}>
          <CoinIcon coin={coin} size={24} />
          <Text style={styles.headerTitle}>
            {isBuy ? 'Buy' : 'Sell'} {coin.name}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={styles.livePrice}>
          1 {coin.symbol} = {formatINR(quote.priceInr)}
        </Text>

        <View style={styles.amountBlock}>
          <Animated.View style={[styles.amountRow, shakeStyle]}>
            <Text style={[styles.rupee, { color: raw ? colors.text : colors.textFaint }]}>₹</Text>
            <Text style={[styles.amount, { color: raw ? colors.text : colors.textFaint }]}>
              {raw || '0'}
            </Text>
          </Animated.View>
          <Text style={styles.estQty}>
            {value > 0
              ? `≈ ${formatQty(estQty, coin.symbol)}${isBuy ? '' : ' to sell'}`
              : isBuy
                ? `Balance: ${formatINR(inrBalance, { decimals: 0 })}`
                : `You hold: ${formatINR(holdingValueInr, { decimals: 0 })}`}
          </Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.chips}>
          {QUICK_AMOUNTS.map((a) => (
            <PressableScale key={a} onPress={() => setRaw(String(a))} style={styles.chip}>
              <Text style={styles.chipText}>₹{a >= 1000 ? `${a / 1000}k` : a}</Text>
            </PressableScale>
          ))}
          <PressableScale
            onPress={() => setRaw(maxInr > 0 ? String(Math.floor(maxInr * 100) / 100) : '')}
            style={[styles.chip, { borderColor: accent }]}
          >
            <Text style={[styles.chipText, { color: accent }]}>Max</Text>
          </PressableScale>
        </View>

        {value >= MIN_ORDER_INR && (
          <Text style={styles.feeNote}>
            Includes {formatINR(fee)} fee ({(FEE_RATE * 100).toFixed(1)}%) · No gas fees, ever
          </Text>
        )}

        <View style={{ flex: 1 }} />
        <Keypad onKey={(k) => { setError(''); onKey(k); }} />

        <View style={styles.footer}>
          <Button
            title={
              value > 0
                ? `${isBuy ? 'Buy' : 'Sell'} for ${formatINR(value, { decimals: 0 })}`
                : `Enter amount to ${side}`
            }
            variant={isBuy ? 'primary' : 'danger'}
            disabled={value <= 0}
            loading={placing}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...type.h3, color: colors.text },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePrice: { ...type.sub, color: colors.textDim, textAlign: 'center', marginTop: 6 },
  amountBlock: { alignItems: 'center', marginTop: 28 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rupee: { fontSize: 30, fontWeight: '800', marginTop: 8 },
  amount: { fontSize: 56, fontWeight: '800', letterSpacing: -1.5 },
  estQty: { ...type.body, color: colors.textDim, marginTop: 8 },
  error: { ...type.sub, color: colors.down, marginTop: 8, fontWeight: '700' },
  chips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    paddingHorizontal: spacing.screen,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  feeNote: { ...type.tiny, color: colors.textFaint, textAlign: 'center', marginTop: 12 },
  footer: { paddingHorizontal: spacing.screen, paddingTop: 8 },
});
