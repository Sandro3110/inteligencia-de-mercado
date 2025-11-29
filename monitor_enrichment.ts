/**
 * Monitor Visual de Enriquecimento
 * Acompanhamento em tempo real do progresso
 */

import { getJobProgress } from './server/enrichmentJobManager';

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function drawProgressBar(percentage: number, width: number = 50): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let color = '\x1b[32m'; // Verde
  if (percentage < 30)
    color = '\x1b[31m'; // Vermelho
  else if (percentage < 70) color = '\x1b[33m'; // Amarelo

  return `${color}${bar}\x1b[0m ${percentage.toFixed(1)}%`;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return 'Calculando...';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return formatTime(seconds);
}

async function monitorJob(jobId: number) {
  let iteration = 0;
  const lastUpdate = Date.now();

  while (true) {
    try {
      const progress = await getJobProgress(jobId);

      clearScreen();

      // Header
      console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
      console.log('║                  🚀 MONITOR DE ENRIQUECIMENTO - TECHFILMS                 ║');
      console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
      console.log('');

      // Status
      const statusEmoji = {
        pending: '⏸️',
        running: '▶️',
        paused: '⏸️',
        completed: '✅',
        failed: '❌',
      };

      const statusColor = {
        pending: '\x1b[33m',
        running: '\x1b[32m',
        paused: '\x1b[33m',
        completed: '\x1b[32m',
        failed: '\x1b[31m',
      };

      console.log(
        `  ${statusEmoji[progress.status]} Status: ${statusColor[progress.status]}${progress.status.toUpperCase()}\x1b[0m`
      );
      console.log(`  🆔 Job ID: ${jobId}`);
      console.log('');

      // Progresso Geral
      console.log('┌─────────────────────────────────────────────────────────────────────────┐');
      console.log('│ 📊 PROGRESSO GERAL                                                      │');
      console.log('├─────────────────────────────────────────────────────────────────────────┤');
      console.log(`│ ${drawProgressBar(progress.percentComplete, 65)} │`);
      console.log('├─────────────────────────────────────────────────────────────────────────┤');
      console.log(
        `│  Processados: ${progress.processedClientes.toString().padEnd(3)} / ${progress.totalClientes.toString().padEnd(3)} clientes${' '.repeat(40)}│`
      );
      console.log(
        `│  Batch Atual: ${progress.currentBatch.toString().padEnd(3)} / ${progress.totalBatches.toString().padEnd(3)} batches${' '.repeat(41)}│`
      );
      console.log('└─────────────────────────────────────────────────────────────────────────┘');
      console.log('');

      // Resultados
      const successRate =
        progress.processedClientes > 0
          ? (progress.successClientes / progress.processedClientes) * 100
          : 0;

      const failRate =
        progress.processedClientes > 0
          ? (progress.failedClientes / progress.processedClientes) * 100
          : 0;

      console.log('┌─────────────────────────────────────────────────────────────────────────┐');
      console.log('│ 📈 RESULTADOS                                                           │');
      console.log('├─────────────────────────────────────────────────────────────────────────┤');
      console.log(
        `│  ✅ Sucessos:  ${progress.successClientes.toString().padEnd(3)} (${successRate.toFixed(1).padStart(5)}%)${' '.repeat(45)}│`
      );
      console.log(
        `│  ❌ Falhas:    ${progress.failedClientes.toString().padEnd(3)} (${failRate.toFixed(1).padStart(5)}%)${' '.repeat(45)}│`
      );
      console.log('└─────────────────────────────────────────────────────────────────────────┘');
      console.log('');

      // Tempo
      console.log('┌─────────────────────────────────────────────────────────────────────────┐');
      console.log('│ ⏱️  TEMPO                                                                │');
      console.log('├─────────────────────────────────────────────────────────────────────────┤');

      if (progress.estimatedTimeRemaining > 0) {
        console.log(
          `│  Tempo Restante: ${formatTime(progress.estimatedTimeRemaining).padEnd(20)}${' '.repeat(40)}│`
        );
      } else {
        console.log(`│  Tempo Restante: Calculando...${' '.repeat(48)}│`);
      }

      console.log('└─────────────────────────────────────────────────────────────────────────┘');
      console.log('');

      // Footer
      const now = new Date();
      console.log(`  🕐 Última atualização: ${now.toLocaleTimeString('pt-BR')}`);
      console.log(`  🔄 Atualização #${iteration + 1}`);
      console.log('');

      if (progress.status === 'completed') {
        console.log('  🎉 \x1b[32mENRIQUECIMENTO CONCLUÍDO COM SUCESSO!\x1b[0m');
        console.log('');
        break;
      }

      if (progress.status === 'failed') {
        console.log('  ❌ \x1b[31mENRIQUECIMENTO FALHOU!\x1b[0m');
        console.log('');
        break;
      }

      console.log('  💡 Pressione Ctrl+C para sair do monitor');
      console.log('');

      // Aguardar 5 segundos
      await new Promise((resolve) => setTimeout(resolve, 5000));
      iteration++;
    } catch (error) {
      console.error('\n❌ Erro ao buscar progresso:', error);
      console.log('\n🔄 Tentando novamente em 5 segundos...\n');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Executar
const jobId = parseInt(process.argv[2] || '7');

console.log(`\n🚀 Iniciando monitor para Job ID: ${jobId}\n`);

monitorJob(jobId).catch((error) => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
