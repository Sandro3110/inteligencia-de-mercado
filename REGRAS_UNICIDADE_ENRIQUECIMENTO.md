# 📘 Regras de Unicidade e Fluxo de Enriquecimento

**Data:** 19 de Novembro de 2025 - 16:00 GMT-3  
**Versão:** 1.0  
**Autor:** Manus AI

---

## 🎯 Visão Geral

O sistema de enriquecimento garante **unicidade de entidades** através de:
1. **Hash único** calculado por entidade
2. **Constraint UNIQUE** no banco de dados
3. **Lógica UPSERT** (atualiza se existe, cria se não existe)

**Benefícios:**
- ✅ Evita duplicação de dados
- ✅ Permite reprocessamento seguro
- ✅ Mantém histórico de enriquecimento
- ✅ Garante integridade referencial

---

## 📊 Entidades e Regras de Unicidade

### 1. Mercados Únicos

**Tabela:** `mercados_unicos`  
**Campo Hash:** `mercadoHash`  
**Constraint:** UNIQUE KEY (implícito no código)

#### Regra de Hash

```typescript
mercadoHash = `${nome}-${projectId}`
  .toLowerCase()
  .replace(/\s+/g, '-');
```

**Componentes:**
- `nome` - Nome do mercado (ex: "Embalagens Plásticas")
- `projectId` - ID do projeto

**Exemplo:**
```typescript
Input:
  nome: "Embalagens Plásticas"
  projectId: 1

Hash gerado:
  "embalagens-plásticas-1"
```

#### Lógica de Criação

```typescript
// NÃO tem UPSERT - Apenas INSERT
const [result] = await db.insert(mercadosUnicos).values({
  projectId: data.projectId,
  mercadoHash,
  nome: data.nome,
  // ... outros campos
});
```

**Comportamento:**
- ✅ Se hash não existe → Cria novo mercado
- ❌ Se hash existe → **Erro de duplicação** (não há tratamento)

**⚠️ Problema Identificado:**
Mercados **não têm UPSERT**, apenas INSERT. Se tentar criar mercado duplicado, o sistema **falha**.

---

### 2. Clientes

**Tabela:** `clientes`  
**Campo Hash:** `clienteHash`  
**Constraint:** `UNIQUE KEY unique_cliente_hash (clienteHash)`

#### Regra de Hash

```typescript
clienteHash = `${nome}-${cnpj || Date.now()}-${projectId}`
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
```

**Componentes:**
- `nome` - Nome do cliente (normalizado)
- `cnpj` - CNPJ do cliente (se disponível)
- `Date.now()` - Timestamp atual (se CNPJ não disponível)
- `projectId` - ID do projeto

**Normalização:**
1. Converte para minúsculas
2. Remove caracteres especiais (mantém apenas a-z, 0-9, -)
3. Remove hífens duplicados
4. Remove hífens no início/fim

**Exemplos:**

```typescript
// Exemplo 1: Com CNPJ
Input:
  nome: "Empresa ABC Ltda"
  cnpj: "12.345.678/0001-90"
  projectId: 1

Hash gerado:
  "empresa-abc-ltda-12-345-678-0001-90-1"

// Exemplo 2: Sem CNPJ
Input:
  nome: "Empresa XYZ"
  cnpj: null
  projectId: 1

Hash gerado:
  "empresa-xyz-1732035600000-1"
  (timestamp varia a cada execução)
```

#### Lógica de Criação (UPSERT)

```typescript
// 1. Verificar se já existe
const existing = await db.select().from(clientes)
  .where(and(
    eq(clientes.clienteHash, clienteHash),
    eq(clientes.projectId, data.projectId)
  ))
  .limit(1);

// 2. Se existe, ATUALIZAR
if (existing.length > 0) {
  await db.update(clientes)
    .set({
      nome: data.nome,
      cnpj: data.cnpj || null,
      siteOficial: data.siteOficial || null,
      // ... todos os campos atualizáveis
      qualidadeScore: data.qualidadeScore || existing[0].qualidadeScore,
    })
    .where(eq(clientes.id, existing[0].id));
  
  return existing[0]; // Retorna registro existente
}

// 3. Se não existe, CRIAR
const [result] = await db.insert(clientes).values({
  projectId: data.projectId,
  clienteHash,
  nome: data.nome,
  // ... todos os campos
});
```

