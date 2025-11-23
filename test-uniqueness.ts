import {
  generateConcorrentesUnicos,
  generateLeadsUnicos,
} from "./server/geminiEnrichmentWithUniqueness";
import { normalizarNomeEmpresa } from "./server/empresasUnicas";

async function testUniqueness() {
  console.log("🧪 TESTE DE UNICIDADE - 20 Concorrentes + 20 Leads");
  console.log("=".repeat(70));

  const mercadoNome = "Embalagens Plásticas B2B";
  const projectId = 1; // Projeto Embalagens

  // 1. GERAR 20 CONCORRENTES ÚNICOS
  console.log("\n📋 ETAPA 1: Gerando 20 concorrentes únicos...\n");

  const concorrentes = await generateConcorrentesUnicos(
    mercadoNome,
    20,
    projectId
  );

  console.log(`\n✅ ${concorrentes.length} concorrentes gerados\n`);

  // Verificar duplicatas internas
  const nomesConcorrentes = concorrentes.map(c =>
    normalizarNomeEmpresa(c.nome)
  );
  const uniquesConcorrentes = new Set(nomesConcorrentes);

  if (nomesConcorrentes.length !== uniquesConcorrentes.size) {
    console.error(
      `❌ ERRO: Duplicatas encontradas em concorrentes! ${nomesConcorrentes.length} total vs ${uniquesConcorrentes.size} únicos`
    );
  } else {
    console.log(
      `✅ Nenhuma duplicata interna em concorrentes (${uniquesConcorrentes.size} únicos)`
    );
  }

  concorrentes.forEach((c, index) => {
    console.log(`[${index + 1}] ${c.nome}`);
    console.log(`    CNPJ: ${c.cnpj} | Porte: ${c.porte}`);
    console.log(
      `    Score: ${c.qualidadeScore}/100 (${c.qualidadeClassificacao})`
    );
  });

  // 2. GERAR 20 LEADS ÚNICOS
  console.log("\n" + "=".repeat(70));
  console.log("\n📋 ETAPA 2: Gerando 20 leads únicos...\n");

  const nomesConcorrentesParaExcluir = concorrentes.map(c => c.nome);

  const leads = await generateLeadsUnicos(
    mercadoNome,
    "fornecedor",
    20,
    projectId,
    nomesConcorrentesParaExcluir // Passar concorrentes para evitar duplicatas
  );

  console.log(`\n✅ ${leads.length} leads gerados\n`);

  // Verificar duplicatas internas
  const nomesLeads = leads.map(l => normalizarNomeEmpresa(l.nome));
  const uniquesLeads = new Set(nomesLeads);

  if (nomesLeads.length !== uniquesLeads.size) {
    console.error(
      `❌ ERRO: Duplicatas encontradas em leads! ${nomesLeads.length} total vs ${uniquesLeads.size} únicos`
    );
  } else {
    console.log(
      `✅ Nenhuma duplicata interna em leads (${uniquesLeads.size} únicos)`
    );
  }

  leads.forEach((l, index) => {
    console.log(`[${index + 1}] ${l.nome}`);
    console.log(
      `    CNPJ: ${l.cnpj} | Porte: ${l.porte} | Região: ${l.regiao}`
    );
    console.log(
      `    Score: ${l.qualidadeScore}/100 (${l.qualidadeClassificacao})`
    );
  });

  // 3. VERIFICAR DUPLICATAS ENTRE CONCORRENTES E LEADS
  console.log("\n" + "=".repeat(70));
  console.log(
    "\n📋 ETAPA 3: Verificando duplicatas entre concorrentes e leads...\n"
  );

  const todasEmpresas = [...nomesConcorrentes, ...nomesLeads];
  const uniquesTotal = new Set(todasEmpresas);

  const duplicatasEntreGrupos = todasEmpresas.length - uniquesTotal.size;

  if (duplicatasEntreGrupos > 0) {
    console.error(
      `❌ ERRO: ${duplicatasEntreGrupos} duplicatas encontradas entre concorrentes e leads!`
    );

    // Encontrar quais são as duplicatas
    const contagem = new Map<string, number>();
    todasEmpresas.forEach(nome => {
      contagem.set(nome, (contagem.get(nome) || 0) + 1);
    });

    console.log("\nEmpresas duplicadas:");
    contagem.forEach((count, nome) => {
      if (count > 1) {
        const original = [
          ...concorrentes.map(c => c.nome),
          ...leads.map(l => l.nome),
        ].find(n => normalizarNomeEmpresa(n) === nome);
        console.log(`  - ${original} (aparece ${count}x)`);
      }
    });
  } else {
    console.log(
      `✅ Nenhuma duplicata entre concorrentes e leads (${uniquesTotal.size} empresas únicas no total)`
    );
  }

  // 4. RESUMO FINAL
  console.log("\n" + "=".repeat(70));
  console.log("\n🎉 RESUMO DO TESTE\n");
  console.log(`Concorrentes gerados: ${concorrentes.length}`);
  console.log(`Leads gerados: ${leads.length}`);
  console.log(`Total de empresas: ${todasEmpresas.length}`);
  console.log(`Empresas únicas: ${uniquesTotal.size}`);
  console.log(`Duplicatas: ${duplicatasEntreGrupos}`);

  if (
    concorrentes.length === 20 &&
    leads.length === 20 &&
    duplicatasEntreGrupos === 0
  ) {
    console.log(
      "\n✅ TESTE PASSOU! Regra de unicidade funcionando corretamente."
    );
  } else {
    console.log("\n❌ TESTE FALHOU! Verificar implementação.");
  }

  // Salvar resultado
  const resultado = {
    concorrentes,
    leads,
    estatisticas: {
      totalConcorrentes: concorrentes.length,
      totalLeads: leads.length,
      totalEmpresas: todasEmpresas.length,
      empresasUnicas: uniquesTotal.size,
      duplicatas: duplicatasEntreGrupos,
    },
  };

  const fs = await import("fs");
  fs.writeFileSync(
    "/tmp/test-uniqueness-result.json",
    JSON.stringify(resultado, null, 2)
  );

  console.log("\n✅ Resultado salvo em: /tmp/test-uniqueness-result.json");
}

testUniqueness().catch(console.error);
