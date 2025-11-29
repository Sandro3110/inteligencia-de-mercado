// PROTÓTIPO: Batch de múltiplos clientes em 1 chamada OpenAI
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ClienteInput {
  id: number;
  nome: string;
  cnpj?: string;
  siteOficial?: string;
  produtoPrincipal?: string;
  cidade?: string;
  uf?: string;
}

export async function generateBatchDataOptimized(clientes: ClienteInput[]) {
  const prompt = `Você é um especialista em inteligência de mercado B2B. Analise os seguintes ${clientes.length} clientes e para CADA UM deles, gere dados de enriquecimento.

IMPORTANTE: Mantenha os dados SEPARADOS por cliente. Não misture informações entre clientes diferentes.

${clientes
  .map(
    (cliente, idx) => `
CLIENTE ${idx + 1}:
- Nome: ${cliente.nome}
- CNPJ: ${cliente.cnpj || 'Não informado'}
- Site: ${cliente.siteOficial || 'Não informado'}
- Produto Principal: ${cliente.produtoPrincipal || 'Não informado'}
- Localização: ${cliente.cidade || ''}/${cliente.uf || ''}
`
  )
  .join('\n')}

Para CADA cliente acima, retorne um JSON com a seguinte estrutura:

{
  "clientes": [
    {
      "clienteId": ${clientes[0].id},
      "clienteNome": "${clientes[0].nome}",
      "clienteEnriquecido": {
        "siteOficial": "URL completa",
        "produtoPrincipal": "Descrição do produto",
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
      },
      "mercados": [
        {
          "mercado": {
            "nome": "Nome do mercado",
            "categoria": "Categoria",
            "segmentacao": "Segmentação",
            "tamanhoEstimado": "Estimativa de tamanho"
          },
          "produtos": [
            {
              "nome": "Nome do produto",
              "categoria": "Categoria",
              "descricao": "Descrição"
            }
          ],
          "concorrentes": [
            {
              "nome": "Nome do concorrente",
              "siteOficial": "URL",
              "produtoPrincipal": "Produto",
              "cidade": "Cidade",
              "uf": "UF",
              "porte": "Porte",
              "cnae": "CNAE",
              "setor": "Setor",
              "email": "email@concorrente.com",
              "telefone": "(XX) XXXX-XXXX",
              "latitude": -23.5505,
              "longitude": -46.6333
            }
          ],
          "leads": [
            {
              "nome": "Nome do lead",
              "segmento": "Segmento",
              "cnae": "CNAE",
              "potencial": "Alto/Médio/Baixo",
              "porte": "Porte",
              "cidade": "Cidade",
              "uf": "UF",
              "justificativa": "Por que é um lead",
              "latitude": -23.5505,
              "longitude": -46.6333
            }
          ]
        }
      ]
    }
  ]
}

REGRAS IMPORTANTES:
1. Retorne EXATAMENTE ${clientes.length} objetos no array "clientes"
2. Cada objeto DEVE ter o "clienteId" correspondente
3. NÃO misture dados entre clientes diferentes
4. Gere pelo menos 1 mercado por cliente
5. Gere 5-8 concorrentes por mercado
6. Gere 3-5 leads por mercado
7. SEMPRE inclua CNAE (formato XXXX-X/XX)
8. SEMPRE inclua coordenadas (latitude/longitude)
9. Retorne APENAS o JSON, sem texto adicional`;

  console.log(`[OpenAI Batch] Enviando ${clientes.length} clientes para enriquecimento...`);

  const startTime = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em inteligência de mercado B2B. Retorne APENAS JSON válido, sem markdown ou texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 16000,
    });

    const duration = Date.now() - startTime;
    console.log(`[OpenAI Batch] Resposta recebida em ${(duration / 1000).toFixed(1)}s`);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Remover markdown se presente
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(jsonContent);

    if (!parsed.clientes || !Array.isArray(parsed.clientes)) {
      throw new Error('Invalid response structure: missing clientes array');
    }

    if (parsed.clientes.length !== clientes.length) {
      console.warn(
        `[OpenAI Batch] Expected ${clientes.length} clientes, got ${parsed.clientes.length}`
      );
    }

    console.log(`[OpenAI Batch] ✅ ${parsed.clientes.length} clientes enriquecidos`);

    return {
      success: true,
      duration,
      data: parsed.clientes,
    };
  } catch (error) {
    console.error('[OpenAI Batch] ❌ Error:', error);
    return {
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}
