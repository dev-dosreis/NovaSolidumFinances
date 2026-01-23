/**
 * CNPJ Lookup Module - Utilities
 */

/**
 * Normaliza CNPJ removendo caracteres não-numéricos
 */
export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Formata CNPJ para exibição (00.000.000/0000-00)
 */
export function formatCnpj(cnpj: string): string {
  const normalized = normalizeCnpj(cnpj);

  if (normalized.length !== 14) {
    return cnpj; // Retorna original se inválido
  }

  return normalized.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Valida dígito verificador do CNPJ
 */
export function isValidCnpj(cnpj: string): boolean {
  const normalized = normalizeCnpj(cnpj);

  if (normalized.length !== 14) return false;

  // CNPJs inválidos conhecidos (todos iguais)
  if (/^(\d)\1{13}$/.test(normalized)) return false;

  const digits = normalized.split('').map(Number);

  // Calcula primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  if (digits[12] !== firstDigit) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  return digits[13] === secondDigit;
}

/**
 * Formata data YYYYMMDD para formato brasileiro DD/MM/YYYY
 */
export function formatBrazilianDate(date: string): string {
  if (!date || date.length !== 8) return date;

  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  return `${day}/${month}/${year}`;
}

/**
 * Converte data YYYYMMDD para ISO string
 */
export function toIsoDate(date: string): string | null {
  if (!date || date.length !== 8) return null;

  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  try {
    const isoDate = new Date(`${year}-${month}-${day}`);
    return isoDate.toISOString();
  } catch {
    return null;
  }
}

/**
 * Formata CEP removendo não-dígitos
 */
export function normalizeCep(cep: number | string): string {
  return String(cep).replace(/\D/g, '').padStart(8, '0');
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCep(cep: number | string): string {
  const normalized = normalizeCep(cep);

  if (normalized.length !== 8) {
    return String(cep);
  }

  return normalized.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

/**
 * Cria chave de cache para CNPJ
 */
export function getCacheKey(cnpj: string): string {
  return `cnpj_${normalizeCnpj(cnpj)}`;
}

/**
 * Calcula data de expiração do cache
 */
export function getCacheExpiration(ttlDays: number = 30): Date {
  const now = new Date();
  now.setDate(now.getDate() + ttlDays);
  return now;
}

/**
 * Verifica se cache expirou
 */
export function isCacheExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
