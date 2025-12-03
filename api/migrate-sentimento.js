// Endpoint temporário para migração - Análise de Sentimento
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
    const results = [];

    // 1. Adicionar sentimento
    try {
      await client`ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS sentimento VARCHAR(50)`;
      results.push({ campo: 'sentimento', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'sentimento', status: 'já existe', erro: e.message });
    }

    // 2. Adicionar score_atratividade
    try {
      await client`ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS score_atratividade INTEGER`;
      results.push({ campo: 'score_atratividade', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'score_atratividade', status: 'já existe', erro: e.message });
    }

    // 3. Adicionar nivel_saturacao
    try {
      await client`ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS nivel_saturacao VARCHAR(50)`;
      results.push({ campo: 'nivel_saturacao', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'nivel_saturacao', status: 'já existe', erro: e.message });
    }

    // 4. Adicionar oportunidades
    try {
      await client`ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS oportunidades TEXT`;
      results.push({ campo: 'oportunidades', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'oportunidades', status: 'já existe', erro: e.message });
    }

    // 5. Adicionar riscos
    try {
      await client`ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS riscos TEXT`;
      results.push({ campo: 'riscos', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'riscos', status: 'já existe', erro: e.message });
    }

    // 6. Adicionar recomendacao_estrategica
    try {
      await client`ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS recomendacao_estrategica TEXT`;
      results.push({ campo: 'recomendacao_estrategica', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'recomendacao_estrategica', status: 'já existe', erro: e.message });
    }

    // Verificar estrutura
    const columns = await client`
      SELECT 
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'dim_mercado'
      ORDER BY ordinal_position
    `;

    await client.end();

    return res.json({
      success: true,
      message: 'Migração de sentimento executada',
      results,
      columns: columns.map(c => ({
        nome: c.column_name,
        tipo: c.data_type,
        tamanho: c.character_maximum_length
      }))
    });

  } catch (error) {
    console.error('[Migrate Sentimento] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
