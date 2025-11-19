import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { mercadosUnicos, clientesMercados } from "./drizzle/schema";
import { searchCompetitors, searchLeads } from "./server/_core/serpApi";

const db = drizzle(process.env.DATABASE_URL!);

const SOURCE_PROJECT_ID = 1; // Embalagens
const TARGET_PROJECT_ID = 270005; // Leads Reais

async function enrichLeadsReaisWithMarkets() {
  console.log("🚀 Enriquecendo projeto 'Leads Reais' com mercados e concorrentes/leads...\n");

  // 1. Copiar mercados do projeto Embalagens para Leads Reais
  console.log(`📋 Copiando mercados do projeto ${SOURCE_PROJECT_ID} para ${TARGET_PROJECT_ID}...`);
  
  const sourceMercados = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, SOURCE_PROJECT_ID));
  
  console.log(`   ✅ ${sourceMercados.length} mercados encontrados\n`);

  const mercadoMap = new Map<number, number>(); // sourceId -> targetId

  for (const mercado of sourceMercados) {
    const [result] = await db.insert(mercadosUnicos).values({
      projectId: TARGET_PROJECT_ID,
      nome: mercado.nome,
      categoria: mercado.categoria,
      descricao: mercado.descricao,
      tamanhoEstimado: mercado.tamanhoEstimado,
      tendencias: mercado.tendencias,
    });

    const newMercadoId = Number(result.insertId);
    mercadoMap.set(mercado.id, newMercadoId);
    console.log(`   ✅ Mercado "${mercado.nome}" copiado (ID: ${mercado.id} → ${newMercadoId})`);
  }

  console.log(`\n✅ ${mercadoMap.size} mercados copiados com sucesso!\n`);

  // 2. Copiar associações clientes-mercados
  console.log(`📋 Copiando associações clientes-mercados...`);
  
  const sourceAssociations = await db
    .select()
    .from(clientesMercados)
    .where(eq(clientesMercados.projectId, SOURCE_PROJECT_ID));
  
  console.log(`   ${sourceAssociations.length} associações encontradas\n`);

  let copiedCount = 0;
  for (const assoc of sourceAssociations) {
    const newMercadoId = mercadoMap.get(assoc.mercadoId);
    if (!newMercadoId) {
      console.warn(`   ⚠️  Mercado ${assoc.mercadoId} não encontrado no mapa`);
      continue;
    }

    // Buscar cliente correspondente no projeto Leads Reais pelo CNPJ
    const sourceCliente = await db.query.clientes.findFirst({
      where: (clientes, { eq }) => eq(clientes.id, assoc.clienteId),
    });

    if (!sourceCliente || !sourceCliente.cnpj) {
      continue;
    }

    const targetCliente = await db.query.clientes.findFirst({
      where: (clientes, { and, eq }) => 
        and(
          eq(clientes.projectId, TARGET_PROJECT_ID),
          eq(clientes.cnpj, sourceCliente.cnpj)
        ),
    });

    if (!targetCliente) {
      console.warn(`   ⚠️  Cliente ${sourceCliente.nome} não encontrado no projeto Leads Reais`);
      continue;
    }

    await db.insert(clientesMercados).values({
      projectId: TARGET_PROJECT_ID,
      clienteId: targetCliente.id,
      mercadoId: newMercadoId,
    });

    copiedCount++;
  }

  console.log(`\n✅ ${copiedCount} associações copiadas com sucesso!\n`);

  // 3. Buscar concorrentes e leads para cada mercado
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 Buscando concorrentes e leads para ${mercadoMap.size} mercados...`);
  console.log(`${"=".repeat(60)}\n`);

  let totalConcorrentes = 0;
  let totalLeads = 0;
  let processedCount = 0;

  for (const [sourceId, targetId] of mercadoMap.entries()) {
    const mercado = sourceMercados.find(m => m.id === sourceId);
    if (!mercado) continue;

    processedCount++;
    console.log(`\n[${processedCount}/${mercadoMap.size}] Processando mercado: "${mercado.nome}"`);

    try {
      // Buscar concorrentes
      console.log(`   🔍 Buscando concorrentes...`);
      const concorrentes = await searchCompetitors(mercado.nome, TARGET_PROJECT_ID, targetId);
      totalConcorrentes += concorrentes.length;
      console.log(`   ✅ ${concorrentes.length} concorrentes encontrados`);

      // Buscar leads
      console.log(`   🔍 Buscando leads...`);
      const leads = await searchLeads(mercado.nome, TARGET_PROJECT_ID, targetId);
      totalLeads += leads.length;
      console.log(`   ✅ ${leads.length} leads encontrados`);

    } catch (error) {
      console.error(`   ❌ Erro ao processar mercado "${mercado.nome}":`, error);
    }

    // Aguardar 1 segundo entre mercados para evitar rate limit
    if (processedCount < mercadoMap.size) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 PROCESSAMENTO COMPLETO!");
  console.log(`${"=".repeat(60)}`);
  console.log(`\n📊 Resultados Finais:`);
  console.log(`   Mercados copiados: ${mercadoMap.size}`);
  console.log(`   Associações copiadas: ${copiedCount}`);
  console.log(`   Concorrentes encontrados: ${totalConcorrentes}`);
  console.log(`   Leads encontrados: ${totalLeads}`);

  return {
    mercadosCount: mercadoMap.size,
    associacoesCount: copiedCount,
    concorrentesCount: totalConcorrentes,
    leadsCount: totalLeads,
  };
}

enrichLeadsReaisWithMarkets()
  .then(() => {
    console.log("\n✅ Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
