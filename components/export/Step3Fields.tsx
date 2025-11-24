'use client';

/**
 * Step 3: Fields - Seleção de campos para exportação
 * Componente interativo com hooks e eventos
 */

import { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import type { ExportState } from '@/lib/types/export';

interface Step3FieldsProps {
  state: ExportState;
  setState: React.Dispatch<React.SetStateAction<ExportState>>;
}

const ESSENTIAL_FIELDS = ['id', 'nome', 'uf', 'cidade', 'quality_score', 'status'];

export default function Step3Fields({ state, setState }: Step3FieldsProps) {
  const { data: fieldsData } = trpc.export.getAvailableFields.useQuery({
    entityType: state.entityType,
  });

  const fields = fieldsData?.fields || [];

  const toggleField = useCallback(
    (field: string) => {
      const current = state.selectedFields || [];
      setState((prev) => ({
        ...prev,
        selectedFields: current.includes(field)
          ? current.filter((f) => f !== field)
          : [...current, field],
      }));
    },
    [state.selectedFields, setState]
  );

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFields: fields,
    }));
  }, [fields, setState]);

  const deselectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFields: [],
    }));
  }, [setState]);

  const selectEssential = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFields: fields.filter((f) => ESSENTIAL_FIELDS.includes(f)),
    }));
  }, [fields, setState]);

  const selectedCount = state.selectedFields?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Selecione os Campos</h2>
        <p className="text-slate-600">Escolha quais informações deseja incluir na exportação.</p>
      </div>

      {/* Ações rápidas */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={selectAll}>
          Selecionar Todos
        </Button>
        <Button size="sm" variant="outline" onClick={deselectAll}>
          Limpar Seleção
        </Button>
        <Button size="sm" variant="outline" onClick={selectEssential}>
          Campos Essenciais
        </Button>
      </div>

      {/* Selecionados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-blue-900">Campos Selecionados</h4>
          <Badge variant="secondary">
            {selectedCount} de {fields.length}
          </Badge>
        </div>
        {selectedCount > 0 ? (
          <div className="flex flex-wrap gap-2">
            {state.selectedFields?.map((field) => (
              <Badge key={field} variant="default">
                {field}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-blue-700">Nenhum campo selecionado</p>
        )}
      </div>

      {/* Lista de campos */}
      <div className="space-y-2">
        <Label>Campos Disponíveis</Label>
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4">
          {fields.map((field) => (
            <div key={field} className="flex items-center space-x-2">
              <Checkbox
                id={field}
                checked={state.selectedFields?.includes(field)}
                onCheckedChange={() => toggleField(field)}
              />
              <label
                htmlFor={field}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {field}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Relacionamentos */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeRelationships"
            checked={state.includeRelationships}
            onCheckedChange={(checked) =>
              setState((prev) => ({
                ...prev,
                includeRelationships: !!checked,
              }))
            }
          />
          <label htmlFor="includeRelationships" className="text-sm font-medium cursor-pointer">
            Incluir dados relacionados
          </label>
        </div>
        <p className="text-xs text-slate-500 ml-6">
          Exemplo: Para clientes, incluir seus mercados, produtos, concorrentes e leads.
        </p>
      </div>

      {/* Aviso */}
      {selectedCount === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Selecione pelo menos um campo para continuar.
          </p>
        </div>
      )}
    </div>
  );
}
