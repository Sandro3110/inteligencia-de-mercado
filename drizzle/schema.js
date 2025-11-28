"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInvites = exports.reportSchedules = exports.pushSubscriptions = exports.researchDrafts = exports.users = exports.tags = exports.scheduledEnrichments = exports.savedFilters = exports.salesforceSyncLog = exports.recommendations = exports.projects = exports.projectTemplates = exports.projectAuditLog = exports.produtos = exports.pesquisas = exports.operationalAlerts = exports.notificationPreferences = exports.notifications = exports.savedFiltersExport = exports.exportHistory = exports.mercadosUnicos = exports.mercadosHistory = exports.llmProviderConfigs = exports.leadsHistory = exports.leads = exports.leadConversions = exports.intelligentAlertsHistory = exports.intelligentAlertsConfigs = exports.hibernationWarnings = exports.entityTags = exports.enrichmentRuns = exports.enrichmentQueue = exports.enrichmentJobs = exports.systemSettings = exports.enrichmentConfigs = exports.enrichmentCache = exports.concorrentesHistory = exports.concorrentes = exports.clientesMercados = exports.clientesHistory = exports.clientes = exports.analyticsTimeline = exports.analyticsPesquisas = exports.analyticsMercados = exports.analyticsDimensoes = exports.alertHistory = exports.alertConfigs = exports.activityLog = exports.frequencyEnum = exports.progressStatusEnum = void 0;
exports.emailConfig = exports.loginAttempts = exports.passwordResets = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// Enum declarations
exports.progressStatusEnum = (0, pg_core_1.pgEnum)("progressStatus", [
    "started",
    "in_progress",
    "almost_done",
]);
exports.frequencyEnum = (0, pg_core_1.pgEnum)("frequency", ["weekly", "monthly"]);
exports.activityLog = (0, pg_core_1.pgTable)("activity_log", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    activityType: (0, pg_core_1.varchar)('activityType', { length: 50 }).notNull(),
    description: (0, pg_core_1.text)(),
    metadata: (0, pg_core_1.jsonb)(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_project").on(table.projectId),
    (0, pg_core_1.index)("idx_type").on(table.activityType),
    (0, pg_core_1.index)("idx_created").on(table.createdAt),
]; });
exports.alertConfigs = (0, pg_core_1.pgTable)("alert_configs", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    alertType: (0, pg_core_1.varchar)('alertType', { length: 50 }).notNull(),
    condition: (0, pg_core_1.text)().notNull(),
    enabled: (0, pg_core_1.smallint)().default(1).notNull(),
    lastTriggeredAt: (0, pg_core_1.timestamp)('lastTriggeredAt', { mode: "string" }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
});
exports.alertHistory = (0, pg_core_1.pgTable)("alert_history", {
    id: (0, pg_core_1.serial)(),
    alertConfigId: (0, pg_core_1.integer)('alertConfigId').notNull(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    alertType: (0, pg_core_1.varchar)('alertType', { length: 50 }).notNull(),
    condition: (0, pg_core_1.text)().notNull(),
    message: (0, pg_core_1.text)().notNull(),
    triggeredAt: (0, pg_core_1.timestamp)('triggeredAt', { mode: "string" })
        .defaultNow()
        .notNull(),
});
exports.analyticsDimensoes = (0, pg_core_1.pgTable)("analytics_dimensoes", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
    dimensaoTipo: (0, pg_core_1.varchar)('dimensaoTipo', { length: 50 }).notNull(),
    dimensaoValor: (0, pg_core_1.varchar)('dimensaoValor', { length: 100 }).notNull(),
    totalLeads: (0, pg_core_1.integer)('totalLeads').default(0),
    qualidadeMedia: (0, pg_core_1.integer)('qualidadeMedia').default(0),
    taxaConversaoSf: (0, pg_core_1.integer)('taxaConversaoSf').default(0),
    custoMedioLead: (0, pg_core_1.integer)('custoMedioLead').default(0),
    roi: (0, pg_core_1.integer)().default(0),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.analyticsMercados = (0, pg_core_1.pgTable)("analytics_mercados", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
    mercadoId: (0, pg_core_1.integer)('mercadoId').notNull(),
    periodo: (0, pg_core_1.timestamp)({ mode: "string" }).notNull(),
    totalClientes: (0, pg_core_1.integer)('totalClientes').default(0),
    totalConcorrentes: (0, pg_core_1.integer)('totalConcorrentes').default(0),
    totalLeadsGerados: (0, pg_core_1.integer)('totalLeadsGerados').default(0),
    taxaCoberturaMercado: (0, pg_core_1.integer)('taxaCoberturaMercado').default(0),
    qualidadeMediaLeads: (0, pg_core_1.integer)('qualidadeMediaLeads').default(0),
    leadsAltaQualidade: (0, pg_core_1.integer)('leadsAltaQualidade').default(0),
    leadsMediaQualidade: (0, pg_core_1.integer)('leadsMediaQualidade').default(0),
    leadsBaixaQualidade: (0, pg_core_1.integer)('leadsBaixaQualidade').default(0),
    leadsEnriquecidos: (0, pg_core_1.integer)('leadsEnriquecidos').default(0),
    taxaSucessoEnriquecimento: (0, pg_core_1.integer)('taxaSucessoEnriquecimento').default(0),
    tempoMedioEnriquecimentoMin: (0, pg_core_1.integer)('tempoMedioEnriquecimentoMin').default(0),
    custoEnriquecimentoTotal: (0, pg_core_1.integer)('custoEnriquecimentoTotal').default(0),
    leadsValidados: (0, pg_core_1.integer)('leadsValidados').default(0),
    leadsAprovados: (0, pg_core_1.integer)('leadsAprovados').default(0),
    leadsDescartados: (0, pg_core_1.integer)('leadsDescartados').default(0),
    taxaAprovacao: (0, pg_core_1.integer)('taxaAprovacao').default(0),
    leadsExportadosSf: (0, pg_core_1.integer)('leadsExportadosSf').default(0),
    leadsConvertidosSf: (0, pg_core_1.integer)('leadsConvertidosSf').default(0),
    taxaConversaoSf: (0, pg_core_1.integer)('taxaConversaoSf').default(0),
    horasPesquisa: (0, pg_core_1.integer)('horasPesquisa').default(0),
    custoTotal: (0, pg_core_1.integer)('custoTotal').default(0),
    roi: (0, pg_core_1.integer)().default(0),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.analyticsPesquisas = (0, pg_core_1.pgTable)("analytics_pesquisas", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId').notNull(),
    totalMercadosMapeados: (0, pg_core_1.integer)('totalMercadosMapeados').default(0),
    totalClientesBase: (0, pg_core_1.integer)('totalClientesBase').default(0),
    totalLeadsGerados: (0, pg_core_1.integer)('totalLeadsGerados').default(0),
    taxaConversaoClienteLead: (0, pg_core_1.integer)('taxaConversaoClienteLead').default(0),
    qualidadeMediaGeral: (0, pg_core_1.integer)('qualidadeMediaGeral').default(0),
    distribuicaoQualidade: (0, pg_core_1.text)('distribuicaoQualidade'),
    taxaSucessoEnriquecimento: (0, pg_core_1.integer)('taxaSucessoEnriquecimento').default(0),
    tempoTotalEnriquecimentoHoras: (0, pg_core_1.integer)('tempoTotalEnriquecimentoHoras').default(0),
    custoTotalEnriquecimento: (0, pg_core_1.integer)('custoTotalEnriquecimento').default(0),
    leadsExportadosSf: (0, pg_core_1.integer)('leadsExportadosSf').default(0),
    leadsConvertidosSf: (0, pg_core_1.integer)('leadsConvertidosSf').default(0),
    taxaConversaoSf: (0, pg_core_1.integer)('taxaConversaoSf').default(0),
    valorPipelineGerado: (0, pg_core_1.integer)('valorPipelineGerado').default(0),
    custoTotalPesquisa: (0, pg_core_1.integer)('custoTotalPesquisa').default(0),
    valorGerado: (0, pg_core_1.integer)('valorGerado').default(0),
    roi: (0, pg_core_1.integer)().default(0),
    dataInicio: (0, pg_core_1.timestamp)('dataInicio', { mode: "string" }),
    dataConclusao: (0, pg_core_1.timestamp)('dataConclusao', { mode: "string" }),
    duracaoDias: (0, pg_core_1.integer)('duracaoDias').default(0),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.analyticsTimeline = (0, pg_core_1.pgTable)("analytics_timeline", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    data: (0, pg_core_1.timestamp)({ mode: "string" }).notNull(),
    leadsGeradosDia: (0, pg_core_1.integer)('leadsGeradosDia').default(0),
    leadsEnriquecidosDia: (0, pg_core_1.integer)('leadsEnriquecidosDia').default(0),
    leadsValidadosDia: (0, pg_core_1.integer)('leadsValidadosDia').default(0),
    leadsExportadosSfDia: (0, pg_core_1.integer)('leadsExportadosSfDia').default(0),
    qualidadeMediaDia: (0, pg_core_1.integer)('qualidadeMediaDia').default(0),
    custoDia: (0, pg_core_1.integer)('custoDia').default(0),
    leadsAcumulados: (0, pg_core_1.integer)('leadsAcumulados').default(0),
    custoAcumulado: (0, pg_core_1.integer)('custoAcumulado').default(0),
    valorGeradoAcumulado: (0, pg_core_1.integer)('valorGeradoAcumulado').default(0),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.clientes = (0, pg_core_1.pgTable)("clientes", {
    id: (0, pg_core_1.serial)(),
    clienteHash: (0, pg_core_1.varchar)('clienteHash', { length: 255 }),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    cnpj: (0, pg_core_1.varchar)({ length: 20 }),
    siteOficial: (0, pg_core_1.varchar)('siteOficial', { length: 500 }),
    produtoPrincipal: (0, pg_core_1.text)('produtoPrincipal'),
    segmentacaoB2BB2C: (0, pg_core_1.varchar)('segmentacaoB2BB2C', { length: 20 }),
    email: (0, pg_core_1.varchar)({ length: 320 }),
    telefone: (0, pg_core_1.varchar)({ length: 50 }),
    linkedin: (0, pg_core_1.varchar)({ length: 500 }),
    instagram: (0, pg_core_1.varchar)({ length: 500 }),
    cidade: (0, pg_core_1.varchar)({ length: 100 }),
    uf: (0, pg_core_1.varchar)({ length: 2 }),
    cnae: (0, pg_core_1.varchar)({ length: 20 }),
    porte: (0, pg_core_1.varchar)({ length: 50 }),
    qualidadeScore: (0, pg_core_1.integer)('qualidadeScore'),
    qualidadeClassificacao: (0, pg_core_1.varchar)('qualidadeClassificacao', { length: 50 }),
    validationStatus: (0, pg_core_1.varchar)('validationStatus', { length: 50 }).default("pending"),
    validationNotes: (0, pg_core_1.text)('validationNotes'),
    validatedBy: (0, pg_core_1.varchar)('validatedBy', { length: 64 }),
    validatedAt: (0, pg_core_1.timestamp)('validatedAt', { mode: "string" }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    projectId: (0, pg_core_1.integer)('projectId').default(1).notNull(),
    regiao: (0, pg_core_1.varchar)({ length: 100 }),
    faturamentoDeclarado: (0, pg_core_1.text)('faturamentoDeclarado'),
    numeroEstabelecimentos: (0, pg_core_1.text)('numeroEstabelecimentos'),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
    latitude: (0, pg_core_1.numeric)({ precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.numeric)({ precision: 11, scale: 8 }),
    geocodedAt: (0, pg_core_1.timestamp)('geocodedAt', { mode: "string" }),
}, function (table) { return [
    (0, pg_core_1.index)("idx_clientes_projectId").on(table.projectId),
    (0, pg_core_1.index)("unique_cliente_hash").on(table.clienteHash),
]; });
exports.clientesHistory = (0, pg_core_1.pgTable)("clientes_history", {
    id: (0, pg_core_1.serial)(),
    clienteId: (0, pg_core_1.integer)('clienteId').notNull(),
    field: (0, pg_core_1.varchar)({ length: 100 }),
    oldValue: (0, pg_core_1.text)('oldValue'),
    newValue: (0, pg_core_1.text)('newValue'),
    changeType: (0, pg_core_1.varchar)('changeType', { length: 50 }).default("updated"),
    changedBy: (0, pg_core_1.varchar)('changedBy', { length: 64 }),
    changedAt: (0, pg_core_1.timestamp)('changedAt', { mode: "string" }).defaultNow(),
});
exports.clientesMercados = (0, pg_core_1.pgTable)("clientes_mercados", {
    id: (0, pg_core_1.serial)(),
    clienteId: (0, pg_core_1.integer)('clienteId').notNull(),
    mercadoId: (0, pg_core_1.integer)('mercadoId').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
}, function (table) { return [(0, pg_core_1.index)("idx_cliente_mercado").on(table.clienteId, table.mercadoId)]; });
exports.concorrentes = (0, pg_core_1.pgTable)("concorrentes", {
    id: (0, pg_core_1.serial)(),
    concorrenteHash: (0, pg_core_1.varchar)('concorrenteHash', { length: 255 }),
    mercadoId: (0, pg_core_1.integer)('mercadoId').notNull(),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    cnpj: (0, pg_core_1.varchar)({ length: 20 }),
    site: (0, pg_core_1.varchar)({ length: 500 }),
    produto: (0, pg_core_1.text)(),
    porte: (0, pg_core_1.varchar)({ length: 50 }),
    faturamentoEstimado: (0, pg_core_1.text)('faturamentoEstimado'),
    qualidadeScore: (0, pg_core_1.integer)('qualidadeScore'),
    qualidadeClassificacao: (0, pg_core_1.varchar)('qualidadeClassificacao', { length: 50 }),
    validationStatus: (0, pg_core_1.varchar)('validationStatus', { length: 50 }).default("pending"),
    validationNotes: (0, pg_core_1.text)('validationNotes'),
    validatedBy: (0, pg_core_1.varchar)('validatedBy', { length: 64 }),
    validatedAt: (0, pg_core_1.timestamp)('validatedAt', { mode: "string" }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    projectId: (0, pg_core_1.integer)('projectId').default(1).notNull(),
    cidade: (0, pg_core_1.varchar)({ length: 100 }),
    uf: (0, pg_core_1.varchar)({ length: 2 }),
    faturamentoDeclarado: (0, pg_core_1.text)('faturamentoDeclarado'),
    numeroEstabelecimentos: (0, pg_core_1.text)('numeroEstabelecimentos'),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
    latitude: (0, pg_core_1.numeric)({ precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.numeric)({ precision: 11, scale: 8 }),
    geocodedAt: (0, pg_core_1.timestamp)('geocodedAt', { mode: "string" }),
}, function (table) { return [
    (0, pg_core_1.index)("idx_concorrentes_projectId").on(table.projectId),
    (0, pg_core_1.index)("unique_concorrente_hash").on(table.concorrenteHash),
    (0, pg_core_1.index)("idx_concorrente_hash").on(table.concorrenteHash),
]; });
exports.concorrentesHistory = (0, pg_core_1.pgTable)("concorrentes_history", {
    id: (0, pg_core_1.serial)(),
    concorrenteId: (0, pg_core_1.integer)('concorrenteId').notNull(),
    field: (0, pg_core_1.varchar)({ length: 100 }),
    oldValue: (0, pg_core_1.text)('oldValue'),
    newValue: (0, pg_core_1.text)('newValue'),
    changeType: (0, pg_core_1.varchar)('changeType', { length: 50 }).default("updated"),
    changedBy: (0, pg_core_1.varchar)('changedBy', { length: 64 }),
    changedAt: (0, pg_core_1.timestamp)('changedAt', { mode: "string" }).defaultNow(),
});
exports.enrichmentCache = (0, pg_core_1.pgTable)("enrichment_cache", {
    cnpj: (0, pg_core_1.varchar)({ length: 14 }).notNull(),
    dadosJson: (0, pg_core_1.text)('dadosJson').notNull(),
    fonte: (0, pg_core_1.varchar)({ length: 50 }),
    dataAtualizacao: (0, pg_core_1.timestamp)('dataAtualizacao', { mode: "string" })
        .defaultNow()
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
}, function (table) { return [(0, pg_core_1.index)("idx_data_atualizacao").on(table.dataAtualizacao)]; });
exports.enrichmentConfigs = (0, pg_core_1.pgTable)("enrichment_configs", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    openaiApiKey: (0, pg_core_1.text)('openaiApiKey'),
    serpapiKey: (0, pg_core_1.text)('serpapiKey'),
    receitawsKey: (0, pg_core_1.text)('receitawsKey'),
    produtosPorMercado: (0, pg_core_1.integer)('produtosPorMercado').default(3).notNull(),
    concorrentesPorMercado: (0, pg_core_1.integer)('concorrentesPorMercado').default(5).notNull(),
    leadsPorMercado: (0, pg_core_1.integer)('leadsPorMercado').default(5).notNull(),
    batchSize: (0, pg_core_1.integer)('batchSize').default(50).notNull(),
    checkpointInterval: (0, pg_core_1.integer)('checkpointInterval').default(100).notNull(),
    enableDeduplication: (0, pg_core_1.integer)('enableDeduplication').default(1).notNull(),
    enableQualityScore: (0, pg_core_1.integer)('enableQualityScore').default(1).notNull(),
    enableAutoRetry: (0, pg_core_1.integer)('enableAutoRetry').default(1).notNull(),
    maxRetries: (0, pg_core_1.integer)('maxRetries').default(2).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    geminiApiKey: (0, pg_core_1.text)('geminiApiKey'),
    anthropicApiKey: (0, pg_core_1.text)('anthropicApiKey'),
    googleMapsApiKey: (0, pg_core_1.text)('googleMapsApiKey'),
}, function (table) { return [(0, pg_core_1.index)("projectId").on(table.projectId)]; });
exports.systemSettings = (0, pg_core_1.pgTable)("system_settings", {
    id: (0, pg_core_1.serial)(),
    settingKey: (0, pg_core_1.varchar)('settingKey', { length: 100 }).notNull(),
    settingValue: (0, pg_core_1.text)('settingValue'),
    description: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
}, function (table) { return [(0, pg_core_1.index)("idx_setting_key").on(table.settingKey)]; });
exports.enrichmentJobs = (0, pg_core_1.pgTable)("enrichment_jobs", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    status: (0, pg_core_1.varchar)({ length: 50 })
        .default("pending")
        .notNull(),
    totalClientes: (0, pg_core_1.integer)('totalClientes').notNull(),
    processedClientes: (0, pg_core_1.integer)('processedClientes').default(0).notNull(),
    successClientes: (0, pg_core_1.integer)('successClientes').default(0).notNull(),
    failedClientes: (0, pg_core_1.integer)('failedClientes').default(0).notNull(),
    currentBatch: (0, pg_core_1.integer)('currentBatch').default(0).notNull(),
    totalBatches: (0, pg_core_1.integer)('totalBatches').notNull(),
    batchSize: (0, pg_core_1.integer)('batchSize').default(5).notNull(),
    checkpointInterval: (0, pg_core_1.integer)('checkpointInterval').default(50).notNull(),
    startedAt: (0, pg_core_1.timestamp)('startedAt', { mode: "string" }),
    pausedAt: (0, pg_core_1.timestamp)('pausedAt', { mode: "string" }),
    completedAt: (0, pg_core_1.timestamp)('completedAt', { mode: "string" }),
    estimatedTimeRemaining: (0, pg_core_1.integer)('estimatedTimeRemaining'),
    lastClienteId: (0, pg_core_1.integer)('lastClienteId'),
    errorMessage: (0, pg_core_1.text)('errorMessage'),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
});
exports.enrichmentQueue = (0, pg_core_1.pgTable)("enrichment_queue", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId')
        .notNull()
        .references(function () { return exports.projects.id; }, { onDelete: "cascade" }),
    status: (0, pg_core_1.varchar)({ length: 50 }).default("pending"),
    priority: (0, pg_core_1.integer)().default(0),
    clienteData: (0, pg_core_1.jsonb)('clienteData').notNull(),
    result: (0, pg_core_1.jsonb)(),
    errorMessage: (0, pg_core_1.text)('errorMessage'),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    startedAt: (0, pg_core_1.timestamp)('startedAt', { mode: "string" }),
    completedAt: (0, pg_core_1.timestamp)('completedAt', { mode: "string" }),
}, function (table) { return [
    (0, pg_core_1.index)("idx_queue_status").on(table.status),
    (0, pg_core_1.index)("idx_queue_project").on(table.projectId),
    (0, pg_core_1.index)("idx_queue_priority").on(table.priority),
]; });
exports.enrichmentRuns = (0, pg_core_1.pgTable)("enrichment_runs", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    startedAt: (0, pg_core_1.timestamp)('startedAt', { mode: "string" })
        .defaultNow()
        .notNull(),
    completedAt: (0, pg_core_1.timestamp)('completedAt', { mode: "string" }),
    totalClients: (0, pg_core_1.integer)('totalClients').notNull(),
    processedClients: (0, pg_core_1.integer)('processedClients').default(0).notNull(),
    status: (0, pg_core_1.varchar)({ length: 50 })
        .default("running")
        .notNull(),
    durationSeconds: (0, pg_core_1.integer)('durationSeconds'),
    errorMessage: (0, pg_core_1.text)('errorMessage'),
    notifiedAt50: (0, pg_core_1.integer)('notifiedAt50').default(0).notNull(),
    notifiedAt75: (0, pg_core_1.integer)('notifiedAt75').default(0).notNull(),
    notifiedAt100: (0, pg_core_1.integer)('notifiedAt100').default(0).notNull(),
});
exports.entityTags = (0, pg_core_1.pgTable)("entity_tags", {
    id: (0, pg_core_1.serial)(),
    tagId: (0, pg_core_1.integer)('tagId').notNull(),
    entityType: (0, pg_core_1.varchar)('entityType', { length: 50 }).notNull(),
    entityId: (0, pg_core_1.integer)('entityId').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.hibernationWarnings = (0, pg_core_1.pgTable)("hibernation_warnings", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    warningDate: (0, pg_core_1.timestamp)('warningDate', { mode: "string" })
        .defaultNow()
        .notNull(),
    scheduledHibernationDate: (0, pg_core_1.timestamp)('scheduledHibernationDate', { mode: "string" }).notNull(),
    daysInactive: (0, pg_core_1.integer)('daysInactive').notNull(),
    notificationSent: (0, pg_core_1.integer)('notificationSent').default(0).notNull(),
    postponed: (0, pg_core_1.integer)().default(0).notNull(),
    postponedUntil: (0, pg_core_1.timestamp)('postponedUntil', { mode: "string" }),
    hibernated: (0, pg_core_1.integer)().default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.intelligentAlertsConfigs = (0, pg_core_1.pgTable)("intelligent_alerts_configs", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    circuitBreakerThreshold: (0, pg_core_1.integer)('circuitBreakerThreshold').default(10).notNull(),
    errorRateThreshold: (0, pg_core_1.integer)('errorRateThreshold').default(10).notNull(),
    processingTimeThreshold: (0, pg_core_1.integer)('processingTimeThreshold').default(60).notNull(),
    notifyOnCompletion: (0, pg_core_1.integer)('notifyOnCompletion').default(1).notNull(),
    notifyOnCircuitBreaker: (0, pg_core_1.integer)('notifyOnCircuitBreaker').default(1).notNull(),
    notifyOnErrorRate: (0, pg_core_1.integer)('notifyOnErrorRate').default(1).notNull(),
    notifyOnProcessingTime: (0, pg_core_1.integer)('notifyOnProcessingTime').default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("intelligent_alerts_configs_projectId_unique").on(table.projectId),
]; });
exports.intelligentAlertsHistory = (0, pg_core_1.pgTable)("intelligent_alerts_history", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    alertType: (0, pg_core_1.varchar)('alertType', { length: 50 }).notNull(),
    severity: (0, pg_core_1.varchar)({ length: 50 })
        .default("info")
        .notNull(),
    title: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    message: (0, pg_core_1.text)().notNull(),
    metricValue: (0, pg_core_1.text)('metricValue'),
    threshold: (0, pg_core_1.text)(),
    jobId: (0, pg_core_1.integer)('jobId'),
    clientsProcessed: (0, pg_core_1.integer)('clientsProcessed'),
    totalClients: (0, pg_core_1.integer)('totalClients'),
    isRead: (0, pg_core_1.integer)('isRead').default(0).notNull(),
    isDismissed: (0, pg_core_1.integer)('isDismissed').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    readAt: (0, pg_core_1.timestamp)('readAt', { mode: "string" }),
    dismissedAt: (0, pg_core_1.timestamp)('dismissedAt', { mode: "string" }),
});
exports.leadConversions = (0, pg_core_1.pgTable)("lead_conversions", {
    id: (0, pg_core_1.serial)(),
    leadId: (0, pg_core_1.integer)('leadId').notNull(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    dealValue: (0, pg_core_1.numeric)('deal_value', { precision: 15, scale: 2 }),
    convertedAt: (0, pg_core_1.timestamp)('convertedAt', { mode: "string" }).defaultNow(),
    notes: (0, pg_core_1.text)(),
    status: (0, pg_core_1.varchar)({ length: 50 }).default("won"),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.leads = (0, pg_core_1.pgTable)("leads", {
    id: (0, pg_core_1.serial)(),
    leadHash: (0, pg_core_1.varchar)('leadHash', { length: 255 }),
    mercadoId: (0, pg_core_1.integer)('mercadoId').notNull(),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    cnpj: (0, pg_core_1.varchar)({ length: 20 }),
    site: (0, pg_core_1.varchar)({ length: 500 }),
    email: (0, pg_core_1.varchar)({ length: 320 }),
    telefone: (0, pg_core_1.varchar)({ length: 50 }),
    tipo: (0, pg_core_1.varchar)({ length: 20 }),
    porte: (0, pg_core_1.varchar)({ length: 50 }),
    regiao: (0, pg_core_1.varchar)({ length: 100 }),
    setor: (0, pg_core_1.varchar)({ length: 100 }),
    qualidadeScore: (0, pg_core_1.integer)('qualidadeScore'),
    qualidadeClassificacao: (0, pg_core_1.varchar)('qualidadeClassificacao', { length: 50 }),
    leadStage: (0, pg_core_1.varchar)('leadStage', { length: 50 }).default("novo"),
    stageUpdatedAt: (0, pg_core_1.timestamp)('stageUpdatedAt', { mode: "string" }).defaultNow(),
    validationStatus: (0, pg_core_1.varchar)('validationStatus', { length: 50 }).default("pending"),
    validationNotes: (0, pg_core_1.text)('validationNotes'),
    validatedBy: (0, pg_core_1.varchar)('validatedBy', { length: 64 }),
    validatedAt: (0, pg_core_1.timestamp)('validatedAt', { mode: "string" }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    projectId: (0, pg_core_1.integer)('projectId').default(1).notNull(),
    cidade: (0, pg_core_1.varchar)({ length: 100 }),
    uf: (0, pg_core_1.varchar)({ length: 2 }),
    faturamentoDeclarado: (0, pg_core_1.text)('faturamentoDeclarado'),
    numeroEstabelecimentos: (0, pg_core_1.text)('numeroEstabelecimentos'),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
    stage: (0, pg_core_1.varchar)({ length: 50 }).default("novo"),
    latitude: (0, pg_core_1.numeric)({ precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.numeric)({ precision: 11, scale: 8 }),
    geocodedAt: (0, pg_core_1.timestamp)('geocodedAt', { mode: "string" }),
}, function (table) { return [
    (0, pg_core_1.index)("idx_leads_projectId").on(table.projectId),
    (0, pg_core_1.index)("unique_lead_hash").on(table.leadHash),
    (0, pg_core_1.index)("idx_lead_hash").on(table.leadHash),
]; });
exports.leadsHistory = (0, pg_core_1.pgTable)("leads_history", {
    id: (0, pg_core_1.serial)(),
    leadId: (0, pg_core_1.integer)('leadId').notNull(),
    field: (0, pg_core_1.varchar)({ length: 100 }),
    oldValue: (0, pg_core_1.text)('oldValue'),
    newValue: (0, pg_core_1.text)('newValue'),
    changeType: (0, pg_core_1.varchar)('changeType', { length: 50 }).default("updated"),
    changedBy: (0, pg_core_1.varchar)('changedBy', { length: 64 }),
    changedAt: (0, pg_core_1.timestamp)('changedAt', { mode: "string" }).defaultNow(),
});
exports.llmProviderConfigs = (0, pg_core_1.pgTable)("llm_provider_configs", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    activeProvider: (0, pg_core_1.varchar)('activeProvider', { length: 50 })
        .default("openai")
        .notNull(),
    openaiApiKey: (0, pg_core_1.text)('openaiApiKey'),
    openaiModel: (0, pg_core_1.varchar)('openaiModel', { length: 100 }).default("gpt-4o"),
    openaiEnabled: (0, pg_core_1.integer)('openaiEnabled').default(1).notNull(),
    geminiApiKey: (0, pg_core_1.text)('geminiApiKey'),
    geminiModel: (0, pg_core_1.varchar)('geminiModel', { length: 100 }).default("gemini-2.0-flash-exp"),
    geminiEnabled: (0, pg_core_1.integer)('geminiEnabled').default(0).notNull(),
    anthropicApiKey: (0, pg_core_1.text)('anthropicApiKey'),
    anthropicModel: (0, pg_core_1.varchar)('anthropicModel', { length: 100 }).default("claude-3-5-sonnet-20241022"),
    anthropicEnabled: (0, pg_core_1.integer)('anthropicEnabled').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
});
exports.mercadosHistory = (0, pg_core_1.pgTable)("mercados_history", {
    id: (0, pg_core_1.serial)(),
    mercadoId: (0, pg_core_1.integer)('mercadoId').notNull(),
    field: (0, pg_core_1.varchar)({ length: 100 }),
    oldValue: (0, pg_core_1.text)('oldValue'),
    newValue: (0, pg_core_1.text)('newValue'),
    changeType: (0, pg_core_1.varchar)('changeType', { length: 50 }).default("updated"),
    changedBy: (0, pg_core_1.varchar)('changedBy', { length: 64 }),
    changedAt: (0, pg_core_1.timestamp)('changedAt', { mode: "string" }).defaultNow(),
});
exports.mercadosUnicos = (0, pg_core_1.pgTable)("mercados_unicos", {
    id: (0, pg_core_1.serial)(),
    mercadoHash: (0, pg_core_1.varchar)('mercadoHash', { length: 255 }),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    segmentacao: (0, pg_core_1.varchar)({ length: 50 }),
    categoria: (0, pg_core_1.varchar)({ length: 100 }),
    tamanhoMercado: (0, pg_core_1.text)('tamanhoMercado'),
    crescimentoAnual: (0, pg_core_1.text)('crescimentoAnual'),
    tendencias: (0, pg_core_1.text)(),
    principaisPlayers: (0, pg_core_1.text)('principaisPlayers'),
    quantidadeClientes: (0, pg_core_1.integer)('quantidadeClientes').default(0),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    projectId: (0, pg_core_1.integer)('projectId').default(1).notNull(),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
}, function (table) { return [
    (0, pg_core_1.index)("idx_mercados_projectId").on(table.projectId),
    (0, pg_core_1.index)("unique_mercado_hash").on(table.mercadoHash),
    (0, pg_core_1.index)("idx_mercado_hash").on(table.mercadoHash),
]; });
exports.exportHistory = (0, pg_core_1.pgTable)("export_history", {
    id: (0, pg_core_1.varchar)({ length: 64 }).primaryKey(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 })
        .references(function () { return exports.users.id; }, { onDelete: "cascade" })
        .notNull(),
    projectId: (0, pg_core_1.integer)('projectId').references(function () { return exports.projects.id; }, { onDelete: "cascade" }),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId').references(function () { return exports.pesquisas.id; }, { onDelete: "cascade" }),
    context: (0, pg_core_1.text)(),
    filters: (0, pg_core_1.jsonb)(),
    format: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    outputType: (0, pg_core_1.varchar)('outputType', { length: 50 }).notNull(),
    recordCount: (0, pg_core_1.integer)('recordCount').default(0).notNull(),
    fileUrl: (0, pg_core_1.text)('fileUrl'),
    fileSize: (0, pg_core_1.integer)('fileSize').default(0),
    generationTime: (0, pg_core_1.integer)('generationTime').default(0),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_export_user").on(table.userId),
    (0, pg_core_1.index)("idx_export_project").on(table.projectId),
    (0, pg_core_1.index)("idx_export_created").on(table.createdAt),
]; });
exports.savedFiltersExport = (0, pg_core_1.pgTable)("saved_filters_export", {
    id: (0, pg_core_1.serial)(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 })
        .references(function () { return exports.users.id; }, { onDelete: "cascade" })
        .notNull(),
    projectId: (0, pg_core_1.integer)('projectId').references(function () { return exports.projects.id; }, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    description: (0, pg_core_1.text)(),
    entityType: (0, pg_core_1.varchar)('entityType', { length: 50 }).notNull(),
    filters: (0, pg_core_1.jsonb)().notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_saved_filter_user").on(table.userId),
    (0, pg_core_1.index)("idx_saved_filter_project").on(table.projectId),
]; });
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.serial)(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 }).references(function () { return exports.users.id; }, {
        onDelete: "cascade",
    }),
    projectId: (0, pg_core_1.integer)('projectId').references(function () { return exports.projects.id; }, { onDelete: "cascade" }),
    type: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    message: (0, pg_core_1.text)().notNull(),
    entityType: (0, pg_core_1.varchar)('entityType', { length: 50 }),
    entityId: (0, pg_core_1.integer)('entityId'),
    isRead: (0, pg_core_1.integer)('isRead').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.notificationPreferences = (0, pg_core_1.pgTable)("notification_preferences", {
    id: (0, pg_core_1.serial)(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 })
        .references(function () { return exports.users.id; }, { onDelete: "cascade" })
        .notNull(),
    type: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    enabled: (0, pg_core_1.integer)().default(1).notNull(),
    channels: (0, pg_core_1.jsonb)()
        .$type()
        .default({ inApp: true }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
}, function (table) { return [(0, pg_core_1.index)("idx_user_type").on(table.userId, table.type)]; });
exports.operationalAlerts = (0, pg_core_1.pgTable)("operational_alerts", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    alertType: (0, pg_core_1.varchar)('alertType', { length: 50 }).notNull(),
    severity: (0, pg_core_1.varchar)({ length: 50 })
        .default("medium")
        .notNull(),
    titulo: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    mensagem: (0, pg_core_1.text)().notNull(),
    acaoRecomendada: (0, pg_core_1.text)('acaoRecomendada'),
    valorAtual: (0, pg_core_1.text)('valorAtual'),
    valorEsperado: (0, pg_core_1.text)('valorEsperado'),
    isRead: (0, pg_core_1.integer)('isRead').default(0).notNull(),
    isDismissed: (0, pg_core_1.integer)('isDismissed').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    readAt: (0, pg_core_1.timestamp)('readAt', { mode: "string" }),
    dismissedAt: (0, pg_core_1.timestamp)('dismissedAt', { mode: "string" }),
});
exports.pesquisas = (0, pg_core_1.pgTable)("pesquisas", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)(),
    dataImportacao: (0, pg_core_1.timestamp)('dataImportacao', { mode: "string" }).defaultNow(),
    totalClientes: (0, pg_core_1.integer)('totalClientes').default(0),
    clientesEnriquecidos: (0, pg_core_1.integer)('clientesEnriquecidos').default(0),
    status: (0, pg_core_1.varchar)({ length: 50 }).default("importado"),
    ativo: (0, pg_core_1.integer)().default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    qtdConcorrentesPorMercado: (0, pg_core_1.integer)('qtdConcorrentesPorMercado').default(5),
    qtdLeadsPorMercado: (0, pg_core_1.integer)('qtdLeadsPorMercado').default(10),
    qtdProdutosPorCliente: (0, pg_core_1.integer)('qtdProdutosPorCliente').default(3),
});
exports.produtos = (0, pg_core_1.pgTable)("produtos", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    clienteId: (0, pg_core_1.integer)('clienteId').notNull(),
    mercadoId: (0, pg_core_1.integer)('mercadoId').notNull(),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)(),
    categoria: (0, pg_core_1.varchar)({ length: 100 }),
    preco: (0, pg_core_1.text)(),
    unidade: (0, pg_core_1.varchar)({ length: 50 }),
    ativo: (0, pg_core_1.integer)().default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
}, function (table) { return [
    (0, pg_core_1.index)("idx_produto_unique").on(table.clienteId, table.mercadoId, table.nome),
]; });
exports.projectAuditLog = (0, pg_core_1.pgTable)("project_audit_log", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 }),
    action: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    changes: (0, pg_core_1.text)(),
    metadata: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.projectTemplates = (0, pg_core_1.pgTable)("project_templates", {
    id: (0, pg_core_1.serial)(),
    name: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    description: (0, pg_core_1.text)(),
    config: (0, pg_core_1.text)().notNull(),
    isDefault: (0, pg_core_1.integer)('isDefault').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
});
exports.projects = (0, pg_core_1.pgTable)("projects", {
    id: (0, pg_core_1.serial)(),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)(),
    cor: (0, pg_core_1.varchar)({ length: 7 }).default("#3b82f6"),
    ativo: (0, pg_core_1.integer)().default(1).notNull(),
    status: (0, pg_core_1.varchar)({ length: 50 }).default("active").notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
    executionMode: (0, pg_core_1.varchar)('executionMode', { length: 50 }).default("sequential"),
    maxParallelJobs: (0, pg_core_1.integer)('maxParallelJobs').default(3),
    isPaused: (0, pg_core_1.integer)('isPaused').default(0),
    lastActivityAt: (0, pg_core_1.timestamp)('lastActivityAt', { mode: "string" }).defaultNow(),
});
exports.recommendations = (0, pg_core_1.pgTable)("recommendations", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    tipo: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    prioridade: (0, pg_core_1.varchar)({ length: 50 }).default("media").notNull(),
    titulo: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)().notNull(),
    acao: (0, pg_core_1.text)().notNull(),
    leadsAdicionaisEstimado: (0, pg_core_1.integer)('leadsAdicionaisEstimado').default(0),
    qualidadeEsperada: (0, pg_core_1.integer)('qualidadeEsperada').default(0),
    custoEstimado: (0, pg_core_1.integer)('custoEstimado').default(0),
    roiEsperado: (0, pg_core_1.integer)('roiEsperado').default(0),
    isApplied: (0, pg_core_1.integer)('isApplied').default(0).notNull(),
    isDismissed: (0, pg_core_1.integer)('isDismissed').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    appliedAt: (0, pg_core_1.timestamp)('appliedAt', { mode: "string" }),
    dismissedAt: (0, pg_core_1.timestamp)('dismissedAt', { mode: "string" }),
});
exports.salesforceSyncLog = (0, pg_core_1.pgTable)("salesforce_sync_log", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    pesquisaId: (0, pg_core_1.integer)('pesquisaId'),
    syncType: (0, pg_core_1.varchar)('syncType', { length: 50 }).default("manual").notNull(),
    totalLeadsExportados: (0, pg_core_1.integer)('totalLeadsExportados').default(0),
    totalLeadsSucesso: (0, pg_core_1.integer)('totalLeadsSucesso').default(0),
    totalLeadsErro: (0, pg_core_1.integer)('totalLeadsErro').default(0),
    status: (0, pg_core_1.varchar)({ length: 50 })
        .default("em_progresso")
        .notNull(),
    errorMessage: (0, pg_core_1.text)('errorMessage'),
    leadIds: (0, pg_core_1.text)('leadIds'),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completedAt', { mode: "string" }),
});
exports.savedFilters = (0, pg_core_1.pgTable)("saved_filters", {
    id: (0, pg_core_1.serial)(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 }).notNull(),
    name: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    filtersJson: (0, pg_core_1.text)('filtersJson').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    projectId: (0, pg_core_1.integer)('projectId'),
    isPublic: (0, pg_core_1.integer)('isPublic').default(0).notNull(),
    shareToken: (0, pg_core_1.varchar)('shareToken', { length: 64 }),
});
exports.scheduledEnrichments = (0, pg_core_1.pgTable)("scheduled_enrichments", {
    id: (0, pg_core_1.serial)(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    scheduledAt: (0, pg_core_1.timestamp)('scheduledAt', { mode: "string" }).notNull(),
    recurrence: (0, pg_core_1.varchar)({ length: 50 }).default("once").notNull(),
    batchSize: (0, pg_core_1.integer)('batchSize').default(50),
    maxClients: (0, pg_core_1.integer)('maxClients'),
    timeout: (0, pg_core_1.integer)().default(3600),
    status: (0, pg_core_1.varchar)({ length: 50 })
        .default("pending")
        .notNull(),
    errorMessage: (0, pg_core_1.text)('errorMessage'),
    lastRunAt: (0, pg_core_1.timestamp)('lastRunAt', { mode: "string" }),
    nextRunAt: (0, pg_core_1.timestamp)('nextRunAt', { mode: "string" }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
});
exports.tags = (0, pg_core_1.pgTable)("tags", {
    id: (0, pg_core_1.serial)(),
    name: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    color: (0, pg_core_1.varchar)({ length: 7 }).default("#3b82f6"),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)({ length: 64 }).primaryKey().notNull(),
    email: (0, pg_core_1.varchar)({ length: 320 }).unique().notNull(),
    nome: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    empresa: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    cargo: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    setor: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    senhaHash: (0, pg_core_1.varchar)('senhaHash', { length: 255 }).notNull(),
    role: (0, pg_core_1.varchar)({ length: 50 }).default("visualizador").notNull(),
    ativo: (0, pg_core_1.smallint)().default(0).notNull(),
    liberadoPor: (0, pg_core_1.varchar)('liberadoPor', { length: 64 }),
    liberadoEm: (0, pg_core_1.timestamp)('liberadoEm', { mode: "string" }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    lastSignedIn: (0, pg_core_1.timestamp)('lastSignedIn', { mode: "string" }),
}, function (table) { return [
    (0, pg_core_1.index)("idx_email").on(table.email),
    (0, pg_core_1.index)("idx_ativo").on(table.ativo),
    (0, pg_core_1.index)("idx_role").on(table.role),
]; });
// ========================================
// RESEARCH DRAFTS (Auto-save do Wizard)
// Fase 60.1
// ========================================
exports.researchDrafts = (0, pg_core_1.pgTable)("research_drafts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("userId", { length: 64 }).notNull(),
    projectId: (0, pg_core_1.integer)("projectId"),
    draftData: (0, pg_core_1.jsonb)("draftData").notNull(),
    currentStep: (0, pg_core_1.integer)("currentStep").default(1).notNull(),
    progressStatus: (0, exports.progressStatusEnum)("progressStatus").default("started"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// ========================================
// PUSH SUBSCRIPTIONS (Web Push API)
// Fase 66.2
// ========================================
exports.pushSubscriptions = (0, pg_core_1.pgTable)("push_subscriptions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("userId", { length: 64 }).notNull(),
    endpoint: (0, pg_core_1.text)("endpoint").notNull(),
    p256dh: (0, pg_core_1.text)("p256dh").notNull(),
    auth: (0, pg_core_1.text)("auth").notNull(),
    userAgent: (0, pg_core_1.text)("userAgent"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    lastUsedAt: (0, pg_core_1.timestamp)("lastUsedAt").defaultNow(),
}, function (table) { return [(0, pg_core_1.index)("idx_userId").on(table.userId)]; });
// ========================================
// REPORT SCHEDULES (Agendamento de Relatórios)
// Fase 65.1
// ========================================
exports.reportSchedules = (0, pg_core_1.pgTable)("report_schedules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("userId", { length: 64 }).notNull(),
    projectId: (0, pg_core_1.integer)("projectId").notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    frequency: (0, exports.frequencyEnum)("frequency").notNull(),
    recipients: (0, pg_core_1.text)("recipients").notNull(), // JSON array de emails
    config: (0, pg_core_1.jsonb)("config").notNull(), // Configurações do relatório (filtros, formato, etc)
    nextRunAt: (0, pg_core_1.timestamp)("nextRunAt", { mode: "string" }).notNull(),
    lastRunAt: (0, pg_core_1.timestamp)("lastRunAt", { mode: "string" }),
    enabled: (0, pg_core_1.smallint)("enabled").default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_userId").on(table.userId),
    (0, pg_core_1.index)("idx_projectId").on(table.projectId),
    (0, pg_core_1.index)("idx_nextRunAt").on(table.nextRunAt),
]; });
// ============================================================================
// TABELAS DE AUTENTICAÇÃO E GESTÃO DE USUÁRIOS
// ============================================================================
exports.userInvites = (0, pg_core_1.pgTable)("user_invites", {
    id: (0, pg_core_1.varchar)({ length: 64 }).primaryKey().notNull(),
    email: (0, pg_core_1.varchar)({ length: 320 }).notNull(),
    perfil: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    token: (0, pg_core_1.varchar)({ length: 255 }).unique().notNull(),
    criadoPor: (0, pg_core_1.varchar)('criadoPor', { length: 64 }).notNull(),
    criadoEm: (0, pg_core_1.timestamp)('criadoEm', { mode: "string" }).defaultNow().notNull(),
    expiraEm: (0, pg_core_1.timestamp)('expiraEm', { mode: "string" }).notNull(),
    usado: (0, pg_core_1.smallint)().default(0).notNull(),
    usadoEm: (0, pg_core_1.timestamp)('usadoEm', { mode: "string" }),
    cancelado: (0, pg_core_1.smallint)().default(0).notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_token").on(table.token),
    (0, pg_core_1.index)("idx_email").on(table.email),
    (0, pg_core_1.index)("idx_usado").on(table.usado),
    (0, pg_core_1.foreignKey)({
        columns: [table.criadoPor],
        foreignColumns: [exports.users.id],
        name: "fk_invite_criado_por",
    }),
]; });
exports.passwordResets = (0, pg_core_1.pgTable)("password_resets", {
    id: (0, pg_core_1.varchar)({ length: 64 }).primaryKey().notNull(),
    userId: (0, pg_core_1.varchar)('userId', { length: 64 }).notNull(),
    token: (0, pg_core_1.varchar)({ length: 255 }).unique().notNull(),
    criadoEm: (0, pg_core_1.timestamp)('criadoEm', { mode: "string" }).defaultNow().notNull(),
    expiraEm: (0, pg_core_1.timestamp)('expiraEm', { mode: "string" }).notNull(),
    usado: (0, pg_core_1.smallint)().default(0).notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_token").on(table.token),
    (0, pg_core_1.index)("idx_user").on(table.userId),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.users.id],
        name: "fk_password_reset_user",
    }),
]; });
exports.loginAttempts = (0, pg_core_1.pgTable)("login_attempts", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    email: (0, pg_core_1.varchar)({ length: 320 }).notNull(),
    sucesso: (0, pg_core_1.smallint)().notNull(),
    ip: (0, pg_core_1.varchar)({ length: 45 }),
    userAgent: (0, pg_core_1.text)('userAgent'),
    tentativaEm: (0, pg_core_1.timestamp)('tentativaEm', { mode: "string" }).defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_email_tentativa").on(table.email, table.tentativaEm),
]; });
exports.emailConfig = (0, pg_core_1.pgTable)("email_config", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    projectId: (0, pg_core_1.integer)('projectId').notNull(),
    provider: (0, pg_core_1.varchar)({ length: 50 }).default("resend").notNull(),
    apiKey: (0, pg_core_1.varchar)('apiKey', { length: 255 }).notNull(),
    fromEmail: (0, pg_core_1.varchar)('fromEmail', { length: 320 }).notNull(),
    fromName: (0, pg_core_1.varchar)('fromName', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: "string" }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: "string" }).defaultNow(),
});
