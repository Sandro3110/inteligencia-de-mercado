import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import {
  projects,
  mercadosUnicos,
  clientes,
  concorrentes,
  leads,
} from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function generateReport() {
  // Buscar projeto mais recente da Jeep
  const projeto = await db
    .select()
    .from(projects)
    .where(eq(projects.nome, "Teste Jeep do Brasil"))
    .limit(1);

  if (projeto.length === 0) {
    console.log("Projeto não encontrado");
    return;
  }

  const projectId = projeto[0].id;
  console.log("\n=== RELATÓRIO COMPLETO - JEEP DO BRASIL ===\n");
  console.log(`Projeto: ${projeto[0].nome} (ID: ${projectId})`);
  console.log(`Criado em: ${projeto[0].createdAt}\n`);

  // Buscar mercado
  const mercado = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, projectId));
  console.log(`\n--- MERCADO IDENTIFICADO ---`);
  if (mercado.length > 0) {
    console.log(`Nome: ${mercado[0].nome}`);
    console.log(`Categoria: ${mercado[0].categoria}`);
    console.log(`Segmentação: ${mercado[0].segmentacao}`);
    console.log(`Descrição: ${mercado[0].descricao || "N/A"}`);
  } else {
    console.log("Nenhum mercado encontrado");
  }

  // Buscar cliente
  const cliente = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, projectId));
  console.log(`\n--- CLIENTE PROCESSADO ---`);
  if (cliente.length > 0) {
    const c = cliente[0];
    console.log(`Nome: ${c.nome}`);
    console.log(`CNPJ: ${c.cnpj || "N/A"}`);
    console.log(`Site: ${c.siteOficial || "N/A"}`);
    console.log(`Produto: ${c.produtoPrincipal || "N/A"}`);
    console.log(`Porte: ${c.porte || "N/A"}`);
    console.log(`Email: ${c.email || "N/A"}`);
    console.log(`Telefone: ${c.telefone || "N/A"}`);
    console.log(`Score de Qualidade: ${c.qualidadeScore}/100`);
    console.log(`Classificação: ${c.qualidadeClassificacao}`);
  } else {
    console.log("Nenhum cliente encontrado");
  }

  // Buscar concorrentes
  const concorrentesList = await db
    .select()
    .from(concorrentes)
    .where(eq(concorrentes.projectId, projectId));
  console.log(`\n--- CONCORRENTES (${concorrentesList.length}) ---`);
  concorrentesList.forEach((c, i) => {
    console.log(`\n${i + 1}. ${c.nome}`);
    console.log(`   CNPJ: ${c.cnpj || "N/A"}`);
    console.log(`   Site: ${c.site || "N/A"}`);
    console.log(`   Produto: ${c.produtoPrincipal || "N/A"}`);
    console.log(`   Score: ${c.qualidadeScore}/100`);
  });

  // Buscar leads
  const leadsList = await db
    .select()
    .from(leads)
    .where(eq(leads.projectId, projectId));
  console.log(`\n--- LEADS (${leadsList.length}) ---`);
  leadsList.forEach((l, i) => {
    console.log(`\n${i + 1}. ${l.nome}`);
    console.log(`   CNPJ: ${l.cnpj || "N/A"}`);
    console.log(`   Site: ${l.site || "N/A"}`);
    console.log(`   Tipo: ${l.tipo || "N/A"}`);
    console.log(`   Região: ${l.regiao || "N/A"}`);
    console.log(`   Score: ${l.qualidadeScore}/100`);
  });

  console.log("\n\n=== FIM DO RELATÓRIO ===\n");
}

generateReport().catch(console.error);
