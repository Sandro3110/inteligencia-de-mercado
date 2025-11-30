/**
 * PROMPT 3: PRODUTOS E SERVIÇOS
 *
 * Objetivo: Identificar 3 principais produtos/serviços do cliente
 * Temperatura: 0.9
 *
 * Regra: EXATAMENTE 3 produtos/serviços
 */

export const PROMPT_PRODUTOS = `
Você é um especialista em análise de portfólio de produtos.

**TAREFA:** Identificar os 3 PRINCIPAIS produtos ou serviços do cliente.

**CLIENTE:**
- Nome: {{clienteNome}}
- Setor: {{clienteSetor}}
- Descrição: {{clienteDescricao}}
- Site: {{clienteSite}}

**INSTRUÇÕES:**

1. **Quantidade:** EXATAMENTE 3 produtos/serviços
   - Não mais, não menos
   - Se a empresa tiver menos, seja criativo mas realista
   - Se tiver mais, escolha os 3 PRINCIPAIS

2. **Para cada produto/serviço:**
   - **nome:** Nome do produto/serviço
   - **descricao:** O que é e para que serve (1-2 frases)
   - **publicoAlvo:** Quem compra/usa (seja específico)
   - **diferenciais:** 2-3 principais diferenciais

3. **Critérios de Seleção:**
   - Produtos/serviços principais (não acessórios)
   - Maior impacto no faturamento
   - Mais relevantes para o mercado

**FORMATO DE RESPOSTA (JSON):**

\`\`\`json
{
  "produtos": [
    {
      "nome": "Sistema ERP Cloud",
      "descricao": "Plataforma de gestão empresarial integrada em nuvem para controle financeiro, estoque e vendas.",
      "publicoAlvo": "Pequenas e médias empresas do varejo e indústria",
      "diferenciais": [
        "Interface intuitiva sem necessidade de treinamento",
        "Integração nativa com e-commerce",
        "Suporte 24/7 em português"
      ]
    },
    {
      "nome": "App Mobile de Vendas",
      "descricao": "Aplicativo para força de vendas externa com catálogo digital e pedidos offline.",
      "publicoAlvo": "Equipes de vendas externas B2B",
      "diferenciais": [
        "Funciona offline com sincronização automática",
        "Catálogo interativo com realidade aumentada",
        "Geolocalização de clientes"
      ]
    },
    {
      "nome": "BI e Analytics",
      "descricao": "Dashboards e relatórios gerenciais com análise preditiva de vendas e estoque.",
      "publicoAlvo": "Gestores e diretores de empresas",
      "diferenciais": [
        "Análise preditiva com IA",
        "Dashboards personalizáveis",
        "Alertas inteligentes em tempo real"
      ]
    }
  ]
}
\`\`\`

**VALIDAÇÃO:**
- Exatamente 3 produtos/serviços
- Cada um com: nome, descrição, público-alvo e diferenciais
- Diferenciais: 2-3 itens por produto
- Descrições claras e específicas

Retorne APENAS o JSON, sem texto adicional.
`;

export interface Produto {
  nome: string;
  descricao: string;
  publicoAlvo: string;
  diferenciais: string[];
}

export interface ProdutosResponse {
  produtos: Produto[];
}
