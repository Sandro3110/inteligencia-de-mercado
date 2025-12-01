# 🔍 Auditoria de Consistência - Módulos de Drill-Down

**Data:** 2025-11-30  
**Objetivo:** Garantir que Setores e Produtos sigam EXATAMENTE o mesmo padrão da Geoposição

---

## 📋 Checklist de Consistência

### ✅ Geoposição (Referência)

- [x] Filtros completos (Projeto, Pesquisa, Setor, Porte, Qualidade)
- [x] 3 Abas (Clientes, Leads, Concorrentes)
- [x] Componente GeoTable reutilizável
- [x] Modal de detalhes (EntityDetailCard)
- [x] Botões de exportação (Excel, CSV)
- [x] Botão de limpar filtros
- [x] Estado de filtros persistente
- [x] Loading states
- [x] Empty states

### ❌ Setores (Atual - INCONSISTENTE)

- [ ] Filtros completos → ❌ SÓ TEM SELETOR BÁSICO
- [ ] 3 Abas → ❌ NÃO TEM ABAS
- [ ] Componente reutilizável → ⚠️ USA GeoTable MAS SÓ NO MODAL
- [ ] Modal de detalhes → ✅ TEM
- [ ] Botões de exportação → ❌ NÃO TEM
- [ ] Botão de limpar filtros → ❌ NÃO TEM
- [ ] Estado de filtros → ❌ DIFERENTE
- [ ] Loading states → ✅ TEM
- [ ] Empty states → ⚠️ PARCIAL

### ❌ Produtos (Atual - INCONSISTENTE)

- [ ] Filtros completos → ❌ SÓ TEM SELETOR BÁSICO
- [ ] 3 Abas → ⚠️ TEM 2 ABAS (Ranking, Matriz) - DIFERENTE
- [ ] Componente reutilizável → ❌ TABELAS INLINE
- [ ] Modal de detalhes → ❌ NÃO TEM
- [ ] Botões de exportação → ❌ NÃO TEM
- [ ] Botão de limpar filtros → ❌ NÃO TEM
- [ ] Estado de filtros → ❌ DIFERENTE
- [ ] Loading states → ✅ TEM
- [ ] Empty states → ⚠️ PARCIAL

---

## 🚨 Problemas Identificados

### 1. **Estrutura de Filtros Diferente**

**Geoposição:**

```typescript
const [filters, setFilters] = useState({
  projectId: undefined,
  pesquisaId: undefined,
  setor: undefined,
  porte: undefined,
  qualidade: undefined,
});
```

**Setores/Produtos:**

```typescript
const projectId = searchParams.get('projectId') || selectedProject?.id || null;
const pesquisaId = searchParams.get('pesquisaId') || null;
// ❌ NÃO TEM ESTADO DE FILTROS
```

### 2. **Abas Diferentes**

**Geoposição:**

- 3 abas: Clientes, Leads, Concorrentes
- Componente `GeoTable` para cada aba

**Setores:**

- ❌ NÃO TEM ABAS
- Mostra só tabela de setores
- Abre modal com GeoTable

**Produtos:**

- ❌ 2 abas diferentes: Ranking, Matriz
- Não segue padrão Clientes/Leads/Concorrentes

### 3. **Componentes Não Reutilizados**

**Geoposição:**

- Usa `GeoTable` component
- Usa `EntityDetailCard` component

**Setores:**

- ⚠️ Usa `GeoTable` SÓ NO MODAL
- Tabela principal é inline (não reutiliza)

**Produtos:**

- ❌ TUDO inline (não reutiliza nada)

### 4. **Botões de Ação Faltando**

**Geoposição:**

- Botão Filtros
- Botão Excel
- Botão CSV
- Botão Limpar Filtros

**Setores/Produtos:**

- ❌ NENHUM botão de ação

---

## ✅ Plano de Refatoração

### Objetivo:

**Fazer Setores e Produtos IDÊNTICOS à Geoposição em estrutura**

### Estrutura Alvo (mesma para os 3):

```
┌─────────────────────────────────────────┐
│ Header                                   │
│ [Título] [Filtros] [Excel] [CSV]        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Filtros Panel (quando aberto)           │
│ [Projeto] [Pesquisa] [Setor] [Porte]... │
│ [Limpar Filtros]                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Abas                                     │
│ [Clientes] [Leads] [Concorrentes]       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Conteúdo (GeoTable ou equivalente)      │
│                                          │
│ [Dados hierárquicos ou agregados]       │
└─────────────────────────────────────────┘
```

### Mudanças Necessárias:

**Setores:**

1. ✅ Adicionar filtros completos (igual Geoposição)
2. ✅ Adicionar 3 abas (Clientes, Leads, Concorrentes)
3. ✅ Usar GeoTable diretamente (não só no modal)
4. ✅ Adicionar botões Excel/CSV
5. ✅ Adicionar botão Limpar Filtros
6. ✅ Unificar estado de filtros

**Produtos:**

1. ✅ Adicionar filtros completos (igual Geoposição)
2. ✅ MUDAR abas para (Clientes, Leads, Concorrentes)
3. ✅ Criar componente ProductTable reutilizável
4. ✅ Adicionar botões Excel/CSV
5. ✅ Adicionar botão Limpar Filtros
6. ✅ Unificar estado de filtros

---

## 🎯 Decisão de Arquitetura

**TODOS os 3 módulos devem:**

- Ter MESMA estrutura HTML
- Ter MESMOS filtros
- Ter MESMAS 3 abas (Clientes, Leads, Concorrentes)
- Usar MESMOS componentes quando possível
- Ter MESMOS botões de ação
- Ter MESMO estado de filtros

**Diferença APENAS na lógica:**

- Geoposição: Hierarquia Região → Estado → Cidade
- Setores: Agregação por Setor (mas mostra nas 3 abas)
- Produtos: Agregação por Produto (mas mostra nas 3 abas)

---

## 📊 Estimativa de Refatoração

- **Setores:** ~2 horas
- **Produtos:** ~3 horas
- **Total:** ~5 horas

---

**Status:** AUDITORIA COMPLETA - AGUARDANDO APROVAÇÃO PARA REFATORAÇÃO
