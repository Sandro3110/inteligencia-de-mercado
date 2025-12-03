// Endpoint temporário para executar migração
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

    // 1. Adicionar funcionalidades
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS funcionalidades TEXT`;
      results.push({ campo: 'funcionalidades', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'funcionalidades', status: 'já existe', erro: e.message });
    }

    // 2. Adicionar publico_alvo
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS publico_alvo VARCHAR(500)`;
      results.push({ campo: 'publico_alvo', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'publico_alvo', status: 'já existe', erro: e.message });
    }

    // 3. Adicionar diferenciais
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS diferenciais TEXT`;
      results.push({ campo: 'diferenciais', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'diferenciais', status: 'já existe', erro: e.message });
    }

    // 4. Adicionar tecnologias
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS tecnologias VARCHAR(500)`;
      results.push({ campo: 'tecnologias', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'tecnologias', status: 'já existe', erro: e.message });
    }

    // 5. Adicionar precificacao
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS precificacao VARCHAR(500)`;
      results.push({ campo: 'precificacao', status: 'adicionado' });
    } catch (e) {
      results.push({ campo: 'precificacao', status: 'já existe', erro: e.message });
    }

    // Verificar estrutura
    const columns = await client`
      SELECT 
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'dim_produto'
      ORDER BY ordinal_position
    `;

    await client.end();

    return res.json({
      success: true,
      message: 'Migração executada',
      results,
      columns: columns.map(c => ({
        nome: c.column_name,
        tipo: c.data_type,
        tamanho: c.character_maximum_length
      }))
    });

  } catch (error) {
    console.error('[Migrate] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
