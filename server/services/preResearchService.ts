/**
 * Serviço de Pré-Pesquisa Inteligente
 * Fase 40.1 - Integração ao Wizard
 * 
 * Centraliza toda a lógica de pré-pesquisa com IA para reutilização
 */

import { invokeLLM } from '../_core/llm';
import { invokeLLMWithConfig } from './llmWithConfig';

export interface PreResearchInput {
  prompt: string;
  tipo: 'mercado' | 'cliente';
  quantidade?: number;
  contextoAdicional?: string;
  projectId?: number; // FASE 41.2: Para buscar credenciais configuradas
}

export interface PreResearchResult {
  success: boolean;
  entidades: Array<{
    nome: string;
    descricao?: string;
    categoria?: string;
    segmentacao?: string;
    razaoSocial?: string;
    cnpj?: string;
    site?: string;
    email?: string;
    telefone?: string;
    cidade?: string;
    uf?: string;
    porte?: string;
  }>;
  perguntasRefinamento?: Array<{
    pergunta: string;
    opcoes: string[];
  }>;
  metadata: {
    totalEncontradas: number;
    tempoProcessamento: number;
    modeloUtilizado: string;
  };
}

/**
 * Executa pré-pesquisa com IA baseada em prompt em linguagem natural
 */
export async function executePreResearch(input: PreResearchInput): Promise<PreResearchResult> {
  const startTime = Date.now();

  try {
    const systemPrompt = buildSystemPrompt(input.tipo);
    const userPrompt = buildUserPrompt(input);

    // FASE 41.2: Usar credenciais configuráveis se projectId fornecido
    const llmFunction = input.projectId 
      ? (params: any) => invokeLLMWithConfig(input.projectId!, params)
      : invokeLLM;
    
    const response = await llmFunction({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'pre_research_result',
          strict: true,
          schema: buildResponseSchema(input.tipo)
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Resposta vazia ou inválida da IA');
    }

    const parsed = JSON.parse(content);
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      entidades: parsed.entidades || [],
      perguntasRefinamento: parsed.perguntas_refinamento,
      metadata: {
        totalEncontradas: parsed.entidades?.length || 0,
        tempoProcessamento: processingTime,
        modeloUtilizado: response.model
      }
    };

  } catch (error) {
    console.error('[PreResearch] Erro:', error);
    return {
      success: false,
      entidades: [],
      metadata: {
        totalEncontradas: 0,
        tempoProcessamento: Date.now() - startTime,
        modeloUtilizado: 'unknown'
      }
    };
  }
}

/**
 * Constrói o prompt do sistema baseado no tipo
 */
function buildSystemPrompt(tipo: 'mercado' | 'cliente'): string {
  if (tipo === 'mercado') {
    return `Você é um assistente especializado em identificar mercados e segmentos de negócio.

Sua tarefa é analisar o prompt do usuário e retornar uma lista de mercados relevantes.

Para cada mercado, forneça:
- nome: Nome claro e descritivo do mercado
- descricao: Breve descrição do mercado (1-2 frases)
- categoria: Categoria principal (ex: Indústria, Comércio, Serviços)
- segmentacao: Tipo de segmentação (B2B, B2C, B2B2C, B2G)

Além disso, se o prompt for vago ou amplo, sugira 2-3 perguntas de refinamento para ajudar o usuário a especificar melhor sua busca.

Retorne SEMPRE em formato JSON válido.`;
  } else {
    return `Você é um assistente especializado em identificar empresas e clientes potenciais.

Sua tarefa é analisar o prompt do usuário e retornar uma lista de empresas relevantes.

Para cada empresa, forneça o máximo de informações possível:
- nome: Nome fantasia ou razão social
- razaoSocial: Razão social completa (se disponível)
- cnpj: CNPJ (apenas números, se disponível)
- site: URL do site (se disponível)
- email: Email de contato (se disponível)
- telefone: Telefone (se disponível)
- cidade: Cidade (se disponível)
- uf: Estado (sigla, se disponível)
- porte: Porte da empresa (MEI, ME, EPP, Médio, Grande)
- segmentacao: Tipo de negócio (B2B, B2C, B2B2C, B2G)

Se o prompt for vago, sugira perguntas de refinamento.

Retorne SEMPRE em formato JSON válido.`;
  }
}

/**
 * Constrói o prompt do usuário
 */
