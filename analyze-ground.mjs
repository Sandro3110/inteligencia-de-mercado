import Database from "better-sqlite3";

const db = new Database("./drizzle/db.sqlite");

console.log("=== ANÁLISE DO PROJETO GROUND ===\n");

// 1. Buscar projeto Ground
const project = db
  .prepare(
    `
  SELECT id, name, description, status, createdAt, lastActivityAt 
  FROM projects 
  WHERE name LIKE '%Ground%' OR name LIKE '%ground%'
`
  )
  .get();

if (!project) {
  console.log("❌ Projeto Ground não encontrado!");
  process.exit(1);
}

console.log("📊 INFORMAÇÕES DO PROJETO:");
console.log(`ID: ${project.id}`);
console.log(`Nome: ${project.name}`);
console.log(`Descrição: ${project.description || "N/A"}`);
console.log(`Status: ${project.status}`);
console.log(`Criado em: ${project.createdAt}`);
console.log(`Última atividade: ${project.lastActivityAt}`);
console.log("");

// 2. Buscar pesquisas do projeto
const pesquisas = db
  .prepare(
    `
  SELECT id, nome, descricao, totalClientes, status, createdAt
  FROM pesquisas
  WHERE projectId = ?
`
  )
  .all(project.id);

console.log(`📋 PESQUISAS DO PROJETO: ${pesquisas.length}`);
pesquisas.forEach(p => {
  console.log(
    `  - ID ${p.id}: ${p.nome} (${p.totalClientes} clientes) - Status: ${p.status}`
  );
});
console.log("");

// 3. Contar clientes
const clientesCount = db
  .prepare(
    `
  SELECT COUNT(*) as total 
  FROM clientes 
  WHERE projectId = ?
`
  )
  .get(project.id);

console.log(`👥 CLIENTES: ${clientesCount.total}`);

// 4. Amostra de clientes
const clientesSample = db
  .prepare(
    `
  SELECT id, empresa, cnpj, produto, qualidadeScore, validationStatus
  FROM clientes 
  WHERE projectId = ?
  LIMIT 10
`
  )
  .all(project.id);

console.log("\n📝 AMOSTRA DE CLIENTES (primeiros 10):");
clientesSample.forEach(c => {
  console.log(
    `  - ${c.empresa} (CNPJ: ${c.cnpj || "N/A"}) | Produto: ${c.produto || "N/A"} | Score: ${c.qualidadeScore || 0} | Status: ${c.validationStatus}`
  );
});
console.log("");

// 5. Contar mercados
const mercadosCount = db
  .prepare(
    `
  SELECT COUNT(*) as total 
  FROM mercados_unicos 
  WHERE projectId = ?
`
  )
  .get(project.id);

console.log(`🎯 MERCADOS IDENTIFICADOS: ${mercadosCount.total}`);

// 6. Amostra de mercados
const mercadosSample = db
  .prepare(
    `
  SELECT id, nome, segmentacao, categoria
  FROM mercados_unicos 
  WHERE projectId = ?
  LIMIT 10
`
  )
  .all(project.id);

console.log("\n🎯 AMOSTRA DE MERCADOS (primeiros 10):");
mercadosSample.forEach(m => {
  console.log(
    `  - ${m.nome} (${m.segmentacao}) | Categoria: ${m.categoria || "N/A"}`
  );
});
console.log("");

// 7. Contar concorrentes
const concorrentesCount = db
  .prepare(
    `
  SELECT COUNT(*) as total 
  FROM concorrentes 
  WHERE projectId = ?
`
  )
  .get(project.id);

console.log(`🏢 CONCORRENTES: ${concorrentesCount.total}`);

// 8. Contar leads
const leadsCount = db
  .prepare(
    `
  SELECT COUNT(*) as total 
  FROM leads 
  WHERE projectId = ?
`
  )
  .get(project.id);

console.log(`📞 LEADS: ${leadsCount.total}`);

