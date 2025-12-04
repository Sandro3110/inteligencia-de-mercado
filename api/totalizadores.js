const { sql } = require('@vercel/postgres');

/**
 * REST API Endpoint para Totalizadores
 * GET /api/totalizadores
 * 
 * Retorna totais de todas as entidades do sistema
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Este endpoint aceita apenas requisições GET' 
    });
  }

  try {
    // Query única para buscar todos os totais
    const { rows } = await sql`
      SELECT 
        (SELECT COUNT(*)::int FROM dim_entidade WHERE tipo_entidade = 'cliente' AND deleted_at IS NULL) as total_clientes,
        (SELECT COUNT(*)::int FROM dim_entidade WHERE tipo_entidade = 'lead' AND deleted_at IS NULL) as total_leads,
        (SELECT COUNT(*)::int FROM dim_entidade WHERE tipo_entidade = 'concorrente' AND deleted_at IS NULL) as total_concorrentes,
        (SELECT COUNT(*)::int FROM dim_produto WHERE deleted_at IS NULL) as total_produtos,
        (SELECT COUNT(*)::int FROM dim_mercado WHERE deleted_at IS NULL) as total_mercados,
        (SELECT COUNT(*)::int FROM dim_projeto WHERE deleted_at IS NULL) as total_projetos,
        (SELECT COUNT(*)::int FROM dim_pesquisa WHERE deleted_at IS NULL) as total_pesquisas
    `;

    const totais = rows[0];

    // Montar array de totalizadores com metadados
    const totalizadores = [
      {
        tipo: 'clientes',
        label: 'Clientes',
        total: totais.total_clientes || 0,
        icon: '👥',
        color: 'green',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/entidades?tipo=cliente'
      },
      {
        tipo: 'leads',
        label: 'Leads',
        total: totais.total_leads || 0,
        icon: '➕',
        color: 'yellow',
        status: 'Em prospecção',
        statusColor: 'yellow',
        endpoint: '/api/entidades?tipo=lead'
      },
      {
        tipo: 'concorrentes',
        label: 'Concorrentes',
        total: totais.total_concorrentes || 0,
        icon: '🏢',
        color: 'red',
        status: 'Monitoramento',
        statusColor: 'red',
        endpoint: '/api/entidades?tipo=concorrente'
      },
      {
        tipo: 'produtos',
        label: 'Produtos',
        total: totais.total_produtos || 0,
        icon: '📦',
        color: 'blue',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/produtos'
      },
      {
        tipo: 'mercados',
        label: 'Mercados',
        total: totais.total_mercados || 0,
        icon: '🎯',
        color: 'purple',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/mercados'
      },
      {
        tipo: 'projetos',
        label: 'Projetos',
        total: totais.total_projetos || 0,
        icon: '📁',
        color: 'indigo',
        status: 'Em andamento',
        statusColor: 'green',
        endpoint: '/api/projetos'
      },
      {
        tipo: 'pesquisas',
        label: 'Pesquisas',
        total: totais.total_pesquisas || 0,
        icon: '🔍',
        color: 'pink',
        status: 'Processando',
        statusColor: 'yellow',
        endpoint: '/api/pesquisas'
      }
    ];

    return res.status(200).json({
      success: true,
      totalizadores,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar totalizadores:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
