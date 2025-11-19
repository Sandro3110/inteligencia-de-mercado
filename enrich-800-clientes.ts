import { enrichClienteCompleto } from "./server/enrichmentFaseado";
import { getDb } from "./server/db";
import fs from "fs";

const PROJECT_ID = 1; // Projeto Embalagens
const LOTE_SIZE = 50;
const CONCORRENTES_POR_MERCADO = 20;
const LEADS_POR_MERCADO = 20;

interface ProgressoLote {
  lote: number;
  inicio: number;
  fim: number;
  concluido: boolean;
  sucessos: number;
  erros: number;
  timestamp: string;
}

async function carregarProgresso(): Promise<ProgressoLote[]> {
  try {
    const data = fs.readFileSync("/tmp/progresso-enriquecimento.json", "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function salvarProgresso(progresso: ProgressoLote[]) {
  fs.writeFileSync(
    "/tmp/progresso-enriquecimento.json",
    JSON.stringify(progresso, null, 2)
  );
}

async function processarLote(
  loteNumero: number,
  clientes: any[],
  progresso: ProgressoLote[]
): Promise<void> {
  const inicio = (loteNumero - 1) * LOTE_SIZE;
  const fim = Math.min(inicio + LOTE_SIZE, clientes.length);
  const clientesLote = clientes.slice(inicio, fim);

  console.log(
    `\n${"=".repeat(80)}\n🚀 LOTE ${loteNumero}/${Math.ceil(clientes.length / LOTE_SIZE)} - Processando clientes ${inicio + 1} a ${fim}\n${"=".repeat(80)}\n`
  );

  const loteProgresso: ProgressoLote = {
    lote: loteNumero,
    inicio: inicio + 1,
    fim,
    concluido: false,
    sucessos: 0,
    erros: 0,
    timestamp: new Date().toISOString(),
  };

  for (let i = 0; i < clientesLote.length; i++) {
    const cliente = clientesLote[i];
    const clienteNumero = inicio + i + 1;

    console.log(
      `\n[${clienteNumero}/${clientes.length}] Processando: ${cliente.nome} (${cliente.cnpj || "sem CNPJ"})`
    );

    try {
      const resultado = await enrichClienteCompleto(
        cliente.cnpj || "",
        cliente.nome,
        PROJECT_ID,
        CONCORRENTES_POR_MERCADO,
        LEADS_POR_MERCADO
      );

      if (resultado.sucesso) {
        loteProgresso.sucessos++;
        console.log(
          `✅ [${clienteNumero}/${clientes.length}] ${cliente.nome} enriquecido com sucesso`
        );
        console.log(
          `   - Fases concluídas: ${resultado.fases.filter((f) => f.sucesso).length}/5`
        );
      } else {
        loteProgresso.erros++;
        console.error(
          `❌ [${clienteNumero}/${clientes.length}] ${cliente.nome} falhou`
        );
        const faseErro = resultado.fases.find((f) => !f.sucesso);
        if (faseErro) {
          console.error(`   - Erro na fase ${faseErro.fase}: ${faseErro.erro}`);
        }
      }
    } catch (error: any) {
      loteProgresso.erros++;
      console.error(
        `❌ [${clienteNumero}/${clientes.length}] ${cliente.nome} - Erro inesperado:`,
        error.message
      );
    }

    // Aguardar 1 segundo entre clientes para evitar rate limiting
    if (i < clientesLote.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  loteProgresso.concluido = true;
  progresso.push(loteProgresso);
  await salvarProgresso(progresso);

  console.log(
    `\n✅ LOTE ${loteNumero} CONCLUÍDO - Sucessos: ${loteProgresso.sucessos}, Erros: ${loteProgresso.erros}\n`
  );
}

async function main() {
  console.log("🚀 INICIANDO ENRIQUECIMENTO DE 800 CLIENTES\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Erro: Banco de dados não disponível");
    process.exit(1);
  }

  // Buscar todos os clientes do projeto
  const clientes = await db
    .select({
      id: (await import("./drizzle/schema")).clientes.id,
      nome: (await import("./drizzle/schema")).clientes.nome,
      cnpj: (await import("./drizzle/schema")).clientes.cnpj,
    })
    .from((await import("./drizzle/schema")).clientes)
    .where(
      (await import("drizzle-orm")).eq(
        (await import("./drizzle/schema")).clientes.projectId,
        PROJECT_ID
      )
    );

  console.log(`📊 Total de clientes encontrados: ${clientes.length}\n`);

  const totalLotes = Math.ceil(clientes.length / LOTE_SIZE);
  console.log(`📦 Total de lotes: ${totalLotes} (${LOTE_SIZE} clientes por lote)\n`);

  const progresso = await carregarProgresso();
  const lotesProcessados = progresso.filter((p) => p.concluido).length;

  if (lotesProcessados > 0) {
    console.log(
      `ℹ️  Progresso anterior encontrado: ${lotesProcessados} lotes já processados\n`
    );
  }

  // Processar lotes
  for (let lote = lotesProcessados + 1; lote <= totalLotes; lote++) {
    await processarLote(lote, clientes, progresso);

    // Aguardar 5 segundos entre lotes
    if (lote < totalLotes) {
      console.log("\n⏳ Aguardando 5 segundos antes do próximo lote...\n");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Relatório final
  console.log("\n" + "=".repeat(80));
  console.log("🎉 ENRIQUECIMENTO COMPLETO!");
  console.log("=".repeat(80) + "\n");

  const totalSucessos = progresso.reduce((acc, p) => acc + p.sucessos, 0);
  const totalErros = progresso.reduce((acc, p) => acc + p.erros, 0);

  console.log(`✅ Sucessos: ${totalSucessos}`);
  console.log(`❌ Erros: ${totalErros}`);
  console.log(`📊 Taxa de sucesso: ${((totalSucessos / clientes.length) * 100).toFixed(2)}%\n`);

  // Salvar relatório final
  const relatorio = {
    dataInicio: progresso[0]?.timestamp,
    dataFim: new Date().toISOString(),
    totalClientes: clientes.length,
    totalLotes: totalLotes,
    sucessos: totalSucessos,
    erros: totalErros,
    taxaSucesso: (totalSucessos / clientes.length) * 100,
    lotes: progresso,
  };

  fs.writeFileSync(
    "/tmp/relatorio-enriquecimento-final.json",
    JSON.stringify(relatorio, null, 2)
  );

  console.log("📄 Relatório final salvo em: /tmp/relatorio-enriquecimento-final.json\n");

  process.exit(0);
}

main();
