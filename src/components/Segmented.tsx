import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import PressableScale from './PressableScale';

interface Props<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  activeColor?: string;
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  activeColor = colors.accent,
}: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <PressableScale
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.pill, active && { backgroundColor: `${activeColor}22` }]}
          >
            <Text style={[styles.label, active && { color: activeColor }]}>{opt}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  label: { color: colors.textDim, fontSize: 13, fontWeight: '700' },
});
