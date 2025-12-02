# 🎯 FASE 5 - PROMPTS COMPLETOS (TEMPERATURA 1.0)

**Temperatura:** 1.0 em TODOS os prompts (máxima qualidade e criatividade)  
**Modelo:** GPT-4o (exceto P6 que usa GPT-4o-mini)  
**Formato:** JSON estruturado  
**Regra de Honestidade:** NULL > dados inventados

---

## 📋 PROMPT 1: ENRIQUECER CLIENTE

**Objetivo:** Preencher 8 campos da dim_entidade  
**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 1.500  
**Custo Estimado:** $0.08

### **INPUT:**
```typescript
{
  nome: string,           // Nome do cliente (da importação)
  projetoNome: string,    // Nome do projeto
  pesquisaNome: string    // Nome da pesquisa
}
```

### **PROMPT:**
```
Você é um analista de dados B2B especializado em empresas brasileiras.

CLIENTE: {nome}
PROJETO: {projetoNome}
PESQUISA: {pesquisaNome}

TAREFA: Enriquecer dados cadastrais do cliente com informações REAIS e VERIFICÁVEIS do Brasil.

CAMPOS A PREENCHER (8):

1. nomeFantasia (string | null):
   - Nome fantasia se diferente da razão social
   - NULL se for o mesmo que o nome

2. cnpj (string | null):
   - Formato: XX.XXX.XXX/XXXX-XX
   - REGRA CRÍTICA: NULL se NÃO TIVER CERTEZA ABSOLUTA
   - NUNCA invente CNPJ

3. email (string | null):
   - Email corporativo oficial
   - NULL se não souber

4. telefone (string | null):
   - Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
   - NULL se não souber

5. site (string | null):
   - URL completa: https://...
   - NULL se não souber

6. numFiliais (number | null):
   - Número de filiais (sem matriz)
   - NULL se não souber

7. numLojas (number | null):
   - Número de lojas físicas
   - NULL se não souber ou não aplicável

8. numFuncionarios (number | null):
   - Número aproximado de funcionários
   - NULL se não souber

REGRAS CRÍTICAS:
- Dados do BRASIL (não de outros países)
- Se NÃO TEM CERTEZA: retorne NULL (honestidade > inventar)
- Seja conservador e preciso
- Use fontes públicas e verificáveis

FORMATO DE SAÍDA (JSON válido):
{
  "nomeFantasia": "string ou null",
  "cnpj": "string ou null",
  "email": "string ou null",
  "telefone": "string ou null",
  "site": "string ou null",
  "numFiliais": number ou null,
  "numLojas": number ou null,
  "numFuncionarios": number ou null
}
```

### **OUTPUT ESPERADO:**
```json
{
  "nomeFantasia": "TOTVS",
  "cnpj": "53.113.791/0001-22",
  "email": "contato@totvs.com",
  "telefone": "(11) 2099-7000",
  "site": "https://www.totvs.com",
  "numFiliais": 45,
  "numLojas": null,
  "numFuncionarios": 10000
}
```

---

## 📋 PROMPT 2: IDENTIFICAR MERCADO FORNECEDOR

**Objetivo:** Criar 1 registro em dim_mercado (7 campos IA)  
**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 2.000  
**Custo Estimado:** $0.11

### **INPUT:**
```typescript
{
  clienteNome: string,
  clienteSite: string | null,
  clienteNumFuncionarios: number | null
}
```

