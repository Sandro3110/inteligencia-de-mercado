import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import {
  enrichmentJobs,
  pesquisas,
  clientes,
  mercadosUnicos,
  concorrentes,
  leads,
  produtos,
  systemSettings,
} from '@/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import { logEnrichmentCompleted, logEnrichmentFailed } from '@/server/utils/auditLog';

// Sistema V2: Importar prompts modulares
import {
  prompt1_enriquecerCliente,
  prompt2_identificarMercado,
  prompt3_enriquecerMercado,
  prompt2b_identificarProdutos,
  prompt4_identificarConcorrentes,
  prompt5_identificarLeads,
} from './prompts_v2';
import { geocodificar } from './geocoding';
import type { ClienteInput } from './types';

interface Cliente {
  id: number;
  nome: string;
  cnpj?: string | null;
  produtoPrincipal?: string | null;
  siteOficial?: string | null;
  cidade?: string | null;
  uf?: string | null;
  segmentacaoB2BB2C?: string | null;
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
 * Processar enriquecimento em background usando Sistema V2
 */
async function processEnrichment(jobId: number, pesquisaId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  const startTime = Date.now();

  try {
    console.log(`[Enrichment V2] 🚀 Starting job ${jobId} for pesquisa ${pesquisaId}`);

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

    console.log(
      `[Enrichment V2] 📊 Processing ${clientesToEnrich.length} clientes for job ${jobId}`
    );

    // 5. Processar cada cliente com Sistema V2
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const cliente of clientesToEnrich) {
      const clienteStartTime = Date.now();

      // Check if job is paused
      const [currentJob] = await db
        .select()
        .from(enrichmentJobs)
        .where(eq(enrichmentJobs.id, jobId));

      if (currentJob?.status === 'paused') {
        console.log(`[Enrichment V2] ⏸️  Job ${jobId} paused, stopping processing`);
        break;
      }

      try {
        console.log(`\n[Enrichment V2] 🔄 Processing cliente ${cliente.id}: ${cliente.nome}`);

        // ========================================
        // SISTEMA V2: 13 ETAPAS DE ENRIQUECIMENTO
        // ========================================

        // ETAPA 1: Enriquecer Cliente
        console.log(`[Enrichment V2] 📝 Step 1/13: Enriquecer cliente...`);
        const clienteInput: ClienteInput = {
          nome: cliente.nome,
          cnpj: cliente.cnpj,
          produtoPrincipal: cliente.produtoPrincipal,
          siteOficial: cliente.siteOficial,
          cidade: cliente.cidade,
          uf: cliente.uf,
          segmentacaoB2BB2C: cliente.segmentacaoB2BB2C,
        };

        const clienteEnriquecido = await prompt1_enriquecerCliente(clienteInput, apiKey);
        console.log(
          `[Enrichment V2] ✅ Cliente enriquecido: ${clienteEnriquecido.cidade}, ${clienteEnriquecido.uf}`
        );

        // ETAPA 2: Geocodificar
        console.log(`[Enrichment V2] 📍 Step 2/13: Geocodificar...`);
        let latitude: number | undefined;
        let longitude: number | undefined;

        if (clienteEnriquecido.cidade && clienteEnriquecido.uf) {
          const coords = await geocodificar(clienteEnriquecido.cidade, clienteEnriquecido.uf);
          if (coords) {
            latitude = coords.lat;
            longitude = coords.lng;
            console.log(`[Enrichment V2] ✅ Coordenadas: ${latitude}, ${longitude}`);
          } else {
            console.log(`[Enrichment V2] ⚠️  Geocodificação falhou (continuando sem coordenadas)`);
          }
        }

        // ETAPA 3: Gravar Cliente Enriquecido
        console.log(`[Enrichment V2] 💾 Step 3/13: Gravar cliente...`);
        await db
          .update(clientes)
          .set({
            nome: clienteEnriquecido.nome,
            cnpj: clienteEnriquecido.cnpj,
            siteOficial: clienteEnriquecido.site,
            cidade: clienteEnriquecido.cidade,
            uf: clienteEnriquecido.uf,
            setor: clienteEnriquecido.setor,
            descricao: clienteEnriquecido.descricao,
            latitude,
            longitude,
            validationStatus: 'approved',
          })
          .where(eq(clientes.id, cliente.id));
        console.log(`[Enrichment V2] ✅ Cliente gravado`);

        // ETAPA 4: Identificar Mercado
        console.log(`[Enrichment V2] 🌍 Step 4/13: Identificar mercado...`);
        const mercado = await prompt2_identificarMercado(clienteEnriquecido, apiKey);
        console.log(`[Enrichment V2] ✅ Mercado identificado: ${mercado.nome}`);

        // ETAPA 5: Gravar Mercado
        console.log(`[Enrichment V2] 💾 Step 5/13: Gravar mercado...`);
        const [mercadoInserido] = await db
          .insert(mercadosUnicos)
          .values({
            pesquisaId,
            projectId: pesquisa.projectId,
            nome: mercado.nome,
            categoria: mercado.categoria,
            segmentacao: mercado.segmentacao,
            tamanhoMercado: mercado.tamanhoMercado,
            quantidadeClientes: 1,
          })
          .returning();
        console.log(`[Enrichment V2] ✅ Mercado gravado (ID: ${mercadoInserido.id})`);

        // ETAPA 6: Enriquecer Mercado
        console.log(`[Enrichment V2] 📈 Step 6/13: Enriquecer mercado...`);
        const mercadoEnriquecido = await prompt3_enriquecerMercado(mercado, apiKey);
        console.log(
          `[Enrichment V2] ✅ Mercado enriquecido: ${mercadoEnriquecido.tendencias.length} tendências, ${mercadoEnriquecido.principaisPlayers.length} players`
        );

        // ETAPA 7: Atualizar Mercado
        console.log(`[Enrichment V2] 💾 Step 7/13: Atualizar mercado...`);
        await db
          .update(mercadosUnicos)
          .set({
            crescimentoAnual: mercadoEnriquecido.crescimentoAnual,
            tendencias: JSON.stringify(mercadoEnriquecido.tendencias),
            principaisPlayers: JSON.stringify(mercadoEnriquecido.principaisPlayers),
          })
          .where(eq(mercadosUnicos.id, mercadoInserido.id));
        console.log(`[Enrichment V2] ✅ Mercado atualizado`);

        // ETAPA 8: Identificar Produtos
        console.log(`[Enrichment V2] 📦 Step 8/13: Identificar produtos...`);
        const produtosIdentificados = await prompt2b_identificarProdutos(
          clienteEnriquecido,
          apiKey
        );
        console.log(`[Enrichment V2] ✅ ${produtosIdentificados.length} produtos identificados`);

        // ETAPA 9: Gravar Produtos
        console.log(`[Enrichment V2] 💾 Step 9/13: Gravar produtos...`);
        for (const produto of produtosIdentificados) {
          await db.insert(produtos).values({
            projectId: pesquisa.projectId,
            pesquisaId,
            clienteId: cliente.id,
            mercadoId: mercadoInserido.id,
            nome: produto.nome,
            descricao: produto.descricao,
            categoria: produto.publicoAlvo,
            ativo: 1,
          });
        }
        console.log(`[Enrichment V2] ✅ ${produtosIdentificados.length} produtos gravados`);

        // ETAPA 10: Identificar Concorrentes
        console.log(`[Enrichment V2] 🏢 Step 10/13: Identificar concorrentes...`);
        const concorrentesIdentificados = await prompt4_identificarConcorrentes(
          mercadoEnriquecido,
          clienteEnriquecido,
          apiKey
        );
        console.log(
          `[Enrichment V2] ✅ ${concorrentesIdentificados.length} concorrentes identificados`
        );

        // ETAPA 11: Gravar Concorrentes
        console.log(`[Enrichment V2] 💾 Step 11/13: Gravar concorrentes...`);
        for (const concorrente of concorrentesIdentificados) {
          await db.insert(concorrentes).values({
            pesquisaId,
            projectId: pesquisa.projectId,
            mercadoId: mercadoInserido.id,
            nome: concorrente.nome,
            cnpj: concorrente.cnpj,
            site: concorrente.site,
            cidade: concorrente.cidade,
            uf: concorrente.uf,
            produto: concorrente.produtoPrincipal,
          });
        }
        console.log(`[Enrichment V2] ✅ ${concorrentesIdentificados.length} concorrentes gravados`);

        // ETAPA 12: Identificar Leads (COM CICLO FECHADO)
        console.log(`[Enrichment V2] 🎯 Step 12/13: Identificar leads (ciclo fechado)...`);
        const leadsIdentificados = await prompt5_identificarLeads(
          mercadoEnriquecido,
          clienteEnriquecido,
          concorrentesIdentificados,
          produtosIdentificados,
          apiKey
        );
        console.log(`[Enrichment V2] ✅ ${leadsIdentificados.length} leads identificados`);

        // Contar leads de players
        const leadsDePlayersCount = leadsIdentificados.filter(
          (l) => l.fonte === 'PLAYER_DO_MERCADO'
        ).length;
        console.log(
          `[Enrichment V2] 🔄 Ciclo fechado: ${leadsDePlayersCount}/${leadsIdentificados.length} leads de players (${Math.round((leadsDePlayersCount / leadsIdentificados.length) * 100)}%)`
        );

        // ETAPA 13: Gravar Leads
        console.log(`[Enrichment V2] 💾 Step 13/13: Gravar leads...`);
        for (const lead of leadsIdentificados) {
          await db.insert(leads).values({
            pesquisaId,
            projectId: pesquisa.projectId,
            mercadoId: mercadoInserido.id,
            nome: lead.nome,
            cnpj: lead.cnpj,
            site: lead.site,
            cidade: lead.cidade,
            uf: lead.uf,
            regiao: lead.cidade,
            setor: lead.produtoInteresse,
          });
        }
        console.log(`[Enrichment V2] ✅ ${leadsIdentificados.length} leads gravados`);

        // ========================================
        // FIM DO PROCESSO V2
        // ========================================

        const clienteDuration = Math.floor((Date.now() - clienteStartTime) / 1000);
        console.log(
          `[Enrichment V2] ✅ Cliente ${cliente.id} processado com sucesso em ${clienteDuration}s`
        );

        successCount++;
      } catch (error) {
        console.error(`[Enrichment V2] ❌ Error processing cliente ${cliente.id}:`, error);
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
    const [produtosCount] = await db
      .select({ value: count() })
      .from(produtos)
      .where(eq(produtos.pesquisaId, pesquisaId));
    const [mercadosCount] = await db
      .select({ value: count() })
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.pesquisaId, pesquisaId));

    const duration = Math.floor((Date.now() - startTime) / 1000);

    // 10. Registrar log de auditoria
    await logEnrichmentCompleted({
      pesquisaId,
      pesquisaNome: pesquisa.nome,
      duration,
      clientesProcessados: processedCount,
      clientesSucesso: successCount,
      clientesFalha: failedCount,
      metricas: {
        concorrentes: concorrentesCount?.value || 0,
        leads: leadsCount?.value || 0,
        produtos: produtosCount?.value || 0,
        mercados: mercadosCount?.value || 0,
      },
    });

    console.log(
      `[Enrichment V2] 🎉 Job ${jobId} completed: ${successCount} success, ${failedCount} failed in ${duration}s`
    );
    console.log(
      `[Enrichment V2] 📊 Métricas: ${mercadosCount?.value || 0} mercados, ${produtosCount?.value || 0} produtos, ${concorrentesCount?.value || 0} concorrentes, ${leadsCount?.value || 0} leads`
    );
  } catch (error) {
    console.error(`[Enrichment V2] ❌ Job ${jobId} failed:`, error);

    // Mark job as failed
    await db
      .update(enrichmentJobs)
      .set({
        status: 'failed',
        completedAt: new Date().toISOString(),
      })
      .where(eq(enrichmentJobs.id, jobId));

    // Log failure
    const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, pesquisaId));
    await logEnrichmentFailed({
      pesquisaId,
      pesquisaNome: pesquisa?.nome || 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
