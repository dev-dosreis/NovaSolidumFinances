/**
 * CNPJ Lookup Service
 * Serviço de consulta de CNPJ com cache e auditoria
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  CnpjLookupResponse,
  BrasilApiCnpjResponse,
  CnpjCacheDocument,
  CnpjLookupLog,
  CnpjSource,
  CnpjLookupStatus,
} from './types';
import {
  normalizeCnpj,
  getCacheExpiration,
  isCacheExpired,
  toIsoDate,
  normalizeCep,
} from './utils';

// Configuração via ENV
const CACHE_TTL_DAYS = Number(import.meta.env.VITE_CNPJ_CACHE_TTL_DAYS ?? 30);
const LOOKUP_TIMEOUT_MS = Number(
  import.meta.env.VITE_CNPJ_LOOKUP_TIMEOUT_MS ?? 4000
);
const BRASILAPI_BASE_URL = 'https://brasilapi.com.br/api/cnpj/v1';

/**
 * Busca CNPJ com estratégia de cache
 */
export async function lookupCnpj(
  cnpj: string,
  userId: string,
  userEmail: string
): Promise<CnpjLookupResponse | null> {
  const normalized = normalizeCnpj(cnpj);
  const startTime = Date.now();

  let result: CnpjLookupResponse | null = null;
  let source: CnpjSource | 'CACHE' = 'CACHE';
  let status: CnpjLookupStatus = 'NOT_FOUND';
  let errorMessage: string | undefined;

  try {
    // 1. Tentar buscar do cache
    result = await getFromCache(normalized);

    if (result) {
      source = 'CACHE';
      status = 'FOUND';
    } else {
      // 2. Se não encontrou no cache, buscar da BrasilAPI
      result = await fetchFromBrasilApi(normalized);

      if (result) {
        source = 'BRASILAPI';
        status = 'FOUND';

        // 3. Salvar no cache
        await saveToCache(normalized, result, source);
      }
    }
  } catch (error) {
    status = 'ERROR';
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CNPJ Lookup] Error:', error);
  } finally {
    // 4. Gravar log de auditoria
    const latencyMs = Date.now() - startTime;
    await logLookup({
      userId,
      userEmail,
      cnpj: normalized,
      searchedAt: new Date(),
      resultStatus: status,
      sourceUsed: source,
      latencyMs,
      errorMessage,
    });
  }

  return result;
}

/**
 * Busca CNPJ do cache (Firestore)
 */
async function getFromCache(
  cnpj: string
): Promise<CnpjLookupResponse | null> {
  try {
    const docRef = doc(db, 'cnpj_cache', cnpj);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as CnpjCacheDocument;

    // Verifica se o cache expirou
    const expiresAt = data.expiresAt instanceof Date
      ? data.expiresAt
      : data.expiresAt.toDate();

    if (isCacheExpired(expiresAt)) {
      console.log('[CNPJ Cache] Expired, fetching fresh data');
      return null;
    }

    return data.payload;
  } catch (error) {
    console.error('[CNPJ Cache] Error reading cache:', error);
    return null;
  }
}

/**
 * Salva CNPJ no cache (Firestore)
 */
async function saveToCache(
  cnpj: string,
  payload: CnpjLookupResponse,
  source: CnpjSource
): Promise<void> {
  try {
    const docRef = doc(db, 'cnpj_cache', cnpj);
    const expiresAt = getCacheExpiration(CACHE_TTL_DAYS);

    const cacheDoc: CnpjCacheDocument = {
      cnpj,
      payload,
      source,
      updatedAt: new Date(),
      expiresAt,
    };

    await setDoc(docRef, cacheDoc);
    console.log('[CNPJ Cache] Saved to cache');
  } catch (error) {
    console.error('[CNPJ Cache] Error saving to cache:', error);
    // Não propagar erro - cache é opcional
  }
}

/**
 * Busca CNPJ da BrasilAPI
 */
async function fetchFromBrasilApi(
  cnpj: string
): Promise<CnpjLookupResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(`${BRASILAPI_BASE_URL}/${cnpj}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // CNPJ não encontrado
      }
      throw new Error(`BrasilAPI error: ${response.status}`);
    }

    const data: BrasilApiCnpjResponse = await response.json();

    // Transformar resposta para nosso formato
    return transformBrasilApiResponse(data);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
}

/**
 * Transforma resposta da BrasilAPI para nosso formato padrão
 */
function transformBrasilApiResponse(
  data: BrasilApiCnpjResponse
): CnpjLookupResponse {
  return {
    cnpj: normalizeCnpj(data.cnpj),
    razaoSocial: data.razao_social || null,
    nomeFantasia: data.nome_fantasia || null,
    situacaoCadastral: data.descricao_situacao_cadastral || null,
    dataAbertura: toIsoDate(data.data_inicio_atividade),
    naturezaJuridica: data.codigo_natureza_juridica
      ? String(data.codigo_natureza_juridica)
      : null,
    cnaePrincipal: {
      codigo: String(data.cnae_fiscal),
      descricao: data.cnae_fiscal_descricao || '',
    },
    cnaesSecundarios: (data.cnaes_secundarios || []).map((cnae) => ({
      codigo: String(cnae.codigo),
      descricao: cnae.descricao,
    })),
    endereco: {
      logradouro: `${data.descricao_tipo_logradouro || ''} ${data.logradouro || ''}`.trim() || null,
      numero: data.numero || null,
      complemento: data.complemento || null,
      bairro: data.bairro || null,
      municipio: data.municipio || null,
      uf: data.uf || null,
      cep: data.cep ? normalizeCep(data.cep) : null,
    },
    contato: {
      telefone: data.ddd_telefone_1 || null,
      email: null, // BrasilAPI não retorna email
    },
    fonte: 'BRASILAPI',
    atualizadoEm: new Date().toISOString(),
  };
}

/**
 * Grava log de auditoria no Firestore
 */
async function logLookup(log: CnpjLookupLog): Promise<void> {
  try {
    await addDoc(collection(db, 'cnpj_lookup_logs'), {
      ...log,
      searchedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[CNPJ Lookup] Error saving log:', error);
    // Não propagar erro - log é opcional
  }
}

/**
 * Limpa cache expirado (função de manutenção)
 */
export async function cleanExpiredCache(): Promise<number> {
  // TODO: Implementar limpeza em Cloud Function scheduled
  // Por enquanto, retorna 0
  return 0;
}
