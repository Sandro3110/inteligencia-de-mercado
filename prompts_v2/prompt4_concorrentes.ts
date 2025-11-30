/**
 * PROMPT 4: CONCORRENTES
 *
 * Objetivo: Identificar 5 concorrentes diretos do cliente
 * Temperatura: 1.0 (máxima criatividade para pesquisa)
 *
 * Regras:
 * - EXATAMENTE 5 concorrentes
 * - Empresas DIFERENTES do cliente
 * - Ofertam os MESMOS produtos/serviços
 * - Atuam no MESMO mercado
 * - Campos obrigatórios: site, cidade, UF
 * - CNPJ: NULL se não souber (NÃO INVENTE!)
 */

export const PROMPT_CONCORRENTES = `
Você é um especialista em análise competitiva e inteligência de mercado.

**TAREFA:** Identificar 5 CONCORRENTES DIRETOS do cliente.

**CLIENTE:**
- Nome: {{clienteNome}}
- Setor: {{clienteSetor}}
- Produtos: {{clienteProdutos}}
- Mercado: {{mercadoNome}}

**DEFINIÇÃO DE CONCORRENTE DIRETO:**
- Oferece produtos/serviços SIMILARES
- Atende o MESMO público-alvo
- Atua no MESMO mercado geográfico
- É uma empresa DIFERENTE do cliente (não pode ser o próprio cliente!)

**INSTRUÇÕES CRÍTICAS:**

1. **Quantidade:** EXATAMENTE 5 concorrentes
   - Não mais, não menos
   - Priorize concorrentes brasileiros
   - Misture grandes, médias e pequenas empresas

2. **Unicidade:**
   - Cada concorrente deve ser ÚNICO
   - NÃO repita empresas
   - NÃO inclua o próprio cliente

3. **Campos Obrigatórios:**
   - **nome:** Nome da empresa concorrente
   - **cnpj:** Formato 12.345.678/0001-99 OU null (NÃO INVENTE!)
   - **site:** URL completa OU null
   - **cidade:** Cidade completa (obrigatório)
   - **uf:** Sigla do estado (obrigatório)
   - **produtoPrincipal:** Principal produto/serviço que compete

4. **Validação de Dados:**
   - CNPJ: Se não souber com CERTEZA → null
   - Site: Se não encontrar → null
   - Cidade/UF: SEMPRE preenchidos
   - Produto: Específico e relevante

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "concorrentes": [
    {
      "nome": "Empresa Concorrente 1",
      "cnpj": "12.345.678/0001-99",
      "site": "https://exemplo1.com.br",
      "cidade": "São Paulo",
      "uf": "SP",
      "produtoPrincipal": "Sistema ERP Cloud"
    },
    {
      "nome": "Empresa Concorrente 2",
      "cnpj": null,
      "site": "https://exemplo2.com.br",
      "cidade": "Rio de Janeiro",
      "uf": "RJ",
      "produtoPrincipal": "Plataforma de Gestão Integrada"
    },
    {
      "nome": "Empresa Concorrente 3",
      "cnpj": "98.765.432/0001-10",
      "site": null,
      "cidade": "Belo Horizonte",
      "uf": "MG",
      "produtoPrincipal": "Software de Gestão Empresarial"
    },
    {
      "nome": "Empresa Concorrente 4",
      "cnpj": null,
      "site": "https://exemplo4.com.br",
      "cidade": "Curitiba",
      "uf": "PR",
      "produtoPrincipal": "ERP para PMEs"
    },
    {
      "nome": "Empresa Concorrente 5",
      "cnpj": "11.222.333/0001-44",
      "site": "https://exemplo5.com.br",
      "cidade": "Porto Alegre",
      "uf": "RS",
      "produtoPrincipal": "Sistema de Gestão Cloud"
    }
  ]
}
\`\`\`

**VALIDAÇÃO:**
- Exatamente 5 concorrentes
- Todos diferentes entre si
- Nenhum é o próprio cliente
- Cidade e UF sempre preenchidos
- CNPJ válido OU null (nunca inventado)
- Site válido OU null
- Produto principal específico

Retorne APENAS o JSON, sem texto adicional.
`;

export interface Concorrente {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  produtoPrincipal: string;
}

export interface ConcorrentesResponse {
  concorrentes: Concorrente[];
}
