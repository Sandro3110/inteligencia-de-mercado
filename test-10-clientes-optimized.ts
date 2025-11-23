import mysql from "mysql2/promise";
import { enrichClientesParallel } from "./server/enrichmentOptimized";
import fs from "fs";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║   TESTE COM 10 CLIENTES: OpenAI + ReceitaWS (SEM SerpAPI)     ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  try {
    // Selecionar 10 clientes que ainda não foram enriquecidos
    const [clientes] = await connection.query<any[]>(`
      SELECT id, nome, cnpj, produtoPrincipal
      FROM clientes
      WHERE projectId = 1
      AND id NOT IN (SELECT DISTINCT clienteId FROM clientes_mercados)
      ORDER BY RAND()
      LIMIT 10
    `);

    if (clientes.length === 0) {
      console.log("❌ Nenhum cliente disponível para teste\n");
      await connection.end();
      return;
    }

    console.log("📋 Clientes Selecionados:");
    clientes.forEach((c: any, i: number) => {
      console.log(`   ${i + 1}. ${c.nome}`);
    });
    console.log("");

    const clienteIds = clientes.map((c: any) => c.id);
    const startTime = Date.now();

    console.log("🚀 Iniciando enriquecimento OTIMIZADO...");
    console.log("   - 1 chamada OpenAI por cliente");
    console.log("   - Validação de CNPJs via ReceitaWS");
    console.log("   - Processamento paralelo (5 simultâneos)");
    console.log("   - SEM SerpAPI\n");
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

    // Buscar estatísticas de qualidade (últimos 10 min)
    const [stats] = await connection.query<any[]>(`
      SELECT 
        (SELECT AVG(qualidadeScore) FROM concorrentes WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) as avgScoreConcorrentes,
        (SELECT AVG(qualidadeScore) FROM leads WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) as avgScoreLeads,
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1 AND cnpj IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) as concorrentesComCNPJ,
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) as totalConcorrentesRecentes,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1 AND cnpj IS NOT NULL AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) as leadsComCNPJ,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) as totalLeadsRecentes
    `);

    const stat = stats[0];

    console.log(`\n📈 Quality Scores (últimos 10 min):`);
    console.log(
      `   - Concorrentes: ${stat.avgScoreConcorrentes ? stat.avgScoreConcorrentes.toFixed(1) : "N/A"}/100`
    );
    console.log(
      `   - Leads: ${stat.avgScoreLeads ? stat.avgScoreLeads.toFixed(1) : "N/A"}/100`
    );
    console.log(`\n🎯 CNPJs Validados via ReceitaWS:`);
    console.log(
      `   - Concorrentes: ${stat.concorrentesComCNPJ}/${stat.totalConcorrentesRecentes} (${stat.totalConcorrentesRecentes > 0 ? ((stat.concorrentesComCNPJ / stat.totalConcorrentesRecentes) * 100).toFixed(0) : 0}%)`
    );
    console.log(
      `   - Leads: ${stat.leadsComCNPJ}/${stat.totalLeadsRecentes} (${stat.totalLeadsRecentes > 0 ? ((stat.leadsComCNPJ / stat.totalLeadsRecentes) * 100).toFixed(0) : 0}%)`
    );

    // Projeção para 801 clientes
    const projectedTime = (avgDuration * 801) / 5; // 5 clientes em paralelo
    const projectedCost = 801 * 0.01; // ~$0.01 por cliente (1 chamada OpenAI)

    console.log(`\n🔮 Projeção para 801 Clientes:`);
    console.log(
      `   ⏱️  Tempo Estimado: ${(projectedTime / 60).toFixed(1)} minutos (${(projectedTime / 3600).toFixed(2)}h)`
    );
    console.log(
      `   💰 Custo Estimado OpenAI: $${projectedCost.toFixed(2)} USD`
    );
    console.log(`   💰 Custo Estimado ReceitaWS: Incluído (gratuito)`);
    console.log(
      `   📊 Registros Esperados: ~${Math.round(((totalMercados + totalProdutos + totalConcorrentes + totalLeads) * 801) / 10)} registros`
    );

    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      version: "OPTIMIZED_WITH_RECEITAWS",
      apis: ["OpenAI GPT-4o-mini", "ReceitaWS"],
      clientes: clientes.map((c: any) => ({ id: c.id, nome: c.nome })),
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
        concorrentesComCNPJ: stat.concorrentesComCNPJ,
        leadsComCNPJ: stat.leadsComCNPJ,
        cnpjValidationRate: {
          concorrentes:
            stat.totalConcorrentesRecentes > 0
              ? stat.concorrentesComCNPJ / stat.totalConcorrentesRecentes
              : 0,
          leads:
            stat.totalLeadsRecentes > 0
              ? stat.leadsComCNPJ / stat.totalLeadsRecentes
              : 0,
        },
      },
      projection: {
        time: projectedTime,
        cost: projectedCost,
        records: Math.round(
          ((totalMercados + totalProdutos + totalConcorrentes + totalLeads) *
            801) /
            10
        ),
      },
    };

    fs.writeFileSync(
      "/home/ubuntu/TEST_10_OPTIMIZED_REPORT.json",
      JSON.stringify(report, null, 2)
    );
    console.log(
      `\n💾 Relatório salvo em: /home/ubuntu/TEST_10_OPTIMIZED_REPORT.json`
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