function buildUserPrompt(input: PreResearchInput): string {
  let prompt = input.prompt;

  if (input.quantidade) {
    prompt += `\n\nRetorne até ${input.quantidade} resultados.`;
  }

  if (input.contextoAdicional) {
    prompt += `\n\nContexto adicional: ${input.contextoAdicional}`;
  }

  return prompt;
}

/**
 * Constrói o schema de resposta JSON
 */
function buildResponseSchema(tipo: 'mercado' | 'cliente'): any {
  if (tipo === 'mercado') {
    return {
      type: 'object',
      properties: {
        entidades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nome: { type: 'string' },
              descricao: { type: 'string' },
              categoria: { type: 'string' },
              segmentacao: { type: 'string', enum: ['B2B', 'B2C', 'B2B2C', 'B2G'] }
            },
            required: ['nome', 'descricao', 'segmentacao'],
            additionalProperties: false
          }
        },
        perguntas_refinamento: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pergunta: { type: 'string' },
              opcoes: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['pergunta', 'opcoes'],
            additionalProperties: false
          }
        }
      },
      required: ['entidades'],
      additionalProperties: false
    };
  } else {
    return {
      type: 'object',
      properties: {
        entidades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nome: { type: 'string' },
              razaoSocial: { type: 'string' },
              cnpj: { type: 'string' },
              site: { type: 'string' },
              email: { type: 'string' },
              telefone: { type: 'string' },
              cidade: { type: 'string' },
              uf: { type: 'string' },
              porte: { type: 'string', enum: ['MEI', 'ME', 'EPP', 'Médio', 'Grande'] },
              segmentacao: { type: 'string', enum: ['B2B', 'B2C', 'B2B2C', 'B2G'] }
            },
            required: ['nome'],
            additionalProperties: false
          }
        },
        perguntas_refinamento: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pergunta: { type: 'string' },
              opcoes: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['pergunta', 'opcoes'],
            additionalProperties: false
          }
        }
      },
      required: ['entidades'],
      additionalProperties: false
    };
  }
}

/**
 * Executa retry inteligente para melhorar completude dos dados
 */
export async function retryWithImprovement(
  entidade: any,
  tipo: 'mercado' | 'cliente',
  maxRetries: number = 2
): Promise<any> {
  let currentData = { ...entidade };
  let retryCount = 0;

  while (retryCount < maxRetries) {
    const camposFaltantes = identifyMissingFields(currentData, tipo);
    
    if (camposFaltantes.length === 0) {
      break; // Dados completos
    }

    retryCount++;

    try {
      const improvedData = await requestMissingFields(currentData, camposFaltantes, tipo);
      currentData = { ...currentData, ...improvedData };
    } catch (error) {
      console.error(`[Retry ${retryCount}] Erro:`, error);
      break;
    }
  }

  return currentData;
}

/**
 * Identifica campos faltantes
 */
function identifyMissingFields(data: any, tipo: 'mercado' | 'cliente'): string[] {
  const missing: string[] = [];

  if (tipo === 'mercado') {
    if (!data.descricao) missing.push('descricao');
    if (!data.categoria) missing.push('categoria');
    if (!data.segmentacao) missing.push('segmentacao');
  } else {
    if (!data.razaoSocial) missing.push('razaoSocial');
    if (!data.cnpj) missing.push('cnpj');
    if (!data.site) missing.push('site');
    if (!data.email) missing.push('email');
    if (!data.telefone) missing.push('telefone');
    if (!data.cidade) missing.push('cidade');
    if (!data.uf) missing.push('uf');
    if (!data.porte) missing.push('porte');
  }

  return missing;
}

/**
 * Solicita campos faltantes via IA
 */
async function requestMissingFields(
  data: any,
  camposFaltantes: string[],
  tipo: 'mercado' | 'cliente'
): Promise<any> {
  const prompt = `Complete os seguintes campos faltantes para ${tipo === 'mercado' ? 'o mercado' : 'a empresa'} "${data.nome}":

Campos faltantes: ${camposFaltantes.join(', ')}

Dados atuais: ${JSON.stringify(data, null, 2)}

Retorne APENAS os campos faltantes em formato JSON.`;

  // Usar invokeLLM padrão para retry (sem projectId disponível aqui)
  const response = await invokeLLM({
    messages: [
      { role: 'system', content: 'Você é um assistente que completa informações faltantes sobre empresas e mercados.' },
      { role: 'user', content: prompt }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    return {};
  }

  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}
