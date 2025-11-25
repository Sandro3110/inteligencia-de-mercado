import { logger } from '@/lib/logger';

/**
 * Sistema de Enriquecimento OTIMIZADO
 * - 1 chamada OpenAI por cliente (vs 10-13 anterior)
 * - 0 chamadas SerpAPI (vs 45 anterior)
 * - Processamento paralelo (vs sequencial anterior)
 * - Tempo: 30-60s por cliente (vs 2-3min anterior)
 */

import { getDb } from './db';
import { eq } from 'drizzle-orm';
import {
  clientes,
  mercadosUnicos,
  produtos,
  concorrentes,
  leads,
  clientesMercados,
} from '../drizzle/schema';
import { generateAllDataOptimized } from './integrations/openaiOptimized';
import crypto from 'crypto';
import { now, toPostgresTimestamp } from './dateUtils';

interface EnrichmentResult {
  clienteId: number;
  success: boolean;
  mercadosCreated: number;
  produtosCreated: number;
  concorrentesCreated: number;
  leadsCreated: number;
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
 * CORRIGIDO: Considera mais campos e diferencia melhor
 */
function calculateQualityScore(data: {
  hasNome?: boolean;
  hasProduto?: boolean;
  hasPorte?: boolean;
  hasCidade?: boolean;
  hasSite?: boolean;
  hasCNPJ?: boolean;
}): number {
  let score = 50; // Base score

  if (data.hasNome) score += 10;
  if (data.hasProduto) score += 15;
  if (data.hasPorte) score += 10;
  if (data.hasCidade) score += 5;
  if (data.hasSite) score += 5;
  if (data.hasCNPJ) score += 5;

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
 * Enriquece um único cliente com dados reais (VERSÃO OTIMIZADA)
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

    logger.debug(`[Enrich] 🚀 Starting OPTIMIZED enrichment for: ${cliente.nome}`);

    // 2. **UMA ÚNICA CHAMADA** para gerar TUDO
    logger.debug(`[Enrich] Generating ALL data with 1 OpenAI call...`);
    const allData = await generateAllDataOptimized({
      nome: cliente.nome,
      produtoPrincipal: cliente.produtoPrincipal || undefined,
      siteOficial: cliente.siteOficial || undefined,
      cidade: cliente.cidade || undefined,
    });

    // 2.5 Atualizar cliente com dados enriquecidos (incluindo coordenadas)
    if (allData.clienteEnriquecido) {
      const enriched = allData.clienteEnriquecido;
      // @ts-ignore - TODO: Fix updateData type (should be Partial<Cliente>)
      const updateData: unknown = {};

      // @ts-ignore
      if (enriched.siteOficial) updateData.siteOficial = truncate(enriched.siteOficial, 500);
      // @ts-ignore
      if (enriched.produtoPrincipal) updateData.produtoPrincipal = enriched.produtoPrincipal;
      // @ts-ignore
      if (enriched.cidade) updateData.cidade = truncate(enriched.cidade, 100);
      // @ts-ignore
      if (enriched.uf) updateData.uf = truncate(enriched.uf, 2);
      // @ts-ignore
      if (enriched.regiao) updateData.regiao = truncate(enriched.regiao, 100);
      // @ts-ignore
      if (enriched.porte) updateData.porte = truncate(enriched.porte, 50);
      // @ts-ignore
      if (enriched.email) updateData.email = truncate(enriched.email, 320);
      // @ts-ignore
      if (enriched.telefone) updateData.telefone = truncate(enriched.telefone, 50);
      // @ts-ignore
      if (enriched.linkedin) updateData.linkedin = truncate(enriched.linkedin, 500);
      // @ts-ignore
      if (enriched.instagram) updateData.instagram = truncate(enriched.instagram, 500);

      // Adicionar coordenadas geográficas
      // @ts-ignore
      if (enriched.latitude !== undefined && enriched.latitude !== null) {
        // @ts-ignore
        updateData.latitude = enriched.latitude.toString();
      }
      // @ts-ignore
      if (enriched.longitude !== undefined && enriched.longitude !== null) {
        // @ts-ignore
        updateData.longitude = enriched.longitude.toString();
      }
      // @ts-ignore
      if (enriched.latitude || enriched.longitude) {
        // @ts-ignore
        updateData.geocodedAt = now();
      }

      // @ts-ignore
      if (Object.keys(updateData).length > 0) {
        // @ts-ignore
        await db.update(clientes).set(updateData).where(eq(clientes.id, clienteId));
        logger.debug(`[Enrich] Updated cliente with enriched data (including coordinates)`);
      }
    }

    // 3. Processar cada mercado
    for (const mercadoItem of allData.mercados) {
      const mercadoData = mercadoItem.mercado;

      // 3.1 Criar/buscar mercado único
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
        const newMercado = await db.insert(mercadosUnicos).values({
          projectId,
          pesquisaId: cliente.pesquisaId || null,
          nome: truncate(mercadoData.nome, 255) || '',
          categoria: truncate(mercadoData.categoria || '', 100),
          segmentacao: truncate(mercadoData.segmentacao || '', 50),
          tamanhoMercado: truncate(mercadoData.tamanhoEstimado || '', 500),
          mercadoHash,
          createdAt: now(),
        }).returning({ id: mercadosUnicos.id });

        mercadoId = Number(newMercado[0].id);
        result.mercadosCreated++;
        logger.debug(`[Enrich] Created mercado: ${mercadoData.nome}`);
      }

      // 3.2 Associar cliente ao mercado
      await db
        .insert(clientesMercados)
        .values({
          clienteId,
          mercadoId,
        })
        .onConflictDoNothing();

      // 3.3 Inserir produtos (com UPSERT para evitar duplicação)
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

      // 3.4 Inserir concorrentes
      for (const concorrenteData of mercadoItem.concorrentes) {
        const concorrenteHash = crypto
          .createHash('md5')
          .update(`${concorrenteData.nome}-${mercadoId}`)
          .digest('hex');

        // ✅ BUG FIX 2: Quality score melhorado
        const qualityScore = calculateQualityScore({
          hasNome: !!concorrenteData.nome,
          hasProduto: !!concorrenteData.descricao,
          hasPorte: !!concorrenteData.porte,
          hasCidade: false,
          hasSite: false,
          hasCNPJ: false,
        });

        // Verificar se já existe
        const [existing] = await db
          .select()
          .from(concorrentes)
          .where(eq(concorrentes.concorrenteHash, concorrenteHash))
          .limit(1);

        if (!existing) {
          const concorrenteInsert: unknown = {
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            mercadoId,
            nome: truncate(concorrenteData.nome, 255) || '',
            produto: truncate(concorrenteData.descricao || '', 1000),
            porte: truncate(concorrenteData.porte || '', 50),
            cnpj: null,
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

          // Adicionar coordenadas se disponíveis
          // @ts-ignore
          if (concorrenteData.latitude !== undefined && concorrenteData.latitude !== null) {
            // @ts-ignore
            concorrenteInsert.latitude = concorrenteData.latitude.toString();
          }
          // @ts-ignore
          if (concorrenteData.longitude !== undefined && concorrenteData.longitude !== null) {
            // @ts-ignore
            concorrenteInsert.longitude = concorrenteData.longitude.toString();
          }
          // @ts-ignore
          if (concorrenteData.latitude || concorrenteData.longitude) {
            // @ts-ignore
            concorrenteInsert.geocodedAt = now();
          }

          // @ts-ignore
          await db.insert(concorrentes).values(concorrenteInsert);
          result.concorrentesCreated++;
        }
      }

      // 3.5 Inserir leads
      for (const leadData of mercadoItem.leads) {
        const leadHash = crypto
          .createHash('md5')
          .update(`${leadData.nome}-${mercadoId}`)
          .digest('hex');

        // ✅ BUG FIX 2: Quality score melhorado
        const qualityScore = calculateQualityScore({
          hasNome: !!leadData.nome,
          hasProduto: !!leadData.justificativa,
          hasPorte: !!leadData.porte,
          hasCidade: false,
          hasSite: false,
          hasCNPJ: false,
        });

        // Verificar se já existe
        const [existing] = await db
          .select()
          .from(leads)
          .where(eq(leads.leadHash, leadHash))
          .limit(1);

        if (!existing) {
          const leadInsert: unknown = {
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            mercadoId,
            nome: truncate(leadData.nome, 255) || '',
            setor: truncate(leadData.segmento || '', 100),
            tipo: truncate(leadData.potencial || '', 20),
            porte: truncate(leadData.porte || '', 50),
            cidade: truncate(leadData.cidade || '', 100) || null,
            uf: truncate(leadData.uf || '', 2) || null,
            qualidadeScore: qualityScore,
            qualidadeClassificacao: getQualityClassification(qualityScore),
            validationStatus: 'pending',
            stage: 'novo',
            leadHash,
            createdAt: now(),
          };

          // Adicionar coordenadas se disponíveis
          // @ts-ignore
          if (leadData.latitude !== undefined && leadData.latitude !== null) {
            // @ts-ignore
            leadInsert.latitude = leadData.latitude.toString();
          }
          // @ts-ignore
          if (leadData.longitude !== undefined && leadData.longitude !== null) {
            // @ts-ignore
            leadInsert.longitude = leadData.longitude.toString();
          }
          // @ts-ignore
          if (leadData.latitude || leadData.longitude) {
            // @ts-ignore
            leadInsert.geocodedAt = now();
          }

          // @ts-ignore
          await db.insert(leads).values(leadInsert);
          result.leadsCreated++;
        }
      }
    }

    result.success = true;
    result.duration = Date.now() - startTime;

    logger.debug(
      `[Enrich] ✅ OPTIMIZED success for ${cliente.nome} in ${(result.duration / 1000).toFixed(1)}s`
    );
    logger.debug(
      `[Enrich] Created: ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
    );

    return result;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.duration = Date.now() - startTime;

    console.error(`[Enrich] ❌ OPTIMIZED failed for cliente ${clienteId}:`, error);

    return result;
  }
}

/**
 * Enriquece múltiplos clientes em PARALELO (OTIMIZADO)
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
    `\n[Enrich] 🚀 Starting PARALLEL enrichment: ${clienteIds.length} clientes, ${concurrency} concurrent`
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

  logger.debug(`\n[Enrich] ✅ PARALLEL enrichment completed: ${completed}/${clienteIds.length}`);

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
 * @deprecated Use enrichClienteOptimized instead
 */
export async function enrichCliente(clienteId: number, projectId: number = 1): Promise<any> {
  console.warn('[DEPRECATED] enrichCliente is deprecated. Use enrichClienteOptimized instead.');
  return enrichClienteOptimized(clienteId, projectId);
}
