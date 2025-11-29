// SISTEMA DE CAMADAS: Prompts especializados para fallback inteligente

interface ClienteBasico {
  nome: string;
  cnpj?: string;
  siteOficial?: string;
  produtoPrincipal?: string;
  cidade?: string;
  uf?: string;
}

// CAMADA 3A: Prompt especializado para gerar APENAS mercados
export async function generateMercadosEspecializados(cliente: ClienteBasico) {
  const prompt = `Você é um especialista em análise de mercado B2B.

CLIENTE:
- Nome: ${cliente.nome}
- Produto: ${cliente.produtoPrincipal || 'Não informado'}
- Localização: ${cliente.cidade || ''}/${cliente.uf || ''}

TAREFA: Identifique os mercados onde este cliente atua e gere concorrentes e leads.

Retorne APENAS JSON válido:

{
  "mercados": [
    {
      "mercado": {
        "nome": "Nome do mercado específico",
        "categoria": "Categoria",
        "segmentacao": "Segmentação detalhada",
        "tamanhoEstimado": "Estimativa"
      },
      "produtos": [
        {
          "nome": "Produto específico",
          "categoria": "Categoria",
          "descricao": "Descrição"
        }
      ],
      "concorrentes": [
        {
          "nome": "Nome COMPLETO do concorrente",
          "siteOficial": "URL completa",
          "produtoPrincipal": "Produto",
          "cidade": "Cidade",
          "uf": "UF",
          "porte": "Pequeno/Médio/Grande",
          "cnae": "XXXX-X/XX",
          "setor": "Setor específico",
          "email": "email@concorrente.com",
          "telefone": "(XX) XXXX-XXXX",
          "latitude": -23.5505,
          "longitude": -46.6333
        }
      ],
      "leads": [
        {
          "nome": "Nome COMPLETO do lead",
          "segmento": "Segmento",
          "cnae": "XXXX-X/XX",
          "potencial": "Alto/Médio/Baixo",
          "porte": "Porte",
          "cidade": "Cidade",
          "uf": "UF",
          "justificativa": "Por que é um lead relevante",
          "latitude": -23.5505,
          "longitude": -46.6333
        }
      ]
    }
  ]
}

IMPORTANTE:
- Gere pelo menos 2 mercados relevantes
- 8-10 concorrentes por mercado
- 5-8 leads por mercado
- SEMPRE inclua CNAE (formato XXXX-X/XX)
- SEMPRE inclua coordenadas reais (latitude/longitude)
- Seja específico e detalhado`;

  console.log(`[Camada 3A] Gerando mercados especializados para: ${cliente.nome}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em mercados B2B. Retorne APENAS JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.statusText}`);
    }

    const data = await response.json();
    const completion = data;

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed = JSON.parse(jsonContent);

    if (!parsed.mercados || parsed.mercados.length === 0) {
      throw new Error('No mercados generated');
    }

    console.log(`[Camada 3A] ✅ ${parsed.mercados.length} mercados gerados`);
    return parsed.mercados;
  } catch (error) {
    console.error('[Camada 3A] ❌ Erro:', error);
    return null;
  }
}

