import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  decimal,
  boolean,
  date,
  unique,
  check,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// TABELA: users (já existe no banco)
// ============================================================================
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name'),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// ============================================================================
// DIMENSÃO: Tempo (Temporal)
// ============================================================================
export const dimTempo = pgTable('dim_tempo', {
  id: serial('id').primaryKey(),
  data: date('data').unique().notNull(),
  ano: integer('ano').notNull(),
  trimestre: integer('trimestre').notNull(),
  mes: integer('mes').notNull(),
  semana: integer('semana').notNull(),
  diaMes: integer('dia_mes').notNull(),
  diaAno: integer('dia_ano').notNull(),
  diaSemana: integer('dia_semana').notNull(),
  nomeMes: varchar('nome_mes', { length: 20 }).notNull(),
  nomeMesCurto: varchar('nome_mes_curto', { length: 3 }).notNull(),
  nomeDiaSemana: varchar('nome_dia_semana', { length: 20 }).notNull(),
  nomeDiaSemanaCurto: varchar('nome_dia_semana_curto', { length: 3 }).notNull(),
  ehFeriado: boolean('eh_feriado').default(false),
  ehFimSemana: boolean('eh_fim_semana').default(false),
  ehDiaUtil: boolean('eh_dia_util').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// DIMENSÃO: Canal
// ============================================================================
export const dimCanal = pgTable('dim_canal', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique().notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  descricao: text('descricao'),
  custoMedio: decimal('custo_medio', { precision: 12, scale: 2 }),
  taxaConversaoMedia: decimal('taxa_conversao_media', { precision: 5, scale: 2 }),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// ============================================================================
// DIMENSÃO: Projeto
// ============================================================================
export const dimProjeto = pgTable(
  'dim_projeto',
  {
    id: serial('id').primaryKey(),
    codigo: varchar('codigo', { length: 50 }).unique(),
    nome: varchar('nome', { length: 255 }).notNull(),
    descricao: text('descricao'),
    status: varchar('status', { length: 20 }).notNull().default('ativo'),
    ownerId: integer('owner_id').notNull(),
    unidadeNegocio: varchar('unidade_negocio', { length: 100 }),
    centroCusto: varchar('centro_custo', { length: 50 }),
    orcamentoTotal: decimal('orcamento_total', { precision: 15, scale: 2 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: varchar('updated_by', { length: 255 }),
    deletedAt: timestamp('deleted_at'),
    deletedBy: varchar('deleted_by', { length: 255 }),
  },
  (table) => ({
    uniqueNomeOwner: unique().on(table.nome, table.ownerId),
  })
);

// ============================================================================
// DIMENSÃO: Pesquisa
// ============================================================================
export const dimPesquisa = pgTable(
  'dim_pesquisa',
  {
    id: serial('id').primaryKey(),
    projetoId: integer('projeto_id')
      .notNull()
      .references(() => dimProjeto.id, { onDelete: 'cascade' }),
    nome: varchar('nome', { length: 255 }).notNull(),
    descricao: text('descricao'),
    objetivo: text('objetivo'),
    status: varchar('status', { length: 20 }).notNull().default('pendente'),
    totalEntidades: integer('total_entidades').default(0),
    entidadesEnriquecidas: integer('entidades_enriquecidas').default(0),
    entidadesFalhadas: integer('entidades_falhadas').default(0),
    qualidadeMedia: decimal('qualidade_media', { precision: 5, scale: 2 }),
    startedAt: timestamp('started_at'),
    startedBy: integer('started_by'),
    completedAt: timestamp('completed_at'),
    durationSeconds: integer('duration_seconds'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: varchar('updated_by', { length: 255 }),
    deletedAt: timestamp('deleted_at'),
    deletedBy: varchar('deleted_by', { length: 255 }),
  },
  (table) => ({
    uniqueNomeProjeto: unique().on(table.nome, table.projetoId),
  })
);

// ============================================================================
// DIMENSÃO: Entidade
// ============================================================================
export const dimEntidade = pgTable('dim_entidade', {
  id: serial('id').primaryKey(),
  entidadeHash: varchar('entidade_hash', { length: 64 }).unique().notNull(),
  tipoEntidade: varchar('tipo_entidade', { length: 20 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  nomeFantasia: varchar('nome_fantasia', { length: 255 }),
  cnpj: varchar('cnpj', { length: 18 }).unique(),
  email: varchar('email', { length: 255 }),
  telefone: varchar('telefone', { length: 20 }),
  site: varchar('site', { length: 255 }),
  numFiliais: integer('num_filiais').default(0),
  numLojas: integer('num_lojas').default(0),
  numFuncionarios: integer('num_funcionarios'),
  importacaoId: integer('importacao_id'),
  origemTipo: varchar('origem_tipo', { length: 20 }).notNull(),
  origemArquivo: varchar('origem_arquivo', { length: 255 }),
  origemProcesso: varchar('origem_processo', { length: 100 }),
  origemPrompt: text('origem_prompt'),
  origemConfianca: integer('origem_confianca'),
  origemData: timestamp('origem_data').notNull().defaultNow(),
  origemUsuarioId: varchar('origem_usuario_id', { length: 255 }),
  // Enriquecimento IA
  enriquecido: boolean('enriquecido').default(false),
  enriquecidoEm: timestamp('enriquecido_em'),
  enriquecidoPor: varchar('enriquecido_por', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
  deletedAt: timestamp('deleted_at'),
  deletedBy: varchar('deleted_by', { length: 255 }),
});

// ============================================================================
// DIMENSÃO: Geografia
// ============================================================================
export const dimGeografia = pgTable(
  'dim_geografia',
  {
    id: serial('id').primaryKey(),
    cidade: varchar('cidade', { length: 100 }).notNull(),
    uf: varchar('uf', { length: 2 }).notNull(),
    regiao: varchar('regiao', { length: 20 }),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    codigoIbge: varchar('codigo_ibge', { length: 10 }),
    populacao: integer('populacao'),
    pibPerCapita: decimal('pib_per_capita', { precision: 12, scale: 2 }),
    // Hierarquia Geográfica
    pais: varchar('pais', { length: 50 }).default('Brasil'),
    macrorregiao: varchar('macrorregiao', { length: 50 }),
    mesorregiao: varchar('mesorregiao', { length: 100 }),
    microrregiao: varchar('microrregiao', { length: 100 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: varchar('updated_by', { length: 255 }),
  },
  (table) => ({
    uniqueCidadeUf: unique().on(table.cidade, table.uf),
  })
);

// ============================================================================
// DIMENSÃO: Mercado
// ============================================================================
export const dimMercado = pgTable('dim_mercado', {
  id: serial('id').primaryKey(),
  mercadoHash: varchar('mercado_hash', { length: 64 }).unique().notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  categoria: varchar('categoria', { length: 100 }),
  segmentacao: varchar('segmentacao', { length: 255 }),
  tamanhoMercadoBr: decimal('tamanho_mercado_br', { precision: 15, scale: 2 }),
  crescimentoAnualPct: decimal('crescimento_anual_pct', { precision: 5, scale: 2 }),
  tendencias: text('tendencias').array(),
  principaisPlayers: text('principais_players').array(),
  enriquecido: boolean('enriquecido').default(false),
  enriquecidoEm: timestamp('enriquecido_em'),
  enriquecidoPor: varchar('enriquecido_por', { length: 50 }),
  // Hierarquia de Mercado
  setor: varchar('setor', { length: 100 }),
  subsetor: varchar('subsetor', { length: 100 }),
  nicho: varchar('nicho', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// ============================================================================
// DIMENSÃO: Produto
// ============================================================================
export const dimProduto = pgTable('dim_produto', {
  id: serial('id').primaryKey(),
  produtoHash: varchar('produto_hash', { length: 64 }).unique().notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  categoria: varchar('categoria', { length: 100 }),
  descricao: text('descricao'),
  precoMedio: decimal('preco_medio', { precision: 12, scale: 2 }),
  unidade: varchar('unidade', { length: 20 }),
  ncm: varchar('ncm', { length: 10 }),
  enriquecido: boolean('enriquecido').default(false),
  enriquecidoEm: timestamp('enriquecido_em'),
  enriquecidoPor: varchar('enriquecido_por', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// ============================================================================
// DIMENSÃO: Produto Catálogo (Nova tabela independente)
// ============================================================================
export const dimProdutoCatalogo = pgTable('dim_produto_catalogo', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  categoria: varchar('categoria', { length: 100 }),
  subcategoria: varchar('subcategoria', { length: 100 }),
  sku: varchar('sku', { length: 100 }),
  ean: varchar('ean', { length: 20 }),
  ncm: varchar('ncm', { length: 10 }),
  preco: decimal('preco', { precision: 12, scale: 2 }),
  unidade: varchar('unidade', { length: 20 }),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
  deletedAt: timestamp('deleted_at'),
  deletedBy: varchar('deleted_by', { length: 255 }),
});

// ============================================================================
// DIMENSÃO: Status Qualificação
// ============================================================================
export const dimStatusQualificacao = pgTable('dim_status_qualificacao', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique().notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  cor: varchar('cor', { length: 7 }),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// ============================================================================
// FATO: Entidade Contexto
// ============================================================================
export const fatoEntidadeContexto = pgTable(
  'fato_entidade_contexto',
  {
    id: serial('id').primaryKey(),
    entidadeId: integer('entidade_id')
      .notNull()
      .references(() => dimEntidade.id, { onDelete: 'cascade' }),
    projetoId: integer('projeto_id')
      .notNull()
      .references(() => dimProjeto.id, { onDelete: 'cascade' }),
    pesquisaId: integer('pesquisa_id')
      .notNull()
      .references(() => dimPesquisa.id, { onDelete: 'cascade' }),
    geografiaId: integer('geografia_id').references(() => dimGeografia.id, {
      onDelete: 'set null',
    }),
    mercadoId: integer('mercado_id').references(() => dimMercado.id, { onDelete: 'set null' }),
    statusQualificacaoId: integer('status_qualificacao_id').references(
      () => dimStatusQualificacao.id,
      { onDelete: 'set null' }
    ),
    cnae: varchar('cnae', { length: 10 }),
    porte: varchar('porte', { length: 20 }),
    faturamentoEstimado: decimal('faturamento_estimado', { precision: 15, scale: 2 }),
    numFuncionarios: integer('num_funcionarios'),
    qualidadeScore: integer('qualidade_score'),
    qualidadeClassificacao: varchar('qualidade_classificacao', { length: 10 }),
    observacoes: text('observacoes'),
    // Campos Temporais
    tempoId: integer('tempo_id').references(() => dimTempo.id),
    dataQualificacao: date('data_qualificacao').notNull().defaultNow(),
    // Métricas Financeiras
    receitaPotencialAnual: decimal('receita_potencial_anual', { precision: 15, scale: 2 }),
    ticketMedioEstimado: decimal('ticket_medio_estimado', { precision: 12, scale: 2 }),
    ltvEstimado: decimal('ltv_estimado', { precision: 15, scale: 2 }),
    cacEstimado: decimal('cac_estimado', { precision: 12, scale: 2 }),
    // Scores e Probabilidades
    scoreFit: integer('score_fit'),
    probabilidadeConversao: decimal('probabilidade_conversao', { precision: 5, scale: 2 }),
    scorePriorizacao: integer('score_priorizacao'),
    // Ciclo de Venda
    cicloVendaEstimadoDias: integer('ciclo_venda_estimado_dias'),
    // Segmentação
    segmentoRfm: varchar('segmento_rfm', { length: 3 }),
    segmentoAbc: varchar('segmento_abc', { length: 1 }),
    ehClienteIdeal: boolean('eh_cliente_ideal').default(false),
    // Flags de Conversão
    convertidoEmCliente: boolean('convertido_em_cliente').default(false),
    dataConversao: date('data_conversao'),
    // Observações Enriquecidas
    justificativaScore: text('justificativa_score'),
    recomendacoes: text('recomendacoes'),
    // Canal
    canalId: integer('canal_id').references(() => dimCanal.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: varchar('updated_by', { length: 255 }),
    deletedAt: timestamp('deleted_at'),
    deletedBy: varchar('deleted_by', { length: 255 }),
  },
  (table) => ({
    uniqueEntidadeProjetoPesquisa: unique().on(table.entidadeId, table.projetoId, table.pesquisaId),
  })
);

// ============================================================================
// FATO: Entidade Produto (N:N)
// ============================================================================
export const fatoEntidadeProduto = pgTable(
  'fato_entidade_produto',
  {
    id: serial('id').primaryKey(),
    contextoId: integer('contexto_id')
      .notNull()
      .references(() => fatoEntidadeContexto.id, { onDelete: 'cascade' }),
    produtoId: integer('produto_id')
      .notNull()
      .references(() => dimProduto.id, { onDelete: 'cascade' }),
    tipoRelacao: varchar('tipo_relacao', { length: 50 }),
    volumeEstimado: varchar('volume_estimado', { length: 100 }),
    observacoes: text('observacoes'),
    // Métricas de Produto
    volumeVendasEstimado: decimal('volume_vendas_estimado', { precision: 15, scale: 2 }),
    margemEstimada: decimal('margem_estimada', { precision: 5, scale: 2 }),
    penetracaoMercado: decimal('penetracao_mercado', { precision: 5, scale: 2 }),
    ehProdutoPrincipal: boolean('eh_produto_principal').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }),
  },
  (table) => ({
    uniqueContextoProduto: unique().on(table.contextoId, table.produtoId),
  })
);

// ============================================================================
// FATO: Entidade Competidor (N:N)
// ============================================================================
export const fatoEntidadeCompetidor = pgTable(
  'fato_entidade_competidor',
  {
    id: serial('id').primaryKey(),
    contextoId: integer('contexto_id')
      .notNull()
      .references(() => fatoEntidadeContexto.id, { onDelete: 'cascade' }),
    competidorEntidadeId: integer('competidor_entidade_id')
      .notNull()
      .references(() => dimEntidade.id, { onDelete: 'cascade' }),
    nivelCompeticao: varchar('nivel_competicao', { length: 20 }),
    diferencial: text('diferencial'),
    observacoes: text('observacoes'),
    // Métricas de Concorrência
    shareOfVoice: decimal('share_of_voice', { precision: 5, scale: 2 }),
    vantagemCompetitivaScore: integer('vantagem_competitiva_score'),
    ameacaNivel: varchar('ameaca_nivel', { length: 20 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }),
  },
  (table) => ({
    uniqueContextoCompetidor: unique().on(table.contextoId, table.competidorEntidadeId),
  })
);

// ============================================================================
// TABELA: Importação
// ============================================================================
export const dimImportacao = pgTable('dim_importacao', {
  id: serial('id').primaryKey(),
  projetoId: integer('projeto_id')
    .notNull()
    .references(() => dimProjeto.id, { onDelete: 'cascade' }),
  pesquisaId: integer('pesquisa_id')
    .notNull()
    .references(() => dimPesquisa.id, { onDelete: 'cascade' }),
  nomeArquivo: varchar('nome_arquivo', { length: 255 }).notNull(),
  tipoArquivo: varchar('tipo_arquivo', { length: 10 }).notNull(),
  tamanhoBytes: integer('tamanho_bytes'),
  caminhoS3: varchar('caminho_s3', { length: 500 }),
  totalLinhas: integer('total_linhas').notNull(),
  linhasProcessadas: integer('linhas_processadas').default(0),
  linhasSucesso: integer('linhas_sucesso').default(0),
  linhasErro: integer('linhas_erro').default(0),
  linhasDuplicadas: integer('linhas_duplicadas').default(0),
  linhasGeografiaFuzzy: integer('linhas_geografia_fuzzy').default(0),
  status: varchar('status', { length: 20 }).notNull().default('pendente'),
  erroMensagem: text('erro_mensagem'),
  progressoPercentual: integer('progresso_percentual').default(0),
  mapeamentoColunas: text('mapeamento_colunas'), // JSONB como text
  opcoes: text('opcoes'), // JSONB como text
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  durationSeconds: integer('duration_seconds'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// ============================================================================
// TABELA: Erros de Importação
// ============================================================================
export const importacaoErros = pgTable('importacao_erros', {
  id: serial('id').primaryKey(),
  importacaoId: integer('importacao_id')
    .notNull()
    .references(() => dimImportacao.id, { onDelete: 'cascade' }),
  linhaNumero: integer('linha_numero').notNull(),
  linhaDados: text('linha_dados').notNull(), // JSONB como text
  campoErro: varchar('campo_erro', { length: 100 }),
  tipoErro: varchar('tipo_erro', { length: 50 }).notNull(),
  mensagemErro: text('mensagem_erro').notNull(),
  sugestaoCorrecao: text('sugestao_correcao'), // JSONB como text
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// RELATIONS (Drizzle ORM)
// ============================================================================

export const dimProjetoRelations = relations(dimProjeto, ({ many }) => ({
  pesquisas: many(dimPesquisa),
  contextos: many(fatoEntidadeContexto),
}));

export const dimPesquisaRelations = relations(dimPesquisa, ({ one, many }) => ({
  projeto: one(dimProjeto, {
    fields: [dimPesquisa.projetoId],
    references: [dimProjeto.id],
  }),
  contextos: many(fatoEntidadeContexto),
}));

export const dimEntidadeRelations = relations(dimEntidade, ({ many }) => ({
  contextos: many(fatoEntidadeContexto),
  competidores: many(fatoEntidadeCompetidor),
}));

export const fatoEntidadeContextoRelations = relations(fatoEntidadeContexto, ({ one, many }) => ({
  entidade: one(dimEntidade, {
    fields: [fatoEntidadeContexto.entidadeId],
    references: [dimEntidade.id],
  }),
  projeto: one(dimProjeto, {
    fields: [fatoEntidadeContexto.projetoId],
    references: [dimProjeto.id],
  }),
  pesquisa: one(dimPesquisa, {
    fields: [fatoEntidadeContexto.pesquisaId],
    references: [dimPesquisa.id],
  }),
  geografia: one(dimGeografia, {
    fields: [fatoEntidadeContexto.geografiaId],
    references: [dimGeografia.id],
  }),
  mercado: one(dimMercado, {
    fields: [fatoEntidadeContexto.mercadoId],
    references: [dimMercado.id],
  }),
  statusQualificacao: one(dimStatusQualificacao, {
    fields: [fatoEntidadeContexto.statusQualificacaoId],
    references: [dimStatusQualificacao.id],
  }),
  tempo: one(dimTempo, {
    fields: [fatoEntidadeContexto.tempoId],
    references: [dimTempo.id],
  }),
  canal: one(dimCanal, {
    fields: [fatoEntidadeContexto.canalId],
    references: [dimCanal.id],
  }),
  produtos: many(fatoEntidadeProduto),
  competidores: many(fatoEntidadeCompetidor),
}));

export const fatoEntidadeProdutoRelations = relations(fatoEntidadeProduto, ({ one }) => ({
  contexto: one(fatoEntidadeContexto, {
    fields: [fatoEntidadeProduto.contextoId],
    references: [fatoEntidadeContexto.id],
  }),
  produto: one(dimProduto, {
    fields: [fatoEntidadeProduto.produtoId],
    references: [dimProduto.id],
  }),
}));

export const fatoEntidadeCompetidorRelations = relations(fatoEntidadeCompetidor, ({ one }) => ({
  contexto: one(fatoEntidadeContexto, {
    fields: [fatoEntidadeCompetidor.contextoId],
    references: [fatoEntidadeContexto.id],
  }),
  competidor: one(dimEntidade, {
    fields: [fatoEntidadeCompetidor.competidorEntidadeId],
    references: [dimEntidade.id],
  }),
}));
