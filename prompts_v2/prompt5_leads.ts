/**
 * PROMPT 5: LEADS (CLIENTES POTENCIAIS)
 *
 * Objetivo: Identificar 5 empresas que COMPRAM os produtos/serviços do cliente
 * Temperatura: 1.0 (máxima criatividade)
 *
 * Regras:
 * - EXATAMENTE 5 leads
 * - Empresas que COMPRAM (não vendem) os produtos do cliente
 * - DIFERENTES do cliente e dos concorrentes
 * - Campos obrigatórios: site, cidade, UF
 * - CNPJ: NULL se não souber (NÃO INVENTE!)
 */

export const PROMPT_LEADS = `
Você é um especialista em prospecção B2B e geração de leads qualificados.

**TAREFA:** Identificar 5 EMPRESAS que são CLIENTES POTENCIAIS (leads) do cliente.

**CLIENTE:**
- Nome: {{clienteNome}}
- Setor: {{clienteSetor}}
- Produtos: {{clienteProdutos}}
- Público-Alvo: {{publicoAlvo}}

**DEFINIÇÃO DE LEAD:**
- Empresa que COMPRA/USA os produtos/serviços do cliente
- NÃO é concorrente (não vende produtos similares)
- NÃO é o próprio cliente
- Tem perfil compatível com o público-alvo
- Tem potencial de compra

**INSTRUÇÕES CRÍTICAS:**

1. **Quantidade:** EXATAMENTE 5 leads
   - Não mais, não menos
   - Priorize empresas brasileiras
   - Varie tamanhos (grandes, médias, pequenas)

2. **Unicidade:**
   - Cada lead deve ser ÚNICO
   - NÃO repita empresas
   - NÃO inclua o cliente
   - NÃO inclua concorrentes

3. **Perfil do Lead:**
   - Empresa que COMPRARIA os produtos do cliente
   - Setor compatível com público-alvo
   - Localização relevante

4. **Campos Obrigatórios:**
   - **nome:** Nome da empresa lead
   - **cnpj:** Formato 12.345.678/0001-99 OU null (NÃO INVENTE!)
   - **site:** URL completa OU null
   - **cidade:** Cidade completa (obrigatório)
   - **uf:** Sigla do estado (obrigatório)
   - **produtoInteresse:** Qual produto do cliente interessa a esse lead

5. **Validação de Dados:**
   - CNPJ: Se não souber com CERTEZA → null
   - Site: Se não encontrar → null
   - Cidade/UF: SEMPRE preenchidos
   - Produto de Interesse: Específico

**EXEMPLO DE RACIOCÍNIO:**

Se o cliente vende "Sistema ERP para Varejo":
- ✅ LEAD: Rede de supermercados (compra ERP)
- ✅ LEAD: Loja de roupas (compra ERP)
- ❌ NÃO É LEAD: Outra empresa de software (é concorrente)
- ❌ NÃO É LEAD: Consultoria de TI (não é público-alvo)

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "leads": [
    {
      "nome": "Rede de Supermercados ABC",
      "cnpj": "12.345.678/0001-99",
      "site": "https://redea bc.com.br",
      "cidade": "São Paulo",
      "uf": "SP",
      "produtoInteresse": "Sistema ERP Cloud"
    },
    {
      "nome": "Lojas de Roupas XYZ",
      "cnpj": null,
      "site": "https://lojasxyz.com.br",
      "cidade": "Rio de Janeiro",
      "uf": "RJ",
      "produtoInteresse": "App Mobile de Vendas"
    },
    {
      "nome": "Distribuidora de Alimentos DEF",
      "cnpj": "98.765.432/0001-10",
      "site": null,
      "cidade": "Belo Horizonte",
      "uf": "MG",
      "produtoInteresse": "BI e Analytics"
    },
    {
      "nome": "Farmácias GHI",
      "cnpj": null,
      "site": "https://farmaciasghi.com.br",
      "cidade": "Curitiba",
      "uf": "PR",
      "produtoInteresse": "Sistema ERP Cloud"
    },
    {
      "nome": "Materiais de Construção JKL",
      "cnpj": "11.222.333/0001-44",
      "site": "https://materiaisjkl.com.br",
      "cidade": "Porto Alegre",
      "uf": "RS",
      "produtoInteresse": "App Mobile de Vendas"
    }
  ]
}
\`\`\`

**VALIDAÇÃO:**
- Exatamente 5 leads
- Todos diferentes entre si
- Nenhum é cliente ou concorrente
- Todos são COMPRADORES potenciais
- Cidade e UF sempre preenchidos
- CNPJ válido OU null (nunca inventado)
- Site válido OU null
- Produto de interesse específico

Retorne APENAS o JSON, sem texto adicional.
`;

export interface Lead {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  produtoInteresse: string;
}

export interface LeadsResponse {
  leads: Lead[];
}
