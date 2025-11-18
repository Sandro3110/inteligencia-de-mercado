import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

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
  }),

  dashboard: router({
    stats: publicProcedure.query(async () => {
      const { getDashboardStats } = await import('./db');
      return getDashboardStats();
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
  }),

  clientes: router({
    list: publicProcedure
      .input(z.object({
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllClientes } = await import('./db');
        return getAllClientes(input.validationStatus);
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
  }),

  concorrentes: router({
    list: publicProcedure
      .input(z.object({
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllConcorrentes } = await import('./db');
        return getAllConcorrentes(input.validationStatus);
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
        validationStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getAllLeads } = await import('./db');
        return getAllLeads(input.validationStatus);
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
});

export type AppRouter = typeof appRouter;
