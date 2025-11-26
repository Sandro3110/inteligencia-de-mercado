/**
 * Dashboard Router - Estatísticas e métricas do dashboard
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { projects, pesquisas, mercadosUnicos, leads, clientes, concorrentes } from '@/drizzle/schema';
import { eq, and, sql, count } from 'drizzle-orm';

export const dashboardRouter = createTRPCRouter({
  /**
   * Obter estatísticas gerais do dashboard
   */
  stats: publicProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }
      
      try {
        // Contar projetos
        const projectsCount = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.ativo, 1));

        // Se projectId fornecido, buscar stats específicas do projeto
        if (input.projectId) {
          const [pesquisasCount, mercadosCount, leadsCount, clientesCount, concorrentesCount] = await Promise.all([
            db.select({ count: count() }).from(pesquisas).where(eq(pesquisas.projectId, input.projectId)),
            db.select({ count: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.projectId, input.projectId)),
            db.select({ count: count() }).from(leads).where(eq(leads.projectId, input.projectId)),
            db.select({ count: count() }).from(clientes).where(eq(clientes.projectId, input.projectId)),
            db.select({ count: count() }).from(concorrentes).where(eq(concorrentes.projectId, input.projectId)),
          ]);

          return {
            projects: projectsCount[0]?.count || 0,
            pesquisas: pesquisasCount[0]?.count || 0,
            mercados: mercadosCount[0]?.count || 0,
            leads: leadsCount[0]?.count || 0,
            clientes: clientesCount[0]?.count || 0,
            concorrentes: concorrentesCount[0]?.count || 0,
          };
        }

        // Stats gerais (todos os projetos)
        const [pesquisasCount, mercadosCount, leadsCount] = await Promise.all([
          db.select({ count: count() }).from(pesquisas),
          db.select({ count: count() }).from(mercadosUnicos),
          db.select({ count: count() }).from(leads),
        ]);

        return {
          projects: projectsCount[0]?.count || 0,
          pesquisas: pesquisasCount[0]?.count || 0,
          mercados: mercadosCount[0]?.count || 0,
          leads: leadsCount[0]?.count || 0,
          clientes: 0,
          concorrentes: 0,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          projects: 0,
          pesquisas: 0,
          mercados: 0,
          leads: 0,
          clientes: 0,
          concorrentes: 0,
        };
      }
    }),

  /**
   * Obter atividades recentes
   */
  recentActivity: publicProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      
      try {
        // Buscar projetos recentes
        const recentProjects = await db
          .select({
            id: projects.id,
            nome: projects.nome,
            updatedAt: projects.updatedAt,
          })
          .from(projects)
          .where(eq(projects.ativo, true))
          .orderBy(sql`${projects.updatedAt} DESC`)
          .limit(input.limit);

        return recentProjects.map(p => ({
          type: 'project' as const,
          id: p.id,
          title: p.nome,
          timestamp: p.updatedAt,
        }));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    }),
});
