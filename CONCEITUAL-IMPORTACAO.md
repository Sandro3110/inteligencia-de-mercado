# 📋 MODELO CONCEITUAL - IMPORTAÇÃO (Separado de Enriquecimento)

**Data:** 01/12/2025  
**Status:** Em discussão - Definição conceitual

---

## 🎯 ENTIDADES E RELACIONAMENTOS

### **1. PROJETO (Entidade de Controle)**

**Conceito:**

> Projeto é a **entidade de controle** criada **obrigatoriamente** no momento da importação. É o contexto organizacional que agrupa clientes relacionados a um objetivo de negócio específico.

**Características:**

- ✅ Criado **junto com a importação** (não antes, não depois)
- ✅ Define o **escopo** da análise
- ✅ Agrupa **clientes relacionados** a um objetivo comum
- ✅ Pode conter **múltiplas pesquisas** (ações de enriquecimento)

**Exemplos:**

- Projeto: "Expansão Sul 2025"
- Projeto: "Prospecção Indústria Alimentícia"
- Projeto: "Clientes Inativos - Reativação"

**Atributos:**

- `id` (PK)
- `nome` (ex: "Expansão Sul 2025")
- `descricao` (opcional)
- `owner_id` (quem criou)
- `created_at`
- `updated_at`

---

### **2. CLIENTE (Entidade Única)**

**Conceito:**

> Cliente é uma **entidade única** no sistema. Cada cliente real existe **UMA VEZ** na base de dados, independente de quantos projetos ele participe.

**Características:**

- ✅ **Unicidade:** Um cliente = um registro em `fato_entidades`
- ✅ **Identificação:** Por CNPJ (se tiver) ou nome+cidade+uf
- ✅ **Qualificação obrigatória:** Status definido NA IMPORTAÇÃO
- ✅ **Multi-projeto:** Pode estar em N projetos simultaneamente

**Status de Qualificação (Obrigatório na Importação):**

- `ativo` - Cliente ativo no negócio
- `inativo` - Cliente inativo (parou de comprar)
- `prospect` - Cliente em potencial (nunca comprou)

**Atributos Mínimos:**

- `id` (PK)
- `entidade_hash` (UNIQUE - deduplicação)
- `nome` (obrigatório)
- `cnpj` (opcional, mas usado para deduplicação)
- `cidade` (obrigatório)
- `uf` (obrigatório)
- `status_qualificacao` (obrigatório: ativo/inativo/prospect)
- `tipo_entidade` = 'cliente' (fixo)
- `created_at`
- `updated_at`

---

### **3. CLIENTE_PROJETO (Relacionamento N:N)**

**Conceito:**

> A chave **Cliente + Projeto** é uma **nova entidade de relacionamento**. Um mesmo cliente pode participar de múltiplos projetos com contextos diferentes.

**Características:**

- ✅ Relacionamento N:N entre Cliente e Projeto
- ✅ Permite cliente estar em múltiplos projetos
- ✅ Cada vinculação pode ter metadados específicos

**Atributos:**

- `id` (PK)
- `cliente_id` (FK → fato_entidades)
- `projeto_id` (FK → projects)
- `status_no_projeto` (ex: "ativo", "pausado", "concluído")
- `observacoes` (opcional)
- `added_at` (quando foi adicionado ao projeto)
- `updated_at`

**Constraint:**

- UNIQUE(`cliente_id`, `projeto_id`) - não pode duplicar

---

### **4. PESQUISA (Ação de Enriquecimento)**

**Conceito:**

> Pesquisa é o **resultado de uma ação coletiva de qualificação de dados**. É o registro de quando um conjunto de clientes foi enriquecido.

**Características:**

- ✅ **NÃO é a importação** (importação ≠ pesquisa)
- ✅ É o **ato de enriquecer** dados já importados
- ✅ Pode enriquecer **todos os clientes** de um projeto ou **um subconjunto**
- ✅ Gera **snapshot** dos dados enriquecidos naquele momento
- ✅ Múltiplas pesquisas podem existir para o mesmo projeto (histórico)

**Exemplos:**

- Pesquisa: "Enriquecimento Inicial - Jan/2025"
- Pesquisa: "Re-qualificação Trimestral - Mar/2025"
- Pesquisa: "Atualização Mercados - Jun/2025"

**Atributos:**

- `id` (PK)
- `projeto_id` (FK → projects)
- `nome` (ex: "Enriquecimento Inicial")
- `descricao` (opcional)
- `status` ('pendente', 'em_progresso', 'concluida', 'falhou')
- `total_clientes` (quantos clientes foram enriquecidos)
- `clientes_enriquecidos` (quantos completaram)
- `started_at` (quando começou)
- `completed_at` (quando terminou)
- `created_at`

---

## 🔄 FLUXO DE IMPORTAÇÃO (Conceitual)

### **PASSO 1: Upload CSV**

