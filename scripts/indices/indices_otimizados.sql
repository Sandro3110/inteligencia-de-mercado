-- ============================================================================
-- ÍNDICES OTIMIZADOS PARA PERFORMANCE - CRIADOS DO ZERO
-- Data: 06/12/2024
-- Estratégia: Foreign Keys + Filtros + Busca + Temporal + Compostos
-- ============================================================================

-- ============================================================================
-- 1. DIM_ENTIDADE (Tabela mais crítica - 49 campos)
-- ============================================================================

-- Foreign Keys
CREATE INDEX idx_entidade_importacao_id ON dim_entidade(importacao_id) WHERE importacao_id IS NOT NULL;

-- Filtros frequentes
CREATE INDEX idx_entidade_tipo ON dim_entidade(tipo_entidade);
CREATE INDEX idx_entidade_status_ativo ON dim_entidade(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_entidade_enriquecido ON dim_entidade(enriquecido);

-- Busca e unicidade
CREATE UNIQUE INDEX idx_entidade_cnpj_unique ON dim_entidade(cnpj) WHERE cnpj IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_entidade_cpf_unique ON dim_entidade(cpf) WHERE cpf IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_entidade_razao_social ON dim_entidade(razao_social) WHERE razao_social IS NOT NULL;
CREATE INDEX idx_entidade_nome_fantasia ON dim_entidade(nome_fantasia) WHERE nome_fantasia IS NOT NULL;

-- Geográfico
CREATE INDEX idx_entidade_cidade_uf ON dim_entidade(cidade, uf) WHERE cidade IS NOT NULL;
CREATE INDEX idx_entidade_uf ON dim_entidade(uf) WHERE uf IS NOT NULL;

-- Segmentação e classificação
CREATE INDEX idx_entidade_setor ON dim_entidade(setor) WHERE setor IS NOT NULL;
CREATE INDEX idx_entidade_porte ON dim_entidade(porte) WHERE porte IS NOT NULL;
CREATE INDEX idx_entidade_segmentacao ON dim_entidade(segmentacao_b2b_b2c) WHERE segmentacao_b2b_b2c IS NOT NULL;

-- Qualidade de dados
CREATE INDEX idx_entidade_score_qualidade ON dim_entidade(score_qualidade_dados) WHERE score_qualidade_dados IS NOT NULL;

-- Temporal
CREATE INDEX idx_entidade_created_at ON dim_entidade(created_at);
CREATE INDEX idx_entidade_updated_at ON dim_entidade(updated_at);

-- Índices compostos estratégicos
CREATE INDEX idx_entidade_tipo_ativo ON dim_entidade(tipo_entidade, deleted_at);
CREATE INDEX idx_entidade_tipo_setor ON dim_entidade(tipo_entidade, setor) WHERE setor IS NOT NULL;

-- ============================================================================
-- 2. DIM_GEOGRAFIA (19 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_geografia_cidade_uf ON dim_geografia(cidade, uf);
CREATE INDEX idx_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_geografia_regiao ON dim_geografia(regiao) WHERE regiao IS NOT NULL;
CREATE INDEX idx_geografia_codigo_ibge ON dim_geografia(codigo_ibge) WHERE codigo_ibge IS NOT NULL;

-- ============================================================================
-- 3. DIM_MERCADO (21 campos)
-- ============================================================================

CREATE INDEX idx_mercado_entidade_id ON dim_mercado(entidade_id);
CREATE INDEX idx_mercado_segmento ON dim_mercado(segmento) WHERE segmento IS NOT NULL;
CREATE INDEX idx_mercado_ativo ON dim_mercado(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_mercado_created_at ON dim_mercado(created_at);

-- ============================================================================
-- 4. DIM_PRODUTO (17 campos)
-- ============================================================================

CREATE INDEX idx_produto_entidade_id ON dim_produto(entidade_id);
CREATE INDEX idx_produto_categoria ON dim_produto(categoria) WHERE categoria IS NOT NULL;
CREATE INDEX idx_produto_status ON dim_produto(status) WHERE status IS NOT NULL;
CREATE INDEX idx_produto_nome ON dim_produto(nome);
CREATE INDEX idx_produto_ativo ON dim_produto(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_produto_created_at ON dim_produto(created_at);

-- ============================================================================
-- 5. DIM_PROJETO (15 campos)
-- ============================================================================

CREATE INDEX idx_projeto_entidade_id ON dim_projeto(entidade_id);
CREATE INDEX idx_projeto_status ON dim_projeto(status) WHERE status IS NOT NULL;
CREATE INDEX idx_projeto_tipo ON dim_projeto(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX idx_projeto_ativo ON dim_projeto(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projeto_data_inicio ON dim_projeto(data_inicio) WHERE data_inicio IS NOT NULL;
CREATE INDEX idx_projeto_data_fim ON dim_projeto(data_fim) WHERE data_fim IS NOT NULL;

-- ============================================================================
-- 6. DIM_PESQUISA (21 campos)
-- ============================================================================

CREATE INDEX idx_pesquisa_entidade_id ON dim_pesquisa(entidade_id);
CREATE INDEX idx_pesquisa_tipo ON dim_pesquisa(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX idx_pesquisa_status ON dim_pesquisa(status) WHERE status IS NOT NULL;
CREATE INDEX idx_pesquisa_ativo ON dim_pesquisa(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pesquisa_data_realizacao ON dim_pesquisa(data_realizacao) WHERE data_realizacao IS NOT NULL;

-- ============================================================================
-- 7. DIM_CONCORRENTE (12 campos)
-- ============================================================================

CREATE INDEX idx_concorrente_entidade_id ON dim_concorrente(entidade_id);
CREATE INDEX idx_concorrente_nome ON dim_concorrente(nome);
CREATE INDEX idx_concorrente_ativo ON dim_concorrente(id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 8. DIM_CANAL (14 campos)
-- ============================================================================

CREATE INDEX idx_canal_entidade_id ON dim_canal(entidade_id);
CREATE INDEX idx_canal_tipo ON dim_canal(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX idx_canal_status ON dim_canal(status) WHERE status IS NOT NULL;
CREATE INDEX idx_canal_ativo ON dim_canal(id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 9. DIM_LEAD (18 campos)
-- ============================================================================

CREATE INDEX idx_lead_entidade_id ON dim_lead(entidade_id);
CREATE INDEX idx_lead_status_qualificacao_id ON dim_lead(status_qualificacao_id);
CREATE INDEX idx_lead_origem ON dim_lead(origem) WHERE origem IS NOT NULL;
CREATE INDEX idx_lead_email ON dim_lead(email) WHERE email IS NOT NULL;
CREATE INDEX idx_lead_ativo ON dim_lead(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_lead_created_at ON dim_lead(created_at);

-- ============================================================================
-- 10. DIM_TEMPO (17 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_tempo_data ON dim_tempo(data);
CREATE INDEX idx_tempo_ano_mes ON dim_tempo(ano, mes);
CREATE INDEX idx_tempo_ano_trimestre ON dim_tempo(ano, trimestre);
CREATE INDEX idx_tempo_dia_semana ON dim_tempo(dia_semana);

-- ============================================================================
-- 11. DIM_IMPORTACAO (27 campos)
-- ============================================================================

CREATE INDEX idx_importacao_status ON dim_importacao(status);
CREATE INDEX idx_importacao_tipo ON dim_importacao(tipo) WHERE tipo IS NOT NULL;
CREATE INDEX idx_importacao_created_at ON dim_importacao(created_at);
CREATE INDEX idx_importacao_data_inicio ON dim_importacao(data_inicio) WHERE data_inicio IS NOT NULL;

-- ============================================================================
-- 12. DIM_STATUS_QUALIFICACAO (12 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_status_qualificacao_codigo ON dim_status_qualificacao(codigo);
CREATE INDEX idx_status_qualificacao_ativo ON dim_status_qualificacao(ativo);

-- ============================================================================
-- 13. DIM_PRODUTO_CATALOGO (21 campos)
-- ============================================================================

CREATE INDEX idx_produto_catalogo_categoria ON dim_produto_catalogo(categoria) WHERE categoria IS NOT NULL;
CREATE INDEX idx_produto_catalogo_subcategoria ON dim_produto_catalogo(subcategoria) WHERE subcategoria IS NOT NULL;
CREATE INDEX idx_produto_catalogo_nome ON dim_produto_catalogo(nome);
CREATE INDEX idx_produto_catalogo_ativo ON dim_produto_catalogo(id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 14. FATO_ENTIDADE_PRODUTO (12 campos)
-- ============================================================================

CREATE INDEX idx_fato_entidade_produto_entidade ON fato_entidade_produto(entidade_id);
CREATE INDEX idx_fato_entidade_produto_produto ON fato_entidade_produto(produto_id);
CREATE INDEX idx_fato_entidade_produto_composto ON fato_entidade_produto(entidade_id, produto_id);
CREATE INDEX idx_fato_entidade_produto_created_at ON fato_entidade_produto(created_at);

-- ============================================================================
-- 15. FATO_ENTIDADE_COMPETIDOR (11 campos)
-- ============================================================================

CREATE INDEX idx_fato_entidade_competidor_entidade ON fato_entidade_competidor(entidade_id);
CREATE INDEX idx_fato_entidade_competidor_competidor ON fato_entidade_competidor(competidor_id);
CREATE INDEX idx_fato_entidade_competidor_composto ON fato_entidade_competidor(entidade_id, competidor_id);

-- ============================================================================
-- 16. FATO_ENTIDADE_CONTEXTO (38 campos)
-- ============================================================================

CREATE INDEX idx_fato_entidade_contexto_entidade ON fato_entidade_contexto(entidade_id);
CREATE INDEX idx_fato_entidade_contexto_mercado ON fato_entidade_contexto(mercado_id) WHERE mercado_id IS NOT NULL;
CREATE INDEX idx_fato_entidade_contexto_projeto ON fato_entidade_contexto(projeto_id) WHERE projeto_id IS NOT NULL;
CREATE INDEX idx_fato_entidade_contexto_created_at ON fato_entidade_contexto(created_at);

-- ============================================================================
-- 17. IA_ALERTAS (9 campos)
-- ============================================================================

CREATE INDEX idx_ia_alertas_tipo ON ia_alertas(tipo);
CREATE INDEX idx_ia_alertas_severidade ON ia_alertas(severidade);
CREATE INDEX idx_ia_alertas_resolvido ON ia_alertas(resolvido);
CREATE INDEX idx_ia_alertas_created_at ON ia_alertas(created_at);

-- ============================================================================
-- 18. IA_CACHE (8 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_ia_cache_query_hash ON ia_cache(query_hash);
CREATE INDEX idx_ia_cache_expires_at ON ia_cache(expires_at);
CREATE INDEX idx_ia_cache_created_at ON ia_cache(created_at);

-- ============================================================================
-- 19. IA_CONFIG (7 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_ia_config_chave ON ia_config(chave);
CREATE INDEX idx_ia_config_updated_at ON ia_config(updated_at);

-- ============================================================================
-- 20. IA_CONFIG_HISTORICO (7 campos)
-- ============================================================================

CREATE INDEX idx_ia_config_historico_chave ON ia_config_historico(chave);
CREATE INDEX idx_ia_config_historico_created_at ON ia_config_historico(created_at);

-- ============================================================================
-- 21. IA_USAGE (15 campos)
-- ============================================================================

CREATE INDEX idx_ia_usage_user_id ON ia_usage(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ia_usage_modelo ON ia_usage(modelo);
CREATE INDEX idx_ia_usage_operacao ON ia_usage(operacao);
CREATE INDEX idx_ia_usage_created_at ON ia_usage(created_at);
CREATE INDEX idx_ia_usage_user_data ON ia_usage(user_id, created_at) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 22. USERS (9 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ativo ON users(ativo);
CREATE INDEX idx_users_ultimo_acesso ON users(ultimo_acesso) WHERE ultimo_acesso IS NOT NULL;

-- ============================================================================
-- 23. USER_PROFILES (8 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at);

-- ============================================================================
-- 24. ROLES (4 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_roles_nome ON roles(nome);

-- ============================================================================
-- 25. SYSTEM_SETTINGS (6 campos)
-- ============================================================================

CREATE UNIQUE INDEX idx_system_settings_chave ON system_settings(chave);
CREATE INDEX idx_system_settings_updated_at ON system_settings(updated_at);

-- ============================================================================
-- 26. RATE_LIMITS (7 campos)
-- ============================================================================

CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
CREATE INDEX idx_rate_limits_window_end ON rate_limits(window_end);

-- ============================================================================
-- 27. ALERTAS_SEGURANCA (7 campos)
-- ============================================================================

CREATE INDEX idx_alertas_seguranca_user_id ON alertas_seguranca(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_alertas_seguranca_tipo ON alertas_seguranca(tipo);
CREATE INDEX idx_alertas_seguranca_severidade ON alertas_seguranca(severidade) WHERE severidade IS NOT NULL;
CREATE INDEX idx_alertas_seguranca_resolvido ON alertas_seguranca(resolvido);
CREATE INDEX idx_alertas_seguranca_created_at ON alertas_seguranca(created_at);

-- ============================================================================
-- 28. USUARIOS_BLOQUEADOS (6 campos)
-- ============================================================================

CREATE INDEX idx_usuarios_bloqueados_user_id ON usuarios_bloqueados(user_id);
CREATE INDEX idx_usuarios_bloqueados_ativo ON usuarios_bloqueados(ativo);
CREATE INDEX idx_usuarios_bloqueados_data_desbloqueio ON usuarios_bloqueados(data_desbloqueio) WHERE data_desbloqueio IS NOT NULL;

-- ============================================================================
-- 29. IMPORTACAO_ERROS (8 campos)
-- ============================================================================

CREATE INDEX idx_importacao_erros_importacao_id ON importacao_erros(importacao_id);
CREATE INDEX idx_importacao_erros_tipo ON importacao_erros(tipo_erro) WHERE tipo_erro IS NOT NULL;
CREATE INDEX idx_importacao_erros_created_at ON importacao_erros(created_at);

-- ============================================================================
-- 30. CIDADES_BRASIL (13 campos)
-- ============================================================================

CREATE INDEX idx_cidades_brasil_uf ON cidades_brasil(uf);
CREATE INDEX idx_cidades_brasil_nome ON cidades_brasil(nome);
CREATE INDEX idx_cidades_brasil_codigo_ibge ON cidades_brasil(codigo_ibge) WHERE codigo_ibge IS NOT NULL;
CREATE INDEX idx_cidades_brasil_regiao ON cidades_brasil(regiao) WHERE regiao IS NOT NULL;

-- ============================================================================
-- 31. AUDIT_LOGS (13 campos)
-- ============================================================================

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_tabela ON audit_logs(tabela);
CREATE INDEX idx_audit_logs_operacao ON audit_logs(operacao);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_tabela_timestamp ON audit_logs(tabela, timestamp);

-- ============================================================================
-- 32. DATA_AUDIT_LOGS (11 campos)
-- ============================================================================

CREATE INDEX idx_data_audit_logs_tabela ON data_audit_logs(tabela);
CREATE INDEX idx_data_audit_logs_campo ON data_audit_logs(campo);
CREATE INDEX idx_data_audit_logs_tipo_alteracao ON data_audit_logs(tipo_alteracao) WHERE tipo_alteracao IS NOT NULL;
CREATE INDEX idx_data_audit_logs_timestamp ON data_audit_logs(timestamp);

-- ============================================================================
-- 33. DIM_PRODUTO_OLD_BACKUP (14 campos - Tabela de backup)
-- ============================================================================

CREATE INDEX idx_produto_backup_entidade_id ON dim_produto_old_backup(entidade_id);
CREATE INDEX idx_produto_backup_created_at ON dim_produto_old_backup(created_at);

-- ============================================================================
-- FIM - TOTAL DE ÍNDICES CRIADOS
-- ============================================================================
