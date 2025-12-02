// lib/openai.ts
import OpenAI from 'openai';

/**
 * Cliente OpenAI configurado
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Modelos disponíveis
 */
export const MODELS = {
  // Rápido e barato - para tarefas simples
  GPT_4O_MINI: 'gpt-4o-mini',
  
  // Potente - para análises complexas
  GPT_4O: 'gpt-4o',
  
  // Legacy (mais barato)
  GPT_35_TURBO: 'gpt-3.5-turbo',
} as const;

/**
 * Custos por modelo (por 1M tokens)
 */
export const MODEL_COSTS = {
  [MODELS.GPT_4O_MINI]: {
    input: 0.15,  // $0.15 por 1M tokens de input
    output: 0.60, // $0.60 por 1M tokens de output
  },
  [MODELS.GPT_4O]: {
    input: 2.50,
    output: 10.00,
  },
  [MODELS.GPT_35_TURBO]: {
    input: 0.50,
    output: 1.50,
  },
} as const;

/**
 * Calcular custo de uma chamada
 */
export function calculateCost(
  model: keyof typeof MODEL_COSTS,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model];
  
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  
  return inputCost + outputCost;
}

/**
 * Fazer chamada ao OpenAI com tracking
 */
export async function callOpenAI(params: {
  model: keyof typeof MODELS;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
}) {
  const {
    model,
    messages,
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat,
  } = params;

  const startTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: MODELS[model],
      messages: messages as any,
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat,
    });

    const duration = Date.now() - startTime;

    const usage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      cost: calculateCost(
        MODELS[model],
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      ),
      duration,
    };

    return {
      content: response.choices[0].message.content,
      usage,
      model: MODELS[model],
    };
  } catch (error: any) {
    console.error('[OpenAI Error]', error);
    throw new Error(`Erro ao chamar OpenAI: ${error.message}`);
  }
}
