import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";

// Importar função de enriquecimento compilada
const { enrichCliente } = await import(
  "./dist/server/lib/enrichmentV2.js"
).catch(async () => {
  // Se não houver dist, usar diretamente do source
  console.log("⚠️  Usando source TypeScript diretamente...");
  const module = await import("./server/lib/enrichmentV2.ts");
  return module;
});

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log(
  "\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║         TESTE DE ENRIQUECIMENTO - 20 CLIENTES ALEATÓRIOS      ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

// Buscar 20 clientes aleatórios que ainda não foram enriquecidos
const [clientes] = await connection.query(`
  SELECT id, nome, cnpj, site, produtoPrincipal
  FROM clientes
  WHERE projectId = 1
  AND id NOT IN (
    SELECT DISTINCT clienteId FROM clientes_mercados
  )
  ORDER BY RAND()
  LIMIT 20
`);

console.log(
  `📊 Selecionados ${clientes.length} clientes aleatórios para teste\n`
);

if (clientes.length === 0) {
  console.log(
    "⚠️  Nenhum cliente disponível para teste. Todos já foram enriquecidos."
  );
  await connection.end();
  process.exit(0);
}

const startTime = Date.now();
const results = {
  success: 0,
  errors: 0,
  errorDetails: [],
  clientes: [],
  mercados: new Set(),
  produtos: 0,
  concorrentes: 0,
  leads: 0,
};

for (let i = 0; i < clientes.length; i++) {
  const cliente = clientes[i];
  console.log(`\n[${i + 1}/${clientes.length}] Processando: ${cliente.nome}`);
  console.log(`   CNPJ: ${cliente.cnpj || "N/A"}`);
  console.log(`   Produto: ${cliente.produtoPrincipal || "N/A"}`);

  try {
    const result = await enrichCliente(cliente.id, 1); // projectId = 1

    results.success++;
    results.clientes.push({
      id: cliente.id,
      nome: cliente.nome,
      mercados: result.mercados?.length || 0,
      produtos: result.produtos?.length || 0,
      concorrentes: result.concorrentes?.length || 0,
      leads: result.leads?.length || 0,
    });

    if (result.mercados) {
      result.mercados.forEach(m => results.mercados.add(m.nome));
    }
    results.produtos += result.produtos?.length || 0;
    results.concorrentes += result.concorrentes?.length || 0;
    results.leads += result.leads?.length || 0;

    console.log(`   ✅ Sucesso!`);
    console.log(
      `      └─ ${result.mercados?.length || 0} mercados, ${result.produtos?.length || 0} produtos, ${result.concorrentes?.length || 0} concorrentes, ${result.leads?.length || 0} leads`
    );
  } catch (error) {
    results.errors++;
    results.errorDetails.push({
      cliente: cliente.nome,
      error: error.message,
    });
    console.log(`   ❌ Erro: ${error.message}`);
  }

  // Aguardar 2s entre cada cliente para não sobrecarregar a API
  if (i < clientes.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(1);

console.log(
  "\n\n╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║                    RESULTADO DO TESTE                          ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n"
);

console.log(`⏱️  Tempo Total: ${duration}s`);
console.log(
  `⏱️  Tempo Médio por Cliente: ${(duration / clientes.length).toFixed(1)}s\n`
);

console.log(
  `✅ Sucesso: ${results.success}/${clientes.length} (${((results.success / clientes.length) * 100).toFixed(1)}%)`
);
console.log(`❌ Erros: ${results.errors}/${clientes.length}\n`);

if (results.errors > 0) {
  console.log(`🔍 Detalhes dos Erros:`);
  results.errorDetails.forEach((e, idx) => {
    console.log(`   ${idx + 1}. ${e.cliente}: ${e.error}`);
  });
  console.log("");
}

console.log(`📊 Estatísticas Geradas:`);
console.log(`   ├─ Mercados Únicos: ${results.mercados.size}`);
console.log(`   ├─ Produtos: ${results.produtos}`);
console.log(`   ├─ Concorrentes: ${results.concorrentes}`);
console.log(`   └─ Leads: ${results.leads}\n`);

console.log(`📋 Detalhamento por Cliente:`);
results.clientes.forEach((c, idx) => {
  console.log(`   ${idx + 1}. ${c.nome}`);
  console.log(
    `      └─ ${c.mercados}M | ${c.produtos}P | ${c.concorrentes}C | ${c.leads}L`
  );
});

console.log(
  "\n════════════════════════════════════════════════════════════════\n"
);

await connection.end();
