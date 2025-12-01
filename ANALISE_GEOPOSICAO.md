# 🔍 ANÁLISE COMPLETA DA PÁGINA DE GEOPOSIÇÃO

## 📋 ESTRUTURA IDENTIFICADA

### **1. COMPONENTES PRINCIPAIS**

#### **A) Header com Filtros**

```typescript
// Localização: Linhas 214-258
- Título da página
- Botão "Filtros" (toggle)
- Botões de exportação (Excel, CSV)
- Indicador de filtros ativos
```

#### **B) Painel de Filtros (Collapsible)**

```typescript
// Localização: Linhas 261-376
Filtros disponíveis:
1. Projeto (select)
2. Pesquisa (select - depende de Projeto)
3. Setor (select - dinâmico via API)
4. Porte (select - dinâmico via API)
5. Qualidade (select - dinâmico via API)
6. Botão "Limpar Filtros"
```

#### **C) Abas de Entidades**

```typescript
// Localização: Linhas 379-416
- Clientes (ícone Building2)
- Leads (ícone Target)
- Concorrentes (ícone Users)
```

#### **D) Conteúdo Principal**

```typescript
// Localização: Linhas 419-431
- Componente GeoTable
- Recebe filtros e callbacks
```

---

## 🔗 REGRAS DE NEGÓCIO IDENTIFICADAS

### **1. HIERARQUIA DE FILTROS**

```
Projeto (obrigatório para Pesquisa)
  ↓
Pesquisa (opcional, mas depende de Projeto)
  ↓
Setor, Porte, Qualidade (opcionais, dinâmicos)
```

**Código:**

```typescript
// Linha 39-42: Pesquisas só carregam se Projeto selecionado
const { data: pesquisas } = trpc.pesquisas.list.useQuery(
  { projectId: filters.projectId ?? 0 },
  { enabled: !!filters.projectId }
);

// Linha 293: Pesquisa desabilitada se Projeto não selecionado
disabled={!filters.projectId}
```

### **2. FILTROS DINÂMICOS**

```typescript
// Linha 43-46: Busca filtros disponíveis baseado em Projeto/Pesquisa
const { data: availableFilters } = trpc.unifiedMap.getAvailableFilters.useQuery({
  projectId: filters.projectId,
  pesquisaId: filters.pesquisaId,
});

// Retorna:
// - setores: string[]
// - portes: string[]
// - qualidades: string[]
```

### **3. RESET EM CASCATA**

```typescript
// Linha 271: Ao mudar Projeto, reseta Pesquisa
onChange={(e) => {
  const value = e.target.value ? Number(e.target.value) : undefined;
  setFilters((prev) => ({ ...prev, projectId: value, pesquisaId: undefined }));
}}
```

### **4. INDICADOR DE FILTROS ATIVOS**

```typescript
// Linha 94-95
const hasActiveFilters =
  filters.projectId || filters.pesquisaId || filters.setor || filters.porte || filters.qualidade;

// Linha 235-237: Badge visual
{hasActiveFilters && (
  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">•</span>
)}
```

---

## 🎨 PADRÕES DE UI/UX

### **1. Estados do Botão de Filtros**

```typescript
// Linha 225-231
className={`... ${
  showFilters
    ? 'bg-blue-600 text-white'                           // Aberto
    : hasActiveFilters
      ? 'bg-blue-100 text-blue-700 border border-blue-300' // Fechado com filtros
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'      // Fechado sem filtros
}`}
```

### **2. Abas com Cores Diferentes**

```typescript
// Clientes: azul (blue-600)
// Leads: verde (green-600)
// Concorrentes: vermelho (red-600)
```

### **3. Painel de Filtros Collapsible**

```typescript
// Linha 261: Renderização condicional
{showFilters && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
    {/* Grid de filtros */}
  </div>
)}
```

---

## 📊 QUERIES tRPC UTILIZADAS

### **1. Buscar Projetos**

```typescript
trpc.projects.list.useQuery();
```

### **2. Buscar Pesquisas**

```typescript
trpc.pesquisas.list.useQuery(
  { projectId: filters.projectId ?? 0 },
  { enabled: !!filters.projectId }
);
```

### **3. Buscar Filtros Disponíveis**

```typescript
trpc.unifiedMap.getAvailableFilters.useQuery({
  projectId: filters.projectId,
  pesquisaId: filters.pesquisaId,
});
```

### **4. Buscar Dados (passado para GeoTable)**

