import postgres from 'postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { projeto_id, projetoId } = req.query;
  const id = projeto_id || projetoId;

  const client = postgres(process.env.DATABASE_URL);

  try {
    let pesquisas;
    
    if (id) {
      pesquisas = await client`
        SELECT 
          id, 
          projeto_id,
          nome, 
          descricao, 
          status, 
          created_at
        FROM dim_pesquisa
        WHERE projeto_id = ${id}
        ORDER BY created_at DESC
      `;
    } else {
      pesquisas = await client`
        SELECT 
          id, 
          projeto_id,
          nome, 
          descricao, 
          status, 
          created_at
        FROM dim_pesquisa
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

    await client.end();

    return res.json({
      success: true,
      pesquisas: pesquisas || [],
      total: pesquisas?.length || 0
    });
  } catch (error) {
    console.error('[API Pesquisas] Erro:', error);
    
    try {
      await client.end();
    } catch (e) {
      // Ignorar erro ao fechar conexão
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
