/**
 * Sistema de Enriquecimento V2 - Prompts Modulares
 *
 * 5 prompts especializados para enriquecimento de dados:
 * 1. Enriquecer Cliente
 * 2. Identificar Mercado
 * 3. Enriquecer Mercado
 * 4. Identificar Concorrentes
 * 5. Identificar Leads (com ciclo fechado)
 */

import OpenAI from 'openai';
import type {
  ClienteInput,
  ClienteEnriquecido,
  Mercado,
  MercadoEnriquecido,
  Produto,
  Concorrente,
  Lead,
} from './types';

/**
 * PROMPT 1: ENRIQUECIMENTO DE CLIENTE
 *
 * Objetivo: Enriquecer dados básicos do cliente
 * Temperatura: 0.3 (alta precisão)
 * Modelo: gpt-4o
 */
export async function prompt1_enriquecerCliente(
  cliente: ClienteInput,
  apiKey: string
): Promise<ClienteEnriquecido> {
  const openai = new OpenAI({ apiKey });

  const prompt = `Você é um especialista em pesquisa de mercado B2B brasileiro.

**TAREFA:** Enriquecer dados de uma empresa cliente.

**CLIENTE:**
- Nome: ${cliente.nome}
- CNPJ: ${cliente.cnpj || 'não informado'}
- Produto Principal: ${cliente.produtoPrincipal || 'não informado'}
- Segmentação: ${cliente.segmentacaoB2BB2C || 'não informado'}

**INSTRUÇÕES CRÍTICAS:**

1. **CNPJ:**
   - Se você SABE o CNPJ completo e válido: retorne no formato 12345678000199 (apenas números)
   - Se você NÃO TEM CERTEZA: retorne null
   - NUNCA invente CNPJs! Melhor null do que errado.
   - Se o cliente já tem CNPJ: PRESERVE-O EXATAMENTE como está

2. **Site:**
   - Pesquise o site oficial da empresa
   - Se não encontrar: retorne null
   - Formato: https://exemplo.com.br

3. **Localização:**
   - Cidade e UF são OBRIGATÓRIOS
   - Use cidade completa (ex: "São Paulo", não "SP")
   - UF em maiúsculas (ex: "SP", "RJ")

4. **Setor:**
   - Identifique o setor principal de atuação
   - Seja específico (ex: "Tecnologia - Software", não apenas "Tecnologia")

5. **Descrição:**
   - 2-3 frases sobre o que a empresa faz
   - Foque em produtos/serviços principais

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "nome": "${cliente.nome}",
  "cnpj": "12345678000199" ou null,
  "site": "https://exemplo.com.br" ou null,
  "cidade": "São Paulo",
  "uf": "SP",
  "setor": "Tecnologia - Software",
  "descricao": "Empresa especializada em..."
}
\`\`\`

Retorne APENAS o JSON, sem texto adicional.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content) as ClienteEnriquecido;
}

/**
 * PROMPT 2: IDENTIFICAR MERCADO
 *
 * Objetivo: Identificar o mercado principal do cliente
 * Temperatura: 0.4
 * Modelo: gpt-4o
 */
export async function prompt2_identificarMercado(
  cliente: ClienteEnriquecido,
  apiKey: string
): Promise<Mercado> {
  const openai = new OpenAI({ apiKey });

  const prompt = `Você é um analista de mercado especializado em segmentação B2B.

**TAREFA:** Identificar o mercado principal onde o cliente atua.

**CLIENTE:**
- Nome: ${cliente.nome}
- Setor: ${cliente.setor}
- Descrição: ${cliente.descricao}

**INSTRUÇÕES:**

1. **Nome do Mercado:**
   - Nome claro e específico
   - Ex: "Software ERP para Varejo", "Embalagens Plásticas Industriais"

2. **Categoria:**
   - Categoria ampla do mercado
   - Ex: "Tecnologia", "Indústria", "Serviços"

3. **Segmentação:**
   - B2B, B2C ou B2B2C
   - Baseado no público-alvo principal

4. **Tamanho do Mercado:**
   - Estimativa em R$ (Brasil)
   - Ex: "R$ 5-10 bilhões no Brasil (2024)"

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "nome": "Software ERP para Varejo",
  "categoria": "Tecnologia",
  "segmentacao": "B2B",
  "tamanhoMercado": "R$ 5-10 bilhões no Brasil (2024)"
}
\`\`\`

Retorne APENAS o JSON, sem texto adicional.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content) as Mercado;
}

/**
 * PROMPT 3: ENRIQUECER MERCADO
 *
 * Objetivo: Enriquecer mercado com tendências, crescimento e players
 * Temperatura: 0.4
 * Modelo: gpt-4o
 */
export async function prompt3_enriquecerMercado(
  mercado: Mercado,
  apiKey: string
): Promise<MercadoEnriquecido> {
  const openai = new OpenAI({ apiKey });

  const prompt = `Você é um analista de mercado especializado em inteligência competitiva.

