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
  cnae?: string;
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
  cnae?: string;
  setor?: string;
  email?: string;
  telefone?: string;
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
  cnae?: string;
  cidade?: string;
  uf?: string;
  latitude?: number;
  longitude?: number;
}

interface EnrichmentData {
  clienteEnriquecido: ClienteEnriquecidoData;
  mercados: Array<{
    nome: string;
    descricao: string;
    produtos: ProdutoData[];
    concorrentes: ConcorrenteData[];
    leads: LeadData[];
  }>;
  produtos?: ProdutoData[]; // Produtos globais retornados pela OpenAI
}

/**
 * Gera TODOS os dados de enriquecimento em UMA ÚNICA chamada OpenAI
 * Versão V2: Prompt estruturado para máxima qualidade
 */
export async function generateAllDataOptimized(
  cliente: Cliente,
  retryCount = 0
): Promise<EnrichmentData> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const MAX_RETRIES = 2;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const systemPrompt = `Você é um assistente especializado em análise de mercado B2B. Retorne apenas JSON válido.`;

  const userPrompt = `Você é um especialista em análise de mercado B2B.

CLIENTE: ${cliente.nome}
PRODUTO PRINCIPAL: ${cliente.produtoPrincipal || 'Não informado'}
CIDADE: ${cliente.cidade || 'Brasil'}
SITE: ${cliente.siteOficial || 'Não informado'}

TAREFA: Gerar dados de enriquecimento completos:

1. **MERCADO** (1 mercado CNAE onde o cliente atua):
   - Nome do mercado
   - Descrição

2. **PRODUTOS** (3 produtos que o cliente oferece):
   - Nome do produto
   - Descrição
   - Categoria

3. **CONCORRENTES** (10 concorrentes TOTAIS):
   - Nome da empresa
   - CNPJ (formato: 12.345.678/0001-99)
   - Site oficial
   - Cidade
   - UF
   - Produto principal

4. **LEADS** (6 leads TOTAIS):
   - Nome da empresa
   - CNPJ (formato: 12.345.678/0001-99)
   - Site oficial
   - Cidade
   - UF
   - Produto de interesse

IMPORTANTE:
- Gere EXATAMENTE 1 mercado
- Gere EXATAMENTE 3 produtos
- Gere EXATAMENTE 10 concorrentes (não duplicar)
- Gere EXATAMENTE 6 leads (não duplicar clientes nem concorrentes)

RETORNE EM JSON:
{
  "mercados": [
    {
      "nome": "...",
      "descricao": "...",
      "concorrentes": [{ "nome": "...", "cnpj": "...", "site": "...", "cidade": "...", "uf": "...", "produtoPrincipal": "..." }, ...],
      "leads": [{ "nome": "...", "cnpj": "...", "site": "...", "cidade": "...", "uf": "...", "produtoInteresse": "..." }, ...]
    }
  ],
  "produtos": [{ "nome": "...", "descricao": "...", "categoria": "..." }, ...]
}`;

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
        temperature: 0.8, // Mais criativa para gerar mais concorrentes/leads
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

    // LOG: JSON bruto da OpenAI
    console.log('[OpenAI] RAW JSON Response:', content.substring(0, 1000) + '...');

    // Parse JSON
    let result: EnrichmentData;
    try {
      result = JSON.parse(content);
      console.log('[OpenAI] Parsed mercados count:', result.mercados?.length || 0);
      console.log('[OpenAI] Parsed produtos count:', result.produtos?.length || 0);
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
    console.log(
      '[OpenAI] DEBUG: Raw mercados antes do slice:',
      JSON.stringify(result.mercados, null, 2)
    );

    // CORRIGIDO: Manter estrutura original da OpenAI (não criar nested object)
    result.mercados = result.mercados.map((m) => ({
      nome: m.nome,
      descricao: m.descricao,
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