**Comportamento:**
- ✅ Se hash não existe → Cria novo cliente
- ✅ Se hash existe → **Atualiza** cliente existente (UPSERT)
- ✅ Mantém ID original
- ✅ Preserva dados não fornecidos

**Campos Atualizados no UPSERT:**
- `nome`, `cnpj`, `siteOficial`, `produtoPrincipal`
- `segmentacaoB2bB2c`, `email`, `telefone`
- `linkedin`, `instagram`, `cidade`, `uf`
- `cnae`, `porte`, `qualidadeScore`, `qualidadeClassificacao`

**Campos Preservados:**
- `id` (nunca muda)
- `projectId` (nunca muda)
- `clienteHash` (nunca muda)
- `createdAt` (mantém data original)
- `validationStatus` (preserva validação anterior)

---

### 3. Concorrentes

**Tabela:** `concorrentes`  
**Campo Hash:** `concorrenteHash`  
**Constraint:** UNIQUE KEY (implícito no código)

#### Regra de Hash

```typescript
concorrenteHash = `${nome}-${mercadoId}-${Date.now()}`
  .toLowerCase()
  .replace(/\s+/g, '-');
```

**Componentes:**
- `nome` - Nome do concorrente
- `mercadoId` - ID do mercado
- `Date.now()` - Timestamp atual

**⚠️ Problema Identificado:**
O hash **sempre inclui timestamp**, então **nunca há duplicação** mesmo para o mesmo concorrente. Cada execução cria um **novo registro**.

**Exemplo:**

```typescript
// Primeira execução (10:00:00)
Input:
  nome: "Concorrente ABC"
  mercadoId: 5

Hash gerado:
  "concorrente-abc-5-1732035600000"

// Segunda execução (10:00:01) - MESMO concorrente
Input:
  nome: "Concorrente ABC"
  mercadoId: 5

Hash gerado:
  "concorrente-abc-5-1732035601000"
  ❌ Hash diferente → Cria DUPLICATA
```

#### Lógica de Criação

```typescript
// NÃO tem UPSERT - Apenas INSERT
const [result] = await db.insert(concorrentes).values({
  projectId: data.projectId,
  mercadoId: data.mercadoId,
  concorrenteHash,
  nome: data.nome,
  // ... outros campos
});
```

**Comportamento:**
- ✅ Sempre cria novo concorrente
- ❌ **Permite duplicação** (hash sempre único por timestamp)
- ❌ Não há verificação de existência

---

### 4. Leads

**Tabela:** `leads`  
**Campo Hash:** `leadHash`  
**Constraint:** UNIQUE KEY (implícito no código)

#### Regra de Hash

```typescript
leadHash = `${nome}-${mercadoId}-${Date.now()}`
  .toLowerCase()
  .replace(/\s+/g, '-');
```

**Componentes:**
- `nome` - Nome do lead
- `mercadoId` - ID do mercado
- `Date.now()` - Timestamp atual

**⚠️ Problema Identificado:**
Mesma situação dos concorrentes - hash **sempre inclui timestamp**, então **nunca há duplicação** mesmo para o mesmo lead.

**Exemplo:**

```typescript
// Primeira execução
Input:
  nome: "Lead XYZ Ltda"
  mercadoId: 5

Hash gerado:
  "lead-xyz-ltda-5-1732035600000"

// Segunda execução - MESMO lead
Input:
  nome: "Lead XYZ Ltda"
  mercadoId: 5

Hash gerado:
  "lead-xyz-ltda-5-1732035601000"
  ❌ Hash diferente → Cria DUPLICATA
```

#### Lógica de Criação

