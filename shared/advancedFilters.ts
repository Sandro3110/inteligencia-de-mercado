/**
 * Sistema de Filtros Avançados
 * Permite construir queries dinâmicas com múltiplos critérios e operadores
 */

export type FilterOperator = 
  | 'eq'        // igual
  | 'ne'        // diferente
  | 'gt'        // maior que
  | 'lt'        // menor que
  | 'gte'       // maior ou igual
  | 'lte'       // menor ou igual
  | 'contains'  // contém (texto)
  | 'startsWith'// começa com
  | 'endsWith'  // termina com
  | 'in'        // está em (array)
  | 'notIn'     // não está em (array)
  | 'isNull'    // é nulo
  | 'isNotNull';// não é nulo

export type LogicalOperator = 'AND' | 'OR';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface FilterGroup {
  conditions: FilterCondition[];
  logicalOperator: LogicalOperator;
}

export interface AdvancedFilter {
  groups: FilterGroup[];
  globalOperator: LogicalOperator; // Como combinar os grupos
}

export interface SavedFilter {
  id: number;
  userId: string;
  name: string;
  entityType: 'mercados' | 'clientes' | 'concorrentes' | 'leads';
  filter: AdvancedFilter;
  createdAt: Date;
}

// Mapeamento de campos para operadores permitidos
export const FIELD_OPERATORS: Record<string, FilterOperator[]> = {
  // Campos de texto
  nome: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'isNull', 'isNotNull'],
  cnpj: ['eq', 'ne', 'contains', 'isNull', 'isNotNull'],
  site: ['eq', 'ne', 'contains', 'isNull', 'isNotNull'],
  email: ['eq', 'ne', 'contains', 'isNull', 'isNotNull'],
  
  // Campos numéricos
  qualidadeScore: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'isNull', 'isNotNull'],
  quantidadeClientes: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte'],
  
  // Campos enum/categoria
  porte: ['eq', 'ne', 'in', 'notIn', 'isNull', 'isNotNull'],
  segmentacao: ['eq', 'ne', 'in', 'notIn', 'isNull', 'isNotNull'],
  tipo: ['eq', 'ne', 'in', 'notIn', 'isNull', 'isNotNull'],
  stage: ['eq', 'ne', 'in', 'notIn'],
  validationStatus: ['eq', 'ne', 'in', 'notIn'],
  
  // Campos de data
  createdAt: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte'],
};

// Labels amigáveis para operadores
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'é igual a',
  ne: 'é diferente de',
  gt: 'é maior que',
  lt: 'é menor que',
  gte: 'é maior ou igual a',
  lte: 'é menor ou igual a',
  contains: 'contém',
  startsWith: 'começa com',
  endsWith: 'termina com',
  in: 'está em',
  notIn: 'não está em',
  isNull: 'está vazio',
  isNotNull: 'não está vazio',
};
