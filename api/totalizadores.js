const { createClient } = require('@supabase/supabase-js');

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
    // Criar cliente Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecnzlynmuerbmqingyfl.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbnpseW5tdWVyYm1xaW5neWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTU2NDUsImV4cCI6MjA3OTQzMTY0NX0.gYeMFlU7ls361wR72vza-nDBikcwy-SB_W9BIOpjRRY';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar totais de cada entidade
    const [
      { count: totalClientes },
      { count: totalLeads },
      { count: totalConcorrentes },
      { count: totalProdutos },
      { count: totalMercados },
      { count: totalProjetos },
      { count: totalPesquisas }
    ] = await Promise.all([
      supabase.from('dim_entidade').select('*', { count: 'exact', head: true }).eq('tipo_entidade', 'cliente').is('deleted_at', null),
      supabase.from('dim_entidade').select('*', { count: 'exact', head: true }).eq('tipo_entidade', 'lead').is('deleted_at', null),
      supabase.from('dim_entidade').select('*', { count: 'exact', head: true }).eq('tipo_entidade', 'concorrente').is('deleted_at', null),
      supabase.from('dim_produto').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('dim_mercado').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('dim_projeto').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('dim_pesquisa').select('*', { count: 'exact', head: true }).is('deleted_at', null)
    ]);

    // Montar array de totalizadores com metadados
    const totalizadores = [
      {
        tipo: 'clientes',
        label: 'Clientes',
        total: totalClientes || 0,
        icon: '👥',
        color: 'green',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/entidades?tipo=cliente'
      },
      {
        tipo: 'leads',
        label: 'Leads',
        total: totalLeads || 0,
        icon: '➕',
        color: 'yellow',
        status: 'Em prospecção',
        statusColor: 'yellow',
        endpoint: '/api/entidades?tipo=lead'
      },
      {
        tipo: 'concorrentes',
        label: 'Concorrentes',
        total: totalConcorrentes || 0,
        icon: '🏢',
        color: 'red',
        status: 'Monitoramento',
        statusColor: 'red',
        endpoint: '/api/entidades?tipo=concorrente'
      },
      {
        tipo: 'produtos',
        label: 'Produtos',
        total: totalProdutos || 0,
        icon: '📦',
        color: 'blue',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/produtos'
      },
      {
        tipo: 'mercados',
        label: 'Mercados',
        total: totalMercados || 0,
        icon: '🎯',
        color: 'purple',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/mercados'
      },
      {
        tipo: 'projetos',
        label: 'Projetos',
        total: totalProjetos || 0,
        icon: '📁',
        color: 'indigo',
        status: 'Em andamento',
        statusColor: 'green',
        endpoint: '/api/projetos'
      },
      {
        tipo: 'pesquisas',
        label: 'Pesquisas',
        total: totalPesquisas || 0,
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
