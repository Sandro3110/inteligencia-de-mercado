import { generateAllDataOptimized } from "./server/integrations/openaiOptimized.js";

console.log("🧪 TESTE: Enriquecimento da Veolia\n");

const clienteVeolia = {
  nome: "Veolia",
  produtoPrincipal: undefined,
  siteOficial: undefined,
  cidade: undefined,
};

console.log("📋 Dados de entrada:", clienteVeolia);
console.log("\n🔄 Chamando OpenAI API...\n");

try {
  const startTime = Date.now();
  const resultado = await generateAllDataOptimized(clienteVeolia);
  const duration = Date.now() - startTime;

  console.log("✅ API respondeu com sucesso!");
  console.log(`⏱️  Tempo: ${(duration / 1000).toFixed(2)}s\n`);

  let totalProdutos = 0;
  let totalConcorrentes = 0;
  let totalLeads = 0;

  resultado.mercados.forEach(m => {
    totalProdutos += m.produtos.length;
    totalConcorrentes += m.concorrentes.length;
    totalLeads += m.leads.length;
  });

  console.log("📊 RESUMO:");
  console.log(`   Mercados: ${resultado.mercados.length}`);
  console.log(`   Produtos: ${totalProdutos}`);
  console.log(`   Concorrentes: ${totalConcorrentes}`);
  console.log(`   Leads: ${totalLeads}\n`);

  console.log("📝 DETALHES:\n");

  resultado.mercados.forEach((m, idx) => {
    console.log(`🎯 MERCADO ${idx + 1}: ${m.mercado.nome}`);
    console.log(`   Categoria: ${m.mercado.categoria}`);
    console.log(
      `   Produtos: ${m.produtos.length}, Concorrentes: ${m.concorrentes.length}, Leads: ${m.leads.length}\n`
    );
  });

  // Salvar resultado
  const fs = await import("fs");
  fs.writeFileSync(
    "/home/ubuntu/gestor-pav/veolia-api-response.json",
    JSON.stringify(resultado, null, 2)
  );
  console.log("💾 Resposta completa salva em: veolia-api-response.json\n");
} catch (error) {
  console.error("❌ ERRO:", error.message);
  process.exit(1);
}
