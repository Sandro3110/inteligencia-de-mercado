# 📊 Análise Completa: PesquisaCard Component

**Data:** 01/12/2025  
**Analista:** Engenheiro de Dados e Arquiteto da Informação  
**Componente:** `components/dashboard/PesquisaCard.tsx`

---

## 🎯 VISÃO GERAL

### **Localização:**

- **Arquivo:** `components/dashboard/PesquisaCard.tsx` (490 linhas)
- **Tipo:** Componente Client-Side React

### **Onde é Usado (3 páginas):**

1. **Dashboard Principal** (`app/(app)/dashboard/page.tsx`)
   - Grid de pesquisas do projeto selecionado
   - Callback: `onViewEnrichment` **NÃO fornecido** ❌
2. **Página de Projeto** (`app/(app)/projects/[id]/page.tsx`)
   - Lista de pesquisas do projeto
   - Callback: `onViewEnrichment` **fornecido** ✅
3. **Página de Enriquecimento** (`app/(app)/projects/[id]/surveys/[surveyId]/enrich/page.tsx`)
   - Card da pesquisa sendo enriquecida
   - Callback: `onViewEnrichment` **status desconhecido** ⚠️

---

## 📋 FUNCIONALIDADES ATUAIS

### **1. Exibição de Métricas**

- ✅ Total de clientes
- ✅ Total de leads (oportunidades identificadas)
- ✅ Total de mercados (segmentos mapeados)
- ✅ Total de produtos (soluções catalogadas)

### **2. Indicadores de Progresso**

- ✅ **Progresso Geral** - % de enriquecimento
- ✅ **Qualidade Média** - Score ponderado (clientes 50%, leads 30%, concorrentes 20%)
- ✅ **Geocodificação** - % de entidades geocodificadas

### **3. Status Badges**

- ✅ Status de enriquecimento (Não iniciada / Em andamento / Finalizada)
- ✅ Status de geocodificação (Parcial / Geocodificando / Geocodificado)
- ✅ Badge clicável quando `onViewEnrichment` fornecido

### **4. Botões de Ação Principais**

- ✅ **Enriquecer** (roxo) - Inicia enriquecimento
- ✅ **Geocodificar** (verde) - Inicia geocodificação
- ✅ **Pausar** (âmbar) - Pausa enriquecimento em andamento
- ✅ **Cancelar** (vermelho) - Cancela enriquecimento

### **5. Botões de Ação Secundários**

- ✅ **Relatório** (componente GenerateReportButton)
- ✅ **Ver Enriquecimento** (roxo, ícone Eye) - **PROBLEMA IDENTIFICADO** ❌
- ✅ **Ver Resultados** (azul, ícone BarChart3)
- ✅ **Exportar Excel** (verde, ícone Download)
- ✅ **Limpar Tudo** (vermelho, ícone Trash2)

### **6. Funcionalidades Avançadas**

- ✅ Refresh manual de métricas
- ✅ Polling automático de status (30s)
- ✅ Modal de confirmação para limpeza
- ✅ Invalidação de cache após operações

---

## ❌ PROBLEMAS IDENTIFICADOS

### **1. CRÍTICO: Botão "Ver Enriquecimento" Não Funciona no Dashboard**

**Localização:** Linha 439-447

```typescript
{onViewEnrichment && (
  <button
    onClick={() => onViewEnrichment(pesquisa.projectId, pesquisa.id)}
    className="..."
    title="Ver Enriquecimento"
  >
    <Eye className="w-4 h-4" />
  </button>
)}
```

**Problema:**

- ✅ **Página de Projeto:** `onViewEnrichment` é fornecido → botão aparece e funciona
- ❌ **Dashboard:** `onViewEnrichment` **NÃO é fornecido** → botão **NÃO aparece**

**Causa Raiz:**

```typescript
// dashboard/page.tsx (LINHA ~200)
<PesquisaCard
  pesquisa={pesquisa}
  onEnrich={handleEnrich}
  onGeocode={handleGeocode}
  onViewResults={handleViewResults}
  onExport={handleExport}
  // ❌ onViewEnrichment NÃO FORNECIDO
  onRefresh={async () => { await refetchPesquisas(); }}
/>
```

