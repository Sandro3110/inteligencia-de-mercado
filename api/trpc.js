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
    
    // Parse body para mutations (POST)
    let input = null;
    if (req.method === 'POST') {
      // Vercel já faz parse automático do body
      let body = req.body || {};
      
      // tRPC client pode enviar em formato batch: {"0": {data}}
      if (body['0']) {
        input = body['0'];
        console.log('[tRPC] Batch format detected, using body[0]');
      } else {
        input = body;
      }
      
      console.log('[tRPC] POST body:', JSON.stringify(input));
    }
    
    console.log(`[tRPC] ${req.method} ${router}.${procedure}`, input ? '(with input)' : '');

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
        // Parse query params
        const url = new URL(req.url, 'https://dummy.com');
        const inputParam = url.searchParams.get('input');
        let queryInput = {};
        
        if (inputParam) {
          try {
            queryInput = JSON.parse(inputParam);
          } catch (e) {
            console.log('[tRPC] Failed to parse input param:', e);
          }
        }
        
        const { page = 1, limit = 20, busca, status, orderBy = 'created_at', orderDirection = 'desc' } = queryInput;
        const offset = (page - 1) * limit;
        
        // Build WHERE clause
        let whereClause = 'deleted_at IS NULL';
        const params = [];
        
        if (status) {
          whereClause += ' AND status = $' + (params.length + 1);
          params.push(status);
        }
        
        if (busca) {
          whereClause += ' AND (nome ILIKE $' + (params.length + 1) + ' OR codigo ILIKE $' + (params.length + 2) + ')';
          params.push(`%${busca}%`, `%${busca}%`);
        }
        
        // Build ORDER BY
        const validOrderBy = ['created_at', 'updated_at', 'nome', 'codigo'];
        const orderByColumn = validOrderBy.includes(orderBy) ? orderBy : 'created_at';
        const orderDir = orderDirection === 'asc' ? 'ASC' : 'DESC';
        
        // Execute query
        const query = `
          SELECT * FROM dim_projeto 
          WHERE ${whereClause}
          ORDER BY ${orderByColumn} ${orderDir}
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        
        params.push(limit, offset);
        
        const result = await client.unsafe(query, params);
        
        // Contar total de registros
        const countQuery = `
          SELECT COUNT(*) as total FROM dim_projeto 
          WHERE ${whereClause}
        `;
        const countResult = await client.unsafe(countQuery, params.slice(0, -2)); // Remove limit e offset
        const total = parseInt(countResult[0]?.total || '0');
        
        // Retornar no formato esperado pelo frontend
        data = {
          projetos: result,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      } else if (procedure === 'create') {
        // Criar novo projeto
        if (!input) {
          throw new Error('Input obrigatório para criar projeto');
        }

        const { nome, codigo, descricao, centroCusto } = input;

        if (!nome) {
          throw new Error('Nome do projeto é obrigatório');
        }

        // Inserir projeto (owner_id=1 = usuário sistema)
        const [projeto] = await client`
          INSERT INTO dim_projeto (
            nome, 
            codigo, 
            descricao, 
            centro_custo,
            status,
            owner_id,
            created_by
          ) VALUES (
            ${nome},
            ${codigo || null},
            ${descricao || null},
            ${centroCusto || null},
            'ativo',
            1,
            1
          )
          RETURNING *
        `;

        data = projeto;
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
