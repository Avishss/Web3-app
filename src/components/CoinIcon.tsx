import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Coin } from '../types';

export default function CoinIcon({ coin, size = 40 }: { coin: Coin; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: coin.color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {coin.icon ? (
        <MaterialCommunityIcons name={coin.icon as any} size={size * 0.58} color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.34 }}>
          {coin.symbol.slice(0, coin.symbol.length > 4 ? 3 : 4)}
        </Text>
      )}
    </View>
  );
}
