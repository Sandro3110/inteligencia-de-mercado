/**
 * Script para analisar a base de dados completa e identificar padrões de dados inválidos
 * que podem ser usados como filtros de exclusão
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { clientes, concorrentes, leads, mercadosUnicos } from './drizzle/schema';

const db = drizzle(process.env.DATABASE_URL!);

interface AnalysisResult {
  totalRecords: number;
  invalidPatterns: {
    pattern: string;
    count: number;
    examples: string[];
  }[];
}

async function analyzeDatabase() {
  console.log('🔍 ANÁLISE DA BASE DE DADOS COMPLETA\n');
  console.log('═'.repeat(80));
  
  // 1. Analisar Clientes
  console.log('\n📊 ANALISANDO CLIENTES (800 registros)...\n');
  const clientesList = await db.select().from(clientes);
  const clientesAnalysis = analyzeEntities(clientesList, 'cliente');
  
  // 2. Analisar Concorrentes
  console.log('\n📊 ANALISANDO CONCORRENTES (591 registros)...\n');
  const concorrentesList = await db.select().from(concorrentes);
  const concorrentesAnalysis = analyzeEntities(concorrentesList, 'concorrente');
  
  // 3. Analisar Leads
  console.log('\n📊 ANALISANDO LEADS (727 registros)...\n');
  const leadsList = await db.select().from(leads);
  const leadsAnalysis = analyzeEntities(leadsList, 'lead');
  
  // 4. Consolidar resultados
  console.log('\n═'.repeat(80));
  console.log('\n📋 RESUMO CONSOLIDADO\n');
  
  const allPatterns = [
    ...clientesAnalysis.invalidPatterns,
    ...concorrentesAnalysis.invalidPatterns,
    ...leadsAnalysis.invalidPatterns,
  ];
  
  // Agrupar padrões similares
  const groupedPatterns = groupSimilarPatterns(allPatterns);
  
  console.log('\n🚫 PADRÕES INVÁLIDOS IDENTIFICADOS:\n');
  groupedPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern.pattern}`);
    console.log(`   Ocorrências: ${pattern.count}`);
    console.log(`   Exemplos:`);
    pattern.examples.slice(0, 5).forEach(ex => {
      console.log(`   - ${ex}`);
    });
    console.log('');
  });
  
  // 5. Gerar recomendações de filtros
  console.log('\n═'.repeat(80));
  console.log('\n💡 RECOMENDAÇÕES DE FILTROS\n');
  
  generateFilterRecommendations(groupedPatterns);
  
  // 6. Salvar relatório
  const report = generateReport({
    clientes: clientesAnalysis,
    concorrentes: concorrentesAnalysis,
    leads: leadsAnalysis,
    consolidated: groupedPatterns,
  });
  
  await Bun.write('/home/ubuntu/gestor-pav/ANALISE_BASE_DADOS.md', report);
  console.log('\n✅ Relatório salvo em: ANALISE_BASE_DADOS.md\n');
}

function analyzeEntities(entities: any[], type: string): AnalysisResult {
  const invalidPatterns: Map<string, { count: number; examples: Set<string> }> = new Map();
  
  entities.forEach(entity => {
    const nome = entity.nome || '';
    const site = entity.site || entity.siteOficial || '';
    
    // Padrão 1: Nomes com palavras-chave de artigos
    const articleKeywords = [
      'maiores', 'principais', 'top', 'ranking', 'lista',
      'conheça', 'quais são', 'confira', 'veja', 'descubra',
      'melhores', 'fabricantes de', 'distribuidores de',
      'empresas de', 'indústria de', 'setor de',
    ];
    
    articleKeywords.forEach(keyword => {
      if (nome.toLowerCase().includes(keyword)) {
        addPattern(invalidPatterns, `Nome contém "${keyword}"`, nome);
      }
    });
    
    // Padrão 2: Sites de domínios bloqueados
    const blockedDomains = [
      'globo.com', 'uol.com.br', 'estadao.com.br', 'exame.com',
      'valor.globo.com', 'econodata.com.br', 'motor1.uol.com.br',
      'guiadoauto.com.br', 'minutoseguros.com.br',
    ];
    
    blockedDomains.forEach(domain => {
      if (site.includes(domain)) {
        addPattern(invalidPatterns, `Site de domínio bloqueado: ${domain}`, nome);
      }
    });
    
    // Padrão 3: URLs com padrões de artigos
    const urlPatterns = [
      '/blog/', '/noticias/', '/artigos/', '/noticia/',
      '/ranking/', '/lista-', '/maiores-', '/principais-',
    ];
    
    urlPatterns.forEach(pattern => {
      if (site.includes(pattern)) {
        addPattern(invalidPatterns, `URL contém "${pattern}"`, nome);
      }
    });
    
    // Padrão 4: Nomes muito longos (provavelmente títulos de artigos)
    if (nome.length > 80) {
      addPattern(invalidPatterns, 'Nome muito longo (>80 caracteres)', nome);
    }
    
    // Padrão 5: Nomes com pontuação excessiva (?, :, ...)
    if (nome.match(/[?:]/g)?.length || 0 > 1) {
      addPattern(invalidPatterns, 'Nome com pontuação excessiva (?, :)', nome);
    }
    
    // Padrão 6: Nomes genéricos
    const genericNames = [
      'lista', 'ranking', 'guia', 'portal', 'site',
      'página', 'artigo', 'matéria', 'notícia',
    ];
    
    genericNames.forEach(generic => {
      if (nome.toLowerCase() === generic || nome.toLowerCase().startsWith(generic + ' ')) {
        addPattern(invalidPatterns, `Nome genérico: "${generic}"`, nome);
      }
    });
    
    // Padrão 7: Nomes com números no início (ex: "10 maiores", "23 empresas")
    if (nome.match(/^\d+\s/)) {
      addPattern(invalidPatterns, 'Nome inicia com número', nome);
    }
    
    // Padrão 8: Sites sem CNPJ e sem domínio corporativo
    const cnpj = entity.cnpj;
    const hasCorporateDomain = site.match(/\.(com\.br|ind\.br|net\.br|com|net)$/);
    
    if (!cnpj && !hasCorporateDomain && site) {
      addPattern(invalidPatterns, 'Sem CNPJ e sem domínio corporativo', nome);
    }
  });
  
  // Converter Map para array
  const patternsArray = Array.from(invalidPatterns.entries()).map(([pattern, data]) => ({
    pattern,
    count: data.count,
    examples: Array.from(data.examples),
  }));
  
  // Ordenar por count (decrescente)
  patternsArray.sort((a, b) => b.count - a.count);
  
  console.log(`Total de registros: ${entities.length}`);
  console.log(`Padrões inválidos encontrados: ${patternsArray.length}`);
  console.log(`Registros com problemas: ${patternsArray.reduce((sum, p) => sum + p.count, 0)}`);
  
  return {
    totalRecords: entities.length,
    invalidPatterns: patternsArray,
  };
}

function addPattern(
  map: Map<string, { count: number; examples: Set<string> }>,
  pattern: string,
  example: string
) {
  if (!map.has(pattern)) {
    map.set(pattern, { count: 0, examples: new Set() });
  }
  
  const data = map.get(pattern)!;
  data.count++;
  if (data.examples.size < 10) {
    data.examples.add(example);
  }
}

function groupSimilarPatterns(patterns: any[]) {
  // Agrupar padrões similares e remover duplicatas
  const grouped = new Map<string, { count: number; examples: Set<string> }>();
  
  patterns.forEach(p => {
    if (!grouped.has(p.pattern)) {
      grouped.set(p.pattern, { count: 0, examples: new Set() });
    }
    
    const data = grouped.get(p.pattern)!;
    data.count += p.count;
    p.examples.forEach((ex: string) => {
      if (data.examples.size < 20) {
        data.examples.add(ex);
      }
    });
  });
  
  // Converter para array e ordenar
  return Array.from(grouped.entries())
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      examples: Array.from(data.examples),
    }))
    .sort((a, b) => b.count - a.count);
}

function generateFilterRecommendations(patterns: any[]) {
  console.log('Com base nos padrões identificados, recomendo adicionar:\n');
  
  // 1. Palavras-chave de nomes
  const nameKeywords = patterns
    .filter(p => p.pattern.includes('Nome contém'))
    .map(p => p.pattern.match(/"(.+)"/)?.[1])
    .filter(Boolean);
  
  if (nameKeywords.length > 0) {
    console.log('1. PALAVRAS-CHAVE DE NOMES (adicionar a ARTICLE_TITLE_KEYWORDS):');
    nameKeywords.slice(0, 10).forEach(kw => {
      console.log(`   - "${kw}"`);
    });
    console.log('');
  }
  
  // 2. Domínios bloqueados
  const domains = patterns
    .filter(p => p.pattern.includes('domínio bloqueado'))
    .map(p => p.pattern.match(/: (.+)/)?.[1])
    .filter(Boolean);
  
  if (domains.length > 0) {
    console.log('2. DOMÍNIOS BLOQUEADOS (adicionar a BLOCKED_DOMAINS):');
    domains.slice(0, 10).forEach(domain => {
      console.log(`   - '${domain}'`);
    });
    console.log('');
  }
  
  // 3. Padrões de URL
  const urlPatterns = patterns
    .filter(p => p.pattern.includes('URL contém'))
    .map(p => p.pattern.match(/"(.+)"/)?.[1])
    .filter(Boolean);
  
  if (urlPatterns.length > 0) {
    console.log('3. PADRÕES DE URL (adicionar a ARTICLE_URL_PATTERNS):');
    urlPatterns.slice(0, 10).forEach(pattern => {
      console.log(`   - /${pattern}/i`);
    });
    console.log('');
  }
  
  // 4. Validações adicionais
  console.log('4. VALIDAÇÕES ADICIONAIS:');
  
  const longNames = patterns.find(p => p.pattern.includes('muito longo'));
  if (longNames && longNames.count > 10) {
    console.log(`   - Rejeitar nomes com mais de 80 caracteres (${longNames.count} casos)`);
  }
  
  const punctuation = patterns.find(p => p.pattern.includes('pontuação excessiva'));
  if (punctuation && punctuation.count > 10) {
    console.log(`   - Rejeitar nomes com pontuação excessiva (${punctuation.count} casos)`);
  }
  
  const startsWithNumber = patterns.find(p => p.pattern.includes('inicia com número'));
  if (startsWithNumber && startsWithNumber.count > 10) {
    console.log(`   - Rejeitar nomes que iniciam com número (${startsWithNumber.count} casos)`);
  }
  
  console.log('');
}

function generateReport(data: any): string {
  let report = '# 📊 ANÁLISE DA BASE DE DADOS - PADRÕES INVÁLIDOS\n\n';
  report += '**Data:** ' + new Date().toLocaleDateString('pt-BR') + '\n';
  report += '**Sistema:** Gestor PAV - Sistema de Enriquecimento de Dados B2B\n\n';
  report += '---\n\n';
  
  report += '## 📋 RESUMO EXECUTIVO\n\n';
  report += `- **Clientes:** ${data.clientes.totalRecords} registros\n`;
  report += `- **Concorrentes:** ${data.concorrentes.totalRecords} registros\n`;
  report += `- **Leads:** ${data.leads.totalRecords} registros\n`;
  report += `- **Total:** ${data.clientes.totalRecords + data.concorrentes.totalRecords + data.leads.totalRecords} registros\n\n`;
  
  report += '---\n\n';
  
  report += '## 🚫 PADRÕES INVÁLIDOS IDENTIFICADOS\n\n';
  
  data.consolidated.forEach((pattern: any, index: number) => {
    report += `### ${index + 1}. ${pattern.pattern}\n\n`;
    report += `**Ocorrências:** ${pattern.count}\n\n`;
    report += '**Exemplos:**\n\n';
    pattern.examples.slice(0, 10).forEach((ex: string) => {
      report += `- ${ex}\n`;
    });
    report += '\n';
  });
  
  report += '---\n\n';
  
  report += '## 💡 RECOMENDAÇÕES DE FILTROS\n\n';
  report += 'Com base nos padrões identificados, recomendo atualizar os filtros:\n\n';
  
  // Adicionar recomendações detalhadas
  report += '### 1. Palavras-chave de Nomes\n\n';
  report += 'Adicionar a `ARTICLE_TITLE_KEYWORDS`:\n\n';
  report += '```typescript\n';
  data.consolidated
    .filter((p: any) => p.pattern.includes('Nome contém'))
    .slice(0, 20)
    .forEach((p: any) => {
      const keyword = p.pattern.match(/"(.+)"/)?.[1];
      if (keyword) {
        report += `  '${keyword}',\n`;
      }
    });
  report += '```\n\n';
  
  return report;
}

// Executar análise
analyzeDatabase().catch(console.error);
