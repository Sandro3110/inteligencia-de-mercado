import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { interpretationService } from "../services/interpretationService";
import { queryBuilderService } from "../services/queryBuilderService";
import {
  analysisService,
  AnalysisTemplateType,
} from "../services/analysisService";
import { csvRenderer } from "../renderers/CSVRenderer";
import { excelRenderer } from "../renderers/ExcelRenderer";
import { pdfListRenderer } from "../renderers/PDFListRenderer";
import { pdfReportRenderer } from "../renderers/PDFReportRenderer";
import { getDb } from "../db";
import { exportHistory, savedFiltersExport } from "../../drizzle/schema";
import crypto from "crypto";

/**
 * Router de exportação inteligente
 */
export const exportRouter = router({
  /**
   * 1. Interpreta contexto em linguagem natural
   */
  interpretContext: protectedProcedure
    .input(
      z.object({
        context: z.string(),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await interpretationService.interpret(
        input.context,
        input.projectId
      );
      return result;
    }),

  /**
   * 2. Valida filtros e estima volume
   */
  validateFilters: protectedProcedure
    .input(
      z.object({
        entityType: z.enum([
          "mercados",
          "clientes",
          "concorrentes",
          "leads",
          "produtos",
        ]),
        filters: z.any(),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const queryFilters = queryBuilderService.entitiesToFilters(
        { entityType: input.entityType, keywords: [], ...input.filters },
        input.projectId
      );

      const validation = await queryBuilderService.validate(queryFilters);
      return validation;
    }),

  /**
   * 3. Executa query e retorna dados
   */
  executeQuery: protectedProcedure
    .input(
      z.object({
        entityType: z.enum([
          "mercados",
          "clientes",
          "concorrentes",
          "leads",
          "produtos",
        ]),
        filters: z.any(),
        selectedFields: z.array(z.string()),
        projectId: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const queryFilters = queryBuilderService.entitiesToFilters(
        { entityType: input.entityType, keywords: [], ...input.filters },
        input.projectId
      );

      if (input.limit) {
        queryFilters.limit = input.limit;
      }

      const query = queryBuilderService.build(
        queryFilters,
        input.selectedFields
      );
      const data = await queryBuilderService.execute(query);

      return {
        data,
        count: data.length,
        query,
      };
    }),

  /**
   * 4. Gera insights com IA
   */
  generateInsights: protectedProcedure
    .input(
      z.object({
        data: z.array(z.any()),
        templateType: z.enum(["market", "client", "competitive", "lead"]),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const analysis = await analysisService.analyze(
        input.data,
        input.templateType as AnalysisTemplateType,
        input.context
      );

      return analysis;
    }),

  /**
   * 5. Renderiza saída no formato escolhido
   */
  renderOutput: protectedProcedure
    .input(
      z.object({
        data: z.array(z.any()),
        format: z.enum(["csv", "excel", "pdf", "json"]),
        outputType: z.enum(["simple", "complete", "report"]),
        selectedFields: z.array(z.string()),
        title: z.string().optional(),
        analysis: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      let result: { url: string; size: number };

      try {
        // Renderiza conforme formato e tipo
        if (input.format === "csv") {
          result = await csvRenderer.render(input.data, input.selectedFields);
        } else if (input.format === "excel") {
          result = await excelRenderer.render(input.data, input.selectedFields);
        } else if (input.format === "pdf") {
          if (input.outputType === "report" && input.analysis) {
            result = await pdfReportRenderer.render(
              input.title || "Relatório",
              input.analysis,
              input.data
            );
          } else {
            result = await pdfListRenderer.render(
              input.data,
              input.selectedFields,
              input.title || "Exportação"
            );
          }
        } else {
          // JSON
          const json = JSON.stringify(input.data, null, 2);
          const buffer = Buffer.from(json, "utf-8");
          const { storagePut } = await import("../storage");
          const filename = `export_${Date.now()}.json`;
          const { url } = await storagePut(
            `exports/${filename}`,
            buffer,
            "application/json"
          );
          result = { url, size: buffer.length };
        }

        const generationTime = Math.floor((Date.now() - startTime) / 1000);

        // Salvar no histórico
        const db = await getDb();
        if (db) {
          await db.insert(exportHistory).values({
            id: crypto.randomBytes(16).toString("hex"),
            userId: ctx.user.id,
            context: input.title || "",
            filters: input.data.length > 0 ? { count: input.data.length } : {},
            format: input.format === "json" ? "csv" : input.format,
            outputType: input.outputType === "simple" ? "list" : "report",
            recordCount: input.data.length,
            fileUrl: result.url,
            fileSize: result.size,
            generationTime,
          });
        }

        return {
          ...result,
          generationTime,
        };
      } catch (error) {
        console.error("[ExportRouter] Erro ao renderizar:", error);
        throw new Error("Falha ao gerar arquivo de exportação");
      }
    }),

  /**
   * 6. Lista histórico de exportações
   */
  listHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { history: [], total: 0 };
      }

      try {
        const { exportHistory } = await import("../../drizzle/schema");

        const history = await db
          .select()
          .from(exportHistory)
          .where(eq(exportHistory.userId, ctx.user.id))
          .orderBy(desc(exportHistory.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(exportHistory)
          .where(eq(exportHistory.userId, ctx.user.id));

        return {
          history,
          total: countResult?.count || 0,
        };
      } catch (error) {
        console.error("[ExportRouter] Erro ao listar histórico:", error);
        return { history: [], total: 0 };
      }
    }),

  /**
   * Exporta mercados para Excel
   */
  mercados: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { getMercados } = await import("../db");
      const mercados = await getMercados({ projectId: input.projectId });

      const result = await excelRenderer.render(mercados, [
        "id",
        "nome",
        "descricao",
        "categoria",
        "segmentacao",
        "tamanhoEstimado",
        "crescimentoAnual",
        "tendencias",
        "principaisPlayers",
        "createdAt",
      ]);

      return result;
    }),

  /**
   * Deleta histórico de exportação
   */
  deleteHistory: protectedProcedure
    .input(
      z.object({
        historyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .delete(exportHistory)
        .where(eq(exportHistory.id, input.historyId));

      return { success: true };
    }),

  /**
   * Busca campos disponíveis para uma entidade
   */
  getAvailableFields: protectedProcedure
    .input(
      z.object({
        entityType: z.enum([
          "mercados",
          "clientes",
          "concorrentes",
          "leads",
          "produtos",
        ]),
      })
    )
    .query(async ({ input }) => {
      const fieldMap: Record<string, string[]> = {
        mercados: [
          "id",
          "nome",
          "descricao",
          "uf",
          "cidade",
          "porte",
          "quality_score",
          "status",
          "createdAt",
        ],
        clientes: [
          "id",
          "nome",
          "cnpj",
          "uf",
          "cidade",
          "porte",
          "faturamento_estimado",
          "segmentacao",
          "quality_score",
          "status",
          "createdAt",
        ],
        concorrentes: [
          "id",
          "nome",
          "cnpj",
          "uf",
          "cidade",
          "porte",
          "quality_score",
          "status",
          "createdAt",
        ],
        leads: [
          "id",
          "nome",
          "cnpj",
          "uf",
          "cidade",
          "porte",
          "quality_score",
          "status",
          "createdAt",
        ],
        produtos: [
          "id",
          "nome",
          "descricao",
          "categoria",
          "preco_estimado",
          "createdAt",
        ],
      };

      return {
        fields: fieldMap[input.entityType] || [],
      };
    }),
});

// Imports necessários para o histórico
import { eq, desc, sql } from "drizzle-orm";
