import { z } from 'zod';
import { router, publicProcedure } from './index';
import { db } from '../db';
import { sql, eq, and, or, like, gte, lte, desc, asc } from 'drizzle-orm';

/**
 * Produto Router - Gerenciamento de produtos do catálogo
 * Tabela: dim_produto_catalogo
 */
export const produtoRouter = router({
  /**
   * Listar produtos com filtros avançados
   */
  list: publicProcedure
    .input(z.object({
      // Filtros de busca
      search: z.string().optional(),
      
      // Filtros de classificação
      categoria: z.string().optional(),
      subcategoria: z.string().optional(),
      
      // Filtros de identificação
      sku: z.string().optional(),
      ean: z.string().optional(),
      ncm: z.string().optional(),
      
      // Filtros de preço
      preco_min: z.number().optional(),
      preco_max: z.number().optional(),
      
      // Filtros de status
      ativo: z.boolean().optional(),
      
      // Ordenação
      ordem: z.enum(['nome', 'preco', 'data_cadastro', 'categoria']).optional(),
      direcao: z.enum(['asc', 'desc']).optional(),
      
      // Paginação
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional()
    }))
    .query(async ({ input }) => {
      const { 
        search, 
        categoria, 
        subcategoria, 
        sku, 
        ean, 
        ncm,
        preco_min,
        preco_max,
        ativo,
        ordem = 'data_cadastro', 
        direcao = 'desc',
        limit = 20, 
        offset = 0 
      } = input;

      // Construir query SQL com template literals
      let whereConditions: string[] = [];
      let params: any[] = [];

      // Filtro de busca (nome ou descrição)
      if (search) {
        whereConditions.push(`(nome ILIKE '%${search}%' OR descricao ILIKE '%${search}%')`);
      }

      // Filtro de categoria
      if (categoria) {
        whereConditions.push(`categoria = '${categoria}'`);
      }

      // Filtro de subcategoria
      if (subcategoria) {
        whereConditions.push(`subcategoria = '${subcategoria}'`);
      }

      // Filtro de SKU
      if (sku) {
        whereConditions.push(`sku = '${sku}'`);
      }

      // Filtro de EAN
      if (ean) {
        whereConditions.push(`ean = '${ean}'`);
      }

      // Filtro de NCM
      if (ncm) {
        whereConditions.push(`ncm = '${ncm}'`);
      }

      // Filtro de preço mínimo
      if (preco_min !== undefined) {
        whereConditions.push(`preco >= ${preco_min}`);
      }

      // Filtro de preço máximo
      if (preco_max !== undefined) {
        whereConditions.push(`preco <= ${preco_max}`);
      }

      // Filtro de status ativo
      if (ativo !== undefined) {
        whereConditions.push(`ativo = ${ativo}`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Mapeamento de ordenação
      const orderByMap: Record<string, string> = {
        nome: 'nome',
        preco: 'preco',
        data_cadastro: 'data_cadastro',
        categoria: 'categoria'
      };

      const orderByColumn = orderByMap[ordem] || 'data_cadastro';
      const orderByDirection = direcao.toUpperCase();

      const query = sql.raw(`
        SELECT 
          produto_id,
          nome,
          sku,
          ean,
          ncm,
          categoria,
          subcategoria,
          preco,
          moeda,
          unidade,
          descricao,
          ativo,
          data_cadastro,
          data_atualizacao,
          criado_por,
          atualizado_por,
          fonte,
          COUNT(*) OVER() as total_count
        FROM dim_produto_catalogo
        ${whereClause}
        ORDER BY ${orderByColumn} ${orderByDirection}
        LIMIT ${limit} OFFSET ${offset}
      `);

      const resultado = await db.execute(query);

      return {
        data: resultado.rows,
        total: resultado.rows.length > 0 ? Number(resultado.rows[0].total_count) : 0,
        limit,
        offset
      };
    }),

  /**
   * Buscar produto por ID
   */
  getById: publicProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(async ({ input }) => {
      const query = sql.raw(`
        SELECT 
          produto_id,
          nome,
          sku,
          ean,
          ncm,
          categoria,
          subcategoria,
          preco,
          moeda,
          unidade,
          descricao,
          ativo,
          data_cadastro,
          data_atualizacao,
          criado_por,
          atualizado_por,
          fonte
        FROM dim_produto_catalogo
        WHERE produto_id = ${input.id}
      `);

      const resultado = await db.execute(query);

      if (resultado.rows.length === 0) {
        throw new Error('Produto não encontrado');
      }

      return resultado.rows[0];
    }),

  /**
   * Buscar entidades vinculadas a um produto
   */
  getEntidades: publicProcedure
    .input(z.object({
      produtoId: z.number(),
      limit: z.number().optional(),
      offset: z.number().optional()
    }))
    .query(async ({ input }) => {
      const { produtoId, limit = 20, offset = 0 } = input;

      const query = sql.raw(`
        SELECT 
          e.id,
          e.nome,
          e.cnpj,
          e.cidade,
          e.uf,
          e.tipo_entidade,
          ep.quantidade,
          ep.data_inicio,
          COUNT(*) OVER() as total_count
        FROM fato_entidade_produto ep
        INNER JOIN dim_entidade e ON ep.entidade_id = e.id
        WHERE ep.produto_id = ${produtoId}
          AND e.deleted_at IS NULL
        ORDER BY ep.data_inicio DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      const resultado = await db.execute(query);

      return {
        data: resultado.rows,
        total: resultado.rows.length > 0 ? Number(resultado.rows[0].total_count) : 0,
        limit,
        offset
      };
    }),

  /**
   * Buscar mercados vinculados a um produto
   */
  getMercados: publicProcedure
    .input(z.object({
      produtoId: z.number(),
      limit: z.number().optional(),
      offset: z.number().optional()
    }))
    .query(async ({ input }) => {
      const { produtoId, limit = 20, offset = 0 } = input;

      const query = sql.raw(`
        SELECT 
          m.mercado_id,
          m.nome,
          m.categoria,
          m.tamanho_mercado,
          m.crescimento_anual,
          pm.participacao,
          pm.data_inicio,
          COUNT(*) OVER() as total_count
        FROM fato_produto_mercado pm
        INNER JOIN dim_mercado m ON pm.mercado_id = m.mercado_id
        WHERE pm.produto_id = ${produtoId}
        ORDER BY pm.participacao DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      const resultado = await db.execute(query);

      return {
        data: resultado.rows,
        total: resultado.rows.length > 0 ? Number(resultado.rows[0].total_count) : 0,
        limit,
        offset
      };
    }),

  /**
   * Estatísticas gerais de produtos
   */
  getStats: publicProcedure
    .query(async () => {
      const query = sql.raw(`
        SELECT 
          COUNT(*) as total_produtos,
          COUNT(*) FILTER (WHERE ativo = true) as produtos_ativos,
          COUNT(*) FILTER (WHERE ativo = false) as produtos_inativos,
          COUNT(DISTINCT categoria) as total_categorias,
          COUNT(DISTINCT subcategoria) as total_subcategorias,
          AVG(preco) as preco_medio,
          MIN(preco) as preco_minimo,
          MAX(preco) as preco_maximo
        FROM dim_produto_catalogo
      `);

      const resultado = await db.execute(query);

      return resultado.rows[0];
    }),

  /**
   * Listar categorias disponíveis
   */
  getCategorias: publicProcedure
    .query(async () => {
      const query = sql.raw(`
        SELECT 
          categoria,
          COUNT(*) as total_produtos
        FROM dim_produto_catalogo
        WHERE categoria IS NOT NULL
        GROUP BY categoria
        ORDER BY categoria
      `);

      const resultado = await db.execute(query);

      return resultado.rows;
    }),

  /**
   * Listar subcategorias de uma categoria
   */
  getSubcategorias: publicProcedure
    .input(z.object({
      categoria: z.string()
    }))
    .query(async ({ input }) => {
      const query = sql.raw(`
        SELECT 
          subcategoria,
          COUNT(*) as total_produtos
        FROM dim_produto_catalogo
        WHERE categoria = '${input.categoria}'
          AND subcategoria IS NOT NULL
        GROUP BY subcategoria
        ORDER BY subcategoria
      `);

      const resultado = await db.execute(query);

      return resultado.rows;
    })
});
