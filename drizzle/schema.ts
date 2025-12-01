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
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum declarations
export const progressStatusEnum = pgEnum('progressStatus', [
  'started',
  'in_progress',
  'almost_done',
]);

export const frequencyEnum = pgEnum('frequency', ['weekly', 'monthly']);

export const activityLog = pgTable(
  'activity_log',
  {
    id: serial(),
    projectId: integer('projectId').notNull(),
    activityType: varchar('activityType', { length: 50 }).notNull(),
    description: text(),
    metadata: jsonb(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_project').on(table.projectId),
    index('idx_type').on(table.activityType),
    index('idx_created').on(table.createdAt),
  ]
);

export const alertConfigs = pgTable('alert_configs', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  name: varchar({ length: 255 }).notNull(),
  alertType: varchar('alertType', { length: 50 }).notNull(),
  condition: text().notNull(),
  enabled: smallint().default(1).notNull(),
  lastTriggeredAt: timestamp('lastTriggeredAt', { mode: 'string' }),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export const alertHistory = pgTable('alert_history', {
  id: serial(),
  alertConfigId: integer('alertConfigId').notNull(),
  projectId: integer('projectId').notNull(),
  alertType: varchar('alertType', { length: 50 }).notNull(),
  condition: text().notNull(),
  message: text().notNull(),
  triggeredAt: timestamp('triggeredAt', { mode: 'string' }).defaultNow().notNull(),
});

export const analyticsDimensoes = pgTable('analytics_dimensoes', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  pesquisaId: integer('pesquisaId'),
  dimensaoTipo: varchar('dimensaoTipo', { length: 50 }).notNull(),
  dimensaoValor: varchar('dimensaoValor', { length: 100 }).notNull(),
  totalLeads: integer('totalLeads').default(0),
  qualidadeMedia: integer('qualidadeMedia').default(0),
  taxaConversaoSf: integer('taxaConversaoSf').default(0),
  custoMedioLead: integer('custoMedioLead').default(0),
  roi: integer().default(0),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const analyticsMercados = pgTable('analytics_mercados', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  pesquisaId: integer('pesquisaId'),
  mercadoId: integer('mercadoId').notNull(),
  periodo: timestamp({ mode: 'string' }).notNull(),
  totalClientes: integer('totalClientes').default(0),
  totalConcorrentes: integer('totalConcorrentes').default(0),
  totalLeadsGerados: integer('totalLeadsGerados').default(0),
  taxaCoberturaMercado: integer('taxaCoberturaMercado').default(0),
  qualidadeMediaLeads: integer('qualidadeMediaLeads').default(0),
  leadsAltaQualidade: integer('leadsAltaQualidade').default(0),
  leadsMediaQualidade: integer('leadsMediaQualidade').default(0),
  leadsBaixaQualidade: integer('leadsBaixaQualidade').default(0),
  leadsEnriquecidos: integer('leadsEnriquecidos').default(0),
  taxaSucessoEnriquecimento: integer('taxaSucessoEnriquecimento').default(0),
  tempoMedioEnriquecimentoMin: integer('tempoMedioEnriquecimentoMin').default(0),
  custoEnriquecimentoTotal: integer('custoEnriquecimentoTotal').default(0),
  leadsValidados: integer('leadsValidados').default(0),
  leadsAprovados: integer('leadsAprovados').default(0),
  leadsDescartados: integer('leadsDescartados').default(0),
  taxaAprovacao: integer('taxaAprovacao').default(0),
  leadsExportadosSf: integer('leadsExportadosSf').default(0),
  leadsConvertidosSf: integer('leadsConvertidosSf').default(0),
  taxaConversaoSf: integer('taxaConversaoSf').default(0),
  horasPesquisa: integer('horasPesquisa').default(0),
  custoTotal: integer('custoTotal').default(0),
  roi: integer().default(0),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const analyticsPesquisas = pgTable('analytics_pesquisas', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  pesquisaId: integer('pesquisaId').notNull(),
  totalMercadosMapeados: integer('totalMercadosMapeados').default(0),
  totalClientesBase: integer('totalClientesBase').default(0),
  totalLeadsGerados: integer('totalLeadsGerados').default(0),
  taxaConversaoClienteLead: integer('taxaConversaoClienteLead').default(0),
  qualidadeMediaGeral: integer('qualidadeMediaGeral').default(0),
  distribuicaoQualidade: text('distribuicaoQualidade'),
  taxaSucessoEnriquecimento: integer('taxaSucessoEnriquecimento').default(0),
  tempoTotalEnriquecimentoHoras: integer('tempoTotalEnriquecimentoHoras').default(0),
  custoTotalEnriquecimento: integer('custoTotalEnriquecimento').default(0),
  leadsExportadosSf: integer('leadsExportadosSf').default(0),
  leadsConvertidosSf: integer('leadsConvertidosSf').default(0),
  taxaConversaoSf: integer('taxaConversaoSf').default(0),
  valorPipelineGerado: integer('valorPipelineGerado').default(0),
  custoTotalPesquisa: integer('custoTotalPesquisa').default(0),
  valorGerado: integer('valorGerado').default(0),
  roi: integer().default(0),
  dataInicio: timestamp('dataInicio', { mode: 'string' }),
  dataConclusao: timestamp('dataConclusao', { mode: 'string' }),
  duracaoDias: integer('duracaoDias').default(0),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const analyticsTimeline = pgTable('analytics_timeline', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  data: timestamp({ mode: 'string' }).notNull(),
  leadsGeradosDia: integer('leadsGeradosDia').default(0),
  leadsEnriquecidosDia: integer('leadsEnriquecidosDia').default(0),
  leadsValidadosDia: integer('leadsValidadosDia').default(0),
  leadsExportadosSfDia: integer('leadsExportadosSfDia').default(0),
  qualidadeMediaDia: integer('qualidadeMediaDia').default(0),
  custoDia: integer('custoDia').default(0),
  leadsAcumulados: integer('leadsAcumulados').default(0),
  custoAcumulado: integer('custoAcumulado').default(0),
  valorGeradoAcumulado: integer('valorGeradoAcumulado').default(0),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const clientes = pgTable(
  'clientes',
  {
    id: serial(),
    clienteHash: varchar('clienteHash', { length: 255 }),
    nome: varchar({ length: 255 }).notNull(),
    cnpj: varchar({ length: 20 }),
    siteOficial: varchar('siteOficial', { length: 500 }),
    produtoPrincipal: text('produtoPrincipal'),
    segmentacaoB2BB2C: varchar('segmentacaoB2BB2C', { length: 20 }),
    email: varchar({ length: 320 }),
    telefone: varchar({ length: 50 }),
    linkedin: varchar({ length: 500 }),
    instagram: varchar({ length: 500 }),
    cidade: varchar({ length: 100 }),
    uf: varchar({ length: 2 }),
    cnae: varchar({ length: 20 }),
    porte: varchar({ length: 50 }),
    qualidadeScore: integer('qualidadeScore'),
    qualidadeClassificacao: varchar('qualidadeClassificacao', { length: 50 }),
    validationStatus: varchar('validationStatus', { length: 50 }).default('pending'),
    validationNotes: text('validationNotes'),
    validatedBy: varchar('validatedBy', { length: 64 }),
    validatedAt: timestamp('validatedAt', { mode: 'string' }),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    projectId: integer('projectId').default(1).notNull(),
    regiao: varchar({ length: 100 }),
    faturamentoDeclarado: text('faturamentoDeclarado'),
    numeroEstabelecimentos: text('numeroEstabelecimentos'),
    pesquisaId: integer('pesquisaId'),
    latitude: numeric({ precision: 10, scale: 8 }),
    longitude: numeric({ precision: 11, scale: 8 }),
    geocodedAt: timestamp('geocodedAt', { mode: 'string' }),
  },
  (table) => [
    index('idx_clientes_projectId').on(table.projectId),
    index('unique_cliente_hash').on(table.clienteHash),
    index('idx_clientes_pesquisaId').on(table.pesquisaId),
    index('idx_clientes_cnae').on(table.cnae),
  ]
);

export const clientesHistory = pgTable('clientes_history', {
  id: serial(),
  clienteId: integer('clienteId').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  changeType: varchar('changeType', { length: 50 }).default('updated'),
  changedBy: varchar('changedBy', { length: 64 }),
  changedAt: timestamp('changedAt', { mode: 'string' }).defaultNow(),
});

export const clientesMercados = pgTable(
  'clientes_mercados',
  {
    id: serial(),
    clienteId: integer('clienteId').notNull(),
    mercadoId: integer('mercadoId').notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [index('idx_cliente_mercado').on(table.clienteId, table.mercadoId)]
);

export const concorrentes = pgTable(
  'concorrentes',
  {
    id: serial(),
    concorrenteHash: varchar('concorrenteHash', { length: 255 }),
    mercadoId: integer('mercadoId').notNull(),
    nome: varchar({ length: 255 }).notNull(),
    cnpj: varchar({ length: 20 }),
    site: varchar({ length: 500 }),
    produto: text(),
    porte: varchar({ length: 50 }),
    faturamentoEstimado: text('faturamentoEstimado'),
    cnae: varchar({ length: 20 }),
    setor: varchar({ length: 100 }),
    email: varchar({ length: 320 }),
    telefone: varchar({ length: 50 }),
    qualidadeScore: integer('qualidadeScore'),
    qualidadeClassificacao: varchar('qualidadeClassificacao', { length: 50 }),
    validationStatus: varchar('validationStatus', { length: 50 }).default('pending'),
    validationNotes: text('validationNotes'),
    validatedBy: varchar('validatedBy', { length: 64 }),
    validatedAt: timestamp('validatedAt', { mode: 'string' }),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    projectId: integer('projectId').default(1).notNull(),
    cidade: varchar({ length: 100 }),
    uf: varchar({ length: 2 }),
    faturamentoDeclarado: text('faturamentoDeclarado'),
    numeroEstabelecimentos: text('numeroEstabelecimentos'),
    pesquisaId: integer('pesquisaId'),
    latitude: numeric({ precision: 10, scale: 8 }),
    longitude: numeric({ precision: 11, scale: 8 }),
    geocodedAt: timestamp('geocodedAt', { mode: 'string' }),
  },
  (table) => [
    index('idx_concorrentes_projectId').on(table.projectId),
    index('unique_concorrente_hash').on(table.concorrenteHash),
    index('idx_concorrente_hash').on(table.concorrenteHash),
    index('idx_concorrentes_pesquisaId').on(table.pesquisaId),
    index('idx_concorrentes_setor').on(table.setor),
  ]
);

export const concorrentesHistory = pgTable('concorrentes_history', {
  id: serial(),
  concorrenteId: integer('concorrenteId').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  changeType: varchar('changeType', { length: 50 }).default('updated'),
  changedBy: varchar('changedBy', { length: 64 }),
  changedAt: timestamp('changedAt', { mode: 'string' }).defaultNow(),
});

export const enrichmentCache = pgTable(
  'enrichment_cache',
  {
    cnpj: varchar({ length: 14 }).notNull(),
    dadosJson: text('dadosJson').notNull(),
    fonte: varchar({ length: 50 }),
    dataAtualizacao: timestamp('dataAtualizacao', { mode: 'string' }).defaultNow().notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [index('idx_data_atualizacao').on(table.dataAtualizacao)]
);

export const enrichmentConfigs = pgTable(
  'enrichment_configs',
  {
    id: serial(),
    projectId: integer('projectId').notNull(),
    openaiApiKey: text('openaiApiKey'),
    serpapiKey: text('serpapiKey'),
    receitawsKey: text('receitawsKey'),
    produtosPorMercado: integer('produtosPorMercado').default(3).notNull(),
    concorrentesPorMercado: integer('concorrentesPorMercado').default(5).notNull(),
    leadsPorMercado: integer('leadsPorMercado').default(5).notNull(),
    batchSize: integer('batchSize').default(50).notNull(),
    checkpointInterval: integer('checkpointInterval').default(100).notNull(),
    enableDeduplication: integer('enableDeduplication').default(1).notNull(),
    enableQualityScore: integer('enableQualityScore').default(1).notNull(),
    enableAutoRetry: integer('enableAutoRetry').default(1).notNull(),
    maxRetries: integer('maxRetries').default(2).notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
    geminiApiKey: text('geminiApiKey'),
    anthropicApiKey: text('anthropicApiKey'),
    googleMapsApiKey: text('googleMapsApiKey'),
  },
  (table) => [index('projectId').on(table.projectId)]
);

export const systemSettings = pgTable(
  'system_settings',
  {
    id: serial(),
    settingKey: varchar('settingKey', { length: 100 }).notNull(),
    settingValue: text('settingValue'),
    description: text(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [index('idx_setting_key').on(table.settingKey)]
);

export const enrichmentJobs = pgTable('enrichment_jobs', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  pesquisaId: integer('pesquisaId'),
  status: varchar({ length: 50 }).default('pending').notNull(),
  totalClientes: integer('totalClientes').notNull(),
  processedClientes: integer('processedClientes').default(0).notNull(),
  successClientes: integer('successClientes').default(0).notNull(),
  failedClientes: integer('failedClientes').default(0).notNull(),
  currentBatch: integer('currentBatch').default(0).notNull(),
  totalBatches: integer('totalBatches').notNull(),
  batchSize: integer('batchSize').default(5).notNull(),
  checkpointInterval: integer('checkpointInterval').default(50).notNull(),
  startedAt: timestamp('startedAt', { mode: 'string' }),
  pausedAt: timestamp('pausedAt', { mode: 'string' }),
  completedAt: timestamp('completedAt', { mode: 'string' }),
  estimatedTimeRemaining: integer('estimatedTimeRemaining'),
  lastClienteId: integer('lastClienteId'),
  errorMessage: text('errorMessage'),
  notifiedCompletion: integer('notifiedCompletion').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export const geocodingJobs = pgTable('geocoding_jobs', {
  id: serial(),
  pesquisaId: integer('pesquisaId').notNull(),
  userId: varchar('userId', { length: 255 }).notNull(),
  status: varchar({ length: 50 }).default('pending').notNull(),
  totalEntities: integer('totalEntities').notNull(),
  processedEntities: integer('processedEntities').default(0).notNull(),
  totalBatches: integer('totalBatches').notNull(),
  currentBatch: integer('currentBatch').default(0).notNull(),
  clientesTotal: integer('clientesTotal').default(0).notNull(),
  leadsTotal: integer('leadsTotal').default(0).notNull(),
  concorrentesTotal: integer('concorrentesTotal').default(0).notNull(),
  clientesProcessed: integer('clientesProcessed').default(0).notNull(),
  leadsProcessed: integer('leadsProcessed').default(0).notNull(),
  concorrentesProcessed: integer('concorrentesProcessed').default(0).notNull(),
  startedAt: timestamp('startedAt', { mode: 'string' }),
  completedAt: timestamp('completedAt', { mode: 'string' }),
  error: text('error'),
  notifiedCompletion: integer('notifiedCompletion').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export const enrichmentQueue = pgTable(
  'enrichment_queue',
  {
    id: serial(),
    projectId: integer('projectId')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    status: varchar({ length: 50 }).default('pending'),
    priority: integer().default(0),
    clienteData: jsonb('clienteData').notNull(),
    result: jsonb(),
    errorMessage: text('errorMessage'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    startedAt: timestamp('startedAt', { mode: 'string' }),
    completedAt: timestamp('completedAt', { mode: 'string' }),
  },
  (table) => [
    index('idx_queue_status').on(table.status),
    index('idx_queue_project').on(table.projectId),
    index('idx_queue_priority').on(table.priority),
  ]
);

export const enrichmentRuns = pgTable('enrichment_runs', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  startedAt: timestamp('startedAt', { mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp('completedAt', { mode: 'string' }),
  totalClients: integer('totalClients').notNull(),
  processedClients: integer('processedClients').default(0).notNull(),
  status: varchar({ length: 50 }).default('running').notNull(),
  durationSeconds: integer('durationSeconds'),
  errorMessage: text('errorMessage'),
  notifiedAt50: integer('notifiedAt50').default(0).notNull(),
  notifiedAt75: integer('notifiedAt75').default(0).notNull(),
  notifiedAt100: integer('notifiedAt100').default(0).notNull(),
});

export const entityTags = pgTable('entity_tags', {
  id: serial(),
  tagId: integer('tagId').notNull(),
  entityType: varchar('entityType', { length: 50 }).notNull(),
  entityId: integer('entityId').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const hibernationWarnings = pgTable('hibernation_warnings', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  warningDate: timestamp('warningDate', { mode: 'string' }).defaultNow().notNull(),
  scheduledHibernationDate: timestamp('scheduledHibernationDate', { mode: 'string' }).notNull(),
  daysInactive: integer('daysInactive').notNull(),
  notificationSent: integer('notificationSent').default(0).notNull(),
  postponed: integer().default(0).notNull(),
  postponedUntil: timestamp('postponedUntil', { mode: 'string' }),
  hibernated: integer().default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const intelligentAlertsConfigs = pgTable(
  'intelligent_alerts_configs',
  {
    id: serial(),
    projectId: integer('projectId').notNull(),
    circuitBreakerThreshold: integer('circuitBreakerThreshold').default(10).notNull(),
    errorRateThreshold: integer('errorRateThreshold').default(10).notNull(),
    processingTimeThreshold: integer('processingTimeThreshold').default(60).notNull(),
    notifyOnCompletion: integer('notifyOnCompletion').default(1).notNull(),
    notifyOnCircuitBreaker: integer('notifyOnCircuitBreaker').default(1).notNull(),
    notifyOnErrorRate: integer('notifyOnErrorRate').default(1).notNull(),
    notifyOnProcessingTime: integer('notifyOnProcessingTime').default(1).notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [index('intelligent_alerts_configs_projectId_unique').on(table.projectId)]
);

export const intelligentAlertsHistory = pgTable('intelligent_alerts_history', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  alertType: varchar('alertType', { length: 50 }).notNull(),
  severity: varchar({ length: 50 }).default('info').notNull(),
  title: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  metricValue: text('metricValue'),
  threshold: text(),
  jobId: integer('jobId'),
  clientsProcessed: integer('clientsProcessed'),
  totalClients: integer('totalClients'),
  isRead: integer('isRead').default(0).notNull(),
  isDismissed: integer('isDismissed').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  readAt: timestamp('readAt', { mode: 'string' }),
  dismissedAt: timestamp('dismissedAt', { mode: 'string' }),
});

export const leadConversions = pgTable('lead_conversions', {
  id: serial(),
  leadId: integer('leadId').notNull(),
  projectId: integer('projectId').notNull(),
  dealValue: numeric('deal_value', { precision: 15, scale: 2 }),
  convertedAt: timestamp('convertedAt', { mode: 'string' }).defaultNow(),
  notes: text(),
  status: varchar({ length: 50 }).default('won'),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const leads = pgTable(
  'leads',
  {
    id: serial(),
    leadHash: varchar('leadHash', { length: 255 }),
    mercadoId: integer('mercadoId').notNull(),
    nome: varchar({ length: 255 }).notNull(),
    cnpj: varchar({ length: 20 }),
    site: varchar({ length: 500 }),
    email: varchar({ length: 320 }),
    telefone: varchar({ length: 50 }),
    tipo: varchar({ length: 20 }),
    porte: varchar({ length: 50 }),
    regiao: varchar({ length: 100 }),
    setor: varchar({ length: 100 }),
    cnae: varchar({ length: 20 }),
    qualidadeScore: integer('qualidadeScore'),
    qualidadeClassificacao: varchar('qualidadeClassificacao', { length: 50 }),
    leadStage: varchar('leadStage', { length: 50 }).default('novo'),
    stageUpdatedAt: timestamp('stageUpdatedAt', { mode: 'string' }).defaultNow(),
    validationStatus: varchar('validationStatus', { length: 50 }).default('pending'),
    validationNotes: text('validationNotes'),
    validatedBy: varchar('validatedBy', { length: 64 }),
    validatedAt: timestamp('validatedAt', { mode: 'string' }),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    projectId: integer('projectId').default(1).notNull(),
    cidade: varchar({ length: 100 }),
    uf: varchar({ length: 2 }),
    faturamentoDeclarado: text('faturamentoDeclarado'),
    numeroEstabelecimentos: text('numeroEstabelecimentos'),
    pesquisaId: integer('pesquisaId'),
    stage: varchar({ length: 50 }).default('novo'),
    latitude: numeric({ precision: 10, scale: 8 }),
    longitude: numeric({ precision: 11, scale: 8 }),
    geocodedAt: timestamp('geocodedAt', { mode: 'string' }),
  },
  (table) => [
    index('idx_leads_projectId').on(table.projectId),
    index('unique_lead_hash').on(table.leadHash),
    index('idx_lead_hash').on(table.leadHash),
    index('idx_leads_pesquisaId').on(table.pesquisaId),
    index('idx_leads_setor').on(table.setor),
  ]
);

export const leadsHistory = pgTable('leads_history', {
  id: serial(),
  leadId: integer('leadId').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  changeType: varchar('changeType', { length: 50 }).default('updated'),
  changedBy: varchar('changedBy', { length: 64 }),
  changedAt: timestamp('changedAt', { mode: 'string' }).defaultNow(),
});

export const llmProviderConfigs = pgTable('llm_provider_configs', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  activeProvider: varchar('activeProvider', { length: 50 }).default('openai').notNull(),
  openaiApiKey: text('openaiApiKey'),
  openaiModel: varchar('openaiModel', { length: 100 }).default('gpt-4o'),
  openaiEnabled: integer('openaiEnabled').default(1).notNull(),
  geminiApiKey: text('geminiApiKey'),
  geminiModel: varchar('geminiModel', { length: 100 }).default('gemini-2.0-flash-exp'),
  geminiEnabled: integer('geminiEnabled').default(0).notNull(),
  anthropicApiKey: text('anthropicApiKey'),
  anthropicModel: varchar('anthropicModel', { length: 100 }).default('claude-3-5-sonnet-20241022'),
  anthropicEnabled: integer('anthropicEnabled').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export const mercadosHistory = pgTable('mercados_history', {
  id: serial(),
  mercadoId: integer('mercadoId').notNull(),
  field: varchar({ length: 100 }),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  changeType: varchar('changeType', { length: 50 }).default('updated'),
  changedBy: varchar('changedBy', { length: 64 }),
  changedAt: timestamp('changedAt', { mode: 'string' }).defaultNow(),
});

export const mercadosUnicos = pgTable(
  'mercados_unicos',
  {
    id: serial(),
    mercadoHash: varchar('mercadoHash', { length: 255 }),
    nome: varchar({ length: 255 }).notNull(),
    segmentacao: varchar({ length: 50 }),
    categoria: varchar({ length: 100 }),
    tamanhoMercado: text('tamanhoMercado'),
    crescimentoAnual: text('crescimentoAnual'),
    tendencias: text(),
    principaisPlayers: text('principaisPlayers'),
    quantidadeClientes: integer('quantidadeClientes').default(0),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    projectId: integer('projectId').default(1).notNull(),
    pesquisaId: integer('pesquisaId'),
  },
  (table) => [
    index('idx_mercados_projectId').on(table.projectId),
    index('unique_mercado_hash').on(table.mercadoHash),
    index('idx_mercado_hash').on(table.mercadoHash),
  ]
);

export const exportHistory = pgTable(
  'export_history',
  {
    id: varchar({ length: 64 }).primaryKey(),
    userId: varchar('userId', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: integer('projectId').references(() => projects.id, { onDelete: 'cascade' }),
    pesquisaId: integer('pesquisaId').references(() => pesquisas.id, { onDelete: 'cascade' }),
    context: text(),
    filters: jsonb(),
    format: varchar({ length: 50 }).notNull(),
    outputType: varchar('outputType', { length: 50 }).notNull(),
    recordCount: integer('recordCount').default(0).notNull(),
    fileUrl: text('fileUrl'),
    fileSize: integer('fileSize').default(0),
    generationTime: integer('generationTime').default(0),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_export_user').on(table.userId),
    index('idx_export_project').on(table.projectId),
    index('idx_export_created').on(table.createdAt),
  ]
);

export const savedFiltersExport = pgTable(
  'saved_filters_export',
  {
    id: serial(),
    userId: varchar('userId', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: integer('projectId').references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    entityType: varchar('entityType', { length: 50 }).notNull(),
    filters: jsonb().notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_saved_filter_user').on(table.userId),
    index('idx_saved_filter_project').on(table.projectId),
  ]
);

export const notifications = pgTable('notifications', {
  id: serial(),
  userId: varchar('userId', { length: 64 }).references(() => users.id, {
    onDelete: 'cascade',
  }),
  projectId: integer('projectId').references(() => projects.id, { onDelete: 'cascade' }),
  type: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  entityType: varchar('entityType', { length: 50 }),
  entityId: integer('entityId'),
  isRead: integer('isRead').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: serial(),
    userId: varchar('userId', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar({ length: 50 }).notNull(),
    enabled: integer().default(1).notNull(),
    channels: jsonb()
      .$type<{ email?: boolean; push?: boolean; inApp?: boolean }>()
      .default({ inApp: true }),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [index('idx_user_type').on(table.userId, table.type)]
);

export const operationalAlerts = pgTable('operational_alerts', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  alertType: varchar('alertType', { length: 50 }).notNull(),
  severity: varchar({ length: 50 }).default('medium').notNull(),
  titulo: varchar({ length: 255 }).notNull(),
  mensagem: text().notNull(),
  acaoRecomendada: text('acaoRecomendada'),
  valorAtual: text('valorAtual'),
  valorEsperado: text('valorEsperado'),
  isRead: integer('isRead').default(0).notNull(),
  isDismissed: integer('isDismissed').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  readAt: timestamp('readAt', { mode: 'string' }),
  dismissedAt: timestamp('dismissedAt', { mode: 'string' }),
});

export const pesquisas = pgTable('pesquisas', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  nome: varchar({ length: 255 }).notNull(),
  descricao: text(),
  dataImportacao: timestamp('dataImportacao', { mode: 'string' }).defaultNow(),
  totalClientes: integer('totalClientes').default(0),
  clientesEnriquecidos: integer('clientesEnriquecidos').default(0),
  status: varchar({ length: 50 }).default('importado'),
  ativo: integer().default(1).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  qtdConcorrentesPorMercado: integer('qtdConcorrentesPorMercado').default(5),
  qtdLeadsPorMercado: integer('qtdLeadsPorMercado').default(10),
  qtdProdutosPorCliente: integer('qtdProdutosPorCliente').default(3),
});

export const produtos = pgTable(
  'produtos',
  {
    id: serial(),
    projectId: integer('projectId').notNull(),
    clienteId: integer('clienteId').notNull(),
    mercadoId: integer('mercadoId').notNull(),
    nome: varchar({ length: 255 }).notNull(),
    descricao: text(),
    categoria: varchar({ length: 100 }),
    preco: text(),
    unidade: varchar({ length: 50 }),
    ativo: integer().default(1).notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
    pesquisaId: integer('pesquisaId'),
  },
  (table) => [index('idx_produto_unique').on(table.clienteId, table.mercadoId, table.nome)]
);

export const projectAuditLog = pgTable('project_audit_log', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  userId: varchar('userId', { length: 64 }),
  action: varchar({ length: 50 }).notNull(),
  changes: text(),
  metadata: text(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const projectTemplates = pgTable('project_templates', {
  id: serial(),
  name: varchar({ length: 100 }).notNull(),
  description: text(),
  config: text().notNull(),
  isDefault: integer('isDefault').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export const projects = pgTable('projects', {
  id: serial(),
  nome: varchar({ length: 255 }).notNull(),
  descricao: text(),
  cor: varchar({ length: 7 }).default('#3b82f6'),
  ativo: integer().default(1).notNull(),
  status: varchar({ length: 50 }).default('active').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  executionMode: varchar('executionMode', { length: 50 }).default('sequential'),
  maxParallelJobs: integer('maxParallelJobs').default(3),
  isPaused: integer('isPaused').default(0),
  lastActivityAt: timestamp('lastActivityAt', { mode: 'string' }).defaultNow(),
});

export const recommendations = pgTable('recommendations', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  tipo: varchar({ length: 50 }).notNull(),
  prioridade: varchar({ length: 50 }).default('media').notNull(),
  titulo: varchar({ length: 255 }).notNull(),
  descricao: text().notNull(),
  acao: text().notNull(),
  leadsAdicionaisEstimado: integer('leadsAdicionaisEstimado').default(0),
  qualidadeEsperada: integer('qualidadeEsperada').default(0),
  custoEstimado: integer('custoEstimado').default(0),
  roiEsperado: integer('roiEsperado').default(0),
  isApplied: integer('isApplied').default(0).notNull(),
  isDismissed: integer('isDismissed').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  appliedAt: timestamp('appliedAt', { mode: 'string' }),
  dismissedAt: timestamp('dismissedAt', { mode: 'string' }),
});

export const salesforceSyncLog = pgTable('salesforce_sync_log', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  pesquisaId: integer('pesquisaId'),
  syncType: varchar('syncType', { length: 50 }).default('manual').notNull(),
  totalLeadsExportados: integer('totalLeadsExportados').default(0),
  totalLeadsSucesso: integer('totalLeadsSucesso').default(0),
  totalLeadsErro: integer('totalLeadsErro').default(0),
  status: varchar({ length: 50 }).default('em_progresso').notNull(),
  errorMessage: text('errorMessage'),
  leadIds: text('leadIds'),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  completedAt: timestamp('completedAt', { mode: 'string' }),
});

export const savedFilters = pgTable('saved_filters', {
  id: serial(),
  userId: varchar('userId', { length: 64 }).notNull(),
  name: varchar({ length: 100 }).notNull(),
  filtersJson: text('filtersJson').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  projectId: integer('projectId'),
  isPublic: integer('isPublic').default(0).notNull(),
  shareToken: varchar('shareToken', { length: 64 }),
});

export const scheduledEnrichments = pgTable('scheduled_enrichments', {
  id: serial(),
  projectId: integer('projectId').notNull(),
  scheduledAt: timestamp('scheduledAt', { mode: 'string' }).notNull(),
  recurrence: varchar({ length: 50 }).default('once').notNull(),
  batchSize: integer('batchSize').default(50),
  maxClients: integer('maxClients'),
  timeout: integer().default(3600),
  status: varchar({ length: 50 }).default('pending').notNull(),
  errorMessage: text('errorMessage'),
  lastRunAt: timestamp('lastRunAt', { mode: 'string' }),
  nextRunAt: timestamp('nextRunAt', { mode: 'string' }),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export const tags = pgTable('tags', {
  id: serial(),
  name: varchar({ length: 50 }).notNull(),
  color: varchar({ length: 7 }).default('#3b82f6'),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

export const users = pgTable(
  'users',
  {
    id: varchar({ length: 64 }).primaryKey().notNull(),
    email: varchar({ length: 320 }).unique().notNull(),
    nome: varchar({ length: 255 }),
    empresa: varchar({ length: 255 }),
    cargo: varchar({ length: 100 }),
    setor: varchar({ length: 100 }),
    senhaHash: varchar('senha_hash', { length: 255 }),
    role: varchar({ length: 50 }).default('visualizador').notNull(),
    ativo: smallint().default(0).notNull(),
    liberadoPor: varchar('liberado_por', { length: 64 }),
    liberadoEm: timestamp('liberado_em', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }),
    lastSignedIn: timestamp('last_sign_in_at', { mode: 'string' }),
  },
  (table) => [
    index('idx_email').on(table.email),
    index('idx_ativo').on(table.ativo),
    index('idx_role').on(table.role),
  ]
);

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

export type GeocodingJob = typeof geocodingJobs.$inferSelect;
export type InsertGeocodingJob = typeof geocodingJobs.$inferInsert;

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

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = typeof exportHistory.$inferInsert;

export type SavedFilterExport = typeof savedFiltersExport.$inferSelect;
export type InsertSavedFilterExport = typeof savedFiltersExport.$inferInsert;

// ========================================
// RESEARCH DRAFTS (Auto-save do Wizard)
// Fase 60.1
// ========================================

export const researchDrafts = pgTable('research_drafts', {
  id: serial('id').primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  projectId: integer('projectId'),
  draftData: jsonb('draftData').notNull(),
  currentStep: integer('currentStep').default(1).notNull(),
  progressStatus: progressStatusEnum('progressStatus').default('started'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export type ResearchDraft = typeof researchDrafts.$inferSelect;
export type InsertResearchDraft = typeof researchDrafts.$inferInsert;

// ========================================
// PUSH SUBSCRIPTIONS (Web Push API)
// Fase 66.2
// ========================================

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: serial('id').primaryKey(),
    userId: varchar('userId', { length: 64 }).notNull(),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('userAgent'),
    createdAt: timestamp('createdAt').defaultNow(),
    lastUsedAt: timestamp('lastUsedAt').defaultNow(),
  },
  (table) => [index('idx_userId').on(table.userId)]
);

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ========================================
// REPORT SCHEDULES (Agendamento de Relatórios)
// Fase 65.1
// ========================================

export const reportSchedules = pgTable(
  'report_schedules',
  {
    id: serial('id').primaryKey(),
    userId: varchar('userId', { length: 64 }).notNull(),
    projectId: integer('projectId').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    frequency: frequencyEnum('frequency').notNull(),
    recipients: text('recipients').notNull(), // JSON array de emails
    config: jsonb('config').notNull(), // Configurações do relatório (filtros, formato, etc)
    nextRunAt: timestamp('nextRunAt', { mode: 'string' }).notNull(),
    lastRunAt: timestamp('lastRunAt', { mode: 'string' }),
    enabled: smallint('enabled').default(1).notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => [
    index('idx_userId').on(table.userId),
    index('idx_projectId').on(table.projectId),
    index('idx_nextRunAt').on(table.nextRunAt),
  ]
);

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = typeof reportSchedules.$inferInsert;

// ============================================================================
// TABELAS DE AUTENTICAÇÃO E GESTÃO DE USUÁRIOS
// ============================================================================

export const userInvites = pgTable(
  'user_invites',
  {
    id: varchar({ length: 64 }).primaryKey().notNull(),
    email: varchar({ length: 320 }).notNull(),
    perfil: varchar({ length: 50 }).notNull(),
    token: varchar({ length: 255 }).unique().notNull(),
    criadoPor: varchar('criadoPor', { length: 64 }).notNull(),
    criadoEm: timestamp('criadoEm', { mode: 'string' }).defaultNow().notNull(),
    expiraEm: timestamp('expiraEm', { mode: 'string' }).notNull(),
    usado: smallint().default(0).notNull(),
    usadoEm: timestamp('usadoEm', { mode: 'string' }),
    cancelado: smallint().default(0).notNull(),
  },
  (table) => [
    index('idx_token').on(table.token),
    index('idx_email').on(table.email),
    index('idx_usado').on(table.usado),
    foreignKey({
      columns: [table.criadoPor],
      foreignColumns: [users.id],
      name: 'fk_invite_criado_por',
    }),
  ]
);

export type UserInvite = typeof userInvites.$inferSelect;
export type InsertUserInvite = typeof userInvites.$inferInsert;

export const passwordResets = pgTable(
  'password_resets',
  {
    id: varchar({ length: 64 }).primaryKey().notNull(),
    userId: varchar('userId', { length: 64 }).notNull(),
    token: varchar({ length: 255 }).unique().notNull(),
    criadoEm: timestamp('criadoEm', { mode: 'string' }).defaultNow().notNull(),
    expiraEm: timestamp('expiraEm', { mode: 'string' }).notNull(),
    usado: smallint().default(0).notNull(),
  },
  (table) => [
    index('idx_token').on(table.token),
    index('idx_user').on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_password_reset_user',
    }),
  ]
);

export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

export const loginAttempts = pgTable(
  'login_attempts',
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 320 }).notNull(),
    sucesso: smallint().notNull(),
    ip: varchar({ length: 45 }),
    userAgent: text('userAgent'),
    tentativaEm: timestamp('tentativaEm', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [index('idx_email_tentativa').on(table.email, table.tentativaEm)]
);

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

export const emailConfig = pgTable('email_config', {
  id: serial().primaryKey().notNull(),
  projectId: integer('projectId').notNull(),
  provider: varchar({ length: 50 }).default('resend').notNull(),
  apiKey: varchar('apiKey', { length: 255 }).notNull(),
  fromEmail: varchar('fromEmail', { length: 320 }).notNull(),
  fromName: varchar('fromName', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
});

export type EmailConfig = typeof emailConfig.$inferSelect;
export type InsertEmailConfig = typeof emailConfig.$inferInsert;

// ============================================================================
// AUDIT LOGS - Sistema de Auditoria e Rastreamento
// ============================================================================

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),

    // Identificação do recurso
    resourceType: varchar('resource_type', { length: 50 }).notNull(), // 'project' ou 'survey'
    resourceId: integer('resource_id').notNull(),
    resourceName: varchar('resource_name', { length: 255 }),

    // Tipo de evento
    eventType: varchar('event_type', { length: 50 }).notNull(),
    // Valores possíveis: 'created', 'updated', 'deleted', 'enrichment_started',
    // 'enrichment_completed', 'enrichment_failed', 'enrichment_paused', 'enrichment_resumed'

    // Detalhes do evento
    eventData: jsonb('event_data'), // Dados adicionais do evento (ex: métricas, erros)

    // Performance (apenas para eventos de enriquecimento)
    duration: integer('duration'), // Duração em segundos
    clientesProcessados: integer('clientes_processados'),
    clientesSucesso: integer('clientes_sucesso'),
    clientesFalha: integer('clientes_falha'),

    // Metadados
    userId: integer('user_id'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_resource').on(table.resourceType, table.resourceId),
    index('idx_audit_event').on(table.eventType),
    index('idx_audit_created').on(table.createdAt),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
