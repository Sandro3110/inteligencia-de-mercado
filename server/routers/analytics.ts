/**
 * Analytics Router - Novo
 * Análises e métricas de dados com agregações
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  analyticsDimensoes,
  analyticsMercados,
  analyticsPesquisas,
  analyticsTimeline,
  leads,
  mercadosUnicos,
  pesquisas,
  clientes,
  concorrentes,
} from '@/drizzle/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';

export const analyticsRouter = createTRPCRouter({
  /**
   * Obter estatísticas detalhadas para Analytics (OverviewTab)
   */
  stats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const { projectId } = input;

      try {
        // Contar totais
        const [mercadosResult, clientesResult, concorrentesResult, leadsResult] = await Promise.all(
          [
            db
              .select({ value: count() })
              .from(mercadosUnicos)
              .where(eq(mercadosUnicos.projectId, projectId)),
            db.select({ value: count() }).from(clientes).where(eq(clientes.projectId, projectId)),
            db
              .select({ value: count() })
              .from(concorrentes)
              .where(eq(concorrentes.projectId, projectId)),
            db.select({ value: count() }).from(leads).where(eq(leads.projectId, projectId)),
          ]
        );

        // Contar por status de validação - CLIENTES
        const clientesValidation = await db
          .select({
            status: clientes.validationStatus,
            count: count(),
          })
          .from(clientes)
          .where(eq(clientes.projectId, projectId))
          .groupBy(clientes.validationStatus);

        // Contar por status de validação - CONCORRENTES
        const concorrentesValidation = await db
          .select({
            status: concorrentes.validationStatus,
            count: count(),
          })
          .from(concorrentes)
          .where(eq(concorrentes.projectId, projectId))
          .groupBy(concorrentes.validationStatus);

        // Contar por status de validação - LEADS
        const leadsValidation = await db
          .select({
            status: leads.validationStatus,
            count: count(),
          })
          .from(leads)
          .where(eq(leads.projectId, projectId))
          .groupBy(leads.validationStatus);

        return {
          totals: {
            mercados: mercadosResult[0]?.value || 0,
            clientes: clientesResult[0]?.value || 0,
            concorrentes: concorrentesResult[0]?.value || 0,
            leads: leadsResult[0]?.value || 0,
          },
          validation: {
            clientes: clientesValidation,
            concorrentes: concorrentesValidation,
            leads: leadsValidation,
          },
        };
      } catch (error) {
        console.error('[Analytics] Error fetching stats:', error);
        throw new Error('Failed to fetch analytics stats');
      }
    }),

  /**
   * Obter métricas gerais por projeto
   */
  overview: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [pesquisasCount, mercadosCount, leadsCount] = await Promise.all([
          db
            .select({ value: count() })
            .from(pesquisas)
            .where(eq(pesquisas.projectId, input.projectId)),
          db
            .select({ value: count() })
            .from(mercadosUnicos)
            .where(eq(mercadosUnicos.projectId, input.projectId)),
          db.select({ value: count() }).from(leads).where(eq(leads.projectId, input.projectId)),
        ]);

        return {
          pesquisas: pesquisasCount[0]?.value || 0,
          mercados: mercadosCount[0]?.value || 0,
          leads: leadsCount[0]?.value || 0,
        };
      } catch (error) {
        console.error('[Analytics] Error getting overview:', error);
        throw new Error('Failed to get analytics overview');
      }
    }),

  /**
   * Obter distribuição de leads por estágio
   */
  leadsByStage: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const result = await db
          .select({
            stage: leads.leadStage,
            count: count(),
          })
          .from(leads)
          .where(eq(leads.projectId, input.projectId))
          .groupBy(leads.leadStage);

        return result.map((r) => ({
          stage: r.stage || 'não definido',
          count: Number(r.count),
        }));
      } catch (error) {
        console.error('[Analytics] Error getting leads by stage:', error);
        return [];
      }
    }),

  /**
   * Obter distribuição de leads por status de validação
   */
  leadsByValidation: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const result = await db
          .select({
            status: leads.validationStatus,
            count: count(),
          })
          .from(leads)
          .where(eq(leads.projectId, input.projectId))
          .groupBy(leads.validationStatus);

        return result.map((r) => ({
          status: r.status || 'não definido',
          count: Number(r.count),
        }));
      } catch (error) {
        console.error('[Analytics] Error getting leads by validation:', error);
        return [];
      }
    }),

  /**
   * Obter top mercados por quantidade de leads
   */
  topMarkets: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const result = await db
          .select({
            mercadoId: leads.mercadoId,
            mercadoNome: mercadosUnicos.nome,
            count: count(),
          })
          .from(leads)
          .leftJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
          .where(eq(leads.projectId, input.projectId))
          .groupBy(leads.mercadoId, mercadosUnicos.nome)
          .orderBy(desc(count()))
          .limit(input.limit);

        return result.map((r) => ({
          mercadoId: r.mercadoId,
          mercadoNome: r.mercadoNome || 'Sem nome',
          leadsCount: Number(r.count),
        }));
      } catch (error) {
        console.error('[Analytics] Error getting top markets:', error);
        return [];
      }
    }),

  /**
   * Obter timeline de criação de leads
   */
  leadsTimeline: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Buscar leads dos últimos N dias
        const result = await db
          .select({
            date: sql<string>`DATE(${leads.createdAt})`,
            count: count(),
          })
          .from(leads)
          .where(
            and(
              eq(leads.projectId, input.projectId),
              sql`${leads.createdAt} >= NOW() - INTERVAL '${input.days} days'`
            )
          )
          .groupBy(sql`DATE(${leads.createdAt})`)
          .orderBy(sql`DATE(${leads.createdAt})`);

        return result.map((r) => ({
          date: r.date,
          count: Number(r.count),
        }));
      } catch (error) {
        console.error('[Analytics] Error getting leads timeline:', error);
        return [];
      }
    }),

  /**
   * Obter dimensões de analytics (tabela analytics_dimensoes)
   */
  dimensoes: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        return await db
          .select()
          .from(analyticsDimensoes)
          .where(eq(analyticsDimensoes.projectId, input.projectId))
          .orderBy(desc(analyticsDimensoes.createdAt));
      } catch (error) {
        console.error('[Analytics] Error getting dimensoes:', error);
        return [];
      }
    }),

  /**
   * Obter analytics de mercados (tabela analytics_mercados)
   */
  mercados: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        return await db
          .select()
          .from(analyticsMercados)
          .where(eq(analyticsMercados.projectId, input.projectId))
          .orderBy(desc(analyticsMercados.createdAt));
      } catch (error) {
        console.error('[Analytics] Error getting mercados analytics:', error);
        return [];
      }
    }),

  /**
   * Obter analytics de pesquisas (tabela analytics_pesquisas)
   */
  pesquisasAnalytics: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        return await db
          .select()
          .from(analyticsPesquisas)
          .where(eq(analyticsPesquisas.projectId, input.projectId))
          .orderBy(desc(analyticsPesquisas.createdAt));
      } catch (error) {
        console.error('[Analytics] Error getting pesquisas analytics:', error);
        return [];
      }
    }),
});
