import {
  SQL,
  sql,
  and,
  or,
  eq,
  ne,
  gt,
  lt,
  gte,
  lte,
  like,
  inArray,
  notInArray,
  isNull,
  isNotNull,
} from "drizzle-orm";
import type {
  FilterCondition,
  FilterGroup,
  AdvancedFilter,
  FilterOperator,
} from "../shared/advancedFilters";

/**
 * Constrói uma condição SQL a partir de um FilterCondition
 */
function buildCondition(
  table: any,
  condition: FilterCondition
): SQL | undefined {
  const { field, operator, value } = condition;
  const column = table[field];

  if (!column) {
    console.warn(`Campo ${field} não encontrado na tabela`);
    return undefined;
  }

  switch (operator) {
    case "eq":
      return eq(column, value);

    case "ne":
      return ne(column, value);

    case "gt":
      return gt(column, value);

    case "lt":
      return lt(column, value);

    case "gte":
      return gte(column, value);

    case "lte":
      return lte(column, value);

    case "contains":
      return like(column, `%${value}%`);

    case "startsWith":
      return like(column, `${value}%`);

    case "endsWith":
      return like(column, `%${value}`);

    case "in":
      return inArray(column, Array.isArray(value) ? value : [value]);

    case "notIn":
      return notInArray(column, Array.isArray(value) ? value : [value]);

    case "isNull":
      return isNull(column);

    case "isNotNull":
      return isNotNull(column);

    default:
      console.warn(`Operador ${operator} não suportado`);
      return undefined;
  }
}

/**
 * Constrói um grupo de condições com operador lógico
 */
function buildGroup(table: any, group: FilterGroup): SQL | undefined {
  const conditions = group.conditions
    .map(condition => buildCondition(table, condition))
    .filter((c): c is SQL => c !== undefined);

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];

  return group.logicalOperator === "AND"
    ? and(...conditions)
    : or(...conditions);
}

/**
 * Constrói query SQL completa a partir de AdvancedFilter
 */
export function buildDynamicQuery(
  table: any,
  filter: AdvancedFilter
): SQL | undefined {
  const groups = filter.groups
    .map(group => buildGroup(table, group))
    .filter((g): g is SQL => g !== undefined);

  if (groups.length === 0) return undefined;
  if (groups.length === 1) return groups[0];

  return filter.globalOperator === "AND" ? and(...groups) : or(...groups);
}

/**
 * Valida se um filtro é válido
 */
export function validateFilter(filter: AdvancedFilter): {
  valid: boolean;
  error?: string;
} {
  if (!filter.groups || filter.groups.length === 0) {
    return { valid: false, error: "Filtro deve ter pelo menos um grupo" };
  }

  for (const group of filter.groups) {
    if (!group.conditions || group.conditions.length === 0) {
      return {
        valid: false,
        error: "Cada grupo deve ter pelo menos uma condição",
      };
    }

    for (const condition of group.conditions) {
      if (!condition.field || !condition.operator) {
        return {
          valid: false,
          error: "Cada condição deve ter campo e operador",
        };
      }

      // Validar valor para operadores que requerem valor
      const requiresValue: FilterOperator[] = [
        "eq",
        "ne",
        "gt",
        "lt",
        "gte",
        "lte",
        "contains",
        "startsWith",
        "endsWith",
        "in",
        "notIn",
      ];
      if (
        requiresValue.includes(condition.operator) &&
        condition.value === undefined
      ) {
        return {
          valid: false,
          error: `Operador ${condition.operator} requer um valor`,
        };
      }
    }
  }

  return { valid: true };
}
