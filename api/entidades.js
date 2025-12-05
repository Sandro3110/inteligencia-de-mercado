/**
 * Vercel Serverless Function - Endpoint /api/entidades
 * 
 * Retorna lista de entidades não enriquecidas para página de enriquecimento IA
 * 
 * Solução pragmática: Mantém arquitetura atual (api/*.js) e adiciona
 * apenas este endpoint TypeScript para resolver bug específico
 */

import postgres from 'postgres';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client = null;

  try {
    // Conectar ao banco
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada');
    }

    client = postgres(connectionString, {
      max: 1, // Serverless: 1 conexão por function
    });

    // Buscar entidades não enriquecidas
    const entidades = await client`
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
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Retornar resultado
    return res.status(200).json({
      success: true,
      count: entidades.length,
      entidades: entidades,
    });

  } catch (error) {
    console.error('[api/entidades] Erro:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar entidades',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });

  } finally {
    // Fechar conexão
    if (client) {
      await client.end();
    }
  }
}