```typescript
// NÃO tem UPSERT - Apenas INSERT
const result = await db.execute(sql`
  INSERT INTO leads (
    projectId, mercadoId, leadHash, nome, cnpj, site, email, telefone,
    tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
    validationStatus
  ) VALUES (...)
`);
```

**Comportamento:**
- ✅ Sempre cria novo lead
- ❌ **Permite duplicação** (hash sempre único por timestamp)
- ❌ Não há verificação de existência

---

## 🔄 Fluxo Completo de Enriquecimento

### Etapa 1: Criar/Reusar Projeto

**Objetivo:** Organizar dados em projetos isolados

**Lógica:**
```typescript
if (input.projectId) {
  // Reusar projeto existente
  project = await getProjectById(input.projectId);
} else {
  // Criar novo projeto
  project = await createProject({
    nome: input.projectName,
    descricao: input.projectDescription
  });
}
```

**Unicidade:** Projetos não têm hash, apenas ID autoincrement.

---

### Etapa 2: Identificar Mercados Únicos

**Objetivo:** Agrupar clientes por mercado usando LLM

**Fluxo:**

```typescript
// 1. Extrair produtos únicos dos clientes
const produtosUnicos = Array.from(
  new Set(clientes.map(c => c.produto).filter(Boolean))
);

// 2. Para cada produto, identificar mercado via Gemini
for (const produto of produtosUnicos) {
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'Você é um especialista em análise de mercado. Identifique o mercado/setor para o produto fornecido.'
    }, {
      role: 'user',
      content: `Produto: ${produto}\n\nRetorne JSON com: { "mercado": "nome do mercado", "categoria": "categoria", "segmentacao": "B2B ou B2C" }`
    }],
    response_format: { type: 'json_schema', ... }
  });
  
  const data = JSON.parse(response.choices[0].message.content);
  
  // 3. Criar mercado se não existir
  if (!mercadosMap.has(data.mercado)) {
    const mercado = await createMercado({
      projectId,
      nome: data.mercado,
      categoria: data.categoria,
      segmentacao: data.segmentacao
    });
    
    mercadosMap.set(data.mercado, mercado.id);
  }
}
```

**Unicidade:**
- Hash: `${nome}-${projectId}`
- Exemplo: `"embalagens-plásticas-1"`
- ✅ Mesmo mercado no mesmo projeto = **não duplica**
- ✅ Mesmo mercado em projetos diferentes = **cria separado**

**Exemplo Prático:**

```typescript
// Entrada: 3 clientes com produtos similares
clientes = [
  { nome: "Empresa A", produto: "Embalagens plásticas flexíveis" },
  { nome: "Empresa B", produto: "Embalagens de plástico para alimentos" },
  { nome: "Empresa C", produto: "Potes plásticos" }
];

// Gemini identifica:
// - Cliente A → Mercado: "Embalagens Plásticas"
// - Cliente B → Mercado: "Embalagens Plásticas" (mesmo!)
// - Cliente C → Mercado: "Embalagens Plásticas" (mesmo!)

// Resultado: 1 mercado criado
mercados = [
  { id: 1, nome: "Embalagens Plásticas", projectId: 1 }
];
```

---

### Etapa 3: Enriquecer Clientes

**Objetivo:** Completar dados dos clientes usando ReceitaWS + Gemini

**Fluxo:**

