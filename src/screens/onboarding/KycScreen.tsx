import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { OnboardingStackParamList } from '../../navigation/types';
import { useStore } from '../../store/useStore';
import { colors, radius, spacing, type } from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Kyc'>;

export default function KycScreen({ route }: Props) {
  const { phone } = route.params;
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [state, setState] = useState<'form' | 'verifying' | 'done'>('form');

  const panValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
  const canSubmit = name.trim().length >= 3 && panValid;

  const submit = () => {
    setState('verifying');
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setState('done');
      // Brief beat on the success state, then into the app.
      setTimeout(() => completeOnboarding(name.trim(), phone, pan), 1100);
    }, 1600);
  };

  if (state !== 'form') {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        {state === 'verifying' ? (
          <>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.centerTitle}>Verifying your PAN…</Text>
            <Text style={styles.centerSub}>Instant KYC, no documents to upload</Text>
          </>
        ) : (
          <>
            <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.doneBadge}>
              <Ionicons name="checkmark" size={44} color="#06110D" />
            </Animated.View>
            <Text style={styles.centerTitle}>You're verified, {name.split(' ')[0]}!</Text>
            <Text style={styles.centerSub}>Setting up your account…</Text>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Animated.Text entering={FadeInDown.duration(400)} style={styles.title}>
            Quick KYC — 30 seconds
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.sub}>
            Required by Indian regulations. Verified instantly, nothing to upload.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ gap: 14, marginTop: 30 }}>
            <TextInput
              style={styles.input}
              placeholder="Full name (as on PAN)"
              placeholderTextColor={colors.textFaint}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="PAN number (e.g. ABCDE1234F)"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="characters"
              maxLength={10}
              value={pan}
              onChangeText={(t) => setPan(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            />
            {pan.length === 10 && !panValid && (
              <Text style={styles.error}>That doesn't look like a valid PAN format</Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.secureRow}>
            <Ionicons name="lock-closed" size={14} color={colors.textDim} />
            <Text style={styles.secureText}>Encrypted & used only for verification</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Button title="Verify & finish" disabled={!canSubmit} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  centerTitle: { ...type.h2, color: colors.text, textAlign: 'center', marginTop: 8 },
  centerSub: { ...type.body, color: colors.textDim, textAlign: 'center' },
  doneBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, paddingHorizontal: spacing.screen, paddingTop: 32 },
  title: { ...type.h1, color: colors.text },
  sub: { ...type.body, color: colors.textDim, marginTop: 10, lineHeight: 21 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 58,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  error: { ...type.sub, color: colors.down },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  secureText: { ...type.tiny, color: colors.textDim },
  footer: { paddingHorizontal: spacing.screen, paddingBottom: 12 },
});
