"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hibernationWarnings =
  exports.projectAuditLog =
  exports.intelligentAlertsHistory =
  exports.intelligentAlertsConfigs =
  exports.llmProviderConfigs =
  exports.queryCache =
  exports.interpretationCache =
  exports.exportTemplates =
  exports.savedFiltersExport =
  exports.exportHistory =
  exports.salesforceSyncLog =
  exports.recommendations =
  exports.operationalAlerts =
  exports.analyticsTimeline =
  exports.analyticsDimensoes =
  exports.analyticsPesquisas =
  exports.analyticsMercados =
  exports.enrichmentConfigs =
  exports.enrichmentJobs =
  exports.leadsHistory =
  exports.concorrentesHistory =
  exports.clientesHistory =
  exports.mercadosHistory =
  exports.changeTypeEnum =
  exports.activityLog =
  exports.leadConversions =
  exports.conversionStatusEnum =
  exports.alertHistory =
  exports.alertConfigs =
  exports.scheduledEnrichments =
  exports.enrichmentRuns =
  exports.enrichmentStatusEnum =
  exports.enrichmentCache =
  exports.notifications =
  exports.projectTemplates =
  exports.savedFilters =
  exports.entityTags =
  exports.tags =
  exports.leads =
  exports.leadStageEnum =
  exports.concorrentes =
  exports.produtos =
  exports.clientesMercados =
  exports.clientes =
  exports.mercadosUnicos =
  exports.validationStatusEnum =
  exports.pesquisas =
  exports.projects =
  exports.users =
    void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Core user table backing auth flow.
 */
