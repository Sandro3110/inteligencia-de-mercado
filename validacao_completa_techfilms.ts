/**
 * Validação Completa do Sistema de Enriquecimento
 *
 * OBJETIVO:
 * 1. Extrair 50 clientes aleatórios do projeto "Embalagens"
 * 2. Gerar CSV
 * 3. Criar novo projeto "TechFilms"
 * 4. Criar nova pesquisa "Base Inicial"
 * 5. Importar clientes do CSV
 * 6. Executar enriquecimento completo
 * 7. Comparar resultados com dados originais
 * 8. Gerar relatório de validação
 */

import { getDb } from './server/db';
import { eq, sql } from 'drizzle-orm';
import {
  clientes,
  pesquisas,
  mercadosUnicos,
  concorrentes,
  leads,
  clientesMercados,
} from './drizzle/schema';
import { writeFileSync } from 'fs';
import {
  createEnrichmentJob,
  startEnrichmentJob,
  getJobProgress,
} from './server/enrichmentJobManager';

interface ClienteOriginal {
  id: number;
  nome: string;
  cnpj?: string;
  produtoPrincipal?: string;
  siteOficial?: string;
  cidade?: string;
  uf?: string;
  cnae?: string;
  porte?: string;
  latitude?: number;
  longitude?: number;
  enriched: boolean;
  qualityScore?: number;
}

interface ResultadoComparacao {
  clienteId: number;
  clienteNome: string;

  // Dados originais
  original: {
    cnae?: string;
    porte?: string;
    coordenadas: boolean;
    mercadosCount: number;
    concorrentesCount: number;
    leadsCount: number;
    qualityScore?: number;
  };

  // Dados novos
  novo: {
    cnae?: string;
    porte?: string;
    coordenadas: boolean;
    mercadosCount: number;
    concorrentesCount: number;
    leadsCount: number;
    qualityScore?: number;
  };

  // Comparação
  melhorias: {
    cnaeAdicionado: boolean;
    porteAdicionado: boolean;
    coordenadasAdicionadas: boolean;
    maisMercados: boolean;
    maisConcorrentes: boolean;
    maisLeads: boolean;
    qualityMelhorou: boolean;
  };
}

/**
 * PASSO 1: Extrair 50 clientes aleatórios do projeto Embalagens
 */
async function extrairClientesAleatorios(): Promise<ClienteOriginal[]> {
  console.log('\n📊 PASSO 1: Extraindo 50 clientes aleatórios do projeto Embalagens...\n');

  const db = await getDb();

  // Buscar projeto Embalagens
  const [projeto] = await db
    .select()
    .from(pesquisas)
    .where(sql`LOWER(${pesquisas.nome}) LIKE '%embalagens%'`)
    .limit(1);

  if (!projeto) {
    throw new Error('Projeto Embalagens não encontrado');
  }

  console.log(`✅ Projeto encontrado: ${projeto.nome} (ID: ${projeto.id})`);

  // Buscar 50 clientes aleatórios
  const clientesAleatorios = await db
    .select()
    .from(clientes)
    .where(eq(clientes.projectId, projeto.projectId))
    .orderBy(sql`RANDOM()`)
    .limit(50);

  console.log(`✅ ${clientesAleatorios.length} clientes extraídos\n`);

  return clientesAleatorios as ClienteOriginal[];
}

/**
 * PASSO 2: Gerar CSV dos clientes
 */
