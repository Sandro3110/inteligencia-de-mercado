import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import {
  getAPIHealthStats,
  getAPIHealthHistory,
  testAPIConnection,
  type APIName,
} from "../apiHealth";

export const apiHealthRouter = router({
  /**
   * Obtém estatísticas de saúde de todas as APIs
   */
  stats: publicProcedure
    .input(
      z.object({
        days: z.number().optional().default(7),
      })
    )
    .query(async ({ input }) => {
      const apis: APIName[] = ['openai', 'serpapi', 'receitaws'];
      
      const stats = await Promise.all(
        apis.map((apiName) => getAPIHealthStats(apiName, input.days))
      );

      return stats;
    }),

  /**
   * Obtém estatísticas de uma API específica
   */
  statsByAPI: publicProcedure
    .input(
      z.object({
        apiName: z.enum(['openai', 'serpapi', 'receitaws']),
        days: z.number().optional().default(7),
      })
    )
    .query(async ({ input }) => {
      return getAPIHealthStats(input.apiName, input.days);
    }),

  /**
   * Obtém histórico de chamadas
   */
  history: publicProcedure
    .input(
      z.object({
        apiName: z.enum(['openai', 'serpapi', 'receitaws']).optional(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      return getAPIHealthHistory(input.apiName, input.limit);
    }),

  /**
   * Testa conectividade de uma API
   */
  test: publicProcedure
    .input(
      z.object({
        apiName: z.enum(['openai', 'serpapi', 'receitaws']),
      })
    )
    .mutation(async ({ input }) => {
      return testAPIConnection(input.apiName);
    }),
});
