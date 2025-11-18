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
});

export type AppRouter = typeof appRouter;
