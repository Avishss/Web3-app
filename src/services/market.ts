import { COINS } from '../data/coins';
import { ChartRange, MarketMap, MarketQuote } from '../types';

// Market data engine.
// 1. Seeds instantly from bundled data so the app never shows a blank state.
// 2. Refreshes from CoinGecko (free, keyless) when the network allows.
// 3. Runs a gentle random-walk ticker between refreshes so prices feel live.

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function genSparkline(price: number, change24h: number, seed: number): number[] {
  const rand = seededRandom(seed);
  const points = 48;
  const start = price / (1 + change24h / 100);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const drift = (price - v) / (points - i);
    v += drift + v * (rand() - 0.5) * 0.008;
    out.push(v);
  }
  out[points - 1] = price;
  return out;
}

export function seedMarket(): MarketMap {
  const map: MarketMap = {};
  for (const c of COINS) {
    const supplyProxy = 2e13 / c.seedPriceInr; // fake but stable cap ordering
    map[c.id] = {
      priceInr: c.seedPriceInr,
      change24h: c.seedChange24h,
      high24h: c.seedPriceInr * 1.02,
      low24h: c.seedPriceInr * 0.975,
      marketCapInr: c.seedPriceInr * supplyProxy * (1 + (15 - c.rank) * 0.4),
      volume24hInr: c.seedPriceInr * supplyProxy * 0.06,
      sparkline: genSparkline(c.seedPriceInr, c.seedChange24h, hashString(c.id)),
    };
  }
  return map;
}

export async function fetchLiveMarket(): Promise<MarketMap | null> {
  try {
    const ids = COINS.map((c) => c.id).join(',');
    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${ids}` +
      `&sparkline=true&price_change_percentage=24h`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const rows: any[] = await res.json();
    const map: MarketMap = {};
    for (const r of rows) {
      if (!r?.id || !r?.current_price) continue;
      map[r.id] = {
        priceInr: r.current_price,
        change24h: r.price_change_percentage_24h ?? 0,
        high24h: r.high_24h ?? r.current_price,
        low24h: r.low_24h ?? r.current_price,
        marketCapInr: r.market_cap ?? 0,
        volume24hInr: r.total_volume ?? 0,
        sparkline: (r.sparkline_in_7d?.price ?? []).slice(-48),
      };
    }
    return Object.keys(map).length ? map : null;
  } catch {
    return null;
  }
}

// Small random-walk tick applied between real refreshes so the UI feels alive.
export function tickMarket(current: MarketMap): MarketMap {
  const next: MarketMap = {};
  for (const [id, q] of Object.entries(current)) {
    const stable = id === 'usd-coin';
    const drift = stable ? 0 : (Math.random() - 0.5) * 0.0022;
    const price = q.priceInr * (1 + drift);
    next[id] = {
      ...q,
      priceInr: price,
      change24h: q.change24h + drift * 100,
      high24h: Math.max(q.high24h, price),
      low24h: Math.min(q.low24h, price),
      sparkline: [...q.sparkline.slice(1), price],
    };
  }
  return next;
}

const RANGE_POINTS: Record<ChartRange, { points: number; vol: number; trend: number }> = {
  '1D': { points: 72, vol: 0.004, trend: 0.02 },
  '1W': { points: 84, vol: 0.011, trend: 0.05 },
  '1M': { points: 90, vol: 0.02, trend: 0.12 },
  '1Y': { points: 96, vol: 0.045, trend: 0.65 },
  All: { points: 96, vol: 0.06, trend: 2.4 },
};

const historyCache = new Map<string, number[]>();

// Deterministic synthetic history that always ends at the current live price.
export function getHistory(coinId: string, range: ChartRange, currentPrice: number): number[] {
  const key = `${coinId}:${range}`;
  let base = historyCache.get(key);
  if (!base) {
    const { points, vol, trend } = RANGE_POINTS[range];
    const rand = seededRandom(hashString(key));
    const stable = coinId === 'usd-coin';
    const startFactor = stable ? 1 : 1 / (1 + trend * (0.4 + rand() * 0.9) * (rand() > 0.22 ? 1 : -0.5));
    let v = startFactor;
    base = [v];
    for (let i = 1; i < points; i++) {
      const drift = (1 - v) / (points - i);
      v += drift + (stable ? 0 : v * (rand() - 0.5) * vol * 2);
      base.push(Math.max(v, 0.0001));
    }
    base[points - 1] = 1;
    historyCache.set(key, base);
  }
  return base.map((f) => f * currentPrice);
}
