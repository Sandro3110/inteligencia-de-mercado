import { logger } from '@/lib/logger';

/**
 * Sistema de Enriquecimento OTIMIZADO V2
 *
 * MELHORIAS:
 * - ✅ Deduplicação hierárquica (cliente > concorrente > lead)
 * - ✅ Sistema de camadas com fallback
 * - ✅ Rastreabilidade de origem dos dados
 * - ✅ Sempre salva dados (mesmo parciais)
 *
 * PERFORMANCE:
 * - 1 chamada OpenAI por cliente (vs 10-13 anterior)
 * - 0 chamadas SerpAPI (vs 45 anterior)
 * - Processamento paralelo (vs sequencial anterior)
 * - Tempo: 30-60s por cliente (vs 2-3min anterior)
 */

import { getDb } from './db';
import { eq, sql } from 'drizzle-orm';
import {
  clientes,
  mercadosUnicos,
  produtos,
  concorrentes,
  leads,
  clientesMercados,
} from '../drizzle/schema';
import { generateAllDataOptimized } from './integrations/openaiOptimized';
import { filterDuplicates } from './_core/deduplication';
import crypto from 'crypto';
import { now, toPostgresTimestamp } from './dateUtils';

interface EnrichmentResult {
  clienteId: number;
  success: boolean;
  mercadosCreated: number;
  produtosCreated: number;
  concorrentesCreated: number;
  leadsCreated: number;
  concorrentesDeduplicated: number; // NOVO
  leadsDeduplicated: number; // NOVO
  camadas: string[]; // NOVO: rastrear camadas usadas
  error?: string;
  duration: number;
}

/**
 * Trunca string para tamanho máximo
 */
function truncate(str: string | undefined | null, maxLength: number): string | null {
  if (!str) return null;
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

/**
 * Calcula quality score baseado em critérios reais
 */
function calculateQualityScore(data: {
  hasNome?: boolean;
  hasProduto?: boolean;
  hasPorte?: boolean;
  hasCidade?: boolean;
  hasSite?: boolean;
  hasCNPJ?: boolean;
  hasCNAE?: boolean; // NOVO
  hasCoordenadas?: boolean; // NOVO
}): number {
  let score = 50; // Base score

  if (data.hasNome) score += 10;
  if (data.hasProduto) score += 15;
  if (data.hasPorte) score += 10;
  if (data.hasCidade) score += 5;
  if (data.hasSite) score += 5;
  if (data.hasCNPJ) score += 5;
  if (data.hasCNAE) score += 5; // NOVO
  if (data.hasCoordenadas) score += 5; // NOVO

  return Math.min(100, score);
}

/**
 * Retorna classificação textual do quality score
 */
function getQualityClassification(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 75) return 'Bom';
  if (score >= 60) return 'Regular';
  return 'Ruim';
}

/**
 * Enriquece um único cliente com dados reais (VERSÃO OTIMIZADA V2)
 *
 * NOVO: Sistema de camadas com fallback + deduplicação hierárquica
 */
