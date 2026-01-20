import { copy } from '../../content/copy';
import { Button } from '../ui/button';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

export function CTASection() {
  return (
    <Section className="bg-white">
      <Container>
        <MotionInView className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-accent/40 p-8 text-center shadow-soft md:flex-row md:items-center md:justify-between md:text-left md:p-10">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{copy.finalCta.title}</h2>
          <a href="#registro" className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto">
              {copy.finalCta.button}
            </Button>
          </a>
        </MotionInView>
      </Container>
    </Section>
  );
}
