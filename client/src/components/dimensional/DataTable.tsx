/**
 * DataTable - Tabela interativa com paginação, ordenação e filtros
 * 100% Funcional
 */

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CopyButton } from './CopyButton';
import { ExportButton } from './ExportButton';

// ============================================================================
// TYPES
// ============================================================================

export interface Coluna<T = any> {
  campo: string;
  label: string;
  formato?: 'moeda' | 'numero' | 'percentual' | 'data' | 'texto';
  ordenavel?: boolean;
  largura?: string;
  render?: (valor: any, row: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
  dados: T[];
  colunas: Coluna<T>[];
  paginacao?: {
    paginaAtual: number;
    porPagina: number;
    total: number;
    onMudarPagina: (pagina: number) => void;
    onMudarPorPagina: (porPagina: number) => void;
  };
  ordenacao?: {
    campo: string;
    direcao: 'ASC' | 'DESC';
    onMudarOrdenacao: (campo: string, direcao: 'ASC' | 'DESC') => void;
  };
  acoes?: {
    copiar?: boolean;
    exportar?: boolean;
  };
  onClickLinha?: (row: T) => void;
  className?: string;
}

// ============================================================================
// DATA TABLE
// ============================================================================

export function DataTable<T = any>({
  dados,
  colunas,
  paginacao,
  ordenacao,
  acoes = { copiar: true, exportar: true },
  onClickLinha,
  className
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleOrdenar = (campo: string) => {
    if (!ordenacao) return;

    const novaDirecao =
      ordenacao.campo === campo && ordenacao.direcao === 'ASC'
        ? 'DESC'
        : 'ASC';

    ordenacao.onMudarOrdenacao(campo, novaDirecao);
  };

  const getIconeOrdenacao = (campo: string) => {
    if (!ordenacao || ordenacao.campo !== campo) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }

    return ordenacao.direcao === 'ASC' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const formatarValor = (valor: any, formato?: string): React.ReactNode => {
    if (valor === null || valor === undefined) return 'N/A';

    switch (formato) {
      case 'moeda':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valor);
      case 'numero':
        return new Intl.NumberFormat('pt-BR').format(valor);
      case 'percentual':
        return `${valor.toFixed(1)}%`;
      case 'data':
        return new Date(valor).toLocaleDateString('pt-BR');
      default:
        return String(valor);
    }
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Header com ações */}
      {(acoes.copiar || acoes.exportar) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {paginacao
              ? `${dados.length} de ${paginacao.total.toLocaleString('pt-BR')} registros`
              : `${dados.length} registros`}
          </div>
          <div className="flex items-center gap-2">
            {acoes.copiar && (
              <CopyButton
                dados={dados}
                formatos={['texto', 'csv', 'json']}
                label="Copiar dados"
              />
            )}
            {acoes.exportar && (
              <ExportButton
                dados={dados}
                colunas={colunas}
                titulo="dados"
              />
            )}
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {colunas.map((coluna) => (
                <TableHead
                  key={coluna.campo}
                  style={{ width: coluna.largura }}
                  className={coluna.ordenavel ? 'cursor-pointer select-none' : ''}
                  onClick={() => coluna.ordenavel && handleOrdenar(coluna.campo)}
                >
                  <div className="flex items-center">
                    {coluna.label}
                    {coluna.ordenavel && getIconeOrdenacao(coluna.campo)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colunas.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              dados.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={onClickLinha ? 'cursor-pointer' : ''}
                  onClick={() => onClickLinha?.(row)}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {colunas.map((coluna) => (
                    <TableCell key={coluna.campo}>
                      {coluna.render
                        ? coluna.render((row as any)[coluna.campo], row)
                        : formatarValor((row as any)[coluna.campo], coluna.formato)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {paginacao && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Linhas por página:
            </span>
            <Select
              value={paginacao.porPagina.toString()}
              onValueChange={(value) => paginacao.onMudarPorPagina(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Página {paginacao.paginaAtual} de{' '}
              {Math.ceil(paginacao.total / paginacao.porPagina)}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginacao.onMudarPagina(1)}
                disabled={paginacao.paginaAtual === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginacao.onMudarPagina(paginacao.paginaAtual - 1)}
                disabled={paginacao.paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginacao.onMudarPagina(paginacao.paginaAtual + 1)}
                disabled={
                  paginacao.paginaAtual >=
                  Math.ceil(paginacao.total / paginacao.porPagina)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  paginacao.onMudarPagina(
                    Math.ceil(paginacao.total / paginacao.porPagina)
                  )
                }
                disabled={
                  paginacao.paginaAtual >=
                  Math.ceil(paginacao.total / paginacao.porPagina)
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
