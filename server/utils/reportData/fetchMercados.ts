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

  // Para cada mercado, buscar estatísticas
  const mercadosComStats: MercadoData[] = [];

  for (const mercado of mercadosResult || []) {
    // Verificar se mercado tem ID válido
    if (!mercado || !mercado.id) {
      console.warn('[fetchMercados] Mercado sem ID válido, pulando:', mercado);
      continue;
    }

    // Contar clientes neste mercado
    let clientesCount = 0;
    try {
      const clientesCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(clientesMercados)
        .innerJoin(clientes, eq(clientesMercados.clienteId, clientes.id))
        .where(
          and(eq(clientesMercados.mercadoId, mercado.id), eq(clientes.pesquisaId, pesquisaId))
        );
      clientesCount = Number(clientesCountResult[0]?.count || 0);
    } catch (err) {
      console.error('[fetchMercados] Error counting clientes for mercado', mercado.id, err);
    }

    // Contar produtos neste mercado
    let produtosCount = 0;
    try {
      const produtosCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(produtos)
        .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
        .where(and(eq(produtos.mercadoId, mercado.id), eq(clientes.pesquisaId, pesquisaId)));
      produtosCount = Number(produtosCountResult[0]?.count || 0);
    } catch (err) {
      console.error('[fetchMercados] Error counting produtos for mercado', mercado.id, err);
    }

    // Contar concorrentes neste mercado
    let concorrentesCount = 0;
    try {
      const concorrentesCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(concorrentes)
        .where(eq(concorrentes.mercadoId, mercado.id));
      concorrentesCount = Number(concorrentesCountResult[0]?.count || 0);
    } catch (err) {
      console.error('[fetchMercados] Error counting concorrentes for mercado', mercado.id, err);
    }

    // Contar leads neste mercado
    let leadsCount = 0;
    try {
      const leadsCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.mercadoId, mercado.id));
      leadsCount = Number(leadsCountResult[0]?.count || 0);
    } catch (err) {
      console.error('[fetchMercados] Error counting leads for mercado', mercado.id, err);
    }

    mercadosComStats.push({
      nome: mercado.nome,
      categoria: mercado.categoria || 'Não especificado',
      tamanhoEstimado: mercado.tamanhoEstimado || 'Não estimado',
      potencial: mercado.potencial || 'Médio',
      segmentacao: mercado.segmentacao || 'Não especificado',
      clientesCount,
      produtosCount,
      concorrentesCount,
      leadsCount,
    });
  }

  return mercadosComStats;
}
