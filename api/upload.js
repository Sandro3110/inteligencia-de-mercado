/**
 * Vercel Serverless Function - File Upload Handler
 * Processa upload de CSV/Excel e importa entidades
 */

import postgres from 'postgres';
import crypto from 'crypto';

// Configuração do Vercel para aceitar body grande
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client = null;

  try {
    // Conectar ao banco
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada');
    }

    client = postgres(connectionString);

    // Parse do body (Vercel já faz parse automático)
    const { projetoId, pesquisaId, csvData, nomeArquivo } = req.body;

    // Validações
    if (!projetoId || !pesquisaId || !csvData || !nomeArquivo) {
      return res.status(400).json({
        error: 'Campos obrigatórios: projetoId, pesquisaId, csvData, nomeArquivo',
      });
    }

    console.log('[Upload] Iniciando importação:', {
      projetoId,
      pesquisaId,
      nomeArquivo,
      linhas: csvData.length,
    });

    // 1. Criar registro de importação
    const importacao = await client`
      INSERT INTO dim_importacao (
        projeto_id,
        pesquisa_id,
        nome_arquivo,
        tipo_arquivo,
        total_linhas,
        linhas_processadas,
        linhas_sucesso,
        linhas_erro,
        linhas_duplicadas,
        status,
        created_by,
        created_at,
        updated_at
      )
      VALUES (
        ${projetoId},
        ${pesquisaId},
        ${nomeArquivo},
        'csv',
        ${csvData.length},
        0,
        0,
        0,
        0,
        'pendente',
        1,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const importacaoId = importacao[0].id;
    console.log('[Upload] Importação criada:', importacaoId);

    // Atualizar status para processando
    await client`
      UPDATE dim_importacao
      SET status = 'processando', started_at = NOW(), updated_at = NOW()
      WHERE id = ${importacaoId}
    `;

    // 2. Processar cada linha do CSV
    let sucesso = 0;
    let erro = 0;
    let duplicadas = 0;
    const erros = [];

    for (let i = 0; i < csvData.length; i++) {
      const linha = csvData[i];
      const linhaNum = i + 1;

      try {
        // Validar campos obrigatórios
        if (!linha.nome || linha.nome.trim() === '') {
          throw new Error('Campo "nome" é obrigatório');
        }

        // Gerar hash único (MD5 de nome+cnpj)
        const hashInput = `${linha.nome}|${linha.cnpj || ''}`.toLowerCase();
        const entidadeHash = crypto.createHash('md5').update(hashInput).digest('hex');

        // Verificar se já existe
        const existe = await client`
          SELECT id FROM dim_entidade 
          WHERE entidade_hash = ${entidadeHash} 
          AND deleted_at IS NULL
        `;

        if (existe.length > 0) {
          duplicadas++;
          console.log(`[Upload] Linha ${linhaNum}: Duplicada (${linha.nome})`);
          
          // Registrar erro de duplicação
          await client`
            INSERT INTO dim_importacao_erro (
              importacao_id,
              linha,
              dados_linha,
              tipo_erro,
              mensagem_erro,
              created_at
            )
            VALUES (
              ${importacaoId},
              ${linhaNum},
              ${JSON.stringify(linha)},
              'duplicada',
              'Entidade já existe no banco',
              NOW()
            )
          `;
          
          continue;
        }

        // Inserir entidade
        await client`
          INSERT INTO dim_entidade (
            entidade_hash,
            tipo_entidade,
            nome,
            nome_fantasia,
            cnpj,
            email,
            telefone,
            site,
            num_filiais,
            num_lojas,
            num_funcionarios,
            importacao_id,
            origem_tipo,
            origem_arquivo,
            origem_data,
            created_at,
            updated_at
          )
          VALUES (
            ${entidadeHash},
            ${linha.tipo_entidade || 'cliente'},
            ${linha.nome},
            ${linha.nome_fantasia || null},
            ${linha.cnpj || null},
            ${linha.email || null},
            ${linha.telefone || null},
            ${linha.site || null},
            ${parseInt(linha.num_filiais) || 0},
            ${parseInt(linha.num_lojas) || 0},
            ${parseInt(linha.num_funcionarios) || null},
            ${importacaoId},
            'importacao',
            ${nomeArquivo},
            NOW(),
            NOW(),
            NOW()
          )
        `;

        sucesso++;
        console.log(`[Upload] Linha ${linhaNum}: Sucesso (${linha.nome})`);
      } catch (err) {
        erro++;
        console.error(`[Upload] Linha ${linhaNum}: Erro -`, err.message);
        
        erros.push({
          linha: linhaNum,
          erro: err.message,
          dados: linha,
        });

        // Registrar erro no banco
        await client`
          INSERT INTO dim_importacao_erro (
            importacao_id,
            linha,
            dados_linha,
            tipo_erro,
            mensagem_erro,
            created_at
          )
          VALUES (
            ${importacaoId},
            ${linhaNum},
            ${JSON.stringify(linha)},
            'validacao',
            ${err.message},
            NOW()
          )
        `;
      }
    }

    // 3. Atualizar importação com resultado final
    await client`
      UPDATE dim_importacao
      SET
        linhas_processadas = ${csvData.length},
        linhas_sucesso = ${sucesso},
        linhas_erro = ${erro},
        linhas_duplicadas = ${duplicadas},
        status = ${erro > 0 ? 'falhou' : 'concluido'},
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${importacaoId}
    `;

    console.log('[Upload] Importação concluída:', {
      importacaoId,
      sucesso,
      erro,
      duplicadas,
    });

    // 4. Retornar resultado
    return res.status(200).json({
      success: true,
      importacaoId,
      resultado: {
        total: csvData.length,
        sucesso,
        erro,
        duplicadas,
      },
      erros: erros.slice(0, 10), // Retornar apenas os primeiros 10 erros
    });
  } catch (error) {
    console.error('[Upload] Erro fatal:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
