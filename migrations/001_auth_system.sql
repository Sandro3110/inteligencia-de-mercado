-- Migration: Sistema de Autenticação e Gestão de Usuários
-- Data: 2025-11-23
-- Descrição: Adiciona tabelas e campos necessários para autenticação com email/senha

-- ============================================================================
-- 1. CRIAR NOVAS TABELAS
-- ============================================================================

-- Tabela de convites de usuários
CREATE TABLE IF NOT EXISTS user_invites (
  id VARCHAR(64) PRIMARY KEY NOT NULL,
  email VARCHAR(320) NOT NULL,
  perfil ENUM('admin', 'visualizador') NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  criadoPor VARCHAR(64) NOT NULL,
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expiraEm TIMESTAMP NOT NULL,
  usado TINYINT DEFAULT 0 NOT NULL,
  usadoEm TIMESTAMP NULL,
  cancelado TINYINT DEFAULT 0 NOT NULL,
  KEY idx_token (token),
  KEY idx_email (email),
  KEY idx_usado (usado),
  CONSTRAINT fk_invite_criado_por FOREIGN KEY (criadoPor) REFERENCES users(id)
);

-- Tabela de reset de senhas
CREATE TABLE IF NOT EXISTS password_resets (
  id VARCHAR(64) PRIMARY KEY NOT NULL,
  userId VARCHAR(64) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expiraEm TIMESTAMP NOT NULL,
  usado TINYINT DEFAULT 0 NOT NULL,
  KEY idx_token (token),
  KEY idx_user (userId),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (userId) REFERENCES users(id)
);

-- Tabela de tentativas de login
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  email VARCHAR(320) NOT NULL,
  sucesso TINYINT NOT NULL,
  ip VARCHAR(45),
  userAgent TEXT,
  tentativaEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  KEY idx_email_tentativa (email, tentativaEm)
);

-- Tabela de configuração de email
CREATE TABLE IF NOT EXISTS email_config (
  id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  projectId INT NOT NULL,
  provider VARCHAR(50) DEFAULT 'resend' NOT NULL,
  apiKey VARCHAR(255) NOT NULL,
  fromEmail VARCHAR(320) NOT NULL,
  fromName VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. MODIFICAR TABELA USERS
-- ============================================================================

-- Verificar se tabela users existe e tem dados
SELECT COUNT(*) as user_count FROM users;

-- Adicionar novos campos (se não existirem)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nome VARCHAR(255) AFTER email,
  ADD COLUMN IF NOT EXISTS empresa VARCHAR(255) AFTER nome,
  ADD COLUMN IF NOT EXISTS cargo VARCHAR(100) AFTER empresa,
  ADD COLUMN IF NOT EXISTS setor VARCHAR(100) AFTER cargo,
  ADD COLUMN IF NOT EXISTS senhaHash VARCHAR(255) AFTER setor,
  ADD COLUMN IF NOT EXISTS ativo TINYINT DEFAULT 0 NOT NULL AFTER role,
  ADD COLUMN IF NOT EXISTS liberadoPor VARCHAR(64) AFTER ativo,
  ADD COLUMN IF NOT EXISTS liberadoEm TIMESTAMP NULL AFTER liberadoPor;

-- Modificar campos existentes
ALTER TABLE users
  MODIFY COLUMN email VARCHAR(320) NOT NULL,
  MODIFY COLUMN role ENUM('admin', 'visualizador') DEFAULT 'visualizador' NOT NULL;

-- Remover campos antigos (se existirem)
ALTER TABLE users
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS loginMethod;

-- Adicionar índices
ALTER TABLE users
  ADD UNIQUE KEY IF NOT EXISTS idx_email (email),
  ADD KEY IF NOT EXISTS idx_ativo (ativo),
  ADD KEY IF NOT EXISTS idx_role (role);

-- ============================================================================
-- 3. VERIFICAÇÃO
-- ============================================================================

-- Verificar estrutura da tabela users
DESCRIBE users;

-- Verificar novas tabelas
SHOW TABLES LIKE '%user%';
SHOW TABLES LIKE '%password%';
SHOW TABLES LIKE '%login%';
SHOW TABLES LIKE '%email%';
