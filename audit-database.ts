/**
 * Script de Auditoria Completa do Banco de Dados
 *
 * Verifica:
 * 1. Dados órfãos (sem projectId ou pesquisaId)
 * 2. Integridade referencial (FKs inválidas)
 * 3. Consistência de contadores
 * 4. Duplicatas
 */

import { getDb } from "./server/db";

interface AuditResult {
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  issue: string;
  count: number;
  query?: string;
  suggestion?: string;
}

const results: AuditResult[] = [];

async function auditOrphanRecords() {
  console.log("\n🔍 Verificando dados órfãos...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 1. Pesquisas sem projeto
  const [orphanPesquisas] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM pesquisas 
    WHERE projectId NOT IN (SELECT id FROM projects)
  `);
  const pesquisasCount = (orphanPesquisas as any)[0].count;
  if (pesquisasCount > 0) {
    results.push({
      category: "Dados Órfãos",
      severity: "critical",
      issue: "Pesquisas sem projeto válido",
      count: pesquisasCount,
      query:
        "SELECT * FROM pesquisas WHERE projectId NOT IN (SELECT id FROM projects)",
      suggestion: "Deletar pesquisas órfãs ou associar a um projeto válido",
    });
  }

  // 2. Mercados sem pesquisa
  const [orphanMercados] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM mercados_unicos 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);
  const mercadosCount = (orphanMercados as any)[0].count;
  if (mercadosCount > 0) {
    results.push({
      category: "Dados Órfãos",
      severity: "high",
      issue: "Mercados sem pesquisa válida",
      count: mercadosCount,
      query:
        "SELECT * FROM mercados_unicos WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)",
      suggestion: "Associar mercados a uma pesquisa válida ou deletar",
    });
  }

  // 3. Clientes sem pesquisa
  const [orphanClientes] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM clientes 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);
  const clientesCount = (orphanClientes as any)[0].count;
  if (clientesCount > 0) {
    results.push({
      category: "Dados Órfãos",
      severity: "critical",
      issue: "Clientes sem pesquisa válida",
      count: clientesCount,
      query:
        "SELECT * FROM clientes WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)",
      suggestion: "Associar clientes a uma pesquisa válida",
    });
  }

  // 4. Concorrentes sem pesquisa
  const [orphanConcorrentes] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM concorrentes 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);
  const concorrentesCount = (orphanConcorrentes as any)[0].count;
  if (concorrentesCount > 0) {
    results.push({
      category: "Dados Órfãos",
      severity: "high",
      issue: "Concorrentes sem pesquisa válida",
      count: concorrentesCount,
      query:
        "SELECT * FROM concorrentes WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)",
      suggestion: "Associar concorrentes a uma pesquisa válida",
    });
  }

  // 5. Leads sem pesquisa
  const [orphanLeads] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM leads 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);
  const leadsCount = (orphanLeads as any)[0].count;
  if (leadsCount > 0) {
    results.push({
      category: "Dados Órfãos",
      severity: "high",
      issue: "Leads sem pesquisa válida",
      count: leadsCount,
      query:
        "SELECT * FROM leads WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)",
      suggestion: "Associar leads a uma pesquisa válida",
    });
  }

  // 6. Produtos sem cliente
  const [orphanProdutos] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM produtos 
    WHERE clienteId NOT IN (SELECT id FROM clientes)
  `);
  const produtosCount = (orphanProdutos as any)[0].count;
  if (produtosCount > 0) {
    results.push({
      category: "Dados Órfãos",
      severity: "medium",
      issue: "Produtos sem cliente válido",
      count: produtosCount,
      query:
        "SELECT * FROM produtos WHERE clienteId NOT IN (SELECT id FROM clientes)",
      suggestion: "Deletar produtos órfãos",
    });
  }
}

