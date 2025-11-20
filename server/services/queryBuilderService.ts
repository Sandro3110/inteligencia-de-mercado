import { ExtractedEntities } from "./interpretationService";
import { getDb } from "../db";

/**
 * Configuração de filtros para query
 */
export interface QueryFilters {
  table: string;
  where: WhereClause[];
  joins: JoinClause[];
  orderBy?: OrderByClause[];
  limit?: number;
  projectId?: string;
}

export interface WhereClause {
  field: string;
  operator: '=' | '>' | '<' | '>=' | '<=' | 'IN' | 'LIKE' | 'BETWEEN';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface JoinClause {
  type: 'INNER' | 'LEFT' | 'RIGHT';
  table: string;
  on: string;
}

export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Configuração de relacionamentos
 */
export interface RelationshipConfig {
  table: string;
  foreignKey: string;
  primaryKey: string;
  field: string;
  alias: string;
  mode: 'single_column' | 'separate_rows' | 'separate_file';
  required: boolean;
}

/**
 * Resultado da validação de filtros
 */
export interface ValidationResult {
  isValid: boolean;
  estimatedRecords: number;
  estimatedSize: number; // bytes
  warnings: string[];
  errors: string[];
}

/**
 * Serviço de construção dinâmica de queries SQL
 */
export class QueryBuilderService {
  private readonly MAX_RECORDS = 50000;
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  /**
   * Converte entidades extraídas em filtros de query
   */
  entitiesToFilters(entities: ExtractedEntities, projectId?: string): QueryFilters {
    const table = this.getTableName(entities.entityType);
    const where: WhereClause[] = [];
    const joins: JoinClause[] = [];

    // Filtro de projeto
    if (projectId) {
      where.push({
        field: `${table}.projectId`,
        operator: '=',
        value: projectId,
        logicalOperator: 'AND'
      });
    }

    // Filtros geográficos
    if (entities.geography?.states && entities.geography.states.length > 0) {
      where.push({
        field: `${table}.uf`,
        operator: 'IN',
        value: entities.geography.states,
        logicalOperator: 'AND'
      });
    }

    if (entities.geography?.cities && entities.geography.cities.length > 0) {
      where.push({
        field: `${table}.cidade`,
        operator: 'IN',
        value: entities.geography.cities,
        logicalOperator: 'AND'
      });
    }

    // Filtros de qualidade
    if (entities.quality?.minScore) {
      where.push({
        field: `${table}.quality_score`,
        operator: '>=',
        value: entities.quality.minScore,
        logicalOperator: 'AND'
      });
    }

    if (entities.quality?.status && entities.quality.status.length > 0) {
      where.push({
        field: `${table}.status`,
        operator: 'IN',
        value: entities.quality.status,
        logicalOperator: 'AND'
      });
    }

    // Filtros de porte
    if (entities.size?.porte && entities.size.porte.length > 0) {
      where.push({
        field: `${table}.porte`,
        operator: 'IN',
        value: entities.size.porte,
        logicalOperator: 'AND'
      });
    }

    if (entities.size?.revenue?.min) {
      where.push({
        field: `${table}.faturamento_estimado`,
        operator: '>=',
        value: entities.size.revenue.min,
        logicalOperator: 'AND'
      });
    }

    if (entities.size?.revenue?.max) {
      where.push({
        field: `${table}.faturamento_estimado`,
        operator: '<=',
        value: entities.size.revenue.max,
        logicalOperator: 'AND'
      });
    }

    // Filtros de segmentação
    if (entities.segmentation?.type && entities.segmentation.type.length > 0) {
      where.push({
        field: `${table}.segmentacao`,
        operator: 'IN',
        value: entities.segmentation.type,
        logicalOperator: 'AND'
      });
    }

    // Filtros temporais
    if (entities.temporal?.createdAfter) {
      where.push({
        field: `${table}.createdAt`,
        operator: '>=',
        value: entities.temporal.createdAfter,
        logicalOperator: 'AND'
      });
    }

    if (entities.temporal?.createdBefore) {
      where.push({
        field: `${table}.createdAt`,
        operator: '<=',
        value: entities.temporal.createdBefore,
        logicalOperator: 'AND'
      });
    }

    if (entities.temporal?.updatedWithin) {
      const date = new Date();
      date.setDate(date.getDate() - entities.temporal.updatedWithin);
      where.push({
        field: `${table}.updatedAt`,
        operator: '>=',
        value: date,
        logicalOperator: 'AND'
      });
    }

    // Keywords (busca em múltiplos campos)
    if (entities.keywords.length > 0) {
      const keywordConditions = entities.keywords.map(keyword => {
        return `(${table}.nome LIKE '%${this.sanitizeValue(keyword)}%' OR ${table}.descricao LIKE '%${this.sanitizeValue(keyword)}%')`;
      }).join(' OR ');

      // Adiciona como condição OR agrupada
      where.push({
        field: 'keywords',
        operator: 'LIKE',
        value: keywordConditions,
        logicalOperator: 'AND'
      } as any);
    }

    return {
      table,
      where,
      joins,
      orderBy: [{ field: `${table}.id`, direction: 'ASC' }],
      projectId
    };
  }

