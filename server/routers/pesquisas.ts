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
} from '@/drizzle/schema';
import { eq, and, desc, count, avg, sql } from 'drizzle-orm';

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
                ${clientes.estado} IS NOT NULL AND ${clientes.estado} != '' OR
                ${clientes.pais} IS NOT NULL AND ${clientes.pais} != ''
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
                ${leads.estado} IS NOT NULL AND ${leads.estado} != '' OR
                ${leads.pais} IS NOT NULL AND ${leads.pais} != ''
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
                ${concorrentes.estado} IS NOT NULL AND ${concorrentes.estado} != '' OR
                ${concorrentes.pais} IS NOT NULL AND ${concorrentes.pais} != ''
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
});
