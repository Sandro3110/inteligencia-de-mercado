import { logger } from '@/lib/logger';

/**
 * Módulo OpenAI OTIMIZADO V2 - Prompt Estruturado de Alta Qualidade
 * - 1 chamada por cliente
 * - SEM validação ReceitaWS (CNPJs dos clientes já estão corretos)
 * - Prompt detalhado para máxima qualidade
 */

interface Cliente {
  nome: string;
  cnpj?: string;
  produtoPrincipal?: string;
  siteOficial?: string;
  cidade?: string;
}

interface ClienteEnriquecidoData {
  siteOficial?: string;
  produtoPrincipal?: string;
  cidade?: string;
  uf?: string;
  regiao?: string;
  porte?: string;
  email?: string;
  telefone?: string;
  linkedin?: string;
  instagram?: string;
  latitude?: number;
  longitude?: number;
}

interface MercadoData {
  nome: string;
  categoria: 'B2B' | 'B2C' | 'B2G';
  segmentacao: string;
  tamanhoEstimado: string;
}

interface ProdutoData {
  nome: string;
  descricao: string;
  categoria: string;
}

interface ConcorrenteData {
  nome: string;
  descricao: string;
  porte?: 'Pequeno' | 'Médio' | 'Grande';
  regiao?: string;
  cidade?: string;
  uf?: string;
  latitude?: number;
  longitude?: number;
}

interface LeadData {
  nome: string;
  segmento: string;
  potencial: 'Alto' | 'Médio' | 'Baixo';
  justificativa: string;
  porte?: 'Pequeno' | 'Médio' | 'Grande';
  cidade?: string;
  uf?: string;
  latitude?: number;
  longitude?: number;
}

interface EnrichmentData {
  clienteEnriquecido: ClienteEnriquecidoData;
  mercados: Array<{
    mercado: MercadoData;
    produtos: ProdutoData[];
    concorrentes: ConcorrenteData[];
    leads: LeadData[];
  }>;
}

/**
 * Gera TODOS os dados de enriquecimento em UMA ÚNICA chamada OpenAI
 * Versão V2: Prompt estruturado para máxima qualidade
 */
