"use strict";
/**
 * Sistema de Filtros Avançados
 * Permite construir queries dinâmicas com múltiplos critérios e operadores
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATOR_LABELS = exports.FIELD_OPERATORS = void 0;
// Mapeamento de campos para operadores permitidos
exports.FIELD_OPERATORS = {
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
exports.OPERATOR_LABELS = {
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
