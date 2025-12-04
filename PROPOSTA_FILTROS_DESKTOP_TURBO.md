# 📊 Proposta: Filtros no Desktop Turbo

## 🎯 Objetivo

Adicionar filtros de **Projeto** e **Pesquisa** no topo do Desktop Turbo para filtrar os totalizadores por contexto específico.

---

## 🔍 Análise da Estrutura Atual

### Tabelas Principais
1. **`dim_entidade`** - Clientes, Leads, Concorrentes
2. **`dim_produto`** - Produtos
3. **`dim_mercado`** - Mercados
4. **`dim_projeto`** - Projetos
5. **`dim_pesquisa`** - Pesquisas (vinculadas a projetos via `projeto_id`)

### Relacionamentos Identificados
- ✅ **Pesquisa → Projeto**: `dim_pesquisa.projeto_id` → `dim_projeto.id`
- ❌ **Entidade → Projeto**: Não existe relacionamento direto
- ❌ **Entidade → Pesquisa**: Não existe relacionamento direto

### Problema
**Não há tabelas de relacionamento (fato) entre entidades e projetos/pesquisas.**

---

## 💡 Proposta de Solução

### Opção 1: Filtros Baseados em Metadados Existentes ⭐ **RECOMENDADA**

Usar campos de origem/importação que já existem nas entidades:

```sql
-- Campos disponíveis em dim_entidade:
- importacao_id (integer)
- origem_arquivo (varchar)
- origem_processo (varchar)
- created_at (timestamp)
- created_by (varchar)
```

**Implementação:**
1. Adicionar campo `projeto_id` em `dim_entidade` (migração)
2. Adicionar campo `pesquisa_id` em `dim_entidade` (migração)
3. Filtrar totalizadores por esses campos

**Vantagens:**
- ✅ Simples e direto
- ✅ Não requer tabelas de relacionamento complexas
- ✅ Fácil de implementar

**Desvantagens:**
- ❌ Uma entidade só pode pertencer a 1 projeto/pesquisa
- ❌ Requer migração do banco

---

### Opção 2: Tabelas de Relacionamento N:N

Criar tabelas de fato para relacionamentos muitos-para-muitos:

```sql
CREATE TABLE fato_entidade_projeto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER REFERENCES dim_entidade(id),
  projeto_id INTEGER REFERENCES dim_projeto(id),
  data_vinculo TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  deleted_at TIMESTAMP NULL
);

CREATE TABLE fato_entidade_pesquisa (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER REFERENCES dim_entidade(id),
  pesquisa_id INTEGER REFERENCES dim_pesquisa(id),
  data_vinculo TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  deleted_at TIMESTAMP NULL
);
```

**Vantagens:**
- ✅ Uma entidade pode pertencer a múltiplos projetos/pesquisas
- ✅ Modelo dimensional correto
- ✅ Histórico de vínculos

**Desvantagens:**
- ❌ Mais complexo de implementar
- ❌ Requer migração e popular dados históricos
- ❌ Queries mais complexas

---

### Opção 3: Filtros Virtuais (Sem Persistência) 🚀 **MAIS RÁPIDA**

Filtrar por metadados temporais e de origem **sem alterar o banco**:

**Filtros disponíveis:**
1. **Por Data de Criação**: `created_at BETWEEN ? AND ?`
2. **Por Origem**: `origem_arquivo`, `origem_processo`
3. **Por Usuário**: `created_by`
4. **Por Importação**: `importacao_id`

**Implementação:**
- UI: Dropdowns para selecionar período, origem, usuário
- API: Adicionar query params `?data_inicio=&data_fim=&origem=&usuario=`

**Vantagens:**
- ✅ Zero migração
- ✅ Implementação imediata
- ✅ Usa dados existentes

**Desvantagens:**
- ❌ Não filtra por projeto/pesquisa específicos
- ❌ Menos preciso

---

## 🎨 Proposta de UI

### Layout do Filtro (Topo da Página)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Filtros                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │ 📁 Projeto       │  │ 🔍 Pesquisa      │  │ 🔄 Limpar │ │
│  │ [Selecione...]  ▼│  │ [Selecione...]  ▼│  │           │ │
│  └──────────────────┘  └──────────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Comportamento
1. **Projeto selecionado** → Filtra pesquisas daquele projeto
2. **Pesquisa selecionada** → Filtra entidades daquela pesquisa
3. **Ambos vazios** → Mostra todos os totais
4. **Botão Limpar** → Reseta filtros

---

## 🚀 Recomendação Final

**Implementar Opção 1 (Metadados) com migração:**

### Fase 1: Migração do Banco
```sql
-- Adicionar campos de contexto
ALTER TABLE dim_entidade ADD COLUMN projeto_id INTEGER REFERENCES dim_projeto(id);
ALTER TABLE dim_entidade ADD COLUMN pesquisa_id INTEGER REFERENCES dim_pesquisa(id);

-- Adicionar campos em outras tabelas
ALTER TABLE dim_produto ADD COLUMN projeto_id INTEGER REFERENCES dim_projeto(id);
ALTER TABLE dim_mercado ADD COLUMN projeto_id INTEGER REFERENCES dim_projeto(id);
```

### Fase 2: API com Filtros
```javascript
GET /api/totalizadores?projeto_id=10&pesquisa_id=6
```

### Fase 3: UI com Dropdowns
- Select de Projetos (busca de `/api/projetos`)
- Select de Pesquisas (busca de `/api/pesquisas?projeto_id=X`)
- Botão Limpar

---

## 📊 Exemplo de Query Filtrada

```sql
-- Totalizador de Clientes filtrado por projeto
SELECT COUNT(*) 
FROM dim_entidade 
WHERE tipo_entidade = 'cliente' 
  AND deleted_at IS NULL
  AND projeto_id = 10;

-- Totalizador de Clientes filtrado por pesquisa
SELECT COUNT(*) 
FROM dim_entidade 
WHERE tipo_entidade = 'cliente' 
  AND deleted_at IS NULL
  AND pesquisa_id = 6;
```

---

## ⏱️ Estimativa de Implementação

| Fase | Tarefa | Tempo |
|------|--------|-------|
| 1 | Migração do banco | 30 min |
| 2 | API de filtros | 1h |
| 3 | UI de filtros | 1h |
| 4 | Testes | 30 min |
| **Total** | | **3h** |

---

## ✅ Próximos Passos

1. ✅ Aprovar proposta
2. ⏳ Criar migração SQL
3. ⏳ Atualizar API `/api/totalizadores`
4. ⏳ Criar endpoints `/api/projetos` e `/api/pesquisas`
5. ⏳ Implementar UI de filtros
6. ⏳ Testar e validar
7. ⏳ Deploy

---

**Aguardando aprovação para prosseguir! 🚀**
