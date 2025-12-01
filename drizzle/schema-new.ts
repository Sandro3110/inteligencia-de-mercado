import {
  pgTable,
  index,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
  numeric,
  uniqueIndex,
  check,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// NOVA ESTRUTURA PADRONIZADA
// ============================================================================

// ============================================================================
// DIMENSÃO: GEOGRAFIA (Normalizada)
// ============================================================================

export const dimGeografia = pgTable(
  'dim_geografia',
  {
    id: serial('id').primaryKey(),
    cidade: varchar('cidade', { length: 255 }).notNull(),
    uf: varchar('uf', { length: 2 }).notNull(),
    regiao: varchar('regiao', { length: 50 }).notNull(),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    uniqueIndex('dim_geografia_cidade_uf_unique').on(table.cidade, table.uf),
    index('idx_dim_geografia_uf').on(table.uf),
    index('idx_dim_geografia_regiao').on(table.regiao),
    index('idx_dim_geografia_cidade_uf').on(table.cidade, table.uf),
  ]
);

// ============================================================================
// DIMENSÃO: MERCADOS (Setores)
// ============================================================================

export const dimMercados = pgTable(
  'dim_mercados',
  {
    id: serial('id').primaryKey(),
    mercado_hash: varchar('mercado_hash', { length: 255 }),
    nome: varchar('nome', { length: 255 }).notNull(),
    categoria: varchar('categoria', { length: 100 }).notNull(),
    segmentacao: varchar('segmentacao', { length: 50 }),
    tamanho_mercado: text('tamanho_mercado'),
    crescimento_anual: text('crescimento_anual'),
    tendencias: text('tendencias'),
    principais_players: text('principais_players'),
    pesquisa_id: integer('pesquisa_id').notNull(),
    project_id: integer('project_id').notNull(),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    uniqueIndex('dim_mercados_hash_unique').on(table.mercado_hash),
    index('idx_dim_mercados_pesquisa').on(table.pesquisa_id),
    index('idx_dim_mercados_project').on(table.project_id),
    index('idx_dim_mercados_categoria').on(table.categoria),
    index('idx_dim_mercados_hash').on(table.mercado_hash),
    index('idx_dim_mercados_pesquisa_categoria').on(table.pesquisa_id, table.categoria),
  ]
);

// ============================================================================
// DIMENSÃO: PRODUTOS
// ============================================================================

export const dimProdutos = pgTable(
  'dim_produtos',
  {
    id: serial('id').primaryKey(),
    produto_hash: varchar('produto_hash', { length: 255 }),
    nome: varchar('nome', { length: 255 }).notNull(),
    categoria: varchar('categoria', { length: 100 }).notNull(),
    descricao: text('descricao'),
    preco: text('preco'),
    unidade: varchar('unidade', { length: 50 }),
    ativo: boolean('ativo').default(true),
    mercado_id: integer('mercado_id'),
    pesquisa_id: integer('pesquisa_id').notNull(),
    project_id: integer('project_id').notNull(),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    uniqueIndex('dim_produtos_hash_unique').on(table.produto_hash),
    index('idx_dim_produtos_pesquisa').on(table.pesquisa_id),
    index('idx_dim_produtos_project').on(table.project_id),
    index('idx_dim_produtos_categoria').on(table.categoria),
    index('idx_dim_produtos_mercado').on(table.mercado_id),
    index('idx_dim_produtos_hash').on(table.produto_hash),
    index('idx_dim_produtos_pesquisa_categoria').on(table.pesquisa_id, table.categoria),
  ]
);

// ============================================================================
// TABELA FATO: ENTIDADES (Clientes + Leads + Concorrentes UNIFICADOS)
// ============================================================================

export const fatoEntidades = pgTable(
  'fato_entidades',
  {
    id: serial('id').primaryKey(),

    // Tipo de entidade padronizado
    tipo_entidade: varchar('tipo_entidade', { length: 20 }).notNull(),

    // Hash único padronizado
    entidade_hash: varchar('entidade_hash', { length: 255 }),

    // Identificação padronizada
    nome: varchar('nome', { length: 255 }).notNull(),
    cnpj: varchar('cnpj', { length: 20 }),

    // Relacionamentos obrigatórios padronizados
    pesquisa_id: integer('pesquisa_id').notNull(),
    project_id: integer('project_id').notNull(),
    geografia_id: integer('geografia_id').notNull(),
    mercado_id: integer('mercado_id').notNull(),

    // Contato padronizado
    email: varchar('email', { length: 500 }),
    telefone: varchar('telefone', { length: 50 }),
    site_oficial: varchar('site_oficial', { length: 500 }),
    linkedin: varchar('linkedin', { length: 500 }),
    instagram: varchar('instagram', { length: 500 }),

    // Classificação padronizada
    cnae: varchar('cnae', { length: 20 }),
    porte: varchar('porte', { length: 50 }),
    segmentacao_b2b_b2c: varchar('segmentacao_b2b_b2c', { length: 10 }),

    // Financeiro padronizado
    faturamento_declarado: text('faturamento_declarado'),
    faturamento_estimado: text('faturamento_estimado'),
    numero_estabelecimentos: text('numero_estabelecimentos'),

    // Qualidade padronizada
    qualidade_score: integer('qualidade_score'),
    qualidade_classificacao: varchar('qualidade_classificacao', { length: 50 }),

    // Status de qualificação (ativo, inativo, prospect, lead_qualificado, lead_desqualificado)
    status_qualificacao: varchar('status_qualificacao', { length: 50 }).default('prospect'),

    // Validação padronizada
    validation_status: varchar('validation_status', { length: 50 }).default('pending'),
    validation_notes: text('validation_notes'),
    validated_by: varchar('validated_by', { length: 64 }),
    validated_at: timestamp('validated_at', { mode: 'string' }),

    // Campos específicos de leads
    lead_stage: varchar('lead_stage', { length: 50 }),
    stage_updated_at: timestamp('stage_updated_at', { mode: 'string' }),
    cliente_origem_id: integer('cliente_origem_id'),

    // Metadados padronizados
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    uniqueIndex('fato_entidades_hash_unique').on(table.entidade_hash),
    index('idx_fato_entidades_tipo').on(table.tipo_entidade),
    index('idx_fato_entidades_pesquisa').on(table.pesquisa_id),
    index('idx_fato_entidades_project').on(table.project_id),
    index('idx_fato_entidades_geografia').on(table.geografia_id),
    index('idx_fato_entidades_mercado').on(table.mercado_id),
    index('idx_fato_entidades_hash').on(table.entidade_hash),
    index('idx_fato_entidades_qualidade').on(table.qualidade_score),
    index('idx_fato_entidades_cnpj').on(table.cnpj),
    index('idx_fato_entidades_tipo_pesquisa').on(table.tipo_entidade, table.pesquisa_id),
    index('idx_fato_entidades_tipo_mercado').on(table.tipo_entidade, table.mercado_id),
    index('idx_fato_entidades_cliente_origem').on(table.cliente_origem_id),
    index('idx_fato_entidades_geografia_mercado').on(table.geografia_id, table.mercado_id),
    index('idx_fato_entidades_status_qualificacao').on(table.status_qualificacao),
    index('idx_fato_entidades_tipo_status').on(table.tipo_entidade, table.status_qualificacao),
    check('fato_entidades_tipo_check', sql`tipo_entidade IN ('cliente', 'lead', 'concorrente')`),
    check('fato_entidades_qualidade_check', sql`qualidade_score >= 0 AND qualidade_score <= 100`),
    check(
      'fato_entidades_status_qualificacao_check',
      sql`status_qualificacao IN ('ativo', 'inativo', 'prospect', 'lead_qualificado', 'lead_desqualificado')`
    ),
  ]
);

// ============================================================================
// RELACIONAMENTO N:N: ENTIDADE ↔ PRODUTOS
// ============================================================================

export const entidadeProdutos = pgTable(
  'entidade_produtos',
  {
    id: serial('id').primaryKey(),
    entidade_id: integer('entidade_id').notNull(),
    produto_id: integer('produto_id').notNull(),
    tipo_relacao: varchar('tipo_relacao', { length: 50 }),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    uniqueIndex('entidade_produtos_unique').on(table.entidade_id, table.produto_id),
    index('idx_entidade_produtos_entidade').on(table.entidade_id),
    index('idx_entidade_produtos_produto').on(table.produto_id),
    index('idx_entidade_produtos_tipo').on(table.tipo_relacao),
  ]
);

// ============================================================================
// RELACIONAMENTO N:N: ENTIDADE ↔ COMPETIDORES (Análise Competitiva)
// ============================================================================

export const entidadeCompetidores = pgTable(
  'entidade_competidores',
  {
    id: serial('id').primaryKey(),
    entidade_id: integer('entidade_id').notNull(),
    competidor_id: integer('competidor_id').notNull(),
    mercado_id: integer('mercado_id').notNull(),
    nivel_competicao: varchar('nivel_competicao', { length: 50 }),
    created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    uniqueIndex('entidade_competidores_unique').on(
      table.entidade_id,
      table.competidor_id,
      table.mercado_id
    ),
    index('idx_entidade_competidores_entidade').on(table.entidade_id),
    index('idx_entidade_competidores_competidor').on(table.competidor_id),
    index('idx_entidade_competidores_mercado').on(table.mercado_id),
    check('entidade_competidores_check', sql`entidade_id != competidor_id`),
  ]
);

// ============================================================================
// HISTÓRICO: AUDITORIA DE ENTIDADES
// ============================================================================

export const fatoEntidadesHistory = pgTable(
  'fato_entidades_history',
  {
    id: serial('id').primaryKey(),
    entidade_id: integer('entidade_id').notNull(),
    data_snapshot: jsonb('data_snapshot').notNull(),
    change_type: varchar('change_type', { length: 50 }).notNull(),
    changed_by: varchar('changed_by', { length: 64 }),
    changed_at: timestamp('changed_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_fato_entidades_history_entidade').on(table.entidade_id),
    index('idx_fato_entidades_history_changed_at').on(table.changed_at),
    index('idx_fato_entidades_history_change_type').on(table.change_type),
    check(
      'fato_entidades_history_type_check',
      sql`change_type IN ('created', 'updated', 'deleted')`
    ),
  ]
);

// ============================================================================
// TIPOS PARA TYPESCRIPT
// ============================================================================

export type DimGeografia = typeof dimGeografia.$inferSelect;
export type NewDimGeografia = typeof dimGeografia.$inferInsert;

export type DimMercados = typeof dimMercados.$inferSelect;
export type NewDimMercados = typeof dimMercados.$inferInsert;

export type DimProdutos = typeof dimProdutos.$inferSelect;
export type NewDimProdutos = typeof dimProdutos.$inferInsert;

export type FatoEntidades = typeof fatoEntidades.$inferSelect;
export type NewFatoEntidades = typeof fatoEntidades.$inferInsert;

export type EntidadeProdutos = typeof entidadeProdutos.$inferSelect;
export type NewEntidadeProdutos = typeof entidadeProdutos.$inferInsert;

export type EntidadeCompetidores = typeof entidadeCompetidores.$inferSelect;
export type NewEntidadeCompetidores = typeof entidadeCompetidores.$inferInsert;

export type FatoEntidadesHistory = typeof fatoEntidadesHistory.$inferSelect;
export type NewFatoEntidadesHistory = typeof fatoEntidadesHistory.$inferInsert;
