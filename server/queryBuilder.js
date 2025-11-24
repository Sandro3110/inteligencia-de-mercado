"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDynamicQuery = buildDynamicQuery;
exports.validateFilter = validateFilter;
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Constrói uma condição SQL a partir de um FilterCondition
 */
function buildCondition(table, condition) {
  const { field, operator, value } = condition;
  const column = table[field];
  if (!column) {
    console.warn(`Campo ${field} não encontrado na tabela`);
    return undefined;
  }
  switch (operator) {
    case "eq":
      return (0, drizzle_orm_1.eq)(column, value);
    case "ne":
      return (0, drizzle_orm_1.ne)(column, value);
    case "gt":
      return (0, drizzle_orm_1.gt)(column, value);
    case "lt":
      return (0, drizzle_orm_1.lt)(column, value);
    case "gte":
      return (0, drizzle_orm_1.gte)(column, value);
    case "lte":
      return (0, drizzle_orm_1.lte)(column, value);
    case "contains":
      return (0, drizzle_orm_1.like)(column, `%${value}%`);
    case "startsWith":
      return (0, drizzle_orm_1.like)(column, `${value}%`);
    case "endsWith":
      return (0, drizzle_orm_1.like)(column, `%${value}`);
    case "in":
      return (0, drizzle_orm_1.inArray)(
        column,
        Array.isArray(value) ? value : [value]
      );
    case "notIn":
      return (0, drizzle_orm_1.notInArray)(
        column,
        Array.isArray(value) ? value : [value]
      );
    case "isNull":
      return (0, drizzle_orm_1.isNull)(column);
    case "isNotNull":
      return (0, drizzle_orm_1.isNotNull)(column);
    default:
      console.warn(`Operador ${operator} não suportado`);
      return undefined;
  }
}
/**
 * Constrói um grupo de condições com operador lógico
 */
function buildGroup(table, group) {
  const conditions = group.conditions
    .map(condition => buildCondition(table, condition))
    .filter(c => c !== undefined);
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return group.logicalOperator === "AND"
    ? (0, drizzle_orm_1.and)(...conditions)
    : (0, drizzle_orm_1.or)(...conditions);
}
/**
 * Constrói query SQL completa a partir de AdvancedFilter
 */
function buildDynamicQuery(table, filter) {
  const groups = filter.groups
    .map(group => buildGroup(table, group))
    .filter(g => g !== undefined);
  if (groups.length === 0) return undefined;
  if (groups.length === 1) return groups[0];
  return filter.globalOperator === "AND"
    ? (0, drizzle_orm_1.and)(...groups)
    : (0, drizzle_orm_1.or)(...groups);
}
/**
 * Valida se um filtro é válido
 */
function validateFilter(filter) {
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
      const requiresValue = [
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
