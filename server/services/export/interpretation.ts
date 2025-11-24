/**
 * Interpretation Service
 * Interpreta queries de exportação e converte para SQL
 */

export interface ExportQuery {
  entity: "mercados" | "clientes" | "concorrentes" | "leads" | "produtos";
  projectId?: number;
  pesquisaId?: number;
  filters?: Record<string, any>;
  fields?: string[];
  orderBy?: string;
  limit?: number;
}

export interface InterpretedQuery {
  sql: string;
  params: any[];
  fields: string[];
  entity: string;
}

export function interpretExportQuery(query: ExportQuery): InterpretedQuery {
  const {
    entity,
    projectId,
    pesquisaId,
    filters = {},
    fields,
    orderBy,
    limit,
  } = query;

  const defaultFields: Record<string, string[]> = {
    mercados: ["id", "nome", "segmentacao", "categoria", "createdAt"],
    clientes: [
      "id",
      "nome",
      "cnpj",
      "email",
      "telefone",
      "qualidadeScore",
      "validationStatus",
    ],
    concorrentes: [
      "id",
      "nome",
      "cnpj",
      "site",
      "qualidadeScore",
      "validationStatus",
    ],
    leads: [
      "id",
      "nome",
      "email",
      "telefone",
      "cargo",
      "qualidadeScore",
      "validationStatus",
    ],
    produtos: ["id", "nome", "categoria", "preco", "descricao"],
  };

  const selectedFields =
    fields && fields.length > 0 ? fields : defaultFields[entity] || ["*"];

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (projectId !== undefined) {
    whereClauses.push("projectId = ?");
    params.push(projectId);
  }

  if (pesquisaId !== undefined) {
    whereClauses.push("pesquisaId = ?");
    params.push(pesquisaId);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      whereClauses.push(`${key} = ?`);
      params.push(value);
    }
  });

  let sql = `SELECT ${selectedFields.join(", ")} FROM ${entity}`;

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`;
  }

  if (limit) {
    sql += ` LIMIT ${limit}`;
  }

  return { sql, params, fields: selectedFields, entity };
}

export function validateExportQuery(query: ExportQuery): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!query.entity) {
    errors.push("Entity é obrigatório");
  }

  const validEntities = [
    "mercados",
    "clientes",
    "concorrentes",
    "leads",
    "produtos",
  ];
  if (query.entity && !validEntities.includes(query.entity)) {
    errors.push(
      `Entity inválida. Deve ser uma de: ${validEntities.join(", ")}`
    );
  }

  return { valid: errors.length === 0, errors };
}
