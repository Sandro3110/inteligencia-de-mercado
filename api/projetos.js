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

  const client = postgres(process.env.DATABASE_URL);

  try {
    const projetos = await client`
      SELECT 
        id, 
        codigo, 
        nome, 
        descricao, 
        status, 
        centro_custo, 
        created_at
      FROM dim_projeto
      WHERE status = 'ativo'
      ORDER BY created_at DESC
    `;

    await client.end();

    return res.json({
      success: true,
      projetos: projetos || [],
      total: projetos?.length || 0
    });
  } catch (error) {
    console.error('[API Projetos] Erro:', error);
    
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
