import { useContent } from '../../hooks/useContent';
import { InfoCard } from '../shared/InfoCard';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

const icons = [
  // Ponte Completa - Bridge/Connection icon
  <svg key="bridge" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 12h2m14 0h2M7 12a2 2 0 012-2h6a2 2 0 012 2m-10 0v7a1 1 0 001 1h8a1 1 0 001-1v-7M5 8h14" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="5" r="1.5" fill="currentColor" />
    <circle cx="15" cy="5" r="1.5" fill="currentColor" />
  </svg>,
  // Experiência Simples - Sparkle/Magic icon
  <svg key="simple" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M7.757 7.757L5.636 5.636m12.728 0l-2.121 2.121M7.757 16.243l-2.121 2.121" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Segurança Total - Shield with check icon
  <svg key="security" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Evolução Constante - Trending up/Growth icon
  <svg key="evolution" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
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
