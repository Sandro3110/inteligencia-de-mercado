import { z } from 'zod';
import { eq, inArray, and, isNotNull, sql, desc } from 'drizzle-orm';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, concorrentes, produtos } from '../../drizzle/schema';

/**
 * Router para Drill-Down de Produtos (VERSÃO CORRIGIDA COM JOINS)
 *
 * Estrutura de 3 níveis:
 * 1. Categorias de produto (agregado)
 * 2. Produtos por categoria (agregado)
 * 3. Detalhes (clientes/concorrentes por produto)
 *
 * CORREÇÃO CRÍTICA:
 * - Usa JOIN com tabela produtos
 * - Não depende de campos TEXT vazios
 * - Dados reais: 2.726 produtos vinculados a clientes
 */
export const productDrillDownRouter = router({
  /**
   * NÍVEL 1: Obter categorias de produto
   *
   * Retorna lista de categorias com contagem de clientes e concorrentes
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

      // Buscar categorias de produtos com contagem de clientes
      const clientesResult = await db
        .select({
          categoria: produtos.categoria,
          count: sql<number>`COUNT(DISTINCT ${clientes.id})::INTEGER`,
        })
        .from(clientes)
        .innerJoin(produtos, eq(clientes.id, produtos.clienteId))
        .where(and(inArray(clientes.pesquisaId, pesquisaIds), isNotNull(produtos.categoria)))
        .groupBy(produtos.categoria);

      // Buscar concorrentes com produto (campo direto na tabela concorrentes)
      const concorrentesResult = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${concorrentes.id})::INTEGER`,
        })
        .from(concorrentes)
        .where(and(inArray(concorrentes.pesquisaId, pesquisaIds), isNotNull(concorrentes.produto)));

      // Agregar categorias
      const categoriaMap = new Map<string, { clientes: number; concorrentes: number }>();

      clientesResult.forEach((row) => {
        if (row.categoria) {
          categoriaMap.set(row.categoria, {
            clientes: row.count,
            concorrentes: 0,
          });
        }
      });

      const concorrentesCount = concorrentesResult[0]?.count || 0;

      // Converter para array
      const categories = Array.from(categoriaMap.entries()).map(([nome, counts]) => ({
        categoria: nome,
        clientes: counts.clientes,
        leads: 0, // Leads não têm campo produto no schema atual
        concorrentes: concorrentesCount,
        total: counts.clientes + concorrentesCount,
      }));

      return { categories };
    }),

  /**
   * NÍVEL 2: Obter produtos de uma categoria
   *
   * Retorna lista de produtos com contagem de clientes e concorrentes
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
      const { categoria, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Buscar produtos da categoria com contagem de clientes
      const produtosResult = await db
        .select({
          produtoId: produtos.id,
          produtoNome: produtos.nome,
          count: sql<number>`COUNT(DISTINCT ${clientes.id})::INTEGER`,
        })
        .from(clientes)
        .innerJoin(produtos, eq(clientes.id, produtos.clienteId))
        .where(and(inArray(clientes.pesquisaId, pesquisaIds), eq(produtos.categoria, categoria)))
        .groupBy(produtos.id, produtos.nome);

      // Buscar concorrentes com produto (campo TEXT, difícil de agrupar por produto específico)
      // Por enquanto, retornar contagem total de concorrentes com produto
      const concorrentesResult = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${concorrentes.id})::INTEGER`,
        })
        .from(concorrentes)
        .where(and(inArray(concorrentes.pesquisaId, pesquisaIds), isNotNull(concorrentes.produto)));

      const concorrentesCount = concorrentesResult[0]?.count || 0;

      // Converter para array
      const produtosArray = produtosResult.map((row) => ({
        nome: row.produtoNome,
        clientes: row.count,
        leads: 0,
        concorrentes: concorrentesCount,
      }));

      // Ordenar por total (desc)
      produtosArray.sort((a, b) => b.clientes - a.clientes);

      // Aplicar paginação
      const total = produtosArray.length;
      const items = produtosArray.slice(offset, offset + limit);

      return { items, total };
    }),

  /**
   * NÍVEL 3A: Obter clientes de um produto
   *
   * Retorna lista de clientes do produto específico
   */
  getClientesByProduct: publicProcedure
    .input(
      z.object({
        productName: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { productName, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${clientes.id})::INTEGER`,
        })
        .from(clientes)
        .innerJoin(produtos, eq(clientes.id, produtos.clienteId))
        .where(and(inArray(clientes.pesquisaId, pesquisaIds), eq(produtos.nome, productName)));

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: clientes.id,
          nome: clientes.nome,
          produto: produtos.nome,
          cidade: clientes.cidade,
          uf: clientes.uf,
          qualidadeClassificacao: clientes.qualidadeClassificacao,
          qualidadeScore: clientes.qualidadeScore,
          telefone: clientes.telefone,
          email: clientes.email,
          siteOficial: clientes.siteOficial,
        })
        .from(clientes)
        .innerJoin(produtos, eq(clientes.id, produtos.clienteId))
        .where(and(inArray(clientes.pesquisaId, pesquisaIds), eq(produtos.nome, productName)))
        .orderBy(desc(clientes.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),

  /**
   * NÍVEL 3B: Obter leads de um produto
   *
   * Leads não têm campo produto no schema atual
   * Retorna vazio por enquanto
   */
  getLeadsByProduct: publicProcedure
    .input(
      z.object({
        productName: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async () => {
      // Leads não têm campo produto no schema atual
      return { items: [], total: 0 };
    }),

  /**
   * NÍVEL 3C: Obter concorrentes de um produto
   *
   * Concorrentes têm campo produto como TEXT (difícil de filtrar exatamente)
   * Por enquanto, buscar por LIKE
   */
  getConcorrentesByProduct: publicProcedure
    .input(
      z.object({
        productName: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { productName, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total (usando ILIKE para busca parcial)
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(concorrentes)
        .where(
          and(
            inArray(concorrentes.pesquisaId, pesquisaIds),
            sql`${concorrentes.produto} ILIKE ${`%${productName}%`}`
          )
        );

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: concorrentes.id,
          nome: concorrentes.nome,
          produto: concorrentes.produto,
          cidade: concorrentes.cidade,
          uf: concorrentes.uf,
          porte: concorrentes.porte,
          faturamentoEstimado: concorrentes.faturamentoEstimado,
          qualidadeScore: concorrentes.qualidadeScore,
          qualidadeClassificacao: concorrentes.qualidadeClassificacao,
        })
        .from(concorrentes)
        .where(
          and(
            inArray(concorrentes.pesquisaId, pesquisaIds),
            sql`${concorrentes.produto} ILIKE ${`%${productName}%`}`
          )
        )
        .orderBy(desc(concorrentes.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),
});
