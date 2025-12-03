// Endpoint temporário para migração - Tabela de Cache
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
    // Criar tabela de cache
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS ia_cache (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        dados JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        hits INTEGER DEFAULT 0,
        last_hit_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_ia_cache_key ON ia_cache(cache_key);
      CREATE INDEX IF NOT EXISTS idx_ia_cache_expires ON ia_cache(expires_at);
      CREATE INDEX IF NOT EXISTS idx_ia_cache_tipo ON ia_cache(tipo);
    `);

    // Adicionar campos em dim_entidade
    try {
      await client`ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS cache_hit BOOLEAN DEFAULT false`;
      await client`ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS cache_expires_at TIMESTAMP`;
    } catch (e) {
      console.log('Colunas já existem:', e.message);
    }

    // Verificar estrutura
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'ia_cache'
    `;

    await client.end();

    return res.json({
      success: true,
      message: 'Tabela ia_cache criada com sucesso',
      tableExists: tables.length > 0
    });

  } catch (error) {
    console.error('[Migrate Cache] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
