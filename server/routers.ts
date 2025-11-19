import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Gestor PAV routers
  analytics: router({  
    getProgress: publicProcedure.query(async () => {
      const { getAnalyticsProgress } = await import('./db');
      return getAnalyticsProgress();
    }),
    
    leadsByStage: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getLeadsByStageStats } = await import('./db');
        return getLeadsByStageStats(input.projectId);
      }),
    
    leadsByMercado: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getLeadsByMercadoStats } = await import('./db');
        return getLeadsByMercadoStats(input.projectId);
      }),
    
    qualityEvolution: publicProcedure
      .input(z.object({ projectId: z.number(), days: z.number().optional().default(30) }))
      .query(async ({ input }) => {
        const { getQualityScoreEvolution } = await import('./db');
        return getQualityScoreEvolution(input.projectId, input.days);
      }),
    
    leadsGrowth: publicProcedure
      .input(z.object({ projectId: z.number(), days: z.number().optional().default(30) }))
      .query(async ({ input }) => {
        const { getLeadsGrowthOverTime } = await import('./db');
        return getLeadsGrowthOverTime(input.projectId, input.days);
      }),
    
    kpis: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getDashboardKPIs } = await import('./db');
        return getDashboardKPIs(input.projectId);
      }),
  }),

  dashboard: router({
    stats: publicProcedure
      .input(z.object({ projectId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const { getDashboardStats } = await import('./db');
        return getDashboardStats(input?.projectId);
      }),
    
    distribuicaoGeografica: publicProcedure.query(async () => {
      const { getDistribuicaoGeografica } = await import('./db');
      return getDistribuicaoGeografica();
    }),
    
    distribuicaoSegmentacao: publicProcedure.query(async () => {
      const { getDistribuicaoSegmentacao } = await import('./db');
      return getDistribuicaoSegmentacao();
    }),
    
    timelineValidacoes: publicProcedure
      .input(z.object({ days: z.number().optional().default(30) }))
      .query(async ({ input }) => {
        const { getTimelineValidacoes } = await import('./db');
        return getTimelineValidacoes(input.days);
      }),
    
    funilConversao: publicProcedure.query(async () => {
      const { getFunilConversao } = await import('./db');
      return getFunilConversao();
    }),
    
    top10Mercados: publicProcedure.query(async () => {
      const { getTop10Mercados } = await import('./db');
      return getTop10Mercados();
    }),
  }),

  mercados: router({
    list: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getMercados } = await import('./db');
        return getMercados(input);
      }),
    
    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getMercadoById } = await import('./db');
        return getMercadoById(input);
      }),
    
    byProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getMercados } = await import('./db');
        return getMercados({ projectId: input.projectId });
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          segmentacao: z.string().optional(),
          categoria: z.string().optional(),
          tamanhoMercado: z.string().optional(),
          crescimentoAnual: z.string().optional(),
          tendencias: z.string().optional(),
          principaisPlayers: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { updateMercado } = await import('./db');
        return updateMercado(input.id, input.data);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMercado } = await import('./db');
        return deleteMercado(input.id);
      }),
  }),

  clientes: router({
    list: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllClientes } = await import('./db');
        return getAllClientes({ 
          projectId: input.projectId,
          validationStatus: input.validationStatus 
        });
      }),
    
    byMercado: publicProcedure
      .input(z.object({
        mercadoId: z.number(),
        validationStatus: z.string().optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        const { getClientesByMercadoPaginated } = await import('./db');
        return getClientesByMercadoPaginated(
          input.mercadoId,
          input.validationStatus,
          input.page,
          input.pageSize
        );
      }),
    
    updateValidation: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateClienteValidation } = await import('./db');
        return updateClienteValidation(input.id, input.status, input.notes, ctx.user?.id);
      }),
    
    byProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getAllClientes } = await import('./db');
        return getAllClientes({ projectId: input.projectId });
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          cnpj: z.string().optional(),
          siteOficial: z.string().optional(),
          produtoPrincipal: z.string().optional(),
          segmentacaoB2bB2c: z.string().optional(),
          email: z.string().optional(),
          telefone: z.string().optional(),
          linkedin: z.string().optional(),
          instagram: z.string().optional(),
          cidade: z.string().optional(),
          uf: z.string().optional(),
          cnae: z.string().optional(),
          porte: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { updateCliente } = await import('./db');
        return updateCliente(input.id, input.data);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteCliente } = await import('./db');
        return deleteCliente(input.id);
      }),
  }),

  concorrentes: router({
    list: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllConcorrentes } = await import('./db');
        return getAllConcorrentes({ 
          projectId: input.projectId,
          validationStatus: input.validationStatus 
        });
      }),
    
    byMercado: publicProcedure
      .input(z.object({
        mercadoId: z.number(),
        validationStatus: z.string().optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        const { getConcorrentesByMercadoPaginated } = await import('./db');
        return getConcorrentesByMercadoPaginated(
          input.mercadoId,
          input.validationStatus,
          input.page,
          input.pageSize
        );
      }),
    
    updateValidation: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateConcorrenteValidation } = await import('./db');
        return updateConcorrenteValidation(input.id, input.status, input.notes, ctx.user?.id);
      }),
    
    byProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getAllConcorrentes } = await import('./db');
        return getAllConcorrentes({ projectId: input.projectId });
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          cnpj: z.string().optional(),
          site: z.string().optional(),
          produto: z.string().optional(),
          porte: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { updateConcorrente } = await import('./db');
        return updateConcorrente(input.id, input.data);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteConcorrente } = await import('./db');
        return deleteConcorrente(input.id);
      }),
  }),

  tags: router({
    list: publicProcedure.query(async () => {
      const { getAllTags } = await import('./db');
      return getAllTags();
    }),
    
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createTag } = await import('./db');
        return createTag(input.name, input.color);
      }),
    
    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteTag } = await import('./db');
        return deleteTag(input);
      }),
    
    getEntityTags: publicProcedure
      .input(z.object({
        entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
        entityId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getEntityTags } = await import('./db');
        return getEntityTags(input.entityType, input.entityId);
      }),
    
    addToEntity: publicProcedure
      .input(z.object({
        tagId: z.number(),
        entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
        entityId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { addTagToEntity } = await import('./db');
        return addTagToEntity(input.tagId, input.entityType, input.entityId);
      }),
    
    removeFromEntity: publicProcedure
      .input(z.object({
        tagId: z.number(),
        entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
        entityId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { removeTagFromEntity } = await import('./db');
        return removeTagFromEntity(input.tagId, input.entityType, input.entityId);
      }),
    
    getEntitiesByTag: publicProcedure
      .input(z.object({
        tagId: z.number(),
        entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]),
      }))
      .query(async ({ input }) => {
        const { getEntitiesByTag } = await import('./db');
        return getEntitiesByTag(input.tagId, input.entityType);
      }),
  }),

  leads: router({
    list: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllLeads } = await import('./db');
        return getAllLeads({ 
          projectId: input.projectId,
          validationStatus: input.validationStatus 
        });
      }),
    
    byMercado: publicProcedure
      .input(z.object({
        mercadoId: z.number(),
        validationStatus: z.string().optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        const { getLeadsByMercadoPaginated } = await import('./db');
        return getLeadsByMercadoPaginated(
          input.mercadoId,
          input.validationStatus,
          input.page,
          input.pageSize
        );
      }),
    
    updateValidation: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateLeadValidation } = await import('./db');
        return updateLeadValidation(input.id, input.status, input.notes, ctx.user?.id);
      }),

    updateStage: publicProcedure
      .input(z.object({
        id: z.number(),
        stage: z.enum(["novo", "em_contato", "negociacao", "fechado", "perdido"]),
      }))
      .mutation(async ({ input }) => {
        const { updateLeadStage } = await import('./db');
        await updateLeadStage(input.id, input.stage);
        return { success: true };
      }),

    byStage: publicProcedure
      .input(z.object({
        mercadoId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getLeadsByStage } = await import('./db');
        return getLeadsByStage(input.mercadoId);
      }),
    
    byProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getAllLeads } = await import('./db');
        return getAllLeads({ projectId: input.projectId });
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          tipo: z.string().optional(),
          porte: z.string().optional(),
          regiao: z.string().optional(),
          setor: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { updateLead } = await import('./db');
        return updateLead(input.id, input.data);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteLead } = await import('./db');
        return deleteLead(input.id);
      }),
    
    advancedSearch: publicProcedure
      .input(z.object({
        projectId: z.number(),
        filter: z.object({
          groups: z.array(z.object({
            conditions: z.array(z.object({
              field: z.string(),
              operator: z.enum(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'contains', 'startsWith', 'endsWith', 'in', 'notIn', 'isNull', 'isNotNull']),
              value: z.any().optional(),
            })),
            logicalOperator: z.enum(['AND', 'OR']),
          })),
          globalOperator: z.enum(['AND', 'OR']),
        }),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        const { searchLeadsAdvanced } = await import('./db');
        return searchLeadsAdvanced(input.projectId, input.filter, input.page, input.pageSize);
      }),
  }),

  savedFilters: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      const { getSavedFilters } = await import('./db');
      return getSavedFilters(ctx.user.id);
    }),

    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        filtersJson: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        const { createSavedFilter } = await import('./db');
        await createSavedFilter({
          userId: ctx.user.id,
          name: input.name,
          filtersJson: input.filtersJson,
        });
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteSavedFilter } = await import('./db');
        await deleteSavedFilter(input);
        return { success: true };
      }),
  }),

  projects: router({
    list: publicProcedure
      .query(async () => {
        const { getProjects } = await import('./db');
        return getProjects();
      }),

    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getProjectById } = await import('./db');
        return getProjectById(input);
      }),

    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1).max(255),
        descricao: z.string().optional(),
        cor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createProject } = await import('./db');
        return createProject(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).max(255).optional(),
        descricao: z.string().optional(),
        cor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateProject } = await import('./db');
        const { id, ...data } = input;
        return updateProject(id, data);
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteProject } = await import('./db');
        return deleteProject(input);
      }),
  }),

  templates: router({
    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getTemplateById } = await import('./db');
        return getTemplateById(input);
      }),
    
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        config: z.string(), // JSON string
      }))
      .mutation(async ({ input }) => {
        const { createTemplate } = await import('./db');
        return createTemplate(input);
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          config: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { updateTemplate } = await import('./db');
        return updateTemplate(input.id, input.data);
      }),
    
    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteTemplate } = await import('./db');
        return deleteTemplate(input);
      }),
  }),

  notifications: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      const { getUserNotifications } = await import('./db');
      return getUserNotifications(ctx.user.id);
    }),
    
    unreadCount: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return 0;
      const { getUnreadNotificationsCount } = await import('./db');
      return getUnreadNotificationsCount(ctx.user.id);
    }),
    
    markAsRead: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { markNotificationAsRead } = await import('./db');
        return markNotificationAsRead(input);
      }),
    
    markAllAsRead: publicProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) return false;
        const { markAllNotificationsAsRead } = await import('./db');
        return markAllNotificationsAsRead(ctx.user.id);
      }),
    
    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteNotification } = await import('./db');
        return deleteNotification(input);
      }),
  }),

  enrichment: router({
    progress: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getEnrichmentProgress } = await import('./db');
        return getEnrichmentProgress(input.projectId);
      }),

    history: publicProcedure
      .input(z.object({ projectId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const { getEnrichmentHistory } = await import('./db');
        return getEnrichmentHistory(input.projectId, input.limit);
      }),

    pause: publicProcedure
      .input(z.object({ projectId: z.number(), runId: z.number() }))
      .mutation(async ({ input }) => {
        const { pauseEnrichment } = await import('./enrichmentControl');
        await pauseEnrichment(input.projectId, input.runId);
        return { success: true, message: 'Enriquecimento pausado' };
      }),

    resume: publicProcedure
      .input(z.object({ projectId: z.number(), runId: z.number() }))
      .mutation(async ({ input }) => {
        const { resumeEnrichment } = await import('./enrichmentControl');
        await resumeEnrichment(input.projectId, input.runId);
        return { success: true, message: 'Enriquecimento retomado' };
      }),

    status: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        try {
          const { getActiveEnrichmentRun } = await import('./db');
          const { getEnrichmentState } = await import('./enrichmentControl');
          
          const activeRun = await getActiveEnrichmentRun(input.projectId);
          const controlState = getEnrichmentState();
          
          return {
            activeRun,
            isPaused: controlState.isPaused,
            canPause: activeRun?.status === 'running',
            canResume: activeRun?.status === 'paused',
          };
        } catch (error) {
          console.error('[enrichment.status] Error:', error);
          return {
            activeRun: null,
            isPaused: false,
            canPause: false,
            canResume: false,
          };
        }
      }),

    execute: publicProcedure
      .input(z.object({
        clientes: z.array(z.object({
          nome: z.string(),
          cnpj: z.string().optional(),
          site: z.string().optional(),
          produto: z.string().optional(),
        })),
        projectName: z.string().min(1).max(255),
      }))
      .mutation(async ({ input }) => {
        const { executeEnrichmentFlow } = await import('./enrichmentFlow');
        const { randomUUID } = await import('crypto');
        
        // Gerar jobId único para tracking via SSE
        const jobId = randomUUID();
        
        // Executar fluxo e retornar jobId + resultado final
        return new Promise((resolve) => {
          executeEnrichmentFlow(input, (progress) => {
            if (progress.status === 'completed' || progress.status === 'error') {
              resolve({ ...progress, jobId });
            }
          }, jobId);
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
