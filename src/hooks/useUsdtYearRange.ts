import { useEffect, useState } from 'react';

interface YearRange {
  low: number | null;
  high: number | null;
}

type RangeStatus = 'loading' | 'idle' | 'error';

const API_URL = 'https://api.binance.com/api/v3/klines?symbol=USDTBRL&interval=1w&limit=52';

export function useUsdtYearRange() {
  const [range, setRange] = useState<YearRange>({ low: null, high: null });
  const [status, setStatus] = useState<RangeStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    const fetchRange = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch range');
        const data = (await response.json()) as Array<Array<string | number>>;
        const highs = data.map((entry) => Number(entry[2]));
        const lows = data.map((entry) => Number(entry[3]));
        const low = Math.min(...lows);
        const high = Math.max(...highs);
        if (isMounted) {
          setRange({ low, high });
          setStatus('idle');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
        }
      }
    };

    void fetchRange();

    return () => {
      isMounted = false;
    };
  }, []);

  return { range, status };
}
