/**
 * Helpers para geração de hashes únicos
 */

import { createHash } from 'crypto';

/**
 * Gerar hash MD5 de uma string
 */
export function gerarHashMD5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

/**
 * Gerar hash único para entidade
 * - Se tem CNPJ: MD5(cnpj)
 * - Se não tem CNPJ: MD5(nome normalizado)
 */
export function gerarHashEntidade(input: { cnpj?: string; nome: string }): string {
  if (input.cnpj) {
    const cnpjLimpo = input.cnpj.replace(/[^\d]/g, '');
    return gerarHashMD5(cnpjLimpo);
  }

  const nomeNormalizado = input.nome.toLowerCase().trim();
  return gerarHashMD5(nomeNormalizado);
}

/**
 * Gerar hash único para mercado
 * MD5(nome + categoria)
 */
export function gerarHashMercado(nome: string, categoria: string): string {
  const nomeNormalizado = nome.toLowerCase().trim();
  const categoriaNormalizada = categoria.toLowerCase().trim();
  const chave = `${nomeNormalizado}|${categoriaNormalizada}`;

  return gerarHashMD5(chave);
}

/**
 * Gerar hash único para produto
 * MD5(nome + categoria)
 */
export function gerarHashProduto(nome: string, categoria: string): string {
  const nomeNormalizado = nome.toLowerCase().trim();
  const categoriaNormalizada = categoria.toLowerCase().trim();
  const chave = `${nomeNormalizado}|${categoriaNormalizada}`;

  return gerarHashMD5(chave);
}

/**
 * Normalizar string (remover acentos, lowercase, trim)
 */
export function normalizarString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
