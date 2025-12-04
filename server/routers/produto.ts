import { z } from 'zod';
import { router, publicProcedure } from './index';
import { db } from '../db';
import { sql } from 'drizzle-orm';

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

      let whereConditions: string[] = [];
      let params: any[] = [];
      let paramIndex = 1;

      // Filtro de busca (nome ou descrição)
      if (search) {
        whereConditions.push(`(p.nome ILIKE $${paramIndex} OR p.descricao ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Filtro de categoria
      if (categoria) {
        whereConditions.push(`p.categoria = $${paramIndex}`);
        params.push(categoria);
        paramIndex++;
      }

      // Filtro de subcategoria
      if (subcategoria) {
        whereConditions.push(`p.subcategoria = $${paramIndex}`);
        params.push(subcategoria);
        paramIndex++;
      }

      // Filtro de SKU
      if (sku) {
        whereConditions.push(`p.sku = $${paramIndex}`);
        params.push(sku);
        paramIndex++;
      }

      // Filtro de EAN
      if (ean) {
        whereConditions.push(`p.ean = $${paramIndex}`);
        params.push(ean);
        paramIndex++;
      }

      // Filtro de NCM
      if (ncm) {
        whereConditions.push(`p.ncm = $${paramIndex}`);
        params.push(ncm);
        paramIndex++;
      }

      // Filtro de preço mínimo
      if (preco_min !== undefined) {
        whereConditions.push(`p.preco >= $${paramIndex}`);
        params.push(preco_min);
        paramIndex++;
      }

      // Filtro de preço máximo
      if (preco_max !== undefined) {
        whereConditions.push(`p.preco <= $${paramIndex}`);
        params.push(preco_max);
        paramIndex++;
      }

      // Filtro de status ativo
      if (ativo !== undefined) {
        whereConditions.push(`p.ativo = $${paramIndex}`);
        params.push(ativo);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Mapeamento de ordenação
      const orderByMap: Record<string, string> = {
        nome: 'p.nome',
        preco: 'p.preco',
        data_cadastro: 'p.data_cadastro',
        categoria: 'p.categoria'
      };

      const orderByColumn = orderByMap[ordem] || 'p.data_cadastro';
      const orderByDirection = direcao.toUpperCase();

      params.push(limit, offset);

      const query = `
        SELECT 
          p.produto_id,
          p.nome,
          p.sku,
          p.ean,
          p.ncm,
          p.categoria,
          p.subcategoria,
          p.preco,
          p.moeda,
          p.unidade,
          p.descricao,
          p.ativo,
          p.data_cadastro,
          p.data_atualizacao,
          p.criado_por,
          p.atualizado_por,
          p.fonte,
          COUNT(*) OVER() as total_count
        FROM dim_produto_catalogo p
        ${whereClause}
        ORDER BY ${orderByColumn} ${orderByDirection}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const resultado = await db.execute(sql.raw(query, params));

      return {
        data: resultado.rows,
        total: resultado.rows[0]?.total_count || 0,
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
      const query = `
        SELECT 
          p.produto_id,
          p.nome,
          p.sku,
          p.ean,
          p.ncm,
          p.categoria,
          p.subcategoria,
          p.preco,
          p.moeda,
          p.unidade,
          p.descricao,
          p.ativo,
          p.data_cadastro,
          p.data_atualizacao,
          p.criado_por,
          p.atualizado_por,
          p.fonte
        FROM dim_produto_catalogo p
        WHERE p.produto_id = $1
      `;

      const resultado = await db.execute(sql.raw(query, [input.id]));

      if (!resultado.rows[0]) {
        throw new Error('Produto não encontrado');
      }

      return resultado.rows[0];
    }),

  /**
   * Listar entidades vinculadas a um produto
   */
  getEntidades: publicProcedure
    .input(z.object({
      produto_id: z.number(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional()
    }))
    .query(async ({ input }) => {
      const { produto_id, limit = 20, offset = 0 } = input;

      const query = `
        SELECT 
          e.id,
          e.nome,
          e.cnpj,
          e.tipo_entidade,
          e.cidade,
          e.uf,
          e.setor,
          e.porte,
          ep.data_vinculo,
          COUNT(*) OVER() as total_count
        FROM fato_entidade_produto ep
        INNER JOIN dim_entidade e ON e.id = ep.entidade_id
        WHERE ep.produto_id = $1
        ORDER BY ep.data_vinculo DESC
        LIMIT $2 OFFSET $3
      `;

      const resultado = await db.execute(sql.raw(query, [produto_id, limit, offset]));

      return {
        data: resultado.rows,
        total: resultado.rows[0]?.total_count || 0
      };
    }),

  /**
   * Listar mercados vinculados a um produto
   */
  getMercados: publicProcedure
    .input(z.object({
      produto_id: z.number(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional()
    }))
    .query(async ({ input }) => {
      const { produto_id, limit = 20, offset = 0 } = input;

      const query = `
        SELECT 
          m.id,
          m.nome,
          m.categoria,
          m.segmentacao,
          m.tamanho_mercado,
          m.crescimento_anual,
          pm.data_vinculo,
          COUNT(*) OVER() as total_count
        FROM fato_produto_mercado pm
        INNER JOIN dim_mercado m ON m.id = pm.mercado_id
        WHERE pm.produto_id = $1
        ORDER BY pm.data_vinculo DESC
        LIMIT $2 OFFSET $3
      `;

      const resultado = await db.execute(sql.raw(query, [produto_id, limit, offset]));

      return {
        data: resultado.rows,
        total: resultado.rows[0]?.total_count || 0
      };
    }),

  /**
   * Obter estatísticas de produtos
   */
  getStats: publicProcedure
    .query(async () => {
      const query = `
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
      `;

      const resultado = await db.execute(sql.raw(query));

      return resultado.rows[0];
    }),

  /**
   * Listar categorias disponíveis
   */
  getCategorias: publicProcedure
    .query(async () => {
      const query = `
        SELECT 
          categoria,
          COUNT(*) as total_produtos
        FROM dim_produto_catalogo
        WHERE categoria IS NOT NULL
        GROUP BY categoria
        ORDER BY categoria
      `;

      const resultado = await db.execute(sql.raw(query));

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
      const query = `
        SELECT 
          subcategoria,
          COUNT(*) as total_produtos
        FROM dim_produto_catalogo
        WHERE categoria = $1 AND subcategoria IS NOT NULL
        GROUP BY subcategoria
        ORDER BY subcategoria
      `;

      const resultado = await db.execute(sql.raw(query, [input.categoria]));

      return resultado.rows;
    })
});
