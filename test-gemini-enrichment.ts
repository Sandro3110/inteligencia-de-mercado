/**
 * Teste de Enriquecimento Completo com Gemini
 * 
 * Testa o fluxo completo de enriquecimento com 1 cliente real
 */

import { enrichClienteWithGemini, enrichMercadoWithGemini, enrichConcorrenteWithGemini, enrichLeadWithGemini } from "./server/geminiEnrichment";
import { searchCompetitors, searchLeads } from "./server/_core/serpApi";
import { filterRealCompanies } from "./server/_core/companyFilters";

async function testGeminiEnrichment() {
  console.log("🧪 TESTE DE ENRIQUECIMENTO COMPLETO COM GEMINI\n");
  console.log("=".repeat(60));

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
  console.log(`\n📊 Score de Qualidade: ${clienteEnriquecido.qualidadeScore}/100 (${clienteEnriquecido.qualidadeClassificacao})\n`);

  // 2. MERCADO
  console.log("\n" + "=".repeat(60));
  console.log("\n📋 ETAPA 2: Enriquecendo MERCADO com Gemini...\n");

  const mercadoNome = "Embalagens Plásticas B2B";
  const produtosClientes = [clienteEnriquecido.produtoPrincipal];

  console.log(`Mercado: ${mercadoNome}`);
  console.log(`Produtos dos clientes: ${produtosClientes.join(", ")}\n`);

  const mercadoEnriquecido = await enrichMercadoWithGemini(mercadoNome, produtosClientes);

  if (!mercadoEnriquecido) {
    console.error("❌ Falha ao enriquecer mercado");
    return;
  }

  console.log("✅ Mercado enriquecido:");
  console.log(JSON.stringify(mercadoEnriquecido, null, 2));

  // 3. CONCORRENTES
  console.log("\n" + "=".repeat(60));
  console.log("\n📋 ETAPA 3: Buscando e enriquecendo CONCORRENTES...\n");

  console.log(`Buscando concorrentes para: ${mercadoNome}\n`);

  const rawConcorrentes = await searchCompetitors(mercadoNome, undefined, 5);
  const concorrentesFiltrados = filterRealCompanies(rawConcorrentes.map(c => ({
    nome: c.title,
    link: c.link,
  })));

  console.log(`✅ ${concorrentesFiltrados.length} concorrentes encontrados (após filtros)\n`);

  const concorrentesEnriquecidos = [];

  for (const [index, concorrente] of concorrentesFiltrados.slice(0, 3).entries()) {
    console.log(`[${index + 1}/${3}] Enriquecendo: ${concorrente.nome}`);

    const enriched = await enrichConcorrenteWithGemini({
      nome: concorrente.nome,
      site: concorrente.link,
      mercadoNome,
    });

    if (enriched) {
      concorrentesEnriquecidos.push({
        nome: concorrente.nome,
        site: concorrente.link,
        ...enriched,
      });
      console.log(`   ✅ Score: ${enriched.qualidadeScore}/100 (${enriched.qualidadeClassificacao})`);
    } else {
      console.log(`   ❌ Falha ao enriquecer`);
    }
  }

  console.log(`\n✅ ${concorrentesEnriquecidos.length} concorrentes enriquecidos com sucesso\n`);

  // 4. LEADS
  console.log("\n" + "=".repeat(60));
  console.log("\n📋 ETAPA 4: Buscando e enriquecendo LEADS...\n");

  console.log(`Buscando leads (fornecedores) para: ${mercadoNome}\n`);

  const rawLeads = await searchLeads(mercadoNome, "fornecedores", 5);
  const leadsFiltrados = filterRealCompanies(rawLeads.map(l => ({
    nome: l.title,
    link: l.link,
  })));

  console.log(`✅ ${leadsFiltrados.length} leads encontrados (após filtros)\n`);

  const leadsEnriquecidos = [];

  for (const [index, lead] of leadsFiltrados.slice(0, 3).entries()) {
    console.log(`[${index + 1}/${3}] Enriquecendo: ${lead.nome}`);

    const enriched = await enrichLeadWithGemini({
      nome: lead.nome,
      site: lead.link,
      mercadoNome,
    });

    if (enriched) {
      leadsEnriquecidos.push({
        nome: lead.nome,
        site: lead.link,
        ...enriched,
      });
      console.log(`   ✅ Score: ${enriched.qualidadeScore}/100 (${enriched.qualidadeClassificacao})`);
    } else {
      console.log(`   ❌ Falha ao enriquecer`);
    }
  }

  console.log(`\n✅ ${leadsEnriquecidos.length} leads enriquecidos com sucesso\n`);

  // RESUMO FINAL
  console.log("\n" + "=".repeat(60));
  console.log("🎉 TESTE COMPLETO!\n");
  console.log("📊 RESUMO:");
  console.log(`   Cliente: ${clienteEnriquecido.qualidadeScore}/100 (${clienteEnriquecido.qualidadeClassificacao})`);
  console.log(`   Mercado: Enriquecido com ${Object.keys(mercadoEnriquecido).length} campos`);
  console.log(`   Concorrentes: ${concorrentesEnriquecidos.length} enriquecidos`);
  console.log(`   Leads: ${leadsEnriquecidos.length} enriquecidos`);

  // Salvar resultado em arquivo
  const resultado = {
    cliente: { ...clienteTeste, ...clienteEnriquecido },
    mercado: { nome: mercadoNome, ...mercadoEnriquecido },
    concorrentes: concorrentesEnriquecidos,
    leads: leadsEnriquecidos,
  };

  const fs = await import("fs/promises");
  await fs.writeFile(
    "/tmp/gemini-enrichment-test-result.json",
    JSON.stringify(resultado, null, 2),
    "utf-8"
  );

  console.log("\n✅ Resultado salvo em: /tmp/gemini-enrichment-test-result.json");
}

testGeminiEnrichment()
  .then(() => {
    console.log("\n✅ Teste concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro no teste:", error);
    process.exit(1);
  });
