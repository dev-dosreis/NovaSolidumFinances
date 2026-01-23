/**
 * CNPJ Result Card Component
 */

import { useState } from 'react';
import type { CnpjLookupResponse } from '../../lib/cnpj/types';
import { formatCnpj, formatCep } from '../../lib/cnpj/utils';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface CnpjResultCardProps {
  data: CnpjLookupResponse;
}

export function CnpjResultCard({ data }: CnpjResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const summary = formatSummary(data);
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return '--';
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatUpdated = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isActive = data.situacaoCadastral?.toLowerCase().includes('ativa') ?? false;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{data.razaoSocial || '--'}</h3>
            {data.nomeFantasia && (
              <p className="text-sm text-muted-foreground">
                Nome Fantasia: {data.nomeFantasia}
              </p>
            )}
          </div>
          <Badge
            variant={isActive ? 'default' : 'outline'}
            className={
              isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }
          >
            {data.situacaoCadastral || 'N/A'}
          </Badge>
        </div>

        <Separator />

        {/* Dados Cadastrais */}
        <div className="grid gap-4 sm:grid-cols-2">
          <DataField label="CNPJ" value={formatCnpj(data.cnpj)} />
          <DataField label="Data de Abertura" value={formatDate(data.dataAbertura)} />
          <DataField label="Natureza Jurídica" value={data.naturezaJuridica} />
          {data.cnaePrincipal && (
            <DataField
              label="CNAE Principal"
              value={`${data.cnaePrincipal.codigo} - ${data.cnaePrincipal.descricao}`}
            />
          )}
        </div>

        {/* CNAEs Secundários */}
        {data.cnaesSecundarios.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">CNAEs Secundários</h4>
              <div className="space-y-1">
                {data.cnaesSecundarios.slice(0, 5).map((cnae, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {cnae.codigo} - {cnae.descricao}
                  </p>
                ))}
                {data.cnaesSecundarios.length > 5 && (
                  <p className="text-sm text-muted-foreground italic">
                    + {data.cnaesSecundarios.length - 5} CNAEs adicionais
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Endereço */}
        <Separator />
        <div className="space-y-2">
          <h4 className="font-semibold">Endereço</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <DataField
              label="Logradouro"
              value={
                data.endereco.logradouro && data.endereco.numero
                  ? `${data.endereco.logradouro}, ${data.endereco.numero}`
                  : data.endereco.logradouro
              }
            />
            {data.endereco.complemento && (
              <DataField label="Complemento" value={data.endereco.complemento} />
            )}
            <DataField label="Bairro" value={data.endereco.bairro} />
            <DataField
              label="Município/UF"
              value={
                data.endereco.municipio && data.endereco.uf
                  ? `${data.endereco.municipio}/${data.endereco.uf}`
                  : data.endereco.municipio || data.endereco.uf
              }
            />
            <DataField
              label="CEP"
              value={data.endereco.cep ? formatCep(data.endereco.cep) : null}
            />
          </div>
        </div>

        {/* Contato */}
        {data.contato?.telefone && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Contato</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <DataField label="Telefone" value={data.contato.telefone} />
                {data.contato.email && (
                  <DataField label="Email" value={data.contato.email} />
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="space-y-1">
            <p>Fonte: {data.fonte}</p>
            <p>Atualizado em: {formatUpdated(data.atualizadoEm)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? 'Copiado!' : 'Copiar resumo'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface DataFieldProps {
  label: string;
  value: string | null | undefined;
}

function DataField({ label, value }: DataFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '--'}</p>
    </div>
  );
}

function formatSummary(data: CnpjLookupResponse): string {
  const lines = [
    `CNPJ: ${formatCnpj(data.cnpj)}`,
    `Razão Social: ${data.razaoSocial || '--'}`,
    data.nomeFantasia ? `Nome Fantasia: ${data.nomeFantasia}` : null,
    `Situação: ${data.situacaoCadastral || '--'}`,
    `Data de Abertura: ${data.dataAbertura ? new Date(data.dataAbertura).toLocaleDateString('pt-BR') : '--'}`,
    data.cnaePrincipal
      ? `CNAE Principal: ${data.cnaePrincipal.codigo} - ${data.cnaePrincipal.descricao}`
      : null,
    '',
    'ENDEREÇO:',
    data.endereco.logradouro
      ? `${data.endereco.logradouro}, ${data.endereco.numero || 'S/N'}`
      : null,
    data.endereco.complemento ? `Complemento: ${data.endereco.complemento}` : null,
    data.endereco.bairro ? `Bairro: ${data.endereco.bairro}` : null,
    data.endereco.municipio && data.endereco.uf
      ? `${data.endereco.municipio}/${data.endereco.uf}`
      : null,
    data.endereco.cep ? `CEP: ${formatCep(data.endereco.cep)}` : null,
  ];

  return lines.filter(Boolean).join('\n');
}
