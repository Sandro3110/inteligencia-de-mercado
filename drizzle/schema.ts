import { mysqlEnum, mysqlTable, text, timestamp, varchar, int } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Validation status enum for all validatable entities
 */
export const validationStatusEnum = mysqlEnum("validationStatus", [
  "pending",
  "rich",
  "needs_adjustment",
  "discarded",
]);

/**
 * Mercados Únicos - Central entity
 */
export const mercadosUnicos = mysqlTable("mercados_unicos", {
  id: int("id").primaryKey().autoincrement(),
  mercadoHash: varchar("mercadoHash", { length: 64 }),
  nome: varchar("nome", { length: 255 }).notNull(),
  segmentacao: varchar("segmentacao", { length: 50 }),
  categoria: varchar("categoria", { length: 100 }),
  tamanhoMercado: text("tamanhoMercado"),
  crescimentoAnual: text("crescimentoAnual"),
  tendencias: text("tendencias"),
  principaisPlayers: text("principaisPlayers"),
  quantidadeClientes: int("quantidadeClientes").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type MercadoUnico = typeof mercadosUnicos.$inferSelect;
export type InsertMercadoUnico = typeof mercadosUnicos.$inferInsert;

/**
 * Clientes - Customer entities with validation
 */
export const clientes = mysqlTable("clientes", {
  id: int("id").primaryKey().autoincrement(),
  clienteHash: varchar("clienteHash", { length: 64 }),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  siteOficial: varchar("siteOficial", { length: 500 }),
  produtoPrincipal: text("produtoPrincipal"),
  segmentacaoB2bB2c: varchar("segmentacaoB2bB2c", { length: 20 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 50 }),
  linkedin: varchar("linkedin", { length: 500 }),
  instagram: varchar("instagram", { length: 500 }),
  cidade: varchar("cidade", { length: 100 }),
  uf: varchar("uf", { length: 2 }),
  cnae: varchar("cnae", { length: 20 }),
  validationStatus: validationStatusEnum.default("pending"),
  validationNotes: text("validationNotes"),
  validatedBy: varchar("validatedBy", { length: 64 }),
  validatedAt: timestamp("validatedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

/**
 * Clientes_Mercados - Junction table
 */
export const clientesMercados = mysqlTable("clientes_mercados", {
  id: int("id").primaryKey().autoincrement(),
  clienteId: int("clienteId").notNull(),
  mercadoId: int("mercadoId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ClienteMercado = typeof clientesMercados.$inferSelect;
export type InsertClienteMercado = typeof clientesMercados.$inferInsert;

/**
 * Concorrentes - Competitor entities with validation
 */
export const concorrentes = mysqlTable("concorrentes", {
  id: int("id").primaryKey().autoincrement(),
  concorrenteHash: varchar("concorrenteHash", { length: 64 }),
  mercadoId: int("mercadoId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  site: varchar("site", { length: 500 }),
  produto: text("produto"),
  porte: varchar("porte", { length: 50 }),
  faturamentoEstimado: text("faturamentoEstimado"),
  qualidadeScore: int("qualidadeScore"),
  qualidadeClassificacao: varchar("qualidadeClassificacao", { length: 50 }),
  validationStatus: validationStatusEnum.default("pending"),
  validationNotes: text("validationNotes"),
  validatedBy: varchar("validatedBy", { length: 64 }),
  validatedAt: timestamp("validatedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Concorrente = typeof concorrentes.$inferSelect;
export type InsertConcorrente = typeof concorrentes.$inferInsert;

/**
 * Leads - Lead entities with validation
 */
export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),
  leadHash: varchar("leadHash", { length: 64 }),
  mercadoId: int("mercadoId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  site: varchar("site", { length: 500 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 50 }),
  tipo: varchar("tipo", { length: 20 }),
  porte: varchar("porte", { length: 50 }),
  regiao: varchar("regiao", { length: 100 }),
  setor: varchar("setor", { length: 100 }),
  qualidadeScore: int("qualidadeScore"),
  qualidadeClassificacao: varchar("qualidadeClassificacao", { length: 50 }),
  validationStatus: validationStatusEnum.default("pending"),
  validationNotes: text("validationNotes"),
  validatedBy: varchar("validatedBy", { length: 64 }),
  validatedAt: timestamp("validatedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

