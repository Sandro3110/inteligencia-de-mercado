import { requirePermission } from "../middleware/auth";
import { Permission } from "@shared/types/permissions";
import { z } from 'zod';
import { router } from './index';
import { db } from '../db';
import { dimProdutoCatalogo } from '../../drizzle/schema';
import { eq, and, or, gte, lte, ilike, isNull, desc, asc, count, sql } from 'drizzle-orm';

// ============================================================================
// PRODUTO ROUTER - Usando Drizzle ORM com schema
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

      try {
        console.log('[PRODUTO API] Iniciando list com input:', JSON.stringify(input));
        // Construir filtros
        const filters: any[] = [isNull(dimProdutoCatalogo.deletedAt)];

        if (search) {
          filters.push(
            or(
              ilike(dimProdutoCatalogo.nome, `%${search}%`),
              ilike(dimProdutoCatalogo.descricao, `%${search}%`)
            )
          );
        }

        if (categoria) {
          filters.push(eq(dimProdutoCatalogo.categoria, categoria));
        }

        if (subcategoria) {
          filters.push(eq(dimProdutoCatalogo.subcategoria, subcategoria));
        }

        if (sku) {
          filters.push(ilike(dimProdutoCatalogo.sku, `%${sku}%`));
        }

        if (ean) {
          filters.push(eq(dimProdutoCatalogo.ean, ean));
        }

        if (ncm) {
          filters.push(eq(dimProdutoCatalogo.ncm, ncm));
        }

        if (precoMin !== undefined) {
          filters.push(gte(dimProdutoCatalogo.preco, precoMin.toString()));
        }

        if (precoMax !== undefined) {
          filters.push(lte(dimProdutoCatalogo.preco, precoMax.toString()));
        }

        if (ativo !== undefined) {
          filters.push(eq(dimProdutoCatalogo.ativo, ativo));
        }

        // Ordenação
        let orderBy: any = desc(dimProdutoCatalogo.createdAt);
        if (ordenacao) {
          const campo = dimProdutoCatalogo[ordenacao.campo as keyof typeof dimProdutoCatalogo];
          orderBy = ordenacao.direcao === 'ASC' ? asc(campo) : desc(campo);
        }

        // Query principal
        const dados = await db
          .select()
          .from(dimProdutoCatalogo)
          .where(and(...filters))
          .orderBy(orderBy)
          .limit(porPagina)
          .offset(offset);

        // Contar total
        const [{ total }] = await db
          .select({ total: count() })
          .from(dimProdutoCatalogo)
          .where(and(...filters));

        return {
          dados,
          paginacao: {
            pagina,
            porPagina,
            total: Number(total),
            totalPaginas: Math.ceil(Number(total) / porPagina)
          }
        };
      } catch (error) {
        console.error('[PRODUTO API] ERRO ao listar produtos:', error);
        console.error('[PRODUTO API] Stack:', error.stack);
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
        const produto = await db
          .select()
          .from(dimProdutoCatalogo)
          .where(
            and(
              eq(dimProdutoCatalogo.id, produtoId),
              isNull(dimProdutoCatalogo.deletedAt)
            )
          )
          .limit(1);

        if (produto.length === 0) {
          throw new Error('Produto não encontrado');
        }

        return produto[0];
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
        const resultado = await db
          .selectDistinct({ categoria: dimProdutoCatalogo.categoria })
          .from(dimProdutoCatalogo)
          .where(
            and(
              isNull(dimProdutoCatalogo.deletedAt),
              sql`${dimProdutoCatalogo.categoria} IS NOT NULL`
            )
          )
          .orderBy(asc(dimProdutoCatalogo.categoria));

        return resultado.map(r => r.categoria);
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
        const filters: any[] = [
          isNull(dimProdutoCatalogo.deletedAt),
          sql`${dimProdutoCatalogo.subcategoria} IS NOT NULL`
        ];

        if (categoria) {
          filters.push(eq(dimProdutoCatalogo.categoria, categoria));
        }

        const resultado = await db
          .selectDistinct({ subcategoria: dimProdutoCatalogo.subcategoria })
          .from(dimProdutoCatalogo)
          .where(and(...filters))
          .orderBy(asc(dimProdutoCatalogo.subcategoria));

        return resultado.map(r => r.subcategoria);
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
        const resultado = await db
          .select({
            total: count(),
            ativos: sql<number>`COUNT(CASE WHEN ${dimProdutoCatalogo.ativo} = true THEN 1 END)`,
            inativos: sql<number>`COUNT(CASE WHEN ${dimProdutoCatalogo.ativo} = false THEN 1 END)`,
            categorias: sql<number>`COUNT(DISTINCT ${dimProdutoCatalogo.categoria})`,
            preco_medio: sql<number>`AVG(${dimProdutoCatalogo.preco})`,
            preco_min: sql<number>`MIN(${dimProdutoCatalogo.preco})`,
            preco_max: sql<number>`MAX(${dimProdutoCatalogo.preco})`
          })
          .from(dimProdutoCatalogo)
          .where(isNull(dimProdutoCatalogo.deletedAt));

        return resultado[0];
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