### **PROMPT:**
```
Você é um analista de mercado especializado em inteligência competitiva do Brasil.

CLIENTE: {clienteNome}
SITE: {clienteSite}
FUNCIONÁRIOS: {clienteNumFuncionarios}

TAREFA: Identificar o MERCADO FORNECEDOR onde o cliente ATUA e enriquecê-lo com dados REAIS do Brasil.

DEFINIÇÃO DE MERCADO FORNECEDOR:
- Mercado onde o cliente VENDE seus produtos/serviços
- Mercado onde o cliente COMPETE com outros players
- Mercado onde o cliente é um FORNECEDOR

CAMPOS A PREENCHER (7):

1. nome (string):
   - Nome específico do mercado
   - Exemplo: "Software de Gestão Empresarial (ERP)"
   - Exemplo: "Consultoria em TI"
   - Exemplo: "Indústria de Alimentos - Laticínios"

2. categoria (string):
   - Indústria | Comércio | Serviços | Tecnologia | Agronegócio | Construção | Saúde | Educação | Financeiro

3. segmentacao (string):
   - B2B | B2C | B2B2C

4. tamanhoMercado (string):
   - Tamanho no Brasil em R$ e número de empresas
   - Exemplo: "R$ 15 bilhões/ano, 500 mil empresas usuárias"
   - Exemplo: "R$ 200 milhões/ano, 1.200 empresas"

5. crescimentoAnual (string):
   - Taxa de crescimento anual
   - Exemplo: "12% ao ano (2023-2028)"
   - Exemplo: "Estável, 2-3% ao ano"

6. tendencias (array de strings):
   - 3-5 tendências ATUAIS e CONCRETAS do mercado brasileiro
   - Máximo 500 caracteres total
   - Exemplo: ["Migração para cloud", "Integração com IA", "Mobile-first"]

7. principaisPlayers (array de strings):
   - 5-10 empresas brasileiras LÍDERES do mercado
   - Empresas REAIS que COMPETEM no mesmo mercado
   - Exemplo: ["TOTVS", "SAP Brasil", "Sankhya", "Senior", "Omie"]

REGRAS CRÍTICAS:
- Seja ESPECÍFICO sobre o mercado brasileiro
- Use dados REAIS e ATUALIZADOS (2024-2025)
- Tendências devem ser CONCRETAS (não genéricas como "digitalização")
- Players devem ser empresas REAIS e BRASILEIRAS
- Tamanho de mercado deve ter estimativa fundamentada

FORMATO DE SAÍDA (JSON válido):
{
  "nome": "string",
  "categoria": "string",
  "segmentacao": "string",
  "tamanhoMercado": "string",
  "crescimentoAnual": "string",
  "tendencias": ["string", "string", "string"],
  "principaisPlayers": ["string", "string", "string", "string", "string"]
}
```

### **OUTPUT ESPERADO:**
```json
{
  "nome": "Software de Gestão Empresarial (ERP)",
  "categoria": "Tecnologia",
  "segmentacao": "B2B",
  "tamanhoMercado": "R$ 15 bilhões/ano, 500 mil empresas usuárias no Brasil",
  "crescimentoAnual": "12% ao ano (2023-2028)",
  "tendencias": [
    "Migração para cloud computing",
    "Integração com inteligência artificial",
    "Mobile-first e acesso remoto",
    "Verticalização por setor (varejo, indústria, serviços)",
    "Foco em PMEs e SaaS"
  ],
  "principaisPlayers": [
    "TOTVS",
    "SAP Brasil",
    "Sankhya",
    "Senior Sistemas",
    "Linx",
    "Omie",
    "Bling",
    "Conta Azul"
  ]
}
```

---

## 📋 PROMPT 3: PRODUTOS DO CLIENTE

**Objetivo:** Criar 3 registros em dim_produto (9 campos IA total)  
**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 1.500  
**Custo Estimado:** $0.11

### **INPUT:**
```typescript
{
  clienteNome: string,
  clienteSite: string | null,
  mercadoNome: string
}
```

