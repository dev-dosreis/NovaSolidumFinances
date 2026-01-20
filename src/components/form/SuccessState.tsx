import { copy } from '../../content/copy';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface SuccessStateProps {
  onReset: () => void;
}

export function SuccessState({ onReset }: SuccessStateProps) {
  return (
    <Card className="space-y-4 border-border/60 p-8 text-center">
      <h3 className="text-2xl font-semibold text-foreground">Cadastro enviado com sucesso.</h3>
      <p className="text-sm text-muted-foreground">
        Nossa equipe seguirá com a análise. Logo alguém da nossa equipe entrará em contato.
      </p>
      <p className="text-sm text-muted-foreground">{copy.finalCta.title}</p>
      <Button onClick={onReset}>{copy.nav.start}</Button>
    </Card>
  );
}
