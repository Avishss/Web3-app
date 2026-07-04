import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import PressableScale from './PressableScale';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'] as const;

// Broker-style numeric keypad for entering amounts.
export default function Keypad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <View style={styles.grid}>
      {KEYS.map((k) => (
        <PressableScale
          key={k}
          haptic={false}
          scaleTo={0.9}
          style={styles.key}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onKey(k);
          }}
        >
          {k === '<' ? (
            <Ionicons name="backspace-outline" size={24} color={colors.text} />
          ) : (
            <Text style={styles.label}>{k}</Text>
          )}
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  key: {
    width: '33.33%',
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.text, fontSize: 24, fontWeight: '600' },
});
