/**
 * Results Router - Consolidação de resultados de pesquisas
 * Substitui routers separados de clientes, leads, concorrentes e mercados
 */

import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { z } from 'zod';
import { getDb } from '@/server/db';
import * as schema from '@/drizzle/schema';
import { eq, and, or, like, desc, count } from 'drizzle-orm';

export const resultsRouter = createTRPCRouter({
  /**
   * Buscar KPIs de uma pesquisa
   */
  getKPIs: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const [clientes, concorrentes, leads, mercados] = await Promise.all([
        db
          .select({ count: count() })
          .from(schema.clientes)
          .where(eq(schema.clientes.pesquisaId, input.pesquisaId)),
        db
          .select({ count: count() })
          .from(schema.concorrentes)
          .where(eq(schema.concorrentes.pesquisaId, input.pesquisaId)),
        db
          .select({ count: count() })
          .from(schema.leads)
          .where(eq(schema.leads.pesquisaId, input.pesquisaId)),
        db
          .select({ count: count() })
          .from(schema.mercadosUnicos)
          .where(eq(schema.mercadosUnicos.pesquisaId, input.pesquisaId)),
      ]);

      return {
        totalClientes: clientes[0]?.count || 0,
        totalConcorrentes: concorrentes[0]?.count || 0,
        totalLeads: leads[0]?.count || 0,
        totalMercados: mercados[0]?.count || 0,
      };
    }),

  /**
   * Buscar clientes com filtros e paginação
   */
  getClientes: protectedProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
        filters: z
          .object({
            setor: z.string().optional(),
            cidade: z.string().optional(),
            uf: z.string().optional(),
            validationStatus: z.string().optional(),
          })
          .optional(),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      console.log('[Results] getClientes called with input:', JSON.stringify(input));
      try {
        const db = await getDb();
        if (!db) {
          console.error('[Results] Database connection failed');
          throw new Error('Database connection failed');
        }

      const offset = (input.page - 1) * input.pageSize;

      const conditions = [eq(schema.clientes.pesquisaId, input.pesquisaId)];

      if (input.filters?.setor) {
        conditions.push(like(schema.clientes.produtoPrincipal, `%${input.filters.setor}%`));
      }
      if (input.filters?.cidade) {
        conditions.push(eq(schema.clientes.cidade, input.filters.cidade));
      }
      if (input.filters?.uf) {
        conditions.push(eq(schema.clientes.uf, input.filters.uf));
      }
      if (input.filters?.validationStatus) {
        conditions.push(eq(schema.clientes.validationStatus, input.filters.validationStatus));
      }
      if (input.searchQuery) {
        conditions.push(
          or(
            like(schema.clientes.nome, `%${input.searchQuery}%`),
            like(schema.clientes.cnpj, `%${input.searchQuery}%`)
          )!
        );
      }

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(schema.clientes)
          .where(and(...conditions))
          .limit(input.pageSize)
          .offset(offset)
          .orderBy(desc(schema.clientes.createdAt)),
        db
          .select({ count: count() })
          .from(schema.clientes)
          .where(and(...conditions)),
      ]);

        console.log(
          '[Results] getClientes found:',
          data.length,
          'items, total:',
          countResult[0]?.count
        );

        const result = {
          data,
          total: countResult[0]?.count || 0,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil((countResult[0]?.count || 0) / input.pageSize),
        };
        console.log('[Results] getClientes returning:', JSON.stringify(result).substring(0, 200));
        return result;
      } catch (error) {
        console.error('[Results] getClientes error:', error);
        throw error;
      }
    }),

  /**
   * Buscar leads com filtros e paginação
   */
  getLeads: protectedProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
        filters: z
          .object({
            setor: z.string().optional(),
            cidade: z.string().optional(),
            uf: z.string().optional(),
            qualidadeClassificacao: z.string().optional(),
          })
          .optional(),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const offset = (input.page - 1) * input.pageSize;

      const conditions = [eq(schema.leads.pesquisaId, input.pesquisaId)];

      if (input.filters?.setor) {
        conditions.push(eq(schema.leads.setor, input.filters.setor));
      }
      if (input.filters?.cidade) {
        conditions.push(eq(schema.leads.cidade, input.filters.cidade));
      }
      if (input.filters?.uf) {
        conditions.push(eq(schema.leads.uf, input.filters.uf));
      }
      if (input.filters?.qualidadeClassificacao) {
        conditions.push(
          eq(schema.leads.qualidadeClassificacao, input.filters.qualidadeClassificacao)
        );
      }
      if (input.searchQuery) {
        conditions.push(
          or(
            like(schema.leads.nome, `%${input.searchQuery}%`),
            like(schema.leads.cnpj, `%${input.searchQuery}%`)
          )!
        );
      }

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(schema.leads)
          .where(and(...conditions))
          .limit(input.pageSize)
          .offset(offset)
          .orderBy(desc(schema.leads.qualidadeScore)),
        db
          .select({ count: count() })
          .from(schema.leads)
          .where(and(...conditions)),
      ]);

      return {
        data,
        total: countResult[0]?.count || 0,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil((countResult[0]?.count || 0) / input.pageSize),
      };
    }),

  /**
   * Buscar concorrentes com filtros e paginação
   */
  getConcorrentes: protectedProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
        filters: z
          .object({
            porte: z.string().optional(),
            cidade: z.string().optional(),
            uf: z.string().optional(),
          })
          .optional(),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const offset = (input.page - 1) * input.pageSize;

      const conditions = [eq(schema.concorrentes.pesquisaId, input.pesquisaId)];

      if (input.filters?.porte) {
        conditions.push(eq(schema.concorrentes.porte, input.filters.porte));
      }
      if (input.filters?.cidade) {
        conditions.push(eq(schema.concorrentes.cidade, input.filters.cidade));
      }
      if (input.filters?.uf) {
        conditions.push(eq(schema.concorrentes.uf, input.filters.uf));
      }
      if (input.searchQuery) {
        conditions.push(
          or(
            like(schema.concorrentes.nome, `%${input.searchQuery}%`),
            like(schema.concorrentes.cnpj, `%${input.searchQuery}%`)
          )!
        );
      }

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(schema.concorrentes)
          .where(and(...conditions))
          .limit(input.pageSize)
          .offset(offset)
          .orderBy(desc(schema.concorrentes.createdAt)),
        db
          .select({ count: count() })
          .from(schema.concorrentes)
          .where(and(...conditions)),
      ]);

      return {
        data,
        total: countResult[0]?.count || 0,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil((countResult[0]?.count || 0) / input.pageSize),
      };
    }),

  /**
   * Buscar mercados com paginação
   */
  getMercados: protectedProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const offset = (input.page - 1) * input.pageSize;

      const conditions = [eq(schema.mercadosUnicos.pesquisaId, input.pesquisaId)];

      if (input.searchQuery) {
        conditions.push(like(schema.mercadosUnicos.nome, `%${input.searchQuery}%`));
      }

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(schema.mercadosUnicos)
          .where(and(...conditions))
          .limit(input.pageSize)
          .offset(offset)
          .orderBy(desc(schema.mercadosUnicos.quantidadeClientes)),
        db
          .select({ count: count() })
          .from(schema.mercadosUnicos)
          .where(and(...conditions)),
      ]);

      return {
        data,
        total: countResult[0]?.count || 0,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil((countResult[0]?.count || 0) / input.pageSize),
      };
    }),

  /**
   * Buscar detalhes de um cliente
   */
  getClienteById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const [cliente] = await db
        .select()
        .from(schema.clientes)
        .where(eq(schema.clientes.id, input.id));

      return cliente || null;
    }),

  /**
   * Buscar detalhes de um lead
   */
  getLeadById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const [lead] = await db.select().from(schema.leads).where(eq(schema.leads.id, input.id));

    return lead || null;
  }),
});
