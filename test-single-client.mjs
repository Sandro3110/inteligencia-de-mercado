import { enrichClienteCompleto } from "./server/enrichmentV2.ts";
import { getDb } from "./server/db.ts";
import {
  clientes,
  mercadosUnicos,
  clientesMercados,
  produtos,
  concorrentes,
  leads,
} from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const PROJECT_ID = 1;

async function getRandomCliente() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, PROJECT_ID))
    .orderBy(sql`RAND()`)
    .limit(1);

  return cliente;
}

async function getClienteStats(clienteId) {
  const db = await getDb();
  if (!db) return null;

  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, clienteId))
    .limit(1);

  const mercadosResult = await db
    .select()
    .from(mercadosUnicos)
    .innerJoin(
      clientesMercados,
      eq(clientesMercados.mercadoId, mercadosUnicos.id)
    )
    .where(eq(clientesMercados.clienteId, clienteId));

  const produtosResult = await db
    .select()
    .from(produtos)
    .where(eq(produtos.clienteId, clienteId));

  const concorrentesResult = await db
    .select()
    .from(concorrentes)
    .where(eq(concorrentes.projectId, PROJECT_ID));

  const leadsResult = await db
    .select()
    .from(leads)
    .where(eq(leads.projectId, PROJECT_ID));

  return {
    cliente,
    mercados: mercadosResult.map(m => m.mercados_unicos),
    produtos: produtosResult,
    concorrentes: concorrentesResult,
    leads: leadsResult,
  };
}

async function main() {
  console.log("🚀 Teste de Enriquecimento - 1 Cliente Aleatório\n");
  console.log("=".repeat(60));

  // Buscar cliente aleatório
  const cliente = await getRandomCliente();
  if (!cliente) {
    console.error("❌ Nenhum cliente encontrado");
    process.exit(1);
  }

  console.log("\n📋 CLIENTE SELECIONADO:");
  console.log(`   ID: ${cliente.id}`);
  console.log(`   Nome: ${cliente.nome}`);
  console.log(`   CNPJ: ${cliente.cnpj || "não informado"}`);
  console.log(`   Produto: ${cliente.produtoPrincipal || "não informado"}`);
  console.log("\n" + "=".repeat(60));

  // Executar enriquecimento
  console.log("\n⏱️  Iniciando enriquecimento...\n");
  const startTime = Date.now();

  const result = await enrichClienteCompleto(cliente.id, PROJECT_ID);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ ENRIQUECIMENTO CONCLUÍDO!\n");
  console.log(`⏱️  Tempo total: ${duration}s`);
  console.log(`✓  Success: ${result.success}`);
  console.log(`✓  Mercados identificados: ${result.mercados}`);
  console.log(`✓  Produtos criados: ${result.produtos}`);
  console.log(`✓  Concorrentes encontrados: ${result.concorrentes}`);
  console.log(`✓  Leads gerados: ${result.leads}`);

  // Buscar dados completos
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 DADOS ENRIQUECIDOS:\n");

  const stats = await getClienteStats(cliente.id);

  if (stats) {
    console.log("👤 CLIENTE:");
    console.log(`   Nome: ${stats.cliente.nome}`);
    console.log(`   Email: ${stats.cliente.email || "não informado"}`);
    console.log(`   Telefone: ${stats.cliente.telefone || "não informado"}`);
    console.log(`   Site: ${stats.cliente.siteOficial || "não informado"}`);
    console.log(
      `   Cidade/UF: ${stats.cliente.cidade || "?"}/${stats.cliente.uf || "?"}`
    );
    console.log(`   Região: ${stats.cliente.regiao || "não informado"}`);
    console.log(`   Porte: ${stats.cliente.porte || "não informado"}`);
    console.log(`   CNAE: ${stats.cliente.cnae || "não informado"}`);
    console.log(
      `   Faturamento: ${stats.cliente.faturamentoDeclarado || "não informado"}`
    );
    console.log(
      `   Estabelecimentos: ${stats.cliente.numeroEstabelecimentos || "não informado"}`
    );
    console.log(
      `   Quality Score: ${stats.cliente.qualidadeScore || 0}/100 (${stats.cliente.qualidadeClassificacao || "N/A"})`
    );

    console.log("\n🏢 MERCADOS:");
    stats.mercados.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.nome}`);
      console.log(`      Segmentação: ${m.segmentacao}`);
      console.log(`      Tamanho: ${m.tamanhoMercado || "N/A"}`);
    });

    console.log("\n📦 PRODUTOS:");
    stats.produtos.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nome}`);
      console.log(`      Categoria: ${p.categoria || "N/A"}`);
      console.log(`      Preço: ${p.preco || "N/A"}`);
    });

    console.log("\n🎯 CONCORRENTES (amostra):");
    stats.concorrentes.slice(0, 5).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.nome}`);
      console.log(`      Cidade/UF: ${c.cidade || "?"}/${c.uf || "?"}`);
      console.log(`      Porte: ${c.porte || "N/A"}`);
    });

    console.log("\n🔥 LEADS (amostra):");
    stats.leads.slice(0, 5).forEach((l, i) => {
      console.log(`   ${i + 1}. ${l.nome}`);
      console.log(`      Tipo: ${l.tipo || "N/A"}`);
      console.log(`      Cidade/UF: ${l.cidade || "?"}/${l.uf || "?"}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n💰 ESTIMATIVA DE CUSTO:");
  console.log(`   Tokens estimados: ~8.000 tokens`);
  console.log(`   Custo estimado: ~$0,0012 USD`);
  console.log(`   (Gemini 1.5 Flash: $0,15 por 1M tokens)`);

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Teste concluído com sucesso!\n");
}

main().catch(error => {
  console.error("\n❌ Erro:", error);
  process.exit(1);
});