export async function generateAllDataOptimized(
  cliente: Cliente,
  retryCount = 0
): Promise<EnrichmentData> {
  const apiKey = process.env.OPENAI_API_KEY;
  const MAX_RETRIES = 2;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const systemPrompt = `Você é um especialista em pesquisa de mercado B2B brasileiro com 20 anos de experiência.

**SUA MISSÃO:**
Analisar empresas brasileiras e gerar inteligência de mercado acionável e de alta qualidade.

**PRINCÍPIOS DE QUALIDADE:**
1. **Especificidade:** Prefira empresas específicas do nicho, não apenas grandes marcas nacionais
2. **Relevância Regional:** Considere a localização da empresa (se regional, liste concorrentes regionais)
3. **Porte Compatível:** Liste empresas de porte similar (pequeno com pequeno, grande com grande)
4. **Competição Direta:** Foque em empresas que competem DIRETAMENTE pelos mesmos clientes
5. **Leads Qualificados:** Leads devem ter MOTIVO REAL para comprar (não apenas "são grandes")
6. **Dados Reais:** NUNCA invente empresas. Se não souber, deixe em branco.

**FORMATO DE RESPOSTA:**
Sempre retorne JSON válido e estruturado conforme especificado.`;

  const userPrompt = `**EMPRESA PARA ANÁLISE:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Nome: ${cliente.nome}
${cliente.cnpj ? `🆔 CNPJ: ${cliente.cnpj}` : ''}
🏭 Produto Principal: ${cliente.produtoPrincipal || 'Não informado - PESQUISE'}
🌐 Site: ${cliente.siteOficial || 'Não informado - PESQUISE'}
📍 Cidade: ${cliente.cidade || 'Brasil - PESQUISE'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TAREFA:**
Gere um relatório completo de inteligência de mercado:

0️⃣ **PRIMEIRO: ENRIQUECER DADOS DO CLIENTE**
   - Pesquise informações reais sobre esta empresa
   - Se não informado, pesquise: site oficial, produto principal, cidade, UF, região
   - Estime: porte (Pequeno/Médio/Grande)
   - Se possível, encontre: email, telefone, LinkedIn, Instagram
   - **IMPORTANTE:** Adicione latitude e longitude aproximadas do centro da cidade onde a empresa está localizada
   - NÃO invente dados - se não encontrar, deixe em branco

1️⃣ **2 MERCADOS PRINCIPAIS** onde esta empresa atua ou pode atuar

Para cada mercado, forneça:

📊 **MERCADO:**
   - Nome específico e descritivo
   - Categoria (B2B, B2C ou B2G)
   - Segmentação (público-alvo detalhado, max 50 chars)
   - Tamanho estimado (valor/volume, max 100 chars)

🎯 **3 PRODUTOS/SERVIÇOS:**
   - Nome comercial
   - Descrição detalhada (benefícios, aplicações)
   - Categoria/tipo

⚔️ **10 CONCORRENTES DIRETOS:**
   **CRITÉRIOS DE SELEÇÃO:**
   - Empresas REAIS que existem no Brasil
   - Competem DIRETAMENTE pelos mesmos clientes
   - Porte SIMILAR (pequeno/médio/grande)
   - Região SIMILAR (se empresa for regional)
   - NÃO liste apenas grandes marcas nacionais
   - NÃO liste empresas de segmentos diferentes
   - Priorize empresas específicas do nicho
   
   Para cada concorrente:
   - Nome oficial da empresa
   - Descrição breve (diferencial, foco)
   - Porte estimado (Pequeno/Médio/Grande)
   - Cidade e UF (se conhecido)
   - Latitude e longitude aproximadas do centro da cidade
   - Região de atuação (se relevante)

💼 **5 LEADS QUALIFICADOS:**
   **CRITÉRIOS DE QUALIFICAÇÃO:**
   - Empresas REAIS que existem no Brasil
   - Têm MOTIVO REAL para comprar (especifique!)
   - Porte adequado (não liste apenas grandes se empresa é pequena)
   - Região adequada (considere logística/atendimento)
   - Segmento compatível com o produto
   
   Para cada lead:
   - Nome oficial da empresa
   - Segmento de atuação
   - Potencial (Alto/Médio/Baixo) baseado em critérios objetivos
   - Justificativa ESPECÍFICA (por que comprariam? qual dor resolve?)
   - Porte estimado (Pequeno/Médio/Grande)
   - Cidade e UF (se conhecido)
   - Latitude e longitude aproximadas do centro da cidade

**FORMATO JSON ESPERADO:**
{
  "clienteEnriquecido": {
    "siteOficial": "https://www.site-real-da-empresa.com.br",
    "produtoPrincipal": "Descrição do produto/serviço principal",
    "cidade": "São Paulo",
    "uf": "SP",
    "regiao": "Sudeste",
    "porte": "Médio",
    "email": "contato@empresa.com.br",
    "telefone": "(11) 1234-5678",
    "linkedin": "https://linkedin.com/company/empresa",
    "instagram": "@empresa",
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "mercados": [
    {
      "mercado": {
        "nome": "Nome específico do mercado (ex: Embalagens Plásticas para Indústria Alimentícia)",
        "categoria": "B2B",
        "segmentacao": "Indústrias de alimentos que precisam...",
        "tamanhoEstimado": "R$ 2,5 bilhões/ano no Brasil"
      },
      "produtos": [
        {
          "nome": "Embalagens Flexíveis Multicamadas",
          "descricao": "Embalagens plásticas com barreira contra umidade e oxigênio, ideais para conservação de alimentos processados. Disponíveis em diversos tamanhos e formatos.",
          "categoria": "Embalagens Flexíveis"
        }
      ],
      "concorrentes": [
        {
          "nome": "Bemis Latin America",
          "descricao": "Líder em embalagens flexíveis, foco em alta barreira",
          "porte": "Grande",
          "cidade": "São Paulo",
          "uf": "SP",
          "latitude": -23.5505,
          "longitude": -46.6333,
          "regiao": "Nacional"
        },
        {
          "nome": "Embalagens XYZ Ltda",
          "descricao": "Especializada em pequenos lotes customizados",
          "porte": "Pequeno",
          "cidade": "São Paulo",
          "uf": "SP",
          "latitude": -23.5505,
          "longitude": -46.6333,
          "regiao": "São Paulo"
        }
      ],
      "leads": [
        {
          "nome": "Nestlé Brasil",
          "segmento": "Indústria Alimentícia",
          "potencial": "Alto",
          "justificativa": "Maior compradora de embalagens do país, busca fornecedores regionais para reduzir custos logísticos. Tem programa de qualificação de fornecedores locais.",
          "porte": "Grande",
          "cidade": "São Paulo",
          "uf": "SP",
          "latitude": -23.5505,
          "longitude": -46.6333
        },
        {
          "nome": "Padaria e Confeitaria ABC",
          "segmento": "Panificação Artesanal",
          "potencial": "Médio",
          "justificativa": "Rede com 15 lojas expandindo para produtos embalados. Precisa de embalagens personalizadas em pequenos volumes.",
          "porte": "Pequeno",
          "cidade": "São Paulo",
          "uf": "SP",
          "latitude": -23.5505,
          "longitude": -46.6333
        }
      ]
    }
  ]
}

**INSTRUÇÕES FINAIS:**
✅ Retorne APENAS o JSON, sem markdown ou explicações
✅ Liste APENAS empresas que você tem certeza que existem
✅ Se não souber o porte/região, omita o campo
✅ Justificativas devem ser ESPECÍFICAS e ACIONÁVEIS
✅ Priorize QUALIDADE sobre quantidade`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.3, // Mais baixa para respostas factuais e consistentes
        max_tokens: 5000, // Aumentado para acomodar descrições detalhadas
        response_format: { type: 'json_object' }, // Força resposta em JSON
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI returned no choices');
    }

    const content = data.choices[0].message.content;

    // Parse JSON
    let result: EnrichmentData;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('[OpenAI] Failed to parse JSON:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validar estrutura
    if (!result.mercados || !Array.isArray(result.mercados)) {
      console.error('[OpenAI] Invalid response structure:', result);
      // Retry se ainda temos tentativas
      if (retryCount < MAX_RETRIES) {
        logger.debug(
          `[OpenAI] ⚠️ Invalid structure, retrying (${retryCount + 1}/${MAX_RETRIES})...`
        );
        return generateAllDataOptimized(cliente, retryCount + 1);
      }
      throw new Error('Invalid response structure: missing mercados array');
    }

    // Garantir que temos pelo menos 1 mercado
    if (result.mercados.length === 0) {
      // Retry com prompt melhorado se ainda temos tentativas
      if (retryCount < MAX_RETRIES) {
        logger.debug(
          `[OpenAI] ⚠️ No mercados returned, retrying (${retryCount + 1}/${MAX_RETRIES})...`
        );
        return generateAllDataOptimized(cliente, retryCount + 1);
      }
      throw new Error('No mercados returned by OpenAI after retries');
    }

    // Limitar a 2 mercados (caso retorne mais)
    result.mercados = result.mercados.slice(0, 2);

    // Validar e limitar cada mercado
    result.mercados = result.mercados.map((m) => ({
      mercado: m.mercado,
      produtos: (m.produtos || []).slice(0, 3),
      concorrentes: (m.concorrentes || []).slice(0, 10),
      leads: (m.leads || []).slice(0, 5),
    }));

    logger.debug(`[OpenAI] ✅ Generated HIGH-QUALITY data for ${cliente.nome}:`);
    logger.debug(`  - ${result.mercados.length} mercados`);
    result.mercados.forEach((m, i) => {
      logger.debug(
        `  - Mercado ${i + 1}: ${m.produtos.length}P ${m.concorrentes.length}C ${m.leads.length}L`
      );
    });

    return result;
  } catch (error) {
    console.error('[OpenAI] Error generating data:', error);
    throw error;
  }
}