- Usuário faz upload do arquivo CSV
- Sistema valida formato (headers, encoding)

### **PASSO 2: Criar Projeto**

- Usuário define:
  - Nome do projeto (ex: "Expansão Sul 2025")
  - Descrição (opcional)
- Sistema cria registro em `projects`

### **PASSO 3: Parsear e Validar CSV**

- Sistema lê cada linha do CSV
- Valida campos obrigatórios:
  - `nome` (obrigatório)
  - `cidade` (obrigatório)
  - `uf` (obrigatório)
  - `status_qualificacao` (obrigatório: ativo/inativo/prospect)
- Valida campos opcionais:
  - `cnpj` (se fornecido, validar formato)
  - `email` (se fornecido, validar formato)
  - `telefone` (se fornecido, validar formato)

### **PASSO 4: Detectar Semelhantes (Deduplicação)**

Para cada linha do CSV:

#### **4.1. Gerar Hash de Identificação**

```typescript
// Se tem CNPJ válido:
hash = md5(cnpj);

// Se NÃO tem CNPJ:
hash = md5(`${nome}-${cidade}-${uf}`);
```

#### **4.2. Buscar Cliente Existente**

```sql
SELECT * FROM fato_entidades
WHERE entidade_hash = :hash
  AND tipo_entidade = 'cliente'
LIMIT 1;
```

#### **4.3. Decisão:**

**CASO A: Cliente NÃO existe**

- ✅ Criar novo cliente em `fato_entidades`
- ✅ Vincular ao projeto via `cliente_projeto`
- ✅ Status: novo

**CASO B: Cliente JÁ existe**

- ⚠️ **PARAR e PERGUNTAR ao usuário:**

```
Cliente semelhante encontrado:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DADOS DO CSV:
   Nome: Empresa ABC Ltda
   CNPJ: 12.345.678/0001-90
   Cidade: São Paulo/SP
   Status: ativo

📁 JÁ CADASTRADO:
   Nome: Empresa ABC
   CNPJ: 12.345.678/0001-90
   Cidade: São Paulo/SP
   Status: prospect
   Projetos: "Expansão Sul 2024" (1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O que deseja fazer?

[ ] Usar cliente existente (adicionar ao projeto atual)
[ ] Criar novo cliente (considerar como diferente)
[ ] Atualizar dados do cliente existente
[ ] Pular este registro
```

**Opções:**

1. **Usar existente:**
   - Vincular cliente existente ao novo projeto
   - Inserir em `cliente_projeto`
   - Manter dados originais

2. **Criar novo:**
   - Criar novo registro em `fato_entidades`
   - Gerar novo `entidade_hash` (forçar unicidade)
   - Vincular ao projeto

3. **Atualizar existente:**
   - Atualizar dados do cliente (nome, status, etc)
   - Vincular ao novo projeto
   - Registrar em histórico

4. **Pular:**
   - Não importar este registro
   - Continuar com próximo

---

### **PASSO 5: Validar Geografia**

Para cada cliente (novo ou existente):

#### **5.1. Buscar Cidade em dim_geografia**

```sql
SELECT id FROM dim_geografia
WHERE cidade = :cidade
  AND uf = :uf
LIMIT 1;
```

#### **5.2. Decisão:**

**CASO A: Cidade encontrada**

- ✅ Usar `geografia_id` encontrado

**CASO B: Cidade NÃO encontrada**

- ⚠️ **Buscar similar** (Levenshtein distance < 2)
- ⚠️ **PERGUNTAR ao usuário:**

```
Cidade não encontrada: "São Paolo" (SP)

Sugestões:
[ ] São Paulo (SP) - 95% similar
[ ] São Pedro (SP) - 60% similar

O que deseja fazer?
[ ] Usar sugestão: São Paulo (SP)
[ ] Adicionar nova cidade: São Paolo (SP)
[ ] Pular este registro
```

---

### **PASSO 6: Definir Mercado Temporário**

**IMPORTANTE:** Na importação, **NÃO enriquecemos** ainda!

Opções:

**A) Mercado padrão:**

- Criar mercado genérico: "Não Classificado"
- Todos os clientes importados vão para este mercado
- Será substituído no enriquecimento

**B) Mercado do CSV:**

- Se CSV tem coluna `setor` ou `mercado`
- Criar mercado com este nome
- Será enriquecido depois

**C) Sem mercado:**

- Deixar `mercado_id` = NULL (se permitido)
- Será preenchido no enriquecimento

**Decisão:** Qual abordagem você prefere?

---

### **PASSO 7: Inserir Clientes**

Para cada cliente validado:

