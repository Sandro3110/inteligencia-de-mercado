# 🚀 PLANO DE REDESENHO DO SISTEMA DE ENRIQUECIMENTO V2

**Data:** 30 de Novembro de 2025  
**Objetivo:** Qualidade > Quantidade | Modularidade | Regras Rígidas

---

## 📋 REGRAS DE NEGÓCIO DEFINIDAS

### 🎯 Quantificação Esperada (POR CLIENTE)

| Entidade              | Quantidade | Obrigatório |
| --------------------- | ---------- | ----------- |
| **Mercado**           | 1          | ✅ SIM      |
| **Produtos/Serviços** | 3          | ✅ SIM      |
| **Concorrentes**      | 5          | ✅ SIM      |
| **Leads**             | 5          | ✅ SIM      |

**Total por Cliente:** 1 + 3 + 5 + 5 = **14 entidades**

### 🔒 Regras de Unicidade

1. **Mercados são únicos globalmente**
   - Uma vez identificado, não se repete
   - Hash: `mercado_nome + categoria`

2. **Cliente ≠ Lead ≠ Concorrente**
   - Cliente não pode ser Lead
   - Cliente não pode ser Concorrente
   - Lead não pode ser Concorrente
   - Validação por CNPJ/Nome

3. **Cada entidade é única**
   - Não duplicar dentro da mesma pesquisa
   - Validação por hash

### 📝 Campos Obrigatórios

#### Para TODAS as entidades (exceto Mercado):

- ✅ **Nome** (obrigatório)
- ✅ **Site** (obrigatório - se não tem, não inventa!)
- ✅ **Cidade** (obrigatório)
- ✅ **Estado/UF** (obrigatório)
- ✅ **CNPJ** (obrigatório - se não tem, deixa NULL!)

#### Para Mercado:

- ✅ **Nome** (obrigatório)
- ✅ **Categoria** (obrigatório)
- ✅ **Segmentação** (B2B/B2C/B2B2C)
- ✅ **Tamanho do Mercado** (obrigatório)
- ✅ **Crescimento Anual** (obrigatório)
- ✅ **Tendências** (obrigatório)
- ✅ **Principais Players** (obrigatório)

### 🎨 Estratégia de Qualidade

1. **Menos clientes por prompt** (1-3 ao invés de 10+)
2. **Temperatura mais alta** (0.9-1.0 ao invés de 0.7)
3. **Prompts modulares** (1 prompt por tipo de entidade)
4. **Validação rigorosa** (rejeitar se campos obrigatórios vazios)
5. **Ciclo completo** (Prompt → Validação → Geocodificação → Gravação)

---

## 🏗️ ARQUITETURA MODULAR V2

### 📊 Fluxo Atual (PROBLEMA)

```
┌─────────────────────────────────────────────────┐
│  1 PROMPT GIGANTE                               │
│  - 10+ clientes                                 │
│  - Todos os dados de uma vez                    │
│  - Temperatura baixa (0.7)                      │
│  - Sem validação rigorosa                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  GRAVAÇÃO DIRETA                                │
│  - Aceita dados incompletos                     │
│  - Sem geocodificação                           │
│  - Sem validação de unicidade                   │
└─────────────────────────────────────────────────┘
```

**Problemas:**

- ❌ Qualidade baixa (dados incompletos)
- ❌ CNPJs inventados
- ❌ Mercados não enriquecidos
- ❌ Duplicatas não detectadas

### ✅ Fluxo Proposto V2 (SOLUÇÃO)

