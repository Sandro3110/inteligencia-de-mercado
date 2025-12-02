import { z } from 'zod';

/**
 * Schema de validação para criação de pesquisas
 */
export const pesquisaSchema = z.object({
  projeto_id: z
    .number({
      required_error: 'Projeto é obrigatório',
      invalid_type_error: 'Selecione um projeto válido'
    })
    .positive('Selecione um projeto'),
  
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),
  
  descricao: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  tipo: z
    .enum(['clientes', 'concorrentes', 'leads', 'fornecedores', 'outros'])
    .default('clientes'),
  
  filtros: z
    .object({
      mercado: z.string().optional(),
      regiao: z.string().optional(),
      estado: z.string().optional(),
      cidade: z.string().optional(),
      porte: z.string().optional(),
      faturamento_min: z.number().optional(),
      faturamento_max: z.number().optional(),
    })
    .optional(),
  
  limite_resultados: z
    .number()
    .min(1, 'Mínimo 1 resultado')
    .max(10000, 'Máximo 10.000 resultados')
    .default(1000),
});

export type PesquisaFormData = z.infer<typeof pesquisaSchema>;
