import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Coin, MarketQuote } from '../types';
import { formatINR, formatPct } from '../utils/format';
import CoinIcon from './CoinIcon';
import PressableScale from './PressableScale';
import Sparkline from './Sparkline';

interface Props {
  coin: Coin;
  quote: MarketQuote;
  onPress: () => void;
  showSparkline?: boolean;
}

function CoinRow({ coin, quote, onPress, showSparkline = true }: Props) {
  const up = quote.change24h >= 0;
  return (
    <PressableScale onPress={onPress} style={styles.row} scaleTo={0.98}>
      <CoinIcon coin={coin} />
      <View style={styles.nameCol}>
        <Text style={styles.name} numberOfLines={1}>
          {coin.name}
        </Text>
        <Text style={styles.symbol}>{coin.symbol}</Text>
      </View>
      {showSparkline && (
        <Sparkline data={quote.sparkline} color={up ? colors.up : colors.down} />
      )}
      <View style={styles.priceCol}>
        <Text style={styles.price}>{formatINR(quote.priceInr)}</Text>
        <Text style={[styles.change, { color: up ? colors.up : colors.down }]}>
          {formatPct(quote.change24h)}
        </Text>
      </View>
    </PressableScale>
  );
}

export default memo(CoinRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.screen,
    gap: 12,
  },
  nameCol: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  symbol: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  priceCol: { alignItems: 'flex-end', gap: 2, minWidth: 96 },
  price: { color: colors.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  change: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