**Impacto:**

- Usuário não consegue acessar tela de enriquecimento pelo dashboard
- Inconsistência de UX entre dashboard e página de projeto
- Badge de status "Em andamento" não é clicável no dashboard

---

### **2. MÉDIO: Layout Não Refinado**

#### **2.1. Grid de Botões Secundários Desbalanceado**

**Localização:** Linha 437

```typescript
<div className="grid grid-cols-5 gap-2">
  <GenerateReportButton pesquisaId={pesquisa.id} size="sm" />
  {onViewEnrichment && <button>...</button>}  // Condicional
  <button>Ver Resultados</button>
  <button>Exportar</button>
  <button>Limpar</button>
</div>
```

**Problema:**

- Grid de 5 colunas, mas **4 ou 5 botões** dependendo de `onViewEnrichment`
- Quando `onViewEnrichment` não fornecido: 4 botões em grid de 5 → espaçamento irregular
- Layout quebra visualmente

**Impacto:**

- Aparência não profissional
- Espaçamento inconsistente
- Botões desalinhados

---

#### **2.2. Cores Legais mas Falta Hierarquia Visual**

**Problema:**

- Todos os botões têm cores vibrantes (roxo, verde, azul, vermelho)
- Sem hierarquia clara de importância
- Ações primárias e secundárias têm mesmo peso visual

**Exemplo:**

- "Enriquecer" (ação primária) → roxo vibrante ✅
- "Limpar Tudo" (ação destrutiva) → vermelho vibrante ✅
- "Ver Resultados" (ação secundária) → azul vibrante ❌ (deveria ser mais sutil)

---

#### **2.3. Métricas em Grid 2x2 Limitado**

**Localização:** Linha 281

```typescript
<div className="p-6 grid grid-cols-2 gap-4">
  {/* Clientes */}
  {/* Leads */}
  {/* Mercados */}
  {/* Produtos */}
</div>
```

**Problema:**

- Grid fixo 2x2 → não escala bem
- Sem responsividade para telas pequenas
- Não aproveita espaço horizontal em telas grandes

---

### **3. BAIXO: Falta de Feedback Visual**

#### **3.1. Botão Refresh Sem Indicador de Sucesso**

- Apenas spinner durante refresh
- Sem toast de confirmação após sucesso
- Usuário não sabe se realmente atualizou

#### **3.2. Botões Secundários Sem Labels**

- Apenas ícones
- Usuário depende de `title` (tooltip)
- Não acessível para screen readers

---

## 🎨 ANÁLISE DE ARQUITETURA

### **Pontos Fortes:**

- ✅ **Componente reutilizável** - Usado em 3 páginas
- ✅ **Props bem definidas** - Interface clara
- ✅ **Callbacks flexíveis** - Permite customização por contexto
- ✅ **Estado local isolado** - Não polui contexto global
- ✅ **Polling automático** - Atualização em tempo real
- ✅ **Invalidação de cache** - Sincronização de dados

### **Pontos Fracos:**

- ❌ **Callbacks opcionais inconsistentes** - `onViewEnrichment` deveria ser obrigatório
- ❌ **Lógica de UI complexa** - Muitas condicionais aninhadas
- ❌ **490 linhas** - Componente muito grande, difícil de manter
- ❌ **Responsabilidades misturadas** - UI + lógica de negócio + chamadas API

---

## 📊 ANÁLISE DE DADOS

### **Métricas Exibidas:**

1. **Clientes** - Contagem total
2. **Leads** - Oportunidades identificadas
3. **Mercados** - Segmentos mapeados
4. **Produtos** - Soluções catalogadas

### **Indicadores Calculados:**

1. **Progresso Geral** = `(clientesEnriquecidos / totalClientes) * 100`
2. **Qualidade Média** = Média ponderada:
   - Clientes: 50%
   - Leads: 30%
   - Concorrentes: 20%
3. **Geocodificação** = `(geoEnriquecimentoTotal / geoEnriquecimentoTotalEntidades) * 100`

