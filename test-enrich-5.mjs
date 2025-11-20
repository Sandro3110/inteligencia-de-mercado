/**
 * Teste de enriquecimento com 5 clientes
 */

import { enrichClienteOptimized } from './server/enrichmentOptimized.ts';

const clientIds = [1, 2, 3, 4, 5];

console.log('🚀 Iniciando teste de enriquecimento com 5 clientes...\n');

for (const clientId of clientIds) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 Enriquecendo cliente ID: ${clientId}`);
    console.log('='.repeat(80));
    
    const result = await enrichClienteOptimized(clientId, 1);
    
    console.log('\n✅ Resultado:');
    console.log(`   - Mercados criados: ${result.mercadosCreated}`);
    console.log(`   - Produtos criados: ${result.produtosCreated}`);
    console.log(`   - Concorrentes criados: ${result.concorrentesCreated}`);
    console.log(`   - Leads criados: ${result.leadsCreated}`);
    console.log(`   - Duração: ${(result.duration / 1000).toFixed(2)}s`);
    
  } catch (error) {
    console.error(`\n❌ Erro ao enriquecer cliente ${clientId}:`, error.message);
  }
}

console.log('\n\n🎉 Teste concluído!');
process.exit(0);