  /**
   * Valida filtros e estima volume de dados
   */
  async validate(filters: QueryFilters): Promise<ValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Estima número de registros
    const estimatedRecords = await this.estimateRecordCount(filters);

    // Valida limite de registros
    if (estimatedRecords > this.MAX_RECORDS) {
      errors.push(`Número de registros excede o limite (${estimatedRecords} > ${this.MAX_RECORDS}). Adicione mais filtros.`);
    }

    // Estima tamanho do arquivo
    const avgRecordSize = 2048; // 2KB por registro (estimativa)
    const estimatedSize = estimatedRecords * avgRecordSize;

    // Valida tamanho do arquivo
    if (estimatedSize > this.MAX_FILE_SIZE) {
      warnings.push(`Arquivo estimado é grande (${(estimatedSize / 1024 / 1024).toFixed(1)} MB). Considere adicionar filtros.`);
    }

    // Valida se há filtros
    if (filters.where.length === 0) {
      warnings.push('Nenhum filtro aplicado - exportação incluirá todos os registros da tabela');
    }

    return {
      isValid: errors.length === 0,
      estimatedRecords,
      estimatedSize,
      warnings,
      errors
    };
  }

  /**
   * Constrói query SQL completa
   */
  build(
    filters: QueryFilters,
    selectedFields: string[],
    relationships?: RelationshipConfig[]
  ): string {
    const select = this.buildSelect(filters.table, selectedFields, relationships);
    const from = `FROM ${filters.table}`;
    const joins = this.buildJoins(filters.joins, relationships);
    const where = this.buildWhere(filters.where);
    const orderBy = this.buildOrderBy(filters.orderBy);
    const limit = filters.limit ? `LIMIT ${filters.limit}` : '';

    return `${select} ${from} ${joins} ${where} ${orderBy} ${limit}`.trim();
  }

