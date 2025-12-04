const { createClient } = require('@supabase/supabase-js');

/**
 * REST API Endpoint para Totalizadores com Filtros
 * GET /api/totalizadores?projeto_id=10&pesquisa_id=6
 * 
 * Retorna totais gerais e filtrados de todas as entidades do sistema
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

    // Extrair filtros da query string
    const { projeto_id, pesquisa_id } = req.query;
    const projetoId = projeto_id ? parseInt(projeto_id) : null;
    const pesquisaId = pesquisa_id ? parseInt(pesquisa_id) : null;

    // Buscar informações dos filtros aplicados
    let filtroInfo = {
      projeto_id: projetoId,
      projeto_nome: null,
      pesquisa_id: pesquisaId,
      pesquisa_nome: null
    };

    if (projetoId) {
      const { data: projeto } = await supabase
        .from('dim_projeto')
        .select('nome')
        .eq('id', projetoId)
        .single();
      if (projeto) filtroInfo.projeto_nome = projeto.nome;
    }

    if (pesquisaId) {
      const { data: pesquisa } = await supabase
        .from('dim_pesquisa')
        .select('nome')
        .eq('id', pesquisaId)
        .single();
      if (pesquisa) filtroInfo.pesquisa_nome = pesquisa.nome;
    }

    // Função auxiliar para contar entidades com filtro
    async function contarEntidadesFiltradas(tipoEntidade, projetoId, pesquisaId) {
      if (!projetoId && !pesquisaId) {
        // Sem filtros, retornar total geral
        const { count } = await supabase
          .from('dim_entidade')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_entidade', tipoEntidade)
          .is('deleted_at', null);
        return count || 0;
      }

      // Com filtros, usar fato_entidade_contexto
      let query = supabase
        .from('fato_entidade_contexto')
        .select(`
          entidade_id,
          dim_entidade!inner(tipo_entidade)
        `, { count: 'exact', head: true })
        .eq('dim_entidade.tipo_entidade', tipoEntidade)
        .is('dim_entidade.deleted_at', null)
        .is('deleted_at', null);

      if (projetoId) {
        query = query.eq('projeto_id', projetoId);
      }

      if (pesquisaId) {
        query = query.eq('pesquisa_id', pesquisaId);
      }

      const { count } = await query;
      return count || 0;
    }

    // Função auxiliar para contar dimensões com filtro
    async function contarDimensaoFiltrada(tabela, projetoId, pesquisaId) {
      if (!projetoId && !pesquisaId) {
        // Sem filtros, retornar total geral
        const { count } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);
        return count || 0;
      }

      // Com filtros, contar apenas os que têm entidades vinculadas no contexto
      // Para simplificar, vamos retornar o total geral por enquanto
      // TODO: Implementar lógica de filtro para produtos/mercados/projetos/pesquisas
      const { count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      return count || 0;
    }

    // Buscar totais GERAIS (sem filtro)
    const [
      { count: totalGeralClientes },
      { count: totalGeralLeads },
      { count: totalGeralConcorrentes },
      { count: totalGeralProdutos },
      { count: totalGeralMercados },
      { count: totalGeralProjetos },
      { count: totalGeralPesquisas }
    ] = await Promise.all([
      supabase.from('dim_entidade').select('*', { count: 'exact', head: true }).eq('tipo_entidade', 'cliente').is('deleted_at', null),
      supabase.from('dim_entidade').select('*', { count: 'exact', head: true }).eq('tipo_entidade', 'lead').is('deleted_at', null),
      supabase.from('dim_entidade').select('*', { count: 'exact', head: true }).eq('tipo_entidade', 'concorrente').is('deleted_at', null),
      supabase.from('dim_produto').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('dim_mercado').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('dim_projeto').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('dim_pesquisa').select('*', { count: 'exact', head: true }).is('deleted_at', null)
    ]);

    // Buscar totais FILTRADOS
    const [
      totalFiltradoClientes,
      totalFiltradoLeads,
      totalFiltradoConcorrentes,
      totalFiltradoProdutos,
      totalFiltradoMercados,
      totalFiltradoProjetos,
      totalFiltradoPesquisas
    ] = await Promise.all([
      contarEntidadesFiltradas('cliente', projetoId, pesquisaId),
      contarEntidadesFiltradas('lead', projetoId, pesquisaId),
      contarEntidadesFiltradas('concorrente', projetoId, pesquisaId),
      contarDimensaoFiltrada('dim_produto', projetoId, pesquisaId),
      contarDimensaoFiltrada('dim_mercado', projetoId, pesquisaId),
      contarDimensaoFiltrada('dim_projeto', projetoId, pesquisaId),
      contarDimensaoFiltrada('dim_pesquisa', projetoId, pesquisaId)
    ]);

    // Função auxiliar para calcular percentual
    function calcularPercentual(filtrado, geral) {
      if (geral === 0) return 0;
      return Math.round((filtrado / geral) * 100);
    }

    // Montar array de totalizadores com metadados
    const totalizadores = [
      {
        tipo: 'clientes',
        label: 'Clientes',
        total_geral: totalGeralClientes || 0,
        total_filtrado: totalFiltradoClientes || 0,
        percentual: calcularPercentual(totalFiltradoClientes, totalGeralClientes),
        icon: '👥',
        color: 'green',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/entidades?tipo=cliente'
      },
      {
        tipo: 'leads',
        label: 'Leads',
        total_geral: totalGeralLeads || 0,
        total_filtrado: totalFiltradoLeads || 0,
        percentual: calcularPercentual(totalFiltradoLeads, totalGeralLeads),
        icon: '➕',
        color: 'yellow',
        status: 'Em prospecção',
        statusColor: 'yellow',
        endpoint: '/api/entidades?tipo=lead'
      },
      {
        tipo: 'concorrentes',
        label: 'Concorrentes',
        total_geral: totalGeralConcorrentes || 0,
        total_filtrado: totalFiltradoConcorrentes || 0,
        percentual: calcularPercentual(totalFiltradoConcorrentes, totalGeralConcorrentes),
        icon: '🏢',
        color: 'red',
        status: 'Monitoramento',
        statusColor: 'red',
        endpoint: '/api/entidades?tipo=concorrente'
      },
      {
        tipo: 'produtos',
        label: 'Produtos',
        total_geral: totalGeralProdutos || 0,
        total_filtrado: totalFiltradoProdutos || 0,
        percentual: calcularPercentual(totalFiltradoProdutos, totalGeralProdutos),
        icon: '📦',
        color: 'blue',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/produtos'
      },
      {
        tipo: 'mercados',
        label: 'Mercados',
        total_geral: totalGeralMercados || 0,
        total_filtrado: totalFiltradoMercados || 0,
        percentual: calcularPercentual(totalFiltradoMercados, totalGeralMercados),
        icon: '🎯',
        color: 'purple',
        status: 'Ativo',
        statusColor: 'green',
        endpoint: '/api/mercados'
      },
      {
        tipo: 'projetos',
        label: 'Projetos',
        total_geral: totalGeralProjetos || 0,
        total_filtrado: totalFiltradoProjetos || 0,
        percentual: calcularPercentual(totalFiltradoProjetos, totalGeralProjetos),
        icon: '📁',
        color: 'indigo',
        status: 'Em andamento',
        statusColor: 'green',
        endpoint: '/api/projetos'
      },
      {
        tipo: 'pesquisas',
        label: 'Pesquisas',
        total_geral: totalGeralPesquisas || 0,
        total_filtrado: totalFiltradoPesquisas || 0,
        percentual: calcularPercentual(totalFiltradoPesquisas, totalGeralPesquisas),
        icon: '🔍',
        color: 'pink',
        status: 'Processando',
        statusColor: 'yellow',
        endpoint: '/api/pesquisas'
      }
    ];

    return res.status(200).json({
      success: true,
      filtros: filtroInfo,
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
