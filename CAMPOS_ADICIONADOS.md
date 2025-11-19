# Campos Adicionados ao Schema - Enriquecimento

## ✅ Alterações Aplicadas

### 📊 Tabela `clientes` (26 campos)

**Campos novos adicionados:**
- `regiao` (varchar 100) - Região geográfica (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)
- `faturamentoDeclarado` (text) - Faturamento anual declarado/oficial
- `numeroEstabelecimentos` (int) - Quantidade de filiais/unidades

**Campos já existentes:**
- `cidade` (varchar 100) ✅
- `uf` (varchar 2) ✅
- `porte` (varchar 50) ✅

---

### 📊 Tabela `concorrentes` (21 campos)

**Campos novos adicionados:**
- `cidade` (varchar 100) - Cidade da sede
- `uf` (varchar 2) - Estado da sede
- `faturamentoDeclarado` (text) - Faturamento anual declarado/oficial
- `numeroEstabelecimentos` (int) - Quantidade de filiais/unidades

**Campos já existentes:**
- `porte` (varchar 50) ✅
- `faturamentoEstimado` (text) ✅ - Mantido para estimativas quando não há declaração

---

### 📊 Tabela `leads` (26 campos)

**Campos novos adicionados:**
- `cidade` (varchar 100) - Cidade da sede
- `uf` (varchar 2) - Estado da sede
- `faturamentoDeclarado` (text) - Faturamento anual declarado/oficial
- `numeroEstabelecimentos` (int) - Quantidade de filiais/unidades

**Campos já existentes:**
- `porte` (varchar 50) ✅
- `regiao` (varchar 100) ✅ - Mantido para região genérica

---

## 📋 Resumo de Campos por Entidade

| Campo | Clientes | Concorrentes | Leads |
|-------|----------|--------------|-------|
| **cidade** | ✅ | ✅ | ✅ |
| **uf** | ✅ | ✅ | ✅ |
| **regiao** | ✅ | ❌ | ✅ |
| **porte** | ✅ | ✅ | ✅ |
| **faturamentoDeclarado** | ✅ | ✅ | ✅ |
| **faturamentoEstimado** | ❌ | ✅ | ❌ |
| **numeroEstabelecimentos** | ✅ | ✅ | ✅ |

---

## 🎯 Uso no Enriquecimento

### Clientes
```json
{
  "cidade": "São Paulo",
  "uf": "SP",
  "regiao": "Sudeste",
  "porte": "Média",
  "faturamentoDeclarado": "R$ 50 milhões/ano",
  "numeroEstabelecimentos": 3
}
```

### Concorrentes
```json
{
  "cidade": "Campinas",
  "uf": "SP",
  "porte": "Grande",
  "faturamentoEstimado": "R$ 200-500 milhões/ano",
  "faturamentoDeclarado": "R$ 350 milhões/ano",
  "numeroEstabelecimentos": 12
}
```

### Leads
```json
{
  "cidade": "Rio de Janeiro",
  "uf": "RJ",
  "regiao": "Sudeste",
  "porte": "Pequena",
  "faturamentoDeclarado": "R$ 5 milhões/ano",
  "numeroEstabelecimentos": 1
}
```

---

## 🔄 Próximos Passos

1. ✅ Schema atualizado
2. ✅ Migrações aplicadas no banco
3. ⏳ Atualizar prompts Gemini com novos campos
4. ⏳ Atualizar funções CRUD no backend
5. ⏳ Testar enriquecimento com amostra

---

**Status**: Schema completo e pronto para enriquecimento! 🚀
