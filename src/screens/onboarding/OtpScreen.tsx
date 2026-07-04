import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, radius, spacing, type } from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Otp'>;

const OTP_LEN = 6;

export default function OtpScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (code.length === OTP_LEN) {
      setVerifying(true);
      // Demo build: any 6-digit code verifies.
      const t = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        navigation.navigate('Kyc', { phone });
        setVerifying(false);
        setCode('');
      }, 900);
      return () => clearTimeout(t);
    }
  }, [code, navigation, phone]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Animated.Text entering={FadeInDown.duration(400)} style={styles.title}>
          Enter the OTP
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.sub}>
          Sent to +91 {phone} · <Text style={{ color: colors.accent }}>demo: type any 6 digits</Text>
        </Animated.Text>

        <Pressable onPress={() => inputRef.current?.focus()}>
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.boxes}>
            {Array.from({ length: OTP_LEN }).map((_, i) => {
              const filled = i < code.length;
              const active = i === code.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.box,
                    active && { borderColor: colors.accent },
                    filled && { borderColor: colors.textFaint },
                  ]}
                >
                  <Text style={styles.digit}>{code[i] ?? ''}</Text>
                </View>
              );
            })}
          </Animated.View>
        </Pressable>

        <TextInput
          ref={inputRef}
          style={styles.hidden}
          keyboardType="number-pad"
          maxLength={OTP_LEN}
          autoFocus
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
        />

        {verifying && (
          <View style={styles.verifying}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.verifyingText}>Verifying…</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: spacing.screen, paddingTop: 32 },
  title: { ...type.h1, color: colors.text },
  sub: { ...type.body, color: colors.textDim, marginTop: 10 },
  boxes: { flexDirection: 'row', gap: 10, marginTop: 36 },
  box: {
    flex: 1,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { color: colors.text, fontSize: 24, fontWeight: '800' },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  verifying: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
  verifyingText: { ...type.body, color: colors.textDim },
});
