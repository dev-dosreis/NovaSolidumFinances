import { useEffect, useState } from 'react';

export type PriceStatus = 'idle' | 'loading' | 'error';

export interface CryptoPrice {
  price: number;
  change24h: number;
  changeAmount24h: number;
  high24h?: number;
  low24h?: number;
}

export type CryptoPrices = Record<string, CryptoPrice>;

const BINANCE_MAP: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  BNB: 'BNBUSDT',
  USDT: 'USDTBRL',
  USDC: 'USDCUSDT',
};

const BINANCE_SYMBOLS = Object.values(BINANCE_MAP);
const BINANCE_URL = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(
  JSON.stringify(BINANCE_SYMBOLS),
)}`;

export function useCryptoPrices(refreshMs = 30000) {
  const [prices, setPrices] = useState<CryptoPrices>({});
  const [status, setStatus] = useState<PriceStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    let inFlight = false;

    const fetchPrices = async (isInitial = false) => {
      if (inFlight) return;
      inFlight = true;
      try {
        if (isInitial) {
          setStatus('loading');
        }
        const response = await fetch(BINANCE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = (await response.json()) as Array<{
          symbol: string;
          lastPrice: string;
          priceChangePercent: string;
          priceChange: string;
          highPrice: string;
          lowPrice: string;
        }>;

        const dataMap = new Map(data.map((item) => [item.symbol, item]));
        const usdtTicker = dataMap.get('USDTBRL');
        const usdtBrl = usdtTicker ? Number.parseFloat(usdtTicker.lastPrice) : 0;
        if (!usdtBrl) {
          throw new Error('USDTBRL not available');
        }
        const nextPrices: CryptoPrices = {};
        Object.entries(BINANCE_MAP).forEach(([symbol, pair]) => {
          const item = dataMap.get(pair);
          if (!item) return;
          const multiplier = pair.endsWith('USDT') ? usdtBrl : 1;
          const lastPrice = Number.parseFloat(item.lastPrice) * multiplier;
          const changeAmount = Number.parseFloat(item.priceChange) * multiplier;
          const changePercent = Number.parseFloat(item.priceChangePercent);
          const high = Number.parseFloat(item.highPrice) * multiplier;
          const low = Number.parseFloat(item.lowPrice) * multiplier;
          nextPrices[symbol] = {
            price: lastPrice,
            change24h: changePercent,
            changeAmount24h: changeAmount,
            high24h: high,
            low24h: low,
          };
        });

        if (isMounted) {
          setPrices(nextPrices);
          setLastUpdated(new Date());
          setStatus('idle');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
        }
      } finally {
        inFlight = false;
      }
    };

    void fetchPrices(true);
    const interval = setInterval(() => void fetchPrices(), refreshMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshMs]);

  return { prices, status, lastUpdated };
}
