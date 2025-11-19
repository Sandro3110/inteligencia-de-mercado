import { enrichClienteCompleto } from "./server/enrichmentFaseado";
import fs from "fs";

async function testEnrichmentFaseado() {
  console.log("🧪 TESTE: Enriquecimento Faseado Completo\n");

  const cnpj = "33.000.167/0001-01";
  const nomeEmpresa = "Petrobras";
  const projectId = 1; // Projeto Embalagens

  try {
    const resultado = await enrichClienteCompleto(
      cnpj,
      nomeEmpresa,
      projectId,
      20, // 20 concorrentes
      20  // 20 leads
    );

    console.log("\n📊 RESULTADO FINAL:\n");
    console.log(`Sucesso: ${resultado.sucesso}`);
    console.log(`Total de fases: ${resultado.fases.length}`);

    resultado.fases.forEach((fase) => {
      console.log(`\n[Fase ${fase.fase}] ${fase.nome}`);
      console.log(`  Sucesso: ${fase.sucesso ? "✅" : "❌"}`);
      if (fase.erro) {
        console.log(`  Erro: ${fase.erro}`);
      }
      if (fase.dados) {
        console.log(`  Dados:`, JSON.stringify(fase.dados, null, 2).substring(0, 200) + "...");
      }
    });

    // Salvar resultado completo
    fs.writeFileSync(
      "/tmp/enrichment-faseado-result.json",
      JSON.stringify(resultado, null, 2)
    );

    console.log("\n✅ Resultado completo salvo em: /tmp/enrichment-faseado-result.json");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testEnrichmentFaseado();
