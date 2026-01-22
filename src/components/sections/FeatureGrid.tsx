import { useContent } from '../../hooks/useContent';
import { InfoCard } from '../shared/InfoCard';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

export function FeatureGrid() {
  const copy = useContent();

  return (
    <Section>
      <Container className="space-y-10">
        <MotionInView className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            {copy.about.differentiators.title}
          </h2>
          <p className="text-base text-muted-foreground">{copy.about.differentiators.quote}</p>
        </MotionInView>
        <div className="grid gap-6 md:grid-cols-2">
          {copy.about.differentiators.items.map((item, index) => (
            <MotionInView key={item.title} delay={0.05 * index}>
              <InfoCard className="transition-transform hover:-translate-y-1 hover:shadow-soft">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </InfoCard>
            </MotionInView>
          ))}
        </div>
      </Container>
    </Section>
  );
}
