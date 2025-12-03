// api/ia-enriquecer.js - FASE 5 Completa
import OpenAI from 'openai';
import postgres from 'postgres';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_COSTS = {
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
  },
};

function calculateCost(model, inputTokens, outputTokens) {
  const costs = MODEL_COSTS[model];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    const { userId, entidadeId, nome, cnpj, cidade, uf } = req.body;

    if (!userId || !entidadeId || !nome) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, entidadeId, nome' });
    }

    const startTime = Date.now();

    // Buscar name do usuário (tentar por ID, depois por email)
    let [user] = await client`SELECT name, email FROM users WHERE id = ${userId}`;
    if (!user) {
      // Fallback: buscar por email se userId for um email
      if (userId.includes('@')) {
        [user] = await client`SELECT name, email FROM users WHERE email = ${userId}`;
      }
    }
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    // Usar email se name for NULL
    const userName = user.name || user.email;

    // ETAPA 1: ENRIQUECER CLIENTE (Temperatura 0.8)
    const promptCliente = `Você é um analista de mercado B2B especializado em empresas brasileiras.

EMPRESA: ${nome}
${cnpj ? `CNPJ: ${cnpj}` : 'CNPJ: Desconhecido'}
${cidade ? `CIDADE/UF: ${cidade}, ${uf}` : ''}

TAREFA: Enriquecer dados da empresa com informações REAIS e VERIFICÁVEIS.

CAMPOS OBRIGATÓRIOS:
1. cnpj: CNPJ no formato XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
2. email: Email corporativo - NULL se não souber
3. telefone: Telefone (XX) XXXXX-XXXX - NULL se não souber
4. site: Site oficial https://... - NULL se não souber
5. cidade: Cidade completa (obrigatório)
6. uf: Estado 2 letras maiúsculas (obrigatório)
7. porte: Micro | Pequena | Média | Grande
8. setor: Setor específico (ex: "Tecnologia - Software")
9. produtoPrincipal: Principal produto/serviço (max 200 chars)
10. segmentacaoB2bB2c: B2B | B2C | B2B2C

REGRAS CRÍTICAS:
- Se NÃO TEM CERTEZA do CNPJ: retorne NULL
- NUNCA invente emails, telefones ou sites
- Cidade e UF são OBRIGATÓRIOS
- Seja conservador e preciso

Retorne APENAS JSON válido:
{
  "cnpj": "string ou null",
  "email": "string ou null",
  "telefone": "string ou null",
  "site": "string ou null",
  "cidade": "string",
  "uf": "string",
  "porte": "string",
  "setor": "string",
  "produtoPrincipal": "string",
  "segmentacaoB2bB2c": "string"
}`;

    const responseCliente = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um analista de mercado B2B. Sempre responda em JSON válido com dados precisos.' },
        { role: 'user', content: promptCliente }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const dadosCliente = JSON.parse(responseCliente.choices[0].message.content || '{}');

    // ETAPA 2: IDENTIFICAR MERCADO (Temperatura 0.9)
    const promptMercado = `Você é um analista de mercado especializado em inteligência competitiva do Brasil.

EMPRESA: ${nome}
PRODUTO PRINCIPAL: ${dadosCliente.produtoPrincipal}
SETOR: ${dadosCliente.setor}
CIDADE/UF: ${dadosCliente.cidade}, ${dadosCliente.uf}

TAREFA: Identificar o MERCADO PRINCIPAL e enriquecê-lo com dados REAIS do Brasil.

CAMPOS OBRIGATÓRIOS:
1. nome: Nome específico do mercado (ex: "Software de Gestão Empresarial")
2. categoria: Indústria | Comércio | Serviços | Tecnologia
3. segmentacao: B2B | B2C | B2B2C
4. tamanhoMercado: Tamanho no Brasil (ex: "R$ 15 bi/ano, 500 mil empresas")
5. crescimentoAnual: Taxa (ex: "12% ao ano (2023-2028)")
6. tendencias: 3-5 tendências atuais (max 500 chars)
7. principaisPlayers: 5-10 empresas brasileiras (separadas por vírgula)

REGRAS CRÍTICAS:
- Seja ESPECÍFICO sobre o mercado brasileiro
- Use dados REAIS e ATUALIZADOS (2024-2025)
- Tendências devem ser CONCRETAS
- Players devem ser empresas REAIS

Retorne APENAS JSON válido:
{
  "nome": "string",
  "categoria": "string",
  "segmentacao": "string",
  "tamanhoMercado": "string",
  "crescimentoAnual": "string",
  "tendencias": "string",
  "principaisPlayers": "string"
}`;

    const responseMercado = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um analista de mercado. Sempre responda em JSON válido com dados do mercado brasileiro.' },
        { role: 'user', content: promptMercado }
      ],
      temperature: 0.9,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const dadosMercado = JSON.parse(responseMercado.choices[0].message.content || '{}');

    // ETAPA 3: PRODUTOS/SERVIÇOS (Temperatura 0.9)
    const promptProdutos = `Você é um especialista em análise de produtos B2B.

EMPRESA: ${nome}
PRODUTO PRINCIPAL: ${dadosCliente.produtoPrincipal}
MERCADO: ${dadosMercado.nome}
${dadosCliente.site ? `SITE: ${dadosCliente.site}` : ''}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços.

CAMPOS OBRIGATÓRIOS (para cada produto):
1. nome: Nome do produto/serviço (max 255 chars)
2. descricao: Descrição detalhada (max 500 chars)
3. categoria: Categoria (ex: "Software", "Consultoria")

REGRAS CRÍTICAS:
- EXATAMENTE 3 produtos (não mais, não menos)
- Produtos DIFERENTES entre si
- Descrições ESPECÍFICAS e TÉCNICAS

Retorne APENAS JSON válido:
{
  "produtos": [
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string"
    },
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string"
    },
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string"
    }
  ]
}`;

    const responseProdutos = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em produtos B2B. Sempre responda em JSON válido.' },
        { role: 'user', content: promptProdutos }
      ],
      temperature: 0.9,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const dadosProdutos = JSON.parse(responseProdutos.choices[0].message.content || '{}');

    // Calcular métricas totais
    const duration = Date.now() - startTime;
    const inputTokens = (responseCliente.usage?.prompt_tokens || 0) + 
                       (responseMercado.usage?.prompt_tokens || 0) + 
                       (responseProdutos.usage?.prompt_tokens || 0);
    const outputTokens = (responseCliente.usage?.completion_tokens || 0) + 
                        (responseMercado.usage?.completion_tokens || 0) + 
                        (responseProdutos.usage?.completion_tokens || 0);
    const totalTokens = inputTokens + outputTokens;
    const custo = calculateCost('gpt-4o-mini', inputTokens, outputTokens);

    // ========================================================================
    // PERSISTIR DADOS NO BANCO
    // ========================================================================

    // 1. Atualizar dim_entidade com dados enriquecidos
    await client`
      UPDATE dim_entidade
      SET 
        cnpj = COALESCE(${dadosCliente.cnpj}, cnpj),
        email = ${dadosCliente.email},
        telefone = ${dadosCliente.telefone},
        site = ${dadosCliente.site},
        cidade = ${dadosCliente.cidade},
        uf = ${dadosCliente.uf},
        porte = ${dadosCliente.porte},
        setor = ${dadosCliente.setor},
        produto_principal = ${dadosCliente.produtoPrincipal},
        segmentacao_b2b_b2c = ${dadosCliente.segmentacaoB2bB2c},
        score_qualidade = 85,
        enriquecido_em = NOW(),
        enriquecido_por = ${userName},
        updated_at = NOW(),
        updated_by = ${userName}
      WHERE id = ${entidadeId}
    `;

    // 2. Salvar mercado (INSERT ou UPDATE)
    await client`
      INSERT INTO dim_mercado (
        entidade_id, nome, categoria, segmentacao,
        tamanho_mercado, crescimento_anual, tendencias,
        principais_players, created_by, updated_by
      ) VALUES (
        ${entidadeId}, ${dadosMercado.nome}, ${dadosMercado.categoria},
        ${dadosMercado.segmentacao}, ${dadosMercado.tamanhoMercado},
        ${dadosMercado.crescimentoAnual}, ${dadosMercado.tendencias},
        ${dadosMercado.principaisPlayers}, ${userName}, ${userName}
      )
      ON CONFLICT (entidade_id) DO UPDATE SET
        nome = EXCLUDED.nome,
        categoria = EXCLUDED.categoria,
        segmentacao = EXCLUDED.segmentacao,
        tamanho_mercado = EXCLUDED.tamanho_mercado,
        crescimento_anual = EXCLUDED.crescimento_anual,
        tendencias = EXCLUDED.tendencias,
        principais_players = EXCLUDED.principais_players,
        updated_at = NOW(),
        updated_by = ${userName}
    `;

    // 3. Salvar produtos (deletar antigos e inserir novos)
    await client`DELETE FROM dim_produto WHERE entidade_id = ${entidadeId}`;

    if (dadosProdutos.produtos && Array.isArray(dadosProdutos.produtos)) {
      for (let i = 0; i < dadosProdutos.produtos.length; i++) {
        const produto = dadosProdutos.produtos[i];
        await client`
          INSERT INTO dim_produto (
            entidade_id, nome, descricao, categoria, ordem, created_by
          ) VALUES (
            ${entidadeId}, ${produto.nome}, ${produto.descricao},
            ${produto.categoria}, ${i + 1}, ${userName}
          )
        `;
      }
    }

    // ========================================================================
    // REGISTRAR USO DE IA
    // ========================================================================

    // Registrar uso
    await client`
      INSERT INTO ia_usage (
        user_id, processo, plataforma, modelo,
        input_tokens, output_tokens, total_tokens,
        custo, duracao_ms, entidade_id, sucesso
      ) VALUES (
        ${userId}, 'enriquecimento_completo', 'openai', 'gpt-4o-mini',
        ${inputTokens}, ${outputTokens}, ${totalTokens},
        ${custo}, ${duration}, ${entidadeId}, true
      )
    `;

    await client.end();

    return res.json({
      success: true,
      data: {
        cliente: dadosCliente,
        mercado: dadosMercado,
        produtos: dadosProdutos.produtos || []
      },
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        custo,
        duration,
      },
    });
  } catch (error) {
    console.error('[IA Enriquecer] Erro:', error);

    // Registrar erro
    try {
      await client`
        INSERT INTO ia_usage (
          user_id, processo, plataforma, modelo,
          input_tokens, output_tokens, total_tokens,
          custo, duracao_ms, entidade_id, sucesso, erro
        ) VALUES (
          ${req.body.userId || 'unknown'}, 'enriquecimento_completo', 'openai', 'gpt-4o-mini',
          0, 0, 0, 0, 0, ${req.body.entidadeId || null}, false, ${error.message}
        )
      `;
    } catch (e) {
      console.error('[IA Enriquecer] Erro ao registrar erro:', e);
    }

    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
