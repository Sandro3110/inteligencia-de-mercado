"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichmentJobs = exports.leadsHistory = exports.concorrentesHistory = exports.clientesHistory = exports.mercadosHistory = exports.changeTypeEnum = exports.activityLog = exports.leadConversions = exports.conversionStatusEnum = exports.alertHistory = exports.alertConfigs = exports.scheduledEnrichments = exports.enrichmentRuns = exports.enrichmentStatusEnum = exports.enrichmentCache = exports.notifications = exports.projectTemplates = exports.savedFilters = exports.entityTags = exports.tags = exports.leads = exports.leadStageEnum = exports.concorrentes = exports.produtos = exports.clientesMercados = exports.clientes = exports.mercadosUnicos = exports.validationStatusEnum = exports.projects = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Core user table backing auth flow.
 */
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    name: (0, mysql_core_1.text)("name"),
    email: (0, mysql_core_1.varchar)("email", { length: 320 }),
    loginMethod: (0, mysql_core_1.varchar)("loginMethod", { length: 64 }),
    role: (0, mysql_core_1.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
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
    ativo: (0, mysql_core_1.int)("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
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
    clienteHash: (0, mysql_core_1.varchar)("clienteHash", { length: 255 }),
    nome: (0, mysql_core_1.varchar)("nome", { length: 255 }).notNull(),
    cnpj: (0, mysql_core_1.varchar)("cnpj", { length: 20 }),
    siteOficial: (0, mysql_core_1.varchar)("siteOficial", { length: 500 }),
    produtoPrincipal: (0, mysql_core_1.text)("produtoPrincipal"),
    segmentacaoB2bB2c: (0, mysql_core_1.varchar)("segmentacaoB2bB2c", { length: 20 }),
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
    qualidadeClassificacao: (0, mysql_core_1.varchar)("qualidadeClassificacao", { length: 50 }),
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
    concorrenteHash: (0, mysql_core_1.varchar)("concorrenteHash", { length: 255 }),
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
    qualidadeClassificacao: (0, mysql_core_1.varchar)("qualidadeClassificacao", { length: 50 }),
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
    qualidadeClassificacao: (0, mysql_core_1.varchar)("qualidadeClassificacao", { length: 50 }),
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
    tagId: (0, mysql_core_1.int)("tagId").notNull().references(() => exports.tags.id, { onDelete: "cascade" }),
    entityType: (0, mysql_core_1.mysqlEnum)("entityType", ["mercado", "cliente", "concorrente", "lead"]).notNull(),
    entityId: (0, mysql_core_1.int)("entityId").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
});
/**
 * Saved_Filters - User-saved filter combinations
 */
