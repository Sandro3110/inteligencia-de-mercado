/**
 * Serviço de Enriquecimento de Dados
 * Processa clientes, identifica mercados, concorrentes e leads
 */

import { callDataApi } from './_core/dataApi';
import { invokeLLM } from './_core/llm';
import { calculateQualityScore, classifyQuality } from '../shared/qualityScore';
import type { Cliente, MercadoUnico, Concorrente, Lead } from '../drizzle/schema';

// ============================================
// TIPOS
// ============================================

export interface EnrichmentInput {
  clientes: Array<{
    nome: string;
    cnpj?: string;
    site?: string;
    email?: string;
    telefone?: string;
    cidade?: string;
    uf?: string;
  }>;
  projectName: string;
  projectDescription?: string;
}

export interface EnrichmentProgress {
  stage: 'validating' | 'enriching_clients' | 'identifying_markets' | 'finding_competitors' | 'generating_leads' | 'completed' | 'error';
  currentStep: number;
  totalSteps: number;
  message: string;
  processedItems: number;
  totalItems: number;
}

export interface EnrichmentResult {
  projectId: number;
  mercados: MercadoUnico[];
  clientes: Cliente[];
  concorrentes: Concorrente[];
  leads: Lead[];
  stats: {
    totalMercados: number;
    totalClientes: number;
    totalConcorrentes: number;
    totalLeads: number;
    avgQualityScore: number;
  };
}

// ============================================
// ENRIQUECIMENTO VIA CNPJ
// ============================================

export async function enrichClientByCNPJ(cnpj: string): Promise<Partial<Cliente> | null> {
  if (!cnpj || cnpj.trim() === '') return null;

  try {
    // Limpar CNPJ (remover caracteres especiais)
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) {
      console.warn(`[Enrichment] CNPJ inválido: ${cnpj}`);
      return null;
    }

    // Chamar API de dados (exemplo: ReceitaWS ou similar)
    const data = await callDataApi('cnpj-lookup', { query: { cnpj: cleanCNPJ } });

    if (!data || typeof data !== 'object') {
      return null;
    }

    const empresaData = data as any;

    return {
      nome: empresaData.razao_social || empresaData.nome,
      cnpj: cleanCNPJ,
      siteOficial: empresaData.site || null,
      email: empresaData.email || null,
      telefone: empresaData.telefone || null,
      cidade: empresaData.municipio || null,
      uf: empresaData.uf || null,
      cnae: empresaData.cnae_fiscal || null,
    };
  } catch (error) {
    console.error(`[Enrichment] Erro ao enriquecer CNPJ ${cnpj}:`, error);
    return null;
  }
}

// ============================================
// IDENTIFICAÇÃO DE MERCADO VIA LLM
// ============================================

export async function identifyMarketForClient(cliente: Partial<Cliente>): Promise<{
  mercadoNome: string;
  categoria: string;
  segmentacao: string;
  tamanhoEstimado: string;
}> {
  try {
    const prompt = `Analise esta empresa e identifique o mercado principal:

Empresa: ${cliente.nome}
CNAE: ${cliente.cnae || 'não informado'}
Produto: ${cliente.produtoPrincipal || 'não informado'}
Site: ${cliente.siteOficial || 'não informado'}

Retorne um JSON com:
- mercadoNome: nome descritivo do mercado (ex: "Indústria de Embalagens Plásticas")
- categoria: categoria industrial (ex: "Manufatura", "Serviços", "Comércio")
- segmentacao: tipo de negócio ("B2B", "B2C" ou "B2B2C")
- tamanhoEstimado: estimativa de tamanho ("Pequeno", "Médio" ou "Grande")`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Você é um analista de mercado especializado em classificação de empresas e identificação de mercados.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'market_identification',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              mercadoNome: { type: 'string' },
              categoria: { type: 'string' },
              segmentacao: { type: 'string', enum: ['B2B', 'B2C', 'B2B2C'] },
              tamanhoEstimado: { type: 'string', enum: ['Pequeno', 'Médio', 'Grande'] }
            },
            required: ['mercadoNome', 'categoria', 'segmentacao', 'tamanhoEstimado'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Resposta vazia da LLM');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('[Enrichment] Erro ao identificar mercado:', error);
    
    // Fallback: retornar mercado genérico
    return {
      mercadoNome: 'Mercado Geral',
      categoria: 'Não Classificado',
      segmentacao: 'B2B',
      tamanhoEstimado: 'Médio'
    };
  }
}

// ============================================
// IDENTIFICAÇÃO DE CONCORRENTES
// ============================================