exports.users = (0, mysql_core_1.mysqlTable)("users", {
  id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
  name: (0, mysql_core_1.text)("name"),
  email: (0, mysql_core_1.varchar)("email", { length: 320 }),
  loginMethod: (0, mysql_core_1.varchar)("loginMethod", { length: 64 }),
  role: (0, mysql_core_1.mysqlEnum)("role", ["user", "admin"])
    .default("user")
    .notNull(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  lastSignedIn: (0, mysql_core_1.timestamp)("lastSignedIn").defaultNow(),
});
/**
 * Projects - Separate workspaces for different business units
 */
exports.projects = (0, mysql_core_1.mysqlTable)("projects", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  descricao: (0, mysql_core_1.text)("descricao"),
  cor: (0, mysql_core_1.varchar)("cor", { length: 7 }).default("#3b82f6"), // hex color
  ativo: (0, mysql_core_1.int)("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo (soft delete)
  status: (0, mysql_core_1.mysqlEnum)("status", ["active", "hibernated"])
    .default("active")
    .notNull(), // Fase 57: Hibernação
  lastActivityAt: (0, mysql_core_1.timestamp)("lastActivityAt").defaultNow(), // Fase 58: Arquivamento automático
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Pesquisas - Research batches/datasets within projects
 * Each pesquisa represents one client import/enrichment batch
 */
exports.pesquisas = (0, mysql_core_1.mysqlTable)("pesquisas", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  descricao: (0, mysql_core_1.text)("descricao"),
  dataImportacao: (0, mysql_core_1.timestamp)("dataImportacao").defaultNow(),
  totalClientes: (0, mysql_core_1.int)("totalClientes").default(0),
  clientesEnriquecidos: (0, mysql_core_1.int)("clientesEnriquecidos").default(
    0
  ),
  status: (0, mysql_core_1.mysqlEnum)("status", [
    "importado",
    "enriquecendo",
    "concluido",
    "erro",
  ]).default("importado"),
  ativo: (0, mysql_core_1.int)("ativo").default(1).notNull(),
  // Parâmetros flexíveis de enriquecimento (Fase 39.4)
  qtdConcorrentesPorMercado: (0, mysql_core_1.int)(
    "qtdConcorrentesPorMercado"
  ).default(5),
  qtdLeadsPorMercado: (0, mysql_core_1.int)("qtdLeadsPorMercado").default(10),
  qtdProdutosPorCliente: (0, mysql_core_1.int)("qtdProdutosPorCliente").default(
    3
  ),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Validation status enum for all validatable entities
 */
exports.validationStatusEnum = (0, mysql_core_1.mysqlEnum)("validationStatus", [
  "pending",
  "rich",
  "needs_adjustment",
  "discarded",
]);
/**
 * Mercados Únicos - Central entity
 */
exports.mercadosUnicos = (0, mysql_core_1.mysqlTable)("mercados_unicos", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
  mercadoHash: (0, mysql_core_1.varchar)("mercadoHash", { length: 255 }),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  segmentacao: (0, mysql_core_1.varchar)("segmentacao", { length: 50 }),
  categoria: (0, mysql_core_1.varchar)("categoria", { length: 100 }),
  tamanhoMercado: (0, mysql_core_1.text)("tamanhoMercado"),
  crescimentoAnual: (0, mysql_core_1.text)("crescimentoAnual"),
  tendencias: (0, mysql_core_1.text)("tendencias"),
  principaisPlayers: (0, mysql_core_1.text)("principaisPlayers"),
  quantidadeClientes: (0, mysql_core_1.int)("quantidadeClientes").default(0),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Clientes - Customer entities with validation
 */
exports.clientes = (0, mysql_core_1.mysqlTable)("clientes", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
  clienteHash: (0, mysql_core_1.varchar)("clienteHash", { length: 255 }),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  cnpj: (0, mysql_core_1.varchar)("cnpj", { length: 20 }),
  siteOficial: (0, mysql_core_1.varchar)("siteOficial", { length: 500 }),
  produtoPrincipal: (0, mysql_core_1.text)("produtoPrincipal"),
  segmentacaoB2bB2c: (0, mysql_core_1.varchar)("segmentacaoB2bB2c", {
    length: 20,
  }),
  email: (0, mysql_core_1.varchar)("email", { length: 320 }),
  telefone: (0, mysql_core_1.varchar)("telefone", { length: 50 }),
  linkedin: (0, mysql_core_1.varchar)("linkedin", { length: 500 }),
  instagram: (0, mysql_core_1.varchar)("instagram", { length: 500 }),
  cidade: (0, mysql_core_1.varchar)("cidade", { length: 100 }),
  uf: (0, mysql_core_1.varchar)("uf", { length: 2 }),
  regiao: (0, mysql_core_1.varchar)("regiao", { length: 100 }),
  cnae: (0, mysql_core_1.varchar)("cnae", { length: 20 }),
  porte: (0, mysql_core_1.varchar)("porte", { length: 50 }),
  faturamentoDeclarado: (0, mysql_core_1.text)("faturamentoDeclarado"),
  numeroEstabelecimentos: (0, mysql_core_1.text)("numeroEstabelecimentos"),
  qualidadeScore: (0, mysql_core_1.int)("qualidadeScore"),
  qualidadeClassificacao: (0, mysql_core_1.varchar)("qualidadeClassificacao", {
    length: 50,
  }),
  validationStatus: exports.validationStatusEnum.default("pending"),
  validationNotes: (0, mysql_core_1.text)("validationNotes"),
  validatedBy: (0, mysql_core_1.varchar)("validatedBy", { length: 64 }),
  validatedAt: (0, mysql_core_1.timestamp)("validatedAt"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Clientes_Mercados - Junction table
 */
exports.clientesMercados = (0, mysql_core_1.mysqlTable)("clientes_mercados", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  clienteId: (0, mysql_core_1.int)("clienteId").notNull(),
  mercadoId: (0, mysql_core_1.int)("mercadoId").notNull(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Produtos - Product catalog linking clients to markets
 */
exports.produtos = (0, mysql_core_1.mysqlTable)("produtos", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
  clienteId: (0, mysql_core_1.int)("clienteId").notNull(),
  mercadoId: (0, mysql_core_1.int)("mercadoId").notNull(),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  descricao: (0, mysql_core_1.text)("descricao"),
  categoria: (0, mysql_core_1.varchar)("categoria", { length: 100 }),
  preco: (0, mysql_core_1.text)("preco"),
  unidade: (0, mysql_core_1.varchar)("unidade", { length: 50 }), // kg, litro, unidade, etc
  ativo: (0, mysql_core_1.int)("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Concorrentes - Competitor entities with validation
 */
exports.concorrentes = (0, mysql_core_1.mysqlTable)("concorrentes", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
  concorrenteHash: (0, mysql_core_1.varchar)("concorrenteHash", {
    length: 255,
  }),
  mercadoId: (0, mysql_core_1.int)("mercadoId").notNull(),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  cnpj: (0, mysql_core_1.varchar)("cnpj", { length: 20 }),
  site: (0, mysql_core_1.varchar)("site", { length: 500 }),
  produto: (0, mysql_core_1.text)("produto"),
  cidade: (0, mysql_core_1.varchar)("cidade", { length: 100 }),
  uf: (0, mysql_core_1.varchar)("uf", { length: 2 }),
  porte: (0, mysql_core_1.varchar)("porte", { length: 50 }),
  faturamentoEstimado: (0, mysql_core_1.text)("faturamentoEstimado"),
  faturamentoDeclarado: (0, mysql_core_1.text)("faturamentoDeclarado"),
  numeroEstabelecimentos: (0, mysql_core_1.text)("numeroEstabelecimentos"),
  qualidadeScore: (0, mysql_core_1.int)("qualidadeScore"),
  qualidadeClassificacao: (0, mysql_core_1.varchar)("qualidadeClassificacao", {
    length: 50,
  }),
  validationStatus: exports.validationStatusEnum.default("pending"),
  validationNotes: (0, mysql_core_1.text)("validationNotes"),
  validatedBy: (0, mysql_core_1.varchar)("validatedBy", { length: 64 }),
  validatedAt: (0, mysql_core_1.timestamp)("validatedAt"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Leads - Lead entities with validation
 */
exports.leadStageEnum = (0, mysql_core_1.mysqlEnum)("leadStage", [
  "novo",
  "em_contato",
  "negociacao",
  "fechado",
  "perdido",
]);
exports.leads = (0, mysql_core_1.mysqlTable)("leads", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
  leadHash: (0, mysql_core_1.varchar)("leadHash", { length: 255 }),
  mercadoId: (0, mysql_core_1.int)("mercadoId").notNull(),
  nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
  cnpj: (0, mysql_core_1.varchar)("cnpj", { length: 20 }),
  site: (0, mysql_core_1.varchar)("site", { length: 500 }),
  email: (0, mysql_core_1.varchar)("email", { length: 320 }),
  telefone: (0, mysql_core_1.varchar)("telefone", { length: 50 }),
  tipo: (0, mysql_core_1.varchar)("tipo", { length: 20 }),
  cidade: (0, mysql_core_1.varchar)("cidade", { length: 100 }),
  uf: (0, mysql_core_1.varchar)("uf", { length: 2 }),
  porte: (0, mysql_core_1.varchar)("porte", { length: 50 }),
  faturamentoDeclarado: (0, mysql_core_1.text)("faturamentoDeclarado"),
  numeroEstabelecimentos: (0, mysql_core_1.text)("numeroEstabelecimentos"),
  regiao: (0, mysql_core_1.varchar)("regiao", { length: 100 }),
  setor: (0, mysql_core_1.varchar)("setor", { length: 100 }),
  qualidadeScore: (0, mysql_core_1.int)("qualidadeScore"),
  qualidadeClassificacao: (0, mysql_core_1.varchar)("qualidadeClassificacao", {
    length: 50,
  }),
  stage: exports.leadStageEnum.default("novo"),
  stageUpdatedAt: (0, mysql_core_1.timestamp)("stageUpdatedAt").defaultNow(),
  validationStatus: exports.validationStatusEnum.default("pending"),
  validationNotes: (0, mysql_core_1.text)("validationNotes"),
  validatedBy: (0, mysql_core_1.varchar)("validatedBy", { length: 64 }),
  validatedAt: (0, mysql_core_1.timestamp)("validatedAt"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Tags - Custom tags for organization
 */
exports.tags = (0, mysql_core_1.mysqlTable)("tags", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  name: (0, mysql_core_1.varchar)("name", { length: 50 }).notNull(),
  color: (0, mysql_core_1.varchar)("color", { length: 7 }).default("#3b82f6"), // hex color
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Entity_Tags - Junction table for tags
 */
exports.entityTags = (0, mysql_core_1.mysqlTable)("entity_tags", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  tagId: (0, mysql_core_1.int)("tagId")
    .notNull()
    .references(() => exports.tags.id, { onDelete: "cascade" }),
  entityType: (0, mysql_core_1.mysqlEnum)("entityType", [
    "mercado",
    "cliente",
    "concorrente",
    "lead",
  ]).notNull(),
  entityId: (0, mysql_core_1.int)("entityId").notNull(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Saved_Filters - User-saved filter combinations
 */
exports.savedFilters = (0, mysql_core_1.mysqlTable)("saved_filters", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  userId: (0, mysql_core_1.varchar)("userId", { length: 64 })
    .notNull()
    .references(() => exports.users.id, { onDelete: "cascade" }),
  name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
  filtersJson: (0, mysql_core_1.text)("filtersJson").notNull(), // JSON string with filter state
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Project_Templates - Reusable project configurations
 */
exports.projectTemplates = (0, mysql_core_1.mysqlTable)("project_templates", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
  description: (0, mysql_core_1.text)("description"),
  config: (0, mysql_core_1.text)("config").notNull(), // JSON string with template configuration
  isDefault: (0, mysql_core_1.int)("isDefault").default(0).notNull(), // 1 = default template, 0 = custom
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Notifications - Sistema de notificações e alertas
 */
exports.notifications = (0, mysql_core_1.mysqlTable)("notifications", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  userId: (0, mysql_core_1.varchar)("userId", { length: 64 }).references(
    () => exports.users.id,
    { onDelete: "cascade" }
  ),
  projectId: (0, mysql_core_1.int)("projectId").references(
    () => exports.projects.id,
    { onDelete: "cascade" }
  ),
  type: (0, mysql_core_1.mysqlEnum)("type", [
    "lead_quality",
    "lead_closed",
    "new_competitor",
    "market_threshold",
    "data_incomplete",
  ]).notNull(),
  title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
  message: (0, mysql_core_1.text)("message").notNull(),
  entityType: (0, mysql_core_1.mysqlEnum)("entityType", [
    "mercado",
    "cliente",
    "concorrente",
    "lead",
  ]),
  entityId: (0, mysql_core_1.int)("entityId"),
  isRead: (0, mysql_core_1.int)("isRead").default(0).notNull(), // 0 = não lida, 1 = lida
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Cache de Enriquecimento - Armazena dados enriquecidos para evitar chamadas repetidas
 */
exports.enrichmentCache = (0, mysql_core_1.mysqlTable)("enrichment_cache", {
  cnpj: (0, mysql_core_1.varchar)("cnpj", { length: 14 }).primaryKey(),
  dadosJson: (0, mysql_core_1.text)("dadosJson").notNull(), // JSON stringified dos dados enriquecidos
  fonte: (0, mysql_core_1.varchar)("fonte", { length: 50 }), // "receitaws", "google_places", "hunter", etc
  dataAtualizacao: (0, mysql_core_1.timestamp)("dataAtualizacao")
    .defaultNow()
    .notNull(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Enrichment Runs - Historical record of enrichment executions
 */
exports.enrichmentStatusEnum = (0, mysql_core_1.mysqlEnum)("status", [
  "running",
  "paused",
  "completed",
  "error",
]);
exports.enrichmentRuns = (0, mysql_core_1.mysqlTable)("enrichment_runs", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  startedAt: (0, mysql_core_1.timestamp)("startedAt").defaultNow().notNull(),
  completedAt: (0, mysql_core_1.timestamp)("completedAt"),
  totalClients: (0, mysql_core_1.int)("totalClients").notNull(),
  processedClients: (0, mysql_core_1.int)("processedClients")
    .default(0)
    .notNull(),
  status: exports.enrichmentStatusEnum.default("running").notNull(),
  durationSeconds: (0, mysql_core_1.int)("durationSeconds"), // Calculated on completion
  errorMessage: (0, mysql_core_1.text)("errorMessage"),
  notifiedAt50: (0, mysql_core_1.int)("notifiedAt50").default(0).notNull(), // Flag: 1 if notified
  notifiedAt75: (0, mysql_core_1.int)("notifiedAt75").default(0).notNull(),
  notifiedAt100: (0, mysql_core_1.int)("notifiedAt100").default(0).notNull(),
});
/**
 * Scheduled Enrichments - Agendamentos de enriquecimento
 */
exports.scheduledEnrichments = (0, mysql_core_1.mysqlTable)(
  "scheduled_enrichments",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    scheduledAt: (0, mysql_core_1.timestamp)("scheduledAt").notNull(),
    recurrence: (0, mysql_core_1.mysqlEnum)("recurrence", [
      "once",
      "daily",
      "weekly",
    ])
      .default("once")
      .notNull(),
    batchSize: (0, mysql_core_1.int)("batchSize").default(50),
    maxClients: (0, mysql_core_1.int)("maxClients"),
    timeout: (0, mysql_core_1.int)("timeout").default(3600), // segundos
    status: (0, mysql_core_1.mysqlEnum)("scheduleStatus", [
      "pending",
      "running",
      "completed",
      "cancelled",
      "error",
    ])
      .default("pending")
      .notNull(),
    errorMessage: (0, mysql_core_1.text)("errorMessage"),
    lastRunAt: (0, mysql_core_1.timestamp)("lastRunAt"),
    nextRunAt: (0, mysql_core_1.timestamp)("nextRunAt"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
  }
);
/**
 * Alert Configs - Configurações de alertas personalizados
 */
exports.alertConfigs = (0, mysql_core_1.mysqlTable)("alert_configs", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
  type: (0, mysql_core_1.mysqlEnum)("alertType", [
    "error_rate",
    "high_quality_lead",
    "market_threshold",
  ]).notNull(),
  condition: (0, mysql_core_1.text)("condition").notNull(), // JSON: { operator: ">", value: 5 }
  enabled: (0, mysql_core_1.boolean)("enabled").default(true).notNull(),
  lastTriggeredAt: (0, mysql_core_1.timestamp)("lastTriggeredAt"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Alert History - Histórico de alertas disparados
 */
exports.alertHistory = (0, mysql_core_1.mysqlTable)("alert_history", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  alertConfigId: (0, mysql_core_1.int)("alertConfigId").notNull(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  alertType: (0, mysql_core_1.mysqlEnum)("alertType", [
    "error_rate",
    "high_quality_lead",
    "market_threshold",
  ]).notNull(),
  condition: (0, mysql_core_1.text)("condition").notNull(), // JSON da condição que disparou
  message: (0, mysql_core_1.text)("message").notNull(), // Mensagem enviada na notificação
  triggeredAt: (0, mysql_core_1.timestamp)("triggeredAt")
    .defaultNow()
    .notNull(),
});
/**
 * Lead Conversions - Rastreamento de leads convertidos em clientes
 */
exports.conversionStatusEnum = (0, mysql_core_1.mysqlEnum)("conversionStatus", [
  "won",
  "lost",
]);
exports.leadConversions = (0, mysql_core_1.mysqlTable)("lead_conversions", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  leadId: (0, mysql_core_1.int)("leadId").notNull(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  dealValue: (0, mysql_core_1.decimal)("dealValue", {
    precision: 15,
    scale: 2,
  }),
  convertedAt: (0, mysql_core_1.timestamp)("convertedAt")
    .defaultNow()
    .notNull(),
  notes: (0, mysql_core_1.text)("notes"),
  status: exports.conversionStatusEnum.default("won").notNull(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Activity Log - Track system activities
 */
exports.activityLog = (0, mysql_core_1.mysqlTable)("activity_log", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  activityType: (0, mysql_core_1.varchar)("activityType", {
    length: 50,
  }).notNull(),
  description: (0, mysql_core_1.text)("description"),
  metadata: (0, mysql_core_1.json)("metadata"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Change Type Enum - Tipos de mudanças rastreadas
 */
exports.changeTypeEnum = (0, mysql_core_1.mysqlEnum)("changeType", [
  "created", // Registro criado
  "updated", // Campo atualizado
  "enriched", // Enriquecido via API
  "validated", // Validado manualmente
]);
/**
 * Mercados History - Rastreamento de mudanças em mercados
 */
exports.mercadosHistory = (0, mysql_core_1.mysqlTable)("mercados_history", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  mercadoId: (0, mysql_core_1.int)("mercadoId").notNull(),
  field: (0, mysql_core_1.varchar)("field", { length: 100 }), // Campo que mudou
  oldValue: (0, mysql_core_1.text)("oldValue"), // Valor anterior
  newValue: (0, mysql_core_1.text)("newValue"), // Valor novo
  changeType: exports.changeTypeEnum.default("updated"),
  changedBy: (0, mysql_core_1.varchar)("changedBy", { length: 64 }), // Quem mudou (user ID ou "system")
  changedAt: (0, mysql_core_1.timestamp)("changedAt").defaultNow(),
});
/**
 * Clientes History - Rastreamento de mudanças em clientes
 */
exports.clientesHistory = (0, mysql_core_1.mysqlTable)("clientes_history", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  clienteId: (0, mysql_core_1.int)("clienteId").notNull(),
  field: (0, mysql_core_1.varchar)("field", { length: 100 }),
  oldValue: (0, mysql_core_1.text)("oldValue"),
  newValue: (0, mysql_core_1.text)("newValue"),
  changeType: exports.changeTypeEnum.default("updated"),
  changedBy: (0, mysql_core_1.varchar)("changedBy", { length: 64 }),
  changedAt: (0, mysql_core_1.timestamp)("changedAt").defaultNow(),
});
/**
 * Concorrentes History - Rastreamento de mudanças em concorrentes
 */
exports.concorrentesHistory = (0, mysql_core_1.mysqlTable)(
  "concorrentes_history",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    concorrenteId: (0, mysql_core_1.int)("concorrenteId").notNull(),
    field: (0, mysql_core_1.varchar)("field", { length: 100 }),
    oldValue: (0, mysql_core_1.text)("oldValue"),
    newValue: (0, mysql_core_1.text)("newValue"),
    changeType: exports.changeTypeEnum.default("updated"),
    changedBy: (0, mysql_core_1.varchar)("changedBy", { length: 64 }),
    changedAt: (0, mysql_core_1.timestamp)("changedAt").defaultNow(),
  }
);
/**
 * Leads History - Rastreamento de mudanças em leads
 */
exports.leadsHistory = (0, mysql_core_1.mysqlTable)("leads_history", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  leadId: (0, mysql_core_1.int)("leadId").notNull(),
  field: (0, mysql_core_1.varchar)("field", { length: 100 }),
  oldValue: (0, mysql_core_1.text)("oldValue"),
  newValue: (0, mysql_core_1.text)("newValue"),
  changeType: exports.changeTypeEnum.default("updated"),
  changedBy: (0, mysql_core_1.varchar)("changedBy", { length: 64 }),
  changedAt: (0, mysql_core_1.timestamp)("changedAt").defaultNow(),
});
/**
 * Enrichment Jobs - Controle de processamento em lote
 */
exports.enrichmentJobs = (0, mysql_core_1.mysqlTable)("enrichment_jobs", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  status: (0, mysql_core_1.mysqlEnum)("status", [
    "pending",
    "running",
    "paused",
    "completed",
    "failed",
  ])
    .default("pending")
    .notNull(),
  totalClientes: (0, mysql_core_1.int)("totalClientes").notNull(),
  processedClientes: (0, mysql_core_1.int)("processedClientes")
    .default(0)
    .notNull(),
  successClientes: (0, mysql_core_1.int)("successClientes")
    .default(0)
    .notNull(),
  failedClientes: (0, mysql_core_1.int)("failedClientes").default(0).notNull(),
  currentBatch: (0, mysql_core_1.int)("currentBatch").default(0).notNull(),
  totalBatches: (0, mysql_core_1.int)("totalBatches").notNull(),
  batchSize: (0, mysql_core_1.int)("batchSize").default(5).notNull(),
  checkpointInterval: (0, mysql_core_1.int)("checkpointInterval")
    .default(50)
    .notNull(),
  startedAt: (0, mysql_core_1.timestamp)("startedAt"),
  pausedAt: (0, mysql_core_1.timestamp)("pausedAt"),
  completedAt: (0, mysql_core_1.timestamp)("completedAt"),
  estimatedTimeRemaining: (0, mysql_core_1.int)("estimatedTimeRemaining"), // em segundos
  lastClienteId: (0, mysql_core_1.int)("lastClienteId"), // último cliente processado (para retomar)
  errorMessage: (0, mysql_core_1.text)("errorMessage"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Enrichment Configs - Configurações de enriquecimento por projeto
 * Armazena API keys e critérios customizados
 */
exports.enrichmentConfigs = (0, mysql_core_1.mysqlTable)("enrichment_configs", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull().unique(),
  // API Keys (criptografadas no backend antes de salvar)
  openaiApiKey: (0, mysql_core_1.text)("openaiApiKey"), // opcional
  geminiApiKey: (0, mysql_core_1.text)("geminiApiKey"), // opcional
  anthropicApiKey: (0, mysql_core_1.text)("anthropicApiKey"), // opcional
  serpapiKey: (0, mysql_core_1.text)("serpapiKey"), // opcional
  receitawsKey: (0, mysql_core_1.text)("receitawsKey"), // opcional
  // Critérios de enriquecimento
  produtosPorMercado: (0, mysql_core_1.int)("produtosPorMercado")
    .default(3)
    .notNull(),
  concorrentesPorMercado: (0, mysql_core_1.int)("concorrentesPorMercado")
    .default(5)
    .notNull(),
  leadsPorMercado: (0, mysql_core_1.int)("leadsPorMercado")
    .default(5)
    .notNull(),
  // Configurações de processamento
  batchSize: (0, mysql_core_1.int)("batchSize").default(50).notNull(),
  checkpointInterval: (0, mysql_core_1.int)("checkpointInterval")
    .default(100)
    .notNull(),
  // Flags de funcionalidades
  enableDeduplication: (0, mysql_core_1.int)("enableDeduplication")
    .default(1)
    .notNull(), // 1 = ativo, 0 = inativo
  enableQualityScore: (0, mysql_core_1.int)("enableQualityScore")
    .default(1)
    .notNull(),
  enableAutoRetry: (0, mysql_core_1.int)("enableAutoRetry")
    .default(1)
    .notNull(),
  maxRetries: (0, mysql_core_1.int)("maxRetries").default(2).notNull(),
  // Metadata
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * ============================================
 * ANALYTICS TABLES - Lead Generation Intelligence
 * ============================================
 */
/**
 * Analytics por Mercado - Métricas agregadas por mercado
 */
exports.analyticsMercados = (0, mysql_core_1.mysqlTable)("analytics_mercados", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
  mercadoId: (0, mysql_core_1.int)("mercadoId").notNull(),
  periodo: (0, mysql_core_1.timestamp)("periodo").notNull(), // Data de referência
  // Métricas de Cobertura
  totalClientes: (0, mysql_core_1.int)("totalClientes").default(0),
  totalConcorrentes: (0, mysql_core_1.int)("totalConcorrentes").default(0),
  totalLeadsGerados: (0, mysql_core_1.int)("totalLeadsGerados").default(0),
  taxaCoberturaMercado: (0, mysql_core_1.int)("taxaCoberturaMercado").default(
    0
  ), // Percentual * 100
  // Métricas de Qualidade
  qualidadeMediaLeads: (0, mysql_core_1.int)("qualidadeMediaLeads").default(0), // Score médio * 100
  leadsAltaQualidade: (0, mysql_core_1.int)("leadsAltaQualidade").default(0), // score >= 80
  leadsMediaQualidade: (0, mysql_core_1.int)("leadsMediaQualidade").default(0), // score 50-79
  leadsBaixaQualidade: (0, mysql_core_1.int)("leadsBaixaQualidade").default(0), // score < 50
  // Métricas de Enriquecimento
  leadsEnriquecidos: (0, mysql_core_1.int)("leadsEnriquecidos").default(0),
  taxaSucessoEnriquecimento: (0, mysql_core_1.int)(
    "taxaSucessoEnriquecimento"
  ).default(0), // Percentual * 100
  tempoMedioEnriquecimentoMin: (0, mysql_core_1.int)(
    "tempoMedioEnriquecimentoMin"
  ).default(0), // Minutos * 100
  custoEnriquecimentoTotal: (0, mysql_core_1.int)(
    "custoEnriquecimentoTotal"
  ).default(0), // Centavos
  // Métricas de Validação
  leadsValidados: (0, mysql_core_1.int)("leadsValidados").default(0),
  leadsAprovados: (0, mysql_core_1.int)("leadsAprovados").default(0), // status: rich
  leadsDescartados: (0, mysql_core_1.int)("leadsDescartados").default(0), // status: discarded
  taxaAprovacao: (0, mysql_core_1.int)("taxaAprovacao").default(0), // Percentual * 100
  // Métricas de Exportação Salesforce (preparado para futuro)
  leadsExportadosSF: (0, mysql_core_1.int)("leadsExportadosSF").default(0),
  leadsConvertidosSF: (0, mysql_core_1.int)("leadsConvertidosSF").default(0),
  taxaConversaoSF: (0, mysql_core_1.int)("taxaConversaoSF").default(0), // Percentual * 100
  // Métricas de Esforço
  horasPesquisa: (0, mysql_core_1.int)("horasPesquisa").default(0), // Horas * 100
  custoTotal: (0, mysql_core_1.int)("custoTotal").default(0), // Centavos
  roi: (0, mysql_core_1.int)("roi").default(0), // ROI * 100 (pode ser negativo)
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Analytics por Pesquisa - Métricas agregadas por batch de pesquisa
 */
exports.analyticsPesquisas = (0, mysql_core_1.mysqlTable)(
  "analytics_pesquisas",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    pesquisaId: (0, mysql_core_1.int)("pesquisaId").notNull(),
    // Métricas Gerais
    totalMercadosMapeados: (0, mysql_core_1.int)(
      "totalMercadosMapeados"
    ).default(0),
    totalClientesBase: (0, mysql_core_1.int)("totalClientesBase").default(0),
    totalLeadsGerados: (0, mysql_core_1.int)("totalLeadsGerados").default(0),
    taxaConversaoClienteLead: (0, mysql_core_1.int)(
      "taxaConversaoClienteLead"
    ).default(0), // Percentual * 100
    // Qualidade Agregada
    qualidadeMediaGeral: (0, mysql_core_1.int)("qualidadeMediaGeral").default(
      0
    ), // Score médio * 100
    distribuicaoQualidade: (0, mysql_core_1.text)("distribuicaoQualidade"), // JSON: {alta: X, media: Y, baixa: Z}
    // Performance de Enriquecimento
    taxaSucessoEnriquecimento: (0, mysql_core_1.int)(
      "taxaSucessoEnriquecimento"
    ).default(0), // Percentual * 100
    tempoTotalEnriquecimentoHoras: (0, mysql_core_1.int)(
      "tempoTotalEnriquecimentoHoras"
    ).default(0), // Horas * 100
    custoTotalEnriquecimento: (0, mysql_core_1.int)(
      "custoTotalEnriquecimento"
    ).default(0), // Centavos
    // Resultados Salesforce (preparado para futuro)
    leadsExportadosSF: (0, mysql_core_1.int)("leadsExportadosSF").default(0),
    leadsConvertidosSF: (0, mysql_core_1.int)("leadsConvertidosSF").default(0),
    taxaConversaoSF: (0, mysql_core_1.int)("taxaConversaoSF").default(0), // Percentual * 100
    valorPipelineGerado: (0, mysql_core_1.int)("valorPipelineGerado").default(
      0
    ), // Centavos
    // ROI da Pesquisa
    custoTotalPesquisa: (0, mysql_core_1.int)("custoTotalPesquisa").default(0), // Centavos
    valorGerado: (0, mysql_core_1.int)("valorGerado").default(0), // Centavos
    roi: (0, mysql_core_1.int)("roi").default(0), // ROI * 100
    dataInicio: (0, mysql_core_1.timestamp)("dataInicio"),
    dataConclusao: (0, mysql_core_1.timestamp)("dataConclusao"),
    duracaoDias: (0, mysql_core_1.int)("duracaoDias").default(0),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  }
);
/**
 * Analytics por Dimensão - Eficácia por UF/Porte/Segmentação
 */
exports.analyticsDimensoes = (0, mysql_core_1.mysqlTable)(
  "analytics_dimensoes",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
    dimensaoTipo: (0, mysql_core_1.mysqlEnum)("dimensaoTipo", [
      "uf",
      "porte",
      "segmentacao",
      "categoria",
    ]).notNull(),
    dimensaoValor: (0, mysql_core_1.varchar)("dimensaoValor", {
      length: 100,
    }).notNull(), // ex: 'SP', 'Médio', 'B2B'
    totalLeads: (0, mysql_core_1.int)("totalLeads").default(0),
    qualidadeMedia: (0, mysql_core_1.int)("qualidadeMedia").default(0), // Score médio * 100
    taxaConversaoSF: (0, mysql_core_1.int)("taxaConversaoSF").default(0), // Percentual * 100
    custoMedioLead: (0, mysql_core_1.int)("custoMedioLead").default(0), // Centavos
    roi: (0, mysql_core_1.int)("roi").default(0), // ROI * 100
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  }
);
/**
 * Analytics Timeline - Evolução temporal diária
 */
exports.analyticsTimeline = (0, mysql_core_1.mysqlTable)("analytics_timeline", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  data: (0, mysql_core_1.timestamp)("data").notNull(),
  // Métricas Diárias
  leadsGeradosDia: (0, mysql_core_1.int)("leadsGeradosDia").default(0),
  leadsEnriquecidosDia: (0, mysql_core_1.int)("leadsEnriquecidosDia").default(
    0
  ),
  leadsValidadosDia: (0, mysql_core_1.int)("leadsValidadosDia").default(0),
  leadsExportadosSFDia: (0, mysql_core_1.int)("leadsExportadosSFDia").default(
    0
  ),
  qualidadeMediaDia: (0, mysql_core_1.int)("qualidadeMediaDia").default(0), // Score médio * 100
  custoDia: (0, mysql_core_1.int)("custoDia").default(0), // Centavos
  // Métricas Acumuladas
  leadsAcumulados: (0, mysql_core_1.int)("leadsAcumulados").default(0),
  custoAcumulado: (0, mysql_core_1.int)("custoAcumulado").default(0), // Centavos
  valorGeradoAcumulado: (0, mysql_core_1.int)("valorGeradoAcumulado").default(
    0
  ), // Centavos
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Operational Alerts - Alertas operacionais automáticos
 */
exports.operationalAlerts = (0, mysql_core_1.mysqlTable)("operational_alerts", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  alertType: (0, mysql_core_1.mysqlEnum)("alertType", [
    "qualidade_baixa",
    "enriquecimento_lento",
    "backlog_validacao",
    "custo_elevado",
    "conversao_sf_baixa",
  ]).notNull(),
  severity: (0, mysql_core_1.mysqlEnum)("severity", [
    "low",
    "medium",
    "high",
    "critical",
  ])
    .default("medium")
    .notNull(),
  titulo: (0, mysql_core_1.varchar)("titulo", { length: 255 }).notNull(),
  mensagem: (0, mysql_core_1.text)("mensagem").notNull(),
  acaoRecomendada: (0, mysql_core_1.text)("acaoRecomendada"),
  valorAtual: (0, mysql_core_1.text)("valorAtual"), // Valor que disparou o alerta
  valorEsperado: (0, mysql_core_1.text)("valorEsperado"), // Valor de referência
  isRead: (0, mysql_core_1.int)("isRead").default(0).notNull(), // 0 = não lido, 1 = lido
  isDismissed: (0, mysql_core_1.int)("isDismissed").default(0).notNull(), // 0 = ativo, 1 = dispensado
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  readAt: (0, mysql_core_1.timestamp)("readAt"),
  dismissedAt: (0, mysql_core_1.timestamp)("dismissedAt"),
});
/**
 * Recommendations - Recomendações automáticas
 */
exports.recommendations = (0, mysql_core_1.mysqlTable)("recommendations", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  tipo: (0, mysql_core_1.mysqlEnum)("tipo", [
    "mercado",
    "regiao",
    "metodologia",
    "filtro",
    "otimizacao",
  ]).notNull(),
  prioridade: (0, mysql_core_1.mysqlEnum)("prioridade", [
    "baixa",
    "media",
    "alta",
  ])
    .default("media")
    .notNull(),
  titulo: (0, mysql_core_1.varchar)("titulo", { length: 255 }).notNull(),
  descricao: (0, mysql_core_1.text)("descricao").notNull(),
  acao: (0, mysql_core_1.text)("acao").notNull(), // Texto acionável
  // Impacto Estimado
  leadsAdicionaisEstimado: (0, mysql_core_1.int)(
    "leadsAdicionaisEstimado"
  ).default(0),
  qualidadeEsperada: (0, mysql_core_1.int)("qualidadeEsperada").default(0), // Score * 100
  custoEstimado: (0, mysql_core_1.int)("custoEstimado").default(0), // Centavos
  roiEsperado: (0, mysql_core_1.int)("roiEsperado").default(0), // ROI * 100
  isApplied: (0, mysql_core_1.int)("isApplied").default(0).notNull(), // 0 = pendente, 1 = aplicada
  isDismissed: (0, mysql_core_1.int)("isDismissed").default(0).notNull(), // 0 = ativa, 1 = dispensada
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  appliedAt: (0, mysql_core_1.timestamp)("appliedAt"),
  dismissedAt: (0, mysql_core_1.timestamp)("dismissedAt"),
});
/**
 * Salesforce Sync Log - Histórico de exportações (preparado para futuro)
 */
exports.salesforceSyncLog = (0, mysql_core_1.mysqlTable)(
  "salesforce_sync_log",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    pesquisaId: (0, mysql_core_1.int)("pesquisaId"),
    syncType: (0, mysql_core_1.mysqlEnum)("syncType", ["manual", "automatico"])
      .default("manual")
      .notNull(),
    totalLeadsExportados: (0, mysql_core_1.int)("totalLeadsExportados").default(
      0
    ),
    totalLeadsSucesso: (0, mysql_core_1.int)("totalLeadsSucesso").default(0),
    totalLeadsErro: (0, mysql_core_1.int)("totalLeadsErro").default(0),
    status: (0, mysql_core_1.mysqlEnum)("status", [
      "em_progresso",
      "concluido",
      "erro",
    ])
      .default("em_progresso")
      .notNull(),
    errorMessage: (0, mysql_core_1.text)("errorMessage"),
    leadIds: (0, mysql_core_1.text)("leadIds"), // JSON array de IDs exportados
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    completedAt: (0, mysql_core_1.timestamp)("completedAt"),
  }
);
// ============================================
// MÓDULO DE EXPORTAÇÃO E INTELIGÊNCIA DE DADOS
// ============================================
/**
 * Histórico de exportações realizadas pelos usuários
 */
exports.exportHistory = (0, mysql_core_1.mysqlTable)("export_history", {
  id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
  userId: (0, mysql_core_1.varchar)("userId", { length: 64 }).notNull(),
  context: (0, mysql_core_1.text)("context"),
  filters: (0, mysql_core_1.json)("filters"),
  format: (0, mysql_core_1.mysqlEnum)("format", [
    "csv",
    "excel",
    "pdf",
    "json",
  ]).notNull(),
  outputType: (0, mysql_core_1.mysqlEnum)("outputType", [
    "simple",
    "complete",
    "report",
  ]).notNull(),
  recordCount: (0, mysql_core_1.int)("recordCount").notNull(),
  fileUrl: (0, mysql_core_1.text)("fileUrl").notNull(),
  fileSize: (0, mysql_core_1.int)("fileSize").notNull(),
  generationTime: (0, mysql_core_1.int)("generationTime"),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Filtros salvos pelos usuários para reutilização
 */
exports.savedFiltersExport = (0, mysql_core_1.mysqlTable)(
  "saved_filters_export",
  {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("userId", { length: 64 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    filters: (0, mysql_core_1.json)("filters").notNull(),
    isPublic: (0, mysql_core_1.boolean)("isPublic").default(false),
    shareToken: (0, mysql_core_1.varchar)("shareToken", { length: 64 }),
    usageCount: (0, mysql_core_1.int)("usageCount").default(0),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
  }
);
/**
 * Templates de relatórios (sistema e customizados)
 */
exports.exportTemplates = (0, mysql_core_1.mysqlTable)("export_templates", {
  id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
  name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
  description: (0, mysql_core_1.text)("description"),
  templateType: (0, mysql_core_1.mysqlEnum)("templateType", [
    "market",
    "client",
    "competitive",
    "lead",
  ]).notNull(),
  config: (0, mysql_core_1.json)("config").notNull(),
  isSystem: (0, mysql_core_1.boolean)("isSystem").default(false),
  userId: (0, mysql_core_1.varchar)("userId", { length: 64 }),
  usageCount: (0, mysql_core_1.int)("usageCount").default(0),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Cache de interpretações de contexto (otimização)
 */
exports.interpretationCache = (0, mysql_core_1.mysqlTable)(
  "interpretation_cache",
  {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    inputHash: (0, mysql_core_1.varchar)("inputHash", { length: 64 })
      .notNull()
      .unique(),
    input: (0, mysql_core_1.text)("input").notNull(),
    interpretation: (0, mysql_core_1.json)("interpretation").notNull(),
    hitCount: (0, mysql_core_1.int)("hitCount").default(0),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    expiresAt: (0, mysql_core_1.timestamp)("expiresAt").notNull(),
  }
);
/**
 * Cache de queries executadas (otimização)
 */
exports.queryCache = (0, mysql_core_1.mysqlTable)("query_cache", {
  id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
  queryHash: (0, mysql_core_1.varchar)("queryHash", { length: 64 })
    .notNull()
    .unique(),
  query: (0, mysql_core_1.text)("query").notNull(),
  results: (0, mysql_core_1.json)("results").notNull(),
  recordCount: (0, mysql_core_1.int)("recordCount").notNull(),
  hitCount: (0, mysql_core_1.int)("hitCount").default(0),
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  expiresAt: (0, mysql_core_1.timestamp)("expiresAt").notNull(),
});
// ============================================
// MÓDULO DE ADMIN LLM E ALERTAS INTELIGENTES
// ============================================
/**
 * LLM Provider Configs - Configuração de provedores de IA
 */
exports.llmProviderConfigs = (0, mysql_core_1.mysqlTable)(
  "llm_provider_configs",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    // Provedor ativo
    activeProvider: (0, mysql_core_1.mysqlEnum)("activeProvider", [
      "openai",
      "gemini",
      "anthropic",
    ])
      .default("openai")
      .notNull(),
    // Configurações OpenAI
    openaiApiKey: (0, mysql_core_1.text)("openaiApiKey"),
    openaiModel: (0, mysql_core_1.varchar)("openaiModel", {
      length: 100,
    }).default("gpt-4o"),
    openaiEnabled: (0, mysql_core_1.int)("openaiEnabled").default(1).notNull(),
    // Configurações Gemini
    geminiApiKey: (0, mysql_core_1.text)("geminiApiKey"),
    geminiModel: (0, mysql_core_1.varchar)("geminiModel", {
      length: 100,
    }).default("gemini-2.0-flash-exp"),
    geminiEnabled: (0, mysql_core_1.int)("geminiEnabled").default(0).notNull(),
    // Configurações Anthropic
    anthropicApiKey: (0, mysql_core_1.text)("anthropicApiKey"),
    anthropicModel: (0, mysql_core_1.varchar)("anthropicModel", {
      length: 100,
    }).default("claude-3-5-sonnet-20241022"),
    anthropicEnabled: (0, mysql_core_1.int)("anthropicEnabled")
      .default(0)
      .notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
  }
);
/**
 * Intelligent Alerts Config - Configuração de alertas inteligentes
 */
exports.intelligentAlertsConfigs = (0, mysql_core_1.mysqlTable)(
  "intelligent_alerts_configs",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull().unique(),
    // Thresholds
    circuitBreakerThreshold: (0, mysql_core_1.int)("circuitBreakerThreshold")
      .default(10)
      .notNull(),
    errorRateThreshold: (0, mysql_core_1.int)("errorRateThreshold")
      .default(10)
      .notNull(), // Percentual
    processingTimeThreshold: (0, mysql_core_1.int)("processingTimeThreshold")
      .default(60)
      .notNull(), // Segundos
    // Flags
    notifyOnCompletion: (0, mysql_core_1.int)("notifyOnCompletion")
      .default(1)
      .notNull(),
    notifyOnCircuitBreaker: (0, mysql_core_1.int)("notifyOnCircuitBreaker")
      .default(1)
      .notNull(),
    notifyOnErrorRate: (0, mysql_core_1.int)("notifyOnErrorRate")
      .default(1)
      .notNull(),
    notifyOnProcessingTime: (0, mysql_core_1.int)("notifyOnProcessingTime")
      .default(1)
      .notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
  }
);
/**
 * Intelligent Alerts History - Histórico de alertas disparados
 */
exports.intelligentAlertsHistory = (0, mysql_core_1.mysqlTable)(
  "intelligent_alerts_history",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    alertType: (0, mysql_core_1.mysqlEnum)("alertType", [
      "circuit_breaker",
      "error_rate",
      "processing_time",
      "completion",
    ]).notNull(),
    severity: (0, mysql_core_1.mysqlEnum)("severity", [
      "info",
      "warning",
      "critical",
    ])
      .default("info")
      .notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)("message").notNull(),
    // Métricas no momento do alerta
    metricValue: (0, mysql_core_1.text)("metricValue"), // Valor que disparou o alerta
    threshold: (0, mysql_core_1.text)("threshold"), // Threshold configurado
    // Contexto adicional
    jobId: (0, mysql_core_1.int)("jobId"),
    clientsProcessed: (0, mysql_core_1.int)("clientsProcessed"),
    totalClients: (0, mysql_core_1.int)("totalClients"),
    // Status
    isRead: (0, mysql_core_1.int)("isRead").default(0).notNull(),
    isDismissed: (0, mysql_core_1.int)("isDismissed").default(0).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    readAt: (0, mysql_core_1.timestamp)("readAt"),
    dismissedAt: (0, mysql_core_1.timestamp)("dismissedAt"),
  }
);
/**
 * ============================================
 * PROJECT AUDIT LOG - Fase 58.2
 * ============================================
 */
/**
 * Project Audit Log - Histórico completo de mudanças em projetos
 */
exports.projectAuditLog = (0, mysql_core_1.mysqlTable)("project_audit_log", {
  id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
  projectId: (0, mysql_core_1.int)("projectId").notNull(),
  userId: (0, mysql_core_1.varchar)("userId", { length: 64 }), // Quem fez a mudança
  action: (0, mysql_core_1.mysqlEnum)("action", [
    "created",
    "updated",
    "hibernated",
    "reactivated",
    "deleted",
  ]).notNull(),
  // Mudanças realizadas (JSON com before/after)
  changes: (0, mysql_core_1.text)("changes"), // JSON: { field: { before: X, after: Y } }
  // Metadados adicionais
  metadata: (0, mysql_core_1.text)("metadata"), // JSON com info extra (IP, user agent, etc)
  createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Hibernation Warnings - Avisos de hibernação automática
 * Fase 59.3: Sistema de Notificações Antes de Hibernar
 */
exports.hibernationWarnings = (0, mysql_core_1.mysqlTable)(
  "hibernation_warnings",
  {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    warningDate: (0, mysql_core_1.timestamp)("warningDate")
      .defaultNow()
      .notNull(),
    scheduledHibernationDate: (0, mysql_core_1.timestamp)(
      "scheduledHibernationDate"
    ).notNull(),
    daysInactive: (0, mysql_core_1.int)("daysInactive").notNull(),
    notificationSent: (0, mysql_core_1.int)("notificationSent")
      .default(0)
      .notNull(), // 0 = não enviado, 1 = enviado
    postponed: (0, mysql_core_1.int)("postponed").default(0).notNull(), // 0 = não adiado, 1 = adiado
    postponedUntil: (0, mysql_core_1.timestamp)("postponedUntil"),
    hibernated: (0, mysql_core_1.int)("hibernated").default(0).notNull(), // 0 = não hibernado, 1 = hibernado
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
  }
);
