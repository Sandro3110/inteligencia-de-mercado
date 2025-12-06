import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums PostgreSQL
export const formatEnum = pgEnum("format", ["csv", "excel", "pdf", "json"]);
export const outputTypeEnum = pgEnum("output_type", ["simple", "complete", "report"]);
export const templateTypeEnum = pgEnum("template_type", ["market", "client", "competitive", "lead"]);

/**
 * Histórico de exportações realizadas pelos usuários
 */
export const exportHistory = pgTable("export_history", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  context: text("context"), // Contexto original em linguagem natural
  filters: json("filters"), // Filtros aplicados (JSON)
  format: formatEnum("format").notNull(),
  outputType: outputTypeEnum("outputType").notNull(),
  recordCount: integer("recordCount").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: integer("fileSize").notNull(), // Bytes
  generationTime: integer("generationTime"), // Segundos
  createdAt: timestamp("createdAt").default(sql`now()`),
});

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = typeof exportHistory.$inferInsert;

/**
 * Filtros salvos pelos usuários para reutilização
 */
export const savedFilters = pgTable("saved_filters", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  filters: json("filters").notNull(), // Estrutura de filtros (JSON)
  isPublic: boolean("isPublic").default(false),
  shareToken: varchar("shareToken", { length: 64 }),
  usageCount: integer("usageCount").default(0),
  createdAt: timestamp("createdAt").default(sql`now()`),
  updatedAt: timestamp("updatedAt").default(sql`now()`),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

/**
 * Templates de relatórios (sistema e customizados)
 */
export const exportTemplates = pgTable("export_templates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateType: templateTypeEnum("templateType").notNull(),
  config: json("config").notNull(), // Configuração do template (JSON)
  isSystem: boolean("isSystem").default(false), // Template do sistema ou customizado
  userId: varchar("userId", { length: 64 }), // Null se for template do sistema
  usageCount: integer("usageCount").default(0),
  createdAt: timestamp("createdAt").default(sql`now()`),
  updatedAt: timestamp("updatedAt").default(sql`now()`),
});

export type ExportTemplate = typeof exportTemplates.$inferSelect;
export type InsertExportTemplate = typeof exportTemplates.$inferInsert;

/**
 * Cache de interpretações de contexto (otimização)
 */
export const interpretationCache = pgTable("interpretation_cache", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inputHash: varchar("inputHash", { length: 64 }).notNull().unique(),
  input: text("input").notNull(),
  interpretation: json("interpretation").notNull(),
  hitCount: integer("hitCount").default(0),
  createdAt: timestamp("createdAt").default(sql`now()`),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type InterpretationCache = typeof interpretationCache.$inferSelect;
export type InsertInterpretationCache = typeof interpretationCache.$inferInsert;

/**
 * Cache de queries executadas (otimização)
 */
export const queryCache = pgTable("query_cache", {
  id: varchar("id", { length: 64 }).primaryKey(),
  queryHash: varchar("queryHash", { length: 64 }).notNull().unique(),
  query: text("query").notNull(),
  results: json("results").notNull(),
  recordCount: integer("recordCount").notNull(),
  hitCount: integer("hitCount").default(0),
  createdAt: timestamp("createdAt").default(sql`now()`),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type QueryCache = typeof queryCache.$inferSelect;
export type InsertQueryCache = typeof queryCache.$inferInsert;
