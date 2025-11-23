/**
 * Teste Individual: Geração de Mercados via LLM
 * Cliente: Jeep do Brasil
 * Produto: Veículos automotores
 */

import { invokeLLM } from "./server/_core/llm";

async function testMarketGeneration() {
  console.log("🎯 Teste de Geração de Mercados via LLM\n");
  console.log("Cliente: Jeep do Brasil");
  console.log("Produto: Veículos automotores\n");
  console.log("═".repeat(60));

  try {
    console.log("\n📡 Chamando LLM para identificar mercado...\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em análise de mercado. Identifique o mercado/setor para o produto fornecido.",
        },
        {
          role: "user",
          content: `Produto: Veículos automotores\n\nRetorne JSON com: { "mercado": "nome do mercado", "categoria": "categoria", "segmentacao": "B2B ou B2C" }`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "market_identification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              mercado: { type: "string" },
              categoria: { type: "string" },
              segmentacao: { type: "string", enum: ["B2B", "B2C", "B2B2C"] },
            },
            required: ["mercado", "categoria", "segmentacao"],
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

    const marketData = JSON.parse(content);

    console.log("✅ Mercado identificado com sucesso!\n");
    console.log("📊 RESULTADO:");
    console.log("═".repeat(60));
    console.log(`Mercado:      ${marketData.mercado}`);
    console.log(`Categoria:    ${marketData.categoria}`);
    console.log(`Segmentação:  ${marketData.segmentacao}`);
    console.log("═".repeat(60));

    // Validação de qualidade
    console.log("\n🔍 VALIDAÇÃO:");
    const validations = [
      {
        test: "Mercado não vazio",
        passed: marketData.mercado && marketData.mercado.length > 0,
      },
      {
        test: "Categoria não vazia",
        passed: marketData.categoria && marketData.categoria.length > 0,
      },
      {
        test: "Segmentação válida (B2B/B2C/B2B2C)",
        passed: ["B2B", "B2C", "B2B2C"].includes(marketData.segmentacao),
      },
      {
        test: "Mercado relacionado a veículos/automotivo",
        passed:
          marketData.mercado.toLowerCase().includes("veículo") ||
          marketData.mercado.toLowerCase().includes("veiculo") ||
          marketData.mercado.toLowerCase().includes("automotiv") ||
          marketData.mercado.toLowerCase().includes("automóv") ||
          marketData.mercado.toLowerCase().includes("automov") ||
          marketData.mercado.toLowerCase().includes("carro"),
      },
    ];

    validations.forEach(v => {
      console.log(`  ${v.passed ? "✅" : "❌"} ${v.test}`);
    });

    const allPassed = validations.every(v => v.passed);

    console.log("\n" + "═".repeat(60));
    if (allPassed) {
      console.log(
        "✅ TESTE APROVADO - Geração de mercados funcionando corretamente"
      );
    } else {
      console.log("⚠️  TESTE PARCIAL - Algumas validações falharam");
    }
    console.log("═".repeat(60));

    // Metadados da resposta
    console.log("\n📋 METADADOS DA RESPOSTA:");
    console.log(`  Modelo: ${response.model || "N/A"}`);
    console.log(`  Tokens usados: ${response.usage?.total_tokens || "N/A"}`);
    console.log(`  Tempo de resposta: ${response.usage ? "Concluído" : "N/A"}`);
  } catch (error: any) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

// Executar teste
testMarketGeneration();
