import { motion } from 'framer-motion';

import { copy } from '../../content/copy';
import { formatBRL, formatPercent, formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import { CryptoPrices, PriceStatus } from '../../hooks/useCryptoPrices';
import type { PriceStatus as UsdPriceStatus } from '../../hooks/useUsdBrl';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

interface HeroProps {
  prices: CryptoPrices;
  status: PriceStatus;
  lastUpdated: Date | null;
  usdRate?: { price: number | null; lastUpdated: Date | null };
  usdStatus?: UsdPriceStatus;
}

export function Hero({ prices, status, lastUpdated, usdRate, usdStatus }: HeroProps) {
  const usdt = prices.USDT;
  const usdPrice = usdRate?.price ?? usdt?.price ?? null;
  const usdUpdated = usdRate?.lastUpdated ?? lastUpdated;
  const hasUsdError = usdStatus === 'error';

  return (
    <Section id="inicio" className="relative overflow-hidden pt-16 md:pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-accent/60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/60 blur-3xl" />
      </div>
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <MotionInView>
              <Badge>
                <span>{copy.liveTicker.pair}</span>
                <span className="text-muted-foreground">{copy.liveTicker.bullet}</span>
                <span>{copy.liveTicker.status}</span>
                <span className="text-muted-foreground">{formatTime(usdUpdated)}</span>
              </Badge>
            </MotionInView>
            <MotionInView delay={0.05}>
              <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                {copy.hero.title}
              </h1>
            </MotionInView>
            <MotionInView delay={0.1}>
              <p className="text-balance text-lg text-muted-foreground md:text-xl">{copy.hero.subtitle}</p>
            </MotionInView>
            <MotionInView delay={0.15} className="flex flex-wrap gap-3">
              <a href="#registro">
                <Button size="lg">{copy.nav.start}</Button>
              </a>
              <a href="#cotacao">
                <Button variant="outline" size="lg">
                  {copy.nav.quote}
                </Button>
              </a>
            </MotionInView>
            <MotionInView delay={0.2}>
              <div className="grid gap-3 sm:grid-cols-2">
                {copy.crypto.map((item) => (
                  <Card
                    key={item.symbol}
                    className="flex items-center justify-between border-border/60 p-4 transition-transform hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <img
                          src={item.icon}
                          alt={`${item.name} logo`}
                          className="h-6 w-6"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-foreground">
                        {formatBRL(prices[item.symbol]?.price)}
                      </span>
                      <p
                        className={cn(
                          'text-xs',
                          prices[item.symbol]?.change24h === undefined
                            ? 'text-muted-foreground'
                            : prices[item.symbol].change24h >= 0
                              ? 'text-emerald-600'
                              : 'text-rose-600',
                        )}
                      >
                        {formatPercent(prices[item.symbol]?.change24h)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </MotionInView>
          </div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/70 bg-white/80 p-8 shadow-card backdrop-blur">
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{copy.liveTicker.pair}</span>
                  <span>{copy.liveTicker.status}</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <span className="text-xs font-semibold text-muted-foreground">USD</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{copy.liveTicker.pair}</p>
                    </div>
                    <p className="text-3xl font-semibold text-foreground">{formatBRL(usdPrice)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{copy.liveTicker.bullet}</span>
                      <span>{copy.liveTicker.status}</span>
                      <span>{formatTime(usdUpdated)}</span>
                    </div>
                    {status === 'error' || hasUsdError ? (
                      <p className="text-xs text-rose-600">Falha ao atualizar.</p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3">
                  {copy.trading.features.map((feature) => (
                    <div key={feature.title} className="rounded-xl border border-border/60 bg-accent/40 p-4">
                      <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
