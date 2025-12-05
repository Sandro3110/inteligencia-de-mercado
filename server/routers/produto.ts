import { requirePermission } from "../middleware/auth";
import { Permission } from "@shared/types/permissions";
import { z } from 'zod';
import { router } from './index';
import { db } from '../db';

// ============================================================================
// PRODUTO ROUTER - SQL DIRETO (sem depender de schema)
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

      // Construir WHERE clauses
      const whereClauses: string[] = ['p.deleted_at IS NULL'];
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        whereClauses.push(`(p.nome ILIKE $${paramIndex} OR p.descricao ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (categoria) {
        whereClauses.push(`p.categoria = $${paramIndex}`);
        params.push(categoria);
        paramIndex++;
      }

      if (subcategoria) {
        whereClauses.push(`p.subcategoria = $${paramIndex}`);
        params.push(subcategoria);
        paramIndex++;
      }

      if (sku) {
        whereClauses.push(`p.sku ILIKE $${paramIndex}`);
        params.push(`%${sku}%`);
        paramIndex++;
      }

      if (ean) {
        whereClauses.push(`p.ean = $${paramIndex}`);
        params.push(ean);
        paramIndex++;
      }

      if (ncm) {
        whereClauses.push(`p.ncm = $${paramIndex}`);
        params.push(ncm);
        paramIndex++;
      }

      if (precoMin !== undefined) {
        whereClauses.push(`p.preco >= $${paramIndex}`);
        params.push(precoMin);
        paramIndex++;
      }

      if (precoMax !== undefined) {
        whereClauses.push(`p.preco <= $${paramIndex}`);
        params.push(precoMax);
        paramIndex++;
      }

      if (ativo !== undefined) {
        whereClauses.push(`p.ativo = $${paramIndex}`);
        params.push(ativo);
        paramIndex++;
      }

      const whereClause = whereClauses.join(' AND ');

      // Ordenação
      let orderByClause = 'p.created_at DESC';
      if (ordenacao) {
        const campo = ordenacao.campo.includes('.') ? ordenacao.campo : `p.${ordenacao.campo}`;
        orderByClause = `${campo} ${ordenacao.direcao}`;
      }

      // Query principal
      const queryText = `
        SELECT p.*
        FROM dim_produto_catalogo p
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(porPagina, offset);

      try {
        const resultado = await db.execute({
          sql: queryText,
          args: params
        });

        // Contar total
        const countQueryText = `
          SELECT COUNT(*) as total
          FROM dim_produto_catalogo p
          WHERE ${whereClause}
        `;

        const resultadoCount = await db.execute({
          sql: countQueryText,
          args: params.slice(0, paramIndex - 1) // Remover limit e offset
        });

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
      } catch (error) {
        console.error('Erro ao listar produtos:', error);
        throw new Error(`Falha ao listar produtos: ${error.message}`);
      }
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

      try {
        const resultado = await db.execute({
          sql: `
            SELECT p.*
            FROM dim_produto_catalogo p
            WHERE p.id = $1
              AND p.deleted_at IS NULL
          `,
          args: [produtoId]
        });

        if (resultado.rows.length === 0) {
          throw new Error('Produto não encontrado');
        }

        return resultado.rows[0];
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        throw new Error(`Falha ao buscar produto: ${error.message}`);
      }
    }),

  /**
   * Listar categorias
   */
  getCategorias: requirePermission(Permission.ANALISE_READ)
    .query(async () => {
      try {
        const resultado = await db.execute({
          sql: `
            SELECT DISTINCT categoria
            FROM dim_produto_catalogo
            WHERE deleted_at IS NULL
              AND categoria IS NOT NULL
            ORDER BY categoria
          `,
          args: []
        });

        return resultado.rows.map((r: any) => r.categoria);
      } catch (error) {
        console.error('Erro ao listar categorias:', error);
        return [];
      }
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

      try {
        const whereClauses = ['deleted_at IS NULL', 'subcategoria IS NOT NULL'];
        const params: any[] = [];

        if (categoria) {
          whereClauses.push('categoria = $1');
          params.push(categoria);
        }

        const resultado = await db.execute({
          sql: `
            SELECT DISTINCT subcategoria
            FROM dim_produto_catalogo
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY subcategoria
          `,
          args: params
        });

        return resultado.rows.map((r: any) => r.subcategoria);
      } catch (error) {
        console.error('Erro ao listar subcategorias:', error);
        return [];
      }
    }),

  /**
   * Estatísticas gerais
   */
  getStats: requirePermission(Permission.ANALISE_READ)
    .query(async () => {
      try {
        const resultado = await db.execute({
          sql: `
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
          `,
          args: []
        });

        return resultado.rows[0];
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
          total: 0,
          ativos: 0,
          inativos: 0,
          categorias: 0,
          preco_medio: 0,
          preco_min: 0,
          preco_max: 0
        };
      }
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

      try {
        const resultado = await db.execute({
          sql: `
            SELECT 
              e.*,
              ep.quantidade,
              ep.valor_unitario,
              ep.valor_total
            FROM fato_entidade_produto ep
            INNER JOIN dim_entidade e ON ep.entidade_id = e.id
            WHERE ep.produto_id = $1
              AND ep.deleted_at IS NULL
              AND e.deleted_at IS NULL
            ORDER BY ep.created_at DESC
            LIMIT $2 OFFSET $3
          `,
          args: [produtoId, porPagina, offset]
        });

        // Contar total
        const resultadoCount = await db.execute({
          sql: `
            SELECT COUNT(*) as total
            FROM fato_entidade_produto ep
            INNER JOIN dim_entidade e ON ep.entidade_id = e.id
            WHERE ep.produto_id = $1
              AND ep.deleted_at IS NULL
              AND e.deleted_at IS NULL
          `,
          args: [produtoId]
        });

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
      } catch (error) {
        console.error('Erro ao listar entidades do produto:', error);
        return {
          dados: [],
          paginacao: { pagina, porPagina, total: 0, totalPaginas: 0 }
        };
      }
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

      try {
        const resultado = await db.execute({
          sql: `
            SELECT 
              m.*,
              pm.share_of_market,
              pm.volume_vendas
            FROM fato_produto_mercado pm
            INNER JOIN dim_mercado m ON pm.mercado_id = m.id
            WHERE pm.produto_id = $1
              AND pm.deleted_at IS NULL
              AND m.deleted_at IS NULL
            ORDER BY pm.share_of_market DESC
            LIMIT $2 OFFSET $3
          `,
          args: [produtoId, porPagina, offset]
        });

        // Contar total
        const resultadoCount = await db.execute({
          sql: `
            SELECT COUNT(*) as total
            FROM fato_produto_mercado pm
            INNER JOIN dim_mercado m ON pm.mercado_id = m.id
            WHERE pm.produto_id = $1
              AND pm.deleted_at IS NULL
              AND m.deleted_at IS NULL
          `,
          args: [produtoId]
        });

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
      } catch (error) {
        console.error('Erro ao listar mercados do produto:', error);
        return {
          dados: [],
          paginacao: { pagina, porPagina, total: 0, totalPaginas: 0 }
        };
      }
    })
});
