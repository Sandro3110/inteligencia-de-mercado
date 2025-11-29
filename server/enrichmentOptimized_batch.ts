// VERSÃO COM BATCH INSERTS - OTIMIZAÇÃO DE PERFORMANCE
// Mudanças principais:
// 1. Acumular concorrentes e leads em arrays
// 2. Fazer batch insert no final
// 3. Reduzir de ~20 queries para ~4 queries por cliente

import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { getDb } from './db';
import { clientes, mercados, produtos, concorrentes, leads } from '../drizzle/schema';
import { generateAllDataOptimized } from './integrations/openaiOptimized';
import logger from './logger';

const truncate = (str: string | null | undefined, maxLength: number): string => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

const now = () => new Date();

function calculateQualityScore(data: {
  hasNome: boolean;
  hasProduto: boolean;
  hasPorte: boolean;
  hasCidade: boolean;
  hasSite: boolean;
  hasCNPJ: boolean;
  hasCNAE?: boolean;
  hasCoords?: boolean;
}): number {
  let score = 0;
  if (data.hasNome) score += 20;
  if (data.hasProduto) score += 20;
  if (data.hasPorte) score += 15;
  if (data.hasCidade) score += 15;
  if (data.hasSite) score += 10;
  if (data.hasCNPJ) score += 10;
  if (data.hasCNAE) score += 5; // NOVO
  if (data.hasCoords) score += 5; // NOVO
  return Math.min(score, 100);
}

function getQualityClassification(score: number): string {
  if (score >= 80) return 'Alta';
  if (score >= 50) return 'Média';
  return 'Baixa';
}

