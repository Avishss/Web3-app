export interface Coin {
  id: string; // coingecko id
  symbol: string;
  name: string;
  color: string;
  icon?: string; // MaterialCommunityIcons name, falls back to symbol letter
  rank: number;
  seedPriceInr: number;
  seedChange24h: number;
}

export interface MarketQuote {
  priceInr: number;
  change24h: number; // percent
  high24h: number;
  low24h: number;
  marketCapInr: number;
  volume24hInr: number;
  sparkline: number[];
}

export type MarketMap = Record<string, MarketQuote>;

export interface Holding {
  coinId: string;
  qty: number;
  investedInr: number; // total INR put in (avg-cost basis)
}

export type TxType = 'deposit' | 'withdraw' | 'buy' | 'sell';
export type TxStatus = 'processing' | 'completed' | 'failed';
export type PayMethod = 'upi' | 'bank';

export interface Transaction {
  id: string;
  type: TxType;
  status: TxStatus;
  inrAmount: number; // gross INR value of the transaction
  fee: number;
  coinId?: string;
  qty?: number;
  priceInr?: number;
  method?: PayMethod;
  methodDetail?: string; // e.g. "Google Pay · UPI" or "HDFC ····4821"
  txHash?: string; // background on-chain settlement reference
  network?: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  pan: string;
  onboarded: boolean;
}

export type ChartRange = '1D' | '1W' | '1M' | '1Y' | 'All';
