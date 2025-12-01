/**
 * Dashboard Router - Refatorado completamente
 * Estatísticas e métricas do dashboard com queries otimizadas
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  projects,
  pesquisas,
  mercadosUnicos,
  leads,
  clientes,
  concorrentes,
  produtos,
} from '@/drizzle/schema';
import { eq, count, desc, and, sql, avg, isNotNull } from 'drizzle-orm';

export const dashboardRouter = createTRPCRouter({
  /**
   * Obter estatísticas gerais ou por projeto
   */
  stats: publicProcedure
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
  recentActivity: publicProcedure
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
  projectSummary: publicProcedure
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

  /**
   * Obter lista de projetos com contagens
   */
  getProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    try {
      // Tentar usar stored procedure otimizada
      try {
        const result = await db.execute(sql`SELECT * FROM get_projects_summary()`);

        // Mapear resultado da stored procedure para formato esperado
        return result.rows.map((row: any) => ({
          id: row.id,
          nome: row.nome,
          descricao: row.descricao,
          status: row.status,
          createdAt: row.created_at,
          pesquisasCount: row.pesquisas_count,
          leadsCount: row.leads_count,
          clientesCount: row.clientes_count,
        }));
      } catch (spError) {
        // Fallback: usar queries TypeScript se stored procedure falhar
        console.warn('[Dashboard] Stored procedure failed, using fallback:', spError);

        const projectsData = await db
          .select({
            id: projects.id,
            nome: projects.nome,
            descricao: projects.descricao,
            status: projects.status,
            createdAt: projects.createdAt,
          })
          .from(projects)
          .where(eq(projects.ativo, 1))
          .orderBy(desc(projects.createdAt));

        // Para cada projeto, buscar contagens
        const projectsWithCounts = await Promise.all(
          projectsData.map(async (project) => {
            const [pesquisasResult, leadsResult, clientesResult] = await Promise.all([
              db
                .select({ count: count() })
                .from(pesquisas)
                .where(and(eq(pesquisas.projectId, project.id), eq(pesquisas.ativo, 1))),
              db.select({ count: count() }).from(leads).where(eq(leads.projectId, project.id)),
              db
                .select({ count: count() })
                .from(clientes)
                .where(eq(clientes.projectId, project.id)),
            ]);

            return {
              ...project,
              pesquisasCount: pesquisasResult[0]?.count || 0,
              leadsCount: leadsResult[0]?.count || 0,
              clientesCount: clientesResult[0]?.count || 0,
            };
          })
        );

        return projectsWithCounts;
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }),

  /**
   * Obter pesquisas de um projeto com contagens
   */
  getProjectPesquisas: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Tentar usar stored procedure otimizada
        try {
          const result = await db.execute(
            sql`SELECT * FROM get_pesquisas_summary(${input.projectId})`
          );

          // Mapear resultado da stored procedure para formato esperado
          return result.rows.map((row: any) => ({
            id: row.pesquisa_id,
            projectId: input.projectId,
            nome: row.pesquisa_nome,
            descricao: row.pesquisa_descricao,
            totalClientes: row.total_clientes,
            clientesEnriquecidos: row.clientes_enriquecidos,
            status: row.status,
            leadsCount: row.leads_count,
            mercadosCount: row.mercados_count,
            concorrentesCount: row.concorrentes_count,
            produtosCount: row.produtos_count,
            clientesQualidadeMedia: row.clientes_qualidade_media,
            leadsQualidadeMedia: row.leads_qualidade_media,
            concorrentesQualidadeMedia: row.concorrentes_qualidade_media,
            geoEnriquecimentoTotal: row.geo_enriquecimento_total,
            geoEnriquecimentoTotalEntidades: row.geo_enriquecimento_total_entidades,
          }));
        } catch (spError) {
          // Fallback: usar queries TypeScript se stored procedure falhar
          console.warn('[Dashboard] Stored procedure failed, using fallback:', spError);

          const pesquisasData = await db
            .select({
              id: pesquisas.id,
              projectId: pesquisas.projectId,
              nome: pesquisas.nome,
              descricao: pesquisas.descricao,
              totalClientes: pesquisas.totalClientes,
              clientesEnriquecidos: pesquisas.clientesEnriquecidos,
              status: pesquisas.status,
            })
            .from(pesquisas)
            .where(and(eq(pesquisas.projectId, input.projectId), eq(pesquisas.ativo, 1)))
            .orderBy(desc(pesquisas.createdAt));

          // Para cada pesquisa, buscar contagens e qualidade média
          const pesquisasWithCounts = await Promise.all(
            pesquisasData.map(async (pesquisa) => {
              const [
                leadsResult,
                mercadosResult,
                concorrentesResult,
                produtosResult,
                clientesQualidadeResult,
                leadsQualidadeResult,
                concorrentesQualidadeResult,
                clientesComLocalizacaoResult,
                leadsComLocalizacaoResult,
                concorrentesComLocalizacaoResult,
              ] = await Promise.all([
                db.select({ count: count() }).from(leads).where(eq(leads.pesquisaId, pesquisa.id)),
                db
                  .select({ count: count() })
                  .from(mercadosUnicos)
                  .where(eq(mercadosUnicos.pesquisaId, pesquisa.id)),
                db
                  .select({ count: count() })
                  .from(concorrentes)
                  .where(eq(concorrentes.pesquisaId, pesquisa.id)),
                db
                  .select({ count: count() })
                  .from(produtos)
                  .where(eq(produtos.pesquisaId, pesquisa.id)),
                db
                  .select({ avg: sql<number>`AVG(${clientes.qualidadeScore})` })
                  .from(clientes)
                  .where(eq(clientes.pesquisaId, pesquisa.id)),
                db
                  .select({ avg: sql<number>`AVG(${leads.qualidadeScore})` })
                  .from(leads)
                  .where(eq(leads.pesquisaId, pesquisa.id)),
                db
                  .select({ avg: sql<number>`AVG(${concorrentes.qualidadeScore})` })
                  .from(concorrentes)
                  .where(eq(concorrentes.pesquisaId, pesquisa.id)),
                db
                  .select({ count: count() })
                  .from(clientes)
                  .where(
                    and(
                      eq(clientes.pesquisaId, pesquisa.id),
                      isNotNull(clientes.latitude),
                      isNotNull(clientes.longitude)
                    )
                  ),
                db
                  .select({ count: count() })
                  .from(leads)
                  .where(
                    and(
                      eq(leads.pesquisaId, pesquisa.id),
                      isNotNull(leads.latitude),
                      isNotNull(leads.longitude)
                    )
                  ),
                db
                  .select({ count: count() })
                  .from(concorrentes)
                  .where(
                    and(
                      eq(concorrentes.pesquisaId, pesquisa.id),
                      isNotNull(concorrentes.latitude),
                      isNotNull(concorrentes.longitude)
                    )
                  ),
              ]);

              const geoTotal =
                (clientesComLocalizacaoResult[0]?.count || 0) +
                (leadsComLocalizacaoResult[0]?.count || 0) +
                (concorrentesComLocalizacaoResult[0]?.count || 0);

              const geoTotalEntidades =
                (pesquisa.totalClientes || 0) +
                (leadsResult[0]?.count || 0) +
                (concorrentesResult[0]?.count || 0);

              return {
                ...pesquisa,
                leadsCount: leadsResult[0]?.count || 0,
                mercadosCount: mercadosResult[0]?.count || 0,
                concorrentesCount: concorrentesResult[0]?.count || 0,
                produtosCount: produtosResult[0]?.count || 0,
                clientesQualidadeMedia: Math.round(clientesQualidadeResult[0]?.avg || 0),
                leadsQualidadeMedia: Math.round(leadsQualidadeResult[0]?.avg || 0),
                concorrentesQualidadeMedia: Math.round(concorrentesQualidadeResult[0]?.avg || 0),
                geoEnriquecimentoTotal: geoTotal,
                geoEnriquecimentoTotalEntidades: geoTotalEntidades,
              };
            })
          );

          return pesquisasWithCounts;
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching project pesquisas:', error);
        throw new Error('Failed to fetch project pesquisas');
      }
    }),
});
