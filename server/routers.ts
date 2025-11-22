import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { exportRouter } from "./routers/exportRouter";
import { geocodingRouter } from "./routers/geocodingRouter";
import { territorialRouter } from "./routers/territorialRouter";
import { reportsRouter } from "./routers/reportsRouter";
import { unifiedMapRouter } from "./routers/unifiedMapRouter";

export const appRouter = router({
  system: systemRouter,
  export: exportRouter,
  geo: geocodingRouter,
  territorial: territorialRouter,
  reports: reportsRouter,
  unifiedMap: unifiedMapRouter,

  settings: router({
    getGoogleMapsApiKey: protectedProcedure.query(async () => {
      const { getSystemSetting } = await import('./db');
      const apiKey = await getSystemSetting('google_maps_api_key');
      return { apiKey };
    }),

    setGoogleMapsApiKey: protectedProcedure
      .input(z.object({ apiKey: z.string().min(1, 'API Key é obrigatória') }))
      .mutation(async ({ input }) => {
        const { setSystemSetting } = await import('./db');
        const success = await setSystemSetting(
          'google_maps_api_key',
          input.apiKey,
          'Google Maps API Key para geocodificação'
        );
        return { success };
      }),

    getAllSettings: protectedProcedure.query(async () => {
      const { getAllSystemSettings } = await import('./db');
      return getAllSystemSettings();
    }),
  }),

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
    
    qualityTrends: publicProcedure
      .input(z.object({ projectId: z.number(), days: z.number().optional().default(30) }))
      .query(async ({ input }) => {
        const { getQualityTrends } = await import('./db');
        return getQualityTrends(input.projectId, input.days);
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
    
    evolution: publicProcedure
      .input(z.object({ projectId: z.number(), pesquisaId: z.number().optional(), months: z.number().optional().default(6) }))
      .query(async ({ input }) => {
        const { getEvolutionData } = await import('./db');
        return getEvolutionData(input.projectId, input.months, input.pesquisaId);
      }),
    
    geographic: publicProcedure
      .input(z.object({ projectId: z.number(), pesquisaId: z.number().optional() }))
      .query(async ({ input }) => {
        const { getGeographicDistribution } = await import('./db');
        return getGeographicDistribution(input.projectId, input.pesquisaId);
      }),
    
    segmentation: publicProcedure
      .input(z.object({ projectId: z.number(), pesquisaId: z.number().optional() }))
      .query(async ({ input }) => {
        const { getSegmentationDistribution } = await import('./db');
        return getSegmentationDistribution(input.projectId, input.pesquisaId);
      }),
    
    // Novos endpoints de analytics de lead generation
    byMercado: publicProcedure
      .input(z.object({
        projectId: z.number(),
        mercadoId: z.number().optional(),
        pesquisaId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }))
      .query(async ({ input }) => {
        const { getAnalyticsByMercado } = await import('./analyticsQueries');
        return getAnalyticsByMercado(input);
      }),
    
    byPesquisa: publicProcedure
      .input(z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getAnalyticsByPesquisa } = await import('./analyticsQueries');
        return getAnalyticsByPesquisa(input);
      }),
    
    byDimensao: publicProcedure
      .input(z.object({
        projectId: z.number(),
        dimensaoTipo: z.enum(["uf", "porte", "segmentacao", "categoria"]).optional(),
        dimensaoValor: z.string().optional(),
        pesquisaId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getAnalyticsByDimensao } = await import('./analyticsQueries');
        return getAnalyticsByDimensao(input);
      }),
    
    timeline: publicProcedure
      .input(z.object({
        projectId: z.number(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getAnalyticsTimeline } = await import('./analyticsQueries');
        return getAnalyticsTimeline(input);
      }),
    
    researchOverview: publicProcedure
      .input(z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getResearchOverviewMetrics } = await import('./analyticsQueries');
        return getResearchOverviewMetrics(input);
      }),
    
    timelineEvolution: publicProcedure
      .input(z.object({
        projectId: z.number(),
        days: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getTimelineEvolution } = await import('./analyticsQueries');
        return getTimelineEvolution(input);
      }),
    
    // Executar agregação manual (para testes)
    runAggregation: publicProcedure
      .input(z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { runManualAggregation } = await import('./cronJobs');
        return runManualAggregation(input.projectId, input.pesquisaId);
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
    getFilterOptions: publicProcedure.query(async () => {
      const { getFilterOptions } = await import('./db');
      return getFilterOptions();
    }),
    
    list: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        pesquisaId: z.number().optional(),
        search: z.string().optional(),
        categoria: z.string().optional(),
        segmentacao: z.string().optional(),
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
        pesquisaId: z.number().optional(),
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllClientes } = await import('./db');
        return getAllClientes({ 
          projectId: input.projectId,
          pesquisaId: input.pesquisaId,
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
    
    batchUpdateValidation: publicProcedure
      .input(z.object({
        ids: z.array(z.number()),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { batchUpdateClientesValidation } = await import('./db');
        return batchUpdateClientesValidation(input.ids, input.status, input.notes, ctx.user?.id);
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
    
    history: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await import('./db').then(m => m.getDb());
        if (!db) return [];
        const { clientesHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        return db.select()
          .from(clientesHistory)
          .where(eq(clientesHistory.clienteId, input.id))
          .orderBy(desc(clientesHistory.changedAt));
      }),
    
    produtos: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await import('./db').then(m => m.getDb());
        if (!db) return [];
        const { produtos, mercadosUnicos } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const produtosList = await db.select({
          id: produtos.id,
          nome: produtos.nome,
          descricao: produtos.descricao,
          categoria: produtos.categoria,
          mercadoId: produtos.mercadoId,
          mercadoNome: mercadosUnicos.nome,
        })
        .from(produtos)
        .leftJoin(mercadosUnicos, eq(produtos.mercadoId, mercadosUnicos.id))
        .where(eq(produtos.clienteId, input.id));
        return produtosList;
      }),
    
    updateCoordinates: publicProcedure
      .input(z.object({
        id: z.number(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }))
      .mutation(async ({ input }) => {
        const { updateClienteCoordinates } = await import('./db');
        return updateClienteCoordinates(input.id, input.latitude, input.longitude);
      }),
  }),

  concorrentes: router({
    list: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        pesquisaId: z.number().optional(),
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllConcorrentes } = await import('./db');
        return getAllConcorrentes({ 
          projectId: input.projectId,
          pesquisaId: input.pesquisaId,
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
    
    batchUpdateValidation: publicProcedure
      .input(z.object({
        ids: z.array(z.number()),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { batchUpdateConcorrentesValidation } = await import('./db');
        return batchUpdateConcorrentesValidation(input.ids, input.status, input.notes, ctx.user?.id);
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
    
    history: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await import('./db').then(m => m.getDb());
        if (!db) return [];
        const { concorrentesHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        return db.select()
          .from(concorrentesHistory)
          .where(eq(concorrentesHistory.concorrenteId, input.id))
          .orderBy(desc(concorrentesHistory.changedAt));
      }),
    
    updateCoordinates: publicProcedure
      .input(z.object({
        id: z.number(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }))
      .mutation(async ({ input }) => {
        const { updateConcorrenteCoordinates } = await import('./db');
        return updateConcorrenteCoordinates(input.id, input.latitude, input.longitude);
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
        pesquisaId: z.number().optional(),
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllLeads } = await import('./db');
        return getAllLeads({ 
          projectId: input.projectId,
          pesquisaId: input.pesquisaId,
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

    batchUpdateValidation: publicProcedure
      .input(z.object({
        ids: z.array(z.number()),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { batchUpdateLeadsValidation } = await import('./db');
        return batchUpdateLeadsValidation(input.ids, input.status, input.notes, ctx.user?.id);
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
    
    history: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await import('./db').then(m => m.getDb());
        if (!db) return [];
        const { leadsHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        return db.select()
          .from(leadsHistory)
          .where(eq(leadsHistory.leadId, input.id))
          .orderBy(desc(leadsHistory.changedAt));
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
    
    updateCoordinates: publicProcedure
      .input(z.object({
        id: z.number(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }))
      .mutation(async ({ input }) => {
        const { updateLeadCoordinates } = await import('./db');
        return updateLeadCoordinates(input.id, input.latitude, input.longitude);
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
      .mutation(async ({ input, ctx }) => {
        const { createProject } = await import('./db');
        return createProject(input, ctx.user?.id);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).max(255).optional(),
        descricao: z.string().optional(),
        cor: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateProject } = await import('./db');
        const { id, ...data } = input;
        return updateProject(id, data, ctx.user?.id);
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteProject } = await import('./db');
        return deleteProject(input);
      }),

    canDelete: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { canDeleteProject } = await import('./db');
        return canDeleteProject(input);
      }),

    deleteEmpty: publicProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const { deleteEmptyProject } = await import('./db');
        return deleteEmptyProject(input, ctx.user?.id);
      }),

    hibernate: publicProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const { hibernateProject } = await import('./db');
        return hibernateProject(input, ctx.user?.id);
      }),

    reactivate: publicProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const { reactivateProject } = await import('./db');
        return reactivateProject(input, ctx.user?.id);
      }),

    isHibernated: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { isProjectHibernated } = await import('./db');
        return isProjectHibernated(input);
      }),

    // Fase 58.1: Arquivamento Automático
    updateActivity: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { updateProjectActivity } = await import('./db');
        await updateProjectActivity(input);
        return { success: true };
      }),

    getInactive: publicProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input }) => {
        const { getInactiveProjects } = await import('./db');
        return getInactiveProjects(input.days);
      }),

    autoHibernate: publicProcedure
      .input(z.object({ days: z.number().default(30) }))
      .mutation(async ({ input, ctx }) => {
        const { getInactiveProjects, hibernateProject } = await import('./db');
        const inactiveProjects = await getInactiveProjects(input.days);
        
        const results = [];
        for (const project of inactiveProjects) {
          const result = await hibernateProject(project.id, ctx.user?.id);
          results.push({ projectId: project.id, ...result });
        }
        
        return { hibernated: results.filter(r => r.success).length, total: results.length, results };
      }),

    // Fase 58.2: Log de Auditoria
    getAuditLog: publicProcedure
      .input(z.object({
        projectId: z.number(),
        action: z.enum(['created', 'updated', 'hibernated', 'reactivated', 'deleted']).optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        const { getProjectAuditLog } = await import('./db');
        return getProjectAuditLog(input.projectId, {
          action: input.action,
          limit: input.limit,
          offset: input.offset,
        });
      }),

    // Fase 58.3: Duplicação de Projetos
    duplicate: publicProcedure
      .input(z.object({
        projectId: z.number(),
        newName: z.string().min(1).max(255),
        copyMarkets: z.boolean().optional().default(false),
      }))
      .mutation(async ({ input }) => {
        const { duplicateProject } = await import('./db');
        return duplicateProject(input.projectId, input.newName, {
          copyMarkets: input.copyMarkets,
        });
      }),

    // Fase 59.2: Dashboard de Atividade de Projetos
    getActivity: publicProcedure
      .query(async () => {
        const { getProjectsActivity } = await import('./db');
        return getProjectsActivity();
      }),

    // Fase 59.3: Sistema de Notificações Antes de Hibernar
    checkHibernationWarnings: publicProcedure
      .input(z.object({ inactiveDays: z.number().default(30) }))
      .query(async ({ input }) => {
        const { checkProjectsForHibernation } = await import('./db');
        return checkProjectsForHibernation(input.inactiveDays);
      }),

    sendHibernationWarnings: publicProcedure
      .input(z.object({ inactiveDays: z.number().default(30) }))
      .mutation(async ({ input }) => {
        const { checkProjectsForHibernation, sendHibernationWarning } = await import('./db');
        const projectsToWarn = await checkProjectsForHibernation(input.inactiveDays);
        
        const results = [];
        for (const { project, daysSinceActivity, scheduledHibernationDate } of projectsToWarn) {
          const result = await sendHibernationWarning(
            project.id,
            project.nome,
            daysSinceActivity,
            scheduledHibernationDate
          );
          results.push({ projectId: project.id, projectName: project.nome, ...result });
        }
        
        return { 
          sent: results.filter(r => r.success).length, 
          total: results.length, 
          results 
        };
      }),

    postponeHibernation: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        postponeDays: z.number().default(30)
      }))
      .mutation(async ({ input }) => {
        const { postponeHibernation } = await import('./db');
        return postponeHibernation(input.projectId, input.postponeDays);
      }),

    executeScheduledHibernations: publicProcedure
      .mutation(async ({ ctx }) => {
        const { executeScheduledHibernations } = await import('./db');
        return executeScheduledHibernations(ctx.user?.id);
      }),
  }),

  pesquisas: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }).optional())
      .query(async ({ input }) => {
        const { getPesquisas } = await import('./db');
        return getPesquisas(input?.projectId);
      }),

    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getPesquisaById } = await import('./db');
        return getPesquisaById(input);
      }),

    stats: publicProcedure
      .input(z.object({ pesquisaId: z.number() }))
      .query(async ({ input }) => {
        const { getDashboardStatsByPesquisa } = await import('./db');
        return getDashboardStatsByPesquisa(input.pesquisaId);
      }),

    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        nome: z.string().min(3).max(200),
        descricao: z.string().optional(),
        qtdConcorrentesPorMercado: z.number().min(1).max(50).default(5),
        qtdLeadsPorMercado: z.number().min(1).max(100).default(10),
        qtdProdutosPorCliente: z.number().min(1).max(20).default(3),
        mercados: z.array(z.object({
          nome: z.string(),
          descricao: z.string().optional(),
        })).optional().default([]),
        clientes: z.array(z.object({
          nome: z.string(),
          cnpj: z.string().optional(),
          mercadoNome: z.string().optional(),
        })).optional().default([]),
      }))
      .mutation(async ({ input }) => {
        const { createPesquisa, createMercado, createCliente } = await import('./db');
        
        // 1. Criar pesquisa
        const pesquisa = await createPesquisa({
          projectId: input.projectId,
          nome: input.nome,
          descricao: input.descricao,
          totalClientes: input.clientes.length,
          status: 'importado',
          qtdConcorrentesPorMercado: input.qtdConcorrentesPorMercado,
          qtdLeadsPorMercado: input.qtdLeadsPorMercado,
          qtdProdutosPorCliente: input.qtdProdutosPorCliente,
        });

        if (!pesquisa) {
          throw new Error('Falha ao criar pesquisa');
        }

        // 2. Criar mercados
        const mercadosMap = new Map<string, number>();
        for (const mercado of input.mercados) {
          const created = await createMercado({
            projectId: input.projectId,
            pesquisaId: pesquisa.id,
            nome: mercado.nome,
          });
          if (created) {
            mercadosMap.set(mercado.nome, created.id);
          }
        }

        // 3. Criar clientes (sem mercadoId por enquanto, apenas projectId e pesquisaId)
        for (const cliente of input.clientes) {
          await createCliente({
            projectId: input.projectId,
            pesquisaId: pesquisa.id,
            nome: cliente.nome,
            cnpj: cliente.cnpj || null,
          });
        }

        return pesquisa;
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deletePesquisa } = await import('./db');
        return deletePesquisa(input);
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
    
    getStats: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return { total: 0, unread: 0, last24h: 0 };
      const { getNotificationStats } = await import('./db');
      return getNotificationStats(ctx.user.id);
    }),
    
    markAsRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { markNotificationAsRead } = await import('./db');
        return markNotificationAsRead(input.id);
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
    
    // Notification Preferences
    getPreferences: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      const { getUserNotificationPreferences } = await import('./db');
      return getUserNotificationPreferences(ctx.user.id);
    }),
    
    updatePreference: publicProcedure
      .input(z.object({
        type: z.string(),
        enabled: z.boolean(),
        channels: z.object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          inApp: z.boolean().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) return null;
        const { upsertNotificationPreference } = await import('./db');
        return upsertNotificationPreference({
          userId: ctx.user.id,
          ...input,
        });
      }),
    
    resetPreferences: publicProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) return false;
        const { resetNotificationPreferences } = await import('./db');
        return resetNotificationPreferences(ctx.user.id);
      }),
    
    // Endpoint de teste para disparar notificação
    sendTestNotification: protectedProcedure
      .input(z.object({
        title: z.string().optional().default('🧪 Notificação de Teste'),
        message: z.string().optional().default('Sistema de notificações em tempo real funcionando perfeitamente!'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createNotification } = await import('./db');
        
        // Criar notificação no banco
        const notification = await createNotification({
          userId: ctx.user.id,
          type: 'validation',
          title: input.title,
          message: input.message,
        });
        
        return {
          success: true,
          notification,
          message: 'Notificação de teste enviada com sucesso!'
        };
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

    // Schedule routers
    createSchedule: publicProcedure
      .input(z.object({
        projectId: z.number(),
        scheduledAt: z.date(),
        recurrence: z.enum(['once', 'daily', 'weekly']).default('once'),
        batchSize: z.number().min(1).max(100).default(50),
        maxClients: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createScheduledEnrichment } = await import('./db');
        const { toMySQLTimestamp } = await import('./dateUtils');
        const id = await createScheduledEnrichment({
          projectId: input.projectId,
          scheduledAt: toMySQLTimestamp(input.scheduledAt),
          recurrence: input.recurrence,
          batchSize: input.batchSize,
          maxClients: input.maxClients,
          status: 'pending',
        });
        return { success: true, id };
      }),

    listSchedules: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { listScheduledEnrichments } = await import('./db');
        return listScheduledEnrichments(input.projectId);
      }),

    cancelSchedule: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { cancelScheduledEnrichment } = await import('./db');
        await cancelScheduledEnrichment(input.id);
        return { success: true };
      }),

    deleteSchedule: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteScheduledEnrichment } = await import('./db');
        await deleteScheduledEnrichment(input.id);
        return { success: true };
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

  // Sistema de Alertas Personalizados
  alert: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getAlertConfigs } = await import('./db');
        return getAlertConfigs(input.projectId);
      }),
    
    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1).max(255),
        type: z.enum(['error_rate', 'high_quality_lead', 'market_threshold']),
        condition: z.string(), // JSON stringified: { operator: ">", value: 5 }
        enabled: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const { createAlertConfig } = await import('./db');
        const { type, enabled, ...rest } = input;
        return createAlertConfig({ 
          ...rest, 
          alertType: type,
          enabled: enabled ? 1 : 0
        });
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(['error_rate', 'high_quality_lead', 'market_threshold']).optional(),
        condition: z.string().optional(),
        enabled: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateAlertConfig } = await import('./db');
        const { id, type, enabled, ...rest } = input;
        const updateData: any = { ...rest };
        if (type !== undefined) updateData.alertType = type;
        if (enabled !== undefined) updateData.enabled = enabled ? 1 : 0;
        return updateAlertConfig(id, updateData);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteAlertConfig } = await import('./db');
        return deleteAlertConfig(input.id);
      }),

    // Histórico de alertas
    history: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        alertType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAlertHistory } = await import('./db');
        return getAlertHistory(input.projectId, {
          limit: input.limit,
          offset: input.offset,
          alertType: input.alertType,
        });
      }),
  }),

  // Exportação de Dados (Simples - Legacy)
  exportSimple: router({
    mercados: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { exportMercadosToExcel } = await import('./exportToExcel');
        const buffer = await exportMercadosToExcel(input.projectId);
        return {
          data: buffer.toString('base64'),
          filename: `mercados_${new Date().toISOString().split('T')[0]}.xlsx`,
        };
      }),

    leads: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { exportLeadsToExcel } = await import('./exportToExcel');
        const buffer = await exportLeadsToExcel(input.projectId);
        return {
          data: buffer.toString('base64'),
          filename: `leads_${new Date().toISOString().split('T')[0]}.xlsx`,
        };
      }),
  }),

  // Conversões de Leads
  conversion: router({
    create: publicProcedure
      .input(z.object({
        leadId: z.number(),
        projectId: z.number(),
        dealValue: z.number().optional(),
        notes: z.string().optional(),
        status: z.enum(['won', 'lost']).default('won'),
      }))
      .mutation(async ({ input }) => {
        const { createLeadConversion } = await import('./db');
        const conversionData = {
          ...input,
          dealValue: input.dealValue ? input.dealValue.toString() : undefined,
        };
        await createLeadConversion(conversionData as any);
        return { success: true };
      }),

    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getLeadConversions } = await import('./db');
        return await getLeadConversions(input.projectId);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteLeadConversion } = await import('./db');
        await deleteLeadConversion(input.id);
        return { success: true };
      }),
  }),

  // Funil de Vendas
  funnel: router({
    data: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getFunnelData } = await import('./db');
        return await getFunnelData(input.projectId);
      }),
  }),

  // Métricas de ROI
  roi: router({
    metrics: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { calculateROIMetrics } = await import('./db');
        return await calculateROIMetrics(input.projectId);
      }),
  }),

  // Agendamento de Enriquecimento
  schedule: router({  
    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        scheduledAt: z.string(),
        recurrence: z.enum(["once", "daily", "weekly"]),
        batchSize: z.number().optional(),
        maxClients: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createScheduledEnrichment } = await import('./db');
        const { toMySQLTimestamp } = await import('./dateUtils');
        const id = await createScheduledEnrichment({
          projectId: input.projectId,
          scheduledAt: toMySQLTimestamp(new Date(input.scheduledAt)),
          recurrence: input.recurrence,
          batchSize: input.batchSize,
          maxClients: input.maxClients,
        });
        return { id };
      }),
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { listScheduledEnrichments } = await import('./db');
        return await listScheduledEnrichments(input.projectId);
      }),
    cancel: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { cancelScheduledEnrichment } = await import('./db');
        await cancelScheduledEnrichment(input.id);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteScheduledEnrichment } = await import('./db');
        await deleteScheduledEnrichment(input.id);
        return { success: true };
      }),
  }),

  // Relatórios Executivos
  executiveReports: router({
    generate: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        pesquisaId: z.number().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        mercadoIds: z.array(z.number()).optional(),
      }))
      .query(async ({ input }) => {
        const { generateExecutiveReportData } = await import('./generateExecutiveReport');
        return generateExecutiveReportData(
          input.projectId, 
          {
            pesquisaId: input.pesquisaId,
            dateFrom: input.dateFrom,
            dateTo: input.dateTo,
            mercadoIds: input.mercadoIds,
          }
        );
      }),
  }),

  activity: router({
    recent: publicProcedure
      .input(z.object({ projectId: z.number(), limit: z.number().optional().default(30) }))
      .query(async ({ input }) => {
        const { getRecentActivities } = await import('./db');
        return getRecentActivities(input.projectId, input.limit);
      }),
    
    log: publicProcedure
      .input(z.object({
        projectId: z.number(),
        activityType: z.string(),
        description: z.string(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { logActivity } = await import('./db');
        await logActivity({
          projectId: input.projectId,
          activityType: input.activityType,
          description: input.description,
          metadata: input.metadata,
        });
        return { success: true };
      }),
  }),

  // Busca global unificada
  search: router({
    global: publicProcedure
      .input(z.object({ 
        query: z.string(), 
        projectId: z.number().optional(),
        limit: z.number().optional().default(20) 
      }))
      .query(async ({ input }) => {
        const { globalSearch } = await import('./db');
        return globalSearch(input.query, input.projectId, input.limit);
      }),
  }),

  // History router
  history: router({
    getMercadoHistory: publicProcedure
      .input(z.object({ mercadoId: z.number() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { mercadosHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(mercadosHistory)
          .where(eq(mercadosHistory.mercadoId, input.mercadoId))
          .orderBy(desc(mercadosHistory.changedAt));
      }),

    getClienteHistory: publicProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { clientesHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(clientesHistory)
          .where(eq(clientesHistory.clienteId, input.clienteId))
          .orderBy(desc(clientesHistory.changedAt));
      }),

    getConcorrenteHistory: publicProcedure
      .input(z.object({ concorrenteId: z.number() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { concorrentesHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(concorrentesHistory)
          .where(eq(concorrentesHistory.concorrenteId, input.concorrenteId))
          .orderBy(desc(concorrentesHistory.changedAt));
      }),

    getLeadHistory: publicProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { leadsHistory } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(leadsHistory)
          .where(eq(leadsHistory.leadId, input.leadId))
          .orderBy(desc(leadsHistory.changedAt));
      }),
  }),

  // Produtos router
  produtos: router({
    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        clienteId: z.number(),
        mercadoId: z.number(),
        nome: z.string(),
        descricao: z.string().optional().nullable(),
        categoria: z.string().optional().nullable(),
        preco: z.string().optional().nullable(),
        unidade: z.string().optional().nullable(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createProduto } = await import('./db');
        return createProduto(input);
      }),

    byCliente: publicProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => {
        const { getProdutosByCliente } = await import('./db');
        return getProdutosByCliente(input.clienteId);
      }),

    byMercado: publicProcedure
      .input(z.object({ mercadoId: z.number() }))
      .query(async ({ input }) => {
        const { getProdutosByMercado } = await import('./db');
        return getProdutosByMercado(input.mercadoId);
      }),

    byProject: publicProcedure
      .input(z.object({ projectId: z.number(), pesquisaId: z.number().optional() }))
      .query(async ({ input }) => {
        const { getProdutosByProject } = await import('./db');
        return getProdutosByProject(input.projectId, input.pesquisaId);
      }),

    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { getProdutoById } = await import('./db');
        return getProdutoById(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional().nullable(),
        categoria: z.string().optional().nullable(),
        preco: z.string().optional().nullable(),
        unidade: z.string().optional().nullable(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateProduto } = await import('./db');
        return updateProduto(id, data);
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteProduto } = await import('./db');
        return deleteProduto(input);
      }),
   }),

  // Enriquecimento V2 router
  enrichmentOptimized: router({
    // Teste 1: Enriquecer 1 cliente completo
    enrichOne: publicProcedure
      .input(z.object({ clienteId: z.number(), projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { enrichClienteCompleto } = await import('./enrichmentOptimized');
        return enrichClienteCompleto(input.clienteId, input.projectId);
      }),

    // Teste 2: Enriquecer múltiplos clientes
    enrichMultiple: publicProcedure
      .input(z.object({ clienteIds: z.array(z.number()), projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { enrichClienteCompleto } = await import('./enrichmentOptimized');
        const results = [];
        
        for (const clienteId of input.clienteIds) {
          const result = await enrichClienteCompleto(clienteId, input.projectId);
          results.push({ clienteId, ...result });
        }
        
        return results;
      }),

    // Etapas individuais
    enrichCliente: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { enrichCliente } = await import('./enrichmentOptimized');
        return enrichCliente(input);
      }),

    identifyMercados: publicProcedure
      .input(z.object({ clienteId: z.number(), projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { identifyMercados } = await import('./enrichmentOptimized');
        return identifyMercados(input.clienteId, input.projectId);
      }),

    createProdutos: publicProcedure
      .input(z.object({ clienteId: z.number(), projectId: z.number(), mercadoIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const { createProdutosCliente } = await import('./enrichmentOptimized');
        return createProdutosCliente(input.clienteId, input.projectId);
      }),

    findConcorrentes: publicProcedure
      .input(z.object({ clienteId: z.number(), projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { findConcorrentesCliente } = await import('./enrichmentOptimized');
        return findConcorrentesCliente(input.clienteId, input.projectId);
      }),

    findLeads: publicProcedure
      .input(z.object({ clienteId: z.number(), projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { findLeadsCliente } = await import('./enrichmentOptimized');
        return findLeadsCliente(input.clienteId, input.projectId);
      }),

    // Processamento em lote com paralelização
    enrichBatch: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        batchSize: z.number().optional().default(5),
        checkpointInterval: z.number().optional().default(50)
      }))
      .mutation(async ({ input }) => {
        const { enrichClientesBatch } = await import('./enrichmentBatch');
        return enrichClientesBatch(input.projectId, {
          batchSize: input.batchSize,
          checkpointInterval: input.checkpointInterval,
        });
      }),

    // Estimar custo e tempo
    estimateCost: publicProcedure
      .input(z.object({ numClientes: z.number() }))
      .query(async ({ input }) => {
        const { estimateBatchCost } = await import('./enrichmentBatch');
        return estimateBatchCost(input.numClientes);
      }),

    // Job Manager - Pausa/Retomar
    createJob: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        batchSize: z.number().optional(),
        checkpointInterval: z.number().optional()
      }))
      .mutation(async ({ input }) => {
        const { createEnrichmentJob } = await import('./enrichmentJobManager');
        return createEnrichmentJob(input.projectId, {
          batchSize: input.batchSize,
          checkpointInterval: input.checkpointInterval,
        });
      }),

    startJob: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input }) => {
        const { startEnrichmentJob } = await import('./enrichmentJobManager');
        await startEnrichmentJob(input.jobId);
        return { success: true };
      }),

    pauseJob: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input }) => {
        const { pauseEnrichmentJob } = await import('./enrichmentJobManager');
        await pauseEnrichmentJob(input.jobId);
        return { success: true };
      }),

    cancelJob: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input }) => {
        const { cancelEnrichmentJob } = await import('./enrichmentJobManager');
        await cancelEnrichmentJob(input.jobId);
        return { success: true };
      }),

    getJobProgress: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const { getJobProgress } = await import('./enrichmentJobManager');
        return getJobProgress(input.jobId);
      }),

    listJobs: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { listProjectJobs } = await import('./enrichmentJobManager');
        return listProjectJobs(input.projectId);
      }),
  }),

  // Batch Processor - Sistema de blocos de 50 clientes
  batchProcessor: router({
    // Iniciar processamento em blocos
    start: publicProcedure
      .input(z.object({ 
        pesquisaId: z.number(),
        batchSize: z.number().optional().default(50)
      }))
      .mutation(async ({ input }) => {
        const { startBatchEnrichment } = await import('./enrichmentBatchProcessor');
        
        // Executar em background
        startBatchEnrichment({
          pesquisaId: input.pesquisaId,
          batchSize: input.batchSize,
        }).catch(error => {
          console.error('[BatchProcessor] Error:', error);
        });
        
        return { success: true, message: 'Processamento iniciado em background' };
      }),

    // Pausar processamento
    pause: publicProcedure
      .mutation(async () => {
        const { pauseBatchEnrichment } = await import('./enrichmentBatchProcessor');
        const paused = pauseBatchEnrichment();
        return { success: paused };
      }),

    // Retomar processamento
    resume: publicProcedure
      .input(z.object({ 
        pesquisaId: z.number(),
        batchSize: z.number().optional().default(50)
      }))
      .mutation(async ({ input }) => {
        const { resumeBatchEnrichment } = await import('./enrichmentBatchProcessor');
        
        // Executar em background
        resumeBatchEnrichment({
          pesquisaId: input.pesquisaId,
          batchSize: input.batchSize,
        }).catch(error => {
          console.error('[BatchProcessor] Error:', error);
        });
        
        return { success: true, message: 'Processamento retomado' };
      }),

    // Cancelar processamento
    cancel: publicProcedure
      .mutation(async () => {
        const { cancelBatchEnrichment } = await import('./enrichmentBatchProcessor');
        const cancelled = cancelBatchEnrichment();
        return { success: cancelled };
      }),

    // Obter status atual
    status: publicProcedure
      .query(async () => {
        const { getBatchStatus } = await import('./enrichmentBatchProcessor');
        return getBatchStatus();
      }),
  }),

  // Enrichment Config - Configurações de enriquecimento
  enrichmentConfig: router({
    // Buscar configuração do projeto
    get: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getEnrichmentConfig } = await import('./db');
        return getEnrichmentConfig(input.projectId);
      }),

    // Salvar configuração
    save: publicProcedure
      .input(z.object({
        projectId: z.number(),
        openaiApiKey: z.string().optional(),
        serpapiKey: z.string().optional(),
        receitawsKey: z.string().optional(),
        produtosPorMercado: z.number().optional(),
        concorrentesPorMercado: z.number().optional(),
        leadsPorMercado: z.number().optional(),
        batchSize: z.number().optional(),
        checkpointInterval: z.number().optional(),
        enableDeduplication: z.number().optional(),
        enableQualityScore: z.number().optional(),
        enableAutoRetry: z.number().optional(),
        maxRetries: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { saveEnrichmentConfig } = await import('./db');
        return saveEnrichmentConfig(input);
      }),

    // Testar API keys
    testKeys: publicProcedure
      .input(z.object({
        openaiApiKey: z.string(),
        serpapiKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const results: any = { openai: false, serpapi: false };
        
        // Testar OpenAI
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${input.openaiApiKey}`,
            },
          });
          results.openai = response.ok;
          results.openaiMessage = response.ok ? 'Chave válida' : 'Chave inválida';
        } catch (error: any) {
          results.openai = false;
          results.openaiMessage = error.message;
        }

        // Testar SerpAPI (se fornecida)
        if (input.serpapiKey) {
          try {
            const response = await fetch(`https://serpapi.com/account.json?api_key=${input.serpapiKey}`);
            const data = await response.json();
            results.serpapi = !!data.account_id;
            results.serpapiMessage = results.serpapi ? 'Chave válida' : 'Chave inválida';
          } catch (error: any) {
            results.serpapi = false;
            results.serpapiMessage = error.message;
          }
        }

        return results;
      }),
  }),

  // Router de Pré-Pesquisa Integrada (Fase 40.1)
  preResearch: router({
    execute: publicProcedure
      .input(z.object({
        prompt: z.string().min(3),
        tipo: z.enum(['mercado', 'cliente']),
        quantidade: z.number().optional(),
        contextoAdicional: z.string().optional(),
        projectId: z.number().optional(), // FASE 41.2: Para credenciais configuráveis
      }))
      .mutation(async ({ input }) => {
        const { executePreResearch } = await import('./services/preResearchService');
        return executePreResearch(input);
      }),

    retry: publicProcedure
      .input(z.object({
        entidade: z.any(),
        tipo: z.enum(['mercado', 'cliente']),
        maxRetries: z.number().optional().default(2),
      }))
      .mutation(async ({ input }) => {
        const { retryWithImprovement } = await import('./services/preResearchService');
        return retryWithImprovement(input.entidade, input.tipo, input.maxRetries);
      }),
  }),

  // Admin LLM - Configuração de provedores de IA
  adminLLM: router({  
    getConfig: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getLLMConfig } = await import('./llmConfigDb');
        return getLLMConfig(input.projectId);
      }),

    saveConfig: publicProcedure
      .input(z.object({
        projectId: z.number(),
        activeProvider: z.enum(['openai', 'gemini', 'anthropic']),
        openaiApiKey: z.string().optional(),
        openaiModel: z.string().optional(),
        openaiEnabled: z.number().optional(),
        geminiApiKey: z.string().optional(),
        geminiModel: z.string().optional(),
        geminiEnabled: z.number().optional(),
        anthropicApiKey: z.string().optional(),
        anthropicModel: z.string().optional(),
        anthropicEnabled: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { upsertLLMConfig } = await import('./llmConfigDb');
        await upsertLLMConfig(input);
        return { success: true };
      }),

    testConnection: publicProcedure
      .input(z.object({
        provider: z.enum(['openai', 'gemini', 'anthropic']),
        apiKey: z.string(),
        model: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { testLLMConnection } = await import('./llmConfigDb');
        return testLLMConnection(input.provider, input.apiKey, input.model);
      }),
  }),

  // Intelligent Alerts - Sistema de alertas inteligentes
  intelligentAlerts: router({
    getConfig: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getAlertsConfig } = await import('./llmConfigDb');
        return getAlertsConfig(input.projectId);
      }),

    saveConfig: publicProcedure
      .input(z.object({
        projectId: z.number(),
        circuitBreakerThreshold: z.number().optional(),
        errorRateThreshold: z.number().optional(),
        processingTimeThreshold: z.number().optional(),
        notifyOnCompletion: z.number().optional(),
        notifyOnCircuitBreaker: z.number().optional(),
        notifyOnErrorRate: z.number().optional(),
        notifyOnProcessingTime: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { upsertAlertsConfig } = await import('./llmConfigDb');
        await upsertAlertsConfig(input);
        return { success: true };
      }),

    getHistory: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        const { getAlertsHistory } = await import('./llmConfigDb');
        return getAlertsHistory(input.projectId, input.limit);
      }),

    getStats: publicProcedure
      .input(z.object({ 
        projectId: z.number(),
        hours: z.number().optional().default(24),
      }))
      .query(async ({ input }) => {
        const { getAlertsStats } = await import('./llmConfigDb');
        return getAlertsStats(input.projectId, input.hours);
      }),

    markAsRead: publicProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        const { markAlertAsRead } = await import('./llmConfigDb');
        await markAlertAsRead(input.alertId);
        return { success: true };
      }),

    dismiss: publicProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        const { dismissAlert } = await import('./llmConfigDb');
        await dismissAlert(input.alertId);
        return { success: true };
      }),
  }),

  // Router de Teste - Pré-Pesquisa Inteligente
  prePesquisaTeste: router({
    // Cenário 1: Retry Inteligente
    retryInteligente: publicProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ input }) => {
        const { simularRetryInteligente } = await import('./prePesquisaSimulator');
        return simularRetryInteligente(input.query);
      }),

    // Cenário 2: Separação Multi-Cliente
    separacaoMultiCliente: publicProcedure
      .input(z.object({ textoLivre: z.string() }))
      .mutation(async ({ input }) => {
        const { simularSeparacaoMultiCliente } = await import('./prePesquisaSimulator');
        return simularSeparacaoMultiCliente(input.textoLivre);
      }),

    // Cenário 2: Pré-Pesquisa de Entidade
    prePesquisaEntidade: publicProcedure
      .input(z.object({
        tipo: z.enum(["especifica", "contexto"]),
        query: z.string(),
        contexto_adicional: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { simularPrePesquisaEntidade } = await import('./prePesquisaSimulator');
        return simularPrePesquisaEntidade(input);
      }),

    // Cenário 3: Refinamento Nível 1
    refinamentoNivel1: publicProcedure
      .input(z.object({ contextoInicial: z.string() }))
      .mutation(async ({ input }) => {
        const { simularPerguntaNivel1 } = await import('./prePesquisaSimulator');
        return simularPerguntaNivel1(input.contextoInicial);
      }),

    // Cenário 3: Refinamento Nível 2
    refinamentoNivel2: publicProcedure
      .input(z.object({
        contextoInicial: z.string(),
        respostasNivel1: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const { simularPerguntaNivel2 } = await import('./prePesquisaSimulator');
        return simularPerguntaNivel2(input.contextoInicial, input.respostasNivel1);
      }),

    // Cenário 3: Refinamento Nível 3
    refinamentoNivel3: publicProcedure
      .input(z.object({
        contextoInicial: z.string(),
        respostasNivel1: z.array(z.string()),
        respostasNivel2: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const { simularPerguntaNivel3 } = await import('./prePesquisaSimulator');
        return simularPerguntaNivel3(
          input.contextoInicial,
          input.respostasNivel1,
          input.respostasNivel2
        );
      }),

    // Cenário 3: Pré-Pesquisa Refinada (com combinações cartesianas)
    prePesquisaRefinada: publicProcedure
      .input(z.object({
        contextoInicial: z.string(),
        respostasNivel1: z.array(z.string()),
        respostasNivel2: z.array(z.string()),
        respostasNivel3: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const { simularPrePesquisaRefinadaMultipla } = await import('./prePesquisaSimulator');
        return simularPrePesquisaRefinadaMultipla(
          input.contextoInicial,
          input.respostasNivel1,
          input.respostasNivel2,
          input.respostasNivel3
        );
      }),
  }),

  // Research Drafts
  drafts: router({
    save: protectedProcedure
      .input(z.object({
        draftData: z.any(),
        currentStep: z.number(),
        projectId: z.number().optional().nullable(),
        progressStatus: z.enum(['started', 'in_progress', 'almost_done']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { saveResearchDraft } = await import('./db');
        return saveResearchDraft(
          ctx.user.id,
          input.draftData,
          input.currentStep,
          input.projectId,
          input.progressStatus
        );
      }),

    get: protectedProcedure
      .input(z.object({
        projectId: z.number().optional().nullable(),
      }))
      .query(async ({ ctx, input }) => {
        const { getResearchDraft } = await import('./db');
        return getResearchDraft(ctx.user.id, input.projectId);
      }),

    delete: protectedProcedure
      .input(z.object({
        draftId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { deleteResearchDraft } = await import('./db');
        return deleteResearchDraft(input.draftId);
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserDrafts } = await import('./db');
        return getUserDrafts(ctx.user.id);
      }),

    getFiltered: protectedProcedure
      .input(z.object({
        projectId: z.number().optional(),
        progressStatus: z.enum(['started', 'in_progress', 'almost_done']).optional(),
        daysAgo: z.number().optional(), // 7, 30, 90
        searchText: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getFilteredDrafts } = await import('./db');
        return getFilteredDrafts(ctx.user.id, input);
      }),
  }),

  // Web Push API
  push: router({
    getPublicKey: publicProcedure.query(async () => {
      const { getVapidPublicKey } = await import('./webPush');
      return getVapidPublicKey();
    }),

    subscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { savePushSubscription } = await import('./webPush');
        const userAgent = ctx.req.get('user-agent');
        return savePushSubscription(ctx.user.id, input, userAgent);
      }),

    unsubscribe: protectedProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ input }) => {
        const { removePushSubscription } = await import('./webPush');
        return removePushSubscription(input.endpoint);
      }),

    sendTest: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { sendPushToUser } = await import('./webPush');
        return sendPushToUser(ctx.user.id, {
          title: 'Notificação de Teste',
          body: 'Esta é uma notificação de teste do Gestor PAV!',
          icon: '/logo.png',
          data: { url: '/notificacoes' },
        });
      }),
  }),
});
export type AppRouter = typeof appRouter;
