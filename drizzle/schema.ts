import {
  pgTable,
  pgSchema,
  AnyPgColumn,
  index,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
  pgEnum,
  foreignKey,
  numeric,
  smallint,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enum declarations
export const progressStatusEnum = pgEnum("progressStatus", [
  "started",
  "in_progress",
  "almost_done",
]);

export const frequencyEnum = pgEnum("frequency", ["weekly", "monthly"]);

export const activityLog = pgTable(
  "activity_log",
  {
    id: serial(),
    projectId: integer('project_id').notNull(),
    activityType: varchar('activity_type', { length: 50 }).notNull(),
    description: text(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  },
  table => [
    index("idx_project").on(table.projectId),
    index("idx_type").on(table.activityType),
    index("idx_created").on(table.createdAt),
  ]
);

export const alertConfigs = pgTable("alert_configs", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  name: varchar({ length: 255 }).notNull(),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  condition: text().notNull(),
  enabled: smallint().default(1).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at', { mode: "string" }),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
});

export const alertHistory = pgTable("alert_history", {
  id: serial(),
  alertConfigId: integer('alert_config_id').notNull(),
  projectId: integer('project_id').notNull(),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  condition: text().notNull(),
  message: text().notNull(),
  triggeredAt: timestamp('triggered_at', { mode: "string" })
    .defaultNow()
    .notNull(),
});

export const analyticsDimensoes = pgTable("analytics_dimensoes", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  pesquisaId: integer('pesquisa_id'),
  dimensaoTipo: varchar('dimensao_tipo', { length: 50 }).notNull(),
  dimensaoValor: varchar('dimensao_valor', { length: 100 }).notNull(),
  totalLeads: integer('total_leads').default(0),
  qualidadeMedia: integer('qualidade_media').default(0),
  taxaConversaoSf: integer('taxa_conversao_sf').default(0),
  custoMedioLead: integer('custo_medio_lead').default(0),
  roi: integer().default(0),
  updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const analyticsMercados = pgTable("analytics_mercados", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  pesquisaId: integer('pesquisa_id'),
  mercadoId: integer('mercado_id').notNull(),
  periodo: timestamp({ mode: "string" }).notNull(),
  totalClientes: integer('total_clientes').default(0),
  totalConcorrentes: integer('total_concorrentes').default(0),
  totalLeadsGerados: integer('total_leads_gerados').default(0),
  taxaCoberturaMercado: integer('taxa_cobertura_mercado').default(0),
  qualidadeMediaLeads: integer('qualidade_media_leads').default(0),
  leadsAltaQualidade: integer('leads_alta_qualidade').default(0),
  leadsMediaQualidade: integer('leads_media_qualidade').default(0),
  leadsBaixaQualidade: integer('leads_baixa_qualidade').default(0),
  leadsEnriquecidos: integer('leads_enriquecidos').default(0),
  taxaSucessoEnriquecimento: integer('taxa_sucesso_enriquecimento').default(0),
  tempoMedioEnriquecimentoMin: integer('tempo_medio_enriquecimento_min').default(0),
  custoEnriquecimentoTotal: integer('custo_enriquecimento_total').default(0),
  leadsValidados: integer('leads_validados').default(0),
  leadsAprovados: integer('leads_aprovados').default(0),
  leadsDescartados: integer('leads_descartados').default(0),
  taxaAprovacao: integer('taxa_aprovacao').default(0),
  leadsExportadosSf: integer('leads_exportados_sf').default(0),
  leadsConvertidosSf: integer('leads_convertidos_sf').default(0),
  taxaConversaoSf: integer('taxa_conversao_sf').default(0),
  horasPesquisa: integer('horas_pesquisa').default(0),
  custoTotal: integer('custo_total').default(0),
  roi: integer().default(0),
  updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const analyticsPesquisas = pgTable("analytics_pesquisas", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  pesquisaId: integer('pesquisa_id').notNull(),
  totalMercadosMapeados: integer('total_mercados_mapeados').default(0),
  totalClientesBase: integer('total_clientes_base').default(0),
  totalLeadsGerados: integer('total_leads_gerados').default(0),
  taxaConversaoClienteLead: integer('taxa_conversao_cliente_lead').default(0),
  qualidadeMediaGeral: integer('qualidade_media_geral').default(0),
  distribuicaoQualidade: text('distribuicao_qualidade'),
  taxaSucessoEnriquecimento: integer('taxa_sucesso_enriquecimento').default(0),
  tempoTotalEnriquecimentoHoras: integer('tempo_total_enriquecimento_horas').default(0),
  custoTotalEnriquecimento: integer('custo_total_enriquecimento').default(0),
  leadsExportadosSf: integer('leads_exportados_sf').default(0),
  leadsConvertidosSf: integer('leads_convertidos_sf').default(0),
  taxaConversaoSf: integer('taxa_conversao_sf').default(0),
  valorPipelineGerado: integer('valor_pipeline_gerado').default(0),
  custoTotalPesquisa: integer('custo_total_pesquisa').default(0),
  valorGerado: integer('valor_gerado').default(0),
  roi: integer().default(0),
  dataInicio: timestamp('data_inicio', { mode: "string" }),
  dataConclusao: timestamp('data_conclusao', { mode: "string" }),
  duracaoDias: integer('duracao_dias').default(0),
  updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const analyticsTimeline = pgTable("analytics_timeline", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  data: timestamp({ mode: "string" }).notNull(),
  leadsGeradosDia: integer('leads_gerados_dia').default(0),
  leadsEnriquecidosDia: integer('leads_enriquecidos_dia').default(0),
  leadsValidadosDia: integer('leads_validados_dia').default(0),
  leadsExportadosSfDia: integer('leads_exportados_sf_dia').default(0),
  qualidadeMediaDia: integer('qualidade_media_dia').default(0),
  custoDia: integer('custo_dia').default(0),
  leadsAcumulados: integer('leads_acumulados').default(0),
  custoAcumulado: integer('custo_acumulado').default(0),
  valorGeradoAcumulado: integer('valor_gerado_acumulado').default(0),
  updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const clientes = pgTable(
  "clientes",
  {
    id: serial(),
    clienteHash: varchar('cliente_hash', { length: 255 }),
    nome: varchar({ length: 255 }).notNull(),
    cnpj: varchar({ length: 20 }),
    siteOficial: varchar('site_oficial', { length: 500 }),
    produtoPrincipal: text('produto_principal'),
    segmentacaoB2BB2C: varchar('segmentacao_b2_bb2_c', { length: 20 }),
    email: varchar({ length: 320 }),
    telefone: varchar({ length: 50 }),
    linkedin: varchar({ length: 500 }),
    instagram: varchar({ length: 500 }),
    cidade: varchar({ length: 100 }),
    uf: varchar({ length: 2 }),
    cnae: varchar({ length: 20 }),
    porte: varchar({ length: 50 }),
    qualidadeScore: integer('qualidade_score'),
    qualidadeClassificacao: varchar('qualidade_classificacao', { length: 50 }),
    validationStatus: varchar('validation_status', { length: 50 }).default("pending"),
    validationNotes: text('validation_notes'),
    validatedBy: varchar('validated_by', { length: 64 }),
    validatedAt: timestamp('validated_at', { mode: "string" }),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    projectId: integer('project_id').default(1).notNull(),
    regiao: varchar({ length: 100 }),
    faturamentoDeclarado: text('faturamento_declarado'),
    numeroEstabelecimentos: text('numero_estabelecimentos'),
    pesquisaId: integer('pesquisa_id'),
    latitude: numeric({ precision: 10, scale: 8 }),
    longitude: numeric({ precision: 11, scale: 8 }),
    geocodedAt: timestamp('geocoded_at', { mode: "string" }),
  },
  table => [
    index("idx_clientes_projectId").on(table.projectId),
    index("unique_cliente_hash").on(table.clienteHash),
  ]
);

export const clientesHistory = pgTable("clientes_history", {
  id: serial(),
  clienteId: integer('cliente_id').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changeType: varchar('change_type', { length: 50 }).default("updated"),
  changedBy: varchar('changed_by', { length: 64 }),
  changedAt: timestamp('changed_at', { mode: "string" }).defaultNow(),
});

export const clientesMercados = pgTable(
  "clientes_mercados",
  {
    id: serial(),
    clienteId: integer('cliente_id').notNull(),
    mercadoId: integer('mercado_id').notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  },
  table => [index("idx_cliente_mercado").on(table.clienteId, table.mercadoId)]
);

export const concorrentes = pgTable(
  "concorrentes",
  {
    id: serial(),
    concorrenteHash: varchar('concorrente_hash', { length: 255 }),
    mercadoId: integer('mercado_id').notNull(),
    nome: varchar({ length: 255 }).notNull(),
    cnpj: varchar({ length: 20 }),
    site: varchar({ length: 500 }),
    produto: text(),
    porte: varchar({ length: 50 }),
    faturamentoEstimado: text('faturamento_estimado'),
    qualidadeScore: integer('qualidade_score'),
    qualidadeClassificacao: varchar('qualidade_classificacao', { length: 50 }),
    validationStatus: varchar('validation_status', { length: 50 }).default("pending"),
    validationNotes: text('validation_notes'),
    validatedBy: varchar('validated_by', { length: 64 }),
    validatedAt: timestamp('validated_at', { mode: "string" }),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    projectId: integer('project_id').default(1).notNull(),
    cidade: varchar({ length: 100 }),
    uf: varchar({ length: 2 }),
    faturamentoDeclarado: text('faturamento_declarado'),
    numeroEstabelecimentos: text('numero_estabelecimentos'),
    pesquisaId: integer('pesquisa_id'),
    latitude: numeric({ precision: 10, scale: 8 }),
    longitude: numeric({ precision: 11, scale: 8 }),
    geocodedAt: timestamp('geocoded_at', { mode: "string" }),
  },
  table => [
    index("idx_concorrentes_projectId").on(table.projectId),
    index("unique_concorrente_hash").on(table.concorrenteHash),
    index("idx_concorrente_hash").on(table.concorrenteHash),
  ]
);

export const concorrentesHistory = pgTable("concorrentes_history", {
  id: serial(),
  concorrenteId: integer('concorrente_id').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changeType: varchar('change_type', { length: 50 }).default("updated"),
  changedBy: varchar('changed_by', { length: 64 }),
  changedAt: timestamp('changed_at', { mode: "string" }).defaultNow(),
});

export const enrichmentCache = pgTable(
  "enrichment_cache",
  {
    cnpj: varchar({ length: 14 }).notNull(),
    dadosJson: text('dados_json').notNull(),
    fonte: varchar({ length: 50 }),
    dataAtualizacao: timestamp('data_atualizacao', { mode: "string" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  },
  table => [index("idx_data_atualizacao").on(table.dataAtualizacao)]
);

export const enrichmentConfigs = pgTable(
  "enrichment_configs",
  {
    id: serial(),
    projectId: integer('project_id').notNull(),
    openaiApiKey: text('openai_api_key'),
    serpapiKey: text('serpapi_key'),
    receitawsKey: text('receitaws_key'),
    produtosPorMercado: integer('produtos_por_mercado').default(3).notNull(),
    concorrentesPorMercado: integer('concorrentes_por_mercado').default(5).notNull(),
    leadsPorMercado: integer('leads_por_mercado').default(5).notNull(),
    batchSize: integer('batch_size').default(50).notNull(),
    checkpointInterval: integer('checkpoint_interval').default(100).notNull(),
    enableDeduplication: integer('enable_deduplication').default(1).notNull(),
    enableQualityScore: integer('enable_quality_score').default(1).notNull(),
    enableAutoRetry: integer('enable_auto_retry').default(1).notNull(),
    maxRetries: integer('max_retries').default(2).notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
    geminiApiKey: text('gemini_api_key'),
    anthropicApiKey: text('anthropic_api_key'),
    googleMapsApiKey: text('google_maps_api_key'),
  },
  table => [index("projectId").on(table.projectId)]
);

export const systemSettings = pgTable(
  "system_settings",
  {
    id: serial(),
    settingKey: varchar('setting_key', { length: 100 }).notNull(),
    settingValue: text('setting_value'),
    description: text(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  },
  table => [index("idx_setting_key").on(table.settingKey)]
);

export const enrichmentJobs = pgTable("enrichment_jobs", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  status: varchar({ length: 50 })
    .default("pending")
    .notNull(),
  totalClientes: integer('total_clientes').notNull(),
  processedClientes: integer('processed_clientes').default(0).notNull(),
  successClientes: integer('success_clientes').default(0).notNull(),
  failedClientes: integer('failed_clientes').default(0).notNull(),
  currentBatch: integer('current_batch').default(0).notNull(),
  totalBatches: integer('total_batches').notNull(),
  batchSize: integer('batch_size').default(5).notNull(),
  checkpointInterval: integer('checkpoint_interval').default(50).notNull(),
  startedAt: timestamp('started_at', { mode: "string" }),
  pausedAt: timestamp('paused_at', { mode: "string" }),
  completedAt: timestamp('completed_at', { mode: "string" }),
  estimatedTimeRemaining: integer('estimated_time_remaining'),
  lastClienteId: integer('last_cliente_id'),
  errorMessage: text('error_message'),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
});

export const enrichmentQueue = pgTable(
  "enrichment_queue",
  {
    id: serial(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: varchar({ length: 50 }).default(
      "pending"
    ),
    priority: integer().default(0),
    clienteData: jsonb('cliente_data').notNull(),
    result: jsonb(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    startedAt: timestamp('started_at', { mode: "string" }),
    completedAt: timestamp('completed_at', { mode: "string" }),
  },
  table => [
    index("idx_queue_status").on(table.status),
    index("idx_queue_project").on(table.projectId),
    index("idx_queue_priority").on(table.priority),
  ]
);

export const enrichmentRuns = pgTable("enrichment_runs", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  startedAt: timestamp('started_at', { mode: "string" })
    .defaultNow()
    .notNull(),
  completedAt: timestamp('completed_at', { mode: "string" }),
  totalClients: integer('total_clients').notNull(),
  processedClients: integer('processed_clients').default(0).notNull(),
  status: varchar({ length: 50 })
    .default("running")
    .notNull(),
  durationSeconds: integer('duration_seconds'),
  errorMessage: text('error_message'),
  notifiedAt50: integer('notified_at50').default(0).notNull(),
  notifiedAt75: integer('notified_at75').default(0).notNull(),
  notifiedAt100: integer('notified_at100').default(0).notNull(),
});

export const entityTags = pgTable("entity_tags", {
  id: serial(),
  tagId: integer('tag_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const hibernationWarnings = pgTable("hibernation_warnings", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  warningDate: timestamp('warning_date', { mode: "string" })
    .defaultNow()
    .notNull(),
  scheduledHibernationDate: timestamp('scheduled_hibernation_date', { mode: "string" }).notNull(),
  daysInactive: integer('days_inactive').notNull(),
  notificationSent: integer('notification_sent').default(0).notNull(),
  postponed: integer().default(0).notNull(),
  postponedUntil: timestamp('postponed_until', { mode: "string" }),
  hibernated: integer().default(0).notNull(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const intelligentAlertsConfigs = pgTable(
  "intelligent_alerts_configs",
  {
    id: serial(),
    projectId: integer('project_id').notNull(),
    circuitBreakerThreshold: integer('circuit_breaker_threshold').default(10).notNull(),
    errorRateThreshold: integer('error_rate_threshold').default(10).notNull(),
    processingTimeThreshold: integer('processing_time_threshold').default(60).notNull(),
    notifyOnCompletion: integer('notify_on_completion').default(1).notNull(),
    notifyOnCircuitBreaker: integer('notify_on_circuit_breaker').default(1).notNull(),
    notifyOnErrorRate: integer('notify_on_error_rate').default(1).notNull(),
    notifyOnProcessingTime: integer('notify_on_processing_time').default(1).notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  },
  table => [
    index("intelligent_alerts_configs_projectId_unique").on(table.projectId),
  ]
);

export const intelligentAlertsHistory = pgTable(
  "intelligent_alerts_history",
  {
    id: serial(),
    projectId: integer('project_id').notNull(),
    alertType: varchar('alert_type', { length: 50 }).notNull(),
    severity: varchar({ length: 50 })
      .default("info")
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    message: text().notNull(),
    metricValue: text('metric_value'),
    threshold: text(),
    jobId: integer('job_id'),
    clientsProcessed: integer('clients_processed'),
    totalClients: integer('total_clients'),
    isRead: integer('is_read').default(0).notNull(),
    isDismissed: integer('is_dismissed').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    readAt: timestamp('read_at', { mode: "string" }),
    dismissedAt: timestamp('dismissed_at', { mode: "string" }),
  }
);

export const leadConversions = pgTable("lead_conversions", {
  id: serial(),
  leadId: integer('lead_id').notNull(),
  projectId: integer('project_id').notNull(),
  dealValue: numeric('deal_value', { precision: 15, scale: 2 }),
  convertedAt: timestamp('converted_at', { mode: "string" }).defaultNow(),
  notes: text(),
  status: varchar({ length: 50 }).default("won"),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const leads = pgTable(
  "leads",
  {
    id: serial(),
    leadHash: varchar('lead_hash', { length: 255 }),
    mercadoId: integer('mercado_id').notNull(),
    nome: varchar({ length: 255 }).notNull(),
    cnpj: varchar({ length: 20 }),
    site: varchar({ length: 500 }),
    email: varchar({ length: 320 }),
    telefone: varchar({ length: 50 }),
    tipo: varchar({ length: 20 }),
    porte: varchar({ length: 50 }),
    regiao: varchar({ length: 100 }),
    setor: varchar({ length: 100 }),
    qualidadeScore: integer('qualidade_score'),
    qualidadeClassificacao: varchar('qualidade_classificacao', { length: 50 }),
    leadStage: varchar('lead_stage', { length: 50 }).default("novo"),
    stageUpdatedAt: timestamp('stage_updated_at', { mode: "string" }).defaultNow(),
    validationStatus: varchar('validation_status', { length: 50 }).default("pending"),
    validationNotes: text('validation_notes'),
    validatedBy: varchar('validated_by', { length: 64 }),
    validatedAt: timestamp('validated_at', { mode: "string" }),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    projectId: integer('project_id').default(1).notNull(),
    cidade: varchar({ length: 100 }),
    uf: varchar({ length: 2 }),
    faturamentoDeclarado: text('faturamento_declarado'),
    numeroEstabelecimentos: text('numero_estabelecimentos'),
    pesquisaId: integer('pesquisa_id'),
    stage: varchar({ length: 50 }).default("novo"),
    latitude: numeric({ precision: 10, scale: 8 }),
    longitude: numeric({ precision: 11, scale: 8 }),
    geocodedAt: timestamp('geocoded_at', { mode: "string" }),
  },
  table => [
    index("idx_leads_projectId").on(table.projectId),
    index("unique_lead_hash").on(table.leadHash),
    index("idx_lead_hash").on(table.leadHash),
  ]
);

export const leadsHistory = pgTable("leads_history", {
  id: serial(),
  leadId: integer('lead_id').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changeType: varchar('change_type', { length: 50 }).default("updated"),
  changedBy: varchar('changed_by', { length: 64 }),
  changedAt: timestamp('changed_at', { mode: "string" }).defaultNow(),
});

export const llmProviderConfigs = pgTable("llm_provider_configs", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  activeProvider: varchar('active_provider', { length: 50 })
    .default("openai")
    .notNull(),
  openaiApiKey: text('openai_api_key'),
  openaiModel: varchar('openai_model', { length: 100 }).default("gpt-4o"),
  openaiEnabled: integer('openai_enabled').default(1).notNull(),
  geminiApiKey: text('gemini_api_key'),
  geminiModel: varchar('gemini_model', { length: 100 }).default("gemini-2.0-flash-exp"),
  geminiEnabled: integer('gemini_enabled').default(0).notNull(),
  anthropicApiKey: text('anthropic_api_key'),
  anthropicModel: varchar('anthropic_model', { length: 100 }).default(
    "claude-3-5-sonnet-20241022"
  ),
  anthropicEnabled: integer('anthropic_enabled').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
});

export const mercadosHistory = pgTable("mercados_history", {
  id: serial(),
  mercadoId: integer('mercado_id').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changeType: varchar('change_type', { length: 50 }).default("updated"),
  changedBy: varchar('changed_by', { length: 64 }),
  changedAt: timestamp('changed_at', { mode: "string" }).defaultNow(),
});

export const mercadosUnicos = pgTable(
  "mercados_unicos",
  {
    id: serial(),
    mercadoHash: varchar('mercado_hash', { length: 255 }),
    nome: varchar({ length: 255 }).notNull(),
    segmentacao: varchar({ length: 50 }),
    categoria: varchar({ length: 100 }),
    tamanhoMercado: text('tamanho_mercado'),
    crescimentoAnual: text('crescimento_anual'),
    tendencias: text(),
    principaisPlayers: text('principais_players'),
    quantidadeClientes: integer('quantidade_clientes').default(0),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    projectId: integer('project_id').default(1).notNull(),
    pesquisaId: integer('pesquisa_id'),
  },
  table => [
    index("idx_mercados_projectId").on(table.projectId),
    index("unique_mercado_hash").on(table.mercadoHash),
    index("idx_mercado_hash").on(table.mercadoHash),
  ]
);

export const exportHistory = pgTable(
  "export_history",
  {
    id: varchar({ length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    projectId: integer('project_id').references(() => projects.id, { onDelete: "cascade" }),
    pesquisaId: integer('pesquisa_id').references(() => pesquisas.id, { onDelete: "cascade" }),
    context: text(),
    filters: jsonb(),
    format: varchar({ length: 50 }).notNull(),
    outputType: varchar('output_type', { length: 50 }).notNull(),
    recordCount: integer('record_count').default(0).notNull(),
    fileUrl: text('file_url'),
    fileSize: integer('file_size').default(0),
    generationTime: integer('generation_time').default(0),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  },
  table => [
    index("idx_export_user").on(table.userId),
    index("idx_export_project").on(table.projectId),
    index("idx_export_created").on(table.createdAt),
  ]
);

export const savedFiltersExport = pgTable(
  "saved_filters_export",
  {
    id: serial(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    projectId: integer('project_id').references(() => projects.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    filters: jsonb().notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  },
  table => [
    index("idx_saved_filter_user").on(table.userId),
    index("idx_saved_filter_project").on(table.projectId),
  ]
);

export const notifications = pgTable("notifications", {
  id: serial(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: "cascade" }),
  type: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: integer('entity_id'),
  isRead: integer('is_read').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: serial(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar({ length: 50 }).notNull(),
    enabled: integer().default(1).notNull(),
    channels: jsonb()
      .$type<{ email?: boolean; push?: boolean; inApp?: boolean }>()
      .default({ inApp: true }),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
  },
  table => [index("idx_user_type").on(table.userId, table.type)]
);

export const operationalAlerts = pgTable("operational_alerts", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  severity: varchar({ length: 50 })
    .default("medium")
    .notNull(),
  titulo: varchar({ length: 255 }).notNull(),
  mensagem: text().notNull(),
  acaoRecomendada: text('acao_recomendada'),
  valorAtual: text('valor_atual'),
  valorEsperado: text('valor_esperado'),
  isRead: integer('is_read').default(0).notNull(),
  isDismissed: integer('is_dismissed').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  readAt: timestamp('read_at', { mode: "string" }),
  dismissedAt: timestamp('dismissed_at', { mode: "string" }),
});

export const pesquisas = pgTable("pesquisas", {
  id: serial(),
  projectId: integer('projectId').notNull(),
  nome: varchar({ length: 255 }).notNull(),
  descricao: text(),
  dataImportacao: timestamp('dataImportacao', { mode: "string" }).defaultNow(),
  totalClientes: integer('totalClientes').default(0),
  clientesEnriquecidos: integer('clientesEnriquecidos').default(0),
  status: varchar({ length: 50 }).default("importado"),
  ativo: integer().default(1).notNull(),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
  qtdConcorrentesPorMercado: integer('qtdConcorrentesPorMercado').default(5),
  qtdLeadsPorMercado: integer('qtdLeadsPorMercado').default(10),
  qtdProdutosPorCliente: integer('qtdProdutosPorCliente').default(3),
});

export const produtos = pgTable(
  "produtos",
  {
    id: serial(),
    projectId: integer('project_id').notNull(),
    clienteId: integer('cliente_id').notNull(),
    mercadoId: integer('mercado_id').notNull(),
    nome: varchar({ length: 255 }).notNull(),
    descricao: text(),
    categoria: varchar({ length: 100 }),
    preco: text(),
    unidade: varchar({ length: 50 }),
    ativo: integer().default(1).notNull(),
    createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: "string" }).defaultNow(),
    pesquisaId: integer('pesquisa_id'),
  },
  table => [
    index("idx_produto_unique").on(
      table.clienteId,
      table.mercadoId,
      table.nome
    ),
  ]
);

export const projectAuditLog = pgTable("project_audit_log", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  userId: varchar('user_id', { length: 64 }),
  action: varchar({ length: 50 }).notNull(),
  changes: text(),
  metadata: text(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const projectTemplates = pgTable("project_templates", {
  id: serial(),
  name: varchar({ length: 100 }).notNull(),
  description: text(),
  config: text().notNull(),
  isDefault: integer('is_default').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial(),
  nome: varchar({ length: 255 }).notNull(),
  descricao: text(),
  cor: varchar({ length: 7 }).default("#3b82f6"),
  ativo: integer().default(1).notNull(),
  status: varchar({ length: 50 }).default("active").notNull(),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
  executionMode: varchar('executionMode', { length: 50 }).default("sequential"),
  maxParallelJobs: integer('maxParallelJobs').default(3),
  isPaused: integer('isPaused').default(0),
  lastActivityAt: timestamp('lastActivityAt', { mode: "string" }).defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  tipo: varchar({ length: 50 }).notNull(),
  prioridade: varchar({ length: 50 }).default("media").notNull(),
  titulo: varchar({ length: 255 }).notNull(),
  descricao: text().notNull(),
  acao: text().notNull(),
  leadsAdicionaisEstimado: integer('leads_adicionais_estimado').default(0),
  qualidadeEsperada: integer('qualidade_esperada').default(0),
  custoEstimado: integer('custo_estimado').default(0),
  roiEsperado: integer('roi_esperado').default(0),
  isApplied: integer('is_applied').default(0).notNull(),
  isDismissed: integer('is_dismissed').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  appliedAt: timestamp('applied_at', { mode: "string" }),
  dismissedAt: timestamp('dismissed_at', { mode: "string" }),
});

export const salesforceSyncLog = pgTable("salesforce_sync_log", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  pesquisaId: integer('pesquisa_id'),
  syncType: varchar('sync_type', { length: 50 }).default("manual").notNull(),
  totalLeadsExportados: integer('total_leads_exportados').default(0),
  totalLeadsSucesso: integer('total_leads_sucesso').default(0),
  totalLeadsErro: integer('total_leads_erro').default(0),
  status: varchar({ length: 50 })
    .default("em_progresso")
    .notNull(),
  errorMessage: text('error_message'),
  leadIds: text('lead_ids'),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  completedAt: timestamp('completed_at', { mode: "string" }),
});

export const savedFilters = pgTable("saved_filters", {
  id: serial(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  name: varchar({ length: 100 }).notNull(),
  filtersJson: text('filters_json').notNull(),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  projectId: integer('project_id'),
  isPublic: integer('is_public').default(0).notNull(),
  shareToken: varchar('share_token', { length: 64 }),
});

export const scheduledEnrichments = pgTable("scheduled_enrichments", {
  id: serial(),
  projectId: integer('project_id').notNull(),
  scheduledAt: timestamp('scheduled_at', { mode: "string" }).notNull(),
  recurrence: varchar({ length: 50 }).default("once").notNull(),
  batchSize: integer('batch_size').default(50),
  maxClients: integer('max_clients'),
  timeout: integer().default(3600),
  status: varchar({ length: 50 })
    .default("pending")
    .notNull(),
  errorMessage: text('error_message'),
  lastRunAt: timestamp('last_run_at', { mode: "string" }),
  nextRunAt: timestamp('next_run_at', { mode: "string" }),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial(),
  name: varchar({ length: 50 }).notNull(),
  color: varchar({ length: 7 }).default("#3b82f6"),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
});

export const users = pgTable("users", {
  id: varchar({ length: 64 }).primaryKey().notNull(),
  email: varchar({ length: 320 }).unique().notNull(),
  nome: varchar({ length: 255 }).notNull(),
  empresa: varchar({ length: 255 }).notNull(),
  cargo: varchar({ length: 100 }).notNull(),
  setor: varchar({ length: 100 }).notNull(),
  senhaHash: varchar('senha_hash', { length: 255 }).notNull(),
  role: varchar({ length: 50 }).default("visualizador").notNull(),
  ativo: smallint().default(0).notNull(),
  liberadoPor: varchar('liberado_por', { length: 64 }),
  liberadoEm: timestamp('liberado_em', { mode: "string" }),
  createdAt: timestamp('created_at', { mode: "string" }).defaultNow(),
  lastSignedIn: timestamp('last_signed_in', { mode: "string" }),
}, table => [
  index("idx_email").on(table.email),
  index("idx_ativo").on(table.ativo),
  index("idx_role").on(table.role),
]);

export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference =
  typeof notificationPreferences.$inferInsert;

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
export type InsertScheduledEnrichment =
  typeof scheduledEnrichments.$inferInsert;

export type LLMProviderConfig = typeof llmProviderConfigs.$inferSelect;
export type InsertLLMProviderConfig = typeof llmProviderConfigs.$inferInsert;

export type IntelligentAlertsConfig =
  typeof intelligentAlertsConfigs.$inferSelect;
export type InsertIntelligentAlertsConfig =
  typeof intelligentAlertsConfigs.$inferInsert;

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

export type IntelligentAlertsHistory =
  typeof intelligentAlertsHistory.$inferSelect;
export type InsertIntelligentAlertsHistory =
  typeof intelligentAlertsHistory.$inferInsert;

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = typeof exportHistory.$inferInsert;

export type SavedFilterExport = typeof savedFiltersExport.$inferSelect;
export type InsertSavedFilterExport = typeof savedFiltersExport.$inferInsert;

// ========================================
// RESEARCH DRAFTS (Auto-save do Wizard)
// Fase 60.1
// ========================================

export const researchDrafts = pgTable("research_drafts", {
  id: serial("id").primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  projectId: integer("projectId"),
  draftData: jsonb("draftData").notNull(),
  currentStep: integer("currentStep").default(1).notNull(),
  progressStatus: progressStatusEnum("progressStatus").default("started"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ResearchDraft = typeof researchDrafts.$inferSelect;
export type InsertResearchDraft = typeof researchDrafts.$inferInsert;

// ========================================
// PUSH SUBSCRIPTIONS (Web Push API)
// Fase 66.2
// ========================================

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("userId", { length: 64 }).notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow(),
    lastUsedAt: timestamp("lastUsedAt").defaultNow(),
  },
  table => [index("idx_userId").on(table.userId)]
);

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ========================================
// REPORT SCHEDULES (Agendamento de Relatórios)
// Fase 65.1
// ========================================

export const reportSchedules = pgTable(
  "report_schedules",
  {
    id: serial("id").primaryKey(),
    userId: varchar("userId", { length: 64 }).notNull(),
    projectId: integer("projectId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    frequency: frequencyEnum("frequency").notNull(),
    recipients: text("recipients").notNull(), // JSON array de emails
    config: jsonb("config").notNull(), // Configurações do relatório (filtros, formato, etc)
    nextRunAt: timestamp("nextRunAt", { mode: "string" }).notNull(),
    lastRunAt: timestamp("lastRunAt", { mode: "string" }),
    enabled: smallint("enabled").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => [
    index("idx_userId").on(table.userId),
    index("idx_projectId").on(table.projectId),
    index("idx_nextRunAt").on(table.nextRunAt),
  ]
);

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = typeof reportSchedules.$inferInsert;

// ============================================================================
// TABELAS DE AUTENTICAÇÃO E GESTÃO DE USUÁRIOS
// ============================================================================

export const userInvites = pgTable(
  "user_invites",
  {
    id: varchar({ length: 64 }).primaryKey().notNull(),
    email: varchar({ length: 320 }).notNull(),
    perfil: varchar({ length: 50 }).notNull(),
    token: varchar({ length: 255 }).unique().notNull(),
    criadoPor: varchar('criado_por', { length: 64 }).notNull(),
    criadoEm: timestamp('criado_em', { mode: "string" }).defaultNow().notNull(),
    expiraEm: timestamp('expira_em', { mode: "string" }).notNull(),
    usado: smallint().default(0).notNull(),
    usadoEm: timestamp('usado_em', { mode: "string" }),
    cancelado: smallint().default(0).notNull(),
  },
  table => [
    index("idx_token").on(table.token),
    index("idx_email").on(table.email),
    index("idx_usado").on(table.usado),
    foreignKey({
      columns: [table.criadoPor],
      foreignColumns: [users.id],
      name: "fk_invite_criado_por",
    }),
  ]
);

export type UserInvite = typeof userInvites.$inferSelect;
export type InsertUserInvite = typeof userInvites.$inferInsert;

export const passwordResets = pgTable(
  "password_resets",
  {
    id: varchar({ length: 64 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    token: varchar({ length: 255 }).unique().notNull(),
    criadoEm: timestamp('criado_em', { mode: "string" }).defaultNow().notNull(),
    expiraEm: timestamp('expira_em', { mode: "string" }).notNull(),
    usado: smallint().default(0).notNull(),
  },
  table => [
    index("idx_token").on(table.token),
    index("idx_user").on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_password_reset_user",
    }),
  ]
);

export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 320 }).notNull(),
    sucesso: smallint().notNull(),
    ip: varchar({ length: 45 }),
    userAgent: text('user_agent'),
    tentativaEm: timestamp('tentativa_em', { mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_email_tentativa").on(table.email, table.tentativaEm),
  ]
);

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

export const emailConfig = pgTable("email_config", {
  id: serial().primaryKey().notNull(),
  projectId: integer('project_id').notNull(),
  provider: varchar({ length: 50 }).default("resend").notNull(),
  apiKey: varchar('api_key', { length: 255 }).notNull(),
  fromEmail: varchar('from_email', { length: 320 }).notNull(),
  fromName: varchar('from_name', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt', { mode: "string" }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: "string" }).defaultNow(),
});

export type EmailConfig = typeof emailConfig.$inferSelect;
export type InsertEmailConfig = typeof emailConfig.$inferInsert;
