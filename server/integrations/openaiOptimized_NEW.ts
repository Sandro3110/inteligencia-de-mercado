// Prompt TESTADO e FUNCIONANDO (do test_api_direct.py)
// Este é o prompt que gerou 100% de sucesso: 30 concorrentes e 18 leads

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

1. **MERCADOS** (3 mercados onde o cliente atua):
   - Nome do mercado
   - Descrição

2. **PRODUTOS** (3 produtos que o cliente oferece):
   - Nome do produto
   - Descrição
   - Categoria

3. **CONCORRENTES** (10 concorrentes por mercado):
   - Nome da empresa
   - CNPJ (formato: 12.345.678/0001-99)
   - Site oficial
   - Cidade
   - UF
   - Produto principal

4. **LEADS** (6 leads por mercado):
   - Nome da empresa
   - CNPJ (formato: 12.345.678/0001-99)
   - Site oficial
   - Cidade
   - UF
   - Produto de interesse

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
        temperature: 0.7,
        response_format: { type: 'json_object' },
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

    return result;
  } catch (error) {
    console.error('[OpenAI] Error generating data:', error);
    throw error;
  }
}