### **Problemas de Dados:**

- ❌ **Concorrentes não exibidos** - Métrica existe mas não é mostrada no card
- ❌ **Qualidade de concorrentes** - Usada no cálculo mas não exibida separadamente
- ⚠️ **Produtos** - Métrica opcional (`produtosCount?`) → pode ser undefined

---

## 🎯 FLUXO DE AÇÕES

### **1. Enriquecimento**

```
Usuário clica "Enriquecer"
  ↓
onEnrich(projectId, pesquisaId)
  ↓
Router.push('/projects/{projectId}/surveys/{pesquisaId}/enrich')
  ↓
Página de enriquecimento carrega
  ↓
Polling automático atualiza status
```

### **2. Geocodificação**

```
Usuário clica "Geocodificar"
  ↓
onGeocode(projectId, pesquisaId)
  ↓
Mutation: geocoding.startJob
  ↓
Polling automático atualiza progresso
```

### **3. Ver Enriquecimento (QUEBRADO no Dashboard)**

```
Usuário clica badge "Em andamento" ou botão Eye
  ↓
onViewEnrichment(projectId, pesquisaId)  ❌ undefined no dashboard
  ↓
Router.push('/projects/{projectId}/surveys/{pesquisaId}/enrich')
```

---

## 💡 RECOMENDAÇÕES (Prioridade)

### **🔴 CRÍTICO (Implementar AGORA)**

#### **1. Corrigir Botão "Ver Enriquecimento" no Dashboard**

**Solução:**

```typescript
// dashboard/page.tsx
const handleViewEnrichment = (projectId: number, pesquisaId: number) => {
  router.push(`/projects/${projectId}/surveys/${pesquisaId}/enrich`);
};

<PesquisaCard
  ...
  onViewEnrichment={handleViewEnrichment}  // ✅ Adicionar
  ...
/>
```

**Impacto:** Alta  
**Esforço:** 5 minutos  
**ROI:** 12x

---

#### **2. Refinar Grid de Botões Secundários**

**Solução:**