```
┌─────────────────────────────────────────────────┐
│  FASE 1: ENRIQUECIMENTO DO CLIENTE              │
│  - 1 cliente por vez                            │
│  - Temperatura: 0.8                             │
│  - Campos obrigatórios do schema                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 2: IDENTIFICAÇÃO DO MERCADO               │
│  - 1 mercado por cliente                        │
│  - Temperatura: 0.9                             │
│  - Enriquecimento COMPLETO obrigatório          │
│  - Validação de unicidade (hash)                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 3: PRODUTOS/SERVIÇOS                      │
│  - 3 produtos por cliente                       │
│  - Temperatura: 0.9                             │
│  - Descrição detalhada                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 4: CONCORRENTES                           │
│  - 5 concorrentes por cliente                   │
│  - Temperatura: 1.0 (máxima criatividade)       │
│  - Campos obrigatórios: site, cidade, UF, CNPJ  │
│  - Validação: ≠ Cliente, ≠ Leads                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 5: LEADS                                  │
│  - 5 leads por cliente                          │
│  - Temperatura: 1.0 (máxima criatividade)       │
│  - Campos obrigatórios: site, cidade, UF, CNPJ  │
│  - Validação: ≠ Cliente, ≠ Concorrentes         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 6: VALIDAÇÃO E QUALIFICAÇÃO               │
│  - Verificar campos obrigatórios                │
│  - Calcular score de qualidade                  │
│  - Rejeitar se score < 70%                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 7: GEOCODIFICAÇÃO                         │
│  - JOIN com cidades_brasil                      │
│  - Adicionar latitude/longitude                 │
│  - Validar coordenadas (dentro do Brasil)       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FASE 8: GRAVAÇÃO                               │
│  - Salvar apenas dados validados                │
│  - Registrar histórico                          │
│  - Atualizar contadores                         │
└─────────────────────────────────────────────────┘
```

**Vantagens:**

- ✅ Qualidade alta (validação rigorosa)
- ✅ Dados completos (campos obrigatórios)
- ✅ Sem duplicatas (validação de unicidade)
- ✅ Geocodificação automática
- ✅ Rastreabilidade total

---

## 📝 PROMPTS REDESENHADOS

### 🎯 PROMPT 1: ENRIQUECIMENTO DO CLIENTE

**Objetivo:** Completar dados do cliente

**Temperatura:** 0.8

**Schema de Saída:**

```json
{
  "cliente": {
    "produtoPrincipal": "string (max 200 chars)",
    "segmentacaoB2bB2c": "B2B | B2C | B2B2C",
    "email": "string (formato válido ou NULL)",
    "telefone": "string (formato BR ou NULL)",
    "linkedin": "string (URL completa ou NULL)",
    "instagram": "string (URL completa ou NULL)",
    "porte": "Micro | Pequena | Média | Grande",
    "setor": "string",
    "cnae": "string (código CNAE ou NULL)"
  }
}
```

**Prompt:**

```
Você é um analista de mercado B2B especializado em empresas brasileiras.

EMPRESA: {cliente.nome}
CNPJ: {cliente.cnpj}
SITE: {cliente.siteOficial}
CIDADE: {cliente.cidade}, {cliente.uf}

TAREFA: Enriquecer dados da empresa com informações REAIS e VERIFICÁVEIS.

CAMPOS OBRIGATÓRIOS:
1. produtoPrincipal: Principal produto ou serviço oferecido (máximo 200 caracteres)
2. segmentacaoB2bB2c: "B2B", "B2C" ou "B2B2C" (baseado no tipo de cliente)
3. porte: "Micro", "Pequena", "Média" ou "Grande"
4. setor: Setor de atuação (ex: "Tecnologia", "Indústria", "Comércio")

CAMPOS OPCIONAIS (apenas se VERIFICÁVEIS):
5. email: Email corporativo (formato: contato@dominio.com.br) - NULL se não encontrar
6. telefone: Telefone (formato: (XX) XXXXX-XXXX) - NULL se não encontrar
7. linkedin: URL do LinkedIn (formato: https://linkedin.com/company/nome) - NULL se não encontrar
8. instagram: URL do Instagram (formato: https://instagram.com/nome) - NULL se não encontrar
9. cnae: Código CNAE principal - NULL se não encontrar

REGRAS CRÍTICAS:
- Se não tiver CERTEZA sobre um campo opcional, use NULL
- NÃO invente emails, telefones ou redes sociais
- Seja conservador e preciso
- Baseie-se no site oficial quando disponível

Retorne APENAS JSON válido, sem explicações.
```

---

### 🗺️ PROMPT 2: IDENTIFICAÇÃO E ENRIQUECIMENTO DO MERCADO

**Objetivo:** Identificar 1 mercado único e enriquecê-lo completamente

**Temperatura:** 0.9

**Schema de Saída:**

```json
{
  "mercado": {
    "nome": "string (max 255 chars)",
    "categoria": "string (ex: Indústria, Comércio, Serviços)",
    "segmentacao": "B2B | B2C | B2B2C",
    "tamanhoMercado": "string (ex: R$ 5 bi/ano, 500 mil empresas)",
    "crescimentoAnual": "string (ex: 8% ao ano, Estável, Em declínio)",
    "tendencias": "string (3-5 tendências, max 500 chars)",
    "principaisPlayers": "string (5-10 empresas, separadas por vírgula)"
  }
}
```

