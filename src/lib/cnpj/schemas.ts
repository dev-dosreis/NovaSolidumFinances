/**
 * CNPJ Lookup Module - Zod Schemas
 */

import { z } from 'zod';

export const cnpjSchema = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .transform((val) => val.replace(/\D/g, '')) // Remove não-dígitos
  .refine((val) => val.length === 14, 'CNPJ deve ter 14 dígitos')
  .refine((val) => {
    // Validação de dígito verificador
    const isValid = validateCnpjDv(val);
    return isValid;
  }, 'CNPJ inválido');

/**
 * Valida dígito verificador do CNPJ
 */
function validateCnpjDv(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;

  // CNPJs inválidos conhecidos (todos iguais)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const digits = cnpj.split('').map(Number);

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

export const cnpjLookupRequestSchema = z.object({
  cnpj: cnpjSchema,
});

export type CnpjLookupRequest = z.infer<typeof cnpjLookupRequestSchema>;
