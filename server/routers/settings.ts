import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { llmProviderConfigs } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const settingsRouter = router({
  // Buscar configurações de LLM do projeto
  getLlmConfig: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error('Database not available');

      const [config] = await db
        .select()
        .from(llmProviderConfigs)
        .where(eq(llmProviderConfigs.projectId, input.projectId))
        .limit(1);

      return config || null;
    }),

  // Salvar/atualizar configurações de LLM
  saveLlmConfig: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        activeProvider: z.enum(['openai', 'gemini', 'anthropic']),
        openaiApiKey: z.string().optional(),
        openaiModel: z.string().optional(),
        openaiEnabled: z.boolean().optional(),
        geminiApiKey: z.string().optional(),
        geminiModel: z.string().optional(),
        geminiEnabled: z.boolean().optional(),
        anthropicApiKey: z.string().optional(),
        anthropicModel: z.string().optional(),
        anthropicEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error('Database not available');

      // Verificar se já existe
      const [existing] = await db
        .select()
        .from(llmProviderConfigs)
        .where(eq(llmProviderConfigs.projectId, input.projectId))
        .limit(1);

      if (existing) {
        // Atualizar
        await db
          .update(llmProviderConfigs)
          .set({
            activeProvider: input.activeProvider,
            openaiApiKey: input.openaiApiKey,
            openaiModel: input.openaiModel,
            openaiEnabled: input.openaiEnabled ? 1 : 0,
            geminiApiKey: input.geminiApiKey,
            geminiModel: input.geminiModel,
            geminiEnabled: input.geminiEnabled ? 1 : 0,
            anthropicApiKey: input.anthropicApiKey,
            anthropicModel: input.anthropicModel,
            anthropicEnabled: input.anthropicEnabled ? 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(llmProviderConfigs.projectId, input.projectId));

        return { success: true, action: 'updated' };
      } else {
        // Inserir
        await db.insert(llmProviderConfigs).values({
          projectId: input.projectId,
          activeProvider: input.activeProvider,
          openaiApiKey: input.openaiApiKey,
          openaiModel: input.openaiModel || 'gpt-4o',
          openaiEnabled: input.openaiEnabled ? 1 : 0,
          geminiApiKey: input.geminiApiKey,
          geminiModel: input.geminiModel || 'gemini-2.0-flash-exp',
          geminiEnabled: input.geminiEnabled ? 1 : 0,
          anthropicApiKey: input.anthropicApiKey,
          anthropicModel: input.anthropicModel || 'claude-3-5-sonnet-20241022',
          anthropicEnabled: input.anthropicEnabled ? 1 : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return { success: true, action: 'created' };
      }
    }),

  // Testar conexão com provider
  testLlmConnection: protectedProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'gemini', 'anthropic']),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.provider === 'openai') {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              Authorization: `Bearer ${input.apiKey}`,
            },
          });

          if (response.ok) {
            return { success: true, message: 'Conexão com OpenAI estabelecida com sucesso' };
          } else {
            const error = await response.json();
            return {
              success: false,
              message: error.error?.message || 'Erro ao conectar com OpenAI',
            };
          }
        }

        // TODO: Implementar testes para Gemini e Anthropic
        return { success: false, message: 'Provider não implementado ainda' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }),
});
