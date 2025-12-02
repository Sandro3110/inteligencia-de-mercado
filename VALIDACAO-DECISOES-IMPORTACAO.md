# ✅ VALIDAÇÃO DAS DECISÕES - IMPORTAÇÃO

**Data:** 01/12/2025  
**Status:** Analisando decisões do usuário

---

## 📋 DECISÕES CONFIRMADAS

### **✅ DECISÃO #1: Tamanho Máximo**
**Escolhido:** 250k linhas (~50 MB)  
**Status:** ✅ CLARO

---

### **✅ DECISÃO #2: Duplicatas**
**Escolhido:** Pular CNPJ duplicado  
**Status:** ✅ CLARO

**Comportamento:**
- Se CNPJ já existe → pular linha
- Registrar em `importacao_erros` como tipo "duplicata"
- Mostrar no relatório final

---

### **✅ DECISÃO #3: Jobs**
**Escolhido:** Híbrido  
**Status:** ✅ CLARO

**Comportamento:**
- Até 10k linhas → processamento síncrono (rápido)
- Acima de 10k → jobs em background (BullMQ)

---

### **✅ DECISÃO #4: Campos Obrigatórios**
**Escolhido:** nome + entidade (projeto/centro_custo/unidade_negocio)  
**Status:** ⚠️ **PRECISA ESCLARECIMENTO**

**Minha interpretação:**
```
Campos obrigatórios no CSV:
- nome (razão social)
- E UM DOS TRÊS:
  - projeto (nome ou ID do projeto)
  - centro_custo
  - unidade_negocio
```

**❓ DÚVIDA #1:** Entendi corretamente?

**Ou você quis dizer:**
- nome + tipoEntidade (cliente/lead/concorrente)?

**Por favor, esclareça!**

---

### **✅ DECISÃO #5: Enriquecimento**
**Escolhido:** Opcional (checkbox)  
**Status:** ✅ CLARO

**Comportamento:**
- Após importação concluída
- Mostrar: "Deseja enriquecer X entidades com IA?"
- Se sim → criar job de enriquecimento (FASE 5)

---

## 📝 OBSERVAÇÃO IMPORTANTE: ORIGEM

### **Você mencionou:**
> "faltou a origem da importacao: arquivo, data, usuario"  
> "e se for gerado por funcao futura de IA registrar tambem na mesma estrutura"

**✅ BOA NOTÍCIA:** Já está 100% coberto no schema atual!

### **Campos de Origem Existentes em `dim_entidade`:**

```typescript
// Origem da entidade
origemTipo: varchar(20) NOT NULL           // 'importacao' | 'ia_prompt' | 'api' | 'manual'
origemArquivo: varchar(255)                // ✅ Nome do arquivo CSV/Excel
origemProcesso: varchar(100)               // ID do processo de importação
origemPrompt: text                         // ✅ Prompt usado (se IA)
origemConfianca: integer                   // 0-100 (confiança da fonte)
origemData: timestamp NOT NULL             // ✅ Data da importação/geração
origemUsuarioId: integer                   // ✅ Quem importou/gerou

// Auditoria
createdAt: timestamp NOT NULL              // ✅ Data de criação
createdBy: varchar(255)                    // ✅ Usuário que criou
```

### **Exemplos de Uso:**

**Importação de CSV:**
```json
{
  "origemTipo": "importacao",
  "origemArquivo": "clientes_2025.csv",
  "origemProcesso": "IMP-20250101-001",
  "origemData": "2025-01-01T10:30:00Z",
  "origemUsuarioId": "user_123",
  "createdBy": "user_123"
}
```

**Geração por IA:**
```json
{
  "origemTipo": "ia_prompt",
  "origemArquivo": null,
  "origemProcesso": "IA-20250101-005",
  "origemPrompt": "Buscar empresas de tecnologia em São Paulo",
  "origemConfianca": 85,
  "origemData": "2025-01-01T14:20:00Z",
  "origemUsuarioId": "user_123",
  "createdBy": "user_123"
}
```

**✅ CONCLUSÃO:** Origem já está 100% coberta!

---

## ❓ DÚVIDAS E SUGESTÕES

### **❓ DÚVIDA #1: Campos Obrigatórios**

**Você disse:**
> "nome, entidade (projeto/Centro de custo/unidade de Negócios) uma unica entidade"

**Possíveis interpretações:**

**INTERPRETAÇÃO A:**
```
Campos obrigatórios:
- nome
- E UM DOS TRÊS:
  - projeto_id (FK para dim_projeto)
  - centro_custo (string)
  - unidade_negocio (string)
```

**INTERPRETAÇÃO B:**
```
Campos obrigatórios:
- nome
- tipo_entidade (cliente | lead | concorrente)
```

**INTERPRETAÇÃO C:**
```
Campos obrigatórios:
- nome
- projeto_id (sempre obrigatório)
- centro_custo (opcional)
- unidade_negocio (opcional)
```

**Qual é a correta?**

---

### **💡 SUGESTÃO #1: Relacionamento com Projeto**

**Contexto:** Toda entidade importada precisa estar vinculada a um projeto e pesquisa.

**Proposta:** Na UI de importação, pedir:
1. Selecionar **Projeto** (obrigatório)
2. Selecionar **Pesquisa** (obrigatório)
3. Upload do arquivo