**Prompt:**

```
Você é um analista de mercado B2B especializado em inteligência competitiva do Brasil.

EMPRESA: {cliente.nome}
PRODUTO PRINCIPAL: {cliente.produtoPrincipal}
SETOR: {cliente.setor}
CIDADE: {cliente.cidade}, {cliente.uf}

TAREFA: Identificar o MERCADO PRINCIPAL onde esta empresa atua e enriquecê-lo com dados REAIS do Brasil.

CAMPOS OBRIGATÓRIOS:
1. nome: Nome do mercado (ex: "Automação Industrial", "E-commerce B2B")
2. categoria: Categoria principal ("Indústria", "Comércio", "Serviços", "Tecnologia")
3. segmentacao: "B2B", "B2C" ou "B2B2C"
4. tamanhoMercado: Tamanho estimado no Brasil (ex: "R$ 5 bilhões/ano", "500 mil empresas")
5. crescimentoAnual: Taxa de crescimento (ex: "8% ao ano", "Estável", "Em declínio 3%")
6. tendencias: 3-5 principais tendências do mercado brasileiro (máximo 500 caracteres)
   - Foque em: tecnologia, sustentabilidade, regulamentação, comportamento do consumidor
7. principaisPlayers: 5-10 principais empresas do mercado brasileiro (separadas por vírgula)
   - Liste empresas REAIS e CONHECIDAS do setor

REGRAS CRÍTICAS:
- Seja ESPECÍFICO sobre o mercado brasileiro
- Use dados REAIS e ATUALIZADOS (2024-2025)
- Tendências devem ser CONCRETAS e VERIFICÁVEIS
- Principais players devem ser empresas REAIS
- NÃO invente dados - se não souber, use estimativas conservadoras

Retorne APENAS JSON válido, sem explicações.
```

---

### 📦 PROMPT 3: PRODUTOS/SERVIÇOS

**Objetivo:** Identificar 3 principais produtos/serviços

**Temperatura:** 0.9

**Schema de Saída:**

```json
{
  "produtos": [
    {
      "nome": "string (max 255 chars)",
      "descricao": "string (max 500 chars)",
      "categoria": "string"
    }
  ]
}
```

**Prompt:**

```
Você é um especialista em análise de produtos e serviços B2B.

EMPRESA: {cliente.nome}
PRODUTO PRINCIPAL: {cliente.produtoPrincipal}
MERCADO: {mercado.nome}
SITE: {cliente.siteOficial}

TAREFA: Identificar os 3 PRINCIPAIS produtos ou serviços que esta empresa oferece.

CAMPOS OBRIGATÓRIOS (para cada produto):
1. nome: Nome do produto/serviço (máximo 255 caracteres)
2. descricao: Descrição detalhada (máximo 500 caracteres)
3. categoria: Categoria do produto (ex: "Software", "Consultoria", "Equipamento")

REGRAS CRÍTICAS:
- Liste EXATAMENTE 3 produtos/serviços
- Produtos devem ser DIFERENTES entre si
- Baseie-se no site oficial quando disponível
- Descrições devem ser ESPECÍFICAS e TÉCNICAS
- Categorias devem ser CLARAS e PADRONIZADAS

EXEMPLO DE SAÍDA:
{
  "produtos": [
    {
      "nome": "Sistema ERP Cloud",
      "descricao": "Solução completa de gestão empresarial em nuvem com módulos de financeiro, estoque, vendas e RH",
      "categoria": "Software"
    },
    ...
  ]
}

Retorne APENAS JSON válido com EXATAMENTE 3 produtos.
```

---

### 🏢 PROMPT 4: CONCORRENTES

**Objetivo:** Identificar 5 concorrentes únicos

**Temperatura:** 1.0 (máxima criatividade)

**Schema de Saída:**

```json
{
  "concorrentes": [
    {
      "nome": "string (max 255 chars)",
      "cnpj": "string (formato XX.XXX.XXX/XXXX-XX) ou NULL",
      "site": "string (URL completa) ou NULL",
      "cidade": "string",
      "uf": "string (2 chars)",
      "produtoPrincipal": "string",
      "porte": "Micro | Pequena | Média | Grande"
    }
  ]
}
```

**Prompt:**

