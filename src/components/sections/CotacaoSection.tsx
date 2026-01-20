import { useMemo } from 'react';

import { copy } from '../../content/copy';
import { formatBRL, formatDateTime, formatDecimal, formatPercent, formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import { CryptoPrices, PriceStatus } from '../../hooks/useCryptoPrices';
import { usePtax } from '../../hooks/usePtax';
import { useUsdtYearRange } from '../../hooks/useUsdtYearRange';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

interface CotacaoSectionProps {
  prices: CryptoPrices;
  status: PriceStatus;
  lastUpdated: Date | null;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function getPosition(value?: number | null, low?: number | null, high?: number | null) {
  if (!value || low === null || low === undefined || high === null || high === undefined) return 50;
  if (high === low) return 50;
  return clamp(((value - low) / (high - low)) * 100);
}

export function CotacaoSection({ prices, status, lastUpdated }: CotacaoSectionProps) {
  const usdt = prices.USDT;
  const usdtMeta = copy.crypto.find((item) => item.symbol === 'USDT');
  const { range } = useUsdtYearRange();
  const { data: ptax, status: ptaxStatus } = usePtax();
  const isDown = (usdt?.change24h ?? 0) < 0;
  const previousClose = usdt ? usdt.price - usdt.changeAmount24h : null;
  const ptaxBuy = ptax.buy;
  const ptaxSell = ptax.sell;
  const ptaxMid = ptax.buy && ptax.sell ? (ptax.buy + ptax.sell) / 2 : null;
  const dailyPosition = getPosition(usdt?.price, usdt?.low24h ?? null, usdt?.high24h ?? null);
  const yearPosition = getPosition(usdt?.price, range.low, range.high);
  const now = useMemo(() => new Date(), [lastUpdated]);

  return (
    <Section id="cotacao" className="bg-white">
      <Container>
        <MotionInView>
          <Card className="overflow-hidden border-border/70 shadow-soft">
            <div className="flex flex-col gap-4 border-b border-border/60 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground md:text-2xl">Cotação em Tempo Real</h2>
                <p className="text-sm text-muted-foreground">USDT/BRL • Valores sem spread</p>
              </div>
              <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Mercado Aberto
              </Badge>
            </div>

            <div className="grid gap-4 p-6 lg:grid-cols-2">
              <Card className="border-border/60 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/60 text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M4 12h16" />
                      <path d="M12 4a10 10 0 0 1 0 16" />
                    </svg>
                  </span>
                  Preço Spot
                  {usdtMeta ? (
                    <img
                      src={usdtMeta.icon}
                      alt={`${usdtMeta.name} logo`}
                      className="ml-1 h-5 w-5 rounded-full"
                    />
                  ) : null}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-semibold text-foreground">
                    {formatBRL(usdt?.price, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={cn(isDown ? 'text-rose-600' : 'text-emerald-600')}>
                      {formatDecimal(usdt?.changeAmount24h, 4, true)} ({formatPercent(usdt?.change24h)})
                    </span>
                    <span
                      className={cn(
                        'h-0 w-0 border-x-[6px] border-x-transparent',
                        isDown ? 'border-t-[8px] border-t-rose-600' : 'border-b-[8px] border-b-emerald-600',
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cotação em tempo real{usdt ? '' : ' (indisponível)'}
                  </p>
                </div>
              </Card>

              <Card className="border-border/60 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 16l4-4 3 3 5-6" />
                        <path d="M20 8v6h-6" />
                      </svg>
                    </span>
                    FOREX
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-[11px] font-semibold text-muted-foreground">
                    TV
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/70 text-xs font-semibold">
                      FX
                    </div>
                    USDBRL
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Dólar americano / Real brasileiro
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-semibold text-foreground">
                      {formatDecimal(ptaxMid ?? usdt?.price, 4)}
                    </span>
                    <span className={cn(isDown ? 'text-rose-600' : 'text-emerald-600')}>
                      {formatPercent(usdt?.change24h)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mercado internacional{ptaxStatus === 'error' ? ' (indisponível)' : ''}
                  </p>
                </div>
              </Card>
            </div>

            <div className="space-y-6 px-6 pb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Fechamento anterior:</span>{' '}
                {formatBRL(previousClose, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </p>

              <Card className="border-border/60 p-5">
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 7h12v10H6z" />
                        <path d="M9 7V4h6v3" />
                        <path d="M8 11h8" />
                        <path d="M8 15h6" />
                      </svg>
                    </span>
                    PTAX - Banco Central
                  </div>
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Compra</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatBRL(ptaxBuy, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Venda</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatBRL(ptaxSell, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Último disponível • {formatDateTime(ptax.date ?? lastUpdated)}
                </p>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Var. Diária</span>
                    <span>{formatBRL(usdt?.high24h, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                  </div>
                  <div className="relative mt-3 h-1 rounded-full bg-muted">
                    <span
                      className="absolute -top-2 h-0 w-0 border-x-[6px] border-x-transparent border-b-[8px] border-b-amber-500"
                      style={{ left: `${dailyPosition}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatBRL(usdt?.low24h, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                    <span>{formatBRL(usdt?.high24h, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Var. 52 semanas</span>
                    <span>{formatBRL(range.high, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                  </div>
                  <div className="relative mt-3 h-1 rounded-full bg-muted">
                    <span
                      className="absolute -top-2 h-0 w-0 border-x-[6px] border-x-transparent border-b-[8px] border-b-rose-500"
                      style={{ left: `${yearPosition}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatBRL(range.low, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                    <span>{formatBRL(range.high, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p>Horário atual</p>
                    <p>{formatTime(now)} GMT-3</p>
                  </div>
                  <div className="text-right">
                    <p>Última atualização</p>
                    <p>{formatDateTime(lastUpdated)}</p>
                  </div>
                </div>
                {status === 'error' || ptaxStatus === 'error' ? (
                  <p className="mt-3 text-rose-600">Falha ao atualizar.</p>
                ) : null}
              </div>
            </div>
          </Card>
        </MotionInView>
      </Container>
    </Section>
  );
}
