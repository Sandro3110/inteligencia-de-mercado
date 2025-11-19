-- Tabela para gerenciar fila de enriquecimento
CREATE TABLE IF NOT EXISTS enrichment_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'error') DEFAULT 'pending',
  priority INT DEFAULT 0,
  clienteData JSON NOT NULL,
  result JSON,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  startedAt TIMESTAMP NULL,
  completedAt TIMESTAMP NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_queue_status (status),
  INDEX idx_queue_project (projectId),
  INDEX idx_queue_priority (priority DESC)
);

-- Adicionar campo executionMode na tabela projects
ALTER TABLE projects 
ADD COLUMN executionMode ENUM('parallel', 'sequential') DEFAULT 'sequential';

-- Adicionar campo maxParallelJobs na tabela projects  
ALTER TABLE projects
ADD COLUMN maxParallelJobs INT DEFAULT 3;
