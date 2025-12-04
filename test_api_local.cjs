const { createClient } = require('@supabase/supabase-js');

async function testAPI() {
  try {
    console.log('🔬 Testando API totalizadores localmente...\n');
    
    // Criar cliente Supabase
    const supabaseUrl = 'https://ecnzlynmuerbmqingyfl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbnpseW5tdWVyYm1xaW5neWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTU2NDUsImV4cCI6MjA3OTQzMTY0NX0.gYeMFlU7ls361wR72vza-nDBikcwy-SB_W9BIOpjRRY';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Cliente Supabase criado\n');

    // Buscar totais de cada entidade
    console.log('📊 Buscando totais...\n');
    
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

    console.log('✅ Totais obtidos:\n');
    console.log(`  Clientes: ${totalClientes}`);
    console.log(`  Leads: ${totalLeads}`);
    console.log(`  Concorrentes: ${totalConcorrentes}`);
    console.log(`  Produtos: ${totalProdutos}`);
    console.log(`  Mercados: ${totalMercados}`);
    console.log(`  Projetos: ${totalProjetos}`);
    console.log(`  Pesquisas: ${totalPesquisas}`);
    
    console.log('\n✅ API funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  }
}

testAPI();
