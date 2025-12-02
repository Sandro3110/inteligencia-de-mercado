#!/bin/bash

# Script para executar o schema de autenticação em partes
# Uso: ./execute-auth-schema.sh

echo "🚀 Iniciando instalação do schema de autenticação..."

# Parte 1: Criar tabelas básicas
echo "📊 Criando tabelas de roles e permissions..."
psql "$DATABASE_URL" <<'SQL'
-- Tabela de papéis
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir papéis
INSERT INTO public.roles (nome, descricao) VALUES
  ('administrador', 'Administrador com acesso total ao sistema'),
  ('gerente', 'Gerente com acesso a projetos, pesquisas e equipe'),
  ('analista', 'Analista com acesso a dados, relatórios e importações'),
  ('visualizador', 'Visualizador com acesso somente leitura')
ON CONFLICT (nome) DO NOTHING;

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  recurso VARCHAR(50) NOT NULL,
  acao VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
SQL

echo "✅ Tabelas básicas criadas!"

# Parte 2: Inserir permissões
echo "🔐 Inserindo permissões..."
psql "$DATABASE_URL" <<'SQL'
INSERT INTO public.permissions (nome, descricao, recurso, acao) VALUES
  ('projetos.create', 'Criar novos projetos', 'projetos', 'create'),
  ('projetos.read', 'Visualizar projetos', 'projetos', 'read'),
  ('projetos.update', 'Editar projetos existentes', 'projetos', 'update'),
  ('projetos.delete', 'Excluir projetos', 'projetos', 'delete'),
  ('pesquisas.create', 'Criar novas pesquisas', 'pesquisas', 'create'),
  ('pesquisas.read', 'Visualizar pesquisas', 'pesquisas', 'read'),
  ('pesquisas.update', 'Editar pesquisas existentes', 'pesquisas', 'update'),
  ('pesquisas.delete', 'Excluir pesquisas', 'pesquisas', 'delete'),
  ('entidades.create', 'Criar novas entidades', 'entidades', 'create'),
  ('entidades.read', 'Visualizar entidades', 'entidades', 'read'),
  ('entidades.update', 'Editar entidades existentes', 'entidades', 'update'),
  ('entidades.delete', 'Excluir entidades', 'entidades', 'delete'),
  ('importacoes.create', 'Realizar importações de dados', 'importacoes', 'create'),
  ('importacoes.read', 'Visualizar histórico de importações', 'importacoes', 'read'),
  ('importacoes.delete', 'Excluir importações', 'importacoes', 'delete'),
  ('ia.process', 'Processar dados com IA', 'ia', 'process'),
  ('ia.read', 'Visualizar resultados de IA', 'ia', 'read'),
  ('dashboard.read', 'Visualizar dashboard', 'dashboard', 'read'),
  ('usuarios.create', 'Criar novos usuários', 'usuarios', 'create'),
  ('usuarios.read', 'Visualizar usuários', 'usuarios', 'read'),
  ('usuarios.update', 'Editar usuários', 'usuarios', 'update'),
  ('usuarios.delete', 'Excluir usuários', 'usuarios', 'delete')
ON CONFLICT (nome) DO NOTHING;
SQL

echo "✅ Permissões inseridas!"

# Parte 3: Criar relacionamentos
echo "🔗 Criando relacionamentos..."
psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Administrador: todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 1, id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Gerente: criar, ler e editar (sem deletar usuários)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 2, id FROM public.permissions 
WHERE acao IN ('create', 'read', 'update') AND recurso != 'usuarios'
ON CONFLICT DO NOTHING;

-- Analista: ler tudo, criar/editar entidades e importações, processar IA
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 3, id FROM public.permissions 
WHERE acao = 'read' OR nome IN ('entidades.create', 'entidades.update', 'importacoes.create', 'ia.process')
ON CONFLICT DO NOTHING;

-- Visualizador: apenas leitura
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 4, id FROM public.permissions WHERE acao = 'read'
ON CONFLICT DO NOTHING;
SQL

echo "✅ Relacionamentos criados!"

# Parte 4: Criar tabelas complementares
echo "📋 Criando tabelas complementares..."
psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS public.organizacoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  plano VARCHAR(50) DEFAULT 'free',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id VARCHAR(255) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  avatar_url TEXT,
  role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 4,
  organizacao_id INTEGER REFERENCES public.organizacoes(id),
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  acao VARCHAR(100) NOT NULL,
  recurso VARCHAR(50),
  recurso_id INTEGER,
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
SQL

echo "✅ Tabelas complementares criadas!"

# Parte 5: Criar índices
echo "⚡ Criando índices..."
psql "$DATABASE_URL" <<'SQL'
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON public.user_profiles(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permissions_recurso ON public.permissions(recurso);
SQL

echo "✅ Índices criados!"

echo ""
echo "🎉 Schema de autenticação instalado com sucesso!"
echo ""
echo "📊 Estatísticas:"
psql "$DATABASE_URL" -c "SELECT 
  (SELECT COUNT(*) FROM public.roles) AS total_roles,
  (SELECT COUNT(*) FROM public.permissions) AS total_permissions,
  (SELECT COUNT(*) FROM public.role_permissions) AS total_role_permissions,
  (SELECT COUNT(*) FROM public.user_profiles) AS total_users;"
