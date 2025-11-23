import mysql from "mysql2/promise";
import { enrichClientesParallel } from "./server/enrichmentOptimized";
import fs from "fs";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║  TESTE FINAL: Prompt Estruturado de Alta Qualidade (5 clientes) ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  try {
    // Selecionar 5 clientes que ainda não foram enriquecidos
    const [clientes] = await connection.query<any[]>(`
      SELECT id, nome, cnpj, produtoPrincipal, cidade
      FROM clientes
      WHERE projectId = 1
      AND id NOT IN (SELECT DISTINCT clienteId FROM clientes_mercados)
      ORDER BY RAND()
      LIMIT 5
    `);

    if (clientes.length === 0) {
      console.log("❌ Nenhum cliente disponível para teste\n");
      await connection.end();
      return;
    }

    console.log("📋 Clientes Selecionados:");
    clientes.forEach((c: any, i: number) => {
      console.log(`   ${i + 1}. ${c.nome}`);
      console.log(`      📍 ${c.cidade || "Brasil"}`);
      console.log(`      🏭 ${c.produtoPrincipal || "Não informado"}`);
      console.log("");
    });

    const clienteIds = clientes.map((c: any) => c.id);
    const startTime = Date.now();

    console.log("🚀 Iniciando enriquecimento com PROMPT ESTRUTURADO...");
    console.log("   ✅ 1 chamada OpenAI por cliente (prompt otimizado)");
    console.log("   ✅ SEM validação ReceitaWS (economia de tempo)");
    console.log("   ✅ Processamento paralelo (5 simultâneos)");
    console.log("   ✅ Foco em QUALIDADE dos dados\n");
    console.log("═".repeat(70));

    const results = await enrichClientesParallel(
      clienteIds,
      1,
      5,
      (current, total, result) => {
        if (result.success) {
          console.log(
            `✅ [${current}/${total}] Cliente ${result.clienteId}: ${(result.duration / 1000).toFixed(1)}s | ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
          );
        } else {
          console.log(
            `❌ [${current}/${total}] Cliente ${result.clienteId}: FALHOU - ${result.error}`
          );
        }
      }
    );

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("═".repeat(70));
    console.log(
      "\n╔════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                    RESULTADO CONSOLIDADO                       ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n"
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    const totalMercados = results.reduce(
      (sum, r) => sum + r.mercadosCreated,
      0
    );
    const totalProdutos = results.reduce(
      (sum, r) => sum + r.produtosCreated,
      0
    );
    const totalConcorrentes = results.reduce(
      (sum, r) => sum + r.concorrentesCreated,
      0
    );
    const totalLeads = results.reduce((sum, r) => sum + r.leadsCreated, 0);

    const avgDuration =
      results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000;

    console.log(`📊 Resultados:`);
    console.log(
      `   ✅ Sucesso: ${successCount}/${results.length} clientes (${((successCount / results.length) * 100).toFixed(0)}%)`
    );
    console.log(`   ❌ Falhas: ${failCount}/${results.length} clientes`);
    console.log(`\n⏱️  Performance:`);
    console.log(
      `   Tempo Total: ${totalDuration}s (${(parseFloat(totalDuration) / 60).toFixed(1)} min)`
    );
    console.log(`   Tempo Médio por Cliente: ${avgDuration.toFixed(1)}s`);
    console.log(
      `   Throughput: ${((results.length / parseFloat(totalDuration)) * 60).toFixed(1)} clientes/min`
    );
    console.log(`\n📦 Registros Criados:`);
    console.log(`   - Mercados: ${totalMercados}`);
    console.log(`   - Produtos: ${totalProdutos}`);
    console.log(`   - Concorrentes: ${totalConcorrentes}`);
    console.log(`   - Leads: ${totalLeads}`);
    console.log(
      `   - TOTAL: ${totalMercados + totalProdutos + totalConcorrentes + totalLeads} registros`
    );

    // Buscar estatísticas de qualidade (últimos 5 min)
    const [stats] = await connection.query<any[]>(`
      SELECT 
        (SELECT AVG(qualidadeScore) FROM concorrentes WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as avgScoreConcorrentes,
        (SELECT AVG(qualidadeScore) FROM leads WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as avgScoreLeads,
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1 AND porte IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as concorrentesComPorte,
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as totalConcorrentesRecentes,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1 AND porte IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as leadsComPorte,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as totalLeadsRecentes,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1 AND observacoes IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as leadsComJustificativa
    `);

    const stat = stats[0];

    console.log(`\n📈 Quality Scores (últimos 5 min):`);
    console.log(
      `   - Concorrentes: ${stat.avgScoreConcorrentes ? stat.avgScoreConcorrentes.toFixed(1) : "N/A"}/100`
    );
    console.log(
      `   - Leads: ${stat.avgScoreLeads ? stat.avgScoreLeads.toFixed(1) : "N/A"}/100`
    );
    console.log(`\n🎯 Dados Enriquecidos (Porte, Região, Justificativas):`);
    console.log(
      `   - Concorrentes com Porte: ${stat.concorrentesComPorte}/${stat.totalConcorrentesRecentes} (${stat.totalConcorrentesRecentes > 0 ? ((stat.concorrentesComPorte / stat.totalConcorrentesRecentes) * 100).toFixed(0) : 0}%)`
    );
    console.log(
      `   - Leads com Porte: ${stat.leadsComPorte}/${stat.totalLeadsRecentes} (${stat.totalLeadsRecentes > 0 ? ((stat.leadsComPorte / stat.totalLeadsRecentes) * 100).toFixed(0) : 0}%)`
    );
    console.log(
      `   - Leads com Justificativa: ${stat.leadsComJustificativa}/${stat.totalLeadsRecentes} (${stat.totalLeadsRecentes > 0 ? ((stat.leadsComJustificativa / stat.totalLeadsRecentes) * 100).toFixed(0) : 0}%)`
    );

    // Buscar exemplos de dados gerados
    const [exemploConcorrentes] = await connection.query<any[]>(`
      SELECT nome, porte, regiao, qualidadeScore
      FROM concorrentes
      WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY qualidadeScore DESC
      LIMIT 5
    `);

    const [exemploLeads] = await connection.query<any[]>(`
      SELECT nome, porte, setor, tipo, observacoes, qualidadeScore
      FROM leads
      WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY qualidadeScore DESC
      LIMIT 5
    `);

    console.log(`\n🏆 Top 5 Concorrentes (por quality score):`);
    exemploConcorrentes.forEach((c: any, i: number) => {
      console.log(
        `   ${i + 1}. ${c.nome} | Porte: ${c.porte || "N/A"} | Região: ${c.regiao || "N/A"} | Score: ${c.qualidadeScore}`
      );
    });

    console.log(`\n💼 Top 5 Leads (por quality score):`);
    exemploLeads.forEach((l: any, i: number) => {
      console.log(
        `   ${i + 1}. ${l.nome} | Porte: ${l.porte || "N/A"} | Potencial: ${l.tipo} | Score: ${l.qualidadeScore}`
      );
      if (l.observacoes) {
        console.log(
          `      💡 ${l.observacoes.substring(0, 80)}${l.observacoes.length > 80 ? "..." : ""}`
        );
      }
    });

    // Projeção para 801 clientes
    const projectedTime = (avgDuration * 801) / 5; // 5 clientes em paralelo
    const projectedCost = 801 * 0.015; // ~$0.015 por cliente (prompt maior)

    console.log(`\n🔮 Projeção para 801 Clientes:`);
    console.log(
      `   ⏱️  Tempo Estimado: ${(projectedTime / 60).toFixed(1)} minutos (${(projectedTime / 3600).toFixed(2)}h)`
    );
    console.log(
      `   💰 Custo Estimado OpenAI: $${projectedCost.toFixed(2)} USD`
    );
    console.log(
      `   📊 Registros Esperados: ~${Math.round(((totalMercados + totalProdutos + totalConcorrentes + totalLeads) * 801) / 5)} registros`
    );

    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      version: "OPTIMIZED_V2_STRUCTURED_PROMPT",
      apis: ["OpenAI GPT-4o-mini (Prompt Estruturado)"],
      clientes: clientes.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        cidade: c.cidade,
      })),
      results,
      summary: {
        successCount,
        failCount,
        totalDuration: parseFloat(totalDuration),
        avgDuration,
        throughput: (results.length / parseFloat(totalDuration)) * 60,
        totalMercados,
        totalProdutos,
        totalConcorrentes,
        totalLeads,
        avgScoreConcorrentes: stat.avgScoreConcorrentes,
        avgScoreLeads: stat.avgScoreLeads,
        enrichmentRate: {
          concorrentesComPorte:
            stat.totalConcorrentesRecentes > 0
              ? stat.concorrentesComPorte / stat.totalConcorrentesRecentes
              : 0,
          leadsComPorte:
            stat.totalLeadsRecentes > 0
              ? stat.leadsComPorte / stat.totalLeadsRecentes
              : 0,
          leadsComJustificativa:
            stat.totalLeadsRecentes > 0
              ? stat.leadsComJustificativa / stat.totalLeadsRecentes
              : 0,
        },
      },
      examples: {
        topConcorrentes: exemploConcorrentes,
        topLeads: exemploLeads,
      },
      projection: {
        time: projectedTime,
        cost: projectedCost,
        records: Math.round(
          ((totalMercados + totalProdutos + totalConcorrentes + totalLeads) *
            801) /
            5
        ),
      },
    };

    fs.writeFileSync(
      "/home/ubuntu/TEST_FINAL_OPTIMIZED_REPORT.json",
      JSON.stringify(report, null, 2)
    );
    console.log(
      `\n💾 Relatório salvo em: /home/ubuntu/TEST_FINAL_OPTIMIZED_REPORT.json`
    );

    console.log(
      "\n════════════════════════════════════════════════════════════════\n"
    );
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
