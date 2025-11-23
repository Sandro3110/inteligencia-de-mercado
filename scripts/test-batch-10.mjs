/**
 * Teste de processamento em lote com 10 clientes
 * Valida sistema de pausa/retomar e checkpoint automático
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, sql } from "drizzle-orm";
import {
  clientes,
  mercadosUnicos,
  produtos,
  concorrentes,
  leads,
} from "../drizzle/schema.ts";

const PROJECT_ID = 1;
const NUM_CLIENTES = 10;

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  console.log("🚀 Teste de Enriquecimento em Lote - 10 Clientes");
  console.log(
    "======================================================================\n"
  );

  // Buscar 10 clientes aleatórios
  const clientesList = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, PROJECT_ID))
    .orderBy(sql`RAND()`)
    .limit(NUM_CLIENTES);

  if (clientesList.length === 0) {
    console.error("❌ Nenhum cliente encontrado!");
    process.exit(1);
  }

  console.log(`📋 ${clientesList.length} CLIENTES SELECIONADOS:\n`);
  clientesList.forEach((cliente, i) => {
    console.log(`${i + 1}. ${cliente.nome} (ID: ${cliente.id})`);
    console.log(`   CNPJ: ${cliente.cnpj}`);
    console.log(`   Produto: ${cliente.produtoPrincipal?.substring(0, 80)}...`);
  });

  console.log(
    "\n======================================================================"
  );
  console.log("⏱️  Para executar o teste:\n");
  console.log("1. Acesse http://localhost:3000/enriquecimento");
  console.log('2. Clique em "Novo Enriquecimento"');
  console.log("3. Aguarde processar alguns clientes");
  console.log('4. Clique em "Pausar" para testar pausa');
  console.log('5. Clique em "Retomar" para continuar');
  console.log("6. Acompanhe o progresso em tempo real\n");

  console.log("📊 ESTATÍSTICAS ATUAIS DO BANCO:\n");

  const [mercadosCount] = await db
    .select({ count: sql`COUNT(DISTINCT id)` })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, PROJECT_ID));
  const [produtosCount] = await db
    .select({ count: sql`COUNT(*)` })
    .from(produtos)
    .where(eq(produtos.projectId, PROJECT_ID));
  const [concorrentesCount] = await db
    .select({ count: sql`COUNT(DISTINCT concorrenteHash)` })
    .from(concorrentes)
    .where(eq(concorrentes.projectId, PROJECT_ID));
  const [leadsCount] = await db
    .select({ count: sql`COUNT(DISTINCT leadHash)` })
    .from(leads)
    .where(eq(leads.projectId, PROJECT_ID));

  console.log(`   Mercados únicos: ${mercadosCount.count}`);
  console.log(`   Produtos: ${produtosCount.count}`);
  console.log(`   Concorrentes únicos: ${concorrentesCount.count}`);
  console.log(`   Leads únicos: ${leadsCount.count}\n`);

  console.log("💡 DICAS:\n");
  console.log("   - O sistema salva progresso automaticamente");
  console.log("   - Você pode fechar o navegador e retomar depois");
  console.log(
    "   - Checkpoint automático a cada 50 clientes (neste teste não será atingido)"
  );
  console.log(
    "   - Notificações enviadas ao proprietário em cada checkpoint\n"
  );

  console.log(
    "======================================================================"
  );
  console.log(
    "✅ Preparação concluída! Acesse a interface para iniciar o teste."
  );
}

main().catch(console.error);
