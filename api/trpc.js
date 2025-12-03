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

    // IA SETUP
    if (router === 'ia' && procedure === 'setup') {
      const { secret } = input || {};
      
      if (secret !== 'setup-intelmarket-2025') {
        return res.status(403).json({
          error: { message: 'Acesso negado', code: 'FORBIDDEN' }
        });
      }

      // 1. Criar tabela de configuração
      await client`
        CREATE TABLE IF NOT EXISTS public.ia_config (
          id SERIAL PRIMARY KEY,
          plataforma VARCHAR(50) NOT NULL DEFAULT 'openai',
          modelo VARCHAR(100) NOT NULL DEFAULT 'gpt-4o-mini',
          budget_mensal DECIMAL(10, 2) DEFAULT 150.00,
          ativo BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 2. Inserir configuração padrão
      await client`
        INSERT INTO public.ia_config (plataforma, modelo, budget_mensal)
        VALUES ('openai', 'gpt-4o-mini', 150.00)
        ON CONFLICT DO NOTHING
      `;

      // 3. Criar tabela de uso
      await client`
        CREATE TABLE IF NOT EXISTS public.ia_usage (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          processo VARCHAR(100) NOT NULL,
          plataforma VARCHAR(50) NOT NULL,
          modelo VARCHAR(100) NOT NULL,
          input_tokens INTEGER NOT NULL,
          output_tokens INTEGER NOT NULL,
          total_tokens INTEGER NOT NULL,
          custo DECIMAL(10, 6) NOT NULL,
          duracao_ms INTEGER NOT NULL,
          entidade_id INTEGER,
          projeto_id INTEGER,
          sucesso BOOLEAN DEFAULT TRUE,
          erro TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 4. Criar índices
      await client`CREATE INDEX IF NOT EXISTS idx_ia_usage_user ON public.ia_usage(user_id)`;
      await client`CREATE INDEX IF NOT EXISTS idx_ia_usage_processo ON public.ia_usage(processo)`;
      await client`CREATE INDEX IF NOT EXISTS idx_ia_usage_created ON public.ia_usage(created_at DESC)`;

      return res.json({
        result: {
          data: {
            success: true,
            message: 'Setup de IA concluído!',
          }
        }
      });
    }

    // AUTH SETUP
    if (router === 'auth' && procedure === 'setup') {
      const { secret } = input || {};
      
      if (secret !== 'setup-intelmarket-2025') {
        return res.status(403).json({
          error: { message: 'Acesso negado', code: 'FORBIDDEN' }
        });
      }

      const bcrypt = await import('bcryptjs');
      const { randomUUID } = await import('crypto');

      // 1. Criar tabela de roles
      await client`
        CREATE TABLE IF NOT EXISTS public.roles (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(50) UNIQUE NOT NULL,
          descricao TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // 2. Inserir roles
      await client`
        INSERT INTO public.roles (nome, descricao) VALUES
          ('administrador', 'Administrador com acesso total'),
          ('gerente', 'Gerente com acesso a projetos'),
          ('analista', 'Analista com acesso a dados'),
          ('visualizador', 'Visualizador somente leitura')
        ON CONFLICT (nome) DO NOTHING
      `;

      // 3. Criar tabela de usuários
      await client`
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id VARCHAR(255) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          senha_hash TEXT NOT NULL,
          role_id INTEGER NOT NULL REFERENCES public.roles(id) DEFAULT 4,
          ativo BOOLEAN DEFAULT TRUE,
          ultimo_acesso TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // 4. Criar índices
      await client`CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email)`;
      await client`CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role_id)`;

      // 5. Buscar ID do role administrador
      const [adminRole] = await client`SELECT id FROM public.roles WHERE nome = 'administrador'`;
      const adminRoleId = adminRole.id;

      // 6. Criar usuários administradores
      const user1Id = randomUUID();
      const user1Hash = await bcrypt.default.hash('Ss311000!', 10);

      await client`
        INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
        VALUES (${user1Id}, 'Sandro Direto', 'sandrodireto@gmail.com', ${user1Hash}, ${adminRoleId})
        ON CONFLICT (email) DO UPDATE SET senha_hash = ${user1Hash}, role_id = ${adminRoleId}
      `;

      const user2Id = randomUUID();
      const user2Hash = await bcrypt.default.hash('123456!', 10);

      await client`
        INSERT INTO public.user_profiles (id, nome, email, senha_hash, role_id)
        VALUES (${user2Id}, 'CM Busso', 'cmbusso@gmail.com', ${user2Hash}, ${adminRoleId})
        ON CONFLICT (email) DO UPDATE SET senha_hash = ${user2Hash}, role_id = ${adminRoleId}
      `;

      // 7. Estatísticas
      const [stats] = await client`
        SELECT 
          (SELECT COUNT(*) FROM public.roles) AS total_roles,
          (SELECT COUNT(*) FROM public.user_profiles) AS total_users
      `;

      return res.status(200).json({
        result: {
          data: {
            success: true,
            message: 'Setup de autenticação concluído!',
            stats: {
              roles: parseInt(stats.total_roles),
              users: parseInt(stats.total_users),
            },
            usuarios_criados: [
              { email: 'sandrodireto@gmail.com', senha: 'Ss311000!', papel: 'Administrador' },
              { email: 'cmbusso@gmail.com', senha: '123456!', papel: 'Administrador' },
            ],
          }
        }
      });
    }

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
        const { busca, tipo, limit = 100, offset = 0 } = input || {};
        
        console.log('[entidades.list] Input recebido:', { busca, tipo, limit, offset });
        
        let whereConditions = [];
        let params = [];
        
        // Filtro de busca
        if (busca) {
          whereConditions.push(`(
            nome ILIKE '%' || $${params.length + 1} || '%' OR 
            cnpj ILIKE '%' || $${params.length + 1} || '%' OR 
            email ILIKE '%' || $${params.length + 1} || '%'
          )`);
          params.push(busca);
        }
        
        // Filtro de tipo
        if (tipo) {
          whereConditions.push(`tipo_entidade = $${params.length + 1}`);
          params.push(tipo);
        }
        
        const whereClause = whereConditions.length > 0 
          ? 'WHERE ' + whereConditions.join(' AND ')
          : '';
        
        const query = `
          SELECT * FROM dim_entidade 
          ${whereClause}
          ORDER BY created_at DESC 
          LIMIT $${params.length + 1} 
          OFFSET $${params.length + 2}
        `;
        
        params.push(limit, offset);
        
        console.log('[entidades.list] Query:', query);
        console.log('[entidades.list] Params:', params);
        
        const result = await client.unsafe(query, params);
        
        console.log('[entidades.list] Resultado:', result.length, 'registros');
        
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

        // Contar clientes
        const [{ count: totalClientes }] = await client`
          SELECT COUNT(*)::int as count FROM dim_entidade WHERE tipo_entidade = 'cliente'
        `;

        // Contar leads
        const [{ count: totalLeads }] = await client`
          SELECT COUNT(*)::int as count FROM dim_entidade WHERE tipo_entidade = 'lead'
        `;

        // Contar concorrentes
        const [{ count: totalConcorrentes }] = await client`
          SELECT COUNT(*)::int as count FROM dim_entidade WHERE tipo_entidade = 'concorrente'
        `;

        // Contar produtos
        const [{ count: totalProdutos }] = await client`
          SELECT COUNT(*)::int as count FROM dim_produto
        `;

        // Contar mercados
        const [{ count: totalMercados }] = await client`
          SELECT COUNT(*)::int as count FROM dim_mercado
        `;

        data = {
          kpis: {
            totalProjetos: totalProjetos || 0,
            totalPesquisas: totalPesquisas || 0,
            totalEntidades: totalEntidades || 0,
            totalClientes: totalClientes || 0,
            totalLeads: totalLeads || 0,
            totalConcorrentes: totalConcorrentes || 0,
            totalProdutos: totalProdutos || 0,
            totalMercados: totalMercados || 0,
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
