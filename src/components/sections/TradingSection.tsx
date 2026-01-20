import { copy } from '../../content/copy';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

const icons = [
  <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
  </svg>,
  <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" />
    <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
  </svg>,
  <svg key="trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2V22" />
    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" />
  </svg>,
  <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8V12L15 14" strokeLinecap="round" />
  </svg>,
];

export function TradingSection() {
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
