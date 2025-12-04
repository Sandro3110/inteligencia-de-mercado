import { router, publicProcedure } from './index';
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
      // Query única para buscar todos os KPIs
      // Query SQL direta com filtro de deleted_at onde aplicável
      const query = sql`
        SELECT 
          (SELECT COUNT(*) FROM dim_projeto WHERE deleted_at IS NULL) as total_projetos,
          (SELECT COUNT(*) FROM dim_pesquisa WHERE deleted_at IS NULL) as total_pesquisas,
          (SELECT COUNT(*) FROM dim_entidade WHERE deleted_at IS NULL) as total_entidades,
          (SELECT COUNT(*) FROM dim_entidade WHERE tipo_entidade = 'cliente' AND deleted_at IS NULL) as total_clientes,
          (SELECT COUNT(*) FROM dim_entidade WHERE tipo_entidade = 'lead' AND deleted_at IS NULL) as total_leads,
          (SELECT COUNT(*) FROM dim_entidade WHERE tipo_entidade = 'concorrente' AND deleted_at IS NULL) as total_concorrentes,
          (SELECT COUNT(*) FROM dim_produto) as total_produtos,
          (SELECT COUNT(*) FROM dim_mercado) as total_mercados
      `;

      const resultado = await db.execute(query);
      const kpis = resultado.rows[0] || {};

      return {
        kpis: {
          totalProjetos: Number(kpis.total_projetos) || 0,
          totalPesquisas: Number(kpis.total_pesquisas) || 0,
          totalEntidades: Number(kpis.total_entidades) || 0,
          totalClientes: Number(kpis.total_clientes) || 0,
          totalLeads: Number(kpis.total_leads) || 0,
          totalConcorrentes: Number(kpis.total_concorrentes) || 0,
          totalProdutos: Number(kpis.total_produtos) || 0,
          totalMercados: Number(kpis.total_mercados) || 0,
          receitaPotencial: 0,
          scoreMedioFit: 0,
          taxaConversao: 0,
          crescimentoMensal: 0
        },
        distribuicao: {
          porTipo: [],
          porSegmento: []
        },
        topMercados: [],
        topRegioes: [],
        atividadesRecentes: []
      };
    })
});
