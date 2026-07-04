# Sikka 🪙

**Crypto investing for India, without the Web3 headache.**

Sikka is a mobile app that works like a familiar broking app (think Groww/Zerodha) but for
crypto. Users add money with **UPI or bank transfer**, buy and sell coins **in rupees from
₹100**, and withdraw back to their bank — while all the Web3 machinery (USDC conversion,
custodial wallets, on-chain settlement on Polygon) happens invisibly in the background.

**No seed phrases. No wallet signing. No gas fees. No jargon.**

## Features

- **Onboarding in under a minute** — phone + OTP, instant PAN-based KYC (simulated)
- **Add money** — UPI (Google Pay / PhonePe / Paytm / BHIM) or bank transfer (IMPS/NEFT)
- **Live markets** — 14 top coins priced in INR from CoinGecko, with a simulated live tick
  between refreshes and a full offline fallback
- **Broker-style trading** — scrubbable price charts (1D–All), buy/sell with a custom
  keypad, quick-amount chips, flat 0.5% fee, min order ₹100
- **Portfolio & P&L** — live portfolio value, per-holding returns, average cost
- **Activity & receipts** — every deposit, trade and withdrawal gets a receipt; the
  "Behind the scenes" section shows the simulated on-chain settlement (network + tx hash)
  for the curious
- **Withdraw to bank** — sell to rupees, IMPS payout (simulated)
- **Polished UX** — dark fintech theme, spring press physics, staggered entrance
  animations, animated numbers, haptics, success pulse animations

## The invisible Web3 layer

`src/services/custody.ts` documents what a production custodial backend would do behind
the API: INR → USDC conversion on deposit, USDC ↔ asset swaps on trades, on-chain
settlement, and IMPS payout on withdrawal. In this demo build it's fully simulated —
settlement latencies, tx hashes and plain-language explanations included — so the entire
product experience is real while never exposing users to blockchain complexity.

## Tech stack

| Layer      | Choice |
| ---------- | ------ |
| Framework  | Expo SDK 57 · React Native 0.86 · TypeScript (strict) |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| State      | Zustand with AsyncStorage persistence |
| Animations | React Native Reanimated 4 + Expo Haptics |
| Charts     | Custom SVG charts (react-native-svg) with touch scrubbing |
| Prices     | CoinGecko public API + deterministic offline simulation |

## Run it

```bash
npm install
npx expo start
```

Scan the QR with **Expo Go** on your phone (or press `a`/`i` for an emulator).

Demo notes: any 6-digit OTP works, any valid-format PAN (e.g. `ABCDE1234F`) verifies,
and UPI payments approve automatically. Money and markets are simulated — this is a
product demo, not a real financial service.

## Project structure

```
src/
  components/   # PressableScale, AnimatedNumber, LineChart, Keypad, …
  data/         # supported coins + seed prices
  hooks/        # market feed poller, keypad amount input
  navigation/   # root stack, onboarding stack, bottom tabs
  screens/      # onboarding/, Home, Markets, CoinDetail, Trade, AddFunds,
                # UpiPayment, BankTransfer, Withdraw, Portfolio, History,
                # Profile, Success, TransactionDetail
  services/     # market engine (CoinGecko + simulation), custody engine
  store/        # zustand store (balance, holdings, transactions)
```