### **PROMPT:**
```
Você é um especialista em análise de produtos e serviços B2B.

CLIENTE: {clienteNome}
SITE: {clienteSite}
MERCADO: {mercadoNome}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços que o cliente OFERECE ao mercado.

CAMPOS A PREENCHER (para cada produto):

1. nome (string):
   - Nome do produto/serviço
   - Máximo 255 caracteres
   - Exemplo: "TOTVS Protheus"

2. categoria (string):
   - Categoria específica
   - Exemplo: "Software - ERP"
   - Exemplo: "Consultoria - Implementação"
   - Exemplo: "Hardware - Servidores"

3. descricao (text):
   - Descrição DETALHADA e TÉCNICA
   - Máximo 500 caracteres
   - Para que serve, quem usa, benefícios
   - Exemplo: "Sistema integrado de gestão empresarial para PMEs e grandes empresas, com módulos de financeiro, estoque, vendas, compras e produção"

REGRAS CRÍTICAS:
- EXATAMENTE 3 produtos (não mais, não menos)
- Produtos DIFERENTES entre si (não repetir)
- Descrições ESPECÍFICAS e TÉCNICAS (não genéricas)
- Baseado em informações REAIS da empresa
- Se site disponível, use como referência principal
- Priorize produtos PRINCIPAIS (não todos os produtos)

FORMATO DE SAÍDA (JSON válido com 3 produtos):
{
  "produtos": [
    {
      "nome": "string",
      "categoria": "string",
      "descricao": "string"
    },
    {
      "nome": "string",
      "categoria": "string",
      "descricao": "string"
    },
    {
      "nome": "string",
      "categoria": "string",
      "descricao": "string"
    }
  ]
}
```

### **OUTPUT ESPERADO:**
```json
{
  "produtos": [
    {
      "nome": "TOTVS Protheus",
      "categoria": "Software - ERP",
      "descricao": "Sistema integrado de gestão empresarial para PMEs e grandes empresas, com módulos de financeiro, estoque, vendas, compras, produção, RH e folha de pagamento. Suporta múltiplas empresas e filiais."
    },
    {
      "nome": "TOTVS Fluig",
      "categoria": "Software - BPM",
      "descricao": "Plataforma de automação de processos (BPM) e gestão de documentos (ECM). Permite criar workflows customizados, formulários eletrônicos e integração com sistemas legados."
    },
    {
      "nome": "TOTVS Techfin",
      "categoria": "Fintech - Soluções Financeiras",
      "descricao": "Soluções financeiras digitais para pequenas e médias empresas, incluindo antecipação de recebíveis, crédito empresarial, gestão de pagamentos e conciliação bancária automatizada."
    }
  ]
}
```

---

## 📋 PROMPT 4: CONCORRENTES (PLAYERS DO MERCADO FORNECEDOR)

**Objetivo:** Criar 5 concorrentes (5 dim_entidade + 5 fato_entidade_contexto + 5 fato_entidade_competidor)  
**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 3.000  
**Custo Estimado:** $0.21

### **INPUT:**
```typescript
{
  clienteNome: string,
  mercadoNome: string,
  mercadoPlayers: string[],
  produtos: Array<{nome: string, categoria: string}>
}
```

