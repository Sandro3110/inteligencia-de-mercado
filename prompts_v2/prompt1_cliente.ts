/**
 * PROMPT 1: ENRIQUECIMENTO DE CLIENTE
 *
 * Objetivo: Enriquecer dados básicos do cliente
 * Temperatura: 0.8 (equilíbrio entre precisão e criatividade)
 *
 * Campos Obrigatórios:
 * - nome (já temos)
 * - cnpj (se não souber, use NULL - NÃO INVENTE!)
 * - site (se não souber, use NULL)
 * - cidade
 * - uf
 * - setor
 * - descricao
 */

export const PROMPT_CLIENTE = `
Você é um especialista em pesquisa de mercado B2B brasileiro.

**TAREFA:** Enriquecer dados de uma empresa cliente.

**CLIENTE:**
- Nome: {{clienteNome}}
- CNPJ Parcial: {{clienteCnpj}}

**INSTRUÇÕES CRÍTICAS:**

1. **CNPJ:**
   - Se você SABE o CNPJ completo e válido: retorne no formato 12.345.678/0001-99
   - Se você NÃO TEM CERTEZA: retorne NULL
   - NUNCA invente CNPJs! Melhor NULL do que errado.

2. **Site:**
   - Pesquise o site oficial da empresa
   - Se não encontrar: retorne NULL
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
  "nome": "{{clienteNome}}",
  "cnpj": "12.345.678/0001-99" ou null,
  "site": "https://exemplo.com.br" ou null,
  "cidade": "São Paulo",
  "uf": "SP",
  "setor": "Tecnologia - Software",
  "descricao": "Empresa especializada em..."
}
\`\`\`

**VALIDAÇÃO:**
- Todos os campos devem estar presentes
- CNPJ: formato correto OU null
- Site: URL válida OU null
- Cidade/UF: sempre preenchidos
- Setor: específico e relevante
- Descrição: informativa e concisa

Retorne APENAS o JSON, sem texto adicional.
`;

export interface ClienteEnriquecido {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  setor: string;
  descricao: string;
}
