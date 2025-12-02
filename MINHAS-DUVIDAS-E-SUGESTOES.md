# 🤔 MINHAS DÚVIDAS E SUGESTÕES

**Data:** 01/12/2025  
**Contexto:** Após validação do modelo dimensional

---

## ✅ O QUE EU COMPREENDI BEM

### **1. Conceito de Cubo Dimensional**

✅ **Entendi perfeitamente:**

- Projeto e Pesquisa são **DIMENSÕES**, não atributos
- Granularidade: **Entidade + Projeto + Pesquisa**
- Uma entidade pode existir em **múltiplos contextos** (N projetos × N pesquisas)
- Histórico completo mantido (não sobrescreve)

**Exemplo que confirma meu entendimento:**

```
Cliente "Empresa ABC" (dim_entidade.id = 1):

Contexto 1: Projeto "Expansão Sul" + Pesquisa "Jan/2025"
  → Qualidade: 85, Mercado: "Construção Civil"

Contexto 2: Projeto "Expansão Sul" + Pesquisa "Mar/2025" (re-enriquecida)
  → Qualidade: 92, Mercado: "Construção Civil" (melhorou!)

Contexto 3: Projeto "Reativação Inativos" + Pesquisa "Fev/2025"
  → Qualidade: 88, Mercado: "Construção Civil" (outro projeto!)
```

**Está correto?** ✅

---

### **2. Projeto como Agregador/Unidade de Negócio**

✅ **Entendi perfeitamente:**

- Projeto **NÃO é apenas** um container
- É uma **entidade de negócio** com significado:
  - Agregador (agrupa entidades relacionadas)
  - Unidade de Negócio (ex: "Vendas Sul", "Marketing Digital")
  - Centro de Custos (controle financeiro)
- Pode ter metadados: orçamento, responsável, status

**Está correto?** ✅

---

### **3. Pesquisa como Snapshot Temporal**

✅ **Entendi perfeitamente:**

- Pesquisa **NÃO é importação**
- É o **ato de enriquecer** dados já importados
- É um **snapshot** de qualificação em um momento específico
- Múltiplas pesquisas = histórico de evolução

**Está correto?** ✅

---

### **4. Origem da Entidade**

✅ **Entendi perfeitamente:**

- Rastrear **como** a entidade foi criada:
  - Importação manual (CSV)
  - IA/Prompt semântico (futuro)
  - API externa
  - Criação manual
- Registrar: arquivo, processo, prompt, confiança, usuário, data

**Está correto?** ✅

---

### **5. Auditoria Completa**

✅ **Entendi perfeitamente:**

- TODAS as tabelas devem ter:
  - `created_at`, `created_by`
  - `updated_at`, `updated_by`
- Tabelas de fatos devem ter TAMBÉM:
  - `added_at`, `added_by`
- dim_pesquisa deve ter TAMBÉM:
  - `started_at`, `started_by`, `completed_at`, `duration_seconds`

**Está correto?** ✅

---

## ❓ MINHAS DÚVIDAS (Precisam de Clareza)

### **DÚVIDA 1: Fluxo de Importação → Pesquisa**

**Cenário:**

1. Usuário importa CSV com 100 clientes
2. Sistema cria Projeto "Expansão Sul"
3. Sistema insere 100 entidades em `dim_entidade`

**Pergunta:**

- ❓ Neste momento, já cria uma Pesquisa "Importação Inicial"?
- ❓ Ou só cria Pesquisa quando usuário clicar "Enriquecer"?

**Opção A: Criar Pesquisa na Importação**

```
Importar CSV → Criar Projeto → Criar Pesquisa "Importação" → Inserir em fato_entidade_contexto
```

- ✅ Registra que entidades foram importadas
- ✅ Mantém histórico completo desde o início
- ❌ Pesquisa sem enriquecimento (qualidade baixa)

**Opção B: Criar Pesquisa só no Enriquecimento**

```
Importar CSV → Criar Projeto → Inserir em fato_entidade_contexto (pesquisa_id = NULL)
Enriquecer → Criar Pesquisa "Enriquecimento Jan/2025" → Atualizar pesquisa_id
```

