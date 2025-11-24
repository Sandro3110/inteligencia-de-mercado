/**
 * Módulo de integração com OpenAI GPT-4o-mini
 * Usado para gerar dados reais de mercados, produtos, concorrentes e leads
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Chama a API da OpenAI com GPT-4o-mini
 */
async function callOpenAI(
  messages: OpenAIMessage[],
  temperature = 0.7
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI error: ${error.error?.message || response.statusText}`
      );
    }

    const data: OpenAIResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("OpenAI returned no choices");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("[OpenAI] Error calling API:", error);
    throw error;
  }
}

/**
 * Identifica mercados reais para um cliente
 */
export async function identifyMercados(cliente: {
  nome: string;
  produtoPrincipal?: string;
  siteOficial?: string;
  cidade?: string;
}): Promise<
  Array<{
    nome: string;
    categoria: string;
    segmentacao?: string;
    tamanhoEstimado?: string;
  }>
> {
  const prompt = `Analise esta empresa brasileira e identifique 2-3 mercados específicos onde ela atua:

Empresa: ${cliente.nome}
Produto Principal: ${cliente.produtoPrincipal || "Não informado"}
Site: ${cliente.siteOficial || "Não informado"}
Cidade: ${cliente.cidade || "Não informado"}

Retorne APENAS um JSON array com 2-3 mercados, cada um com:
- nome: nome específico do mercado (ex: "Embalagens Flexíveis para Alimentos")
- categoria: B2B, B2C ou B2G
- segmentacao: público-alvo específico
- tamanhoEstimado: estimativa de tamanho do mercado no Brasil

Formato esperado:
[
  {
    "nome": "Nome do Mercado",
    "categoria": "B2B",
    "segmentacao": "Indústrias alimentícias de médio e grande porte",
    "tamanhoEstimado": "R$ 2-5 bilhões/ano"
  }
]`;

  try {
    const response = await callOpenAI(
      [
        {
          role: "system",
          content:
            "Você é um analista de mercado especializado em identificar oportunidades de negócio no Brasil. Sempre retorne JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      0.7
    );

    // Extrair JSON da resposta (pode vir com markdown)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[OpenAI] Error identifying mercados:", error);
    throw error;
  }
}

/**
 * Gera produtos detalhados para um cliente
 */
export async function generateProdutos(
  cliente: {
    nome: string;
    produtoPrincipal?: string;
    siteOficial?: string;
  },
  mercado: string
): Promise<
  Array<{
    nome: string;
    descricao: string;
    categoria?: string;
  }>
> {
  const prompt = `Baseado nesta empresa e mercado, liste 2-3 produtos/serviços específicos:

Empresa: ${cliente.nome}
Produto Principal: ${cliente.produtoPrincipal || "Não informado"}
Mercado: ${mercado}

Retorne APENAS um JSON array com 2-3 produtos, cada um com:
- nome: nome específico do produto/serviço
- descricao: descrição detalhada (2-3 linhas)
- categoria: categoria do produto

Formato esperado:
[
  {
    "nome": "Nome do Produto",
    "descricao": "Descrição detalhada...",
    "categoria": "Categoria"
  }
]`;

  try {
    const response = await callOpenAI(
      [
        {
          role: "system",
          content:
            "Você é um especialista em produtos industriais e comerciais brasileiros. Sempre retorne JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      0.7
    );

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[OpenAI] Error generating produtos:", error);
    throw error;
  }
}

/**
 * Identifica concorrentes reais para um mercado
 */
export async function identifyConcorrentes(
  mercado: string,
  produto: string,
  quantidade = 10
): Promise<
  Array<{
    nome: string;
    descricao?: string;
    diferenciais?: string;
  }>
> {
  const prompt = `Liste ${quantidade} empresas brasileiras REAIS que competem neste mercado:

Mercado: ${mercado}
Produto: ${produto}

IMPORTANTE: Liste apenas empresas REAIS que existem no Brasil. Não invente nomes.

Retorne APENAS um JSON array com ${quantidade} empresas, cada uma com:
- nome: razão social ou nome fantasia REAL da empresa
- descricao: breve descrição da empresa (1-2 linhas)
- diferenciais: principais diferenciais competitivos

Formato esperado:
[
  {
    "nome": "Nome Real da Empresa",
    "descricao": "Descrição...",
    "diferenciais": "Diferenciais..."
  }
]`;

  try {
    const response = await callOpenAI(
      [
        {
          role: "system",
          content:
            "Você é um especialista em mercado brasileiro com conhecimento profundo de empresas reais. Liste APENAS empresas que realmente existem. Sempre retorne JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      0.5
    ); // Temperatura mais baixa para respostas mais factuais

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[OpenAI] Error identifying concorrentes:", error);
    throw error;
  }
}

/**
 * Gera leads qualificados para um mercado
 */
export async function generateLeads(
  mercado: string,
  produto: string,
  quantidade = 5
): Promise<
  Array<{
    nome: string;
    segmento?: string;
    potencial?: string;
    justificativa?: string;
  }>
> {
  const prompt = `Identifique ${quantidade} empresas brasileiras REAIS que seriam leads qualificados para:

Mercado: ${mercado}
Produto: ${produto}

IMPORTANTE: Liste apenas empresas REAIS que existem no Brasil e que seriam potenciais clientes.

Retorne APENAS um JSON array com ${quantidade} leads, cada um com:
- nome: razão social ou nome fantasia REAL da empresa
- segmento: segmento de atuação
- potencial: Alto, Médio ou Baixo
- justificativa: por que seria um bom lead (1-2 linhas)

Formato esperado:
[
  {
    "nome": "Nome Real da Empresa",
    "segmento": "Segmento",
    "potencial": "Alto",
    "justificativa": "Justificativa..."
  }
]`;

  try {
    const response = await callOpenAI(
      [
        {
          role: "system",
          content:
            "Você é um especialista em prospecção B2B no Brasil com conhecimento de empresas reais. Liste APENAS empresas que realmente existem. Sempre retorne JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      0.5
    );

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[OpenAI] Error generating leads:", error);
    throw error;
  }
}
