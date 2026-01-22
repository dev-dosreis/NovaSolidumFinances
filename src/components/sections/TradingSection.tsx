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
  // Máxima Segurança - Shield with check
  <svg key="security" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>,
  // Melhores Taxas - Percent/discount icon
  <svg key="rates" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
    <path d="M8 8l8 8" />
  </svg>,
  // Múltiplas Criptos - Layers icon
  <svg key="crypto" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
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
