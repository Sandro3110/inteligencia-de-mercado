import { z } from 'zod';

/**
 * Schema Zod para Admin LLM
 */
export const adminLLMSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  apiKey: z.string()
    .min(10, 'API Key deve ter pelo menos 10 caracteres')
    .max(500, 'API Key muito longa')
    .regex(/^[a-zA-Z0-9_-]+$/, 'API Key contém caracteres inválidos'),
  model: z.string()
    .min(1, 'Modelo é obrigatório')
    .max(100, 'Nome do modelo muito longo')
    .optional(),
  temperature: z.number()
    .min(0, 'Temperatura mínima é 0')
    .max(2, 'Temperatura máxima é 2')
    .optional()
    .default(0.7),
  maxTokens: z.number()
    .min(1, 'Máximo de tokens deve ser pelo menos 1')
    .max(100000, 'Máximo de tokens muito alto')
    .optional()
    .default(4000)
});

export type AdminLLMFormData = z.infer<typeof adminLLMSchema>;

/**
 * Schema Zod para Intelligent Alerts
 */
export const intelligentAlertsSchema = z.object({
  type: z.enum(['circuit_breaker', 'error_rate', 'processing_time', 'completion']),
  threshold: z.number()
    .min(0, 'Threshold deve ser positivo')
    .max(100, 'Threshold máximo é 100'),
  enabled: z.boolean()
    .default(true),
  cooldownMinutes: z.number()
    .min(1, 'Cooldown mínimo é 1 minuto')
    .max(1440, 'Cooldown máximo é 24 horas')
    .optional()
    .default(5),
  notifyEmail: z.string()
    .email('Email inválido')
    .optional(),
  notifySlack: z.string()
    .url('URL do Slack inválida')
    .optional(),
  description: z.string()
    .max(500, 'Descrição muito longa')
    .optional()
});

export type IntelligentAlertsFormData = z.infer<typeof intelligentAlertsSchema>;

/**
 * Mensagens de erro amigáveis
 */
export const errorMessages = {
  adminLLM: {
    provider: 'Por favor, selecione um provedor de LLM (OpenAI, Gemini ou Anthropic)',
    apiKey: 'A API Key deve ter entre 10 e 500 caracteres e conter apenas letras, números, hífens e underscores',
    model: 'O nome do modelo é obrigatório e deve ter no máximo 100 caracteres',
    temperature: 'A temperatura deve estar entre 0 e 2',
    maxTokens: 'O máximo de tokens deve estar entre 1 e 100.000'
  },
  intelligentAlerts: {
    type: 'Por favor, selecione um tipo de alerta válido',
    threshold: 'O threshold deve ser um número entre 0 e 100',
    enabled: 'O campo "ativo" deve ser verdadeiro ou falso',
    cooldownMinutes: 'O cooldown deve estar entre 1 minuto e 24 horas (1440 minutos)',
    notifyEmail: 'Por favor, insira um email válido',
    notifySlack: 'Por favor, insira uma URL válida do Slack',
    description: 'A descrição deve ter no máximo 500 caracteres'
  }
};
