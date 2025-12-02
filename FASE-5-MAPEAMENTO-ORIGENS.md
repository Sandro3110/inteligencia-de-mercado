# 🗺️ MAPEAMENTO COMPLETO: ORIGENS DE DADOS

## 🎯 3 ORIGENS DE DADOS

### **1. IMPORTAÇÃO** 
Dados fornecidos pelo usuário via CSV/Excel

### **2. ENRIQUECIMENTO IA**
Dados preenchidos pelos prompts LLM (temperatura 1.0)

### **3. REGRAS DE GRAVAÇÃO**
Dados calculados/gerados pelo sistema automaticamente

---

## 📊 TABELA 1: dim_entidade

### **CAMPOS POR ORIGEM:**

#### **IMPORTAÇÃO (1 campo):**
```typescript
{
  nome: string // ÚNICO campo obrigatório na importação
}
```

#### **ENRIQUECIMENTO IA (8 campos):**
```typescript
{
  nomeFantasia: string | null,     // Prompt P1
  cnpj: string | null,              // Prompt P1 (NULL se não tiver certeza)
  email: string | null,             // Prompt P1
  telefone: string | null,          // Prompt P1
  site: string | null,              // Prompt P1
  numFiliais: number | null,        // Prompt P1
  numLojas: number | null,          // Prompt P1
  numFuncionarios: number | null    // Prompt P1
}
```

#### **REGRAS DE GRAVAÇÃO (10 campos):**
```typescript
{
  id: number,                       // Auto increment
  entidadeHash: string,             // MD5(nome + cnpj + tipo)
  tipoEntidade: string,             // 'cliente' | 'concorrente' | 'lead'
  importacaoId: number | null,      // FK para dim_importacao (se origem = importação)
  origemTipo: string,               // 'importacao' | 'enriquecimento_ia'
  origemArquivo: string | null,     // Nome do arquivo (se importação)
  origemProcesso: string | null,    // 'importacao_v1' | 'enriquecimento_v3'
  origemPrompt: string | null,      // Texto do prompt usado (se IA)
  origemConfianca: number | null,   // Score 0-100 (se IA)
  origemData: timestamp,            // NOW()
  origemUsuarioId: number | null,   // user.id
  createdAt: timestamp,             // NOW()
  createdBy: number | null,         // user.id
  updatedAt: timestamp,             // NOW()
  updatedBy: number | null,         // user.id
  deletedAt: timestamp | null,      // NULL
  deletedBy: number | null          // NULL
}
```

**TOTAL dim_entidade:** 19 campos (1 importação + 8 IA + 10 sistema)

---

## 📊 TABELA 2: fato_entidade_contexto

### **CAMPOS POR ORIGEM:**

#### **IMPORTAÇÃO (2 campos):**
```typescript
{
  projetoId: number,              // Selecionado pelo usuário
  statusQualificacaoId: number    // 'ativo' | 'inativo' | 'prospect' (padrão)
}
```

#### **ENRIQUECIMENTO IA (4 campos):**
```typescript
{
  cnae: string | null,            // Prompt P1
  porte: string,                  // Prompt P1 (obrigatório)
  faturamentoEstimado: number | null, // Prompt P1
  numFuncionarios: number | null  // Prompt P1
}
```

#### **REGRAS DE GRAVAÇÃO (11 campos):**
```typescript
{
  id: number,                     // Auto increment
  entidadeId: number,             // FK gerado após INSERT dim_entidade
  pesquisaId: number,             // FK criado automaticamente
  geografiaId: number | null,     // FK após fuzzy match (Etapa Geo)
  mercadoId: number | null,       // FK após INSERT dim_mercado (Prompt P2)
  qualidadeScore: number | null,  // Calculado no Prompt P6 (0-100)
  qualidadeClassificacao: string | null, // Calculado no P6 ('excelente'|'bom'|'aceitavel'|'ruim')
  observacoes: text | null,       // NULL inicialmente
  createdAt: timestamp,           // NOW()
  createdBy: number | null,       // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null,       // user.id
  deletedAt: timestamp | null,    // NULL
  deletedBy: number | null        // NULL
}
```

**TOTAL fato_entidade_contexto:** 17 campos (2 importação + 4 IA + 11 sistema)

---

## 📊 TABELA 3: dim_mercado

### **CAMPOS POR ORIGEM:**

#### **IMPORTAÇÃO:**
```
NENHUM - Mercado é 100% criado no enriquecimento
```

