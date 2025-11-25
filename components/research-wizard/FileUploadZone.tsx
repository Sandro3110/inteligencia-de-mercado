'use client';

/**
 * Componente de Upload de Planilhas com Drag & Drop
 * Fase 42.2 - Upload funcional CSV/Excel
 */

import { useState, useRef, DragEvent, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import type { ResearchWizardData } from '@/types/research-wizard';
import { ColumnMapper } from '@/components/ColumnMapper';
import { toast } from 'sonner';

const VALID_EXTENSIONS = ['.csv', '.xlsx', '.xls'] as const;
const CSV_DELIMITERS = [';', '\t', ','] as const;

type Porte = 'MEI' | 'ME' | 'EPP' | 'Médio' | 'Grande';
type Segmentacao = 'B2B' | 'B2C' | 'B2B2C' | 'B2G';

interface FileUploadZoneProps {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
  tipo: 'mercado' | 'cliente';
}

interface ParsedRowData {
  nome?: string;
  razaoSocial?: string;
  cnpj?: string;
  site?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  porte?: Porte;
  segmentacao?: Segmentacao;
  [key: string]: string | undefined;
}

interface ParsedRow {
  data: ParsedRowData;
  valid: boolean;
  errors?: string[];
  rowNumber: number;
}

interface RawData {
  headers: string[];
  rows: string[][];
}

interface TargetField {
  key: string;
  label: string;
  required: boolean;
  description?: string;
}

const MERCADO_FIELDS: TargetField[] = [
  {
    key: 'nome',
    label: 'Nome',
    required: true,
    description: 'Nome do mercado',
  },
  {
    key: 'segmentacao',
    label: 'Segmentação',
    required: false,
    description: 'B2B, B2C, B2B2C ou B2G',
  },
];

const CLIENTE_FIELDS: TargetField[] = [
  {
    key: 'nome',
    label: 'Nome',
    required: true,
    description: 'Nome da empresa',
  },
  { key: 'razaoSocial', label: 'Razão Social', required: false },
  { key: 'cnpj', label: 'CNPJ', required: false },
  { key: 'site', label: 'Site', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'telefone', label: 'Telefone', required: false },
  { key: 'cidade', label: 'Cidade', required: false },
  { key: 'uf', label: 'UF', required: false },
  { key: 'porte', label: 'Porte', required: false },
];

function detectDelimiter(line: string): string {
  for (const delimiter of CSV_DELIMITERS) {
    if (line.includes(delimiter)) {
      return delimiter;
    }
  }
  return ',';
}

function cleanCell(cell: string): string {
  return cell.trim().replace(/^"|"$/g, '');
}

export default function FileUploadZone({ data, updateData, tipo }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [rawData, setRawData] = useState<RawData>({
    headers: [],
    rows: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetFields = useMemo(
    () => (tipo === 'mercado' ? MERCADO_FIELDS : CLIENTE_FIELDS),
    [tipo]
  );

  const validCount = useMemo(() => parsedData.filter((r) => r.valid).length, [parsedData]);
  const invalidCount = useMemo(() => parsedData.filter((r) => !r.valid).length, [parsedData]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
      toast.error('Arquivo CSV vazio');
      return;
    }

    const firstLine = lines[0];
    const delimiter = detectDelimiter(firstLine);

    const headers = firstLine.split(delimiter).map(cleanCell);
    const rows = lines.slice(1).map((line) => line.split(delimiter).map(cleanCell));

    setRawData({ headers, rows });
    setShowMapping(true);
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      const fileExtension = selectedFile.name
        .substring(selectedFile.name.lastIndexOf('.'))
        .toLowerCase();

      if (!VALID_EXTENSIONS.includes(fileExtension as any)) {
        toast.error('Formato inválido. Apenas CSV e Excel (.xlsx, .xls) são aceitos.');
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        parseCSV(content);
      };

      if (fileExtension === '.csv') {
        reader.readAsText(selectedFile);
      } else {
        reader.readAsArrayBuffer(selectedFile);
      }
    },
    [parseCSV]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleMappingComplete = useCallback(
    (mapping: Record<string, string>) => {
      const mappedRows: ParsedRow[] = rawData.rows.map((row, index) => {
        const data: ParsedRowData = {};

        Object.entries(mapping).forEach(([targetField, sourceColumn]) => {
          const colIndex = rawData.headers.indexOf(sourceColumn);
          if (colIndex !== -1) {
            data[targetField] = row[colIndex];
          }
        });

        const valid = !!data.nome;
        const errors = !data.nome ? ['Nome é obrigatório'] : [];

        return {
          data,
          valid,
          errors,
          rowNumber: index + 1,
        };
      });

      setParsedData(mappedRows);
      setShowMapping(false);
      setShowPreview(true);
    },
    [rawData]
  );

  const handleImportValid = useCallback(() => {
    const validRows = parsedData.filter((r) => r.valid);

    if (tipo === 'mercado') {
      const newMercados = validRows.map((r) => ({
        nome: r.data.nome!,
        segmentacao: (r.data.segmentacao || 'B2B') as Segmentacao,
      }));

      updateData({
        mercados: [...data.mercados, ...newMercados],
      });
    } else {
      const newClientes = validRows.map((r) => ({
        nome: r.data.nome!,
        razaoSocial: r.data.razaoSocial,
        cnpj: r.data.cnpj,
        site: r.data.site,
        email: r.data.email,
        telefone: r.data.telefone,
        cidade: r.data.cidade,
        uf: r.data.uf,
        porte: r.data.porte,
      }));

      updateData({
        clientes: [...(data.clientes || []), ...newClientes],
      });
    }

    setShowPreview(false);
    setParsedData([]);
    setFile(null);
    toast.success(`${validRows.length} registros importados com sucesso!`);
  }, [parsedData, tipo, data, updateData]);

  const handleClickUploadZone = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className="space-y-6">
      {/* Mapeamento de Colunas */}
      {showMapping && (
        <ColumnMapper
          sourceColumns={rawData.headers}
          targetFields={targetFields}
          onMappingComplete={handleMappingComplete}
          previewData={rawData.rows}
        />
      )}

      {/* Zona de Upload */}
      {!showPreview && !showMapping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Upload de Planilha
            </CardTitle>
            <CardDescription>
              Arraste um arquivo CSV ou Excel, ou clique para selecionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onClick={handleClickUploadZone}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-600' : 'text-muted-foreground'}`}
              />

              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{file.name}</p>
                  <Badge>{(file.size / 1024).toFixed(2)} KB</Badge>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">
                    {isDragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
                  <Button variant="outline">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            <Alert className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Formato esperado:</strong> A planilha deve conter pelo menos uma coluna
                com o nome {tipo === 'mercado' ? 'do mercado' : 'da empresa'}.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Preview e Importação */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Preview dos Dados
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {validCount} registros válidos, {invalidCount} com erros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData.slice(0, 10).map((row) => (
              <div
                key={row.rowNumber}
                className={`p-3 rounded border ${row.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{row.data.nome || '(sem nome)'}</p>
                    {row.errors && row.errors.length > 0 && (
                      <p className="text-sm text-red-600">{row.errors.join(', ')}</p>
                    )}
                  </div>
                  {row.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}

            {parsedData.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                ... e mais {parsedData.length - 10} registros
              </p>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleImportValid} disabled={validCount === 0} className="flex-1">
                Importar {validCount} Registros Válidos
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