async function gerarCSV(clientesOriginais: ClienteOriginal[]): Promise<string> {
  console.log('\n📄 PASSO 2: Gerando CSV...\n');

  const csvPath = '/home/ubuntu/clientes_techfilms.csv';

  // Cabeçalho
  const header = 'nome,cnpj,produto,site,cidade,uf';

  // Linhas
  const rows = clientesOriginais.map((c) => {
    const nome = (c.nome || '').replace(/"/g, '""');
    const cnpj = (c.cnpj || '').replace(/"/g, '""');
    const produto = (c.produtoPrincipal || '').replace(/"/g, '""');
    const site = (c.siteOficial || '').replace(/"/g, '""');
    const cidade = (c.cidade || '').replace(/"/g, '""');
    const uf = (c.uf || '').replace(/"/g, '""');

    return `"${nome}","${cnpj}","${produto}","${site}","${cidade}","${uf}"`;
  });

  const csv = [header, ...rows].join('\n');

  writeFileSync(csvPath, csv, 'utf-8');

  console.log(`✅ CSV gerado: ${csvPath}`);
  console.log(`✅ ${rows.length} linhas (+ cabeçalho)\n`);

  return csvPath;
}

/**
 * PASSO 3: Criar projeto TechFilms
 */
async function criarProjetoTechFilms(): Promise<number> {
  console.log('\n🏗️ PASSO 3: Criando projeto TechFilms...\n');

  const db = await getDb();

  // Verificar se já existe
  const [existente] = await db
    .select()
    .from(pesquisas)
    .where(sql`LOWER(${pesquisas.nome}) = 'techfilms'`)
    .limit(1);

  if (existente) {
    console.log(`⚠️ Projeto TechFilms já existe (ID: ${existente.projectId})`);
    console.log(`   Usando projeto existente\n`);
    return existente.projectId;
  }

  // Criar novo projeto
  const { createProject } = await import('./server/db');

  const projeto = await createProject({
    nome: 'TechFilms',
    descricao:
      'Projeto de validação do sistema de enriquecimento - Base de 50 clientes aleatórios do projeto Embalagens',
  });

  console.log(`✅ Projeto criado: TechFilms (ID: ${projeto.id})\n`);

  return projeto.id;
}

/**
 * PASSO 4: Criar pesquisa "Base Inicial"
 */
async function criarPesquisaBaseInicial(projectId: number): Promise<number> {
  console.log('\n🔍 PASSO 4: Criando pesquisa "Base Inicial"...\n');

  const db = await getDb();

  // Verificar se já existe
  const [existente] = await db
    .select()
    .from(pesquisas)
    .where(sql`${pesquisas.projectId} = ${projectId} AND LOWER(${pesquisas.nome}) = 'base inicial'`)
    .limit(1);

  if (existente) {
    console.log(`⚠️ Pesquisa "Base Inicial" já existe (ID: ${existente.id})`);
    console.log(`   Usando pesquisa existente\n`);
    return existente.id;
  }

  // Criar nova pesquisa
  const { createPesquisa } = await import('./server/db');

  const pesquisa = await createPesquisa({
    projectId,
    nome: 'Base Inicial',
    descricao: 'Pesquisa de validação com 50 clientes aleatórios',
  });

  console.log(`✅ Pesquisa criada: Base Inicial (ID: ${pesquisa.id})\n`);

  return pesquisa.id;
}

/**
 * PASSO 5: Importar clientes do CSV
 */
async function importarClientesDoCSV(
  projectId: number,
  pesquisaId: number,
  csvPath: string,
  clientesOriginais: ClienteOriginal[]
): Promise<void> {
  console.log('\n📥 PASSO 5: Importando clientes do CSV...\n');

  const db = await getDb();
  const { createCliente } = await import('./server/db');

  let importados = 0;

  for (const clienteOriginal of clientesOriginais) {
    try {
      await createCliente({
        nome: clienteOriginal.nome,
        cnpj: clienteOriginal.cnpj,
        produtoPrincipal: clienteOriginal.produtoPrincipal,
        siteOficial: clienteOriginal.siteOficial,
        cidade: clienteOriginal.cidade,
        uf: clienteOriginal.uf,
        projectId,
        pesquisaId,
        enriched: false,
      });

      importados++;

      if (importados % 10 === 0) {
        console.log(`   ✅ ${importados} clientes importados...`);
      }
    } catch (error) {
      console.error(`   ❌ Erro ao importar ${clienteOriginal.nome}:`, error);
    }
  }

  console.log(`\n✅ Total importado: ${importados}/${clientesOriginais.length} clientes\n`);
}

/**
 * PASSO 6: Executar enriquecimento completo
 */
async function executarEnriquecimento(projectId: number): Promise<void> {
  console.log('\n🚀 PASSO 6: Executando enriquecimento completo...\n');

  // Criar job de enriquecimento
  const job = await createEnrichmentJob(projectId, {
    batchSize: 50,
    concurrency: 5,
  });

  console.log(`✅ Job criado (ID: ${job.id})`);
  console.log(`   Batch size: 50`);
  console.log(`   Concurrency: 5`);
  console.log(`\n🔄 Iniciando enriquecimento...\n`);

  // Iniciar job
  await startEnrichmentJob(job.id);

  // Monitorar progresso
  let completo = false;
  let ultimoProgresso = 0;

  while (!completo) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguardar 5s

    const progresso = await getJobProgress(job.id);

    if (progresso.processados > ultimoProgresso) {
      const percentual = Math.round((progresso.processados / progresso.total) * 100);
      console.log(`   📊 Progresso: ${progresso.processados}/${progresso.total} (${percentual}%)`);
      console.log(`      ✅ Sucessos: ${progresso.sucessos}`);
      console.log(`      ❌ Erros: ${progresso.erros}`);
      console.log(`      ⏱️ Tempo médio: ${progresso.tempoMedioPorCliente?.toFixed(2)}s\n`);

      ultimoProgresso = progresso.processados;
    }

    if (progresso.status === 'completed' || progresso.status === 'error') {
      completo = true;
    }
  }

  console.log(`\n✅ Enriquecimento concluído!\n`);
}

/**
 * PASSO 7: Coletar dados dos clientes originais
 */
async function coletarDadosOriginais(
  clientesOriginais: ClienteOriginal[]
): Promise<Map<string, any>> {
  console.log('\n📊 PASSO 7: Coletando dados dos clientes originais...\n');

  const db = await getDb();
  const dadosOriginais = new Map<string, any>();

  for (const cliente of clientesOriginais) {
    // Buscar mercados do cliente
    const mercadosCliente = await db
      .select()
      .from(clientesMercados)
      .where(eq(clientesMercados.clienteId, cliente.id));

    // Buscar concorrentes dos mercados do cliente
    let concorrentesCount = 0;
    let leadsCount = 0;

    for (const cm of mercadosCliente) {
      const [concorrentesResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(concorrentes)
        .where(eq(concorrentes.mercadoId, cm.mercadoId));

      const [leadsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.mercadoId, cm.mercadoId));

      concorrentesCount += Number(concorrentesResult?.count || 0);
      leadsCount += Number(leadsResult?.count || 0);
    }

    dadosOriginais.set(cliente.nome, {
      id: cliente.id,
      nome: cliente.nome,
      cnae: cliente.cnae,
      porte: cliente.porte,
      latitude: cliente.latitude,
      longitude: cliente.longitude,
      mercadosCount: mercadosCliente.length,
      concorrentesCount,
      leadsCount,
      qualityScore: cliente.qualityScore,
    });
  }

  console.log(`✅ Dados coletados de ${dadosOriginais.size} clientes originais\n`);

  return dadosOriginais;
}

/**
 * PASSO 8: Coletar dados dos clientes novos (TechFilms)
 */
async function coletarDadosNovos(projectId: number): Promise<Map<string, any>> {
  console.log('\n📊 PASSO 8: Coletando dados dos clientes novos (TechFilms)...\n');

  const db = await getDb();

  // Buscar todos os clientes do projeto TechFilms
  const clientesNovos = await db.select().from(clientes).where(eq(clientes.projectId, projectId));

  const dadosNovos = new Map<string, any>();

  for (const cliente of clientesNovos) {
    // Buscar mercados do cliente
    const mercadosCliente = await db
      .select()
      .from(clientesMercados)
      .where(eq(clientesMercados.clienteId, cliente.id));

    // Buscar concorrentes dos mercados do cliente
    let concorrentesCount = 0;
    let leadsCount = 0;

    for (const cm of mercadosCliente) {
      const [concorrentesResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(concorrentes)
        .where(eq(concorrentes.mercadoId, cm.mercadoId));

      const [leadsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.mercadoId, cm.mercadoId));

      concorrentesCount += Number(concorrentesResult?.count || 0);
      leadsCount += Number(leadsResult?.count || 0);
    }

    dadosNovos.set(cliente.nome, {
      id: cliente.id,
      nome: cliente.nome,
      cnae: cliente.cnae,
      porte: cliente.porte,
      latitude: cliente.latitude,
      longitude: cliente.longitude,
      mercadosCount: mercadosCliente.length,
      concorrentesCount,
      leadsCount,
      qualityScore: cliente.qualityScore,
    });
  }

  console.log(`✅ Dados coletados de ${dadosNovos.size} clientes novos\n`);

  return dadosNovos;
}

/**
 * PASSO 9: Comparar resultados
 */
function compararResultados(
  dadosOriginais: Map<string, any>,
  dadosNovos: Map<string, any>
): ResultadoComparacao[] {
  console.log('\n📊 PASSO 9: Comparando resultados...\n');

  const comparacoes: ResultadoComparacao[] = [];

  for (const [nomeCliente, original] of dadosOriginais.entries()) {
    const novo = dadosNovos.get(nomeCliente);

    if (!novo) {
      console.warn(`⚠️ Cliente "${nomeCliente}" não encontrado nos dados novos`);
      continue;
    }

    const comparacao: ResultadoComparacao = {
      clienteId: novo.id,
      clienteNome: nomeCliente,

      original: {
        cnae: original.cnae,
        porte: original.porte,
        coordenadas: !!(original.latitude && original.longitude),
        mercadosCount: original.mercadosCount,
        concorrentesCount: original.concorrentesCount,
        leadsCount: original.leadsCount,
        qualityScore: original.qualityScore,
      },

      novo: {
        cnae: novo.cnae,
        porte: novo.porte,
        coordenadas: !!(novo.latitude && novo.longitude),
        mercadosCount: novo.mercadosCount,
        concorrentesCount: novo.concorrentesCount,
        leadsCount: novo.leadsCount,
        qualityScore: novo.qualityScore,
      },

      melhorias: {
        cnaeAdicionado: !original.cnae && !!novo.cnae,
        porteAdicionado: !original.porte && !!novo.porte,
        coordenadasAdicionadas: !original.latitude && !!novo.latitude,
        maisMercados: novo.mercadosCount > original.mercadosCount,
        maisConcorrentes: novo.concorrentesCount > original.concorrentesCount,
        maisLeads: novo.leadsCount > original.leadsCount,
        qualityMelhorou: (novo.qualityScore || 0) > (original.qualityScore || 0),
      },
    };

    comparacoes.push(comparacao);
  }

  console.log(`✅ ${comparacoes.length} comparações realizadas\n`);

  return comparacoes;
}

/**
 * PASSO 10: Gerar relatório final
 */
function gerarRelatorioFinal(comparacoes: ResultadoComparacao[]): void {
  console.log('\n📋 PASSO 10: Gerando relatório final...\n');

  const total = comparacoes.length;

  // Estatísticas de melhorias
  const stats = {
    cnaeAdicionado: comparacoes.filter((c) => c.melhorias.cnaeAdicionado).length,
    porteAdicionado: comparacoes.filter((c) => c.melhorias.porteAdicionado).length,
    coordenadasAdicionadas: comparacoes.filter((c) => c.melhorias.coordenadasAdicionadas).length,
    maisMercados: comparacoes.filter((c) => c.melhorias.maisMercados).length,
    maisConcorrentes: comparacoes.filter((c) => c.melhorias.maisConcorrentes).length,
    maisLeads: comparacoes.filter((c) => c.melhorias.maisLeads).length,
    qualityMelhorou: comparacoes.filter((c) => c.melhorias.qualityMelhorou).length,
  };

  // Médias
  const mediaOriginal = {
    mercados: comparacoes.reduce((sum, c) => sum + c.original.mercadosCount, 0) / total,
    concorrentes: comparacoes.reduce((sum, c) => sum + c.original.concorrentesCount, 0) / total,
    leads: comparacoes.reduce((sum, c) => sum + c.original.leadsCount, 0) / total,
    quality: comparacoes.reduce((sum, c) => sum + (c.original.qualityScore || 0), 0) / total,
  };

  const mediaNova = {
    mercados: comparacoes.reduce((sum, c) => sum + c.novo.mercadosCount, 0) / total,
    concorrentes: comparacoes.reduce((sum, c) => sum + c.novo.concorrentesCount, 0) / total,
    leads: comparacoes.reduce((sum, c) => sum + c.novo.leadsCount, 0) / total,
    quality: comparacoes.reduce((sum, c) => sum + (c.novo.qualityScore || 0), 0) / total,
  };

  // Gerar relatório Markdown
  const relatorio = `# Relatório de Validação - Projeto TechFilms

**Data:** ${new Date().toLocaleString('pt-BR')}  
**Total de clientes:** ${total}

---

## 📊 **ESTATÍSTICAS DE MELHORIAS**

| Métrica | Clientes Melhorados | Taxa de Melhoria |
|---------|---------------------|------------------|
| **CNAE adicionado** | ${stats.cnaeAdicionado} | ${((stats.cnaeAdicionado / total) * 100).toFixed(1)}% |
| **Porte adicionado** | ${stats.porteAdicionado} | ${((stats.porteAdicionado / total) * 100).toFixed(1)}% |
| **Coordenadas adicionadas** | ${stats.coordenadasAdicionadas} | ${((stats.coordenadasAdicionadas / total) * 100).toFixed(1)}% |
| **Mais mercados** | ${stats.maisMercados} | ${((stats.maisMercados / total) * 100).toFixed(1)}% |
| **Mais concorrentes** | ${stats.maisConcorrentes} | ${((stats.maisConcorrentes / total) * 100).toFixed(1)}% |
| **Mais leads** | ${stats.maisLeads} | ${((stats.maisLeads / total) * 100).toFixed(1)}% |
| **Quality Score melhorou** | ${stats.qualityMelhorou} | ${((stats.qualityMelhorou / total) * 100).toFixed(1)}% |

---

## 📈 **COMPARAÇÃO DE MÉDIAS**

| Métrica | Original | Novo | Variação |
|---------|----------|------|----------|
| **Mercados por cliente** | ${mediaOriginal.mercados.toFixed(2)} | ${mediaNova.mercados.toFixed(2)} | ${(((mediaNova.mercados - mediaOriginal.mercados) / mediaOriginal.mercados) * 100).toFixed(1)}% |
| **Concorrentes por cliente** | ${mediaOriginal.concorrentes.toFixed(2)} | ${mediaNova.concorrentes.toFixed(2)} | ${(((mediaNova.concorrentes - mediaOriginal.concorrentes) / mediaOriginal.concorrentes) * 100).toFixed(1)}% |
| **Leads por cliente** | ${mediaOriginal.leads.toFixed(2)} | ${mediaNova.leads.toFixed(2)} | ${(((mediaNova.leads - mediaOriginal.leads) / mediaOriginal.leads) * 100).toFixed(1)}% |
| **Quality Score** | ${mediaOriginal.quality.toFixed(2)} | ${mediaNova.quality.toFixed(2)} | ${(((mediaNova.quality - mediaOriginal.quality) / mediaOriginal.quality) * 100).toFixed(1)}% |

---

## ✅ **CONCLUSÃO**

${stats.qualityMelhorou >= total * 0.8 ? '🎉 **SUCESSO!** Mais de 80% dos clientes tiveram melhoria no Quality Score.' : '⚠️ **ATENÇÃO!** Menos de 80% dos clientes tiveram melhoria. Revisar prompts e lógica.'}

---

## 📋 **DETALHAMENTO POR CLIENTE**

${comparacoes
  .map(
    (c) => `
### ${c.clienteNome}

**Original:**
- CNAE: ${c.original.cnae || 'N/A'}
- Porte: ${c.original.porte || 'N/A'}
- Coordenadas: ${c.original.coordenadas ? 'Sim' : 'Não'}
- Mercados: ${c.original.mercadosCount}
- Concorrentes: ${c.original.concorrentesCount}
- Leads: ${c.original.leadsCount}
- Quality Score: ${c.original.qualityScore?.toFixed(2) || 'N/A'}

**Novo:**
- CNAE: ${c.novo.cnae || 'N/A'} ${c.melhorias.cnaeAdicionado ? '✅' : ''}
- Porte: ${c.novo.porte || 'N/A'} ${c.melhorias.porteAdicionado ? '✅' : ''}
- Coordenadas: ${c.novo.coordenadas ? 'Sim' : 'Não'} ${c.melhorias.coordenadasAdicionadas ? '✅' : ''}
- Mercados: ${c.novo.mercadosCount} ${c.melhorias.maisMercados ? '✅' : ''}
- Concorrentes: ${c.novo.concorrentesCount} ${c.melhorias.maisConcorrentes ? '✅' : ''}
- Leads: ${c.novo.leadsCount} ${c.melhorias.maisLeads ? '✅' : ''}
- Quality Score: ${c.novo.qualityScore?.toFixed(2) || 'N/A'} ${c.melhorias.qualityMelhorou ? '✅' : ''}

---
`
  )
  .join('\n')}
`;

  const relatorioPath = '/home/ubuntu/relatorio_validacao_techfilms.md';
  writeFileSync(relatorioPath, relatorio, 'utf-8');

  console.log(`✅ Relatório gerado: ${relatorioPath}\n`);
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO EXECUTIVO');
  console.log('='.repeat(80));
  console.log(`Total de clientes: ${total}`);
  console.log(
    `CNAE adicionado: ${stats.cnaeAdicionado} (${((stats.cnaeAdicionado / total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Coordenadas adicionadas: ${stats.coordenadasAdicionadas} (${((stats.coordenadasAdicionadas / total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Quality Score melhorou: ${stats.qualityMelhorou} (${((stats.qualityMelhorou / total) * 100).toFixed(1)}%)`
  );
  console.log('='.repeat(80) + '\n');
}

/**
 * MAIN: Executar validação completa
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 VALIDAÇÃO COMPLETA DO SISTEMA DE ENRIQUECIMENTO');
  console.log('='.repeat(80));

  try {
    // PASSO 1: Extrair clientes
    const clientesOriginais = await extrairClientesAleatorios();

    // PASSO 2: Gerar CSV
    const csvPath = await gerarCSV(clientesOriginais);

    // PASSO 3: Criar projeto TechFilms
    const projectId = await criarProjetoTechFilms();

    // PASSO 4: Criar pesquisa Base Inicial
    const pesquisaId = await criarPesquisaBaseInicial(projectId);

    // PASSO 5: Importar clientes
    await importarClientesDoCSV(projectId, pesquisaId, csvPath, clientesOriginais);

    // PASSO 6: Executar enriquecimento
    await executarEnriquecimento(projectId);

    // PASSO 7: Coletar dados originais
    const dadosOriginais = await coletarDadosOriginais(clientesOriginais);

    // PASSO 8: Coletar dados novos
    const dadosNovos = await coletarDadosNovos(projectId);

    // PASSO 9: Comparar resultados
    const comparacoes = compararResultados(dadosOriginais, dadosNovos);

    // PASSO 10: Gerar relatório
    gerarRelatorioFinal(comparacoes);

    console.log('\n✅ VALIDAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!\n');
  } catch (error) {
    console.error('\n❌ ERRO NA VALIDAÇÃO:', error);
    process.exit(1);
  }
}

// Executar
main();
