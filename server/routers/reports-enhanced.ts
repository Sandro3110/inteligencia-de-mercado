import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { validateReportGeneration } from '@/server/utils/reportValidation';
import { fetchEnhancedReportData } from '@/server/utils/reportData';
import { buildEnhancedPrompt } from '@/server/utils/enhancedPromptBuilder';
import { generatePDF, PDFData, PDFSection } from '@/server/utils/pdfGenerator';
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

        // 5. Parsear seções do texto
        const sections: PDFSection[] = [];
        const sectionTitles = [
          'Resumo Executivo',
          'Análise de Mercados',
          'Perfil de Clientes',
          'Análise de Produtos',
          'Análise de Leads',
          'Panorama Competitivo',
          'Análise SWOT',
          'Distribuição Geográfica',
          'Recomendações Estratégicas',
        ];

        const currentText = analiseIA;
        for (const title of sectionTitles) {
          const regex = new RegExp(`\\*\\*${title}\\*\\*[:\\s]*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
          const match = currentText.match(regex);
          if (match && match[1]) {
            sections.push({
              title,
              content: match[1].trim(),
            });
          }
        }

        // Se não conseguiu parsear, usar texto completo
        if (sections.length === 0) {
          sections.push({
            title: 'Análise Completa',
            content: analiseIA,
          });
        }

        // 6. Gerar PDF usando função unificada
        const pdfData: PDFData = {
          title: 'Relatório Analítico de Inteligência de Mercado',
          subtitle: reportData.metadata.nome,
          date: new Date().toLocaleDateString('pt-BR'),
          statistics: [
            { label: 'Total de Clientes', value: reportData.clientes.total },
            { label: 'Total de Leads', value: reportData.leads.total },
            { label: 'Total de Mercados', value: reportData.mercados.total },
            { label: 'Total de Concorrentes', value: reportData.concorrentes.total },
            { label: 'Produtos Identificados', value: reportData.produtos.total },
          ],
          sections,
        };

        const pdfBuffer = generatePDF(pdfData);

        // 7. Retornar PDF como base64
        const pdfBase64 = pdfBuffer.toString('base64');

        return {
          success: true,
          pdf: pdfBase64,
          filename: `relatorio-pesquisa-${input.pesquisaId}-${Date.now()}.pdf`,
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