```
Você é um especialista em inteligência competitiva do mercado brasileiro.

CLIENTE (NÃO PODE SER CONCORRENTE): {cliente.nome}
MERCADO: {mercado.nome}
PRODUTOS DO CLIENTE: {produtos.map(p => p.nome).join(', ')}
REGIÃO: {cliente.cidade}, {cliente.uf}

TAREFA: Identificar 5 CONCORRENTES REAIS que atuam no mesmo mercado oferecendo produtos/serviços similares.

DEFINIÇÃO DE CONCORRENTE:
- Empresa DIFERENTE do cliente
- Oferece produtos/serviços SIMILARES
- Atua no MESMO mercado
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada concorrente):
1. nome: Razão social ou nome fantasia da empresa
2. cidade: Cidade onde a empresa está localizada
3. uf: Estado (2 letras maiúsculas, ex: SP, RJ, MG)
4. produtoPrincipal: Principal produto/serviço oferecido

CAMPOS OPCIONAIS (apenas se VERIFICÁVEIS):
5. cnpj: CNPJ no formato XX.XXX.XXX/XXXX-XX - NULL se não souber
6. site: Site oficial completo (https://...) - NULL se não souber
7. porte: "Micro", "Pequena", "Média" ou "Grande" - NULL se não souber

REGRAS CRÍTICAS:
- Liste EXATAMENTE 5 concorrentes
- Concorrentes devem ser empresas REAIS e DIFERENTES
- NÃO inclua o cliente ({cliente.nome})
- NÃO invente CNPJs - use NULL se não souber
- NÃO invente sites - use NULL se não souber
- Priorize concorrentes CONHECIDOS do mercado
- Se não souber o CNPJ ou site, deixe NULL

EXEMPLO DE SAÍDA:
{
  "concorrentes": [
    {
      "nome": "Empresa Concorrente A",
      "cnpj": NULL,
      "site": "https://www.concorrentea.com.br",
      "cidade": "São Paulo",
      "uf": "SP",
      "produtoPrincipal": "Software de gestão empresarial",
      "porte": "Grande"
    },
    ...
  ]
}

Retorne APENAS JSON válido com EXATAMENTE 5 concorrentes DIFERENTES.
```

---

### 🎯 PROMPT 5: LEADS

**Objetivo:** Identificar 5 leads únicos (potenciais clientes)

**Temperatura:** 1.0 (máxima criatividade)

**Schema de Saída:**

```json
{
  "leads": [
    {
      "nome": "string (max 255 chars)",
      "cnpj": "string (formato XX.XXX.XXX/XXXX-XX) ou NULL",
      "site": "string (URL completa) ou NULL",
      "cidade": "string",
      "uf": "string (2 chars)",
      "produtoInteresse": "string",
      "porte": "Micro | Pequena | Média | Grande",
      "setor": "string"
    }
  ]
}
```

**Prompt:**

```
Você é um especialista em prospecção B2B do mercado brasileiro.

CLIENTE (FORNECEDOR): {cliente.nome}
PRODUTOS OFERECIDOS: {produtos.map(p => p.nome).join(', ')}
MERCADO: {mercado.nome}
REGIÃO: {cliente.cidade}, {cliente.uf}

CONCORRENTES (NÃO PODEM SER LEADS): {concorrentes.map(c => c.nome).join(', ')}

TAREFA: Identificar 5 LEADS REAIS (empresas que COMPRAM os produtos/serviços do cliente).

DEFINIÇÃO DE LEAD:
- Empresa que COMPRA/CONSOME os produtos do cliente
- NÃO é o próprio cliente
- NÃO é concorrente (não oferece os mesmos produtos)
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada lead):
1. nome: Razão social ou nome fantasia da empresa
2. cidade: Cidade onde a empresa está localizada
3. uf: Estado (2 letras maiúsculas, ex: SP, RJ, MG)
4. produtoInteresse: Qual produto do cliente este lead compraria
5. setor: Setor de atuação do lead

CAMPOS OPCIONAIS (apenas se VERIFICÁVEIS):
6. cnpj: CNPJ no formato XX.XXX.XXX/XXXX-XX - NULL se não souber
7. site: Site oficial completo (https://...) - NULL se não souber
8. porte: "Micro", "Pequena", "Média" ou "Grande" - NULL se não souber

REGRAS CRÍTICAS:
- Liste EXATAMENTE 5 leads
- Leads devem ser empresas REAIS e DIFERENTES
- NÃO inclua o cliente ({cliente.nome})
- NÃO inclua concorrentes: {concorrentes.map(c => c.nome).join(', ')}
- NÃO invente CNPJs - use NULL se não souber
- NÃO invente sites - use NULL se não souber
- Priorize empresas CONHECIDAS que usariam os produtos
- produtoInteresse deve ser um dos produtos: {produtos.map(p => p.nome).join(', ')}

EXEMPLO DE SAÍDA:
{
  "leads": [
    {
      "nome": "Indústria XYZ Ltda",
      "cnpj": NULL,
      "site": "https://www.industriaxyz.com.br",
      "cidade": "Campinas",
      "uf": "SP",
      "produtoInteresse": "Sistema ERP Cloud",
      "porte": "Média",
      "setor": "Indústria de Alimentos"
    },
    ...
  ]
}

Retorne APENAS JSON válido com EXATAMENTE 5 leads DIFERENTES.
```

