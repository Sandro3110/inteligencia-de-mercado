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
  // Total de concorrentes
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(concorrentes)
    .innerJoin(mercadosUnicos, eq(concorrentes.mercadoId, mercadosUnicos.id))
    .where(eq(mercadosUnicos.pesquisaId, pesquisaId));
  const total = Number(totalResult[0]?.count || 0);

  // Distribuição por mercado
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

  const porMercado: Record<string, number> = {};
  for (const row of porMercadoResult) {
    if (row.mercado && row.mercado.trim() !== '') {
      porMercado[row.mercado] = Number(row.count);
    }
  }

  // Top 50 concorrentes
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

  const topConcorrentes = topConcorrentesResult.map((row) => ({
    nome: row.nome || 'Sem nome',
    mercado: row.mercado || 'Desconhecido',
    porte: row.porte || 'Não especificado',
  }));

  return {
    total,
    porMercado,
    topConcorrentes,
  };
}
