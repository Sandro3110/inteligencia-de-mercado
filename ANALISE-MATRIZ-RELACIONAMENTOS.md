# 🔍 Análise Completa da Matriz de Relacionamentos

## 📊 Situação Atual dos Dados (pesquisaId = 1)

### Clientes (807 total)

| Relacionamento                          | Com vínculo | Sem vínculo | % Cobertura |
| --------------------------------------- | ----------- | ----------- | ----------- |
| **→ Mercados** (via clientes_mercados)  | 557         | **250** ❌  | 69%         |
| **→ Produtos** (via produtos.clienteId) | 557         | **250** ❌  | 69%         |

### Leads (5.455 total)

| Relacionamento                 | Com vínculo       | Sem vínculo | % Cobertura |
| ------------------------------ | ----------------- | ----------- | ----------- |
| **→ Mercados** (via mercadoId) | 5.455             | 0           | 100% ✅     |
| **→ Produtos**                 | ❌ **NÃO EXISTE** | -           | 0%          |

### Concorrentes (9.079 total)

| Relacionamento                 | Com vínculo                         | Sem vínculo | % Cobertura |
| ------------------------------ | ----------------------------------- | ----------- | ----------- |
| **→ Mercados** (via mercadoId) | 9.079                               | 0           | 100% ✅     |
| **→ Produtos**                 | ❌ **CAMPO TEXT** (não estruturado) | -           | ?           |

---

## 🔗 Estrutura de Relacionamentos Atual

```
┌─────────────────────────────────────────────────────────────────┐
│                     MERCADOS_UNICOS (900)                       │
│                  (categoria, nome, segmentacao)                 │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    mercadoId            mercadoId            mercadoId
         │                    │                    │
┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐
│    CLIENTES     │  │      LEADS      │  │  CONCORRENTES   │
│      (807)      │  │     (5.455)     │  │     (9.079)     │
└────────┬────────┘  └─────────────────┘  └─────────────────┘
         │
    clienteId (via clientes_mercados N:N)
         │
         │
┌────────┴────────┐
│    PRODUTOS     │
│     (2.726)     │
│  (categoria,    │
│   nome, desc)   │
└─────────────────┘
```

---

## ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **250 Clientes Órfãos (31%)**

```sql
-- 250 clientes SEM mercado
-- 250 clientes SEM produtos
```

**Impacto:**

- Drill-down de Setores: mostra apenas 557 de 807 clientes (69%)
- Drill-down de Produtos: mostra apenas 557 de 807 clientes (69%)
- **31% dos dados ficam invisíveis!**

**Causa provável:**

- Enriquecimento incompleto
- Dados importados sem relacionamentos
- Bug no processo de gravação

---

### 2. **Leads NÃO têm Produtos**

```
leads.produto → ❌ CAMPO NÃO EXISTE
```

**Impacto:**

- Drill-down de Produtos não pode mostrar leads
- Análise cruzada Produto x Lead impossível

**Solução necessária:**

- Adicionar tabela `leads_produtos` (N:N)
- OU adicionar campo `produto` (TEXT) na tabela leads
- Ajustar enriquecimento para preencher produtos de leads

---

### 3. **Concorrentes têm Produto como TEXT**

```
concorrentes.produto → TEXT (não estruturado)
```

**Impacto:**

- Difícil fazer JOIN estruturado
- Busca por ILIKE (lenta e imprecisa)
- Não permite navegação hierárquica

**Solução necessária:**

- Criar tabela `concorrentes_produtos` (N:N)
- Relacionar com tabela `produtos` existente
- Ajustar enriquecimento

---

### 4. **Falta Relacionamento Leads ↔ Clientes**

```
leads → ❌ NÃO SE RELACIONA COM clientes
```

**Impacto:**

- Não dá para saber qual lead veio de qual cliente
- Análise de conversão impossível
- Matriz de dados desconectada

**Solução necessária:**

- Adicionar campo `clienteOrigemId` em leads
- OU criar tabela `leads_clientes` (N:N)

---

### 5. **Falta Relacionamento Concorrentes ↔ Clientes**

```
concorrentes → ❌ NÃO SE RELACIONA COM clientes
```

**Impacto:**

- Não dá para saber quais concorrentes competem com quais clientes
- Análise competitiva limitada

**Solução necessária:**

- Criar tabela `clientes_concorrentes` (N:N)
- Relacionar através do mercado comum

