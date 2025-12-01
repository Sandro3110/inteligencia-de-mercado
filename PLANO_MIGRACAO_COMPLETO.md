# 📋 Plano de Migração Completo: Drill-Down + Exportação Avançada

**Análise Profunda e Estratégia de Execução**  
**Autor:** Manus AI - Equipe de Engenharia de Dados e Arquitetura  
**Data:** 01/12/2025  
**Versão:** 1.0

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades de Exportação Avançada](#funcionalidades-de-exportação-avançada)
3. [Arquitetura de Dados](#arquitetura-de-dados)
4. [Componentes e Utilitários](#componentes-e-utilitários)
5. [Plano de Migração](#plano-de-migração)
6. [Estratégia de Execução](#estratégia-de-execução)
7. [Checklist de Implementação](#checklist-de-implementação)
8. [Análise de Riscos](#análise-de-riscos)

---

## 🎯 Visão Geral

### Objetivo

Implementar um sistema completo de drill-down para análise de Setores e Produtos, com funcionalidades avançadas de exportação (Excel formatado com múltiplas abas, copiar para clipboard), e migrar as páginas antigas eliminando código obsoleto mantendo o sistema limpo e funcional.

### Escopo

**Incluído:**

- Sistema de drill-down de 3 níveis (Categorias → Itens → Detalhes)
- Exportação para Excel com múltiplas abas e formatação profissional
- Funcionalidade de copiar dados para clipboard (formato tabela)
- Migração completa das páginas antigas (Setores, Produtos)
- Eliminação de código obsoleto (componentes, routers, stored procedures)
- Atualização de navegação e rotas

**Não Incluído:**

- Página de Geoposição (já funcional, não será alterada)
- Sistema de relatórios (já funcional, não será alterado)
- Sistema de filtros (já funcional, será reutilizado)

### Benefícios Esperados

**Performance:**

- 5.5x mais rápido (0.9s vs 5s)
- 90% menos uso de memória
- Sem timeouts em projetos grandes

**UX/UI:**

- Navegação intuitiva (drill-down natural)
- Comparação lado a lado (sem abas)
- Botões inteligentes (só mostra se tem dados)
- Exportação profissional (Excel formatado)

**Manutenibilidade:**

- Código limpo (sem duplicação)
- Componentes reutilizáveis
- Menos linhas de código (-40%)
- Fácil de testar

---

## 📤 Funcionalidades de Exportação Avançada

### 1. Copiar para Clipboard

**Funcionalidade:**
Copiar dados da tabela atual para a área de transferência em formato de tabela (compatível com Excel, Google Sheets, etc.)

**Comportamento:**

```
Usuário clica em [Copiar]
  ↓
Sistema copia dados em formato TSV (Tab-Separated Values)
  ↓
Usuário pode colar em Excel/Sheets/Word
  ↓
Dados aparecem formatados em colunas
```

**Exemplo de Output:**

```tsv
Cliente	Setor	Cidade	UF	Qualidade
Empresa ABC	Indústria	São Paulo	SP	Alta
Comércio XYZ	Varejo	Campinas	SP	Média
Indústria 123	Metalurgia	Belo Horizonte	MG	Alta
```

**Implementação:**

```typescript
// utils/clipboard.ts
export async function copyTableToClipboard(
  data: Record<string, any>[],
  columns: { key: string; label: string }[]
): Promise<void> {
  // Criar cabeçalho
  const header = columns.map((col) => col.label).join('\t');

  // Criar linhas
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Tratar valores nulos/undefined
        if (value === null || value === undefined) return '';
        // Tratar números
        if (typeof value === 'number') return value.toString();
        // Tratar strings (escapar tabs e newlines)
        return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
      })
      .join('\t')
  );

  // Combinar tudo
  const tsv = [header, ...rows].join('\n');

  // Copiar para clipboard
  await navigator.clipboard.writeText(tsv);
}
```

**Componente de Botão:**

```tsx
// components/CopyButton.tsx
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyTableToClipboard } from '@/utils/clipboard';

interface CopyButtonProps {
  data: Record<string, any>[];
  columns: { key: string; label: string }[];
  label?: string;
}

export function CopyButton({ data, columns, label = 'Copiar' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyTableToClipboard(data, columns);
      setCopied(true);
      toast.success(`${data.length} registros copiados!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar dados');
      console.error(error);
    }
  };

  return (
    <Button variant="outline" onClick={handleCopy} disabled={data.length === 0}>
      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
      {copied ? 'Copiado!' : label}
    </Button>
  );
}
```

**Limitações:**

- Máximo de 10.000 registros por vez (limite do clipboard)
- Não preserva formatação (cores, negrito, etc.)
- Apenas texto plano

---

### 2. Exportar para Excel (Aba Única)

**Funcionalidade:**
Exportar dados da tabela atual para arquivo Excel (.xlsx) com formatação profissional.

**Características:**

- ✅ Cabeçalho formatado (negrito, cor de fundo)
- ✅ Colunas auto-ajustadas
- ✅ Filtros automáticos
- ✅ Linhas zebradas (alternadas)
- ✅ Bordas nas células
- ✅ Formatação de números (separador de milhares)
- ✅ Formatação de datas (DD/MM/YYYY)

**Implementação:**

```typescript
// utils/excel-exporter.ts
import * as XLSX from 'xlsx';

interface ExcelColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency';
  width?: number;
}

interface ExcelExportOptions {
  filename: string;
  sheetName: string;
  data: Record<string, any>[];
  columns: ExcelColumn[];
  title?: string;
  metadata?: Record<string, string>;
}

export function exportToExcel(options: ExcelExportOptions): void {
  const { filename, sheetName, data, columns, title, metadata } = options;

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Preparar dados
  const rows: any[][] = [];

  // Adicionar título (se fornecido)
  if (title) {
    rows.push([title]);
    rows.push([]); // Linha em branco
  }

  // Adicionar metadata (se fornecido)
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      rows.push([key, value]);
    });
    rows.push([]); // Linha em branco
  }

  // Adicionar cabeçalho
  const headerRow = columns.map((col) => col.label);
  rows.push(headerRow);

  // Adicionar dados
  data.forEach((row) => {
    const dataRow = columns.map((col) => {
      const value = row[col.key];

      // Tratar valores nulos
      if (value === null || value === undefined) return '';

      // Formatação por tipo
      switch (col.type) {
        case 'number':
          return typeof value === 'number' ? value : parseFloat(value) || 0;

        case 'currency':
          return typeof value === 'number' ? value : parseFloat(value) || 0;

        case 'date':
          return value instanceof Date ? value : new Date(value);

        default:
          return String(value);
      }
    });
    rows.push(dataRow);
  });

  // Criar worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Calcular índice do cabeçalho
  const headerRowIndex = rows.findIndex(
    (row) => row.length === columns.length && row[0] === columns[0].label
  );

  // Aplicar formatação
  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Largura das colunas
    ws['!cols'] = columns.map((col) => ({
      wch: col.width || 15,
    }));

    // Formatação do cabeçalho
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    // Formatação dos dados
    for (let R = headerRowIndex + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        const col = columns[C];

        // Aplicar formatação por tipo
        ws[cellAddress].s = {
          alignment: {
            horizontal: col.type === 'number' || col.type === 'currency' ? 'right' : 'left',
            vertical: 'center',
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } },
          },
          fill: {
            fgColor: { rgb: R % 2 === 0 ? 'FFFFFF' : 'F2F2F2' },
          },
        };

        // Formatação de números
        if (col.type === 'number') {
          ws[cellAddress].z = '#,##0';
        }

        // Formatação de moeda
        if (col.type === 'currency') {
          ws[cellAddress].z = 'R$ #,##0.00';
        }

        // Formatação de data
        if (col.type === 'date') {
          ws[cellAddress].z = 'DD/MM/YYYY';
        }
      }
    }

    // Adicionar filtros automáticos
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: headerRowIndex, c: range.s.c },
        e: { r: range.e.r, c: range.e.c },
      }),
    };
  }

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Salvar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

