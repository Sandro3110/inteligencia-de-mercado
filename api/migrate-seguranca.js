// Endpoint temporário para migração - Tabelas de Segurança
import postgres from 'postgres';

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
    // 1. Tabela de rate limiting
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        chamadas INTEGER DEFAULT 0,
        janela_inicio TIMESTAMP DEFAULT NOW(),
        bloqueado_ate TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, endpoint)
      );
      
      CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limits(user_id, endpoint);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_bloqueado ON rate_limits(bloqueado_ate);
    `);

    // 2. Tabela de auditoria
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        acao VARCHAR(100) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        metodo VARCHAR(10) NOT NULL,
        parametros JSONB,
        resultado VARCHAR(50),
        erro TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        duracao_ms INTEGER,
        custo DECIMAL(10, 6),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_acao ON audit_logs(acao);
      CREATE INDEX IF NOT EXISTS idx_audit_resultado ON audit_logs(resultado);
    `);

    // 3. Tabela de usuários bloqueados
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS usuarios_bloqueados (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        motivo TEXT NOT NULL,
        bloqueado_em TIMESTAMP DEFAULT NOW(),
        bloqueado_ate TIMESTAMP NOT NULL,
        bloqueado_por VARCHAR(255)
      );
      
      CREATE INDEX IF NOT EXISTS idx_bloqueados_user ON usuarios_bloqueados(user_id);
      CREATE INDEX IF NOT EXISTS idx_bloqueados_ate ON usuarios_bloqueados(bloqueado_ate);
    `);

    // 4. Tabela de alertas de segurança
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS alertas_seguranca (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        tipo VARCHAR(50) NOT NULL,
        descricao TEXT NOT NULL,
        severidade VARCHAR(20) NOT NULL,
        resolvido BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_alertas_user ON alertas_seguranca(user_id);
      CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_seguranca(tipo);
      CREATE INDEX IF NOT EXISTS idx_alertas_severidade ON alertas_seguranca(severidade);
      CREATE INDEX IF NOT EXISTS idx_alertas_resolvido ON alertas_seguranca(resolvido);
    `);

    // Verificar estrutura
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('rate_limits', 'audit_logs', 'usuarios_bloqueados', 'alertas_seguranca')
    `;

    await client.end();

    return res.json({
      success: true,
      message: 'Tabelas de segurança criadas com sucesso',
      tabelas: tables.map(t => t.table_name)
    });

  } catch (error) {
    console.error('[Migrate Segurança] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
