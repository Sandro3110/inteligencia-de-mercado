/**
 * Dashboard Router - Refatorado completamente
 * Estatísticas e métricas do dashboard com queries otimizadas
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  projects,
  pesquisas,
  mercadosUnicos,
  leads,
  clientes,
  concorrentes,
} from '@/drizzle/schema';
import { eq, count, desc, and } from 'drizzle-orm';

export const dashboardRouter = createTRPCRouter({
  /**
   * Obter estatísticas gerais ou por projeto
   */
  stats: protectedProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const projectId = input?.projectId;

      try {
        // Contar projetos ativos
        const [projectsResult] = await db
          .select({ value: count() })
          .from(projects)
          .where(eq(projects.ativo, 1));

        const projectsCount = projectsResult?.value || 0;

        // Se projectId fornecido, buscar stats específicas
        if (projectId) {
          const [pesquisasResult, mercadosResult, leadsResult, clientesResult, concorrentesResult] =
            await Promise.all([
              db
                .select({ value: count() })
                .from(pesquisas)
                .where(eq(pesquisas.projectId, projectId)),
              db
                .select({ value: count() })
                .from(mercadosUnicos)
                .where(eq(mercadosUnicos.projectId, projectId)),
              db.select({ value: count() }).from(leads).where(eq(leads.projectId, projectId)),
              db.select({ value: count() }).from(clientes).where(eq(clientes.projectId, projectId)),
              db
                .select({ value: count() })
                .from(concorrentes)
                .where(eq(concorrentes.projectId, projectId)),
            ]);

          return {
            projects: projectsCount,
            pesquisas: pesquisasResult[0]?.value || 0,
            mercados: mercadosResult[0]?.value || 0,
            leads: leadsResult[0]?.value || 0,
            clientes: clientesResult[0]?.value || 0,
            concorrentes: concorrentesResult[0]?.value || 0,
          };
        }

        // Stats gerais (todos os projetos)
        const [pesquisasResult, mercadosResult, leadsResult, clientesResult, concorrentesResult] =
          await Promise.all([
            db.select({ value: count() }).from(pesquisas),
            db.select({ value: count() }).from(mercadosUnicos),
            db.select({ value: count() }).from(leads),
            db.select({ value: count() }).from(clientes),
            db.select({ value: count() }).from(concorrentes),
          ]);

        return {
          projects: projectsCount,
          pesquisas: pesquisasResult[0]?.value || 0,
          mercados: mercadosResult[0]?.value || 0,
          leads: leadsResult[0]?.value || 0,
          clientes: clientesResult[0]?.value || 0,
          concorrentes: concorrentesResult[0]?.value || 0,
        };
      } catch (error) {
        console.error('[Dashboard] Error fetching stats:', error);
        throw new Error('Failed to fetch dashboard stats');
      }
    }),

  /**
   * Obter atividades recentes
   */
  recentActivity: protectedProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const limit = input?.limit || 10;
      const projectId = input?.projectId;

      try {
        // Buscar projetos recentes (atualizados recentemente)
        const whereClause = projectId
          ? and(eq(projects.ativo, 1), eq(projects.id, projectId))
          : eq(projects.ativo, 1);

        const recentProjects = await db
          .select({
            id: projects.id,
            nome: projects.nome,
            updatedAt: projects.updatedAt,
            tipo: projects.status,
          })
          .from(projects)
          .where(whereClause)
          .orderBy(desc(projects.updatedAt))
          .limit(limit);

        return recentProjects.map((p) => ({
          type: 'project' as const,
          id: p.id,
          title: p.nome,
          description: `Status: ${p.tipo}`,
          timestamp: p.updatedAt,
        }));
      } catch (error) {
        console.error('[Dashboard] Error fetching recent activity:', error);
        return [];
      }
    }),

  /**
   * Obter resumo do projeto específico
   */
  projectSummary: protectedProcedure
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
        // Buscar informações do projeto
        const [project] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (!project) {
          throw new Error('Project not found');
        }

        // Buscar estatísticas detalhadas
        const [pesquisasResult, mercadosResult, leadsResult, clientesResult, concorrentesResult] =
          await Promise.all([
            db
              .select({ value: count() })
              .from(pesquisas)
              .where(eq(pesquisas.projectId, input.projectId)),
            db
              .select({ value: count() })
              .from(mercadosUnicos)
              .where(eq(mercadosUnicos.projectId, input.projectId)),
            db.select({ value: count() }).from(leads).where(eq(leads.projectId, input.projectId)),
            db
              .select({ value: count() })
              .from(clientes)
              .where(eq(clientes.projectId, input.projectId)),
            db
              .select({ value: count() })
              .from(concorrentes)
              .where(eq(concorrentes.projectId, input.projectId)),
          ]);

        return {
          project: {
            id: project.id,
            nome: project.nome,
            descricao: project.descricao,
            status: project.status,
            cor: project.cor,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          },
          stats: {
            pesquisas: pesquisasResult[0]?.value || 0,
            mercados: mercadosResult[0]?.value || 0,
            leads: leadsResult[0]?.value || 0,
            clientes: clientesResult[0]?.value || 0,
            concorrentes: concorrentesResult[0]?.value || 0,
          },
        };
      } catch (error) {
        console.error('[Dashboard] Error fetching project summary:', error);
        throw new Error('Failed to fetch project summary');
      }
    }),
});