### **PROMPT:**
```
Você é um especialista em inteligência competitiva do Brasil.

CLIENTE (NÃO PODE SER CONCORRENTE): {clienteNome}
MERCADO FORNECEDOR: {mercadoNome}
PRODUTOS DO CLIENTE: {produtos[0].nome}, {produtos[1].nome}, {produtos[2].nome}
PLAYERS DO MERCADO: {mercadoPlayers.join(', ')}

TAREFA: Identificar 5 CONCORRENTES REAIS que atuam no MESMO mercado fornecedor.

DEFINIÇÃO DE CONCORRENTE:
- Empresa DIFERENTE do cliente: {clienteNome}
- Atua no MESMO mercado fornecedor: {mercadoNome}
- Oferece produtos/serviços SIMILARES
- COMPETE COM o cliente por clientes
- Pode ser de qualquer região do Brasil

CAMPOS A PREENCHER (para cada concorrente):

DADOS CADASTRAIS (8 campos):
1. nome (string): Razão social ou nome fantasia
2. nomeFantasia (string | null): Nome fantasia se diferente
3. cidade (string): Cidade (obrigatório)
4. uf (string): Estado 2 letras MAIÚSCULAS (obrigatório)
5. cnpj (string | null): XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
6. site (string | null): https://... - NULL se não souber
7. porte (string | null): Micro | Pequena | Média | Grande - NULL se não souber
8. numFuncionarios (number | null): Número aproximado - NULL se não souber

DADOS DE CONTEXTO (3 campos):
9. cnae (string | null): Código CNAE - NULL se não souber
10. faturamentoEstimado (number | null): Faturamento anual em R$ - NULL se não souber

DADOS DE COMPETIÇÃO (2 campos):
11. produtoPrincipal (string): Principal produto/serviço similar ao cliente
12. nivelCompeticao (string): Direto | Indireto | Potencial
13. diferencial (string | null): Diferencial competitivo (max 500 chars) - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 concorrentes
- NÃO inclua o cliente: {clienteNome}
- NÃO invente CNPJs (use NULL se não tiver certeza)
- Empresas REAIS e DIFERENTES
- Diversifique portes e regiões
- Priorize concorrentes DIRETOS
- Use a lista de players do mercado como referência

FORMATO DE SAÍDA (JSON válido com 5 concorrentes):
{
  "concorrentes": [
    {
      "nome": "string",
      "nomeFantasia": "string ou null",
      "cidade": "string",
      "uf": "string",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "string ou null",
      "numFuncionarios": number ou null,
      "cnae": "string ou null",
      "faturamentoEstimado": number ou null,
      "produtoPrincipal": "string",
      "nivelCompeticao": "string",
      "diferencial": "string ou null"
    },
    ... (mais 4 concorrentes)
  ]
}
```

### **OUTPUT ESPERADO:**
```json
{
  "concorrentes": [
    {
      "nome": "SAP Brasil Ltda",
      "nomeFantasia": "SAP Brasil",
      "cidade": "São Paulo",
      "uf": "SP",
      "cnpj": "59.456.277/0001-55",
      "site": "https://www.sap.com/brazil",
      "porte": "Grande",
      "numFuncionarios": 5000,
      "cnae": "6202-3/00",
      "faturamentoEstimado": 2000000000,
      "produtoPrincipal": "SAP Business One (ERP para PMEs)",
      "nivelCompeticao": "Direto",
      "diferencial": "Marca global consolidada, forte presença em grandes empresas, integração com SAP S/4HANA para escalabilidade"
    },
    {
      "nome": "Sankhya Gestão de Negócios",
      "nomeFantasia": "Sankhya",
      "cidade": "Uberlândia",
      "uf": "MG",
      "cnpj": null,
      "site": "https://www.sankhya.com.br",
      "porte": "Média",
      "numFuncionarios": 800,
      "cnae": null,
      "faturamentoEstimado": null,
      "produtoPrincipal": "Sankhya ERP Cloud",
      "nivelCompeticao": "Direto",
      "diferencial": "100% cloud native, foco em PMEs, preço competitivo, interface moderna"
    },
    {
      "nome": "Senior Sistemas S.A.",
      "nomeFantasia": "Senior",
      "cidade": "Blumenau",
      "uf": "SC",
      "cnpj": "81.333.064/0001-77",
      "site": "https://www.senior.com.br",
      "porte": "Grande",
      "numFuncionarios": 3000,
      "cnae": "6202-3/00",
      "faturamentoEstimado": 800000000,
      "produtoPrincipal": "Senior X (ERP para indústria)",
      "nivelCompeticao": "Direto",
      "diferencial": "Especialização em indústria e manufatura, forte presença no Sul do Brasil, módulos verticalizados"
    },
    {
      "nome": "Linx S.A.",
      "nomeFantasia": "Linx",
      "cidade": "São Paulo",
      "uf": "SP",
      "cnpj": "03.403.007/0001-51",
      "site": "https://www.linx.com.br",
      "porte": "Grande",
      "numFuncionarios": 2500,
      "cnae": "6202-3/00",
      "faturamentoEstimado": 600000000,
      "produtoPrincipal": "Linx ERP (varejo)",
      "nivelCompeticao": "Indireto",
      "diferencial": "Especialização em varejo, integração com e-commerce, soluções omnichannel"
    },
    {
      "nome": "Omie Tecnologia Ltda",
      "nomeFantasia": "Omie",
      "cidade": "São Paulo",
      "uf": "SP",
      "cnpj": null,
      "site": "https://www.omie.com.br",
      "porte": "Média",
      "numFuncionarios": 600,
      "cnae": null,
      "faturamentoEstimado": null,
      "produtoPrincipal": "Omie ERP Online",
      "nivelCompeticao": "Indireto",
      "diferencial": "100% online, foco em micro e pequenas empresas, modelo SaaS acessível, onboarding simplificado"
    }
  ]
}
```

