/**
 * Helper de Busca Semântica com OpenAI
 * Temperatura: 1.0
 * 100% Funcional
 */

import type { BuscaSemanticaInput, BuscaSemanticaOutput, Filtro } from '../../shared/types/dimensional';

// ============================================================================
// CONFIGURAÇÃO OPENAI
// ============================================================================

const OPENAI_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || '';
const OPENAI_API_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://api.openai.com/v1';

// ============================================================================
// BUSCA SEMÂNTICA
// ============================================================================

export async function interpretarBuscaSemantica(input: BuscaSemanticaInput): Promise<BuscaSemanticaOutput> {
  const prompt = `
Você é um assistente de BI especializado em interpretar consultas em linguagem natural e convertê-las em filtros estruturados.

CONSULTA DO USUÁRIO:
"${input.query}"

INSTRUÇÕES:
1. Identifique os seguintes elementos na consulta:
   - Tipo de entidade (cliente, lead, concorrente)
   - Setor/mercado
   - Região geográfica (país, estado, cidade)
   - Faixa de receita (mínima e máxima)
   - Faixa de score (mínima e máxima)
   - Segmento (A, B, C)
   - Outros filtros relevantes

2. Retorne um JSON no seguinte formato:
{
  "interpretacao": {
    "tipo": "lead" | "cliente" | "concorrente" | null,
    "setor": "string" | null,
    "regiao": ["string"] | null,
    "receitaMin": number | null,
    "receitaMax": number | null,
    "scoreMin": number | null,
    "scoreMax": number | null,
    "segmento": ["A", "B", "C"] | null,
    "outros": {} | null
  },
  "confianca": number (0-100),
  "sugestoes": ["string"] | null
}

3. Se a consulta for ambígua, reduza a confiança e adicione sugestões de refinamento.

4. Seja conservador: se não tiver certeza, retorne null para aquele campo.

EXEMPLOS:

Consulta: "Mostre leads de tecnologia no sul com receita acima de 5M"
Resposta:
{
  "interpretacao": {
    "tipo": "lead",
    "setor": "Tecnologia",
    "regiao": ["Rio Grande do Sul", "Santa Catarina", "Paraná"],
    "receitaMin": 5000000,
    "receitaMax": null,
    "scoreMin": null,
    "scoreMax": null,
    "segmento": null,
    "outros": null
  },
  "confianca": 95,
  "sugestoes": null
}

Consulta: "Empresas grandes"
Resposta:
{
  "interpretacao": {
    "tipo": null,
    "setor": null,
    "regiao": null,
    "receitaMin": 50000000,
    "receitaMax": null,
    "scoreMin": null,
    "scoreMax": null,
    "segmento": null,
    "outros": {
      "porte": "Grande"
    }
  },
  "confianca": 60,
  "sugestoes": [
    "Especifique o tipo: clientes, leads ou concorrentes?",
    "Defina 'grande': por receita, número de funcionários ou outro critério?"
  ]
}

AGORA INTERPRETE A CONSULTA DO USUÁRIO E RETORNE APENAS O JSON (sem markdown, sem explicações).
`.trim();

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de BI especializado em interpretar consultas em linguagem natural.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: input.temperatura || 1.0,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const resultado = JSON.parse(content);

    // Converter interpretação em filtros
    const filtros: Filtro[] = [];

    if (resultado.interpretacao.tipo) {
      filtros.push({
        campo: 'tipoEntidade',
        operador: '=',
        valor: resultado.interpretacao.tipo,
        label: `Tipo: ${resultado.interpretacao.tipo}`
      });
    }

    if (resultado.interpretacao.setor) {
      filtros.push({
        campo: 'mercado.setor',
        operador: 'LIKE',
        valor: `%${resultado.interpretacao.setor}%`,
        label: `Setor: ${resultado.interpretacao.setor}`
      });
    }

    if (resultado.interpretacao.regiao && resultado.interpretacao.regiao.length > 0) {
      filtros.push({
        campo: 'geografia.estado',
        operador: 'IN',
        valor: resultado.interpretacao.regiao,
        label: `Região: ${resultado.interpretacao.regiao.join(', ')}`
      });
    }

    if (resultado.interpretacao.receitaMin !== null) {
      filtros.push({
        campo: 'contexto.receitaPotencialAnual',
        operador: '>=',
        valor: resultado.interpretacao.receitaMin,
        label: `Receita mínima: R$ ${(resultado.interpretacao.receitaMin / 1000000).toFixed(1)}M`
      });
    }

    if (resultado.interpretacao.receitaMax !== null) {
      filtros.push({
        campo: 'contexto.receitaPotencialAnual',
        operador: '<=',
        valor: resultado.interpretacao.receitaMax,
        label: `Receita máxima: R$ ${(resultado.interpretacao.receitaMax / 1000000).toFixed(1)}M`
      });
    }

    if (resultado.interpretacao.scoreMin !== null) {
      filtros.push({
        campo: 'contexto.scoreFit',
        operador: '>=',
        valor: resultado.interpretacao.scoreMin,
        label: `Score mínimo: ${resultado.interpretacao.scoreMin}`
      });
    }

    if (resultado.interpretacao.scoreMax !== null) {
      filtros.push({
        campo: 'contexto.scoreFit',
        operador: '<=',
        valor: resultado.interpretacao.scoreMax,
        label: `Score máximo: ${resultado.interpretacao.scoreMax}`
      });
    }

    if (resultado.interpretacao.segmento && resultado.interpretacao.segmento.length > 0) {
      filtros.push({
        campo: 'contexto.segmentoAbc',
        operador: 'IN',
        valor: resultado.interpretacao.segmento,
        label: `Segmento: ${resultado.interpretacao.segmento.join(', ')}`
      });
    }

    // Outros filtros
    if (resultado.interpretacao.outros) {
      Object.entries(resultado.interpretacao.outros).forEach(([key, value]) => {
        filtros.push({
          campo: key,
          operador: '=',
          valor: value,
          label: `${key}: ${value}`
        });
      });
    }

    return {
      interpretacao: resultado.interpretacao,
      filtros,
      confianca: resultado.confianca || 50,
      sugestoes: resultado.sugestoes || undefined
    };

  } catch (error) {
    console.error('Erro na busca semântica:', error);
    
    // Fallback: retornar interpretação vazia
    return {
      interpretacao: {},
      filtros: [],
      confianca: 0,
      sugestoes: ['Erro ao interpretar a consulta. Tente reformular ou use filtros manuais.']
    };
  }
}

