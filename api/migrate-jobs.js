// Endpoint temporário para migração - Tabela de Jobs
import postgres from 'postgres';
import fs from 'fs';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    // Ler e executar SQL
    const sql = `
      CREATE TABLE IF NOT EXISTS ia_jobs (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        entidade_id INTEGER NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        progresso INTEGER DEFAULT 0,
        etapa_atual VARCHAR(50),
        etapas_completas TEXT,
        dados_parciais TEXT,
        tempo_inicio TIMESTAMP DEFAULT NOW(),
        tempo_fim TIMESTAMP,
        duracao_ms INTEGER,
        custo DECIMAL(10, 6),
        erro TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_ia_jobs_user_id ON ia_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_ia_jobs_entidade_id ON ia_jobs(entidade_id);
      CREATE INDEX IF NOT EXISTS idx_ia_jobs_status ON ia_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_ia_jobs_created_at ON ia_jobs(created_at);
    `;

    await client.unsafe(sql);

    // Verificar estrutura
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'ia_jobs'
    `;

    await client.end();

    return res.json({
      success: true,
      message: 'Tabela ia_jobs criada com sucesso',
      tableExists: tables.length > 0
    });

  } catch (error) {
    console.error('[Migrate Jobs] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
