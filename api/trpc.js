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
        // Parse query params (mesmo padrão de projetos)
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
          whereClause += ' AND nome ILIKE $' + (params.length + 1);
          params.push(`%${busca}%`);
        }
        
        // Build ORDER BY
        const validOrderBy = ['created_at', 'updated_at', 'nome'];
        const orderByColumn = validOrderBy.includes(orderBy) ? orderBy : 'created_at';
        const orderDir = orderDirection === 'asc' ? 'ASC' : 'DESC';
        
        // Execute query
        const query = `
          SELECT * FROM dim_pesquisa 
          WHERE ${whereClause}
          ORDER BY ${orderByColumn} ${orderDir}
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        
        params.push(limit, offset);
        
        const result = await client.unsafe(query, params);
        
        // Contar total
        const countQuery = `
          SELECT COUNT(*) as total FROM dim_pesquisa 
          WHERE ${whereClause}
        `;
        const countResult = await client.unsafe(countQuery, params.slice(0, -2));
        const total = parseInt(countResult[0]?.total || '0');
        
        // Retornar no formato esperado
        data = {
          pesquisas: result,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      } else if (procedure === 'create') {
        // Criar nova pesquisa
        if (!input) {
          throw new Error('Input obrigatório para criar pesquisa');
        }

        const { projetoId, nome, descricao, tipo, limiteResultados } = input;

        if (!nome) {
          throw new Error('Nome da pesquisa é obrigatório');
        }
        
        // Construir objetivo a partir de tipo e limite
        const objetivoParts = [];
        if (tipo) {
          objetivoParts.push(`Tipo: ${tipo}`);
        }
        if (limiteResultados) {
          objetivoParts.push(`Limite: ${limiteResultados} resultados`);
        }
        const objetivo = objetivoParts.length > 0 ? objetivoParts.join(' | ') : null;

        // Inserir pesquisa (created_by=1 = usuário sistema)
        const [pesquisa] = await client`
          INSERT INTO dim_pesquisa (
            projeto_id,
            nome,
            descricao,
            objetivo,
            status,
            created_by
          ) VALUES (
            ${projetoId || null},
            ${nome},
            ${descricao || null},
            ${objetivo},
            'pendente',
            1
          )
          RETURNING *
        `;

        data = pesquisa;
      } else if (procedure === 'getById') {
        // Buscar pesquisa por ID
        // Parse query params para GET
        const url = new URL(req.url, 'https://dummy.com');
        const inputParam = url.searchParams.get('input');
        let queryInput = {};
        
        if (inputParam) {
          try {
            queryInput = JSON.parse(inputParam);
            // tRPC client pode enviar em formato batch: {"0": {data}}
            if (queryInput['0']) {
              queryInput = queryInput['0'];
            }
          } catch (e) {
            console.log('[tRPC] Failed to parse input param:', e);
          }
        }
        
        const { id } = queryInput;
        
        if (!id) {
          throw new Error('ID da pesquisa é obrigatório');
        }

        const [pesquisa] = await client`
          SELECT p.*, 
                 proj.nome as projeto_nome,
                 proj.codigo as projeto_codigo
          FROM dim_pesquisa p
          LEFT JOIN dim_projeto proj ON p.projeto_id = proj.id
          WHERE p.id = ${id}
          AND p.deleted_at IS NULL
        `;

        if (!pesquisa) {
          throw new Error('Pesquisa não encontrada');
        }

        data = pesquisa;
      } else if (procedure === 'start') {
        // Iniciar pesquisa
        if (!input || !input.id) {
          throw new Error('ID da pesquisa é obrigatório');
        }

        const { id } = input;

        // Verificar se pesquisa existe e está pendente
        const [pesquisa] = await client`
          SELECT * FROM dim_pesquisa
          WHERE id = ${id}
          AND deleted_at IS NULL
        `;

        if (!pesquisa) {
          throw new Error('Pesquisa não encontrada');
        }

        if (pesquisa.status !== 'pendente') {
          throw new Error(`Pesquisa não pode ser iniciada. Status atual: ${pesquisa.status}`);
        }

        // Atualizar status para em_progresso
        const [updated] = await client`
          UPDATE dim_pesquisa
          SET status = 'em_progresso',
              started_at = NOW(),
              updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

        data = updated;
      } else if (procedure === 'cancel') {
        // Cancelar pesquisa
        if (!input || !input.id) {
          throw new Error('ID da pesquisa é obrigatório');
        }

        const { id } = input;

        // Verificar se pesquisa existe e está em progresso
        const [pesquisa] = await client`
          SELECT * FROM dim_pesquisa
          WHERE id = ${id}
          AND deleted_at IS NULL
        `;

        if (!pesquisa) {
          throw new Error('Pesquisa não encontrada');
        }

        if (pesquisa.status !== 'em_progresso') {
          throw new Error(`Pesquisa não pode ser cancelada. Status atual: ${pesquisa.status}`);
        }

        // Atualizar status para cancelada
        const [updated] = await client`
          UPDATE dim_pesquisa
          SET status = 'cancelada',
              updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

        data = updated;
      } else if (procedure === 'delete') {
        // Deletar pesquisa (soft delete)
        if (!input || !input.id) {
          throw new Error('ID da pesquisa é obrigatório');
        }

        const { id } = input;

        // Verificar se pesquisa existe
        const [pesquisa] = await client`
          SELECT * FROM dim_pesquisa
          WHERE id = ${id}
          AND deleted_at IS NULL
        `;

        if (!pesquisa) {
          throw new Error('Pesquisa não encontrada');
        }

        if (pesquisa.status === 'em_progresso') {
          throw new Error('Não é possível deletar uma pesquisa em progresso. Cancele-a primeiro.');
        }

        // Soft delete
        const [deleted] = await client`
          UPDATE dim_pesquisa
          SET deleted_at = NOW(),
              updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

        data = { success: true, id: deleted.id };
      }
    }

    // IMPORTAÇÕES
    else if (router === 'importacao') {
      if (procedure === 'list') {
        // Buscar todas as importações com JOINs
        const result = await client`
          SELECT 
            i.id,
            i.projeto_id,
            i.pesquisa_id,
            i.nome_arquivo,
            i.tipo_arquivo,
            i.total_linhas,
            i.linhas_processadas,
            i.linhas_sucesso,
            i.linhas_erro,
            i.linhas_duplicadas,
            i.status,
            i.started_at,
            i.completed_at,
            i.duration_seconds,
            i.created_at,
            i.created_by,
            p.nome as projeto_nome,
            ps.nome as pesquisa_nome
          FROM dim_importacao i
          LEFT JOIN dim_projeto p ON i.projeto_id = p.id
          LEFT JOIN dim_pesquisa ps ON i.pesquisa_id = ps.id
          ORDER BY i.created_at DESC
          LIMIT 100
        `;
        
        // Mapear para camelCase
        data = result.map(row => ({
          id: row.id,
          projetoId: row.projeto_id,
          projetoNome: row.projeto_nome,
          pesquisaId: row.pesquisa_id,
          pesquisaNome: row.pesquisa_nome,
          nomeArquivo: row.nome_arquivo,
          tipoArquivo: row.tipo_arquivo,
          totalLinhas: row.total_linhas,
          linhasProcessadas: row.linhas_processadas,
          linhasSucesso: row.linhas_sucesso,
          linhasErro: row.linhas_erro,
          linhasDuplicadas: row.linhas_duplicadas,
          status: row.status,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          durationSeconds: row.duration_seconds,
          createdAt: row.created_at,
          createdBy: row.created_by
        }));
      }
    }

    // IMPORTACAO - GET ERROS
    else if (router === 'importacao' && procedure === 'getErros') {
      const importacaoId = input.importacaoId || input;
      const limit = input.limit || 100;
      
      const result = await client`
        SELECT 
          id,
          importacao_id as "importacaoId",
          linha_numero as "linhaNumero",
          dados_linha as "dadosLinha",
          tipo_erro as "tipoErro",
          mensagem_erro as "mensagemErro",
          created_at as "createdAt"
        FROM importacao_erros
        WHERE importacao_id = ${importacaoId}
        ORDER BY linha_numero ASC
        LIMIT ${limit}
      `;
      
      data = result;
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
    
    // ENTIDADE (singular) - Detalhes
    else if (router === 'entidade') {
      if (procedure === 'detalhes') {
        const id = input.id || input;
        const result = await client`
          SELECT * FROM dim_entidade 
          WHERE id = ${id}
        `;
        data = result[0] || null;
      }
      else if (procedure === 'similares') {
        const id = input.id || input;
        // Buscar entidades similares (mesmo mercado/setor)
        const result = await client`
          SELECT e.* FROM dim_entidade e
          WHERE e.id != ${id}
          AND (e.mercado_id = (SELECT mercado_id FROM dim_entidade WHERE id = ${id})
               OR e.setor = (SELECT setor FROM dim_entidade WHERE id = ${id}))
          LIMIT 10
        `;
        data = result;
      }
      else if (procedure === 'recomendacoes') {
        const id = input.id || input;
        // Retornar recomendações mockadas por enquanto
        data = [
          {
            tipo: 'acao',
            titulo: 'Agendar reuni\u00e3o de apresenta\u00e7\u00e3o',
            descricao: 'Empresa com alto score de fit. Recomendamos contato imediato.',
            prioridade: 'alta'
          },
          {
            tipo: 'insight',
            titulo: 'Oportunidade de cross-sell',
            descricao: 'Empresa j\u00e1 utiliza produtos similares aos nossos.',
            prioridade: 'media'
          }
        ];
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