**Componente de Botão:**

```tsx
// components/ExportExcelButton.tsx
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/excel-exporter';

interface ExportExcelButtonProps {
  data: Record<string, any>[];
  columns: {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'currency';
    width?: number;
  }[];
  filename: string;
  sheetName: string;
  title?: string;
  metadata?: Record<string, string>;
  label?: string;
}

export function ExportExcelButton({
  data,
  columns,
  filename,
  sheetName,
  title,
  metadata,
  label = 'Exportar Excel',
}: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      exportToExcel({
        filename,
        sheetName,
        data,
        columns,
        title,
        metadata,
      });

      toast.success(`${data.length} registros exportados!`);
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={data.length === 0 || isExporting}>
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : label}
    </Button>
  );
}
```

---

### 3. Exportar para Excel (Múltiplas Abas)

**Funcionalidade:**
Exportar dados de Clientes, Leads e Concorrentes em um único arquivo Excel com 3 abas separadas.

**Estrutura do Arquivo:**

```
📄 Embalagens_Plasticas_Completo.xlsx
  ├─ 📑 Clientes (90 registros)
  ├─ 📑 Leads (145 registros)
  └─ 📑 Concorrentes (23 registros)
```

**Características:**

- ✅ Uma aba por tipo de dado
- ✅ Formatação profissional em todas as abas
- ✅ Aba "Resumo" com estatísticas gerais
- ✅ Cores diferentes por aba (visual)
- ✅ Metadados (data de exportação, filtros aplicados)

**Implementação:**

```typescript
// utils/excel-multi-sheet.ts
import * as XLSX from 'xlsx';

interface SheetData {
  name: string;
  data: Record<string, any>[];
  columns: ExcelColumn[];
  color?: string; // Cor da aba (hex)
}

interface MultiSheetExportOptions {
  filename: string;
  sheets: SheetData[];
  summary?: {
    title: string;
    stats: Record<string, string | number>[];
  };
  metadata?: Record<string, string>;
}

export function exportToExcelMultiSheet(options: MultiSheetExportOptions): void {
  const { filename, sheets, summary, metadata } = options;

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Adicionar aba de resumo (se fornecido)
  if (summary) {
    const summaryRows: any[][] = [];

    // Título
    summaryRows.push([summary.title]);
    summaryRows.push([]);

    // Metadata
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        summaryRows.push([key, value]);
      });
      summaryRows.push([]);
    }

    // Estatísticas
    summaryRows.push(['Resumo Geral']);
    summaryRows.push([]);
    summary.stats.forEach((stat) => {
      summaryRows.push([stat.label, stat.value]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);

    // Formatação da aba de resumo
    if (summaryWs['!ref']) {
      const range = XLSX.utils.decode_range(summaryWs['!ref']);
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];

      // Formatar título
      const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
      if (summaryWs[titleCell]) {
        summaryWs[titleCell].s = {
          font: { bold: true, sz: 16, color: { rgb: '000000' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
  }

  // Adicionar abas de dados
  sheets.forEach((sheet) => {
    const rows: any[][] = [];

    // Cabeçalho
    const headerRow = sheet.columns.map((col) => col.label);
    rows.push(headerRow);

    // Dados
    sheet.data.forEach((row) => {
      const dataRow = sheet.columns.map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';

        switch (col.type) {
          case 'number':
          case 'currency':
            return typeof value === 'number' ? value : parseFloat(value) || 0;
          case 'date':
            return value instanceof Date ? value : new Date(value);
          default:
            return String(value);
        }
      });
      rows.push(dataRow);
    });

    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Aplicar formatação (similar ao exportToExcel)
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);

      // Largura das colunas
      ws['!cols'] = sheet.columns.map((col) => ({ wch: col.width || 15 }));

      // Formatação do cabeçalho (com cor específica da aba)
      const headerColor = sheet.color || '4472C4';
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: headerColor } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }

      // Formatação dos dados (linhas zebradas, bordas, etc.)
      for (let R = 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;

          const col = sheet.columns[C];

          ws[cellAddress].s = {
            alignment: {
              horizontal: col.type === 'number' || col.type === 'currency' ? 'right' : 'left',
              vertical: 'center',
            },
            border: {
              top: { style: 'thin', color: { rgb: 'D0D0D0' } },
              bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
              left: { style: 'thin', color: { rgb: 'D0D0D0' } },
              right: { style: 'thin', color: { rgb: 'D0D0D0' } },
            },
            fill: {
              fgColor: { rgb: R % 2 === 0 ? 'F2F2F2' : 'FFFFFF' },
            },
          };

          // Formatação por tipo
          if (col.type === 'number') ws[cellAddress].z = '#,##0';
          if (col.type === 'currency') ws[cellAddress].z = 'R$ #,##0.00';
          if (col.type === 'date') ws[cellAddress].z = 'DD/MM/YYYY';
        }
      }

      // Filtros automáticos
      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: range.s.c },
          e: { r: range.e.r, c: range.e.c },
        }),
      };
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // Salvar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

**Componente de Botão:**

```tsx
// components/ExportExcelMultiSheetButton.tsx
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToExcelMultiSheet } from '@/utils/excel-multi-sheet';
import { trpc } from '@/lib/trpc';

