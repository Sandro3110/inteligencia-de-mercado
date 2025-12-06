-- ============================================================================
-- ÍNDICES FALTANTES - Complemento da reconstrução
-- ============================================================================

-- DIM_PRODUTO (faltam 1)
CREATE INDEX IF NOT EXISTS idx_produto_entidade_id ON dim_produto(entidade_id);

-- DIM_CANAL (faltam 2)
CREATE INDEX IF NOT EXISTS idx_canal_tipo ON dim_canal(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_canal_status ON dim_canal(status) WHERE status IS NOT NULL;

-- DIM_LEAD (faltam 4)
CREATE INDEX IF NOT EXISTS idx_lead_status_qualificacao_id ON dim_lead(status_qualificacao_id);
CREATE INDEX IF NOT EXISTS idx_lead_origem ON dim_lead(origem) WHERE origem IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_email ON dim_lead(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_created_at ON dim_lead(created_at);

-- DIM_PROJETO (faltam 4)
CREATE INDEX IF NOT EXISTS idx_projeto_status ON dim_projeto(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projeto_tipo ON dim_projeto(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projeto_data_inicio ON dim_projeto(data_inicio) WHERE data_inicio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projeto_data_fim ON dim_projeto(data_fim) WHERE data_fim IS NOT NULL;

-- DIM_PESQUISA (faltam 3)
CREATE INDEX IF NOT EXISTS idx_pesquisa_tipo ON dim_pesquisa(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pesquisa_status ON dim_pesquisa(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pesquisa_data_realizacao ON dim_pesquisa(data_realizacao) WHERE data_realizacao IS NOT NULL;

-- DIM_CONCORRENTE (falta 1)
CREATE INDEX IF NOT EXISTS idx_concorrente_nome ON dim_concorrente(nome);

-- FATO_ENTIDADE_PRODUTO (faltam 2)
CREATE INDEX IF NOT EXISTS idx_fato_entidade_produto_produto ON fato_entidade_produto(produto_id);
CREATE INDEX IF NOT EXISTS idx_fato_entidade_produto_composto ON fato_entidade_produto(entidade_id, produto_id);

-- FATO_ENTIDADE_COMPETIDOR (faltam 3 - tabela sem índices)
CREATE INDEX IF NOT EXISTS idx_fato_entidade_competidor_entidade ON fato_entidade_competidor(entidade_id);
CREATE INDEX IF NOT EXISTS idx_fato_entidade_competidor_competidor ON fato_entidade_competidor(competidor_id);
CREATE INDEX IF NOT EXISTS idx_fato_entidade_competidor_composto ON fato_entidade_competidor(entidade_id, competidor_id);

-- IA_CONFIG_HISTORICO (faltam 2 - tabela sem índices)
CREATE INDEX IF NOT EXISTS idx_ia_config_historico_chave ON ia_config_historico(chave);
CREATE INDEX IF NOT EXISTS idx_ia_config_historico_created_at ON ia_config_historico(created_at);

-- SYSTEM_SETTINGS (faltam 2 - tabela sem índices)
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_chave ON system_settings(chave);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at);

-- USER_PROFILES (faltam 2 - tabela sem índices)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at);

-- IA_ALERTAS (faltam 2)
CREATE INDEX IF NOT EXISTS idx_ia_alertas_tipo ON ia_alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_ia_alertas_severidade ON ia_alertas(severidade);

-- IA_USAGE (faltam 1)
CREATE INDEX IF NOT EXISTS idx_ia_usage_user_data ON ia_usage(user_id, created_at) WHERE user_id IS NOT NULL;

-- IMPORTACAO_ERROS (faltam 1)
CREATE INDEX IF NOT EXISTS idx_importacao_erros_tipo ON importacao_erros(tipo_erro) WHERE tipo_erro IS NOT NULL;

-- DIM_IMPORTACAO (faltam 2)
CREATE INDEX IF NOT EXISTS idx_importacao_tipo ON dim_importacao(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_importacao_data_inicio ON dim_importacao(data_inicio) WHERE data_inicio IS NOT NULL;

-- DIM_STATUS_QUALIFICACAO (falta 1)
CREATE INDEX IF NOT EXISTS idx_status_qualificacao_ativo ON dim_status_qualificacao(ativo);

-- DIM_PRODUTO_CATALOGO (falta 1)
CREATE INDEX IF NOT EXISTS idx_produto_catalogo_subcategoria ON dim_produto_catalogo(subcategoria) WHERE subcategoria IS NOT NULL;

-- RATE_LIMITS (falta 1)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON rate_limits(window_end);

-- USUARIOS_BLOQUEADOS (faltam 2)
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueados_ativo ON usuarios_bloqueados(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueados_data_desbloqueio ON usuarios_bloqueados(data_desbloqueio) WHERE data_desbloqueio IS NOT NULL;

-- FATO_ENTIDADE_CONTEXTO (faltam 2)
CREATE INDEX IF NOT EXISTS idx_fato_entidade_contexto_mercado ON fato_entidade_contexto(mercado_id) WHERE mercado_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fato_entidade_contexto_projeto ON fato_entidade_contexto(projeto_id) WHERE projeto_id IS NOT NULL;

-- DIM_MERCADO (falta 1)
CREATE INDEX IF NOT EXISTS idx_mercado_segmento ON dim_mercado(segmento) WHERE segmento IS NOT NULL;

-- DIM_ENTIDADE (faltam 2)
CREATE INDEX IF NOT EXISTS idx_entidade_tipo_setor ON dim_entidade(tipo_entidade, setor) WHERE setor IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entidade_tipo_ativo ON dim_entidade(tipo_entidade, deleted_at);

-- ============================================================================
-- TOTAL: ~43 índices faltantes
-- ============================================================================
