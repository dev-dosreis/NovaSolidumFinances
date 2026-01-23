import { useContent } from '../../hooks/useContent';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

const icons = [
  // Transações Instantâneas - Zap
  <svg key="zap" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>,
  // Máxima Segurança - Lock
  <svg key="lock" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>,
  // Melhores Taxas - Tag
  <svg key="tag" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>,
  // Múltiplas Criptos - Grid
  <svg key="grid" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
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
