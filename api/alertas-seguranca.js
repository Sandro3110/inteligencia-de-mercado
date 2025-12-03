// api/alertas-seguranca.js - Consultar e resolver alertas
import postgres from 'postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    // GET - Listar alertas
    if (req.method === 'GET') {
      const { resolvido = 'false', severidade, limite = '50' } = req.query;

      let whereConditions = [];

      if (resolvido === 'false') {
        whereConditions.push('resolvido = false');
      }

      if (severidade) {
        whereConditions.push(`severidade = '${severidade}'`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const alertas = await client.unsafe(`
        SELECT 
          id, user_id, tipo, descricao, severidade,
          resolvido, created_at
        FROM alertas_seguranca
        ${whereClause}
        ORDER BY 
          CASE severidade
            WHEN 'critica' THEN 1
            WHEN 'alta' THEN 2
            WHEN 'media' THEN 3
            WHEN 'baixa' THEN 4
          END,
          created_at DESC
        LIMIT ${parseInt(limite)}
      `);

      // Estatísticas
      const [stats] = await client`
        SELECT
          COUNT(*)::INTEGER as total,
          SUM(CASE WHEN resolvido = false THEN 1 ELSE 0 END)::INTEGER as ativos,
          SUM(CASE WHEN severidade = 'critica' AND resolvido = false THEN 1 ELSE 0 END)::INTEGER as criticos,
          SUM(CASE WHEN severidade = 'alta' AND resolvido = false THEN 1 ELSE 0 END)::INTEGER as altos,
          SUM(CASE WHEN severidade = 'media' AND resolvido = false THEN 1 ELSE 0 END)::INTEGER as medios,
          SUM(CASE WHEN severidade = 'baixa' AND resolvido = false THEN 1 ELSE 0 END)::INTEGER as baixos
        FROM alertas_seguranca
      `;

      await client.end();

      return res.json({
        success: true,
        alertas,
        stats
      });
    }

    // POST - Resolver alerta
    if (req.method === 'POST') {
      const { alertaId } = req.body;

      if (!alertaId) {
        return res.status(400).json({ error: 'alertaId é obrigatório' });
      }

      await client`
        UPDATE alertas_seguranca
        SET resolvido = true
        WHERE id = ${alertaId}
      `;

      await client.end();

      return res.json({
        success: true,
        message: 'Alerta resolvido'
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('[Alertas] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