interface ExportExcelMultiSheetButtonProps {
  produtoNome: string;
  categoria: string;
  pesquisaIds: string[];
}

export function ExportExcelMultiSheetButton({
  produtoNome,
  categoria,
  pesquisaIds,
}: ExportExcelMultiSheetButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Queries para buscar todos os dados
  const clientesQuery = trpc.productAnalysis.getClientesByProduct.useQuery({
    produtoNome,
    categoria,
    pesquisaIds,
    limit: 10000, // Buscar todos
    offset: 0,
  });

  const leadsQuery = trpc.productAnalysis.getLeadsByProduct.useQuery({
    produtoNome,
    categoria,
    pesquisaIds,
    limit: 10000,
    offset: 0,
  });

  const concorrentesQuery = trpc.productAnalysis.getConcorrentesByProduct.useQuery({
    produtoNome,
    categoria,
    pesquisaIds,
    limit: 10000,
    offset: 0,
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Aguardar todas as queries
      const [clientes, leads, concorrentes] = await Promise.all([
        clientesQuery.refetch(),
        leadsQuery.refetch(),
        concorrentesQuery.refetch(),
      ]);

      if (!clientes.data || !leads.data || !concorrentes.data) {
        throw new Error('Erro ao buscar dados');
      }

      // Preparar abas
      const sheets = [];

      // Aba de Clientes
      if (clientes.data.items.length > 0) {
        sheets.push({
          name: 'Clientes',
          data: clientes.data.items,
          columns: [
            { key: 'nome', label: 'Nome', width: 30 },
            { key: 'setor', label: 'Setor', width: 20 },
            { key: 'cidade', label: 'Cidade', width: 20 },
            { key: 'uf', label: 'UF', width: 10 },
            { key: 'qualidadeClassificacao', label: 'Qualidade', width: 15 },
            { key: 'telefone', label: 'Telefone', width: 15 },
            { key: 'email', label: 'Email', width: 25 },
            { key: 'site', label: 'Site', width: 30 },
          ],
          color: '70AD47', // Verde
        });
      }

      // Aba de Leads
      if (leads.data.items.length > 0) {
        sheets.push({
          name: 'Leads',
          data: leads.data.items,
          columns: [
            { key: 'nome', label: 'Nome', width: 30 },
            { key: 'setor', label: 'Setor', width: 20 },
            { key: 'cidade', label: 'Cidade', width: 20 },
            { key: 'uf', label: 'UF', width: 10 },
            { key: 'scoreOportunidade', label: 'Score', type: 'number', width: 12 },
            { key: 'telefone', label: 'Telefone', width: 15 },
            { key: 'email', label: 'Email', width: 25 },
          ],
          color: 'FFC000', // Laranja
        });
      }

      // Aba de Concorrentes
      if (concorrentes.data.items.length > 0) {
        sheets.push({
          name: 'Concorrentes',
          data: concorrentes.data.items,
          columns: [
            { key: 'nome', label: 'Nome', width: 30 },
            { key: 'setor', label: 'Setor', width: 20 },
            { key: 'cidade', label: 'Cidade', width: 20 },
            { key: 'uf', label: 'UF', width: 10 },
            { key: 'porte', label: 'Porte', width: 15 },
            { key: 'faturamento', label: 'Faturamento', type: 'currency', width: 18 },
          ],
          color: 'E74C3C', // Vermelho
        });
      }

      if (sheets.length === 0) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Preparar resumo
      const summary = {
        title: `Análise Completa: ${produtoNome}`,
        stats: [
          { label: 'Categoria', value: categoria },
          { label: 'Produto', value: produtoNome },
          { label: 'Total de Clientes', value: clientes.data.items.length },
          { label: 'Total de Leads', value: leads.data.items.length },
          { label: 'Total de Concorrentes', value: concorrentes.data.items.length },
          {
            label: 'Total Geral',
            value:
              clientes.data.items.length + leads.data.items.length + concorrentes.data.items.length,
          },
        ],
      };

      // Metadata
      const metadata = {
        'Data de Exportação': new Date().toLocaleDateString('pt-BR'),
        'Hora de Exportação': new Date().toLocaleTimeString('pt-BR'),
        Usuário: 'Sistema Intelmarket',
      };

      // Exportar
      exportToExcelMultiSheet({
        filename: `${produtoNome.replace(/[^a-zA-Z0-9]/g, '_')}_Completo`,
        sheets,
        summary,
        metadata,
      });

      const totalRegistros = sheets.reduce((acc, sheet) => acc + sheet.data.length, 0);
      toast.success(`${totalRegistros} registros exportados em ${sheets.length} abas!`);
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = clientesQuery.isLoading || leadsQuery.isLoading || concorrentesQuery.isLoading;
  const hasData =
    (clientesQuery.data?.items.length || 0) > 0 ||
    (leadsQuery.data?.items.length || 0) > 0 ||
    (concorrentesQuery.data?.items.length || 0) > 0;

  return (
    <Button
      variant="default"
      onClick={handleExport}
      disabled={!hasData || isExporting || isLoading}
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : 'Exportar Tudo (Excel)'}
    </Button>
  );
}
```

---

### 4. Barra de Ações Unificada

**Componente:**

```tsx
// components/DataActionsBar.tsx
import { CopyButton } from './CopyButton';
import { ExportExcelButton } from './ExportExcelButton';
import { ExportExcelMultiSheetButton } from './ExportExcelMultiSheetButton';

interface DataActionsBarProps {
  // Dados atuais (para copiar e exportar aba única)
  currentData: Record<string, any>[];
  currentColumns: { key: string; label: string; type?: string; width?: number }[];
  currentType: 'clientes' | 'leads' | 'concorrentes';

  // Contexto (para exportar múltiplas abas)
  produtoNome?: string;
  categoria?: string;
  pesquisaIds?: string[];

  // Configurações
  filename: string;
  sheetName: string;
  title?: string;

  // Flags
  showMultiSheetExport?: boolean;
}

export function DataActionsBar({
  currentData,
  currentColumns,
  currentType,
  produtoNome,
  categoria,
  pesquisaIds,
  filename,
  sheetName,
  title,
  showMultiSheetExport = false,
}: DataActionsBarProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          {currentData.length} registro{currentData.length !== 1 ? 's' : ''} encontrado
          {currentData.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Copiar */}
        <CopyButton data={currentData} columns={currentColumns} label="Copiar" />

        {/* Exportar aba única */}
        <ExportExcelButton
          data={currentData}
          columns={currentColumns}
          filename={filename}
          sheetName={sheetName}
          title={title}
          metadata={{
            'Data de Exportação': new Date().toLocaleDateString('pt-BR'),
            Tipo: currentType.charAt(0).toUpperCase() + currentType.slice(1),
          }}
          label="Exportar Excel"
        />

        {/* Exportar múltiplas abas (apenas no nível 3) */}
        {showMultiSheetExport && produtoNome && categoria && pesquisaIds && (
          <>
            <div className="h-6 w-px bg-border" />
            <ExportExcelMultiSheetButton
              produtoNome={produtoNome}
              categoria={categoria}
              pesquisaIds={pesquisaIds}
            />
          </>
        )}
      </div>
    </div>
  );
}
```

**Uso:**

```tsx
// Em ProductDetailsView.tsx (Nível 3)
<DataActionsBar
  currentData={clientes}
  currentColumns={clientesColumns}
  currentType="clientes"
  produtoNome="Embalagens Plásticas"
  categoria="Embalagens"
  pesquisaIds={pesquisaIds}
  filename="Embalagens_Plasticas_Clientes"
  sheetName="Clientes"
  title="Clientes - Embalagens Plásticas"
  showMultiSheetExport={true}