---

## 📋 PROMPT 5: LEADS (PLAYERS DO MERCADO CONSUMIDOR)

**Objetivo:** Criar 5 leads (5 dim_entidade + 5 fato_entidade_contexto)  
**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 3.000  
**Custo Estimado:** $0.21

### **INPUT:**
```typescript
{
  clienteNome: string,
  produtos: Array<{nome: string, descricao: string}>,
  concorrentes: Array<{nome: string}>
}
```

### **PROMPT:**
```
Você é um especialista em prospecção B2B do Brasil.

CLIENTE (FORNECEDOR): {clienteNome}
PRODUTOS OFERECIDOS:
- {produtos[0].nome}: {produtos[0].descricao}
- {produtos[1].nome}: {produtos[1].descricao}
- {produtos[2].nome}: {produtos[2].descricao}

CONCORRENTES (NÃO PODEM SER LEADS):
- {concorrentes[0].nome}
- {concorrentes[1].nome}
- {concorrentes[2].nome}
- {concorrentes[3].nome}
- {concorrentes[4].nome}

TAREFA: Identificar 5 LEADS REAIS (empresas que COMPRAM/USAM os produtos do cliente).

DEFINIÇÃO DE LEAD:
- Empresa que COMPRA ou CONSOME os produtos do cliente
- NÃO é o próprio cliente: {clienteNome}
- NÃO é concorrente (listados acima)
- Tem fit com os produtos oferecidos
- Pode ser de qualquer região do Brasil
- Atua no MERCADO CONSUMIDOR

CAMPOS A PREENCHER (para cada lead):

DADOS CADASTRAIS (8 campos):
1. nome (string): Razão social ou nome fantasia
2. nomeFantasia (string | null): Nome fantasia se diferente
3. cidade (string): Cidade (obrigatório)
4. uf (string): Estado 2 letras MAIÚSCULAS (obrigatório)
5. cnpj (string | null): XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
6. site (string | null): https://... - NULL se não souber
7. porte (string | null): Micro | Pequena | Média | Grande - NULL se não souber
8. numFuncionarios (number | null): Número aproximado - NULL se não souber

DADOS DE CONTEXTO (4 campos):
9. setor (string): Setor de atuação do lead (Indústria, Comércio, Serviços, etc)
10. cnae (string | null): Código CNAE - NULL se não souber
11. faturamentoEstimado (number | null): Faturamento anual em R$ - NULL se não souber

DADOS DE FIT (2 campos):
12. produtoInteresse (string): Qual produto do cliente o lead compraria/usaria
13. motivoFit (string | null): Por que é um bom lead (max 300 chars) - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 leads
- NÃO inclua cliente: {clienteNome}
- NÃO inclua concorrentes (listados acima)
- NÃO invente CNPJs (use NULL)
- Empresas REAIS que usariam os produtos
- Diversifique setores e portes
- Leads devem ser do MERCADO CONSUMIDOR (não fornecedor)

FORMATO DE SAÍDA (JSON válido com 5 leads):
{
  "leads": [
    {
      "nome": "string",
      "nomeFantasia": "string ou null",
      "cidade": "string",
      "uf": "string",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "string ou null",
      "numFuncionarios": number ou null,
      "setor": "string",
      "cnae": "string ou null",
      "faturamentoEstimado": number ou null,
      "produtoInteresse": "string",
      "motivoFit": "string ou null"
    },
    ... (mais 4 leads)
  ]
}
```

