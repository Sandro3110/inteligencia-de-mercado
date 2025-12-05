import { requirePermission } from "../middleware/auth";
import { Permission } from "@shared/types/permissions";

import { z } from 'zod';
import { router } from './index';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// ============================================================================
// PRODUTO ROUTER - Copiado de entidade.ts (funcionando)
// ============================================================================

export const produtoRouter = router({
  /**
   * Listar produtos com filtros e paginação
   */
  list: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      search: z.string().optional(),
      categoria: z.string().optional(),
      subcategoria: z.string().optional(),
      sku: z.string().optional(),
      ean: z.string().optional(),
      ncm: z.string().optional(),
      precoMin: z.number().optional(),
      precoMax: z.number().optional(),
      ativo: z.boolean().optional(),
      ordenacao: z.object({
        campo: z.string(),
        direcao: z.enum(['ASC', 'DESC'])
      }).optional(),
      pagina: z.number().min(1).optional(),
      porPagina: z.number().min(1).max(100).optional()
    }))
    .query(async ({ input }) => {
      const {
        search,
        categoria,
        subcategoria,
        sku,
        ean,
        ncm,
        precoMin,
        precoMax,
        ativo,
        ordenacao,
        pagina = 1,
        porPagina = 20
      } = input;

      const offset = (pagina - 1) * porPagina;

      // Query principal - COPIADO DE ENTIDADE.TS
      let query = sql`
        SELECT 
          p.*
        FROM dim_produto_catalogo p
        WHERE p.deleted_at IS NULL
      `;

      // Filtros
      if (search) {
        query = sql`${query} AND (p.nome ILIKE ${'%' + search + '%'} OR p.descricao ILIKE ${'%' + search + '%'})`;
      }

      if (categoria) {
        query = sql`${query} AND p.categoria = ${categoria}`;
      }

      if (subcategoria) {
        query = sql`${query} AND p.subcategoria = ${subcategoria}`;
      }

      if (sku) {
        query = sql`${query} AND p.sku ILIKE ${'%' + sku + '%'}`;
      }

      if (ean) {
        query = sql`${query} AND p.ean = ${ean}`;
      }

      if (ncm) {
        query = sql`${query} AND p.ncm = ${ncm}`;
      }

      if (precoMin !== undefined) {
        query = sql`${query} AND p.preco >= ${precoMin}`;
      }

      if (precoMax !== undefined) {
        query = sql`${query} AND p.preco <= ${precoMax}`;
      }

      if (ativo !== undefined) {
        query = sql`${query} AND p.ativo = ${ativo}`;
      }

      // Ordenação
      if (ordenacao) {
        const campo = ordenacao.campo.includes('.') 
          ? ordenacao.campo 
          : `p.${ordenacao.campo}`;
        query = sql`${query} ORDER BY ${sql.raw(campo)} ${sql.raw(ordenacao.direcao)}`;
      } else {
        query = sql`${query} ORDER BY p.created_at DESC`;
      }

      query = sql`${query} LIMIT ${porPagina} OFFSET ${offset}`;

      const resultado = await db.execute(query);

      // Contar total - COPIADO DE ENTIDADE.TS
      let queryCount = sql`
        SELECT COUNT(*) as total
        FROM dim_produto_catalogo p
        WHERE p.deleted_at IS NULL
      `;

      if (search) {
        queryCount = sql`${queryCount} AND (p.nome ILIKE ${'%' + search + '%'} OR p.descricao ILIKE ${'%' + search + '%'})`;
      }

      if (categoria) {
        queryCount = sql`${queryCount} AND p.categoria = ${categoria}`;
      }

      if (subcategoria) {
        queryCount = sql`${queryCount} AND p.subcategoria = ${subcategoria}`;
      }

      if (sku) {
        queryCount = sql`${queryCount} AND p.sku ILIKE ${'%' + sku + '%'}`;
      }

      if (ean) {
        queryCount = sql`${queryCount} AND p.ean = ${ean}`;
      }

      if (ncm) {
        queryCount = sql`${queryCount} AND p.ncm = ${ncm}`;
      }

      if (precoMin !== undefined) {
        queryCount = sql`${queryCount} AND p.preco >= ${precoMin}`;
      }

      if (precoMax !== undefined) {
        queryCount = sql`${queryCount} AND p.preco <= ${precoMax}`;
      }

      if (ativo !== undefined) {
        queryCount = sql`${queryCount} AND p.ativo = ${ativo}`;
      }

      const resultadoCount = await db.execute(queryCount);
      const total = Number(resultadoCount.rows[0]?.total || 0);

      return {
        dados: resultado.rows,
        paginacao: {
          pagina,
          porPagina,
          total,
          totalPaginas: Math.ceil(total / porPagina)
        }
      };
    }),

  /**
   * Buscar produto por ID
   */
  getById: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      produtoId: z.number()
    }))
    .query(async ({ input }) => {
      const { produtoId } = input;

      const query = sql`
        SELECT p.*
        FROM dim_produto_catalogo p
        WHERE p.id = ${produtoId}
          AND p.deleted_at IS NULL
      `;

      const resultado = await db.execute(query);

      if (resultado.rows.length === 0) {
        throw new Error('Produto não encontrado');
      }

      return resultado.rows[0];
    }),

  /**
   * Listar categorias
   */
  getCategorias: requirePermission(Permission.ANALISE_READ)
    .query(async () => {
      const query = sql`
        SELECT DISTINCT categoria
        FROM dim_produto_catalogo
        WHERE deleted_at IS NULL
          AND categoria IS NOT NULL
        ORDER BY categoria
      `;

      const resultado = await db.execute(query);
      return resultado.rows.map((r: any) => r.categoria);
    }),

  /**
   * Listar subcategorias
   */
  getSubcategorias: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      categoria: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { categoria } = input;

      let query = sql`
        SELECT DISTINCT subcategoria
        FROM dim_produto_catalogo
        WHERE deleted_at IS NULL
          AND subcategoria IS NOT NULL
      `;

      if (categoria) {
        query = sql`${query} AND categoria = ${categoria}`;
      }

      query = sql`${query} ORDER BY subcategoria`;

      const resultado = await db.execute(query);
      return resultado.rows.map((r: any) => r.subcategoria);
    }),

  /**
   * Estatísticas gerais
   */
  getStats: requirePermission(Permission.ANALISE_READ)
    .query(async () => {
      const query = sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
          COUNT(CASE WHEN ativo = false THEN 1 END) as inativos,
          COUNT(DISTINCT categoria) as categorias,
          AVG(preco) as preco_medio,
          MIN(preco) as preco_min,
          MAX(preco) as preco_max
        FROM dim_produto_catalogo
        WHERE deleted_at IS NULL
      `;

      const resultado = await db.execute(query);
      return resultado.rows[0];
    }),

  /**
   * Listar entidades vinculadas a um produto
   */
  getEntidades: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      produtoId: z.number(),
      pagina: z.number().min(1).optional(),
      porPagina: z.number().min(1).max(100).optional()
    }))
    .query(async ({ input }) => {
      const { produtoId, pagina = 1, porPagina = 20 } = input;
      const offset = (pagina - 1) * porPagina;

      const query = sql`
        SELECT 
          e.*,
          ep.quantidade,
          ep.valor_unitario,
          ep.valor_total
        FROM fato_entidade_produto ep
        INNER JOIN dim_entidade e ON ep.entidade_id = e.id
        WHERE ep.produto_id = ${produtoId}
          AND ep.deleted_at IS NULL
          AND e.deleted_at IS NULL
        ORDER BY ep.created_at DESC
        LIMIT ${porPagina} OFFSET ${offset}
      `;

      const resultado = await db.execute(query);

      // Contar total
      const queryCount = sql`
        SELECT COUNT(*) as total
        FROM fato_entidade_produto ep
        INNER JOIN dim_entidade e ON ep.entidade_id = e.id
        WHERE ep.produto_id = ${produtoId}
          AND ep.deleted_at IS NULL
          AND e.deleted_at IS NULL
      `;

      const resultadoCount = await db.execute(queryCount);
      const total = Number(resultadoCount.rows[0]?.total || 0);

      return {
        dados: resultado.rows,
        paginacao: {
          pagina,
          porPagina,
          total,
          totalPaginas: Math.ceil(total / porPagina)
        }
      };
    }),

  /**
   * Listar mercados vinculados a um produto
   */
  getMercados: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      produtoId: z.number(),
      pagina: z.number().min(1).optional(),
      porPagina: z.number().min(1).max(100).optional()
    }))
    .query(async ({ input }) => {
      const { produtoId, pagina = 1, porPagina = 20 } = input;
      const offset = (pagina - 1) * porPagina;

      const query = sql`
        SELECT 
          m.*,
          pm.share_of_market,
          pm.volume_vendas
        FROM fato_produto_mercado pm
        INNER JOIN dim_mercado m ON pm.mercado_id = m.id
        WHERE pm.produto_id = ${produtoId}
          AND pm.deleted_at IS NULL
          AND m.deleted_at IS NULL
        ORDER BY pm.share_of_market DESC
        LIMIT ${porPagina} OFFSET ${offset}
      `;

      const resultado = await db.execute(query);

      // Contar total
      const queryCount = sql`
        SELECT COUNT(*) as total
        FROM fato_produto_mercado pm
        INNER JOIN dim_mercado m ON pm.mercado_id = m.id
        WHERE pm.produto_id = ${produtoId}
          AND pm.deleted_at IS NULL
          AND m.deleted_at IS NULL
      `;

      const resultadoCount = await db.execute(queryCount);
      const total = Number(resultadoCount.rows[0]?.total || 0);

      return {
        dados: resultado.rows,
        paginacao: {
          pagina,
          porPagina,
          total,
          totalPaginas: Math.ceil(total / porPagina)
        }
      };
    })
});
