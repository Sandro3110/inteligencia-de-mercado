import { z } from 'zod';
import { router, publicProcedure } from './index';
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Produto Router - Gerenciamento de produtos do catálogo
 * Tabela: dim_produto_catalogo
 * 
 * REESCRITO DO ZERO COPIANDO PADRÃO DE entidade.ts
 */
export const produtoRouter = router({
  /**
   * Listar produtos com filtros avançados
   * BASEADO EM entidade.listar
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
      ordenacao: z.object({
        campo: z.enum(['nome', 'preco', 'data_cadastro', 'categoria']),
        direcao: z.enum(['ASC', 'DESC'])
      }).optional(),
      
      // Paginação
      pagina: z.number().min(1).optional(),
      porPagina: z.number().min(1).max(1000).optional()
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
        ordenacao,
        pagina = 1,
        porPagina = 20
      } = input;

      const offset = (pagina - 1) * porPagina;

      // Construir query base (IGUAL entidade.ts)
      let query = sql`
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
        WHERE 1=1
      `;

      // Aplicar filtros (IGUAL entidade.ts)
      if (search) {
        query = sql`${query} AND (nome ILIKE ${`%${search}%`} OR descricao ILIKE ${`%${search}%`})`;
      }

      if (categoria) {
        query = sql`${query} AND categoria = ${categoria}`;
      }

      if (subcategoria) {
        query = sql`${query} AND subcategoria = ${subcategoria}`;
      }

      if (sku) {
        query = sql`${query} AND sku = ${sku}`;
      }

      if (ean) {
        query = sql`${query} AND ean = ${ean}`;
      }

      if (ncm) {
        query = sql`${query} AND ncm = ${ncm}`;
      }

      if (preco_min !== undefined) {
        query = sql`${query} AND preco >= ${preco_min}`;
      }

      if (preco_max !== undefined) {
        query = sql`${query} AND preco <= ${preco_max}`;
      }

      if (ativo !== undefined) {
        query = sql`${query} AND ativo = ${ativo}`;
      }

      // Ordenação (IGUAL entidade.ts)
      if (ordenacao) {
        query = sql`${query} ORDER BY ${sql.raw(ordenacao.campo)} ${sql.raw(ordenacao.direcao)}`;
      } else {
        query = sql`${query} ORDER BY data_cadastro DESC`;
      }

      // Paginação (IGUAL entidade.ts)
      query = sql`${query} LIMIT ${porPagina} OFFSET ${offset}`;

      const resultado = await db.execute(query);

      // Contar total (IGUAL entidade.ts)
      let queryCount = sql`
        SELECT COUNT(*) as total
        FROM dim_produto_catalogo
        WHERE 1=1
      `;

      if (search) {
        queryCount = sql`${queryCount} AND (nome ILIKE ${`%${search}%`} OR descricao ILIKE ${`%${search}%`})`;
      }

      if (categoria) {
        queryCount = sql`${queryCount} AND categoria = ${categoria}`;
      }

      if (subcategoria) {
        queryCount = sql`${queryCount} AND subcategoria = ${subcategoria}`;
      }

      if (sku) {
        queryCount = sql`${queryCount} AND sku = ${sku}`;
      }

      if (ean) {
        queryCount = sql`${queryCount} AND ean = ${ean}`;
      }

      if (ncm) {
        queryCount = sql`${queryCount} AND ncm = ${ncm}`;
      }

      if (preco_min !== undefined) {
        queryCount = sql`${queryCount} AND preco >= ${preco_min}`;
      }

      if (preco_max !== undefined) {
        queryCount = sql`${queryCount} AND preco <= ${preco_max}`;
      }

      if (ativo !== undefined) {
        queryCount = sql`${queryCount} AND ativo = ${ativo}`;
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
  getById: publicProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(async ({ input }) => {
      const query = sql`
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
      `;

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
      pagina: z.number().min(1).optional(),
      porPagina: z.number().min(1).max(100).optional()
    }))
    .query(async ({ input }) => {
      const { produtoId, pagina = 1, porPagina = 20 } = input;
      const offset = (pagina - 1) * porPagina;

      const query = sql`
        SELECT 
          e.id,
          e.nome,
          e.cnpj,
          e.cidade,
          e.uf,
          e.tipo_entidade,
          ep.quantidade,
          ep.data_inicio
        FROM fato_entidade_produto ep
        INNER JOIN dim_entidade e ON ep.entidade_id = e.id
        WHERE ep.produto_id = ${produtoId}
          AND e.deleted_at IS NULL
        ORDER BY ep.data_inicio DESC
        LIMIT ${porPagina} OFFSET ${offset}
      `;

      const resultado = await db.execute(query);

      const queryCount = sql`
        SELECT COUNT(*) as total
        FROM fato_entidade_produto ep
        INNER JOIN dim_entidade e ON ep.entidade_id = e.id
        WHERE ep.produto_id = ${produtoId}
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
   * Buscar mercados vinculados a um produto
   */
  getMercados: publicProcedure
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
          m.mercado_id,
          m.nome,
          m.categoria,
          m.tamanho_mercado,
          m.crescimento_anual,
          pm.participacao,
          pm.data_inicio
        FROM fato_produto_mercado pm
        INNER JOIN dim_mercado m ON pm.mercado_id = m.mercado_id
        WHERE pm.produto_id = ${produtoId}
        ORDER BY pm.participacao DESC
        LIMIT ${porPagina} OFFSET ${offset}
      `;

      const resultado = await db.execute(query);

      const queryCount = sql`
        SELECT COUNT(*) as total
        FROM fato_produto_mercado pm
        INNER JOIN dim_mercado m ON pm.mercado_id = m.mercado_id
        WHERE pm.produto_id = ${produtoId}
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
   * Estatísticas gerais de produtos
   */
  getStats: publicProcedure
    .query(async () => {
      const query = sql`
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

      const resultado = await db.execute(query);

      return resultado.rows[0];
    }),

  /**
   * Listar categorias disponíveis
   */
  getCategorias: publicProcedure
    .query(async () => {
      const query = sql`
        SELECT 
          categoria,
          COUNT(*) as total_produtos
        FROM dim_produto_catalogo
        WHERE categoria IS NOT NULL
        GROUP BY categoria
        ORDER BY categoria
      `;

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
      const query = sql`
        SELECT 
          subcategoria,
          COUNT(*) as total_produtos
        FROM dim_produto_catalogo
        WHERE categoria = ${input.categoria}
          AND subcategoria IS NOT NULL
        GROUP BY subcategoria
        ORDER BY subcategoria
      `;

      const resultado = await db.execute(query);

      return resultado.rows;
    })
});
