import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  clientes,
  leads,
  concorrentes,
  mercadosUnicos,
  pesquisas as pesquisasTable,
} from '@/drizzle/schema';
import { eq, inArray, count } from 'drizzle-orm';

/**
 * Helper para gerar CSV
 */
function generateCSV(data: any[], columns: { key: string; label: string }[]): string {
  if (!data || data.length === 0) return '';

  // Header
  const header = columns.map((col) => col.label).join(',');

  // Rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Export Router - Exportação de dados para CSV e Excel
 */
export const exportRouter = createTRPCRouter({
  /**
   * Exportar projeto completo para Excel com 5 abas
   */
  exportProjectExcel: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();

      // Buscar todas as pesquisas do projeto
      const pesquisas = await db
        .select()
        .from(pesquisasTable)
        .where(eq(pesquisasTable.projectId, input.projectId));

      if (pesquisas.length === 0) {
        throw new Error('Projeto não possui pesquisas');
      }

      const pesquisaIds = pesquisas.map((p) => p.id);

      // Verificar tamanho dos dados antes de exportar
      const [mercadosCount, clientesCount, leadsCount, concorrentesCount] = await Promise.all([
        db
          .select({ count: count() })
          .from(mercadosUnicos)
          .where(inArray(mercadosUnicos.pesquisaId, pesquisaIds)),
        db
          .select({ count: count() })
          .from(clientes)
          .where(inArray(clientes.pesquisaId, pesquisaIds)),
        db.select({ count: count() }).from(leads).where(inArray(leads.pesquisaId, pesquisaIds)),
        db
          .select({ count: count() })
          .from(concorrentes)
          .where(inArray(concorrentes.pesquisaId, pesquisaIds)),
      ]);

      const totalMercados = mercadosCount[0]?.count || 0;
      const totalClientes = clientesCount[0]?.count || 0;
      const totalLeads = leadsCount[0]?.count || 0;
      const totalConcorrentes = concorrentesCount[0]?.count || 0;
      const totalRegistros = totalMercados + totalClientes + totalLeads + totalConcorrentes;

      // Limite de segurança: 50.000 registros
      const LIMITE_REGISTROS = 50000;
      if (totalRegistros > LIMITE_REGISTROS) {
        throw new Error(
          `Projeto possui ${totalRegistros.toLocaleString('pt-BR')} registros, ` +
            `excedendo o limite de ${LIMITE_REGISTROS.toLocaleString('pt-BR')} para exportação. ` +
            `Por favor, filtre os dados por pesquisa ou entre em contato com o suporte.`
        );
      }

      console.log(`[Export] Exportando ${totalRegistros} registros para Excel`);

      // 1. Aba Mercados
      const mercadosData = await db
        .select()
        .from(mercadosUnicos)
        .where(inArray(mercadosUnicos.pesquisaId, pesquisaIds));

      const mercadosSheet = workbook.addWorksheet('Mercados');
      mercadosSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'Tamanho Estimado', key: 'tamanhoEstimado', width: 20 },
        { header: 'Potencial', key: 'potencial', width: 15 },
        { header: 'Cidade', key: 'cidade', width: 20 },
        { header: 'UF', key: 'uf', width: 10 },
      ];
      mercadosSheet.addRows(mercadosData);
      mercadosSheet.getRow(1).font = { bold: true };
      mercadosSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      mercadosSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // 2. Aba Clientes
      const clientesData = await db
        .select()
        .from(clientes)
        .where(inArray(clientes.pesquisaId, pesquisaIds));

      const clientesSheet = workbook.addWorksheet('Clientes');
      clientesSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'CNPJ', key: 'cnpj', width: 20 },
        { header: 'Cidade', key: 'cidade', width: 20 },
        { header: 'UF', key: 'uf', width: 10 },
        { header: 'Setor', key: 'setor', width: 20 },
        { header: 'Produto Principal', key: 'produtoPrincipal', width: 30 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Site', key: 'siteOficial', width: 30 },
        { header: 'Status', key: 'validationStatus', width: 15 },
      ];
      clientesSheet.addRows(clientesData);
      clientesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      clientesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // 3. Aba Produtos (vazia por enquanto - estrutura para futuro)
      const produtosSheet = workbook.addWorksheet('Produtos');
      produtosSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'Categoria', key: 'categoria', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 30 },
      ];
      produtosSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      produtosSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // 4. Aba Concorrentes
      const concorrentesData = await db
        .select()
        .from(concorrentes)
        .where(inArray(concorrentes.pesquisaId, pesquisaIds));

      const concorrentesSheet = workbook.addWorksheet('Concorrentes');
      concorrentesSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Cidade', key: 'cidade', width: 20 },
        { header: 'UF', key: 'uf', width: 10 },
        { header: 'Porte', key: 'porte', width: 15 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'Posicionamento', key: 'posicionamento', width: 30 },
        { header: 'Diferenciais', key: 'diferenciais', width: 30 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Site', key: 'siteOficial', width: 30 },
      ];
      concorrentesSheet.addRows(concorrentesData);
      concorrentesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      concorrentesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // 5. Aba Leads
      const leadsData = await db.select().from(leads).where(inArray(leads.pesquisaId, pesquisaIds));

      const leadsSheet = workbook.addWorksheet('Leads');
      leadsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Cidade', key: 'cidade', width: 20 },
        { header: 'UF', key: 'uf', width: 10 },
        { header: 'Segmento', key: 'segmento', width: 20 },
        { header: 'Porte', key: 'porte', width: 15 },
        { header: 'Qualidade', key: 'qualidade', width: 15 },
        { header: 'Potencial', key: 'potencial', width: 15 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Stage', key: 'stage', width: 15 },
        { header: 'Justificativa', key: 'justificativa', width: 50 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Site', key: 'siteOficial', width: 30 },
      ];
      leadsSheet.addRows(leadsData);
      leadsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      leadsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // Gerar buffer do Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const base64 = buffer.toString('base64');

      return {
        filename: `projeto_${input.projectId}_${Date.now()}.xlsx`,
        data: base64,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }),
});
