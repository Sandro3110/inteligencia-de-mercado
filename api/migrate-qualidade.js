// Endpoint temporário para migração - Campos de Qualidade
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
    // Adicionar campos de qualidade
    await client.unsafe(`
      ALTER TABLE dim_entidade
      ADD COLUMN IF NOT EXISTS score_qualidade_dados INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS validacao_cnpj BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS validacao_email BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS validacao_telefone BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS campos_faltantes TEXT,
      ADD COLUMN IF NOT EXISTS ultima_validacao TIMESTAMP;
    `);

    // Criar índices
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_score_qualidade_dados ON dim_entidade(score_qualidade_dados);
      CREATE INDEX IF NOT EXISTS idx_validacao_cnpj ON dim_entidade(validacao_cnpj);
    `);

    // Criar função de trigger
    await client.unsafe(`
      CREATE OR REPLACE FUNCTION atualizar_score_qualidade()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.score_qualidade_dados := (
          CASE WHEN NEW.nome IS NOT NULL THEN 10 ELSE 0 END +
          CASE WHEN NEW.cnpj IS NOT NULL AND NEW.validacao_cnpj = true THEN 15 ELSE 0 END +
          CASE WHEN NEW.email IS NOT NULL AND NEW.validacao_email = true THEN 10 ELSE 0 END +
          CASE WHEN NEW.telefone IS NOT NULL AND NEW.validacao_telefone = true THEN 10 ELSE 0 END +
          CASE WHEN NEW.site IS NOT NULL THEN 10 ELSE 0 END +
          CASE WHEN NEW.cidade IS NOT NULL THEN 5 ELSE 0 END +
          CASE WHEN NEW.uf IS NOT NULL THEN 5 ELSE 0 END +
          CASE WHEN NEW.porte IS NOT NULL THEN 5 ELSE 0 END +
          CASE WHEN NEW.setor IS NOT NULL THEN 10 ELSE 0 END +
          CASE WHEN NEW.produto_principal IS NOT NULL THEN 10 ELSE 0 END +
          CASE WHEN NEW.segmentacao_b2b_b2c IS NOT NULL THEN 5 ELSE 0 END +
          CASE WHEN NEW.enriquecido_em IS NOT NULL THEN 5 ELSE 0 END
        );
        
        NEW.ultima_validacao := NOW();
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Criar trigger
    await client.unsafe(`
      DROP TRIGGER IF EXISTS trigger_score_qualidade ON dim_entidade;
      
      CREATE TRIGGER trigger_score_qualidade
      BEFORE INSERT OR UPDATE ON dim_entidade
      FOR EACH ROW
      EXECUTE FUNCTION atualizar_score_qualidade();
    `);

    await client.end();

    return res.json({
      success: true,
      message: 'Campos de qualidade e trigger criados com sucesso'
    });

  } catch (error) {
    console.error('[Migrate Qualidade] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
