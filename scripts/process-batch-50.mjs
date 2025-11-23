/**
 * Processamento em blocos de 50 clientes
 * Continua de onde parou (baseado em validationStatus)
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { clientes } from "../drizzle/schema.ts";
import { enrichClienteOptimized } from "../server/enrichmentOptimized.ts";

const PROJECT_ID = 1;
const BATCH_SIZE = 50;

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  console.log("🚀 Processamento em Blocos de 50 Clientes");
  console.log(
    "======================================================================\n"
  );

  // Buscar clientes pendentes
  const clientesPendentes = await db
    .select()
    .from(clientes)
    .where(
      and(
        eq(clientes.projectId, PROJECT_ID),
        eq(clientes.validationStatus, "pending")
      )
    )
    .limit(BATCH_SIZE);

  if (clientesPendentes.length === 0) {
    console.log("✅ Todos os clientes já foram processados!");
    process.exit(0);
  }

  console.log(`📋 ${clientesPendentes.length} clientes pendentes encontrados`);
  console.log(`⏳ Processando bloco de ${BATCH_SIZE} clientes...\n`);

  let sucessos = 0;
  let erros = 0;

  for (let i = 0; i < clientesPendentes.length; i++) {
    const cliente = clientesPendentes[i];

    try {
      console.log(
        `\n[${i + 1}/${clientesPendentes.length}] Processando: ${cliente.nome}`
      );

      const result = await enrichClienteOptimized(cliente.id, PROJECT_ID);

      if (result.success) {
        sucessos++;
        console.log(`✅ Sucesso em ${(result.duration / 1000).toFixed(1)}s`);
        console.log(
          `   ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
        );
      } else {
        erros++;
        console.log(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      erros++;
      console.error(`❌ Erro ao processar ${cliente.nome}:`, error.message);
    }
  }

  console.log(
    "\n======================================================================"
  );
  console.log("📊 RESUMO DO BLOCO:");
  console.log(`   ✅ Sucessos: ${sucessos}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log(
    `   📈 Taxa de sucesso: ${((sucessos / clientesPendentes.length) * 100).toFixed(1)}%`
  );
  console.log(
    "======================================================================\n"
  );
}

main().catch(console.error);
