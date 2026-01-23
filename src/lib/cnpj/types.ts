/**
 * CNPJ Lookup Module - Types
 * Módulo de Consulta CNPJ para Admin Dashboard
 */

import type { Timestamp } from 'firebase/firestore';

export type CnpjSource = 'CACHE' | 'BRASILAPI' | 'PROVIDER';

export type CnpjLookupStatus = 'FOUND' | 'NOT_FOUND' | 'ERROR';

export interface CnpjCnae {
  codigo: string;
  descricao: string;
}

export interface CnpjEndereco {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
}

export interface CnpjContato {
  telefone?: string | null;
  email?: string | null;
}

export interface CnpjLookupResponse {
  cnpj: string; // 14 dígitos (normalizado)
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacaoCadastral: string | null;
  dataAbertura: string | null; // ISO date
  naturezaJuridica: string | null;
  cnaePrincipal: CnpjCnae | null;
  cnaesSecundarios: CnpjCnae[];
  endereco: CnpjEndereco;
  contato?: CnpjContato;
  fonte: CnpjSource;
  atualizadoEm: string; // ISO datetime
}

export interface CnpjCacheDocument {
  cnpj: string; // 14 dígitos (document ID)
  payload: CnpjLookupResponse;
  source: CnpjSource;
  updatedAt: Date;
  expiresAt: Date | Timestamp;
}

export interface CnpjLookupLog {
  id?: string;
  userId: string;
  userEmail: string;
  cnpj: string; // 14 dígitos
  searchedAt: Date;
  resultStatus: CnpjLookupStatus;
  sourceUsed: CnpjSource | 'CACHE';
  latencyMs: number;
  errorMessage?: string;
}

// BrasilAPI Response Type (raw API response)
export interface BrasilApiCnpjResponse {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior: string | null;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: number;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  ddd_fax: string;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: string;
  descricao_porte: string;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: string | null;
  data_exclusao_do_simples: string | null;
  opcao_pelo_mei: boolean;
  situacao_especial: string;
  data_situacao_especial: string | null;
  cnaes_secundarios: Array<{
    codigo: number;
    descricao: string;
  }>;
  qsa: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal: string | null;
    nome_representante_legal: string | null;
    codigo_qualificacao_representante_legal: number | null;
  }>;
}
