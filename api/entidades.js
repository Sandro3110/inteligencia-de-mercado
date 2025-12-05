const { sql } = require('@vercel/postgres');

/**
 * REST API Endpoint para Entidades Não Enriquecidas
 * GET /api/entidades
 * 
 * Retorna lista de entidades que precisam ser enriquecidas com IA
 */

module.exports = async function handler(req, res) {
  // Permitir apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Este endpoint aceita apenas requisições GET' 
    });
  }

  try {
    // Buscar entidades não enriquecidas
    const { rows } = await sql`
      SELECT 
        id,
        nome,
        cnpj,
        tipo_entidade,
        email,
        telefone,
        site,
        created_at,
        CASE 
          WHEN enriquecido_em IS NOT NULL THEN true 
          ELSE false 
        END as enriquecida
      FROM dim_entidade
      WHERE enriquecido_em IS NULL
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Retornar resultado
    return res.status(200).json({
      success: true,
      count: rows.length,
      entidades: rows,
    });

  } catch (error) {
    console.error('[api/entidades] Erro:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar entidades',
      message: error.message || 'Erro desconhecido',
    });
  }
};
