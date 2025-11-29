// TESTE SIMPLIFICADO: Batch vs Individual
import { getDb } from './server/db';
import { clientes } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { enrichClienteOptimized } from './server/enrichmentOptimized';

async function main() {
  console.log('================================================================================');
  console.log('🧪 TESTE SIMPLIFICADO: PERFORMANCE ATUAL');
  console.log('================================================================================\n');

  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  // Buscar 5 clientes do projeto Embalagens
  const clientesList = await db.select().from(clientes).where(eq(clientes.projectId, 1)).limit(5);

  console.log(`✅ ${clientesList.length} clientes selecionados\n`);

  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < clientesList.length; i++) {
    const cliente = clientesList[i];
    console.log(`\n[${i + 1}/5] Enriquecendo: ${cliente.nome}`);

    const clienteStartTime = Date.now();
    const result = await enrichClienteOptimized(cliente.id);
    const clienteDuration = Date.now() - clienteStartTime;

    results.push({
      nome: cliente.nome,
      success: result.success,
      duration: clienteDuration,
      mercados: result.mercadosCreated,
      concorrentes: result.concorrentesCreated,
      leads: result.leadsCreated,
      error: result.error,
    });

    if (result.success) {
      console.log(`   ✅ ${(clienteDuration / 1000).toFixed(1)}s`);
      console.log(
        `   📊 ${result.mercadosCreated}M ${result.concorrentesCreated}C ${result.leadsCreated}L`
      );
    } else {
      console.log(`   ❌ Falha: ${result.error}`);
    }
  }

  const totalDuration = Date.now() - startTime;

  console.log(
    '\n\n================================================================================'
  );
  console.log('📊 RESULTADOS');
  console.log('================================================================================\n');

  const sucessos = results.filter((r) => r.success).length;
  const falhas = results.filter((r) => !r.success).length;
  const avgDuration =
    results.filter((r) => r.success).reduce((sum, r) => sum + r.duration, 0) / (sucessos || 1);

  console.log(`✅ Sucessos: ${sucessos}/5 (${((sucessos / 5) * 100).toFixed(1)}%)`);
  console.log(`❌ Falhas: ${falhas}/5 (${((falhas / 5) * 100).toFixed(1)}%)`);
  console.log(`⏱️  Tempo médio: ${(avgDuration / 1000).toFixed(1)}s por cliente`);
  console.log(`⏱️  Tempo total: ${(totalDuration / 1000).toFixed(1)}s`);

  const totalMercados = results.reduce((sum, r) => sum + r.mercados, 0);
  const totalConcorrentes = results.reduce((sum, r) => sum + r.concorrentes, 0);
  const totalLeads = results.reduce((sum, r) => sum + r.leads, 0);

  console.log(`\n📈 Total criado:`);
  console.log(`   Mercados: ${totalMercados}`);
  console.log(`   Concorrentes: ${totalConcorrentes}`);
  console.log(`   Leads: ${totalLeads}`);

  if (sucessos > 0) {
    console.log(`\n📊 Média por cliente (sucessos):`);
    console.log(`   Mercados: ${(totalMercados / sucessos).toFixed(1)}`);
    console.log(`   Concorrentes: ${(totalConcorrentes / sucessos).toFixed(1)}`);
    console.log(`   Leads: ${(totalLeads / sucessos).toFixed(1)}`);
  }

  console.log(
    '\n\n================================================================================'
  );
  console.log('🎯 ANÁLISE PARA BATCH MULTI-CLIENTE');
  console.log('================================================================================\n');

  console.log('📊 PROJEÇÃO COM BATCH DE 5 CLIENTES:\n');
  console.log(`Atual (individual):`);
  console.log(`   - Tempo total: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`   - Chamadas OpenAI: 5`);
  console.log(`   - Queries DB: ~${5 * 4} (4 por cliente)\n`);

  console.log(`Proposto (batch 5):`);
  console.log(`   - Tempo estimado: 30-40s (60% mais rápido)`);
  console.log(`   - Chamadas OpenAI: 1`);
  console.log(`   - Queries DB: ~5-10 (1 mega insert)\n`);

  console.log(`💡 GANHOS ESPERADOS:`);
  console.log(
    `   ✅ Performance: ${((1 - 35 / (totalDuration / 1000)) * 100).toFixed(1)}% mais rápido`
  );
  console.log(`   ✅ Redução de chamadas OpenAI: 80%`);
  console.log(`   ✅ Redução de queries DB: 75%`);
  console.log(`   ✅ Redução de conexões simultâneas (resolve timeout Supabase)`);

  console.log('\n✅ Teste concluído!');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
});