#### **ENRIQUECIMENTO IA (7 campos):**
```typescript
{
  nome: string,                   // Prompt P2 (obrigatório)
  categoria: string,              // Prompt P2 (obrigatório)
  segmentacao: string,            // Prompt P2 (obrigatório)
  tamanhoMercadoBr: number,       // Prompt P2 (obrigatório)
  crescimentoAnualPct: number,    // Prompt P2 (obrigatório)
  tendencias: string[],           // Prompt P2 (array, obrigatório)
  principaisPlayers: string[]     // Prompt P2 (array, obrigatório)
}
```

#### **REGRAS DE GRAVAÇÃO (9 campos):**
```typescript
{
  id: number,                     // Auto increment
  mercadoHash: string,            // MD5(nome + categoria + segmentacao)
  enriquecido: boolean,           // true
  enriquecidoEm: timestamp,       // NOW()
  enriquecidoPor: string,         // 'gpt-4o'
  createdAt: timestamp,           // NOW()
  createdBy: number | null,       // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null        // user.id
}
```

**TOTAL dim_mercado:** 16 campos (0 importação + 7 IA + 9 sistema)

**CACHE:** Mercados são reutilizados via mercadoHash (Redis 7 dias)

---

## 📊 TABELA 4: dim_produto

### **CAMPOS POR ORIGEM:**

#### **IMPORTAÇÃO:**
```
NENHUM - Produtos são 100% criados no enriquecimento
```

#### **ENRIQUECIMENTO IA (3 campos por produto x 3 produtos = 9 campos):**
```typescript
{
  nome: string,                   // Prompt P3 (obrigatório)
  categoria: string,              // Prompt P3 (obrigatório)
  descricao: text                 // Prompt P3 (obrigatório)
}
```

#### **REGRAS DE GRAVAÇÃO (7 campos por produto):**
```typescript
{
  id: number,                     // Auto increment
  produtoHash: string,            // MD5(nome + categoria)
  precoMedio: number | null,      // NULL (não enriquecido)
  unidade: string | null,         // NULL (não enriquecido)
  ncm: string | null,             // NULL (não enriquecido)
  enriquecido: boolean,           // false
  enriquecidoEm: timestamp | null,// NULL
  enriquecidoPor: string | null,  // NULL
  createdAt: timestamp,           // NOW()
  createdBy: number | null,       // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null        // user.id
}
```

**TOTAL dim_produto (por produto):** 10 campos (0 importação + 3 IA + 7 sistema)  
**TOTAL para 3 produtos:** 30 campos

---

## 📊 TABELA 5: fato_entidade_produto

### **CAMPOS POR ORIGEM:**

#### **IMPORTAÇÃO:**
```
NENHUM - Relações são 100% criadas no enriquecimento
```

#### **ENRIQUECIMENTO IA (2 campos por relação x 3 relações = 6 campos):**
```typescript
{
  tipoRelacao: string | null,     // Prompt P3 ('principal'|'secundario'|'complementar')
  volumeEstimado: string | null   // Prompt P3 ('alto'|'médio'|'baixo')
}
```

#### **REGRAS DE GRAVAÇÃO (4 campos por relação):**
```typescript
{
  id: number,                     // Auto increment
  contextoId: number,             // FK do cliente (fato_entidade_contexto.id)
  produtoId: number,              // FK do produto (dim_produto.id)
  observacoes: text | null,       // NULL
  createdAt: timestamp,           // NOW()
  createdBy: number | null        // user.id
}
```

**TOTAL fato_entidade_produto (por relação):** 6 campos (0 importação + 2 IA + 4 sistema)  
**TOTAL para 3 relações:** 18 campos

---

## 📊 TABELA 6: dim_entidade (CONCORRENTES)

### **5 CONCORRENTES = 5 REGISTROS NOVOS**

#### **IMPORTAÇÃO:**
```
NENHUM - Concorrentes são 100% criados no enriquecimento
```

#### **ENRIQUECIMENTO IA (8 campos por concorrente x 5 = 40 campos):**
```typescript
{
  nome: string,                   // Prompt P4 (obrigatório)
  nomeFantasia: string | null,    // Prompt P4
  cnpj: string | null,            // Prompt P4 (NULL se não tiver certeza)
  email: string | null,           // Prompt P4
  telefone: string | null,        // Prompt P4
  site: string | null,            // Prompt P4
  numFiliais: number | null,      // Prompt P4
  numFuncionarios: number | null  // Prompt P4
}
```