- ✅ Pesquisa sempre tem enriquecimento
- ❌ Não registra importação como evento

**Qual você prefere?** 🤔

---

### **DÚVIDA 2: Entidade em Múltiplos Projetos - Dados Diferentes?**

**Cenário:**

```
Cliente "Empresa ABC" existe em 2 projetos:

Projeto A: "Expansão Sul"
  → Status: "ativo"
  → Mercado: "Construção Civil"
  → Observações: "Cliente VIP"

Projeto B: "Reativação Inativos"
  → Status: "inativo"
  → Mercado: "Construção Civil"
  → Observações: "Parou de comprar em 2024"
```

**Pergunta:**

- ❓ O **status** pode ser diferente por projeto?
- ❓ O **mercado** pode ser diferente por projeto?
- ❓ As **observações** podem ser diferentes por projeto?

**Meu entendimento atual:**

- ✅ Status, Mercado, Observações estão em `fato_entidade_contexto`
- ✅ Portanto, **SIM**, podem ser diferentes por projeto
- ✅ Isso faz sentido: cliente pode ser "ativo" em um projeto e "inativo" em outro

**Está correto?** 🤔

---

### **DÚVIDA 3: Re-enriquecimento - Criar Nova Pesquisa ou Atualizar?**

**Cenário:**

```
Projeto "Expansão Sul":
  Pesquisa 1 "Jan/2025": 100 clientes enriquecidos

Usuário clica "Re-enriquecer" em Março/2025
```

**Pergunta:**

- ❓ Criar **nova Pesquisa** "Mar/2025"?
- ❓ Ou **atualizar** Pesquisa 1?

**Opção A: Criar Nova Pesquisa (Histórico)**

```
Pesquisa 1 "Jan/2025": qualidade_score = 85
Pesquisa 2 "Mar/2025": qualidade_score = 92
```

- ✅ Mantém histórico completo
- ✅ Comparação temporal fácil
- ❌ Mais registros em `fato_entidade_contexto`

**Opção B: Atualizar Pesquisa Existente (Sobrescrever)**

```
Pesquisa 1 "Jan/2025 → Mar/2025": qualidade_score = 92 (sobrescreveu 85)
```

- ✅ Menos registros
- ❌ Perde histórico

**Meu entendimento:** Você quer **Opção A** (histórico completo), correto? 🤔

---

### **DÚVIDA 4: Deduplicação - Quando Perguntar ao Usuário?**

**Cenário:**

```
Importando CSV:
  Linha 1: "Empresa ABC Ltda", CNPJ "12.345.678/0001-90", São Paulo/SP

Banco de dados:
  Entidade existente: "Empresa ABC", CNPJ "12.345.678/0001-90", São Paulo/SP
```

**Pergunta:**

- ❓ **SEMPRE** perguntar ao usuário?
- ❓ Ou ter opção "auto-merge" se confiança > 95%?

**Opção A: Sempre Perguntar**

- ✅ Usuário tem controle total
- ❌ Pode ser chato para importações grandes

**Opção B: Auto-merge se Confiança Alta**

```
Se CNPJ idêntico → Auto-merge (confiança 100%)
Se nome + cidade + uf similar > 95% → Perguntar
Se nome + cidade + uf similar < 95% → Criar novo
```

- ✅ Mais rápido
- ❌ Pode errar em casos edge

**Qual você prefere?** 🤔

---

### **DÚVIDA 5: Mercado na Importação - Qual Abordagem?**

**Cenário:**

```
CSV tem coluna "setor": "Construção Civil"
```

**Pergunta:**

- ❓ Criar mercado "Construção Civil" na importação?
- ❓ Ou deixar mercado_id = NULL até enriquecer?

**Opção A: Criar Mercado Temporário**

```
Importar → Criar mercado "Construção Civil" (sem enriquecimento)
Enriquecer → Enriquecer mercado (adicionar segmentação, tamanho, etc)
```

