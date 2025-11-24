'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const LABELS = {
  TITLE: 'Mapeamento de Colunas',
  DESCRIPTION: 'Associe as colunas do arquivo com os campos do sistema',
  REQUIRED: 'Obrigatório',
  NO_MAPPING: 'Não mapear',
  SELECT_COLUMN: 'Selecione uma coluna',
  EXAMPLES: 'Exemplos:',
  EMPTY_VALUE: '(vazio)',
  CONFIRM: 'Confirmar Mapeamento',
  STATUS: (mapped: number, total: number) => `${mapped}/${total} obrigatórios`,
} as const;

const MESSAGES = {
  SUCCESS: 'Mapeamento completo! Todos os campos obrigatórios foram preenchidos.',
  ERROR_REQUIRED: (label: string) => `Campo obrigatório não mapeado: ${label}`,
  ERROR_DUPLICATES: (columns: string[]) =>
    `Colunas duplicadas: ${columns.join(', ')}`,
} as const;

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
} as const;

const PREVIEW_LIMITS = {
  MAX_ROWS: 3,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
}

interface TargetField {
  key: string;
  label: string;
  required: boolean;
  description?: string;
}

interface ColumnMapperProps {
  sourceColumns: string[];
  targetFields: TargetField[];
  onMappingComplete: (mapping: Record<string, string>) => void;
  previewData?: string[][];
}

interface MappingStatus {
  total: number;
  mapped: number;
  requiredMapped: number;
  requiredTotal: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

function isStringSimilar(str1: string, str2: string): boolean {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  return (
    norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)
  );
}

function findMatchingColumn(
  sourceColumns: string[],
  targetLabel: string
): string | undefined {
  return sourceColumns.find((col) => isStringSimilar(col, targetLabel));
}

function createAutoMapping(
  sourceColumns: string[],
  targetFields: TargetField[]
): Record<string, string> {
  const autoMapping: Record<string, string> = {};

  targetFields.forEach((field) => {
    const matchingColumn = findMatchingColumn(sourceColumns, field.label);
    if (matchingColumn) {
      autoMapping[field.key] = matchingColumn;
    }
  });

  return autoMapping;
}