export async function enrichClienteOptimizedBatch(clienteId: number): Promise<{
  success: boolean;
  duration: number;
  mercadosCreated: number;
  produtosCreated: number;
  concorrentesCreated: number;
  leadsCreated: number;
  error?: string;
}> {
  const startTime = Date.now();
  const result = {
    success: false,
    duration: 0,
    mercadosCreated: 0,
    produtosCreated: 0,
    concorrentesCreated: 0,
    leadsCreated: 0,
  };

  try {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    // 1. Buscar cliente
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
    if (!cliente) throw new Error(`Cliente ${clienteId} not found`);

    const projectId = cliente.projectId;
    logger.debug(`[Enrich] Starting BATCH OPTIMIZED for ${cliente.nome}`);

    // 2. Chamar OpenAI
    const allData = await generateAllDataOptimized({
      nome: cliente.nome || '',
      cnpj: cliente.cnpj || '',
      siteOficial: cliente.siteOficial || '',
      produtoPrincipal: cliente.produtoPrincipal || '',
      cidade: cliente.cidade || '',
      uf: cliente.uf || '',
    });

    if (!allData || !allData.mercados || allData.mercados.length === 0) {
      throw new Error('No mercados returned by OpenAI');
    }

    // 3. Atualizar cliente
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
      if (enriched.cnae) updateData.cnae = truncate(enriched.cnae, 20);

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
      }
    }

    // 4. BATCH ARRAYS - Acumular inserts
    const concorrentesToInsert: any[] = [];
    const leadsToInsert: any[] = [];

    // 5. Processar mercados
    for (const mercadoItem of allData.mercados) {
      const mercadoData = mercadoItem.mercado;

      // 5.1 Criar mercado
      const mercadoHash = crypto
        .createHash('md5')
        .update(`${mercadoData.nome}-${projectId}`)
        .digest('hex');

      let mercadoId: number;
      const [existingMercado] = await db
        .select()
        .from(mercados)
        .where(eq(mercados.mercadoHash, mercadoHash))
        .limit(1);

      if (existingMercado) {
        mercadoId = existingMercado.id;
      } else {
        const [newMercado] = await db
          .insert(mercados)
          .values({
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            nome: truncate(mercadoData.nome, 255) || '',
            categoria: truncate(mercadoData.categoria || '', 100),
            segmentacao: truncate(mercadoData.segmentacao || '', 100),
            tamanhoEstimado: truncate(mercadoData.tamanhoEstimado || '', 255),
            mercadoHash,
            createdAt: now(),
          })
          .returning({ id: mercados.id });
        mercadoId = newMercado.id;
        result.mercadosCreated++;
      }

      // 5.2 Inserir produtos
      for (const produtoData of mercadoItem.produtos) {
        const produtoHash = crypto
          .createHash('md5')
          .update(`${produtoData.nome}-${mercadoId}`)
          .digest('hex');

        const [existingProduto] = await db
          .select()
          .from(produtos)
          .where(eq(produtos.produtoHash, produtoHash))
          .limit(1);

        if (!existingProduto) {
          await db.insert(produtos).values({
            projectId,
            pesquisaId: cliente.pesquisaId || null,
            mercadoId,
            nome: truncate(produtoData.nome, 255) || '',
            categoria: truncate(produtoData.categoria || '', 100),
            descricao: truncate(produtoData.descricao || '', 1000),
            produtoHash,
            createdAt: now(),
          });
          result.produtosCreated++;
        }
      }

      // 5.3 ACUMULAR concorrentes (não inserir ainda)
      for (const concorrenteData of mercadoItem.concorrentes) {
        const concorrenteHash = crypto
          .createHash('md5')
          .update(`${concorrenteData.nome}-${mercadoId}`)
          .digest('hex');

        const qualityScore = calculateQualityScore({
          hasNome: !!concorrenteData.nome,
          hasProduto: !!concorrenteData.produtoPrincipal,
          hasPorte: !!concorrenteData.porte,
          hasCidade: !!concorrenteData.cidade,
          hasSite: !!concorrenteData.siteOficial,
          hasCNPJ: false,
          hasCNAE: !!concorrenteData.cnae,
          hasCoords: !!(concorrenteData.latitude && concorrenteData.longitude),
        });

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
            siteOficial: truncate(concorrenteData.siteOficial || '', 500),
            produtoPrincipal: truncate(concorrenteData.produtoPrincipal || '', 255),
            cidade: truncate(concorrenteData.cidade || '', 100),
            uf: truncate(concorrenteData.uf || '', 2),
            porte: truncate(concorrenteData.porte || '', 50),
            cnae: truncate(concorrenteData.cnae || '', 20),
            setor: truncate(concorrenteData.setor || '', 100),
            email: truncate(concorrenteData.email || '', 320),
            telefone: truncate(concorrenteData.telefone || '', 50),
            qualidadeScore: qualityScore,
            qualidadeClassificacao: getQualityClassification(qualityScore),
            validationStatus: 'pending',
            concorrenteHash,
            createdAt: now(),
          };

          if (concorrenteData.latitude !== undefined && concorrenteData.latitude !== null) {
            concorrenteInsert.latitude = concorrenteData.latitude;
          }
          if (concorrenteData.longitude !== undefined && concorrenteData.longitude !== null) {
            concorrenteInsert.longitude = concorrenteData.longitude;
          }
          if (concorrenteData.latitude || concorrenteData.longitude) {
            concorrenteInsert.geocodedAt = now();
          }

          concorrentesToInsert.push(concorrenteInsert);
        }
      }

      // 5.4 ACUMULAR leads (não inserir ainda)
      for (const leadData of mercadoItem.leads) {
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
          hasCNPJ: false,
          hasCNAE: !!leadData.cnae,
          hasCoords: !!(leadData.latitude && leadData.longitude),
        });

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
            cnae: truncate(leadData.cnae || '', 20),
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

          if (leadData.latitude !== undefined && leadData.latitude !== null) {
            leadInsert.latitude = leadData.latitude;
          }
          if (leadData.longitude !== undefined && leadData.longitude !== null) {
            leadInsert.longitude = leadData.longitude;
          }
          if (leadData.latitude || leadData.longitude) {
            leadInsert.geocodedAt = now();
          }

          leadsToInsert.push(leadInsert);
        }
      }
    }

    // 6. BATCH INSERT - Inserir tudo de uma vez
    if (concorrentesToInsert.length > 0) {
      await db.insert(concorrentes).values(concorrentesToInsert);
      result.concorrentesCreated = concorrentesToInsert.length;
      logger.debug(`[Enrich] Batch inserted ${concorrentesToInsert.length} concorrentes`);
    }

    if (leadsToInsert.length > 0) {
      await db.insert(leads).values(leadsToInsert);
      result.leadsCreated = leadsToInsert.length;
      logger.debug(`[Enrich] Batch inserted ${leadsToInsert.length} leads`);
    }

    // 7. Marcar cliente como enriquecido
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
      `[Enrich] ✅ BATCH OPTIMIZED success for ${cliente.nome} in ${(result.duration / 1000).toFixed(1)}s`
    );
    logger.debug(
      `[Enrich] Created: ${result.mercadosCreated}M ${result.produtosCreated}P ${result.concorrentesCreated}C ${result.leadsCreated}L`
    );

    return result;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.duration = Date.now() - startTime;

    console.error(`[Enrich] ❌ BATCH OPTIMIZED failed for cliente ${clienteId}:`, error);

    return result;
  }
}
