import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { coinById } from '../data/coins';
import {
  makeId,
  makeTxHash,
  settlementDelayMs,
  settlementNetwork,
  tradeFee,
} from '../services/custody';
import { seedMarket } from '../services/market';
import {
  Holding,
  MarketMap,
  PayMethod,
  Transaction,
  UserProfile,
} from '../types';

interface SikkaState {
  user: UserProfile;
  inrBalance: number;
  holdings: Record<string, Holding>;
  transactions: Transaction[];
  watchlist: string[];
  market: MarketMap;
  marketLive: boolean;

  completeOnboarding: (name: string, phone: string, pan: string) => void;
  setMarket: (m: MarketMap, live: boolean) => void;
  toggleWatch: (coinId: string) => void;

  deposit: (amountInr: number, method: PayMethod, methodDetail: string) => string;
  withdraw: (amountInr: number) => { ok: boolean; error?: string; txId?: string };
  buy: (coinId: string, inrAmount: number) => { ok: boolean; error?: string; txId?: string };
  sell: (coinId: string, qty: number) => { ok: boolean; error?: string; txId?: string };

  settleStuck: () => void;
  resetAccount: () => void;
}

const EMPTY_USER: UserProfile = { name: '', phone: '', pan: '', onboarded: false };

function scheduleSettlement(
  set: (fn: (s: SikkaState) => Partial<SikkaState>) => void,
  txId: string,
  delayMs: number,
) {
  setTimeout(() => {
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === txId && t.status === 'processing' ? { ...t, status: 'completed' } : t,
      ),
    }));
  }, delayMs);
}

export const useStore = create<SikkaState>()(
  persist(
    (set, get) => ({
      user: EMPTY_USER,
      inrBalance: 0,
      holdings: {},
      transactions: [],
      watchlist: ['bitcoin', 'ethereum', 'solana', 'dogecoin'],
      market: seedMarket(),
      marketLive: false,

      completeOnboarding: (name, phone, pan) =>
        set({ user: { name, phone, pan, onboarded: true } }),

      setMarket: (m, live) => set({ market: m, marketLive: live }),

      toggleWatch: (coinId) =>
        set((s) => ({
          watchlist: s.watchlist.includes(coinId)
            ? s.watchlist.filter((id) => id !== coinId)
            : [...s.watchlist, coinId],
        })),

      deposit: (amountInr, method, methodDetail) => {
        const tx: Transaction = {
          id: makeId('dep'),
          type: 'deposit',
          status: 'processing',
          inrAmount: amountInr,
          fee: 0,
          method,
          methodDetail,
          txHash: makeTxHash(),
          network: settlementNetwork(),
          createdAt: Date.now(),
        };
        set((s) => ({
          inrBalance: s.inrBalance + amountInr,
          transactions: [tx, ...s.transactions],
        }));
        scheduleSettlement(set, tx.id, settlementDelayMs('deposit', method));
        return tx.id;
      },

      withdraw: (amountInr) => {
        const { inrBalance } = get();
        if (amountInr > inrBalance) return { ok: false, error: 'Amount exceeds your available balance' };
        const tx: Transaction = {
          id: makeId('wd'),
          type: 'withdraw',
          status: 'processing',
          inrAmount: amountInr,
          fee: 0,
          method: 'bank',
          methodDetail: 'HDFC Bank ····4821 · IMPS',
          txHash: makeTxHash(),
          network: settlementNetwork(),
          createdAt: Date.now(),
        };
        set((s) => ({
          inrBalance: s.inrBalance - amountInr,
          transactions: [tx, ...s.transactions],
        }));
        scheduleSettlement(set, tx.id, settlementDelayMs('withdraw'));
        return { ok: true, txId: tx.id };
      },

      buy: (coinId, inrAmount) => {
        const { inrBalance, market } = get();
        const quote = market[coinId];
        if (!quote) return { ok: false, error: 'Market unavailable, try again' };
        if (inrAmount > inrBalance) return { ok: false, error: 'Insufficient balance — add funds first' };
        const fee = tradeFee(inrAmount);
        const qty = (inrAmount - fee) / quote.priceInr;
        const tx: Transaction = {
          id: makeId('buy'),
          type: 'buy',
          status: 'processing',
          inrAmount,
          fee,
          coinId,
          qty,
          priceInr: quote.priceInr,
          txHash: makeTxHash(),
          network: settlementNetwork(),
          createdAt: Date.now(),
        };
        set((s) => {
          const prev = s.holdings[coinId] ?? { coinId, qty: 0, investedInr: 0 };
          return {
            inrBalance: s.inrBalance - inrAmount,
            holdings: {
              ...s.holdings,
              [coinId]: { coinId, qty: prev.qty + qty, investedInr: prev.investedInr + inrAmount },
            },
            transactions: [tx, ...s.transactions],
          };
        });
        scheduleSettlement(set, tx.id, settlementDelayMs('buy'));
        return { ok: true, txId: tx.id };
      },

      sell: (coinId, qty) => {
        const { holdings, market } = get();
        const quote = market[coinId];
        const holding = holdings[coinId];
        if (!quote) return { ok: false, error: 'Market unavailable, try again' };
        if (!holding || qty > holding.qty * 1.0000001)
          return { ok: false, error: `You don't hold enough ${coinById(coinId).symbol}` };
        const clampedQty = Math.min(qty, holding.qty);
        const gross = clampedQty * quote.priceInr;
        const fee = tradeFee(gross);
        const tx: Transaction = {
          id: makeId('sell'),
          type: 'sell',
          status: 'processing',
          inrAmount: gross,
          fee,
          coinId,
          qty: clampedQty,
          priceInr: quote.priceInr,
          txHash: makeTxHash(),
          network: settlementNetwork(),
          createdAt: Date.now(),
        };
        set((s) => {
          const prev = s.holdings[coinId]!;
          const remainingQty = prev.qty - clampedQty;
          const holdings = { ...s.holdings };
          if (remainingQty < 1e-9) delete holdings[coinId];
          else
            holdings[coinId] = {
              coinId,
              qty: remainingQty,
              investedInr: prev.investedInr * (remainingQty / prev.qty),
            };
          return {
            inrBalance: s.inrBalance + gross - fee,
            holdings,
            transactions: [tx, ...s.transactions],
          };
        });
        scheduleSettlement(set, tx.id, settlementDelayMs('sell'));
        return { ok: true, txId: tx.id };
      },

      settleStuck: () =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.status === 'processing' ? { ...t, status: 'completed' } : t,
          ),
        })),

      resetAccount: () =>
        set({ user: EMPTY_USER, inrBalance: 0, holdings: {}, transactions: [], watchlist: ['bitcoin', 'ethereum', 'solana', 'dogecoin'] }),
    }),
    {
      name: 'sikka-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        user: s.user,
        inrBalance: s.inrBalance,
        holdings: s.holdings,
        transactions: s.transactions,
        watchlist: s.watchlist,
      }),
      onRehydrateStorage: () => (state) => {
        // Anything left mid-settlement when the app was killed settles now.
        state?.settleStuck();
      },
    },
  ),
);

// ---- Derived helpers ----

export function portfolioValue(holdings: Record<string, Holding>, market: MarketMap): number {
  return Object.values(holdings).reduce(
    (sum, h) => sum + h.qty * (market[h.coinId]?.priceInr ?? 0),
    0,
  );
}

export function portfolioInvested(holdings: Record<string, Holding>): number {
  return Object.values(holdings).reduce((sum, h) => sum + h.investedInr, 0);
}
