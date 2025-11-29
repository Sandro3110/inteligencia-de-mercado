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
import {
  generateMercadosEspecializados,
  generateDadosClienteEspecializados,
  generateDadosMinimos,
} from './integrations/openaiLayered';
import crypto from 'crypto';
import { now, toPostgresTimestamp } from './dateUtils';
import {
  logEnrichmentStarted,
  logEnrichmentCompleted,
  logEnrichmentFailed,
} from './utils/auditLog';

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

    console.log(`[Enrich] 🚀 Starting OPTIMIZED enrichment for: ${cliente.nome}`);

    // 2. SISTEMA DE CAMADAS: Tentar gerar dados com fallback inteligente
    console.log(`[Enrich] CAMADA 1: Tentando gerar TUDO com 1 chamada...`);
    let allData;

    try {
      allData = await generateAllDataOptimized({
        nome: cliente.nome,
        produtoPrincipal: cliente.produtoPrincipal || undefined,
        siteOficial: cliente.siteOficial || undefined,
        cidade: cliente.cidade || undefined,
      });
    } catch (error) {
      console.log(`[Enrich] ⚠️ CAMADA 1 falhou com erro: ${error}`);
      allData = { mercados: [], clienteEnriquecido: null };
    }

    // CAMADA 2: Verificar se precisa de fallback
    if (!allData.mercados || allData.mercados.length === 0) {
      console.log(`[Enrich] CAMADA 1 falhou (0 mercados). Tentando CAMADA 3A...`);

      // CAMADA 3A: Prompt especializado para mercados
      const mercadosEspecializados = await generateMercadosEspecializados({
        nome: cliente.nome,
        cnpj: cliente.cnpj || undefined,
        siteOficial: cliente.siteOficial || undefined,
        produtoPrincipal: cliente.produtoPrincipal || undefined,
        cidade: cliente.cidade || undefined,
        uf: cliente.uf || undefined,
      });

      if (mercadosEspecializados && mercadosEspecializados.length > 0) {
        console.log(`[Enrich] ✅ CAMADA 3A: ${mercadosEspecializados.length} mercados gerados`);
        allData.mercados = mercadosEspecializados;
      } else {
        console.log(`[Enrich] CAMADA 3A falhou. Usando CAMADA 4 (dados mínimos)...`);

        // CAMADA 4: Dados mínimos garantidos
        const dadosMinimos = generateDadosMinimos({
          nome: cliente.nome,
          cnpj: cliente.cnpj || undefined,
          siteOficial: cliente.siteOficial || undefined,
          produtoPrincipal: cliente.produtoPrincipal || undefined,
          cidade: cliente.cidade || undefined,
          uf: cliente.uf || undefined,
        });

        allData.mercados = dadosMinimos.mercados;
        if (!allData.clienteEnriquecido) {
          allData.clienteEnriquecido = dadosMinimos.clienteEnriquecido;
        }
        console.log(`[Enrich] ✅ CAMADA 4: Dados mínimos garantidos`);
      }
    } else {
      console.log(`[Enrich] ✅ CAMADA 1: ${allData.mercados.length} mercados gerados`);

      // FASE 2: VALIDAÇÃO DE QUANTIDADE
      const totalConcorrentes = allData.mercados.reduce(
        (sum, m) => sum + (m.concorrentes?.length || 0),
        0
      );
      const totalLeads = allData.mercados.reduce((sum, m) => sum + (m.leads?.length || 0), 0);

      if (totalConcorrentes < 10 || totalLeads < 6) {
        console.log(
          `[Enrich] ⚠️ CAMADA 1: Quantidade baixa (${totalConcorrentes}C ${totalLeads}L). Ativando CAMADA 3C...`
        );

        // CAMADA 3C: Completar concorrentes e leads
        const { generateMaisConcorrentes, generateMaisLeads } =
          await import('./integrations/openaiLayered');

        for (const mercado of allData.mercados) {
          // Completar concorrentes se < 10
          const concorrentesAtuais = mercado.concorrentes?.length || 0;
          if (concorrentesAtuais < 10) {
            const faltam = 10 - concorrentesAtuais;
            const maisConcorrentes = await generateMaisConcorrentes(
              {
                nome: cliente.nome,
                cnpj: cliente.cnpj || undefined,
                produtoPrincipal: cliente.produtoPrincipal || undefined,
                cidade: cliente.cidade || undefined,
                uf: cliente.uf || undefined,
              },
              mercado.mercado?.nome || 'Mercado',
              mercado.concorrentes || [],
              faltam
            );

            if (maisConcorrentes.length > 0) {
              mercado.concorrentes = [...(mercado.concorrentes || []), ...maisConcorrentes];
              console.log(
                `[Enrich] ✅ CAMADA 3C: +${maisConcorrentes.length} concorrentes adicionados`
              );
            }
          }

          // Completar leads se < 6
          const leadsAtuais = mercado.leads?.length || 0;
          if (leadsAtuais < 6) {
            const faltam = 6 - leadsAtuais;
            const maisLeads = await generateMaisLeads(
              {
                nome: cliente.nome,
                cnpj: cliente.cnpj || undefined,
                produtoPrincipal: cliente.produtoPrincipal || undefined,
                cidade: cliente.cidade || undefined,
                uf: cliente.uf || undefined,
              },
              mercado.mercado?.nome || 'Mercado',
              mercado.leads || [],
              faltam
            );

            if (maisLeads.length > 0) {
              mercado.leads = [...(mercado.leads || []), ...maisLeads];
              console.log(`[Enrich] ✅ CAMADA 3C: +${maisLeads.length} leads adicionados`);
            }
          }
        }

        // Recalcular totais
        const novoTotalConcorrentes = allData.mercados.reduce(
          (sum, m) => sum + (m.concorrentes?.length || 0),
          0
        );
        const novoTotalLeads = allData.mercados.reduce((sum, m) => sum + (m.leads?.length || 0), 0);
        console.log(
          `[Enrich] ✅ CAMADA 3C: Total final (${novoTotalConcorrentes}C ${novoTotalLeads}L)`
        );
      } else {
        console.log(`[Enrich] ✅ CAMADA 1: Quantidade OK (${totalConcorrentes}C ${totalLeads}L)`);
      }
    }

    // CAMADA 3B: Se dados do cliente estão incompletos, tentar enriquecer
    if (!allData.clienteEnriquecido || !allData.clienteEnriquecido.cnae) {
      console.log(`[Enrich] CAMADA 3B: Enriquecendo dados do cliente...`);
      const dadosCliente = await generateDadosClienteEspecializados({
        nome: cliente.nome,
        cnpj: cliente.cnpj || undefined,
        siteOficial: cliente.siteOficial || undefined,
        produtoPrincipal: cliente.produtoPrincipal || undefined,
        cidade: cliente.cidade || undefined,
        uf: cliente.uf || undefined,
      });

      if (dadosCliente) {
        // Merge dados (prioriza dados especializados)
        allData.clienteEnriquecido = {
          ...allData.clienteEnriquecido,
          ...dadosCliente,
        };
        console.log(`[Enrich] ✅ CAMADA 3B: Dados do cliente enriquecidos`);
      }
    }

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
      // @ts-ignore
      if (enriched.cnae) updateData.cnae = truncate(enriched.cnae, 20);
      // @ts-ignore
      if (enriched.setor) updateData.setor = truncate(enriched.setor, 100);

      // Adicionar coordenadas geográficas
      // @ts-ignore
      if (enriched.latitude !== undefined && enriched.latitude !== null) {
        // @ts-ignore
        updateData.latitude = enriched.latitude; // CORRIGIDO: Passar número diretamente
      }
      // @ts-ignore
      if (enriched.longitude !== undefined && enriched.longitude !== null) {
        // @ts-ignore
        updateData.longitude = enriched.longitude; // CORRIGIDO: Passar número diretamente
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
        console.log(`[Enrich] Updated cliente with enriched data (including coordinates)`);
      }
    }

    // 3. Processar cada mercado
    console.log(`[Enrich] DEBUG: Total de mercados a processar: ${allData.mercados.length}`);
    allData.mercados.forEach((m, i) => {
      console.log(
        `[Enrich] DEBUG: Mercado ${i + 1}: ${m.mercado?.nome}, Concorrentes: ${m.concorrentes?.length || 0}, Leads: ${m.leads?.length || 0}`
      );
    });

    // Garantir que mercados seja um array
    const mercados = Array.isArray(allData.mercados) ? allData.mercados : [];

    for (const mercadoItem of mercados) {
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
        console.log(`[Enrich] Reusing mercado: ${mercadoData.nome}`);
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
        console.log(`[Enrich] Created mercado: ${mercadoData.nome}`);
      }

      // 3.2 Associar cliente ao mercado
      await db
        .insert(clientesMercados)
        .values({
          clienteId,
          mercadoId,
        })
        .onConflictDoNothing();

      // 3.3 Inserir produtos em BATCH
      if (mercadoItem.produtos.length > 0) {
        const produtosToInsert = mercadoItem.produtos.map((produtoData) => ({
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
        }));

        try {
          await db.insert(produtos).values(produtosToInsert).onConflictDoNothing();
          result.produtosCreated += produtosToInsert.length;
          console.log(`[Enrich] ✅ ${produtosToInsert.length} produtos inseridos em batch`);
        } catch (error: any) {
          console.error(`[Enrich] ❌ Erro no batch insert de produtos:`, error.message);
        }
      }

      // 3.4 Inserir concorrentes em BATCH
      if (mercadoItem.concorrentes.length > 0) {
        // Primeiro, buscar hashes existentes em batch
        const concorrentesHashes = mercadoItem.concorrentes.map((c) =>
          crypto.createHash('md5').update(`${c.nome}-${mercadoId}`).digest('hex')
        );

        const existingConcorrentes = await db
          .select({ concorrenteHash: concorrentes.concorrenteHash })
          .from(concorrentes)
          .where(eq(concorrentes.mercadoId, mercadoId));

        const existingHashes = new Set(existingConcorrentes.map((c) => c.concorrenteHash));

        // Preparar inserts apenas para novos concorrentes
        const concorrentesToInsert = mercadoItem.concorrentes
          .map((concorrenteData, index) => {
            const concorrenteHash = concorrentesHashes[index];
            if (existingHashes.has(concorrenteHash)) return null;

            const qualityScore = calculateQualityScore({
              hasNome: !!concorrenteData.nome,
              hasProduto: !!concorrenteData.descricao,
              hasPorte: !!concorrenteData.porte,
              hasCidade: !!concorrenteData.cidade,
              hasSite: false,
              hasCNPJ: false,
            });

            const concorrenteInsert: any = {
              projectId,
              pesquisaId: cliente.pesquisaId || null,
              mercadoId,
              nome: truncate(concorrenteData.nome, 255) || '',
              produto: truncate(concorrenteData.descricao || '', 1000),
              porte: truncate(concorrenteData.porte || '', 50),
              cnpj: null,
              cnae: truncate(concorrenteData.cnae || '', 20) || null,
              setor: truncate(concorrenteData.setor || '', 100) || null,
              email: truncate(concorrenteData.email || '', 255) || null,
              telefone: truncate(concorrenteData.telefone || '', 20) || null,
              site: truncate(concorrenteData.site || '', 255) || null,
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
            if (concorrenteData.latitude !== undefined && concorrenteData.latitude !== null) {
              concorrenteInsert.latitude = concorrenteData.latitude;
            }
            if (concorrenteData.longitude !== undefined && concorrenteData.longitude !== null) {
              concorrenteInsert.longitude = concorrenteData.longitude;
            }
            if (concorrenteData.latitude || concorrenteData.longitude) {
              concorrenteInsert.geocodedAt = now();
            }

            return concorrenteInsert;
          })
          .filter((c) => c !== null);

        if (concorrentesToInsert.length > 0) {
          try {
            await db.insert(concorrentes).values(concorrentesToInsert).onConflictDoNothing();
            result.concorrentesCreated += concorrentesToInsert.length;
            console.log(
              `[Enrich] ✅ ${concorrentesToInsert.length} concorrentes inseridos em batch`
            );
          } catch (error: any) {
            console.error(`[Enrich] ❌ Erro no batch insert de concorrentes:`, error.message);
          }
        }
      }

      // 3.5 Inserir leads em BATCH
      if (mercadoItem.leads.length > 0) {
        // Primeiro, buscar hashes existentes em batch
        const leadsHashes = mercadoItem.leads.map((l) =>
          crypto.createHash('md5').update(`${l.nome}-${mercadoId}`).digest('hex')
        );

        const existingLeads = await db
          .select({ leadHash: leads.leadHash })
          .from(leads)
          .where(eq(leads.mercadoId, mercadoId));

        const existingHashes = new Set(existingLeads.map((l) => l.leadHash));

        // Preparar inserts apenas para novos leads
        const leadsToInsert = mercadoItem.leads
          .map((leadData, index) => {
            const leadHash = leadsHashes[index];
            if (existingHashes.has(leadHash)) return null;

            const qualityScore = calculateQualityScore({
              hasNome: !!leadData.nome,
              hasProduto: !!leadData.justificativa,
              hasPorte: !!leadData.porte,
              hasCidade: !!leadData.cidade,
              hasSite: false,
              hasCNPJ: false,
            });

            const leadInsert: any = {
              projectId,
              pesquisaId: cliente.pesquisaId || null,
              mercadoId,
              nome: truncate(leadData.nome, 255) || '',
              setor: truncate(leadData.segmento || '', 100),
              tipo: truncate(leadData.potencial || '', 20),
              porte: truncate(leadData.porte || '', 50),
              cnae: truncate(leadData.cnae || '', 20) || null,
              email: truncate(leadData.email || '', 255) || null,
              telefone: truncate(leadData.telefone || '', 20) || null,
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
            if (leadData.latitude !== undefined && leadData.latitude !== null) {
              leadInsert.latitude = leadData.latitude;
            }
            if (leadData.longitude !== undefined && leadData.longitude !== null) {
              leadInsert.longitude = leadData.longitude;
            }
            if (leadData.latitude || leadData.longitude) {
              leadInsert.geocodedAt = now();
            }

            return leadInsert;
          })
          .filter((l) => l !== null);

        if (leadsToInsert.length > 0) {
          try {
            await db.insert(leads).values(leadsToInsert).onConflictDoNothing();
            result.leadsCreated += leadsToInsert.length;
            console.log(`[Enrich] ✅ ${leadsToInsert.length} leads inseridos em batch`);
          } catch (error: any) {
            console.error(`[Enrich] ❌ Erro no batch insert de leads:`, error.message);
            console.error(`[Enrich] Detalhes:`, JSON.stringify(leadsToInsert, null, 2));
          }
        }
      }
    }

    result.success = true;
    result.duration = Date.now() - startTime;

    console.log(
      `[Enrich] ✅ OPTIMIZED success for ${cliente.nome} in ${(result.duration / 1000).toFixed(1)}s`
    );
    console.log(
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

    console.log(
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
