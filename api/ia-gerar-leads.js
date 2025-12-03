// api/ia-gerar-leads.js - FASE 5 ETAPA 5
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
    const { userId, entidadeId, nome, mercado, produtos, concorrentes, cidade, uf } = req.body;

    if (!userId || !entidadeId || !nome) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, entidadeId, nome' });
    }

    const startTime = Date.now();

    // ETAPA 5: LEADS (Temperatura 1.0)
    const produtosNomes = Array.isArray(produtos) 
      ? produtos.map(p => p.nome || p).join(', ')
      : (produtos || 'Produtos não especificados');

    const concorrentesNomes = Array.isArray(concorrentes)
      ? concorrentes.map(c => c.nome || c).join(', ')
      : (concorrentes || '');

    const prompt = `Você é um especialista em prospecção B2B do Brasil.

CLIENTE (FORNECEDOR): ${nome}
PRODUTOS OFERECIDOS: ${produtosNomes}
MERCADO: ${mercado || 'Não especificado'}
REGIÃO: ${cidade || 'Brasil'}, ${uf || ''}

${concorrentesNomes ? `CONCORRENTES (NÃO PODEM SER LEADS): ${concorrentesNomes}` : ''}

TAREFA: Identificar 5 LEADS REAIS (empresas que COMPRAM os produtos do cliente).

DEFINIÇÃO DE LEAD:
- Empresa que COMPRA/CONSOME os produtos do cliente
- NÃO é o próprio cliente
- NÃO é concorrente
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada):
1. nome: Razão social ou nome fantasia
2. cidade: Cidade (obrigatório)
3. uf: Estado 2 letras (obrigatório)
4. produtoInteresse: Qual produto compraria
5. setor: Setor de atuação

CAMPOS OPCIONAIS:
6. cnpj: XX.XXX.XXX/XXXX-XX - NULL se não souber
7. site: https://... - NULL se não souber
8. porte: Micro | Pequena | Média | Grande - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 leads
- NÃO inclua cliente: ${nome}
- NÃO inclua concorrentes
- NÃO invente CNPJs (use NULL)
- Empresas REAIS que usariam os produtos

Retorne APENAS JSON válido com 5 leads DIFERENTES:
{
  "leads": [
    {
      "nome": "string",
      "cidade": "string",
      "uf": "string",
      "produtoInteresse": "string",
      "setor": "string",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "string ou null"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em prospecção B2B. Sempre responda em JSON válido com empresas reais do Brasil.' },
        { role: 'user', content: prompt }
      ],
      temperature: 1.0,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;
    const custo = calculateCost('gpt-4o-mini', inputTokens, outputTokens);

    const data = JSON.parse(response.choices[0].message.content || '{}');

    // Validar que tem exatamente 5 leads
    if (!data.leads || data.leads.length !== 5) {
      throw new Error(`Esperado 5 leads, recebeu ${data.leads?.length || 0}`);
    }

    // Registrar uso
    await client`
      INSERT INTO ia_usage (
        user_id, processo, plataforma, modelo,
        input_tokens, output_tokens, total_tokens,
        custo, duracao_ms, entidade_id, sucesso
      ) VALUES (
        ${userId}, 'gerar_leads', 'openai', 'gpt-4o-mini',
        ${inputTokens}, ${outputTokens}, ${totalTokens},
        ${custo}, ${duration}, ${entidadeId}, true
      )
    `;

    await client.end();

    return res.json({
      success: true,
      data: data.leads,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        custo,
        duration,
      },
    });
  } catch (error) {
    console.error('[IA Gerar Leads] Erro:', error);

    // Registrar erro
    try {
      await client`
        INSERT INTO ia_usage (
          user_id, processo, plataforma, modelo,
          input_tokens, output_tokens, total_tokens,
          custo, duracao_ms, entidade_id, sucesso, erro
        ) VALUES (
          ${req.body.userId || 'unknown'}, 'gerar_leads', 'openai', 'gpt-4o-mini',
          0, 0, 0, 0, 0, ${req.body.entidadeId || null}, false, ${error.message}
        )
      `;
    } catch (e) {
      console.error('[IA Gerar Leads] Erro ao registrar erro:', e);
    }

    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
