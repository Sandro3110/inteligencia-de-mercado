import { EnhancedReportData } from './reportData';

/**
 * Constrói prompt melhorado para a IA gerar relatório
 */
export function buildEnhancedPrompt(data: EnhancedReportData): string {
  // Garantir valores padrão para evitar null/undefined
  const metadata = data.metadata ?? {
    projectId: 0,
    projectNome: 'Sem nome',
    pesquisaId: 0,
    pesquisaNome: 'Sem nome',
    totalClientes: 0,
    clientesEnriquecidos: 0,
    enrichmentProgress: 0,
  };

  const totalLeads = data.totalLeads ?? 0;
  const totalConcorrentes = data.totalConcorrentes ?? 0;
  const totalMercados = data.totalMercados ?? 0;
  const totalProdutos = data.totalProdutos ?? 0;
  const totalClientes = metadata.totalClientes ?? 0;
  const clientesEnriquecidos = metadata.clientesEnriquecidos ?? 0;
  const enrichmentProgress = metadata.enrichmentProgress ?? 0;

  const durationText = data.enrichmentDuration
    ? `Tempo de processamento: ${data.enrichmentDuration}`
    : '';

  const mercados = Array.isArray(data.mercados) ? data.mercados : [];
  const produtos = Array.isArray(data.produtos) ? data.produtos : [];
  const clientes = data.clientes ?? { total: 0, porEstado: {}, porCidade: [], topClientes: [] };
  const leads = data.leads ?? { total: 0, porMercado: {}, porPotencial: {}, topLeads: [] };
  const concorrentes = data.concorrentes ?? { total: 0, porMercado: {}, topConcorrentes: [] };

  return `Você é um analista de inteligência de mercado sênior. Analise os seguintes dados de pesquisa e gere um relatório executivo profissional, detalhado e baseado em dados concretos.

**INFORMAÇÕES DO PROJETO:**
- Projeto: ${metadata.projectNome} (ID: ${metadata.projectId})
- Pesquisa: ${metadata.pesquisaNome} (ID: ${metadata.pesquisaId})
- Data de início: ${data.enrichmentStartedAt ? new Date(data.enrichmentStartedAt).toLocaleString('pt-BR') : 'N/A'}
- Data de conclusão: ${data.enrichmentCompletedAt ? new Date(data.enrichmentCompletedAt).toLocaleString('pt-BR') : 'Em andamento'}
${durationText}

**ESTATÍSTICAS GERAIS:**
- Total de clientes: ${totalClientes}
- Clientes enriquecidos: ${clientesEnriquecidos} (${enrichmentProgress}%)
- Total de entidades levantadas: ${totalLeads + totalConcorrentes + totalMercados + totalProdutos}
  - Mercados identificados: ${totalMercados}
  - Produtos mapeados: ${totalProdutos}
  - Concorrentes identificados: ${totalConcorrentes}
  - Leads qualificados: ${totalLeads}

**ANÁLISE DE MERCADOS (${mercados.length} mercados):**
${mercados
  .slice(0, 20)
  .map(
    (m, i) => `
${i + 1}. ${m.nome ?? 'Sem nome'}
   - Categoria: ${m.categoria ?? 'N/A'}
   - Tamanho Estimado: ${m.tamanhoEstimado ?? 'N/A'}
   - Potencial: ${m.potencial ?? 'N/A'}
   - Segmentação: ${m.segmentacao ?? 'N/A'}
   - Clientes neste mercado: ${m.clientesCount ?? 0}
   - Produtos neste mercado: ${m.produtosCount ?? 0}
   - Concorrentes: ${m.concorrentesCount ?? 0}
   - Leads: ${m.leadsCount ?? 0}`
  )
  .join('\n')}

**PRODUTOS MAPEADOS (${produtos.length} produtos):**
${produtos
  .slice(0, 20)
  .map(
    (p, i) => `
${i + 1}. ${p.nome ?? 'Sem nome'}
   - Mercados: ${Array.isArray(p.mercados) ? p.mercados.join(', ') : 'N/A'}`
  )
  .join('\n')}

**ANÁLISE DE CLIENTES (${clientes.total} clientes):**

Distribuição Geográfica por Estado:
${Object.entries(clientes.porEstado ?? {})
  .map(([uf, count]) => `- ${uf}: ${count} clientes`)
  .join('\n')}

Top Cidades:
${(clientes.porCidade ?? [])
  .slice(0, 10)
  .map((c) => `- ${c.cidade ?? 'N/A'}/${c.uf ?? 'N/A'}: ${c.count ?? 0} clientes`)
  .join('\n')}

Amostra de Clientes (${(clientes.topClientes ?? []).length} clientes):
${(clientes.topClientes ?? [])
  .slice(0, 20)
  .map(
    (c, i) => `
${i + 1}. ${c.nome ?? 'Sem nome'} - ${c.cidade ?? 'N/A'}/${c.uf ?? 'N/A'}
   Mercados: ${Array.isArray(c.mercados) ? c.mercados.join(', ') : 'N/A'}`
  )
  .join('\n')}

**ANÁLISE DE LEADS (${leads.total} leads):**

Distribuição por Mercado:
${Object.entries(leads.porMercado ?? {})
  .slice(0, 10)
  .map(([mercado, count]) => `- ${mercado}: ${count} leads`)
  .join('\n')}

Distribuição por Potencial:
${Object.entries(leads.porPotencial ?? {})
  .map(([potencial, count]) => `- ${potencial}: ${count} leads`)
  .join('\n')}

Top Leads:
${(leads.topLeads ?? [])
  .slice(0, 15)
  .map(
    (l, i) =>
      `${i + 1}. ${l.nome ?? 'Sem nome'} - ${l.mercado ?? 'N/A'} (Potencial: ${l.potencial ?? 'N/A'})`
  )
  .join('\n')}

**ANÁLISE DE CONCORRENTES (${concorrentes.total} concorrentes):**

Distribuição por Mercado:
${Object.entries(concorrentes.porMercado ?? {})
  .slice(0, 10)
  .map(([mercado, count]) => `- ${mercado}: ${count} concorrentes`)
  .join('\n')}

Top Concorrentes:
${(concorrentes.topConcorrentes ?? [])
  .slice(0, 20)
  .map(
    (c, i) =>
      `${i + 1}. ${c.nome ?? 'Sem nome'} - ${c.mercado ?? 'N/A'} (Porte: ${c.porte ?? 'N/A'})`
  )
  .join('\n')}

---

**INSTRUÇÕES PARA GERAÇÃO DO RELATÓRIO:**

1. **OBRIGATÓRIO:** Cite dados específicos, números exatos, nomes de empresas reais, cidades e estados mencionados acima
2. **OBRIGATÓRIO:** Use os dados concretos fornecidos, não invente informações
3. **OBRIGATÓRIO:** Mencione pelo menos 10 empresas/clientes reais pelo nome
4. **OBRIGATÓRIO:** Cite pelo menos 5 cidades específicas com seus estados
5. **OBRIGATÓRIO:** Use números exatos (não arredonde demais)

Estruture o relatório em **26 parágrafos** seguindo esta ordem:

**1. Resumo Executivo (3 parágrafos)**
- Parágrafo 1: Visão geral do projeto e objetivos
- Parágrafo 2: Principais descobertas e números-chave
- Parágrafo 3: Recomendações estratégicas de alto nível

**2. Análise de Mercado (5 parágrafos)**
- Parágrafo 4: Panorama geral dos mercados identificados
- Parágrafo 5: Mercados de maior potencial (cite nomes específicos)
- Parágrafo 6: Análise de tamanho e segmentação
- Parágrafo 7: Tendências e oportunidades
- Parágrafo 8: Riscos e desafios

**3. Análise de Produtos (3 parágrafos)**
- Parágrafo 9: Produtos mais relevantes (cite nomes)
- Parágrafo 10: Distribuição de produtos por mercado
- Parágrafo 11: Oportunidades de produto

**4. Análise de Clientes (5 parágrafos)**
- Parágrafo 12: Perfil geral da base de clientes
- Parágrafo 13: Distribuição geográfica detalhada (cite estados e cidades)
- Parágrafo 14: Principais clientes (cite pelo menos 5 nomes)
- Parágrafo 15: Padrões de comportamento
- Parágrafo 16: Segmentação de clientes

**5. Análise de Leads (4 parágrafos)**
- Parágrafo 17: Visão geral dos leads qualificados
- Parágrafo 18: Leads de alto potencial (cite nomes)
- Parágrafo 19: Distribuição por mercado
- Parágrafo 20: Estratégias de conversão

**6. Análise Competitiva (3 parágrafos)**
- Parágrafo 21: Panorama competitivo
- Parágrafo 22: Principais concorrentes (cite nomes)
- Parágrafo 23: Posicionamento e diferenciação

**7. Recomendações Estratégicas (3 parágrafos)**
- Parágrafo 24: Ações de curto prazo
- Parágrafo 25: Estratégias de médio prazo
- Parágrafo 26: Visão de longo prazo

**FORMATO:**
- Use Markdown com títulos (##) e subtítulos (###)
- Use **negrito** para destacar números e nomes importantes
- Use listas quando apropriado
- Mantenha tom profissional e objetivo
- Seja específico e baseado em dados

Gere o relatório agora:`;
}
