import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

import { copy } from '../content/copy';
import { BrandLogo } from '../components/shared/BrandLogo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { hasAdminAllowlist, isAdminEmail } from '../lib/admin';
import { formatDateTime } from '../lib/format';
import { auth, db, storage } from '../lib/firebase';
import { useAuthState } from '../hooks/useAuthState';
import { useRegistrations } from '../hooks/useRegistrations';

type AdminFile = { id: string; name: string; url: string; path: string; field?: string; size?: number };

type FieldDefinition = { label: string; key: string };

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return String(value);
};

const hasValue = (value: unknown) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, status, isFirebaseConfigured } = useAuthState();
  const { records, status: registrationsStatus } = useRegistrations();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filesById, setFilesById] = useState<Record<string, AdminFile[]>>({});
  const [filesStatus, setFilesStatus] = useState<Record<string, 'idle' | 'loading' | 'error'>>({});
  const now = new Date();
  const confirmedCount = records.filter((record) => (record.status ?? 'confirmado') === 'confirmado').length;
  const pendingCount = records.filter((record) => record.status === 'pending').length;
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

  const loadFiles = async (docId: string) => {
    if (!storage || !db) return;
    setFilesStatus((prev) => ({ ...prev, [docId]: 'loading' }));
    try {
      const filesQuery = query(
        collection(db, 'registrations', docId, 'files'),
        orderBy('createdAt', 'desc'),
      );
      const snapshot = await getDocs(filesQuery);
      const files = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as { name?: string; path?: string; field?: string; size?: number };
          const path = data.path ?? '';
          const url = path ? await getDownloadURL(ref(storage, path)) : '';
          return {
            id: docSnap.id,
            name: data.name ?? path.split('/').pop() ?? 'Arquivo',
            path,
            url,
            field: data.field,
            size: data.size,
          };
        }),
      );
      setFilesById((prev) => ({ ...prev, [docId]: files }));
      setFilesStatus((prev) => ({ ...prev, [docId]: 'idle' }));
    } catch (error) {
      setFilesStatus((prev) => ({ ...prev, [docId]: 'error' }));
    }
  };

  const toggleExpanded = (docId: string) => {
    setExpandedId((current) => {
      const next = current === docId ? null : docId;
      if (next && !filesById[docId]) {
        void loadFiles(docId);
      }
      return next;
    });
  };

  const renderField = (label: string, value: unknown, key: string) => {
    const confirmed = hasValue(value);
    return (
      <div key={key} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-foreground">{formatValue(value)}</span>
          <Badge
            className={
              confirmed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }
          >
            {confirmed ? 'Confirmado' : 'Pendente'}
          </Badge>
        </div>
      </div>
    );
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

  if (!hasAdminAllowlist) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
          <Card className="border-border/70 p-8">
            <h1 className="text-2xl font-semibold">Painel administrativo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Defina a variável <span className="font-semibold">VITE_ADMIN_EMAILS</span> para restringir o acesso ao
              painel.
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? 'Saindo...' : 'Sair'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
          <Card className="border-border/70 p-8">
            <h1 className="text-2xl font-semibold">Acesso não autorizado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Este usuário não está liberado para acessar o painel administrativo.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? 'Saindo...' : 'Sair'}
              </Button>
              <Button asChild>
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
            { label: 'Registros confirmados', value: isLoadingRecords ? '--' : confirmedCount },
            { label: 'Registros pendentes', value: isLoadingRecords ? '--' : pendingCount },
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
                      const data = record.data as Record<string, unknown>;
                      const accountType = data.accountType as string | undefined;
                      const isCompany = accountType === 'PJ';
                      const name = isCompany ? data.companyName : data.fullName;
                      const doc = isCompany ? data.cnpj : data.cpf;
                      const email = isCompany ? data.companyEmail : data.userEmail;
                      const statusValue = record.status ?? 'confirmado';
                      const statusLabel =
                        statusValue === 'approved' || statusValue === 'aprovado'
                          ? 'Aprovado'
                          : statusValue === 'rejected' || statusValue === 'rejeitado'
                            ? 'Rejeitado'
                            : statusValue === 'confirmado'
                              ? 'Confirmado'
                              : 'Pendente';
                      const statusStyle =
                        statusLabel === 'Aprovado'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : statusLabel === 'Rejeitado'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : statusLabel === 'Confirmado'
                              ? 'border-sky-200 bg-sky-50 text-sky-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700';

                      const pfMainFields: FieldDefinition[] = [
                        { label: copy.form.fullName, key: 'fullName' },
                        { label: copy.form.cpf, key: 'cpf' },
                        { label: copy.form.birthDate, key: 'birthDate' },
                        { label: copy.form.rg, key: 'rg' },
                        { label: copy.form.cnh, key: 'cnh' },
                        { label: copy.form.foreigner, key: 'isForeigner' },
                        { label: copy.form.email, key: 'userEmail' },
                        { label: copy.form.phone, key: 'userPhone' },
                        { label: copy.form.pep, key: 'pepStatus' },
                        { label: copy.form.pepPosition, key: 'pepPosition' },
                        { label: 'Termos aceitos', key: 'acceptTerms' },
                      ];

                      const pfAddressFields: FieldDefinition[] =
                        data.isForeigner === true
                          ? [
                              { label: copy.form.foreignStreet, key: 'foreignStreet' },
                              { label: copy.form.foreignNumber, key: 'foreignNumber' },
                              { label: copy.form.foreignComplement, key: 'foreignComplement' },
                              { label: copy.form.foreignDistrict, key: 'foreignDistrict' },
                              { label: copy.form.foreignCity, key: 'foreignCity' },
                              { label: copy.form.foreignState, key: 'foreignState' },
                              { label: copy.form.foreignZip, key: 'foreignZipCode' },
                              { label: copy.form.foreignCountry, key: 'foreignCountry' },
                            ]
                          : [
                              { label: copy.form.cep, key: 'cep' },
                              { label: copy.form.street, key: 'street' },
                              { label: copy.form.number, key: 'number' },
                              { label: copy.form.complement, key: 'complement' },
                              { label: copy.form.district, key: 'district' },
                              { label: copy.form.city, key: 'city' },
                              { label: copy.form.state, key: 'state' },
                            ];

                      const pjMainFields: FieldDefinition[] = [
                        { label: copy.form.companyName, key: 'companyName' },
                        { label: copy.form.tradeName, key: 'tradeName' },
                        { label: copy.form.cnpj, key: 'cnpj' },
                        { label: copy.form.foundationDate, key: 'foundationDate' },
                        { label: copy.form.cnae, key: 'mainCNAE' },
                        { label: copy.form.companyEmail, key: 'companyEmail' },
                        { label: copy.form.companyPhone, key: 'companyPhone' },
                        { label: copy.form.legalNature, key: 'legalNature' },
                      ];

                      const pjAddressFields: FieldDefinition[] = [
                        { label: copy.form.cep, key: 'pjCep' },
                        { label: copy.form.street, key: 'pjStreet' },
                        { label: copy.form.number, key: 'pjNumber' },
                        { label: copy.form.complement, key: 'pjComplement' },
                        { label: copy.form.district, key: 'pjDistrict' },
                        { label: copy.form.city, key: 'pjCity' },
                        { label: copy.form.state, key: 'pjState' },
                      ];

                      const pjAdminFields: FieldDefinition[] = [
                        { label: copy.form.adminName, key: 'majorityAdminName' },
                        { label: copy.form.adminCpf, key: 'majorityAdminCpf' },
                        { label: copy.form.adminEmail, key: 'majorityAdminEmail' },
                        { label: copy.form.adminPhone, key: 'majorityAdminPhone' },
                        { label: 'Termos aceitos', key: 'acceptTerms' },
                      ];

                      const files = filesById[record.id] ?? [];
                      const fileStatus = filesStatus[record.id] ?? 'idle';
                      const isExpanded = expandedId === record.id;
                      const fileLabels: Record<string, string> = {
                        documentFront: copy.form.docFront,
                        documentBack: copy.form.docBack,
                        selfie: copy.form.selfie,
                        proofOfAddress: copy.form.proofOfAddress,
                        articlesOfAssociation: copy.form.articles,
                        cnpjCard: copy.form.cnpjCard,
                        adminIdFront: copy.form.adminIdFront,
                        adminIdBack: copy.form.adminIdBack,
                        companyProofOfAddress: copy.form.companyProof,
                        ecnpjCertificate: copy.form.ecnpj,
                      };

                      return (
                        <Fragment key={record.id}>
                          <tr className="border-t border-border/60 align-top">
                            <td className="px-6 py-4 text-sm text-foreground">{(name as string) ?? '--'}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{accountType ?? '--'}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{(doc as string) ?? '--'}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{(email as string) ?? '--'}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              <Badge className={statusStyle}>{statusLabel}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              <div className="flex flex-col gap-2">
                                <span>{formatDateTime(record.createdAt)}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleExpanded(record.id)}
                                >
                                  {isExpanded ? 'Fechar' : 'Ver detalhes'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded ? (
                            <tr className="border-t border-border/60">
                              <td className="px-6 pb-6 pt-4" colSpan={6}>
                                <div className="grid gap-4 lg:grid-cols-2">
                                  <Card className="border-border/60 p-4">
                                    <h3 className="text-sm font-semibold text-foreground">
                                      {isCompany ? copy.form.companySection : copy.form.pfSection}
                                    </h3>
                                    <div className="mt-3">
                                      {(isCompany ? pjMainFields : pfMainFields).map((field) =>
                                        renderField(field.label, data[field.key], field.key),
                                      )}
                                    </div>
                                  </Card>

                                  <Card className="border-border/60 p-4">
                                    <h3 className="text-sm font-semibold text-foreground">
                                      {isCompany ? copy.form.fiscalAddress : copy.form.addressSection}
                                    </h3>
                                    <div className="mt-3">
                                      {(isCompany ? pjAddressFields : pfAddressFields).map((field) =>
                                        renderField(field.label, data[field.key], field.key),
                                      )}
                                    </div>
                                  </Card>

                                  {isCompany ? (
                                    <Card className="border-border/60 p-4">
                                      <h3 className="text-sm font-semibold text-foreground">
                                        {copy.form.adminSection}
                                      </h3>
                                      <div className="mt-3">
                                        {pjAdminFields.map((field) =>
                                          renderField(field.label, data[field.key], field.key),
                                        )}
                                      </div>
                                    </Card>
                                  ) : null}

                                  <Card className="border-border/60 p-4">
                                    <h3 className="text-sm font-semibold text-foreground">Documentos enviados</h3>
                                    <div className="mt-3 space-y-3 text-sm">
                                      {fileStatus === 'loading' ? (
                                        <p className="text-muted-foreground">Carregando arquivos...</p>
                                      ) : null}
                                      {fileStatus === 'error' ? (
                                        <p className="text-rose-600">Não foi possível carregar os arquivos.</p>
                                      ) : null}
                                      {fileStatus === 'idle' && files.length === 0 ? (
                                        <p className="text-muted-foreground">Nenhum arquivo encontrado.</p>
                                      ) : null}
                                      {files.length > 0 ? (
                                        <ul className="space-y-2">
                                          {files.map((file) => (
                                            <li
                                              key={file.id}
                                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
                                            >
                                              <div className="flex flex-col text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  {file.field ? fileLabels[file.field] ?? file.field : 'Documento'}
                                                </span>
                                                <span>{file.name}</span>
                                                {file.size ? (
                                                  <span>{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                                                ) : null}
                                              </div>
                                              {file.url ? (
                                                <a
                                                  href={file.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-xs font-medium text-primary"
                                                >
                                                  Abrir arquivo
                                                </a>
                                              ) : (
                                                <span className="text-xs text-muted-foreground">Indisponível</span>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : null}
                                    </div>
                                  </Card>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
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
