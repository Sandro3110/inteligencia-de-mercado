'use client';

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

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
  previewData?: any[][];
}

export function ColumnMapper({
  sourceColumns,
  targetFields,
  onMappingComplete,
  previewData = [],
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-mapear colunas com nomes similares
  useEffect(() => {
    const autoMapping: Record<string, string> = {};

    targetFields.forEach(field => {
      const normalizedFieldName = field.label.toLowerCase().trim();

      // Procurar coluna com nome similar
      const matchingColumn = sourceColumns.find(col => {
        const normalizedColName = col.toLowerCase().trim();
        return (
          normalizedColName === normalizedFieldName ||
          normalizedColName.includes(normalizedFieldName) ||
          normalizedFieldName.includes(normalizedColName)
        );
      });

      if (matchingColumn) {
        autoMapping[field.key] = matchingColumn;
      }
    });

    setMapping(autoMapping);
  }, [sourceColumns, targetFields]);

  const handleMappingChange = (
    targetFieldKey: string,
    sourceColumn: string
  ) => {
    setMapping(prev => ({
      ...prev,
      [targetFieldKey]: sourceColumn,
    }));
  };

  const validateMapping = (): boolean => {
    const newErrors: string[] = [];

    // Verificar campos obrigatórios
    targetFields.forEach(field => {
      if (field.required && !mapping[field.key]) {
        newErrors.push(`Campo obrigatório não mapeado: ${field.label}`);
      }
    });

    // Verificar duplicatas
    const usedColumns = Object.values(mapping).filter(col => col);
    const duplicates = usedColumns.filter(
      (col, index) => usedColumns.indexOf(col) !== index
    );

    if (duplicates.length > 0) {
      const uniqueDuplicates = Array.from(new Set(duplicates));
      newErrors.push(`Colunas duplicadas: ${uniqueDuplicates.join(", ")}`);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleConfirm = () => {
    if (validateMapping()) {
      onMappingComplete(mapping);
    }
  };

  const getMappingStatus = () => {
    const requiredFields = targetFields.filter(f => f.required);
    const mappedRequired = requiredFields.filter(f => mapping[f.key]);
    return {
      total: targetFields.length,
      mapped: Object.keys(mapping).filter(k => mapping[k]).length,
      requiredMapped: mappedRequired.length,
      requiredTotal: requiredFields.length,
    };
  };

  const status = getMappingStatus();
  const isComplete =
    status.requiredMapped === status.requiredTotal && errors.length === 0;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mapeamento de Colunas</CardTitle>
              <CardDescription>
                Associe as colunas do arquivo com os campos do sistema
              </CardDescription>
            </div>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {status.requiredMapped}/{status.requiredTotal} obrigatórios
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Mapping Grid */}
      <div className="grid gap-4">
        {targetFields.map(field => (
          <Card key={field.key}>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr]">
                {/* Campo de Destino */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {field.label}
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>

                {/* Seta */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Coluna de Origem */}
                <div className="space-y-2">
                  <Select
                    value={mapping[field.key] || ""}
                    onValueChange={value =>
                      handleMappingChange(field.key, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não mapear</SelectItem>
                      {sourceColumns.map(col => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Preview de dados */}
                  {mapping[field.key] && previewData.length > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">Exemplos:</p>
                      {previewData.slice(0, 3).map((row, idx) => {
                        const colIndex = sourceColumns.indexOf(
                          mapping[field.key]
                        );
                        return (
                          <p key={idx} className="truncate">
                            • {row[colIndex] || "(vazio)"}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isComplete && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Mapeamento completo! Todos os campos obrigatórios foram preenchidos.
          </AlertDescription>
        </Alert>
      )}

      {/* Confirm Button */}
      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!isComplete} size="lg">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Confirmar Mapeamento
        </Button>
      </div>
    </div>
  );
}
