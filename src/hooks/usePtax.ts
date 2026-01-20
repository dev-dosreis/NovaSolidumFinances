import { useEffect, useState } from 'react';

interface PtaxData {
  buy: number | null;
  sell: number | null;
  date: Date | null;
}

type PtaxStatus = 'loading' | 'idle' | 'error';

const BASE_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao=';

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

async function fetchPtaxByDate(date: Date) {
  const formatted = formatDate(date);
  const url = `${BASE_URL}'${formatted}'&$top=1&$orderby=dataHoraCotacao%20desc&$format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch PTAX');
  const json = (await response.json()) as {
    value: Array<{ cotacaoCompra: number; cotacaoVenda: number; dataHoraCotacao: string }>;
  };
  if (!json.value?.length) return null;
  const latest = json.value[0];
  return {
    buy: latest.cotacaoCompra,
    sell: latest.cotacaoVenda,
    date: new Date(latest.dataHoraCotacao),
  };
}

export function usePtax() {
  const [data, setData] = useState<PtaxData>({ buy: null, sell: null, date: null });
  const [status, setStatus] = useState<PtaxStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    const fetchPtax = async () => {
      try {
        let result: PtaxData | null = null;
        const today = new Date();
        for (let i = 0; i < 7; i += 1) {
          const attemptDate = new Date(today);
          attemptDate.setDate(today.getDate() - i);
          result = await fetchPtaxByDate(attemptDate);
          if (result) break;
        }
        if (!result) throw new Error('No PTAX data');
        if (isMounted) {
          setData(result);
          setStatus('idle');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
        }
      }
    };

    void fetchPtax();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, status };
}