- ✅ Dados disponíveis imediatamente
- ❌ Mercado sem dados enriquecidos

**Opção B: Deixar NULL**

```
Importar → mercado_id = NULL
Enriquecer → Criar mercado "Construção Civil" (já enriquecido)
```

- ✅ Mercado sempre enriquecido
- ❌ Dados indisponíveis até enriquecer

**Opção C: Mercado Padrão "Não Classificado"**

```
Importar → mercado_id = 1 (mercado padrão)
Enriquecer → Substituir por mercado real
```

- ✅ Sempre tem mercado (não NULL)
- ❌ Mercado "fake" temporário

**Qual você prefere?** 🤔

---

## 💡 MINHAS SUGESTÕES

### **SUGESTÃO 1: Tabela de Histórico de Mudanças**

**Problema:**

- `fato_entidade_contexto` registra **estado atual** em cada contexto
- Mas se atualizar `status_qualificacao` de "prospect" → "ativo", **perde histórico**

**Sugestão:**

```sql
CREATE TABLE fato_entidade_contexto_history (
  id SERIAL PRIMARY KEY,
  fato_entidade_contexto_id INTEGER NOT NULL,
  campo_alterado VARCHAR(50) NOT NULL, -- ex: "status_qualificacao_id"
  valor_anterior TEXT,
  valor_novo TEXT,
  changed_at TIMESTAMP NOT NULL,
  changed_by INTEGER, -- FK → users
  motivo TEXT -- Opcional: por que mudou?
);
```

**Benefício:**

- ✅ Auditoria completa de mudanças
- ✅ Rollback granular (campo por campo)
- ✅ Responde: "Quando este cliente virou ativo?"

**Você quer isso?** 🤔

---

### **SUGESTÃO 2: Tabela de Importações (Metadados)**

**Problema:**

- `dim_entidade.origem_arquivo` registra nome do CSV
- Mas se importar **100 clientes do mesmo CSV**, duplica nome 100 vezes

**Sugestão:**

```sql
CREATE TABLE importacoes (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL, -- FK → dim_projeto
  arquivo_nome VARCHAR(255) NOT NULL,
  arquivo_tamanho INTEGER, -- bytes
  arquivo_hash VARCHAR(64), -- MD5 do arquivo
  total_linhas INTEGER,
  linhas_importadas INTEGER,
  linhas_puladas INTEGER,
  linhas_erro INTEGER,
  status VARCHAR(20), -- pendente, concluida, falhou
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  created_by INTEGER NOT NULL
);

-- dim_entidade referencia importacao
ALTER TABLE dim_entidade ADD COLUMN importacao_id INTEGER; -- FK → importacoes
```

**Benefício:**

- ✅ Metadados centralizados
- ✅ Não duplica nome do arquivo
- ✅ Rastreabilidade completa: "Quais clientes vieram do arquivo X?"

**Você quer isso?** 🤔

---

### **SUGESTÃO 3: Soft Delete em Dimensões**

**Problema:**

- Se deletar `dim_entidade`, perde **TODOS os contextos** (CASCADE)
- Pode ser acidental ou indesejado

**Sugestão:**

```sql
ALTER TABLE dim_entidade ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE dim_entidade ADD COLUMN deleted_by INTEGER;

-- Não deletar fisicamente, marcar como deletado
UPDATE dim_entidade SET deleted_at = NOW(), deleted_by = :user_id WHERE id = :id;

-- Queries ignoram deletados
SELECT * FROM dim_entidade WHERE deleted_at IS NULL;
```

**Benefício:**

- ✅ Recuperação possível
- ✅ Auditoria: quem deletou, quando
- ✅ Mantém integridade referencial

**Você quer isso?** 🤔

---

### **SUGESTÃO 4: Índices Parciais para Performance**

**Problema:**

- Queries frequentes filtram por `deleted_at IS NULL` e `status = 'ativo'`
- Índices normais incluem registros deletados/inativos (desperdício)

**Sugestão:**

