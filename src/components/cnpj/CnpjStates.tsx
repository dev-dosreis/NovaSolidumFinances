/**
 * CNPJ States Components (Loading, Error, Empty)
 */

import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function CnpjLoadingState() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Consultando CNPJ...</h3>
          <p className="text-sm text-muted-foreground">
            Buscando informações na base de dados
          </p>
        </div>
      </div>
    </Card>
  );
}

interface CnpjErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function CnpjErrorState({ error, onRetry }: CnpjErrorStateProps) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Erro ao consultar CNPJ</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Tentar novamente
          </Button>
        )}
      </div>
    </Card>
  );
}

export function CnpjEmptyState() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Digite um CNPJ para consultar</h3>
          <p className="text-sm text-muted-foreground">
            Use o formulário acima para buscar informações cadastrais
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CnpjNotFoundState() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">CNPJ não encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Não foram encontradas informações para este CNPJ na base de dados
          </p>
        </div>
      </div>
    </Card>
  );
}