export async function findCompetitors(
  mercadoNome: string,
  cnae: string | null,
  limit: number = 10
): Promise<Array<Partial<Concorrente>>> {
  try {
    const prompt = `Liste ${limit} principais concorrentes do mercado "${mercadoNome}" ${cnae ? `(CNAE: ${cnae})` : ''}.

Para cada concorrente, retorne:
- nome: nome da empresa
- produto: produto ou serviço principal
- porte: "MEI", "Pequena", "Média" ou "Grande"

Retorne apenas empresas reais e conhecidas no mercado brasileiro.`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Você é um analista de mercado com conhecimento profundo sobre empresas brasileiras.' },
        { role: 'user', content: prompt }
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
                    porte: { type: 'string', enum: ['MEI', 'Pequena', 'Média', 'Grande'] }
                  },
                  required: ['nome', 'produto', 'porte'],
                  additionalProperties: false
                }
              }
            },
            required: ['concorrentes'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.concorrentes.map((c: any) => ({
      nome: c.nome,
      produto: c.produto,
      porte: c.porte as any,
      validationStatus: 'pending' as any
    }));
  } catch (error) {
    console.error('[Enrichment] Erro ao buscar concorrentes:', error);
    return [];
  }
}

// ============================================
// GERAÇÃO DE LEADS
// ============================================

export async function generateLeads(
  mercadoNome: string,
  segmentacao: string,
  limit: number = 20
): Promise<Array<Partial<Lead>>> {
  try {
    const prompt = `Gere ${limit} leads potenciais para o mercado "${mercadoNome}" (segmentação: ${segmentacao}).

Para cada lead, retorne:
- nome: nome da empresa potencial
- tipo: "inbound", "outbound" ou "referral"
- porte: "MEI", "Pequena", "Média" ou "Grande"
- regiao: região do Brasil (ex: "Sudeste", "Sul", "Nordeste")
- setor: setor específico de atuação

Priorize empresas que sejam bons prospects para este mercado.`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Você é um especialista em geração de leads B2B no mercado brasileiro.' },
        { role: 'user', content: prompt }
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
                    tipo: { type: 'string', enum: ['inbound', 'outbound', 'referral'] },
                    porte: { type: 'string', enum: ['MEI', 'Pequena', 'Média', 'Grande'] },
                    regiao: { type: 'string' },
                    setor: { type: 'string' }
                  },
                  required: ['nome', 'tipo', 'porte', 'regiao', 'setor'],
                  additionalProperties: false
                }
              }
            },
            required: ['leads'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.leads.map((l: any) => ({
      nome: l.nome,
      tipo: l.tipo as any,
      porte: l.porte as any,
      regiao: l.regiao,
      setor: l.setor,
      validationStatus: 'pending' as any,
      stage: 'new' as any
    }));
  } catch (error) {
    console.error('[Enrichment] Erro ao gerar leads:', error);
    return [];
  }
}

// ============================================
// ORQUESTRADOR DO FLUXO COMPLETO
// ============================================