### **OUTPUT ESPERADO:**
```json
{
  "leads": [
    {
      "nome": "Companhia de Bebidas das Américas",
      "nomeFantasia": "Ambev",
      "cidade": "São Paulo",
      "uf": "SP",
      "cnpj": "02.808.708/0001-07",
      "site": "https://www.ambev.com.br",
      "porte": "Grande",
      "numFuncionarios": 30000,
      "setor": "Indústria - Bebidas",
      "cnae": "1113-5/01",
      "faturamentoEstimado": 60000000000,
      "produtoInteresse": "TOTVS Protheus (ERP)",
      "motivoFit": "Grande indústria que precisa de gestão integrada de produção, distribuição, logística e financeiro em múltiplas plantas"
    },
    {
      "nome": "Magazine Luiza S.A.",
      "nomeFantasia": "Magazine Luiza",
      "cidade": "Franca",
      "uf": "SP",
      "cnpj": "47.960.950/0001-21",
      "site": "https://www.magazineluiza.com.br",
      "porte": "Grande",
      "numFuncionarios": 40000,
      "setor": "Comércio - Varejo",
      "cnae": "4753-9/00",
      "faturamentoEstimado": 35000000000,
      "produtoInteresse": "TOTVS Protheus (ERP)",
      "motivoFit": "Varejista omnichannel que precisa de gestão integrada de estoque, vendas online/offline, logística e marketplace"
    },
    {
      "nome": "Localiza Rent a Car S.A.",
      "nomeFantasia": "Localiza",
      "cidade": "Belo Horizonte",
      "uf": "MG",
      "cnpj": "16.670.085/0001-55",
      "site": "https://www.localiza.com",
      "porte": "Grande",
      "numFuncionarios": 15000,
      "setor": "Serviços - Locação de Veículos",
      "cnae": "7711-0/00",
      "faturamentoEstimado": 18000000000,
      "produtoInteresse": "TOTVS Fluig (BPM)",
      "motivoFit": "Empresa de serviços que precisa automatizar processos de locação, gestão de frota, manutenção e atendimento ao cliente"
    },
    {
      "nome": "MRV Engenharia e Participações S.A.",
      "nomeFantasia": "MRV",
      "cidade": "Belo Horizonte",
      "uf": "MG",
      "cnpj": "08.343.492/0001-20",
      "site": "https://www.mrv.com.br",
      "porte": "Grande",
      "numFuncionarios": 8000,
      "setor": "Construção Civil",
      "cnae": "4120-4/00",
      "faturamentoEstimado": 7000000000,
      "produtoInteresse": "TOTVS Protheus (ERP)",
      "motivoFit": "Construtora que precisa de gestão de obras, controle de custos, suprimentos, financeiro e relacionamento com clientes"
    },
    {
      "nome": "Natura Cosméticos S.A.",
      "nomeFantasia": "Natura",
      "cidade": "São Paulo",
      "uf": "SP",
      "cnpj": "71.673.990/0001-77",
      "site": "https://www.natura.com.br",
      "porte": "Grande",
      "numFuncionarios": 7000,
      "setor": "Indústria - Cosméticos",
      "cnae": "2063-1/00",
      "faturamentoEstimado": 13000000000,
      "produtoInteresse": "TOTVS Protheus (ERP)",
      "motivoFit": "Indústria com modelo de vendas diretas que precisa de gestão integrada de produção, estoque, rede de consultoras e sustentabilidade"
    }
  ]
}
```

---

## 📋 PROMPT 6: VALIDAÇÃO E SCORE

**Objetivo:** Calcular qualidadeScore e qualidadeClassificacao  
**Modelo:** GPT-4o-mini  
**Temperatura:** 1.0  
**Max Tokens:** 500  
**Custo Estimado:** $0.01

