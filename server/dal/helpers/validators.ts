/**
 * Helpers para validações
 */

/**
 * Limpar CNPJ (remover pontuação)
 */
export function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, '');
}

/**
 * Validar CNPJ (formato e dígitos verificadores)
 */
export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = limparCNPJ(cnpj);

  if (cnpjLimpo.length !== 14) {
    return false;
  }

  // Validação básica (todos iguais)
  if (/^(\d)\1+$/.test(cnpjLimpo)) {
    return false;
  }

  // Validar dígitos verificadores
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    return false;
  }

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Formatar CNPJ (12.345.678/0001-90)
 */
export function formatarCNPJ(cnpj: string): string {
  const cnpjLimpo = limparCNPJ(cnpj);

  if (cnpjLimpo.length !== 14) {
    return cnpj;
  }

  return cnpjLimpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Validar email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validar telefone brasileiro
 */
export function validarTelefone(telefone: string): boolean {
  const telefoneLimpo = telefone.replace(/\D/g, '');

  // Aceitar 10 ou 11 dígitos (com ou sem 9 no celular)
  if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
    return false;
  }

  // DDD válido (11-99)
  const ddd = parseInt(telefoneLimpo.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  return true;
}

/**
 * Validar URL
 */
export function validarURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar status (enum)
 */
export function validarStatus(status: string, allowedValues: string[]): boolean {
  return allowedValues.includes(status);
}

/**
 * Validar UF (2 letras maiúsculas)
 */
export function validarUF(uf: string): boolean {
  const ufsValidas = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  return ufsValidas.includes(uf.toUpperCase());
}

/**
 * Validar score (0-100)
 */
export function validarScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

/**
 * Limpar e validar CNAE
 */
export function validarCNAE(cnae: string): boolean {
  const cnaeLimpo = cnae.replace(/[^\d]/g, '');

  // CNAE tem 7 dígitos
  return cnaeLimpo.length === 7;
}

/**
 * Normalizar nome (trim, lowercase, remover espaços extras)
 */
export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, ' ').toLowerCase();
}
