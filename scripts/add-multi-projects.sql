-- Criar tabela projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int AUTO_INCREMENT NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `cor` varchar(7) DEFAULT '#3b82f6',
  `ativo` int DEFAULT 1 NOT NULL,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

-- Inserir projeto "Embalagens"
INSERT INTO `projects` (`nome`, `descricao`, `cor`, `ativo`)
VALUES ('Embalagens', 'Projeto de pesquisa de mercado para o setor de embalagens', '#10b981', 1);

-- Adicionar coluna projectId nas tabelas (se não existir)
ALTER TABLE `mercados_unicos` ADD COLUMN IF NOT EXISTS `projectId` int NOT NULL DEFAULT 1;
ALTER TABLE `clientes` ADD COLUMN IF NOT EXISTS `projectId` int NOT NULL DEFAULT 1;
ALTER TABLE `concorrentes` ADD COLUMN IF NOT EXISTS `projectId` int NOT NULL DEFAULT 1;
ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `projectId` int NOT NULL DEFAULT 1;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS `idx_mercados_projectId` ON `mercados_unicos`(`projectId`);
CREATE INDEX IF NOT EXISTS `idx_clientes_projectId` ON `clientes`(`projectId`);
CREATE INDEX IF NOT EXISTS `idx_concorrentes_projectId` ON `concorrentes`(`projectId`);
CREATE INDEX IF NOT EXISTS `idx_leads_projectId` ON `leads`(`projectId`);
