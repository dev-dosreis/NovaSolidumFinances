# Módulo de Consulta CNPJ

Sistema de consulta automática de CNPJ para uso interno do Admin Dashboard, com cache, auditoria e integração com BrasilAPI.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [Uso](#uso)
- [API de Dados](#api-de-dados)
- [Cache e Auditoria](#cache-e-auditoria)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O módulo de Consulta CNPJ foi desenvolvido para permitir que administradores autenticados façam consultas cadastrais de empresas de forma rápida e eficiente, sem necessidade de scraping ou captcha.

### Características principais:

- ✅ Validação robusta de CNPJ (dígito verificador)
- ✅ Busca automática via BrasilAPI (dados oficiais da Receita Federal)
- ✅ Cache inteligente (30 dias, configurável)
- ✅ Auditoria completa de consultas
- ✅ UI limpa e responsiva
- ✅ Internacionalização (PT/ES/EN)
- ✅ Admin-only (protegido por guards)

---

## ⚙️ Funcionalidades

### 1. Consulta de CNPJ

- **Input com máscara**: Formatação automática (00.000.000/0000-00)
- **Colagem inteligente**: Remove automaticamente caracteres não numéricos
- **Validação em tempo real**: Verifica dígito verificador antes de enviar

### 2. Exibição de Dados

Informações exibidas em cards organizados:

- **Dados Cadastrais**:
  - CNPJ (formatado)
  - Razão Social
  - Nome Fantasia
  - Situação Cadastral (badge colorido)
  - Data de Abertura
  - Natureza Jurídica

- **Atividades (CNAEs)**:
  - CNAE Principal (código + descrição)
  - CNAEs Secundários (lista completa)

- **Endereço Completo**:
  - Logradouro, Número, Complemento
  - Bairro, Município/UF
  - CEP (formatado)

- **Contato** (quando disponível):
  - Telefone
  - Email

### 3. Ações

- **Copiar resumo**: Copia dados formatados para área de transferência
- **Fonte e Data**: Mostra de onde vieram os dados (CACHE ou BRASILAPI) e quando foram atualizados

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
NovaSolidumFinances/
├── src/
│   ├── lib/cnpj/
│   │   ├── types.ts          # TypeScript types
│   │   ├── schemas.ts        # Zod schemas
│   │   ├── utils.ts          # Utilitários (validação, formatação)
│   │   ├── service.ts        # Lógica de busca e cache
│   │   ├── index.ts          # Barrel export
│   │   └── __tests__/
│   │       └── utils.test.ts # Testes unitários
│   ├── hooks/
│   │   └── useCnpjLookup.ts  # Custom hook
│   ├── components/cnpj/
│   │   ├── CnpjSearchForm.tsx
│   │   ├── CnpjResultCard.tsx
│   │   ├── CnpjStates.tsx    # Loading, Error, Empty, NotFound
│   │   └── index.ts
│   ├── pages/
│   │   └── CnpjLookup.tsx    # Página principal
│   └── i18n/locales/
│       ├── pt.json           # Traduções PT
│       ├── es.json           # Traduções ES
│       └── en.json           # Traduções EN
└── docs/
    └── CNPJ_MODULE.md        # Esta documentação
```

### Fluxo de Dados

```
┌─────────────┐
│   Usuario   │
│  (Admin)    │
└──────┬──────┘
       │
       │ Digite CNPJ
       ▼
┌─────────────────┐
│ CnpjSearchForm  │ ─── Validação Zod + React Hook Form
└────────┬────────┘
         │
         │ onSearch(cnpj)
         ▼
┌─────────────────┐
│ useCnpjLookup   │ ─── Hook customizado
└────────┬────────┘
         │
         │ lookupCnpj()
         ▼
┌─────────────────┐
│  Service Layer  │
└────────┬────────┘
         │
         ├─────────► 1. Busca no Cache (Firestore)
         │               └─► Achou válido? ──► Retorna
         │
         ├─────────► 2. Busca na BrasilAPI
         │               └─► Timeout 4s, max 1 retry
         │
         ├─────────► 3. Salva no Cache (TTL 30 dias)
         │
         └─────────► 4. Grava Log de Auditoria
                         └─► cnpj_lookup_logs collection
```

### Collections Firestore

#### `cnpj_cache`

```typescript
{
  cnpj: "11222333000181", // Document ID
  payload: {
    cnpj: "11222333000181",
    razaoSocial: "EMPRESA EXEMPLO LTDA",
    nomeFantasia: "Exemplo",
    situacaoCadastral: "ATIVA",
    dataAbertura: "2020-01-15T00:00:00.000Z",
    // ... demais campos
  },
  source: "BRASILAPI",
  updatedAt: Timestamp,
  expiresAt: Timestamp
}
```

#### `cnpj_lookup_logs`

```typescript
{
  userId: "firebase-user-id",
  userEmail: "admin@novasolidum.com.br",
  cnpj: "11222333000181",
  searchedAt: Timestamp,
  resultStatus: "FOUND" | "NOT_FOUND" | "ERROR",
  sourceUsed: "CACHE" | "BRASILAPI",
  latencyMs: 234,
  errorMessage?: "Request timeout"
}
```

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione ao `.env.local`:

```bash
# CNPJ Lookup Module Configuration
VITE_CNPJ_CACHE_TTL_DAYS=30          # TTL do cache em dias (padrão: 30)
VITE_CNPJ_LOOKUP_TIMEOUT_MS=4000     # Timeout de requisição em ms (padrão: 4000)
```

### 2. Firestore Security Rules

Adicione regras de segurança para as collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // CNPJ Cache - Admin only (read/write)
    match /cnpj_cache/{cnpj} {
      allow read, write: if request.auth != null
        && request.auth.token.email in ['admin@novasolidum.com.br'];
    }

    // CNPJ Lookup Logs - Admin only (write), Admin read próprios logs
    match /cnpj_lookup_logs/{logId} {
      allow create: if request.auth != null
        && request.auth.token.email in ['admin@novasolidum.com.br'];

      allow read: if request.auth != null
        && request.auth.token.email in ['admin@novasolidum.com.br'];
    }
  }
}
```

### 3. Índices Firestore

Crie índices compostos para queries otimizadas:

- **Collection**: `cnpj_lookup_logs`
  - **Campos**: `userId` (Ascending), `searchedAt` (Descending)
  - **Escopo**: Collection

---

## 🚀 Uso

### Acessando o Módulo

1. Faça login no Admin Dashboard (`/admin`)
2. Verifique se seu email está na allowlist (`VITE_ADMIN_EMAILS`)
3. Clique em **"Consultar CNPJ"** no dashboard
4. Ou acesse diretamente: `/admin/cnpj`

### Consultando um CNPJ

1. Digite ou cole o CNPJ no campo (com ou sem máscara)
2. O sistema valida automaticamente o dígito verificador
3. Clique em **"Consultar CNPJ"**
4. Aguarde a busca (máx. 4 segundos)
5. Visualize os resultados em cards organizados

### Copiando Dados

Clique em **"Copiar resumo"** para copiar um texto formatado:

```
CNPJ: 11.222.333/0001-81
Razão Social: EMPRESA EXEMPLO LTDA
Nome Fantasia: Exemplo
Situação: ATIVA
Data de Abertura: 15/01/2020
CNAE Principal: 6201-5/00 - Desenvolvimento de programas de computador sob encomenda

ENDEREÇO:
Rua Exemplo, 123
Bairro Centro
São Paulo/SP
CEP: 01310-100
```

---

## 📊 API de Dados

### Schema de Resposta Padrão

```typescript
interface CnpjLookupResponse {
  cnpj: string;                    // 14 dígitos (normalizado)
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacaoCadastral: string | null;
  dataAbertura: string | null;     // ISO date
  naturezaJuridica: string | null;
  cnaePrincipal: {
    codigo: string;
    descricao: string;
  } | null;
  cnaesSecundarios: Array<{
    codigo: string;
    descricao: string;
  }>;
  endereco: {
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    municipio: string | null;
    uf: string | null;
    cep: string | null;
  };
  contato?: {
    telefone?: string | null;
    email?: string | null;
  };
  fonte: "CACHE" | "BRASILAPI";
  atualizadoEm: string;            // ISO datetime
}
```

### BrasilAPI

**Endpoint**: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`

**Documentação oficial**: https://brasilapi.com.br/docs#tag/CNPJ

**Limites**:
- Gratuito, sem chave de API
- Rate limit: ~3 req/s (não documentado oficialmente)
- Timeout: 4 segundos (configurável)

---

## 💾 Cache e Auditoria

### Estratégia de Cache

1. **Primeiro**: Busca no cache local (Firestore `cnpj_cache`)
   - Se encontrado E não expirado → Retorna imediatamente
   - Se expirado → Busca novamente na API

2. **Segundo**: Busca na BrasilAPI
   - Timeout: 4 segundos
   - Retry: 0 (pode ser configurado no futuro)

3. **Terceiro**: Salva resultado no cache
   - TTL: 30 dias (configurável via `VITE_CNPJ_CACHE_TTL_DAYS`)
   - Armazena payload completo + metadados

### Auditoria Automática

Cada consulta gera um log com:
- **Quem**: userId + userEmail do admin
- **O quê**: CNPJ consultado (14 dígitos)
- **Quando**: Timestamp da consulta
- **Resultado**: FOUND, NOT_FOUND ou ERROR
- **Fonte**: CACHE ou BRASILAPI
- **Performance**: Latência em milissegundos
- **Erros**: Mensagem de erro (se houver)

**Utilidade**:
- Rastreabilidade de consultas
- Métricas de performance
- Detecção de abuso
- Compliance e auditoria interna

---

## 🧪 Testes

### Executando Testes Unitários

```bash
npm run test
# ou
npm run test:ui
```

### Casos de Teste

O arquivo `utils.test.ts` cobre:

- ✅ Normalização de CNPJ (remoção de máscaras)
- ✅ Formatação de CNPJ (00.000.000/0000-00)
- ✅ Validação de dígito verificador
- ✅ CNPJs inválidos conhecidos (todos iguais)
- ✅ Formatação de CEP
- ✅ Normalização de CEP

### CNPJs de Teste Válidos

```
11.222.333/0001-81
00.000.000/0001-91
11.444.777/0001-61
```

---

## 🐛 Troubleshooting

### Problema: "Firebase não configurado"

**Solução**: Verifique se as variáveis de ambiente do Firebase estão corretas no `.env.local`

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Problema: "Acesso não autorizado"

**Solução**: Verifique se seu email está na variável `VITE_ADMIN_EMAILS`

```bash
VITE_ADMIN_EMAILS=admin@novasolidum.com.br,outro@email.com
```

### Problema: "Request timeout"

**Causas possíveis**:
- BrasilAPI está lento ou indisponível
- Timeout muito curto (< 4000ms)
- Problemas de rede

**Solução**:
- Aguarde e tente novamente
- Aumente `VITE_CNPJ_LOOKUP_TIMEOUT_MS` se necessário
- Verifique status da BrasilAPI: https://status.brasilapi.com.br

### Problema: "CNPJ não encontrado"

**Causas possíveis**:
- CNPJ inválido ou não existe
- CNPJ muito antigo (anterior à informatização da Receita)
- Empresa foi extinta

**Solução**:
- Verifique o CNPJ no site da Receita Federal
- Tente novamente mais tarde

### Problema: Dados desatualizados

**Solução**:
- O cache tem TTL de 30 dias
- Para forçar atualização, aguarde a expiração ou limpe o cache manualmente no Firestore

---

## 📝 Notas Importantes

1. **Não usar para scraping**: Este módulo é para uso interno ocasional, não para scraping em massa
2. **Rate limiting**: Respeite os limites da BrasilAPI (não documentados oficialmente, mas ~3 req/s)
3. **Dados sensíveis**: Não armazene dados além do necessário (compliance LGPD)
4. **Admin-only**: Nunca exponha este módulo publicamente
5. **Auditoria**: Todos os logs são permanentes - revise periodicamente

---

## 🔗 Links Úteis

- [BrasilAPI - Documentação](https://brasilapi.com.br/docs)
- [BrasilAPI - Status](https://status.brasilapi.com.br)
- [Receita Federal - Consulta CNPJ](https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp)
- [Firebase - Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## 📄 Licença

Este módulo faz parte do projeto Nova Solidum Finances e segue a mesma licença do projeto principal.

---

**Desenvolvido por**: Claude Sonnet 4.5 (Anthropic)
**Data**: Janeiro 2026
**Versão**: 1.0.0