```typescript
for (const cliente of clientes) {
  // 1. Consultar ReceitaWS se tem CNPJ
  let dadosEnriquecidos = null;
  if (cliente.cnpj) {
    const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length === 14) {
      // Verificar cache primeiro
      dadosEnriquecidos = await getCachedEnrichment(cnpjLimpo);
      
      if (!dadosEnriquecidos) {
        // Consultar ReceitaWS
        const receitaData = await consultarCNPJ(cnpjLimpo);
        if (receitaData) {
          dadosEnriquecidos = {
            nome: receitaData.fantasia || receitaData.nome,
            email: receitaData.email,
            telefone: receitaData.telefone,
            cidade: receitaData.municipio,
            uf: receitaData.uf,
            porte: extractPorte(receitaData),
            cnae: extractCNAE(receitaData)
          };
          
          // Salvar no cache
          await setCachedEnrichment(cnpjLimpo, dadosEnriquecidos, 'receitaws');
        }
      }
    }
  }
  
  // 2. Identificar mercado do cliente via Gemini
  let mercadoId = null;
  if (cliente.produto) {
    const response = await invokeLLM({
      messages: [{
        role: 'system',
        content: 'Identifique o mercado para este produto.'
      }, {
        role: 'user',
        content: `Produto: ${cliente.produto}`
      }]
    });
    
    const mercadoNome = response.choices[0].message.content;
    
    // Buscar mercado correspondente
    for (const [nome, id] of mercadosMap.entries()) {
      if (mercadoNome.toLowerCase().includes(nome.toLowerCase())) {
        mercadoId = id;
        break;
      }
    }
  }
  
  // 3. Calcular score de qualidade
  const qualidadeScore = calculateQualityScore({
    cnpj: cliente.cnpj,
    email: dadosEnriquecidos?.email,
    telefone: dadosEnriquecidos?.telefone,
    site: cliente.site,
    produto: cliente.produto,
    cidade: dadosEnriquecidos?.cidade,
    uf: dadosEnriquecidos?.uf,
    // ... outros campos
  });
  
  // 4. Criar ou atualizar cliente (UPSERT)
  const novoCliente = await createCliente({
    projectId,
    nome: dadosEnriquecidos?.nome || cliente.nome,
    cnpj: cliente.cnpj,
    siteOficial: cliente.site,
    email: dadosEnriquecidos?.email,
    telefone: dadosEnriquecidos?.telefone,
    cidade: dadosEnriquecidos?.cidade,
    uf: dadosEnriquecidos?.uf,
    produtoPrincipal: cliente.produto,
    qualidadeScore,
    qualidadeClassificacao: classifyQuality(qualidadeScore)
  });
  
  // 5. Associar cliente ao mercado
  if (novoCliente && mercadoId) {
    await associateClienteToMercado(novoCliente.id, mercadoId);
  }
}
```

**Unicidade:**
- Hash: `${nome}-${cnpj || Date.now()}-${projectId}`
- Exemplo com CNPJ: `"empresa-abc-12345678000190-1"`
- Exemplo sem CNPJ: `"empresa-xyz-1732035600000-1"`
- ✅ Mesmo cliente (nome + CNPJ) = **UPSERT** (atualiza)
- ✅ Cliente sem CNPJ = **sempre cria novo** (timestamp único)

**Exemplo Prático:**

```typescript
// Primeira execução
Input:
  nome: "Empresa ABC Ltda"
  cnpj: "12.345.678/0001-90"
  produto: "Embalagens plásticas"

Hash: "empresa-abc-ltda-12-345-678-0001-90-1"
Ação: INSERT (novo cliente)
ID: 100

// Segunda execução (reprocessamento)
Input:
  nome: "Empresa ABC Ltda"
  cnpj: "12.345.678/0001-90"
  produto: "Embalagens plásticas flexíveis" (mais detalhado)
  email: "contato@abc.com.br" (enriquecido via ReceitaWS)

Hash: "empresa-abc-ltda-12-345-678-0001-90-1" (mesmo!)
Ação: UPDATE (atualiza ID 100)
Campos atualizados:
  - produtoPrincipal: "Embalagens plásticas flexíveis"
  - email: "contato@abc.com.br"
  - qualidadeScore: 35 → 50 (melhorou)
```

---

### Etapa 4: Buscar Concorrentes

**Objetivo:** Encontrar empresas concorrentes por mercado

**Fluxo:**

