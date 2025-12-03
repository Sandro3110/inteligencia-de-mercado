// api/ia-gerar-concorrentes.js
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
    const { userId, entidadeId, nome, setor, porte, produtos, regiao } = req.body;

    if (!userId || !entidadeId || !nome) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, entidadeId, nome' });
    }

    const startTime = Date.now();

    const prompt = `Você é um especialista em análise competitiva de mercado.

Identifique os principais concorrentes desta empresa:

Empresa: ${nome}
${setor ? `Setor: ${setor}` : ''}
${porte ? `Porte: ${porte}` : ''}
${produtos ? `Produtos/Serviços: ${produtos}` : ''}
${regiao ? `Região: ${regiao}` : 'Brasil'}

Retorne APENAS um JSON válido com esta estrutura:
{
  "concorrentes": [
    {
      "nome": "Nome do concorrente",
      "cnpj": "CNPJ se conhecido (ou null)",
      "tipo_concorrencia": "Direta/Indireta",
      "nivel_ameaca": "Alto/Médio/Baixo",
      "diferenciais": ["Diferencial 1", "Diferencial 2"],
      "pontos_fortes": ["Ponto forte 1", "Ponto forte 2"],
      "pontos_fracos": ["Ponto fraco 1", "Ponto fraco 2"],
      "market_share_estimado": "15%",
      "observacoes": "Observações relevantes"
    }
  ],
  "analise_competitiva": {
    "nivel_competitividade": "Alto/Médio/Baixo",
    "principais_ameacas": ["Ameaça 1", "Ameaça 2"],
    "oportunidades": ["Oportunidade 1", "Oportunidade 2"],
    "recomendacoes": ["Recomendação 1", "Recomendação 2"]
  },
  "total_concorrentes": 5
}

Liste entre 5 a 10 concorrentes reais e relevantes do mercado brasileiro.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em análise competitiva. Sempre responda em JSON válido com dados precisos do mercado brasileiro.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;
    const custo = calculateCost('gpt-4o-mini', inputTokens, outputTokens);

    const data = JSON.parse(response.choices[0].message.content || '{}');

    // Registrar uso
    await client`
      INSERT INTO ia_usage (
        user_id, processo, plataforma, modelo,
        input_tokens, output_tokens, total_tokens,
        custo, duracao_ms, entidade_id, sucesso
      ) VALUES (
        ${userId}, 'gerar_concorrentes', 'openai', 'gpt-4o-mini',
        ${inputTokens}, ${outputTokens}, ${totalTokens},
        ${custo}, ${duration}, ${entidadeId}, true
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
    console.error('[IA Gerar Concorrentes] Erro:', error);

    // Registrar erro
    try {
      await client`
        INSERT INTO ia_usage (
          user_id, processo, plataforma, modelo,
          input_tokens, output_tokens, total_tokens,
          custo, duracao_ms, entidade_id, sucesso, erro
        ) VALUES (
          ${req.body.userId || 'unknown'}, 'gerar_concorrentes', 'openai', 'gpt-4o-mini',
          0, 0, 0, 0, 0, ${req.body.entidadeId || null}, false, ${error.message}
        )
      `;
    } catch (e) {
      console.error('[IA Gerar Concorrentes] Erro ao registrar erro:', e);
    }

    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
