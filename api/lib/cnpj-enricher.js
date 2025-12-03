// Módulo para enriquecimento automático de CNPJs
// Usa estratégia híbrida: ReceitaWS -> BrasilAPI -> validação

const cache = new Map(); // Cache em memória

// Normalizar nome para busca
function normalizarNome(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim();
}

// Validar formato de CNPJ
function validarCNPJ(cnpj) {
  if (!cnpj) return false;
  
  // Remove formatação
  const numeros = cnpj.replace(/[^\d]/g, '');
  
  // Deve ter 14 dígitos
  if (numeros.length !== 14) return false;
  
  // Não pode ser sequência repetida
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Validar dígitos verificadores
  const calcularDigito = (base) => {
    const pesos = base.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const soma = base.split('').reduce((acc, num, i) => acc + parseInt(num) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  
  const base = numeros.slice(0, 12);
  const digito1 = calcularDigito(base);
  const digito2 = calcularDigito(base + digito1);
  
  return numeros === base + digito1 + digito2;
}

// Função principal de enriquecimento
// NOTA: APIs públicas brasileiras não têm busca reversa (nome -> CNPJ)
// Esta função apenas valida CNPJs existentes
export async function enriquecerCNPJ(nome, cnpjAtual = null) {
  // Se já tem CNPJ válido, retornar formatado
  if (cnpjAtual && validarCNPJ(cnpjAtual)) {
    const numeros = cnpjAtual.replace(/[^\d]/g, '');
    return `${numeros.slice(0,2)}.${numeros.slice(2,5)}.${numeros.slice(5,8)}/${numeros.slice(8,12)}-${numeros.slice(12,14)}`;
  }
  
  // Não tem CNPJ ou CNPJ inválido
  // APIs públicas não permitem busca por nome
  return null;
}

// Limpar cache (útil para testes)
export function limparCache() {
  cache.clear();
}

// Obter estatísticas do cache
export function estatisticasCache() {
  return {
    tamanho: cache.size,
    entradas: Array.from(cache.entries()).map(([nome, cnpj]) => ({ nome, cnpj }))
  };
}
