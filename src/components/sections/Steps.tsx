import { copy } from '../../content/copy';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

const steps = copy.trading.features.slice(0, 3);

export function Steps() {
  return (
    <Section>
      <Container className="space-y-10">
        <MotionInView className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {copy.trading.ctaTitle}
          </p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{copy.trading.title}</h2>
        </MotionInView>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <MotionInView key={step.title} delay={0.05 * index}>
              <Card className="h-full border-border/60 p-6 transition-transform hover:-translate-y-1 hover:shadow-soft">
                <div className="space-y-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </Card>
            </MotionInView>
          ))}
        </div>
      </Container>
    </Section>
  );
}
