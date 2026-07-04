import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedNumber from '../components/AnimatedNumber';
import Button from '../components/Button';
import CoinIcon from '../components/CoinIcon';
import LineChart from '../components/LineChart';
import PressableScale from '../components/PressableScale';
import Segmented from '../components/Segmented';
import { coinById } from '../data/coins';
import { getHistory } from '../services/market';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { ChartRange } from '../types';
import { formatINR, formatPct, formatQty } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'CoinDetail'>;

const RANGES: readonly ChartRange[] = ['1D', '1W', '1M', '1Y', 'All'];

export default function CoinDetailScreen({ navigation, route }: Props) {
  const { coinId } = route.params;
  const coin = coinById(coinId);
  const quote = useStore((s) => s.market[coinId]);
  const holding = useStore((s) => s.holdings[coinId]);
  const watchlist = useStore((s) => s.watchlist);
  const toggleWatch = useStore((s) => s.toggleWatch);
  const [range, setRange] = useState<ChartRange>('1D');
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);

  const history = useMemo(
    () => (quote ? getHistory(coinId, range, quote.priceInr) : []),
    [coinId, range, quote?.priceInr],
  );

  if (!quote) return null;

  const watched = watchlist.includes(coinId);
  const scrubbing = scrubIdx !== null && history[scrubIdx] !== undefined;
  const shownPrice = scrubbing ? history[scrubIdx!] : quote.priceInr;
  const rangeStart = history[0] ?? quote.priceInr;
  const changePct = scrubbing
    ? ((shownPrice - rangeStart) / rangeStart) * 100
    : range === '1D'
      ? quote.change24h
      : ((quote.priceInr - rangeStart) / rangeStart) * 100;
  const up = changePct >= 0;
  const chartColor = up ? colors.up : colors.down;

  const stats: [string, string][] = [
    ['24h high', formatINR(quote.high24h)],
    ['24h low', formatINR(quote.low24h)],
    ['Market cap', formatINR(quote.marketCapInr, { compact: true })],
    ['24h volume', formatINR(quote.volume24hInr, { compact: true })],
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.headerCenter}>
          <CoinIcon coin={coin} size={26} />
          <Text style={styles.headerTitle}>{coin.name}</Text>
        </View>
        <PressableScale onPress={() => toggleWatch(coinId)} style={styles.iconBtn}>
          <Ionicons
            name={watched ? 'star' : 'star-outline'}
            size={20}
            color={watched ? colors.warning : colors.text}
          />
        </PressableScale>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View style={styles.priceBlock}>
          <AnimatedNumber
            value={shownPrice}
            format={(v) => formatINR(v, { decimals: shownPrice < 1 ? 4 : 2 })}
            style={styles.price}
            duration={scrubbing ? 80 : 500}
          />
          <View style={styles.changeRow}>
            <Ionicons name={up ? 'caret-up' : 'caret-down'} size={13} color={chartColor} />
            <Text style={[styles.change, { color: chartColor }]}>
              {formatPct(changePct)} {scrubbing ? '' : range === '1D' ? 'today' : `in ${range}`}
            </Text>
          </View>
        </View>

        <Animated.View entering={FadeIn.duration(400)}>
          <LineChart data={history} color={chartColor} onScrub={setScrubIdx} />
        </Animated.View>

        <View style={styles.rangeRow}>
          <Segmented options={RANGES} value={range} onChange={setRange} activeColor={chartColor} />
        </View>

        {holding && holding.qty > 0 && (
          <Animated.View entering={FadeInDown.duration(350)} style={styles.holdingCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.holdingLabel}>You own</Text>
              <Text style={styles.holdingValue}>
                {formatINR(holding.qty * quote.priceInr, { decimals: 0 })}
              </Text>
              <Text style={styles.holdingQty}>{formatQty(holding.qty, coin.symbol)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.holdingLabel}>Returns</Text>
              {(() => {
                const pnl = holding.qty * quote.priceInr - holding.investedInr;
                const pct = holding.investedInr > 0 ? (pnl / holding.investedInr) * 100 : 0;
                const c = pnl >= 0 ? colors.up : colors.down;
                return (
                  <>
                    <Text style={[styles.holdingValue, { color: c }]}>
                      {pnl >= 0 ? '+' : '-'}
                      {formatINR(Math.abs(pnl), { decimals: 0 })}
                    </Text>
                    <Text style={[styles.holdingQty, { color: c }]}>{formatPct(pct)}</Text>
                  </>
                );
              })()}
            </View>
          </Animated.View>
        )}

        <Text style={styles.sectionTitle}>Market stats</Text>
        <View style={styles.statsGrid}>
          {stats.map(([label, value]) => (
            <View key={label} style={styles.statCell}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About {coin.name}</Text>
        <Text style={styles.about}>
          {coin.name} ({coin.symbol}) is ranked #{coin.rank} on Sikka. Buy from ₹100 with a flat
          0.5% fee — no gas fees, no wallets. Your holdings are secured in an insured custodial
          account and every trade settles on-chain in the background.
        </Text>
      </ScrollView>

      <View style={styles.tradeBar}>
        {holding && holding.qty > 0 && (
          <Button
            title="Sell"
            variant="danger"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('Trade', { coinId, side: 'sell' })}
          />
        )}
        <Button
          title={`Buy ${coin.symbol}`}
          style={{ flex: 2 }}
          onPress={() => navigation.navigate('Trade', { coinId, side: 'buy' })}
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
  priceBlock: { paddingHorizontal: spacing.screen, marginTop: 8 },
  price: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  change: { fontSize: 14, fontWeight: '700' },
  rangeRow: { alignItems: 'center', marginTop: 6 },
  holdingCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  holdingLabel: { ...type.tiny, color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.8 },
  holdingValue: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 },
  holdingQty: { ...type.sub, color: colors.textDim, marginTop: 2 },
  sectionTitle: { ...type.h3, color: colors.text, paddingHorizontal: spacing.screen, marginTop: 24, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.screen - 5 },
  statCell: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  statLabel: { ...type.tiny, color: colors.textDim },
  statValue: {
    ...type.h3,
    color: colors.text,
    marginTop: 4,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  about: { ...type.sub, color: colors.textDim, paddingHorizontal: spacing.screen, lineHeight: 20 },
  tradeBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
