import { logger } from '@/lib/logger';

/**
 * Módulo OpenAI - ChatGPT-4o-mini
 * Cliente direto para API do OpenAI
 */

import type { Message, InvokeResult, ResponseFormat, Tool, ToolChoice } from './llm';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Invoca ChatGPT-4o-mini via API do OpenAI
 */
export async function invokeOpenAI(params: {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: ResponseFormat;
  tools?: Tool[];
  tool_choice?: ToolChoice;
}): Promise<InvokeResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const {
    messages,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens,
    response_format,
    tools,
    tool_choice,
  } = params;

  // Normalizar mensagens para formato OpenAI
  const normalizedMessages = messages.map((msg) => {
    if (typeof msg.content === 'string') {
      return {
        role: msg.role,
        content: msg.content,
      };
    }

    // Suporte a conteúdo multimodal
    return {
      role: msg.role,
      content: Array.isArray(msg.content)
        ? msg.content.map((part) => {
            if (typeof part === 'string') {
              return { type: 'text', text: part };
            }
            return part;
          })
        : msg.content,
    };
  });

  const payload: Record<string, unknown> = {
    model,
    messages: normalizedMessages,
    temperature,
  };

  if (max_tokens) {
    payload.max_tokens = max_tokens;
  }

  if (response_format) {
    payload.response_format = response_format;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  if (tool_choice) {
    payload.tool_choice = tool_choice;
  }

  try {
    logger.debug(`[OpenAI] Chamando ${model}...`);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API retornou ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    logger.debug(`[OpenAI] Resposta recebida (${data.usage?.total_tokens || 0} tokens)`);

    return data as InvokeResult;
  } catch (error) {
    console.error('[OpenAI] Erro na chamada:', error);
    throw error;
  }
}

/**
 * Testa conexão com OpenAI
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const result = await invokeOpenAI({
      messages: [{ role: 'user', content: 'Responda apenas: OK' }],
      max_tokens: 10,
    });

    const content = result.choices[0]?.message?.content;
    logger.debug('[OpenAI] Conexão OK:', { content });
    return true;
  } catch (error) {
    console.error('[OpenAI] Falha na conexão:', error);
    return false;
  }
}
