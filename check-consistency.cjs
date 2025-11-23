const mysql = require("mysql2/promise");
require("dotenv/config");

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║         VERIFICAÇÃO DE CONSISTÊNCIA E INTEGRIDADE             ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  const checks = [];

  // 1. Verificar registros criados no teste (últimas 2 horas)
  console.log("1️⃣  Contagem de registros do teste (últimas 2h)...\n");

  const [clientes] = await connection.query(`
    SELECT COUNT(*) as count FROM clientes 
    WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
  `);
  console.log(`   Clientes: ${clientes[0].count}`);

  const [mercados] = await connection.query(`
    SELECT COUNT(*) as count FROM mercados_unicos 
    WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
  `);
  console.log(`   Mercados: ${mercados[0].count}`);

  const [produtos] = await connection.query(`
    SELECT COUNT(*) as count FROM produtos 
    WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
  `);
  console.log(`   Produtos: ${produtos[0].count}`);

  const [concorrentes] = await connection.query(`
    SELECT COUNT(*) as count FROM concorrentes 
    WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
  `);
  console.log(`   Concorrentes: ${concorrentes[0].count}`);

  const [leads] = await connection.query(`
    SELECT COUNT(*) as count FROM leads 
    WHERE projectId = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
  `);
  console.log(`   Leads: ${leads[0].count}\n`);

  checks.push({
    name: "Registros criados no teste",
    status: "OK",
    details: {
      clientes: clientes[0].count,
      mercados: mercados[0].count,
      produtos: produtos[0].count,
      concorrentes: concorrentes[0].count,
      leads: leads[0].count,
    },
  });

  // 2. Verificar integridade referencial
  console.log("2️⃣  Integridade referencial...\n");

  const [orphanProducts] = await connection.query(`
    SELECT COUNT(*) as count
    FROM produtos p
    WHERE p.projectId = 1
    AND (
      NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = p.clienteId)
      OR NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = p.mercadoId)
    )
  `);
  console.log(
    `   Produtos órfãos: ${orphanProducts[0].count} ${orphanProducts[0].count === 0 ? "✅" : "❌"}`
  );

  const [orphanCompetitors] = await connection.query(`
    SELECT COUNT(*) as count
    FROM concorrentes c
    WHERE c.projectId = 1
    AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = c.mercadoId)
  `);
  console.log(
    `   Concorrentes órfãos: ${orphanCompetitors[0].count} ${orphanCompetitors[0].count === 0 ? "✅" : "❌"}`
  );

  const [orphanLeads] = await connection.query(`
    SELECT COUNT(*) as count
    FROM leads l
    WHERE l.projectId = 1
    AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = l.mercadoId)
  `);
  console.log(
    `   Leads órfãos: ${orphanLeads[0].count} ${orphanLeads[0].count === 0 ? "✅" : "❌"}\n`
  );

  const integrityOk =
    orphanProducts[0].count === 0 &&
    orphanCompetitors[0].count === 0 &&
    orphanLeads[0].count === 0;

  checks.push({
    name: "Integridade referencial",
    status: integrityOk ? "OK" : "FALHA",
    details: {
      orphanProducts: orphanProducts[0].count,
      orphanCompetitors: orphanCompetitors[0].count,
      orphanLeads: orphanLeads[0].count,
    },
  });

  // 3. Verificar duplicatas
  console.log("3️⃣  Verificação de duplicatas...\n");

  const [dupMercados] = await connection.query(`
    SELECT mercadoHash, COUNT(*) as count
    FROM mercados_unicos
    WHERE projectId = 1
    GROUP BY mercadoHash
    HAVING count > 1
  `);
  console.log(
    `   Mercados duplicados: ${dupMercados.length} ${dupMercados.length === 0 ? "✅" : "⚠️"}`
  );

  const [dupConcorrentes] = await connection.query(`
    SELECT concorrenteHash, COUNT(*) as count
    FROM concorrentes
    WHERE projectId = 1
    GROUP BY concorrenteHash
    HAVING count > 1
  `);
  console.log(
    `   Concorrentes duplicados: ${dupConcorrentes.length} ${dupConcorrentes.length === 0 ? "✅" : "⚠️"}`
  );

  const [dupLeads] = await connection.query(`
    SELECT leadHash, COUNT(*) as count
    FROM leads
    WHERE projectId = 1
    GROUP BY leadHash
    HAVING count > 1
  `);
  console.log(
    `   Leads duplicados: ${dupLeads.length} ${dupLeads.length === 0 ? "✅" : "⚠️"}\n`
  );

  checks.push({
    name: "Verificação de duplicatas",
    status:
      dupMercados.length === 0 &&
      dupConcorrentes.length === 0 &&
      dupLeads.length === 0
        ? "OK"
        : "AVISO",
    details: {
      dupMercados: dupMercados.length,
      dupConcorrentes: dupConcorrentes.length,
      dupLeads: dupLeads.length,
    },
  });

  // 4. Verificar campos obrigatórios
  console.log("4️⃣  Campos obrigatórios...\n");

  const [nullCNPJ] = await connection.query(`
    SELECT COUNT(*) as count
    FROM clientes
    WHERE projectId = 1 AND (cnpj IS NULL OR cnpj = '' OR cnpj = '0')
  `);
  console.log(
    `   Clientes sem CNPJ: ${nullCNPJ[0].count} ${nullCNPJ[0].count === 0 ? "✅" : "⚠️"}`
  );

  const [nullMercadoNome] = await connection.query(`
    SELECT COUNT(*) as count
    FROM mercados_unicos
    WHERE projectId = 1 AND (nome IS NULL OR nome = '')
  `);
  console.log(
    `   Mercados sem nome: ${nullMercadoNome[0].count} ${nullMercadoNome[0].count === 0 ? "✅" : "❌"}`
  );

  const [nullProdutoNome] = await connection.query(`
    SELECT COUNT(*) as count
    FROM produtos
    WHERE projectId = 1 AND (nome IS NULL OR nome = '')
  `);
  console.log(
    `   Produtos sem nome: ${nullProdutoNome[0].count} ${nullProdutoNome[0].count === 0 ? "✅" : "❌"}\n`
  );

  const fieldsOk =
    nullMercadoNome[0].count === 0 && nullProdutoNome[0].count === 0;

  checks.push({
    name: "Campos obrigatórios",
    status: fieldsOk ? "OK" : "FALHA",
    details: {
      clientesSemCNPJ: nullCNPJ[0].count,
      mercadosSemNome: nullMercadoNome[0].count,
      produtosSemNome: nullProdutoNome[0].count,
    },
  });

  // 5. Verificar quality scores
  console.log("5️⃣  Quality Scores...\n");

  const [concQuality] = await connection.query(`
    SELECT 
      AVG(qualidadeScore) as avg,
      MIN(qualidadeScore) as min,
      MAX(qualidadeScore) as max,
      COUNT(*) as total,
      SUM(CASE WHEN qualidadeScore >= 70 THEN 1 ELSE 0 END) as good
    FROM concorrentes
    WHERE projectId = 1 AND qualidadeScore IS NOT NULL
  `);

  const concAvg = parseFloat(concQuality[0].avg) || 0;
  const concGoodPercent =
    concQuality[0].total > 0
      ? ((concQuality[0].good / concQuality[0].total) * 100).toFixed(1)
      : 0;

  console.log(`   Concorrentes:`);
  console.log(`     - Média: ${concAvg.toFixed(1)}`);
  console.log(
    `     - Range: ${concQuality[0].min || 0} - ${concQuality[0].max || 0}`
  );
  console.log(`     - Score >= 70: ${concGoodPercent}%`);

  const [leadsQuality] = await connection.query(`
    SELECT 
      AVG(qualidadeScore) as avg,
      MIN(qualidadeScore) as min,
      MAX(qualidadeScore) as max,
      COUNT(*) as total,
      SUM(CASE WHEN qualidadeScore >= 70 THEN 1 ELSE 0 END) as good
    FROM leads
    WHERE projectId = 1 AND qualidadeScore IS NOT NULL
  `);

  const leadsAvg = parseFloat(leadsQuality[0].avg) || 0;
  const leadsGoodPercent =
    leadsQuality[0].total > 0
      ? ((leadsQuality[0].good / leadsQuality[0].total) * 100).toFixed(1)
      : 0;

  console.log(`   Leads:`);
  console.log(`     - Média: ${leadsAvg.toFixed(1)}`);
  console.log(
    `     - Range: ${leadsQuality[0].min || 0} - ${leadsQuality[0].max || 0}`
  );
  console.log(`     - Score >= 70: ${leadsGoodPercent}%\n`);

  checks.push({
    name: "Quality Scores",
    status: "OK",
    details: {
      concorrentes: {
        avg: parseFloat(concAvg.toFixed(1)),
        min: concQuality[0].min || 0,
        max: concQuality[0].max || 0,
        goodPercent: parseFloat(concGoodPercent),
      },
      leads: {
        avg: parseFloat(leadsAvg.toFixed(1)),
        min: leadsQuality[0].min || 0,
        max: leadsQuality[0].max || 0,
        goodPercent: parseFloat(leadsGoodPercent),
      },
    },
  });

  // 6. Estatísticas gerais
  console.log("6️⃣  Estatísticas gerais do banco...\n");

  const [totalStats] = await connection.query(`
    SELECT 
      (SELECT COUNT(*) FROM clientes WHERE projectId = 1) as clientes,
      (SELECT COUNT(*) FROM mercados_unicos WHERE projectId = 1) as mercados,
      (SELECT COUNT(*) FROM produtos WHERE projectId = 1) as produtos,
      (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1) as concorrentes,
      (SELECT COUNT(*) FROM leads WHERE projectId = 1) as leads,
      (SELECT COUNT(DISTINCT clienteId) FROM clientes_mercados) as clientesComMercado
  `);

  const stats = totalStats[0];
  console.log(`   Total de Clientes: ${stats.clientes}`);
  console.log(`   Total de Mercados: ${stats.mercados}`);
  console.log(`   Total de Produtos: ${stats.produtos}`);
  console.log(`   Total de Concorrentes: ${stats.concorrentes}`);
  console.log(`   Total de Leads: ${stats.leads}`);
  console.log(
    `   Clientes com Mercado: ${stats.clientesComMercado} (${((stats.clientesComMercado / stats.clientes) * 100).toFixed(1)}%)\n`
  );

  checks.push({
    name: "Estatísticas gerais",
    status: "INFO",
    details: stats,
  });

  // Resumo final
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                    RESUMO DA CONSISTÊNCIA                      ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  let okCount = 0;
  let failCount = 0;
  let warnCount = 0;

  checks.forEach(check => {
    const icon =
      check.status === "OK"
        ? "✅"
        : check.status === "FALHA"
          ? "❌"
          : check.status === "AVISO"
            ? "⚠️"
            : "ℹ️";
    console.log(`${icon} ${check.name}: ${check.status}`);

    if (check.status === "OK") okCount++;
    else if (check.status === "FALHA") failCount++;
    else if (check.status === "AVISO") warnCount++;
  });

  console.log(
    `\n📊 Resultado: ${okCount} OK, ${failCount} FALHAS, ${warnCount} AVISOS`
  );

  const overallStatus =
    failCount === 0
      ? warnCount === 0
        ? "✅ BANCO CONSISTENTE"
        : "⚠️  BANCO CONSISTENTE COM AVISOS"
      : "❌ BANCO COM PROBLEMAS";

  console.log(`${overallStatus}\n`);

  // Salvar resultado
  const consistencyResult = {
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      ok: okCount,
      failures: failCount,
      warnings: warnCount,
      overallStatus:
        failCount === 0
          ? warnCount === 0
            ? "CONSISTENT"
            : "CONSISTENT_WITH_WARNINGS"
          : "INCONSISTENT",
    },
  };

  const fs = require("fs");
  fs.writeFileSync(
    "/home/ubuntu/CONSISTENCY_RESULTS.json",
    JSON.stringify(consistencyResult, null, 2)
  );

  console.log(
    "════════════════════════════════════════════════════════════════\n"
  );

  await connection.end();
}

main().catch(console.error);
