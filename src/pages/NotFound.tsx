import { Link } from 'react-router-dom';

import { BrandLogo } from '../components/shared/BrandLogo';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6">
        <Card className="w-full border-border/70 p-8 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-10" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">Página não encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O endereço acessado não existe ou foi movido.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">Voltar ao site</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
