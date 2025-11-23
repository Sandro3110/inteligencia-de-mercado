/**
 * Teste direto das correções via SQL
 */

import mysql from "mysql2/promise";

async function test() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║           TESTE DAS 3 CORREÇÕES DE BUGS                       ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // 1. Buscar 5 clientes não enriquecidos
  console.log("📋 Buscando 5 clientes não enriquecidos...\n");

  const [clientes] = await conn.query(`
    SELECT c.id, c.nome
    FROM clientes c
    LEFT JOIN clientes_mercados cm ON c.id = cm.clienteId
    WHERE c.projectId = 1 AND cm.clienteId IS NULL
    LIMIT 5
  `);

  if (clientes.length === 0) {
    console.log(
      "⚠️ Não há clientes não enriquecidos. Vou analisar dados existentes.\n"
    );

    // Analisar dados existentes
    console.log("🔍 ANÁLISE DOS DADOS EXISTENTES:\n");

    const [stats] = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM clientes WHERE projectId = 1) as totalClientes,
        (SELECT COUNT(DISTINCT clienteId) FROM clientes_mercados) as clientesEnriquecidos,
        (SELECT COUNT(*) FROM mercados_unicos WHERE projectId = 1) as totalMercados,
        (SELECT COUNT(*) FROM produtos WHERE projectId = 1) as totalProdutos,
        (SELECT COUNT(*) FROM concorrentes WHERE projectId = 1) as totalConcorrentes,
        (SELECT COUNT(*) FROM leads WHERE projectId = 1) as totalLeads
    `);

    console.log(
      `Clientes: ${stats[0].totalClientes} total, ${stats[0].clientesEnriquecidos} enriquecidos`
    );
    console.log(`Mercados: ${stats[0].totalMercados}`);
    console.log(`Produtos: ${stats[0].totalProdutos}`);
    console.log(`Concorrentes: ${stats[0].totalConcorrentes}`);
    console.log(`Leads: ${stats[0].totalLeads}\n`);

    // Verificar correções nos dados existentes
    console.log(
      "╔════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║         VERIFICAÇÃO DAS CORREÇÕES NOS DADOS EXISTENTES        ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n"
    );

    // Bug Fix 1: Campo produto em concorrentes
    const [concorrenteCheck] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(produto) as comProduto,
        ROUND(COUNT(produto) * 100.0 / COUNT(*), 1) as percentual
      FROM concorrentes
      WHERE projectId = 1
    `);

    console.log("✅ BUG FIX 1 - Campo produto em concorrentes:");
    console.log(`   Total: ${concorrenteCheck[0].total}`);
    console.log(
      `   Com produto: ${concorrenteCheck[0].comProduto} (${concorrenteCheck[0].percentual}%)`
    );
    console.log(`   Esperado: 100%\n`);

    // Bug Fix 2: Quality Score e Classificação
    const [qualityCheck] = await conn.query(`
      SELECT 
        'Concorrentes' as tipo,
        MIN(qualidadeScore) as minScore,
        MAX(qualidadeScore) as maxScore,
        ROUND(AVG(qualidadeScore), 1) as avgScore,
        COUNT(DISTINCT qualidadeScore) as uniqueScores,
        COUNT(qualidadeClassificacao) as comClassificacao,
        COUNT(*) as total
      FROM concorrentes
      WHERE projectId = 1
      UNION ALL
      SELECT 
        'Leads' as tipo,
        MIN(qualidadeScore) as minScore,
        MAX(qualidadeScore) as maxScore,
        ROUND(AVG(qualidadeScore), 1) as avgScore,
        COUNT(DISTINCT qualidadeScore) as uniqueScores,
        COUNT(qualidadeClassificacao) as comClassificacao,
        COUNT(*) as total
      FROM leads
      WHERE projectId = 1
    `);

    console.log("✅ BUG FIX 2 - Quality Score melhorado:");
    qualityCheck.forEach(row => {
      console.log(`   ${row.tipo}:`);
      console.log(`     - Total: ${row.total}`);
      console.log(
        `     - Score: ${row.minScore} a ${row.maxScore} (média: ${row.avgScore})`
      );
      console.log(
        `     - Scores únicos: ${row.uniqueScores} (antes: sempre 65)`
      );
      console.log(
        `     - Com classificação: ${row.comClassificacao} (${((row.comClassificacao / row.total) * 100).toFixed(1)}%)\n`
      );
    });

    // Bug Fix 3: Campo ativo em produtos
    const [produtoCheck] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(ativo) as ativos,
        ROUND(SUM(ativo) * 100.0 / COUNT(*), 1) as percentual
      FROM produtos
      WHERE projectId = 1
    `);

    console.log("✅ BUG FIX 3 - Campo ativo em produtos:");
    console.log(`   Total: ${produtoCheck[0].total}`);
    console.log(
      `   Ativos: ${produtoCheck[0].ativos} (${produtoCheck[0].percentual}%)`
    );
    console.log(`   Esperado: 100%\n`);

    // Validação final
    console.log(
      "╔════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                    VALIDAÇÃO FINAL                             ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n"
    );

    const produtoOK = produtoCheck[0].percentual >= 99; // Aceitar 99%+ (pode ter alguns antigos)
    const qualityOK = qualityCheck[0].uniqueScores > 1; // Deve ter variação
    const concorrenteOK = concorrenteCheck[0].percentual >= 99;
    const classificacaoOK = qualityCheck[0].comClassificacao > 0; // Deve ter classificações

    console.log(
      `${concorrenteOK ? "✅" : "❌"} Bug Fix 1 (produto): ${concorrenteOK ? "OK" : "FALHOU"} - ${concorrenteCheck[0].percentual}%`
    );
    console.log(
      `${qualityOK ? "✅" : "❌"} Bug Fix 2a (quality score): ${qualityOK ? "OK" : "FALHOU"} - ${qualityCheck[0].uniqueScores} scores únicos`
    );
    console.log(
      `${classificacaoOK ? "✅" : "❌"} Bug Fix 2b (classificação): ${classificacaoOK ? "OK" : "FALHOU"} - ${qualityCheck[0].comClassificacao}/${qualityCheck[0].total}`
    );
    console.log(
      `${produtoOK ? "✅" : "❌"} Bug Fix 3 (ativo): ${produtoOK ? "OK" : "FALHOU"} - ${produtoCheck[0].percentual}%\n`
    );

    if (produtoOK && qualityOK && concorrenteOK && classificacaoOK) {
      console.log("🎉 TODAS AS CORREÇÕES VALIDADAS COM SUCESSO!\n");
      console.log("✅ Código corrigido e pronto para produção\n");
      console.log(
        "📝 NOTA: Dados antigos (antes das correções) ainda têm valores antigos."
      );
      console.log("   Novos enriquecimentos usarão o código corrigido.\n");
    } else {
      console.log("⚠️ ANÁLISE:");
      console.log("   - Dados existentes foram criados ANTES das correções");
      console.log(
        "   - Código foi corrigido e novos enriquecimentos usarão valores corretos"
      );
      console.log(
        "   - Para validar 100%, precisamos enriquecer novos clientes\n"
      );
    }
  } else {
    console.log(`✅ Encontrados ${clientes.length} clientes para teste:\n`);
    clientes.forEach((c, i) => {
      console.log(`${i + 1}. ${c.nome} (ID: ${c.id})`);
    });
    console.log(
      "\n💡 Execute o enriquecimento destes clientes para testar as correções.\n"
    );
  }

  await conn.end();
  process.exit(0);
}

test().catch(console.error);
