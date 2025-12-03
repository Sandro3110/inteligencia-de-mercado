import { router, publicProcedure } from '../trpc';
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Dashboard Router - KPIs e métricas gerais
 */

export const dashboardRouter = router({
  /**
   * Buscar dados do dashboard (KPIs)
   */
  getDashboardData: publicProcedure
    .query(async () => {
      // Buscar total de entidades por tipo
      const queryEntidades = sql`
        SELECT 
          COUNT(*) FILTER (WHERE tipo_entidade = 'cliente') as total_clientes,
          COUNT(*) FILTER (WHERE tipo_entidade = 'lead') as total_leads,
          COUNT(*) FILTER (WHERE tipo_entidade = 'concorrente') as total_concorrentes,
          COUNT(*) as total_entidades
        FROM dim_entidade
        WHERE deleted_at IS NULL
      `;

      const resultadoEntidades = await db.execute(queryEntidades);
      const entidades = resultadoEntidades.rows[0] || {
        total_clientes: 0,
        total_leads: 0,
        total_concorrentes: 0,
        total_entidades: 0
      };

      // Buscar total de mercados
      const queryMercados = sql`
        SELECT COUNT(*) as total
        FROM dim_mercado
        WHERE deleted_at IS NULL
      `;

      const resultadoMercados = await db.execute(queryMercados);
      const totalMercados = resultadoMercados.rows[0]?.total || 0;

      // Buscar total de produtos (assumindo que existe dim_produto)
      const queryProdutos = sql`
        SELECT COUNT(*) as total
        FROM dim_produto
        WHERE deleted_at IS NULL
      `;

      let totalProdutos = 0;
      try {
        const resultadoProdutos = await db.execute(queryProdutos);
        totalProdutos = resultadoProdutos.rows[0]?.total || 0;
      } catch (error) {
        // Tabela dim_produto pode não existir ainda
        totalProdutos = 0;
      }

      return {
        kpis: {
          totalClientes: Number(entidades.total_clientes) || 0,
          totalLeads: Number(entidades.total_leads) || 0,
          totalConcorrentes: Number(entidades.total_concorrentes) || 0,
          totalEntidades: Number(entidades.total_entidades) || 0,
          totalMercados: Number(totalMercados) || 0,
          totalProdutos: Number(totalProdutos) || 0
        }
      };
    })
});
