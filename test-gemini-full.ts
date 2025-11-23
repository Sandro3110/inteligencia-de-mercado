/**
 * Teste de Enriquecimento Completo com Gemini (SEM SerpAPI)
 *
 * Testa o fluxo completo gerando TUDO via Gemini
 */

import {
  enrichClienteWithGemini,
  enrichMercadoWithGemini,
  generateConcorrentesWithGemini,
  generateLeadsWithGemini,
} from "./server/geminiEnrichmentFull";

async function testGeminiFullEnrichment() {
  console.log("🧪 TESTE DE ENRIQUECIMENTO COMPLETO COM GEMINI (SEM SerpAPI)\n");
  console.log("=".repeat(70));

  // 1. CLIENTE DE TESTE
  const clienteTeste = {
    nome: "Embalagens Plásticas Ltda",
    cnpj: "12345678000190",
    siteOficial: "https://www.embalagenplasticas.com.br",
    cnae: "2222-6/00",
    cidade: "São Paulo",
    uf: "SP",
  };

  console.log("\n📋 ETAPA 1: Enriquecendo CLIENTE com Gemini...\n");
  console.log(`Cliente: ${clienteTeste.nome}`);
  console.log(`CNPJ: ${clienteTeste.cnpj}`);
  console.log(`Site: ${clienteTeste.siteOficial}\n`);

  const clienteEnriquecido = await enrichClienteWithGemini(clienteTeste);

  if (!clienteEnriquecido) {
    console.error("❌ Falha ao enriquecer cliente");
    return;
  }

  console.log("✅ Cliente enriquecido:");
  console.log(JSON.stringify(clienteEnriquecido, null, 2));
  console.log(
    `\n📊 Score: ${clienteEnriquecido.qualidadeScore}/100 (${clienteEnriquecido.qualidadeClassificacao})\n`
  );

  // 2. MERCADO
  console.log("\n" + "=".repeat(70));
  console.log("\n📋 ETAPA 2: Enriquecendo MERCADO com Gemini...\n");

  const mercadoNome = "Embalagens Plásticas B2B";
  const produtosClientes = [clienteEnriquecido.produtoPrincipal];

  console.log(`Mercado: ${mercadoNome}\n`);

  const mercadoEnriquecido = await enrichMercadoWithGemini(
    mercadoNome,
    produtosClientes
  );

  if (!mercadoEnriquecido) {
    console.error("❌ Falha ao enriquecer mercado");
    return;
  }

  console.log("✅ Mercado enriquecido:");
  console.log(JSON.stringify(mercadoEnriquecido, null, 2));

  // 3. CONCORRENTES (GERADOS PELO GEMINI)
  console.log("\n" + "=".repeat(70));
  console.log("\n📋 ETAPA 3: Gerando CONCORRENTES com Gemini...\n");

  console.log(`Gerando 20 concorrentes para: ${mercadoNome}\n`);

  const concorrentes = await generateConcorrentesWithGemini(mercadoNome, 20);

  console.log(`✅ ${concorrentes.length} concorrentes gerados\n`);

  concorrentes.forEach((c, index) => {
    console.log(`[${index + 1}] ${c.nome}`);
    console.log(`    CNPJ: ${c.cnpj}`);
    console.log(`    Site: ${c.site}`);
    console.log(`    Porte: ${c.porte}`);
    console.log(`    Faturamento: ${c.faturamentoEstimado}`);
    console.log(
      `    Score: ${c.qualidadeScore}/100 (${c.qualidadeClassificacao})\n`
    );
  });

  // 4. LEADS (GERADOS PELO GEMINI)
  console.log("\n" + "=".repeat(70));
  console.log("\n📋 ETAPA 4: Gerando LEADS com Gemini...\n");

  console.log(`Gerando 20 leads (fornecedores) para: ${mercadoNome}\n`);

  const leads = await generateLeadsWithGemini(mercadoNome, "fornecedor", 20);

  console.log(`✅ ${leads.length} leads gerados\n`);

  leads.forEach((l, index) => {
    console.log(`[${index + 1}] ${l.nome}`);
    console.log(`    CNPJ: ${l.cnpj}`);
    console.log(`    Site: ${l.site}`);
    console.log(`    Email: ${l.email}`);
    console.log(`    Telefone: ${l.telefone}`);
    console.log(
      `    Tipo: ${l.tipo} | Porte: ${l.porte} | Região: ${l.regiao}`
    );
    console.log(
      `    Score: ${l.qualidadeScore}/100 (${l.qualidadeClassificacao})\n`
    );
  });

  // RESUMO FINAL
  console.log("\n" + "=".repeat(70));
  console.log("🎉 TESTE COMPLETO!\n");
  console.log("📊 RESUMO:");
  console.log(
    `   Cliente: ${clienteEnriquecido.qualidadeScore}/100 (${clienteEnriquecido.qualidadeClassificacao})`
  );
  console.log(
    `   Mercado: Enriquecido com ${Object.keys(mercadoEnriquecido).length} campos`
  );
  console.log(`   Concorrentes: ${concorrentes.length} gerados`);
  console.log(`   Leads: ${leads.length} gerados`);

  const avgScoreConcorrentes =
    concorrentes.reduce((sum, c) => sum + c.qualidadeScore, 0) /
    concorrentes.length;
  const avgScoreLeads =
    leads.reduce((sum, l) => sum + l.qualidadeScore, 0) / leads.length;

  console.log(
    `\n   Score médio concorrentes: ${avgScoreConcorrentes.toFixed(1)}/100`
  );
  console.log(`   Score médio leads: ${avgScoreLeads.toFixed(1)}/100`);

  // Salvar resultado em arquivo
  const resultado = {
    cliente: { ...clienteTeste, ...clienteEnriquecido },
    mercado: { nome: mercadoNome, ...mercadoEnriquecido },
    concorrentes,
    leads,
    estatisticas: {
      totalConcorrentes: concorrentes.length,
      totalLeads: leads.length,
      scoreMedioConcorrentes: avgScoreConcorrentes,
      scoreMedioLeads: avgScoreLeads,
    },
  };

  const fs = await import("fs/promises");
  await fs.writeFile(
    "/tmp/gemini-full-enrichment-result.json",
    JSON.stringify(resultado, null, 2),
    "utf-8"
  );

  console.log(
    "\n✅ Resultado salvo em: /tmp/gemini-full-enrichment-result.json"
  );
}

testGeminiFullEnrichment()
  .then(() => {
    console.log("\n✅ Teste concluído com sucesso!");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ Erro no teste:", error);
    process.exit(1);
  });
