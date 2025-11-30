import { EnhancedReportData } from './reportData';

/**
 * Constrói prompt melhorado para a IA gerar relatório
 */
export function buildEnhancedPrompt(data: EnhancedReportData): string {
  const statusText =
    data.status === 'in_progress'
      ? `⚠️ **ATENÇÃO:** Este relatório foi gerado com o enriquecimento ainda em andamento (${data.enrichmentProgress}% concluído). Os dados apresentados são parciais e podem não representar o panorama completo do mercado.`
      : `✅ Enriquecimento concluído${data.enrichmentCompletedAt ? ` em ${new Date(data.enrichmentCompletedAt).toLocaleString('pt-BR')}` : ''}`;

  const durationText = data.enrichmentDuration
    ? `Tempo de processamento: ${data.enrichmentDuration}`
    : '';

  return `Você é um analista de inteligência de mercado sênior. Analise os seguintes dados de pesquisa e gere um relatório executivo profissional, detalhado e baseado em dados concretos.

${statusText}

**INFORMAÇÕES DO PROJETO:**
- Projeto: ${data.projectNome} (ID: ${data.projectId})
- Pesquisa: ${data.pesquisaNome} (ID: ${data.pesquisaId})
- Data de início: ${data.enrichmentStartedAt ? new Date(data.enrichmentStartedAt).toLocaleString('pt-BR') : 'N/A'}
- Data de conclusão: ${data.enrichmentCompletedAt ? new Date(data.enrichmentCompletedAt).toLocaleString('pt-BR') : 'Em andamento'}
${durationText}

**ESTATÍSTICAS GERAIS:**
- Total de clientes: ${data.totalClientes}
- Clientes enriquecidos: ${data.clientesEnriquecidos} (${data.enrichmentProgress}%)
- Total de entidades levantadas: ${data.totalLeads + data.totalConcorrentes + data.totalMercados + data.totalProdutos}
  - Mercados identificados: ${data.totalMercados}
  - Produtos mapeados: ${data.totalProdutos}
  - Concorrentes identificados: ${data.totalConcorrentes}
  - Leads qualificados: ${data.totalLeads}

**ANÁLISE DE MERCADOS (${data.mercados.length} mercados):**
${data.mercados
  .map(
    (m, i) => `
${i + 1}. ${m.nome}
   - Categoria: ${m.categoria}
   - Tamanho Estimado: ${m.tamanhoEstimado}
   - Potencial: ${m.potencial}
   - Segmentação: ${m.segmentacao}
   - Clientes neste mercado: ${m.clientesCount}
   - Produtos identificados: ${m.produtosCount}
   - Concorrentes: ${m.concorrentesCount}
   - Leads qualificados: ${m.leadsCount}
`
  )
  .join('\n')}

**ANÁLISE DE PRODUTOS (Top 20 produtos):**
${data.produtos
  .slice(0, 20)
  .map(
    (p, i) => `
${i + 1}. ${p.nome}
   - Categoria: ${p.categoria}
   - Menções: ${p.count}
   - Mercados: ${p.mercados.join(', ') || 'Não especificado'}
`
  )
  .join('\n')}

**DISTRIBUIÇÃO GEOGRÁFICA DE CLIENTES:**
- Total de clientes: ${data.clientes.total}
- Estados com maior presença:
${
  Object.entries(data.clientes.porEstado ?? {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(
      ([uf, count], i) =>
        `  ${i + 1}. ${uf}: ${count} clientes (${((Number(count) / data.clientes.total) * 100).toFixed(1)}%)`
    )
    .join('\n') || '  Nenhum dado disponível'
}

- Principais cidades:
${data.clientes.porCidade
  .slice(0, 15)
  .map((c, i) => `  ${i + 1}. ${c.cidade}/${c.uf}: ${c.count} clientes`)
  .join('\n')}

**TOP 30 CLIENTES:**
${data.clientes.topClientes
  .slice(0, 30)
  .map(
    (c, i) => `
${i + 1}. ${c.nome} - ${c.cidade}/${c.uf}
   Mercados de atuação: ${c.mercados.join(', ') || 'Não especificado'}
`
  )
  .join('\n')}

**ANÁLISE DE LEADS (${data.leads.total} leads):**
- Distribuição por mercado:
${
  Object.entries(data.leads.porMercado ?? {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([mercado, count], i) => `  ${i + 1}. ${mercado}: ${count} leads`)
    .join('\n') || '  Nenhum dado disponível'
}

- Distribuição por potencial:
${
  Object.entries(data.leads.porPotencial ?? {})
    .map(
      ([potencial, count]) =>
        `  • ${potencial}: ${count} leads (${((Number(count) / data.leads.total) * 100).toFixed(1)}%)`
    )
    .join('\n') || '  Nenhum dado disponível'
}

**ANÁLISE DE CONCORRENTES (${data.concorrentes.total} concorrentes):**
- Distribuição por mercado:
${
  Object.entries(data.concorrentes.porMercado ?? {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([mercado, count], i) => `  ${i + 1}. ${mercado}: ${count} concorrentes`)
    .join('\n') || '  Nenhum dado disponível'
}

---

**GERE UM RELATÓRIO EXECUTIVO PROFISSIONAL COM AS SEGUINTES SEÇÕES:**

**1. RESUMO EXECUTIVO (3-4 parágrafos)**
- Visão geral da pesquisa e abrangência
- Principais descobertas e insights
- Contexto de mercado e relevância dos dados
- Destaques quantitativos mais importantes

**2. ANÁLISE DETALHADA DE MERCADOS (4-5 parágrafos)**
- Análise dos ${data.mercados.length} mercados identificados
- Segmentação e categorização
- Tamanho de mercado e potencial de crescimento
- Oportunidades e ameaças por mercado
- Recomendações de priorização

**3. PERFIL DE CLIENTES E DISTRIBUIÇÃO GEOGRÁFICA (3-4 parágrafos)**
- Perfil dos ${data.clientes.total} clientes identificados
- Análise da distribuição geográfica (estados e cidades)
- Concentração vs. dispersão geográfica
- Oportunidades de expansão regional
- Características dos principais clientes

**4. ANÁLISE DE PRODUTOS E SERVIÇOS (3-4 parágrafos)**
- Portfólio de ${data.totalProdutos} produtos identificados
- Categorização e segmentação de produtos
- Produtos mais demandados e tendências
- Oportunidades de cross-selling e upselling
- Gaps de mercado e produtos potenciais

**5. ANÁLISE DE LEADS E OPORTUNIDADES (2-3 parágrafos)**
- Perfil dos ${data.totalLeads} leads qualificados
- Distribuição por mercado e potencial
- Taxa de conversão estimada
- Estratégias de abordagem recomendadas
- Priorização de leads

**6. PANORAMA COMPETITIVO (3-4 parágrafos)**
- Análise dos ${data.totalConcorrentes} concorrentes identificados
- Distribuição por mercado
- Nível de competitividade por segmento
- Estratégias de diferenciação recomendadas
- Análise de ameaças e oportunidades competitivas

**7. ANÁLISE SWOT DO MERCADO (2-3 parágrafos)**
- Forças (Strengths) identificadas
- Fraquezas (Weaknesses) observadas
- Oportunidades (Opportunities) de mercado
- Ameaças (Threats) competitivas e de mercado

**8. CONCLUSÕES E RECOMENDAÇÕES ESTRATÉGICAS (4-5 parágrafos)**
- Insights estratégicos principais
- Recomendações de curto prazo (0-6 meses)
- Recomendações de médio prazo (6-18 meses)
- Recomendações de longo prazo (18+ meses)
- Próximos passos sugeridos
- KPIs recomendados para acompanhamento

---

**DIRETRIZES DE ESCRITA:**
- Use linguagem profissional, objetiva e baseada em dados
- Cite números específicos e percentuais sempre que relevante
- Faça análises comparativas entre mercados, regiões e segmentos
- Identifique padrões, tendências e insights não óbvios
- Seja específico em recomendações (não genérico)
- Use tom consultivo e estratégico
- Evite jargões excessivos, priorize clareza
${data.status === 'in_progress' ? '- IMPORTANTE: Deixe claro que a análise é parcial e pode mudar com dados completos' : ''}
`;
}