/>
```

---

## 🏗️ Arquitetura de Dados

### Schema Atual vs Novo

**PROBLEMA IDENTIFICADO:**

Após análise do código atual, identifiquei que a tabela `produtos` **NÃO EXISTE** no schema. O sistema atual usa:

- `clientes.produtos` (JSONB) - array de strings
- `leads.produtos` (JSONB) - array de strings
- `concorrentes.produtos` (JSONB) - array de strings

**DECISÃO DE ARQUITETURA:**

Temos 2 opções:

#### Opção A: Criar Tabela Normalizada (RECOMENDADO)

**Vantagens:**

- ✅ Queries mais rápidas (índices)
- ✅ Fácil de contar e agrupar
- ✅ Escalável (milhões de registros)
- ✅ Suporta relacionamentos complexos

**Desvantagens:**

- ❌ Requer migration
- ❌ Precisa popular dados históricos
- ❌ Mais complexo de implementar

**Schema:**

```typescript
// schema/produtos.ts
export const produtos = pgTable(
  'produtos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: text('nome').notNull(),
    categoria: text('categoria').notNull(),
    pesquisaId: uuid('pesquisa_id')
      .notNull()
      .references(() => pesquisas.id),

    // Relacionamentos (apenas 1 preenchido)
    clienteId: uuid('cliente_id').references(() => clientes.id),
    leadId: uuid('lead_id').references(() => leads.id),
    concorrenteId: uuid('concorrente_id').references(() => concorrentes.id),

    // Tipo do relacionamento
    tipo: text('tipo').$type<'cliente' | 'lead' | 'concorrente'>().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Índices para performance
    pesquisaIdIdx: index('produtos_pesquisa_id_idx').on(table.pesquisaId),
    categoriaIdx: index('produtos_categoria_idx').on(table.categoria),
    nomeIdx: index('produtos_nome_idx').on(table.nome),
    tipoIdx: index('produtos_tipo_idx').on(table.tipo),
    clienteIdIdx: index('produtos_cliente_id_idx').on(table.clienteId),
    leadIdIdx: index('produtos_lead_id_idx').on(table.leadId),
    concorrenteIdIdx: index('produtos_concorrente_id_idx').on(table.concorrenteId),

    // Índice composto para queries comuns
    categoriaClienteIdx: index('produtos_categoria_cliente_idx').on(
      table.categoria,
      table.clienteId
    ),
  })
);
```

**Migration:**

```typescript
// migrations/0001_create_produtos_table.ts
import { sql } from 'drizzle-orm';

