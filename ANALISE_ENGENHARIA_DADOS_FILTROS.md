# 🔬 Análise de Engenharia de Dados - Desktop Turbo com Filtros

## 📊 Situação Atual do Banco de Dados

### ✅ Tabelas Existentes (Relevantes)

| Tabela | Propósito | Status |
|--------|-----------|--------|
| `dim_entidade` | Clientes, Leads, Concorrentes | ✅ 20 registros |
| `dim_produto` | Produtos | ✅ 3 registros |
| `dim_mercado` | Mercados | ✅ 1 registro |
| `dim_projeto` | Projetos | ✅ 6 registros |
| `dim_pesquisa` | Pesquisas | ✅ 3 registros |
| `fato_entidade_contexto` | **Relacionamento N:N** | ⚠️ **0 registros** |

### 🔗 Relacionamentos Identificados

#### ✅ Relacionamento Existente
```sql
dim_pesquisa.projeto_id → dim_projeto.id
```
- **Status**: Funcional
- **Dados**: 3 pesquisas vinculadas a projetos

#### ❌ Relacionamento Faltante
```sql
fato_entidade_contexto
├── entidade_id → dim_entidade.id
├── projeto_id → dim_projeto.id
└── pesquisa_id → dim_pesquisa.id
```
- **Status**: **TABELA VAZIA** (0 registros)
- **Problema**: Entidades não estão vinculadas a projetos/pesquisas

---

## 🚨 Problema Crítico Identificado

### A tabela `fato_entidade_contexto` existe mas está VAZIA!

**Estrutura da tabela:**
```sql
CREATE TABLE fato_entidade_contexto (
  id INTEGER PRIMARY KEY,
  entidade_id INTEGER NOT NULL,      -- FK para dim_entidade
  projeto_id INTEGER NOT NULL,       -- FK para dim_projeto
  pesquisa_id INTEGER NOT NULL,      -- FK para dim_pesquisa
  geografia_id INTEGER,
  mercado_id INTEGER,
  status_qualificacao_id INTEGER,
  -- ... outros campos analíticos
  created_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);
```

**Dados atuais:**
- Total de registros: **0**
- Entidades únicas: **0**
- Projetos únicos: **0**
- Pesquisas únicas: **0**

### 💡 Conclusão
**O modelo dimensional está correto, mas os dados não foram populados!**

---

## 🎯 Estratégia de Solução

### Opção A: Popular `fato_entidade_contexto` ⭐ **RECOMENDADA**

**Vantagens:**
- ✅ Usa a estrutura dimensional correta já existente
- ✅ Permite relacionamento N:N (uma entidade em múltiplos projetos)
- ✅ Mantém histórico e auditoria
- ✅ Escalável e performático

**Desvantagens:**
- ⚠️ Precisa popular dados retroativos
- ⚠️ Precisa definir regra de negócio para vincular entidades existentes

**Implementação:**
1. Criar script de migração para popular dados históricos
2. Definir regra: vincular entidades por `importacao_id` ou `origem_processo`
3. Atualizar API `/api/totalizadores` para usar `fato_entidade_contexto`
4. Implementar UI de filtros

---

### Opção B: Adicionar campos diretos em `dim_entidade`

**Estrutura:**
```sql
ALTER TABLE dim_entidade ADD COLUMN projeto_id INTEGER;
ALTER TABLE dim_entidade ADD COLUMN pesquisa_id INTEGER;
```

**Vantagens:**
- ✅ Simples e rápido
- ✅ Queries mais diretas

**Desvantagens:**
- ❌ Uma entidade só pode pertencer a 1 projeto/pesquisa
- ❌ Não segue modelo dimensional
- ❌ Duplica estrutura (já existe `fato_entidade_contexto`)

---

## 📐 Arquitetura Proposta (Opção A)

### 1. Popular Dados Históricos

