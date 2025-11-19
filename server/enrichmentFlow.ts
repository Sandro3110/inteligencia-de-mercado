/**
 * Fluxo Automatizado de Enriquecimento de Dados
 * 
 * Este módulo implementa o fluxo completo de processamento:
 * 1. Input de clientes (manual ou planilha)
 * 2. Identificação automática de mercados via LLM
 * 3. Enriquecimento de dados via APIs
 * 4. Busca de concorrentes e leads
 * 5. Cálculo de scores de qualidade
 * 6. Criação de novo projeto com dados processados
 */

import { calculateQualityScore } from '../shared/qualityScore';
import { jobManager } from './_core/jobManager';

export type EnrichmentInput = {
  clientes: Array<{
    nome: string;
    cnpj?: string;
    site?: string;
    produto?: string;
  }>;
  projectName: string;
};

export type EnrichmentProgress = {
  status: 'processing' | 'completed' | 'error';
  message: string;
  currentStep: number;
  totalSteps: number;
  data?: {
    projectId?: number;
    projectName?: string;
    clientes?: any[];
    mercados?: any[];
    concorrentes?: any[];
    leads?: any[];
    stats?: {
      mercadosCount?: number;
      clientesCount?: number;
      concorrentesCount?: number;
      leadsCount?: number;
      avgQualityScore?: number;
    };
    // Backward compatibility
    mercadosCount?: number;
    clientesCount?: number;
    concorrentesCount?: number;
    leadsCount?: number;
    avgQualityScore?: number;
  };
};

type ProgressCallback = (progress: EnrichmentProgress) => void;

/**
 * Executa o fluxo completo de enriquecimento
 */
