import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

import { BrandLogo } from '../components/shared/BrandLogo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatDateTime } from '../lib/format';
import { auth } from '../lib/firebase';
import { useAuthState } from '../hooks/useAuthState';
import { useRegistrations } from '../hooks/useRegistrations';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, status, isFirebaseConfigured } = useAuthState();
  const { records, status: registrationsStatus } = useRegistrations();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const now = new Date();
  const pendingCount = records.filter((record) => record.status === 'pending').length;
  const approvedCount = records.filter((record) => record.status === 'approved').length;
  const monthlyCount = records.filter(
    (record) =>
      record.createdAt &&
      record.createdAt.getMonth() === now.getMonth() &&
      record.createdAt.getFullYear() === now.getFullYear(),
  ).length;
  const isLoadingRecords = registrationsStatus === 'loading';

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      setIsSigningOut(true);
      await signOut(auth);
      navigate('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
          <Card className="border-border/70 p-8">
            <h1 className="text-2xl font-semibold">Painel administrativo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure as variáveis de ambiente do Firebase para liberar o acesso.
            </p>
            <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
              <span className="font-mono">VITE_FIREBASE_API_KEY</span>
              <span className="font-mono">VITE_FIREBASE_AUTH_DOMAIN</span>
              <span className="font-mono">VITE_FIREBASE_PROJECT_ID</span>
              <span className="font-mono">VITE_FIREBASE_STORAGE_BUCKET</span>
              <span className="font-mono">VITE_FIREBASE_MESSAGING_SENDER_ID</span>
              <span className="font-mono">VITE_FIREBASE_APP_ID</span>
              <span className="font-mono">VITE_FIREBASE_MEASUREMENT_ID</span>
            </div>
            <div className="mt-6">
              <Button asChild>
                <Link to="/">Voltar ao site</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
          <Card className="border-border/70 p-8">
            <p className="text-sm text-muted-foreground">Carregando sessão...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
          <Card className="border-border/70 p-8">
            <h1 className="text-2xl font-semibold">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Faça login com um usuário autorizado para visualizar os registros.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/login">Ir para login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Voltar ao site</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo className="h-9" />
            <span className="sr-only">Nova Solidum Finances</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Painel administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe os registros enviados pelo formulário de onboarding.
            </p>
          </div>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Firebase conectado</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Registros pendentes', value: isLoadingRecords ? '--' : pendingCount },
            { label: 'Registros aprovados', value: isLoadingRecords ? '--' : approvedCount },
            { label: 'Total do mês', value: isLoadingRecords ? '--' : monthlyCount },
          ].map((item) => (
            <Card key={item.label} className="border-border/70 p-5">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
            </Card>
          ))}
        </div>

        <Card className="border-border/70">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Últimos registros</h2>
            <p className="text-xs text-muted-foreground">
              Os dados chegam em tempo real via Firestore.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Documento</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {registrationsStatus === 'loading' ? (
                  <tr className="border-t border-border/60">
                    <td className="px-6 py-6 text-sm text-muted-foreground" colSpan={6}>
                      Carregando registros...
                    </td>
                  </tr>
                ) : null}
                {registrationsStatus === 'error' ? (
                  <tr className="border-t border-border/60">
                    <td className="px-6 py-6 text-sm text-rose-600" colSpan={6}>
                      Falha ao carregar registros.
                    </td>
                  </tr>
                ) : null}
                {registrationsStatus === 'idle' && records.length === 0 ? (
                  <tr className="border-t border-border/60">
                    <td className="px-6 py-6 text-sm text-muted-foreground" colSpan={6}>
                      Nenhum registro disponível no momento.
                    </td>
                  </tr>
                ) : null}
                {registrationsStatus === 'idle'
                  ? records.map((record) => {
                      const isCompany = record.accountType === 'PJ';
                      const name = isCompany ? record.companyName : record.fullName;
                      const doc = isCompany ? record.cnpj : record.cpf;
                      const email = isCompany ? record.companyEmail : record.userEmail;
                      const statusLabel =
                        record.status === 'approved'
                          ? 'Aprovado'
                          : record.status === 'rejected'
                            ? 'Rejeitado'
                            : 'Pendente';
                      const statusStyle =
                        record.status === 'approved'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : record.status === 'rejected'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700';

                      return (
                        <tr key={record.id} className="border-t border-border/60">
                          <td className="px-6 py-4 text-sm text-foreground">{name ?? '--'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{record.accountType ?? '--'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{doc ?? '--'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{email ?? '--'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            <Badge className={statusStyle}>{statusLabel}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDateTime(record.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