---

## ✅ SISTEMA DE VALIDAÇÃO E QUALIFICAÇÃO

### 📊 Score de Qualidade (0-100)

**Fórmula:**

```
Score = (Campos Preenchidos / Campos Totais) * 100
```

**Pesos por Campo:**

- Campos obrigatórios: 10 pontos cada
- Campos opcionais: 5 pontos cada

**Critérios de Aceitação:**

- ✅ Score >= 70: Aceitar
- ⚠️ Score 50-69: Aceitar com aviso
- ❌ Score < 50: Rejeitar e tentar novamente

### 🔍 Validações Obrigatórias

**Para Clientes:**

```typescript
validarCliente(cliente) {
  const erros = [];

  // Campos obrigatórios
  if (!cliente.nome) erros.push('Nome obrigatório');
  if (!cliente.produtoPrincipal) erros.push('Produto principal obrigatório');
  if (!cliente.porte) erros.push('Porte obrigatório');
  if (!cliente.setor) erros.push('Setor obrigatório');

  // Validações de formato
  if (cliente.email && !validarEmail(cliente.email)) {
    erros.push('Email inválido');
  }

  if (cliente.telefone && !validarTelefone(cliente.telefone)) {
    erros.push('Telefone inválido');
  }

  return erros;
}
```

**Para Mercados:**

```typescript
validarMercado(mercado) {
  const erros = [];

  // TODOS os campos são obrigatórios
  if (!mercado.nome) erros.push('Nome obrigatório');
  if (!mercado.categoria) erros.push('Categoria obrigatória');
  if (!mercado.segmentacao) erros.push('Segmentação obrigatória');
  if (!mercado.tamanhoMercado) erros.push('Tamanho do mercado obrigatório');
  if (!mercado.crescimentoAnual) erros.push('Crescimento anual obrigatório');
  if (!mercado.tendencias) erros.push('Tendências obrigatórias');
  if (!mercado.principaisPlayers) erros.push('Principais players obrigatórios');

  // Validação de unicidade
  const hash = gerarHash(mercado.nome, mercado.categoria);
  if (mercadoJaExiste(hash)) {
    erros.push('Mercado já existe - reutilizar');
  }

  return erros;
}
```

**Para Concorrentes/Leads:**

```typescript
validarEntidade(entidade, tipo) {
  const erros = [];

  // Campos obrigatórios
  if (!entidade.nome) erros.push('Nome obrigatório');
  if (!entidade.cidade) erros.push('Cidade obrigatória');
  if (!entidade.uf) erros.push('UF obrigatória');

  // Validação de UF
  if (entidade.uf && entidade.uf.length !== 2) {
    erros.push('UF deve ter 2 caracteres');
  }

  // Validação de CNPJ (se preenchido)
  if (entidade.cnpj && !validarCNPJ(entidade.cnpj)) {
    erros.push('CNPJ inválido - melhor deixar NULL');
  }

  // Validação de site (se preenchido)
  if (entidade.site && !validarURL(entidade.site)) {
    erros.push('Site inválido');
  }

  // Validação de unicidade
  if (entidadeJaExiste(entidade.nome, tipo)) {
    erros.push('Entidade duplicada');
  }

  // Validação de não ser cliente
  if (tipo === 'concorrente' || tipo === 'lead') {
    if (entidade.nome === cliente.nome) {
      erros.push('Não pode ser o próprio cliente');
    }
  }

  // Validação de não ser concorrente (para leads)
  if (tipo === 'lead') {
    if (concorrenteJaExiste(entidade.nome)) {
      erros.push('Lead não pode ser concorrente');
    }
  }

  return erros;
}
```

