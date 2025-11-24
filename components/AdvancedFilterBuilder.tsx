'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Search } from "lucide-react";
import type {
  AdvancedFilter,
  FilterCondition,
  FilterGroup,
  LogicalOperator,
  FilterOperator,
} from "@shared/advancedFilters";
import { FIELD_OPERATORS, OPERATOR_LABELS } from "@shared/advancedFilters";

interface AdvancedFilterBuilderProps {
  entityType: "mercados" | "clientes" | "concorrentes" | "leads";
  onApply: (filter: AdvancedFilter) => void;
  onClear: () => void;
}

// Campos disponíveis por tipo de entidade
const ENTITY_FIELDS: Record<string, Array<{ value: string; label: string }>> = {
  leads: [
    { value: "nome", label: "Nome" },
    { value: "tipo", label: "Tipo" },
    { value: "porte", label: "Porte" },
    { value: "regiao", label: "Região" },
    { value: "setor", label: "Setor" },
    { value: "qualidadeScore", label: "Score de Qualidade" },
    { value: "stage", label: "Estágio" },
    { value: "validationStatus", label: "Status de Validação" },
  ],
  clientes: [
    { value: "nome", label: "Nome" },
    { value: "cnpj", label: "CNPJ" },
    { value: "porte", label: "Porte" },
    { value: "segmentacaoB2bB2c", label: "Segmentação" },
    { value: "qualidadeScore", label: "Score de Qualidade" },
    { value: "validationStatus", label: "Status de Validação" },
  ],
  concorrentes: [
    { value: "nome", label: "Nome" },
    { value: "cnpj", label: "CNPJ" },
    { value: "porte", label: "Porte" },
    { value: "produto", label: "Produto" },
    { value: "validationStatus", label: "Status de Validação" },
  ],
  mercados: [
    { value: "nome", label: "Nome" },
    { value: "segmentacao", label: "Segmentação" },
    { value: "categoria", label: "Categoria" },
    { value: "quantidadeClientes", label: "Quantidade de Clientes" },
  ],
};

export function AdvancedFilterBuilder({
  entityType,
  onApply,
  onClear,
}: AdvancedFilterBuilderProps) {
  const [filter, setFilter] = useState<AdvancedFilter>({
    groups: [
      {
        conditions: [{ field: "", operator: "eq", value: "" }],
        logicalOperator: "AND",
      },
    ],
    globalOperator: "AND",
  });

  const fields = ENTITY_FIELDS[entityType] || [];

  const addGroup = () => {
    setFilter({
      ...filter,
      groups: [
        ...filter.groups,
        {
          conditions: [{ field: "", operator: "eq", value: "" }],
          logicalOperator: "AND",
        },
      ],
    });
  };

  const removeGroup = (groupIndex: number) => {
    if (filter.groups.length === 1) return;
    setFilter({
      ...filter,
      groups: filter.groups.filter((_, i) => i !== groupIndex),
    });
  };

  const addCondition = (groupIndex: number) => {
    const newGroups = [...filter.groups];
    newGroups[groupIndex].conditions.push({
      field: "",
      operator: "eq",
      value: "",
    });
    setFilter({ ...filter, groups: newGroups });
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const newGroups = [...filter.groups];
    if (newGroups[groupIndex].conditions.length === 1) return;
    newGroups[groupIndex].conditions = newGroups[groupIndex].conditions.filter(
      (_, i) => i !== conditionIndex
    );
    setFilter({ ...filter, groups: newGroups });
  };

  const updateCondition = (
    groupIndex: number,
    conditionIndex: number,
    updates: Partial<FilterCondition>
  ) => {
    const newGroups = [...filter.groups];
    newGroups[groupIndex].conditions[conditionIndex] = {
      ...newGroups[groupIndex].conditions[conditionIndex],
      ...updates,
    };
    setFilter({ ...filter, groups: newGroups });
  };

  const updateGroupOperator = (
    groupIndex: number,
    operator: LogicalOperator
  ) => {
    const newGroups = [...filter.groups];
    newGroups[groupIndex].logicalOperator = operator;
    setFilter({ ...filter, groups: newGroups });
  };

  const handleApply = () => {
    // Validar que todos os campos estão preenchidos
    const isValid = filter.groups.every(group =>
      group.conditions.every(
        c =>
          c.field &&
          c.operator &&
          (c.operator === "isNull" || c.operator === "isNotNull" || c.value)
      )
    );

    if (!isValid) {
      alert("Preencha todos os campos do filtro");
      return;
    }

    onApply(filter);
  };

  const handleClear = () => {
    setFilter({
      groups: [
        {
          conditions: [{ field: "", operator: "eq", value: "" }],
          logicalOperator: "AND",
        },
      ],
      globalOperator: "AND",
    });
    onClear();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros Avançados</CardTitle>
        <CardDescription>
          Construa filtros complexos combinando múltiplas condições
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Operator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Combinar grupos com:
          </span>
          <Select
            value={filter.globalOperator}
            onValueChange={value =>
              setFilter({ ...filter, globalOperator: value as LogicalOperator })
            }
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">E</SelectItem>
              <SelectItem value="OR">OU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Groups */}
        <div className="space-y-4">
          {filter.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Grupo {groupIndex + 1}</Badge>
                {filter.groups.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGroup(groupIndex)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Conditions */}
              {group.conditions.map((condition, conditionIndex) => (
                <div key={conditionIndex} className="flex items-center gap-2">
                  {conditionIndex > 0 && (
                    <Select
                      value={group.logicalOperator}
                      onValueChange={value =>
                        updateGroupOperator(
                          groupIndex,
                          value as LogicalOperator
                        )
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">E</SelectItem>
                        <SelectItem value="OR">OU</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Select
                    value={condition.field}
                    onValueChange={value =>
                      updateCondition(groupIndex, conditionIndex, {
                        field: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione o campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(f => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={value =>
                      updateCondition(groupIndex, conditionIndex, {
                        operator: value as FilterOperator,
                      })
                    }
                    disabled={!condition.field}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {condition.field &&
                        FIELD_OPERATORS[condition.field]?.map(op => (
                          <SelectItem key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {condition.operator !== "isNull" &&
                    condition.operator !== "isNotNull" && (
                      <Input
                        placeholder="Valor"
                        value={condition.value || ""}
                        onChange={e =>
                          updateCondition(groupIndex, conditionIndex, {
                            value: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                    )}

                  {group.conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeCondition(groupIndex, conditionIndex)
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => addCondition(groupIndex)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Condição
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addGroup} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Grupo
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