#### **REGRAS DE GRAVAÇÃO (10 campos por concorrente):**
```typescript
{
  id: number,                     // Auto increment
  entidadeHash: string,           // MD5(nome + cnpj + 'concorrente')
  tipoEntidade: string,           // 'concorrente' (fixo)
  numLojas: number | null,        // NULL (não enriquecido)
  importacaoId: number | null,    // NULL (não veio de importação)
  origemTipo: string,             // 'enriquecimento_ia'
  origemProcesso: string,         // 'enriquecimento_v3'
  origemPrompt: text,             // Texto do Prompt P4
  origemConfianca: number,        // Score 0-100
  origemData: timestamp,          // NOW()
  origemUsuarioId: number,        // user.id
  createdAt: timestamp,           // NOW()
  createdBy: number,              // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null,       // NULL
  deletedAt: timestamp | null,    // NULL
  deletedBy: number | null        // NULL
}
```

**TOTAL dim_entidade (por concorrente):** 18 campos (0 importação + 8 IA + 10 sistema)  
**TOTAL para 5 concorrentes:** 90 campos

---

## 📊 TABELA 7: fato_entidade_contexto (CONCORRENTES)

### **5 CONTEXTOS DE CONCORRENTES**

#### **ENRIQUECIMENTO IA (3 campos por concorrente x 5 = 15 campos):**
```typescript
{
  cnae: string | null,            // Prompt P4
  porte: string | null,           // Prompt P4
  faturamentoEstimado: number | null // Prompt P4
}
```

#### **REGRAS DE GRAVAÇÃO (14 campos por concorrente):**
```typescript
{
  id: number,                     // Auto increment
  entidadeId: number,             // FK do concorrente (dim_entidade.id)
  projetoId: number,              // Mesmo do cliente
  pesquisaId: number,             // Mesmo do cliente
  geografiaId: number | null,     // FK após fuzzy match cidade/uf do Prompt P4
  mercadoId: number,              // Mesmo mercado do cliente (mercado FORNECEDOR)
  statusQualificacaoId: number,   // 'prospect' (fixo)
  numFuncionarios: number | null, // Prompt P4
  qualidadeScore: number | null,  // NULL (não calculado para concorrentes)
  qualidadeClassificacao: string | null, // NULL
  observacoes: text | null,       // NULL
  createdAt: timestamp,           // NOW()
  createdBy: number,              // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null,       // NULL
  deletedAt: timestamp | null,    // NULL
  deletedBy: number | null        // NULL
}
```

**TOTAL fato_entidade_contexto (por concorrente):** 17 campos (0 importação + 3 IA + 14 sistema)  
**TOTAL para 5 concorrentes:** 85 campos

---

## 📊 TABELA 8: fato_entidade_competidor

### **5 RELAÇÕES DE COMPETIÇÃO**

#### **ENRIQUECIMENTO IA (2 campos por relação x 5 = 10 campos):**
```typescript
{
  nivelCompeticao: string,        // Prompt P4 ('Direto'|'Indireto'|'Potencial')
  diferencial: text | null        // Prompt P4 (diferencial do concorrente)
}
```

#### **REGRAS DE GRAVAÇÃO (4 campos por relação):**
```typescript
{
  id: number,                     // Auto increment
  contextoId: number,             // FK do cliente (fato_entidade_contexto.id)
  competidorEntidadeId: number,   // FK do concorrente (dim_entidade.id)
  observacoes: text | null,       // NULL
  createdAt: timestamp,           // NOW()
  createdBy: number               // user.id
}
```

**TOTAL fato_entidade_competidor (por relação):** 6 campos (0 importação + 2 IA + 4 sistema)  
**TOTAL para 5 relações:** 30 campos

---

## 📊 TABELA 9: dim_entidade (LEADS)

### **5 LEADS = 5 REGISTROS NOVOS**

#### **ENRIQUECIMENTO IA (8 campos por lead x 5 = 40 campos):**
```typescript
{
  nome: string,                   // Prompt P5 (obrigatório)
  nomeFantasia: string | null,    // Prompt P5
  cnpj: string | null,            // Prompt P5 (NULL se não tiver certeza)
  email: string | null,           // Prompt P5
  telefone: string | null,        // Prompt P5
  site: string | null,            // Prompt P5
  numFiliais: number | null,      // Prompt P5
  numFuncionarios: number | null  // Prompt P5
}
```

