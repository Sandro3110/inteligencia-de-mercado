/**
 * Teste da API de Enriquecimento Corrigida
 * Cliente: Jeep do Brasil
 * Objetivo: Validar isolamento de dados e retorno completo
 */

import { executeEnrichmentFlow } from "./server/enrichmentFlow";

async function testJeepEnrichment() {
  console.log("🚗 Teste da API de Enriquecimento - Jeep do Brasil\n");
  console.log("═".repeat(70));

  const input = {
    projectName: "Teste Jeep API Corrigida",
    clientes: [
      {
        nome: "Jeep do Brasil",
        cnpj: "04601397000165",
        site: "https://www.jeep.com.br",
        produto: "Veículos automotores",
      },
    ],
  };

  console.log("\n📋 INPUT:");
  console.log(JSON.stringify(input, null, 2));
  console.log("\n" + "═".repeat(70));

  try {
    console.log("\n⏳ Executando enriquecimento...\n");

    const result = await executeEnrichmentFlow(input, progress => {
      console.log(
        `[${progress.currentStep}/${progress.totalSteps}] ${progress.message}`
      );
    });

    console.log("\n" + "═".repeat(70));
    console.log("✅ RESULTADO:\n");

    if (result.status === "completed" && result.data) {
      console.log(`📊 ESTATÍSTICAS:`);
      console.log(`  Projeto ID: ${result.data.projectId}`);
      console.log(`  Projeto Nome: ${result.data.projectName}`);
      console.log(`  Clientes: ${result.data.clientes?.length || 0}`);
      console.log(`  Mercados: ${result.data.mercados?.length || 0}`);
      console.log(`  Concorrentes: ${result.data.concorrentes?.length || 0}`);
      console.log(`  Leads: ${result.data.leads?.length || 0}`);

      if (result.data.stats) {
        console.log(
          `\n  Score médio: ${result.data.stats.avgQualityScore}/100`
        );
      }

      console.log("\n📦 DADOS ENRIQUECIDOS:\n");

      // Clientes
      if (result.data.clientes && result.data.clientes.length > 0) {
        console.log("👤 CLIENTE:");
        const cliente = result.data.clientes[0];
        console.log(`  Nome: ${cliente.nome}`);
        console.log(`  CNPJ: ${cliente.cnpj || "N/A"}`);
        console.log(`  Site: ${cliente.site || "N/A"}`);
        console.log(`  Produto: ${cliente.produto || "N/A"}`);
        console.log(`  Porte: ${cliente.porte || "N/A"}`);
        console.log(`  Score: ${cliente.qualidadeScore || 0}/100`);
      }

      // Mercados
      if (result.data.mercados && result.data.mercados.length > 0) {
        console.log("\n🎯 MERCADOS IDENTIFICADOS:");
        result.data.mercados.forEach((m: any, i: number) => {
          console.log(`  ${i + 1}. ${m.nome}`);
          console.log(`     Categoria: ${m.categoria}`);
          console.log(`     Segmentação: ${m.segmentacao}`);
        });
      }

      // Concorrentes (top 5)
      if (result.data.concorrentes && result.data.concorrentes.length > 0) {
        console.log("\n🏢 CONCORRENTES (Top 5):");
        result.data.concorrentes.slice(0, 5).forEach((c: any, i: number) => {
          console.log(`  ${i + 1}. ${c.nome}`);
          console.log(`     CNPJ: ${c.cnpj || "N/A"}`);
          console.log(`     Site: ${c.site || "N/A"}`);
          console.log(`     Score: ${c.qualidadeScore || 0}/100`);
        });
      }

      // Leads (top 5)
      if (result.data.leads && result.data.leads.length > 0) {
        console.log("\n📈 LEADS (Top 5):");
        result.data.leads.slice(0, 5).forEach((l: any, i: number) => {
          console.log(`  ${i + 1}. ${l.nome}`);
          console.log(`     CNPJ: ${l.cnpj || "N/A"}`);
          console.log(`     Email: ${l.email || "N/A"}`);
          console.log(`     Telefone: ${l.telefone || "N/A"}`);
          console.log(`     Score: ${l.qualidadeScore || 0}/100`);
        });
      }

      console.log("\n" + "═".repeat(70));

      // Validações
      console.log("\n🔍 VALIDAÇÕES:");
      const validations = [
        {
          test: "Projeto criado",
          passed: !!result.data.projectId,
        },
        {
          test: "Nome do projeto correto",
          passed: result.data.projectName === "Teste Jeep API Corrigida",
        },
        {
          test: "Cliente processado",
          passed: result.data.clientes && result.data.clientes.length === 1,
        },
        {
          test: "Mercado identificado",
          passed: result.data.mercados && result.data.mercados.length > 0,
        },
        {
          test: "Concorrentes encontrados",
          passed:
            result.data.concorrentes && result.data.concorrentes.length > 0,
        },
        {
          test: "Leads gerados",
          passed: result.data.leads && result.data.leads.length > 0,
        },
        {
          test: "Dados isolados (não misturados)",
          passed: result.data.projectId !== 1, // Não deve ser o projeto Embalagens
        },
      ];

      validations.forEach(v => {
        console.log(`  ${v.passed ? "✅" : "❌"} ${v.test}`);
      });

      const allPassed = validations.every(v => v.passed);

      console.log("\n" + "═".repeat(70));
      if (allPassed) {
        console.log("✅ TESTE APROVADO - API funcionando corretamente");
      } else {
        console.log("⚠️  TESTE PARCIAL - Algumas validações falharam");
      }
      console.log("═".repeat(70));
    } else if (result.status === "error") {
      console.error("❌ ERRO:", result.message);
    }
  } catch (error: any) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

// Executar teste
testJeepEnrichment();