```typescript
for (const [mercadoNome, mercadoId] of mercadosMap.entries()) {
  // 1. Buscar concorrentes via SerpAPI (ou Gemini)
  const rawResults = await searchCompetitors(mercadoNome, undefined, 20);
  
  // 2. Filtrar apenas empresas reais
  const searchResults = filterRealCompanies(rawResults);
  
  // 3. Remover duplicatas (clientes existentes)
  const concorrentesFiltrados = filterDuplicates(
    searchResults,
    clientes // Excluir clientes
  );
  
  // 4. Criar concorrentes (máximo 20 por mercado)
  for (const comp of concorrentesFiltrados.slice(0, 20)) {
    const qualidadeScore = calculateQualityScore({
      site: comp.site,
      produto: comp.produto,
      // ... outros campos
    });
    
    await createConcorrente({
      projectId,
      mercadoId,
      nome: comp.nome,
      site: comp.site,
      produto: comp.produto,
      qualidadeScore,
      qualidadeClassificacao: classifyQuality(qualidadeScore)
    });
  }
}
```

**Unicidade:**
- Hash: `${nome}-${mercadoId}-${Date.now()}`
- Exemplo: `"concorrente-abc-5-1732035600000"`
- ❌ **Sempre cria novo** (timestamp sempre diferente)
- ❌ **Permite duplicação** em múltiplas execuções

**Exemplo Prático:**

```typescript
// Primeira execução (10:00:00)
Input:
  nome: "Concorrente ABC"
  mercadoId: 5

Hash: "concorrente-abc-5-1732035600000"
Ação: INSERT
ID: 200

// Segunda execução (10:00:01) - MESMO concorrente
Input:
  nome: "Concorrente ABC"
  mercadoId: 5

Hash: "concorrente-abc-5-1732035601000" (diferente!)
Ação: INSERT (cria duplicata)
ID: 201

// Resultado: 2 registros para o mesmo concorrente ❌
```

---

### Etapa 5: Buscar Leads

**Objetivo:** Encontrar potenciais clientes por mercado

**Fluxo:**

```typescript
for (const [mercadoNome, mercadoId] of mercadosMap.entries()) {
  // 1. Buscar leads via SerpAPI (ou Gemini)
  const rawResults = await searchLeads(mercadoNome, 'fornecedores', 20);
  
  // 2. Filtrar apenas empresas reais
  const searchResults = filterRealCompanies(rawResults);
  
  // 3. Remover duplicatas (clientes e concorrentes)
  const leadsFiltrados = filterDuplicates(
    searchResults,
    clientes,      // Excluir clientes
    concorrentes   // Excluir concorrentes
  );
  
  // 4. Criar leads (máximo 20 por mercado)
  for (const lead of leadsFiltrados.slice(0, 20)) {
    const qualidadeScore = calculateQualityScore({
      site: lead.site,
      // ... outros campos
    });
    
    await createLead({
      projectId,
      mercadoId,
      nome: lead.nome,
      site: lead.site,
      tipo: 'outbound',
      regiao: 'Brasil',
      setor: mercadoNome,
      qualidadeScore,
      qualidadeClassificacao: classifyQuality(qualidadeScore),
      stage: 'novo'
    });
  }
}
```

**Unicidade:**
- Hash: `${nome}-${mercadoId}-${Date.now()}`
- Exemplo: `"lead-xyz-5-1732035600000"`
- ❌ **Sempre cria novo** (timestamp sempre diferente)
- ❌ **Permite duplicação** em múltiplas execuções

**Exemplo Prático:**

```typescript
// Primeira execução
Input:
  nome: "Lead XYZ Ltda"
  mercadoId: 5

Hash: "lead-xyz-ltda-5-1732035600000"
Ação: INSERT
ID: 300

// Segunda execução - MESMO lead
Input:
  nome: "Lead XYZ Ltda"
  mercadoId: 5

Hash: "lead-xyz-ltda-5-1732035601000" (diferente!)
Ação: INSERT (cria duplicata)
ID: 301

// Resultado: 2 registros para o mesmo lead ❌
```

---

## 🚨 Problemas Identificados

### 1. Mercados: Sem UPSERT

**Problema:**
- Mercados **não têm lógica UPSERT**
- Se tentar criar mercado duplicado → **Erro de duplicação**

**Impacto:**
- ❌ Reprocessamento falha se mercado já existe
- ❌ Não permite atualizar dados de mercado existente

**Solução Proposta:**

