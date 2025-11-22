import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

/**
 * Router para gerenciamento de agendamentos de relatórios
 * Fase 65.1 - Agendamento Automático de Relatórios
 */
export const reportsRouter = router({
  /**
   * Criar novo agendamento de relatório
   */
  createSchedule: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1, "Nome é obrigatório"),
        frequency: z.enum(["weekly", "monthly"]),
        recipients: z.array(z.string().email()).min(1, "Pelo menos um destinatário é obrigatório"),
        config: z.object({
          format: z.enum(["pdf", "excel", "csv"]).optional(),
          filters: z.any().optional(),
          includeCharts: z.boolean().optional(),
        }),
        nextRunAt: z.string(), // MySQL timestamp format
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { createReportSchedule } = await import("../db");
      
      const schedule = await createReportSchedule({
        userId: ctx.user.id,
        projectId: input.projectId,
        name: input.name,
        frequency: input.frequency,
        recipients: JSON.stringify(input.recipients),
        config: input.config,
        nextRunAt: input.nextRunAt,
        enabled: 1,
      });

      return schedule;
    }),

  /**
   * Listar agendamentos do usuário
   */
  getSchedules: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { getReportSchedules } = await import("../db");
      
      const schedules = await getReportSchedules(ctx.user.id, input.projectId);
      
      // Parse recipients JSON
      return schedules.map((schedule) => ({
        ...schedule,
        recipients: JSON.parse(schedule.recipients as string),
      }));
    }),

  /**
   * Buscar agendamento por ID
   */
  getScheduleById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getReportScheduleById } = await import("../db");
      
      const schedule = await getReportScheduleById(input.id);
      
      if (!schedule) {
        throw new Error("Agendamento não encontrado");
      }

      // Verificar se o usuário é o dono
      if (schedule.userId !== ctx.user.id) {
        throw new Error("Não autorizado");
      }

      return {
        ...schedule,
        recipients: JSON.parse(schedule.recipients as string),
      };
    }),

  /**
   * Atualizar agendamento
   */
  updateSchedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        frequency: z.enum(["weekly", "monthly"]).optional(),
        recipients: z.array(z.string().email()).optional(),
        config: z.any().optional(),
        nextRunAt: z.string().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getReportScheduleById, updateReportSchedule } = await import("../db");
      
      // Verificar se o usuário é o dono
      const existing = await getReportScheduleById(input.id);
      if (!existing || existing.userId !== ctx.user.id) {
        throw new Error("Não autorizado");
      }

      const updateData: any = {};
      
      if (input.name !== undefined) updateData.name = input.name;
      if (input.frequency !== undefined) updateData.frequency = input.frequency;
      if (input.recipients !== undefined) updateData.recipients = JSON.stringify(input.recipients);
      if (input.config !== undefined) updateData.config = input.config;
      if (input.nextRunAt !== undefined) updateData.nextRunAt = input.nextRunAt;
      if (input.enabled !== undefined) updateData.enabled = input.enabled ? 1 : 0;

      await updateReportSchedule(input.id, updateData);

      return { success: true };
    }),

  /**
   * Deletar agendamento
   */
  deleteSchedule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { getReportScheduleById, deleteReportSchedule } = await import("../db");
      
      // Verificar se o usuário é o dono
      const existing = await getReportScheduleById(input.id);
      if (!existing || existing.userId !== ctx.user.id) {
        throw new Error("Não autorizado");
      }

      await deleteReportSchedule(input.id);

      return { success: true };
    }),

  /**
   * Testar envio de relatório (preview)
   */
  testReport: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        config: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implementar geração de preview do relatório
      // Por enquanto, apenas retorna sucesso
      return {
        success: true,
        message: "Preview de relatório será implementado em breve",
      };
    }),
});
