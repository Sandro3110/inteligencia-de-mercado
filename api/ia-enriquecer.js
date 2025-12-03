// api/ia-enriquecer.js - Enriquecimento de entidades com IA
import OpenAI from 'openai';
import postgres from 'postgres';
import { validarENormalizarEntidade } from './lib/validacao.js';

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
    
    // Gerar jobId único
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Criar job inicial
    await client`
      INSERT INTO ia_jobs (
        id, user_id, entidade_id, tipo, status, progresso, etapa_atual
      ) VALUES (
        ${jobId}, ${userId}, ${entidadeId}, 'enriquecimento_completo', 'processing', 0, 'cliente'
      )
    `;

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
1. cnpj: CNPJ REAL no formato XX.XXX.XXX/XXXX-XX com dígitos verificadores VÁLIDOS - NULL se não souber COM CERTEZA
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
- CNPJ: Se conhecer a empresa, forneça o CNPJ REAL com dígitos verificadores VÁLIDOS
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
    
    // Atualizar progresso: Cliente completo (20%)
    await client`
      UPDATE ia_jobs
      SET progresso = 20,
          etapa_atual = 'mercado',
          etapas_completas = '["cliente"]',
          dados_parciais = ${JSON.stringify({ cliente: { fields: Object.keys(dadosCliente).length, total: 10 } })}
      WHERE id = ${jobId}
    `;

    // ETAPA 2: ANÁLISE COMPLETA DE MERCADO (Temperatura 0.5)
    const promptMercado = `Você é um analista de mercado especializado em inteligência competitiva do Brasil.

EMPRESA: ${nome}
PRODUTO PRINCIPAL: ${dadosCliente.produtoPrincipal}
SETOR: ${dadosCliente.setor}
CIDADE/UF: ${dadosCliente.cidade}, ${dadosCliente.uf}

TAREFA: Identificar o MERCADO PRINCIPAL e fazer ANÁLISE COMPLETA com dados REAIS do Brasil.

PARTE 1 - DADOS BÁSICOS:
1. nome: Nome específico do mercado (ex: "Software de Gestão Empresarial")
2. categoria: Indústria | Comércio | Serviços | Tecnologia
3. segmentacao: B2B | B2C | B2B2C
4. tamanhoMercado: Tamanho no Brasil (ex: "R$ 15 bi/ano, 500 mil empresas")
5. crescimentoAnual: Taxa (ex: "12% ao ano (2023-2028)")
6. tendencias: 3-5 tendências atuais (max 500 chars)
7. principaisPlayers: 5-10 empresas brasileiras (separadas por vírgula)

PARTE 2 - ANÁLISE DE SENTIMENTO:
8. sentimento: Positivo | Neutro | Negativo
   - Considere: crescimento, investimentos, regulação, concorrência

9. scoreAtratividade: 0-100 (inteiro)
   - Tamanho do mercado (0-25)
   - Taxa de crescimento (0-25)
   - Nível de saturação (0-25)
   - Barreiras de entrada (0-25)

10. nivelSaturacao: Baixo | Médio | Alto
    - Quantidade de players, concentração, facilidade de entrada

11. oportunidades: Array com 3-5 oportunidades concretas
    - Tendências favoráveis, gaps não atendidos, mudanças regulatórias

12. riscos: Array com 2-3 riscos principais
    - Ameaças competitivas, mudanças tecnológicas, riscos econômicos

13. recomendacaoEstrategica: Texto (max 500 chars)
    - Ação sugerida (Investir/Monitorar/Evitar)
    - Segmento prioritário
    - Diferenciação recomendada

REGRAS CRÍTICAS:
- Seja ESPECÍFICO sobre o mercado brasileiro
- Use dados REAIS e ATUALIZADOS (2024-2025)
- Análise deve ser OBJETIVA e FUNDAMENTADA
- Score deve refletir REALIDADE do mercado

Retorne APENAS JSON válido:
{
  "nome": "string",
  "categoria": "string",
  "segmentacao": "string",
  "tamanhoMercado": "string",
  "crescimentoAnual": "string",
  "tendencias": "string",
  "principaisPlayers": "string",
  "sentimento": "string",
  "scoreAtratividade": 85,
  "nivelSaturacao": "string",
  "oportunidades": ["string", "string", "string"],
  "riscos": ["string", "string"],
  "recomendacaoEstrategica": "string"
}`;

    const responseMercado = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um analista de mercado. Sempre responda em JSON válido com dados do mercado brasileiro.' },
        { role: 'user', content: promptMercado }
      ],
      temperature: 0.5,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const dadosMercado = JSON.parse(responseMercado.choices[0].message.content || '{}');
    
    // Atualizar progresso: Mercado completo (40%)
    await client`
      UPDATE ia_jobs
      SET progresso = 40,
          etapa_atual = 'produtos',
          etapas_completas = '["cliente", "mercado"]',
          dados_parciais = ${JSON.stringify({
            cliente: { fields: Object.keys(dadosCliente).length, total: 10 },
            mercado: { score: dadosMercado.scoreAtratividade, sentimento: dadosMercado.sentimento }
          })}
      WHERE id = ${jobId}
    `;

    // ETAPA 3: PRODUTOS/SERVIÇOS DETALHADOS (Temperatura 0.7)
    const promptProdutos = `Você é um especialista em análise de produtos B2B.

EMPRESA: ${nome}
PRODUTO PRINCIPAL: ${dadosCliente.produtoPrincipal}
MERCADO: ${dadosMercado.nome}
PORTE: ${dadosCliente.porte}
${dadosCliente.site ? `SITE: ${dadosCliente.site}` : ''}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços com DETALHES COMPLETOS.

CAMPOS OBRIGATÓRIOS (para cada produto):
1. nome: Nome do produto/serviço (max 255 chars)
2. descricao: Descrição resumida (max 300 chars)
3. categoria: Categoria (ex: "Software", "Consultoria")
4. funcionalidades: Array com 3-5 funcionalidades principais
5. publicoAlvo: Público-alvo específico (max 500 chars)
6. diferenciais: Array com 2-3 diferenciais competitivos
7. tecnologias: Tecnologias/metodologias (max 500 chars)
8. precificacao: Modelo de preço e faixa de valores (max 500 chars)

REGRAS CRÍTICAS:
- EXATAMENTE 3 produtos (não mais, não menos)
- Produtos DIFERENTES entre si
- Descrições ESPECÍFICAS e TÉCNICAS
- Funcionalidades devem ser CONCRETAS
- Público-alvo deve ser BEM DEFINIDO
- Diferenciais devem ser REAIS e VERIFICÁVEIS
- Precificação: use NULL se não souber

Retorne APENAS JSON válido:
{
  "produtos": [
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string",
      "funcionalidades": ["string", "string", "string"],
      "publicoAlvo": "string",
      "diferenciais": ["string", "string"],
      "tecnologias": "string",
      "precificacao": "string ou null"
    }
  ]
}`;

    const responseProdutos = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em produtos B2B. Sempre responda em JSON válido.' },
        { role: 'user', content: promptProdutos }
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const dadosProdutos = JSON.parse(responseProdutos.choices[0].message.content || '{}');
    
    // Atualizar progresso: Produtos completo (60%)
    await client`
      UPDATE ia_jobs
      SET progresso = 60,
          etapa_atual = 'concorrentes',
          etapas_completas = '["cliente", "mercado", "produtos"]',
          dados_parciais = ${JSON.stringify({
            cliente: { fields: Object.keys(dadosCliente).length, total: 10 },
            mercado: { score: dadosMercado.scoreAtratividade, sentimento: dadosMercado.sentimento },
            produtos: { count: dadosProdutos.produtos?.length || 0, status: 'completed' }
          })}
      WHERE id = ${jobId}
    `;

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
    
    // Validar e normalizar dados do cliente
    const validacao = validarENormalizarEntidade({
      nome: dadosCliente.nome || nome,
      cnpj: dadosCliente.cnpj,
      email: dadosCliente.email,
      telefone: dadosCliente.telefone,
      site: dadosCliente.site,
      cidade: dadosCliente.cidade,
      uf: dadosCliente.uf,
      porte: dadosCliente.porte,
      setor: dadosCliente.setor,
      produto_principal: dadosCliente.produtoPrincipal,
      segmentacao_b2b_b2c: dadosCliente.segmentacaoB2bB2c,
      enriquecido_em: new Date()
    });
    
    const dadosValidados = validacao.dados;

    // 1. Atualizar dim_entidade com dados enriquecidos e validados
    await client`
      UPDATE dim_entidade
      SET 
        cnpj = COALESCE(${dadosValidados.cnpj}, cnpj),
        email = ${dadosValidados.email},
        telefone = ${dadosValidados.telefone},
        site = ${dadosValidados.site},
        cidade = ${dadosValidados.cidade},
        uf = ${dadosValidados.uf},
        porte = ${dadosValidados.porte},
        setor = ${dadosValidados.setor},
        produto_principal = ${dadosValidados.produto_principal},
        segmentacao_b2b_b2c = ${dadosValidados.segmentacao_b2b_b2c},
        score_qualidade = 85,
        validacao_cnpj = ${validacao.validacoes.cnpj},
        validacao_email = ${validacao.validacoes.email},
        validacao_telefone = ${validacao.validacoes.telefone},
        campos_faltantes = ${dadosValidados.campos_faltantes},
        enriquecido_em = NOW(),
        enriquecido_por = ${userName},
        updated_at = NOW(),
        updated_by = ${userName}
      WHERE id = ${entidadeId}
    `;

    // 2. Salvar mercado com análise de sentimento (INSERT ou UPDATE)
    
    // Converter arrays para strings
    const oportunidadesStr = Array.isArray(dadosMercado.oportunidades)
      ? dadosMercado.oportunidades.join('; ')
      : dadosMercado.oportunidades;
    
    const riscosStr = Array.isArray(dadosMercado.riscos)
      ? dadosMercado.riscos.join('; ')
      : dadosMercado.riscos;
    
    await client`
      INSERT INTO dim_mercado (
        entidade_id, nome, categoria, segmentacao,
        tamanho_mercado, crescimento_anual, tendencias,
        principais_players, sentimento, score_atratividade,
        nivel_saturacao, oportunidades, riscos,
        recomendacao_estrategica, created_by, updated_by
      ) VALUES (
        ${entidadeId}, ${dadosMercado.nome}, ${dadosMercado.categoria},
        ${dadosMercado.segmentacao}, ${dadosMercado.tamanhoMercado},
        ${dadosMercado.crescimentoAnual}, ${dadosMercado.tendencias},
        ${dadosMercado.principaisPlayers}, ${dadosMercado.sentimento},
        ${dadosMercado.scoreAtratividade}, ${dadosMercado.nivelSaturacao},
        ${oportunidadesStr}, ${riscosStr},
        ${dadosMercado.recomendacaoEstrategica}, ${userName}, ${userName}
      )
      ON CONFLICT (entidade_id) DO UPDATE SET
        nome = EXCLUDED.nome,
        categoria = EXCLUDED.categoria,
        segmentacao = EXCLUDED.segmentacao,
        tamanho_mercado = EXCLUDED.tamanho_mercado,
        crescimento_anual = EXCLUDED.crescimento_anual,
        tendencias = EXCLUDED.tendencias,
        principais_players = EXCLUDED.principais_players,
        sentimento = EXCLUDED.sentimento,
        score_atratividade = EXCLUDED.score_atratividade,
        nivel_saturacao = EXCLUDED.nivel_saturacao,
        oportunidades = EXCLUDED.oportunidades,
        riscos = EXCLUDED.riscos,
        recomendacao_estrategica = EXCLUDED.recomendacao_estrategica,
        updated_at = NOW(),
        updated_by = ${userName}
    `;

    // 3. Salvar produtos (deletar antigos e inserir novos)
    await client`DELETE FROM dim_produto WHERE entidade_id = ${entidadeId}`;

    if (dadosProdutos.produtos && Array.isArray(dadosProdutos.produtos)) {
      for (let i = 0; i < dadosProdutos.produtos.length; i++) {
        const produto = dadosProdutos.produtos[i];
        
        // Converter arrays para strings separadas por vírgula
        const funcionalidadesStr = Array.isArray(produto.funcionalidades) 
          ? produto.funcionalidades.join(', ') 
          : produto.funcionalidades;
        
        const diferenciaisStr = Array.isArray(produto.diferenciais)
          ? produto.diferenciais.join(', ')
          : produto.diferenciais;
        
        await client`
          INSERT INTO dim_produto (
            entidade_id, nome, descricao, categoria, ordem, created_by,
            funcionalidades, publico_alvo, diferenciais, tecnologias, precificacao
          ) VALUES (
            ${entidadeId}, ${produto.nome}, ${produto.descricao},
            ${produto.categoria}, ${i + 1}, ${userName},
            ${funcionalidadesStr}, ${produto.publicoAlvo}, ${diferenciaisStr},
            ${produto.tecnologias}, ${produto.precificacao}
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
    
    // Atualizar job: Completo (100%)
    await client`
      UPDATE ia_jobs
      SET progresso = 100,
          status = 'completed',
          etapa_atual = 'leads',
          etapas_completas = '["cliente", "mercado", "produtos", "concorrentes", "leads"]',
          tempo_fim = NOW(),
          duracao_ms = ${duration},
          custo = ${custo}
      WHERE id = ${jobId}
    `;

    await client.end();

    return res.json({
      success: true,
      jobId,
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
