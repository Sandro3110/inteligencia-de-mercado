/**
 * Enriquecimento Completo com Gemini LLM
 *
 * Este módulo usa a LLM Gemini do Manus para preencher TODOS os campos
 * das tabelas de forma inteligente, com foco em QUALIDADE > QUANTIDADE
 */

import { invokeLLM } from "./_core/llm";

/**
 * Enriquece dados de um CLIENTE usando Gemini
 */
export async function enrichClienteWithGemini(cliente: {
  nome: string;
  cnpj?: string;
  siteOficial?: string;
  cnae?: string;
  cidade?: string;
  uf?: string;
}) {
  const prompt = `Você é um analista de mercado B2B especializado em empresas brasileiras.

EMPRESA: ${cliente.nome}
CNPJ: ${cliente.cnpj || "Não disponível"}
SITE: ${cliente.siteOficial || "Não disponível"}
CNAE: ${cliente.cnae || "Não disponível"}
LOCALIZAÇÃO: ${cliente.cidade || ""}${cliente.uf ? `, ${cliente.uf}` : ""}

Analise esta empresa e retorne um JSON com os seguintes campos preenchidos:

1. produtoPrincipal: Produto ou serviço principal oferecido (máximo 200 caracteres)
2. segmentacaoB2bB2c: "B2B", "B2C" ou "B2B2C" (baseado no tipo de cliente)
3. email: Email corporativo provável (formato: contato@dominio.com.br)
4. telefone: Telefone provável no formato (XX) XXXXX-XXXX
5. linkedin: URL do LinkedIn da empresa (formato: https://linkedin.com/company/nome-empresa)
6. instagram: URL do Instagram da empresa (formato: https://instagram.com/nome_empresa)
7. porte: "Micro", "Pequena", "Média" ou "Grande" (baseado no CNAE e nome)

IMPORTANTE:
- Se não tiver certeza sobre um campo, use "Não disponível"
- Para email/telefone, use o formato correto mesmo que seja estimativa
- Para redes sociais, use o padrão de URL completo
- Seja preciso e conservador nas estimativas

Retorne APENAS o JSON, sem explicações.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que retorna apenas JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cliente_enrichment",
          strict: true,
          schema: {
            type: "object",
            properties: {
              produtoPrincipal: { type: "string" },
              segmentacaoB2bB2c: {
                type: "string",
                enum: ["B2B", "B2C", "B2B2C", "Não disponível"],
              },
              email: { type: "string" },
              telefone: { type: "string" },
              linkedin: { type: "string" },
              instagram: { type: "string" },
              porte: {
                type: "string",
                enum: ["Micro", "Pequena", "Média", "Grande", "Não disponível"],
              },
            },
            required: [
              "produtoPrincipal",
              "segmentacaoB2bB2c",
              "email",
              "telefone",
              "linkedin",
              "instagram",
              "porte",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Gemini retornou resposta vazia");
    }

    const enrichedData = JSON.parse(content as string);

    // Calcular score de qualidade
    let qualidadeScore = 0;
    if (cliente.cnpj) {
      qualidadeScore += 20;
    }
    if (cliente.siteOficial) {
      qualidadeScore += 15;
    }
    if (enrichedData.email && !enrichedData.email.includes("Não disponível")) {
      qualidadeScore += 10;
    }
    if (
      enrichedData.telefone &&
      !enrichedData.telefone.includes("Não disponível")
    ) {
      qualidadeScore += 10;
    }
    if (
      enrichedData.linkedin &&
      !enrichedData.linkedin.includes("Não disponível")
    ) {
      qualidadeScore += 10;
    }
    if (
      enrichedData.produtoPrincipal &&
      !enrichedData.produtoPrincipal.includes("Não disponível")
    ) {
      qualidadeScore += 15;
    }
    if (cliente.cidade) {
      qualidadeScore += 10;
    }
    if (cliente.cnae) {
      qualidadeScore += 10;
    }

    const qualidadeClassificacao =
      qualidadeScore >= 71 ? "Alta" : qualidadeScore >= 41 ? "Média" : "Baixa";

    return {
      ...enrichedData,
      qualidadeScore,
      qualidadeClassificacao,
    };
  } catch (error) {
    console.error("[Gemini] Erro ao enriquecer cliente:", error);
    return null;
  }
}

/**
 * Enriquece dados de um MERCADO usando Gemini
 */
export async function enrichMercadoWithGemini(
  mercadoNome: string,
  produtosClientes: string[]
) {
  const prompt = `Você é um analista de mercado B2B especializado em inteligência competitiva.

MERCADO: ${mercadoNome}
PRODUTOS DOS CLIENTES: ${produtosClientes.slice(0, 10).join(", ")}

Analise este mercado e retorne um JSON com os seguintes campos:

1. segmentacao: "B2B", "B2C" ou "B2B2C"
2. categoria: Categoria principal (ex: "Indústria", "Comércio", "Serviços")
3. tamanhoMercado: Tamanho estimado do mercado no Brasil (ex: "R$ 5 bilhões/ano", "500 mil empresas")
4. crescimentoAnual: Taxa de crescimento anual estimada (ex: "8% ao ano", "Estável", "Em declínio")
5. tendencias: 3-5 principais tendências do mercado (máximo 500 caracteres)
6. principaisPlayers: 5-10 principais empresas do mercado brasileiro (separadas por vírgula)

IMPORTANTE:
- Seja específico e baseado em dados reais do mercado brasileiro
- Se não tiver certeza, use "Informação não disponível"
- Para tendências, foque em tecnologia, sustentabilidade, regulamentação
- Para principais players, liste empresas conhecidas do setor

Retorne APENAS o JSON, sem explicações.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que retorna apenas JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mercado_enrichment",
          strict: true,
          schema: {
            type: "object",
            properties: {
              segmentacao: { type: "string", enum: ["B2B", "B2C", "B2B2C"] },
              categoria: { type: "string" },
              tamanhoMercado: { type: "string" },
              crescimentoAnual: { type: "string" },
              tendencias: { type: "string" },
              principaisPlayers: { type: "string" },
            },
            required: [
              "segmentacao",
              "categoria",
              "tamanhoMercado",
              "crescimentoAnual",
              "tendencias",
              "principaisPlayers",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Gemini retornou resposta vazia");
    }

    return JSON.parse(content as string);
  } catch (error) {
    console.error("[Gemini] Erro ao enriquecer mercado:", error);
    return null;
  }
}

