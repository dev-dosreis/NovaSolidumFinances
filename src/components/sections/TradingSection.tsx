import { useContent } from '../../hooks/useContent';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

const icons = [
  // Transações Instantâneas - Lightning bolt
  <svg key="bolt" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>,
  // Máxima Segurança - Shield with lock
  <svg key="security" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="10" width="6" height="5" rx="1" />
    <path d="M10 10V8a2 2 0 0 1 4 0v2" />
  </svg>,
  // Melhores Taxas - Trending down (baixas taxas)
  <svg key="rates" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M21 15v6h-6" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>,
  // Múltiplas Criptos - Multiple coins
  <svg key="crypto" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <circle cx="15" cy="15" r="7" />
    <path d="M9 6v6M6 9h6M15 12v6M12 15h6" />
  </svg>,
];

export function TradingSection() {
  const copy = useContent();

  return (
    <Section id="negociar">
      <Container className="space-y-12">
        <MotionInView className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{copy.trading.title}</h2>
          <p className="text-base text-muted-foreground md:text-lg">{copy.trading.description}</p>
        </MotionInView>
        <MotionInView delay={0.1}>
          <Card className="border-border/60 p-8 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{copy.trading.ctaTitle}</h3>
                <p className="text-sm text-muted-foreground">{copy.trading.ctaDescription}</p>
              </div>
              <a href="#registro">
                <Button size="lg">{copy.trading.ctaButton}</Button>
              </a>
            </div>
          </Card>
        </MotionInView>
        <div className="grid gap-6 md:grid-cols-2">
          {copy.trading.features.map((feature, index) => (
            <MotionInView key={feature.title} delay={0.05 * index}>
              <Card className="h-full border-border/60 p-6 transition-transform hover:-translate-y-1 hover:shadow-soft">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/60 text-primary">
                    {icons[index]}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </MotionInView>
          ))}
        </div>
      </Container>
    </Section>
  );
}
