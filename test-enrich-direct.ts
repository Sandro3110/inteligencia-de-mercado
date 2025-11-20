/**
 * Teste direto de enriquecimento com 5 clientes
 */

import { enrichClienteOptimized } from './server/enrichmentOptimized';

// IDs dos primeiros 5 clientes (IDs reais do banco)
const clientIds = [2205, 2405, 2406, 2407, 2408];

console.log('🚀 Iniciando teste de enriquecimento com 5 clientes...\n');

const results = [];

for (const clientId of clientIds) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 Enriquecendo cliente ID: ${clientId}`);
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    const result = await enrichClienteOptimized(clientId, 1);
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Resultado:');
    console.log(`   - Sucesso: ${result.success}`);
    console.log(`   - Mercados criados: ${result.mercadosCreated}`);
    console.log(`   - Produtos criados: ${result.produtosCreated}`);
    console.log(`   - Concorrentes criados: ${result.concorrentesCreated}`);
    console.log(`   - Leads criados: ${result.leadsCreated}`);
    console.log(`   - Duração: ${(duration / 1000).toFixed(2)}s`);
    
    results.push({
      clientId,
      success: result.success,
      mercados: result.mercadosCreated,
      produtos: result.produtosCreated,
      concorrentes: result.concorrentesCreated,
      leads: result.leadsCreated,
      duration
    });
    
  } catch (error: any) {
    console.error(`\n❌ Erro ao enriquecer cliente ${clientId}:`, error.message);
    results.push({
      clientId,
      success: false,
      error: error.message
    });
  }
}

console.log('\n\n' + '='.repeat(80));
console.log('📊 RESUMO DO TESTE');
console.log('='.repeat(80));

const successful = results.filter(r => r.success).length;
console.log(`\n✅ Clientes enriquecidos com sucesso: ${successful}/${clientIds.length}`);

if (successful > 0) {
  const totalMercados = results.reduce((sum, r) => sum + (r.mercados || 0), 0);
  const totalProdutos = results.reduce((sum, r) => sum + (r.produtos || 0), 0);
  const totalConcorrentes = results.reduce((sum, r) => sum + (r.concorrentes || 0), 0);
  const totalLeads = results.reduce((sum, r) => sum + (r.leads || 0), 0);
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  
  console.log(`\n📈 Totais gerados:`);
  console.log(`   - Mercados: ${totalMercados}`);
  console.log(`   - Produtos: ${totalProdutos}`);
  console.log(`   - Concorrentes: ${totalConcorrentes}`);
  console.log(`   - Leads: ${totalLeads}`);
  console.log(`   - Tempo total: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`   - Média por cliente: ${(totalDuration / successful / 1000).toFixed(2)}s`);
}

console.log('\n🎉 Teste concluído!');
process.exit(0);