**TAREFA:** Enriquecer informações sobre um mercado específico.

**MERCADO:**
- Nome: ${mercado.nome}
- Categoria: ${mercado.categoria}
- Segmentação: ${mercado.segmentacao}

**INSTRUÇÕES:**

1. **Crescimento Anual:**
   - Taxa de crescimento anual (CAGR)
   - Ex: "8-12% ao ano (2023-2028)"

2. **Tendências:**
   - EXATAMENTE 5 tendências principais
   - Tendências atuais e relevantes
   - Ex: ["Digitalização", "Sustentabilidade", "IA", "Automação", "Omnichannel"]

3. **Principais Players:**
   - EXATAMENTE 10 principais empresas do mercado
   - Empresas brasileiras e multinacionais atuantes no Brasil
   - Ex: ["Empresa A", "Empresa B", "Empresa C", ...]

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "nome": "${mercado.nome}",
  "categoria": "${mercado.categoria}",
  "segmentacao": "${mercado.segmentacao}",
  "tamanhoMercado": "${mercado.tamanhoMercado}",
  "crescimentoAnual": "8-12% ao ano (2023-2028)",
  "tendencias": [
    "Digitalização e e-commerce",
    "Sustentabilidade e ESG",
    "Automação de processos",
    "Experiência do cliente omnichannel",
    "Inteligência artificial aplicada"
  ],
  "principaisPlayers": [
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
    "Player 5",
    "Player 6",
    "Player 7",
    "Player 8",
    "Player 9",
    "Player 10"
  ]
}
\`\`\`

Retorne APENAS o JSON, sem texto adicional.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content) as MercadoEnriquecido;
}

/**
 * PROMPT 2B: IDENTIFICAR PRODUTOS
 *
 * Objetivo: Identificar 3 produtos principais do cliente
 * Temperatura: 0.5
 * Modelo: gpt-4o
 */
export async function prompt2b_identificarProdutos(
  cliente: ClienteEnriquecido,
  apiKey: string
): Promise<Produto[]> {
  const openai = new OpenAI({ apiKey });

  const prompt = `Você é um especialista em análise de produtos e serviços B2B.

**TAREFA:** Identificar os 3 principais produtos/serviços do cliente.

**CLIENTE:**
- Nome: ${cliente.nome}
- Setor: ${cliente.setor}
- Descrição: ${cliente.descricao}

**INSTRUÇÕES:**

1. **Quantidade:** EXATAMENTE 3 produtos
   - 1 produto principal
   - 2 produtos complementares

