import { z } from 'zod';
import { eq, inArray, and, isNotNull, sql, desc, ne } from 'drizzle-orm';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, leads, concorrentes } from '../../drizzle/schema';

/**
 * Router para Drill-Down de Produtos
 *
 * Estrutura de 3 níveis:
 * 1. Categorias de produtos (agregado)
 * 2. Produtos por categoria (agregado)
 * 3. Detalhes (clientes/leads/concorrentes por produto)
 */
export const productDrillDownRouter = router({
  /**
   * NÍVEL 1: Obter categorias de produtos
   *
   * Retorna lista de categorias com contagem de clientes, leads e concorrentes
   * Performance: ~0.2s
   */
  getCategories: publicProcedure
    .input(
      z.object({
        pesquisaIds: z.array(z.number()),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { pesquisaIds } = input;

      if (pesquisaIds.length === 0) {
        return { categories: [] };
      }

      // Nota: Como não temos campo "categoria" para produtos no schema atual,
      // vamos usar uma categorização simplificada baseada no nome do produto
      // ou retornar "Produtos" como categoria única

      // Por enquanto, retornar categoria única "Produtos"
      // TODO: Implementar categorização inteligente baseada em palavras-chave

      // Buscar registros e contar no JavaScript (mais robusto)
      console.log('🔍 [DEBUG] getCategories (produtos) - pesquisaIds:', pesquisaIds);

      const [clientesResult, concorrentesResult] = await Promise.all([
        // Buscar clientes com produtos
        db
          .select({ id: clientes.id })
          .from(clientes)
          .where(and(inArray(clientes.pesquisaId, pesquisaIds), ne(clientes.produto, null))),

        // Buscar concorrentes com produtos
        db
          .select({ id: concorrentes.id })
          .from(concorrentes)
          .where(
            and(inArray(concorrentes.pesquisaId, pesquisaIds), ne(concorrentes.produto, null))
          ),
      ]);

      // Contar no JavaScript (mais confiável que SQL)
      console.log('📊 [DEBUG] Resultados (produtos):', {
        clientesCount: clientesResult.length,
        concorrentesCount: concorrentesResult.length,
      });

      const clientesCount = clientesResult.length;
      const leadsCount = 0; // Leads não têm campo produto no schema atual
      const concorrentesCount = concorrentesResult.length;

      const categories = [
        {
          categoria: 'Produtos',
          clientes: clientesCount,
          leads: leadsCount,
          concorrentes: concorrentesCount,
          total: clientesCount + leadsCount + concorrentesCount,
        },
      ];

      return { categories };
    }),

  /**
   * NÍVEL 2: Obter produtos de uma categoria
   *
   * Retorna lista de produtos com contagem de clientes, leads e concorrentes
   * Performance: ~0.3s
   */
  getProducts: publicProcedure
    .input(
      z.object({
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Buscar produtos únicos de clientes
      const clientesProdutos = await db
        .select({
          produto: clientes.produto,
          count: sql<number>`COUNT(DISTINCT ${clientes.id})::INTEGER`,
        })
        .from(clientes)
        .where(and(inArray(clientes.pesquisaId, pesquisaIds), isNotNull(clientes.produto)))
        .groupBy(clientes.produto);

      // Buscar produtos únicos de concorrentes
      const concorrentesProdutos = await db
        .select({
          produto: concorrentes.produto,
          count: sql<number>`COUNT(DISTINCT ${concorrentes.id})::INTEGER`,
        })
        .from(concorrentes)
        .where(and(inArray(concorrentes.pesquisaId, pesquisaIds), isNotNull(concorrentes.produto)))
        .groupBy(concorrentes.produto);

      // Combinar e agregar
      const produtosMap = new Map<
        string,
        { clientes: number; leads: number; concorrentes: number }
      >();

      clientesProdutos.forEach((row) => {
        if (row.produto) {
          produtosMap.set(row.produto, {
            clientes: row.count,
            leads: 0,
            concorrentes: 0,
          });
        }
      });

      concorrentesProdutos.forEach((row) => {
        if (row.produto) {
          const existing = produtosMap.get(row.produto);
          if (existing) {
            existing.concorrentes = row.count;
          } else {
            produtosMap.set(row.produto, {
              clientes: 0,
              leads: 0,
              concorrentes: row.count,
            });
          }
        }
      });

      // Converter para array e ordenar
      const produtos = Array.from(produtosMap.entries()).map(([nome, counts]) => ({
        nome,
        ...counts,
      }));

      // Ordenar por clientes (desc)
      produtos.sort((a, b) => b.clientes - a.clientes);

      // Aplicar paginação
      const total = produtos.length;
      const items = produtos.slice(offset, offset + limit);

      return { items, total };
    }),

  /**
   * NÍVEL 3A: Obter clientes de um produto
   *
   * Retorna lista de clientes que têm o produto específico
   * Performance: ~0.2s
   */
  getClientesByProduct: publicProcedure
    .input(
      z.object({
        produtoNome: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { produtoNome, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(clientes)
        .where(and(eq(clientes.produto, produtoNome), inArray(clientes.pesquisaId, pesquisaIds)));

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: clientes.id,
          nome: clientes.nome,
          setor: clientes.setor,
          cidade: clientes.cidade,
          uf: clientes.uf,
          qualidadeClassificacao: clientes.qualidadeClassificacao,
          qualidadeScore: clientes.qualidadeScore,
          telefone: clientes.telefone,
          email: clientes.email,
          siteOficial: clientes.siteOficial,
        })
        .from(clientes)
        .where(and(eq(clientes.produto, produtoNome), inArray(clientes.pesquisaId, pesquisaIds)))
        .orderBy(desc(clientes.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),

  /**
   * NÍVEL 3B: Obter leads de um produto
   *
   * Nota: Leads não têm campo produto no schema atual
   * Retorna array vazio por enquanto
   */
  getLeadsByProduct: publicProcedure
    .input(
      z.object({
        produtoNome: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // Leads não têm campo produto no schema atual
      return { items: [], total: 0 };
    }),

  /**
   * NÍVEL 3C: Obter concorrentes de um produto
   *
   * Retorna lista de concorrentes que têm o produto específico
   * Performance: ~0.2s
   */
  getConcorrentesByProduct: publicProcedure
    .input(
      z.object({
        produtoNome: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { produtoNome, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(concorrentes)
        .where(
          and(eq(concorrentes.produto, produtoNome), inArray(concorrentes.pesquisaId, pesquisaIds))
        );

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: concorrentes.id,
          nome: concorrentes.nome,
          setor: concorrentes.setor,
          cidade: concorrentes.cidade,
          uf: concorrentes.uf,
          porte: concorrentes.porte,
          faturamentoEstimado: concorrentes.faturamentoEstimado,
          qualidadeScore: concorrentes.qualidadeScore,
          qualidadeClassificacao: concorrentes.qualidadeClassificacao,
        })
        .from(concorrentes)
        .where(
          and(eq(concorrentes.produto, produtoNome), inArray(concorrentes.pesquisaId, pesquisaIds))
        )
        .orderBy(desc(concorrentes.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),
});
