/**
 * Leads Router - Refatorado completamente
 * Gerenciamento completo de Leads com filtros e paginação
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { leads } from '@/drizzle/schema';
import { eq, and, desc, count, or, like } from 'drizzle-orm';

export const leadsRouter = createTRPCRouter({
  /**
   * Listar leads com filtros e paginação
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        pesquisaId: z.number().optional(),
        mercadoId: z.number().optional(),
        search: z.string().optional(),
        leadStage: z.string().optional(),
        validationStatus: z.string().optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const conditions = [];

        if (input?.projectId) {
          conditions.push(eq(leads.projectId, input.projectId));
        }

        if (input?.pesquisaId) {
          conditions.push(eq(leads.pesquisaId, input.pesquisaId));
        }

        if (input?.mercadoId) {
          conditions.push(eq(leads.mercadoId, input.mercadoId));
        }

        if (input?.leadStage) {
          conditions.push(eq(leads.leadStage, input.leadStage));
        }

        if (input?.validationStatus) {
          conditions.push(eq(leads.validationStatus, input.validationStatus));
        }

        if (input?.search) {
          conditions.push(
            or(
              like(leads.nome, `%${input.search}%`),
              like(leads.cnpj, `%${input.search}%`),
              like(leads.email, `%${input.search}%`)
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [items, totalResult] = await Promise.all([
          db
            .select()
            .from(leads)
            .where(whereClause)
            .orderBy(desc(leads.createdAt))
            .limit(input?.limit || 100)
            .offset(input?.offset || 0),
          db.select({ value: count() }).from(leads).where(whereClause),
        ]);

        return {
          items,
          total: totalResult[0]?.value || 0,
          limit: input?.limit || 100,
          offset: input?.offset || 0,
        };
      } catch (error) {
        console.error('[Leads] Error listing:', error);
        throw new Error('Failed to list leads');
      }
    }),

  /**
   * Buscar lead por ID
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [lead] = await db
          .select()
          .from(leads)
          .where(eq(leads.id, id))
          .limit(1);

        return lead || null;
      } catch (error) {
        console.error('[Leads] Error getting by ID:', error);
        throw new Error('Failed to get lead');
      }
    }),

  /**
   * Criar novo lead
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
        mercadoId: z.number(),
        nome: z.string().min(1, 'Nome é obrigatório').max(255),
        cnpj: z.string().optional(),
        site: z.string().url().optional().or(z.literal('')),
        email: z.string().email().optional().or(z.literal('')),
        telefone: z.string().optional(),
        tipo: z.string().optional(),
        porte: z.string().optional(),
        regiao: z.string().optional(),
        setor: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().max(2).optional(),
        leadStage: z.string().optional(),
        validationStatus: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .insert(leads)
          .values({
            ...input,
            leadStage: input.leadStage || 'novo',
            validationStatus: input.validationStatus || 'pendente',
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Leads] Error creating:', error);
        throw new Error('Failed to create lead');
      }
    }),

  /**
   * Atualizar lead
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).max(255).optional(),
        cnpj: z.string().optional(),
        site: z.string().url().optional().or(z.literal('')),
        email: z.string().email().optional().or(z.literal('')),
        telefone: z.string().optional(),
        leadStage: z.string().optional(),
        validationStatus: z.string().optional(),
        tipo: z.string().optional(),
        porte: z.string().optional(),
        regiao: z.string().optional(),
        setor: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().max(2).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const { id, ...data } = input;

        const [result] = await db
          .update(leads)
          .set({
            ...data,
            
          })
          .where(eq(leads.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Leads] Error updating:', error);
        throw new Error('Failed to update lead');
      }
    }),

  /**
   * Deletar lead
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        await db.delete(leads).where(eq(leads.id, id));

        return { success: true };
      } catch (error) {
        console.error('[Leads] Error deleting:', error);
        throw new Error('Failed to delete lead');
      }
    }),

  /**
   * Atualizar estágio do lead
   */
  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        leadStage: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .update(leads)
          .set({
            leadStage: input.leadStage,
            
          })
          .where(eq(leads.id, input.id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Leads] Error updating stage:', error);
        throw new Error('Failed to update lead stage');
      }
    }),

  /**
   * Atualizar status de validação
   */
  updateValidation: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        validationStatus: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .update(leads)
          .set({
            validationStatus: input.validationStatus,
            
          })
          .where(eq(leads.id, input.id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Leads] Error updating validation:', error);
        throw new Error('Failed to update validation status');
      }
    }),
});