**Assim:**
- Todas as entidades do CSV vão para o mesmo projeto/pesquisa
- Não precisa ter coluna "projeto" no CSV
- Simplifica importação

**Você concorda?**

---

### **💡 SUGESTÃO #2: Mapeamento de Colunas Flexível**

**Problema:** CSV pode ter colunas com nomes diferentes.

**Exemplos:**
- "Razão Social" → `nome`
- "Nome Empresa" → `nome`
- "CNPJ" → `cnpj`
- "CPF/CNPJ" → `cnpj`

**Proposta:** UI de mapeamento permite:
1. Auto-detecção (IA tenta adivinhar)
2. Mapeamento manual (drag-and-drop)
3. Salvar template para reutilizar

**Você concorda?**

---

### **💡 SUGESTÃO #3: Validação de Geografia**

**Problema:** CSV pode ter cidade/UF que não existem na `dim_geografia`.

**Opções:**

**A) Rejeitar linha** (erro)
- ❌ Mais seguro
- ❌ Pode rejeitar muitas linhas

**B) Aceitar e deixar geografia_id NULL**
- ✅ Mais flexível
- ⚠️ Dados incompletos

**C) Busca fuzzy** (similaridade > 80%)
- ✅ Corrige erros de digitação
- ⚠️ Pode mapear errado

**D) Criar geografia nova** (se não existir)
- ✅ Mais flexível
- ⚠️ Pode poluir dim_geografia

**Minha recomendação:** **C) Busca fuzzy** + mostrar no preview

**Você concorda?**

---

### **💡 SUGESTÃO #4: Preview Inteligente**

**Proposta:** Após upload, mostrar preview com:

**Estatísticas:**
- Total de linhas: 1.234
- Linhas válidas: 1.150 (93%)
- Linhas com erro: 84 (7%)
- Duplicatas (CNPJ): 15
- Geografia não encontrada: 23

**Tabela de preview:**
| Linha | Nome | CNPJ | Cidade | Status |
|-------|------|------|--------|--------|
| 1 | Empresa A | 12.345.678/0001-90 | São Paulo | ✅ OK |
| 2 | Empresa B | 98.765.432/0001-10 | Sao Paulo | ⚠️ Fuzzy match |
| 3 | Empresa C | 11.111.111/0001-11 | XYZ | ❌ Cidade não encontrada |
| 4 | Empresa D | 12.345.678/0001-90 | Rio | ⚠️ CNPJ duplicado |

**Ações:**
- [ ] Importar apenas linhas válidas
- [ ] Tentar corrigir erros automaticamente
- [ ] Baixar relatório de erros (CSV)

**Você gostou?**

---

### **💡 SUGESTÃO #5: Estrutura de dim_importacao**

**Proposta final:**

```sql
CREATE TABLE dim_importacao (
  id SERIAL PRIMARY KEY,
  
  -- Contexto
  projeto_id INTEGER NOT NULL REFERENCES dim_projeto(id),
  pesquisa_id INTEGER NOT NULL REFERENCES dim_pesquisa(id),
  
  -- Arquivo
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL,        -- 'csv' | 'xlsx'
  tamanho_bytes BIGINT,
  caminho_s3 VARCHAR(500),                  -- Backup do arquivo no S3
  
  -- Estatísticas
  total_linhas INTEGER NOT NULL,
  linhas_processadas INTEGER DEFAULT 0,
  linhas_sucesso INTEGER DEFAULT 0,
  linhas_erro INTEGER DEFAULT 0,
  linhas_duplicadas INTEGER DEFAULT 0,
  linhas_geografia_fuzzy INTEGER DEFAULT 0, -- ✅ NOVO
  
  -- Controle
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  erro_mensagem TEXT,
  
  -- Configurações
  mapeamento_colunas JSONB,                -- {csv_col: db_field}
  opcoes JSONB,                            -- {ignorar_duplicatas: true, ...}
  
  -- Execução
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255)
);
```

**Você aprova?**

---

## 📊 RESUMO DAS DÚVIDAS

| # | Dúvida | Status |
|---|--------|--------|
| **1** | Campos obrigatórios: nome + ??? | ⚠️ **AGUARDANDO** |
| **2** | Projeto/Pesquisa obrigatório na UI? | ⚠️ **AGUARDANDO** |
| **3** | Mapeamento flexível de colunas? | ⚠️ **AGUARDANDO** |
| **4** | Geografia: fuzzy match ou rejeitar? | ⚠️ **AGUARDANDO** |
| **5** | Preview inteligente? | ⚠️ **AGUARDANDO** |
| **6** | Estrutura dim_importacao OK? | ⚠️ **AGUARDANDO** |

---

## ✅ O QUE ESTÁ CLARO

1. ✅ Tamanho máximo: 250k linhas
2. ✅ Duplicatas: pular
3. ✅ Jobs: híbrido (10k threshold)
4. ✅ Enriquecimento: opcional
5. ✅ Origem: já está coberto no schema

---

## 🎯 PRÓXIMO PASSO

**Após esclarecer as 6 dúvidas acima:**
- Criar especificação técnica final
- Começar implementação da FASE 4

---

**Aguardo suas respostas!** 🚀
