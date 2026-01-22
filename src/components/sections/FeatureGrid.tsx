import { useContent } from '../../hooks/useContent';
import { InfoCard } from '../shared/InfoCard';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

const icons = [
  // Ponte Completa - Connection/Link icon
  <svg key="bridge" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
  // Experiência Simples - Zap/Simple icon
  <svg key="simple" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>,
  // Segurança Total - Shield with check
  <svg key="security" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
  // Evolução Constante - Trending up
  <svg key="evolution" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </svg>,
];

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
              <InfoCard
                icon={
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/60 text-primary">
                    {icons[index]}
                  </div>
                }
                className="transition-transform hover:-translate-y-1 hover:shadow-soft"
              >
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
