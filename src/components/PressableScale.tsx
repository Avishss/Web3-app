import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

// Every tappable surface in the app goes through this for a consistent,
// tactile springy feel.
export default function PressableScale({
  onPress,
  onLongPress,
  disabled,
  haptic = true,
  scaleTo = 0.965,
  style,
  children,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => (scale.value = withTiming(scaleTo, { duration: 90 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 14, stiffness: 260 }))}
      onLongPress={onLongPress}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
    >
      <Animated.View style={[style, animatedStyle, disabled && { opacity: 0.45 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
