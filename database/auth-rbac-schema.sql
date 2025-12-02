-- =====================================================
-- SCHEMA DE AUTENTICAÇÃO E RBAC
-- Sistema Intelmarket - Inteligência de Mercado
-- =====================================================

-- =====================================================
-- 1. TABELA DE PAPÉIS (ROLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir papéis padrão
INSERT INTO public.roles (nome, descricao) VALUES
  ('administrador', 'Administrador com acesso total ao sistema'),
  ('gerente', 'Gerente com acesso a projetos, pesquisas e equipe'),
  ('analista', 'Analista com acesso a dados, relatórios e importações'),
  ('visualizador', 'Visualizador com acesso somente leitura')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 2. TABELA DE PERMISSÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  recurso VARCHAR(50) NOT NULL, -- 'projetos', 'entidades', 'importacoes', etc.
  acao VARCHAR(20) NOT NULL, -- 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir permissões padrão
INSERT INTO public.permissions (nome, descricao, recurso, acao) VALUES
  -- Projetos
  ('projetos.create', 'Criar novos projetos', 'projetos', 'create'),
  ('projetos.read', 'Visualizar projetos', 'projetos', 'read'),
  ('projetos.update', 'Editar projetos existentes', 'projetos', 'update'),
  ('projetos.delete', 'Excluir projetos', 'projetos', 'delete'),
  
  -- Pesquisas
  ('pesquisas.create', 'Criar novas pesquisas', 'pesquisas', 'create'),
  ('pesquisas.read', 'Visualizar pesquisas', 'pesquisas', 'read'),
  ('pesquisas.update', 'Editar pesquisas existentes', 'pesquisas', 'update'),
  ('pesquisas.delete', 'Excluir pesquisas', 'pesquisas', 'delete'),
  
  -- Entidades
  ('entidades.create', 'Criar novas entidades', 'entidades', 'create'),
  ('entidades.read', 'Visualizar entidades', 'entidades', 'read'),
  ('entidades.update', 'Editar entidades existentes', 'entidades', 'update'),
  ('entidades.delete', 'Excluir entidades', 'entidades', 'delete'),
  
  -- Importações
  ('importacoes.create', 'Realizar importações de dados', 'importacoes', 'create'),
  ('importacoes.read', 'Visualizar histórico de importações', 'importacoes', 'read'),
  ('importacoes.delete', 'Excluir importações', 'importacoes', 'delete'),
  
  -- Processamento IA
  ('ia.process', 'Processar dados com IA', 'ia', 'process'),
  ('ia.read', 'Visualizar resultados de IA', 'ia', 'read'),
  
  -- Dashboard
  ('dashboard.read', 'Visualizar dashboard', 'dashboard', 'read'),
  
  -- Usuários (apenas admin)
  ('usuarios.create', 'Criar novos usuários', 'usuarios', 'create'),
  ('usuarios.read', 'Visualizar usuários', 'usuarios', 'read'),
  ('usuarios.update', 'Editar usuários', 'usuarios', 'update'),
  ('usuarios.delete', 'Excluir usuários', 'usuarios', 'delete')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 3. TABELA DE RELACIONAMENTO ROLES-PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Atribuir permissões aos papéis

-- ADMIN: Todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 1, id FROM public.permissions
ON CONFLICT DO NOTHING;

-- MANAGER: Criar, ler e editar (sem deletar usuários)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 2, id FROM public.permissions 
WHERE acao IN ('create', 'read', 'update') 
  AND recurso != 'usuarios'
ON CONFLICT DO NOTHING;

-- ANALYST: Ler tudo, criar/editar entidades e importações, processar IA
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 3, id FROM public.permissions 
WHERE acao = 'read' 
  OR nome IN ('entidades.create', 'entidades.update', 'importacoes.create', 'ia.process')
ON CONFLICT DO NOTHING;

-- VIEWER: Apenas leitura
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 4, id FROM public.permissions 
WHERE acao = 'read'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. TABELA DE PERFIS DE USUÁRIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 4, -- Viewer por padrão
  organizacao_id INTEGER REFERENCES public.organizacoes(id),
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE ORGANIZAÇÕES (OPCIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizacoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  plano VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE LOG DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create_projeto', etc.
  recurso VARCHAR(50), -- 'projetos', 'entidades', etc.
  recurso_id INTEGER,
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON public.user_profiles(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permissions_recurso ON public.permissions(recurso);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar seu próprio perfil (exceto role)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role_id = (SELECT role_id FROM public.user_profiles WHERE id = auth.uid()));

-- Política: Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.nome = 'administrador'
    )
  );

-- Política: Admins podem criar/editar/deletar perfis
CREATE POLICY "Admins can manage profiles"
  ON public.user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.nome = 'administrador'
    )
  );

-- Política: Usuários podem ver seus próprios logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.nome = 'administrador'
    )
  );

-- Política: Sistema pode criar logs (service role)
CREATE POLICY "System can create audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 9. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    JOIN public.role_permissions rp ON up.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE up.id = p_user_id
      AND p.nome = p_permission_name
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter permissões de um usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_nome VARCHAR,
  permission_descricao TEXT,
  recurso VARCHAR,
  acao VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.nome,
    p.descricao,
    p.recurso,
    p.acao
  FROM public.user_profiles up
  JOIN public.role_permissions rp ON up.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE up.id = p_user_id
  ORDER BY p.recurso, p.acao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit(
  p_user_id UUID,
  p_acao VARCHAR,
  p_recurso VARCHAR DEFAULT NULL,
  p_recurso_id INTEGER DEFAULT NULL,
  p_detalhes JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, acao, recurso, recurso_id, detalhes)
  VALUES (p_user_id, p_acao, p_recurso, p_recurso_id, p_detalhes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizacoes_updated_at
  BEFORE UPDATE ON public.organizacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 10. DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Criar organização de teste
INSERT INTO public.organizacoes (nome, cnpj, plano) VALUES
  ('Empresa Teste Ltda', '12.345.678/0001-90', 'pro')
ON CONFLICT DO NOTHING;

-- NOTA: Usuários de teste devem ser criados via Supabase Auth
-- Após criar usuário no Supabase, executar:
-- INSERT INTO public.user_profiles (id, nome, email, role_id, organizacao_id)
-- VALUES ('uuid-do-usuario', 'Nome do Usuário', 'email@exemplo.com', 1, 1);

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Verificar instalação
SELECT 'Schema de autenticação e RBAC instalado com sucesso!' AS status;

-- Estatísticas
SELECT 
  (SELECT COUNT(*) FROM public.roles) AS total_roles,
  (SELECT COUNT(*) FROM public.permissions) AS total_permissions,
  (SELECT COUNT(*) FROM public.role_permissions) AS total_role_permissions,
  (SELECT COUNT(*) FROM public.user_profiles) AS total_users;