---

## ✅ MATRIZ IDEAL DE RELACIONAMENTOS

```
                    ┌─────────────────┐
                    │ MERCADOS_UNICOS │
                    │   (categoria)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    mercadoId           mercadoId           mercadoId
         │                   │                   │
┌────────▼────────┐  ┌───────▼────────┐  ┌──────▼──────────┐
│   CLIENTES      │  │     LEADS      │  │  CONCORRENTES   │
│     (807)       │◄─┤   (5.455)      │  │    (9.079)      │
└────────┬────────┘  └───────┬────────┘  └──────┬──────────┘
         │                   │                   │
    clienteId           leadId            concorrenteId
         │                   │                   │
         │         ┌─────────┴───────────────────┘
         │         │         │
         │    ┌────▼─────────▼────┐
         └───►│     PRODUTOS      │
              │  (categoria, nome)│
              └───────────────────┘
```

**Relacionamentos necessários:**

1. ✅ clientes → mercados (via clientes_mercados) - **EXISTE**
2. ✅ clientes → produtos (via produtos.clienteId) - **EXISTE**
3. ✅ leads → mercados (via mercadoId) - **EXISTE**
4. ❌ leads → produtos - **FALTA**
5. ❌ leads → clientes - **FALTA**
6. ✅ concorrentes → mercados (via mercadoId) - **EXISTE**
7. ❌ concorrentes → produtos - **FALTA (só TEXT)**
8. ❌ concorrentes → clientes - **FALTA**

---

## 🎯 PLANO DE AÇÃO

### Opção A: Correção Completa (Ideal) ⭐

**Tempo:** 2-3 dias
**Impacto:** 100% dos dados navegáveis

1. **Corrigir 250 clientes órfãos**
   - Investigar por que não têm mercado/produto
   - Re-enriquecer ou vincular manualmente
   - Garantir 100% de cobertura

2. **Adicionar produtos para leads**
   - Criar tabela `leads_produtos` (N:N)
   - Ajustar enriquecimento
   - Migrar dados existentes

3. **Estruturar produtos de concorrentes**
   - Criar tabela `concorrentes_produtos` (N:N)
   - Parsear campo TEXT atual
   - Vincular com produtos estruturados

4. **Relacionar leads ↔ clientes**
   - Adicionar `clienteOrigemId` em leads
   - Permitir análise de conversão

5. **Relacionar concorrentes ↔ clientes**
   - Criar `clientes_concorrentes` (N:N)
   - Vincular via mercado comum

---

### Opção B: Correção Parcial (Rápida) 🚀

**Tempo:** 4-6 horas
**Impacto:** 69% dos dados navegáveis (situação atual)

1. **Aceitar 69% de cobertura**
   - Documentar limitação
   - Mostrar apenas dados com relacionamentos

2. **Usar dados atuais**
   - 557 clientes com mercado/produto
   - 5.455 leads com mercado
   - 9.079 concorrentes com mercado

3. **Adicionar avisos na UI**
   - "Mostrando 557 de 807 clientes (69%)"
   - "250 clientes sem mercado/produto"

4. **Planejar correção futura**
   - Documentar melhorias necessárias
   - Priorizar no backlog

---

## 🔍 QUERIES PARA INVESTIGAR CLIENTES ÓRFÃOS

```sql
-- Clientes sem mercado
SELECT id, nome, cnae, cidade, uf
FROM clientes
WHERE "pesquisaId" = 1
  AND NOT EXISTS (
    SELECT 1 FROM clientes_mercados
    WHERE "clienteId" = clientes.id
  )
LIMIT 10;

-- Clientes sem produto
SELECT id, nome, cnae, cidade, uf
FROM clientes
WHERE "pesquisaId" = 1
  AND NOT EXISTS (
    SELECT 1 FROM produtos
    WHERE "clienteId" = clientes.id
  )
LIMIT 10;
```

---

## 💡 RECOMENDAÇÃO

**Opção B (Rápida)** para entregar drill-down funcionando AGORA com 69% dos dados.

**Depois:** Planejar Opção A para ter 100% de cobertura e matriz completa de relacionamentos.

**Justificativa:**

- 557 clientes já é uma base sólida
- Drill-down funcionará corretamente
- Podemos corrigir os 250 órfãos depois
- Melhor entregar algo funcionando do que esperar perfeição