#### **REGRAS DE GRAVAÇÃO (10 campos por lead):**
```typescript
{
  id: number,                     // Auto increment
  entidadeHash: string,           // MD5(nome + cnpj + 'lead')
  tipoEntidade: string,           // 'lead' (fixo)
  numLojas: number | null,        // NULL
  importacaoId: number | null,    // NULL
  origemTipo: string,             // 'enriquecimento_ia'
  origemProcesso: string,         // 'enriquecimento_v3'
  origemPrompt: text,             // Texto do Prompt P5
  origemConfianca: number,        // Score 0-100
  origemData: timestamp,          // NOW()
  origemUsuarioId: number,        // user.id
  createdAt: timestamp,           // NOW()
  createdBy: number,              // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null,       // NULL
  deletedAt: timestamp | null,    // NULL
  deletedBy: number | null        // NULL
}
```

**TOTAL dim_entidade (por lead):** 18 campos (0 importação + 8 IA + 10 sistema)  
**TOTAL para 5 leads:** 90 campos

---

## 📊 TABELA 10: fato_entidade_contexto (LEADS)

### **5 CONTEXTOS DE LEADS**

#### **ENRIQUECIMENTO IA (4 campos por lead x 5 = 20 campos):**
```typescript
{
  cnae: string | null,            // Prompt P5
  porte: string | null,           // Prompt P5
  faturamentoEstimado: number | null, // Prompt P5
  numFuncionarios: number | null  // Prompt P5
}
```

#### **REGRAS DE GRAVAÇÃO (13 campos por lead):**
```typescript
{
  id: number,                     // Auto increment
  entidadeId: number,             // FK do lead (dim_entidade.id)
  projetoId: number,              // Mesmo do cliente
  pesquisaId: number,             // Mesmo do cliente
  geografiaId: number | null,     // FK após fuzzy match cidade/uf do Prompt P5
  mercadoId: number | null,       // NULL ou mercado CONSUMIDOR (se criar)
  statusQualificacaoId: number,   // 'prospect' (fixo)
  qualidadeScore: number | null,  // NULL
  qualidadeClassificacao: string | null, // NULL
  observacoes: text | null,       // NULL
  createdAt: timestamp,           // NOW()
  createdBy: number,              // user.id
  updatedAt: timestamp,           // NOW()
  updatedBy: number | null,       // NULL
  deletedAt: timestamp | null,    // NULL
  deletedBy: number | null        // NULL
}
```

**TOTAL fato_entidade_contexto (por lead):** 17 campos (0 importação + 4 IA + 13 sistema)  
**TOTAL para 5 leads:** 85 campos

---

## 📊 RESUMO QUANTITATIVO TOTAL

### **POR CLIENTE ENRIQUECIDO:**

| Entidade | Registros | Campos IA | Campos Sistema | Total Campos |
|----------|-----------|-----------|----------------|--------------|
| **Cliente** | 1 | 8 | 10 | 18 |
| **Contexto Cliente** | 1 | 4 | 11 | 15 |
| **Mercado Fornecedor** | 1 | 7 | 9 | 16 |
| **Produtos** | 3 | 9 | 21 | 30 |
| **Relações Produto** | 3 | 6 | 12 | 18 |
| **Concorrentes** | 5 | 40 | 50 | 90 |
| **Contextos Concorrentes** | 5 | 15 | 70 | 85 |
| **Relações Competição** | 5 | 10 | 20 | 30 |
| **Leads** | 5 | 40 | 50 | 90 |
| **Contextos Leads** | 5 | 20 | 65 | 85 |
| **TOTAL** | **29** | **159** | **318** | **477** |

### **CAMPOS PREENCHIDOS PELA IA:**
- **159 campos** por cliente
- Para 100 clientes: **15.900 campos**
- Para 1.000 clientes: **159.000 campos**

### **CAMPOS GERADOS PELO SISTEMA:**
- **318 campos** por cliente (hashes, IDs, timestamps, FKs)

### **TOTAL GERAL:**
- **477 campos** por cliente
- **29 registros** criados por cliente (1 cliente + 1 mercado + 3 produtos + 5 concorrentes + 5 leads + 14 relações)

---

## 🎯 PRÓXIMA ETAPA

Criar os **6 PROMPTS** com temperatura 1.0:

1. **P1:** Enriquecer Cliente (8 campos)
2. **P2:** Identificar Mercado Fornecedor (7 campos)
3. **P3:** Produtos do Cliente (9 campos - 3x3)
4. **P4:** Concorrentes do Mercado Fornecedor (48 campos - 5x concorrente + contexto + relação)
5. **P5:** Leads do Mercado Consumidor (48 campos - 5x lead + contexto)
6. **P6:** Validação e Score (2 campos - qualidadeScore + qualidadeClassificacao)

**Total:** 159 campos preenchidos pela IA ✅
