import { useEffect, useState } from 'react';

export type PriceStatus = 'loading' | 'idle' | 'error';

interface UsdBrlRate {
  price: number | null;
  lastUpdated: Date | null;
}

const API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

export function useUsdBrl(refreshMs = 60000) {
  const [rate, setRate] = useState<UsdBrlRate>({ price: null, lastUpdated: null });
  const [status, setStatus] = useState<PriceStatus>('loading');

  useEffect(() => {
    let isMounted = true;
    let inFlight = false;

    const fetchRate = async (isInitial = false) => {
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
        const json = (await response.json()) as {
          USDBRL?: { bid?: string; ask?: string; timestamp?: string };
        };
        const raw = json.USDBRL;
        const bid = raw?.bid ? Number.parseFloat(raw.bid) : null;
        const ask = raw?.ask ? Number.parseFloat(raw.ask) : null;
        const price = bid ?? ask ?? null;
        const lastUpdated = raw?.timestamp ? new Date(Number(raw.timestamp) * 1000) : new Date();
        if (isMounted) {
          setRate({ price, lastUpdated });
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

    void fetchRate(true);
    const interval = setInterval(() => void fetchRate(), refreshMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshMs]);

  return { rate, status };
}