```sql
-- Script de migração para popular fato_entidade_contexto
INSERT INTO fato_entidade_contexto (
  entidade_id,
  projeto_id,
  pesquisa_id,
  data_qualificacao,
  created_at,
  created_by
)
SELECT 
  e.id as entidade_id,
  COALESCE(
    -- Tentar extrair projeto_id do origem_processo
    (SELECT id FROM dim_projeto WHERE codigo = e.origem_processo LIMIT 1),
    -- Ou usar projeto padrão
    (SELECT id FROM dim_projeto WHERE nome = 'Geral' LIMIT 1),
    -- Ou criar projeto "Sem Projeto"
    1
  ) as projeto_id,
  COALESCE(
    -- Tentar extrair pesquisa_id do origem_arquivo
    (SELECT id FROM dim_pesquisa WHERE nome LIKE '%' || e.origem_arquivo || '%' LIMIT 1),
    -- Ou usar pesquisa padrão
    (SELECT id FROM dim_pesquisa WHERE nome = 'Importação Geral' LIMIT 1),
    -- Ou criar pesquisa "Sem Pesquisa"
    1
  ) as pesquisa_id,
  COALESCE(e.created_at::date, CURRENT_DATE) as data_qualificacao,
  NOW() as created_at,
  'sistema_migracao' as created_by
FROM dim_entidade e
WHERE e.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM fato_entidade_contexto f 
    WHERE f.entidade_id = e.id AND f.deleted_at IS NULL
  );
```

### 2. API Atualizada com Filtros

**Endpoint:** `GET /api/totalizadores?projeto_id=10&pesquisa_id=6`

**Lógica:**
```javascript
// Totalizador de Clientes com filtro
const query = `
  SELECT COUNT(DISTINCT f.entidade_id) as total
  FROM fato_entidade_contexto f
  INNER JOIN dim_entidade e ON e.id = f.entidade_id
  WHERE e.tipo_entidade = 'cliente'
    AND e.deleted_at IS NULL
    AND f.deleted_at IS NULL
    ${projeto_id ? `AND f.projeto_id = ${projeto_id}` : ''}
    ${pesquisa_id ? `AND f.pesquisa_id = ${pesquisa_id}` : ''}
`;

// Total geral (sem filtro)
const totalGeral = await supabase
  .from('dim_entidade')
  .select('*', { count: 'exact', head: true })
  .eq('tipo_entidade', 'cliente')
  .is('deleted_at', null);

// Total filtrado
const totalFiltrado = await client.query(query);

return {
  tipo: 'clientes',
  total_geral: totalGeral.count,
  total_filtrado: totalFiltrado.rows[0].total,
  percentual: (totalFiltrado / totalGeral * 100).toFixed(1)
};
```

### 3. UI com Exibição Dual

**Layout proposto:**
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Filtros                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │ 📁 Projeto       │  │ 🔍 Pesquisa      │  │ 🔄 Limpar │ │
│  │ [Selecione...]  ▼│  │ [Selecione...]  ▼│  │           │ │
│  └──────────────────┘  └──────────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Tipo de Entidade          Total                    Status  │
├─────────────────────────────────────────────────────────────┤
│  👥 Clientes              7 / 20 (35%)              Ativo   │
│  ➕ Leads                 3 / 7 (43%)               Em...   │
│  🏢 Concorrentes          2 / 5 (40%)               Mon...  │
│  📦 Produtos              1 / 3 (33%)               Ativo   │
│  🎯 Mercados              1 / 1 (100%)              Ativo   │
│  📁 Projetos              3 / 6 (50%)               Em...   │
│  🔍 Pesquisas             2 / 3 (67%)               Pro...  │
└─────────────────────────────────────────────────────────────┘

Legenda: [Filtrado] / [Total Geral] (%)
```

---

## 📝 Regras de Negócio para Migração

### Como vincular entidades existentes a projetos/pesquisas?

**Opção 1: Por campo `origem_processo`**
```sql
-- Se origem_processo = 'enriquecimento_ia_batch_123'
-- Extrair 'batch_123' e buscar projeto correspondente
```

**Opção 2: Por campo `importacao_id`**
```sql
-- Buscar importacao_id na tabela dim_importacao
-- Vincular ao projeto/pesquisa da importação
```

**Opção 3: Criar projeto/pesquisa "Geral"**
```sql
-- Criar projeto "Dados Gerais" (id=1)
-- Criar pesquisa "Importação Geral" (id=1)
-- Vincular todas as entidades órfãs a esses registros
```

**Recomendação:** Usar **Opção 3** para migração inicial, depois permitir reclassificação manual.

---

## 🔄 Fluxo de Dados Completo

### 1. Carregamento Inicial (Sem Filtros)
```
User → Desktop Turbo
  ↓
GET /api/totalizadores
  ↓
Query: SELECT COUNT(*) FROM dim_entidade WHERE tipo = 'cliente'
  ↓
