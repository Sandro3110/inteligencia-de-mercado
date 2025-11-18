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
  onProgress: ProgressCallback
): Promise<EnrichmentProgress> {
  try {
    const totalSteps = 7;
    let currentStep = 0;

    // Passo 1: Criar projeto
    onProgress({
      status: 'processing',
      message: `Criando projeto "${input.projectName}"...`,
      currentStep: ++currentStep,
      totalSteps,
    });

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
      project.id
    );

    // Passo 5: Buscar leads
    onProgress({
      status: 'processing',
      message: 'Buscando leads qualificados...',
      currentStep: ++currentStep,
      totalSteps,
    });

    const leadsEncontrados = await findLeadsForMarkets(mercadosMap, project.id);

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

    return {
      status: 'completed',
      message: 'Processamento concluído!',
      currentStep: totalSteps,
      totalSteps,
      data: {
        projectId: project.id,
        mercadosCount: mercadosMap.size,
        clientesCount: clientesEnriquecidos.length,
        concorrentesCount: concorrentes.length,
        leadsCount: leadsEncontrados.length,
        avgQualityScore,
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

  const enriched = [];

  for (const cliente of clientes) {
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

    // Calcular score de qualidade
    const qualidadeScore = calculateQualityScore(cliente);
    const qualidadeClassificacao =
      qualidadeScore >= 80
        ? 'Excelente'
        : qualidadeScore >= 60
          ? 'Bom'
          : qualidadeScore >= 40
            ? 'Regular'
            : 'Ruim';

    // Criar cliente
    const novoCliente = await createCliente({
      projectId,
      nome: cliente.nome,
      cnpj: cliente.cnpj || null,
      siteOficial: cliente.site || null,
      produtoPrincipal: cliente.produto || null,
      qualidadeScore,
      qualidadeClassificacao,
      validationStatus: 'pending',
    });

    if (novoCliente && mercadoId) {
      await associateClienteToMercado(novoCliente.id, mercadoId);
      enriched.push({ ...novoCliente, qualidadeScore });
    }
  }

  return enriched;
}

/**
 * Busca concorrentes para cada mercado
 */
async function findCompetitorsForMarkets(
  mercadosMap: Map<string, number>,
  projectId: number
) {
  const { invokeLLM } = await import('./_core/llm');
  const { callDataApi } = await import('./_core/dataApi');
  const { createConcorrente } = await import('./db');
  const concorrentes: any[] = [];

  for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
    try {
      // Usar LLM para gerar lista de concorrentes
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de mercado. Liste empresas concorrentes no mercado especificado.',
          },
          {
            role: 'user',
            content: `Mercado: ${mercadoNome}\n\nListe 5 principais empresas concorrentes neste mercado no Brasil. Retorne JSON com: { "concorrentes": [{ "nome": "Nome da empresa", "produto": "Produto principal" }] }`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'competitors_list',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                concorrentes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      nome: { type: 'string' },
                      produto: { type: 'string' },
                    },
                    required: ['nome', 'produto'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['concorrentes'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') continue;

      const data = JSON.parse(content);

      // Processar cada concorrente
      for (const comp of data.concorrentes.slice(0, 3)) { // Limitar a 3 por mercado
        try {
          // Tentar enriquecer via Data API (busca por nome)
          let enrichedData: any = {};
          try {
            const apiResult = await callDataApi(comp.nome);
            if (apiResult) {
              enrichedData = apiResult;
            }
          } catch (e) {
            // Ignorar erro de API e usar apenas dados do LLM
          }

          // Calcular score de qualidade
          const qualidadeScore = calculateQualityScore({
            cnpj: enrichedData.cnpj,
            email: null,
            telefone: null,
            site: enrichedData.site,
            siteOficial: null,
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
            cnpj: enrichedData.cnpj || null,
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
 * Busca leads para cada mercado
 */
async function findLeadsForMarkets(
  mercadosMap: Map<string, number>,
  projectId: number
) {
  const { invokeLLM } = await import('./_core/llm');
  const { callDataApi } = await import('./_core/dataApi');
  const { createLead } = await import('./db');
  const leads: any[] = [];

  for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
    try {
      // Usar LLM para gerar lista de leads potenciais
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em geração de leads B2B. Identifique empresas que podem ser leads qualificados.',
          },
          {
            role: 'user',
            content: `Mercado: ${mercadoNome}\n\nListe 5 empresas que seriam leads qualificados para este mercado no Brasil. Retorne JSON com: { "leads": [{ "nome": "Nome da empresa", "tipo": "B2B ou B2C", "regiao": "Região" }] }`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'leads_list',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                leads: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      nome: { type: 'string' },
                      tipo: { type: 'string' },
                      regiao: { type: 'string' },
                    },
                    required: ['nome', 'tipo', 'regiao'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['leads'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') continue;

      const data = JSON.parse(content);

      // Processar cada lead
      for (const lead of data.leads.slice(0, 3)) { // Limitar a 3 por mercado
        try {
          // Tentar enriquecer via Data API
          let enrichedData: any = {};
          try {
            const apiResult = await callDataApi(lead.nome);
            if (apiResult) {
              enrichedData = apiResult;
            }
          } catch (e) {
            // Ignorar erro de API
          }

          // Calcular score de qualidade
          const qualidadeScore = calculateQualityScore({
            cnpj: enrichedData.cnpj,
            email: enrichedData.email,
            telefone: enrichedData.telefone,
            site: enrichedData.site,
            siteOficial: null,
            linkedin: null,
            instagram: null,
            produto: null,
            produtoPrincipal: null,
            cidade: enrichedData.cidade,
            uf: enrichedData.uf,
            cnae: null,
            porte: enrichedData.porte,
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
            cnpj: enrichedData.cnpj || null,
            email: enrichedData.email || null,
            telefone: enrichedData.telefone || null,
            site: enrichedData.site || null,
            tipo: lead.tipo, // Aceita qualquer string
            regiao: lead.regiao,
            setor: null,
            stage: 'novo',
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
