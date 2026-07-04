import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, type } from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const FEATURES = [
  {
    icon: 'flash' as const,
    title: 'Add money with UPI',
    desc: 'GPay, PhonePe, Paytm or bank transfer — money in seconds.',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'No wallets. No keys. No jargon.',
    desc: 'We handle all the blockchain stuff safely in the background.',
  },
  {
    icon: 'trending-up' as const,
    title: 'Trade like a broking app',
    desc: 'Buy Bitcoin from ₹100. Sell anytime, money back to your bank.',
  },
];

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#07321F', colors.bg, colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.logo}>
            <Text style={styles.logoGlyph}>₹</Text>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.title}>
            Sikka
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220).duration(500)} style={styles.tagline}>
            Crypto investing, made as simple{'\n'}as ordering food.
          </Animated.Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.title}
              entering={FadeInDown.delay(350 + i * 120).duration(450)}
              style={styles.featureRow}
            >
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(750).duration(500)} style={styles.footer}>
          <Button title="Get started" onPress={() => navigation.navigate('Phone')} />
          <Text style={styles.legal}>
            Demo build · Simulated money & markets · Not investment advice
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.screen },
  hero: { alignItems: 'center', marginTop: 48 },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  logoGlyph: { fontSize: 44, fontWeight: '900', color: '#06110D' },
  title: { ...type.hero, color: colors.text, marginTop: 20 },
  tagline: { ...type.body, color: colors.textDim, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  features: { flex: 1, justifyContent: 'center', gap: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { ...type.h3, color: colors.text },
  featureDesc: { ...type.sub, color: colors.textDim, marginTop: 3, lineHeight: 18 },
  footer: { paddingBottom: 12, gap: 14 },
  legal: { ...type.tiny, color: colors.textFaint, textAlign: 'center' },
});
