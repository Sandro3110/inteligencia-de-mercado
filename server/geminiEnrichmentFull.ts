/**
 * Enriquecimento Completo com Gemini LLM (SEM SerpAPI)
 *
 * Gera concorrentes e leads diretamente via Gemini, com TODOS os campos preenchidos
 * Foco em QUALIDADE > QUANTIDADE
 */

import { invokeLLM } from "./_core/llm";

/**
 * Gera lista de CONCORRENTES reais usando Gemini
 * Retorna empresas brasileiras reais do mercado especificado
 */
export async function generateConcorrentesWithGemini(
  mercadoNome: string,
  quantidade = 5
) {
  const prompt = `Você é um analista de inteligência competitiva especializado no mercado brasileiro.

MERCADO: ${mercadoNome}

Liste ${quantidade} empresas REAIS que atuam neste mercado no Brasil. Para cada empresa, forneça:

1. nome: Razão social ou nome fantasia da empresa
2. cnpj: CNPJ real da empresa (formato XX.XXX.XXX/XXXX-XX) - se souber
3. site: URL do site oficial (formato completo https://...)
4. produto: Produtos/serviços principais (máximo 300 caracteres)
5. porte: "Micro", "Pequena", "Média" ou "Grande"
6. faturamentoEstimado: Faturamento anual estimado (ex: "R$ 10-50 milhões/ano")

IMPORTANTE:
- Liste APENAS empresas reais e conhecidas do mercado brasileiro
- Priorize empresas de médio e grande porte
- Se não souber o CNPJ exato, use "Não disponível"
- Para faturamento, use faixas amplas e realistas
- Seja preciso e conservador nas informações

Retorne um array JSON com ${quantidade} empresas.`;

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
          name: "concorrentes_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              concorrentes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    cnpj: { type: "string" },
                    site: { type: "string" },
                    produto: { type: "string" },
                    porte: {
                      type: "string",
                      enum: [
                        "Micro",
                        "Pequena",
                        "Média",
                        "Grande",
                        "Não disponível",
                      ],
                    },
                    faturamentoEstimado: { type: "string" },
                  },
                  required: [
                    "nome",
                    "cnpj",
                    "site",
                    "produto",
                    "porte",
                    "faturamentoEstimado",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["concorrentes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Gemini retornou resposta vazia");
    }

    const result = JSON.parse(content as string);

    // Calcular score de qualidade para cada concorrente
    const concorrentesComScore = result.concorrentes.map((c: any) => {
      let qualidadeScore = 0;

      if (c.cnpj && !c.cnpj.includes("Não disponível")) {
        qualidadeScore += 25;
      }
      if (c.site && !c.site.includes("Não disponível")) {
        qualidadeScore += 20;
      }
      if (c.produto && !c.produto.includes("Não disponível")) {
        qualidadeScore += 20;
      }
      if (c.porte && !c.porte.includes("Não disponível")) {
        qualidadeScore += 15;
      }
      if (
        c.faturamentoEstimado &&
        !c.faturamentoEstimado.includes("Não disponível")
      ) {
        qualidadeScore += 20;
      }

      const qualidadeClassificacao =
        qualidadeScore >= 71
          ? "Alta"
          : qualidadeScore >= 41
            ? "Média"
            : "Baixa";

      return {
        ...c,
        qualidadeScore,
        qualidadeClassificacao,
      };
    });

    return concorrentesComScore;
  } catch (error) {
    console.error("[Gemini] Erro ao gerar concorrentes:", error);
    return [];
  }
}

/**
 * Gera lista de LEADS reais usando Gemini
 * Retorna potenciais clientes/fornecedores/parceiros brasileiros
 */
export async function generateLeadsWithGemini(
  mercadoNome: string,
  tipo: "fornecedor" | "distribuidor" | "parceiro" = "fornecedor",
  quantidade = 5
) {
  const tipoDescricao = {
    fornecedor: "fornecedores de matéria-prima ou insumos",
    distribuidor: "distribuidores ou revendedores",
    parceiro: "parceiros comerciais ou estratégicos",
  }[tipo];

  const prompt = `Você é um analista de prospecção B2B especializado no mercado brasileiro.

MERCADO: ${mercadoNome}
TIPO DE LEAD: ${tipoDescricao}

Liste ${quantidade} empresas REAIS brasileiras que são ${tipoDescricao} para empresas que atuam em ${mercadoNome}.

Para cada empresa, forneça:

1. nome: Razão social ou nome fantasia
2. cnpj: CNPJ real (formato XX.XXX.XXX/XXXX-XX) - se souber
3. site: URL do site oficial (formato completo https://...)
4. email: Email corporativo provável (formato: contato@dominio.com.br)
5. telefone: Telefone provável (formato: (XX) XXXXX-XXXX)
6. tipo: "${tipo}"
7. porte: "Micro", "Pequena", "Média" ou "Grande"
8. regiao: Região principal de atuação (ex: "Sudeste", "Nacional", "Sul")
9. setor: Setor de atuação (ex: "Química", "Logística", "Embalagens")

IMPORTANTE:
- Liste APENAS empresas reais e conhecidas
- Se não souber CNPJ/email/telefone exatos, use formato válido estimado
- Para região, considere presença geográfica real
- Seja preciso e conservador

Retorne um array JSON com ${quantidade} leads.`;

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
          name: "leads_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              leads: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    cnpj: { type: "string" },
                    site: { type: "string" },
                    email: { type: "string" },
                    telefone: { type: "string" },
                    tipo: { type: "string" },
                    porte: {
                      type: "string",
                      enum: [
                        "Micro",
                        "Pequena",
                        "Média",
                        "Grande",
                        "Não disponível",
                      ],
                    },
                    regiao: { type: "string" },
                    setor: { type: "string" },
                  },
                  required: [
                    "nome",
                    "cnpj",
                    "site",
                    "email",
                    "telefone",
                    "tipo",
                    "porte",
                    "regiao",
                    "setor",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["leads"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Gemini retornou resposta vazia");
    }

    const result = JSON.parse(content as string);

    // Calcular score de qualidade para cada lead
    const leadsComScore = result.leads.map((l: any) => {
      let qualidadeScore = 0;

      if (l.cnpj && !l.cnpj.includes("Não disponível")) {
        qualidadeScore += 20;
      }
      if (l.site && !l.site.includes("Não disponível")) {
        qualidadeScore += 15;
      }
      if (l.email && !l.email.includes("Não disponível")) {
        qualidadeScore += 20;
      }
      if (l.telefone && !l.telefone.includes("Não disponível")) {
        qualidadeScore += 20;
      }
      if (l.tipo && !l.tipo.includes("Não disponível")) {
        qualidadeScore += 10;
      }
      if (l.porte && !l.porte.includes("Não disponível")) {
        qualidadeScore += 10;
      }
      if (l.setor && !l.setor.includes("Não disponível")) {
        qualidadeScore += 5;
      }

      const qualidadeClassificacao =
        qualidadeScore >= 71
          ? "Alta"
          : qualidadeScore >= 41
            ? "Média"
            : "Baixa";

      return {
        ...l,
        qualidadeScore,
        qualidadeClassificacao,
      };
    });

    return leadsComScore;
  } catch (error) {
    console.error("[Gemini] Erro ao gerar leads:", error);
    return [];
  }
}

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