// ============================================================================
// HELPER: GERAR SUGESTÕES DE REFINAMENTO
// ============================================================================

export function gerarSugestoesRefinamento(query: string, resultados: number): string[] {
  const sugestoes: string[] = [];

  if (resultados === 0) {
    sugestoes.push('Nenhum resultado encontrado. Tente:');
    sugestoes.push('• Ampliar a região geográfica');
    sugestoes.push('• Reduzir o score mínimo');
    sugestoes.push('• Aumentar a faixa de receita');
  } else if (resultados > 10000) {
    sugestoes.push('Muitos resultados encontrados. Tente:');
    sugestoes.push('• Especificar uma região mais restrita');
    sugestoes.push('• Aumentar o score mínimo');
    sugestoes.push('• Definir uma faixa de receita específica');
    sugestoes.push('• Filtrar por segmento (A, B ou C)');
  }

  return sugestoes;
}

// ============================================================================
// HELPER: VALIDAR QUERY
// ============================================================================

export function validarQuery(query: string): { valida: boolean; mensagem?: string } {
  if (!query || query.trim().length === 0) {
    return {
      valida: false,
      mensagem: 'A consulta não pode estar vazia'
    };
  }

  if (query.trim().length < 3) {
    return {
      valida: false,
      mensagem: 'A consulta deve ter pelo menos 3 caracteres'
    };
  }

  if (query.length > 500) {
    return {
      valida: false,
      mensagem: 'A consulta não pode ter mais de 500 caracteres'
    };
  }

  return { valida: true };
}