```typescript
// Opção A: Grid flexível
<div className="flex flex-wrap gap-2">
  <GenerateReportButton />
  {onViewEnrichment && <button>...</button>}
  <button>Ver Resultados</button>
  <button>Exportar</button>
  <button>Limpar</button>
</div>

// Opção B: Grid adaptativo
<div className={`grid ${onViewEnrichment ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
  ...
</div>
```

**Impacto:** Média  
**Esforço:** 10 minutos  
**ROI:** 6x

---

### **🟡 IMPORTANTE (Implementar em Seguida)**

#### **3. Adicionar Hierarquia Visual nos Botões**

**Solução:**

```typescript
// Botões primários: cores vibrantes, sombra
// Botões secundários: cores sutis, sem sombra
// Botões destrutivos: vermelho, confirmação

// Exemplo:
<button className="bg-blue-100 text-blue-700 hover:bg-blue-200">  // Secundário
  <BarChart3 />
</button>
```

**Impacto:** Média  
**Esforço:** 20 minutos  
**ROI:** 4x

---

#### **4. Adicionar Labels nos Botões Secundários**

**Solução:**

```typescript
// Opção A: Label visível
<button>
  <Eye className="w-4 h-4" />
  <span className="ml-1.5 text-xs">Ver</span>
</button>

// Opção B: Label responsivo
<button>
  <Eye className="w-4 h-4" />
  <span className="ml-1.5 text-xs hidden sm:inline">Ver</span>
</button>
```

**Impacto:** Baixa  
**Esforço:** 15 minutos  
**ROI:** 3x

---

#### **5. Exibir Métrica de Concorrentes**

**Solução:**

```typescript
<div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-4 border border-red-200">
  <div className="text-sm font-medium text-red-700 mb-1">Concorrentes</div>
  <div className="text-2xl font-bold text-red-900">{pesquisa.concorrentesCount}</div>
  <div className="text-xs text-red-600 mt-1">Competidores mapeados</div>
</div>
```

**Impacto:** Baixa  
**Esforço:** 10 minutos  
**ROI:** 2x

---

### **🟢 MELHORIA (Implementar Depois)**

#### **6. Refatorar Componente (Separar Responsabilidades)**

**Solução:**

```
PesquisaCard/
  ├── index.tsx (container)
  ├── Header.tsx (título, descrição, badges)
  ├── Metrics.tsx (grid de métricas)
  ├── Progress.tsx (barras de progresso)
  ├── Actions.tsx (botões principais)
  └── SecondaryActions.tsx (botões secundários)
```

**Impacto:** Alta (manutenibilidade)  
**Esforço:** 2-3 horas  
**ROI:** 10x (longo prazo)

---

#### **7. Adicionar Responsividade**

**Solução:**

```typescript
// Grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Métricas */}
</div>

// Botões responsivos
<div className="flex flex-col sm:flex-row gap-2">
  {/* Ações */}
</div>
```

**Impacto:** Média  
**Esforço:** 30 minutos  
**ROI:** 5x

---

#### **8. Adicionar Feedback Visual**

**Solução:**

```typescript
const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    if (onRefresh) await onRefresh();
    toast.success('Métricas atualizadas!'); // ✅ Adicionar
  } catch (error) {
    toast.error('Erro ao atualizar');
  } finally {
    setIsRefreshing(false);
  }
};
```

**Impacto:** Baixa  
**Esforço:** 5 minutos  
**ROI:** 2x

---

## 📊 RESUMO DE PRIORIDADES

| Prioridade    | Item                              | Impacto | Esforço | ROI |
| ------------- | --------------------------------- | ------- | ------- | --- |
| 🔴 CRÍTICO    | Corrigir botão Ver Enriquecimento | Alta    | 5min    | 12x |
| 🔴 CRÍTICO    | Refinar grid de botões            | Média   | 10min   | 6x  |
| 🟡 IMPORTANTE | Hierarquia visual                 | Média   | 20min   | 4x  |
| 🟡 IMPORTANTE | Labels nos botões                 | Baixa   | 15min   | 3x  |
| 🟡 IMPORTANTE | Exibir concorrentes               | Baixa   | 10min   | 2x  |
| 🟢 MELHORIA   | Refatorar componente              | Alta    | 2-3h    | 10x |
| 🟢 MELHORIA   | Responsividade                    | Média   | 30min   | 5x  |
| 🟢 MELHORIA   | Feedback visual                   | Baixa   | 5min    | 2x  |

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### **Sprint 1: Correções Críticas (30 minutos)**

1. ✅ Corrigir botão Ver Enriquecimento no dashboard
2. ✅ Refinar grid de botões secundários
3. ✅ Adicionar hierarquia visual

### **Sprint 2: Melhorias Importantes (1 hora)**

4. ✅ Adicionar labels nos botões
5. ✅ Exibir métrica de concorrentes
6. ✅ Adicionar responsividade
7. ✅ Adicionar feedback visual

### **Sprint 3: Refatoração (2-3 horas)**

8. ✅ Separar componente em subcomponentes
9. ✅ Documentar props e callbacks
10. ✅ Adicionar testes unitários

---

## 🎉 CONCLUSÃO

O componente **PesquisaCard** é **bem arquitetado** e **reutilizável**, mas tem **problemas críticos** que afetam a experiência do usuário:

### **Principais Problemas:**

- ❌ Botão "Ver Enriquecimento" não funciona no dashboard
- ❌ Layout de botões desbalanceado
- ❌ Falta hierarquia visual
- ❌ Métrica de concorrentes não exibida

### **Principais Qualidades:**

- ✅ Reutilizável em 3 páginas
- ✅ Props bem definidas
- ✅ Polling automático
- ✅ Invalidação de cache

### **Recomendação Final:**

**Implementar Sprint 1 IMEDIATAMENTE** (30 minutos) para corrigir problemas críticos e melhorar UX.

---

**Próximo Passo:** Implementar correções e melhorias propostas.

**Analista:** Manus AI - Engenheiro de Dados e Arquiteto da Informação  
**Data:** 01/12/2025