function getUniqueDuplicates(items: string[]): string[] {
  const duplicates = items.filter(
    (item, index) => items.indexOf(item) !== index
  );
  return Array.from(new Set(duplicates));
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ColumnMapper({
  sourceColumns,
  targetFields,
  onMappingComplete,
  previewData = [],
}: ColumnMapperProps) {
  // State
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // ============================================================================
  // AUTO-MAPPING EFFECT
  // ============================================================================

  // Auto-mapear colunas com nomes similares
  useEffect(() => {
    const autoMapping = createAutoMapping(sourceColumns, targetFields);
    setMapping(autoMapping);
     
  }, [sourceColumns, targetFields]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateMapping = useCallback((): boolean => {
    const newErrors: string[] = [];

    // Verificar campos obrigatórios
    targetFields.forEach((field) => {
      if (field.required && !mapping[field.key]) {
        newErrors.push(MESSAGES.ERROR_REQUIRED(field.label));
      }
    });

    // Verificar duplicatas
    const usedColumns = Object.values(mapping).filter((col) => col);
    const duplicates = getUniqueDuplicates(usedColumns);

    if (duplicates.length > 0) {
      newErrors.push(MESSAGES.ERROR_DUPLICATES(duplicates));
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [mapping, targetFields]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMappingChange = useCallback(
    (targetFieldKey: string, sourceColumn: string) => {
      setMapping((prev) => ({
        ...prev,
        [targetFieldKey]: sourceColumn,
      }));
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (validateMapping()) {
      onMappingComplete(mapping);
    }
  }, [validateMapping, onMappingComplete, mapping]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const mappingStatus = useMemo((): MappingStatus => {
    const requiredFields = targetFields.filter((f) => f.required);
    const mappedRequired = requiredFields.filter((f) => mapping[f.key]);

    return {
      total: targetFields.length,
      mapped: Object.keys(mapping).filter((k) => mapping[k]).length,
      requiredMapped: mappedRequired.length,
      requiredTotal: requiredFields.length,
    };
  }, [mapping, targetFields]);

  const isComplete = useMemo(
    () =>
      mappingStatus.requiredMapped === mappingStatus.requiredTotal &&
      errors.length === 0,
    [mappingStatus, errors]
  );

  const statusBadgeVariant = useMemo(
    () => (isComplete ? 'default' : 'secondary'),
    [isComplete]
  );

  const statusLabel = useMemo(
    () =>
      LABELS.STATUS(
        mappingStatus.requiredMapped,
        mappingStatus.requiredTotal
      ),
    [mappingStatus]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatusCard = useCallback(
    () => (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{LABELS.TITLE}</CardTitle>
              <CardDescription>{LABELS.DESCRIPTION}</CardDescription>
            </div>
            <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
          </div>
        </CardHeader>
      </Card>
    ),
    [statusBadgeVariant, statusLabel]
  );

  const renderFieldLabel = useCallback(
    (field: TargetField) => (
      <Label className="flex items-center gap-2">
        {field.label}
        {field.required && (
          <Badge variant="destructive" className="text-xs">
            {LABELS.REQUIRED}
          </Badge>
        )}
      </Label>
    ),
    []
  );

  const renderFieldDescription = useCallback(
    (description?: string) =>
      description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null,
    []
  );

  const renderColumnSelect = useCallback(
    (field: TargetField) => (
      <Select
        value={mapping[field.key] || ''}
        onValueChange={(value) => handleMappingChange(field.key, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={LABELS.SELECT_COLUMN} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{LABELS.NO_MAPPING}</SelectItem>
          {sourceColumns.map((col) => (
            <SelectItem key={col} value={col}>
              {col}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    [mapping, sourceColumns, handleMappingChange]
  );

  const renderPreviewData = useCallback(
    (field: TargetField) => {
      if (!mapping[field.key] || previewData.length === 0) {
        return null;
      }

      const colIndex = sourceColumns.indexOf(mapping[field.key]);

      return (
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">{LABELS.EXAMPLES}</p>
          {previewData.slice(0, PREVIEW_LIMITS.MAX_ROWS).map((row, idx) => (
            <p key={idx} className="truncate">
              • {row[colIndex] || LABELS.EMPTY_VALUE}
            </p>
          ))}
        </div>
      );
    },
    [mapping, previewData, sourceColumns]
  );

  const renderMappingCard = useCallback(
    (field: TargetField) => (
      <Card key={field.key}>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr]">
            {/* Campo de Destino */}
            <div className="space-y-2">
              {renderFieldLabel(field)}
              {renderFieldDescription(field.description)}
            </div>

            {/* Seta */}
            <div className="flex items-center justify-center">
              <ArrowRight
                className={`${ICON_SIZES.SMALL} text-muted-foreground`}
              />
            </div>

            {/* Coluna de Origem */}
            <div className="space-y-2">
              {renderColumnSelect(field)}
              {renderPreviewData(field)}
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [
      renderFieldLabel,
      renderFieldDescription,
      renderColumnSelect,
      renderPreviewData,
    ]
  );

  const renderErrors = useCallback(
    () =>
      errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertCircle className={ICON_SIZES.SMALL} />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null,
    [errors]
  );

  const renderSuccessMessage = useCallback(
    () =>
      isComplete ? (
        <Alert>
          <CheckCircle2 className={ICON_SIZES.SMALL} />
          <AlertDescription>{MESSAGES.SUCCESS}</AlertDescription>
        </Alert>
      ) : null,
    [isComplete]
  );

  const renderConfirmButton = useCallback(
    () => (
      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!isComplete} size="lg">
          <CheckCircle2 className={`mr-2 ${ICON_SIZES.SMALL}`} />
          {LABELS.CONFIRM}
        </Button>
      </div>
    ),
    [handleConfirm, isComplete]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {renderStatusCard()}

      <div className="grid gap-4">{targetFields.map(renderMappingCard)}</div>

      {renderErrors()}
      {renderSuccessMessage()}
      {renderConfirmButton()}
    </div>
  );
}