// CAMADA 3B: Prompt especializado para enriquecer dados do cliente
export async function generateDadosClienteEspecializados(cliente: ClienteBasico) {
  const prompt = `Você é um especialista em dados empresariais.

CLIENTE:
- Nome: ${cliente.nome}
- CNPJ: ${cliente.cnpj || 'Não informado'}
- Site: ${cliente.siteOficial || 'Não informado'}
- Produto: ${cliente.produtoPrincipal || 'Não informado'}
- Cidade: ${cliente.cidade || 'Não informado'}
- UF: ${cliente.uf || 'Não informado'}

TAREFA: Complete os dados faltantes do cliente.

Retorne APENAS JSON válido:

{
  "siteOficial": "URL completa do site oficial",
  "produtoPrincipal": "Descrição detalhada do produto principal",
  "cidade": "Nome da cidade",
  "uf": "Sigla UF",
  "regiao": "Região do Brasil",
  "porte": "Pequeno/Médio/Grande",
  "email": "email@empresa.com.br",
  "telefone": "(XX) XXXX-XXXX",
  "linkedin": "URL LinkedIn",
  "instagram": "URL Instagram",
  "cnae": "XXXX-X/XX",
  "latitude": -23.5505,
  "longitude": -46.6333
}

IMPORTANTE:
- SEMPRE inclua CNAE correto (formato XXXX-X/XX)
- SEMPRE inclua coordenadas REAIS da cidade
- Se não souber algum dado, use null
- Seja preciso e baseado em dados reais`;

  console.log(`[Camada 3B] Enriquecendo dados do cliente: ${cliente.nome}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em dados empresariais. Retorne APENAS JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.statusText}`);
    }

    const data = await response.json();
    const completion = data;

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed = JSON.parse(jsonContent);

    console.log(`[Camada 3B] ✅ Dados do cliente enriquecidos`);
    return parsed;
  } catch (error) {
    console.error('[Camada 3B] ❌ Erro:', error);
    return null;
  }
}

// CAMADA 4: Dados mínimos garantidos (fallback final)
export function generateDadosMinimos(cliente: ClienteBasico) {
  console.log(`[Camada 4] Gerando dados mínimos para: ${cliente.nome}`);

  // Estimar CNAE baseado no produto
  let cnaeEstimado = '0000-0/00';
  const produto = (cliente.produtoPrincipal || '').toLowerCase();

  if (produto.includes('embalagem') || produto.includes('plastico')) {
    cnaeEstimado = '2229-3/99'; // Fabricação de artefatos de material plástico
  } else if (produto.includes('alimento') || produto.includes('agricola')) {
    cnaeEstimado = '1099-6/99'; // Fabricação de produtos alimentícios
  } else if (produto.includes('construção') || produto.includes('material')) {
    cnaeEstimado = '2330-3/05'; // Fabricação de artefatos de cimento
  }

  // Mercado genérico baseado no produto
  const mercadoGenerico = {
    mercado: {
      nome: `Mercado de ${cliente.produtoPrincipal || 'Produtos Industriais'}`,
      categoria: 'Indústria',
      segmentacao: 'B2B',
      tamanhoEstimado: 'Médio porte',
    },
    produtos: [
      {
        nome: cliente.produtoPrincipal || 'Produto Industrial',
        categoria: 'Industrial',
        descricao: `Produtos relacionados a ${cliente.produtoPrincipal || 'indústria'}`,
      },
    ],
    concorrentes: [],
    leads: [],
  };

  return {
    clienteEnriquecido: {
      siteOficial: cliente.siteOficial || null,
      produtoPrincipal: cliente.produtoPrincipal || null,
      cidade: cliente.cidade || null,
      uf: cliente.uf || null,
      regiao: cliente.uf ? getRegiaoByUF(cliente.uf) : null,
      porte: 'Médio',
      email: null,
      telefone: null,
      linkedin: null,
      instagram: null,
      cnae: cnaeEstimado,
      latitude: null,
      longitude: null,
    },
    mercados: [mercadoGenerico],
  };
}

function getRegiaoByUF(uf: string): string {
  const regioes: Record<string, string> = {
    SP: 'Sudeste',
    RJ: 'Sudeste',
    MG: 'Sudeste',
    ES: 'Sudeste',
    RS: 'Sul',
    SC: 'Sul',
    PR: 'Sul',
    BA: 'Nordeste',
    CE: 'Nordeste',
    PE: 'Nordeste',
    RN: 'Nordeste',
    PB: 'Nordeste',
    AL: 'Nordeste',
    SE: 'Nordeste',
    MA: 'Nordeste',
    PI: 'Nordeste',
    GO: 'Centro-Oeste',
    MT: 'Centro-Oeste',
    MS: 'Centro-Oeste',
    DF: 'Centro-Oeste',
    AM: 'Norte',
    PA: 'Norte',
    RO: 'Norte',
    AC: 'Norte',
    RR: 'Norte',
    AP: 'Norte',
    TO: 'Norte',
  };
  return regioes[uf.toUpperCase()] || 'Não identificada';
}
