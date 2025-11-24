-- Tabela para salvar rascunhos de pesquisas em andamento
CREATE TABLE IF NOT EXISTS research_drafts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  projectId INT,
  draftData JSON NOT NULL,
  currentStep INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_project (projectId),
  INDEX idx_updated (updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
