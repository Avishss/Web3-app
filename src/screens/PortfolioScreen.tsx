import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedNumber from '../components/AnimatedNumber';
import Button from '../components/Button';
import CoinIcon from '../components/CoinIcon';
import PressableScale from '../components/PressableScale';
import { coinById } from '../data/coins';
import { RootStackParamList } from '../navigation/types';
import { portfolioInvested, portfolioValue, useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatINR, formatPct, formatQty } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PortfolioScreen() {
  const navigation = useNavigation<Nav>();
  const holdings = useStore((s) => s.holdings);
  const market = useStore((s) => s.market);
  const inrBalance = useStore((s) => s.inrBalance);

  const value = portfolioValue(holdings, market);
  const invested = portfolioInvested(holdings);
  const pnl = value - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

  const list = Object.values(holdings).sort(
    (a, b) =>
      b.qty * (market[b.coinId]?.priceInr ?? 0) - a.qty * (market[a.coinId]?.priceInr ?? 0),
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Portfolio</Text>

        <Animated.View entering={FadeInDown.duration(450)} style={styles.summary}>
          <View style={styles.summaryHalf}>
            <Text style={styles.label}>Current value</Text>
            <AnimatedNumber
              value={value}
              format={(v) => formatINR(v, { decimals: 0 })}
              style={styles.bigValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryHalf}>
            <Text style={styles.label}>Total returns</Text>
            <Text style={[styles.bigValue, { color: pnl >= 0 ? colors.up : colors.down }]}>
              {pnl >= 0 ? '+' : '-'}
              {formatINR(Math.abs(pnl), { decimals: 0 })}
            </Text>
            {invested > 0 && (
              <Text style={[styles.pct, { color: pnl >= 0 ? colors.up : colors.down }]}>
                {formatPct(pnlPct)}
              </Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.cashCard}>
          <View style={styles.cashIcon}>
            <Ionicons name="wallet-outline" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cashLabel}>Available to invest</Text>
            <Text style={styles.cashValue}>{formatINR(inrBalance, { decimals: 2 })}</Text>
          </View>
          <PressableScale onPress={() => navigation.navigate('AddFunds')} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </PressableScale>
        </Animated.View>

        {list.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(140).duration(450)} style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf-outline" size={30} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>Start your crypto journey</Text>
            <Text style={styles.emptyDesc}>
              Add money with UPI and buy Bitcoin from just ₹100. No wallets or technical setup —
              we handle everything.
            </Text>
            <Button
              title={inrBalance > 0 ? 'Explore markets' : 'Add money to start'}
              style={{ alignSelf: 'stretch', marginTop: 18 }}
              onPress={() =>
                inrBalance > 0
                  ? (navigation as any).navigate('Markets')
                  : navigation.navigate('AddFunds')
              }
            />
          </Animated.View>
        ) : (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Holdings ({list.length})</Text>
            {list.map((h, i) => {
              const coin = coinById(h.coinId);
              const q = market[h.coinId];
              if (!q) return null;
              const cur = h.qty * q.priceInr;
              const hPnl = cur - h.investedInr;
              const hPct = h.investedInr > 0 ? (hPnl / h.investedInr) * 100 : 0;
              return (
                <Animated.View key={h.coinId} entering={FadeInDown.delay(120 + i * 60).duration(400)}>
                  <PressableScale
                    onPress={() => navigation.navigate('CoinDetail', { coinId: h.coinId })}
                    style={styles.holdingCard}
                    scaleTo={0.98}
                  >
                    <View style={styles.holdingTop}>
                      <CoinIcon coin={coin} size={38} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.holdingName}>{coin.name}</Text>
                        <Text style={styles.holdingQty}>{formatQty(h.qty, coin.symbol)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.holdingValue}>{formatINR(cur, { decimals: 0 })}</Text>
                        <Text style={[styles.holdingPnl, { color: hPnl >= 0 ? colors.up : colors.down }]}>
                          {hPnl >= 0 ? '▲' : '▼'} {formatINR(Math.abs(hPnl), { decimals: 0 })} ({formatPct(hPct)})
                        </Text>
                      </View>
                    </View>
                    <View style={styles.holdingBottom}>
                      <Text style={styles.holdingMeta}>
                        Invested {formatINR(h.investedInr, { decimals: 0 })} · Avg{' '}
                        {formatINR(h.investedInr / h.qty)}
                      </Text>
                      <View style={styles.tradeBtns}>
                        <PressableScale
                          onPress={() => navigation.navigate('Trade', { coinId: h.coinId, side: 'buy' })}
                          style={[styles.miniBtn, { backgroundColor: colors.accentSoft }]}
                        >
                          <Text style={[styles.miniBtnText, { color: colors.accent }]}>Buy</Text>
                        </PressableScale>
                        <PressableScale
                          onPress={() => navigation.navigate('Trade', { coinId: h.coinId, side: 'sell' })}
                          style={[styles.miniBtn, { backgroundColor: colors.downSoft }]}
                        >
                          <Text style={[styles.miniBtnText, { color: colors.down }]}>Sell</Text>
                        </PressableScale>
                      </View>
                    </View>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { ...type.h1, color: colors.text, paddingHorizontal: spacing.screen, paddingTop: 8 },
  summary: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginTop: 18,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  summaryHalf: { flex: 1, gap: 6 },
  divider: { width: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  label: { ...type.tiny, color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.8 },
  bigValue: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  pct: { fontSize: 13, fontWeight: '700' },
  cashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.screen,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cashIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashLabel: { ...type.tiny, color: colors.textDim },
  cashValue: { ...type.h3, color: colors.text, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  addBtnText: { color: '#06110D', fontSize: 13, fontWeight: '800' },
  emptyBox: {
    marginHorizontal: spacing.screen,
    marginTop: 28,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...type.h2, color: colors.text, marginTop: 16 },
  emptyDesc: { ...type.sub, color: colors.textDim, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  sectionTitle: { ...type.h3, color: colors.text, paddingHorizontal: spacing.screen, marginBottom: 10 },
  holdingCard: {
    marginHorizontal: spacing.screen,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  holdingTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  holdingName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  holdingQty: { color: colors.textDim, fontSize: 12, fontWeight: '600', marginTop: 2 },
  holdingValue: { color: colors.text, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  holdingPnl: { fontSize: 11, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  holdingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  holdingMeta: { ...type.tiny, color: colors.textDim, flex: 1 },
  tradeBtns: { flexDirection: 'row', gap: 8 },
  miniBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full },
  miniBtnText: { fontSize: 12, fontWeight: '800' },
});
