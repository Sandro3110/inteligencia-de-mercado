import mysql from 'mysql2/promise';
import { enrichClientesParallel } from './server/enrichmentOptimized';
import fs from 'fs';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║    TESTE COMPARATIVO: OTIMIZADO (1 call) vs ANTIGO (13 calls) ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Selecionar 5 clientes que ainda não foram enriquecidos
    const [clientes] = await connection.query<any[]>(`
      SELECT id, nome, cnpj, produtoPrincipal
      FROM clientes
      WHERE projectId = 1
      AND id NOT IN (SELECT DISTINCT clienteId FROM clientes_mercados)
      ORDER BY RAND()
      LIMIT 5
    `);
    
    if (clientes.length === 0) {
      console.log('❌ Nenhum cliente disponível para teste\n');
      await connection.end();
      return;
    }
    
    console.log('📋 Clientes Selecionados para Teste:');
    clientes.forEach((c: any, i: number) => {
      console.log(`   ${i + 1}. ${c.nome}`);
      console.log(`      CNPJ: ${c.cnpj}`);
      console.log(`      Produto: ${c.produtoPrincipal?.substring(0, 60) || 'N/A'}...`);
    });
    console.log('');
    
    const clienteIds = clientes.map((c: any) => c.id);
    const startTime = Date.now();
    
    console.log('🚀 Iniciando enriquecimento OTIMIZADO (Paralelo, 1 call OpenAI)...\n');
    console.log('═'.repeat(70));
    
    const results = await enrichClientesParallel(clienteIds, 1, 5, (current, total, result) => {
      if (result.success) {
        console.log(`✅ [${current}/${total}] Cliente ${result.clienteId}: ${(result.duration / 1000).toFixed(1)}s | ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`);
      } else {
        console.log(`❌ [${current}/${total}] Cliente ${result.clienteId}: FALHOU - ${result.error}`);
      }
    });
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('═'.repeat(70));
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESULTADO CONSOLIDADO                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    const totalMercados = results.reduce((sum, r) => sum + r.mercadosCreated, 0);
    const totalProdutos = results.reduce((sum, r) => sum + r.produtosCreated, 0);
    const totalConcorrentes = results.reduce((sum, r) => sum + r.concorrentesCreated, 0);
    const totalLeads = results.reduce((sum, r) => sum + r.leadsCreated, 0);
    
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000;
    
    console.log(`📊 Resultados:`);
    console.log(`   ✅ Sucesso: ${successCount}/${results.length} clientes (${(successCount/results.length*100).toFixed(0)}%)`);
    console.log(`   ❌ Falhas: ${failCount}/${results.length} clientes`);
    console.log(`\n⏱️  Performance:`);
    console.log(`   Tempo Total: ${totalDuration}s`);
    console.log(`   Tempo Médio por Cliente: ${avgDuration.toFixed(1)}s`);
    console.log(`   Throughput: ${(results.length / parseFloat(totalDuration) * 60).toFixed(1)} clientes/min`);
    console.log(`\n📦 Registros Criados:`);
    console.log(`   - Mercados: ${totalMercados}`);
    console.log(`   - Produtos: ${totalProdutos}`);
    console.log(`   - Concorrentes: ${totalConcorrentes}`);
    console.log(`   - Leads: ${totalLeads}`);
    console.log(`   - TOTAL: ${totalMercados + totalProdutos + totalConcorrentes + totalLeads} registros`);
    
    // Buscar estatísticas de qualidade
    const [stats] = await connection.query<any[]>(`
      SELECT 
        (SELECT AVG(qualidadeScore) FROM concorrentes WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as avgScoreConcorrentes,
        (SELECT AVG(qualidadeScore) FROM leads WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as avgScoreLeads,
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1 AND cnpj IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as concorrentesComCNPJ,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1 AND cnpj IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as leadsComCNPJ
    `);
    
    console.log(`\n📈 Quality Scores (últimos 5 min):`);
    console.log(`   - Concorrentes: ${stats[0].avgScoreConcorrentes?.toFixed(1) || 'N/A'}/100`);
    console.log(`   - Leads: ${stats[0].avgScoreLeads?.toFixed(1) || 'N/A'}/100`);
    console.log(`\n🎯 CNPJs Encontrados:`);
    console.log(`   - Concorrentes: ${stats[0].concorrentesComCNPJ}/${totalConcorrentes} (${(stats[0].concorrentesComCNPJ/totalConcorrentes*100).toFixed(0)}%)`);
    console.log(`   - Leads: ${stats[0].leadsComCNPJ}/${totalLeads} (${(stats[0].leadsComCNPJ/totalLeads*100).toFixed(0)}%)`);
    
    // Projeção para 801 clientes
    const projectedTime = (avgDuration * 801 / 5); // 5 clientes em paralelo
    const projectedCost = (801 * 0.01); // ~$0.01 por cliente (1 chamada OpenAI)
    
    console.log(`\n🔮 Projeção para 801 Clientes:`);
    console.log(`   ⏱️  Tempo Estimado: ${(projectedTime / 60).toFixed(1)} minutos (${(projectedTime / 3600).toFixed(2)}h)`);
    console.log(`   💰 Custo Estimado: $${projectedCost.toFixed(2)} USD`);
    console.log(`   📊 Registros Esperados: ~${(totalMercados + totalProdutos + totalConcorrentes + totalLeads) * 801 / 5} registros`);
    
    // Comparação com versão antiga
    console.log(`\n📊 COMPARAÇÃO: Otimizado vs Antigo`);
    console.log(`\n┌─────────────────────┬──────────────┬──────────────┬──────────────┐`);
    console.log(`│ Métrica             │ OTIMIZADO    │ ANTIGO       │ Melhoria     │`);
    console.log(`├─────────────────────┼──────────────┼──────────────┼──────────────┤`);
    console.log(`│ Tempo/Cliente       │ ${avgDuration.toFixed(1).padEnd(12)} │ 150s         │ ${(150/avgDuration).toFixed(1)}x mais rápido │`);
    console.log(`│ Chamadas OpenAI     │ 1            │ 10-13        │ 10-13x menos │`);
    console.log(`│ Chamadas SerpAPI    │ 0            │ 45           │ 100% menos   │`);
    console.log(`│ Tempo Total (801)   │ ${(projectedTime/60).toFixed(0)}min        │ 2000min      │ ${(2000/(projectedTime/60)).toFixed(0)}x mais rápido │`);
    console.log(`│ Custo (801)         │ $${projectedCost.toFixed(2)}        │ $72          │ ${(72/projectedCost).toFixed(0)}x mais barato│`);
    console.log(`└─────────────────────┴──────────────┴──────────────┴──────────────┘`);
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      version: 'OPTIMIZED',
      clientes: clientes.map((c: any) => ({ id: c.id, nome: c.nome })),
      results,
      summary: {
        successCount,
        failCount,
        totalDuration: parseFloat(totalDuration),
        avgDuration,
        throughput: results.length / parseFloat(totalDuration) * 60,
        totalMercados,
        totalProdutos,
        totalConcorrentes,
        totalLeads,
        avgScoreConcorrentes: stats[0].avgScoreConcorrentes,
        avgScoreLeads: stats[0].avgScoreLeads,
        concorrentesComCNPJ: stats[0].concorrentesComCNPJ,
        leadsComCNPJ: stats[0].leadsComCNPJ
      },
      projection: {
        time: projectedTime,
        cost: projectedCost,
        records: (totalMercados + totalProdutos + totalConcorrentes + totalLeads) * 801 / 5
      }
    };
    
    fs.writeFileSync('/home/ubuntu/TEST_OPTIMIZED_REPORT.json', JSON.stringify(report, null, 2));
    console.log(`\n💾 Relatório salvo em: /home/ubuntu/TEST_OPTIMIZED_REPORT.json`);
    
    console.log('\n════════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
