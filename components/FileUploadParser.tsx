'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const FILE_FORMATS = {
  CSV: '.csv',
  XLSX: '.xlsx',
  XLS: '.xls',
} as const;

const DEFAULT_ACCEPTED_FORMATS = [
  FILE_FORMATS.CSV,
  FILE_FORMATS.XLSX,
  FILE_FORMATS.XLS,
];

const DEFAULT_MAX_SIZE_MB = 10;

const CSV_DELIMITERS = /[,;|\t]/;

const LABELS = {
  DEFAULT_TITLE: 'Importar Arquivo',
  DEFAULT_DESCRIPTION: 'Faça upload de um arquivo CSV ou Excel',
  DRAG_DROP: 'Arraste e solte seu arquivo aqui, ou',
  SELECT_FILE: 'Selecionar Arquivo',
  PROCESSING: 'Processando...',
  MAX_SIZE: 'Tamanho máximo:',
  FILE_FORMATS: {
    CSV: 'CSV',
    EXCEL: 'Excel',
  },
} as const;

const TOAST_MESSAGES = {
  SUCCESS: (rows: number) =>
    `Arquivo processado com sucesso! ${rows} linhas encontradas.`,
} as const;

const ERROR_MESSAGES = {
  EMPTY_CSV: 'Arquivo CSV vazio',
  FILE_TOO_LARGE: (maxSizeMB: number) =>
    `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
  UNSUPPORTED_FORMAT: (formats: string[]) =>
    `Formato não suportado. Aceitos: ${formats.join(', ')}`,
  EXCEL_NOT_SUPPORTED:
    'Formato Excel não suportado diretamente. Por favor, salve como CSV.',
  UNRECOGNIZED_FORMAT: 'Formato de arquivo não reconhecido',
  NO_COLUMNS: 'Nenhuma coluna encontrada no arquivo',
  NO_ROWS: 'Nenhuma linha de dados encontrada no arquivo',
  GENERIC: 'Erro ao processar arquivo',
} as const;

const ICON_SIZES = {
  LARGE: 'h-8 w-8',
  MEDIUM: 'h-5 w-5',
  SMALL: 'h-4 w-4',
  TINY: 'h-3 w-3',
} as const;

const DRAG_CLASSES = {
  ACTIVE: 'border-blue-500 bg-blue-50',
  INACTIVE: 'border-gray-300 hover:border-gray-400',
} as const;

const COLORS = {
  SUCCESS_BG: 'bg-green-50',
  SUCCESS_BORDER: 'border-green-200',
  SUCCESS_TEXT: 'text-green-900',
  SUCCESS_ICON: 'text-green-600',
  SUCCESS_SECONDARY: 'text-green-700',
  SUCCESS_HOVER: 'hover:text-green-900',
  GRAY_BG: 'bg-gray-100',
  GRAY_TEXT: 'text-gray-600',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface ParsedData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

interface FileUploadParserProps {
  onDataParsed: (data: ParsedData) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function cleanCSVCell(cell: string): string {
  return cell.trim().replace(/^"|"$/g, '');
}

function splitCSVLine(line: string): string[] {
  return line.split(CSV_DELIMITERS).map(cleanCSVCell);
}

function getFileExtension(fileName: string): string | null {
  return fileName.toLowerCase().match(/\.[^.]+$/)?.[0] || null;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function isCSVFormat(extension: string): boolean {
  return extension === FILE_FORMATS.CSV;
}

function isExcelFormat(extension: string): boolean {
  return extension === FILE_FORMATS.XLSX || extension === FILE_FORMATS.XLS;
}

function looksLikeCSV(text: string): boolean {
  return text.includes(',') || text.includes(';');
}

// ============================================================================
// COMPONENT
// ============================================================================

function FileUploadParser({
  onDataParsed,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  title = LABELS.DEFAULT_TITLE,
  description = LABELS.DEFAULT_DESCRIPTION,
}: FileUploadParserProps) {
  // State
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // ============================================================================
  // PARSING FUNCTIONS
  // ============================================================================

  const parseCSV = useCallback(
    (text: string, fileName: string): ParsedData => {
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error(ERROR_MESSAGES.EMPTY_CSV);
      }

      const headers = splitCSVLine(lines[0]);
      const rows = lines.slice(1).map(splitCSVLine);

      return { headers, rows, fileName };
    },
    []
  );

  const parseExcel = useCallback(
    async (file: File): Promise<ParsedData> => {
      // Para Excel, vamos usar uma abordagem simplificada
      // Em produção, você pode usar bibliotecas como xlsx ou exceljs
      const text = await file.text();

      // Tentar detectar se é um CSV disfarçado de Excel
      if (looksLikeCSV(text)) {
        return parseCSV(text, file.name);
      }

      throw new Error(ERROR_MESSAGES.EXCEL_NOT_SUPPORTED);
    },
    [parseCSV]
  );

  // ============================================================================
  // FILE PROCESSING
  // ============================================================================

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setParseError(null);

      try {
        // Validar tamanho
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
          throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE(maxSizeMB));
        }

        // Validar formato
        const extension = getFileExtension(file.name);
        if (!extension || !acceptedFormats.includes(extension)) {
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_FORMAT(acceptedFormats));
        }

        let parsedData: ParsedData;

        if (isCSVFormat(extension)) {
          const text = await file.text();
          parsedData = parseCSV(text, file.name);
        } else if (isExcelFormat(extension)) {
          parsedData = await parseExcel(file);
        } else {
          throw new Error(ERROR_MESSAGES.UNRECOGNIZED_FORMAT);
        }

        // Validar dados parseados
        if (parsedData.headers.length === 0) {
          throw new Error(ERROR_MESSAGES.NO_COLUMNS);
        }

        if (parsedData.rows.length === 0) {
          throw new Error(ERROR_MESSAGES.NO_ROWS);
        }

        setUploadedFile(file);
        onDataParsed(parsedData);
        toast.success(TOAST_MESSAGES.SUCCESS(parsedData.rows.length));
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC;
        setParseError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [maxSizeMB, acceptedFormats, parseCSV, parseExcel, onDataParsed]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setParseError(null);
  }, []);

  const handleSelectFileClick = useCallback(() => {
    document.getElementById('file-upload')?.click();
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const dragClasses = useMemo(
    () =>
      isDragging ? DRAG_CLASSES.ACTIVE : DRAG_CLASSES.INACTIVE,
    [isDragging]
  );

  const buttonLabel = useMemo(
    () => (isProcessing ? LABELS.PROCESSING : LABELS.SELECT_FILE),
    [isProcessing]
  );

  const acceptedFormatsString = useMemo(
    () => acceptedFormats.join(','),
    [acceptedFormats]
  );

  const fileSize = useMemo(
    () => (uploadedFile ? formatFileSize(uploadedFile.size) : null),
    [uploadedFile]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderUploadIcon = useCallback(
    () => (
      <div className={`p-4 ${COLORS.GRAY_BG} rounded-full`}>
        <Upload className={`${ICON_SIZES.LARGE} ${COLORS.GRAY_TEXT}`} />
      </div>
    ),
    []
  );

  const renderFormatBadges = useCallback(
    () => (
      <div className="flex gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="gap-1">
          <FileSpreadsheet className={ICON_SIZES.TINY} />
          {LABELS.FILE_FORMATS.CSV}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <FileText className={ICON_SIZES.TINY} />
          {LABELS.FILE_FORMATS.EXCEL}
        </Badge>
      </div>
    ),
    []
  );

  const renderUploadedFile = useCallback(
    () =>
      uploadedFile ? (
        <div className="space-y-3">
          <div
            className={`flex items-center justify-between p-4 ${COLORS.SUCCESS_BG} border ${COLORS.SUCCESS_BORDER} rounded-lg`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2
                className={`${ICON_SIZES.MEDIUM} ${COLORS.SUCCESS_ICON}`}
              />
              <div>
                <p className={`text-sm font-medium ${COLORS.SUCCESS_TEXT}`}>
                  {uploadedFile.name}
                </p>
                <p className={`text-xs ${COLORS.SUCCESS_SECONDARY}`}>
                  {fileSize}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className={`${COLORS.SUCCESS_SECONDARY} ${COLORS.SUCCESS_HOVER}`}
            >
              <X className={ICON_SIZES.SMALL} />
            </Button>
          </div>
        </div>
      ) : null,
    [uploadedFile, fileSize, handleRemoveFile]
  );

  const renderError = useCallback(
    () =>
      parseError ? (
        <Alert variant="destructive">
          <AlertCircle className={ICON_SIZES.SMALL} />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      ) : null,
    [parseError]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragClasses}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              {renderUploadIcon()}

              <div className="space-y-2">
                <p className="text-sm font-medium">{LABELS.DRAG_DROP}</p>
                <Label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    disabled={isProcessing}
                    onClick={handleSelectFileClick}
                  >
                    {buttonLabel}
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept={acceptedFormatsString}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {renderFormatBadges()}

              <p className="text-xs text-muted-foreground">
                {LABELS.MAX_SIZE} {maxSizeMB}MB
              </p>
            </div>
          </div>
        ) : (
          renderUploadedFile()
        )}

        {renderError()}
      </CardContent>
    </Card>
  );
}

export default FileUploadParser;
