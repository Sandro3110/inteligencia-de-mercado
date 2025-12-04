import { sql } from '@vercel/postgres';

/**
 * REST API Endpoint para Dashboard
 * GET /api/dashboard
 * 
 * Retorna KPIs e estatísticas do dashboard
 */
export default async function handler(req, res) {
  // Permitir apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Este endpoint aceita apenas requisições GET' 
    });
  }

  try {
    // Query única para buscar todos os KPIs
    const { rows } = await sql`
      SELECT 
        (SELECT COUNT(*)::int FROM dim_projeto WHERE deleted_at IS NULL) as total_projetos,
        (SELECT COUNT(*)::int FROM dim_pesquisa WHERE deleted_at IS NULL) as total_pesquisas,
        (SELECT COUNT(*)::int FROM dim_entidade WHERE deleted_at IS NULL) as total_entidades,
        (SELECT COUNT(*)::int FROM dim_entidade WHERE tipo_entidade = 'cliente' AND deleted_at IS NULL) as total_clientes,
        (SELECT COUNT(*)::int FROM dim_entidade WHERE tipo_entidade = 'lead' AND deleted_at IS NULL) as total_leads,
        (SELECT COUNT(*)::int FROM dim_entidade WHERE tipo_entidade = 'concorrente' AND deleted_at IS NULL) as total_concorrentes,
        (SELECT COUNT(*)::int FROM dim_produto WHERE deleted_at IS NULL) as total_produtos,
        (SELECT COUNT(*)::int FROM dim_mercado WHERE deleted_at IS NULL) as total_mercados
    `;

    const kpis = rows[0];

    // Resposta JSON simples e direta
    return res.status(200).json({
      success: true,
      kpis: {
        totalProjetos: kpis.total_projetos || 0,
        totalPesquisas: kpis.total_pesquisas || 0,
        totalEntidades: kpis.total_entidades || 0,
        totalClientes: kpis.total_clientes || 0,
        totalLeads: kpis.total_leads || 0,
        totalConcorrentes: kpis.total_concorrentes || 0,
        totalProdutos: kpis.total_produtos || 0,
        totalMercados: kpis.total_mercados || 0,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dashboard:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