exports.savedFilters = (0, mysql_core_1.mysqlTable)("saved_filters", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.varchar)("userId", { length: 64 }).notNull().references(() => exports.users.id, { onDelete: "cascade" }),
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
    userId: (0, mysql_core_1.varchar)("userId", { length: 64 }).references(() => exports.users.id, { onDelete: "cascade" }),
    projectId: (0, mysql_core_1.int)("projectId").references(() => exports.projects.id, { onDelete: "cascade" }),
    type: (0, mysql_core_1.mysqlEnum)("type", ["lead_quality", "lead_closed", "new_competitor", "market_threshold", "data_incomplete"]).notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)("message").notNull(),
    entityType: (0, mysql_core_1.mysqlEnum)("entityType", ["mercado", "cliente", "concorrente", "lead"]),
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
    dataAtualizacao: (0, mysql_core_1.timestamp)("dataAtualizacao").defaultNow().notNull(),
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
    processedClients: (0, mysql_core_1.int)("processedClients").default(0).notNull(),
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
exports.scheduledEnrichments = (0, mysql_core_1.mysqlTable)("scheduled_enrichments", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    scheduledAt: (0, mysql_core_1.timestamp)("scheduledAt").notNull(),
    recurrence: (0, mysql_core_1.mysqlEnum)("recurrence", ["once", "daily", "weekly"]).default("once").notNull(),
    batchSize: (0, mysql_core_1.int)("batchSize").default(50),
    maxClients: (0, mysql_core_1.int)("maxClients"),
    timeout: (0, mysql_core_1.int)("timeout").default(3600), // segundos
    status: (0, mysql_core_1.mysqlEnum)("scheduleStatus", ["pending", "running", "completed", "cancelled", "error"]).default("pending").notNull(),
    errorMessage: (0, mysql_core_1.text)("errorMessage"),
    lastRunAt: (0, mysql_core_1.timestamp)("lastRunAt"),
    nextRunAt: (0, mysql_core_1.timestamp)("nextRunAt"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
/**
 * Alert Configs - Configurações de alertas personalizados
 */
exports.alertConfigs = (0, mysql_core_1.mysqlTable)("alert_configs", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)("projectId").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, mysql_core_1.mysqlEnum)("alertType", ["error_rate", "high_quality_lead", "market_threshold"]).notNull(),
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
    alertType: (0, mysql_core_1.mysqlEnum)("alertType", ["error_rate", "high_quality_lead", "market_threshold"]).notNull(),
    condition: (0, mysql_core_1.text)("condition").notNull(), // JSON da condição que disparou
    message: (0, mysql_core_1.text)("message").notNull(), // Mensagem enviada na notificação
    triggeredAt: (0, mysql_core_1.timestamp)("triggeredAt").defaultNow().notNull(),
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
    dealValue: (0, mysql_core_1.decimal)("dealValue", { precision: 15, scale: 2 }),
    convertedAt: (0, mysql_core_1.timestamp)("convertedAt").defaultNow().notNull(),
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
    activityType: (0, mysql_core_1.varchar)("activityType", { length: 50 }).notNull(),
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
exports.concorrentesHistory = (0, mysql_core_1.mysqlTable)("concorrentes_history", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    concorrenteId: (0, mysql_core_1.int)("concorrenteId").notNull(),
    field: (0, mysql_core_1.varchar)("field", { length: 100 }),
    oldValue: (0, mysql_core_1.text)("oldValue"),
    newValue: (0, mysql_core_1.text)("newValue"),
    changeType: exports.changeTypeEnum.default("updated"),
    changedBy: (0, mysql_core_1.varchar)("changedBy", { length: 64 }),
    changedAt: (0, mysql_core_1.timestamp)("changedAt").defaultNow(),
});
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
    status: (0, mysql_core_1.mysqlEnum)("status", ["pending", "running", "paused", "completed", "failed"]).default("pending").notNull(),
    totalClientes: (0, mysql_core_1.int)("totalClientes").notNull(),
    processedClientes: (0, mysql_core_1.int)("processedClientes").default(0).notNull(),
    successClientes: (0, mysql_core_1.int)("successClientes").default(0).notNull(),
    failedClientes: (0, mysql_core_1.int)("failedClientes").default(0).notNull(),
    currentBatch: (0, mysql_core_1.int)("currentBatch").default(0).notNull(),
    totalBatches: (0, mysql_core_1.int)("totalBatches").notNull(),
    batchSize: (0, mysql_core_1.int)("batchSize").default(5).notNull(),
    checkpointInterval: (0, mysql_core_1.int)("checkpointInterval").default(50).notNull(),
    startedAt: (0, mysql_core_1.timestamp)("startedAt"),
    pausedAt: (0, mysql_core_1.timestamp)("pausedAt"),
    completedAt: (0, mysql_core_1.timestamp)("completedAt"),
    estimatedTimeRemaining: (0, mysql_core_1.int)("estimatedTimeRemaining"), // em segundos
    lastClienteId: (0, mysql_core_1.int)("lastClienteId"), // último cliente processado (para retomar)
    errorMessage: (0, mysql_core_1.text)("errorMessage"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
});
