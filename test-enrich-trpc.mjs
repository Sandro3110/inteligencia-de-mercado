/**
 * Teste de enriquecimento via tRPC com IDs reais
 */

// Vamos usar IDs que sabemos que existem (300003+)
const clientIds = [300003, 300004, 300005, 300006, 300007];

console.log('🚀 Testando enriquecimento com 5 clientes via HTTP...\n');

for (const clientId of clientIds) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 Enriquecendo cliente ID: ${clientId}`);
    console.log('='.repeat(80));
    
    const response = await fetch('http://localhost:3000/api/trpc/enrichmentOptimized.enrichOne', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          clienteId,
          projectId: 1
        }
      })
    });
    
    const data = await response.json();
    
    if (data.result?.data) {
      const result = data.result.data;
      console.log('\n✅ Resultado:');
      console.log(`   - Mercados criados: ${result.mercadosCreated || 0}`);
      console.log(`   - Produtos criados: ${result.produtosCreated || 0}`);
      console.log(`   - Concorrentes criados: ${result.concorrentesCreated || 0}`);
      console.log(`   - Leads criados: ${result.leadsCreated || 0}`);
      console.log(`   - Duração: ${((result.duration || 0) / 1000).toFixed(2)}s`);
    } else {
      console.error('\n❌ Erro:', data.error || 'Resposta inválida');
    }
    
  } catch (error) {
    console.error(`\n❌ Erro ao enriquecer cliente ${clientId}:`, error.message);
  }
}

console.log('\n\n🎉 Teste concluído!');
