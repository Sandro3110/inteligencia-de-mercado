import { Database } from '@/server/db';
import { produtos, clientes, mercadosUnicos } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export interface ProdutoData {
  nome: string;
  mercados: string[];
}

/**
 * Busca todos os produtos únicos com seus mercados
 */
export async function fetchProdutos(db: Database, pesquisaId: number): Promise<ProdutoData[]> {
  try {
    // Buscar produtos únicos da pesquisa
    const produtosResult = await db
      .selectDistinct({
        nome: produtos.nome,
      })
      .from(produtos)
      .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
      .where(eq(clientes.pesquisaId, pesquisaId))
      .limit(50);

    if (!Array.isArray(produtosResult)) {
      console.warn('[fetchProdutos] Query retornou resultado inválido');
      return [];
    }

    // Para cada produto, buscar mercados associados
    const produtosComMercados: ProdutoData[] = [];

    for (const produto of produtosResult) {
      if (!produto || !produto.nome) {
        console.warn('[fetchProdutos] Produto inválido, pulando:', produto);
        continue;
      }

      // Buscar mercados deste produto
      let mercados: string[] = [];
      try {
        const mercadosResult = await db
          .selectDistinct({
            mercadoNome: mercadosUnicos.nome,
          })
          .from(produtos)
          .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
          .innerJoin(mercadosUnicos, eq(produtos.mercadoId, mercadosUnicos.id))
          .where(eq(produtos.nome, produto.nome))
          .limit(5);

        if (Array.isArray(mercadosResult)) {
          mercados = mercadosResult
            .map((m) => m?.mercadoNome)
            .filter((nome): nome is string => typeof nome === 'string' && nome.length > 0);
        }
      } catch (err) {
        console.error('[fetchProdutos] Erro ao buscar mercados do produto:', err);
      }

      produtosComMercados.push({
        nome: produto.nome,
        mercados,
      });
    }

    return produtosComMercados;
  } catch (error) {
    console.error('[fetchProdutos] Erro fatal:', error);
    return [];
  }
}
