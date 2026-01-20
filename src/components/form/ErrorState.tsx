import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Card className="space-y-3 border-border/60 p-8 text-center">
      <h3 className="text-xl font-semibold text-foreground">Não foi possível enviar.</h3>
      <p className="text-sm text-muted-foreground">Tente novamente.</p>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </Card>
  );
}
