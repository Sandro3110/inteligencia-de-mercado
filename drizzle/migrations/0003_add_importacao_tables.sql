-- ============================================================================
-- MIGRATION: Adicionar tabelas de importação
-- Data: 2025-12-01
-- Descrição: Tabelas para controle de importação de entidades via CSV/Excel
-- ============================================================================

-- 1. Criar dim_importacao
CREATE TABLE dim_importacao (
  id SERIAL PRIMARY KEY,
  
  -- Contexto (obrigatório)
  projeto_id INTEGER NOT NULL REFERENCES dim_projeto(id) ON DELETE CASCADE,
  pesquisa_id INTEGER NOT NULL REFERENCES dim_pesquisa(id) ON DELETE CASCADE,
  
  -- Arquivo
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL CHECK (tipo_arquivo IN ('csv', 'xlsx')),
  tamanho_bytes BIGINT,
  caminho_s3 VARCHAR(500),
  
  -- Estatísticas
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER DEFAULT 0,
  linhas_sucesso INTEGER DEFAULT 0,
  linhas_erro INTEGER DEFAULT 0,
  linhas_duplicadas INTEGER DEFAULT 0,
  linhas_geografia_fuzzy INTEGER DEFAULT 0,
  
  -- Controle
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'processando', 'concluido', 'falhou', 'cancelado')),
  erro_mensagem TEXT,
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  
  -- Configurações
  mapeamento_colunas JSONB,
  opcoes JSONB,
  
  -- Execução
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) REFERENCES users(id)
);

-- 2. Criar importacao_erros
CREATE TABLE importacao_erros (
  id SERIAL PRIMARY KEY,
  importacao_id INTEGER NOT NULL REFERENCES dim_importacao(id) ON DELETE CASCADE,
  
  -- Linha
  linha_numero INTEGER NOT NULL,
  linha_dados JSONB NOT NULL,
  
  -- Erro
  campo_erro VARCHAR(100),
  tipo_erro VARCHAR(50) NOT NULL 
    CHECK (tipo_erro IN ('validacao', 'duplicata', 'fk', 'geografia', 'outro')),
  mensagem_erro TEXT NOT NULL,
  sugestao_correcao JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Adicionar importacao_id em dim_entidade
ALTER TABLE dim_entidade 
ADD COLUMN importacao_id INTEGER REFERENCES dim_importacao(id) ON DELETE SET NULL;

-- 4. Criar índices
CREATE INDEX idx_importacao_projeto ON dim_importacao(projeto_id);
CREATE INDEX idx_importacao_pesquisa ON dim_importacao(pesquisa_id);
CREATE INDEX idx_importacao_status ON dim_importacao(status);
CREATE INDEX idx_importacao_created_at ON dim_importacao(created_at DESC);
CREATE INDEX idx_importacao_created_by ON dim_importacao(created_by);

CREATE INDEX idx_importacao_erros_importacao ON importacao_erros(importacao_id);
CREATE INDEX idx_importacao_erros_tipo ON importacao_erros(tipo_erro);

CREATE INDEX idx_entidade_importacao ON dim_entidade(importacao_id);

-- 5. Comentários
COMMENT ON TABLE dim_importacao IS 'Controle de processos de importação de entidades via CSV/Excel';
COMMENT ON TABLE importacao_erros IS 'Erros ocorridos durante importação, linha por linha';
COMMENT ON COLUMN dim_entidade.importacao_id IS 'ID da importação que criou esta entidade (se aplicável)';
