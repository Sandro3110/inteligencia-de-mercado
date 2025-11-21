/**
 * Deduplication Module
 * Previne que a mesma empresa apareça em múltiplos níveis (cliente/concorrente/lead)
 */

import { normalizeCNPJ } from './receitaws';

/**
 * Normaliza nome de empresa para comparação
 * Remove acentos, pontuação, espaços extras e converte para minúsculas
 */
export function normalizeCompanyName(name: string): string {
  return name
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim()
    .toLowerCase();
}

/**
 * Calcula similaridade entre dois nomes usando Levenshtein distance
 * Retorna valor entre 0 (totalmente diferente) e 1 (idêntico)
 */
export function calculateSimilarity(name1: string, name2: string): number {
  const norm1 = normalizeCompanyName(name1);
  const norm2 = normalizeCompanyName(name2);
  
  if (norm1 === norm2) return 1;
  
  // Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= norm1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= norm2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= norm1.length; i++) {
    for (let j = 1; j <= norm2.length; j++) {
      const cost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[norm1.length][norm2.length];
  const maxLength = Math.max(norm1.length, norm2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Verifica se dois nomes são similares o suficiente para serem considerados duplicatas
 * Threshold padrão: 0.85 (85% de similaridade)
 */
export function areNamesSimilar(name1: string, name2: string, threshold = 0.85): boolean {
  const similarity = calculateSimilarity(name1, name2);
  return similarity >= threshold;
}

/**
 * Verifica se uma empresa já existe em uma lista
 * Compara por CNPJ (exato) ou nome (similaridade)
 */
export function isDuplicate(
  empresa: { nome: string; cnpj?: string },
  existingList: Array<{ nome: string; cnpj?: string }>,
  similarityThreshold = 0.85
): boolean {
  for (const existing of existingList) {
    // Verificação por CNPJ (mais confiável)
    if (empresa.cnpj && existing.cnpj) {
      const cnpj1 = normalizeCNPJ(empresa.cnpj);
      const cnpj2 = normalizeCNPJ(existing.cnpj);
      
      if (cnpj1 === cnpj2) {
        console.log(`[Dedup] CNPJ duplicado encontrado: ${empresa.nome} (${cnpj1})`);
        return true;
      }
    }
    
    // Verificação por nome (fallback)
    if (areNamesSimilar(empresa.nome, existing.nome, similarityThreshold)) {
      console.log(`[Dedup] Nome similar encontrado: "${empresa.nome}" ≈ "${existing.nome}"`);
      return true;
    }
  }
  
  return false;
}

/**
 * Filtra lista removendo duplicatas em relação a múltiplas listas de referência
 */
export function filterDuplicates<T extends { nome: string; cnpj?: string }>(
  candidates: T[],
  ...referenceLists: Array<Array<{ nome: string; cnpj?: string }>>
): T[] {
  const filtered: T[] = [];
  const allReferences = referenceLists.flat();
  
  for (const candidate of candidates) {
    // Verificar se é duplicata de alguma referência
    if (isDuplicate(candidate, allReferences)) {
      console.log(`[Dedup] Excluindo duplicata: ${candidate.nome}`);
      continue;
    }
    
    // Verificar se é duplicata dentro da própria lista filtrada
    if (isDuplicate(candidate, filtered)) {
      console.log(`[Dedup] Excluindo duplicata interna: ${candidate.nome}`);
      continue;
    }
    
    filtered.push(candidate);
  }
  
  const removedCount = candidates.length - filtered.length;
  if (removedCount > 0) {
    console.log(`[Dedup] ${removedCount} duplicatas removidas de ${candidates.length} candidatos`);
  }
  
  return filtered;
}