export async function executeEnrichmentFlow(
  input: EnrichmentInput,
  onProgress: ProgressCallback,
  jobId?: string
): Promise<EnrichmentProgress> {
  try {
    const totalSteps = 7;
    let currentStep = 0;
    
    // Criar job no manager se jobId fornecido
    if (jobId) {
      jobManager.createJob(jobId, totalSteps);
    }

    // Passo 1: Criar projeto
    const step1 = {
      status: 'processing' as const,
      message: `Criando projeto "${input.projectName}"...`,
      currentStep: ++currentStep,
      totalSteps,
    };
    onProgress(step1);
    if (jobId) {
      jobManager.updateJob(jobId, {
        step: currentStep,
        currentStepName: 'Criando projeto',
        message: step1.message,
        progress: 0,
      });
    }

    const { createProject } = await import('./db');
    const project = await createProject({
      nome: input.projectName,
      descricao: `Projeto criado automaticamente via fluxo de enriquecimento`,
    });

    if (!project) {
      throw new Error('Falha ao criar projeto');
    }

    // Passo 2: Identificar mercados únicos
    onProgress({
      status: 'processing',
      message: 'Identificando mercados a partir dos produtos dos clientes...',
      currentStep: ++currentStep,
      totalSteps,
    });

    const mercadosMap = await identifyMarkets(input.clientes, project.id);

    // Passo 3: Processar e enriquecer clientes
    onProgress({
      status: 'processing',
      message: `Enriquecendo dados de ${input.clientes.length} clientes...`,
      currentStep: ++currentStep,
      totalSteps,
    });

    const clientesEnriquecidos = await enrichClientes(
      input.clientes,
      project.id,
      mercadosMap
    );

    // Passo 4: Buscar concorrentes
    onProgress({
      status: 'processing',
      message: 'Identificando concorrentes por mercado...',
      currentStep: ++currentStep,
      totalSteps,
    });

    const concorrentes = await findCompetitorsForMarkets(
      mercadosMap,
      project.id,
      clientesEnriquecidos.map(c => ({ nome: c.nome, cnpj: c.cnpj || undefined })) // Passar clientes para exclusão
    );

    // Passo 5: Buscar leads
    onProgress({
      status: 'processing',
      message: 'Buscando leads qualificados...',
      currentStep: ++currentStep,
      totalSteps,
    });

    const leadsEncontrados = await findLeadsForMarkets(
      mercadosMap,
      project.id,
      clientesEnriquecidos.map(c => ({ nome: c.nome, cnpj: c.cnpj || undefined })), // Passar clientes para exclusão
      concorrentes.map(c => ({ nome: c.nome, cnpj: c.cnpj || undefined })) // Passar concorrentes para exclusão
    );

    // Passo 6: Calcular estatísticas
    onProgress({
      status: 'processing',
      message: 'Calculando métricas de qualidade...',
      currentStep: ++currentStep,
      totalSteps,
    });

    const avgQualityScore = Math.round(
      clientesEnriquecidos.reduce((sum, c) => sum + (c.qualidadeScore || 0), 0) /
        clientesEnriquecidos.length
    );

    // Passo 7: Finalizar
    onProgress({
      status: 'completed',
      message: 'Processamento concluído com sucesso!',
      currentStep: ++currentStep,
      totalSteps,
      data: {
        projectId: project.id,
        mercadosCount: mercadosMap.size,
        clientesCount: clientesEnriquecidos.length,
        concorrentesCount: concorrentes.length,
        leadsCount: leadsEncontrados.length,
        avgQualityScore,
      },
    });

    // Buscar dados completos do banco para retornar
    const db = await (await import('./db')).getDb();
    if (!db) throw new Error('Database not available');
    
    const { clientes: clientesTable, mercadosUnicos, concorrentes: concorrentesTable, leads: leadsTable } = await import('../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    const clientesCompletos = await db.select().from(clientesTable).where(eq(clientesTable.projectId, project.id));
    const mercadosCompletos = await db.select().from(mercadosUnicos).where(eq(mercadosUnicos.projectId, project.id));
    const concorrentesCompletos = await db.select().from(concorrentesTable).where(eq(concorrentesTable.projectId, project.id));
    const leadsCompletos = await db.select().from(leadsTable).where(eq(leadsTable.projectId, project.id));

    return {
      status: 'completed',
      message: 'Processamento concluído!',
      currentStep: totalSteps,
      totalSteps,
      data: {
        projectId: project.id,
        projectName: project.nome,
        clientes: clientesEnriquecidos,
        mercados: mercadosCompletos,
        concorrentes: concorrentesCompletos,
        leads: leadsCompletos,
        stats: {
          mercadosCount: mercadosMap.size,
          clientesCount: clientesEnriquecidos.length,
          concorrentesCount: concorrentes.length,
          leadsCount: leadsEncontrados.length,
          avgQualityScore,
        },
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';

    return {
      status: 'error',
      message: `Erro no processamento: ${errorMessage}`,
      currentStep: 0,
      totalSteps: 0,
    };
  }
}

/**
 * Identifica mercados únicos a partir dos produtos dos clientes
 */
async function identifyMarkets(
  clientes: EnrichmentInput['clientes'],
  projectId: number
): Promise<Map<string, number>> {
  const { invokeLLM } = await import('./_core/llm');
  const { createMercado } = await import('./db');

  const mercadosMap = new Map<string, number>();
    const produtosUnicos = Array.from(
      new Set(clientes.map((c) => c.produto).filter(Boolean))
    );

  for (const produto of produtosUnicos) {
    if (!produto) continue;

    // Usar LLM para identificar mercado
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em análise de mercado. Identifique o mercado/setor para o produto fornecido.',
        },
        {
          role: 'user',
          content: `Produto: ${produto}\n\nRetorne JSON com: { "mercado": "nome do mercado", "categoria": "categoria", "segmentacao": "B2B ou B2C" }`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'market_identification',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              mercado: { type: 'string' },
              categoria: { type: 'string' },
              segmentacao: { type: 'string', enum: ['B2B', 'B2C', 'B2B2C'] },
            },
            required: ['mercado', 'categoria', 'segmentacao'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') continue;

    const data = JSON.parse(content);

    // Criar mercado se não existir
    if (!mercadosMap.has(data.mercado)) {
      const mercado = await createMercado({
        projectId,
        nome: data.mercado,
        categoria: data.categoria,
        segmentacao: data.segmentacao as any,
      });

      if (mercado) {
        mercadosMap.set(data.mercado, mercado.id);
      }
    }
  }

  return mercadosMap;
}

/**
 * Enriquece dados dos clientes
 */
async function enrichClientes(
  clientes: EnrichmentInput['clientes'],
  projectId: number,
  mercadosMap: Map<string, number>
) {
  const { createCliente, associateClienteToMercado } = await import('./db');
  const { invokeLLM } = await import('./_core/llm');
  const { getCachedEnrichment, setCachedEnrichment } = await import('./_core/enrichmentCache');
  const { consultarCNPJ, extractPorte, extractEndereco, extractCNAE } = await import('./_core/receitaws');

  const enriched = [];

  for (const cliente of clientes) {
    // Tentar buscar dados do cache primeiro
    let dadosEnriquecidos: any = null;
    if (cliente.cnpj) {
      const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length === 14) {
        dadosEnriquecidos = await getCachedEnrichment(cnpjLimpo);
        
        // Se não tem cache, consultar ReceitaWS
        if (!dadosEnriquecidos) {
          const receitaData = await consultarCNPJ(cnpjLimpo);
          if (receitaData) {
            dadosEnriquecidos = {
              nome: receitaData.fantasia || receitaData.nome,
              razaoSocial: receitaData.nome,
              cnpj: receitaData.cnpj,
              porte: extractPorte(receitaData),
              endereco: extractEndereco(receitaData),
              cnae: extractCNAE(receitaData),
              email: receitaData.email,
              telefone: receitaData.telefone,
              situacao: receitaData.situacao,
            };
            
            // Salvar no cache
            await setCachedEnrichment(cnpjLimpo, dadosEnriquecidos, 'receitaws');
          }
        }
      }
    }
    // Identificar mercado do cliente
    let mercadoId: number | null = null;

    if (cliente.produto) {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Identifique o mercado para este produto.',
          },
          { role: 'user', content: `Produto: ${cliente.produto}` },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content && typeof content === 'string') {
        // Buscar mercado correspondente
        for (const [mercadoNome, id] of Array.from(mercadosMap.entries())) {
          if (content.toLowerCase().includes(mercadoNome.toLowerCase())) {
            mercadoId = id;
            break;
          }
        }
      }
    }

    // Usar dados enriquecidos se disponíveis
    const clienteData: any = {
      ...cliente,
      nome: dadosEnriquecidos?.nome || cliente.nome,
      porte: dadosEnriquecidos?.porte,
      email: dadosEnriquecidos?.email,
      telefone: dadosEnriquecidos?.telefone,
    };
    
    // Calcular score de qualidade
    const qualidadeScore = calculateQualityScore(clienteData);
    const qualidadeClassificacao =
      qualidadeScore >= 80
        ? 'Excelente'
        : qualidadeScore >= 60
          ? 'Bom'
          : qualidadeScore >= 40
            ? 'Regular'
            : 'Ruim';

    // Aplicar dados do cache se disponível
    const dadosCliente = dadosEnriquecidos || cliente;
    
    // Criar cliente
    const novoCliente = await createCliente({
      projectId,
      nome: dadosEnriquecidos?.nome || cliente.nome,
      cnpj: cliente.cnpj || null,
      siteOficial: dadosEnriquecidos?.site || cliente.site || null,
      email: dadosEnriquecidos?.email || null,
      telefone: dadosEnriquecidos?.telefone || null,
      cidade: dadosEnriquecidos?.cidade || null,
      uf: dadosEnriquecidos?.uf || null,
      produtoPrincipal: cliente.produto || null,
      qualidadeScore,
      qualidadeClassificacao,
      validationStatus: 'pending',
    });
    
    // Salvar no cache se não estava em cache
    if (!dadosEnriquecidos && cliente.cnpj) {
      const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length === 14) {
        await setCachedEnrichment(cnpjLimpo, {
          nome: cliente.nome,
          site: cliente.site,
          produto: cliente.produto,
        }, 'input');
      }
    }

    if (novoCliente && mercadoId) {
      await associateClienteToMercado(novoCliente.id, mercadoId);
      enriched.push({ ...novoCliente, qualidadeScore });
    }
  }

  return enriched;
}

