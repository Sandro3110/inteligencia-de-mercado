import { mysqlTable, int, varchar, text, timestamp, index } from "drizzle-orm/mysql-core";

/**
 * Tabela para registrar chamadas de API e monitorar saúde
 */
export const apiHealthLog = mysqlTable("api_health_log", {
  id: int().autoincrement().primaryKey(),
  apiName: varchar({ length: 50 }).notNull(), // 'openai', 'serpapi', 'receitaws'
  status: varchar({ length: 20 }).notNull(), // 'success', 'error', 'timeout'
  responseTime: int().notNull(), // tempo em ms
  errorMessage: text(), // mensagem de erro se houver
  endpoint: varchar({ length: 255 }), // endpoint específico chamado
  requestData: text(), // dados da requisição (opcional, para debug)
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_api_name").on(table.apiName),
  index("idx_status").on(table.status),
  index("idx_created_at").on(table.createdAt),
]);

export type APIHealthLog = typeof apiHealthLog.$inferSelect;
export type InsertAPIHealthLog = typeof apiHealthLog.$inferInsert;
