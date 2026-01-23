/**
 * Hook: useCnpjLookup
 * Custom hook para consulta de CNPJ com estado e tratamento de erros
 */

import { useState, useCallback } from 'react';
import { lookupCnpj } from '../lib/cnpj/service';
import { normalizeCnpj, isValidCnpj } from '../lib/cnpj/utils';
import type { CnpjLookupResponse } from '../lib/cnpj/types';

interface UseCnpjLookupState {
  data: CnpjLookupResponse | null;
  loading: boolean;
  error: string | null;
  searched: boolean;
}

interface UseCnpjLookupReturn extends UseCnpjLookupState {
  search: (cnpj: string) => Promise<void>;
  reset: () => void;
}

export function useCnpjLookup(
  userId: string,
  userEmail: string
): UseCnpjLookupReturn {
  const [state, setState] = useState<UseCnpjLookupState>({
    data: null,
    loading: false,
    error: null,
    searched: false,
  });

  const search = useCallback(
    async (cnpj: string) => {
      // Reset state
      setState({
        data: null,
        loading: true,
        error: null,
        searched: false,
      });

      try {
        // Validação de CNPJ
        const normalized = normalizeCnpj(cnpj);

        if (!isValidCnpj(normalized)) {
          throw new Error('CNPJ inválido');
        }

        // Buscar CNPJ
        const result = await lookupCnpj(normalized, userId, userEmail);

        setState({
          data: result,
          loading: false,
          error: result ? null : 'CNPJ não encontrado',
          searched: true,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao buscar CNPJ';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          searched: true,
        });
      }
    },
    [userId, userEmail]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      searched: false,
    });
  }, []);

  return {
    ...state,
    search,
    reset,
  };
}
