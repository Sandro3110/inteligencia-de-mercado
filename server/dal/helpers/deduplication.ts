/**
 * Helpers para deduplicação e cálculo de similaridade
 */

/**
 * Calcular distância de Levenshtein entre duas strings
 */
export function calcularDistanciaLevenshtein(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Inicializar matriz
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Preencher matriz
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deleção
        matrix[i][j - 1] + 1, // Inserção
        matrix[i - 1][j - 1] + cost // Substituição
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calcular similaridade de Levenshtein (0-100)
 * 100 = idênticas, 0 = completamente diferentes
 */
export function calcularSimilaridadeLevenshtein(str1: string, str2: string): number {
  const distance = calcularDistanciaLevenshtein(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);

  if (maxLen === 0) {
    return 100;
  }

  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.round(similarity);
}

/**
 * Calcular similaridade entre duas entidades (0-100)
 * Considera: nome, CNPJ, email, telefone
 */
export function calcularSimilaridadeEntidades(
  e1: {
    nome: string;
    cnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
  },
  e2: {
    nome: string;
    cnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
  }
): number {
  let score = 0;
  let checks = 0;

  // Nome (peso 40%)
  if (e1.nome && e2.nome) {
    const simNome = calcularSimilaridadeLevenshtein(
      e1.nome.toLowerCase(),
      e2.nome.toLowerCase()
    );
    score += simNome * 0.4;
    checks++;
  }

  // CNPJ (peso 30%)
  if (e1.cnpj && e2.cnpj) {
    if (e1.cnpj === e2.cnpj) {
      score += 30;
    }
    checks++;
  }

  // Email (peso 15%)
  if (e1.email && e2.email) {
    if (e1.email.toLowerCase() === e2.email.toLowerCase()) {
      score += 15;
    }
    checks++;
  }

  // Telefone (peso 15%)
  if (e1.telefone && e2.telefone) {
    const tel1 = e1.telefone.replace(/\D/g, '');
    const tel2 = e2.telefone.replace(/\D/g, '');
    if (tel1 === tel2) {
      score += 15;
    }
    checks++;
  }

  return checks > 0 ? Math.round(score) : 0;
}

/**
 * Normalizar string para comparação
 * Remove acentos, lowercase, trim, remove espaços extras
 */
export function normalizarParaComparacao(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Calcular similaridade Jaccard entre dois conjuntos de palavras
 */
export function calcularSimilaridadeJaccard(str1: string, str2: string): number {
  const words1 = new Set(normalizarParaComparacao(str1).split(' '));
  const words2 = new Set(normalizarParaComparacao(str2).split(' '));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) {
    return 0;
  }

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Calcular similaridade combinada (Levenshtein + Jaccard)
 */
export function calcularSimilaridadeCombinada(str1: string, str2: string): number {
  const simLevenshtein = calcularSimilaridadeLevenshtein(str1, str2);
  const simJaccard = calcularSimilaridadeJaccard(str1, str2);

  // Média ponderada (70% Levenshtein, 30% Jaccard)
  return Math.round(simLevenshtein * 0.7 + simJaccard * 0.3);
}

/**
 * Verificar se duas entidades são duplicatas (> threshold)
 */
export function saoEntidadesDuplicadas(
  e1: {
    nome: string;
    cnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
  },
  e2: {
    nome: string;
    cnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
  },
  threshold = 60
): boolean {
  const similaridade = calcularSimilaridadeEntidades(e1, e2);
  return similaridade >= threshold;
}

/**
 * Extrair palavras-chave de um texto
 * Remove stopwords e palavras curtas
 */
export function extrairPalavrasChave(texto: string, minLength = 3): string[] {
  const stopwords = [
    'o',
    'a',
    'os',
    'as',
    'de',
    'do',
    'da',
    'dos',
    'das',
    'em',
    'no',
    'na',
    'nos',
    'nas',
    'por',
    'para',
    'com',
    'sem',
    'sob',
    'sobre',
    'e',
    'ou',
    'mas',
    'que',
    'se',
  ];

  const palavras = normalizarParaComparacao(texto)
    .split(' ')
    .filter((p) => p.length >= minLength && !stopwords.includes(p));

  return [...new Set(palavras)];
}