// 9. Contar produtos
const produtosCount = db
  .prepare(
    `
  SELECT COUNT(*) as total 
  FROM produtos 
  WHERE projectId = ?
`
  )
  .get(project.id);

console.log(`📦 PRODUTOS: ${produtosCount.total}`);
console.log("");

// 10. Estatísticas de qualidade
const qualityStats = db
  .prepare(
    `
  SELECT 
    AVG(qualidadeScore) as avgScore,
    MIN(qualidadeScore) as minScore,
    MAX(qualidadeScore) as maxScore,
    COUNT(CASE WHEN qualidadeScore >= 80 THEN 1 END) as excelente,
    COUNT(CASE WHEN qualidadeScore >= 60 AND qualidadeScore < 80 THEN 1 END) as bom,
    COUNT(CASE WHEN qualidadeScore >= 40 AND qualidadeScore < 60 THEN 1 END) as regular,
    COUNT(CASE WHEN qualidadeScore < 40 THEN 1 END) as ruim
  FROM clientes
  WHERE projectId = ?
`
  )
  .get(project.id);

console.log("📊 ESTATÍSTICAS DE QUALIDADE DOS CLIENTES:");
console.log(`  Score Médio: ${qualityStats.avgScore?.toFixed(2) || 0}`);
console.log(`  Score Mínimo: ${qualityStats.minScore || 0}`);
console.log(`  Score Máximo: ${qualityStats.maxScore || 0}`);
console.log(`  Excelente (80-100): ${qualityStats.excelente}`);
console.log(`  Bom (60-79): ${qualityStats.bom}`);
console.log(`  Regular (40-59): ${qualityStats.regular}`);
console.log(`  Ruim (0-39): ${qualityStats.ruim}`);
console.log("");

// 11. Verificar jobs de enriquecimento
const jobs = db
  .prepare(
    `
  SELECT id, pesquisaId, totalClients, processedClients, status, createdAt, completedAt
  FROM enrichment_jobs
  WHERE pesquisaId IN (SELECT id FROM pesquisas WHERE projectId = ?)
  ORDER BY createdAt DESC
  LIMIT 5
`
  )
  .all(project.id);

console.log(`⚙️ JOBS DE ENRIQUECIMENTO: ${jobs.length}`);
jobs.forEach(j => {
  console.log(
    `  - Job #${j.id}: ${j.processedClients}/${j.totalClients} clientes | Status: ${j.status}`
  );
  console.log(
    `    Criado: ${j.createdAt} | Concluído: ${j.completedAt || "Em andamento"}`
  );
});
console.log("");

// 12. Análise de retorno (concorrentes e leads por cliente)
const returnAnalysis = db
  .prepare(
    `
  SELECT 
    (SELECT COUNT(*) FROM concorrentes WHERE projectId = ?) * 1.0 / NULLIF((SELECT COUNT(*) FROM clientes WHERE projectId = ?), 0) as concorrentesPorCliente,
    (SELECT COUNT(*) FROM leads WHERE projectId = ?) * 1.0 / NULLIF((SELECT COUNT(*) FROM clientes WHERE projectId = ?), 0) as leadsPorCliente,
    (SELECT COUNT(*) FROM produtos WHERE projectId = ?) * 1.0 / NULLIF((SELECT COUNT(*) FROM clientes WHERE projectId = ?), 0) as produtosPorCliente
`
  )
  .get(project.id, project.id, project.id, project.id, project.id, project.id);

console.log("📈 ANÁLISE DE RETORNO:");
console.log(
  `  Concorrentes por Cliente: ${returnAnalysis.concorrentesPorCliente?.toFixed(2) || 0}`
);
console.log(
  `  Leads por Cliente: ${returnAnalysis.leadsPorCliente?.toFixed(2) || 0}`
);
console.log(
  `  Produtos por Cliente: ${returnAnalysis.produtosPorCliente?.toFixed(2) || 0}`
);
console.log("");

console.log("=== FIM DA ANÁLISE ===");

db.close();
