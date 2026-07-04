import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedNumber from '../components/AnimatedNumber';
import CoinIcon from '../components/CoinIcon';
import CoinRow from '../components/CoinRow';
import PressableScale from '../components/PressableScale';
import { COINS, coinById } from '../data/coins';
import { RootStackParamList } from '../navigation/types';
import { portfolioInvested, portfolioValue, useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatINR, formatPct } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const inrBalance = useStore((s) => s.inrBalance);
  const holdings = useStore((s) => s.holdings);
  const market = useStore((s) => s.market);
  const watchlist = useStore((s) => s.watchlist);

  const value = portfolioValue(holdings, market);
  const invested = portfolioInvested(holdings);
  const pnl = value - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  const pnlColor = pnl >= 0 ? colors.up : colors.down;

  const movers = [...COINS]
    .sort((a, b) => Math.abs(market[b.id]?.change24h ?? 0) - Math.abs(market[a.id]?.change24h ?? 0))
    .slice(0, 6);

  const holdingList = Object.values(holdings).sort(
    (a, b) =>
      b.qty * (market[b.coinId]?.priceInr ?? 0) - a.qty * (market[a.coinId]?.priceInr ?? 0),
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste 🙏</Text>
            <Text style={styles.name}>{user.name.split(' ')[0] || 'Investor'}</Text>
          </View>
          <PressableScale onPress={() => navigation.navigate('AddFunds')} style={styles.headerBtn}>
            <Ionicons name="add" size={18} color={colors.accent} />
            <Text style={styles.headerBtnText}>Add money</Text>
          </PressableScale>
        </View>

        <Animated.View entering={FadeInDown.duration(450)}>
          <LinearGradient
            colors={['#0E3B2C', '#123326', colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.portfolioCard}
          >
            <Text style={styles.cardLabel}>Portfolio value</Text>
            <AnimatedNumber
              value={value}
              format={(v) => formatINR(v, { decimals: 2 })}
              style={styles.cardValue}
            />
            <View style={styles.cardRow}>
              <Text style={styles.cardSub}>Invested {formatINR(invested, { decimals: 0 })}</Text>
              {invested > 0 && (
                <View style={[styles.pnlPill, { backgroundColor: pnl >= 0 ? colors.accentSoft : colors.downSoft }]}>
                  <Ionicons
                    name={pnl >= 0 ? 'caret-up' : 'caret-down'}
                    size={11}
                    color={pnlColor}
                  />
                  <Text style={[styles.pnlText, { color: pnlColor }]}>
                    {formatINR(Math.abs(pnl), { decimals: 0 })} ({formatPct(pnlPct)})
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.cashRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Cash balance</Text>
                <Text style={styles.cashValue}>{formatINR(inrBalance, { decimals: 2 })}</Text>
              </View>
              <PressableScale
                onPress={() => navigation.navigate('Withdraw')}
                style={styles.withdrawBtn}
              >
                <Text style={styles.withdrawText}>Withdraw</Text>
              </PressableScale>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(450)}>
          <Text style={styles.sectionTitle}>Top movers</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moversRow}
          >
            {movers.map((coin) => {
              const q = market[coin.id];
              if (!q) return null;
              const up = q.change24h >= 0;
              return (
                <PressableScale
                  key={coin.id}
                  onPress={() => navigation.navigate('CoinDetail', { coinId: coin.id })}
                  style={styles.moverCard}
                >
                  <CoinIcon coin={coin} size={34} />
                  <Text style={styles.moverSymbol}>{coin.symbol}</Text>
                  <Text style={styles.moverPrice}>{formatINR(q.priceInr)}</Text>
                  <Text style={[styles.moverChange, { color: up ? colors.up : colors.down }]}>
                    {formatPct(q.change24h)}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </Animated.View>

        {holdingList.length > 0 && (
          <Animated.View entering={FadeInDown.delay(160).duration(450)}>
            <Text style={styles.sectionTitle}>Your investments</Text>
            {holdingList.map((h) => {
              const coin = coinById(h.coinId);
              const q = market[h.coinId];
              if (!q) return null;
              const cur = h.qty * q.priceInr;
              const hPnl = cur - h.investedInr;
              return (
                <PressableScale
                  key={h.coinId}
                  onPress={() => navigation.navigate('CoinDetail', { coinId: h.coinId })}
                  style={styles.holdingRow}
                  scaleTo={0.98}
                >
                  <CoinIcon coin={coin} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.holdingName}>{coin.name}</Text>
                    <Text style={styles.holdingQty}>
                      {formatINR(q.priceInr)} · {formatPct(q.change24h)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.holdingValue}>{formatINR(cur, { decimals: 0 })}</Text>
                    <Text style={[styles.holdingPnl, { color: hPnl >= 0 ? colors.up : colors.down }]}>
                      {hPnl >= 0 ? '+' : ''}
                      {formatINR(hPnl, { decimals: 0 }).replace('₹-', '-₹')}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(220).duration(450)}>
          <Text style={styles.sectionTitle}>Watchlist</Text>
          {watchlist.map((id) => {
            const q = market[id];
            if (!q) return null;
            return (
              <CoinRow
                key={id}
                coin={coinById(id)}
                quote={q}
                onPress={() => navigation.navigate('CoinDetail', { coinId: id })}
              />
            );
          })}
        </Animated.View>
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
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { ...type.sub, color: colors.textDim },
  name: { ...type.h2, color: colors.text, marginTop: 2 },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  headerBtnText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  portfolioCard: {
    marginHorizontal: spacing.screen,
    borderRadius: radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { ...type.tiny, color: colors.textDim, textTransform: 'uppercase', letterSpacing: 1 },
  cardValue: { fontSize: 36, fontWeight: '800', color: colors.text, marginTop: 6, letterSpacing: -1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  cardSub: { ...type.sub, color: colors.textDim },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pnlText: { fontSize: 12, fontWeight: '800' },
  cashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  cashValue: { ...type.h3, color: colors.text, marginTop: 4 },
  withdrawBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  withdrawText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  sectionTitle: {
    ...type.h3,
    color: colors.text,
    paddingHorizontal: spacing.screen,
    marginTop: 28,
    marginBottom: 10,
  },
  moversRow: { paddingHorizontal: spacing.screen, gap: 10 },
  moverCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    width: 118,
    gap: 6,
  },
  moverSymbol: { color: colors.textDim, fontSize: 12, fontWeight: '700', marginTop: 4 },
  moverPrice: { color: colors.text, fontSize: 14, fontWeight: '800' },
  moverChange: { fontSize: 12, fontWeight: '700' },
  holdingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
  },
  holdingName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  holdingQty: { color: colors.textDim, fontSize: 12, fontWeight: '600', marginTop: 2 },
  holdingValue: { color: colors.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  holdingPnl: { fontSize: 12, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
});
