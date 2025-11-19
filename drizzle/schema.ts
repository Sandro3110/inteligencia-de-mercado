import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal, json } from "drizzle-orm/mysql-core";

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
 * Projects - Separate workspaces for different business units
 */
export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  cor: varchar("cor", { length: 7 }).default("#3b82f6"), // hex color
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

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
  projectId: int("projectId").notNull(),
  mercadoHash: varchar("mercadoHash", { length: 255 }),
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
  projectId: int("projectId").notNull(),
  clienteHash: varchar("clienteHash", { length: 255 }),
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
  regiao: varchar("regiao", { length: 100 }),
  cnae: varchar("cnae", { length: 20 }),
  porte: varchar("porte", { length: 50 }),
  faturamentoDeclarado: text("faturamentoDeclarado"),
  numeroEstabelecimentos: text("numeroEstabelecimentos"),
  qualidadeScore: int("qualidadeScore"),
  qualidadeClassificacao: varchar("qualidadeClassificacao", { length: 50 }),
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
 * Produtos - Product catalog linking clients to markets
 */
export const produtos = mysqlTable("produtos", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  clienteId: int("clienteId").notNull(),
  mercadoId: int("mercadoId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  preco: text("preco"),
  unidade: varchar("unidade", { length: 50 }), // kg, litro, unidade, etc
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;

/**
 * Concorrentes - Competitor entities with validation
 */
export const concorrentes = mysqlTable("concorrentes", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  concorrenteHash: varchar("concorrenteHash", { length: 255 }),
  mercadoId: int("mercadoId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  site: varchar("site", { length: 500 }),
  produto: text("produto"),
  cidade: varchar("cidade", { length: 100 }),
  uf: varchar("uf", { length: 2 }),
  porte: varchar("porte", { length: 50 }),
  faturamentoEstimado: text("faturamentoEstimado"),
  faturamentoDeclarado: text("faturamentoDeclarado"),
  numeroEstabelecimentos: text("numeroEstabelecimentos"),
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
export const leadStageEnum = mysqlEnum("leadStage", [
  "novo",
  "em_contato",
  "negociacao",
  "fechado",
  "perdido",
]);

export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  leadHash: varchar("leadHash", { length: 255 }),
  mercadoId: int("mercadoId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  site: varchar("site", { length: 500 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 50 }),
  tipo: varchar("tipo", { length: 20 }),
  cidade: varchar("cidade", { length: 100 }),
  uf: varchar("uf", { length: 2 }),
  porte: varchar("porte", { length: 50 }),
  faturamentoDeclarado: text("faturamentoDeclarado"),
  numeroEstabelecimentos: text("numeroEstabelecimentos"),
  regiao: varchar("regiao", { length: 100 }),
  setor: varchar("setor", { length: 100 }),
  qualidadeScore: int("qualidadeScore"),
  qualidadeClassificacao: varchar("qualidadeClassificacao", { length: 50 }),
  stage: leadStageEnum.default("novo"),
  stageUpdatedAt: timestamp("stageUpdatedAt").defaultNow(),
  validationStatus: validationStatusEnum.default("pending"),
  validationNotes: text("validationNotes"),
  validatedBy: varchar("validatedBy", { length: 64 }),
  validatedAt: timestamp("validatedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Tags - Custom tags for organization
 */
export const tags = mysqlTable("tags", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6"), // hex color
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Entity_Tags - Junction table for tags
 */
export const entityTags = mysqlTable("entity_tags", {
  id: int("id").primaryKey().autoincrement(),
  tagId: int("tagId").notNull().references(() => tags.id, { onDelete: "cascade" }),
  entityType: mysqlEnum("entityType", ["mercado", "cliente", "concorrente", "lead"]).notNull(),
  entityId: int("entityId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type EntityTag = typeof entityTags.$inferSelect;
export type InsertEntityTag = typeof entityTags.$inferInsert;

/**
 * Saved_Filters - User-saved filter combinations
 */
export const savedFilters = mysqlTable("saved_filters", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  filtersJson: text("filtersJson").notNull(), // JSON string with filter state
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

/**
 * Project_Templates - Reusable project configurations
 */
export const projectTemplates = mysqlTable("project_templates", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  config: text("config").notNull(), // JSON string with template configuration
  isDefault: int("isDefault").default(0).notNull(), // 1 = default template, 0 = custom
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;

/**
 * Notifications - Sistema de notificações e alertas
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).references(() => users.id, { onDelete: "cascade" }),
  projectId: int("projectId").references(() => projects.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["lead_quality", "lead_closed", "new_competitor", "market_threshold", "data_incomplete"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  entityType: mysqlEnum("entityType", ["mercado", "cliente", "concorrente", "lead"]),
  entityId: int("entityId"),
  isRead: int("isRead").default(0).notNull(), // 0 = não lida, 1 = lida
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


/**
 * Cache de Enriquecimento - Armazena dados enriquecidos para evitar chamadas repetidas
 */
export const enrichmentCache = mysqlTable("enrichment_cache", {
  cnpj: varchar("cnpj", { length: 14 }).primaryKey(),
  dadosJson: text("dadosJson").notNull(), // JSON stringified dos dados enriquecidos
  fonte: varchar("fonte", { length: 50 }), // "receitaws", "google_places", "hunter", etc
  dataAtualizacao: timestamp("dataAtualizacao").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type EnrichmentCache = typeof enrichmentCache.$inferSelect;
export type InsertEnrichmentCache = typeof enrichmentCache.$inferInsert;


/**
 * Enrichment Runs - Historical record of enrichment executions
 */
export const enrichmentStatusEnum = mysqlEnum("status", [
  "running",
  "paused",
  "completed",
  "error",
]);

export const enrichmentRuns = mysqlTable("enrichment_runs", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  totalClients: int("totalClients").notNull(),
  processedClients: int("processedClients").default(0).notNull(),
  status: enrichmentStatusEnum.default("running").notNull(),
  durationSeconds: int("durationSeconds"), // Calculated on completion
  errorMessage: text("errorMessage"),
  notifiedAt50: int("notifiedAt50").default(0).notNull(), // Flag: 1 if notified
  notifiedAt75: int("notifiedAt75").default(0).notNull(),
  notifiedAt100: int("notifiedAt100").default(0).notNull(),
});

export type EnrichmentRun = typeof enrichmentRuns.$inferSelect;
export type InsertEnrichmentRun = typeof enrichmentRuns.$inferInsert;

/**
 * Scheduled Enrichments - Agendamentos de enriquecimento
 */
export const scheduledEnrichments = mysqlTable("scheduled_enrichments", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  recurrence: mysqlEnum("recurrence", ["once", "daily", "weekly"]).default("once").notNull(),
  batchSize: int("batchSize").default(50),
  maxClients: int("maxClients"),
  timeout: int("timeout").default(3600), // segundos
  status: mysqlEnum("scheduleStatus", ["pending", "running", "completed", "cancelled", "error"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ScheduledEnrichment = typeof scheduledEnrichments.$inferSelect;
export type InsertScheduledEnrichment = typeof scheduledEnrichments.$inferInsert;


/**
 * Alert Configs - Configurações de alertas personalizados
 */
export const alertConfigs = mysqlTable("alert_configs", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("alertType", ["error_rate", "high_quality_lead", "market_threshold"]).notNull(),
  condition: text("condition").notNull(), // JSON: { operator: ">", value: 5 }
  enabled: boolean("enabled").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type AlertConfig = typeof alertConfigs.$inferSelect;
export type InsertAlertConfig = typeof alertConfigs.$inferInsert;

/**
 * Alert History - Histórico de alertas disparados
 */
export const alertHistory = mysqlTable("alert_history", {
  id: int("id").primaryKey().autoincrement(),
  alertConfigId: int("alertConfigId").notNull(),
  projectId: int("projectId").notNull(),
  alertType: mysqlEnum("alertType", ["error_rate", "high_quality_lead", "market_threshold"]).notNull(),
  condition: text("condition").notNull(), // JSON da condição que disparou
  message: text("message").notNull(), // Mensagem enviada na notificação
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
});

export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;

/**
 * Lead Conversions - Rastreamento de leads convertidos em clientes
 */
export const conversionStatusEnum = mysqlEnum("conversionStatus", [
  "won",
  "lost",
]);

export const leadConversions = mysqlTable("lead_conversions", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("leadId").notNull(),
  projectId: int("projectId").notNull(),
  dealValue: decimal("dealValue", { precision: 15, scale: 2 }),
  convertedAt: timestamp("convertedAt").defaultNow().notNull(),
  notes: text("notes"),
  status: conversionStatusEnum.default("won").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type LeadConversion = typeof leadConversions.$inferSelect;
export type InsertLeadConversion = typeof leadConversions.$inferInsert;

/**
 * Activity Log - Track system activities
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  activityType: varchar("activityType", { length: 50 }).notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * Change Type Enum - Tipos de mudanças rastreadas
 */
export const changeTypeEnum = mysqlEnum("changeType", [
  "created",    // Registro criado
  "updated",    // Campo atualizado
  "enriched",   // Enriquecido via API
  "validated",  // Validado manualmente
]);

/**
 * Mercados History - Rastreamento de mudanças em mercados
 */
export const mercadosHistory = mysqlTable("mercados_history", {
  id: int("id").primaryKey().autoincrement(),
  mercadoId: int("mercadoId").notNull(),
  field: varchar("field", { length: 100 }), // Campo que mudou
  oldValue: text("oldValue"), // Valor anterior
  newValue: text("newValue"), // Valor novo
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }), // Quem mudou (user ID ou "system")
  changedAt: timestamp("changedAt").defaultNow(),
});

export type MercadoHistory = typeof mercadosHistory.$inferSelect;
export type InsertMercadoHistory = typeof mercadosHistory.$inferInsert;

/**
 * Clientes History - Rastreamento de mudanças em clientes
 */
export const clientesHistory = mysqlTable("clientes_history", {
  id: int("id").primaryKey().autoincrement(),
  clienteId: int("clienteId").notNull(),
  field: varchar("field", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }),
  changedAt: timestamp("changedAt").defaultNow(),
});

export type ClienteHistory = typeof clientesHistory.$inferSelect;
export type InsertClienteHistory = typeof clientesHistory.$inferInsert;

/**
 * Concorrentes History - Rastreamento de mudanças em concorrentes
 */
export const concorrentesHistory = mysqlTable("concorrentes_history", {
  id: int("id").primaryKey().autoincrement(),
  concorrenteId: int("concorrenteId").notNull(),
  field: varchar("field", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }),
  changedAt: timestamp("changedAt").defaultNow(),
});

export type ConcorrenteHistory = typeof concorrentesHistory.$inferSelect;
export type InsertConcorrenteHistory = typeof concorrentesHistory.$inferInsert;

/**
 * Leads History - Rastreamento de mudanças em leads
 */
export const leadsHistory = mysqlTable("leads_history", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("leadId").notNull(),
  field: varchar("field", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: changeTypeEnum.default("updated"),
  changedBy: varchar("changedBy", { length: 64 }),
  changedAt: timestamp("changedAt").defaultNow(),
});

export type LeadHistory = typeof leadsHistory.$inferSelect;
export type InsertLeadHistory = typeof leadsHistory.$inferInsert;

/**
 * Enrichment Jobs - Controle de processamento em lote
 */
export const enrichmentJobs = mysqlTable("enrichment_jobs", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  status: mysqlEnum("status", ["pending", "running", "paused", "completed", "failed"]).default("pending").notNull(),
  totalClientes: int("totalClientes").notNull(),
  processedClientes: int("processedClientes").default(0).notNull(),
  successClientes: int("successClientes").default(0).notNull(),
  failedClientes: int("failedClientes").default(0).notNull(),
  currentBatch: int("currentBatch").default(0).notNull(),
  totalBatches: int("totalBatches").notNull(),
  batchSize: int("batchSize").default(5).notNull(),
  checkpointInterval: int("checkpointInterval").default(50).notNull(),
  startedAt: timestamp("startedAt"),
  pausedAt: timestamp("pausedAt"),
  completedAt: timestamp("completedAt"),
  estimatedTimeRemaining: int("estimatedTimeRemaining"), // em segundos
  lastClienteId: int("lastClienteId"), // último cliente processado (para retomar)
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type EnrichmentJob = typeof enrichmentJobs.$inferSelect;
export type InsertEnrichmentJob = typeof enrichmentJobs.$inferInsert;
