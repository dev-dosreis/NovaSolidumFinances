import { useEffect, useMemo, useState } from 'react';

import { copy } from '../../content/copy';
import { formatBRL, formatDateTime, formatDecimal, formatPercent, formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import { CryptoPrices, PriceStatus } from '../../hooks/useCryptoPrices';
import { useUsdtBookTicker } from '../../hooks/useUsdtBookTicker';
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

const marketTimezone = 'America/Sao_Paulo';
const marketOpenMinutes = 9 * 60;
const marketCloseMinutes = 18 * 60;

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getMarketTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: marketTimezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  return {
    weekday: weekdayMap[weekday] ?? -1,
    minutes: hour * 60 + minute,
  };
}

function isBusinessDay(weekday: number) {
  return weekday >= 1 && weekday <= 5;
}

function isMarketOpen(date: Date) {
  const { weekday, minutes } = getMarketTimeParts(date);
  if (!isBusinessDay(weekday)) return false;
  return minutes >= marketOpenMinutes && minutes < marketCloseMinutes;
}

function minutesUntilNextOpen(date: Date) {
  const { weekday, minutes } = getMarketTimeParts(date);
  if (isBusinessDay(weekday) && minutes < marketOpenMinutes) {
    return marketOpenMinutes - minutes;
  }

  let daysAhead = 0;
  let currentWeekday = weekday;
  let minutesLeftToday = 24 * 60 - minutes;
  let totalMinutes = 0;

  if (minutesLeftToday < 0) {
    minutesLeftToday = 0;
  }

  while (daysAhead < 7) {
    totalMinutes += daysAhead === 0 ? minutesLeftToday : 24 * 60;
    currentWeekday = (weekday + daysAhead + 1) % 7;
    if (isBusinessDay(currentWeekday)) {
      totalMinutes += marketOpenMinutes;
      break;
    }
    daysAhead += 1;
  }

  return totalMinutes;
}

function minutesUntilClose(date: Date) {
  const { minutes } = getMarketTimeParts(date);
  return Math.max(marketCloseMinutes - minutes, 0);
}

function formatCountdown(minutes: number) {
  const safeMinutes = Math.max(minutes, 0);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

export function CotacaoSection({ prices, status, lastUpdated }: CotacaoSectionProps) {
  const usdt = prices.USDT;
  const usdtMeta = copy.crypto.find((item) => item.symbol === 'USDT');
  const { range } = useUsdtYearRange();
  const { data: book, status: bookStatus } = useUsdtBookTicker();
  const isDown = (usdt?.change24h ?? 0) < 0;
  const previousClose = usdt ? usdt.price - usdt.changeAmount24h : null;
  const bookBid = book.bid ?? usdt?.price ?? null;
  const bookAsk = book.ask ?? usdt?.price ?? null;
  const bookMid = bookBid && bookAsk ? (bookBid + bookAsk) / 2 : usdt?.price ?? null;
  const dailyPosition = getPosition(usdt?.price, usdt?.low24h ?? null, usdt?.high24h ?? null);
  const yearPosition = getPosition(usdt?.price, range.low, range.high);
  const [now, setNow] = useState(() => new Date());
  const marketIsOpen = useMemo(() => isMarketOpen(now), [now]);
  const marketCountdown = useMemo(
    () => (marketIsOpen ? minutesUntilClose(now) : minutesUntilNextOpen(now)),
    [marketIsOpen, now],
  );

  useEffect(() => {
    setNow(new Date());
  }, [lastUpdated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section id="cotacao" className="bg-white">
      <Container>
        <MotionInView>
          <Card className="overflow-hidden border-border/70 shadow-soft">
            <div className="flex flex-col gap-4 border-b border-border/60 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground md:text-2xl">Cotação em Tempo Real</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>USDT/BRL • Valores sem spread</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 8v4l3 2" />
                      </svg>
                    </span>
                    {marketIsOpen
                      ? `Fecha em ${formatCountdown(marketCountdown)}`
                      : `Abre em ${formatCountdown(marketCountdown)}`}
                  </span>
                </div>
              </div>
              <Badge
                className={cn(
                  'w-fit',
                  marketIsOpen
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', marketIsOpen ? 'bg-emerald-500' : 'bg-rose-500')} />
                {marketIsOpen ? 'Mercado Aberto' : 'Mercado Fechado'}
              </Badge>
            </div>

            <div className="relative">
              <div className="pointer-events-none blur-[2px]" aria-hidden="true">
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
                          {formatDecimal(bookMid ?? usdt?.price, 4)}
                        </span>
                        <span className={cn(isDown ? 'text-rose-600' : 'text-emerald-600')}>
                          {formatPercent(usdt?.change24h)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mercado internacional{bookStatus === 'error' ? ' (indisponível)' : ''}
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
                          {formatBRL(bookBid, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Venda</p>
                        <p className="text-lg font-semibold text-foreground">
                          {formatBRL(bookAsk, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Fechamento • {formatDateTime(book.updatedAt ?? lastUpdated)}
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
                    {status === 'error' || bookStatus === 'error' ? (
                      <p className="mt-3 text-rose-600">Falha ao atualizar.</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-md rounded-2xl border border-border/60 bg-white/90 p-6 text-center shadow-soft backdrop-blur">
                  <p className="text-sm font-medium text-foreground">Acompanhe a cotação em tempo real.</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Veja o painel completo e atualizado no conversor oficial.
                  </p>
                  <a
                    href="https://novasolidum.codnodo.com/conversor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Acompanhar cotação
                  </a>
                  <p className="mt-2 text-[11px] text-muted-foreground">novasolidum.codnodo.com</p>
                </div>
              </div>
            </div>
          </Card>
        </MotionInView>
      </Container>
    </Section>
  );
}