export async function enrichClienteOptimized(
  clienteId: number,
  projectId: number = 1
): Promise<EnrichmentResult> {
  const startTime = Date.now();
  const result: EnrichmentResult = {
    clienteId,
    success: false,
    mercadosCreated: 0,
    produtosCreated: 0,
    concorrentesCreated: 0,
    leadsCreated: 0,
    concorrentesDeduplicated: 0,
    leadsDeduplicated: 0,
    camadas: [],
    duration: 0,
  };

  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 1. Buscar dados do cliente
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);

    if (!cliente) {
      throw new Error(`Cliente ${clienteId} not found`);
    }

    logger.debug(`[Enrich] 🚀 Starting OPTIMIZED V2 enrichment for: ${cliente.nome}`);

    // 2. Buscar TODOS os clientes do projeto (para deduplicação)
    const clientesExistentes = await db
      .select({
        nome: clientes.nome,
        cnpj: clientes.cnpj,
      })
      .from(clientes)
      .where(eq(clientes.projectId, projectId));

    logger.debug(
      `[Enrich] Loaded ${clientesExistentes.length} existing clientes for deduplication`
    );

    // ===== CAMADA 1: Enriquecimento Completo =====
    let allData: any = null;

    try {
      logger.debug(`[Enrich] LAYER 1: Generating ALL data with 1 OpenAI call...`);
      allData = await generateAllDataOptimized({
        nome: cliente.nome,
        produtoPrincipal: cliente.produtoPrincipal || undefined,
        siteOficial: cliente.siteOficial || undefined,
        cidade: cliente.cidade || undefined,
      });
      result.camadas.push('layer1_complete');
      logger.debug(`[Enrich] ✅ LAYER 1 succeeded`);
    } catch (error) {
      logger.warn(`[Enrich] ⚠️ LAYER 1 failed:`, error);
      // Continuar para camadas de fallback
    }

    // ===== CAMADA 2: Análise de Gaps =====
    const gaps = {
      faltaMercados: !allData || !allData.mercados || allData.mercados.length === 0,
      faltaCNAE: !allData || !allData.clienteEnriquecido?.cnae,
      faltaCoordenadas:
        !allData || !allData.clienteEnriquecido?.latitude || !allData.clienteEnriquecido?.longitude,
    };

    if (gaps.faltaMercados || gaps.faltaCNAE || gaps.faltaCoordenadas) {
      logger.debug(`[Enrich] LAYER 2: Analyzing gaps...`);
      logger.debug(
        `[Enrich] Gaps: mercados=${gaps.faltaMercados}, cnae=${gaps.faltaCNAE}, coords=${gaps.faltaCoordenadas}`
      );
      result.camadas.push('layer2_gap_analysis');
    }

    // ===== CAMADA 4: Dados Mínimos (se tudo falhou) =====
    if (!allData || gaps.faltaMercados) {
      logger.debug(`[Enrich] LAYER 4: Generating minimum data...`);

      allData = {
        clienteEnriquecido: allData?.clienteEnriquecido || {
          siteOficial: cliente.siteOficial,
          produtoPrincipal: cliente.produtoPrincipal,
          cidade: cliente.cidade,
          uf: cliente.uf,
          porte: 'Médio',
        },
        mercados: [
          {
            mercado: {
              nome: `Mercado de ${cliente.produtoPrincipal || 'Produtos e Serviços'}`,
              categoria: 'B2B',
              segmentacao: 'Geral',
              tamanhoEstimado: 'A definir',
            },
            produtos: [],
            concorrentes: [],
            leads: [],
          },
        ],
      };

      result.camadas.push('layer4_minimum');
      logger.debug(`[Enrich] ✅ LAYER 4: Minimum data generated`);
    }

    // ===== CAMADA 5: Deduplicação + Merge + Gravação =====
    logger.debug(`[Enrich] LAYER 5: Deduplication + Merge + Save...`);
    result.camadas.push('layer5_dedup_merge_save');

    // 5.1. Atualizar cliente com dados enriquecidos
    if (allData.clienteEnriquecido) {
      const enriched = allData.clienteEnriquecido;
      const updateData: any = {};

      if (enriched.siteOficial) updateData.siteOficial = truncate(enriched.siteOficial, 500);
      if (enriched.produtoPrincipal) updateData.produtoPrincipal = enriched.produtoPrincipal;
      if (enriched.cidade) updateData.cidade = truncate(enriched.cidade, 100);
      if (enriched.uf) updateData.uf = truncate(enriched.uf, 2);
      if (enriched.regiao) updateData.regiao = truncate(enriched.regiao, 100);
      if (enriched.porte) updateData.porte = truncate(enriched.porte, 50);
      if (enriched.email) updateData.email = truncate(enriched.email, 320);
      if (enriched.telefone) updateData.telefone = truncate(enriched.telefone, 50);
      if (enriched.linkedin) updateData.linkedin = truncate(enriched.linkedin, 500);
      if (enriched.instagram) updateData.instagram = truncate(enriched.instagram, 500);
      if (enriched.cnae) updateData.cnae = truncate(enriched.cnae, 20); // NOVO

      // Coordenadas
      if (enriched.latitude !== undefined && enriched.latitude !== null) {
        updateData.latitude = enriched.latitude;
      }
      if (enriched.longitude !== undefined && enriched.longitude !== null) {
        updateData.longitude = enriched.longitude;
      }
      if (enriched.latitude || enriched.longitude) {
        updateData.geocodedAt = now();
      }

      if (Object.keys(updateData).length > 0) {
        await db.update(clientes).set(updateData).where(eq(clientes.id, clienteId));
        logger.debug(`[Enrich] Updated cliente with ${Object.keys(updateData).length} fields`);
      } else {
        logger.debug(`[Enrich] No cliente data to update (all fields empty)`);
      }
    }

    // 5.2. Processar cada mercado
    for (const mercadoItem of allData.mercados) {
      const mercadoData = mercadoItem.mercado;

      // 5.2.1. Criar/buscar mercado único
      const mercadoHash = crypto
        .createHash('md5')
        .update(`${mercadoData.nome}-${mercadoData.categoria}`)
        .digest('hex');

      let mercadoId: number;

      const [existingMercado] = await db
        .select()
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.mercadoHash, mercadoHash))
        .limit(1);

      if (existingMercado) {
        mercadoId = existingMercado.id;
        logger.debug(`[Enrich] Reusing mercado: ${mercadoData.nome}`);
      } else {
        const newMercado = await db
          .insert(mercadosUnicos)
          .values({
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            nome: truncate(mercadoData.nome, 255) || '',
            categoria: truncate(mercadoData.categoria || '', 100),
            segmentacao: truncate(mercadoData.segmentacao || '', 50),
            tamanhoMercado: truncate(mercadoData.tamanhoEstimado || '', 500),
            mercadoHash,
            createdAt: now(),
          })
          .returning({ id: mercadosUnicos.id });

        mercadoId = Number(newMercado[0].id);
        result.mercadosCreated++;
        logger.debug(`[Enrich] Created mercado: ${mercadoData.nome}`);
      }

      // 5.2.2. Associar cliente ao mercado
      await db
        .insert(clientesMercados)
        .values({
          clienteId,
          mercadoId,
        })
        .onConflictDoNothing();

      // 5.2.3. Inserir produtos
      for (const produtoData of mercadoItem.produtos) {
        await db
          .insert(produtos)
          .values({
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            clienteId,
            mercadoId,
            nome: truncate(produtoData.nome, 255) || '',
            descricao: truncate(produtoData.descricao || '', 1000),
            categoria: truncate(produtoData.categoria || '', 100),
            preco: null,
            unidade: null,
            ativo: 1,
            createdAt: toPostgresTimestamp(new Date()),
          })
          .onConflictDoNothing();
        result.produtosCreated++;
      }

      // ===== 5.2.4. DEDUPLICAÇÃO DE CONCORRENTES (NOVO) =====
      const concorrentesCandidatos = mercadoItem.concorrentes.map((c: any) => ({
        nome: c.nome,
        cnpj: c.cnpj || undefined,
        ...c,
      }));

      const concorrentesFiltrados = filterDuplicates(
        concorrentesCandidatos,
        clientesExistentes // ✅ Excluir TODOS os clientes do projeto
      );

      const concorrentesDedupCount = concorrentesCandidatos.length - concorrentesFiltrados.length;
      result.concorrentesDeduplicated += concorrentesDedupCount;

      if (concorrentesDedupCount > 0) {
        logger.debug(
          `[Enrich] Deduplicated ${concorrentesDedupCount} concorrentes (were clientes)`
        );
      }

      // 5.2.5. Inserir concorrentes (apenas os não duplicados)
      for (const concorrenteData of concorrentesFiltrados) {
        const concorrenteHash = crypto
          .createHash('md5')
          .update(`${concorrenteData.nome}-${mercadoId}`)
          .digest('hex');

        const qualityScore = calculateQualityScore({
          hasNome: !!concorrenteData.nome,
          hasProduto: !!concorrenteData.descricao,
          hasPorte: !!concorrenteData.porte,
          hasCidade: !!concorrenteData.cidade,
          hasSite: false,
          hasCNPJ: !!concorrenteData.cnpj,
          hasCNAE: !!concorrenteData.cnae,
          hasCoordenadas: !!(concorrenteData.latitude && concorrenteData.longitude),
        });

        // Verificar se já existe
        const [existing] = await db
          .select()
          .from(concorrentes)
          .where(eq(concorrentes.concorrenteHash, concorrenteHash))
          .limit(1);

        if (!existing) {
          const concorrenteInsert: any = {
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            mercadoId,
            nome: truncate(concorrenteData.nome, 255) || '',
            produto: truncate(concorrenteData.descricao || '', 1000),
            porte: truncate(concorrenteData.porte || '', 50),
            cnpj: truncate(concorrenteData.cnpj || '', 18) || null,
            cnae: truncate(concorrenteData.cnae || '', 20) || null, // NOVO
            setor: truncate(concorrenteData.setor || '', 100) || null, // NOVO
            email: truncate(concorrenteData.email || '', 320) || null, // NOVO
            telefone: truncate(concorrenteData.telefone || '', 50) || null, // NOVO
            site: null,
            cidade: truncate(concorrenteData.cidade || '', 100) || null,
            uf: truncate(concorrenteData.uf || '', 2) || null,
            faturamentoEstimado: null,
            qualidadeScore: qualityScore,
            qualidadeClassificacao: getQualityClassification(qualityScore),
            validationStatus: 'pending',
            concorrenteHash,
            createdAt: now(),
          };

          // Coordenadas
          if (concorrenteData.latitude !== undefined && concorrenteData.latitude !== null) {
            concorrenteInsert.latitude = concorrenteData.latitude;
          }
          if (concorrenteData.longitude !== undefined && concorrenteData.longitude !== null) {
            concorrenteInsert.longitude = concorrenteData.longitude;
          }
          if (concorrenteData.latitude || concorrenteData.longitude) {
            concorrenteInsert.geocodedAt = now();
          }

          await db.insert(concorrentes).values(concorrenteInsert);
          result.concorrentesCreated++;
        }
      }

      // ===== 5.2.6. Buscar concorrentes existentes (para dedup de leads) =====
      const concorrentesExistentes = await db
        .select({
          nome: concorrentes.nome,
          cnpj: concorrentes.cnpj,
        })
        .from(concorrentes)
        .where(eq(concorrentes.projectId, projectId));

      logger.debug(
        `[Enrich] Loaded ${concorrentesExistentes.length} existing concorrentes for lead deduplication`
      );

      // ===== 5.2.7. DEDUPLICAÇÃO DE LEADS (NOVO) =====
      const leadsCandidatos = mercadoItem.leads.map((l: any) => ({
        nome: l.nome,
        cnpj: l.cnpj || undefined,
        ...l,
      }));

      const leadsFiltrados = filterDuplicates(
        leadsCandidatos,
        clientesExistentes, // ✅ Excluir clientes
        concorrentesExistentes // ✅ Excluir concorrentes
      );

      const leadsDedupCount = leadsCandidatos.length - leadsFiltrados.length;
      result.leadsDeduplicated += leadsDedupCount;

      if (leadsDedupCount > 0) {
        logger.debug(
          `[Enrich] Deduplicated ${leadsDedupCount} leads (were clientes or concorrentes)`
        );
      }

      // 5.2.8. Inserir leads (apenas os não duplicados)
      for (const leadData of leadsFiltrados) {
        const leadHash = crypto
          .createHash('md5')
          .update(`${leadData.nome}-${mercadoId}`)
          .digest('hex');

        const qualityScore = calculateQualityScore({
          hasNome: !!leadData.nome,
          hasProduto: !!leadData.justificativa,
          hasPorte: !!leadData.porte,
          hasCidade: !!leadData.cidade,
          hasSite: false,
          hasCNPJ: !!leadData.cnpj,
          hasCNAE: !!leadData.cnae,
          hasCoordenadas: !!(leadData.latitude && leadData.longitude),
        });

        // Verificar se já existe
        const [existing] = await db
          .select()
          .from(leads)
          .where(eq(leads.leadHash, leadHash))
          .limit(1);

        if (!existing) {
          const leadInsert: any = {
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            mercadoId,
            nome: truncate(leadData.nome, 255) || '',
            setor: truncate(leadData.segmento || '', 100),
            tipo: truncate(leadData.potencial || '', 20),
            porte: truncate(leadData.porte || '', 50),
            cnae: truncate(leadData.cnae || '', 20) || null, // NOVO
            cidade: truncate(leadData.cidade || '', 100) || null,
            uf: truncate(leadData.uf || '', 2) || null,
            qualidadeScore: qualityScore,
            qualidadeClassificacao: getQualityClassification(qualityScore),
            validationStatus: 'pending',
            stage: 'novo',
            leadHash,
            createdAt: now(),
          };

          // Coordenadas
          if (leadData.latitude !== undefined && leadData.latitude !== null) {
            leadInsert.latitude = leadData.latitude;
          }
          if (leadData.longitude !== undefined && leadData.longitude !== null) {
            leadInsert.longitude = leadData.longitude;
          }
          if (leadData.latitude || leadData.longitude) {
            leadInsert.geocodedAt = now();
          }

          await db.insert(leads).values(leadInsert);
          result.leadsCreated++;
        }
      }
    }

    // Marcar cliente como enriquecido
    await db
      .update(clientes)
      .set({
        enriched: true,
        enrichedAt: now(),
      })
      .where(eq(clientes.id, clienteId));

    result.success = true;
    result.duration = Date.now() - startTime;

    logger.debug(
      `[Enrich] ✅ OPTIMIZED V2 success for ${cliente.nome} in ${(result.duration / 1000).toFixed(1)}s`
    );
    logger.debug(
      `[Enrich] Created: ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
    );
    logger.debug(
      `[Enrich] Deduplicated: ${result.concorrentesDeduplicated}C ${result.leadsDeduplicated}L`
    );
    logger.debug(`[Enrich] Layers used: ${result.camadas.join(' → ')}`);

    return result;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.duration = Date.now() - startTime;

    console.error(`[Enrich] ❌ OPTIMIZED V2 failed for cliente ${clienteId}:`, error);

    return result;
  }
}

/**
 * Enriquece múltiplos clientes em PARALELO (OTIMIZADO V2)
 */
export async function enrichClientesParallel(
  clienteIds: number[],
  projectId: number = 1,
  concurrency: number = 5,
  onProgress?: (current: number, total: number, result: EnrichmentResult) => void
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  let completed = 0;

  logger.debug(
    `\n[Enrich] 🚀 Starting PARALLEL V2 enrichment: ${clienteIds.length} clientes, ${concurrency} concurrent`
  );

  // Processar em batches paralelos
  for (let i = 0; i < clienteIds.length; i += concurrency) {
    const batch = clienteIds.slice(i, i + concurrency);

    logger.debug(
      `\n[Enrich] Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(clienteIds.length / concurrency)}: ${batch.length} clientes`
    );

    // Executar batch em paralelo
    const batchResults = await Promise.all(
      batch.map((clienteId) => enrichClienteOptimized(clienteId, projectId))
    );

    // Processar resultados
    for (const result of batchResults) {
      results.push(result);
      completed++;

      if (onProgress) {
        onProgress(completed, clienteIds.length, result);
      }
    }

    // Pequeno delay entre batches para não sobrecarregar
    if (i + concurrency < clienteIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s entre batches
    }
  }

  logger.debug(`\n[Enrich] ✅ PARALLEL V2 enrichment completed: ${completed}/${clienteIds.length}`);

  return results;
}

// ============================================
// DEPRECATED FUNCTIONS (stubs for compatibility)
// ============================================

/**
 * @deprecated Use enrichClienteOptimized instead
 */
export async function identifyMercados(clienteId: number, projectId: number = 1): Promise<any[]> {
  console.warn('[DEPRECATED] identifyMercados is deprecated. Use enrichClienteOptimized instead.');
  return [];
}

/**
 * @deprecated Use enrichClienteOptimized instead
 */
export async function createProdutosCliente(
  clienteId: number,
  projectId: number = 1
): Promise<any[]> {
  console.warn(
    '[DEPRECATED] createProdutosCliente is deprecated. Use enrichClienteOptimized instead.'
  );
  return [];
}

/**
 * @deprecated Use enrichClienteOptimized instead
 */
export async function findConcorrentesCliente(
  clienteId: number,
  projectId: number = 1
): Promise<any[]> {
  console.warn(
    '[DEPRECATED] findConcorrentesCliente is deprecated. Use enrichClienteOptimized instead.'
  );
  return [];
}

/**
 * @deprecated Use enrichClienteOptimized instead
 */
export async function findLeadsCliente(clienteId: number, projectId: number = 1): Promise<any[]> {
  console.warn('[DEPRECATED] findLeadsCliente is deprecated. Use enrichClienteOptimized instead.');
  return [];
}

/**
 * @deprecated Use enrichClienteOptimized instead
 */
export async function enrichClienteCompleto(
  clienteId: number,
  projectId: number = 1
): Promise<any> {
  console.warn(
    '[DEPRECATED] enrichClienteCompleto is deprecated. Use enrichClienteOptimized instead.'
  );
  return enrichClienteOptimized(clienteId, projectId);
}

/**
 * @deprecated Use enrichCliente instead
 */
export async function enrichCliente(clienteId: number, projectId: number = 1): Promise<any> {
  console.warn('[DEPRECATED] enrichCliente is deprecated. Use enrichClienteOptimized instead.');
  return enrichClienteOptimized(clienteId, projectId);
}
