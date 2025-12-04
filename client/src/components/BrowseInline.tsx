import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Download,
  Copy,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToCSV, copyToClipboard, generateShareMessage, shareToWhatsApp, shareToTelegram, ExportData } from './ExportUtils';

export interface BrowseColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface BrowseFilter {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface BrowseInlineProps {
  title: string;
  data: any[];
  columns: BrowseColumn[];
  filters?: BrowseFilter[];
  onClose: () => void;
  onRowClick?: (row: any) => void;
  loading?: boolean;
}

export function BrowseInline({
  title,
  data,
  columns,
  filters = [],
  onClose,
  onRowClick,
  loading = false,
}: BrowseInlineProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  
  // Filtrar dados
  const filteredData = data.filter((row) => {
    // Busca por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = columns.some((col) => {
        const value = String(row[col.key] || '').toLowerCase();
        return value.includes(searchLower);
      });
      if (!matchesSearch) return false;
    }
    
    // Filtros específicos
    for (const [key, value] of Object.entries(filterValues)) {
      if (value && row[key] !== value) {
        return false;
      }
    }
    
    return true;
  });
  
  // Paginação
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  
  // Exportação
  const handleExport = (format: 'excel' | 'csv' | 'copy') => {
    const exportData: ExportData = {
      headers: columns.map(col => col.label),
      rows: filteredData.map(row => columns.map(col => row[col.key])),
      sheetName: title,
    };
    
    switch (format) {
      case 'excel':
        exportToExcel(exportData, title.toLowerCase().replace(/\s+/g, '_'));
        toast({ title: 'Exportado!', description: 'Arquivo Excel gerado com sucesso.' });
        break;
      case 'csv':
        exportToCSV(exportData, title.toLowerCase().replace(/\s+/g, '_'));
        toast({ title: 'Exportado!', description: 'Arquivo CSV gerado com sucesso.' });
        break;
      case 'copy':
        copyToClipboard(exportData).then((success) => {
          if (success) {
            toast({ title: 'Copiado!', description: 'Dados copiados para a área de transferência.' });
          } else {
            toast({ title: 'Erro', description: 'Falha ao copiar dados.', variant: 'destructive' });
          }
        });
        break;
    }
  };
  
  // Compartilhamento
  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const summary = {
      [`Total de ${title}`]: filteredData.length,
      'Filtros aplicados': Object.keys(filterValues).length > 0 ? 'Sim' : 'Não',
    };
    
    const message = generateShareMessage(`Relatório: ${title}`, summary);
    
    if (platform === 'whatsapp') {
      shareToWhatsApp(message);
    } else {
      shareToTelegram(message);
    }
  };
  
  // Seleção
  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => startIndex + i)));
    }
  };
  
  const toggleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };
  
  return (
    <Card className="p-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('copy')}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare('whatsapp')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare('telegram')}>
            <Send className="h-4 w-4 mr-2" />
            Telegram
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[150px]">
            {filter.type === 'select' && filter.options ? (
              <Select
                value={filterValues[filter.key] || 'all'}
                onValueChange={(value) => {
                  const newFilters = { ...filterValues };
                  if (value === 'all') {
                    delete newFilters[filter.key];
                  } else {
                    newFilters[filter.key] = value;
                  }
                  setFilterValues(newFilters);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ))}
        
        <div className="min-w-[100px]">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 / página</SelectItem>
              <SelectItem value="50">50 / página</SelectItem>
              <SelectItem value="100">100 / página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
              </TableHead>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => {
                const globalIndex = startIndex + i;
                return (
                  <TableRow
                    key={globalIndex}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onRowClick?.(row)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(globalIndex)}
                        onChange={() => toggleSelectRow(globalIndex)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} registros
          {selectedRows.size > 0 && ` (${selectedRows.size} selecionados)`}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Página {currentPage} de {totalPages || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