```typescript
export async function createMercado(data: { ... }) {
  const db = await getDb();
  if (!db) return null;

  const mercadoHash = `${data.nome}-${data.projectId}`
    .toLowerCase()
    .replace(/\s+/g, '-');

  // ✅ Verificar se já existe
  const existing = await db.select().from(mercadosUnicos)
    .where(and(
      eq(mercadosUnicos.mercadoHash, mercadoHash),
      eq(mercadosUnicos.projectId, data.projectId)
    ))
    .limit(1);

  // ✅ Se existe, atualizar
  if (existing.length > 0) {
    await db.update(mercadosUnicos)
      .set({
        nome: data.nome,
        categoria: data.categoria || existing[0].categoria,
        segmentacao: data.segmentacao || existing[0].segmentacao,
        // ... outros campos
      })
      .where(eq(mercadosUnicos.id, existing[0].id));
    
    return existing[0];
  }

  // ✅ Se não existe, criar
  const [result] = await db.insert(mercadosUnicos).values({
    projectId: data.projectId,
    mercadoHash,
    nome: data.nome,
    // ... outros campos
  });

  return await getMercadoById(Number(result.insertId));
}
```

---

### 2. Concorrentes: Hash com Timestamp

**Problema:**
- Hash inclui `Date.now()` → **sempre único**
- Mesmo concorrente = **múltiplos registros**

**Impacto:**
- ❌ Duplicação massiva em reprocessamentos
- ❌ Banco cresce desnecessariamente
- ❌ Dificulta análise (mesmo concorrente aparece N vezes)

**Solução Proposta:**