```sql
-- Índice parcial: só entidades ativas não deletadas
CREATE INDEX idx_entidade_ativo
ON dim_entidade (tipo_entidade, created_at)
WHERE deleted_at IS NULL;

-- Índice parcial: só contextos enriquecidos
CREATE INDEX idx_fec_enriquecido
ON fato_entidade_contexto (projeto_id, pesquisa_id)
WHERE pesquisa_id IS NOT NULL;
```

**Benefício:**

- ✅ Índices menores (mais rápidos)
- ✅ Queries mais eficientes
- ✅ Menos espaço em disco

**Você quer isso?** 🤔

---

### **SUGESTÃO 5: Materialized Views para Dashboards**

**Problema:**

- Dashboards fazem queries complexas (JOINs de 5+ tabelas)
- Pode ser lento com milhões de registros

**Sugestão:**

```sql
CREATE MATERIALIZED VIEW mv_dashboard_projetos AS
SELECT
  p.id AS projeto_id,
  p.nome AS projeto_nome,
  COUNT(DISTINCT fec.entidade_id) AS total_entidades,
  COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'cliente' THEN fec.entidade_id END) AS total_clientes,
  COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'lead' THEN fec.entidade_id END) AS total_leads,
  AVG(fec.qualidade_score) AS qualidade_media,
  COUNT(DISTINCT fec.pesquisa_id) AS total_pesquisas
FROM dim_projeto p
LEFT JOIN fato_entidade_contexto fec ON fec.projeto_id = p.id
LEFT JOIN dim_entidade e ON e.id = fec.entidade_id
GROUP BY p.id, p.nome;

-- Refresh periódico (a cada hora)
REFRESH MATERIALIZED VIEW mv_dashboard_projetos;
```

**Benefício:**

- ✅ Dashboards instantâneos (pré-calculados)
- ✅ Menos carga no banco
- ✅ Escalável para milhões de registros

**Você quer isso?** 🤔

---

## 🎯 RESUMO DAS MINHAS DÚVIDAS

| #   | Dúvida                        | Opções                              | Minha Recomendação                     |
| --- | ----------------------------- | ----------------------------------- | -------------------------------------- |
| 1   | Pesquisa na importação?       | A) Criar / B) Só no enriquecimento  | **A** (histórico completo)             |
| 2   | Dados diferentes por projeto? | Sim / Não                           | **Sim** (está no fato)                 |
| 3   | Re-enriquecimento?            | A) Nova pesquisa / B) Atualizar     | **A** (histórico)                      |
| 4   | Deduplicação?                 | A) Sempre perguntar / B) Auto-merge | **B** (CNPJ = auto, resto = perguntar) |
| 5   | Mercado na importação?        | A) Criar / B) NULL / C) Padrão      | **A** (criar temporário)               |

---

## 🎯 RESUMO DAS MINHAS SUGESTÕES

| #   | Sugestão              | Benefício               | Complexidade |
| --- | --------------------- | ----------------------- | ------------ |
| 1   | Tabela de histórico   | Auditoria granular      | Média        |
| 2   | Tabela de importações | Metadados centralizados | Baixa        |
| 3   | Soft delete           | Recuperação possível    | Baixa        |
| 4   | Índices parciais      | Performance             | Baixa        |
| 5   | Materialized views    | Dashboards rápidos      | Média        |

---

## ❓ PARA VOCÊ RESPONDER

1. **Dúvidas 1-5:** Qual opção você prefere para cada?
2. **Sugestões 1-5:** Você quer implementar alguma? Todas? Nenhuma?
3. **Profundidade:** Consegui compreender bem o conceito? Algo está errado?

---

**Minha auto-avaliação:**

- ✅ Conceito dimensional: **10/10** (compreendi perfeitamente)
- ✅ Projeto como agregador: **10/10** (compreendi perfeitamente)
- ✅ Auditoria e origem: **10/10** (compreendi perfeitamente)
- ⚠️ Fluxos de importação/enriquecimento: **7/10** (preciso de clareza nas dúvidas 1, 3, 4, 5)

**Você concorda com minha auto-avaliação?** 🎯