Response: { total_geral: 20, total_filtrado: 20, percentual: 100 }
```

### 2. Aplicação de Filtro (Projeto)
```
User seleciona "Projeto: Expansão Sul 2025"
  ↓
GET /api/totalizadores?projeto_id=10
  ↓
Query: 
  SELECT COUNT(DISTINCT f.entidade_id)
  FROM fato_entidade_contexto f
  INNER JOIN dim_entidade e ON e.id = f.entidade_id
  WHERE e.tipo = 'cliente' AND f.projeto_id = 10
  ↓
Response: { total_geral: 20, total_filtrado: 7, percentual: 35 }
```

### 3. Aplicação de Filtro (Projeto + Pesquisa)
```
User seleciona "Pesquisa: 🎉🎉🎉 SUCESSO TOTAL"
  ↓
GET /api/totalizadores?projeto_id=10&pesquisa_id=6
  ↓
Query: 
  SELECT COUNT(DISTINCT f.entidade_id)
  FROM fato_entidade_contexto f
  INNER JOIN dim_entidade e ON e.id = f.entidade_id
  WHERE e.tipo = 'cliente' 
    AND f.projeto_id = 10 
    AND f.pesquisa_id = 6
  ↓
Response: { total_geral: 20, total_filtrado: 3, percentual: 15 }
```

---

## ⚡ Performance e Índices

### Índices Recomendados
```sql
-- Índice para queries filtradas
CREATE INDEX idx_fato_contexto_filtros 
ON fato_entidade_contexto(projeto_id, pesquisa_id, deleted_at);

-- Índice para join com entidades
CREATE INDEX idx_fato_contexto_entidade 
ON fato_entidade_contexto(entidade_id, deleted_at);

-- Índice composto para queries específicas
CREATE INDEX idx_fato_contexto_completo 
ON fato_entidade_contexto(entidade_id, projeto_id, pesquisa_id, deleted_at);
```

### Estimativa de Performance
- **Sem filtros**: ~10ms (query direta em dim_entidade)
- **Com filtros**: ~50ms (join com fato_entidade_contexto)
- **Com índices**: ~20ms (join otimizado)

---

## 📊 Exemplo de Resposta da API

```json
{
  "success": true,
  "filtros": {
    "projeto_id": 10,
    "projeto_nome": "Expansão Sul 2025",
    "pesquisa_id": null,
    "pesquisa_nome": null
  },
  "totalizadores": [
    {
      "tipo": "clientes",
      "label": "Clientes",
      "total_geral": 20,
      "total_filtrado": 7,
      "percentual": 35.0,
      "icon": "👥",
      "color": "green",
      "status": "Ativo",
      "statusColor": "green"
    },
    {
      "tipo": "leads",
      "label": "Leads",
      "total_geral": 7,
      "total_filtrado": 3,
      "percentual": 42.9,
      "icon": "➕",
      "color": "yellow",
      "status": "Em prospecção",
      "statusColor": "yellow"
    }
  ],
  "timestamp": "2025-12-04T12:00:00.000Z"
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Preparação do Banco
- [ ] Verificar estrutura de `fato_entidade_contexto`
- [ ] Criar projeto "Dados Gerais" (fallback)
- [ ] Criar pesquisa "Importação Geral" (fallback)
- [ ] Criar índices de performance

### Fase 2: Migração de Dados
- [ ] Script de migração para popular `fato_entidade_contexto`
- [ ] Executar migração
- [ ] Validar dados migrados

### Fase 3: API
- [ ] Atualizar `/api/totalizadores` com suporte a filtros
- [ ] Adicionar lógica de dupla contagem (geral/filtrado)
- [ ] Testar queries com e sem filtros

### Fase 4: UI
- [ ] Implementar dropdowns de Projeto e Pesquisa
- [ ] Atualizar exibição para mostrar "X / Y (%)"
- [ ] Adicionar botão "Limpar Filtros"
- [ ] Adicionar loading states

### Fase 5: Testes
- [ ] Testar sem filtros (100%)
- [ ] Testar com filtro de projeto
- [ ] Testar com filtro de projeto + pesquisa
- [ ] Testar performance com muitos registros

---

## 🚀 Próximos Passos

**Aguardando aprovação para:**
1. Criar projeto/pesquisa "Geral" no banco
2. Popular `fato_entidade_contexto` com dados históricos
3. Implementar API com filtros
4. Implementar UI com exibição dual

**Tempo estimado:** 4-5 horas

---

**Pronto para começar! 🎯**
