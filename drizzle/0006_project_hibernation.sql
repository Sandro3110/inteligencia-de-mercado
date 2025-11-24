-- Fase 57: Sistema de Hibernação de Projetos
-- Adiciona coluna status para permitir adormecer projetos

ALTER TABLE `projects` 
ADD COLUMN `status` ENUM('active', 'hibernated') NOT NULL DEFAULT 'active' 
AFTER `ativo`;
