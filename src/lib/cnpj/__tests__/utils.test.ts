/**
 * CNPJ Utils - Unit Tests
 * Para executar: npm test (ou vitest se configurado)
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeCnpj,
  formatCnpj,
  isValidCnpj,
  formatCep,
  normalizeCep,
} from '../utils';

describe('CNPJ Utils', () => {
  describe('normalizeCnpj', () => {
    it('should remove all non-digit characters', () => {
      expect(normalizeCnpj('00.000.000/0000-00')).toBe('00000000000000');
      expect(normalizeCnpj('11.222.333/0001-81')).toBe('11222333000181');
      expect(normalizeCnpj('abc123def456')).toBe('123456');
    });

    it('should handle empty string', () => {
      expect(normalizeCnpj('')).toBe('');
    });
  });

  describe('formatCnpj', () => {
    it('should format valid 14-digit CNPJ', () => {
      expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
      expect(formatCnpj('00000000000191')).toBe('00.000.000/0001-91');
    });

    it('should return original if not 14 digits', () => {
      expect(formatCnpj('123')).toBe('123');
      expect(formatCnpj('123456789012345')).toBe('123456789012345');
    });

    it('should format even with masks', () => {
      expect(formatCnpj('11.222.333/0001-81')).toBe('11.222.333/0001-81');
    });
  });

  describe('isValidCnpj', () => {
    it('should validate correct CNPJs', () => {
      // CNPJs válidos conhecidos
      expect(isValidCnpj('11222333000181')).toBe(true);
      expect(isValidCnpj('00000000000191')).toBe(true);
      expect(isValidCnpj('11.444.777/0001-61')).toBe(true);
    });

    it('should reject invalid CNPJs', () => {
      expect(isValidCnpj('11222333000180')).toBe(false); // DV errado
      expect(isValidCnpj('00000000000000')).toBe(false); // Todos iguais
      expect(isValidCnpj('11111111111111')).toBe(false); // Todos iguais
      expect(isValidCnpj('123')).toBe(false); // Tamanho errado
    });

    it('should handle formatted CNPJs', () => {
      expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
      expect(isValidCnpj('11.222.333/0001-80')).toBe(false);
    });

    it('should reject empty or invalid input', () => {
      expect(isValidCnpj('')).toBe(false);
      expect(isValidCnpj('abc')).toBe(false);
    });
  });

  describe('formatCep', () => {
    it('should format valid 8-digit CEP', () => {
      expect(formatCep('01310100')).toBe('01310-100');
      expect(formatCep(1310100)).toBe('01310-100');
    });

    it('should return original if not 8 digits', () => {
      expect(formatCep('123')).toBe('123');
    });
  });

  describe('normalizeCep', () => {
    it('should normalize CEP to 8 digits', () => {
      expect(normalizeCep('01310-100')).toBe('01310100');
      expect(normalizeCep(1310100)).toBe('01310100');
      expect(normalizeCep('1310100')).toBe('01310100');
    });
  });
});
