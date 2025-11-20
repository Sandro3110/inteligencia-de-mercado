/**
 * Schemas de validação Zod para entrada de dados
 * Fase 39.1 - Validação de Entrada de Dados
 */

import { z } from 'zod';

// ============================================
// SCHEMAS DE MERCADO
// ============================================

export const MercadoInputSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  
  descricao: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .trim()
    .optional(),
  
  segmentacao: z.enum(['B2B', 'B2C', 'B2B2C', 'B2G'], {
    message: 'Segmentação deve ser B2B, B2C, B2B2C ou B2G'
  }),
  
  categoria: z.string()
    .min(3, 'Categoria deve ter no mínimo 3 caracteres')
    .max(100, 'Categoria deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  tamanhoEstimado: z.string()
    .max(100, 'Tamanho estimado deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  tendenciaCrescimento: z.string()
    .max(100, 'Tendência deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  tags: z.array(z.string())
    .max(20, 'Máximo de 20 tags')
    .optional(),
});

export type MercadoInput = z.infer<typeof MercadoInputSchema>;

// ============================================
// SCHEMAS DE CLIENTE
// ============================================

export const ClienteInputSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  
  razaoSocial: z.string()
    .min(3, 'Razão social deve ter no mínimo 3 caracteres')
    .max(255, 'Razão social deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  
  cnpj: z.string()
    .regex(/^\d{14}$/, 'CNPJ deve conter exatamente 14 dígitos')
    .optional()
    .or(z.literal('')),
  
  site: z.string()
    .url('Site deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email('Email deve ser válido')
    .optional()
    .or(z.literal('')),
  
  telefone: z.string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
  
  endereco: z.string()
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  
  cidade: z.string()
    .min(2, 'Cidade deve ter no mínimo 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  estado: z.string()
    .length(2, 'Estado deve ter exatamente 2 caracteres (UF)')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser uma UF válida (ex: SP, RJ)')
    .optional(),
  
  cep: z.string()
    .regex(/^\d{8}$/, 'CEP deve conter exatamente 8 dígitos')
    .optional()
    .or(z.literal('')),
  
  porte: z.enum(['MEI', 'ME', 'EPP', 'Médio', 'Grande'], {
    message: 'Porte deve ser MEI, ME, EPP, Médio ou Grande'
  }).optional(),
  
  setor: z.string()
    .max(100, 'Setor deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  descricao: z.string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .trim()
    .optional(),
});

export type ClienteInput = z.infer<typeof ClienteInputSchema>;

// ============================================
// SCHEMAS DE LOTE (MÚLTIPLOS REGISTROS)
// ============================================

export const MercadoBatchSchema = z.object({
  mercados: z.array(MercadoInputSchema)
    .min(1, 'Deve haver pelo menos 1 mercado')
    .max(1000, 'Máximo de 1000 mercados por lote'),
});

export const ClienteBatchSchema = z.object({
  clientes: z.array(ClienteInputSchema)
    .min(1, 'Deve haver pelo menos 1 cliente')
    .max(1000, 'Máximo de 1000 clientes por lote'),
});

// ============================================
// SCHEMAS DE PESQUISA
// ============================================

export const PesquisaConfigSchema = z.object({
  nome: z.string()
    .min(3, 'Nome da pesquisa deve ter no mínimo 3 caracteres')
    .max(255, 'Nome da pesquisa deve ter no máximo 255 caracteres')
    .trim(),
  
  descricao: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim()
    .optional(),
  
  projectId: z.number()
    .int('ID do projeto deve ser um número inteiro')
    .positive('ID do projeto deve ser positivo'),
  
  qtdConcorrentesPorMercado: z.number()
    .int('Quantidade de concorrentes deve ser um número inteiro')
    .min(0, 'Quantidade de concorrentes deve ser no mínimo 0')
    .max(50, 'Quantidade de concorrentes deve ser no máximo 50')
    .default(5),
  
  qtdLeadsPorMercado: z.number()
    .int('Quantidade de leads deve ser um número inteiro')
    .min(0, 'Quantidade de leads deve ser no mínimo 0')
    .max(100, 'Quantidade de leads deve ser no máximo 100')
    .default(10),
  
  qtdProdutosPorCliente: z.number()
    .int('Quantidade de produtos deve ser um número inteiro')
    .min(0, 'Quantidade de produtos deve ser no mínimo 0')
    .max(20, 'Quantidade de produtos deve ser no máximo 20')
    .default(3),
});

export type PesquisaConfig = z.infer<typeof PesquisaConfigSchema>;

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export function validateMercado(data: unknown): ValidationResult<MercadoInput> {
  try {
    const validated = MercadoInputSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }]
    };
  }
}

export function validateCliente(data: unknown): ValidationResult<ClienteInput> {
  try {
    const validated = ClienteInputSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }]
    };
  }
}

export function validateMercadoBatch(data: unknown): ValidationResult<z.infer<typeof MercadoBatchSchema>> {
  try {
    const validated = MercadoBatchSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }]
    };
  }
}

export function validateClienteBatch(data: unknown): ValidationResult<z.infer<typeof ClienteBatchSchema>> {
  try {
    const validated = ClienteBatchSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }]
    };
  }
}

export function validatePesquisaConfig(data: unknown): ValidationResult<PesquisaConfig> {
  try {
    const validated = PesquisaConfigSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }]
    };
  }
}
