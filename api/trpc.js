/**
 * Vercel Serverless Function - tRPC Handler
 * Conecta ao banco Supabase e retorna dados reais usando SQL puro
 */

import postgres from 'postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let client = null;

  try {
    // Conectar ao banco
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada');
    }

    client = postgres(connectionString);

    // Extrair path e input da URL
    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathParts = url.pathname.replace('/api/trpc/', '').split('.');
    const router = pathParts[0];
    const procedure = pathParts[1];
    
    console.log(`[tRPC] ${router}.${procedure}`);

    let data = null;

    // PROJETOS
    if (router === 'projetos') {
      if (procedure === 'listAtivos') {
        const result = await client`
          SELECT * FROM dim_projeto 
          WHERE status = 'ativo' 
          AND deleted_at IS NULL
          LIMIT 100
        `;
        data = result;
      } else if (procedure === 'list') {
        const result = await client`
          SELECT * FROM dim_projeto 
          WHERE deleted_at IS NULL
          LIMIT 100
        `;
        data = result;
      }
    }

    // PESQUISAS
    else if (router === 'pesquisas') {
      if (procedure === 'listEmProgresso') {
        const result = await client`
          SELECT * FROM dim_pesquisa 
          WHERE status = 'em_progresso'
          AND deleted_at IS NULL
          LIMIT 100
        `;
        data = result;
      } else if (procedure === 'list') {
        const result = await client`
          SELECT * FROM dim_pesquisa 
          WHERE deleted_at IS NULL
          LIMIT 100
        `;
        data = result;
      }
    }

    // ENTIDADES
    else if (router === 'entidades') {
      if (procedure === 'list') {
        const result = await client`
          SELECT * FROM dim_entidade 
          LIMIT 100
        `;
        data = result;
      }
    }

    // DASHBOARD (agregações)
    else if (router === 'dashboard') {
      if (procedure === 'getDashboardData') {
        // Contar projetos ativos
        const [{ count: totalProjetos }] = await client`
          SELECT COUNT(*)::int as count FROM dim_projeto 
          WHERE status = 'ativo' AND deleted_at IS NULL
        `;

        // Contar pesquisas em progresso
        const [{ count: totalPesquisas }] = await client`
          SELECT COUNT(*)::int as count FROM dim_pesquisa 
          WHERE status = 'em_progresso' AND deleted_at IS NULL
        `;

        // Contar entidades
        const [{ count: totalEntidades }] = await client`
          SELECT COUNT(*)::int as count FROM dim_entidade
        `;

        data = {
          kpis: {
            totalProjetos: totalProjetos || 0,
            totalPesquisas: totalPesquisas || 0,
            totalEntidades: totalEntidades || 0,
            totalClientes: 0,
            totalLeads: 0,
            totalConcorrentes: 0,
            receitaPotencial: 0,
            scoreMedioFit: 0,
            taxaConversao: 0,
            crescimentoMensal: 0
          },
          distribuicao: {
            porTipo: [],
            porSegmento: []
          },
          topMercados: [],
          topRegioes: [],
          atividadesRecentes: []
        };
      }
    }

    // Resposta no formato tRPC
    res.status(200).json({
      result: {
        data: data || []
      }
    });

  } catch (error) {
    console.error('Erro no handler tRPC:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
