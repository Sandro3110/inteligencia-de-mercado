import { Database } from '@/server/db';
import {
  mercadosUnicos,
  clientesMercados,
  produtos,
  concorrentes,
  leads,
  clientes,
} from '@/drizzle/schema';
import { eq, sql, and } from 'drizzle-orm';

export interface MercadoData {
  nome: string;
  categoria: string;
  tamanhoEstimado: string;
  potencial: string;
  segmentacao: string;
  clientesCount: number;
  produtosCount: number;
  concorrentesCount: number;
  leadsCount: number;
}

/**
 * Busca todos os mercados com estatísticas
 */
export async function fetchMercados(db: Database, pesquisaId: number): Promise<MercadoData[]> {
  try {
    // Buscar todos os mercados únicos da pesquisa
    const mercadosResult = await db
      .select({
        id: mercadosUnicos.id,
        nome: mercadosUnicos.nome,
        categoria: mercadosUnicos.categoria,
        tamanhoEstimado: mercadosUnicos.tamanhoEstimado,
        potencial: mercadosUnicos.potencial,
        segmentacao: mercadosUnicos.segmentacao,
      })
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.pesquisaId, pesquisaId));

    if (!mercadosResult || !Array.isArray(mercadosResult)) {
      console.warn('[fetchMercados] Query retornou resultado inválido');
      return [];
    }

    // Para cada mercado, buscar estatísticas
    const mercadosComStats: MercadoData[] = [];

    for (const mercado of mercadosResult) {
      // Validar mercado
      if (!mercado || typeof mercado.id !== 'number') {
        console.warn('[fetchMercados] Mercado inválido, pulando:', mercado);
        continue;
      }

      // Contar clientes neste mercado
      let clientesCount = 0;
      try {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(clientesMercados)
          .innerJoin(clientes, eq(clientesMercados.clienteId, clientes.id))
          .where(
            and(eq(clientesMercados.mercadoId, mercado.id), eq(clientes.pesquisaId, pesquisaId))
          );
        clientesCount = Number(result?.[0]?.count ?? 0);
      } catch (err) {
        console.error('[fetchMercados] Erro ao contar clientes:', err);
      }

      // Contar produtos neste mercado
      let produtosCount = 0;
      try {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(produtos)
          .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
          .where(and(eq(produtos.mercadoId, mercado.id), eq(clientes.pesquisaId, pesquisaId)));
        produtosCount = Number(result?.[0]?.count ?? 0);
      } catch (err) {
        console.error('[fetchMercados] Erro ao contar produtos:', err);
      }

      // Contar concorrentes neste mercado
      let concorrentesCount = 0;
      try {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(concorrentes)
          .where(eq(concorrentes.mercadoId, mercado.id));
        concorrentesCount = Number(result?.[0]?.count ?? 0);
      } catch (err) {
        console.error('[fetchMercados] Erro ao contar concorrentes:', err);
      }

      // Contar leads neste mercado
      let leadsCount = 0;
      try {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(leads)
          .where(eq(leads.mercadoId, mercado.id));
        leadsCount = Number(result?.[0]?.count ?? 0);
      } catch (err) {
        console.error('[fetchMercados] Erro ao contar leads:', err);
      }

      mercadosComStats.push({
        nome: mercado.nome ?? 'Sem nome',
        categoria: mercado.categoria ?? 'Não especificado',
        tamanhoEstimado: mercado.tamanhoEstimado ?? 'Não estimado',
        potencial: mercado.potencial ?? 'Médio',
        segmentacao: mercado.segmentacao ?? 'Não especificado',
        clientesCount,
        produtosCount,
        concorrentesCount,
        leadsCount,
      });
    }

    return mercadosComStats;
  } catch (error) {
    console.error('[fetchMercados] Erro fatal:', error);
    return [];
  }
}
