// ============================================================================
// DRIZZLE SCHEMA - GERADO AUTOMATICAMENTE A PARTIR DO BANCO REAL
// Data: 2024-12-06
// Fonte: PostgreSQL Supabase (33 tabelas, 100% sincronizado)
// ============================================================================

import { pgTable, integer, bigint, varchar, text, boolean, numeric, timestamp, jsonb, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Tabela: alertas_seguranca (7 campos)
export const alertas_seguranca = pgTable('alertas_seguranca', {
  id: integer('id').notNull(),
  user_id: varchar('user_id', { length: 255 }),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  descricao: text('descricao').notNull(),
  severidade: varchar('severidade', { length: 20 }).notNull(),
  resolvido: boolean('resolvido').default(false),
  created_at: timestamp('created_at').default(sql`now()`),
});

// Tabela: audit_logs (13 campos)
export const audit_logs = pgTable('audit_logs', {
  id: integer('id').notNull(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  metodo: varchar('metodo', { length: 10 }).notNull(),
  parametros: jsonb('parametros'),
  resultado: varchar('resultado', { length: 50 }),
  erro: text('erro'),
  ip_address: varchar('ip_address', { length: 50 }),
  user_agent: text('user_agent'),
  duracao_ms: integer('duracao_ms'),
  custo: numeric('custo', { precision: 10, scale: 6 }),
  created_at: timestamp('created_at').default(sql`now()`),
});

// Tabela: cidades_brasil (13 campos)
export const cidades_brasil = pgTable('cidades_brasil', {
  id: integer('id').notNull(),
  codigo_ibge: integer('codigo_ibge').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  capital: boolean('capital').default(false),
  codigo_uf: integer('codigo_uf').notNull(),
  uf: varchar('uf', { length: 2 }).notNull(),
  siafi_id: varchar('siafi_id', { length: 10 }),
  ddd: integer('ddd'),
  fuso_horario: varchar('fuso_horario', { length: 50 }),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabela: data_audit_logs (11 campos)
export const data_audit_logs = pgTable('data_audit_logs', {
  id: bigint('id', { mode: 'number' }).notNull(),
  tabela: varchar('tabela', { length: 100 }).notNull(),
  operacao: varchar('operacao', { length: 10 }).notNull(),
  registro_id: integer('registro_id').notNull(),
  dados_anteriores: jsonb('dados_anteriores'),
  dados_novos: jsonb('dados_novos'),
  campos_alterados: text('campos_alterados'),
  usuario_id: varchar('usuario_id', { length: 255 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
});

// Tabela: dim_canal (14 campos)
export const dim_canal = pgTable('dim_canal', {
  id: integer('id').notNull(),
  codigo: varchar('codigo', { length: 50 }).notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  descricao: text('descricao'),
  custo_medio: numeric('custo_medio', { precision: 12, scale: 2 }),
  taxa_conversao_media: numeric('taxa_conversao_media', { precision: 5, scale: 2 }),
  ativo: boolean('ativo').default(true),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_by: varchar('deleted_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
});

// Tabela: dim_concorrente (12 campos)
export const dim_concorrente = pgTable('dim_concorrente', {
  id: integer('id').notNull(),
  entidade_id: integer('entidade_id').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 18 }),
  cidade: varchar('cidade', { length: 100 }).notNull(),
  uf: varchar('uf', { length: 2 }).notNull(),
  produto_principal: text('produto_principal'),
  site: varchar('site', { length: 500 }),
  porte: varchar('porte', { length: 20 }),
  ordem: integer('ordem').default(1),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
});

// Tabela: dim_entidade (49 campos)
export const dim_entidade = pgTable('dim_entidade', {
  id: integer('id').notNull(),
  entidade_hash: varchar('entidade_hash', { length: 64 }).notNull(),
  tipo_entidade: varchar('tipo_entidade', { length: 20 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  nome_fantasia: varchar('nome_fantasia', { length: 255 }),
  cnpj: varchar('cnpj', { length: 18 }),
  email: varchar('email', { length: 255 }),
  telefone: varchar('telefone', { length: 20 }),
  site: varchar('site', { length: 255 }),
  num_filiais: integer('num_filiais').default(0),
  num_lojas: integer('num_lojas').default(0),
  num_funcionarios: integer('num_funcionarios'),
  origem_tipo: varchar('origem_tipo', { length: 20 }).notNull(),
  origem_arquivo: varchar('origem_arquivo', { length: 255 }),
  origem_processo: varchar('origem_processo', { length: 100 }),
  origem_prompt: text('origem_prompt'),
  origem_confianca: integer('origem_confianca'),
  origem_data: timestamp('origem_data').notNull().default(sql`now()`),
  origem_usuario_id: integer('origem_usuario_id'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
  deleted_by: varchar('deleted_by', { length: 255 }),
  importacao_id: integer('importacao_id'),
  cnpj_hash: varchar('cnpj_hash', { length: 64 }),
  cpf_hash: varchar('cpf_hash', { length: 64 }),
  email_hash: varchar('email_hash', { length: 64 }),
  telefone_hash: varchar('telefone_hash', { length: 64 }),
  cidade: varchar('cidade', { length: 100 }),
  uf: varchar('uf', { length: 2 }),
  porte: varchar('porte', { length: 20 }),
  setor: varchar('setor', { length: 100 }),
  produto_principal: text('produto_principal'),
  segmentacao_b2b_b2c: varchar('segmentacao_b2b_b2c', { length: 10 }),
  score_qualidade: integer('score_qualidade'),
  enriquecido_em: timestamp('enriquecido_em'),
  enriquecido_por: varchar('enriquecido_por', { length: 255 }),
  cache_hit: boolean('cache_hit').default(false),
  cache_expires_at: timestamp('cache_expires_at'),
  score_qualidade_dados: integer('score_qualidade_dados').default(0),
  validacao_cnpj: boolean('validacao_cnpj').default(false),
  validacao_email: boolean('validacao_email').default(false),
  validacao_telefone: boolean('validacao_telefone').default(false),
  campos_faltantes: text('campos_faltantes'),
  ultima_validacao: timestamp('ultima_validacao'),
  status_qualificacao_id: integer('status_qualificacao_id'),
  enriquecido: boolean('enriquecido').default(false),
});

// Tabela: dim_geografia (19 campos)
export const dim_geografia = pgTable('dim_geografia', {
  id: integer('id').notNull(),
  cidade: varchar('cidade', { length: 100 }).notNull(),
  uf: varchar('uf', { length: 2 }).notNull(),
  regiao: varchar('regiao', { length: 20 }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  codigo_ibge: varchar('codigo_ibge', { length: 10 }),
  populacao: integer('populacao'),
  pib_per_capita: numeric('pib_per_capita', { precision: 12, scale: 2 }),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  pais: varchar('pais', { length: 50 }).default('Brasil'),
  macrorregiao: varchar('macrorregiao', { length: 50 }),
  mesorregiao: varchar('mesorregiao', { length: 100 }),
  microrregiao: varchar('microrregiao', { length: 100 }),
  deleted_by: varchar('deleted_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
});

// Tabela: dim_importacao (27 campos)
export const dim_importacao = pgTable('dim_importacao', {
  id: integer('id').notNull(),
  projeto_id: integer('projeto_id').notNull(),
  pesquisa_id: integer('pesquisa_id').notNull(),
  nome_arquivo: varchar('nome_arquivo', { length: 255 }).notNull(),
  tipo_arquivo: varchar('tipo_arquivo', { length: 10 }).notNull(),
  tamanho_bytes: bigint('tamanho_bytes', { mode: 'number' }),
  caminho_s3: varchar('caminho_s3', { length: 500 }),
  total_linhas: integer('total_linhas').notNull(),
  linhas_processadas: integer('linhas_processadas').default(0),
  linhas_sucesso: integer('linhas_sucesso').default(0),
  linhas_erro: integer('linhas_erro').default(0),
  linhas_duplicadas: integer('linhas_duplicadas').default(0),
  linhas_geografia_fuzzy: integer('linhas_geografia_fuzzy').default(0),
  status: varchar('status', { length: 20 }).notNull().default('pendente'),
  erro_mensagem: text('erro_mensagem'),
  progresso_percentual: integer('progresso_percentual').default(0),
  mapeamento_colunas: jsonb('mapeamento_colunas'),
  opcoes: jsonb('opcoes'),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  duration_seconds: integer('duration_seconds'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_by: varchar('deleted_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
});

// Tabela: dim_lead (18 campos)
export const dim_lead = pgTable('dim_lead', {
  id: integer('id').notNull(),
  entidade_id: integer('entidade_id').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 18 }),
  cidade: varchar('cidade', { length: 100 }).notNull(),
  uf: varchar('uf', { length: 2 }).notNull(),
  produto_interesse: text('produto_interesse'),
  setor: varchar('setor', { length: 100 }),
  site: varchar('site', { length: 500 }),
  porte: varchar('porte', { length: 20 }),
  score_qualificacao: integer('score_qualificacao'),
  prioridade: varchar('prioridade', { length: 10 }),
  status: varchar('status', { length: 20 }).default('novo'),
  ordem: integer('ordem').default(1),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
});

// Tabela: dim_mercado (21 campos)
export const dim_mercado = pgTable('dim_mercado', {
  id: integer('id').notNull(),
  entidade_id: integer('entidade_id').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  categoria: varchar('categoria', { length: 50 }),
  segmentacao: varchar('segmentacao', { length: 10 }),
  tamanho_mercado: text('tamanho_mercado'),
  crescimento_anual: varchar('crescimento_anual', { length: 100 }),
  tendencias: text('tendencias'),
  principais_players: text('principais_players'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  sentimento: varchar('sentimento', { length: 50 }),
  score_atratividade: integer('score_atratividade'),
  nivel_saturacao: varchar('nivel_saturacao', { length: 50 }),
  oportunidades: text('oportunidades'),
  riscos: text('riscos'),
  recomendacao_estrategica: text('recomendacao_estrategica'),
  deleted_at: timestamp('deleted_at'),
  deleted_by: varchar('deleted_by', { length: 255 }),
});

// Tabela: dim_pesquisa (21 campos)
export const dim_pesquisa = pgTable('dim_pesquisa', {
  id: integer('id').notNull(),
  projeto_id: integer('projeto_id').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  objetivo: text('objetivo'),
  status: varchar('status', { length: 20 }).notNull().default('pendente'),
  total_entidades: integer('total_entidades').default(0),
  entidades_enriquecidas: integer('entidades_enriquecidas').default(0),
  entidades_falhadas: integer('entidades_falhadas').default(0),
  qualidade_media: numeric('qualidade_media', { precision: 5, scale: 2 }),
  started_at: timestamp('started_at'),
  started_by: varchar('started_by', { length: 255 }),
  completed_at: timestamp('completed_at'),
  duration_seconds: integer('duration_seconds'),
  error_message: text('error_message'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
  deleted_by: varchar('deleted_by', { length: 255 }),
});

// Tabela: dim_produto (17 campos)
export const dim_produto = pgTable('dim_produto', {
  id: integer('id').notNull(),
  produto_hash: varchar('produto_hash', { length: 64 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  categoria: varchar('categoria', { length: 100 }),
  descricao: text('descricao'),
  preco_medio: numeric('preco_medio', { precision: 12, scale: 2 }),
  unidade: varchar('unidade', { length: 20 }),
  ncm: varchar('ncm', { length: 10 }),
  enriquecido: boolean('enriquecido').default(false),
  enriquecido_em: timestamp('enriquecido_em'),
  enriquecido_por: varchar('enriquecido_por', { length: 50 }),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  created_by: varchar('created_by', { length: 255 }),
  updated_at: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_by: varchar('deleted_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
});

// Tabela: dim_produto_catalogo (21 campos)
export const dim_produto_catalogo = pgTable('dim_produto_catalogo', {
  produto_id: integer('produto_id').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  ean: varchar('ean', { length: 20 }),
  ncm: varchar('ncm', { length: 10 }),
  categoria: varchar('categoria', { length: 100 }),
  subcategoria: varchar('subcategoria', { length: 100 }),
  preco: numeric('preco', { precision: 15, scale: 2 }),
  moeda: varchar('moeda', { length: 3 }).default('BRL'),
  unidade: varchar('unidade', { length: 50 }),
  descricao: text('descricao'),
  ativo: boolean('ativo').default(true),
  data_cadastro: timestamp('data_cadastro').notNull().default(sql`now()`),
  data_atualizacao: timestamp('data_atualizacao').notNull().default(sql`now()`),
  criado_por: varchar('criado_por', { length: 255 }),
  atualizado_por: varchar('atualizado_por', { length: 255 }),
  fonte: varchar('fonte', { length: 100 }),
  created_at: timestamp('created_at').default(sql`now()`),
  updated_at: timestamp('updated_at').default(sql`now()`),
  deleted_at: timestamp('deleted_at'),
  deleted_by: varchar('deleted_by', { length: 255 }),
});

// Tabela: dim_produto_old_backup (14 campos)
export const dim_produto_old_backup = pgTable('dim_produto_old_backup', {
  id: integer('id').notNull(),
  entidade_id: integer('entidade_id').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  categoria: varchar('categoria', { length: 100 }),
  ordem: integer('ordem').default(1),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  funcionalidades: text('funcionalidades'),
  publico_alvo: varchar('publico_alvo', { length: 500 }),
  diferenciais: text('diferenciais'),
  tecnologias: varchar('tecnologias', { length: 500 }),
  precificacao: varchar('precificacao', { length: 500 }),
  deleted_at: timestamp('deleted_at'),
});

// Tabela: dim_projeto (15 campos)
export const dim_projeto = pgTable('dim_projeto', {
  id: integer('id').notNull(),
  codigo: varchar('codigo', { length: 50 }),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  status: varchar('status', { length: 20 }).notNull().default('ativo'),
  owner_id: integer('owner_id').notNull(),
  unidade_negocio: varchar('unidade_negocio', { length: 100 }),
  centro_custo: varchar('centro_custo', { length: 50 }),
  orcamento_total: numeric('orcamento_total', { precision: 15, scale: 2 }),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
  deleted_by: varchar('deleted_by', { length: 255 }),
});

// Tabela: dim_status_qualificacao (12 campos)
export const dim_status_qualificacao = pgTable('dim_status_qualificacao', {
  id: integer('id').notNull(),
  codigo: varchar('codigo', { length: 50 }).notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  cor: varchar('cor', { length: 7 }),
  ordem: integer('ordem'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_by: varchar('deleted_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
});

// Tabela: dim_tempo (17 campos)
export const dim_tempo = pgTable('dim_tempo', {
  id: integer('id').notNull(),
  data: varchar('data', { length: 255 }).notNull(),
  ano: integer('ano').notNull(),
  trimestre: integer('trimestre').notNull(),
  mes: integer('mes').notNull(),
  semana: integer('semana').notNull(),
  dia_mes: integer('dia_mes').notNull(),
  dia_ano: integer('dia_ano').notNull(),
  dia_semana: integer('dia_semana').notNull(),
  nome_mes: varchar('nome_mes', { length: 20 }).notNull(),
  nome_mes_curto: varchar('nome_mes_curto', { length: 3 }).notNull(),
  nome_dia_semana: varchar('nome_dia_semana', { length: 20 }).notNull(),
  nome_dia_semana_curto: varchar('nome_dia_semana_curto', { length: 3 }).notNull(),
  eh_feriado: boolean('eh_feriado').default(false),
  eh_fim_semana: boolean('eh_fim_semana').default(false),
  eh_dia_util: boolean('eh_dia_util').default(true),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
});

// Tabela: fato_entidade_competidor (11 campos)
export const fato_entidade_competidor = pgTable('fato_entidade_competidor', {
  id: integer('id').notNull(),
  contexto_id: integer('contexto_id').notNull(),
  competidor_entidade_id: integer('competidor_entidade_id').notNull(),
  nivel_competicao: varchar('nivel_competicao', { length: 20 }),
  diferencial: text('diferencial'),
  observacoes: text('observacoes'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }),
  share_of_voice: numeric('share_of_voice', { precision: 5, scale: 2 }),
  vantagem_competitiva_score: integer('vantagem_competitiva_score'),
  ameaca_nivel: varchar('ameaca_nivel', { length: 20 }),
});

// Tabela: fato_entidade_contexto (38 campos)
export const fato_entidade_contexto = pgTable('fato_entidade_contexto', {
  id: integer('id').notNull(),
  entidade_id: integer('entidade_id').notNull(),
  projeto_id: integer('projeto_id').notNull(),
  pesquisa_id: integer('pesquisa_id').notNull(),
  geografia_id: integer('geografia_id'),
  mercado_id: integer('mercado_id'),
  status_qualificacao_id: integer('status_qualificacao_id'),
  cnae: varchar('cnae', { length: 10 }),
  porte: varchar('porte', { length: 20 }),
  faturamento_estimado: numeric('faturamento_estimado', { precision: 15, scale: 2 }),
  num_funcionarios: integer('num_funcionarios'),
  qualidade_score: integer('qualidade_score'),
  qualidade_classificacao: varchar('qualidade_classificacao', { length: 10 }),
  observacoes: text('observacoes'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
  created_by: varchar('created_by', { length: 255 }),
  updated_at: timestamp('updated_at').notNull().default(sql`now()`),
  updated_by: varchar('updated_by', { length: 255 }),
  deleted_at: timestamp('deleted_at'),
  deleted_by: varchar('deleted_by', { length: 255 }),
  tempo_id: integer('tempo_id'),
  data_qualificacao: varchar('data_qualificacao', { length: 255 }).notNull().default('CURRENT_DATE'),
  receita_potencial_anual: numeric('receita_potencial_anual', { precision: 15, scale: 2 }),
  ticket_medio_estimado: numeric('ticket_medio_estimado', { precision: 12, scale: 2 }),
  ltv_estimado: numeric('ltv_estimado', { precision: 15, scale: 2 }),
  cac_estimado: numeric('cac_estimado', { precision: 12, scale: 2 }),
  score_fit: integer('score_fit'),
  probabilidade_conversao: numeric('probabilidade_conversao', { precision: 5, scale: 2 }),
  score_priorizacao: integer('score_priorizacao'),
  ciclo_venda_estimado_dias: integer('ciclo_venda_estimado_dias'),
  segmento_rfm: varchar('segmento_rfm', { length: 3 }),
  segmento_abc: varchar('segmento_abc', { length: 1 }),
  eh_cliente_ideal: boolean('eh_cliente_ideal').default(false),
  convertido_em_cliente: boolean('convertido_em_cliente').default(false),
  data_conversao: varchar('data_conversao', { length: 255 }),
  justificativa_score: text('justificativa_score'),
  recomendacoes: text('recomendacoes'),
  canal_id: integer('canal_id'),
});

// Tabela: fato_entidade_produto (12 campos)
export const fato_entidade_produto = pgTable('fato_entidade_produto', {
  id: integer('id').notNull(),
  contexto_id: integer('contexto_id').notNull(),
  produto_id: integer('produto_id').notNull(),
  tipo_relacao: varchar('tipo_relacao', { length: 50 }),
  volume_estimado: varchar('volume_estimado', { length: 100 }),
  observacoes: text('observacoes'),
  volume_vendas_estimado: numeric('volume_vendas_estimado', { precision: 15, scale: 2 }),
  margem_estimada: numeric('margem_estimada', { precision: 5, scale: 2 }),
  penetracao_mercado: numeric('penetracao_mercado', { precision: 5, scale: 2 }),
  eh_produto_principal: boolean('eh_produto_principal').default(false),
  created_at: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  created_by: varchar('created_by', { length: 255 }),
});

// Tabela: ia_alertas (9 campos)
export const ia_alertas = pgTable('ia_alertas', {
  id: integer('id').notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  percentual: integer('percentual').notNull(),
  mensagem: text('mensagem').notNull(),
  custo_atual: numeric('custo_atual', { precision: 10, scale: 6 }).notNull(),
  budget_total: numeric('budget_total', { precision: 10, scale: 2 }).notNull(),
  enviado: boolean('enviado').default(false),
  enviado_em: timestamp('enviado_em'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
});

// Tabela: ia_cache (8 campos)
export const ia_cache = pgTable('ia_cache', {
  id: integer('id').notNull(),
  cache_key: varchar('cache_key', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  dados: jsonb('dados').notNull(),
  created_at: timestamp('created_at').default(sql`now()`),
  expires_at: timestamp('expires_at').notNull(),
  hits: integer('hits').default(0),
  last_hit_at: timestamp('last_hit_at'),
});

// Tabela: ia_config (7 campos)
export const ia_config = pgTable('ia_config', {
  id: integer('id').notNull(),
  plataforma: varchar('plataforma', { length: 50 }).notNull().default('openai'),
  modelo: varchar('modelo', { length: 100 }).notNull().default('gpt-4o-mini'),
  budget_mensal: numeric('budget_mensal', { precision: 10, scale: 2 }).default('150.00'),
  ativo: boolean('ativo').default(true),
  created_at: timestamp('created_at').default(sql`now()`),
  updated_at: timestamp('updated_at').default(sql`now()`),
});

// Tabela: ia_config_historico (7 campos)
export const ia_config_historico = pgTable('ia_config_historico', {
  id: integer('id').notNull(),
  plataforma: varchar('plataforma', { length: 50 }).notNull(),
  modelo: varchar('modelo', { length: 100 }).notNull(),
  budget_mensal: numeric('budget_mensal', { precision: 10, scale: 2 }).notNull(),
  alterado_por: varchar('alterado_por', { length: 255 }).notNull(),
  alterado_em: timestamp('alterado_em').notNull().default(sql`now()`),
  motivo: text('motivo'),
});

// Tabela: ia_usage (15 campos)
export const ia_usage = pgTable('ia_usage', {
  id: integer('id').notNull(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  processo: varchar('processo', { length: 100 }).notNull(),
  plataforma: varchar('plataforma', { length: 50 }).notNull(),
  modelo: varchar('modelo', { length: 100 }).notNull(),
  input_tokens: integer('input_tokens').notNull(),
  output_tokens: integer('output_tokens').notNull(),
  total_tokens: integer('total_tokens').notNull(),
  custo: numeric('custo', { precision: 10, scale: 6 }).notNull(),
  duracao_ms: integer('duracao_ms').notNull(),
  entidade_id: integer('entidade_id'),
  projeto_id: integer('projeto_id'),
  sucesso: boolean('sucesso').default(true),
  erro: text('erro'),
  created_at: timestamp('created_at').default(sql`now()`),
});

// Tabela: importacao_erros (9 campos)
export const importacao_erros = pgTable('importacao_erros', {
  id: integer('id').notNull(),
  importacao_id: integer('importacao_id').notNull(),
  linha_numero: integer('linha_numero').notNull(),
  linha_dados: jsonb('linha_dados').notNull(),
  campo_erro: varchar('campo_erro', { length: 100 }),
  tipo_erro: varchar('tipo_erro', { length: 50 }).notNull(),
  mensagem_erro: text('mensagem_erro').notNull(),
  sugestao_correcao: jsonb('sugestao_correcao'),
  created_at: timestamp('created_at').notNull().default(sql`now()`),
});

// Tabela: rate_limits (7 campos)
export const rate_limits = pgTable('rate_limits', {
  id: integer('id').notNull(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  chamadas: integer('chamadas').default(0),
  janela_inicio: timestamp('janela_inicio').default(sql`now()`),
  bloqueado_ate: timestamp('bloqueado_ate'),
  created_at: timestamp('created_at').default(sql`now()`),
});

// Tabela: roles (4 campos)
export const roles = pgTable('roles', {
  id: integer('id').notNull(),
  nome: varchar('nome', { length: 50 }).notNull(),
  descricao: text('descricao'),
  created_at: timestamp('created_at').default(sql`now()`),
});

// Tabela: system_settings (6 campos)
export const system_settings = pgTable('system_settings', {
  id: integer('id').notNull(),
  settingKey: varchar('settingKey', { length: 100 }).notNull(),
  settingValue: text('settingValue'),
  description: text('description'),
  createdAt: timestamp('createdAt').default(sql`now()`),
  updatedAt: timestamp('updatedAt').default(sql`now()`),
});

// Tabela: user_profiles (8 campos)
export const user_profiles = pgTable('user_profiles', {
  id: varchar('id', { length: 255 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  senha_hash: text('senha_hash').notNull(),
  role_id: integer('role_id').notNull().default(4),
  ativo: boolean('ativo').default(true),
  ultimo_acesso: timestamp('ultimo_acesso'),
  created_at: timestamp('created_at').default(sql`now()`),
});

// Tabela: users (9 campos)
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).notNull(),
  name: text('name'),
  email: varchar('email', { length: 320 }),
  login_method: varchar('login_method', { length: 64 }),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  created_at: timestamp('created_at').default(sql`now()`),
  last_signed_in: timestamp('last_signed_in').default(sql`now()`),
  ultimo_acesso: timestamp('ultimo_acesso'),
  total_acessos: integer('total_acessos').default(0),
});

// Tabela: usuarios_bloqueados (6 campos)
export const usuarios_bloqueados = pgTable('usuarios_bloqueados', {
  id: integer('id').notNull(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  motivo: text('motivo').notNull(),
  bloqueado_em: timestamp('bloqueado_em').default(sql`now()`),
  bloqueado_ate: timestamp('bloqueado_ate').notNull(),
  bloqueado_por: varchar('bloqueado_por', { length: 255 }),
});

// ============================================================================
// FIM DO SCHEMA - 33 TABELAS
// ============================================================================
