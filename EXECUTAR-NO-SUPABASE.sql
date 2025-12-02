-- ============================================================================
-- MIGRATIONS PARA EXECUTAR NO SUPABASE DASHBOARD
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard: https://supabase.com/dashboard/project/ecnzwfhcgqpfcgvuqfxq/sql/new
-- 2. Copie e cole TODO este arquivo no SQL Editor
-- 3. Clique em "Run" (ou pressione Ctrl+Enter)
-- 4. Aguarde confirmação de sucesso
--
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Adicionar 3 status de importação
-- ============================================================================

INSERT INTO dim_status_qualificacao (codigo, nome, descricao, cor, ordem, created_by) VALUES
('ativo', 'Ativo', 'Cliente ativo', '#22c55e', 1, 'sistema'),
('inativo', 'Inativo', 'Cliente inativo', '#6b7280', 2, 'sistema'),
('prospect', 'Prospect', 'Potencial cliente (a qualificar)', '#3b82f6', 3, 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- Verificar se foram inseridos
SELECT * FROM dim_status_qualificacao ORDER BY ordem;

-- ============================================================================
-- MIGRATION 2: Criar tabela dim_importacao
-- ============================================================================

CREATE TABLE IF NOT EXISTS dim_importacao (
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

-- ============================================================================
-- MIGRATION 3: Criar tabela importacao_erros
-- ============================================================================

CREATE TABLE IF NOT EXISTS importacao_erros (
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

-- ============================================================================
-- MIGRATION 4: Adicionar importacao_id em dim_entidade
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dim_entidade' AND column_name = 'importacao_id'
  ) THEN
    ALTER TABLE dim_entidade 
    ADD COLUMN importacao_id INTEGER REFERENCES dim_importacao(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION 5: Criar índices
-- ============================================================================

-- Índices para dim_importacao
CREATE INDEX IF NOT EXISTS idx_importacao_projeto ON dim_importacao(projeto_id);
CREATE INDEX IF NOT EXISTS idx_importacao_pesquisa ON dim_importacao(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_importacao_status ON dim_importacao(status);
CREATE INDEX IF NOT EXISTS idx_importacao_created_at ON dim_importacao(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_importacao_created_by ON dim_importacao(created_by);

-- Índices para importacao_erros
CREATE INDEX IF NOT EXISTS idx_importacao_erros_importacao ON importacao_erros(importacao_id);
CREATE INDEX IF NOT EXISTS idx_importacao_erros_tipo ON importacao_erros(tipo_erro);

-- Índice para dim_entidade
CREATE INDEX IF NOT EXISTS idx_entidade_importacao ON dim_entidade(importacao_id);

-- ============================================================================
-- MIGRATION 6: Comentários
-- ============================================================================

COMMENT ON TABLE dim_importacao IS 'Controle de processos de importação de entidades via CSV/Excel';
COMMENT ON TABLE importacao_erros IS 'Erros ocorridos durante importação, linha por linha';
COMMENT ON COLUMN dim_entidade.importacao_id IS 'ID da importação que criou esta entidade (se aplicável)';
COMMENT ON COLUMN dim_status_qualificacao.codigo IS 'Código único do status (ativo, inativo, prospect, quente, morno, frio, descartado)';
COMMENT ON TABLE dim_status_qualificacao IS 'Status de qualificação: Importação (ativo/inativo/prospect) + Enriquecimento (quente/morno/frio/descartado)';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se tudo foi criado
SELECT 
  'dim_importacao' as tabela,
  COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'dim_importacao'
UNION ALL
SELECT 
  'importacao_erros' as tabela,
  COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'importacao_erros'
UNION ALL
SELECT 
  'dim_status_qualificacao' as tabela,
  COUNT(*) as total_registros
FROM dim_status_qualificacao;

-- Verificar índices criados
SELECT 
  tablename,
  indexname
FROM pg_indexes 
WHERE tablename IN ('dim_importacao', 'importacao_erros', 'dim_entidade')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- FIM DAS MIGRATIONS
-- ============================================================================
-- 
-- ✅ Se você viu os resultados das queries de verificação acima, está tudo OK!
-- 
-- Próximo passo: Voltar para o chat e confirmar que executou com sucesso
--
-- ============================================================================
