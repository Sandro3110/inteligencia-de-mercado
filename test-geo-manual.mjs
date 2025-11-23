/**
 * Teste manual de geolocalização
 * Executa uma chamada OpenAI e exibe as coordenadas retornadas
 */

import { generateAllDataOptimized } from "./server/integrations/openaiOptimized.ts";

console.log("🧪 Testando extração de coordenadas via OpenAI...\n");

try {
  const result = await generateAllDataOptimized({
    nome: "Empresa Teste",
    cidade: "São Paulo",
  });

  console.log("✅ Resposta OpenAI recebida!\n");

  // Cliente
  console.log("📍 CLIENTE:");
  console.log(
    `  Nome: ${result.clienteEnriquecido?.produtoPrincipal || "N/A"}`
  );
  console.log(`  Cidade: ${result.clienteEnriquecido?.cidade || "N/A"}`);
  console.log(`  UF: ${result.clienteEnriquecido?.uf || "N/A"}`);
  console.log(
    `  Latitude: ${result.clienteEnriquecido?.latitude ?? "NÃO RETORNADO"}`
  );
  console.log(
    `  Longitude: ${result.clienteEnriquecido?.longitude ?? "NÃO RETORNADO"}`
  );

  // Concorrentes
  console.log("\n📍 CONCORRENTES:");
  const concorrentes = result.mercados[0]?.concorrentes || [];
  console.log(`  Total: ${concorrentes.length}`);

  let concorrentesComGeo = 0;
  for (const c of concorrentes.slice(0, 3)) {
    const hasGeo = c.latitude !== undefined && c.longitude !== undefined;
    if (hasGeo) concorrentesComGeo++;

    console.log(`\n  - ${c.nome}`);
    console.log(`    Cidade: ${c.cidade || "N/A"}`);
    console.log(`    UF: ${c.uf || "N/A"}`);
    console.log(
      `    Lat/Lng: ${hasGeo ? `${c.latitude}, ${c.longitude}` : "NÃO RETORNADO"}`
    );
  }
  console.log(
    `\n  📊 ${concorrentesComGeo}/${concorrentes.length} com coordenadas`
  );

  // Leads
  console.log("\n📍 LEADS:");
  const leads = result.mercados[0]?.leads || [];
  console.log(`  Total: ${leads.length}`);

  let leadsComGeo = 0;
  for (const l of leads.slice(0, 3)) {
    const hasGeo = l.latitude !== undefined && l.longitude !== undefined;
    if (hasGeo) leadsComGeo++;

    console.log(`\n  - ${l.nome}`);
    console.log(`    Cidade: ${l.cidade || "N/A"}`);
    console.log(`    UF: ${l.uf || "N/A"}`);
    console.log(
      `    Lat/Lng: ${hasGeo ? `${l.latitude}, ${l.longitude}` : "NÃO RETORNADO"}`
    );
  }
  console.log(`\n  📊 ${leadsComGeo}/${leads.length} com coordenadas`);

  // Resumo
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 RESUMO:");
  const clienteHasGeo = result.clienteEnriquecido?.latitude !== undefined;
  console.log(
    `  Cliente: ${clienteHasGeo ? "✅ COM coordenadas" : "❌ SEM coordenadas"}`
  );
  console.log(
    `  Concorrentes: ${concorrentesComGeo}/${concorrentes.length} com coordenadas`
  );
  console.log(`  Leads: ${leadsComGeo}/${leads.length} com coordenadas`);

  if (!clienteHasGeo && concorrentesComGeo === 0 && leadsComGeo === 0) {
    console.log("\n⚠️ ATENÇÃO: OpenAI não está retornando coordenadas!");
    console.log("   Possíveis causas:");
    console.log("   1. Modelo não está seguindo o formato solicitado");
    console.log("   2. Prompt precisa ser mais explícito");
    console.log("   3. Modelo não tem dados de geolocalização");
  } else {
    console.log("\n✅ Implementação funcionando parcialmente ou totalmente!");
  }
} catch (error) {
  console.error("❌ Erro:", error.message);
  process.exit(1);
}
