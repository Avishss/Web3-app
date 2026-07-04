import { useEffect } from 'react';
import { fetchLiveMarket, tickMarket } from '../services/market';
import { useStore } from '../store/useStore';

const TICK_MS = 4000;
const REFRESH_MS = 60_000;

// Keeps the market feeling live: real CoinGecko refresh every minute,
// gentle simulated ticks in between (and as full offline fallback).
export function useMarketFeed() {
  const setMarket = useStore((s) => s.setMarket);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const live = await fetchLiveMarket();
      if (live && !cancelled) setMarket({ ...useStore.getState().market, ...live }, true);
    };
    refresh();

    const tickTimer = setInterval(() => {
      const s = useStore.getState();
      s.setMarket(tickMarket(s.market), s.marketLive);
    }, TICK_MS);
    const refreshTimer = setInterval(refresh, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(tickTimer);
      clearInterval(refreshTimer);
    };
  }, [setMarket]);
}
