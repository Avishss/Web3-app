import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';
import PressableScale from './PressableScale';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: Props) {
  const bg =
    variant === 'primary' ? colors.accent : variant === 'danger' ? colors.down : colors.card;
  const fg = variant === 'ghost' ? colors.text : '#06110D';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bg }, variant === 'ghost' && styles.ghost, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: variant === 'danger' ? '#fff' : fg }]}>{title}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  ghost: { borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
