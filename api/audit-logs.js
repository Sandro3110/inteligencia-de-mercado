// api/audit-logs.js - Consultar logs de auditoria
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
    const { userId, action, resultado, limite = '50', offset = '0' } = req.query;

    // Construir query dinamicamente
    let whereConditions = [];
    let params = [];

    if (userId) {
      whereConditions.push(`user_id = '${userId}'`);
    }

    if (action) {
      whereConditions.push(`action = '${action}'`);
    }

    if (resultado) {
      whereConditions.push(`resultado = '${resultado}'`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Buscar logs
    const logs = await client.unsafe(`
      SELECT 
        id, user_id, action, endpoint, metodo,
        parametros, resultado, erro,
        ip_address, user_agent,
        duracao_ms, custo, created_at
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limite)}
      OFFSET ${parseInt(offset)}
    `);

    // Contar total
    const [{ total }] = await client.unsafe(`
      SELECT COUNT(*)::INTEGER as total
      FROM audit_logs
      ${whereClause}
    `);

    // Estatísticas
    const [stats] = await client.unsafe(`
      SELECT
        COUNT(*)::INTEGER as total_logs,
        SUM(CASE WHEN resultado = 'sucesso' THEN 1 ELSE 0 END)::INTEGER as sucessos,
        SUM(CASE WHEN resultado = 'erro' THEN 1 ELSE 0 END)::INTEGER as erros,
        SUM(CASE WHEN resultado = 'bloqueado' THEN 1 ELSE 0 END)::INTEGER as bloqueados,
        AVG(duracao_ms)::INTEGER as duracao_media,
        SUM(custo)::NUMERIC as custo_total
      FROM audit_logs
      ${whereClause}
    `);

    await client.end();

    return res.json({
      success: true,
      logs,
      pagination: {
        total,
        limite: parseInt(limite),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + logs.length < total
      },
      stats
    });

  } catch (error) {
    console.error('[Audit Logs] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
