import { Coin } from '../types';

// Seed prices (INR) keep the app fully usable offline; live CoinGecko data
// overrides them whenever the network is available.
export const COINS: Coin[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', icon: 'bitcoin', rank: 1, seedPriceInr: 9_482_000, seedChange24h: 1.84 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA', icon: 'ethereum', rank: 2, seedPriceInr: 351_400, seedChange24h: 2.41 },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', color: '#2775CA', rank: 3, seedPriceInr: 87.9, seedChange24h: 0.01 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#9945FF', rank: 4, seedPriceInr: 17_540, seedChange24h: -1.12 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', color: '#00A5DF', rank: 5, seedPriceInr: 193.6, seedChange24h: 0.76 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633', icon: 'dog', rank: 6, seedPriceInr: 15.82, seedChange24h: 3.9 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#2A6BE8', rank: 7, seedPriceInr: 66.4, seedChange24h: -0.58 },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', color: '#E84142', rank: 8, seedPriceInr: 2_463, seedChange24h: 1.35 },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA', icon: 'link-variant', rank: 9, seedPriceInr: 1_588, seedChange24h: 2.02 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#E6007A', rank: 10, seedPriceInr: 441.2, seedChange24h: -2.21 },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', color: '#5B7CB8', icon: 'litecoin', rank: 11, seedPriceInr: 8_356, seedChange24h: 0.44 },
  { id: 'tron', symbol: 'TRX', name: 'Tron', color: '#EF0027', rank: 12, seedPriceInr: 24.6, seedChange24h: 0.92 },
  { id: 'polygon-ecosystem-token', symbol: 'POL', name: 'Polygon', color: '#8247E5', rank: 13, seedPriceInr: 21.9, seedChange24h: -1.75 },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', color: '#FFA409', rank: 14, seedPriceInr: 0.001318, seedChange24h: 5.6 },
];

export const coinById = (id: string): Coin => {
  const c = COINS.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown coin: ${id}`);
  return c;
};
