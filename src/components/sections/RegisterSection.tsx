import { copy } from '../../content/copy';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { Card } from '../ui/card';
import { MotionInView } from '../shared/MotionInView';
import { RegisterWizard } from '../form/RegisterWizard';

export function RegisterSection() {
  return (
    <Section id="registro" className="bg-white">
      <Container className="space-y-10">
        <MotionInView className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{copy.form.title}</h2>
          <p className="text-base text-muted-foreground">{copy.form.subtitle}</p>
        </MotionInView>
        <MotionInView delay={0.1}>
          <div className="mx-auto max-w-4xl">
            <Card className="border-border/70 bg-surface/70 p-6 shadow-soft sm:p-8 md:p-10">
              <RegisterWizard />
            </Card>
          </div>
        </MotionInView>
      </Container>
    </Section>
  );
}
