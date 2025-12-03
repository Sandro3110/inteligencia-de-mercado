// api/ia-gerar-leads.js
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
    const { userId, entidadeId, nome, setor, produtos, perfil_cliente_ideal, regiao } = req.body;

    if (!userId || !entidadeId || !nome) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, entidadeId, nome' });
    }

    const startTime = Date.now();

    const prompt = `Você é um especialista em prospecção de vendas e geração de leads B2B.

Identifique potenciais clientes (leads) para esta empresa:

Empresa: ${nome}
${setor ? `Setor: ${setor}` : ''}
${produtos ? `Produtos/Serviços oferecidos: ${produtos}` : ''}
${perfil_cliente_ideal ? `Perfil de cliente ideal: ${perfil_cliente_ideal}` : ''}
${regiao ? `Região de atuação: ${regiao}` : 'Brasil'}

Retorne APENAS um JSON válido com esta estrutura:
{
  "leads": [
    {
      "nome": "Nome da empresa lead",
      "cnpj": "CNPJ se conhecido (ou null)",
      "setor": "Setor de atuação",
      "porte": "Pequeno/Médio/Grande",
      "score_qualificacao": 85,
      "motivo_fit": "Por que é um bom lead",
      "necessidades_identificadas": ["Necessidade 1", "Necessidade 2"],
      "produtos_recomendados": ["Produto 1", "Produto 2"],
      "abordagem_sugerida": "Como abordar este lead",
      "prioridade": "Alta/Média/Baixa",
      "potencial_receita": "R$ 50.000/mês",
      "observacoes": "Informações adicionais"
    }
  ],
  "perfil_icp": {
    "setores_prioritarios": ["Setor 1", "Setor 2"],
    "portes_ideais": ["Médio", "Grande"],
    "caracteristicas_chave": ["Característica 1", "Característica 2"],
    "dores_principais": ["Dor 1", "Dor 2"]
  },
  "estrategia_prospeccao": {
    "canais_recomendados": ["Canal 1", "Canal 2"],
    "mensagens_chave": ["Mensagem 1", "Mensagem 2"],
    "proximos_passos": ["Passo 1", "Passo 2"]
  },
  "total_leads": 8
}

Liste entre 8 a 15 leads qualificados e relevantes do mercado brasileiro.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em prospecção B2B. Sempre responda em JSON válido com leads qualificados do mercado brasileiro.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
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
        ${userId}, 'gerar_leads', 'openai', 'gpt-4o-mini',
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
