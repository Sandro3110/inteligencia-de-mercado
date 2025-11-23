/**
 * Teste simplificado das correções (sem TypeScript)
 */

import { getDb } from "./server/db.js";
import { clientes } from "./drizzle/schema.js";
import { enrichClientesParallel } from "./server/enrichmentOptimized.js";
import { eq, and, isNull } from "drizzle-orm";

async function test() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║           TESTE DAS 3 CORREÇÕES DE BUGS                       ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  const db = await getDb();
  if (!db) {
    console.error("❌ Banco de dados não disponível");
    process.exit(1);
  }

  // 1. Buscar 5 clientes não enriquecidos
  console.log("📋 Buscando 5 clientes não enriquecidos...\n");

  const clientesNaoEnriquecidos = await db
    .select()
    .from(clientes)
    .where(and(eq(clientes.projectId, 1), isNull(clientes.validationStatus)))
    .limit(5);

  if (clientesNaoEnriquecidos.length === 0) {
    console.log("⚠️ Não há clientes não enriquecidos disponíveis");
    process.exit(0);
  }

  console.log(`✅ Encontrados ${clientesNaoEnriquecidos.length} clientes:\n`);
  clientesNaoEnriquecidos.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nome} (ID: ${c.id})`);
  });

  // 2. Enriquecer clientes
  console.log("\n🚀 Iniciando enriquecimento...\n");

  const startTime = Date.now();
  const clienteIds = clientesNaoEnriquecidos.map(c => c.id);

  const results = await enrichClientesParallel(clienteIds, 1);

  const duration = (Date.now() - startTime) / 1000;

  // 3. Verificar resultados
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                    RESULTADOS DO TESTE                         ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  console.log(`⏱️  Tempo total: ${duration.toFixed(1)}s`);
  console.log(
    `📊 Taxa: ${((clientesNaoEnriquecidos.length / duration) * 60).toFixed(1)} clientes/min\n`
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Sucesso: ${successful}/${clientesNaoEnriquecidos.length}`);
  console.log(`❌ Falhas: ${failed}/${clientesNaoEnriquecidos.length}\n`);

  // 4. Verificar correções no banco
  console.log("🔍 VERIFICANDO CORREÇÕES NO BANCO:\n");

  // Bug Fix 1: Campo produto em concorrentes
  const [concorrenteCheck] = await db.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(produto) as comProduto,
      ROUND(COUNT(produto) * 100.0 / COUNT(*), 1) as percentual
    FROM concorrentes
    WHERE mercadoId IN (
      SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (${clienteIds.join(",")})
    )
  `);

  console.log("✅ BUG FIX 1 - Campo produto em concorrentes:");
  console.log(`   Total: ${concorrenteCheck[0].total}`);
  console.log(
    `   Com produto: ${concorrenteCheck[0].comProduto} (${concorrenteCheck[0].percentual}%)\n`
  );

  // Bug Fix 2: Quality Score e Classificação
  const [qualityCheck] = await db.execute(`
    SELECT 
      'Concorrentes' as tipo,
      MIN(qualidadeScore) as minScore,
      MAX(qualidadeScore) as maxScore,
      AVG(qualidadeScore) as avgScore,
      COUNT(DISTINCT qualidadeScore) as uniqueScores,
      COUNT(qualidadeClassificacao) as comClassificacao
    FROM concorrentes
    WHERE mercadoId IN (
      SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (${clienteIds.join(",")})
    )
    UNION ALL
    SELECT 
      'Leads' as tipo,
      MIN(qualidadeScore) as minScore,
      MAX(qualidadeScore) as maxScore,
      AVG(qualidadeScore) as avgScore,
      COUNT(DISTINCT qualidadeScore) as uniqueScores,
      COUNT(qualidadeClassificacao) as comClassificacao
    FROM leads
    WHERE mercadoId IN (
      SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (${clienteIds.join(",")})
    )
  `);

  console.log("✅ BUG FIX 2 - Quality Score melhorado:");
  qualityCheck.forEach(row => {
    console.log(`   ${row.tipo}:`);
    console.log(
      `     - Score: ${row.minScore} a ${row.maxScore} (média: ${row.avgScore.toFixed(1)})`
    );
    console.log(`     - Scores únicos: ${row.uniqueScores} (antes: sempre 65)`);
    console.log(`     - Com classificação: ${row.comClassificacao}\n`);
  });

  // Bug Fix 3: Campo ativo em produtos
  const [produtoCheck] = await db.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(ativo) as ativos,
      ROUND(SUM(ativo) * 100.0 / COUNT(*), 1) as percentual
    FROM produtos
    WHERE clienteId IN (${clienteIds.join(",")})
  `);

  console.log("✅ BUG FIX 3 - Campo ativo em produtos:");
  console.log(`   Total: ${produtoCheck[0].total}`);
  console.log(
    `   Ativos: ${produtoCheck[0].ativos} (${produtoCheck[0].percentual}%)`
  );
  console.log(`   Esperado: 100% ativos\n`);

  // 5. Validação final
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                    VALIDAÇÃO FINAL                             ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  const produtoOK = produtoCheck[0].percentual == 100;
  const qualityOK = qualityCheck[0].uniqueScores > 1; // Deve ter variação
  const concorrenteOK = concorrenteCheck[0].percentual == 100;

  console.log(
    `${concorrenteOK ? "✅" : "❌"} Bug Fix 1 (produto): ${concorrenteOK ? "OK" : "FALHOU"}`
  );
  console.log(
    `${qualityOK ? "✅" : "❌"} Bug Fix 2 (quality): ${qualityOK ? "OK" : "FALHOU"}`
  );
  console.log(
    `${produtoOK ? "✅" : "❌"} Bug Fix 3 (ativo): ${produtoOK ? "OK" : "FALHOU"}\n`
  );

  if (produtoOK && qualityOK && concorrenteOK) {
    console.log("🎉 TODAS AS CORREÇÕES VALIDADAS COM SUCESSO!\n");
    console.log("✅ Sistema pronto para produção\n");
  } else {
    console.log("⚠️ Algumas correções falharam. Revisar código.\n");
  }

  process.exit(0);
}

test().catch(console.error);
