/**
 * Enriquecimento de Entidades com IA
 * Sistema completo de enriquecimento usando OpenAI
 */

import { db } from '../db';
import { dimEntidade } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export interface DadosEnriquecidos {
  // Geografia
  cidade?: string;
  uf?: string;
  
  // Dados da empresa
  porte?: string;
  setor?: string;
  produto_principal?: string;
  segmentacao_b2b_b2c?: string;
  
  // Qualidade
  score_qualidade?: number;
  
  // Metadados
  origem_processo: string;
  origem_prompt: string;
  origem_confianca: number;
}

export interface ResultadoEnriquecimento {
  sucesso: boolean;
  entidadeId: number;
  dados?: DadosEnriquecidos;
  erro?: string;
  tokens?: number;
  custo?: number;
}

// ============================================================================
// CONFIGURAÇÃO OPENAI
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// ============================================================================
// PROMPTS
// ============================================================================

function criarPromptEnriquecimento(nome: string, cnpj?: string, tipo?: string): string {
  return `Você é um especialista em análise de empresas brasileiras. Analise a empresa abaixo e retorne APENAS um JSON válido com os dados solicitados.

EMPRESA:
- Nome: ${nome}
${cnpj ? `- CNPJ: ${cnpj}` : ''}
${tipo ? `- Tipo: ${tipo}` : ''}

RETORNE UM JSON COM:
{
  "cidade": "cidade onde a empresa está localizada (string)",
  "uf": "UF (sigla de 2 letras)",
  "porte": "pequeno|médio|grande",
  "setor": "setor de atuação (ex: varejo, indústria, serviços)",
  "produto_principal": "principal produto ou serviço oferecido",
  "segmentacao_b2b_b2c": "B2B|B2C|B2B2C",
  "score_qualidade": número de 0 a 100 indicando confiança dos dados,
  "origem_confianca": número de 0 a 100 indicando confiança geral da análise
}

REGRAS:
- Retorne APENAS o JSON, sem texto adicional
- Use dados reais se conhecer a empresa
- Se não tiver certeza, use valores genéricos baseados no nome
- Seja conservador no score_qualidade (use valores baixos se não tiver certeza)
- NUNCA invente dados financeiros ou números específicos`;
}

// ============================================================================
// ENRIQUECIMENTO
// ============================================================================

/**
 * Enriquecer entidade usando OpenAI
 */
export async function enriquecerEntidade(
  entidadeId: number,
  userId: number
): Promise<ResultadoEnriquecimento> {
  try {
    // 1. Buscar entidade
    const entidade = await db.query.dimEntidade.findFirst({
      where: eq(dimEntidade.id, entidadeId)
    });

    if (!entidade) {
      return {
        sucesso: false,
        entidadeId,
        erro: 'Entidade não encontrada'
      };
    }

    // 2. Criar prompt
    const prompt = criarPromptEnriquecimento(
      entidade.nome,
      entidade.cnpj || undefined,
      entidade.tipo_entidade || undefined
    );

    // 3. Chamar OpenAI
    const inicio = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que retorna apenas JSON válido, sem explicações adicionais.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const tempo = Date.now() - inicio;

    // 4. Parsear resposta
    const resposta = completion.choices[0].message.content;
    if (!resposta) {
      throw new Error('Resposta vazia da IA');
    }

    const dadosEnriquecidos: DadosEnriquecidos = JSON.parse(resposta);

    // 5. Adicionar metadados
    dadosEnriquecidos.origem_processo = 'enriquecimento_ia';
    dadosEnriquecidos.origem_prompt = prompt;

    // 6. Calcular tokens e custo
    const tokens = completion.usage?.total_tokens || 0;
    const custo = (tokens / 1000) * 0.0001; // GPT-4o-mini: $0.0001 por 1K tokens

    // 7. Atualizar entidade no banco
    await db
      .update(dimEntidade)
      .set({
        // Dados enriquecidos
        cidade: dadosEnriquecidos.cidade || entidade.cidade,
        uf: dadosEnriquecidos.uf || entidade.uf,
        porte: dadosEnriquecidos.porte || entidade.porte,
        setor: dadosEnriquecidos.setor || entidade.setor,
        produto_principal: dadosEnriquecidos.produto_principal || entidade.produto_principal,
        segmentacao_b2b_b2c: dadosEnriquecidos.segmentacao_b2b_b2c || entidade.segmentacao_b2b_b2c,
        score_qualidade: dadosEnriquecidos.score_qualidade || entidade.score_qualidade,
        
        // Metadados de enriquecimento
        enriquecido: true,
        enriquecido_em: new Date(),
        enriquecido_por: `user_${userId}`,
        origem_processo: dadosEnriquecidos.origem_processo,
        origem_prompt: dadosEnriquecidos.origem_prompt,
        origem_confianca: dadosEnriquecidos.origem_confianca,
        
        // Auditoria
        updated_at: new Date(),
        updated_by: userId,
      })
      .where(eq(dimEntidade.id, entidadeId));

    return {
      sucesso: true,
      entidadeId,
      dados: dadosEnriquecidos,
      tokens,
      custo
    };

  } catch (error: any) {
    console.error(`Erro ao enriquecer entidade ${entidadeId}:`, error);
    
    return {
      sucesso: false,
      entidadeId,
      erro: error.message
    };
  }
}

/**
 * Enriquecer múltiplas entidades em lote
 */
export async function enriquecerLote(
  entidadeIds: number[],
  userId: number
): Promise<ResultadoEnriquecimento[]> {
  const resultados: ResultadoEnriquecimento[] = [];

  for (const id of entidadeIds) {
    const resultado = await enriquecerEntidade(id, userId);
    resultados.push(resultado);
    
    // Delay de 1 segundo entre chamadas (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return resultados;
}

/**
 * Enriquecer todas as entidades não enriquecidas
 */
export async function enriquecerTodasPendentes(
  userId: number,
  limite: number = 100
): Promise<ResultadoEnriquecimento[]> {
  // Buscar entidades não enriquecidas
  const entidades = await db.query.dimEntidade.findMany({
    where: eq(dimEntidade.enriquecido, false),
    limit: limite
  });

  const ids = entidades.map(e => e.id);
  return await enriquecerLote(ids, userId);
}
