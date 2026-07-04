import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { coinById } from '../data/coins';
import { RootStackParamList } from '../navigation/types';
import { settlementNote } from '../services/custody';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatDate, formatINR, formatQty, shortHash } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionDetail'>;

const TYPE_LABEL = {
  deposit: 'Money added',
  withdraw: 'Withdrawal',
  buy: 'Buy order',
  sell: 'Sell order',
} as const;

export default function TransactionDetailScreen({ navigation, route }: Props) {
  const tx = useStore((s) => s.transactions.find((t) => t.id === route.params.txId));

  if (!tx) return null;

  const coin = tx.coinId ? coinById(tx.coinId) : null;
  const processing = tx.status === 'processing';

  const rows: [string, string][] = [
    ['Status', processing ? 'Processing' : 'Completed'],
    ['Date', formatDate(tx.createdAt)],
    ...(coin && tx.qty ? ([['Quantity', formatQty(tx.qty, coin.symbol)]] as [string, string][]) : []),
    ...(tx.priceInr ? ([['Price', formatINR(tx.priceInr)]] as [string, string][]) : []),
    ['Amount', formatINR(tx.inrAmount, { decimals: 2 })],
    ['Fee', tx.fee > 0 ? formatINR(tx.fee, { decimals: 2 }) : 'Free'],
    ...(tx.methodDetail ? ([['Paid via', tx.methodDetail]] as [string, string][]) : []),
    ['Order ID', tx.id.toUpperCase()],
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: processing ? `${colors.warning}1E` : colors.accentSoft },
            ]}
          >
            <Ionicons
              name={processing ? 'time' : 'checkmark-circle'}
              size={30}
              color={processing ? colors.warning : colors.accent}
            />
          </View>
          <Text style={styles.heroTitle}>
            {TYPE_LABEL[tx.type]}
            {coin ? ` · ${coin.symbol}` : ''}
          </Text>
          <Text style={styles.heroAmount}>{formatINR(tx.inrAmount, { decimals: 2 })}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.card}>
          {rows.map(([label, value], i) => (
            <View key={label} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text
                style={[
                  styles.rowValue,
                  label === 'Status' && {
                    color: processing ? colors.warning : colors.accent,
                  },
                ]}
              >
                {value}
              </Text>
            </View>
          ))}
        </Animated.View>

        {tx.txHash && (
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.chainCard}>
            <View style={styles.chainHeader}>
              <Ionicons name="cube-outline" size={16} color={colors.textDim} />
              <Text style={styles.chainTitle}>Behind the scenes</Text>
            </View>
            <Text style={styles.chainNote}>{settlementNote(tx.type)}</Text>
            <View style={styles.hashRow}>
              <Text style={styles.hashLabel}>Settlement · {tx.network}</Text>
              <Text style={styles.hashValue}>{shortHash(tx.txHash)}</Text>
            </View>
          </Animated.View>
        )}
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
  hero: { alignItems: 'center', marginTop: 18 },
  heroIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...type.body, color: colors.textDim, marginTop: 14 },
  heroAmount: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 4, letterSpacing: -1 },
  card: {
    marginHorizontal: spacing.screen,
    marginTop: 22,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowLabel: { ...type.sub, color: colors.textDim },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  chainCard: {
    marginHorizontal: spacing.screen,
    marginTop: 14,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  chainHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chainTitle: { ...type.tiny, color: colors.textDim, textTransform: 'uppercase', letterSpacing: 1 },
  chainNote: { ...type.sub, color: colors.textDim, lineHeight: 19, marginTop: 10 },
  hashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hashLabel: { ...type.tiny, color: colors.textFaint },
  hashValue: { color: colors.textDim, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