### **INPUT:**
```typescript
{
  cliente: {
    nome: string,
    nomeFantasia: string | null,
    cnpj: string | null,
    email: string | null,
    telefone: string | null,
    site: string | null,
    numFuncionarios: number | null
  },
  contexto: {
    geografiaId: number | null,
    mercadoId: number | null,
    porte: string | null,
    cnae: string | null
  },
  produtos: number, // quantidade de produtos criados
  concorrentes: number, // quantidade de concorrentes criados
  leads: number // quantidade de leads criados
}
```

### **PROMPT:**
```
Você é um validador de qualidade de dados.

DADOS ENRIQUECIDOS:
{JSON completo do cliente}

TAREFA: Calcular score de qualidade (0-100) baseado em completude e precisão.

CRITÉRIOS DE AVALIAÇÃO:

CAMPOS OBRIGATÓRIOS (60 pontos):
- nome: sempre preenchido (10 pontos)
- geografiaId: preenchido? (10 pontos)
- mercadoId: preenchido? (10 pontos)
- porte: preenchido? (10 pontos)
- produtos: 3 criados? (10 pontos)
- concorrentes: 5 criados? (10 pontos)

CAMPOS OPCIONAIS (40 pontos):
- cnpj: preenchido? (10 pontos)
- email: preenchido? (5 pontos)
- telefone: preenchido? (5 pontos)
- site: preenchido? (5 pontos)
- cnae: preenchido? (5 pontos)
- numFuncionarios: preenchido? (5 pontos)
- leads: 5 criados? (5 pontos)

CÁLCULO:
scoreTotal = soma dos pontos (0-100)

CLASSIFICAÇÃO:
- 90-100: "excelente"
- 75-89: "bom"
- 60-74: "aceitavel"
- 0-59: "ruim"

FORMATO DE SAÍDA (JSON):
{
  "qualidadeScore": number (0-100),
  "qualidadeClassificacao": "string",
  "detalhamento": {
    "camposObrigatoriosPreenchidos": number,
    "camposOpcionaisPreenchidos": number,
    "produtosCriados": number,
    "concorrentesCriados": number,
    "leadsCriados": number
  }
}
```

### **OUTPUT ESPERADO:**
```json
{
  "qualidadeScore": 95,
  "qualidadeClassificacao": "excelente",
  "detalhamento": {
    "camposObrigatoriosPreenchidos": 6,
    "camposOpcionaisPreenchidos": 7,
    "produtosCriados": 3,
    "concorrentesCriados": 5,
    "leadsCriados": 5
  }
}
```

---

## 📊 RESUMO DOS PROMPTS

| Prompt | Objetivo | Modelo | Temp | Tokens | Custo | Campos IA |
|--------|----------|--------|------|--------|-------|-----------|
| **P1** | Cliente | GPT-4o | 1.0 | 1.300 | $0.08 | 8 |
| **P2** | Mercado | GPT-4o | 1.0 | 1.800 | $0.11 | 7 |
| **P3** | Produtos | GPT-4o | 1.0 | 1.800 | $0.11 | 9 |
| **P4** | Concorrentes | GPT-4o | 1.0 | 4.000 | $0.21 | 65 |
| **P5** | Leads | GPT-4o | 1.0 | 4.000 | $0.21 | 70 |
| **P6** | Validação | GPT-4o-mini | 1.0 | 700 | $0.01 | 2 |
| **TOTAL** | - | - | - | **13.600** | **$0.73** | **159** |

**Custo por cliente:** $0.73  
**Tempo estimado:** 25-35s  
**Campos preenchidos:** 159 (IA) + 318 (sistema) = 477 campos totais

---

## 🎯 PRÓXIMA ETAPA

Criar arquitetura técnica completa com:
1. Fluxo de processamento detalhado
2. Gravação concomitante
3. Geolocalização fuzzy match
4. BullMQ + Redis
5. Retry inteligente
6. Monitoramento real-time