  /**
   * Executa query e retorna resultados
   */
  async execute(query: string): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const result: any = await db.execute(query);
      return result || [];
    } catch (error) {
      console.error('[QueryBuilderService] Erro ao executar query:', error);
      throw error;
    }
  }

  /**
   * Carrega dados relacionados em paralelo
   */
  async loadRelationships(
    mainRecords: any[],
    relationships: RelationshipConfig[]
  ): Promise<any[]> {
    if (!relationships || relationships.length === 0) {
      return mainRecords;
    }

    const db = await getDb();
    if (!db) return mainRecords;

    try {
      // Extrai IDs principais
      const mainIds = mainRecords.map(r => r.id);

      // Executa queries de relacionamento em paralelo
      const relationshipPromises = relationships.map(async rel => {
        const query = `
          SELECT * FROM ${rel.table}
          WHERE ${rel.foreignKey} IN (${mainIds.join(',')})
        `;
        const result: any = await db.execute(query);
        return { alias: rel.alias, data: result || [], config: rel };
      });

      const relationshipResults = await Promise.all(relationshipPromises);

      // Mescla resultados
      return mainRecords.map(record => {
        const enriched = { ...record };

        relationshipResults.forEach(({ alias, data, config }) => {
          const related = data.filter(
            (r: any) => r[config.foreignKey] === record.id
          );

          if (config.mode === 'single_column') {
            // Concatena em string
            enriched[alias] = related.map((r: any) => r[config.field]).join('; ');
          } else {
            // Mantém array
            enriched[alias] = related;
          }
        });

        return enriched;
      });
    } catch (error) {
      console.error('[QueryBuilderService] Erro ao carregar relacionamentos:', error);
      return mainRecords;
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private getTableName(entityType: string): string {
    const tableMap: Record<string, string> = {
      mercados: 'mercados',
      clientes: 'clientes',
      concorrentes: 'concorrentes',
      leads: 'leads',
      produtos: 'produtos_cliente'
    };
    return tableMap[entityType] || 'clientes';
  }

  private async estimateRecordCount(filters: QueryFilters): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    try {
      const countQuery = `SELECT COUNT(*) as count FROM ${filters.table} ${this.buildWhere(filters.where)}`;
      const result: any = await db.execute(countQuery);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('[QueryBuilderService] Erro ao estimar registros:', error);
      return 0;
    }
  }

  private buildSelect(
    table: string,
    selectedFields: string[],
    relationships?: RelationshipConfig[]
  ): string {
    const fields = selectedFields.map(field => `${table}.${field}`);

    // Adiciona campos de relacionamentos em modo single_column
    if (relationships) {
      relationships.forEach(rel => {
        if (rel.mode === 'single_column') {
          fields.push(`GROUP_CONCAT(${rel.table}.${rel.field} SEPARATOR '; ') AS ${rel.alias}`);
        }
      });
    }

    return `SELECT ${fields.join(', ')}`;
  }

  private buildJoins(
    joins: JoinClause[],
    relationships?: RelationshipConfig[]
  ): string {
    const joinStrings: string[] = [];

    // Joins explícitos
    joins.forEach(join => {
      joinStrings.push(`${join.type} JOIN ${join.table} ON ${join.on}`);
    });

    // Joins de relacionamentos
    if (relationships) {
      relationships.forEach(rel => {
        if (rel.mode === 'single_column' || rel.mode === 'separate_rows') {
          const joinType = rel.required ? 'INNER' : 'LEFT';
          joinStrings.push(
            `${joinType} JOIN ${rel.table} ON ${rel.table}.${rel.primaryKey} = ${rel.foreignKey}`
          );
        }
      });
    }

    return joinStrings.join(' ');
  }

  private buildWhere(clauses: WhereClause[]): string {
    if (clauses.length === 0) return '';

    const conditions: string[] = [];

    clauses.forEach((clause, index) => {
      const logical = index === 0 ? '' : (clause.logicalOperator || 'AND');
      let condition = '';

      switch (clause.operator) {
        case 'IN':
          const values = Array.isArray(clause.value) ? clause.value : [clause.value];
          const quotedValues = values.map(v => `'${this.sanitizeValue(v)}'`).join(', ');
          condition = `${clause.field} IN (${quotedValues})`;
          break;

        case 'LIKE':
          // Se já é uma condição complexa (keywords)
          if (clause.field === 'keywords') {
            condition = clause.value;
          } else {
            condition = `${clause.field} LIKE '%${this.sanitizeValue(clause.value)}%'`;
          }
          break;

        case 'BETWEEN':
          if (Array.isArray(clause.value) && clause.value.length === 2) {
            condition = `${clause.field} BETWEEN '${this.sanitizeValue(clause.value[0])}' AND '${this.sanitizeValue(clause.value[1])}'`;
          }
          break;

        default:
          condition = `${clause.field} ${clause.operator} '${this.sanitizeValue(clause.value)}'`;
      }

      conditions.push(index === 0 ? condition : `${logical} ${condition}`);
    });

    return `WHERE ${conditions.join(' ')}`;
  }

  private buildOrderBy(clauses?: OrderByClause[]): string {
    if (!clauses || clauses.length === 0) return '';

    const orderStrings = clauses.map(clause => `${clause.field} ${clause.direction}`);
    return `ORDER BY ${orderStrings.join(', ')}`;
  }

  private sanitizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    
    const str = String(value);
    // Escapa aspas simples e remove caracteres perigosos
    return str.replace(/'/g, "''").replace(/[;\\]/g, '');
  }
}

// Exporta instância singleton
export const queryBuilderService = new QueryBuilderService();
