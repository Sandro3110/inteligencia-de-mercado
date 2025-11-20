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
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo (soft delete)
  status: mysqlEnum("status", ["active", "hibernated"]).default("active").notNull(), // Fase 57: Hibernação
  lastActivityAt: timestamp("lastActivityAt").defaultNow(), // Fase 58: Arquivamento automático
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Pesquisas - Research batches/datasets within projects
 * Each pesquisa represents one client import/enrichment batch
 */
export const pesquisas = mysqlTable("pesquisas", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataImportacao: timestamp("dataImportacao").defaultNow(),
  totalClientes: int("totalClientes").default(0),
  clientesEnriquecidos: int("clientesEnriquecidos").default(0),
  status: mysqlEnum("status", ["importado", "enriquecendo", "concluido", "erro"]).default("importado"),
  ativo: int("ativo").default(1).notNull(),
  // Parâmetros flexíveis de enriquecimento (Fase 39.4)
  qtdConcorrentesPorMercado: int("qtdConcorrentesPorMercado").default(5),
  qtdLeadsPorMercado: int("qtdLeadsPorMercado").default(10),
  qtdProdutosPorCliente: int("qtdProdutosPorCliente").default(3),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Pesquisa = typeof pesquisas.$inferSelect;
export type InsertPesquisa = typeof pesquisas.$inferInsert;

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
  pesquisaId: int("pesquisaId"),
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
  pesquisaId: int("pesquisaId"),
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
  pesquisaId: int("pesquisaId"),
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
  pesquisaId: int("pesquisaId"),
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
  pesquisaId: int("pesquisaId"),
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

/**
 * Enrichment Configs - Configurações de enriquecimento por projeto
 * Armazena API keys e critérios customizados
 */
export const enrichmentConfigs = mysqlTable("enrichment_configs", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull().unique(),
  
  // API Keys (criptografadas no backend antes de salvar)
  openaiApiKey: text("openaiApiKey"), // opcional
  geminiApiKey: text("geminiApiKey"), // opcional
  anthropicApiKey: text("anthropicApiKey"), // opcional
  serpapiKey: text("serpapiKey"), // opcional
  receitawsKey: text("receitawsKey"), // opcional
  
  // Critérios de enriquecimento
  produtosPorMercado: int("produtosPorMercado").default(3).notNull(),
  concorrentesPorMercado: int("concorrentesPorMercado").default(5).notNull(),
  leadsPorMercado: int("leadsPorMercado").default(5).notNull(),
  
  // Configurações de processamento
  batchSize: int("batchSize").default(50).notNull(),
  checkpointInterval: int("checkpointInterval").default(100).notNull(),
  
  // Flags de funcionalidades
  enableDeduplication: int("enableDeduplication").default(1).notNull(), // 1 = ativo, 0 = inativo
  enableQualityScore: int("enableQualityScore").default(1).notNull(),
  enableAutoRetry: int("enableAutoRetry").default(1).notNull(),
  maxRetries: int("maxRetries").default(2).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type EnrichmentConfig = typeof enrichmentConfigs.$inferSelect;
export type InsertEnrichmentConfig = typeof enrichmentConfigs.$inferInsert;


/**
 * ============================================
 * ANALYTICS TABLES - Lead Generation Intelligence
 * ============================================
 */

/**
 * Analytics por Mercado - Métricas agregadas por mercado
 */
export const analyticsMercados = mysqlTable("analytics_mercados", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  pesquisaId: int("pesquisaId"),
  mercadoId: int("mercadoId").notNull(),
  periodo: timestamp("periodo").notNull(), // Data de referência
  
  // Métricas de Cobertura
  totalClientes: int("totalClientes").default(0),
  totalConcorrentes: int("totalConcorrentes").default(0),
  totalLeadsGerados: int("totalLeadsGerados").default(0),
  taxaCoberturaMercado: int("taxaCoberturaMercado").default(0), // Percentual * 100
  
  // Métricas de Qualidade
  qualidadeMediaLeads: int("qualidadeMediaLeads").default(0), // Score médio * 100
  leadsAltaQualidade: int("leadsAltaQualidade").default(0), // score >= 80
  leadsMediaQualidade: int("leadsMediaQualidade").default(0), // score 50-79
  leadsBaixaQualidade: int("leadsBaixaQualidade").default(0), // score < 50
  
  // Métricas de Enriquecimento
  leadsEnriquecidos: int("leadsEnriquecidos").default(0),
  taxaSucessoEnriquecimento: int("taxaSucessoEnriquecimento").default(0), // Percentual * 100
  tempoMedioEnriquecimentoMin: int("tempoMedioEnriquecimentoMin").default(0), // Minutos * 100
  custoEnriquecimentoTotal: int("custoEnriquecimentoTotal").default(0), // Centavos
  
  // Métricas de Validação
  leadsValidados: int("leadsValidados").default(0),
  leadsAprovados: int("leadsAprovados").default(0), // status: rich
  leadsDescartados: int("leadsDescartados").default(0), // status: discarded
  taxaAprovacao: int("taxaAprovacao").default(0), // Percentual * 100
  
  // Métricas de Exportação Salesforce (preparado para futuro)
  leadsExportadosSF: int("leadsExportadosSF").default(0),
  leadsConvertidosSF: int("leadsConvertidosSF").default(0),
  taxaConversaoSF: int("taxaConversaoSF").default(0), // Percentual * 100
  
  // Métricas de Esforço
  horasPesquisa: int("horasPesquisa").default(0), // Horas * 100
  custoTotal: int("custoTotal").default(0), // Centavos
  roi: int("roi").default(0), // ROI * 100 (pode ser negativo)
  
  updatedAt: timestamp("updatedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyticsMercado = typeof analyticsMercados.$inferSelect;
export type InsertAnalyticsMercado = typeof analyticsMercados.$inferInsert;

/**
 * Analytics por Pesquisa - Métricas agregadas por batch de pesquisa
 */
export const analyticsPesquisas = mysqlTable("analytics_pesquisas", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  pesquisaId: int("pesquisaId").notNull(),
  
  // Métricas Gerais
  totalMercadosMapeados: int("totalMercadosMapeados").default(0),
  totalClientesBase: int("totalClientesBase").default(0),
  totalLeadsGerados: int("totalLeadsGerados").default(0),
  taxaConversaoClienteLead: int("taxaConversaoClienteLead").default(0), // Percentual * 100
  
  // Qualidade Agregada
  qualidadeMediaGeral: int("qualidadeMediaGeral").default(0), // Score médio * 100
  distribuicaoQualidade: text("distribuicaoQualidade"), // JSON: {alta: X, media: Y, baixa: Z}
  
  // Performance de Enriquecimento
  taxaSucessoEnriquecimento: int("taxaSucessoEnriquecimento").default(0), // Percentual * 100
  tempoTotalEnriquecimentoHoras: int("tempoTotalEnriquecimentoHoras").default(0), // Horas * 100
  custoTotalEnriquecimento: int("custoTotalEnriquecimento").default(0), // Centavos
  
  // Resultados Salesforce (preparado para futuro)
  leadsExportadosSF: int("leadsExportadosSF").default(0),
  leadsConvertidosSF: int("leadsConvertidosSF").default(0),
  taxaConversaoSF: int("taxaConversaoSF").default(0), // Percentual * 100
  valorPipelineGerado: int("valorPipelineGerado").default(0), // Centavos
  
  // ROI da Pesquisa
  custoTotalPesquisa: int("custoTotalPesquisa").default(0), // Centavos
  valorGerado: int("valorGerado").default(0), // Centavos
  roi: int("roi").default(0), // ROI * 100
  
  dataInicio: timestamp("dataInicio"),
  dataConclusao: timestamp("dataConclusao"),
  duracaoDias: int("duracaoDias").default(0),
  
  updatedAt: timestamp("updatedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyticsPesquisa = typeof analyticsPesquisas.$inferSelect;
export type InsertAnalyticsPesquisa = typeof analyticsPesquisas.$inferInsert;

/**
 * Analytics por Dimensão - Eficácia por UF/Porte/Segmentação
 */
export const analyticsDimensoes = mysqlTable("analytics_dimensoes", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  pesquisaId: int("pesquisaId"),
  
  dimensaoTipo: mysqlEnum("dimensaoTipo", ["uf", "porte", "segmentacao", "categoria"]).notNull(),
  dimensaoValor: varchar("dimensaoValor", { length: 100 }).notNull(), // ex: 'SP', 'Médio', 'B2B'
  
  totalLeads: int("totalLeads").default(0),
  qualidadeMedia: int("qualidadeMedia").default(0), // Score médio * 100
  taxaConversaoSF: int("taxaConversaoSF").default(0), // Percentual * 100
  custoMedioLead: int("custoMedioLead").default(0), // Centavos
  roi: int("roi").default(0), // ROI * 100
  
  updatedAt: timestamp("updatedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyticsDimensao = typeof analyticsDimensoes.$inferSelect;
export type InsertAnalyticsDimensao = typeof analyticsDimensoes.$inferInsert;

/**
 * Analytics Timeline - Evolução temporal diária
 */
export const analyticsTimeline = mysqlTable("analytics_timeline", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  data: timestamp("data").notNull(),
  
  // Métricas Diárias
  leadsGeradosDia: int("leadsGeradosDia").default(0),
  leadsEnriquecidosDia: int("leadsEnriquecidosDia").default(0),
  leadsValidadosDia: int("leadsValidadosDia").default(0),
  leadsExportadosSFDia: int("leadsExportadosSFDia").default(0),
  
  qualidadeMediaDia: int("qualidadeMediaDia").default(0), // Score médio * 100
  custoDia: int("custoDia").default(0), // Centavos
  
  // Métricas Acumuladas
  leadsAcumulados: int("leadsAcumulados").default(0),
  custoAcumulado: int("custoAcumulado").default(0), // Centavos
  valorGeradoAcumulado: int("valorGeradoAcumulado").default(0), // Centavos
  
  updatedAt: timestamp("updatedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyticsTimeline = typeof analyticsTimeline.$inferSelect;
export type InsertAnalyticsTimeline = typeof analyticsTimeline.$inferInsert;

/**
 * Operational Alerts - Alertas operacionais automáticos
 */
export const operationalAlerts = mysqlTable("operational_alerts", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  
  alertType: mysqlEnum("alertType", [
    "qualidade_baixa",
    "enriquecimento_lento",
    "backlog_validacao",
    "custo_elevado",
    "conversao_sf_baixa"
  ]).notNull(),
  
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  acaoRecomendada: text("acaoRecomendada"),
  
  valorAtual: text("valorAtual"), // Valor que disparou o alerta
  valorEsperado: text("valorEsperado"), // Valor de referência
  
  isRead: int("isRead").default(0).notNull(), // 0 = não lido, 1 = lido
  isDismissed: int("isDismissed").default(0).notNull(), // 0 = ativo, 1 = dispensado
  
  createdAt: timestamp("createdAt").defaultNow(),
  readAt: timestamp("readAt"),
  dismissedAt: timestamp("dismissedAt"),
});

export type OperationalAlert = typeof operationalAlerts.$inferSelect;
export type InsertOperationalAlert = typeof operationalAlerts.$inferInsert;

/**
 * Recommendations - Recomendações automáticas
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  
  tipo: mysqlEnum("tipo", ["mercado", "regiao", "metodologia", "filtro", "otimizacao"]).notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta"]).default("media").notNull(),
  
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  acao: text("acao").notNull(), // Texto acionável
  
  // Impacto Estimado
  leadsAdicionaisEstimado: int("leadsAdicionaisEstimado").default(0),
  qualidadeEsperada: int("qualidadeEsperada").default(0), // Score * 100
  custoEstimado: int("custoEstimado").default(0), // Centavos
  roiEsperado: int("roiEsperado").default(0), // ROI * 100
  
  isApplied: int("isApplied").default(0).notNull(), // 0 = pendente, 1 = aplicada
  isDismissed: int("isDismissed").default(0).notNull(), // 0 = ativa, 1 = dispensada
  
  createdAt: timestamp("createdAt").defaultNow(),
  appliedAt: timestamp("appliedAt"),
  dismissedAt: timestamp("dismissedAt"),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Salesforce Sync Log - Histórico de exportações (preparado para futuro)
 */
export const salesforceSyncLog = mysqlTable("salesforce_sync_log", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  pesquisaId: int("pesquisaId"),
  
  syncType: mysqlEnum("syncType", ["manual", "automatico"]).default("manual").notNull(),
  
  totalLeadsExportados: int("totalLeadsExportados").default(0),
  totalLeadsSucesso: int("totalLeadsSucesso").default(0),
  totalLeadsErro: int("totalLeadsErro").default(0),
  
  status: mysqlEnum("status", ["em_progresso", "concluido", "erro"]).default("em_progresso").notNull(),
  errorMessage: text("errorMessage"),
  
  leadIds: text("leadIds"), // JSON array de IDs exportados
  
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type SalesforceSyncLog = typeof salesforceSyncLog.$inferSelect;
export type InsertSalesforceSyncLog = typeof salesforceSyncLog.$inferInsert;

// ============================================
// MÓDULO DE EXPORTAÇÃO E INTELIGÊNCIA DE DADOS
// ============================================

/**
 * Histórico de exportações realizadas pelos usuários
 */
export const exportHistory = mysqlTable('export_history', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  context: text('context'),
  filters: json('filters'),
  format: mysqlEnum('format', ['csv', 'excel', 'pdf', 'json']).notNull(),
  outputType: mysqlEnum('outputType', ['simple', 'complete', 'report']).notNull(),
  recordCount: int('recordCount').notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileSize: int('fileSize').notNull(),
  generationTime: int('generationTime'),
  createdAt: timestamp('createdAt').defaultNow()
});

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = typeof exportHistory.$inferInsert;

/**
 * Filtros salvos pelos usuários para reutilização
 */
export const savedFiltersExport = mysqlTable('saved_filters_export', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  filters: json('filters').notNull(),
  isPublic: boolean('isPublic').default(false),
  shareToken: varchar('shareToken', { length: 64 }),
  usageCount: int('usageCount').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export type SavedFilterExport = typeof savedFiltersExport.$inferSelect;
export type InsertSavedFilterExport = typeof savedFiltersExport.$inferInsert;

/**
 * Templates de relatórios (sistema e customizados)
 */
export const exportTemplates = mysqlTable('export_templates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  templateType: mysqlEnum('templateType', ['market', 'client', 'competitive', 'lead']).notNull(),
  config: json('config').notNull(),
  isSystem: boolean('isSystem').default(false),
  userId: varchar('userId', { length: 64 }),
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

// ============================================
// MÓDULO DE ADMIN LLM E ALERTAS INTELIGENTES
// ============================================

/**
 * LLM Provider Configs - Configuração de provedores de IA
 */
export const llmProviderConfigs = mysqlTable("llm_provider_configs", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  
  // Provedor ativo
  activeProvider: mysqlEnum("activeProvider", ["openai", "gemini", "anthropic"]).default("openai").notNull(),
  
  // Configurações OpenAI
  openaiApiKey: text("openaiApiKey"),
  openaiModel: varchar("openaiModel", { length: 100 }).default("gpt-4o"),
  openaiEnabled: int("openaiEnabled").default(1).notNull(),
  
  // Configurações Gemini
  geminiApiKey: text("geminiApiKey"),
  geminiModel: varchar("geminiModel", { length: 100 }).default("gemini-2.0-flash-exp"),
  geminiEnabled: int("geminiEnabled").default(0).notNull(),
  
  // Configurações Anthropic
  anthropicApiKey: text("anthropicApiKey"),
  anthropicModel: varchar("anthropicModel", { length: 100 }).default("claude-3-5-sonnet-20241022"),
  anthropicEnabled: int("anthropicEnabled").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type LLMProviderConfig = typeof llmProviderConfigs.$inferSelect;
export type InsertLLMProviderConfig = typeof llmProviderConfigs.$inferInsert;

/**
 * Intelligent Alerts Config - Configuração de alertas inteligentes
 */
export const intelligentAlertsConfigs = mysqlTable("intelligent_alerts_configs", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull().unique(),
  
  // Thresholds
  circuitBreakerThreshold: int("circuitBreakerThreshold").default(10).notNull(),
  errorRateThreshold: int("errorRateThreshold").default(10).notNull(), // Percentual
  processingTimeThreshold: int("processingTimeThreshold").default(60).notNull(), // Segundos
  
  // Flags
  notifyOnCompletion: int("notifyOnCompletion").default(1).notNull(),
  notifyOnCircuitBreaker: int("notifyOnCircuitBreaker").default(1).notNull(),
  notifyOnErrorRate: int("notifyOnErrorRate").default(1).notNull(),
  notifyOnProcessingTime: int("notifyOnProcessingTime").default(1).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type IntelligentAlertsConfig = typeof intelligentAlertsConfigs.$inferSelect;
export type InsertIntelligentAlertsConfig = typeof intelligentAlertsConfigs.$inferInsert;

/**
 * Intelligent Alerts History - Histórico de alertas disparados
 */
export const intelligentAlertsHistory = mysqlTable("intelligent_alerts_history", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  
  alertType: mysqlEnum("alertType", [
    "circuit_breaker",
    "error_rate",
    "processing_time",
    "completion"
  ]).notNull(),
  
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Métricas no momento do alerta
  metricValue: text("metricValue"), // Valor que disparou o alerta
  threshold: text("threshold"), // Threshold configurado
  
  // Contexto adicional
  jobId: int("jobId"),
  clientsProcessed: int("clientsProcessed"),
  totalClients: int("totalClients"),
  
  // Status
  isRead: int("isRead").default(0).notNull(),
  isDismissed: int("isDismissed").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  readAt: timestamp("readAt"),
  dismissedAt: timestamp("dismissedAt"),
});

export type IntelligentAlertHistory = typeof intelligentAlertsHistory.$inferSelect;
export type InsertIntelligentAlertHistory = typeof intelligentAlertsHistory.$inferInsert;


/**
 * ============================================
 * PROJECT AUDIT LOG - Fase 58.2
 * ============================================
 */

/**
 * Project Audit Log - Histórico completo de mudanças em projetos
 */
export const projectAuditLog = mysqlTable("project_audit_log", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("projectId").notNull(),
  userId: varchar("userId", { length: 64 }), // Quem fez a mudança
  
  action: mysqlEnum("action", [
    "created",
    "updated",
    "hibernated",
    "reactivated",
    "deleted"
  ]).notNull(),
  
  // Mudanças realizadas (JSON com before/after)
  changes: text("changes"), // JSON: { field: { before: X, after: Y } }
  
  // Metadados adicionais
  metadata: text("metadata"), // JSON com info extra (IP, user agent, etc)
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ProjectAuditLog = typeof projectAuditLog.$inferSelect;
export type InsertProjectAuditLog = typeof projectAuditLog.$inferInsert;
