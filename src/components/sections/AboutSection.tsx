import { useContent } from '../../hooks/useContent';
import { Card } from '../ui/card';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { MotionInView } from '../shared/MotionInView';

export function AboutSection() {
  const copy = useContent();

  return (
    <Section id="sobre">
      <Container className="space-y-12">
        <MotionInView className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{copy.about.title}</h2>
            <p className="text-base text-muted-foreground">{copy.about.quote}</p>
            <p className="text-base text-muted-foreground md:text-lg">{copy.about.text}</p>
          </div>
          <Card className="border-border/60 bg-accent/40 p-6 shadow-soft">
            <p className="text-base font-medium text-foreground md:text-lg">{copy.about.highlight}</p>
          </Card>
        </MotionInView>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <MotionInView>
            <Card className="h-full border-border/60 p-6 transition-transform hover:-translate-y-1 hover:shadow-soft">
              <h3 className="text-lg font-semibold text-foreground">{copy.about.mission.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{copy.about.mission.description}</p>
            </Card>
          </MotionInView>
          <MotionInView delay={0.05}>
            <Card className="h-full border-border/60 p-6 transition-transform hover:-translate-y-1 hover:shadow-soft">
              <h3 className="text-lg font-semibold text-foreground">{copy.about.vision.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{copy.about.vision.description}</p>
            </Card>
          </MotionInView>
          <MotionInView delay={0.1} className="sm:col-span-2 xl:col-span-1">
            <Card className="h-full border-border/60 p-6 transition-transform hover:-translate-y-1 hover:shadow-soft">
              <h3 className="text-lg font-semibold text-foreground">{copy.about.values.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {copy.about.values.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </MotionInView>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <MotionInView>
            <Card className="border-border/60 p-6">
              <h3 className="text-lg font-semibold text-foreground">{copy.about.history.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{copy.about.history.text}</p>
              <p className="mt-4 text-sm font-medium text-foreground">{copy.about.history.quote}</p>
            </Card>
          </MotionInView>
          <MotionInView delay={0.05}>
            <Card className="border-border/60 bg-secondary/60 p-6">
              <h3 className="text-lg font-semibold text-foreground">{copy.about.whatWeDo.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{copy.about.whatWeDo.quote}</p>
            </Card>
          </MotionInView>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <MotionInView>
            <Card className="h-full border-border/60 p-6 sm:p-7">
              <h4 className="text-base font-semibold text-foreground">{copy.about.whatWeDo.pfTitle}</h4>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                {copy.about.whatWeDo.pfList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </MotionInView>
          <MotionInView delay={0.05}>
            <Card className="h-full border-border/60 p-6 sm:p-7">
              <h4 className="text-base font-semibold text-foreground">{copy.about.whatWeDo.pjTitle}</h4>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
                {copy.about.whatWeDo.pjList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </MotionInView>
        </div>

        <MotionInView className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-foreground">{copy.about.ecosystem.title}</h3>
            <p className="text-base text-muted-foreground">{copy.about.ecosystem.quote}</p>
          </div>
          <Card className="border-border/60 bg-white p-6">
            <p className="text-base text-muted-foreground">{copy.about.ecosystem.text}</p>
          </Card>
        </MotionInView>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {copy.about.ecosystem.items.map((item, index) => (
            <MotionInView key={item.title} delay={0.05 * index}>
              <Card className="h-full border-border/60 p-6 transition-transform hover:-translate-y-1 hover:shadow-soft">
                <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
              </Card>
            </MotionInView>
          ))}
        </div>
      </Container>
    </Section>
  );
}
