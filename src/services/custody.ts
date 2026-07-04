// The invisible Web3 layer.
//
// Users of Sikka never see wallets, seed phrases, gas or signing. This module
// simulates what a production custodial backend would do behind the API:
//   deposit  -> INR received via UPI/bank, converted to USDC on Polygon,
//               credited to the user's pooled custodial wallet
//   buy/sell -> USDC <-> asset swap executed against exchange liquidity,
//               settled on-chain by the custodian
//   withdraw -> USDC redeemed, INR paid out via IMPS to the linked bank
//
// Every settlement produces a transaction hash so power users can still see
// proof-of-settlement in the transaction detail screen.

import { PayMethod, TxType } from '../types';

const HEX = '0123456789abcdef';

export function makeTxHash(): string {
  let h = '0x';
  for (let i = 0; i < 64; i++) h += HEX[Math.floor(Math.random() * 16)];
  return h;
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function settlementNetwork(): string {
  return 'Polygon';
}

// Human explanation of what happened in the background, shown only in the
// transaction detail screen for the curious.
export function settlementNote(type: TxType): string {
  switch (type) {
    case 'deposit':
      return 'Your rupees were converted to USDC and secured in your insured custodial account on Polygon. No action was needed from you.';
    case 'withdraw':
      return 'USDC from your custodial account was redeemed and the rupees were sent to your bank via IMPS.';
    case 'buy':
      return 'Sikka swapped USDC for this asset at the best available price and settled it on-chain in your custodial account.';
    case 'sell':
      return 'Sikka swapped this asset back to USDC at the best available price and credited your rupee balance instantly.';
  }
}

// Simulated settlement latency: UPI is near-instant, bank transfers and
// on-chain settlement take a moment.
export function settlementDelayMs(type: TxType, method?: PayMethod): number {
  if (type === 'deposit' && method === 'bank') return 4500;
  if (type === 'withdraw') return 3800;
  return 1600 + Math.random() * 1200;
}

export const FEE_RATE = 0.005; // flat 0.5% — no gas, no spread games
export const MIN_ORDER_INR = 100;
export const MIN_DEPOSIT_INR = 100;
export const MAX_DEPOSIT_INR = 1_000_000;

export function tradeFee(inrAmount: number): number {
  return Math.round(inrAmount * FEE_RATE * 100) / 100;
}
