/**
 * Teste do cliente ZANDEI que deu erro anteriormente
 * Agora com sistema de retry implementado
 */

import { enrichClienteOptimized } from "./server/enrichmentOptimized";

const clientId = 2405; // ZANDEI IND DE PLASTICOS LTDA

console.log("🧪 Testando cliente ZANDEI (ID: 2405) com sistema de retry...\n");
console.log("=".repeat(80));

const startTime = Date.now();

try {
  const result = await enrichClienteOptimized(clientId, 1);
  const duration = Date.now() - startTime;

  console.log("\n" + "=".repeat(80));
  console.log("✅ SUCESSO! Cliente enriquecido com retry");
  console.log("=".repeat(80));
  console.log(`\n📊 Resultados:`);
  console.log(`   - Mercados criados: ${result.mercadosCreated}`);
  console.log(`   - Produtos criados: ${result.produtosCreated}`);
  console.log(`   - Concorrentes criados: ${result.concorrentesCreated}`);
  console.log(`   - Leads criados: ${result.leadsCreated}`);
  console.log(`   - Duração: ${(duration / 1000).toFixed(2)}s`);

  process.exit(0);
} catch (error: any) {
  const duration = Date.now() - startTime;

  console.log("\n" + "=".repeat(80));
  console.log("❌ ERRO! Cliente não pôde ser enriquecido mesmo com retry");
  console.log("=".repeat(80));
  console.log(`\n🔍 Detalhes do erro:`);
  console.log(`   - Mensagem: ${error.message}`);
  console.log(`   - Duração: ${(duration / 1000).toFixed(2)}s`);

  if (error.stack) {
    console.log(`\n📋 Stack trace:`);
    console.log(error.stack);
  }

  process.exit(1);
}
