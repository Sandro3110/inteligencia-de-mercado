'use client';

/**
 * AdvancedFilterBuilder - Construtor de Filtros Avançados
 * Permite criar filtros complexos com múltiplas condições e grupos lógicos
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import type {
  AdvancedFilter,
  FilterCondition,
  FilterGroup,
  LogicalOperator,
  FilterOperator,
} from '@shared/advancedFilters';
import { FIELD_OPERATORS, OPERATOR_LABELS } from '@shared/advancedFilters';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_FIELDS: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  leads: [
    { value: 'nome', label: 'Nome' },
    { value: 'tipo', label: 'Tipo' },
    { value: 'porte', label: 'Porte' },
    { value: 'regiao', label: 'Região' },
    { value: 'setor', label: 'Setor' },
    { value: 'qualidadeScore', label: 'Score de Qualidade' },
    { value: 'stage', label: 'Estágio' },
    { value: 'validationStatus', label: 'Status de Validação' },
  ],
  clientes: [
    { value: 'nome', label: 'Nome' },
    { value: 'cnpj', label: 'CNPJ' },
    { value: 'porte', label: 'Porte' },
    { value: 'segmentacaoB2bB2c', label: 'Segmentação' },
    { value: 'qualidadeScore', label: 'Score de Qualidade' },
    { value: 'validationStatus', label: 'Status de Validação' },
  ],
  concorrentes: [
    { value: 'nome', label: 'Nome' },
    { value: 'cnpj', label: 'CNPJ' },
    { value: 'porte', label: 'Porte' },
    { value: 'produto', label: 'Produto' },
    { value: 'validationStatus', label: 'Status de Validação' },
  ],
  mercados: [
    { value: 'nome', label: 'Nome' },
    { value: 'segmentacao', label: 'Segmentação' },
    { value: 'categoria', label: 'Categoria' },
    { value: 'quantidadeClientes', label: 'Quantidade de Clientes' },
  ],
} as const;

const LOGICAL_OPERATORS = {
  AND: 'AND',
  OR: 'OR',
} as const;

const LOGICAL_OPERATOR_LABELS = {
  [LOGICAL_OPERATORS.AND]: 'E',
  [LOGICAL_OPERATORS.OR]: 'OU',
} as const;

const NULL_OPERATORS: FilterOperator[] = ['isNull', 'isNotNull'];

const DEFAULT_CONDITION: FilterCondition = {
  field: '',
  operator: 'eq',
  value: '',
} as const;

const DEFAULT_GROUP: FilterGroup = {
  conditions: [DEFAULT_CONDITION],
  logicalOperator: 'AND',
} as const;

const DEFAULT_FILTER: AdvancedFilter = {
  groups: [DEFAULT_GROUP],
  globalOperator: 'AND',
} as const;

const LABELS = {
  TITLE: 'Filtros Avançados',
  DESCRIPTION: 'Construa filtros complexos combinando múltiplas condições',
  COMBINE_GROUPS: 'Combinar grupos com:',
  GROUP_LABEL: (index: number) => `Grupo ${index + 1}`,
  FIELD_PLACEHOLDER: 'Selecione o campo',
  OPERATOR_PLACEHOLDER: 'Operador',
  VALUE_PLACEHOLDER: 'Valor',
  ADD_CONDITION: 'Adicionar Condição',
  ADD_GROUP: 'Adicionar Grupo',
  APPLY_FILTERS: 'Aplicar Filtros',
  CLEAR: 'Limpar',
} as const;

const WIDTHS = {
  GLOBAL_OPERATOR: 'w-24',
  GROUP_OPERATOR: 'w-20',
  FIELD_SELECT: 'w-[200px]',
  OPERATOR_SELECT: 'w-[180px]',
} as const;

const VALIDATION = {
  INVALID_FILTER_MESSAGE: 'Preencha todos os campos do filtro',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface AdvancedFilterBuilderProps {
  entityType: 'mercados' | 'clientes' | 'concorrentes' | 'leads';
  onApply: (filter: AdvancedFilter) => void;
  onClear: () => void;
}

interface FieldOption {
  value: string;
  label: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isNullOperator(operator: FilterOperator): boolean {
  return NULL_OPERATORS.includes(operator);
}

function isConditionValid(condition: FilterCondition): boolean {
  return !!(
    condition.field &&
    condition.operator &&
    (isNullOperator(condition.operator) || condition.value)
  );
}

function isGroupValid(group: FilterGroup): boolean {
  return group.conditions.every(isConditionValid);
}

function isFilterValid(filter: AdvancedFilter): boolean {
  return filter.groups.every(isGroupValid);
}

function getFieldsForEntity(entityType: string): FieldOption[] {
  return ENTITY_FIELDS[entityType] || [];
}

function getOperatorsForField(field: string): FilterOperator[] {
  return FIELD_OPERATORS[field] || [];
}

function createDefaultFilter(): AdvancedFilter {
  return {
    groups: [
      {
        conditions: [{ ...DEFAULT_CONDITION }],
        logicalOperator: DEFAULT_GROUP.logicalOperator,
      },
    ],
    globalOperator: DEFAULT_FILTER.globalOperator,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdvancedFilterBuilder({
  entityType,
  onApply,
  onClear,
}: AdvancedFilterBuilderProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [filter, setFilter] = useState<AdvancedFilter>(createDefaultFilter());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const fields = useMemo(
    () => getFieldsForEntity(entityType),
    [entityType]
  );

  const canRemoveGroup = useMemo(
    () => filter.groups.length > 1,
    [filter.groups.length]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const addGroup = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          conditions: [{ ...DEFAULT_CONDITION }],
          logicalOperator: DEFAULT_GROUP.logicalOperator,
        },
      ],
    }));
  }, []);

  const removeGroup = useCallback((groupIndex: number) => {
    setFilter((prev) => {
      if (prev.groups.length === 1) return prev;
      return {
        ...prev,
        groups: prev.groups.filter((_, i) => i !== groupIndex),
      };
    });
  }, []);

  const addCondition = useCallback((groupIndex: number) => {
    setFilter((prev) => {
      const newGroups = [...prev.groups];
      newGroups[groupIndex].conditions.push({ ...DEFAULT_CONDITION });
      return { ...prev, groups: newGroups };
    });
  }, []);

  const removeCondition = useCallback(
    (groupIndex: number, conditionIndex: number) => {
      setFilter((prev) => {
        const newGroups = [...prev.groups];
        if (newGroups[groupIndex].conditions.length === 1) return prev;
        newGroups[groupIndex].conditions = newGroups[
          groupIndex
        ].conditions.filter((_, i) => i !== conditionIndex);
        return { ...prev, groups: newGroups };
      });
    },
    []
  );

  const updateCondition = useCallback(
    (
      groupIndex: number,
      conditionIndex: number,
      updates: Partial<FilterCondition>
    ) => {
      setFilter((prev) => {
        const newGroups = [...prev.groups];
        newGroups[groupIndex].conditions[conditionIndex] = {
          ...newGroups[groupIndex].conditions[conditionIndex],
          ...updates,
        };
        return { ...prev, groups: newGroups };
      });
    },
    []
  );

  const updateGroupOperator = useCallback(
    (groupIndex: number, operator: LogicalOperator) => {
      setFilter((prev) => {
        const newGroups = [...prev.groups];
        newGroups[groupIndex].logicalOperator = operator;
        return { ...prev, groups: newGroups };
      });
    },
    []
  );

  const updateGlobalOperator = useCallback((operator: LogicalOperator) => {
    setFilter((prev) => ({ ...prev, globalOperator: operator }));
  }, []);

  const handleApply = useCallback(() => {
    if (!isFilterValid(filter)) {
      toast.error(VALIDATION.INVALID_FILTER_MESSAGE);
      return;
    }
    onApply(filter);
  }, [filter, onApply]);

  const handleClear = useCallback(() => {
    setFilter(createDefaultFilter());
    onClear();
  }, [onClear]);

  const handleFieldChange = useCallback(
    (groupIndex: number, conditionIndex: number, value: string) => {
      updateCondition(groupIndex, conditionIndex, { field: value });
    },
    [updateCondition]
  );

  const handleOperatorChange = useCallback(
    (groupIndex: number, conditionIndex: number, value: FilterOperator) => {
      updateCondition(groupIndex, conditionIndex, { operator: value });
    },
    [updateCondition]
  );

  const handleValueChange = useCallback(
    (
      groupIndex: number,
      conditionIndex: number,
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      updateCondition(groupIndex, conditionIndex, { value: e.target.value });
    },
    [updateCondition]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLogicalOperatorSelect = useCallback(
    (value: LogicalOperator, onChange: (value: LogicalOperator) => void, width: string) => (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={width}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={LOGICAL_OPERATORS.AND}>
            {LOGICAL_OPERATOR_LABELS.AND}
          </SelectItem>
          <SelectItem value={LOGICAL_OPERATORS.OR}>
            {LOGICAL_OPERATOR_LABELS.OR}
          </SelectItem>
        </SelectContent>
      </Select>
    ),
    []
  );

  const renderFieldSelect = useCallback(
    (
      groupIndex: number,
      conditionIndex: number,
      condition: FilterCondition
    ) => (
      <Select
        value={condition.field}
        onValueChange={(value) =>
          handleFieldChange(groupIndex, conditionIndex, value)
        }
      >
        <SelectTrigger className={WIDTHS.FIELD_SELECT}>
          <SelectValue placeholder={LABELS.FIELD_PLACEHOLDER} />
        </SelectTrigger>
        <SelectContent>
          {fields.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    [fields, handleFieldChange]
  );

  const renderOperatorSelect = useCallback(
    (
      groupIndex: number,
      conditionIndex: number,
      condition: FilterCondition
    ) => {
      const operators = getOperatorsForField(condition.field);
      return (
        <Select
          value={condition.operator}
          onValueChange={(value) =>
            handleOperatorChange(groupIndex, conditionIndex, value as FilterOperator)
          }
          disabled={!condition.field}
        >
          <SelectTrigger className={WIDTHS.OPERATOR_SELECT}>
            <SelectValue placeholder={LABELS.OPERATOR_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    [handleOperatorChange]
  );

  const renderValueInput = useCallback(
    (
      groupIndex: number,
      conditionIndex: number,
      condition: FilterCondition
    ) => {
      if (isNullOperator(condition.operator)) return null;

      return (
        <Input
          placeholder={LABELS.VALUE_PLACEHOLDER}
          value={condition.value || ''}
          onChange={(e) => handleValueChange(groupIndex, conditionIndex, e)}
          className="flex-1"
        />
      );
    },
    [handleValueChange]
  );

  const renderCondition = useCallback(
    (
      group: FilterGroup,
      groupIndex: number,
      condition: FilterCondition,
      conditionIndex: number
    ) => {
      const canRemoveCondition = group.conditions.length > 1;

      return (
        <div key={conditionIndex} className="flex items-center gap-2">
          {conditionIndex > 0 &&
            renderLogicalOperatorSelect(
              group.logicalOperator,
              (value) => updateGroupOperator(groupIndex, value),
              WIDTHS.GROUP_OPERATOR
            )}

          {renderFieldSelect(groupIndex, conditionIndex, condition)}
          {renderOperatorSelect(groupIndex, conditionIndex, condition)}
          {renderValueInput(groupIndex, conditionIndex, condition)}

          {canRemoveCondition && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCondition(groupIndex, conditionIndex)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    },
    [
      renderLogicalOperatorSelect,
      renderFieldSelect,
      renderOperatorSelect,
      renderValueInput,
      updateGroupOperator,
      removeCondition,
    ]
  );

  const renderGroup = useCallback(
    (group: FilterGroup, groupIndex: number) => (
      <div key={groupIndex} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{LABELS.GROUP_LABEL(groupIndex)}</Badge>
          {canRemoveGroup && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeGroup(groupIndex)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {group.conditions.map((condition, conditionIndex) =>
          renderCondition(group, groupIndex, condition, conditionIndex)
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => addCondition(groupIndex)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {LABELS.ADD_CONDITION}
        </Button>
      </div>
    ),
    [canRemoveGroup, removeGroup, addCondition, renderCondition]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{LABELS.TITLE}</CardTitle>
        <CardDescription>{LABELS.DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Operator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {LABELS.COMBINE_GROUPS}
          </span>
          {renderLogicalOperatorSelect(
            filter.globalOperator,
            updateGlobalOperator,
            WIDTHS.GLOBAL_OPERATOR
          )}
        </div>

        {/* Filter Groups */}
        <div className="space-y-4">{filter.groups.map(renderGroup)}</div>

        <Button variant="outline" onClick={addGroup} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {LABELS.ADD_GROUP}
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            {LABELS.APPLY_FILTERS}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            {LABELS.CLEAR}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
