import { enrichClienteCompleto } from "./server/enrichmentV2.ts";
import { getDb } from "./server/db.ts";
import {
  clientes,
  mercadosUnicos,
  produtos,
  concorrentes,
  leads,
} from "./drizzle/schema.ts";
import { eq, sql } from "drizzle-orm";

const PROJECT_ID = 1;

async function main() {
  console.log("🚀 Teste de Enriquecimento - 5 Clientes Aleatórios\n");
  console.log("=".repeat(70));

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  // Buscar 5 clientes aleatórios
  const clientesList = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, PROJECT_ID))
    .orderBy(sql`RAND()`)
    .limit(5);

  if (clientesList.length === 0) {
    console.error("❌ Nenhum cliente encontrado");
    process.exit(1);
  }

  console.log(`\n📋 ${clientesList.length} CLIENTES SELECIONADOS:\n`);
  clientesList.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nome} (ID: ${c.id})`);
    console.log(`   CNPJ: ${c.cnpj || "não informado"}`);
    console.log(
      `   Produto: ${c.produtoPrincipal?.substring(0, 80) || "não informado"}...`
    );
  });

  console.log("\n" + "=".repeat(70));
  console.log("\n⏱️  Iniciando enriquecimento de 5 clientes...\n");

  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < clientesList.length; i++) {
    const cliente = clientesList[i];
    const clienteNum = i + 1;

    console.log(`[${clienteNum}/5] Processando: ${cliente.nome}...`);

    try {
      const result = await enrichClienteCompleto(cliente.id, PROJECT_ID);
      results.push({
        clienteId: cliente.id,
        nome: cliente.nome,
        ...result,
      });

      console.log(
        `   ✅ Sucesso! Mercados: ${result.mercados}, Produtos: ${result.produtos}, Concorrentes: ${result.concorrentes}, Leads: ${result.leads}`
      );
    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}`);
      results.push({
        clienteId: cliente.id,
        nome: cliente.nome,
        success: false,
        error: error.message,
      });
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const durationMin = (duration / 60).toFixed(1);

  console.log("\n" + "=".repeat(70));
  console.log("\n✅ ENRIQUECIMENTO CONCLUÍDO!\n");
  console.log(`⏱️  Tempo total: ${duration}s (~${durationMin} minutos)`);
  console.log(
    `⏱️  Tempo médio por cliente: ${(duration / clientesList.length).toFixed(2)}s\n`
  );

  // Estatísticas
  const successCount = results.filter(r => r.success).length;
  const totalMercados = results.reduce((sum, r) => sum + (r.mercados || 0), 0);
  const totalProdutos = results.reduce((sum, r) => sum + (r.produtos || 0), 0);
  const totalConcorrentes = results.reduce(
    (sum, r) => sum + (r.concorrentes || 0),
    0
  );
  const totalLeads = results.reduce((sum, r) => sum + (r.leads || 0), 0);

  console.log("📊 ESTATÍSTICAS GERAIS:\n");
  console.log(
    `   Clientes processados: ${successCount}/${clientesList.length}`
  );
  console.log(`   Total mercados identificados: ${totalMercados}`);
  console.log(`   Total produtos criados: ${totalProdutos}`);
  console.log(`   Total concorrentes encontrados: ${totalConcorrentes}`);
  console.log(`   Total leads gerados: ${totalLeads}\n`);

  // Buscar dados únicos do banco
  const [mercadosUnicosCount] = await db
    .select({ count: sql`COUNT(DISTINCT id)` })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, PROJECT_ID));
  const [produtosUnicos] = await db
    .select({ count: sql`COUNT(*)` })
    .from(produtos)
    .where(eq(produtos.projectId, PROJECT_ID));
  const [concorrentesUnicos] = await db
    .select({ count: sql`COUNT(DISTINCT concorrenteHash)` })
    .from(concorrentes)
    .where(eq(concorrentes.projectId, PROJECT_ID));
  const [leadsUnicos] = await db
    .select({ count: sql`COUNT(DISTINCT leadHash)` })
    .from(leads)
    .where(eq(leads.projectId, PROJECT_ID));

  console.log("📊 DEDUPLICAÇÃO (Registros únicos no banco):\n");
  console.log(
    `   Mercados únicos: ${mercadosUnicosCount.count} (de ${totalMercados} identificações)`
  );
  console.log(
    `   Produtos únicos: ${produtosUnicos.count} (de ${totalProdutos} criações)`
  );
  console.log(
    `   Concorrentes únicos: ${concorrentesUnicos.count} (de ${totalConcorrentes} encontrados)`
  );
  console.log(
    `   Leads únicos: ${leadsUnicos.count} (de ${totalLeads} gerados)\n`
  );

  const taxaMercados = (
    (1 - mercadosUnicosCount.count / totalMercados) *
    100
  ).toFixed(1);
  const taxaConcorrentes = (
    (1 - concorrentesUnicos.count / totalConcorrentes) *
    100
  ).toFixed(1);
  const taxaLeads = ((1 - leadsUnicos.count / totalLeads) * 100).toFixed(1);

  console.log("📊 TAXA DE DEDUPLICAÇÃO:\n");
  console.log(
    `   Mercados: ${taxaMercados}% (${totalMercados - mercadosUnicosCount.count} reutilizados)`
  );
  console.log(
    `   Concorrentes: ${taxaConcorrentes}% (${totalConcorrentes - concorrentesUnicos.count} reutilizados)`
  );
  console.log(
    `   Leads: ${taxaLeads}% (${totalLeads - leadsUnicos.count} reutilizados)\n`
  );

  console.log("💰 ESTIMATIVA DE CUSTO:\n");
  const tokensEstimados = clientesList.length * 10000; // ~10k tokens por cliente
  const custoEstimado = ((tokensEstimados / 1000000) * 0.15).toFixed(4);
  console.log(
    `   Tokens estimados: ~${tokensEstimados.toLocaleString()} tokens`
  );
  console.log(`   Custo estimado: ~$${custoEstimado} USD\n`);

  console.log("=".repeat(70));
  console.log("\n🎉 Teste concluído com sucesso!\n");

  // Mostrar resumo por cliente
  console.log("📋 RESUMO POR CLIENTE:\n");
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.nome}`);
    if (r.success) {
      console.log(
        `   ✅ Mercados: ${r.mercados}, Produtos: ${r.produtos}, Concorrentes: ${r.concorrentes}, Leads: ${r.leads}`
      );
    } else {
      console.log(`   ❌ Erro: ${r.error}`);
    }
  });

  console.log("\n");
}

main().catch(error => {
  console.error("\n❌ Erro fatal:", error);
  process.exit(1);
});
