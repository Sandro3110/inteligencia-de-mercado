/**
 * Pesquisas Router - Refatorado completamente
 * Gerenciamento completo de pesquisas com validações robustas
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { pesquisas, clientes, mercadosUnicos } from '@/drizzle/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export const pesquisasRouter = createTRPCRouter({
  /**
   * Listar todas as pesquisas (com filtro opcional por projeto)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        console.log('[Pesquisas.list] Input recebido:', JSON.stringify(input));

        if (input?.projectId) {
          console.log('[Pesquisas.list] Filtrando por projectId:', input.projectId);
          const result = await db
            .select()
            .from(pesquisas)
            .where(and(eq(pesquisas.projectId, input.projectId), eq(pesquisas.ativo, 1)))
            .orderBy(desc(pesquisas.createdAt));
          console.log('[Pesquisas.list] Resultado filtrado:', result.length, 'pesquisas');
          return result;
        }

        console.log('[Pesquisas.list] Retornando TODAS as pesquisas (sem filtro)');
        const result = await db
          .select()
          .from(pesquisas)
          .where(eq(pesquisas.ativo, 1))
          .orderBy(desc(pesquisas.createdAt));
        console.log('[Pesquisas.list] Total:', result.length, 'pesquisas');
        return result;
      } catch (error) {
        console.error('[Pesquisas] Error listing:', error);
        throw new Error('Failed to list pesquisas');
      }
    }),

  /**
   * Buscar pesquisa por ID com estatísticas
   */
  getById: protectedProcedure.input(z.number()).query(async ({ input: id }) => {
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
  createWithCSV: protectedProcedure
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
  create: protectedProcedure
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
  update: protectedProcedure
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
  delete: protectedProcedure.input(z.number()).mutation(async ({ input: id }) => {
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
  updateStats: protectedProcedure
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
});
