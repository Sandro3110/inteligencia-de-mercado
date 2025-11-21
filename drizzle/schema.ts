import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, int, varchar, text, json, timestamp, mysqlEnum, foreignKey, decimal, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const activityLog = mysqlTable("activity_log", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	activityType: varchar({ length: 50 }).notNull(),
	description: text(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("idx_project").on(table.projectId),
	index("idx_type").on(table.activityType),
	index("idx_created").on(table.createdAt),
]);

export const alertConfigs = mysqlTable("alert_configs", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	alertType: mysqlEnum(['error_rate','high_quality_lead','market_threshold']).notNull(),
	condition: text().notNull(),
	enabled: tinyint().default(1).notNull(),
	lastTriggeredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const alertHistory = mysqlTable("alert_history", {
	id: int().autoincrement().notNull(),
	alertConfigId: int().notNull(),
	projectId: int().notNull(),
	alertType: mysqlEnum(['error_rate','high_quality_lead','market_threshold']).notNull(),
	condition: text().notNull(),
	message: text().notNull(),
	triggeredAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const analyticsDimensoes = mysqlTable("analytics_dimensoes", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	pesquisaId: int(),
	dimensaoTipo: mysqlEnum(['uf','porte','segmentacao','categoria']).notNull(),
	dimensaoValor: varchar({ length: 100 }).notNull(),
	totalLeads: int().default(0),
	qualidadeMedia: int().default(0),
	taxaConversaoSf: int().default(0),
	custoMedioLead: int().default(0),
	roi: int().default(0),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const analyticsMercados = mysqlTable("analytics_mercados", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	pesquisaId: int(),
	mercadoId: int().notNull(),
	periodo: timestamp({ mode: 'string' }).notNull(),
	totalClientes: int().default(0),
	totalConcorrentes: int().default(0),
	totalLeadsGerados: int().default(0),
	taxaCoberturaMercado: int().default(0),
	qualidadeMediaLeads: int().default(0),
	leadsAltaQualidade: int().default(0),
	leadsMediaQualidade: int().default(0),
	leadsBaixaQualidade: int().default(0),
	leadsEnriquecidos: int().default(0),
	taxaSucessoEnriquecimento: int().default(0),
	tempoMedioEnriquecimentoMin: int().default(0),
	custoEnriquecimentoTotal: int().default(0),
	leadsValidados: int().default(0),
	leadsAprovados: int().default(0),
	leadsDescartados: int().default(0),
	taxaAprovacao: int().default(0),
	leadsExportadosSf: int().default(0),
	leadsConvertidosSf: int().default(0),
	taxaConversaoSf: int().default(0),
	horasPesquisa: int().default(0),
	custoTotal: int().default(0),
	roi: int().default(0),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const analyticsPesquisas = mysqlTable("analytics_pesquisas", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	pesquisaId: int().notNull(),
	totalMercadosMapeados: int().default(0),
	totalClientesBase: int().default(0),
	totalLeadsGerados: int().default(0),
	taxaConversaoClienteLead: int().default(0),
	qualidadeMediaGeral: int().default(0),
	distribuicaoQualidade: text(),
	taxaSucessoEnriquecimento: int().default(0),
	tempoTotalEnriquecimentoHoras: int().default(0),
	custoTotalEnriquecimento: int().default(0),
	leadsExportadosSf: int().default(0),
	leadsConvertidosSf: int().default(0),
	taxaConversaoSf: int().default(0),
	valorPipelineGerado: int().default(0),
	custoTotalPesquisa: int().default(0),
	valorGerado: int().default(0),
	roi: int().default(0),
	dataInicio: timestamp({ mode: 'string' }),
	dataConclusao: timestamp({ mode: 'string' }),
	duracaoDias: int().default(0),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const analyticsTimeline = mysqlTable("analytics_timeline", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	data: timestamp({ mode: 'string' }).notNull(),
	leadsGeradosDia: int().default(0),
	leadsEnriquecidosDia: int().default(0),
	leadsValidadosDia: int().default(0),
	leadsExportadosSfDia: int().default(0),
	qualidadeMediaDia: int().default(0),
	custoDia: int().default(0),
	leadsAcumulados: int().default(0),
	custoAcumulado: int().default(0),
	valorGeradoAcumulado: int().default(0),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const clientes = mysqlTable("clientes", {
	id: int().autoincrement().notNull(),
	clienteHash: varchar({ length: 255 }),
	nome: varchar({ length: 255 }).notNull(),
	cnpj: varchar({ length: 20 }),
	siteOficial: varchar({ length: 500 }),
	produtoPrincipal: text(),
	segmentacaoB2BB2C: varchar({ length: 20 }),
	email: varchar({ length: 320 }),
	telefone: varchar({ length: 50 }),
	linkedin: varchar({ length: 500 }),
	instagram: varchar({ length: 500 }),
	cidade: varchar({ length: 100 }),
	uf: varchar({ length: 2 }),
	cnae: varchar({ length: 20 }),
	porte: varchar({ length: 50 }),
	qualidadeScore: int(),
	qualidadeClassificacao: varchar({ length: 50 }),
	validationStatus: mysqlEnum(['pending','rich','needs_adjustment','discarded']).default('pending'),
	validationNotes: text(),
	validatedBy: varchar({ length: 64 }),
	validatedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	projectId: int().default(1).notNull(),
	regiao: varchar({ length: 100 }),
	faturamentoDeclarado: text(),
	numeroEstabelecimentos: text(),
	pesquisaId: int(),
},
(table) => [
	index("idx_clientes_projectId").on(table.projectId),
	index("unique_cliente_hash").on(table.clienteHash),
]);

export const clientesHistory = mysqlTable("clientes_history", {
	id: int().autoincrement().notNull(),
	clienteId: int().notNull(),
	field: varchar({ length: 100 }),
	oldValue: text(),
	newValue: text(),
	changeType: mysqlEnum(['created','updated','enriched','validated']).default('updated'),
	changedBy: varchar({ length: 64 }),
	changedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const clientesMercados = mysqlTable("clientes_mercados", {
	id: int().autoincrement().notNull(),
	clienteId: int().notNull(),
	mercadoId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("idx_cliente_mercado").on(table.clienteId, table.mercadoId),
]);

export const concorrentes = mysqlTable("concorrentes", {
	id: int().autoincrement().notNull(),
	concorrenteHash: varchar({ length: 255 }),
	mercadoId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	cnpj: varchar({ length: 20 }),
	site: varchar({ length: 500 }),
	produto: text(),
	porte: varchar({ length: 50 }),
	faturamentoEstimado: text(),
	qualidadeScore: int(),
	qualidadeClassificacao: varchar({ length: 50 }),
	validationStatus: mysqlEnum(['pending','rich','needs_adjustment','discarded']).default('pending'),
	validationNotes: text(),
	validatedBy: varchar({ length: 64 }),
	validatedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	projectId: int().default(1).notNull(),
	cidade: varchar({ length: 100 }),
	uf: varchar({ length: 2 }),
	faturamentoDeclarado: text(),
	numeroEstabelecimentos: text(),
	pesquisaId: int(),
},
(table) => [
	index("idx_concorrentes_projectId").on(table.projectId),
	index("unique_concorrente_hash").on(table.concorrenteHash),
	index("idx_concorrente_hash").on(table.concorrenteHash),
]);

export const concorrentesHistory = mysqlTable("concorrentes_history", {
	id: int().autoincrement().notNull(),
	concorrenteId: int().notNull(),
	field: varchar({ length: 100 }),
	oldValue: text(),
	newValue: text(),
	changeType: mysqlEnum(['created','updated','enriched','validated']).default('updated'),
	changedBy: varchar({ length: 64 }),
	changedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const enrichmentCache = mysqlTable("enrichment_cache", {
	cnpj: varchar({ length: 14 }).notNull(),
	dadosJson: text().notNull(),
	fonte: varchar({ length: 50 }),
	dataAtualizacao: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("idx_data_atualizacao").on(table.dataAtualizacao),
]);

export const enrichmentConfigs = mysqlTable("enrichment_configs", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	openaiApiKey: text(),
	serpapiKey: text(),
	receitawsKey: text(),
	produtosPorMercado: int().default(3).notNull(),
	concorrentesPorMercado: int().default(5).notNull(),
	leadsPorMercado: int().default(5).notNull(),
	batchSize: int().default(50).notNull(),
	checkpointInterval: int().default(100).notNull(),
	enableDeduplication: int().default(1).notNull(),
	enableQualityScore: int().default(1).notNull(),
	enableAutoRetry: int().default(1).notNull(),
	maxRetries: int().default(2).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
	geminiApiKey: text(),
	anthropicApiKey: text(),
},
(table) => [
	index("projectId").on(table.projectId),
]);

export const enrichmentJobs = mysqlTable("enrichment_jobs", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	status: mysqlEnum(['pending','running','paused','completed','failed']).default('pending').notNull(),
	totalClientes: int().notNull(),
	processedClientes: int().default(0).notNull(),
	successClientes: int().default(0).notNull(),
	failedClientes: int().default(0).notNull(),
	currentBatch: int().default(0).notNull(),
	totalBatches: int().notNull(),
	batchSize: int().default(5).notNull(),
	checkpointInterval: int().default(50).notNull(),
	startedAt: timestamp({ mode: 'string' }),
	pausedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	estimatedTimeRemaining: int(),
	lastClienteId: int(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const enrichmentQueue = mysqlTable("enrichment_queue", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull().references(() => projects.id, { onDelete: "cascade" } ),
	status: mysqlEnum(['pending','processing','completed','error']).default('pending'),
	priority: int().default(0),
	clienteData: json().notNull(),
	result: json(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("idx_queue_status").on(table.status),
	index("idx_queue_project").on(table.projectId),
	index("idx_queue_priority").on(table.priority),
]);

export const enrichmentRuns = mysqlTable("enrichment_runs", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	startedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
	totalClients: int().notNull(),
	processedClients: int().default(0).notNull(),
	status: mysqlEnum(['running','paused','completed','error']).default('running').notNull(),
	durationSeconds: int(),
	errorMessage: text(),
	notifiedAt50: int().default(0).notNull(),
	notifiedAt75: int().default(0).notNull(),
	notifiedAt100: int().default(0).notNull(),
});

export const entityTags = mysqlTable("entity_tags", {
	id: int().autoincrement().notNull(),
	tagId: int().notNull(),
	entityType: mysqlEnum(['mercado','cliente','concorrente','lead']).notNull(),
	entityId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const hibernationWarnings = mysqlTable("hibernation_warnings", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	warningDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	scheduledHibernationDate: timestamp({ mode: 'string' }).notNull(),
	daysInactive: int().notNull(),
	notificationSent: int().default(0).notNull(),
	postponed: int().default(0).notNull(),
	postponedUntil: timestamp({ mode: 'string' }),
	hibernated: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const intelligentAlertsConfigs = mysqlTable("intelligent_alerts_configs", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	circuitBreakerThreshold: int().default(10).notNull(),
	errorRateThreshold: int().default(10).notNull(),
	processingTimeThreshold: int().default(60).notNull(),
	notifyOnCompletion: int().default(1).notNull(),
	notifyOnCircuitBreaker: int().default(1).notNull(),
	notifyOnErrorRate: int().default(1).notNull(),
	notifyOnProcessingTime: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("intelligent_alerts_configs_projectId_unique").on(table.projectId),
]);

export const intelligentAlertsHistory = mysqlTable("intelligent_alerts_history", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	alertType: mysqlEnum(['circuit_breaker','error_rate','processing_time','completion']).notNull(),
	severity: mysqlEnum(['info','warning','critical']).default('info').notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	metricValue: text(),
	threshold: text(),
	jobId: int(),
	clientsProcessed: int(),
	totalClients: int(),
	isRead: int().default(0).notNull(),
	isDismissed: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	readAt: timestamp({ mode: 'string' }),
	dismissedAt: timestamp({ mode: 'string' }),
});

export const leadConversions = mysqlTable("lead_conversions", {
	id: int().autoincrement().notNull(),
	leadId: int().notNull(),
	projectId: int().notNull(),
	dealValue: decimal({ precision: 15, scale: 2 }),
	convertedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	notes: text(),
	status: mysqlEnum(['won','lost']).default('won'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const leads = mysqlTable("leads", {
	id: int().autoincrement().notNull(),
	leadHash: varchar({ length: 255 }),
	mercadoId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	cnpj: varchar({ length: 20 }),
	site: varchar({ length: 500 }),
	email: varchar({ length: 320 }),
	telefone: varchar({ length: 50 }),
	tipo: varchar({ length: 20 }),
	porte: varchar({ length: 50 }),
	regiao: varchar({ length: 100 }),
	setor: varchar({ length: 100 }),
	qualidadeScore: int(),
	qualidadeClassificacao: varchar({ length: 50 }),
	leadStage: mysqlEnum(['novo','em_contato','negociacao','fechado','perdido']).default('novo'),
	stageUpdatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	validationStatus: mysqlEnum(['pending','rich','needs_adjustment','discarded']).default('pending'),
	validationNotes: text(),
	validatedBy: varchar({ length: 64 }),
	validatedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	projectId: int().default(1).notNull(),
	cidade: varchar({ length: 100 }),
	uf: varchar({ length: 2 }),
	faturamentoDeclarado: text(),
	numeroEstabelecimentos: text(),
	pesquisaId: int(),
	stage: varchar({ length: 50 }).default('novo'),
},
(table) => [
	index("idx_leads_projectId").on(table.projectId),
	index("unique_lead_hash").on(table.leadHash),
	index("idx_lead_hash").on(table.leadHash),
]);

export const leadsHistory = mysqlTable("leads_history", {
	id: int().autoincrement().notNull(),
	leadId: int().notNull(),
	field: varchar({ length: 100 }),
	oldValue: text(),
	newValue: text(),
	changeType: mysqlEnum(['created','updated','enriched','validated']).default('updated'),
	changedBy: varchar({ length: 64 }),
	changedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const llmProviderConfigs = mysqlTable("llm_provider_configs", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	activeProvider: mysqlEnum(['openai','gemini','anthropic']).default('openai').notNull(),
	openaiApiKey: text(),
	openaiModel: varchar({ length: 100 }).default('gpt-4o'),
	openaiEnabled: int().default(1).notNull(),
	geminiApiKey: text(),
	geminiModel: varchar({ length: 100 }).default('gemini-2.0-flash-exp'),
	geminiEnabled: int().default(0).notNull(),
	anthropicApiKey: text(),
	anthropicModel: varchar({ length: 100 }).default('claude-3-5-sonnet-20241022'),
	anthropicEnabled: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const mercadosHistory = mysqlTable("mercados_history", {
	id: int().autoincrement().notNull(),
	mercadoId: int().notNull(),
	field: varchar({ length: 100 }),
	oldValue: text(),
	newValue: text(),
	changeType: mysqlEnum(['created','updated','enriched','validated']).default('updated'),
	changedBy: varchar({ length: 64 }),
	changedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const mercadosUnicos = mysqlTable("mercados_unicos", {
	id: int().autoincrement().notNull(),
	mercadoHash: varchar({ length: 255 }),
	nome: varchar({ length: 255 }).notNull(),
	segmentacao: varchar({ length: 50 }),
	categoria: varchar({ length: 100 }),
	tamanhoMercado: text(),
	crescimentoAnual: text(),
	tendencias: text(),
	principaisPlayers: text(),
	quantidadeClientes: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	projectId: int().default(1).notNull(),
	pesquisaId: int(),
},
(table) => [
	index("idx_mercados_projectId").on(table.projectId),
	index("unique_mercado_hash").on(table.mercadoHash),
	index("idx_mercado_hash").on(table.mercadoHash),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 64 }).references(() => users.id, { onDelete: "cascade" } ),
	projectId: int().references(() => projects.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['lead_quality','lead_closed','new_competitor','market_threshold','data_incomplete','enrichment','validation','export']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	entityType: mysqlEnum(['mercado','cliente','concorrente','lead']),
	entityId: int(),
	isRead: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const notificationPreferences = mysqlTable("notification_preferences", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 64 }).references(() => users.id, { onDelete: "cascade" } ).notNull(),
	type: mysqlEnum(['lead_quality','lead_closed','new_competitor','market_threshold','data_incomplete','enrichment','validation','export','all']).notNull(),
	enabled: int().default(1).notNull(),
	channels: json().$type<{ email?: boolean; push?: boolean; inApp?: boolean }>().default({ inApp: true }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_user_type").on(table.userId, table.type),
]);

export const operationalAlerts = mysqlTable("operational_alerts", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	alertType: mysqlEnum(['qualidade_baixa','enriquecimento_lento','backlog_validacao','custo_elevado','conversao_sf_baixa']).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	titulo: varchar({ length: 255 }).notNull(),
	mensagem: text().notNull(),
	acaoRecomendada: text(),
	valorAtual: text(),
	valorEsperado: text(),
	isRead: int().default(0).notNull(),
	isDismissed: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	readAt: timestamp({ mode: 'string' }),
	dismissedAt: timestamp({ mode: 'string' }),
});

export const pesquisas = mysqlTable("pesquisas", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	descricao: text(),
	dataImportacao: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	totalClientes: int().default(0),
	clientesEnriquecidos: int().default(0),
	status: mysqlEnum(['importado','enriquecendo','em_andamento','concluido','erro']).default('importado'),
	ativo: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	qtdConcorrentesPorMercado: int().default(5),
	qtdLeadsPorMercado: int().default(10),
	qtdProdutosPorCliente: int().default(3),
});

export const produtos = mysqlTable("produtos", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	clienteId: int().notNull(),
	mercadoId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	descricao: text(),
	categoria: varchar({ length: 100 }),
	preco: text(),
	unidade: varchar({ length: 50 }),
	ativo: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	pesquisaId: int(),
},
(table) => [
	index("idx_produto_unique").on(table.clienteId, table.mercadoId, table.nome),
]);

export const projectAuditLog = mysqlTable("project_audit_log", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	userId: varchar({ length: 64 }),
	action: mysqlEnum(['created','updated','hibernated','reactivated','deleted']).notNull(),
	changes: text(),
	metadata: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const projectTemplates = mysqlTable("project_templates", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	config: text().notNull(),
	isDefault: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const projects = mysqlTable("projects", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	descricao: text(),
	cor: varchar({ length: 7 }).default('#3b82f6'),
	ativo: int().default(1).notNull(),
	status: mysqlEnum(['active','hibernated']).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	executionMode: mysqlEnum(['parallel','sequential']).default('sequential'),
	maxParallelJobs: int().default(3),
	isPaused: int().default(0),
	lastActivityAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const recommendations = mysqlTable("recommendations", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	tipo: mysqlEnum(['mercado','regiao','metodologia','filtro','otimizacao']).notNull(),
	prioridade: mysqlEnum(['baixa','media','alta']).default('media').notNull(),
	titulo: varchar({ length: 255 }).notNull(),
	descricao: text().notNull(),
	acao: text().notNull(),
	leadsAdicionaisEstimado: int().default(0),
	qualidadeEsperada: int().default(0),
	custoEstimado: int().default(0),
	roiEsperado: int().default(0),
	isApplied: int().default(0).notNull(),
	isDismissed: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	appliedAt: timestamp({ mode: 'string' }),
	dismissedAt: timestamp({ mode: 'string' }),
});

export const salesforceSyncLog = mysqlTable("salesforce_sync_log", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	pesquisaId: int(),
	syncType: mysqlEnum(['manual','automatico']).default('manual').notNull(),
	totalLeadsExportados: int().default(0),
	totalLeadsSucesso: int().default(0),
	totalLeadsErro: int().default(0),
	status: mysqlEnum(['em_progresso','concluido','erro']).default('em_progresso').notNull(),
	errorMessage: text(),
	leadIds: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	completedAt: timestamp({ mode: 'string' }),
});

export const savedFilters = mysqlTable("saved_filters", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 64 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	filtersJson: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	projectId: int(),
	isPublic: int().default(0).notNull(),
	shareToken: varchar({ length: 64 }),
});

export const scheduledEnrichments = mysqlTable("scheduled_enrichments", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull(),
	scheduledAt: timestamp({ mode: 'string' }).notNull(),
	recurrence: mysqlEnum(['once','daily','weekly']).default('once').notNull(),
	batchSize: int().default(50),
	maxClients: int(),
	timeout: int().default(3600),
	status: mysqlEnum(['pending','running','completed','cancelled','error']).default('pending').notNull(),
	errorMessage: text(),
	lastRunAt: timestamp({ mode: 'string' }),
	nextRunAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const tags = mysqlTable("tags", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 7 }).default('#3b82f6'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const users = mysqlTable("users", {
	id: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// ===== TIPOS EXPORTADOS =====

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Pesquisa = typeof pesquisas.$inferSelect;
export type InsertPesquisa = typeof pesquisas.$inferInsert;

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

export type Concorrente = typeof concorrentes.$inferSelect;
export type InsertConcorrente = typeof concorrentes.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;

export type MercadoUnico = typeof mercadosUnicos.$inferSelect;
export type InsertMercadoUnico = typeof mercadosUnicos.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;

export type EnrichmentCache = typeof enrichmentCache.$inferSelect;
export type InsertEnrichmentCache = typeof enrichmentCache.$inferInsert;

export type EnrichmentConfig = typeof enrichmentConfigs.$inferSelect;
export type InsertEnrichmentConfig = typeof enrichmentConfigs.$inferInsert;

export type EnrichmentJob = typeof enrichmentJobs.$inferSelect;
export type InsertEnrichmentJob = typeof enrichmentJobs.$inferInsert;

export type EnrichmentQueue = typeof enrichmentQueue.$inferSelect;
export type InsertEnrichmentQueue = typeof enrichmentQueue.$inferInsert;

export type EnrichmentRun = typeof enrichmentRuns.$inferSelect;
export type InsertEnrichmentRun = typeof enrichmentRuns.$inferInsert;

export type AnalyticsMercado = typeof analyticsMercados.$inferSelect;
export type InsertAnalyticsMercado = typeof analyticsMercados.$inferInsert;

export type AnalyticsPesquisa = typeof analyticsPesquisas.$inferSelect;
export type InsertAnalyticsPesquisa = typeof analyticsPesquisas.$inferInsert;

export type AnalyticsDimensao = typeof analyticsDimensoes.$inferSelect;
export type InsertAnalyticsDimensao = typeof analyticsDimensoes.$inferInsert;

export type AnalyticsTimeline = typeof analyticsTimeline.$inferSelect;
export type InsertAnalyticsTimeline = typeof analyticsTimeline.$inferInsert;

export type ProjectAuditLog = typeof projectAuditLog.$inferSelect;
export type InsertProjectAuditLog = typeof projectAuditLog.$inferInsert;

export type HibernationWarning = typeof hibernationWarnings.$inferSelect;
export type InsertHibernationWarning = typeof hibernationWarnings.$inferInsert;

export type AlertConfig = typeof alertConfigs.$inferSelect;
export type InsertAlertConfig = typeof alertConfigs.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

export type EntityTag = typeof entityTags.$inferSelect;
export type InsertEntityTag = typeof entityTags.$inferInsert;

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

export type ScheduledEnrichment = typeof scheduledEnrichments.$inferSelect;
export type InsertScheduledEnrichment = typeof scheduledEnrichments.$inferInsert;

export type LLMProviderConfig = typeof llmProviderConfigs.$inferSelect;
export type InsertLLMProviderConfig = typeof llmProviderConfigs.$inferInsert;

export type IntelligentAlertsConfig = typeof intelligentAlertsConfigs.$inferSelect;
export type InsertIntelligentAlertsConfig = typeof intelligentAlertsConfigs.$inferInsert;

export type OperationalAlert = typeof operationalAlerts.$inferSelect;
export type InsertOperationalAlert = typeof operationalAlerts.$inferInsert;

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

export type SalesforceSyncLog = typeof salesforceSyncLog.$inferSelect;
export type InsertSalesforceSyncLog = typeof salesforceSyncLog.$inferInsert;

export type LeadConversion = typeof leadConversions.$inferSelect;
export type InsertLeadConversion = typeof leadConversions.$inferInsert;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

export type ClienteMercado = typeof clientesMercados.$inferSelect;
export type InsertClienteMercado = typeof clientesMercados.$inferInsert;

export type ClienteHistory = typeof clientesHistory.$inferSelect;
export type InsertClienteHistory = typeof clientesHistory.$inferInsert;

export type ConcorrenteHistory = typeof concorrentesHistory.$inferSelect;
export type InsertConcorrenteHistory = typeof concorrentesHistory.$inferInsert;

export type LeadHistory = typeof leadsHistory.$inferSelect;
export type InsertLeadHistory = typeof leadsHistory.$inferInsert;

export type MercadoHistory = typeof mercadosHistory.$inferSelect;
export type InsertMercadoHistory = typeof mercadosHistory.$inferInsert;

export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;

export type IntelligentAlertsHistory = typeof intelligentAlertsHistory.$inferSelect;
export type InsertIntelligentAlertsHistory = typeof intelligentAlertsHistory.$inferInsert;