export async function processEnrichmentFlow(
  input: EnrichmentInput,
  onProgress?: (progress: EnrichmentProgress) => void
): Promise<EnrichmentResult> {
  const totalSteps = 5;
  let currentStep = 0;

  const updateProgress = (stage: EnrichmentProgress['stage'], message: string, processedItems: number = 0, totalItems: number = 0) => {
    currentStep++;
    if (onProgress) {
      onProgress({
        stage,
        currentStep,
        totalSteps,
        message,
        processedItems,
        totalItems
      });
    }
  };

  try {
    // Importar funções do db.ts
    const { createProject, createMercado, createCliente, createConcorrente, createLead, associateClienteToMercado } = await import('./db');

    // Etapa 1: Validar entrada
    updateProgress('validating', 'Validando dados de entrada...', 0, input.clientes.length);
    
    if (!input.clientes || input.clientes.length === 0) {
      throw new Error('Nenhum cliente fornecido');
    }

    // Etapa 2: Criar projeto
    const project = await createProject({
      nome: input.projectName,
      descricao: input.projectDescription || `Projeto criado automaticamente com ${input.clientes.length} clientes`,
      cor: '#' + Math.floor(Math.random()*16777215).toString(16), // Cor aleatória
    });

    if (!project) {
      throw new Error('Falha ao criar projeto');
    }

    const projectId = project.id;

    // Etapa 3: Enriquecer clientes
    updateProgress('enriching_clients', 'Enriquecendo dados dos clientes...', 0, input.clientes.length);
    
    const enrichedClientes: Cliente[] = [];
    const mercadosMap = new Map<string, number>(); // mercadoNome -> mercadoId

    for (let i = 0; i < input.clientes.length; i++) {
      const clienteInput = input.clientes[i];
      
      // Enriquecer via CNPJ se disponível
      let enrichedData: Partial<Cliente> = { ...clienteInput };
      
      if (clienteInput.cnpj) {
        const cnpjData = await enrichClientByCNPJ(clienteInput.cnpj);
        if (cnpjData) {
          enrichedData = { ...enrichedData, ...cnpjData };
        }
      }

      // Calcular score de qualidade
      const qualidadeScore = calculateQualityScore(enrichedData);
      const { label: qualidadeClassificacao } = classifyQuality(qualidadeScore);

      // Criar cliente no banco
      const cliente = await createCliente({
        projectId,
        nome: enrichedData.nome!,
        cnpj: enrichedData.cnpj || null,
        siteOficial: (enrichedData as any).site || enrichedData.siteOficial || null,
        email: enrichedData.email || null,
        telefone: enrichedData.telefone || null,
        cidade: enrichedData.cidade || null,
        uf: enrichedData.uf || null,
        cnae: enrichedData.cnae || null,
        qualidadeScore,
        qualidadeClassificacao,
        validationStatus: qualidadeScore >= 60 ? 'rich' : 'pending',
      });

      if (cliente) {
        enrichedClientes.push(cliente);
      }

      updateProgress('enriching_clients', `Enriquecendo clientes... (${i + 1}/${input.clientes.length})`, i + 1, input.clientes.length);
    }

    // Etapa 4: Identificar mercados
    updateProgress('identifying_markets', 'Identificando mercados...', 0, enrichedClientes.length);
    
    for (let i = 0; i < enrichedClientes.length; i++) {
      const cliente = enrichedClientes[i];
      
      const marketInfo = await identifyMarketForClient(cliente);
      
      // Verificar se mercado já existe
      if (!mercadosMap.has(marketInfo.mercadoNome)) {
        const mercado = await createMercado({
          projectId,
          nome: marketInfo.mercadoNome,
          categoria: marketInfo.categoria,
          segmentacao: marketInfo.segmentacao as any,
          tamanhoMercado: marketInfo.tamanhoEstimado,
          quantidadeClientes: 0,
        });

        if (mercado) {
          mercadosMap.set(marketInfo.mercadoNome, mercado.id);
        }
      }

      // Associar cliente ao mercado
      const mercadoId = mercadosMap.get(marketInfo.mercadoNome);
      if (mercadoId) {
        await associateClienteToMercado(cliente.id, mercadoId);
      }

      updateProgress('identifying_markets', `Identificando mercados... (${i + 1}/${enrichedClientes.length})`, i + 1, enrichedClientes.length);
    }

    // Etapa 5: Buscar concorrentes
    updateProgress('finding_competitors', 'Buscando concorrentes...', 0, mercadosMap.size);
    
    const allConcorrentes: Concorrente[] = [];
    let mercadoIndex = 0;

    for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
      const competitorsData = await findCompetitors(mercadoNome, null, 5);
      
      for (const compData of competitorsData) {
        const qualidadeScore = calculateQualityScore(compData);
        const { label: qualidadeClassificacao } = classifyQuality(qualidadeScore);

        const concorrente = await createConcorrente({
          projectId,
          mercadoId,
          nome: compData.nome!,
          produto: compData.produto || null,
          porte: compData.porte as any,
          qualidadeScore,
          qualidadeClassificacao,
          validationStatus: 'pending',
        });

        if (concorrente) {
          allConcorrentes.push(concorrente);
        }
      }

      mercadoIndex++;
      updateProgress('finding_competitors', `Buscando concorrentes... (${mercadoIndex}/${mercadosMap.size})`, mercadoIndex, mercadosMap.size);
    }

    // Etapa 6: Gerar leads
    updateProgress('generating_leads', 'Gerando leads...', 0, mercadosMap.size);
    
    const allLeads: Lead[] = [];
    mercadoIndex = 0;

    for (const [mercadoNome, mercadoId] of Array.from(mercadosMap.entries())) {
      // Buscar segmentação do mercado
      const { getMercadoById } = await import('./db');
      const mercado = await getMercadoById(mercadoId);
      const segmentacao = mercado?.segmentacao || 'B2B';

      const leadsData = await generateLeads(mercadoNome, segmentacao, 10);
      
      for (const leadData of leadsData) {
        const qualidadeScore = calculateQualityScore(leadData);
        const { label: qualidadeClassificacao } = classifyQuality(qualidadeScore);

        const lead = await createLead({
          projectId,
          mercadoId,
          nome: leadData.nome!,
          tipo: leadData.tipo as any,
          porte: leadData.porte as any,
          regiao: leadData.regiao || null,
          setor: leadData.setor || null,
          qualidadeScore,
          qualidadeClassificacao,
          validationStatus: 'pending',
          stage: 'novo',
        });

        if (lead) {
          allLeads.push(lead);
        }
      }

      mercadoIndex++;
      updateProgress('generating_leads', `Gerando leads... (${mercadoIndex}/${mercadosMap.size})`, mercadoIndex, mercadosMap.size);
    }

    // Etapa 7: Concluído
    updateProgress('completed', 'Processamento concluído!', mercadosMap.size, mercadosMap.size);

    // Calcular estatísticas
    const avgQualityScore = Math.round(
      (enrichedClientes.reduce((sum, c) => sum + ((c as any).qualidadeScore || 0), 0) / enrichedClientes.length)
    );

    // Buscar mercados criados
    const { getMercados } = await import('./db');
    const mercados = await getMercados({ projectId });

    return {
      projectId,
      mercados: mercados as MercadoUnico[],
      clientes: enrichedClientes,
      concorrentes: allConcorrentes,
      leads: allLeads,
      stats: {
        totalMercados: mercadosMap.size,
        totalClientes: enrichedClientes.length,
        totalConcorrentes: allConcorrentes.length,
        totalLeads: allLeads.length,
        avgQualityScore
      }
    };

  } catch (error) {
    updateProgress('error', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 0, 0);
    throw error;
  }
}
