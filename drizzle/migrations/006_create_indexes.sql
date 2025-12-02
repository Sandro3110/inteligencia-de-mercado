-- Migration 006: Criar índices de performance
-- Data: 2025-12-02
-- Descrição: Criar índices para otimizar queries analíticas

-- ============================================================================
-- ÍNDICES NA TABELA FATO PRINCIPAL
-- ============================================================================

-- Índices simples em FKs (se ainda não existem)
CREATE INDEX IF NOT EXISTS idx_fato_contexto_projeto ON fato_entidade_contexto(projeto_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_pesquisa ON fato_entidade_contexto(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_entidade ON fato_entidade_contexto(entidade_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_mercado ON fato_entidade_contexto(mercado_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_geografia ON fato_entidade_contexto(geografia_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_status ON fato_entidade_contexto(status_qualificacao_id);

-- Índices em campos de filtro comum
CREATE INDEX IF NOT EXISTS idx_fato_contexto_qualidade ON fato_entidade_contexto(qualidade_score);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_porte ON fato_entidade_contexto(porte);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_cnae ON fato_entidade_contexto(cnae);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_fato_contexto_projeto_pesquisa ON fato_entidade_contexto(projeto_id, pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_mercado_geografia ON fato_entidade_contexto(mercado_id, geografia_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_tempo_mercado ON fato_entidade_contexto(tempo_id, mercado_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_tempo_projeto ON fato_entidade_contexto(tempo_id, projeto_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_canal_tempo ON fato_entidade_contexto(canal_id, tempo_id);

-- Índices parciais (apenas registros não deletados)
CREATE INDEX IF NOT EXISTS idx_fato_contexto_ativo ON fato_entidade_contexto(projeto_id, pesquisa_id) 
  WHERE deleted_at IS NULL;

-- ============================================================================
-- ÍNDICES NAS DIMENSÕES
-- ============================================================================

-- dim_entidade
CREATE INDEX IF NOT EXISTS idx_entidade_tipo ON dim_entidade(tipo_entidade);
CREATE INDEX IF NOT EXISTS idx_entidade_cnpj ON dim_entidade(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entidade_hash ON dim_entidade(entidade_hash);
CREATE INDEX IF NOT EXISTS idx_entidade_origem ON dim_entidade(origem_tipo);
CREATE INDEX IF NOT EXISTS idx_entidade_ativo ON dim_entidade(id) WHERE deleted_at IS NULL;

-- dim_geografia
CREATE INDEX IF NOT EXISTS idx_geografia_uf ON dim_geografia(uf);
CREATE INDEX IF NOT EXISTS idx_geografia_cidade_uf ON dim_geografia(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_geografia_ibge ON dim_geografia(codigo_ibge) WHERE codigo_ibge IS NOT NULL;

-- dim_mercado
CREATE INDEX IF NOT EXISTS idx_mercado_hash ON dim_mercado(mercado_hash);
CREATE INDEX IF NOT EXISTS idx_mercado_categoria ON dim_mercado(categoria);
CREATE INDEX IF NOT EXISTS idx_mercado_enriquecido ON dim_mercado(enriquecido);

-- dim_produto
CREATE INDEX IF NOT EXISTS idx_produto_hash ON dim_produto(produto_hash);
CREATE INDEX IF NOT EXISTS idx_produto_categoria ON dim_produto(categoria);
CREATE INDEX IF NOT EXISTS idx_produto_ncm ON dim_produto(ncm) WHERE ncm IS NOT NULL;

-- dim_projeto
CREATE INDEX IF NOT EXISTS idx_projeto_owner ON dim_projeto(owner_id);
CREATE INDEX IF NOT EXISTS idx_projeto_status ON dim_projeto(status);
CREATE INDEX IF NOT EXISTS idx_projeto_codigo ON dim_projeto(codigo);
CREATE INDEX IF NOT EXISTS idx_projeto_ativo ON dim_projeto(id) WHERE deleted_at IS NULL;

-- dim_pesquisa
CREATE INDEX IF NOT EXISTS idx_pesquisa_projeto ON dim_pesquisa(projeto_id);
CREATE INDEX IF NOT EXISTS idx_pesquisa_status ON dim_pesquisa(status);
CREATE INDEX IF NOT EXISTS idx_pesquisa_ativo ON dim_pesquisa(id) WHERE deleted_at IS NULL;

-- ============================================================================
-- ÍNDICES NAS TABELAS FATO SECUNDÁRIAS
-- ============================================================================

-- fato_entidade_produto
CREATE INDEX IF NOT EXISTS idx_fato_produto_contexto ON fato_entidade_produto(contexto_id);
CREATE INDEX IF NOT EXISTS idx_fato_produto_produto ON fato_entidade_produto(produto_id);
CREATE INDEX IF NOT EXISTS idx_fato_produto_principal ON fato_entidade_produto(eh_produto_principal) 
  WHERE eh_produto_principal = TRUE;

-- fato_entidade_competidor
CREATE INDEX IF NOT EXISTS idx_fato_competidor_contexto ON fato_entidade_competidor(contexto_id);
CREATE INDEX IF NOT EXISTS idx_fato_competidor_entidade ON fato_entidade_competidor(competidor_entidade_id);
CREATE INDEX IF NOT EXISTS idx_fato_competidor_nivel ON fato_entidade_competidor(nivel_competicao);

-- ============================================================================
-- ÍNDICES PARA IMPORTAÇÃO
-- ============================================================================

-- dim_importacao
CREATE INDEX IF NOT EXISTS idx_importacao_projeto ON dim_importacao(projeto_id);
CREATE INDEX IF NOT EXISTS idx_importacao_pesquisa ON dim_importacao(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_importacao_status ON dim_importacao(status);
CREATE INDEX IF NOT EXISTS idx_importacao_created ON dim_importacao(created_at);

-- importacao_erros
CREATE INDEX IF NOT EXISTS idx_importacao_erros_importacao ON importacao_erros(importacao_id);
CREATE INDEX IF NOT EXISTS idx_importacao_erros_tipo ON importacao_erros(tipo_erro);

-- ============================================================================
-- ANALYZE para atualizar estatísticas
-- ============================================================================

ANALYZE dim_tempo;
ANALYZE dim_canal;
ANALYZE dim_geografia;
ANALYZE dim_mercado;
ANALYZE dim_produto;
ANALYZE dim_entidade;
ANALYZE dim_projeto;
ANALYZE dim_pesquisa;
ANALYZE fato_entidade_contexto;
ANALYZE fato_entidade_produto;
ANALYZE fato_entidade_competidor;