/**
 * Busca concorrentes para cada mercado usando SerpAPI
 */
async function findCompetitorsForMarkets(
  mercadosMap: Map<string, number>,
  projectId: number,
  clientes: Array<{ nome: string; cnpj?: string }> = []
) {
  const { searchCompetitors } = await import('./_core/serpApi');
  const { createConcorrente } = await import('./db');
  const { filterDuplicates } = await import('./_core/deduplication');
  const { filterRealCompanies } = await import('./_core/companyFilters');
  const concorrentes: any[] = [];

  for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
    try {
      // Buscar concorrentes reais via SerpAPI (20 resultados)
      console.log(`[Enrichment] Buscando concorrentes para mercado: ${mercadoNome}`);
      const rawResults = await searchCompetitors(mercadoNome, undefined, 20);
      
      // Filtrar apenas empresas reais (remover artigos/notícias)
      const searchResults = filterRealCompanies(rawResults
        .filter(r => r.site) // Garantir que tem site
        .map(r => ({
          title: r.nome,
          link: r.site!,
          snippet: r.descricao,
        }))
      ).map((filtered) => ({
        nome: filtered.title,
        site: filtered.link,
        descricao: filtered.snippet,
      }));
      
      console.log(`[Filter] Concorrentes após filtro: ${searchResults.length}/${rawResults.length}`);
      
      // Extrair nomes de empresas dos resultados do SerpAPI
      const concorrentesCandidatos = searchResults.map(result => ({
        nome: result.nome,
        produto: result.descricao || mercadoNome,
        site: result.site,
        cnpj: undefined,
      }));
      
      const concorrentesFiltrados = filterDuplicates(
        concorrentesCandidatos,
        clientes // Excluir empresas que são clientes
      );
      
      // Processar cada concorrente validado (aumentado para 20)
      for (const comp of concorrentesFiltrados.slice(0, 20)) {
        try {
          // Dados já vêm do SerpAPI (searchResults)
          const searchMatch = searchResults.find(r => 
            r.nome.toLowerCase().includes(comp.nome.toLowerCase()) ||
            comp.nome.toLowerCase().includes(r.nome.toLowerCase())
          );

          const enrichedData = {
            site: searchMatch?.site || comp.site,
            descricao: searchMatch?.descricao || comp.produto,
          };

          // Calcular score de qualidade baseado em dados disponíveis
          const qualidadeScore = calculateQualityScore({
            cnpj: null,
            email: null,
            telefone: null,
            site: enrichedData.site,
            siteOficial: enrichedData.site,
            linkedin: null,
            instagram: null,
            produto: comp.produto,
            produtoPrincipal: comp.produto,
            cidade: null,
            uf: null,
            cnae: null,
            porte: null,
            faturamentoEstimado: null,
          });

          const qualidadeClassificacao =
            qualidadeScore >= 80
              ? 'Excelente'
              : qualidadeScore >= 60
                ? 'Bom'
                : qualidadeScore >= 40
                  ? 'Regular'
                  : 'Ruim';

          // Criar concorrente
          const novoConcorrente = await createConcorrente({
            projectId,
            mercadoId,
            nome: comp.nome,
            cnpj: null, // CNPJ será enriquecido posteriormente
            site: enrichedData.site || null,
            produto: comp.produto,
            qualidadeScore,
            qualidadeClassificacao,
            validationStatus: 'pending',
          });

          if (novoConcorrente) {
            concorrentes.push(novoConcorrente);
          }
        } catch (error) {
          console.error(`Erro ao criar concorrente ${comp.nome}:`, error);
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar concorrentes para ${mercadoNome}:`, error);
    }
  }

  return concorrentes;
}

/**
 * Busca leads para cada mercado usando SerpAPI
 */
async function findLeadsForMarkets(
  mercadosMap: Map<string, number>,
  projectId: number,
  clientes: Array<{ nome: string; cnpj?: string }> = [],
  concorrentes: Array<{ nome: string; cnpj?: string }> = []
) {
  const { searchLeads } = await import('./_core/serpApi');
  const { createLead } = await import('./db');
  const { filterDuplicates } = await import('./_core/deduplication');
  const { filterRealCompanies } = await import('./_core/companyFilters');
  const leads: any[] = [];

  for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
    try {
      // Buscar leads reais via SerpAPI (20 resultados)
      console.log(`[Enrichment] Buscando leads para mercado: ${mercadoNome}`);
      const rawResults = await searchLeads(mercadoNome, 'fornecedores', 20);
      
      // Filtrar apenas empresas reais (remover artigos/notícias)
      const searchResults = filterRealCompanies(rawResults
        .filter(r => r.site) // Garantir que tem site
        .map(r => ({
          title: r.nome,
          link: r.site!,
          snippet: r.descricao,
        }))
      ).map((filtered) => ({
        nome: filtered.title,
        site: filtered.link,
        descricao: filtered.snippet,
      }));
      
      console.log(`[Filter] Leads após filtro: ${searchResults.length}/${rawResults.length}`);
      
      // Extrair nomes de empresas dos resultados do SerpAPI
      const leadsCandidatos = searchResults.map(result => ({
        nome: result.nome,
        tipo: 'B2B',
        regiao: 'Brasil',
        site: result.site,
        cnpj: undefined,
      }));
      
      const leadsFiltrados = filterDuplicates(
        leadsCandidatos,
        clientes, // Excluir empresas que são clientes
        concorrentes // Excluir empresas que são concorrentes
      );
      
      // Processar cada lead validado (aumentado para 20)
      for (const lead of leadsFiltrados.slice(0, 20)) {

        try {
          // Dados já vêm do SerpAPI (searchResults)
          const searchMatch = searchResults.find(r => 
            r.nome.toLowerCase().includes(lead.nome.toLowerCase()) ||
            lead.nome.toLowerCase().includes(r.nome.toLowerCase())
          );

          const enrichedData = {
            site: searchMatch?.site || null,
            descricao: searchMatch?.descricao || null,
          };

          // Calcular score de qualidade baseado em dados disponíveis
          const qualidadeScore = calculateQualityScore({
            cnpj: null,
            email: null,
            telefone: null,
            site: enrichedData.site,
            siteOficial: enrichedData.site,
            linkedin: null,
            instagram: null,
            produto: null,
            produtoPrincipal: null,
            cidade: null,
            uf: null,
            cnae: null,
            porte: null,
            faturamentoEstimado: null,
          });

          const qualidadeClassificacao =
            qualidadeScore >= 80
              ? 'Excelente'
              : qualidadeScore >= 60
                ? 'Bom'
                : qualidadeScore >= 40
                  ? 'Regular'
                  : 'Ruim';

          // Criar lead
          const novoLead = await createLead({
            projectId,
            mercadoId,
            nome: lead.nome,
            cnpj: null, // CNPJ será enriquecido posteriormente
            email: null,
            telefone: null,
            site: enrichedData.site || null,
            tipo: lead.tipo?.toLowerCase() as 'inbound' | 'outbound' | 'referral' || 'outbound',
            regiao: lead.regiao || 'Brasil',
            setor: mercadoNome,
            qualidadeScore,
            qualidadeClassificacao,
            validationStatus: 'pending',
          });

          if (novoLead) {
            leads.push(novoLead);
          }
        } catch (error) {
          console.error(`Erro ao criar lead ${lead.nome}:`, error);
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar leads para ${mercadoNome}:`, error);
    }
  }

  return leads;
}