2. **Campos Obrigatórios:**
   - **nome:** Nome do produto/serviço
   - **descricao:** Descrição detalhada (2-3 frases)
   - **publicoAlvo:** Quem compra esse produto
   - **diferenciais:** Array com 3 diferenciais principais

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "produtos": [
    {
      "nome": "Produto Principal",
      "descricao": "Descrição detalhada do produto principal...",
      "publicoAlvo": "Empresas de médio e grande porte",
      "diferenciais": ["Alta qualidade", "Preço competitivo", "Atendimento personalizado"]
    },
    {
      "nome": "Produto Complementar 1",
      "descricao": "Descrição do produto complementar...",
      "publicoAlvo": "Clientes atuais",
      "diferenciais": ["Integração completa", "Suporte técnico", "Garantia estendida"]
    },
    {
      "nome": "Produto Complementar 2",
      "descricao": "Descrição do segundo produto complementar...",
      "publicoAlvo": "Novos segmentos",
      "diferenciais": ["Inovação", "Tecnologia", "Sustentabilidade"]
    }
  ]
}
\`\`\`

Retorne APENAS o JSON, sem texto adicional.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content) as { produtos: Produto[] };
  return parsed.produtos;
}

/**
 * PROMPT 4: IDENTIFICAR CONCORRENTES
 *
 * Objetivo: Identificar 5 concorrentes principais
 * Temperatura: 0.4
 * Modelo: gpt-4o
 */
export async function prompt4_identificarConcorrentes(
  mercado: MercadoEnriquecido,
  cliente: ClienteEnriquecido,
  apiKey: string
): Promise<Concorrente[]> {
  const openai = new OpenAI({ apiKey });

  const prompt = `Você é um especialista em análise competitiva e inteligência de mercado.

**TAREFA:** Identificar 5 CONCORRENTES DIRETOS do cliente.

**CLIENTE:**
- Nome: ${cliente.nome}
- Setor: ${cliente.setor}
- Descrição: ${cliente.descricao}

**MERCADO:**
- Nome: ${mercado.nome}
- Principais Players: ${mercado.principaisPlayers.join(', ')}

**INSTRUÇÕES:**

1. **Quantidade:** EXATAMENTE 5 concorrentes
   - Empresas que vendem produtos SIMILARES
   - NÃO inclua o próprio cliente

2. **Campos Obrigatórios:**
   - **nome:** Nome da empresa concorrente
   - **cnpj:** Formato 12345678000199 OU null (NÃO INVENTE!)
   - **site:** URL completa OU null
   - **cidade:** Cidade completa (obrigatório)
   - **uf:** Sigla do estado (obrigatório)
   - **produtoPrincipal:** Produto similar ao do cliente

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "concorrentes": [
    {
      "nome": "Concorrente 1",
      "cnpj": "12345678000199",
      "site": "https://concorrente1.com.br",
      "cidade": "São Paulo",
      "uf": "SP",
      "produtoPrincipal": "Produto similar ao cliente"
    },
    {
      "nome": "Concorrente 2",
      "cnpj": null,
      "site": "https://concorrente2.com.br",
      "cidade": "Rio de Janeiro",
      "uf": "RJ",
      "produtoPrincipal": "Produto similar ao cliente"
    },
    {
      "nome": "Concorrente 3",
      "cnpj": null,
      "site": null,
      "cidade": "Belo Horizonte",
      "uf": "MG",
      "produtoPrincipal": "Produto similar ao cliente"
    },
    {
      "nome": "Concorrente 4",
      "cnpj": null,
      "site": "https://concorrente4.com.br",
      "cidade": "Curitiba",
      "uf": "PR",
      "produtoPrincipal": "Produto similar ao cliente"
    },
    {
      "nome": "Concorrente 5",
      "cnpj": null,
      "site": "https://concorrente5.com.br",
      "cidade": "Porto Alegre",
      "uf": "RS",
      "produtoPrincipal": "Produto similar ao cliente"
    }
  ]
}
\`\`\`

Retorne APENAS o JSON, sem texto adicional.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content) as { concorrentes: Concorrente[] };
  return parsed.concorrentes;
}

/**
 * PROMPT 5: IDENTIFICAR LEADS (COM CICLO FECHADO)
 *
 * Objetivo: Identificar 5 leads, aproveitando players do mercado
 * Temperatura: 0.5
 * Modelo: gpt-4o
 */
export async function prompt5_identificarLeads(
  mercado: MercadoEnriquecido,
  cliente: ClienteEnriquecido,
  concorrentes: Concorrente[],
  produtos: Produto[],
  apiKey: string
): Promise<Lead[]> {
  const openai = new OpenAI({ apiKey });

  const concorrentesNomes = concorrentes.map((c) => c.nome).join(', ');
  const produtosNomes = produtos.map((p) => p.nome).join(', ');

  const prompt = `Você é um especialista em prospecção B2B e geração de leads qualificados.

