// lib/ia-service.ts
import { callOpenAI, MODELS } from './openai';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

/**
 * Registrar uso de IA no banco
 */
export async function trackIAUsage(params: {
  userId: string;
  processo: string;
  plataforma: string;
  modelo: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  custo: number;
  duracaoMs: number;
  entidadeId?: number;
  projetoId?: number;
  sucesso: boolean;
  erro?: string;
}) {
  try {
    await client`
      INSERT INTO ia_usage (
        user_id, processo, plataforma, modelo,
        input_tokens, output_tokens, total_tokens,
        custo, duracao_ms, entidade_id, projeto_id,
        sucesso, erro
      ) VALUES (
        ${params.userId}, ${params.processo}, ${params.plataforma}, ${params.modelo},
        ${params.inputTokens}, ${params.outputTokens}, ${params.totalTokens},
        ${params.custo}, ${params.duracaoMs}, ${params.entidadeId || null}, ${params.projetoId || null},
        ${params.sucesso}, ${params.erro || null}
      )
    `;
  } catch (error) {
    console.error('[IA Service] Erro ao registrar uso:', error);
  }
}

/**
 * Enriquecer entidade com IA
 */
export async function enriquecerEntidade(params: {
  userId: string;
  entidadeId: number;
  nome: string;
  cnpj?: string;
  setor?: string;
}) {
  const startTime = Date.now();

  try {
    const prompt = `Você é um assistente especializado em análise de empresas brasileiras.

Analise a empresa abaixo e retorne um JSON com as seguintes informações:

Empresa: ${params.nome}
${params.cnpj ? `CNPJ: ${params.cnpj}` : ''}
${params.setor ? `Setor: ${params.setor}` : ''}

Retorne APENAS um JSON válido com esta estrutura:
{
  "descricao": "Descrição detalhada da empresa (2-3 frases)",
  "setor": "Setor principal de atuação",
  "porte": "Pequeno/Médio/Grande",
  "produtos_servicos": ["Lista", "de", "produtos", "ou", "serviços"],
  "diferenciais": ["Principais", "diferenciais", "competitivos"],
  "score_qualidade": 85
}

O score_qualidade deve ser de 0-100 baseado na qualidade e completude dos dados encontrados.`;

    const response = await callOpenAI({
      model: 'GPT_4O_MINI',
      messages: [
        { role: 'system', content: 'Você é um assistente especializado em análise de empresas. Sempre responda em JSON válido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 1000,
      responseFormat: { type: 'json_object' },
    });

    const data = JSON.parse(response.content || '{}');

    // Registrar uso
    await trackIAUsage({
      userId: params.userId,
      processo: 'enriquecimento',
      plataforma: 'openai',
      modelo: response.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      totalTokens: response.usage.totalTokens,
      custo: response.usage.cost,
      duracaoMs: Date.now() - startTime,
      entidadeId: params.entidadeId,
      sucesso: true,
    });

    return {
      success: true,
      data,
      usage: response.usage,
    };
  } catch (error: any) {
    // Registrar erro
    await trackIAUsage({
      userId: params.userId,
      processo: 'enriquecimento',
      plataforma: 'openai',
      modelo: 'gpt-4o-mini',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      custo: 0,
      duracaoMs: Date.now() - startTime,
      entidadeId: params.entidadeId,
      sucesso: false,
      erro: error.message,
    });

    throw error;
  }
}

/**
 * Analisar mercado de um projeto
 */
export async function analisarMercado(params: {
  userId: string;
  projetoId: number;
  entidades: Array<{ nome: string; setor?: string; porte?: string }>;
}) {
  const startTime = Date.now();

  try {
    const entidadesTexto = params.entidades
      .map((e, i) => `${i + 1}. ${e.nome}${e.setor ? ` (${e.setor})` : ''}${e.porte ? ` - ${e.porte}` : ''}`)
      .join('\n');

    const prompt = `Você é um analista de mercado especializado.

Analise o mercado baseado nestas ${params.entidades.length} empresas:

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

    const response = await callOpenAI({
      model: 'GPT_4O', // Usar modelo mais potente para análises
      messages: [
        { role: 'system', content: 'Você é um analista de mercado sênior. Sempre responda em JSON válido com análises profundas.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      maxTokens: 2000,
      responseFormat: { type: 'json_object' },
    });

    const data = JSON.parse(response.content || '{}');

    // Registrar uso
    await trackIAUsage({
      userId: params.userId,
      processo: 'analise_mercado',
      plataforma: 'openai',
      modelo: response.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      totalTokens: response.usage.totalTokens,
      custo: response.usage.cost,
      duracaoMs: Date.now() - startTime,
      projetoId: params.projetoId,
      sucesso: true,
    });

    return {
      success: true,
      data,
      usage: response.usage,
    };
  } catch (error: any) {
    // Registrar erro
    await trackIAUsage({
      userId: params.userId,
      processo: 'analise_mercado',
      plataforma: 'openai',
      modelo: 'gpt-4o',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      custo: 0,
      duracaoMs: Date.now() - startTime,
      projetoId: params.projetoId,
      sucesso: false,
      erro: error.message,
    });

    throw error;
  }
}

/**
 * Gerar sugestões de ações
 */
export async function gerarSugestoes(params: {
  userId: string;
  entidadeId: number;
  entidade: {
    nome: string;
    tipo: string;
    setor?: string;
    descricao?: string;
  };
  contexto?: string;
}) {
  const startTime = Date.now();

  try {
    const prompt = `Você é um consultor de vendas e marketing.

Analise esta entidade e sugira próximos passos:

Empresa: ${params.entidade.nome}
Tipo: ${params.entidade.tipo}
${params.entidade.setor ? `Setor: ${params.entidade.setor}` : ''}
${params.entidade.descricao ? `Descrição: ${params.entidade.descricao}` : ''}
${params.contexto ? `Contexto: ${params.contexto}` : ''}

Retorne APENAS um JSON válido com esta estrutura:
{
  "acoes": [
    {
      "titulo": "Título da ação",
      "descricao": "Descrição detalhada",
      "prioridade": "Alta/Média/Baixa",
      "prazo_sugerido": "3 dias"
    }
  ],
  "prioridade_geral": "Alta",
  "score_potencial": 85,
  "observacoes": "Observações adicionais"
}

O score_potencial deve ser de 0-100 baseado no potencial de conversão/sucesso.`;

    const response = await callOpenAI({
      model: 'GPT_4O_MINI',
      messages: [
        { role: 'system', content: 'Você é um consultor de vendas experiente. Sempre responda em JSON válido com sugestões práticas.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1500,
      responseFormat: { type: 'json_object' },
    });

    const data = JSON.parse(response.content || '{}');

    // Registrar uso
    await trackIAUsage({
      userId: params.userId,
      processo: 'sugestoes',
      plataforma: 'openai',
      modelo: response.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      totalTokens: response.usage.totalTokens,
      custo: response.usage.cost,
      duracaoMs: Date.now() - startTime,
      entidadeId: params.entidadeId,
      sucesso: true,
    });

    return {
      success: true,
      data,
      usage: response.usage,
    };
  } catch (error: any) {
    // Registrar erro
    await trackIAUsage({
      userId: params.userId,
      processo: 'sugestoes',
      plataforma: 'openai',
      modelo: 'gpt-4o-mini',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      custo: 0,
      duracaoMs: Date.now() - startTime,
      entidadeId: params.entidadeId,
      sucesso: false,
      erro: error.message,
    });

    throw error;
  }
}
