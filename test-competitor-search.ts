/**
 * Teste Individual: Busca de Concorrentes
 * Cliente: Jeep do Brasil
 * Mercado: Automotivo
 */

import { invokeLLM } from "./server/_core/llm";
import { callDataApi } from "./server/_core/dataApi";

async function testCompetitorSearch() {
  console.log("🏢 Teste de Busca de Concorrentes\n");
  console.log("Cliente: Jeep do Brasil");
  console.log("Mercado: Automotivo\n");
  console.log("═".repeat(70));

  try {
    console.log("\n📡 Chamando LLM para listar concorrentes...\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em análise de mercado. Liste empresas concorrentes no mercado especificado.",
        },
        {
          role: "user",
          content: `Mercado: Automotivo\n\nListe 5 principais empresas concorrentes neste mercado no Brasil. Retorne JSON com: { "concorrentes": [{ "nome": "Nome da empresa", "produto": "Produto principal" }] }`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "competitors_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              concorrentes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    produto: { type: "string" },
                  },
                  required: ["nome", "produto"],
                  additionalProperties: false,
                },
              },
            },
            required: ["concorrentes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content || typeof content !== "string") {
      console.error("❌ Resposta inválida do LLM");
      return;
    }

    const competitorData = JSON.parse(content);

    console.log("✅ Concorrentes identificados com sucesso!\n");
    console.log("📊 CONCORRENTES ENCONTRADOS:");
    console.log("═".repeat(70));

    const enrichedCompetitors = [];

    for (let i = 0; i < competitorData.concorrentes.length; i++) {
      const comp = competitorData.concorrentes[i];
      console.log(`\n${i + 1}. ${comp.nome}`);
      console.log(`   Produto: ${comp.produto}`);

      // Tentar enriquecer via Data API
      console.log(`   🔍 Enriquecendo dados via Data API...`);
      try {
        const apiResult = await callDataApi(comp.nome);
        if (apiResult) {
          console.log(`   ✅ Dados enriquecidos:`);
          console.log(`      CNPJ: ${apiResult.cnpj || "N/A"}`);
          console.log(`      Site: ${apiResult.site || "N/A"}`);
          console.log(`      Porte: ${apiResult.porte || "N/A"}`);
          enrichedCompetitors.push({ ...comp, ...apiResult, enriched: true });
        } else {
          console.log(`   ⚠️  Dados não encontrados na API`);
          enrichedCompetitors.push({ ...comp, enriched: false });
        }
      } catch (error: any) {
        console.log(`   ❌ Erro ao enriquecer: ${error.message}`);
        enrichedCompetitors.push({ ...comp, enriched: false });
      }
    }

    console.log("\n" + "═".repeat(70));

    // Validação de qualidade
    console.log("\n🔍 VALIDAÇÃO:");
    const validations = [
      {
        test: "Pelo menos 3 concorrentes retornados",
        passed: competitorData.concorrentes.length >= 3,
      },
      {
        test: "Todos os concorrentes têm nome",
        passed: competitorData.concorrentes.every(
          (c: any) => c.nome && c.nome.length > 0
        ),
      },
      {
        test: "Todos os concorrentes têm produto",
        passed: competitorData.concorrentes.every(
          (c: any) => c.produto && c.produto.length > 0
        ),
      },
      {
        test: "Concorrentes relacionados ao setor automotivo",
        passed: competitorData.concorrentes.some(
          (c: any) =>
            c.nome.toLowerCase().includes("fiat") ||
            c.nome.toLowerCase().includes("ford") ||
            c.nome.toLowerCase().includes("chevrolet") ||
            c.nome.toLowerCase().includes("volkswagen") ||
            c.nome.toLowerCase().includes("toyota") ||
            c.nome.toLowerCase().includes("honda") ||
            c.nome.toLowerCase().includes("hyundai") ||
            c.nome.toLowerCase().includes("nissan") ||
            c.nome.toLowerCase().includes("renault") ||
            c.produto.toLowerCase().includes("veículo") ||
            c.produto.toLowerCase().includes("veiculo") ||
            c.produto.toLowerCase().includes("carro") ||
            c.produto.toLowerCase().includes("automóv") ||
            c.produto.toLowerCase().includes("automov")
        ),
      },
      {
        test: "Pelo menos 1 concorrente enriquecido via API",
        passed: enrichedCompetitors.some((c: any) => c.enriched),
      },
    ];

    validations.forEach(v => {
      console.log(`  ${v.passed ? "✅" : "❌"} ${v.test}`);
    });

    const allPassed = validations.every(v => v.passed);
    const criticalPassed = validations.slice(0, 4).every(v => v.passed);

    console.log("\n" + "═".repeat(70));
    if (allPassed) {
      console.log(
        "✅ TESTE APROVADO - Busca de concorrentes funcionando perfeitamente"
      );
    } else if (criticalPassed) {
      console.log(
        "⚠️  TESTE PARCIAL - Funcionalidade core OK, enriquecimento pode melhorar"
      );
    } else {
      console.log("❌ TESTE REPROVADO - Algumas validações críticas falharam");
    }
    console.log("═".repeat(70));

    // Estatísticas
    console.log("\n📊 ESTATÍSTICAS:");
    console.log(
      `  Total de concorrentes: ${competitorData.concorrentes.length}`
    );
    console.log(
      `  Enriquecidos com sucesso: ${enrichedCompetitors.filter((c: any) => c.enriched).length}`
    );
    console.log(
      `  Taxa de enriquecimento: ${((enrichedCompetitors.filter((c: any) => c.enriched).length / competitorData.concorrentes.length) * 100).toFixed(1)}%`
    );

    // Metadados da resposta
    console.log("\n📋 METADADOS DA RESPOSTA LLM:");
    console.log(`  Modelo: ${response.model || "N/A"}`);
    console.log(`  Tokens usados: ${response.usage?.total_tokens || "N/A"}`);
  } catch (error: any) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

// Executar teste
testCompetitorSearch();
