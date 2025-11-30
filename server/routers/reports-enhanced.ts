import { z } from 'zod';
import { createTRPCRouter, publicProcedure, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { validateReportGeneration } from '@/server/utils/reportValidation';
import { fetchEnhancedReportData } from '@/server/utils/reportData';
import { buildEnhancedPrompt } from '@/server/utils/enhancedPromptBuilder';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced Reports Router - Geração de relatórios melhorados com IA
 */
export const reportsEnhancedRouter = createTRPCRouter({
  /**
   * Validar geração de relatório
   */
  validate: publicProcedure // TODO: Voltar para publicProcedure após corrigir auth
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      return await validateReportGeneration(input.pesquisaId);
    }),

  /**
   * Gerar relatório analítico melhorado de uma pesquisa
   */
  generateEnhancedReport: publicProcedure // TODO: Voltar para publicProcedure após corrigir auth
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      try {
        console.log('[Report] Starting enhanced report generation...');

        // 1. Validar
        const validation = await validateReportGeneration(input.pesquisaId);
        if (!validation.canGenerate) {
          throw new Error(validation.warning || 'Não é possível gerar relatório');
        }

        // 2. Buscar TODOS os dados
        console.log('[Report] Fetching all data...');
        const reportData = await fetchEnhancedReportData(
          db,
          input.pesquisaId,
          validation.status,
          validation.enrichmentData?.startedAt,
          validation.enrichmentData?.completedAt,
          validation.enrichmentData?.duration
        );

        // 3. Construir prompt melhorado
        console.log('[Report] Building enhanced prompt...');
        const prompt = buildEnhancedPrompt(reportData);

        // 4. Chamar OpenAI GPT-4o
        console.log('[Report] Calling OpenAI GPT-4o...');
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'Você é um analista de inteligência de mercado sênior especializado em gerar relatórios executivos profissionais, detalhados e baseados em dados concretos.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const analiseIA = completion.choices[0]?.message?.content || '';

        if (!analiseIA) {
          throw new Error('IA não retornou análise');
        }

        console.log('[Report] AI analysis generated successfully');

        // 5. Retornar dados completos
        return {
          success: true,
          reportData,
          analiseIA,
          metadata: {
            model: 'gpt-4o',
            tokens: completion.usage?.total_tokens || 0,
            cost: ((completion.usage?.total_tokens || 0) * 0.00001).toFixed(4),
            generatedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error('[Report] Error:', error);
        throw error;
      }
    }),
});
