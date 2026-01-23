/**
 * CNPJ Lookup Page - Admin Only
 * Consulta de CNPJ com cache e auditoria
 */

import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthState } from '../hooks/useAuthState';
import { useCnpjLookup } from '../hooks/useCnpjLookup';
import { hasAdminAllowlist, isAdminEmail } from '../lib/admin';
import { isFirebaseConfigured } from '../lib/firebase';
import { BrandLogo } from '../components/shared/BrandLogo';
import { Button } from '../components/ui/button';
import {
  CnpjSearchForm,
  CnpjResultCard,
  CnpjLoadingState,
  CnpjErrorState,
  CnpjEmptyState,
  CnpjNotFoundState,
} from '../components/cnpj';

export function CnpjLookup() {
  const { user, status } = useAuthState();

  // Guard: Firebase não configurado
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Firebase não configurado</h1>
          <p className="text-muted-foreground">
            Configure as variáveis de ambiente do Firebase para acessar esta página.
          </p>
          <Link to="/">
            <Button>Voltar para home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Guard: Loading
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Guard: Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Guard: Not admin
  if (hasAdminAllowlist && !isAdminEmail(user.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Acesso não autorizado</h1>
          <p className="text-muted-foreground">
            Este usuário não está liberado para acessar esta funcionalidade.
          </p>
          <Link to="/">
            <Button>Voltar para home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render main content
  return <CnpjLookupContent user={user} />;
}

interface CnpjLookupContentProps {
  user: { uid: string; email: string | null };
}

function CnpjLookupContent({ user }: CnpjLookupContentProps) {
  const { data, loading, error, searched, search, reset } = useCnpjLookup(
    user.uid,
    user.email || ''
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/admin" className="flex items-center gap-3">
            <BrandLogo className="h-8 w-auto" />
            <span className="text-sm font-medium text-muted-foreground">
              Consulta CNPJ
            </span>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              ← Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-4xl space-y-8"
        >
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Consulta CNPJ</h1>
            <p className="text-muted-foreground">
              Consulte informações cadastrais de empresas por CNPJ
            </p>
          </div>

          {/* Search Form */}
          <CnpjSearchForm onSearch={search} loading={loading} />

          {/* Results */}
          <motion.div
            key={searched ? 'searched' : 'empty'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading && <CnpjLoadingState />}

            {!loading && error && searched && !data && (
              <CnpjErrorState error={error} onRetry={reset} />
            )}

            {!loading && !error && searched && !data && <CnpjNotFoundState />}

            {!loading && !error && data && <CnpjResultCard data={data} />}

            {!loading && !searched && <CnpjEmptyState />}
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="rounded-lg border bg-muted/50 p-4"
          >
            <div className="space-y-2">
              <h3 className="font-semibold">Informações sobre a consulta</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Dados obtidos da BrasilAPI (base oficial da Receita Federal)</li>
                <li>• Resultados são armazenados em cache por 30 dias</li>
                <li>• Todas as consultas são registradas para auditoria</li>
                <li>• Timeout de 4 segundos por consulta</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
