const mysql = require("mysql2/promise");
require("dotenv/config");

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║              LIMPEZA DE REGISTROS ÓRFÃOS                       ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  try {
    // 1. Contar registros órfãos antes da limpeza
    console.log("1️⃣  Contando registros órfãos...\n");

    const [orphanConc] = await connection.query(`
      SELECT COUNT(*) as count
      FROM concorrentes c
      WHERE c.projectId = 1
      AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = c.mercadoId)
    `);

    const [orphanLeads] = await connection.query(`
      SELECT COUNT(*) as count
      FROM leads l
      WHERE l.projectId = 1
      AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = l.mercadoId)
    `);

    const totalOrphans = orphanConc[0].count + orphanLeads[0].count;

    console.log(`   Concorrentes órfãos: ${orphanConc[0].count}`);
    console.log(`   Leads órfãos: ${orphanLeads[0].count}`);
    console.log(`   Total de órfãos: ${totalOrphans}\n`);

    if (totalOrphans === 0) {
      console.log(
        "✅ Nenhum registro órfão encontrado. Banco já está limpo!\n"
      );
      await connection.end();
      return;
    }

    // 2. Executar limpeza de concorrentes órfãos
    console.log("2️⃣  Limpando concorrentes órfãos...\n");

    const [concResult] = await connection.query(`
      DELETE FROM concorrentes
      WHERE projectId = 1
      AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = mercadoId)
    `);

    console.log(
      `   ✅ ${concResult.affectedRows} concorrentes órfãos removidos\n`
    );

    // 3. Executar limpeza de leads órfãos
    console.log("3️⃣  Limpando leads órfãos...\n");

    const [leadsResult] = await connection.query(`
      DELETE FROM leads
      WHERE projectId = 1
      AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = mercadoId)
    `);

    console.log(`   ✅ ${leadsResult.affectedRows} leads órfãos removidos\n`);

    // 4. Verificar resultado final
    console.log("4️⃣  Verificando resultado...\n");

    const [finalConc] = await connection.query(`
      SELECT COUNT(*) as count
      FROM concorrentes c
      WHERE c.projectId = 1
      AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = c.mercadoId)
    `);

    const [finalLeads] = await connection.query(`
      SELECT COUNT(*) as count
      FROM leads l
      WHERE l.projectId = 1
      AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = l.mercadoId)
    `);

    const finalOrphans = finalConc[0].count + finalLeads[0].count;

    console.log(`   Concorrentes órfãos restantes: ${finalConc[0].count}`);
    console.log(`   Leads órfãos restantes: ${finalLeads[0].count}`);
    console.log(`   Total de órfãos restantes: ${finalOrphans}\n`);

    // 5. Resumo final
    console.log(
      "╔════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                    RESUMO DA LIMPEZA                           ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n"
    );

    const totalRemoved = concResult.affectedRows + leadsResult.affectedRows;

    console.log(`   📊 Registros removidos: ${totalRemoved}`);
    console.log(`      ├─ Concorrentes: ${concResult.affectedRows}`);
    console.log(`      └─ Leads: ${leadsResult.affectedRows}\n`);

    if (finalOrphans === 0) {
      console.log("   ✅ LIMPEZA CONCLUÍDA COM SUCESSO!");
      console.log("   ✅ Banco de dados está 100% consistente\n");
    } else {
      console.log(`   ⚠️  Ainda restam ${finalOrphans} registros órfãos`);
      console.log("   ⚠️  Pode ser necessário executar novamente\n");
    }

    console.log(
      "════════════════════════════════════════════════════════════════\n"
    );

    // Salvar resultado
    const cleanupResult = {
      timestamp: new Date().toISOString(),
      before: {
        orphanCompetitors: orphanConc[0].count,
        orphanLeads: orphanLeads[0].count,
        total: totalOrphans,
      },
      removed: {
        competitors: concResult.affectedRows,
        leads: leadsResult.affectedRows,
        total: totalRemoved,
      },
      after: {
        orphanCompetitors: finalConc[0].count,
        orphanLeads: finalLeads[0].count,
        total: finalOrphans,
      },
      success: finalOrphans === 0,
    };

    const fs = require("fs");
    fs.writeFileSync(
      "/home/ubuntu/CLEANUP_RESULTS.json",
      JSON.stringify(cleanupResult, null, 2)
    );
  } catch (error) {
    console.error("❌ Erro durante a limpeza:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