```typescript
export async function createConcorrente(data: { ... }) {
  const db = await getDb();
  if (!db) return null;

  // ✅ Hash sem timestamp
  const concorrenteHash = `${data.nome}-${data.mercadoId}-${data.projectId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // ✅ Verificar se já existe
  const existing = await db.select().from(concorrentes)
    .where(and(
      eq(concorrentes.concorrenteHash, concorrenteHash),
      eq(concorrentes.projectId, data.projectId)
    ))
    .limit(1);

  // ✅ Se existe, atualizar
  if (existing.length > 0) {
    await db.update(concorrentes)
      .set({
        nome: data.nome,
        site: data.site || existing[0].site,
        produto: data.produto || existing[0].produto,
        // ... outros campos
      })
      .where(eq(concorrentes.id, existing[0].id));
    
    return existing[0];
  }

  // ✅ Se não existe, criar
  const [result] = await db.insert(concorrentes).values({
    projectId: data.projectId,
    mercadoId: data.mercadoId,
    concorrenteHash,
    nome: data.nome,
    // ... outros campos
  });

  return await getConcorrenteById(Number(result.insertId));
}
```

---

### 3. Leads: Hash com Timestamp

**Problema:**
- Mesma situação dos concorrentes
- Hash inclui `Date.now()` → **sempre único**

**Impacto:**
- ❌ Duplicação massiva em reprocessamentos
- ❌ Leads duplicados poluem pipeline de vendas

**Solução Proposta:**

```typescript
export async function createLead(data: { ... }) {
  const db = await getDb();
  if (!db) return null;

  // ✅ Hash sem timestamp
  const leadHash = `${data.nome}-${data.mercadoId}-${data.projectId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // ✅ Verificar se já existe
  const existing = await db.select().from(leads)
    .where(and(
      eq(leads.leadHash, leadHash),
      eq(leads.projectId, data.projectId)
    ))
    .limit(1);

  // ✅ Se existe, atualizar
  if (existing.length > 0) {
    await db.update(leads)
      .set({
        nome: data.nome,
        site: data.site || existing[0].site,
        email: data.email || existing[0].email,
        telefone: data.telefone || existing[0].telefone,
        // ... outros campos
        // ⚠️ Não atualizar 'stage' para preservar progresso de vendas
      })
      .where(eq(leads.id, existing[0].id));
    
    return existing[0];
  }

  // ✅ Se não existe, criar
  const result = await db.execute(sql`
    INSERT INTO leads (
      projectId, mercadoId, leadHash, nome, cnpj, site, email, telefone,
      tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
      validationStatus, stage
    ) VALUES (...)
  `);

  return await getLeadById(Number(result.insertId));
}
```

---

### 4. Clientes Sem CNPJ: Hash com Timestamp

**Problema:**
- Clientes sem CNPJ usam `Date.now()` no hash
- Reprocessamento cria **duplicatas**

**Impacto:**
- ❌ Mesmo cliente sem CNPJ = múltiplos registros
- ❌ Dificulta rastreamento de enriquecimento

**Solução Proposta:**

```typescript
// ✅ Usar apenas nome + projectId para clientes sem CNPJ
const clienteHash = data.cnpj 
  ? `${data.nome}-${data.cnpj}-${data.projectId}`
  : `${data.nome}-${data.projectId}`;

clienteHash = clienteHash
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
```

**Exemplo:**

```typescript
// Com CNPJ
Hash: "empresa-abc-12345678000190-1"

// Sem CNPJ
Hash: "empresa-xyz-1" (sem timestamp!)
```

---

## 📋 Resumo das Regras de Unicidade

| Entidade | Hash Atual | Problema | UPSERT | Constraint |
|----------|-----------|----------|--------|------------|
| **Mercados** | `nome-projectId` | ❌ Sem UPSERT | ❌ Não | ⚠️ Implícito |
| **Clientes** | `nome-cnpj-projectId` | ✅ OK (com CNPJ) | ✅ Sim | ✅ UNIQUE |
| | `nome-timestamp-projectId` | ❌ Duplica (sem CNPJ) | ✅ Sim | ✅ UNIQUE |
| **Concorrentes** | `nome-mercadoId-timestamp` | ❌ Sempre duplica | ❌ Não | ⚠️ Implícito |
| **Leads** | `nome-mercadoId-timestamp` | ❌ Sempre duplica | ❌ Não | ⚠️ Implícito |

---

## ✅ Recomendações de Correção

### Prioridade ALTA

1. **Implementar UPSERT em Mercados**
   - Adicionar verificação de existência
   - Atualizar se já existe
   - Criar se não existe

2. **Remover Timestamp de Concorrentes**
   - Hash: `nome-mercadoId-projectId`
   - Implementar UPSERT
   - Adicionar constraint UNIQUE

3. **Remover Timestamp de Leads**
   - Hash: `nome-mercadoId-projectId`
   - Implementar UPSERT
   - Adicionar constraint UNIQUE

4. **Corrigir Hash de Clientes Sem CNPJ**
   - Hash: `nome-projectId` (sem timestamp)
   - Manter UPSERT existente

### Prioridade MÉDIA

5. **Adicionar Constraints UNIQUE no Banco**
   ```sql
   ALTER TABLE mercados_unicos 
   ADD UNIQUE KEY unique_mercado_hash (mercadoHash);
   
   ALTER TABLE concorrentes 
   ADD UNIQUE KEY unique_concorrente_hash (concorrenteHash);
   
   ALTER TABLE leads 
   ADD UNIQUE KEY unique_lead_hash (leadHash);
   ```

6. **Limpar Duplicatas Existentes**
   - Executar script de limpeza antes de aplicar constraints
   - Manter registro com maior `qualidadeScore`
   - Manter ID mais recente em caso de empate

---

## 🎯 Benefícios Após Correções

**Antes:**
- ❌ Reprocessamento cria 10k+ duplicatas
- ❌ Banco cresce desnecessariamente
- ❌ Análises poluídas com dados repetidos
- ❌ Custos de API desperdiçados

**Depois:**
- ✅ Reprocessamento seguro (UPSERT)
- ✅ Banco limpo e organizado
- ✅ Análises precisas
- ✅ Enriquecimento incremental eficiente
- ✅ Custos otimizados

---

**Documento gerado por:** Manus AI  
**Última atualização:** 19 de Novembro de 2025 - 16:00 GMT-3  
**Status:** DOCUMENTAÇÃO COMPLETA - Aguardando implementação das correções
