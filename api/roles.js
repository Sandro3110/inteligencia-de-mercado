import postgres from 'postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'Database não configurado' });
  }

  const client = postgres(connectionString);

  try {
    const roles = await client`
      SELECT id, nome, descricao
      FROM public.roles
      ORDER BY id
    `;

    res.json({ success: true, roles });

  } catch (error) {
    console.error('Erro ao buscar roles:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}
