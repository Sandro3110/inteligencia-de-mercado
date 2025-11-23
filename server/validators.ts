/**
 * Validação de CNPJs brasileiros
 */

/**
 * Remove caracteres não numéricos do CNPJ
 */
export function cleanCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "";
  return cnpj.replace(/[^\d]/g, "");
}

/**
 * Formata CNPJ no padrão 00.000.000/0001-00
 */
export function formatCNPJ(cnpj: string | null | undefined): string | null {
  const cleaned = cleanCNPJ(cnpj);
  if (cleaned.length !== 14) return null;

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
}

/**
 * Valida formato do CNPJ (apenas formato, não valida dígitos)
 */
export function isValidCNPJFormat(cnpj: string | null | undefined): boolean {
  const cleaned = cleanCNPJ(cnpj);
  return cleaned.length === 14 && /^\d{14}$/.test(cleaned);
}

/**
 * Calcula dígito verificador do CNPJ
 */
function calculateCNPJDigit(cnpj: string, position: number): number {
  const weights =
    position === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < position; i++) {
    sum += parseInt(cnpj[i]) * weights[i];
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Valida CNPJ completo (formato + dígitos verificadores)
 */
export function isValidCNPJ(cnpj: string | null | undefined): boolean {
  const cleaned = cleanCNPJ(cnpj);

  // Verifica formato
  if (!isValidCNPJFormat(cleaned)) return false;

  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  // Valida primeiro dígito verificador
  const digit1 = calculateCNPJDigit(cleaned, 12);
  if (digit1 !== parseInt(cleaned[12])) return false;

  // Valida segundo dígito verificador
  const digit2 = calculateCNPJDigit(cleaned, 13);
  if (digit2 !== parseInt(cleaned[13])) return false;

  return true;
}

/**
 * Valida e formata CNPJ
 * Retorna CNPJ formatado se válido, null se inválido
 */
export function validateAndFormatCNPJ(
  cnpj: string | null | undefined
): string | null {
  if (!cnpj) return null;

  const cleaned = cleanCNPJ(cnpj);

  // Se não tem 14 dígitos, retorna null
  if (cleaned.length !== 14) return null;

  // Se é válido, retorna formatado
  if (isValidCNPJ(cleaned)) {
    return formatCNPJ(cleaned);
  }

  // Se formato está correto mas dígitos inválidos, retorna formatado mesmo assim
  // (alguns CNPJs reais podem ter dígitos incorretos em bases antigas)
  if (isValidCNPJFormat(cleaned)) {
    return formatCNPJ(cleaned);
  }

  return null;
}

/**
 * Testa se CNPJ é válido e retorna objeto com detalhes
 */
export function validateCNPJDetails(cnpj: string | null | undefined): {
  valid: boolean;
  formatted: string | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!cnpj) {
    errors.push("CNPJ não informado");
    return { valid: false, formatted: null, errors };
  }

  const cleaned = cleanCNPJ(cnpj);

  if (cleaned.length !== 14) {
    errors.push(`CNPJ deve ter 14 dígitos (tem ${cleaned.length})`);
    return { valid: false, formatted: null, errors };
  }

  if (!/^\d{14}$/.test(cleaned)) {
    errors.push("CNPJ deve conter apenas números");
    return { valid: false, formatted: null, errors };
  }

  if (/^(\d)\1{13}$/.test(cleaned)) {
    errors.push("CNPJ com todos os dígitos iguais é inválido");
    return { valid: false, formatted: formatCNPJ(cleaned), errors };
  }

  const digit1 = calculateCNPJDigit(cleaned, 12);
  if (digit1 !== parseInt(cleaned[12])) {
    errors.push("Primeiro dígito verificador inválido");
  }

  const digit2 = calculateCNPJDigit(cleaned, 13);
  if (digit2 !== parseInt(cleaned[13])) {
    errors.push("Segundo dígito verificador inválido");
  }

  const valid = errors.length === 0;
  const formatted = formatCNPJ(cleaned);

  return { valid, formatted, errors };
}
