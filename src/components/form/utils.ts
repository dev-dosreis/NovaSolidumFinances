export function stripNonDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string) {
  const digits = stripNonDigits(value).slice(0, 11);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11),
  ].filter(Boolean);
  return parts.length > 3
    ? `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`
    : parts.join('.');
}

export function formatCnpj(value: string) {
  const digits = stripNonDigits(value).slice(0, 14);
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 5);
  const part3 = digits.slice(5, 8);
  const part4 = digits.slice(8, 12);
  const part5 = digits.slice(12, 14);
  let result = part1;
  if (part2) result += `.${part2}`;
  if (part3) result += `.${part3}`;
  if (part4) result += `/${part4}`;
  if (part5) result += `-${part5}`;
  return result;
}

export function formatCep(value: string) {
  const digits = stripNonDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhone(value: string) {
  const digits = stripNonDigits(value);
  if (!digits) return '';
  if (!digits.startsWith('55')) {
    return `+55${digits}`.slice(0, 14);
  }
  return `+${digits}`.slice(0, 14);
}

export function isValidCpf(value?: string) {
  const cpf = stripNonDigits(value || '');
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === Number(cpf[10]);
}

export function isValidCnpj(value?: string) {
  const cnpj = stripNonDigits(value || '');
  if (cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;
  const calcCheck = (base: string, factors: number[]) => {
    let sum = 0;
    factors.forEach((factor, index) => {
      sum += Number(base[index]) * factor;
    });
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const base = cnpj.slice(0, 12);
  const digit1 = calcCheck(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calcCheck(base + digit1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj.endsWith(`${digit1}${digit2}`);
}

export function isValidPhone(value?: string) {
  return /^\+55\d{10,11}$/.test(value || '');
}

export function isValidCep(value?: string) {
  return stripNonDigits(value || '').length === 8;
}
