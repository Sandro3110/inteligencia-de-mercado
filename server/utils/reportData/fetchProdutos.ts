import { Database } from '@/server/db';
import { produtos, clientes, mercadosUnicos } from '@/drizzle/schema';
import { eq, sql, and } from 'drizzle-orm';

export interface ProdutoData {
  nome: string;
  categoria: string;
  count: number;
  mercados: string[];
}

/**
 * Busca todos os produtos com contagem e mercados
 */
export async function fetchProdutos(db: Database, pesquisaId: number): Promise<ProdutoData[]> {
  // Buscar produtos agrupados por nome
  const produtosResult = await db
    .select({
      nome: produtos.nome,
      categoria: produtos.categoria,
      count: sql<number>`count(*)`,
    })
    .from(produtos)
    .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
    .where(eq(clientes.pesquisaId, pesquisaId))
    .groupBy(produtos.nome, produtos.categoria)
    .orderBy(sql`count(*) DESC`);

  // Para cada produto, buscar mercados associados
  const produtosComMercados: ProdutoData[] = [];

  for (const produto of produtosResult) {
    // Buscar mercados deste produto
    const mercadosResult = await db
      .selectDistinct({
        mercadoNome: mercadosUnicos.nome,
      })
      .from(produtos)
      .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
      .innerJoin(mercadosUnicos, eq(produtos.mercadoId, mercadosUnicos.id))
      .where(and(eq(produtos.nome, produto.nome), eq(clientes.pesquisaId, pesquisaId)))
      .limit(5); // Limitar a 5 mercados por produto

    produtosComMercados.push({
      nome: produto.nome || 'Sem nome',
      categoria: produto.categoria || 'Não especificado',
      count: Number(produto.count || 0),
      mercados: mercadosResult.map((m) => m.mercadoNome || 'Desconhecido').filter(Boolean),
    });
  }

  return produtosComMercados;
}
