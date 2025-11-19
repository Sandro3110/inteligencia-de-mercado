import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { mercadosUnicos, clientesMercados, clientes } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const SOURCE_PROJECT_ID = 1; // Embalagens
const TARGET_PROJECT_ID = 270005; // Leads Reais

async function copyMarketsToLeadsReais() {
  console.log("🚀 Copiando mercados do projeto Embalagens para Leads Reais...\n");

  // 1. Copiar mercados
  console.log(`📋 Buscando mercados do projeto ${SOURCE_PROJECT_ID}...`);
  
  const sourceMercados = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, SOURCE_PROJECT_ID));
  
  console.log(`   ✅ ${sourceMercados.length} mercados encontrados\n`);

  const mercadoMap = new Map<number, number>(); // sourceId -> targetId

  console.log(`📝 Copiando mercados...`);
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
    console.log(`   ✅ "${mercado.nome}" (ID: ${mercado.id} → ${newMercadoId})`);
  }

  console.log(`\n✅ ${mercadoMap.size} mercados copiados!\n`);

  // 2. Copiar associações clientes-mercados
  console.log(`📋 Copiando associações clientes-mercados...`);
  
  // Buscar todas as associações (tabela não tem projectId)
  const sourceAssociations = await db
    .select()
    .from(clientesMercados);
  
  console.log(`   ${sourceAssociations.length} associações encontradas\n`);

  // Criar mapa de clientes por CNPJ
  const sourceClientes = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, SOURCE_PROJECT_ID));

  const targetClientes = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, TARGET_PROJECT_ID));

  const clienteMapByCnpj = new Map<string, number>(); // cnpj -> targetClienteId
  for (const targetCliente of targetClientes) {
    if (targetCliente.cnpj) {
      clienteMapByCnpj.set(targetCliente.cnpj, targetCliente.id);
    }
  }

  console.log(`📝 Criando associações...`);
  let copiedCount = 0;
  let skippedCount = 0;

  for (const assoc of sourceAssociations) {
    const newMercadoId = mercadoMap.get(assoc.mercadoId);
    if (!newMercadoId) {
      skippedCount++;
      continue;
    }

    const sourceCliente = sourceClientes.find(c => c.id === assoc.clienteId);
    if (!sourceCliente || !sourceCliente.cnpj) {
      skippedCount++;
      continue;
    }

    const targetClienteId = clienteMapByCnpj.get(sourceCliente.cnpj);
    if (!targetClienteId) {
      skippedCount++;
      continue;
    }

    try {
      await db.insert(clientesMercados).values({
        clienteId: targetClienteId,
        mercadoId: newMercadoId,
      });
      copiedCount++;
    } catch (error) {
      // Ignorar duplicatas
      skippedCount++;
    }
  }

  console.log(`\n✅ ${copiedCount} associações copiadas!`);
  console.log(`   ⚠️  ${skippedCount} associações ignoradas (duplicatas ou clientes não encontrados)\n`);

  console.log(`\n${"=".repeat(60)}`);
  console.log("🎉 CÓPIA COMPLETA!");
  console.log(`${"=".repeat(60)}`);
  console.log(`\n📊 Resultados Finais:`);
  console.log(`   Mercados copiados: ${mercadoMap.size}`);
  console.log(`   Associações copiadas: ${copiedCount}`);
  console.log(`   Associações ignoradas: ${skippedCount}`);

  return {
    mercadosCount: mercadoMap.size,
    associacoesCount: copiedCount,
    skippedCount,
  };
}

copyMarketsToLeadsReais()
  .then(() => {
    console.log("\n✅ Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
