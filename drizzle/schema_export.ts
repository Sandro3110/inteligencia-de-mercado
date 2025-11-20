import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Histórico de exportações realizadas pelos usuários
 */
export const exportHistory = mysqlTable('export_history', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  context: text('context'),                    // Contexto original em linguagem natural
  filters: json('filters'),                    // Filtros aplicados (JSON)
  format: mysqlEnum('format', ['csv', 'excel', 'pdf', 'json']).notNull(),
  outputType: mysqlEnum('outputType', ['simple', 'complete', 'report']).notNull(),
  recordCount: int('recordCount').notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileSize: int('fileSize').notNull(),         // Bytes
  generationTime: int('generationTime'),       // Segundos
  createdAt: timestamp('createdAt').defaultNow()
});

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = typeof exportHistory.$inferInsert;

/**
 * Filtros salvos pelos usuários para reutilização
 */
export const savedFilters = mysqlTable('saved_filters', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  filters: json('filters').notNull(),          // Estrutura de filtros (JSON)
  isPublic: boolean('isPublic').default(false),
  shareToken: varchar('shareToken', { length: 64 }),
  usageCount: int('usageCount').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

/**
 * Templates de relatórios (sistema e customizados)
 */
export const exportTemplates = mysqlTable('export_templates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  templateType: mysqlEnum('templateType', ['market', 'client', 'competitive', 'lead']).notNull(),
  config: json('config').notNull(),            // Configuração do template (JSON)
  isSystem: boolean('isSystem').default(false), // Template do sistema ou customizado
  userId: varchar('userId', { length: 64 }),   // Null se for template do sistema
  usageCount: int('usageCount').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export type ExportTemplate = typeof exportTemplates.$inferSelect;
export type InsertExportTemplate = typeof exportTemplates.$inferInsert;

/**
 * Cache de interpretações de contexto (otimização)
 */
export const interpretationCache = mysqlTable('interpretation_cache', {
  id: varchar('id', { length: 64 }).primaryKey(),
  inputHash: varchar('inputHash', { length: 64 }).notNull().unique(),
  input: text('input').notNull(),
  interpretation: json('interpretation').notNull(),
  hitCount: int('hitCount').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  expiresAt: timestamp('expiresAt').notNull()
});

export type InterpretationCache = typeof interpretationCache.$inferSelect;
export type InsertInterpretationCache = typeof interpretationCache.$inferInsert;

/**
 * Cache de queries executadas (otimização)
 */
export const queryCache = mysqlTable('query_cache', {
  id: varchar('id', { length: 64 }).primaryKey(),
  queryHash: varchar('queryHash', { length: 64 }).notNull().unique(),
  query: text('query').notNull(),
  results: json('results').notNull(),
  recordCount: int('recordCount').notNull(),
  hitCount: int('hitCount').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  expiresAt: timestamp('expiresAt').notNull()
});

export type QueryCache = typeof queryCache.$inferSelect;
export type InsertQueryCache = typeof queryCache.$inferInsert;
