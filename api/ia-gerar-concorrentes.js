// api/ia-gerar-concorrentes.js - Gerar concorrentes com IA
import OpenAI from 'openai';
import postgres from 'postgres';
import { verificarSeguranca, registrarAuditoria } from './lib/security.js';

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
  const startTime = Date.now();
  let user;

  try {
    // 🔒 MIDDLEWARE DE SEGURANÇA
    user = await verificarSeguranca(req, client, {
      rateLimit: 5,   // 5 chamadas
      janela: 60      // por minuto
    });
    
    const { userId, entidadeId, nome, mercado, produtos, cidade, uf } = req.body;

    if (!userId || !entidadeId || !nome) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, entidadeId, nome' });
    }

    // Buscar name do usuário
    let [user] = await client`SELECT name, email FROM users WHERE id = ${userId}`;
    if (!user && userId.includes('@')) {
      [user] = await client`SELECT name, email FROM users WHERE email = ${userId}`;
    }
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const userName = user.name || user.email;

    // ETAPA 4: CONCORRENTES (Temperatura 1.0)
    const produtosNomes = Array.isArray(produtos) 
      ? produtos.map(p => p.nome || p).join(', ')
      : (produtos || 'Produtos não especificados');

    const prompt = `Você é um especialista em inteligência competitiva do Brasil.

CLIENTE (NÃO PODE SER CONCORRENTE): ${nome}
MERCADO: ${mercado || 'Não especificado'}
PRODUTOS DO CLIENTE: ${produtosNomes}
REGIÃO: ${cidade || 'Brasil'}, ${uf || ''}

TAREFA: Identificar 5 CONCORRENTES REAIS que oferecem produtos similares.

DEFINIÇÃO DE CONCORRENTE:
- Empresa DIFERENTE do cliente
- Oferece produtos/serviços SIMILARES
- Atua no MESMO mercado
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada):
1. nome: Razão social ou nome fantasia
2. cidade: Cidade (obrigatório)
3. uf: Estado 2 letras (obrigatório)
4. produtoPrincipal: Principal produto/serviço

CAMPOS OPCIONAIS:
5. cnpj: CNPJ REAL no formato XX.XXX.XXX/XXXX-XX com dígitos verificadores VÁLIDOS - NULL se não souber COM CERTEZA
6. site: https://... - NULL se não souber
7. porte: Micro | Pequena | Média | Grande - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 concorrentes
- NÃO inclua o cliente: ${nome}
- CNPJ: Se conhecer a empresa, forneça o CNPJ REAL com dígitos verificadores VÁLIDOS. Se não souber, use NULL.
- Empresas REAIS e DIFERENTES

Retorne APENAS JSON válido com 5 concorrentes:
{
  "concorrentes": [
    {
      "nome": "string",
      "cidade": "string",
      "uf": "string",
      "produtoPrincipal": "string",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "string ou null"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em inteligência competitiva. Sempre responda em JSON válido com empresas reais do Brasil.' },
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

    // 1. Validar quantidade exata (5 concorrentes)
    if (!data.concorrentes || data.concorrentes.length !== 5) {
      throw new Error(`Esperado 5 concorrentes, recebeu ${data.concorrentes?.length || 0}`);
    }

    // 2. Validar e limpar CNPJs genéricos
    const cnpjGenerico = /^00\.000\.000\/\d{4}-\d{2}$/;
    data.concorrentes = data.concorrentes.map(conc => ({
      ...conc,
      cnpj: (conc.cnpj && cnpjGenerico.test(conc.cnpj)) ? null : conc.cnpj
    }));

    // 3. Validar que não incluiu o próprio cliente
    const nomeCliente = nome.toLowerCase();
    const incluiCliente = data.concorrentes.some(conc => {
      const nomeConc = conc.nome.toLowerCase();
      return nomeConc.includes(nomeCliente) || nomeCliente.includes(nomeConc);
    });
    if (incluiCliente) {
      throw new Error('ERRO: Concorrente não pode incluir o próprio cliente');
    }

    // 4. Validar cidade e UF obrigatórios
    const semLocalizacao = data.concorrentes.some(conc => !conc.cidade || !conc.uf);
    if (semLocalizacao) {
      throw new Error('ERRO: Todos os concorrentes devem ter cidade e UF');
    }

    // 5. Validar que todos têm produto principal
    const semProduto = data.concorrentes.some(conc => !conc.produtoPrincipal);
    if (semProduto) {
      throw new Error('ERRO: Todos os concorrentes devem ter produto principal');
    }

    // ========================================================================
    // PERSISTIR CONCORRENTES NO BANCO
    // ========================================================================

    // Deletar concorrentes antigos
    await client`DELETE FROM dim_concorrente WHERE entidade_id = ${entidadeId}`;

    // Inserir novos concorrentes
    for (let i = 0; i < data.concorrentes.length; i++) {
      const conc = data.concorrentes[i];
      await client`
        INSERT INTO dim_concorrente (
          entidade_id, nome, cnpj, cidade, uf,
          produto_principal, site, porte, ordem, created_by
        ) VALUES (
          ${entidadeId}, ${conc.nome}, ${conc.cnpj}, ${conc.cidade},
          ${conc.uf}, ${conc.produtoPrincipal}, ${conc.site},
          ${conc.porte}, ${i + 1}, ${userName}
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
        ${userId}, 'gerar_concorrentes', 'openai', 'gpt-4o-mini',
        ${inputTokens}, ${outputTokens}, ${totalTokens},
        ${custo}, ${duration}, ${entidadeId}, true
      )
    `;

    // ✅ REGISTRAR AUDITORIA DE SUCESSO
    await registrarAuditoria({
      userId: user.userId,
      action: 'gerar_concorrentes',
      endpoint: req.url,
      metodo: 'POST',
      parametros: { entidadeId, nome, total: data.concorrentes?.length || 0 },
      resultado: 'sucesso',
      duracao: Date.now() - startTime,
      custo,
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    }, client);
    
    await client.end();

    return res.json({
      success: true,
      data: data.concorrentes,
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

    // ❌ REGISTRAR AUDITORIA DE ERRO
    try {
      await registrarAuditoria({
        userId: user?.userId || req.body.userId || 'unknown',
        action: 'gerar_concorrentes',
        endpoint: req.url,
        metodo: 'POST',
        parametros: { entidadeId: req.body.entidadeId, nome: req.body.nome },
        resultado: error.message.includes('Rate limit') ? 'bloqueado' : 'erro',
        erro: error.message,
        duracao: Date.now() - startTime,
        custo: 0,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      }, client);
      
      // Registrar erro no ia_usage também
      await client`
        INSERT INTO ia_usage (
          user_id, processo, plataforma, modelo,
          input_tokens, output_tokens, total_tokens,
          custo, duracao_ms, entidade_id, sucesso, erro
        ) VALUES (
          ${user?.userId || req.body.userId || 'unknown'}, 'gerar_concorrentes', 'openai', 'gpt-4o-mini',
          0, 0, 0, 0, ${Date.now() - startTime}, ${req.body.entidadeId || null}, false, ${error.message}
        )
      `;
    } catch (e) {
      console.error('[IA Gerar Concorrentes] Erro ao registrar erro:', e);
    }

    await client.end();
    
    // Retornar erro apropriado
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: 60
      });
    }
    
    if (error.message.includes('bloqueado')) {
      return res.status(403).json({
        success: false,
        error: 'Usuário bloqueado temporariamente por abuso.',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
