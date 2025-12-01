'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  exportToExcelMultiSheet,
  createDefaultMetadata,
  createSummaryStats,
  type SheetData,
} from '@/lib/excel-multi-sheet';
import { trpc } from '@/lib/trpc/client';
import type { ExcelColumn } from '@/lib/excel-exporter';

interface ExportExcelMultiSheetButtonProps {
  // Contexto para buscar dados
  produtoNome?: string;
  setorNome?: string;
  categoria: string;
  pesquisaIds: number[];

  // Tipo de análise
  analysisType: 'produto' | 'setor';

  // Configurações
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Botão para exportar dados completos para Excel (múltiplas abas)
 * Gera arquivo .xlsx com abas separadas para Clientes, Leads e Concorrentes
 */
export function ExportExcelMultiSheetButton({
  produtoNome,
  setorNome,
  categoria,
  pesquisaIds,
  analysisType,
  label = 'Exportar Tudo (Excel)',
  variant = 'default',
  size = 'default',
  className,
}: ExportExcelMultiSheetButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Queries para buscar todos os dados
  // Nota: Estas queries precisam ser implementadas nos routers tRPC
  const clientesQuery = trpc.productAnalysis.getClientesByProduct.useQuery(
    {
      produtoNome: produtoNome || '',
      categoria,
      pesquisaIds,
      limit: 10000,
      offset: 0,
    },
    {
      enabled: false, // Não executar automaticamente
    }
  );

  const leadsQuery = trpc.productAnalysis.getLeadsByProduct.useQuery(
    {
      produtoNome: produtoNome || '',
      categoria,
      pesquisaIds,
      limit: 10000,
      offset: 0,
    },
    {
      enabled: false,
    }
  );

  const concorrentesQuery = trpc.productAnalysis.getConcorrentesByProduct.useQuery(
    {
      produtoNome: produtoNome || '',
      categoria,
      pesquisaIds,
      limit: 10000,
      offset: 0,
    },
    {
      enabled: false,
    }
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Buscar todos os dados em paralelo
      const [clientesResult, leadsResult, concorrentesResult] = await Promise.all([
        clientesQuery.refetch(),
        leadsQuery.refetch(),
        concorrentesQuery.refetch(),
      ]);

      if (!clientesResult.data || !leadsResult.data || !concorrentesResult.data) {
        throw new Error('Erro ao buscar dados');
      }

      const clientes = clientesResult.data.items || [];
      const leads = leadsResult.data.items || [];
      const concorrentes = concorrentesResult.data.items || [];

      // Verificar se há dados
      if (clientes.length === 0 && leads.length === 0 && concorrentes.length === 0) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Preparar abas
      const sheets: SheetData[] = [];

      // Definir colunas para cada tipo
      const clientesColumns: ExcelColumn[] = [
        { key: 'nome', label: 'Nome', width: 30 },
        { key: 'setor', label: 'Setor', width: 20 },
        { key: 'cidade', label: 'Cidade', width: 20 },
        { key: 'uf', label: 'UF', width: 10 },
        { key: 'qualidadeClassificacao', label: 'Qualidade', width: 15 },
        { key: 'telefone', label: 'Telefone', width: 15 },
        { key: 'email', label: 'Email', width: 25 },
        { key: 'siteOficial', label: 'Site', width: 30 },
      ];

      const leadsColumns: ExcelColumn[] = [
        { key: 'nome', label: 'Nome', width: 30 },
        { key: 'setor', label: 'Setor', width: 20 },
        { key: 'cidade', label: 'Cidade', width: 20 },
        { key: 'uf', label: 'UF', width: 10 },
        { key: 'qualidadeScore', label: 'Score', type: 'number', width: 12 },
        { key: 'telefone', label: 'Telefone', width: 15 },
        { key: 'email', label: 'Email', width: 25 },
      ];

      const concorrentesColumns: ExcelColumn[] = [
        { key: 'nome', label: 'Nome', width: 30 },
        { key: 'setor', label: 'Setor', width: 20 },
        { key: 'cidade', label: 'Cidade', width: 20 },
        { key: 'uf', label: 'UF', width: 10 },
        { key: 'porte', label: 'Porte', width: 15 },
        { key: 'faturamentoEstimado', label: 'Faturamento', width: 18 },
      ];

      // Aba de Clientes
      if (clientes.length > 0) {
        sheets.push({
          name: 'Clientes',
          data: clientes,
          columns: clientesColumns,
          color: '70AD47', // Verde
        });
      }

      // Aba de Leads
      if (leads.length > 0) {
        sheets.push({
          name: 'Leads',
          data: leads,
          columns: leadsColumns,
          color: 'FFC000', // Laranja
        });
      }

      // Aba de Concorrentes
      if (concorrentes.length > 0) {
        sheets.push({
          name: 'Concorrentes',
          data: concorrentes,
          columns: concorrentesColumns,
          color: 'E74C3C', // Vermelho
        });
      }

      // Preparar resumo
      const itemName = produtoNome || setorNome || 'Análise';
      const summary = {
        title: `Análise Completa: ${itemName}`,
        stats: createSummaryStats(clientes.length, leads.length, concorrentes.length, [
          { label: 'Categoria', value: categoria },
          { label: analysisType === 'produto' ? 'Produto' : 'Setor', value: itemName },
        ]),
      };

      // Metadata
      const metadata = createDefaultMetadata();

      // Nome do arquivo
      const filename = `${itemName.replace(/[^a-zA-Z0-9]/g, '_')}_Completo`;

      // Exportar
      exportToExcelMultiSheet({
        filename,
        sheets,
        summary,
        metadata,
      });

      const totalRegistros = clientes.length + leads.length + concorrentes.length;
      toast.success(`${totalRegistros} registros exportados em ${sheets.length} abas!`, {
        description: `Arquivo "${filename}.xlsx" baixado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = clientesQuery.isLoading || leadsQuery.isLoading || concorrentesQuery.isLoading;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting || isLoading}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
