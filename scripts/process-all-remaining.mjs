/**
 * Processamento COMPLETO de todos os clientes restantes
 * Roda sem interrupção até o final
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { clientes } from "../drizzle/schema.ts";
import { enrichClienteOptimized } from "../server/enrichmentOptimized.ts";
import fs from "fs";

const PROJECT_ID = 1;
const PESQUISA_ID = 1;

const db = drizzle(process.env.DATABASE_URL);

// Estatísticas globais
const stats = {
  startTime: Date.now(),
  totalClientes: 0,
  processados: 0,
  sucessos: 0,
  erros: 0,
  mercadosCriados: 0,
  produtosCriados: 0,
  concorrentesCriados: 0,
  leadsCriados: 0,
  tempos: [],
  errosDetalhados: [],
};

async function main() {
  console.log("🚀 PROCESSAMENTO COMPLETO - TODOS OS CLIENTES RESTANTES");
  console.log(
    "======================================================================"
  );
  console.log("⚠️  MODO: Execução contínua sem interrupções");
  console.log("📊 Gerando relatório completo ao final\n");

  // Buscar TODOS os clientes pendentes
  const clientesPendentes = await db
    .select()
    .from(clientes)
    .where(
      and(
        eq(clientes.projectId, PROJECT_ID),
        eq(clientes.validationStatus, "pending")
      )
    );

  stats.totalClientes = clientesPendentes.length;

  if (stats.totalClientes === 0) {
    console.log("✅ Todos os clientes já foram processados!");
    process.exit(0);
  }

  console.log(`📋 ${stats.totalClientes} clientes pendentes encontrados`);
  console.log(`⏳ Iniciando processamento contínuo...\n`);
  console.log(
    "======================================================================\n"
  );

  // Processar todos os clientes
  for (let i = 0; i < clientesPendentes.length; i++) {
    const cliente = clientesPendentes[i];
    stats.processados = i + 1;

    const porcentagem = (
      (stats.processados / stats.totalClientes) *
      100
    ).toFixed(1);

    try {
      console.log(
        `\n[${stats.processados}/${stats.totalClientes}] (${porcentagem}%) Processando: ${cliente.nome}`
      );

      const startTime = Date.now();
      const result = await enrichClienteOptimized(cliente.id, PROJECT_ID);
      const duration = Date.now() - startTime;

      stats.tempos.push(duration);

      if (result.success) {
        stats.sucessos++;
        stats.mercadosCriados += result.mercadosCreated;
        stats.produtosCriados += result.produtosCreated;
        stats.concorrentesCriados += result.concorrentesCreated;
        stats.leadsCriados += result.leadsCreated;

        console.log(`✅ Sucesso em ${(duration / 1000).toFixed(1)}s`);
        console.log(
          `   ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
        );
      } else {
        stats.erros++;
        stats.errosDetalhados.push({
          cliente: cliente.nome,
          erro: result.error,
          index: i + 1,
        });
        console.log(`❌ Erro: ${result.error}`);
      }

      // Checkpoint a cada 100 clientes
      if (stats.processados % 100 === 0) {
        console.log("\n" + "=".repeat(70));
        console.log(
          `📊 CHECKPOINT ${stats.processados}/${stats.totalClientes}`
        );
        console.log(
          `   ✅ Sucessos: ${stats.sucessos} | ❌ Erros: ${stats.erros}`
        );
        console.log(
          `   Taxa: ${((stats.sucessos / stats.processados) * 100).toFixed(1)}%`
        );
        console.log("=".repeat(70) + "\n");
      }
    } catch (error) {
      stats.erros++;
      stats.errosDetalhados.push({
        cliente: cliente.nome,
        erro: error.message,
        index: i + 1,
      });
      console.error(`❌ Erro ao processar ${cliente.nome}:`, error.message);
    }
  }

  // Gerar relatório final
  await gerarRelatorioFinal();
}

async function gerarRelatorioFinal() {
  const tempoTotal = Date.now() - stats.startTime;
  const tempoMedio =
    stats.tempos.reduce((a, b) => a + b, 0) / stats.tempos.length;
  const tempoMin = Math.min(...stats.tempos);
  const tempoMax = Math.max(...stats.tempos);

  const relatorio = `
╔════════════════════════════════════════════════════════════════════════════╗
║                    RELATÓRIO FINAL DE ENRIQUECIMENTO                       ║
║                         Pesquisa: Embalagens 2025                          ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 RESUMO GERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de clientes processados:  ${stats.totalClientes}
✅ Sucessos:                     ${stats.sucessos} (${((stats.sucessos / stats.totalClientes) * 100).toFixed(1)}%)
❌ Erros:                        ${stats.erros} (${((stats.erros / stats.totalClientes) * 100).toFixed(1)}%)

⏱️  PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tempo total:                     ${(tempoTotal / 1000 / 60).toFixed(1)} minutos (${(tempoTotal / 1000 / 60 / 60).toFixed(2)}h)
Tempo médio por cliente:         ${(tempoMedio / 1000).toFixed(1)}s
Tempo mais rápido:               ${(tempoMin / 1000).toFixed(1)}s
Tempo mais lento:                ${(tempoMax / 1000).toFixed(1)}s

📈 DADOS GERADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 Mercados criados:             ${stats.mercadosCriados}
📦 Produtos criados:             ${stats.produtosCriados}
🏭 Concorrentes criados:         ${stats.concorrentesCriados}
🎯 Leads criados:                ${stats.leadsCriados}

Média por cliente:
  - Produtos:                    ${(stats.produtosCriados / stats.sucessos).toFixed(1)}
  - Concorrentes:                ${(stats.concorrentesCriados / stats.sucessos).toFixed(1)}
  - Leads:                       ${(stats.leadsCriados / stats.sucessos).toFixed(1)}

${
  stats.erros > 0
    ? `
⚠️  ERROS DETALHADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${stats.errosDetalhados.map((e, i) => `${i + 1}. [${e.index}] ${e.cliente}\n   Erro: ${e.erro}`).join("\n\n")}
`
    : ""
}

╔════════════════════════════════════════════════════════════════════════════╗
║                          PROCESSAMENTO CONCLUÍDO                           ║
╚════════════════════════════════════════════════════════════════════════════╝

Data/Hora: ${new Date().toLocaleString("pt-BR")}
`;

  console.log(relatorio);

  // Salvar relatório em arquivo
  const filename = `/tmp/relatorio-enriquecimento-${Date.now()}.txt`;
  fs.writeFileSync(filename, relatorio);
  console.log(`\n📄 Relatório salvo em: ${filename}\n`);
}

main().catch(console.error);
