import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useMarketFeed } from '../hooks/useMarketFeed';
import { useStore } from '../store/useStore';
import { colors } from '../theme';
import AddFundsScreen from '../screens/AddFundsScreen';
import BankTransferScreen from '../screens/BankTransferScreen';
import CoinDetailScreen from '../screens/CoinDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import MarketsScreen from '../screens/MarketsScreen';
import KycScreen from '../screens/onboarding/KycScreen';
import OtpScreen from '../screens/onboarding/OtpScreen';
import PhoneScreen from '../screens/onboarding/PhoneScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SuccessScreen from '../screens/SuccessScreen';
import TradeScreen from '../screens/TradeScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import UpiPaymentScreen from '../screens/UpiPaymentScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import { OnboardingStackParamList, RootStackParamList, TabParamList } from './types';

const Root = createNativeStackNavigator<RootStackParamList>();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ['home', 'home-outline'],
  Markets: ['stats-chart', 'stats-chart-outline'],
  Portfolio: ['pie-chart', 'pie-chart-outline'],
  History: ['receipt', 'receipt-outline'],
  Profile: ['person', 'person-outline'],
};

function OnboardingStack() {
  return (
    <Onboarding.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}
    >
      <Onboarding.Screen name="Welcome" component={WelcomeScreen} />
      <Onboarding.Screen name="Phone" component={PhoneScreen} />
      <Onboarding.Screen name="Otp" component={OtpScreen} />
      <Onboarding.Screen name="Kyc" component={KycScreen} />
    </Onboarding.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size - 2} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Markets" component={MarketsScreen} />
      <Tabs.Screen name="Portfolio" component={PortfolioScreen} />
      <Tabs.Screen name="History" component={HistoryScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    border: colors.border,
    primary: colors.accent,
    text: colors.text,
  },
};

export default function RootNavigator() {
  const onboarded = useStore((s) => s.user.onboarded);
  useMarketFeed();

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        {!onboarded ? (
          <Root.Screen name="Onboarding" component={OnboardingStack} options={{ animation: 'fade' }} />
        ) : (
          <>
            <Root.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
            <Root.Screen
              name="CoinDetail"
              component={CoinDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Root.Screen
              name="Trade"
              component={TradeScreen}
              options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
            />
            <Root.Screen
              name="AddFunds"
              component={AddFundsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Root.Screen name="UpiPayment" component={UpiPaymentScreen} options={{ animation: 'fade', gestureEnabled: false }} />
            <Root.Screen
              name="BankTransfer"
              component={BankTransferScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Root.Screen
              name="Withdraw"
              component={WithdrawScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Root.Screen name="Success" component={SuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
            <Root.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
