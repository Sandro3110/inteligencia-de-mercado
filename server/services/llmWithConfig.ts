import { logger } from '@/lib/logger';

/**
 * Wrapper de LLM com Credenciais Configuráveis
 * Fase 41.2 - Permitir usuário trocar provedor de IA
 *
 * Busca credenciais do banco (enrichment_configs) com fallback para ENV
 * Suporta múltiplos provedores: OpenAI, Gemini, Anthropic
 */

import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { enrichmentConfigs } from '../../drizzle/schema';
import { invokeLLM as coreInvokeLLM, type InvokeParams, type InvokeResult } from '../_core/llm';

interface LLMConfig {
  apiKey: string;
  provider: 'openai' | 'gemini' | 'anthropic';
  model?: string;
}

/**
 * Cache de configurações por projeto (evita múltiplas queries)
 */
const configCache = new Map<number, LLMConfig>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cacheTimestamps = new Map<number, number>();

/**
 * Busca configuração de LLM para um projeto
 */
async function getLLMConfig(projectId: number): Promise<LLMConfig | null> {
  // Verificar cache
  const cached = configCache.get(projectId);
  const timestamp = cacheTimestamps.get(projectId);

  if (cached && timestamp && Date.now() - timestamp < CACHE_TTL) {
    return cached;
  }

  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(enrichmentConfigs)
      .where(eq(enrichmentConfigs.projectId, projectId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const config = result[0];

    // Determinar provedor e API key (prioridade: OpenAI > Gemini > Anthropic)
    let apiKey: string | null = null;
    let provider: 'openai' | 'gemini' | 'anthropic' = 'gemini';
    let model: string | undefined;

    if (config.openaiApiKey) {
      apiKey = config.openaiApiKey;
      provider = 'openai';
      model = 'gpt-4o';
    } else if (config.geminiApiKey) {
      apiKey = config.geminiApiKey;
      provider = 'gemini';
      model = 'gemini-2.5-flash';
    } else if (config.anthropicApiKey) {
      apiKey = config.anthropicApiKey;
      provider = 'anthropic';
      model = 'claude-3-5-sonnet-20241022';
    }

    if (!apiKey) {
      return null;
    }

    const llmConfig: LLMConfig = {
      apiKey,
      provider,
      model,
    };

    // Atualizar cache
    configCache.set(projectId, llmConfig);
    cacheTimestamps.set(projectId, Date.now());

    return llmConfig;
  } catch (error) {
    console.error('[LLMConfig] Erro ao buscar configuração:', error);
    return null;
  }
}

/**
 * Invoca OpenAI diretamente
 */
async function invokeOpenAI(apiKey: string, params: InvokeParams): Promise<InvokeResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model || 'gpt-4o',
      messages: params.messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens,
      tools: params.tools,
      tool_choice: params.tool_choice,
      response_format: params.response_format,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Invoca Gemini diretamente
 */
async function invokeGemini(apiKey: string, params: InvokeParams): Promise<InvokeResult> {
  const model = params.model || 'gemini-2.5-flash';

  // Converter formato OpenAI para Gemini
  const contents = params.messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      },
    ],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: params.temperature || 0.7,
          maxOutputTokens: params.max_tokens || 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();

  // Converter resposta Gemini para formato OpenAI
  return {
    id: 'gemini-' + Date.now(),
    object: 'chat.completion',
    created: Date.now(),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: result.candidates?.[0]?.content?.parts?.[0]?.text || '',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}

/**
 * Invoca Anthropic diretamente
 */
async function invokeAnthropic(apiKey: string, params: InvokeParams): Promise<InvokeResult> {
  const model = params.model || 'claude-3-5-sonnet-20241022';

  // Separar system message das outras mensagens
  const systemMessage = params.messages.find((m) => m.role === 'system');
  const messages = params.messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature || 0.7,
      system: systemMessage?.content,
      messages: messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API Error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();

  // Converter resposta Anthropic para formato OpenAI
  return {
    id: result.id,
    object: 'chat.completion',
    created: Date.now(),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: result.content?.[0]?.text || '',
        },
        finish_reason: result.stop_reason || 'stop',
      },
    ],
    usage: {
      prompt_tokens: result.usage?.input_tokens || 0,
      completion_tokens: result.usage?.output_tokens || 0,
      total_tokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
    },
  };
}

