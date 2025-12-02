import { z } from 'zod';

/**
 * Schema de validação para criação de projetos
 */
export const projetoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  codigo: z
    .string()
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífen')
    .min(2, 'Código deve ter no mínimo 2 caracteres')
    .max(20, 'Código deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  centro_custo: z
    .string()
    .max(50, 'Centro de custo deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),
  
  status: z
    .enum(['ativo', 'inativo', 'arquivado'])
    .default('ativo'),
});

export type ProjetoFormData = z.infer<typeof projetoSchema>;
