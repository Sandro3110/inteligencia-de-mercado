import { z } from 'zod';
import { router, publicProcedure } from './index';
import { db } from '../db';
import { dimProduto } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';

/**
 * Produto Router - Gerenciamento de produtos
 */
export const produtoRouter = router({
  /**
   * Listar produtos com filtros
   */
  list: publicProcedure
    .input(z.object({
      busca: z.string().optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional()
    }))
    .query(async ({ input }) => {
      const { busca, limit = 20, offset = 0 } = input;

      let whereConditions = [];
      let params: any[] = [];

      // Filtro de busca
      if (busca) {
        whereConditions.push(`(p.nome ILIKE $${params.length + 1} OR p.descricao ILIKE $${params.length + 1})`);
        params.push(`%${busca}%`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      params.push(limit, offset);

      const query = `
        SELECT 
          p.*,
          COUNT(*) OVER() as total_count
        FROM dim_produto p
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;

      const resultado = await db.execute(sql.raw(query, params));

      return {
        data: resultado.rows,
        total: resultado.rows[0]?.total_count || 0
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
        SELECT * FROM dim_produto
        WHERE id = $1
      `;

      const resultado = await db.execute(sql.raw(query, [input.id]));

      if (!resultado.rows[0]) {
        throw new Error('Produto não encontrado');
      }

      return resultado.rows[0];
    })
});
