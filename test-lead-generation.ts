/**
 * Teste Individual: Identificação de Leads
 * Cliente: Jeep do Brasil
 * Mercado: Automotivo
 */

import { invokeLLM } from "./server/_core/llm";
import { callDataApi } from "./server/_core/dataApi";
import { calculateQualityScore } from "./shared/qualityScore";

async function testLeadGeneration() {
  console.log("📈 Teste de Identificação de Leads\n");
  console.log("Cliente: Jeep do Brasil");
  console.log("Mercado: Automotivo\n");
  console.log("═".repeat(70));

  try {
    console.log("\n📡 Chamando LLM para identificar leads qualificados...\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em geração de leads B2B. Identifique empresas que podem ser leads qualificados.",
        },
        {
          role: "user",
          content: `Mercado: Automotivo\n\nListe 5 empresas que seriam leads qualificados para este mercado no Brasil. Retorne JSON com: { "leads": [{ "nome": "Nome da empresa", "tipo": "B2B ou B2C", "regiao": "Região" }] }`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "leads_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              leads: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    tipo: { type: "string" },
                    regiao: { type: "string" },
                  },
                  required: ["nome", "tipo", "regiao"],
                  additionalProperties: false,
                },
              },
            },
            required: ["leads"],
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

    const leadData = JSON.parse(content);

    console.log("✅ Leads identificados com sucesso!\n");
    console.log("📊 LEADS ENCONTRADOS:");
    console.log("═".repeat(70));

    const enrichedLeads = [];

    for (let i = 0; i < leadData.leads.length; i++) {
      const lead = leadData.leads[i];
      console.log(`\n${i + 1}. ${lead.nome}`);
      console.log(`   Tipo: ${lead.tipo}`);
      console.log(`   Região: ${lead.regiao}`);

      // Tentar enriquecer via Data API
      console.log(`   🔍 Enriquecendo dados via Data API...`);
      let enrichedData: any = {};
      let apiSuccess = false;

      try {
        const apiResult = await callDataApi(lead.nome);
        if (apiResult) {
          enrichedData = apiResult;
          apiSuccess = true;
          console.log(`   ✅ Dados enriquecidos:`);
          console.log(`      CNPJ: ${apiResult.cnpj || "N/A"}`);
          console.log(`      Site: ${apiResult.site || "N/A"}`);
          console.log(`      Email: ${apiResult.email || "N/A"}`);
          console.log(`      Telefone: ${apiResult.telefone || "N/A"}`);
        } else {
          console.log(`   ⚠️  Dados não encontrados na API`);
        }
      } catch (error: any) {
        console.log(`   ❌ Erro ao enriquecer: ${error.message}`);
      }

      // Calcular score de qualidade
      const qualidadeScore = calculateQualityScore({
        cnpj: enrichedData.cnpj || null,
        email: enrichedData.email || null,
        telefone: enrichedData.telefone || null,
        site: enrichedData.site || null,
        siteOficial: null,
        linkedin: null,
        instagram: null,
        produto: null,
        produtoPrincipal: null,
        segmentacao: lead.tipo,
        porte: enrichedData.porte || null,
      });

      console.log(`   📊 Score de qualidade: ${qualidadeScore}/100`);

      enrichedLeads.push({
        ...lead,
        ...enrichedData,
        qualidadeScore,
        enriched: apiSuccess,
      });
    }

    console.log("\n" + "═".repeat(70));

    // Validação de qualidade
    console.log("\n🔍 VALIDAÇÃO:");
    const validations = [
      {
        test: "Pelo menos 3 leads retornados",
        passed: leadData.leads.length >= 3,
      },
      {
        test: "Todos os leads têm nome",
        passed: leadData.leads.every((l: any) => l.nome && l.nome.length > 0),
      },
      {
        test: "Todos os leads têm tipo (B2B/B2C)",
        passed: leadData.leads.every((l: any) => l.tipo && l.tipo.length > 0),
      },
      {
        test: "Todos os leads têm região",
        passed: leadData.leads.every(
          (l: any) => l.regiao && l.regiao.length > 0
        ),
      },
      {
        test: "Score de qualidade calculado para todos",
        passed: enrichedLeads.every(
          (l: any) => typeof l.qualidadeScore === "number"
        ),
      },
      {
        test: "Pelo menos 1 lead com score >= 50",
        passed: enrichedLeads.some((l: any) => l.qualidadeScore >= 50),
      },
    ];

    validations.forEach(v => {
      console.log(`  ${v.passed ? "✅" : "❌"} ${v.test}`);
    });

    const allPassed = validations.every(v => v.passed);
    const criticalPassed = validations.slice(0, 5).every(v => v.passed);

    console.log("\n" + "═".repeat(70));
    if (allPassed) {
      console.log(
        "✅ TESTE APROVADO - Identificação de leads funcionando perfeitamente"
      );
    } else if (criticalPassed) {
      console.log(
        "⚠️  TESTE PARCIAL - Funcionalidade core OK, qualidade pode melhorar"
      );
    } else {
      console.log("❌ TESTE REPROVADO - Algumas validações críticas falharam");
    }
    console.log("═".repeat(70));

    // Estatísticas
    console.log("\n📊 ESTATÍSTICAS:");
    console.log(`  Total de leads: ${leadData.leads.length}`);
    console.log(
      `  Enriquecidos com sucesso: ${enrichedLeads.filter((l: any) => l.enriched).length}`
    );
    console.log(
      `  Taxa de enriquecimento: ${((enrichedLeads.filter((l: any) => l.enriched).length / leadData.leads.length) * 100).toFixed(1)}%`
    );

    const avgScore =
      enrichedLeads.reduce((sum: number, l: any) => sum + l.qualidadeScore, 0) /
      enrichedLeads.length;
    console.log(`  Score médio de qualidade: ${avgScore.toFixed(1)}/100`);

    const highQuality = enrichedLeads.filter(
      (l: any) => l.qualidadeScore >= 70
    ).length;
    console.log(`  Leads de alta qualidade (≥70): ${highQuality}`);

    // Distribuição por tipo
    const byType = enrichedLeads.reduce((acc: any, l: any) => {
      acc[l.tipo] = (acc[l.tipo] || 0) + 1;
      return acc;
    }, {});
    console.log(`  Distribuição por tipo:`, byType);

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
testLeadGeneration();
