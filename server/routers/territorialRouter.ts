import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateTerritorialReportPDF,
  type TerritorialReportData,
} from "../pdfGenerator";

export const territorialRouter = router({
  // Heatmap de Concentração Territorial - Fase 65.3
  getDensity: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { getTerritorialDensity } = await import('../db');
      return getTerritorialDensity(input.projectId, input.pesquisaId, input.entityType);
    }),

  getDensityStats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { getDensityStatsByRegion } = await import('../db');
      return getDensityStatsByRegion(input.projectId, input.pesquisaId);
    }),

  generateReport: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        projectName: z.string(),
        totalStates: z.number(),
        totalCities: z.number(),
        totalClients: z.number(),
        totalCompetitors: z.number(),
        totalLeads: z.number(),
        stateRanking: z.array(
          z.object({
            state: z.string(),
            clients: z.number(),
            competitors: z.number(),
            leads: z.number(),
            score: z.number(),
          })
        ),
        cityRanking: z.array(
          z.object({
            city: z.string(),
            state: z.string(),
            clients: z.number(),
            competitors: z.number(),
            leads: z.number(),
            score: z.number(),
          })
        ),
        insights: z.array(z.string()),
        recommendations: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const reportData: TerritorialReportData = {
        projectName: input.projectName,
        totalStates: input.totalStates,
        totalCities: input.totalCities,
        totalClients: input.totalClients,
        totalCompetitors: input.totalCompetitors,
        totalLeads: input.totalLeads,
        stateRanking: input.stateRanking,
        cityRanking: input.cityRanking,
        insights: input.insights,
        recommendations: input.recommendations,
        generatedAt: new Date(),
      };

      const pdfBuffer = await generateTerritorialReportPDF(reportData);

      // Converter para base64 para enviar ao cliente
      const pdfBase64 = pdfBuffer.toString("base64");

      return {
        success: true,
        pdf: pdfBase64,
        filename: `relatorio-territorial-${input.projectName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`,
      };
    }),
});
