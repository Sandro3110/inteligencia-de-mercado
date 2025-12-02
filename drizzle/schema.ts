import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  decimal,
  boolean,
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
    createdBy: integer('created_by').notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: integer('updated_by'),
    deletedAt: timestamp('deleted_at'),
    deletedBy: integer('deleted_by'),
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
    createdBy: integer('created_by').notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: integer('updated_by'),
    deletedAt: timestamp('deleted_at'),
    deletedBy: integer('deleted_by'),
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
  origemTipo: varchar('origem_tipo', { length: 20 }).notNull(),
  origemArquivo: varchar('origem_arquivo', { length: 255 }),
  origemProcesso: varchar('origem_processo', { length: 100 }),
  origemPrompt: text('origem_prompt'),
  origemConfianca: integer('origem_confianca'),
  origemData: timestamp('origem_data').notNull().defaultNow(),
  origemUsuarioId: integer('origem_usuario_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: integer('created_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by'),
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by'),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: integer('created_by'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: integer('updated_by'),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: integer('created_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by'),
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
  createdBy: integer('created_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by'),
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
  createdBy: integer('created_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by'),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: integer('created_by'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: integer('updated_by'),
    deletedAt: timestamp('deleted_at'),
    deletedBy: integer('deleted_by'),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: integer('created_by'),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdBy: integer('created_by'),
  },
  (table) => ({
    uniqueContextoCompetidor: unique().on(table.contextoId, table.competidorEntidadeId),
  })
);

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
