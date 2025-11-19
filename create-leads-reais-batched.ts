import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { clientes } from "./drizzle/schema";
import { executeEnrichmentFlow, type EnrichmentInput } from "./server/enrichmentFlow";

const db = drizzle(process.env.DATABASE_URL!);

const BATCH_SIZE = 50;

async function createLeadsReaisProjectBatched() {
  console.log("🚀 Criando projeto 'Leads Reais' com processamento em lotes...\n");

  // 1. Buscar todos os clientes do projeto Embalagens
  console.log("📋 Buscando clientes do projeto Embalagens (ID: 1)...");
  const allClientes = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, 1));
  
  console.log(`   ✅ ${allClientes.length} clientes encontrados\n`);

  // 2. Dividir em lotes de 50
  const totalBatches = Math.ceil(allClientes.length / BATCH_SIZE);
  console.log(`📦 Dividindo em ${totalBatches} lotes de ${BATCH_SIZE} clientes\n`);

  // 3. Processar cada lote
  let projectId: number | undefined;
  let totalProcessed = 0;
  let totalMercados = 0;
  let totalConcorrentes = 0;
  let totalLeads = 0;

  for (let i = 0; i < totalBatches; i++) {
    const batchStart = i * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, allClientes.length);
    const batch = allClientes.slice(batchStart, batchEnd);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 Processando lote ${i + 1}/${totalBatches} (${batch.length} clientes)`);
    console.log(`${"=".repeat(60)}\n`);

    try {
      const enrichmentInput: EnrichmentInput = {
        projectName: i === 0 ? "Leads Reais" : undefined, // Criar projeto apenas no primeiro lote
        projectId: projectId, // Reusar projeto nos lotes seguintes
        projectDescription: i === 0 ? "Projeto com filtros avançados - apenas empresas reais validadas" : undefined,
        clientes: batch.map(c => ({
          nome: c.nome,
          cnpj: c.cnpj || undefined,
          produto: c.produto,
          segmento: c.segmento || undefined,
          porte: c.porte || undefined,
          estado: c.estado || undefined,
          cidade: c.cidade || undefined,
        })),
      };

      const result = await executeEnrichmentFlow(
        enrichmentInput,
        (progress) => {
          console.log(`   [${progress.currentStep}/${progress.totalSteps}] ${progress.message}`);
        }
      );

      if (result.status === 'completed' && result.data) {
        // Salvar projectId do primeiro lote
        if (!projectId) {
          projectId = result.data.projectId;
          console.log(`\n✅ Projeto criado com ID: ${projectId}`);
        }

        totalProcessed += batch.length;
        totalMercados = result.data.mercadosCount || 0;
        totalConcorrentes += result.data.concorrentesCount || 0;
        totalLeads += result.data.leadsCount || 0;

        console.log(`\n✅ Lote ${i + 1} concluído!`);
        console.log(`   Clientes processados: ${totalProcessed}/${allClientes.length}`);
        console.log(`   Mercados: ${totalMercados}`);
        console.log(`   Concorrentes: ${totalConcorrentes}`);
        console.log(`   Leads: ${totalLeads}`);
      } else {
        throw new Error(result.message || 'Enriquecimento falhou');
      }

      // Aguardar 2 segundos entre lotes para evitar sobrecarga
      if (i < totalBatches - 1) {
        console.log(`\n⏳ Aguardando 2 segundos antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`\n❌ Erro no lote ${i + 1}:`, error);
      console.log(`\n📊 Progresso até o erro:`);
      console.log(`   Clientes processados: ${totalProcessed}/${allClientes.length}`);
      console.log(`   Mercados: ${totalMercados}`);
      console.log(`   Concorrentes: ${totalConcorrentes}`);
      console.log(`   Leads: ${totalLeads}`);
      throw error;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 PROCESSAMENTO COMPLETO!");
  console.log(`${"=".repeat(60)}`);
  console.log(`\n📊 Resultados Finais:`);
  console.log(`   Projeto ID: ${projectId}`);
  console.log(`   Clientes: ${totalProcessed}`);
  console.log(`   Mercados: ${totalMercados}`);
  console.log(`   Concorrentes: ${totalConcorrentes}`);
  console.log(`   Leads: ${totalLeads}`);

  return {
    projectId,
    clientesCount: totalProcessed,
    mercadosCount: totalMercados,
    concorrentesCount: totalConcorrentes,
    leadsCount: totalLeads,
  };
}

createLeadsReaisProjectBatched()
  .then(() => {
    console.log("\n✅ Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
