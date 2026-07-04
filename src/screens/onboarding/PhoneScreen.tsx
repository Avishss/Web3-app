import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useKeyboardBehavior } from '../../hooks/useKeyboardBehavior';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, radius, spacing, type } from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Phone'>;

export default function PhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const valid = /^[6-9]\d{9}$/.test(phone);
  const keyboardBehavior = useKeyboardBehavior();

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={keyboardBehavior}>
        <View style={styles.body}>
          <Animated.Text entering={FadeInDown.duration(400)} style={styles.title}>
            What's your mobile number?
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.sub}>
            We'll send a one-time password to verify it's you.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.inputRow}>
            <Text style={styles.prefix}>🇮🇳 +91</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10}
              autoFocus
              placeholder="98765 43210"
              placeholderTextColor={colors.textFaint}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
            />
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Send OTP"
            disabled={!valid}
            onPress={() => navigation.navigate('Otp', { phone })}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: spacing.screen, paddingTop: 32 },
  title: { ...type.h1, color: colors.text },
  sub: { ...type.body, color: colors.textDim, marginTop: 10, lineHeight: 21 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 60,
    gap: 12,
  },
  prefix: { color: colors.text, fontSize: 17, fontWeight: '700' },
  input: { flex: 1, color: colors.text, fontSize: 19, fontWeight: '700', letterSpacing: 1 },
  footer: { paddingHorizontal: spacing.screen, paddingBottom: 12 },
});
