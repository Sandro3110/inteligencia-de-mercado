/**
 * Leads Router - Gerenciamento de Leads
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { leads } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const leadsRouter = createTRPCRouter({
  // Listar todos os leads (com filtro opcional por projeto, pesquisa ou mercado)
  list: publicProcedure
    .input(z.object({
      projectId: z.number().optional(),
      pesquisaId: z.number().optional(),
      mercadoId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = db.select().from(leads);
      
      if (input?.projectId) {
        query = query.where(eq(leads.projectId, input.projectId)) as any;
      }
      
      if (input?.pesquisaId) {
        query = query.where(eq(leads.pesquisaId, input.pesquisaId)) as any;
      }
      
      if (input?.mercadoId) {
        query = query.where(eq(leads.mercadoId, input.mercadoId)) as any;
      }
      
      return await query.orderBy(desc(leads.createdAt)).limit(100);
    }),

  // Buscar lead por ID
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const result = await db
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);
      
      return result[0] || null;
    }),

  // Criar novo lead
  create: publicProcedure
    .input(z.object({
      projectId: z.number(),
      pesquisaId: z.number().optional(),
      mercadoId: z.number(),
      nome: z.string(),
      cnpj: z.string().optional(),
      site: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      tipo: z.string().optional(),
      porte: z.string().optional(),
      regiao: z.string().optional(),
      setor: z.string().optional(),
      cidade: z.string().optional(),
      uf: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db
        .insert(leads)
        .values(input)
        .returning();
      
      return result[0];
    }),

  // Atualizar lead
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      cnpj: z.string().optional(),
      site: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      leadStage: z.string().optional(),
      validationStatus: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      
      const result = await db
        .update(leads)
        .set(data)
        .where(eq(leads.id, id))
        .returning();
      
      return result[0];
    }),

  // Deletar lead
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      await db
        .delete(leads)
        .where(eq(leads.id, id));
      
      return { success: true };
    }),
});
