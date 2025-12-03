// api/rate-limits.js - Consultar rate limits por usuário
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
    // Buscar rate limits ativos
    const rateLimits = await client`
      SELECT 
        user_id,
        endpoint,
        chamadas,
        janela_inicio,
        bloqueado_ate,
        CASE 
          WHEN bloqueado_ate > NOW() THEN true
          ELSE false
        END as bloqueado_ativo
      FROM rate_limits
      WHERE janela_inicio > NOW() - INTERVAL '5 minutes'
      OR bloqueado_ate > NOW()
      ORDER BY chamadas DESC
    `;

    // Estatísticas
    const [stats] = await client`
      SELECT
        COUNT(DISTINCT user_id)::INTEGER as usuarios_ativos,
        SUM(chamadas)::INTEGER as total_chamadas,
        SUM(CASE WHEN bloqueado_ate > NOW() THEN 1 ELSE 0 END)::INTEGER as bloqueios_ativos,
        AVG(chamadas)::INTEGER as media_chamadas
      FROM rate_limits
      WHERE janela_inicio > NOW() - INTERVAL '1 hour'
    `;

    // Usuários próximos do limite (>= 8 chamadas em 60s, limite é 10)
    const proximosLimite = await client`
      SELECT 
        user_id,
        endpoint,
        chamadas,
        (10 - chamadas) as chamadas_restantes
      FROM rate_limits
      WHERE janela_inicio > NOW() - INTERVAL '1 minute'
      AND chamadas >= 8
      AND bloqueado_ate IS NULL
      ORDER BY chamadas DESC
    `;

    await client.end();

    return res.json({
      success: true,
      rateLimits,
      proximosLimite,
      stats
    });

  } catch (error) {
    console.error('[Rate Limits] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
