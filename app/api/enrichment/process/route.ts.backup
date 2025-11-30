import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import {
  enrichmentJobs,
  pesquisas,
  clientes,
  mercadosUnicos,
  concorrentes,
  leads,
  systemSettings,
} from '@/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import { logEnrichmentCompleted, logEnrichmentFailed } from '@/server/utils/auditLog';

interface Cliente {
  id: number;
  nome: string;
  cnpj?: string | null;
  produtoPrincipal?: string | null;
  siteOficial?: string | null;
  cidade?: string | null;
}

/**
 * API Route para processar enriquecimento em background
 * POST /api/enrichment/process
 */
export async function POST(request: NextRequest) {
  try {
    const { jobId, pesquisaId } = await request.json();

    if (!jobId || !pesquisaId) {
      return NextResponse.json({ error: 'Missing jobId or pesquisaId' }, { status: 400 });
    }

    // Process in background (don't await)
    processEnrichment(jobId, pesquisaId).catch((err) => {
      console.error('[Enrichment] Background processing error:', err);
    });

    return NextResponse.json({ success: true, message: 'Processing started' });
  } catch (error) {
    console.error('[Enrichment API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Processar enriquecimento em background
 */
async function processEnrichment(jobId: number, pesquisaId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    // 1. Buscar API key do banco
    const [openaiSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, 'OPENAI_API_KEY'))
      .limit(1);

    if (!openaiSetting || !openaiSetting.settingValue) {
      throw new Error('OpenAI API key not configured in database');
    }

    const apiKey = openaiSetting.settingValue;

    // 2. Buscar job
    const [job] = await db.select().from(enrichmentJobs).where(eq(enrichmentJobs.id, jobId));

    if (!job) {
      throw new Error('Job not found');
    }

    // 3. Buscar pesquisa
    const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, pesquisaId));

    if (!pesquisa) {
      throw new Error('Pesquisa not found');
    }

    // 4. Buscar clientes não enriquecidos
    const clientesToEnrich = await db
      .select()
      .from(clientes)
      .where(eq(clientes.pesquisaId, pesquisaId))
      .limit(job.totalClientes);

    console.log(`[Enrichment] Processing ${clientesToEnrich.length} clientes for job ${jobId}`);

    // 5. Processar cada cliente
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const cliente of clientesToEnrich) {
      // Check if job is paused
      const [currentJob] = await db
        .select()
        .from(enrichmentJobs)
        .where(eq(enrichmentJobs.id, jobId));

      if (currentJob?.status === 'paused') {
        console.log(`[Enrichment] Job ${jobId} paused, stopping processing`);
        break;
      }

      try {
        // Call OpenAI
        const enrichmentData = await generateAllDataOptimized(
          {
            nome: cliente.nome,
            cnpj: cliente.cnpj || undefined,
            produtoPrincipal: cliente.produtoPrincipal || undefined,
            siteOficial: cliente.siteOficial || undefined,
            cidade: cliente.cidade || undefined,
          },
          apiKey
        );

        // 6. Salvar dados enriquecidos
        // Update cliente
        await db
          .update(clientes)
          .set({
            ...enrichmentData.clienteEnriquecido,
            validationStatus: 'approved',
          })
          .where(eq(clientes.id, cliente.id));

        // Insert mercados, concorrentes, leads
        for (const mercadoData of enrichmentData.mercados) {
          // Insert mercado
          const [mercado] = await db
            .insert(mercadosUnicos)
            .values({
              pesquisaId,
              projectId: pesquisa.projectId,
              nome: mercadoData.mercado.nome,
              categoria: mercadoData.mercado.categoria,
              segmentacao: mercadoData.mercado.segmentacao,
              tamanhoEstimado: mercadoData.mercado.tamanhoEstimado,
              quantidadeClientes: 1,
            })
            .returning();

          // Insert concorrentes
          for (const concorrenteData of mercadoData.concorrentes) {
            await db.insert(concorrentes).values({
              pesquisaId,
              projectId: pesquisa.projectId,
              mercadoId: mercado.id,
              ...concorrenteData,
            });
          }

          // Insert leads
          for (const leadData of mercadoData.leads) {
            await db.insert(leads).values({
              pesquisaId,
              projectId: pesquisa.projectId,
              mercadoId: mercado.id,
              setor: leadData.segmento,
              qualidadeClassificacao: leadData.potencial,
              ...leadData,
            });
          }
        }

        successCount++;
      } catch (error) {
        console.error(`[Enrichment] Error processing cliente ${cliente.id}:`, error);
        failedCount++;
      }

      processedCount++;

      // Update job progress
      await db
        .update(enrichmentJobs)
        .set({
          processedClientes: processedCount,
          successClientes: successCount,
          failedClientes: failedCount,
        })
        .where(eq(enrichmentJobs.id, jobId));

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 7. Mark job as completed
    await db
      .update(enrichmentJobs)
      .set({
        status: 'completed',
        completedAt: new Date().toISOString(),
      })
      .where(eq(enrichmentJobs.id, jobId));

    // 8. Update pesquisa
    await db
      .update(pesquisas)
      .set({
        status: 'enriquecido',
        clientesEnriquecidos: successCount,
      })
      .where(eq(pesquisas.id, pesquisaId));

    // 9. Coletar métricas finais
    const [concorrentesCount] = await db
      .select({ value: count() })
      .from(concorrentes)
      .where(eq(concorrentes.pesquisaId, pesquisaId));
    const [leadsCount] = await db
      .select({ value: count() })
      .from(leads)
      .where(eq(leads.pesquisaId, pesquisaId));
    const [mercadosCount] = await db
      .select({ value: count() })
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.pesquisaId, pesquisaId));

    const duration = Math.floor((Date.now() - new Date(job.startedAt).getTime()) / 1000);

    // 10. Registrar log de auditoria
    await logEnrichmentCompleted({
      pesquisaId,
      pesquisaNome: pesquisa.nome,
      duration,
      clientesProcessados: processedCount,
      clientesSucesso: successCount,
      clientesFalha: failedCount,
      metricas: {
        concorrentes: concorrentesCount[0]?.value || 0,
        leads: leadsCount[0]?.value || 0,
        produtos: 0,
        mercados: mercadosCount[0]?.value || 0,
      },
    });

    console.log(
      `[Enrichment] Job ${jobId} completed: ${successCount} success, ${failedCount} failed`
    );
  } catch (error) {
    console.error(`[Enrichment] Job ${jobId} failed:`, error);

    // Mark job as failed
    await db
      .update(enrichmentJobs)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      })
      .where(eq(enrichmentJobs.id, jobId));

    // Registrar log de falha
    const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, pesquisaId));
    if (pesquisa) {
      await logEnrichmentFailed({
        pesquisaId,
        pesquisaNome: pesquisa.nome,
        error: error instanceof Error ? error.message : 'Unknown error',
        clientesProcessados: 0,
      });
    }
  }
}

/**
 * Gera TODOS os dados de enriquecimento em UMA ÚNICA chamada OpenAI
 * (Simplified version with API key parameter)
 */
async function generateAllDataOptimized(cliente: Cliente, apiKey: string): Promise<any> {
  const systemPrompt = `Você é um especialista em pesquisa de mercado B2B brasileiro.

Analise a empresa fornecida e retorne um JSON com:
1. Dados enriquecidos do cliente
2. Mercados que atende
3. Concorrentes principais
4. Leads potenciais

Retorne APENAS JSON válido, sem markdown.`;

  const userPrompt = `Empresa: ${cliente.nome}
${cliente.cnpj ? `CNPJ: ${cliente.cnpj}` : ''}
${cliente.cidade ? `Cidade: ${cliente.cidade}` : ''}
${cliente.produtoPrincipal ? `Produto: ${cliente.produtoPrincipal}` : ''}

Gere dados de inteligência de mercado para esta empresa.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 5000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  return JSON.parse(content);
}