/**
 * Invoca LLM com credenciais configuráveis
 *
 * @param projectId - ID do projeto (para buscar credenciais)
 * @param params - Parâmetros do LLM
 * @returns Resultado da invocação
 */
export async function invokeLLMWithConfig(
  projectId: number,
  params: InvokeParams
): Promise<InvokeResult> {
  // Buscar configuração do projeto
  const config = await getLLMConfig(projectId);

  if (config) {
    logger.debug(`[LLM] Usando credenciais do projeto ${projectId} (${config.provider})`);

    try {
      // Invocar provedor específico
      switch (config.provider) {
        case 'openai':
          return await invokeOpenAI(config.apiKey, {
            ...params,
            model: params.model || config.model,
          });

        case 'gemini':
          return await invokeGemini(config.apiKey, {
            ...params,
            model: params.model || config.model,
          });

        case 'anthropic':
          return await invokeAnthropic(config.apiKey, {
            ...params,
            model: params.model || config.model,
          });

        default:
          console.warn(`[LLM] Provedor desconhecido: ${config.provider}, usando fallback`);
          return coreInvokeLLM(params);
      }
    } catch (error) {
      console.error(`[LLM] Erro ao invocar ${config.provider}:`, error);
      // Fallback para sistema padrão em caso de erro
      logger.debug(`[LLM] Usando fallback (sistema padrão)`);
      return coreInvokeLLM(params);
    }
  }

  // Fallback: usar credenciais do ENV (sistema padrão)
  logger.debug(`[LLM] Usando credenciais padrão do sistema (ENV)`);
  return coreInvokeLLM(params);
}

/**
 * Limpa cache de configurações (útil após atualizar credenciais)
 */
export function clearLLMConfigCache(projectId?: number) {
  if (projectId) {
    configCache.delete(projectId);
    cacheTimestamps.delete(projectId);
  } else {
    configCache.clear();
    cacheTimestamps.clear();
  }
}

/**
 * Valida se as credenciais de um projeto estão funcionando
 */
export async function validateLLMConfig(projectId: number): Promise<{
  valid: boolean;
  provider?: string;
  error?: string;
}> {
  const config = await getLLMConfig(projectId);

  if (!config) {
    return {
      valid: false,
      error: 'Nenhuma credencial configurada para este projeto',
    };
  }

  try {
    // Fazer uma chamada simples para testar
    const result = await invokeLLMWithConfig(projectId, {
      messages: [
        { role: 'system', content: 'Você é um assistente útil.' },
        { role: 'user', content: 'Responda apenas "OK"' },
      ],
    });

    return {
      valid: true,
      provider: config.provider,
    };
  } catch (error: unknown) {
    return {
      valid: false,
      provider: config.provider,
      // @ts-ignore - TODO: Fix TypeScript error
      error: error.message,
    };
  }
}

/**
 * Lista provedores disponíveis para um projeto
 */
export async function getAvailableProviders(projectId: number): Promise<
  {
    provider: 'openai' | 'gemini' | 'anthropic';
    configured: boolean;
    model?: string;
  }[]
> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db
      .select()
      .from(enrichmentConfigs)
      .where(eq(enrichmentConfigs.projectId, projectId))
      .limit(1);

    if (result.length === 0) {
      return [
        { provider: 'openai', configured: false },
        { provider: 'gemini', configured: false },
        { provider: 'anthropic', configured: false },
      ];
    }

    const config = result[0];

    return [
      {
        provider: 'openai',
        configured: !!config.openaiApiKey,
        model: 'gpt-4o',
      },
      {
        provider: 'gemini',
        configured: !!config.geminiApiKey,
        model: 'gemini-2.5-flash',
      },
      {
        provider: 'anthropic',
        configured: !!config.anthropicApiKey,
        model: 'claude-3-5-sonnet-20241022',
      },
    ];
  } catch (error) {
    console.error('[LLMConfig] Erro ao listar provedores:', error);
    return [];
  }
}
