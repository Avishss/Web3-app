import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, radius, spacing, type } from '../theme';
import { formatINR } from '../utils/format';
import { UPI_APPS } from './AddFundsScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'UpiPayment'>;

const STEPS = [
  'Creating payment request…',
  'Waiting for approval in your UPI app…',
  'Payment received!',
];

// Simulated UPI collect flow: request -> approve -> credited.
export default function UpiPaymentScreen({ navigation, route }: Props) {
  const { amount, app: appKey } = route.params;
  const deposit = useStore((s) => s.deposit);
  const [step, setStep] = useState(0);
  const app = UPI_APPS.find((a) => a.key === appKey) ?? UPI_APPS[0];

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1100);
    const t2 = setTimeout(() => {
      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 3200);
    const t3 = setTimeout(() => {
      deposit(amount, 'upi', `${app.name} · UPI`);
      navigation.replace('Success', {
        title: 'Money added!',
        subtitle: `${formatINR(amount, { decimals: 0 })} is ready to invest`,
      });
    }, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(13)} style={[styles.appIcon, { backgroundColor: app.color }]}>
          <Text style={styles.appLetter}>{app.letter}</Text>
        </Animated.View>
        <Text style={styles.amount}>{formatINR(amount, { decimals: 0 })}</Text>
        <Text style={styles.to}>to Sikka via {app.name}</Text>

        <View style={styles.steps}>
          {STEPS.map((label, i) => {
            const done = step > i;
            const active = step === i;
            if (i > step) return null;
            return (
              <Animated.View key={label} entering={FadeInDown.duration(300)} style={styles.stepRow}>
                {done || (active && i === STEPS.length - 1) ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                ) : (
                  <ActivityIndicator size="small" color={colors.accent} />
                )}
                <Text style={[styles.stepText, (done || i === STEPS.length - 1) && { color: colors.text }]}>
                  {label}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
      <Text style={styles.hint}>Demo build — payment approves automatically</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.screen },
  appIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  appLetter: { color: '#fff', fontSize: 26, fontWeight: '900' },
  amount: { fontSize: 40, fontWeight: '800', color: colors.text, marginTop: 20, letterSpacing: -1 },
  to: { ...type.body, color: colors.textDim, marginTop: 6 },
  steps: {
    marginTop: 40,
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignSelf: 'stretch',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepText: { ...type.body, color: colors.textDim, flex: 1 },
  hint: { ...type.tiny, color: colors.textFaint, textAlign: 'center', paddingBottom: 20 },
});
