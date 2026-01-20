import { useEffect, useState } from 'react';

interface BookTickerData {
  bid: number | null;
  ask: number | null;
  updatedAt: Date | null;
}

type BookTickerStatus = 'loading' | 'idle' | 'error';

const API_URL = 'https://api.binance.com/api/v3/ticker/bookTicker?symbol=USDTBRL';

export function useUsdtBookTicker(refreshMs = 30000) {
  const [data, setData] = useState<BookTickerData>({ bid: null, ask: null, updatedAt: null });
  const [status, setStatus] = useState<BookTickerStatus>('loading');

  useEffect(() => {
    let isMounted = true;
    let inFlight = false;

    const fetchTicker = async (isInitial = false) => {
      if (inFlight) return;
      inFlight = true;
      try {
        if (isInitial) {
          setStatus('loading');
        }
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const json = (await response.json()) as { bidPrice: string; askPrice: string };
        const bid = Number.parseFloat(json.bidPrice);
        const ask = Number.parseFloat(json.askPrice);
        if (isMounted) {
          setData({
            bid: Number.isFinite(bid) ? bid : null,
            ask: Number.isFinite(ask) ? ask : null,
            updatedAt: new Date(),
          });
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

    void fetchTicker(true);
    const interval = setInterval(() => void fetchTicker(), refreshMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshMs]);

  return { data, status };
}
