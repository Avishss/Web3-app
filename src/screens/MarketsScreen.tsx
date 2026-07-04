import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoinRow from '../components/CoinRow';
import Segmented from '../components/Segmented';
import { COINS } from '../data/coins';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const FILTERS = ['All', 'Gainers', 'Losers', 'Watchlist'] as const;
type Filter = (typeof FILTERS)[number];

export default function MarketsScreen() {
  const navigation = useNavigation<Nav>();
  const market = useStore((s) => s.market);
  const marketLive = useStore((s) => s.marketLive);
  const watchlist = useStore((s) => s.watchlist);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const list = useMemo(() => {
    let coins = COINS.filter((c) => market[c.id]);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      coins = coins.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
      );
    }
    switch (filter) {
      case 'Gainers':
        return coins
          .filter((c) => market[c.id].change24h > 0)
          .sort((a, b) => market[b.id].change24h - market[a.id].change24h);
      case 'Losers':
        return coins
          .filter((c) => market[c.id].change24h < 0)
          .sort((a, b) => market[a.id].change24h - market[b.id].change24h);
      case 'Watchlist':
        return coins.filter((c) => watchlist.includes(c.id));
      default:
        return coins.sort((a, b) => a.rank - b.rank);
    }
  }, [market, query, filter, watchlist]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <View style={[styles.liveDotWrap, { opacity: marketLive ? 1 : 0.4 }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{marketLive ? 'LIVE' : 'SIM'}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={17} color={colors.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Bitcoin, ETH…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Ionicons name="close-circle" size={17} color={colors.textDim} onPress={() => setQuery('')} />
        )}
      </View>

      <View style={{ paddingHorizontal: spacing.screen, marginBottom: 6 }}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CoinRow
            coin={item}
            quote={market[item.id]}
            onPress={() => navigation.navigate('CoinDetail', { coinId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filter === 'Watchlist' ? 'Star coins to see them here' : 'No coins found'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 14,
  },
  title: { ...type.h1, color: colors.text },
  liveDotWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  liveText: { ...type.tiny, color: colors.textDim, letterSpacing: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.screen,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  empty: { ...type.body, color: colors.textDim, textAlign: 'center', marginTop: 40 },
});
