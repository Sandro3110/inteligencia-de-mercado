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

// Função para calcular score inteligente de qualificação
function calculateLeadScore(lead, clienteData) {
  let score = 50; // Score base

  // +20 pontos por porte da empresa
  const porteScores = {
    'Micro': 5,
    'Pequena': 10,
    'Média': 15,
    'Grande': 20
  };
  if (lead.porte && porteScores[lead.porte]) {
    score += porteScores[lead.porte];
  }

  // +15 pontos por localização
  if (clienteData.cidade && lead.cidade) {
    if (lead.cidade.toLowerCase() === clienteData.cidade.toLowerCase()) {
      score += 15; // Mesma cidade
    } else if (clienteData.uf && lead.uf === clienteData.uf) {
      score += 10; // Mesmo estado
    } else {
      score += 5; // Outro estado
    }
  }

  // +15 pontos por match de produto
  if (clienteData.produtos && Array.isArray(clienteData.produtos) && lead.produtoInteresse) {
    const produtoLead = lead.produtoInteresse.toLowerCase();
    // Verifica se o produto de interesse está na lista de produtos do cliente
    const hasMatch = clienteData.produtos.some(p => {
      const produtoCliente = (typeof p === 'string' ? p : p.nome || p).toLowerCase();
      return produtoLead.includes(produtoCliente) || produtoCliente.includes(produtoLead);
    });
    if (hasMatch) {
      score += 15; // Match direto
    } else {
      score += 5; // Produto relacionado
    }
  }

  // Garantir que score está entre 0-100
  score = Math.max(0, Math.min(100, score));

  // Determinar prioridade
  let prioridade;
  if (score >= 80) {
    prioridade = 'Alta';
  } else if (score >= 60) {
    prioridade = 'Média';
  } else {
    prioridade = 'Baixa';
  }

  return { score, prioridade };
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

    // Buscar name do usuário
    let [user] = await client`SELECT name, email FROM users WHERE id = ${userId}`;
    if (!user && userId.includes('@')) {
      [user] = await client`SELECT name, email FROM users WHERE email = ${userId}`;
    }
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const userName = user.name || user.email;

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
6. cnpj: CNPJ REAL no formato XX.XXX.XXX/XXXX-XX com dígitos verificadores VÁLIDOS - NULL se não souber COM CERTEZA
7. site: https://... - NULL se não souber
8. porte: Micro | Pequena | Média | Grande - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 leads
- NÃO inclua cliente: ${nome}
- NÃO inclua concorrentes
- CNPJ: Se conhecer a empresa, forneça o CNPJ REAL com dígitos verificadores VÁLIDOS. Se não souber, use NULL.
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

    // ========================================================================
    // VALIDAÇÕES CRÍTICAS
    // ========================================================================

    // 1. Validar quantidade exata (5 leads)
    if (!data.leads || data.leads.length !== 5) {
      throw new Error(`Esperado 5 leads, recebeu ${data.leads?.length || 0}`);
    }

    // 2. Validar e limpar CNPJs genéricos
    const cnpjGenerico = /^00\.000\.000\/\d{4}-\d{2}$/;
    data.leads = data.leads.map(lead => ({
      ...lead,
      cnpj: (lead.cnpj && cnpjGenerico.test(lead.cnpj)) ? null : lead.cnpj
    }));

    // 3. Validar que não incluiu o próprio cliente
    const nomeCliente = nome.toLowerCase();
    const incluiCliente = data.leads.some(lead => {
      const nomeLead = lead.nome.toLowerCase();
      return nomeLead.includes(nomeCliente) || nomeCliente.includes(nomeLead);
    });
    if (incluiCliente) {
      throw new Error('ERRO: Lead não pode incluir o próprio cliente');
    }

    // 4. Validar que não incluiu concorrentes (se fornecidos)
    if (concorrentes && Array.isArray(concorrentes)) {
      const concorrentesNomes = concorrentes.map(c => (typeof c === 'string' ? c : c.nome).toLowerCase());
      const incluiConcorrente = data.leads.some(lead => {
        const nomeLead = lead.nome.toLowerCase();
        return concorrentesNomes.some(nomeConc => 
          nomeLead.includes(nomeConc) || nomeConc.includes(nomeLead)
        );
      });
      if (incluiConcorrente) {
        throw new Error('ERRO: Lead não pode incluir concorrentes');
      }
    }

    // 5. Validar cidade e UF obrigatórios
    const semLocalizacao = data.leads.some(lead => !lead.cidade || !lead.uf);
    if (semLocalizacao) {
      throw new Error('ERRO: Todos os leads devem ter cidade e UF');
    }

    // 6. Validar que todos têm produto de interesse
    const semProduto = data.leads.some(lead => !lead.produtoInteresse);
    if (semProduto) {
      throw new Error('ERRO: Todos os leads devem ter produto de interesse');
    }

    // ========================================================================
    // PERSISTIR LEADS NO BANCO
    // ========================================================================

    // Deletar leads antigos
    await client`DELETE FROM dim_lead WHERE entidade_id = ${entidadeId}`;

    // Calcular score inteligente para cada lead
    const clienteData = { cidade, uf, produtos };
    const leadsComScore = data.leads.map(lead => {
      const { score, prioridade } = calculateLeadScore(lead, clienteData);
      return { ...lead, scoreQualificacao: score, prioridade };
    });

    // Inserir novos leads com score calculado
    for (let i = 0; i < leadsComScore.length; i++) {
      const lead = leadsComScore[i];
      await client`
        INSERT INTO dim_lead (
          entidade_id, nome, cnpj, cidade, uf,
          produto_interesse, setor, site, porte,
          score_qualificacao, prioridade, status,
          ordem, created_by, updated_by
        ) VALUES (
          ${entidadeId}, ${lead.nome}, ${lead.cnpj}, ${lead.cidade},
          ${lead.uf}, ${lead.produtoInteresse}, ${lead.setor},
          ${lead.site}, ${lead.porte},
          ${lead.scoreQualificacao}, ${lead.prioridade}, 'novo',
          ${i + 1}, ${userName}, ${userName}
        )
      `;
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
        ${userId}, 'gerar_leads', 'openai', 'gpt-4o-mini',
        ${inputTokens}, ${outputTokens}, ${totalTokens},
        ${custo}, ${duration}, ${entidadeId}, true
      )
    `;

    await client.end();

    return res.json({
      success: true,
      data: leadsComScore,
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
