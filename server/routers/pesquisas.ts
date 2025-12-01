/**
 * Pesquisas Router - Refatorado completamente
 * Gerenciamento completo de pesquisas com validações robustas
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  pesquisas,
  clientes,
  mercadosUnicos,
  leads,
  concorrentes,
  produtos,
  clientesMercados,
  enrichmentJobs,
  enrichmentRuns,
} from '@/drizzle/schema';
import { eq, and, desc, count, avg, sql, inArray } from 'drizzle-orm';

export const pesquisasRouter = createTRPCRouter({
  /**
   * Listar todas as pesquisas (com filtro opcional por projeto)
   */
  list: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
        })
        .default({})
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        console.log('[Pesquisas.list] Input raw:', input);
        console.log('[Pesquisas.list] Input type:', typeof input);
        console.log('[Pesquisas.list] Input.projectId:', input.projectId);
        console.log('[Pesquisas.list] Input.projectId type:', typeof input.projectId);
        console.log('[Pesquisas.list] Condição (input.projectId):', !!input.projectId);
        console.log('[Pesquisas.list] ==================');

        if (input.projectId) {
          console.log('[Pesquisas.list] ✅ Filtrando por projectId:', input.projectId);
          const result = await db
            .select()
            .from(pesquisas)
            .where(and(eq(pesquisas.projectId, input.projectId), eq(pesquisas.ativo, 1)))
            .orderBy(desc(pesquisas.createdAt));
          console.log('[Pesquisas.list] ✅ Resultado filtrado:', result.length, 'pesquisas');
          return result;
        }

        console.log('[Pesquisas.list] ❌ Retornando TODAS as pesquisas (sem filtro)');
        const result = await db
          .select()
          .from(pesquisas)
          .where(eq(pesquisas.ativo, 1))
          .orderBy(desc(pesquisas.createdAt));
        console.log('[Pesquisas.list] ❌ Total:', result.length, 'pesquisas');
        return result;
      } catch (error) {
        console.error('[Pesquisas] Error listing:', error);
        throw new Error('Failed to list pesquisas');
      }
    }),

  /**
   * Buscar pesquisa por ID com contadores completos (mesma estrutura do dashboard)
   */
  getByIdWithCounts: publicProcedure.input(z.number()).query(async ({ input: id }) => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    try {
      // Usar queries TypeScript diretas (mais confiável em todos os ambientes)
      console.log('[Pesquisas] Using TypeScript queries for pesquisa', id);

      const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, id)).limit(1);

      if (!pesquisa) {
        return null;
      }

      // Calcular contadores (mesma lógica do dashboard.getProjects)
      const [
        clientesStats,
        leadsCountResult,
        mercadosCountResult,
        produtosCountResult,
        concorrentesCountResult,
        clientesQualidadeResult,
        leadsQualidadeResult,
        concorrentesQualidadeResult,
        clientesGeoResult,
        leadsGeoResult,
        concorrentesGeoResult,
      ] = await Promise.all([
        db
          .select({
            total: count(),
            enriquecidos: sql<number>`COUNT(CASE WHEN ${clientes.enriquecido} = true THEN 1 END)::int`,
          })
          .from(clientes)
          .where(eq(clientes.pesquisaId, id)),
        db.select({ count: count() }).from(leads).where(eq(leads.pesquisaId, id)),
        db.select({ count: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, id)),
        db.select({ count: count() }).from(produtos).where(eq(produtos.pesquisaId, id)),
        db.select({ count: count() }).from(concorrentes).where(eq(concorrentes.pesquisaId, id)),
        db
          .select({ avg: avg(clientes.qualidadeScore) })
          .from(clientes)
          .where(and(eq(clientes.pesquisaId, id), sql`${clientes.qualidadeScore} IS NOT NULL`)),
        db
          .select({ avg: avg(leads.qualidadeScore) })
          .from(leads)
          .where(and(eq(leads.pesquisaId, id), sql`${leads.qualidadeScore} IS NOT NULL`)),
        db
          .select({ avg: avg(concorrentes.qualidadeScore) })
          .from(concorrentes)
          .where(
            and(eq(concorrentes.pesquisaId, id), sql`${concorrentes.qualidadeScore} IS NOT NULL`)
          ),
        // Geocodificação: contar separadamente para evitar produto cartesiano
        db
          .select({ count: count() })
          .from(clientes)
          .where(
            and(
              eq(clientes.pesquisaId, id),
              sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL`
            )
          ),
        db
          .select({ count: count() })
          .from(leads)
          .where(
            and(
              eq(leads.pesquisaId, id),
              sql`${leads.latitude} IS NOT NULL AND ${leads.longitude} IS NOT NULL`
            )
          ),
        db
          .select({ count: count() })
          .from(concorrentes)
          .where(
            and(
              eq(concorrentes.pesquisaId, id),
              sql`${concorrentes.latitude} IS NOT NULL AND ${concorrentes.longitude} IS NOT NULL`
            )
          ),
      ]);

      return {
        ...pesquisa,
        totalClientes: clientesStats[0]?.total || 0,
        clientesEnriquecidos: clientesStats[0]?.enriquecidos || 0,
        leadsCount: leadsCountResult[0]?.count || 0,
        mercadosCount: mercadosCountResult[0]?.count || 0,
        produtosCount: produtosCountResult[0]?.count || 0,
        concorrentesCount: concorrentesCountResult[0]?.count || 0,
        clientesQualidadeMedia: clientesQualidadeResult[0]?.avg
          ? Number(clientesQualidadeResult[0].avg)
          : null,
        leadsQualidadeMedia: leadsQualidadeResult[0]?.avg
          ? Number(leadsQualidadeResult[0].avg)
          : null,
        concorrentesQualidadeMedia: concorrentesQualidadeResult[0]?.avg
          ? Number(concorrentesQualidadeResult[0].avg)
          : null,
        geoEnriquecimentoTotal:
          (clientesGeoResult[0]?.count || 0) +
          (leadsGeoResult[0]?.count || 0) +
          (concorrentesGeoResult[0]?.count || 0),
      };
    } catch (error) {
      console.error('[Pesquisas] Error getting by ID with counts:', error);
      throw new Error('Failed to get pesquisa');
    }
  }),

  /**
   * Buscar pesquisa por ID com estatísticas
   */
  getById: publicProcedure.input(z.number()).query(async ({ input: id }) => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    try {
      const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, id)).limit(1);

      if (!pesquisa) {
        return null;
      }

      // Buscar estatísticas relacionadas
      const [clientesCount, mercadosCount] = await Promise.all([
        db.select({ value: count() }).from(clientes).where(eq(clientes.pesquisaId, id)),
        db.select({ value: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, id)),
      ]);

      return {
        ...pesquisa,
        stats: {
          clientes: clientesCount[0]?.value || 0,
          mercados: mercadosCount[0]?.value || 0,
        },
      };
    } catch (error) {
      console.error('[Pesquisas] Error getting by ID:', error);
      throw new Error('Failed to get pesquisa');
    }
  }),

  /**
   * Criar nova pesquisa com CSV de clientes
   */
  createWithCSV: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        nome: z.string().min(1, 'Nome é obrigatório').max(255),
        descricao: z.string().optional(),
        csvData: z.array(z.array(z.string())),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // 1. Criar pesquisa
        const [pesquisa] = await db
          .insert(pesquisas)
          .values({
            projectId: input.projectId,
            nome: input.nome,
            descricao: input.descricao,
            status: 'importado',
            qtdConcorrentesPorMercado: 5,
            qtdLeadsPorMercado: 10,
            qtdProdutosPorCliente: 3,
            ativo: 1,
            totalClientes: 0,
            clientesEnriquecidos: 0,
          })
          .returning();

        // 2. Parsear CSV e inserir clientes
        const headers = input.csvData[0].map((h) => h.toLowerCase().trim());
        const rows = input.csvData.slice(1);

        const clientesToInsert = rows
          .filter((row) => row.some((cell) => cell.trim())) // Skip empty rows
          .map((row) => {
            const rowData: Record<string, string> = {};
            headers.forEach((header, i) => {
              rowData[header] = row[i]?.trim() || '';
            });

            return {
              pesquisaId: pesquisa.id,
              projectId: input.projectId,
              nome: rowData.nome || rowData.razao_social || '',
              cnpj: rowData.cnpj || '',
              cidade: rowData.cidade || '',
              uf: rowData.uf || rowData.estado || '',
              setor: rowData.setor || rowData.segmento || '',
              telefone: rowData.telefone || rowData.phone || '',
              email: rowData.email || '',
              produtoPrincipal: rowData.produto || rowData.produto_principal || '',
              validationStatus: 'pending',
            };
          });

        if (clientesToInsert.length > 0) {
          await db.insert(clientes).values(clientesToInsert);

          // 3. Atualizar totalClientes
          await db
            .update(pesquisas)
            .set({ totalClientes: clientesToInsert.length })
            .where(eq(pesquisas.id, pesquisa.id));
        }

        return {
          ...pesquisa,
          totalClientes: clientesToInsert.length,
        };
      } catch (error) {
        console.error('[Pesquisas] Error creating with CSV:', error);
        throw new Error('Failed to create pesquisa with CSV');
      }
    }),

  /**
   * Criar nova pesquisa (sem CSV)
   */
  create: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        nome: z.string().min(1, 'Nome é obrigatório').max(255),
        descricao: z.string().optional(),
        status: z.string().optional(),
        qtdConcorrentesPorMercado: z.number().min(1).max(50).optional(),
        qtdLeadsPorMercado: z.number().min(1).max(100).optional(),
        qtdProdutosPorCliente: z.number().min(1).max(20).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .insert(pesquisas)
          .values({
            projectId: input.projectId,
            nome: input.nome,
            descricao: input.descricao,
            status: input.status || 'importado',
            qtdConcorrentesPorMercado: input.qtdConcorrentesPorMercado || 5,
            qtdLeadsPorMercado: input.qtdLeadsPorMercado || 10,
            qtdProdutosPorCliente: input.qtdProdutosPorCliente || 3,
            ativo: 1,
            totalClientes: 0,
            clientesEnriquecidos: 0,
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Pesquisas] Error creating:', error);
        throw new Error('Failed to create pesquisa');
      }
    }),

  /**
   * Atualizar pesquisa
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).max(255).optional(),
        descricao: z.string().optional(),
        status: z.string().optional(),
        qtdConcorrentesPorMercado: z.number().min(1).max(50).optional(),
        qtdLeadsPorMercado: z.number().min(1).max(100).optional(),
        qtdProdutosPorCliente: z.number().min(1).max(20).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const { id, ...data } = input;

        const [result] = await db
          .update(pesquisas)
          .set({
            ...data,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(pesquisas.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Pesquisas] Error updating:', error);
        throw new Error('Failed to update pesquisa');
      }
    }),

  /**
   * Deletar pesquisa (soft delete)
   */
  delete: publicProcedure.input(z.number()).mutation(async ({ input: id }) => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    try {
      await db.update(pesquisas).set({ ativo: 0 }).where(eq(pesquisas.id, id));

      return { success: true };
    } catch (error) {
      console.error('[Pesquisas] Error deleting:', error);
      throw new Error('Failed to delete pesquisa');
    }
  }),

  /**
   * Atualizar estatísticas da pesquisa
   */
  updateStats: publicProcedure
    .input(
      z.object({
        id: z.number(),
        totalClientes: z.number().optional(),
        clientesEnriquecidos: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const { id, ...stats } = input;

        const [result] = await db
          .update(pesquisas)
          .set({
            ...stats,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(pesquisas.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Pesquisas] Error updating stats:', error);
        throw new Error('Failed to update stats');
      }
    }),

  /**
   * Recalcular métricas da pesquisa
   * Atualiza contadores de clientes, leads, mercados, concorrentes e qualidade média
   */
  recalculateMetrics: publicProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        console.log('[Pesquisas] Recalculando métricas para pesquisa:', input.pesquisaId);

        // 1. Contar clientes total e enriquecidos
        const [clientesTotal] = await db
          .select({ value: count() })
          .from(clientes)
          .where(eq(clientes.pesquisaId, input.pesquisaId));

        const [clientesEnriquecidos] = await db
          .select({ value: count() })
          .from(clientes)
          .where(
            and(
              eq(clientes.pesquisaId, input.pesquisaId),
              sql`${clientes.qualityScore} IS NOT NULL AND ${clientes.qualityScore} > 0`
            )
          );

        // 2. Contar leads
        const [leadsTotal] = await db
          .select({ value: count() })
          .from(leads)
          .where(eq(leads.pesquisaId, input.pesquisaId));

        // 3. Contar mercados
        const [mercadosTotal] = await db
          .select({ value: count() })
          .from(mercadosUnicos)
          .where(eq(mercadosUnicos.pesquisaId, input.pesquisaId));

        // 4. Contar concorrentes
        const [concorrentesTotal] = await db
          .select({ value: count() })
          .from(concorrentes)
          .where(eq(concorrentes.pesquisaId, input.pesquisaId));

        // 4.5. Contar produtos
        const [produtosTotal] = await db
          .select({ value: count() })
          .from(produtos)
          .where(eq(produtos.pesquisaId, input.pesquisaId));

        // 5. Calcular qualidade média de clientes
        const [clientesQualidade] = await db
          .select({ value: avg(clientes.qualityScore) })
          .from(clientes)
          .where(
            and(
              eq(clientes.pesquisaId, input.pesquisaId),
              sql`${clientes.qualityScore} IS NOT NULL AND ${clientes.qualityScore} > 0`
            )
          );

        // 6. Calcular qualidade média de leads
        const [leadsQualidade] = await db
          .select({ value: avg(leads.qualityScore) })
          .from(leads)
          .where(
            and(
              eq(leads.pesquisaId, input.pesquisaId),
              sql`${leads.qualityScore} IS NOT NULL AND ${leads.qualityScore} > 0`
            )
          );

        // 7. Calcular qualidade média de concorrentes
        const [concorrentesQualidade] = await db
          .select({ value: avg(concorrentes.qualityScore) })
          .from(concorrentes)
          .where(
            and(
              eq(concorrentes.pesquisaId, input.pesquisaId),
              sql`${concorrentes.qualityScore} IS NOT NULL AND ${concorrentes.qualityScore} > 0`
            )
          );

        // 7.5. Contar enriquecimento geográfico
        // Total de entidades com localização preenchida
        const [clientesComLocalizacao] = await db
          .select({ value: count() })
          .from(clientes)
          .where(
            and(
              eq(clientes.pesquisaId, input.pesquisaId),
              sql`(
                ${clientes.cidade} IS NOT NULL AND ${clientes.cidade} != '' OR
                ${clientes.uf} IS NOT NULL AND ${clientes.uf} != ''
              )`
            )
          );

        const [leadsComLocalizacao] = await db
          .select({ value: count() })
          .from(leads)
          .where(
            and(
              eq(leads.pesquisaId, input.pesquisaId),
              sql`(
                ${leads.cidade} IS NOT NULL AND ${leads.cidade} != '' OR
                ${leads.uf} IS NOT NULL AND ${leads.uf} != ''
              )`
            )
          );

        const [concorrentesComLocalizacao] = await db
          .select({ value: count() })
          .from(concorrentes)
          .where(
            and(
              eq(concorrentes.pesquisaId, input.pesquisaId),
              sql`(
                ${concorrentes.cidade} IS NOT NULL AND ${concorrentes.cidade} != '' OR
                ${concorrentes.uf} IS NOT NULL AND ${concorrentes.uf} != ''
              )`
            )
          );

        const totalComLocalizacao =
          (clientesComLocalizacao?.value || 0) +
          (leadsComLocalizacao?.value || 0) +
          (concorrentesComLocalizacao?.value || 0);

        const totalEntidades =
          (clientesTotal?.value || 0) + (leadsTotal?.value || 0) + (concorrentesTotal?.value || 0);

        // 8. Atualizar pesquisa com novos valores
        const [updated] = await db
          .update(pesquisas)
          .set({
            totalClientes: clientesTotal?.value || 0,
            clientesEnriquecidos: clientesEnriquecidos?.value || 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(pesquisas.id, input.pesquisaId))
          .returning();

        console.log('[Pesquisas] Métricas recalculadas com sucesso:', {
          totalClientes: clientesTotal?.value || 0,
          clientesEnriquecidos: clientesEnriquecidos?.value || 0,
          leadsCount: leadsTotal?.value || 0,
          mercadosCount: mercadosTotal?.value || 0,
          concorrentesCount: concorrentesTotal?.value || 0,
          produtosCount: produtosTotal?.value || 0,
          clientesQualidadeMedia: clientesQualidade?.value || 0,
          leadsQualidadeMedia: leadsQualidade?.value || 0,
          concorrentesQualidadeMedia: concorrentesQualidade?.value || 0,
          geoEnriquecimento: `${totalComLocalizacao}/${totalEntidades}`,
        });

        return {
          success: true,
          metrics: {
            totalClientes: clientesTotal?.value || 0,
            clientesEnriquecidos: clientesEnriquecidos?.value || 0,
            leadsCount: leadsTotal?.value || 0,
            mercadosCount: mercadosTotal?.value || 0,
            concorrentesCount: concorrentesTotal?.value || 0,
            produtosCount: produtosTotal?.value || 0,
            clientesQualidadeMedia: Math.round(Number(clientesQualidade?.value || 0)),
            leadsQualidadeMedia: Math.round(Number(leadsQualidade?.value || 0)),
            concorrentesQualidadeMedia: Math.round(Number(concorrentesQualidade?.value || 0)),
            geoEnriquecimentoTotal: totalComLocalizacao,
            geoEnriquecimentoTotalEntidades: totalEntidades,
          },
        };
      } catch (error) {
        console.error('[Pesquisas] Error recalculating metrics:', error);
        throw new Error('Failed to recalculate metrics');
      }
    }),

  /**
   * Buscar status do enrichment job
   */
  getEnrichmentJobStatus: publicProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Buscar enrichment job mais recente da pesquisa
        const { enrichmentJobs } = await import('@/drizzle/schema');
        const [job] = await db
          .select({
            id: enrichmentJobs.id,
            status: enrichmentJobs.status,
            currentBatch: enrichmentJobs.currentBatch,
            totalBatches: enrichmentJobs.totalBatches,
            completedAt: enrichmentJobs.completedAt,
          })
          .from(enrichmentJobs)
          .where(eq(enrichmentJobs.pesquisaId, input.pesquisaId))
          .orderBy(desc(enrichmentJobs.createdAt))
          .limit(1);

        if (!job) {
          return null;
        }

        return {
          id: job.id,
          status: job.status,
          currentBatch: job.currentBatch,
          totalBatches: job.totalBatches,
          completedAt: job.completedAt,
        };
      } catch (error) {
        console.error('[Pesquisas] Error fetching enrichment job status:', error);
        return null;
      }
    }),

  /**
   * Limpar todos os dados enriquecidos de uma pesquisa
   * Permite recomeçar do zero quando houver erros
   */
  cleanEnrichment: publicProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      console.log('[Pesquisas.cleanEnrichment] Iniciando limpeza da pesquisa:', input.pesquisaId);

      try {
        // Verificar se pesquisa existe
        const [pesquisa] = await db
          .select()
          .from(pesquisas)
          .where(eq(pesquisas.id, input.pesquisaId));

        if (!pesquisa) {
          throw new Error('Pesquisa não encontrada');
        }

        // Buscar IDs dos clientes da pesquisa
        const clientesDaPesquisa = await db
          .select({ id: clientes.id })
          .from(clientes)
          .where(eq(clientes.pesquisaId, input.pesquisaId));

        const clienteIds = clientesDaPesquisa.map((c) => c.id);

        console.log('[Pesquisas.cleanEnrichment] Clientes encontrados:', clienteIds.length);

        if (clienteIds.length === 0) {
          return {
            success: true,
            message: 'Nenhum dado para limpar',
            stats: {
              leadsRemoved: 0,
              concorrentesRemoved: 0,
              produtosRemoved: 0,
              mercadosRemoved: 0,
              clientesReset: 0,
              jobsCancelled: 0,
            },
          };
        }

        // Iniciar transação
        const stats = {
          leadsRemoved: 0,
          concorrentesRemoved: 0,
          produtosRemoved: 0,
          mercadosRemoved: 0,
          clientesReset: 0,
          jobsCancelled: 0,
        };

        // 1. DELETAR jobs (não apenas cancelar)
        try {
          const jobsResult = await db
            .delete(enrichmentJobs)
            .where(eq(enrichmentJobs.pesquisaId, input.pesquisaId));
          stats.jobsCancelled = jobsResult.rowsAffected || 0;
          console.log('[Pesquisas.cleanEnrichment] Jobs deletados:', stats.jobsCancelled);
        } catch (error) {
          console.error('[Pesquisas.cleanEnrichment] Erro ao deletar jobs:', error);
          stats.jobsCancelled = 0;
        }

        // 2. Limpar enrichment runs
        await db.delete(enrichmentRuns).where(eq(enrichmentRuns.projectId, pesquisa.projectId));
        console.log('[Pesquisas.cleanEnrichment] Enrichment runs removidos');

        // 3. Deletar leads
        const leadsResult = await db.delete(leads).where(eq(leads.pesquisaId, input.pesquisaId));
        stats.leadsRemoved = leadsResult.rowsAffected || 0;
        console.log('[Pesquisas.cleanEnrichment] Leads removidos:', stats.leadsRemoved);

        // 4. Deletar concorrentes
        const concorrentesResult = await db
          .delete(concorrentes)
          .where(eq(concorrentes.pesquisaId, input.pesquisaId));
        stats.concorrentesRemoved = concorrentesResult.rowsAffected || 0;
        console.log(
          '[Pesquisas.cleanEnrichment] Concorrentes removidos:',
          stats.concorrentesRemoved
        );

        // 5. Deletar produtos
        for (const clienteId of clienteIds) {
          const result = await db.delete(produtos).where(eq(produtos.clienteId, clienteId));
          stats.produtosRemoved += result.rowsAffected || 0;
        }
        console.log('[Pesquisas.cleanEnrichment] Produtos removidos:', stats.produtosRemoved);

        // 6. Buscar mercados associados
        const mercadosAssociados = await db
          .select({ mercadoId: clientesMercados.mercadoId })
          .from(clientesMercados)
          .where(sql`${clientesMercados.clienteId} IN (${sql.join(clienteIds, sql`, `)})`)
          .groupBy(clientesMercados.mercadoId);

        const mercadoIds = mercadosAssociados.map((m) => m.mercadoId);
        console.log('[Pesquisas.cleanEnrichment] Mercados associados:', mercadoIds.length);

        // 7. Deletar relacionamentos clientes-mercados
        for (const clienteId of clienteIds) {
          await db.delete(clientesMercados).where(eq(clientesMercados.clienteId, clienteId));
        }
        console.log('[Pesquisas.cleanEnrichment] Relacionamentos clientes-mercados removidos');

        // 8. Deletar mercados órfãos (que não têm outros clientes)
        for (const mercadoId of mercadoIds) {
          const [countResult] = await db
            .select({ count: count() })
            .from(clientesMercados)
            .where(eq(clientesMercados.mercadoId, mercadoId));

          if (countResult.count === 0) {
            await db.delete(mercadosUnicos).where(eq(mercadosUnicos.id, mercadoId));
            stats.mercadosRemoved++;
          }
        }
        console.log(
          '[Pesquisas.cleanEnrichment] Mercados órfãos removidos:',
          stats.mercadosRemoved
        );

        // 9. Resetar campos enriquecidos dos clientes
        const resetResult = await db
          .update(clientes)
          .set({
            site: null,
            cidade: null,
            uf: null,
            latitude: null,
            longitude: null,
            setor: null,
            descricao: null,
            qualidadeScore: null,
            qualidadeClassificacao: null,
            enriquecido: 0,
            enriquecidoEm: null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(clientes.pesquisaId, input.pesquisaId));
        stats.clientesReset = resetResult.rowsAffected || 0;
        console.log('[Pesquisas.cleanEnrichment] Clientes resetados:', stats.clientesReset);

        // 10. Resetar TODOS os contadores da pesquisa
        await db
          .update(pesquisas)
          .set({
            clientesEnriquecidos: 0,
            leadsCount: 0,
            concorrentesCount: 0,
            produtosCount: 0,
            mercadosCount: 0,
            clientesQualidadeMedia: null,
            leadsQualidadeMedia: null,
            concorrentesQualidadeMedia: null,
            geoEnriquecimentoTotal: 0,
            geoEnriquecimentoTotalEntidades: 0,
            status: 'rascunho',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(pesquisas.id, input.pesquisaId));
        console.log('[Pesquisas.cleanEnrichment] Pesquisa resetada - todos contadores zerados');

        console.log('[Pesquisas.cleanEnrichment] Limpeza concluída com sucesso:', stats);

        return {
          success: true,
          message: 'Limpeza concluída com sucesso!',
          stats,
        };
      } catch (error) {
        console.error('[Pesquisas.cleanEnrichment] Erro durante limpeza:', error);
        throw new Error(
          `Erro ao limpar pesquisa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
      }
    }),
});
