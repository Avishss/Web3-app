import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import { coinById } from '../data/coins';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatDate, formatINR, formatQty } from '../utils/format';
import { Transaction } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TX_META: Record<
  Transaction['type'],
  { icon: keyof typeof Ionicons.glyphMap; color: string; sign: string }
> = {
  deposit: { icon: 'arrow-down-circle', color: colors.up, sign: '+' },
  withdraw: { icon: 'arrow-up-circle', color: colors.warning, sign: '-' },
  buy: { icon: 'trending-up', color: colors.accent, sign: '-' },
  sell: { icon: 'trending-down', color: colors.down, sign: '+' },
};

function txTitle(t: Transaction): string {
  switch (t.type) {
    case 'deposit':
      return 'Money added';
    case 'withdraw':
      return 'Withdrawn to bank';
    case 'buy':
      return `Bought ${coinById(t.coinId!).symbol}`;
    case 'sell':
      return `Sold ${coinById(t.coinId!).symbol}`;
  }
}

export default function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const transactions = useStore((s) => s.transactions);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.title}>Activity</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textFaint} />
            <Text style={styles.emptyText}>Your deposits and trades will show up here</Text>
          </View>
        }
        renderItem={({ item: t }) => {
          const meta = TX_META[t.type];
          return (
            <PressableScale
              onPress={() => navigation.navigate('TransactionDetail', { txId: t.id })}
              style={styles.row}
              scaleTo={0.98}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${meta.color}1E` }]}>
                <Ionicons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{txTitle(t)}</Text>
                <Text style={styles.rowSub}>
                  {t.qty && t.coinId
                    ? `${formatQty(t.qty, coinById(t.coinId).symbol)} · ${formatDate(t.createdAt)}`
                    : formatDate(t.createdAt)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 3 }}>
                <Text style={styles.amount}>
                  {meta.sign}
                  {formatINR(t.inrAmount, { decimals: 0 })}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: t.status === 'processing' ? `${colors.warning}1E` : colors.accentSoft },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: t.status === 'processing' ? colors.warning : colors.accent },
                    ]}
                  >
                    {t.status === 'processing' ? 'Processing' : 'Done'}
                  </Text>
                </View>
              </View>
            </PressableScale>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { ...type.h1, color: colors.text, paddingHorizontal: spacing.screen, paddingTop: 8, paddingBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingVertical: 13,
  },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowSub: { color: colors.textDim, fontSize: 12, fontWeight: '500', marginTop: 2 },
  amount: { color: colors.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyText: { ...type.body, color: colors.textDim, textAlign: 'center' },
});