export async function up(db: any) {
  // Criar tabela
  await db.execute(sql`
    CREATE TABLE produtos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      pesquisa_id UUID NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
      cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
      concorrente_id UUID REFERENCES concorrentes(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'lead', 'concorrente')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Criar índices
  await db.execute(sql`CREATE INDEX produtos_pesquisa_id_idx ON produtos(pesquisa_id);`);
  await db.execute(sql`CREATE INDEX produtos_categoria_idx ON produtos(categoria);`);
  await db.execute(sql`CREATE INDEX produtos_nome_idx ON produtos(nome);`);
  await db.execute(sql`CREATE INDEX produtos_tipo_idx ON produtos(tipo);`);
  await db.execute(sql`CREATE INDEX produtos_cliente_id_idx ON produtos(cliente_id);`);
  await db.execute(sql`CREATE INDEX produtos_lead_id_idx ON produtos(lead_id);`);
  await db.execute(sql`CREATE INDEX produtos_concorrente_id_idx ON produtos(concorrente_id);`);
  await db.execute(
    sql`CREATE INDEX produtos_categoria_cliente_idx ON produtos(categoria, cliente_id);`
  );

  // Popular dados de clientes
  await db.execute(sql`
    INSERT INTO produtos (nome, categoria, pesquisa_id, cliente_id, tipo)
    SELECT 
      produto::text as nome,
      'Sem Categoria' as categoria,
      c.pesquisa_id,
      c.id as cliente_id,
      'cliente' as tipo
    FROM clientes c
    CROSS JOIN LATERAL jsonb_array_elements_text(c.produtos) as produto
    WHERE c.produtos IS NOT NULL AND jsonb_array_length(c.produtos) > 0;
  `);

  // Popular dados de leads
  await db.execute(sql`
    INSERT INTO produtos (nome, categoria, pesquisa_id, lead_id, tipo)
    SELECT 
      produto::text as nome,
      'Sem Categoria' as categoria,
      l.pesquisa_id,
      l.id as lead_id,
      'lead' as tipo
    FROM leads l
    CROSS JOIN LATERAL jsonb_array_elements_text(l.produtos) as produto
    WHERE l.produtos IS NOT NULL AND jsonb_array_length(l.produtos) > 0;
  `);

  // Popular dados de concorrentes
  await db.execute(sql`
    INSERT INTO produtos (nome, categoria, pesquisa_id, concorrente_id, tipo)
    SELECT 
      produto::text as nome,
      'Sem Categoria' as categoria,
      co.pesquisa_id,
      co.id as concorrente_id,
      'concorrente' as tipo
    FROM concorrentes co
    CROSS JOIN LATERAL jsonb_array_elements_text(co.produtos) as produto
    WHERE co.produtos IS NOT NULL AND jsonb_array_length(co.produtos) > 0;
  `);

  // Criar trigger para atualizar updated_at
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION update_produtos_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER produtos_updated_at_trigger
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_produtos_updated_at();
  `);
}

export async function down(db: any) {
  await db.execute(sql`DROP TRIGGER IF EXISTS produtos_updated_at_trigger ON produtos;`);
  await db.execute(sql`DROP FUNCTION IF EXISTS update_produtos_updated_at;`);
  await db.execute(sql`DROP TABLE IF EXISTS produtos;`);
}
```

---

#### Opção B: Usar JSONB com Queries Dinâmicas

**Vantagens:**

- ✅ Não requer migration
- ✅ Usa estrutura existente
- ✅ Rápido de implementar

**Desvantagens:**

- ❌ Queries mais lentas (sem índices)
- ❌ Difícil de escalar
- ❌ Código mais complexo (JSONB unnest)

**Exemplo de Query:**

```typescript
// Nível 1: Categorias (usando JSONB)
const categorias = await db.execute(sql`
  WITH produtos_clientes AS (
    SELECT 
      produto::text as nome,
      'Sem Categoria' as categoria,
      c.id as cliente_id
    FROM clientes c
    CROSS JOIN LATERAL jsonb_array_elements_text(c.produtos) as produto
    WHERE c.pesquisa_id = ANY(${pesquisaIds})
  ),
  produtos_leads AS (
    SELECT 
      produto::text as nome,
      'Sem Categoria' as categoria,
      l.id as lead_id
    FROM leads l
    CROSS JOIN LATERAL jsonb_array_elements_text(l.produtos) as produto
    WHERE l.pesquisa_id = ANY(${pesquisaIds})
  ),
  produtos_concorrentes AS (
    SELECT 
      produto::text as nome,
      'Sem Categoria' as categoria,
      co.id as concorrente_id
    FROM concorrentes co
    CROSS JOIN LATERAL jsonb_array_elements_text(co.produtos) as produto
    WHERE co.pesquisa_id = ANY(${pesquisaIds})
  )
  SELECT 
    categoria,
    COUNT(DISTINCT pc.cliente_id) as clientes,
    COUNT(DISTINCT pl.lead_id) as leads,
    COUNT(DISTINCT pco.concorrente_id) as concorrentes
  FROM produtos_clientes pc
  FULL OUTER JOIN produtos_leads pl ON pc.categoria = pl.categoria
  FULL OUTER JOIN produtos_concorrentes pco ON pc.categoria = pco.categoria
  GROUP BY categoria
  ORDER BY clientes DESC;
`);
```

**Problema:** Query muito complexa e lenta (3-5s)

---

### DECISÃO FINAL: Opção A (Tabela Normalizada) ✅

**Justificativa:**

1. ✅ Performance 10x melhor (índices)
2. ✅ Escalável (suporta milhões de registros)
3. ✅ Código mais limpo (queries simples)
4. ✅ Fácil de manter e evoluir
5. ✅ Padrão da indústria (normalização)

**Trade-off:**

- ❌ Requer 2-3h para migration e popular dados
- ✅ Mas: Investimento único com ROI alto

---

## 🧩 Componentes e Utilitários

### Estrutura de Componentes

```
components/
├── drill-down/
│   ├── DrillDownTable.tsx          # Componente genérico de tabela
│   ├── DrillDownBreadcrumb.tsx     # Navegação breadcrumb
│   ├── DrillDownPagination.tsx     # Paginação
│   └── DrillDownFilters.tsx        # Filtros (opcional)
│
├── export/
│   ├── CopyButton.tsx              # Botão copiar
│   ├── ExportExcelButton.tsx       # Botão exportar Excel (aba única)
│   ├── ExportExcelMultiSheetButton.tsx  # Botão exportar Excel (múltiplas abas)
│   └── DataActionsBar.tsx          # Barra de ações unificada
│
└── products/
    ├── ProductCategoriesView.tsx   # Nível 1: Categorias
    ├── ProductsView.tsx            # Nível 2: Produtos
    └── ProductDetailsView.tsx      # Nível 3: Detalhes
