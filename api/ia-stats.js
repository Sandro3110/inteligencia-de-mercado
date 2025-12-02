// api/ia-stats.js
import postgres from 'postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    // 1. Configuração atual
    const [config] = await client`
      SELECT * FROM ia_config WHERE ativo = TRUE LIMIT 1
    `;

    // 2. Uso do mês atual
    const [usoMensal] = await client`
      SELECT
        COUNT(*)::INTEGER as total_chamadas,
        SUM(total_tokens)::INTEGER as total_tokens,
        SUM(custo)::NUMERIC as custo_total
      FROM ia_usage
      WHERE sucesso = TRUE
        AND created_at >= DATE_TRUNC('month', NOW())
    `;

    // 3. Uso por dia (últimos 30 dias)
    const usoPorDia = await client`
      SELECT
        DATE(created_at) as data,
        COUNT(*)::INTEGER as chamadas,
        SUM(total_tokens)::INTEGER as tokens,
        SUM(custo)::NUMERIC as custo
      FROM ia_usage
      WHERE sucesso = TRUE
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY data DESC
    `;

    // 4. Uso por mês (últimos 12 meses)
    const usoPorMes = await client`
      SELECT
        DATE_TRUNC('month', created_at) as mes,
        COUNT(*)::INTEGER as chamadas,
        SUM(total_tokens)::INTEGER as tokens,
        SUM(custo)::NUMERIC as custo
      FROM ia_usage
      WHERE sucesso = TRUE
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY mes DESC
    `;

    // 5. Uso por usuário (mês atual)
    const usoPorUsuario = await client`
      SELECT
        u.user_id,
        up.nome as usuario_nome,
        up.email as usuario_email,
        COUNT(*)::INTEGER as chamadas,
        SUM(u.total_tokens)::INTEGER as tokens,
        SUM(u.custo)::NUMERIC as custo
      FROM ia_usage u
      LEFT JOIN user_profiles up ON u.user_id = up.id
      WHERE u.sucesso = TRUE
        AND u.created_at >= DATE_TRUNC('month', NOW())
      GROUP BY u.user_id, up.nome, up.email
      ORDER BY custo DESC
      LIMIT 20
    `;

    // 6. Uso por processo (mês atual)
    const usoPorProcesso = await client`
      SELECT
        processo,
        COUNT(*)::INTEGER as chamadas,
        SUM(total_tokens)::INTEGER as tokens,
        SUM(custo)::NUMERIC as custo,
        AVG(duracao_ms)::INTEGER as duracao_media
      FROM ia_usage
      WHERE sucesso = TRUE
        AND created_at >= DATE_TRUNC('month', NOW())
      GROUP BY processo
      ORDER BY custo DESC
    `;

    // 7. Atividades recentes (últimas 50)
    const atividadesRecentes = await client`
      SELECT
        u.id,
        u.processo,
        u.user_id,
        up.nome as usuario_nome,
        u.total_tokens as tokens,
        u.custo,
        u.duracao_ms as duracao,
        u.sucesso,
        u.erro,
        u.created_at
      FROM ia_usage u
      LEFT JOIN user_profiles up ON u.user_id = up.id
      ORDER BY u.created_at DESC
      LIMIT 50
    `;

    // 8. Calcular percentual do budget
    const budgetMensal = parseFloat(config?.budget_mensal || 150);
    const custoTotal = parseFloat(usoMensal?.custo_total || 0);
    const percentualUsado = budgetMensal > 0 ? (custoTotal / budgetMensal) * 100 : 0;

    await client.end();

    return res.json({
      success: true,
      data: {
        config: {
          plataforma: config?.plataforma || 'openai',
          modelo: config?.modelo || 'gpt-4o-mini',
          budgetMensal,
        },
        resumoMensal: {
          totalChamadas: usoMensal?.total_chamadas || 0,
          totalTokens: usoMensal?.total_tokens || 0,
          custoTotal,
          budgetMensal,
          percentualUsado: Math.round(percentualUsado * 100) / 100,
        },
        usoPorDia,
        usoPorMes,
        usoPorUsuario,
        usoPorProcesso,
        atividadesRecentes,
      },
    });
  } catch (error) {
    console.error('[IA Stats] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
