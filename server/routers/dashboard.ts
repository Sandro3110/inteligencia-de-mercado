import { router, publicProcedure } from './index';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

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
    }),

  /**
   * Totalizadores para Desktop Turbo
   */
  totalizadores: publicProcedure
    .input(z.object({
      projetoId: z.number().nullable().optional(),
      pesquisaId: z.number().nullable().optional(),
    }).optional())
    .query(async ({ input }) => {
      const { projetoId, pesquisaId } = input || {};

      // Query para totalizadores com filtros
      const whereClause = [];
      if (projetoId) whereClause.push(`projeto_id = ${projetoId}`);
      if (pesquisaId) whereClause.push(`pesquisa_id = ${pesquisaId}`);
      const whereSQL = whereClause.length > 0 ? `AND ${whereClause.join(' AND ')}` : '';

      const query = sql.raw(`
        SELECT 
          'clientes' as tipo,
          'Clientes' as label,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_geral,
          COUNT(*) FILTER (WHERE deleted_at IS NULL ${whereSQL}) as total_filtrado,
          'clientes' as icon,
          'green' as color,
          'Ativo' as status,
          'green' as "statusColor",
          '/entidades?tipo=cliente' as endpoint
        FROM dim_entidade WHERE tipo_entidade = 'cliente'
        UNION ALL
        SELECT 
          'leads' as tipo,
          'Leads' as label,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_geral,
          COUNT(*) FILTER (WHERE deleted_at IS NULL ${whereSQL}) as total_filtrado,
          'leads' as icon,
          'yellow' as color,
          'Ativo' as status,
          'yellow' as "statusColor",
          '/entidades?tipo=lead' as endpoint
        FROM dim_entidade WHERE tipo_entidade = 'lead'
        UNION ALL
        SELECT 
          'concorrentes' as tipo,
          'Concorrentes' as label,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_geral,
          COUNT(*) FILTER (WHERE deleted_at IS NULL ${whereSQL}) as total_filtrado,
          'concorrentes' as icon,
          'red' as color,
          'Ativo' as status,
          'red' as "statusColor",
          '/entidades?tipo=concorrente' as endpoint
        FROM dim_entidade WHERE tipo_entidade = 'concorrente'
        UNION ALL
        SELECT 
          'produtos' as tipo,
          'Produtos' as label,
          COUNT(*) as total_geral,
          COUNT(*) as total_filtrado,
          'produtos' as icon,
          'blue' as color,
          'Ativo' as status,
          'blue' as "statusColor",
          '/produtos' as endpoint
        FROM dim_produto
        UNION ALL
        SELECT 
          'mercados' as tipo,
          'Mercados' as label,
          COUNT(*) as total_geral,
          COUNT(*) as total_filtrado,
          'mercados' as icon,
          'purple' as color,
          'Ativo' as status,
          'purple' as "statusColor",
          '/mercados' as endpoint
        FROM dim_mercado
        UNION ALL
        SELECT 
          'projetos' as tipo,
          'Projetos' as label,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_geral,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_filtrado,
          'projetos' as icon,
          'indigo' as color,
          'Ativo' as status,
          'indigo' as "statusColor",
          '/projetos' as endpoint
        FROM dim_projeto
        UNION ALL
        SELECT 
          'pesquisas' as tipo,
          'Pesquisas' as label,
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_geral,
          COUNT(*) FILTER (WHERE deleted_at IS NULL ${whereSQL}) as total_filtrado,
          'pesquisas' as icon,
          'pink' as color,
          'Ativo' as status,
          'pink' as "statusColor",
          '/pesquisas' as endpoint
        FROM dim_pesquisa
      `);

      const resultado = await db.execute(query);
      const totalizadores = resultado.rows.map((row: any) => ({
        ...row,
        percentual: row.total_geral > 0 
          ? Math.round((row.total_filtrado / row.total_geral) * 100) 
          : 0
      }));

      return {
        success: true,
        filtros: {
          projeto_id: projetoId || null,
          projeto_nome: null,
          pesquisa_id: pesquisaId || null,
          pesquisa_nome: null,
        },
        totalizadores,
        timestamp: new Date().toISOString(),
      };
    })
});
