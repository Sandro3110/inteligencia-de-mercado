/**
 * Query Builder Service
 * Constrói queries SQL dinâmicas para exportação
 */

import { getDb } from "../../db";
import { sql } from "drizzle-orm";
import type { InterpretedQuery } from "./interpretation";

export interface QueryBuilderOptions {
  includeMetadata?: boolean;
  formatDates?: boolean;
  includeRelations?: boolean;
}

/**
 * Executa uma query interpretada e retorna os resultados
 */
export async function executeExportQuery(
  interpretedQuery: InterpretedQuery,
  options: QueryBuilderOptions = {}
): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { sql: rawSql, params } = interpretedQuery;
  // Substituir placeholders manualmente
  let finalSql = rawSql;
  params.forEach(param => {
    finalSql = finalSql.replace(
      "?",
      typeof param === "string" ? `'${param}'` : String(param)
    );
  });
  const query = sql.raw(finalSql);
  const results: unknown = await db.execute(query);

  if (options.formatDates) {
    // @ts-ignore - TODO: Fix TypeScript error
    return results.map((row: unknown) => formatDatesInRow(row));
  }

  // @ts-ignore - TODO: Fix TypeScript error
  return results;
}

/**
 * Formata datas em um objeto para formato legível
 */
function formatDatesInRow(row: unknown): Record<string, unknown> {
  // @ts-ignore - TODO: Fix TypeScript error
  const formatted = { ...row };

  Object.keys(formatted).forEach(key => {
    if (formatted[key] instanceof Date) {
      formatted[key] = formatted[key].toISOString().split("T")[0];
    }
  });

  return formatted;
}

/**
 * Conta o total de registros que serão exportados
 */
export async function countExportRecords(
  interpretedQuery: InterpretedQuery
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { sql: rawSql, params } = interpretedQuery;
  let countSql = rawSql
    .replace(/SELECT .+ FROM/, "SELECT COUNT(*) as total FROM")
    .replace(/ORDER BY.+/, "")
    .replace(/LIMIT.+/, "");

  // Substituir placeholders manualmente
  params.forEach(param => {
    countSql = countSql.replace(
      "?",
      typeof param === "string" ? `'${param}'` : String(param)
    );
  });

  const query = sql.raw(countSql);
  const result: unknown = await db.execute(query);
  // @ts-ignore - TODO: Fix TypeScript error
  return result[0]?.total || 0;
}

/**
 * Constrói query com paginação
 */
export function buildPaginatedQuery(
  interpretedQuery: InterpretedQuery,
  page: number,
  pageSize: number
): InterpretedQuery {
  const offset = (page - 1) * pageSize;
  const sql = `${interpretedQuery.sql} LIMIT ${pageSize} OFFSET ${offset}`;

  return {
    ...interpretedQuery,
    sql,
  };
}
