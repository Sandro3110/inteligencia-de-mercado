import mysql from "mysql2/promise";
import { enrichClientesReal } from "./server/enrichmentReal";
import fs from "fs";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║         TESTE COM 5 CLIENTES REAIS (OpenAI + SerpAPI)         ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  try {
    // Selecionar 5 clientes que ainda não foram enriquecidos
    const [clientes] = await connection.query<any[]>(`
      SELECT id, nome, cnpj, produtoPrincipal
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
      console.log(`   ${i + 1}. ${c.nome} (${c.cnpj})`);
    });
    console.log("");

    const clienteIds = clientes.map((c: any) => c.id);
    const startTime = Date.now();

    console.log("🚀 Iniciando enriquecimento...\n");
    console.log("═".repeat(64));

    const results = await enrichClientesReal(
      clienteIds,
      1,
      (current, total, result) => {
        console.log(`\n[${current}/${total}] Cliente ${result.clienteId}:`);
        if (result.success) {
          console.log(
            `  ✅ Sucesso em ${(result.duration / 1000).toFixed(1)}s`
          );
          console.log(
            `  📊 ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
          );
        } else {
          console.log(`  ❌ Falhou: ${result.error}`);
        }
        console.log("─".repeat(64));
      }
    );

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

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

    console.log(`✅ Sucesso: ${successCount}/${results.length} clientes`);
    console.log(`❌ Falhas: ${failCount}/${results.length} clientes`);
    console.log(`⏱️  Tempo Total: ${totalDuration}s`);
    console.log(`⏱️  Tempo Médio: ${avgDuration.toFixed(1)}s por cliente`);
    console.log(`\n📊 Total de Registros Criados:`);
    console.log(`   - Mercados: ${totalMercados}`);
    console.log(`   - Produtos: ${totalProdutos}`);
    console.log(`   - Concorrentes: ${totalConcorrentes}`);
    console.log(`   - Leads: ${totalLeads}`);
    console.log(
      `   - TOTAL: ${totalMercados + totalProdutos + totalConcorrentes + totalLeads} registros`
    );

    // Buscar estatísticas do banco
    const [stats] = await connection.query<any[]>(`
      SELECT 
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1) as totalConcorrentes,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1) as totalLeads,
        (SELECT AVG(qualidadeScore) FROM concorrentes WHERE projectId = 1) as avgScoreConcorrentes,
        (SELECT AVG(qualidadeScore) FROM leads WHERE projectId = 1) as avgScoreLeads
    `);

    console.log(`\n📈 Estatísticas de Qualidade:`);
    console.log(
      `   - Quality Score Médio (Concorrentes): ${stats[0].avgScoreConcorrentes?.toFixed(1) || "N/A"}/100`
    );
    console.log(
      `   - Quality Score Médio (Leads): ${stats[0].avgScoreLeads?.toFixed(1) || "N/A"}/100`
    );

    // Salvar resultados em arquivo
    const report = {
      timestamp: new Date().toISOString(),
      clientes: clientes.map((c: any) => ({ id: c.id, nome: c.nome })),
      results,
      summary: {
        successCount,
        failCount,
        totalDuration: parseFloat(totalDuration),
        avgDuration,
        totalMercados,
        totalProdutos,
        totalConcorrentes,
        totalLeads,
        avgScoreConcorrentes: stats[0].avgScoreConcorrentes,
        avgScoreLeads: stats[0].avgScoreLeads,
      },
    };

    fs.writeFileSync(
      "/home/ubuntu/TEST_5_CLIENTES_REPORT.json",
      JSON.stringify(report, null, 2)
    );
    console.log(
      `\n💾 Relatório salvo em: /home/ubuntu/TEST_5_CLIENTES_REPORT.json`
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
