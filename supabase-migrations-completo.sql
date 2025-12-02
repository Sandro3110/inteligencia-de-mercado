-- =====================================================
-- MIGRATIONS COMPLETAS - Inteligência de Mercado
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- Migration 0000: Tabelas principais
CREATE TABLE "dim_geografia" (
	"id" serial PRIMARY KEY NOT NULL,
	"cidade" varchar(255) NOT NULL,
	"uf" varchar(2) NOT NULL,
	"regiao" varchar(50) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dim_mercados" (
	"id" serial PRIMARY KEY NOT NULL,
	"mercado_hash" varchar(255),
	"nome" varchar(255) NOT NULL,
	"categoria" varchar(100) NOT NULL,
	"segmentacao" varchar(50),
	"tamanho_mercado" text,
	"crescimento_anual" text,
	"tendencias" text,
	"principais_players" text,
	"pesquisa_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dim_produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"produto_hash" varchar(255),
	"nome" varchar(255) NOT NULL,
	"categoria" varchar(100) NOT NULL,
	"descricao" text,
	"preco" text,
	"unidade" varchar(50),
	"ativo" boolean DEFAULT true,
	"mercado_id" integer,
	"pesquisa_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entidade_competidores" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidade_id" integer NOT NULL,
	"competidor_id" integer NOT NULL,
	"mercado_id" integer NOT NULL,
	"nivel_competicao" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "entidade_competidores_check" CHECK (entidade_id != competidor_id)
);
--> statement-breakpoint
CREATE TABLE "entidade_produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidade_id" integer NOT NULL,
	"produto_id" integer NOT NULL,
	"tipo_relacao" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fato_entidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo_entidade" varchar(20) NOT NULL,
	"entidade_hash" varchar(255),
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(20),
	"pesquisa_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"geografia_id" integer NOT NULL,
	"mercado_id" integer NOT NULL,
	"email" varchar(500),
	"telefone" varchar(50),
	"site_oficial" varchar(500),
	"linkedin" varchar(500),
	"instagram" varchar(500),
	"cnae" varchar(20),
	"porte" varchar(50),
	"segmentacao_b2b_b2c" varchar(10),
	"faturamento_declarado" text,
	"faturamento_estimado" text,
	"numero_estabelecimentos" text,
	"qualidade_score" integer,
	"qualidade_classificacao" varchar(50),
	"status_qualificacao" varchar(50) DEFAULT 'prospect',
	"validation_status" varchar(50) DEFAULT 'pending',
	"validation_notes" text,
	"validated_by" varchar(64),
	"validated_at" timestamp,
	"lead_stage" varchar(50),
	"stage_updated_at" timestamp,
	"cliente_origem_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fato_entidades_tipo_check" CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),
	CONSTRAINT "fato_entidades_qualidade_check" CHECK (qualidade_score >= 0 AND qualidade_score <= 100),
	CONSTRAINT "fato_entidades_status_qualificacao_check" CHECK (status_qualificacao IN ('ativo', 'inativo', 'prospect', 'lead_qualificado', 'lead_desqualificado'))
);
--> statement-breakpoint
CREATE TABLE "fato_entidades_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidade_id" integer NOT NULL,
	"data_snapshot" jsonb NOT NULL,
	"change_type" varchar(50) NOT NULL,
	"changed_by" varchar(64),
	"changed_at" timestamp DEFAULT now(),
	CONSTRAINT "fato_entidades_history_type_check" CHECK (change_type IN ('created', 'updated', 'deleted'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "dim_geografia_cidade_uf_unique" ON "dim_geografia" USING btree ("cidade","uf");--> statement-breakpoint
CREATE INDEX "idx_dim_geografia_uf" ON "dim_geografia" USING btree ("uf");--> statement-breakpoint
CREATE INDEX "idx_dim_geografia_regiao" ON "dim_geografia" USING btree ("regiao");--> statement-breakpoint
CREATE INDEX "idx_dim_geografia_cidade_uf" ON "dim_geografia" USING btree ("cidade","uf");--> statement-breakpoint
CREATE UNIQUE INDEX "dim_mercados_hash_unique" ON "dim_mercados" USING btree ("mercado_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_pesquisa" ON "dim_mercados" USING btree ("pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_project" ON "dim_mercados" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_categoria" ON "dim_mercados" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_hash" ON "dim_mercados" USING btree ("mercado_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_mercados_pesquisa_categoria" ON "dim_mercados" USING btree ("pesquisa_id","categoria");--> statement-breakpoint
CREATE UNIQUE INDEX "dim_produtos_hash_unique" ON "dim_produtos" USING btree ("produto_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_pesquisa" ON "dim_produtos" USING btree ("pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_project" ON "dim_produtos" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_categoria" ON "dim_produtos" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_mercado" ON "dim_produtos" USING btree ("mercado_id");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_hash" ON "dim_produtos" USING btree ("produto_hash");--> statement-breakpoint
CREATE INDEX "idx_dim_produtos_pesquisa_categoria" ON "dim_produtos" USING btree ("pesquisa_id","categoria");--> statement-breakpoint
CREATE UNIQUE INDEX "entidade_competidores_unique" ON "entidade_competidores" USING btree ("entidade_id","competidor_id","mercado_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_competidores_entidade" ON "entidade_competidores" USING btree ("entidade_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_competidores_competidor" ON "entidade_competidores" USING btree ("competidor_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_competidores_mercado" ON "entidade_competidores" USING btree ("mercado_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entidade_produtos_unique" ON "entidade_produtos" USING btree ("entidade_id","produto_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_produtos_entidade" ON "entidade_produtos" USING btree ("entidade_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_produtos_produto" ON "entidade_produtos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX "idx_entidade_produtos_tipo" ON "entidade_produtos" USING btree ("tipo_relacao");--> statement-breakpoint
CREATE UNIQUE INDEX "fato_entidades_hash_unique" ON "fato_entidades" USING btree ("entidade_hash");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo" ON "fato_entidades" USING btree ("tipo_entidade");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_pesquisa" ON "fato_entidades" USING btree ("pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_project" ON "fato_entidades" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_geografia" ON "fato_entidades" USING btree ("geografia_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_mercado" ON "fato_entidades" USING btree ("mercado_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_hash" ON "fato_entidades" USING btree ("entidade_hash");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_qualidade" ON "fato_entidades" USING btree ("qualidade_score");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_cnpj" ON "fato_entidades" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_pesquisa" ON "fato_entidades" USING btree ("tipo_entidade","pesquisa_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_mercado" ON "fato_entidades" USING btree ("tipo_entidade","mercado_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_cliente_origem" ON "fato_entidades" USING btree ("cliente_origem_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_geografia_mercado" ON "fato_entidades" USING btree ("geografia_id","mercado_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_status_qualificacao" ON "fato_entidades" USING btree ("status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_status" ON "fato_entidades" USING btree ("tipo_entidade","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_pesquisa_status" ON "fato_entidades" USING btree ("pesquisa_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_mercado_status" ON "fato_entidades" USING btree ("mercado_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_geografia_status" ON "fato_entidades" USING btree ("geografia_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_tipo_pesquisa_status" ON "fato_entidades" USING btree ("tipo_entidade","pesquisa_id","status_qualificacao");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_history_entidade" ON "fato_entidades_history" USING btree ("entidade_id");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_history_changed_at" ON "fato_entidades_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_fato_entidades_history_change_type" ON "fato_entidades_history" USING btree ("change_type");
-- Migration 0001: Drill down indexes
-- Migration: Add critical indexes for drill-down performance
-- Created: 2025-12-01
-- Purpose: Fix 500 errors in sector and product drill-down by adding missing indexes

-- Clientes: Add indexes for pesquisaId and cnae
CREATE INDEX IF NOT EXISTS idx_clientes_pesquisaId ON clientes(pesquisaId);
CREATE INDEX IF NOT EXISTS idx_clientes_cnae ON clientes(cnae);

-- Leads: Add indexes for pesquisaId and setor
CREATE INDEX IF NOT EXISTS idx_leads_pesquisaId ON leads(pesquisaId);
CREATE INDEX IF NOT EXISTS idx_leads_setor ON leads(setor);

-- Concorrentes: Add indexes for pesquisaId and setor
CREATE INDEX IF NOT EXISTS idx_concorrentes_pesquisaId ON concorrentes(pesquisaId);
CREATE INDEX IF NOT EXISTS idx_concorrentes_setor ON concorrentes(setor);

-- Migration 0002: Status importação
-- ============================================================================
-- MIGRATION: Adicionar status de importação
-- Data: 2025-12-01
-- Descrição: Adicionar 3 status para importação (Ativo, Inativo, Prospect)
-- ============================================================================

-- Adicionar novos status
INSERT INTO dim_status_qualificacao (codigo, nome, descricao, cor, ordem, created_by) VALUES
('ativo', 'Ativo', 'Cliente ativo', '#22c55e', 1, 'sistema'),
('inativo', 'Inativo', 'Cliente inativo', '#6b7280', 2, 'sistema'),
('prospect', 'Prospect', 'Potencial cliente (a qualificar)', '#3b82f6', 3, 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- Comentários
COMMENT ON COLUMN dim_status_qualificacao.codigo IS 'Código único do status (ativo, inativo, prospect, quente, morno, frio, descartado)';
COMMENT ON TABLE dim_status_qualificacao IS 'Status de qualificação: Importação (ativo/inativo/prospect) + Enriquecimento (quente/morno/frio/descartado)';

-- Migration 0003: Tabelas de importação
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

-- Migration 005: Audit logs (FASE 1)
-- FASE 1 - Sessão 1.5: Tabela de Auditoria
-- Migration: 005_create_audit_logs
-- Data: 2025-12-02

-- Criar tabela de audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  
  -- Quem
  user_id VARCHAR(255) NOT NULL,
  user_name TEXT,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- O quê
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  
  -- Detalhes
  description TEXT,
  changes JSONB,
  metadata JSONB,
  
  -- Resultado
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  
  -- Contexto
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Comentários
COMMENT ON TABLE audit_logs IS 'Registro de auditoria de todas as ações críticas do sistema';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de ação: create, update, delete, login, export, etc';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso: projeto, pesquisa, entidade, etc';
COMMENT ON COLUMN audit_logs.status IS 'Resultado: success, failure, error';
COMMENT ON COLUMN audit_logs.changes IS 'Objeto JSON com before/after para updates';
COMMENT ON COLUMN audit_logs.metadata IS 'Dados adicionais contextuais';

-- Migration 006: Encryption hash columns (FASE 1)
-- FASE 1 - Sessão 1.6: Criptografia de Dados Sensíveis
-- Migration: 006_add_encryption_hash_columns
-- Data: 2025-12-02

-- Adicionar colunas de hash para busca de dados criptografados
-- Hash permite buscar sem descriptografar todos os registros

-- Tabela: dim_entidade
ALTER TABLE dim_entidade 
ADD COLUMN IF NOT EXISTS cnpj_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS telefone_hash VARCHAR(64);

-- Índices para performance de busca
CREATE INDEX IF NOT EXISTS idx_dim_entidade_cnpj_hash ON dim_entidade(cnpj_hash);
CREATE INDEX IF NOT EXISTS idx_dim_entidade_email_hash ON dim_entidade(email_hash);
CREATE INDEX IF NOT EXISTS idx_dim_entidade_telefone_hash ON dim_entidade(telefone_hash);

-- Comentários
COMMENT ON COLUMN dim_entidade.cnpj_hash IS 'Hash HMAC-SHA256 do CNPJ para busca sem descriptografar';
COMMENT ON COLUMN dim_entidade.email_hash IS 'Hash HMAC-SHA256 do email para busca sem descriptografar';
COMMENT ON COLUMN dim_entidade.telefone_hash IS 'Hash HMAC-SHA256 do telefone para busca sem descriptografar';

-- Nota: Os dados existentes precisam ser migrados manualmente
-- usando o script de migração de dados (migration-script.ts)
