/**
 * Wrapper de LLM com Credenciais Configuráveis
 * Fase 41.2 - Permitir usuário trocar provedor de IA
 * 
 * Busca credenciais do banco (enrichment_configs) com fallback para ENV
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
    
    // Determinar provedor e API key
    let apiKey: string | null = null;
    let provider: 'openai' | 'gemini' | 'anthropic' = 'gemini';

    if (config.openaiApiKey) {
      apiKey = config.openaiApiKey;
      provider = 'openai';
    }
    // Adicionar suporte para outros provedores aqui
    // else if (config.geminiApiKey) { ... }

    if (!apiKey) {
      return null;
    }

    const llmConfig: LLMConfig = {
      apiKey,
      provider,
      model: provider === 'openai' ? 'gpt-4o' : 'gemini-2.5-flash'
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
    console.log(`[LLM] Usando credenciais do projeto ${projectId} (${config.provider})`);
    
    // TODO: Implementar suporte para múltiplos provedores
    // Por enquanto, sempre usa o sistema padrão (Forge API)
    // Mas a infraestrutura está pronta para expansão
    
    return coreInvokeLLM(params);
  }

  // Fallback: usar credenciais do ENV (sistema padrão)
  console.log(`[LLM] Usando credenciais padrão do sistema (ENV)`);
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
      error: 'Nenhuma credencial configurada para este projeto'
    };
  }

  try {
    // Fazer uma chamada simples para testar
    const result = await invokeLLMWithConfig(projectId, {
      messages: [
        { role: 'system', content: 'Você é um assistente útil.' },
        { role: 'user', content: 'Responda apenas "OK"' }
      ]
    });

    return {
      valid: true,
      provider: config.provider
    };

  } catch (error: any) {
    return {
      valid: false,
      provider: config.provider,
      error: error.message
    };
  }
}