/**
 * Enriquece dados de um CONCORRENTE usando Gemini
 */
export async function enrichConcorrenteWithGemini(concorrente: {
  nome: string;
  site?: string;
  mercadoNome: string;
}) {
  const prompt = `Você é um analista de inteligência competitiva especializado em empresas brasileiras.

EMPRESA: ${concorrente.nome}
SITE: ${concorrente.site || "Não disponível"}
MERCADO: ${concorrente.mercadoNome}

Analise esta empresa concorrente e retorne um JSON com os seguintes campos:

1. produto: Produtos/serviços principais oferecidos (máximo 300 caracteres)
2. porte: "Micro", "Pequena", "Média" ou "Grande"
3. faturamentoEstimado: Faturamento anual estimado (ex: "R$ 10-50 milhões/ano", "Acima de R$ 100 milhões/ano")

IMPORTANTE:
- Seja conservador nas estimativas
- Se não tiver certeza, use "Informação não disponível"
- Para porte, considere presença nacional, número de funcionários estimado
- Para faturamento, use faixas amplas

Retorne APENAS o JSON, sem explicações.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que retorna apenas JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "concorrente_enrichment",
          strict: true,
          schema: {
            type: "object",
            properties: {
              produto: { type: "string" },
              porte: {
                type: "string",
                enum: [
                  "Micro",
                  "Pequena",
                  "Média",
                  "Grande",
                  "Informação não disponível",
                ],
              },
              faturamentoEstimado: { type: "string" },
            },
            required: ["produto", "porte", "faturamentoEstimado"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Gemini retornou resposta vazia");
    }

    const enrichedData = JSON.parse(content as string);

    // Calcular score de qualidade
    let qualidadeScore = 0;
    if (concorrente.site) {
      qualidadeScore += 20;
    }
    if (
      enrichedData.produto &&
      !enrichedData.produto.includes("não disponível")
    ) {
      qualidadeScore += 20;
    }
    if (enrichedData.porte && !enrichedData.porte.includes("não disponível")) {
      qualidadeScore += 15;
    }
    if (
      enrichedData.faturamentoEstimado &&
      !enrichedData.faturamentoEstimado.includes("não disponível")
    ) {
      qualidadeScore += 20;
    }

    const qualidadeClassificacao =
      qualidadeScore >= 71 ? "Alta" : qualidadeScore >= 41 ? "Média" : "Baixa";

    return {
      ...enrichedData,
      qualidadeScore,
      qualidadeClassificacao,
    };
  } catch (error) {
    console.error("[Gemini] Erro ao enriquecer concorrente:", error);
    return null;
  }
}

/**
 * Enriquece dados de um LEAD usando Gemini
 */
export async function enrichLeadWithGemini(lead: {
  nome: string;
  site?: string;
  mercadoNome: string;
}) {
  const prompt = `Você é um analista de prospecção B2B especializado em qualificação de leads.

EMPRESA: ${lead.nome}
SITE: ${lead.site || "Não disponível"}
MERCADO: ${lead.mercadoNome}

Analise este lead e retorne um JSON com os seguintes campos:

1. tipo: "fornecedor", "distribuidor" ou "parceiro"
2. porte: "Micro", "Pequena", "Média" ou "Grande"
3. regiao: Região principal de atuação (ex: "Sudeste", "Nacional", "Sul")
4. setor: Setor de atuação principal (ex: "Indústria Química", "Varejo", "Logística")

IMPORTANTE:
- Baseie-se no nome e site da empresa
- Se não tiver certeza, use "Informação não disponível"
- Para região, considere presença geográfica estimada
- Para setor, seja específico

Retorne APENAS o JSON, sem explicações.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que retorna apenas JSON válido, sem texto adicional.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lead_enrichment",
          strict: true,
          schema: {
            type: "object",
            properties: {
              tipo: {
                type: "string",
                enum: [
                  "fornecedor",
                  "distribuidor",
                  "parceiro",
                  "Informação não disponível",
                ],
              },
              porte: {
                type: "string",
                enum: [
                  "Micro",
                  "Pequena",
                  "Média",
                  "Grande",
                  "Informação não disponível",
                ],
              },
              regiao: { type: "string" },
              setor: { type: "string" },
            },
            required: ["tipo", "porte", "regiao", "setor"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Gemini retornou resposta vazia");
    }

    const enrichedData = JSON.parse(content as string);

    // Calcular score de qualidade
    let qualidadeScore = 0;
    if (lead.site) {
      qualidadeScore += 15;
    }
    if (enrichedData.tipo && !enrichedData.tipo.includes("não disponível")) {
      qualidadeScore += 10;
    }
    if (enrichedData.porte && !enrichedData.porte.includes("não disponível")) {
      qualidadeScore += 10;
    }
    if (enrichedData.setor && !enrichedData.setor.includes("não disponível")) {
      qualidadeScore += 5;
    }

    const qualidadeClassificacao =
      qualidadeScore >= 71 ? "Alta" : qualidadeScore >= 41 ? "Média" : "Baixa";

    return {
      ...enrichedData,
      qualidadeScore,
      qualidadeClassificacao,
    };
  } catch (error) {
    console.error("[Gemini] Erro ao enriquecer lead:", error);
    return null;
  }
}
