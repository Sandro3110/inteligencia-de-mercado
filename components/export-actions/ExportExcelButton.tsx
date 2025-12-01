'use client';

import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToExcel, type ExcelColumn } from '@/lib/excel-exporter';

interface ExportExcelButtonProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  filename: string;
  sheetName: string;
  title?: string;
  metadata?: Record<string, string>;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Botão para exportar dados para Excel (aba única)
 * Gera arquivo .xlsx com formatação profissional
 */
export function ExportExcelButton({
  data,
  columns,
  filename,
  sheetName,
  title,
  metadata,
  label = 'Exportar Excel',
  variant = 'outline',
  size = 'default',
  className,
}: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      setIsExporting(true);

      // Adicionar metadata padrão se não fornecido
      const finalMetadata = metadata || {
        'Data de Exportação': new Date().toLocaleDateString('pt-BR'),
        'Hora de Exportação': new Date().toLocaleTimeString('pt-BR'),
        'Total de Registros': String(data.length),
      };

      exportToExcel({
        filename,
        sheetName,
        data,
        columns,
        title,
        metadata: finalMetadata,
      });

      toast.success(
        `${data.length} registro${data.length !== 1 ? 's' : ''} exportado${data.length !== 1 ? 's' : ''}!`,
        {
          description: `Arquivo "${filename}.xlsx" baixado com sucesso`,
        }
      );
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={data.length === 0 || isExporting}
      className={className}
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : label}
    </Button>
  );
}
