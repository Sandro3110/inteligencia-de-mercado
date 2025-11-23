import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, sql } from "drizzle-orm";
import {
  projects,
  pesquisas,
  clientes,
  mercadosUnicos,
  concorrentes,
  leads,
  produtos,
  enrichmentJobs,
} from "./drizzle/schema";

const sqlite = new Database("./drizzle/db.sqlite");
const db = drizzle(sqlite);

async function analyzeGround() {
  console.log("=== ANÁLISE DO PROJETO GROUND ===\n");

  // 1. Buscar projeto Ground
  const projectList = await db
    .select()
    .from(projects)
    .where(sql`name LIKE '%Ground%' OR name LIKE '%ground%'`);

  if (projectList.length === 0) {
    console.log("❌ Projeto Ground não encontrado!");
    process.exit(1);
  }

  const project = projectList[0];

  console.log("📊 INFORMAÇÕES DO PROJETO:");
  console.log(`ID: ${project.id}`);
  console.log(`Nome: ${project.name}`);
  console.log(`Descrição: ${project.description || "N/A"}`);
  console.log(`Status: ${project.status}`);
  console.log(`Criado em: ${project.createdAt}`);
  console.log(`Última atividade: ${project.lastActivityAt}`);
  console.log("");

  // 2. Buscar pesquisas
  const pesquisasList = await db
    .select()
    .from(pesquisas)
    .where(eq(pesquisas.projectId, project.id));

  console.log(`📋 PESQUISAS DO PROJETO: ${pesquisasList.length}`);
  pesquisasList.forEach(p => {
    console.log(
      `  - ID ${p.id}: ${p.nome} (${p.totalClientes} clientes) - Status: ${p.status}`
    );
  });
  console.log("");

  // 3. Contar e amostrar clientes
  const clientesList = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, project.id))
    .limit(10);
  const clientesTotal = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientes)
    .where(eq(clientes.projectId, project.id));

  console.log(`👥 CLIENTES: ${clientesTotal[0].count}`);
  console.log("\n📝 AMOSTRA DE CLIENTES (primeiros 10):");
  clientesList.forEach(c => {
    console.log(
      `  - ${c.empresa} (CNPJ: ${c.cnpj || "N/A"}) | Produto: ${c.produto || "N/A"} | Score: ${c.qualidadeScore || 0} | Status: ${c.validationStatus}`
    );
  });
  console.log("");

  // 4. Contar e amostrar mercados
  const mercadosList = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, project.id))
    .limit(10);
  const mercadosTotal = await db
    .select({ count: sql<number>`count(*)` })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, project.id));

  console.log(`🎯 MERCADOS IDENTIFICADOS: ${mercadosTotal[0].count}`);
  console.log("\n🎯 AMOSTRA DE MERCADOS (primeiros 10):");
  mercadosList.forEach(m => {
    console.log(
      `  - ${m.nome} (${m.segmentacao}) | Categoria: ${m.categoria || "N/A"}`
    );
  });
  console.log("");

  // 5. Contar concorrentes, leads e produtos
  const concorrentesTotal = await db
    .select({ count: sql<number>`count(*)` })
    .from(concorrentes)
    .where(eq(concorrentes.projectId, project.id));
  const leadsTotal = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(eq(leads.projectId, project.id));
  const produtosTotal = await db
    .select({ count: sql<number>`count(*)` })
    .from(produtos)
    .where(eq(produtos.projectId, project.id));

  console.log(`🏢 CONCORRENTES: ${concorrentesTotal[0].count}`);
  console.log(`📞 LEADS: ${leadsTotal[0].count}`);
  console.log(`📦 PRODUTOS: ${produtosTotal[0].count}`);
  console.log("");

  // 6. Estatísticas de qualidade
  const qualityStats = await db
    .select({
      avgScore: sql<number>`AVG(qualidadeScore)`,
      minScore: sql<number>`MIN(qualidadeScore)`,
      maxScore: sql<number>`MAX(qualidadeScore)`,
      excelente: sql<number>`COUNT(CASE WHEN qualidadeScore >= 80 THEN 1 END)`,
      bom: sql<number>`COUNT(CASE WHEN qualidadeScore >= 60 AND qualidadeScore < 80 THEN 1 END)`,
      regular: sql<number>`COUNT(CASE WHEN qualidadeScore >= 40 AND qualidadeScore < 60 THEN 1 END)`,
      ruim: sql<number>`COUNT(CASE WHEN qualidadeScore < 40 THEN 1 END)`,
    })
    .from(clientes)
    .where(eq(clientes.projectId, project.id));

  const stats = qualityStats[0];
  console.log("📊 ESTATÍSTICAS DE QUALIDADE DOS CLIENTES:");
  console.log(`  Score Médio: ${stats.avgScore?.toFixed(2) || 0}`);
  console.log(`  Score Mínimo: ${stats.minScore || 0}`);
  console.log(`  Score Máximo: ${stats.maxScore || 0}`);
  console.log(`  Excelente (80-100): ${stats.excelente}`);
  console.log(`  Bom (60-79): ${stats.bom}`);
  console.log(`  Regular (40-59): ${stats.regular}`);
  console.log(`  Ruim (0-39): ${stats.ruim}`);
  console.log("");

  // 7. Jobs de enriquecimento
  const jobsList = await db
    .select()
    .from(enrichmentJobs)
    .where(
      sql`pesquisaId IN (SELECT id FROM pesquisas WHERE projectId = ${project.id})`
    )
    .orderBy(sql`createdAt DESC`)
    .limit(5);

  console.log(`⚙️ JOBS DE ENRIQUECIMENTO: ${jobsList.length}`);
  jobsList.forEach(j => {
    console.log(
      `  - Job #${j.id}: ${j.processedClients}/${j.totalClients} clientes | Status: ${j.status}`
    );
    console.log(
      `    Criado: ${j.createdAt} | Concluído: ${j.completedAt || "Em andamento"}`
    );
  });
  console.log("");

  // 8. Análise de retorno
  const clientesCount = clientesTotal[0].count;
  const concorrentesPorCliente =
    clientesCount > 0 ? concorrentesTotal[0].count / clientesCount : 0;
  const leadsPorCliente =
    clientesCount > 0 ? leadsTotal[0].count / clientesCount : 0;
  const produtosPorCliente =
    clientesCount > 0 ? produtosTotal[0].count / clientesCount : 0;

  console.log("📈 ANÁLISE DE RETORNO:");
  console.log(
    `  Concorrentes por Cliente: ${concorrentesPorCliente.toFixed(2)}`
  );
  console.log(`  Leads por Cliente: ${leadsPorCliente.toFixed(2)}`);
  console.log(`  Produtos por Cliente: ${produtosPorCliente.toFixed(2)}`);
  console.log("");

  console.log("=== FIM DA ANÁLISE ===");

  sqlite.close();
}

analyzeGround().catch(console.error);
