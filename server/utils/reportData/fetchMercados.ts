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
    const clientesCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientesMercados)
      .innerJoin(clientes, eq(clientesMercados.clienteId, clientes.id))
      .where(and(eq(clientesMercados.mercadoId, mercado.id), eq(clientes.pesquisaId, pesquisaId)));
    const clientesCount = Number(clientesCountResult[0]?.count || 0);

    // Contar produtos neste mercado
    const produtosCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(produtos)
      .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
      .where(and(eq(produtos.mercadoId, mercado.id), eq(clientes.pesquisaId, pesquisaId)));
    const produtosCount = Number(produtosCountResult[0]?.count || 0);

    // Contar concorrentes neste mercado
    const concorrentesCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.mercadoId, mercado.id));
    const concorrentesCount = Number(concorrentesCountResult[0]?.count || 0);

    // Contar leads neste mercado
    const leadsCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.mercadoId, mercado.id));
    const leadsCount = Number(leadsCountResult[0]?.count || 0);

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