**TAREFA:** Identificar 5 EMPRESAS que são CLIENTES POTENCIAIS (leads) do cliente.

**CLIENTE:**
- Nome: ${cliente.nome}
- Setor: ${cliente.setor}
- Produtos: ${produtosNomes}

**PRINCIPAIS PLAYERS DO MERCADO:**
${mercado.principaisPlayers.join(', ')}

**CONCORRENTES JÁ IDENTIFICADOS:**
${concorrentesNomes}

**IMPORTANTE:** Os principais players do mercado podem ser leads se forem COMPRADORES potenciais dos produtos do cliente (não concorrentes).

**DEFINIÇÃO DE LEAD:**
- Empresa que COMPRA/USA os produtos/serviços do cliente
- NÃO é concorrente (não vende produtos similares)
- NÃO é o próprio cliente
- Tem perfil compatível com o público-alvo
- Tem potencial de compra

**INSTRUÇÕES CRÍTICAS:**

1. **Quantidade:** EXATAMENTE 5 leads

2. **Unicidade:**
   - NÃO repita empresas
   - NÃO inclua o cliente (${cliente.nome})
   - NÃO inclua concorrentes (${concorrentesNomes})

3. **Perfil do Lead:**
   - Empresa que COMPRARIA os produtos do cliente
   - **PRIORIZE:** Principais players do mercado que são compradores potenciais
   - **COMPLETE:** Com leads adicionais se necessário
   - **Marque fonte:** "PLAYER_DO_MERCADO" ou "PESQUISA_ADICIONAL"

4. **Campos Obrigatórios:**
   - **nome:** Nome da empresa lead
   - **cnpj:** Formato 12345678000199 OU null (NÃO INVENTE!)
   - **site:** URL completa OU null
   - **cidade:** Cidade completa (obrigatório)
   - **uf:** Sigla do estado (obrigatório)
   - **produtoInteresse:** Qual produto do cliente interessa a esse lead
   - **fonte:** "PLAYER_DO_MERCADO" ou "PESQUISA_ADICIONAL"

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "leads": [
    {
      "nome": "Lead 1 (de players)",
      "cnpj": null,
      "site": "https://lead1.com.br",
      "cidade": "São Paulo",
      "uf": "SP",
      "produtoInteresse": "Produto Principal",
      "fonte": "PLAYER_DO_MERCADO"
    },
    {
      "nome": "Lead 2 (de players)",
      "cnpj": null,
      "site": "https://lead2.com.br",
      "cidade": "Rio de Janeiro",
      "uf": "RJ",
      "produtoInteresse": "Produto Principal",
      "fonte": "PLAYER_DO_MERCADO"
    },
    {
      "nome": "Lead 3 (de players)",
      "cnpj": null,
      "site": "https://lead3.com.br",
      "cidade": "Belo Horizonte",
      "uf": "MG",
      "produtoInteresse": "Produto Complementar 1",
      "fonte": "PLAYER_DO_MERCADO"
    },
    {
      "nome": "Lead 4 (adicional)",
      "cnpj": null,
      "site": null,
      "cidade": "Curitiba",
      "uf": "PR",
      "produtoInteresse": "Produto Complementar 2",
      "fonte": "PESQUISA_ADICIONAL"
    },
    {
      "nome": "Lead 5 (adicional)",
      "cnpj": null,
      "site": "https://lead5.com.br",
      "cidade": "Porto Alegre",
      "uf": "RS",
      "produtoInteresse": "Produto Principal",
      "fonte": "PESQUISA_ADICIONAL"
    }
  ]
}
\`\`\`

Retorne APENAS o JSON, sem texto adicional.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content) as { leads: Lead[] };
  return parsed.leads;
}
