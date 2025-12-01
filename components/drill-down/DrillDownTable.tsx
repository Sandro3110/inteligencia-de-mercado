'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface DrillDownColumn<T = any> {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DrillDownTableProps<T = any> {
  columns: DrillDownColumn<T>[];
  data: T[];
  isLoading?: boolean;

  // Paginação
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;

  // Customização
  emptyMessage?: string;
  className?: string;
}

/**
 * Componente de tabela genérico para drill-down
 * Suporta paginação, loading states e customização de colunas
 */
export function DrillDownTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  currentPage = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
}: DrillDownTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const showPagination = total > pageSize;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 border rounded-lg ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => {
                  const value = row[column.key];
                  const content = column.render ? column.render(value, row) : (value ?? '-');

                  return <TableCell key={column.key}>{content}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {showPagination && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, total)}{' '}
            de {total} registros
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
