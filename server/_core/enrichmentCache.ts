/**
 * Sistema de Cache de Enriquecimento
 * Armazena dados enriquecidos para evitar chamadas repetidas às APIs
 */

import { eq } from 'drizzle-orm';
import { enrichmentCache, type EnrichmentCache } from '../../drizzle/schema';

const CACHE_TTL_DAYS = 30; // Dados expiram após 30 dias

/**
 * Verifica se há dados em cache para um CNPJ
 * Retorna null se não houver cache ou se estiver expirado
 */
export async function getCachedEnrichment(cnpj: string): Promise<any | null> {
  if (!cnpj || cnpj.length !== 14) return null;

  const { getDb } = await import('../db');
  const db = await getDb();
  if (!db) return null;

  try {
    const [cached] = await db
      .select()
      .from(enrichmentCache)
      .where(eq(enrichmentCache.cnpj, cnpj))
      .limit(1);

    if (!cached) {
      console.log(`[Cache] MISS para CNPJ ${cnpj}`);
      return null;
    }

    // Verificar se cache expirou
    const now = new Date();
    const cacheAge = now.getTime() - new Date(cached.dataAtualizacao).getTime();
    const cacheTTL = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000; // em milissegundos

    if (cacheAge > cacheTTL) {
      console.log(`[Cache] EXPIRED para CNPJ ${cnpj} (${Math.floor(cacheAge / (24 * 60 * 60 * 1000))} dias)`);
      return null;
    }

    console.log(`[Cache] HIT para CNPJ ${cnpj} (fonte: ${cached.fonte}, idade: ${Math.floor(cacheAge / (24 * 60 * 60 * 1000))} dias)`);
    
    return JSON.parse(cached.dadosJson);
  } catch (error) {
    console.error('[Cache] Erro ao buscar cache:', error);
    return null;
  }
}

/**
 * Armazena dados enriquecidos no cache
 */
export async function setCachedEnrichment(
  cnpj: string,
  dados: any,
  fonte: string = 'api'
): Promise<boolean> {
  if (!cnpj || cnpj.length !== 14) return false;

  const { getDb } = await import('../db');
  const db = await getDb();
  if (!db) return false;

  try {
    const dadosJson = JSON.stringify(dados);

    await db
      .insert(enrichmentCache)
      .values({
        cnpj,
        dadosJson,
        fonte,
        dataAtualizacao: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          dadosJson,
          fonte,
          dataAtualizacao: new Date(),
        },
      });

    console.log(`[Cache] SET para CNPJ ${cnpj} (fonte: ${fonte})`);
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao salvar cache:', error);
    return false;
  }
}

/**
 * Invalida cache de um CNPJ específico
 */
export async function invalidateCachedEnrichment(cnpj: string): Promise<boolean> {
  if (!cnpj || cnpj.length !== 14) return false;

  const { getDb } = await import('../db');
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(enrichmentCache).where(eq(enrichmentCache.cnpj, cnpj));
    console.log(`[Cache] INVALIDATED para CNPJ ${cnpj}`);
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao invalidar cache:', error);
    return false;
  }
}

/**
 * Retorna estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  const { getDb } = await import('../db');
  const db = await getDb();
  
  if (!db) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  try {
    const entries = await db.select().from(enrichmentCache);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const dates = entries.map(e => new Date(e.dataAtualizacao));
    
    return {
      totalEntries: entries.length,
      oldestEntry: new Date(Math.min(...dates.map(d => d.getTime()))),
      newestEntry: new Date(Math.max(...dates.map(d => d.getTime()))),
    };
  } catch (error) {
    console.error('[Cache] Erro ao obter estatísticas:', error);
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
}