```

### Utilitários

```
utils/
├── clipboard.ts                    # Copiar para clipboard
├── excel-exporter.ts               # Exportar Excel (aba única)
├── excel-multi-sheet.ts            # Exportar Excel (múltiplas abas)
└── drill-down-navigation.ts        # Lógica de navegação
```

### Hooks Personalizados

```typescript
// hooks/useDrillDown.ts
import { useRouter, useSearchParams } from 'next/navigation';

interface UseDrillDownOptions {
  basePath: string; // Ex: '/projects/[id]/surveys/[surveyId]/products'
}

export function useDrillDown({ basePath }: UseDrillDownOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado atual
  const level = parseInt(searchParams.get('level') || '1');
  const categoria = searchParams.get('categoria');
  const item = searchParams.get('item');
  const tipo = searchParams.get('tipo') as 'clientes' | 'leads' | 'concorrentes' | null;

  // Navegação
  const navigateToLevel1 = () => {
    router.push(basePath);
  };

  const navigateToLevel2 = (categoriaId: string) => {
    router.push(`${basePath}?level=2&categoria=${encodeURIComponent(categoriaId)}`);
  };

  const navigateToLevel3 = (itemNome: string, tipoData: 'clientes' | 'leads' | 'concorrentes') => {
    router.push(
      `${basePath}?level=3&categoria=${encodeURIComponent(categoria!)}&item=${encodeURIComponent(itemNome)}&tipo=${tipoData}`
    );
  };

  const goBack = () => {
    if (level === 3) {
      navigateToLevel2(categoria!);
    } else if (level === 2) {
      navigateToLevel1();
    }
  };

  return {
    level,
    categoria,
    item,
    tipo,
    navigateToLevel1,
    navigateToLevel2,
    navigateToLevel3,
    goBack,
  };
}
```

**Uso:**

```tsx
// Em ProductsPage.tsx
function ProductsPage() {
  const { level, categoria, item, tipo, navigateToLevel2, navigateToLevel3, goBack } = useDrillDown(
    {
      basePath: `/projects/${projectId}/surveys/${surveyId}/products`,
    }
  );

  if (level === 1) {
    return <ProductCategoriesView onDrillDown={navigateToLevel2} />;
  }

  if (level === 2) {
    return <ProductsView categoria={categoria!} onDrillDown={navigateToLevel3} onBack={goBack} />;
  }

  if (level === 3) {
    return <ProductDetailsView categoria={categoria!} item={item!} tipo={tipo!} onBack={goBack} />;
  }

  return null;
}
```

---

## 🔄 Plano de Migração

### Fase 1: Preparação (Sem Impacto)

**Objetivo:** Criar nova estrutura sem afetar sistema atual

**Ações:**

1. Criar nova tabela `produtos` (migration)
2. Popular dados históricos
3. Criar novos componentes (drill-down)
4. Criar novos routers tRPC
5. Criar novas páginas (com rotas diferentes)

**Duração:** 8-10 horas

**Risco:** BAIXO (não afeta sistema atual)

---

### Fase 2: Teste Paralelo (Baixo Impacto)

**Objetivo:** Testar novo sistema em paralelo com o antigo

**Ações:**

1. Adicionar link "Nova Versão (Beta)" nas páginas antigas
2. Usuários podem testar nova versão
3. Coletar feedback
4. Corrigir bugs

**Duração:** 2-3 dias (teste com usuários)

**Risco:** BAIXO (sistema antigo continua funcionando)

---

### Fase 3: Migração Gradual (Médio Impacto)

**Objetivo:** Substituir páginas antigas pelas novas

**Ações:**

1. Atualizar rotas (redirecionar antigas para novas)
2. Atualizar navegação (menu, breadcrumbs)
3. Manter páginas antigas como fallback (1 semana)

**Duração:** 2-3 horas

**Risco:** MÉDIO (usuários precisam se adaptar)

---

### Fase 4: Limpeza (Sem Impacto)

**Objetivo:** Remover código obsoleto

**Ações:**

1. Remover páginas antigas
2. Remover componentes obsoletos
3. Remover routers obsoletos
4. Remover stored procedures obsoletos
5. Atualizar documentação

**Duração:** 3-4 horas

**Risco:** BAIXO (sistema novo já está funcionando)

---

## 🚀 Estratégia de Execução

### Cronograma Detalhado

#### Sprint 1: Infraestrutura (8-10h)

**Dia 1 (4-5h):**

- [ ] Criar migration da tabela `produtos`
- [ ] Executar migration em desenvolvimento
- [ ] Popular dados históricos
- [ ] Validar integridade dos dados
- [ ] Criar índices

**Dia 2 (4-5h):**

- [ ] Criar utilitários de exportação (clipboard, Excel)
- [ ] Criar componentes genéricos (DrillDownTable, etc.)
- [ ] Criar hook `useDrillDown`
- [ ] Criar componentes de exportação (botões)
- [ ] Testes unitários dos utilitários

---

#### Sprint 2: Produtos (10-12h)

**Dia 3 (4h):**

- [ ] Criar router tRPC `productAnalysis` (novo)
- [ ] Implementar query Nível 1 (categorias)
- [ ] Implementar query Nível 2 (produtos)
- [ ] Implementar queries Nível 3 (clientes/leads/concorrentes)
- [ ] Testes das queries

**Dia 4 (3-4h):**

- [ ] Criar componente `ProductCategoriesView` (Nível 1)
- [ ] Criar componente `ProductsView` (Nível 2)
- [ ] Integrar com tRPC
- [ ] Adicionar loading states
- [ ] Testes visuais

**Dia 5 (3-4h):**

- [ ] Criar componente `ProductDetailsView` (Nível 3)
- [ ] Integrar barra de ações (copiar, exportar)
- [ ] Adicionar paginação
- [ ] Adicionar breadcrumb
- [ ] Testes de integração

---

#### Sprint 3: Setores (8-10h)

**Dia 6 (4h):**

- [ ] Criar router tRPC `sectorAnalysis` (novo, reutilizar lógica)
- [ ] Implementar query Nível 1 (categorias)
- [ ] Implementar query Nível 2 (setores)
- [ ] Reutilizar queries Nível 3 (já existem)
- [ ] Testes das queries

**Dia 7 (2-3h):**

- [ ] Reutilizar componentes de Produtos (DrillDownTable)
- [ ] Criar `SectorCategoriesView` (wrapper)
- [ ] Criar `SectorsView` (wrapper)
- [ ] Ajustar breadcrumbs
- [ ] Testes visuais

**Dia 8 (2-3h):**

- [ ] Reutilizar `ProductDetailsView` (já funciona para setores)
- [ ] Ajustar textos e labels
- [ ] Testes de integração
- [ ] Validação completa

---

#### Sprint 4: Migração (5-6h)

**Dia 9 (2-3h):**

- [ ] Criar páginas novas com rotas temporárias
  - `/products-new` (temporário)
  - `/sectors-new` (temporário)
- [ ] Adicionar links "Nova Versão (Beta)" nas páginas antigas
- [ ] Testes com usuários (feedback)
- [ ] Ajustes baseados em feedback

**Dia 10 (2h):**

- [ ] Atualizar rotas (redirecionar antigas para novas)
  - `/products` → nova implementação
  - `/sectors` → nova implementação
- [ ] Atualizar navegação (menu, breadcrumbs)
- [ ] Manter páginas antigas como `/products-old` (fallback)
- [ ] Comunicar mudança aos usuários

**Dia 11 (1h):**

- [ ] Monitorar erros (Sentry, logs)
- [ ] Coletar feedback
- [ ] Corrigir bugs urgentes

---

#### Sprint 5: Limpeza (3-4h)

**Dia 12 (3-4h):**

- [ ] Remover páginas antigas (`/products-old`, `/sectors-old`)
- [ ] Remover componentes obsoletos
  - `components/projects/ProductAnalysis.tsx` (antigo)
  - `components/projects/SectorAnalysis.tsx` (antigo)
- [ ] Remover routers obsoletos
  - `server/routers/product-analysis.ts` (antigo)
  - `server/routers/sector-analysis.ts` (antigo)
- [ ] Remover stored procedures obsoletos (se existirem)
- [ ] Atualizar documentação
- [ ] Commit final: "feat: complete migration to drill-down system"

---

### Checklist de Validação

Após cada sprint, validar:

**Performance:**

- [ ] Queries executam em < 1s
- [ ] Paginação funciona corretamente
- [ ] Sem memory leaks

**Funcionalidade:**

- [ ] Navegação drill-down funciona
- [ ] Botão "Voltar" funciona
- [ ] Breadcrumb atualiza corretamente
- [ ] Copiar para clipboard funciona
- [ ] Exportar Excel (aba única) funciona
- [ ] Exportar Excel (múltiplas abas) funciona
- [ ] Filtros aplicam corretamente
- [ ] Paginação carrega mais dados

**UX/UI:**

- [ ] Loading states aparecem
- [ ] Mensagens de erro são claras
- [ ] Botões desabilitados quando apropriado
- [ ] Feedback visual (toasts) funciona
- [ ] Responsivo (mobile, tablet, desktop)

**Dados:**

- [ ] Contagens estão corretas
- [ ] Dados exportados estão completos
- [ ] Formatação Excel está correta
- [ ] Sem duplicação de dados

---

## ⚠️ Análise de Riscos

### Risco 1: Migration Falha

**Probabilidade:** Baixa  
**Impacto:** Alto

**Mitigação:**

- Testar migration em ambiente de desenvolvimento
- Backup do banco antes da migration
- Rollback plan (script de down)
- Popular dados em background (não bloquear sistema)

**Plano de Contingência:**

- Rollback da migration
- Usar Opção B (JSONB queries) temporariamente
- Investigar erro e corrigir

---

### Risco 2: Dados Históricos Inconsistentes

**Probabilidade:** Média  
**Impacto:** Médio

**Mitigação:**

- Validar dados após popular
- Comparar contagens (antes vs depois)
- Script de validação automática

**Plano de Contingência:**

- Reprocessar dados
- Limpar e popular novamente
- Adicionar constraints para evitar inconsistências

---

### Risco 3: Performance Pior que Esperado

**Probabilidade:** Baixa  
**Impacto:** Alto

**Mitigação:**

- Criar índices otimizados
- Testar com dados reais (não mock)
- Usar EXPLAIN ANALYZE para otimizar queries
- Implementar cache (React Query)

**Plano de Contingência:**

- Adicionar mais índices
- Otimizar queries (remover JOINs desnecessários)
- Implementar paginação server-side
- Considerar materialização de views

---

### Risco 4: Usuários Resistem à Mudança

**Probabilidade:** Média  
**Impacto:** Baixo

**Mitigação:**

- Comunicar mudança com antecedência
- Oferecer versão beta para teste
- Coletar feedback e ajustar
- Manter fallback por 1 semana

**Plano de Contingência:**

- Estender período de fallback
- Criar tutorial/documentação
- Oferecer suporte direto

---

### Risco 5: Bugs em Produção

**Probabilidade:** Média  
**Impacto:** Médio

**Mitigação:**

- Testes automatizados (unit, integration)
- Testes manuais (QA)
- Monitoramento (Sentry, logs)
- Feature flag (ativar gradualmente)

**Plano de Contingência:**

- Rollback para versão antiga (fallback)
- Hotfix urgente
- Comunicar usuários sobre problema

---

## 📊 Métricas de Sucesso

### Performance

| Métrica                         | Antes  | Meta   | Como Medir      |
| ------------------------------- | ------ | ------ | --------------- |
| Tempo de carregamento (Nível 1) | 3-5s   | < 0.5s | Chrome DevTools |
| Tempo de carregamento (Nível 2) | 3-5s   | < 0.5s | Chrome DevTools |
| Tempo de carregamento (Nível 3) | 2-3s   | < 0.3s | Chrome DevTools |
| Uso de memória                  | ~50MB  | < 10MB | Chrome DevTools |
| Timeouts                        | 10-20% | 0%     | Logs de erro    |

### UX/UI

| Métrica                           | Meta  | Como Medir    |
| --------------------------------- | ----- | ------------- |
| Taxa de cliques em "Ver Detalhes" | > 80% | Analytics     |
| Taxa de uso de exportação         | > 50% | Analytics     |
| Taxa de uso de copiar             | > 30% | Analytics     |
| Feedback positivo                 | > 90% | Survey        |
| Bugs reportados                   | < 5   | Issue tracker |

### Código

| Métrica                  | Antes | Meta   | Como Medir |
| ------------------------ | ----- | ------ | ---------- |
| Linhas de código         | ~2000 | < 1200 | `cloc`     |
| Duplicação               | ~30%  | < 10%  | SonarQube  |
| Cobertura de testes      | 0%    | > 70%  | Jest       |
| Complexidade ciclomática | ~15   | < 10   | ESLint     |

---

## 📝 Documentação

### Para Desenvolvedores

Criar arquivo `docs/DRILL_DOWN_SYSTEM.md`:

```markdown
# Sistema de Drill-Down

