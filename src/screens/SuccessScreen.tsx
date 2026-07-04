import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import PressableScale from '../components/PressableScale';
import SuccessCheck from '../components/SuccessCheck';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export default function SuccessScreen({ navigation, route }: Props) {
  const { title, subtitle, txId } = route.params;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <SuccessCheck />
        <Animated.Text entering={FadeInDown.delay(200).duration(450)} style={styles.title}>
          {title}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).duration(450)} style={styles.subtitle}>
          {subtitle}
        </Animated.Text>
        {txId && (
          <Animated.View entering={FadeInDown.delay(400).duration(450)}>
            <PressableScale
              onPress={() => navigation.replace('TransactionDetail', { txId })}
              style={styles.receiptBtn}
            >
              <Text style={styles.receiptText}>View receipt</Text>
            </PressableScale>
          </Animated.View>
        )}
      </View>
      <Animated.View entering={FadeInDown.delay(500).duration(450)} style={styles.footer}>
        <Button title="Done" onPress={() => navigation.popToTop()} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  title: { ...type.h1, color: colors.text, textAlign: 'center', marginTop: 8 },
  subtitle: { ...type.body, color: colors.textDim, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  receiptBtn: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  receiptText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  footer: { paddingHorizontal: spacing.screen, paddingBottom: 12 },
});
