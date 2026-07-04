import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingViewProps, Platform } from 'react-native';

const ACTIVE_BEHAVIOR: KeyboardAvoidingViewProps['behavior'] =
  Platform.OS === 'ios' ? 'padding' : 'height';

// On Android edge-to-edge, KeyboardAvoidingView must stay inert (undefined)
// until the keyboard is actually shown, or it reserves phantom space and
// leaves black gaps at the bottom of the screen.
export function useKeyboardBehavior(): KeyboardAvoidingViewProps['behavior'] {
  const [behavior, setBehavior] = useState<KeyboardAvoidingViewProps['behavior']>(undefined);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setBehavior(ACTIVE_BEHAVIOR));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setBehavior(undefined));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return behavior;
}
