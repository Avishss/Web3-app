import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

// Springy success badge with a soft radiating pulse.
export default function SuccessCheck({ size = 108, color = colors.accent }: { size?: number; color?: string }) {
  const scale = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 11, stiffness: 160 });
    pulse.value = withDelay(
      250,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.55 }],
    opacity: 0.35 * (1 - pulse.value),
  }));

  return (
    <View style={{ width: size * 1.6, height: size * 1.6, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.pulse,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          pulseStyle,
        ]}
      />
      <Animated.View
        style={[
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          styles.badge,
          badgeStyle,
        ]}
      >
        <Animated.View entering={FadeIn.delay(160).duration(240)}>
          <Ionicons name="checkmark-sharp" size={size * 0.5} color="#06110D" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: { position: 'absolute' },
  badge: { alignItems: 'center', justifyContent: 'center' },
});