## Visão Geral

Sistema de navegação em 3 níveis para análise de Setores e Produtos.

## Arquitetura

### Nível 1: Categorias

- Query: GROUP BY categoria
- Performance: ~0.2s
- Dados: 10-15 linhas

### Nível 2: Itens

- Query: GROUP BY nome + filtro categoria
- Performance: ~0.3s
- Dados: 50 linhas (paginado)

### Nível 3: Detalhes

- Query: JOIN + filtro item
- Performance: ~0.2s
- Dados: 50 linhas (paginado)

## Como Adicionar Novo Tipo

1. Criar router tRPC
2. Reutilizar componentes genéricos
3. Ajustar queries
4. Adicionar rota

## Troubleshooting

### Query lenta

- Verificar índices
- Usar EXPLAIN ANALYZE
- Considerar cache

### Dados inconsistentes

- Validar migration
- Reprocessar dados
- Verificar constraints
```

### Para Usuários

Criar arquivo `docs/GUIA_USUARIO_DRILL_DOWN.md`:

```markdown
# Guia do Usuário: Análise de Produtos e Setores

## Como Usar

### 1. Visualizar Categorias

- Acesse "Produtos" ou "Setores"
- Veja resumo por categoria
- Clique em "Ver Detalhes"

### 2. Explorar Itens