```typescript
// GeoTable recebe:
projectId={filters.projectId}
pesquisaId={filters.pesquisaId}
entityType={activeTab}
filters={{
  setor: filters.setor,
  porte: filters.porte,
  qualidade: filters.qualidade,
}}
```

---

## ✅ COMPONENTES A REPLICAR PARA SETORES/PRODUTOS

### **1. Header com Filtros** ✅

- Título da página
- Botão "Filtros" com toggle
- Botões de exportação
- Indicador de filtros ativos

### **2. Painel de Filtros** ✅

- Grid responsivo (5 colunas)
- Selects com labels
- Botão "Limpar Filtros"
- Estados disabled corretos

### **3. Abas de Entidades** ❌

- **NÃO REPLICAR** - Drill-down substitui abas

### **4. Estado de Filtros** ✅

```typescript
const [filters, setFilters] = useState({
  projectId: undefined as number | undefined,
  pesquisaId: undefined as number | undefined,
  setor: undefined as string | undefined,
  porte: undefined as string | undefined,
  qualidade: undefined as string | undefined,
});
```

### **5. Queries** ✅

- `projects.list`
- `pesquisas.list`
- `unifiedMap.getAvailableFilters`

---

## 🔧 ADAPTAÇÕES NECESSÁRIAS

### **Para Setores:**

1. **Manter:**
   - Header com filtros
   - Painel de filtros collapsible
   - Queries de projetos/pesquisas/filtros

2. **Substituir:**
   - Abas (Clientes/Leads/Concorrentes) → Drill-down (3 níveis)
   - GeoTable → SectorDrillDownStandalone

3. **Adicionar:**
   - Passar filtros para componente de drill-down
   - Integrar exportação com drill-down

### **Para Produtos:**

1. **Manter:**
   - Header com filtros
   - Painel de filtros collapsible
   - Queries de projetos/pesquisas/filtros

2. **Substituir:**
   - Abas (Clientes/Leads/Concorrentes) → Drill-down (3 níveis)
   - GeoTable → ProductDrillDownStandalone

3. **Adicionar:**
   - Passar filtros para componente de drill-down
   - Integrar exportação com drill-down

---

## 📝 ESTRUTURA FINAL PROPOSTA

```tsx
export default function SetoresPage() {
  // Estados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({...});

  // Queries
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(...);
  const { data: availableFilters } = trpc.unifiedMap.getAvailableFilters.useQuery(...);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header com Filtros */}
      <Header
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Painel de Filtros */}
      {showFilters && (
        <FiltersPanel
          filters={filters}
          setFilters={setFilters}
          projects={projects}
          pesquisas={pesquisas}
          availableFilters={availableFilters}
        />
      )}

      {/* Drill-Down (substitui abas + tabela) */}
      <div className="flex-1 overflow-auto p-6">
        <SectorDrillDownStandalone
          projectId={filters.projectId}
          pesquisaId={filters.pesquisaId}
          filters={{
            setor: filters.setor,
            porte: filters.porte,
            qualidade: filters.qualidade,
          }}
        />
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Componentes Reutilizáveis**

- [ ] Criar `FiltersHeader.tsx`
- [ ] Criar `FiltersPanel.tsx`
- [ ] Criar hook `useFilters.ts`

### **Fase 2: Adaptar Drill-Down**

- [ ] Modificar `SectorDrillDownStandalone` para receber filtros
- [ ] Modificar `ProductDrillDownStandalone` para receber filtros
- [ ] Passar filtros para queries internas

### **Fase 3: Integrar nas Páginas**

- [ ] Atualizar `/sectors/page.tsx`
- [ ] Atualizar `/products/page.tsx`
- [ ] Testar hierarquia de filtros
- [ ] Testar reset em cascata

### **Fase 4: Validação**

- [ ] Testar com dados reais
- [ ] Validar performance
- [ ] Validar UX

---

## 🎯 CONCLUSÃO

A página de Geoposição tem uma estrutura **bem definida e testada**:

1. ✅ **Header com filtros** - Padrão visual consistente
2. ✅ **Painel collapsible** - UX intuitiva
3. ✅ **Hierarquia de filtros** - Lógica de negócio clara
4. ✅ **Queries otimizadas** - Performance adequada
5. ✅ **Estados bem gerenciados** - Código limpo

**Próximo passo:** Replicar essa estrutura para Setores e Produtos, mantendo o drill-down como diferencial.
