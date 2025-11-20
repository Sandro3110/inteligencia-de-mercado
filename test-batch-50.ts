/**
 * Teste de Processamento em Blocos - 1 Bloco de 50 Clientes
 * Relatório emitido apenas no final
 */

import { startBatchEnrichment, BatchProgress, BatchResult } from './server/enrichmentBatchProcessor';

const pesquisaId = 1; // Embalagens 2025
const batchSize = 50;

console.log('🚀 Iniciando teste de processamento em blocos');
console.log(`📦 Tamanho do bloco: ${batchSize} clientes`);
console.log(`🔍 Pesquisa ID: ${pesquisaId}`);
console.log('⏳ Processando... (relatório será emitido no final)\n');

const startTime = Date.now();
let lastProgress: BatchProgress | null = null;
const batchResults: BatchResult[] = [];

// Callbacks
const onProgress = (progress: BatchProgress) => {
  lastProgress = progress;
  // Mostrar apenas progresso simples
  process.stdout.write(`\r⏳ Progresso: ${progress.processados}/${progress.totalClientes} (${progress.percentual}%) - Bloco ${progress.blocoAtual}/${progress.totalBlocos}`);
};

const onBatchComplete = (result: BatchResult) => {
  batchResults.push(result);
};

const onError = (error: Error, clientId: number) => {
  // Silencioso durante processamento
};

// Executar
try {
  await startBatchEnrichment({
    pesquisaId,
    batchSize,
    onProgress,
    onBatchComplete,
    onError
  });
  
  const totalDuration = Date.now() - startTime;
  
  // Limpar linha de progresso
  process.stdout.write('\r' + ' '.repeat(100) + '\r');
  
  // RELATÓRIO FINAL
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO FINAL - TESTE DE 1 BLOCO');
  console.log('='.repeat(80));
  
  if (lastProgress) {
    console.log('\n📈 Estatísticas Gerais:');
    console.log(`   Total de clientes: ${lastProgress.totalClientes}`);
    console.log(`   Processados: ${lastProgress.processados}`);
    console.log(`   Sucessos: ${lastProgress.sucessos} (${Math.round((lastProgress.sucessos / lastProgress.processados) * 100)}%)`);
    console.log(`   Erros: ${lastProgress.erros} (${Math.round((lastProgress.erros / lastProgress.processados) * 100)}%)`);
    console.log(`   Tempo total: ${Math.round(totalDuration / 1000)}s (~${Math.round(totalDuration / 60000)} minutos)`);
    console.log(`   Tempo médio por cliente: ${Math.round(totalDuration / lastProgress.processados / 1000)}s`);
  }
  
  if (batchResults.length > 0) {
    console.log('\n📦 Resultados por Bloco:');
    batchResults.forEach(result => {
      console.log(`\n   Bloco ${result.blocoNumero}:`);
      console.log(`     - Clientes: ${result.clientesProcessados}`);
      console.log(`     - Sucessos: ${result.sucessos}`);
      console.log(`     - Erros: ${result.erros}`);
      console.log(`     - Tempo: ${result.tempoBloco}s`);
      if (result.clientesComErro.length > 0) {
        console.log(`     - IDs com erro: ${result.clientesComErro.join(', ')}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Teste concluído com sucesso!');
  console.log('='.repeat(80));
  
  process.exit(0);
  
} catch (error: any) {
  console.error('\n❌ Erro durante processamento:', error.message);
  process.exit(1);
}
