import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { clientes } from "./drizzle/schema";
import { executeEnrichmentFlow, type EnrichmentInput } from "./server/enrichmentFlow";

const db = drizzle(process.env.DATABASE_URL!);

async function createLeadsReaisProject() {
  console.log("🚀 Criando projeto 'Leads Reais' e reprocessando clientes...\n");

  // 1. Buscar todos os clientes do projeto Embalagens
  console.log("📋 Buscando clientes do projeto Embalagens (ID: 1)...");
  const allClientes = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, 1));
  
  console.log(`   ✅ ${allClientes.length} clientes encontrados\n`);

  // 2. Preparar input para enriquecimento
  const enrichmentInput: EnrichmentInput = {
    projectName: "Leads Reais",
    projectDescription: "Projeto com filtros avançados - apenas empresas reais validadas",
    clientes: allClientes.map(c => ({
      nome: c.nome,
      cnpj: c.cnpj || undefined,
      produto: c.produto,
      segmento: c.segmento || undefined,
      porte: c.porte || undefined,
      estado: c.estado || undefined,
      cidade: c.cidade || undefined,
    })),
  };

  console.log(`   ✅ ${enrichmentInput.clientes.length} clientes preparados\n`);

  // 3. Executar enriquecimento com filtros avançados
  console.log("🔄 Iniciando enriquecimento com filtros avançados...");
  console.log("   (Isso pode levar 30-60 minutos para 800 clientes)\n");

  try {
    const result = await executeEnrichmentFlow(
      enrichmentInput,
      (progress) => {
        console.log(`   [${progress.currentStep}/${progress.totalSteps}] ${progress.message}`);
      }
    );

    if (result.status === 'completed' && result.data) {
      console.log("\n✅ Enriquecimento concluído!");
      console.log(`   Projeto ID: ${result.data.projectId}`);
      console.log(`   Mercados: ${result.data.mercadosCount}`);
      console.log(`   Clientes: ${result.data.clientesCount}`);
      console.log(`   Concorrentes: ${result.data.concorrentesCount}`);
      console.log(`   Leads: ${result.data.leadsCount}`);
      return result.data;
    } else {
      throw new Error(result.message || 'Enriquecimento falhou');
    }
  } catch (error) {
    console.error("\n❌ Erro durante enriquecimento:", error);
    throw error;
  }
}

createLeadsReaisProject()
  .then(() => {
    console.log("\n🎉 Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
