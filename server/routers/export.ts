import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { clientes, leads, concorrentes, mercadosUnicos } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Export Router - Exportação de dados para CSV
 */
export const exportRouter = createTRPCRouter({
  /**
   * Exportar clientes para CSV
   */
  exportClientes: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const data = await db
        .select()
        .from(clientes)
        .where(eq(clientes.pesquisaId, input.pesquisaId));

      const csv = generateCSV(data, [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'cnpj', label: 'CNPJ' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'uf', label: 'UF' },
        { key: 'setor', label: 'Setor' },
        { key: 'produtoPrincipal', label: 'Produto Principal' },
        { key: 'telefone', label: 'Telefone' },
        { key: 'email', label: 'Email' },
        { key: 'siteOficial', label: 'Site' },
        { key: 'validationStatus', label: 'Status' },
      ]);

      return {
        filename: `clientes_${input.pesquisaId}_${Date.now()}.csv`,
        data: csv,
      };
    }),

  /**
   * Exportar leads para CSV
   */
  exportLeads: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const data = await db.select().from(leads).where(eq(leads.pesquisaId, input.pesquisaId));

      const csv = generateCSV(data, [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'setor', label: 'Setor' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'uf', label: 'UF' },
        { key: 'qualidadeClassificacao', label: 'Potencial' },
        { key: 'qualidadeScore', label: 'Score' },
        { key: 'justificativa', label: 'Justificativa' },
        { key: 'porte', label: 'Porte' },
      ]);

      return {
        filename: `leads_${input.pesquisaId}_${Date.now()}.csv`,
        data: csv,
      };
    }),

  /**
   * Exportar concorrentes para CSV
   */
  exportConcorrentes: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const data = await db
        .select()
        .from(concorrentes)
        .where(eq(concorrentes.pesquisaId, input.pesquisaId));

      const csv = generateCSV(data, [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'porte', label: 'Porte' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'uf', label: 'UF' },
        { key: 'regiao', label: 'Região' },
      ]);

      return {
        filename: `concorrentes_${input.pesquisaId}_${Date.now()}.csv`,
        data: csv,
      };
    }),

  /**
   * Exportar mercados para CSV
   */
  exportMercados: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const data = await db
        .select()
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.pesquisaId, input.pesquisaId));

      const csv = generateCSV(data, [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'segmentacao', label: 'Segmentação' },
        { key: 'tamanhoEstimado', label: 'Tamanho Estimado' },
        { key: 'quantidadeClientes', label: 'Quantidade de Clientes' },
      ]);

      return {
        filename: `mercados_${input.pesquisaId}_${Date.now()}.csv`,
        data: csv,
      };
    }),

  /**
   * Exportar tudo (consolidado)
   */
  exportAll: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Buscar todos os dados
      const [clientesData, leadsData, concorrentesData, mercadosData] = await Promise.all([
        db.select().from(clientes).where(eq(clientes.pesquisaId, input.pesquisaId)),
        db.select().from(leads).where(eq(leads.pesquisaId, input.pesquisaId)),
        db.select().from(concorrentes).where(eq(concorrentes.pesquisaId, input.pesquisaId)),
        db.select().from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, input.pesquisaId)),
      ]);

      // Gerar CSVs individuais
      const clientesCSV = generateCSV(clientesData, [
        { key: 'nome', label: 'Nome' },
        { key: 'cnpj', label: 'CNPJ' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'uf', label: 'UF' },
      ]);

      const leadsCSV = generateCSV(leadsData, [
        { key: 'nome', label: 'Nome' },
        { key: 'setor', label: 'Setor' },
        { key: 'qualidadeClassificacao', label: 'Potencial' },
      ]);

      const concorrentesCSV = generateCSV(concorrentesData, [
        { key: 'nome', label: 'Nome' },
        { key: 'porte', label: 'Porte' },
        { key: 'cidade', label: 'Cidade' },
      ]);

      const mercadosCSV = generateCSV(mercadosData, [
        { key: 'nome', label: 'Nome' },
        { key: 'categoria', label: 'Categoria' },
      ]);

      // Consolidar em um único CSV com separadores
      const consolidatedCSV = [
        '=== CLIENTES ===',
        clientesCSV,
        '',
        '=== LEADS ===',
        leadsCSV,
        '',
        '=== CONCORRENTES ===',
        concorrentesCSV,
        '',
        '=== MERCADOS ===',
        mercadosCSV,
      ].join('\n');

      return {
        filename: `relatorio_completo_${input.pesquisaId}_${Date.now()}.csv`,
        data: consolidatedCSV,
      };
    }),
});

/**
 * Helper para gerar CSV a partir de dados
 */
function generateCSV<T extends Record<string, any>>(
  data: T[],
  columns: Array<{ key: string; label: string }>
): string {
  if (data.length === 0) {
    return columns.map((col) => col.label).join(',');
  }

  // Header
  const header = columns.map((col) => col.label).join(',');

  // Rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';

        // Escape quotes and wrap in quotes if contains comma or newline
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}
