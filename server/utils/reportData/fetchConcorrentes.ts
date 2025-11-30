import { Database } from '@/server/db';
import { concorrentes, mercadosUnicos } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export interface ConcorrenteData {
  nome: string;
  mercado: string;
  porte: string;
}

export interface ConcorrentesData {
  total: number;
  porMercado: Record<string, number>;
  topConcorrentes: ConcorrenteData[];
}

/**
 * Busca dados completos de concorrentes
 */
export async function fetchConcorrentes(
  db: Database,
  pesquisaId: number
): Promise<ConcorrentesData> {
  try {
    // Total de concorrentes
    let total = 0;
    try {
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(concorrentes)
        .innerJoin(mercadosUnicos, eq(concorrentes.mercadoId, mercadosUnicos.id))
        .where(eq(mercadosUnicos.pesquisaId, pesquisaId));
      total = Number(totalResult?.[0]?.count ?? 0);
    } catch (err) {
      console.error('[fetchConcorrentes] Erro ao contar total:', err);
    }

    // Distribuição por mercado
    const porMercado: Record<string, number> = {};
    try {
      const porMercadoResult = await db
        .select({
          mercado: mercadosUnicos.nome,
          count: sql<number>`count(*)`,
        })
        .from(concorrentes)
        .innerJoin(mercadosUnicos, eq(concorrentes.mercadoId, mercadosUnicos.id))
        .where(eq(mercadosUnicos.pesquisaId, pesquisaId))
        .groupBy(mercadosUnicos.nome)
        .orderBy(sql`count(*) DESC`);

      if (Array.isArray(porMercadoResult)) {
        for (const row of porMercadoResult) {
          const mercado = row?.mercado;
          if (mercado && typeof mercado === 'string' && mercado.trim().length > 0) {
            porMercado[mercado] = Number(row.count ?? 0);
          }
        }
      }
    } catch (err) {
      console.error('[fetchConcorrentes] Erro ao buscar por mercado:', err);
    }

    // Top 50 concorrentes
    let topConcorrentes: ConcorrenteData[] = [];
    try {
      const topConcorrentesResult = await db
        .select({
          nome: concorrentes.nome,
          mercado: mercadosUnicos.nome,
          porte: concorrentes.porte,
        })
        .from(concorrentes)
        .innerJoin(mercadosUnicos, eq(concorrentes.mercadoId, mercadosUnicos.id))
        .where(eq(mercadosUnicos.pesquisaId, pesquisaId))
        .limit(50);

      if (Array.isArray(topConcorrentesResult)) {
        topConcorrentes = topConcorrentesResult.map((row) => ({
          nome: row?.nome ?? 'Sem nome',
          mercado: row?.mercado ?? 'Desconhecido',
          porte: row?.porte ?? 'Não especificado',
        }));
      }
    } catch (err) {
      console.error('[fetchConcorrentes] Erro ao buscar top concorrentes:', err);
    }

    return {
      total,
      porMercado,
      topConcorrentes,
    };
  } catch (error) {
    console.error('[fetchConcorrentes] Erro fatal:', error);
    return {
      total: 0,
      porMercado: {},
      topConcorrentes: [],
    };
  }
}