---

## 🔄 FLUXO CÍCLICO COMPLETO

### 📋 Pseudocódigo

```typescript
async function enrichClienteCiclo(clienteId: number) {
  const cliente = await buscarCliente(clienteId);
  const resultado = {
    cliente: null,
    mercado: null,
    produtos: [],
    concorrentes: [],
    leads: [],
    erros: [],
    score: 0,
  };

  try {
    // ============================================
    // FASE 1: ENRIQUECER CLIENTE
    // ============================================
    console.log('[FASE 1] Enriquecendo cliente...');
    const clienteEnriquecido = await openai.chat({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: PROMPT_1_CLIENTE(cliente) },
      ],
      response_format: { type: 'json_object' },
    });

    // Validar cliente
    const errosCliente = validarCliente(clienteEnriquecido);
    if (errosCliente.length > 0) {
      throw new Error(`Cliente inválido: ${errosCliente.join(', ')}`);
    }

    // Atualizar cliente no banco
    await atualizarCliente(clienteId, clienteEnriquecido);
    resultado.cliente = clienteEnriquecido;

    // ============================================
    // FASE 2: IDENTIFICAR E ENRIQUECER MERCADO
    // ============================================
    console.log('[FASE 2] Identificando mercado...');
    const mercadoData = await openai.chat({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: PROMPT_2_MERCADO(cliente, clienteEnriquecido) },
      ],
      response_format: { type: 'json_object' },
    });

    // Validar mercado
    const errosMercado = validarMercado(mercadoData.mercado);
    if (errosMercado.length > 0) {
      throw new Error(`Mercado inválido: ${errosMercado.join(', ')}`);
    }

    // Criar ou reutilizar mercado
    const mercado = await criarOuReutilizarMercado(mercadoData.mercado);
    resultado.mercado = mercado;

    // Associar cliente ao mercado
    await associarClienteMercado(clienteId, mercado.id);

    // ============================================
    // FASE 3: PRODUTOS/SERVIÇOS
    // ============================================
    console.log('[FASE 3] Identificando produtos...');
    const produtosData = await openai.chat({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: PROMPT_3_PRODUTOS(cliente, mercado) },
      ],
      response_format: { type: 'json_object' },
    });

    // Validar quantidade
    if (produtosData.produtos.length !== 3) {
      throw new Error(`Esperado 3 produtos, recebido ${produtosData.produtos.length}`);
    }

    // Criar produtos
    for (const produto of produtosData.produtos) {
      const novoProduto = await criarProduto({
        ...produto,
        clienteId,
        mercadoId: mercado.id,
      });
      resultado.produtos.push(novoProduto);
    }

    // ============================================
    // FASE 4: CONCORRENTES
    // ============================================
    console.log('[FASE 4] Identificando concorrentes...');
    const concorrentesData = await openai.chat({
      model: 'gpt-4o-mini',
      temperature: 1.0, // Máxima criatividade
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: PROMPT_4_CONCORRENTES(cliente, mercado, resultado.produtos) },
      ],
      response_format: { type: 'json_object' },
    });

    // Validar quantidade
    if (concorrentesData.concorrentes.length !== 5) {
      throw new Error(`Esperado 5 concorrentes, recebido ${concorrentesData.concorrentes.length}`);
    }

    // Validar e criar concorrentes
    for (const concorrente of concorrentesData.concorrentes) {
      const erros = validarEntidade(concorrente, 'concorrente');
      if (erros.length > 0) {
        console.warn(`Concorrente ${concorrente.nome} inválido: ${erros.join(', ')}`);
        continue; // Pular este concorrente
      }

      const novoConcorrente = await criarConcorrente({
        ...concorrente,
        mercadoId: mercado.id,
      });
      resultado.concorrentes.push(novoConcorrente);
    }

    // ============================================
    // FASE 5: LEADS
    // ============================================
    console.log('[FASE 5] Identificando leads...');
    const leadsData = await openai.chat({
      model: 'gpt-4o-mini',
      temperature: 1.0, // Máxima criatividade
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: PROMPT_5_LEADS(cliente, mercado, resultado.produtos, resultado.concorrentes),
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Validar quantidade
    if (leadsData.leads.length !== 5) {
      throw new Error(`Esperado 5 leads, recebido ${leadsData.leads.length}`);
    }

    // Validar e criar leads
    for (const lead of leadsData.leads) {
      const erros = validarEntidade(lead, 'lead');
      if (erros.length > 0) {
        console.warn(`Lead ${lead.nome} inválido: ${erros.join(', ')}`);
        continue; // Pular este lead
      }

      const novoLead = await criarLead({
        ...lead,
        mercadoId: mercado.id,
      });
      resultado.leads.push(novoLead);
    }

    // ============================================
    // FASE 6: VALIDAÇÃO E QUALIFICAÇÃO
    // ============================================
    console.log('[FASE 6] Calculando score de qualidade...');
    resultado.score = calcularScore(resultado);

    if (resultado.score < 70) {
      throw new Error(`Score muito baixo: ${resultado.score}% (mínimo 70%)`);
    }

    // ============================================
    // FASE 7: GEOCODIFICAÇÃO
    // ============================================
    console.log('[FASE 7] Geocodificando entidades...');

    // Geocodificar concorrentes
    for (const concorrente of resultado.concorrentes) {
      if (concorrente.cidade && concorrente.uf) {
        const coords = await geocodificar(concorrente.cidade, concorrente.uf);
        if (coords) {
          await atualizarCoordenadas('concorrente', concorrente.id, coords);
        }
      }
    }

    // Geocodificar leads
    for (const lead of resultado.leads) {
      if (lead.cidade && lead.uf) {
        const coords = await geocodificar(lead.cidade, lead.uf);
        if (coords) {
          await atualizarCoordenadas('lead', lead.id, coords);
        }
      }
    }

    // ============================================
    // FASE 8: GRAVAÇÃO E FINALIZAÇÃO
    // ============================================
    console.log('[FASE 8] Finalizando...');

    // Marcar cliente como enriquecido
    await marcarClienteEnriquecido(clienteId, resultado.score);

    // Registrar histórico
    await registrarHistorico(clienteId, 'enriched', resultado);

    // Atualizar contadores
    await atualizarContadores(mercado.id);

    console.log(`✅ Cliente ${clienteId} enriquecido com sucesso! Score: ${resultado.score}%`);

    return resultado;
  } catch (error) {
    console.error(`❌ Erro ao enriquecer cliente ${clienteId}:`, error);
    resultado.erros.push(error.message);

    // Registrar erro
    await registrarErro(clienteId, error);

    throw error;
  }
}
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### Antes (Sistema Atual)

| Métrica               | Valor         |
| --------------------- | ------------- |
| Clientes por prompt   | 10+           |
| Temperatura           | 0.7           |
| Prompts por cliente   | 1             |
| Validação             | Fraca         |
| Taxa de sucesso       | 35%           |
| Campos obrigatórios   | Não           |
| Geocodificação        | Manual        |
| Score de qualidade    | Não calculado |
| CNPJ válido           | 5.46%         |
| Mercados enriquecidos | 0%            |

### Depois (Sistema V2 Proposto)

| Métrica               | Valor          |
| --------------------- | -------------- |
| Clientes por prompt   | 1-3            |
| Temperatura           | 0.8-1.0        |
| Prompts por cliente   | 5              |
| Validação             | Rigorosa       |
| Taxa de sucesso       | 90%+           |
| Campos obrigatórios   | Sim            |
| Geocodificação        | Automática     |
| Score de qualidade    | Sim (0-100)    |
| CNPJ válido           | 70%+ (ou NULL) |
| Mercados enriquecidos | 100%           |

---

## 💰 ANÁLISE DE CUSTOS

### Custo por Cliente (OpenAI)

**Sistema Atual (1 prompt gigante):**

- Tokens de entrada: ~500
- Tokens de saída: ~3000
- Custo: ~$0.015 por cliente

**Sistema V2 (5 prompts modulares):**

- Prompt 1 (Cliente): 300 in + 500 out = ~$0.004
- Prompt 2 (Mercado): 400 in + 800 out = ~$0.006
- Prompt 3 (Produtos): 300 in + 600 out = ~$0.004
- Prompt 4 (Concorrentes): 500 in + 1500 out = ~$0.010
- Prompt 5 (Leads): 500 in + 1500 out = ~$0.010
- **Total: ~$0.034 por cliente**

**Diferença:** +126% de custo (+$0.019 por cliente)

**Mas:**

- ✅ Qualidade 2.5x melhor (35% → 90%)
- ✅ Dados completos (100% campos obrigatórios)
- ✅ Sem retrabalho (menos tentativas)

**ROI:** Positivo! Menos clientes rejeitados = menos custos de reprocessamento

---

## 🎯 COBERTURA DOS GAPS

### ✅ GAP #1: CNPJ Inventado

**Solução:**

- Prompt explícito: "NÃO invente CNPJs - use NULL se não souber"
- Validação de formato de CNPJ
- Aceitar NULL como valor válido
- Score não penaliza CNPJ NULL (campo opcional)

**Resultado Esperado:** 0% CNPJs inventados | 70%+ CNPJs reais | 30% NULL

### ✅ GAP #2: Mercados Não Enriquecidos

**Solução:**

- Prompt dedicado (Fase 2)
- TODOS os campos obrigatórios
- Validação rigorosa
- Temperatura 0.9 para criatividade

**Resultado Esperado:** 100% mercados enriquecidos

### ✅ GAP #3: Clientes Não Enriquecidos

**Solução:**

- Prompt dedicado (Fase 1)
- Campos obrigatórios: produtoPrincipal, porte, setor
- Validação de formato
- Temperatura 0.8 para precisão

**Resultado Esperado:** 100% clientes enriquecidos

### ✅ GAP #4: Função Órfã

**Solução:**

- Integrado na Fase 2 (Mercado)
- Chamada obrigatória
- Validação de resultado

**Resultado Esperado:** 100% utilização

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### Semana 1: Fundação

**Dia 1-2: Prompts**

- [ ] Criar 5 prompts modulares
- [ ] Testar com 10 clientes
- [ ] Ajustar baseado em resultados

**Dia 3-4: Validação**

- [ ] Implementar sistema de validação
- [ ] Implementar cálculo de score
- [ ] Testar com 20 clientes

**Dia 5: Integração**

- [ ] Integrar com geocodificação
- [ ] Integrar com gravação
- [ ] Testar fluxo completo

### Semana 2: Refinamento

**Dia 6-7: Otimização**

- [ ] Ajustar temperaturas
- [ ] Refinar prompts
- [ ] Otimizar performance

**Dia 8-9: Testes em Massa**

- [ ] Processar 100 clientes
- [ ] Analisar resultados
- [ ] Corrigir problemas

**Dia 10: Deploy**

- [ ] Deploy em produção
- [ ] Monitoramento
- [ ] Documentação

---

## 📈 MÉTRICAS DE SUCESSO

### Metas de Curto Prazo (7 dias)

| Métrica                  | Atual  | Meta | Status |
| ------------------------ | ------ | ---- | ------ |
| Taxa de Enriquecimento   | 35%    | 90%  | 🎯     |
| Mercados Enriquecidos    | 0%     | 100% | 🎯     |
| Clientes com Localização | 11.52% | 95%  | 🎯     |
| Score Médio              | 66.67  | 85+  | 🎯     |
| CNPJ Válido ou NULL      | 5.46%  | 100% | 🎯     |

### Metas de Médio Prazo (30 dias)

| Métrica                          | Atual | Meta | Status |
| -------------------------------- | ----- | ---- | ------ |
| Leads com Dados Completos        | 0%    | 90%  | 🎯     |
| Concorrentes com Dados Completos | 0%    | 90%  | 🎯     |
| Taxa de Geocodificação           | 6.54% | 95%  | 🎯     |
| Duplicatas                       | ?     | 0%   | 🎯     |

---

## 🎯 CONCLUSÃO

**Cobertura dos Gaps:** ✅ 100%

**Vantagens do Sistema V2:**

1. ✅ Qualidade > Quantidade
2. ✅ Prompts modulares e focados
3. ✅ Validação rigorosa
4. ✅ Campos obrigatórios respeitados
5. ✅ Geocodificação automática
6. ✅ Score de qualidade
7. ✅ Rastreabilidade total
8. ✅ Sem CNPJs inventados
9. ✅ Mercados 100% enriquecidos
10. ✅ Clientes 100% enriquecidos

**Custo:** +126% por cliente (+$0.019)  
**ROI:** Positivo (menos retrabalho)  
**Tempo de Implementação:** 10 dias

**Recomendação:** ✅ APROVAR E IMPLEMENTAR

---

**Próximo Passo:** Começar implementação dos 5 prompts modulares?
