-- ============================================================================
-- ÍNDICES OTIMIZADOS - Modelo Dimensional Final
-- ============================================================================

-- TABELA: dim_projeto
CREATE INDEX idx_dim_projeto_codigo ON dim_projeto(codigo);
CREATE INDEX idx_dim_projeto_owner ON dim_projeto(owner_id);
CREATE INDEX idx_dim_projeto_status ON dim_projeto(status);
CREATE INDEX idx_dim_projeto_created_at ON dim_projeto(created_at);

-- TABELA: dim_pesquisa
CREATE INDEX idx_dim_pesquisa_projeto ON dim_pesquisa(projeto_id);
CREATE INDEX idx_dim_pesquisa_status ON dim_pesquisa(status);
CREATE INDEX idx_dim_pesquisa_created_at ON dim_pesquisa(created_at);
CREATE INDEX idx_dim_pesquisa_projeto_status ON dim_pesquisa(projeto_id, status);

-- TABELA: dim_entidade
CREATE INDEX idx_dim_entidade_hash ON dim_entidade(entidade_hash);
CREATE INDEX idx_dim_entidade_tipo ON dim_entidade(tipo_entidade);
CREATE INDEX idx_dim_entidade_cnpj ON dim_entidade(cnpj);
CREATE INDEX idx_dim_entidade_origem_tipo ON dim_entidade(origem_tipo);
CREATE INDEX idx_dim_entidade_origem_data ON dim_entidade(origem_data);
CREATE INDEX idx_dim_entidade_tipo_origem ON dim_entidade(tipo_entidade, origem_tipo);

-- TABELA: dim_geografia
CREATE INDEX idx_dim_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_dim_geografia_regiao ON dim_geografia(regiao);
CREATE INDEX idx_dim_geografia_codigo_ibge ON dim_geografia(codigo_ibge);
CREATE INDEX idx_dim_geografia_cidade_uf ON dim_geografia(cidade, uf);

-- TABELA: dim_mercado
CREATE INDEX idx_dim_mercado_hash ON dim_mercado(mercado_hash);
CREATE INDEX idx_dim_mercado_categoria ON dim_mercado(categoria);
CREATE INDEX idx_dim_mercado_enriquecido ON dim_mercado(enriquecido);
CREATE INDEX idx_dim_mercado_categoria_enriquecido ON dim_mercado(categoria, enriquecido);

-- TABELA: dim_produto
CREATE INDEX idx_dim_produto_hash ON dim_produto(produto_hash);
CREATE INDEX idx_dim_produto_categoria ON dim_produto(categoria);
CREATE INDEX idx_dim_produto_enriquecido ON dim_produto(enriquecido);
CREATE INDEX idx_dim_produto_categoria_enriquecido ON dim_produto(categoria, enriquecido);

-- TABELA: dim_status_qualificacao
CREATE INDEX idx_dim_status_qualificacao_codigo ON dim_status_qualificacao(codigo);
CREATE INDEX idx_dim_status_qualificacao_ordem ON dim_status_qualificacao(ordem);

-- TABELA: fato_entidade_contexto (CRÍTICO - Performance)
CREATE INDEX idx_fato_contexto_entidade ON fato_entidade_contexto(entidade_id);
CREATE INDEX idx_fato_contexto_projeto ON fato_entidade_contexto(projeto_id);
CREATE INDEX idx_fato_contexto_pesquisa ON fato_entidade_contexto(pesquisa_id);
CREATE INDEX idx_fato_contexto_geografia ON fato_entidade_contexto(geografia_id);
CREATE INDEX idx_fato_contexto_mercado ON fato_entidade_contexto(mercado_id);
CREATE INDEX idx_fato_contexto_status ON fato_entidade_contexto(status_qualificacao_id);
CREATE INDEX idx_fato_contexto_qualidade ON fato_entidade_contexto(qualidade_score);
CREATE INDEX idx_fato_contexto_created_at ON fato_entidade_contexto(created_at);

-- Índices compostos (drill-down e agregações)
CREATE INDEX idx_fato_contexto_projeto_pesquisa ON fato_entidade_contexto(projeto_id, pesquisa_id);
CREATE INDEX idx_fato_contexto_projeto_mercado ON fato_entidade_contexto(projeto_id, mercado_id);
CREATE INDEX idx_fato_contexto_projeto_geografia ON fato_entidade_contexto(projeto_id, geografia_id);
CREATE INDEX idx_fato_contexto_pesquisa_mercado ON fato_entidade_contexto(pesquisa_id, mercado_id);
CREATE INDEX idx_fato_contexto_pesquisa_geografia ON fato_entidade_contexto(pesquisa_id, geografia_id);
CREATE INDEX idx_fato_contexto_mercado_geografia ON fato_entidade_contexto(mercado_id, geografia_id);
CREATE INDEX idx_fato_contexto_projeto_status ON fato_entidade_contexto(projeto_id, status_qualificacao_id);
CREATE INDEX idx_fato_contexto_pesquisa_status ON fato_entidade_contexto(pesquisa_id, status_qualificacao_id);

-- TABELA: fato_entidade_produto
CREATE INDEX idx_fato_produto_contexto ON fato_entidade_produto(contexto_id);
CREATE INDEX idx_fato_produto_produto ON fato_entidade_produto(produto_id);
CREATE INDEX idx_fato_produto_tipo_relacao ON fato_entidade_produto(tipo_relacao);
CREATE INDEX idx_fato_produto_contexto_produto ON fato_entidade_produto(contexto_id, produto_id);

-- TABELA: fato_entidade_competidor
CREATE INDEX idx_fato_competidor_contexto ON fato_entidade_competidor(contexto_id);
CREATE INDEX idx_fato_competidor_entidade ON fato_entidade_competidor(competidor_entidade_id);
CREATE INDEX idx_fato_competidor_nivel ON fato_entidade_competidor(nivel_competicao);
CREATE INDEX idx_fato_competidor_contexto_entidade ON fato_entidade_competidor(contexto_id, competidor_entidade_id);

-- ============================================================================
-- TOTAL: 56 ÍNDICES CRIADOS
-- ============================================================================
