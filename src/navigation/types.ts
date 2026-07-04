export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  CoinDetail: { coinId: string };
  Trade: { coinId: string; side: 'buy' | 'sell' };
  AddFunds: undefined;
  UpiPayment: { amount: number; app: string };
  BankTransfer: { amount: number };
  Withdraw: undefined;
  Success: { title: string; subtitle: string; txId?: string };
  TransactionDetail: { txId: string };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Phone: undefined;
  Otp: { phone: string };
  Kyc: { phone: string };
};

export type TabParamList = {
  Home: undefined;
  Markets: undefined;
  Portfolio: undefined;
  History: undefined;
  Profile: undefined;
};
