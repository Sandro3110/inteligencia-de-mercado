// TESTE COMPARATIVO: Batch Multi-Cliente vs Individual
import { getDb } from './server/db';
import { clientes } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { generateAllDataOptimized } from './server/integrations/openaiOptimized';
import { generateBatchDataOptimized } from './server/integrations/openaiOptimized_batch';
import * as fs from 'fs';

interface TestResult {
  method: 'individual' | 'batch';
  totalClientes: number;
  totalTime: number;
  avgTimePerCliente: number;
  successCount: number;
  failCount: number;
  totalMercados: number;
  totalConcorrentes: number;
  totalLeads: number;
  duplicatesDetected: number;
  qualityScores: number[];
  errors: string[];
}

async function testIndividual(clientesList: any[]): Promise<TestResult> {
  console.log('\n📊 TESTE 1: MÉTODO INDIVIDUAL (1 por vez)');
  console.log('='.repeat(80));

  const startTime = Date.now();
  const result: TestResult = {
    method: 'individual',
    totalClientes: clientesList.length,
    totalTime: 0,
    avgTimePerCliente: 0,
    successCount: 0,
    failCount: 0,
    totalMercados: 0,
    totalConcorrentes: 0,
    totalLeads: 0,
    duplicatesDetected: 0,
    qualityScores: [],
    errors: [],
  };

  for (let i = 0; i < clientesList.length; i++) {
    const cliente = clientesList[i];
    console.log(`\n[${i + 1}/${clientesList.length}] ${cliente.nome}`);

    const clienteStartTime = Date.now();

    try {
      const data = await generateAllDataOptimized({
        nome: cliente.nome || '',
        cnpj: cliente.cnpj || '',
        siteOficial: cliente.siteOficial || '',
        produtoPrincipal: cliente.produtoPrincipal || '',
        cidade: cliente.cidade || '',
        uf: cliente.uf || '',
      });

      const clienteDuration = Date.now() - clienteStartTime;

      if (data && data.mercados && data.mercados.length > 0) {
        result.successCount++;
        result.totalMercados += data.mercados.length;

        data.mercados.forEach((m: any) => {
          result.totalConcorrentes += m.concorrentes?.length || 0;
          result.totalLeads += m.leads?.length || 0;
        });

        console.log(
          `   ✅ ${(clienteDuration / 1000).toFixed(1)}s - ${data.mercados.length}M ${data.mercados.reduce((sum: number, m: any) => sum + (m.concorrentes?.length || 0), 0)}C ${data.mercados.reduce((sum: number, m: any) => sum + (m.leads?.length || 0), 0)}L`
        );
      } else {
        result.failCount++;
        result.errors.push(`${cliente.nome}: No mercados returned`);
        console.log(`   ❌ ${(clienteDuration / 1000).toFixed(1)}s - Falha`);
      }
    } catch (error: any) {
      result.failCount++;
      result.errors.push(`${cliente.nome}: ${error.message}`);
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }

  result.totalTime = Date.now() - startTime;
  result.avgTimePerCliente = result.totalTime / clientesList.length;

  return result;
}

async function testBatch(clientesList: any[]): Promise<TestResult> {
  console.log('\n📊 TESTE 2: MÉTODO BATCH (5 por vez)');
  console.log('='.repeat(80));

  const startTime = Date.now();
  const result: TestResult = {
    method: 'batch',
    totalClientes: clientesList.length,
    totalTime: 0,
    avgTimePerCliente: 0,
    successCount: 0,
    failCount: 0,
    totalMercados: 0,
    totalConcorrentes: 0,
    totalLeads: 0,
    duplicatesDetected: 0,
    qualityScores: [],
    errors: [],
  };

  const clientesInput = clientesList.map((c) => ({
    id: c.id,
    nome: c.nome || '',
    cnpj: c.cnpj || '',
    siteOficial: c.siteOficial || '',
    produtoPrincipal: c.produtoPrincipal || '',
    cidade: c.cidade || '',
    uf: c.uf || '',
  }));

  console.log(`\nEnviando batch de ${clientesInput.length} clientes...`);

  try {
    const batchResult = await generateBatchDataOptimized(clientesInput);

    if (batchResult.success && batchResult.data.length > 0) {
      result.successCount = batchResult.data.length;

      // Analisar duplicatas
      const allConcorrentes = new Map<string, number>();
      const allLeads = new Map<string, number>();

      batchResult.data.forEach((clienteData: any) => {
        if (clienteData.mercados) {
          result.totalMercados += clienteData.mercados.length;

          clienteData.mercados.forEach((m: any) => {
            // Contar concorrentes
            if (m.concorrentes) {
              result.totalConcorrentes += m.concorrentes.length;
              m.concorrentes.forEach((c: any) => {
                const key = c.nome.toLowerCase().trim();
                allConcorrentes.set(key, (allConcorrentes.get(key) || 0) + 1);
              });
            }

            // Contar leads
            if (m.leads) {
              result.totalLeads += m.leads.length;
              m.leads.forEach((l: any) => {
                const key = l.nome.toLowerCase().trim();
                allLeads.set(key, (allLeads.get(key) || 0) + 1);
              });
            }
          });
        }
      });

      // Detectar duplicatas
      allConcorrentes.forEach((count) => {
        if (count > 1) result.duplicatesDetected++;
      });
      allLeads.forEach((count) => {
        if (count > 1) result.duplicatesDetected++;
      });

      console.log(`\n✅ Batch concluído em ${(batchResult.duration / 1000).toFixed(1)}s`);
      console.log(`   ${result.successCount} clientes enriquecidos`);
      console.log(`   ${result.totalMercados}M ${result.totalConcorrentes}C ${result.totalLeads}L`);
      if (result.duplicatesDetected > 0) {
        console.log(`   ⚠️  ${result.duplicatesDetected} duplicatas detectadas`);
      }
    } else {
      result.failCount = clientesList.length;
      result.errors.push(batchResult.error || 'Batch failed');
      console.log(`\n❌ Batch falhou: ${batchResult.error}`);
    }
  } catch (error: any) {
    result.failCount = clientesList.length;
    result.errors.push(error.message);
    console.log(`\n❌ Erro no batch: ${error.message}`);
  }

  result.totalTime = Date.now() - startTime;
  result.avgTimePerCliente = result.totalTime / clientesList.length;

  return result;
}

async function main() {
  console.log('================================================================================');
  console.log('🧪 TESTE COMPARATIVO: BATCH vs INDIVIDUAL');
  console.log('================================================================================\n');

  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  // Buscar 10 clientes do projeto Embalagens
  const clientesList = await db.select().from(clientes).where(eq(clientes.projectId, 1)).limit(10);

  console.log(`✅ ${clientesList.length} clientes selecionados para teste\n`);

  // Dividir em 2 grupos de 5
  const grupo1 = clientesList.slice(0, 5);
  const grupo2 = clientesList.slice(5, 10);

  // TESTE 1: Individual (grupo 1)
  const resultIndividual = await testIndividual(grupo1);

  // Aguardar 5 segundos entre testes
  console.log('\n⏳ Aguardando 5 segundos...\n');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // TESTE 2: Batch (grupo 2)
  const resultBatch = await testBatch(grupo2);

  // COMPARAÇÃO
  console.log(
    '\n\n================================================================================'
  );
  console.log('📊 COMPARAÇÃO DE RESULTADOS');
  console.log('================================================================================\n');

  const comparison = {
    individual: resultIndividual,
    batch: resultBatch,
    analysis: {
      performanceGain:
        ((resultIndividual.avgTimePerCliente - resultBatch.avgTimePerCliente) /
          resultIndividual.avgTimePerCliente) *
        100,
      successRateIndividual: (resultIndividual.successCount / resultIndividual.totalClientes) * 100,
      successRateBatch: (resultBatch.successCount / resultBatch.totalClientes) * 100,
      avgConcorrentesIndividual:
        resultIndividual.totalConcorrentes / (resultIndividual.successCount || 1),
      avgConcorrentesBatch: resultBatch.totalConcorrentes / (resultBatch.successCount || 1),
      avgLeadsIndividual: resultIndividual.totalLeads / (resultIndividual.successCount || 1),
      avgLeadsBatch: resultBatch.totalLeads / (resultBatch.successCount || 1),
    },
  };

  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│ PERFORMANCE                                                             │');
  console.log('├─────────────────────────────────────────────────────────────────────────┤');
  console.log(
    `│ Individual: ${(resultIndividual.avgTimePerCliente / 1000).toFixed(1)}s/cliente (total: ${(resultIndividual.totalTime / 1000).toFixed(1)}s)`.padEnd(
      74
    ) + '│'
  );
  console.log(
    `│ Batch:      ${(resultBatch.avgTimePerCliente / 1000).toFixed(1)}s/cliente (total: ${(resultBatch.totalTime / 1000).toFixed(1)}s)`.padEnd(
      74
    ) + '│'
  );
  console.log(
    `│ Ganho:      ${comparison.analysis.performanceGain.toFixed(1)}% mais rápido`.padEnd(74) + '│'
  );
  console.log('└─────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TAXA DE SUCESSO                                                         │');
  console.log('├─────────────────────────────────────────────────────────────────────────┤');
  console.log(
    `│ Individual: ${resultIndividual.successCount}/${resultIndividual.totalClientes} (${comparison.analysis.successRateIndividual.toFixed(1)}%)`.padEnd(
      74
    ) + '│'
  );
  console.log(
    `│ Batch:      ${resultBatch.successCount}/${resultBatch.totalClientes} (${comparison.analysis.successRateBatch.toFixed(1)}%)`.padEnd(
      74
    ) + '│'
  );
  console.log('└─────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│ QUALIDADE (Média por cliente)                                           │');
  console.log('├─────────────────────────────────────────────────────────────────────────┤');
  console.log(
    `│ Individual: ${comparison.analysis.avgConcorrentesIndividual.toFixed(1)} concorrentes, ${comparison.analysis.avgLeadsIndividual.toFixed(1)} leads`.padEnd(
      74
    ) + '│'
  );
  console.log(
    `│ Batch:      ${comparison.analysis.avgConcorrentesBatch.toFixed(1)} concorrentes, ${comparison.analysis.avgLeadsBatch.toFixed(1)} leads`.padEnd(
      74
    ) + '│'
  );
  console.log('└─────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│ DUPLICAÇÃO                                                              │');
  console.log('├─────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ Batch: ${resultBatch.duplicatesDetected} duplicatas detectadas`.padEnd(74) + '│');
  console.log('└─────────────────────────────────────────────────────────────────────────┘\n');

  // Salvar relatório
  const reportPath = '/home/ubuntu/relatorio_batch_vs_individual.json';
  fs.writeFileSync(reportPath, JSON.stringify(comparison, null, 2));
  console.log(`✅ Relatório salvo: ${reportPath}\n`);

  // RECOMENDAÇÃO
  console.log('================================================================================');
  console.log('🎯 RECOMENDAÇÃO');
  console.log('================================================================================\n');

  if (
    comparison.analysis.performanceGain > 30 &&
    comparison.analysis.successRateBatch >= comparison.analysis.successRateIndividual &&
    resultBatch.duplicatesDetected < 5
  ) {
    console.log('✅ IMPLEMENTAR BATCH');
    console.log('   - Performance significativamente melhor');
    console.log('   - Taxa de sucesso mantida ou melhorada');
    console.log('   - Duplicação controlável');
  } else if (comparison.analysis.performanceGain > 30 && resultBatch.duplicatesDetected >= 5) {
    console.log('⚠️  IMPLEMENTAR BATCH COM DEDUPLICAÇÃO');
    console.log('   - Performance melhor, mas duplicação alta');
    console.log('   - Necessário algoritmo de deduplicação robusto');
  } else {
    console.log('❌ MANTER MÉTODO INDIVIDUAL');
    console.log('   - Ganho de performance insuficiente');
    console.log('   - Ou taxa de sucesso inferior');
  }

  console.log('\n✅ Teste concluído!');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
});
