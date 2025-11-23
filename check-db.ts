import { getDb } from "./server/db";
import {
  mercadosUnicos,
  concorrentes,
  leads,
  produtos,
  clientes,
} from "./drizzle/schema";
import { eq } from "drizzle-orm";

(async () => {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  console.log("🔍 Verificando dados no banco (Project ID = 1)...\n");

  const [mercados] = await db
    .select({ count: mercadosUnicos.id })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, 1));
  const [concorrentesCount] = await db
    .select({ count: concorrentes.id })
    .from(concorrentes)
    .where(eq(concorrentes.projectId, 1));
  const [leadsCount] = await db
    .select({ count: leads.id })
    .from(leads)
    .where(eq(leads.projectId, 1));
  const [produtosCount] = await db
    .select({ count: produtos.id })
    .from(produtos)
    .where(eq(produtos.projectId, 1));
  const [clientesCount] = await db
    .select({ count: clientes.id })
    .from(clientes)
    .where(eq(clientes.projectId, 1));

  console.log("📊 TOTAIS:");
  console.log(`   Clientes: ${clientesCount ? 1 : 0}`);
  console.log(`   Mercados: ${mercados ? 1 : 0}`);
  console.log(`   Produtos: ${produtosCount ? 1 : 0}`);
  console.log(`   Concorrentes: ${concorrentesCount ? 1 : 0}`);
  console.log(`   Leads: ${leadsCount ? 1 : 0}\n`);

  // Listar mercados
  const mercadosList = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, 1));
  console.log(`🎯 Mercados (${mercadosList.length}):`);
  mercadosList.forEach(m => console.log(`   - ${m.nome}`));

  console.log("\n");
  process.exit(0);
})();