async function auditDuplicates() {
  console.log("\n🔍 Verificando duplicatas...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 1. Clientes duplicados por hash
  const [dupClientes] = await db.execute(`
    SELECT clienteHash, COUNT(*) as count 
    FROM clientes 
    GROUP BY clienteHash 
    HAVING count > 1
  `);
  const dupClientesCount = (dupClientes as any).length;
  if (dupClientesCount > 0) {
    results.push({
      category: "Duplicatas",
      severity: "medium",
      issue: "Clientes com hash duplicado",
      count: dupClientesCount,
      query:
        "SELECT clienteHash, COUNT(*) as count FROM clientes GROUP BY clienteHash HAVING count > 1",
      suggestion: "Revisar constraint UNIQUE em clienteHash",
    });
  }

  // 2. Concorrentes duplicados por hash
  const [dupConcorrentes] = await db.execute(`
    SELECT concorrenteHash, COUNT(*) as count 
    FROM concorrentes 
    GROUP BY concorrenteHash 
    HAVING count > 1
  `);
  const dupConcorrentesCount = (dupConcorrentes as any).length;
  if (dupConcorrentesCount > 0) {
    results.push({
      category: "Duplicatas",
      severity: "medium",
      issue: "Concorrentes com hash duplicado",
      count: dupConcorrentesCount,
      query:
        "SELECT concorrenteHash, COUNT(*) as count FROM concorrentes GROUP BY concorrenteHash HAVING count > 1",
      suggestion: "Revisar constraint UNIQUE em concorrenteHash",
    });
  }

  // 3. Leads duplicados por hash
  const [dupLeads] = await db.execute(`
    SELECT leadHash, COUNT(*) as count 
    FROM leads 
    GROUP BY leadHash 
    HAVING count > 1
  `);
  const dupLeadsCount = (dupLeads as any).length;
  if (dupLeadsCount > 0) {
    results.push({
      category: "Duplicatas",
      severity: "medium",
      issue: "Leads com hash duplicado",
      count: dupLeadsCount,
      query:
        "SELECT leadHash, COUNT(*) as count FROM leads GROUP BY leadHash HAVING count > 1",
      suggestion: "Revisar constraint UNIQUE em leadHash",
    });
  }

  // 4. Mercados duplicados por nome
  const [dupMercados] = await db.execute(`
    SELECT nome, COUNT(*) as count 
    FROM mercados_unicos 
    GROUP BY nome 
    HAVING count > 1
  `);
  const dupMercadosCount = (dupMercados as any).length;
  if (dupMercadosCount > 0) {
    results.push({
      category: "Duplicatas",
      severity: "low",
      issue: "Mercados com nome duplicado",
      count: dupMercadosCount,
      query:
        "SELECT nome, COUNT(*) as count FROM mercados_unicos GROUP BY nome HAVING count > 1",
      suggestion:
        "Mercados podem ter nomes iguais em pesquisas diferentes (OK)",
    });
  }
}

async function auditConsistency() {
  console.log("\n🔍 Verificando consistência de contadores...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 1. Verificar totalClientes vs clientes reais
  const [pesquisasData] = await db.execute(`
    SELECT 
      p.id, 
      p.nome, 
      p.totalClientes as declarado,
      COUNT(c.id) as contagem_real
    FROM pesquisas p
    LEFT JOIN clientes c ON c.pesquisaId = p.id
    GROUP BY p.id
    HAVING declarado != contagem_real
  `);
  const inconsistentCount = (pesquisasData as any).length;
  if (inconsistentCount > 0) {
    results.push({
      category: "Consistência",
      severity: "medium",
      issue: "Pesquisas com totalClientes inconsistente",
      count: inconsistentCount,
      query:
        "SELECT p.id, p.nome, p.totalClientes as declarado, COUNT(c.id) as real FROM pesquisas p LEFT JOIN clientes c ON c.pesquisaId = p.id GROUP BY p.id HAVING declarado != real",
      suggestion: "Atualizar campo totalClientes com contagem real",
    });
  }
}

async function auditStatistics() {
  console.log("\n📊 Coletando estatísticas gerais...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [projects] = await db.execute("SELECT COUNT(*) as count FROM projects");
  const [pesquisas] = await db.execute(
    "SELECT COUNT(*) as count FROM pesquisas"
  );
  const [mercados] = await db.execute(
    "SELECT COUNT(*) as count FROM mercados_unicos"
  );
  const [clientes] = await db.execute("SELECT COUNT(*) as count FROM clientes");
  const [concorrentes] = await db.execute(
    "SELECT COUNT(*) as count FROM concorrentes"
  );
  const [leads] = await db.execute("SELECT COUNT(*) as count FROM leads");
  const [produtos] = await db.execute("SELECT COUNT(*) as count FROM produtos");

  console.log("📊 Estatísticas Gerais:");
  console.log(`  - Projetos: ${(projects as any)[0].count}`);
  console.log(`  - Pesquisas: ${(pesquisas as any)[0].count}`);
  console.log(`  - Mercados: ${(mercados as any)[0].count}`);
  console.log(`  - Clientes: ${(clientes as any)[0].count}`);
  console.log(`  - Concorrentes: ${(concorrentes as any)[0].count}`);
  console.log(`  - Leads: ${(leads as any)[0].count}`);
  console.log(`  - Produtos: ${(produtos as any)[0].count}`);
}

async function generateReport() {
  console.log("\n📝 Gerando relatório...\n");

  const fs = await import("fs");
  const report = `# Relatório de Auditoria do Banco de Dados
**Data:** ${new Date().toLocaleString("pt-BR")}

## Resumo Executivo

Total de problemas encontrados: **${results.length}**

- Críticos: ${results.filter(r => r.severity === "critical").length}
- Altos: ${results.filter(r => r.severity === "high").length}
- Médios: ${results.filter(r => r.severity === "medium").length}
- Baixos: ${results.filter(r => r.severity === "low").length}

---

## Problemas Encontrados

${results.length === 0 ? "✅ Nenhum problema encontrado! Banco de dados está íntegro." : ""}

${results
  .map(
    (r, i) => `
### ${i + 1}. ${r.issue}

- **Categoria:** ${r.category}
- **Severidade:** ${r.severity.toUpperCase()}
- **Quantidade:** ${r.count} registros
${r.query ? `- **Query de verificação:**\n\`\`\`sql\n${r.query}\n\`\`\`` : ""}
${r.suggestion ? `- **Sugestão:** ${r.suggestion}` : ""}
`
  )
  .join("\n---\n")}

---

## Recomendações

${
  results.filter(r => r.severity === "critical").length > 0
    ? `
### ⚠️ AÇÃO IMEDIATA NECESSÁRIA

Os problemas críticos encontrados podem causar perda de dados ou inconsistências graves. Recomenda-se:

1. Fazer backup completo do banco de dados
2. Executar correções para problemas críticos
3. Validar correções com queries de verificação
4. Monitorar sistema após correções
`
    : "✅ Nenhum problema crítico encontrado."
}

${
  results.filter(r => r.severity === "high").length > 0
    ? `
### 🔶 AÇÃO RECOMENDADA

Os problemas de alta severidade devem ser corrigidos em breve para evitar inconsistências futuras.
`
    : ""
}

---

## Próximos Passos

1. Revisar cada problema listado acima
2. Executar queries de verificação para entender o contexto
3. Criar script de correção (migration) se necessário
4. Testar correções em ambiente de desenvolvimento
5. Aplicar correções em produção com backup
6. Re-executar auditoria para validar correções
`;

  fs.writeFileSync(
    "/home/ubuntu/gestor-pav/RELATORIO_AUDITORIA_BANCO.md",
    report
  );
  console.log("✅ Relatório salvo em: RELATORIO_AUDITORIA_BANCO.md\n");
}

async function main() {
  console.log("🔍 Iniciando Auditoria Completa do Banco de Dados...\n");
  console.log("=".repeat(60));

  try {
    await auditStatistics();
    await auditOrphanRecords();
    await auditDuplicates();
    await auditConsistency();
    await generateReport();

    console.log("=".repeat(60));
    console.log("\n✅ Auditoria concluída!\n");

    if (results.length === 0) {
      console.log("🎉 Banco de dados está 100% íntegro!\n");
    } else {
      console.log(`⚠️  ${results.length} problemas encontrados.\n`);
      console.log(
        "📄 Veja o relatório completo em: RELATORIO_AUDITORIA_BANCO.md\n"
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante auditoria:", error);
    process.exit(1);
  }
}

main();