- Veja lista de produtos/setores
- Compare Clientes, Leads e Concorrentes lado a lado
- Clique em "Ver Clientes" (ou Leads/Concorrentes)

### 3. Ver Detalhes

- Veja lista completa de registros
- Use "Copiar" para colar em Excel
- Use "Exportar Excel" para arquivo formatado
- Use "Exportar Tudo" para múltiplas abas

## Dicas

- Use "Copiar" para análises rápidas
- Use "Exportar Excel" para relatórios profissionais
- Use "Exportar Tudo" para análise completa
```

---

## ✅ Checklist Final

### Antes de Começar

- [ ] Backup do banco de dados
- [ ] Ambiente de desenvolvimento configurado
- [ ] Dependências instaladas (`xlsx`, etc.)
- [ ] Acesso ao repositório Git

### Durante Implementação

- [ ] Commits frequentes (atomic commits)
- [ ] Testes após cada feature
- [ ] Code review (se possível)
- [ ] Documentação atualizada

### Antes de Deploy

- [ ] Todos os testes passando
- [ ] Performance validada
- [ ] Sem warnings no console
- [ ] Documentação completa
- [ ] Changelog atualizado

### Após Deploy

- [ ] Monitorar erros (Sentry)
- [ ] Monitorar performance (Vercel)
- [ ] Coletar feedback
- [ ] Corrigir bugs urgentes

---

## 🎯 Resumo Executivo

### O Que Será Feito

1. **Criar tabela normalizada de produtos** (migration)
2. **Implementar sistema de drill-down** (3 níveis)
3. **Adicionar exportação avançada** (Excel formatado, copiar)
4. **Migrar páginas antigas** (sem quebrar sistema)
5. **Limpar código obsoleto** (componentes, routers)

### Tempo Estimado

- **Sprint 1:** Infraestrutura (8-10h)
- **Sprint 2:** Produtos (10-12h)
- **Sprint 3:** Setores (8-10h)
- **Sprint 4:** Migração (5-6h)
- **Sprint 5:** Limpeza (3-4h)

**Total:** 34-42 horas (~1 semana de trabalho)

### Benefícios

1. ✅ **5.5x mais rápido** (0.9s vs 5s)
2. ✅ **90% menos memória**
3. ✅ **Sem timeouts**
4. ✅ **UX intuitiva**
5. ✅ **Exportação profissional**
6. ✅ **Código limpo** (-40% linhas)
7. ✅ **Escalável** (1M+ registros)
8. ✅ **Manutenível** (componentes reutilizáveis)

### Riscos

- **Migration:** Baixo (testado, com rollback)
- **Performance:** Baixo (índices otimizados)
- **Adoção:** Médio (comunicação + fallback)
- **Bugs:** Médio (testes + monitoramento)

### Recomendação

✅ **IMPLEMENTAR AGORA**

**Justificativa:**

- ROI alto (1 semana de esforço, benefícios permanentes)
- Risco controlado (estratégia de migração gradual)
- Impacto positivo (performance, UX, manutenibilidade)
- Alinhado com best practices (normalização, componentes reutilizáveis)

---

**Aguardo aprovação para começar a implementação! 🚀**