```typescript
// Inserir em fato_entidades
const cliente = await db.insert(fatoEntidades).values({
  tipo_entidade: 'cliente',
  entidade_hash: hash,
  nome: dadosCSV.nome,
  cnpj: dadosCSV.cnpj,
  email: dadosCSV.email,
  telefone: dadosCSV.telefone,
  geografia_id: geografiaId,
  mercado_id: mercadoTemporarioId,
  status_qualificacao: dadosCSV.status, // ativo/inativo/prospect
  qualidade_score: 40, // Score inicial baixo (não enriquecido)
  qualidade_classificacao: 'D',
  project_id: projetoId,
  pesquisa_id: null, // Ainda não tem pesquisa (não foi enriquecido)
  created_at: new Date(),
  updated_at: new Date(),
});

// Vincular ao projeto
await db.insert(clienteProjeto).values({
  cliente_id: cliente.id,
  projeto_id: projetoId,
  status_no_projeto: 'ativo',
  added_at: new Date(),
});
```

---

### **PASSO 8: Resumo da Importação**

Ao final, mostrar ao usuário:

```
✅ Importação Concluída!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMO:

Projeto criado: "Expansão Sul 2025"

Clientes processados:
  ✅ Novos clientes: 85
  🔄 Clientes existentes vinculados: 12
  ⚠️  Registros pulados: 3

Status de qualificação:
  🟢 Ativos: 45
  🔴 Inativos: 30
  🟡 Prospects: 22

Geografia:
  ✅ Cidades válidas: 95
  ⚠️  Cidades corrigidas: 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Próximos passos:
[ ] Enriquecer dados (adicionar mercados, produtos, etc)
[ ] Visualizar clientes no dashboard
[ ] Exportar lista de clientes
```

---

## 📋 CAMPOS OBRIGATÓRIOS NO CSV

### **Mínimo Absoluto:**

1. `nome` - Nome do cliente
2. `cidade` - Cidade
3. `uf` - Estado (2 letras)
4. `status` - Status de qualificação (ativo/inativo/prospect)

### **Recomendados:**

5. `cnpj` - Para deduplicação precisa
6. `email` - Para contato
7. `telefone` - Para contato

### **Opcionais:**

8. `setor` - Setor/mercado (será validado no enriquecimento)
9. `site` - Site oficial
10. `observacoes` - Notas adicionais

---

## 🤔 PERGUNTAS PARA VOCÊ (Conceitual)

### **1. PROJETO:**

- ✅ Você concorda que Projeto deve ser criado NA importação?
- ✅ Você concorda que é a "entidade de controle"?
- ❓ Projeto pode ter sub-projetos? Ou é sempre flat?

### **2. CLIENTE ÚNICO:**

- ✅ Você concorda que Cliente é único (um registro)?
- ✅ Você concorda com deduplicação por CNPJ ou nome+cidade?
- ❓ Se encontrar semelhante, SEMPRE perguntar? Ou ter opção "auto-merge"?

### **3. STATUS DE QUALIFICAÇÃO:**

- ✅ Você concorda que é obrigatório NA importação?
- ✅ Você concorda com: ativo, inativo, prospect?
- ❓ Precisa de mais status? (ex: "em_negociacao", "perdido")?

### **4. CLIENTE_PROJETO:**

- ✅ Você concorda com relacionamento N:N?
- ✅ Você concorda que cliente pode estar em múltiplos projetos?
- ❓ Precisa de mais metadados neste relacionamento?

### **5. PESQUISA:**

- ✅ Você concorda que Pesquisa = Enriquecimento (não importação)?
- ✅ Você concorda que é uma "ação coletiva"?
- ❓ Pesquisa deve ser sempre para TODO o projeto? Ou pode ser parcial?

### **6. GEOGRAFIA:**

- ✅ Você concorda em validar cidade em dim_geografia?
- ✅ Você concorda em sugerir correções?
- ❓ Se cidade não existir, criar automaticamente? Ou sempre perguntar?

### **7. MERCADO NA IMPORTAÇÃO:**

- ❓ Qual abordagem você prefere:
  - A) Mercado padrão "Não Classificado"
  - B) Usar coluna `setor` do CSV (se tiver)
  - C) Deixar NULL (preencher no enriquecimento)

### **8. CAMPOS OBRIGATÓRIOS:**

- ✅ Você concorda com: nome, cidade, uf, status?
- ❓ CNPJ deve ser obrigatório? Ou opcional?
- ❓ Email/telefone obrigatórios? Ou opcionais?

---

## 🎯 PRÓXIMOS PASSOS

Após você validar este modelo conceitual:

1. ✅ Ajustar modelo de dados (tabelas, relacionamentos)
2. ✅ Criar fluxo de importação detalhado
3. ✅ Definir UI de importação (telas, interações)
4. ✅ Implementar validações
5. ✅ Implementar deduplicação
6. ✅ Implementar UI de resolução de conflitos

**Depois disso:** Discutir ENRIQUECIMENTO (separadamente)

---

**Agora me diga:** Este modelo conceitual está alinhado com sua visão? O que precisa ajustar?
