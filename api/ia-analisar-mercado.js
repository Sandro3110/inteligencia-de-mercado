// api/ia-analisar-mercado.js
import OpenAI from 'openai';
import postgres from 'postgres';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_COSTS = {
  'gpt-4o': {
    input: 2.50,
    output: 10.00,
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
    const { userId, projetoId, entidades } = req.body;

    if (!userId || !projetoId || !entidades || !Array.isArray(entidades)) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, projetoId, entidades (array)' });
    }

    const startTime = Date.now();

    const entidadesTexto = entidades
      .map((e, i) => `${i + 1}. ${e.nome}${e.setor ? ` (${e.setor})` : ''}${e.porte ? ` - ${e.porte}` : ''}`)
      .join('\n');

    const prompt = `Você é um analista de mercado especializado.

Analise o mercado baseado nestas ${entidades.length} empresas:

${entidadesTexto}

Retorne APENAS um JSON válido com esta estrutura:
{
  "resumo": "Resumo executivo do mercado (3-4 frases)",
  "principais_players": ["Top 3-5 empresas mais relevantes"],
  "oportunidades": ["Principais oportunidades identificadas"],
  "riscos": ["Principais riscos e desafios"],
  "tendencias": ["Tendências do mercado"],
  "score_atratividade": 85,
  "recomendacoes": ["Recomendações estratégicas"]
}

O score_atratividade deve ser de 0-100 baseado na atratividade geral do mercado.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Você é um analista de mercado sênior. Sempre responda em JSON válido com análises profundas.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;
    const custo = calculateCost('gpt-4o', inputTokens, outputTokens);

    const data = JSON.parse(response.choices[0].message.content || '{}');

    // Registrar uso
    await client`
      INSERT INTO ia_usage (
        user_id, processo, plataforma, modelo,
        input_tokens, output_tokens, total_tokens,
        custo, duracao_ms, projeto_id, sucesso
      ) VALUES (
        ${userId}, 'analise_mercado', 'openai', 'gpt-4o',
        ${inputTokens}, ${outputTokens}, ${totalTokens},
        ${custo}, ${duration}, ${projetoId}, true
      )
    `;

    await client.end();

    return res.json({
      success: true,
      data,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        custo,
        duration,
      },
    });
  } catch (error) {
    console.error('[IA Analisar Mercado] Erro:', error);

    // Registrar erro
    try {
      await client`
        INSERT INTO ia_usage (
          user_id, processo, plataforma, modelo,
          input_tokens, output_tokens, total_tokens,
          custo, duracao_ms, projeto_id, sucesso, erro
        ) VALUES (
          ${req.body.userId || 'unknown'}, 'analise_mercado', 'openai', 'gpt-4o',
          0, 0, 0, 0, 0, ${req.body.projetoId || null}, false, ${error.message}
        )
      `;
    } catch (e) {
      console.error('[IA Analisar Mercado] Erro ao registrar erro:', e);
    }

    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
