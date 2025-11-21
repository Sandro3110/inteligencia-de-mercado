# Análise de Impacto: Seletor de Projeto/Pesquisa no Sidebar

## 📋 Solicitação do Usuário

Mover os seletores de Projeto e Pesquisa para o sidebar de forma destacada, com:
- Caixa de seleção do projeto
- Caixa de seleção da pesquisa (dependente do projeto)
- Botão "Atualizar" para carregar dados
- Páginas iniciam vazias até clicar em "Atualizar"

---

## 🔍 Análise da Situação Atual

### Implementação Atual

**Hooks Existentes:**
- `useSelectedProject()` - Gerencia projeto selecionado (localStorage + auto-load)
- `useSelectedPesquisa(projectId)` - Gerencia pesquisa selecionada (localStorage + auto-load)

**Componentes Existentes:**
- `ProjectSelector` - Dropdown de seleção de projeto
- `PesquisaSelector` - Dropdown de seleção de pesquisa

**Localização Atual:**
- Seletores aparecem no **header** de algumas páginas (CascadeView, Mercados)
- Sidebar já mostra "Projeto Ativo" com estatísticas (linhas 250-262 do AppSidebar.tsx)

**Páginas Afetadas:**
16 páginas usam os hooks de seleção:
- AdminLLM, AlertHistoryPage, AnalyticsPage, AtividadePage
- CascadeView, Dashboard, EnrichmentFlow, EnrichmentProgress
- EnrichmentSettings, FunnelView, IntelligentAlerts, Mercados
- MonitoringDashboard, ROIDashboard, ResearchOverview, SchedulePage

**Comportamento Atual:**
- Projeto/pesquisa são carregados **automaticamente** do localStorage
- Dados são carregados **automaticamente** ao entrar na página
- Troca de projeto/pesquisa **recarrega dados automaticamente**

---

## 📊 Impacto da Mudança Proposta

### ✅ Benefícios

1. **Controle Explícito do Usuário**
   - Usuário decide quando carregar dados
   - Evita carregamentos desnecessários ao navegar
   - Reduz consumo de API/banco

2. **Visibilidade Consistente**
   - Seletores sempre visíveis no sidebar
   - Não precisa procurar onde está o seletor em cada página
   - Contexto claro de qual projeto/pesquisa está ativo

3. **Performance**
   - Páginas carregam mais rápido (sem queries automáticas)
   - Usuário controla quando fazer requests pesados

4. **UX Melhorada**
   - Fluxo explícito: Escolher → Atualizar → Ver dados
   - Menos confusão sobre qual contexto está ativo

### ⚠️ Desafios e Riscos

1. **Mudança de Paradigma**
   - **Atual:** Auto-load (conveniente, mas pode ser confuso)
   - **Proposto:** Manual load (explícito, mas requer ação extra)
   - Risco: Usuários podem esquecer de clicar "Atualizar"

2. **Refatoração Massiva**
   - 16 páginas precisam ser modificadas
   - Todos os hooks `useSelectedProject/Pesquisa` precisam mudar
   - Queries tRPC precisam ser desabilitadas por padrão

3. **Estado Vazio Inicial**
   - Todas as páginas precisam lidar com "sem dados carregados"
   - Necessário adicionar placeholders/empty states
   - Mensagens claras: "Selecione projeto e clique em Atualizar"

4. **Sincronização de Estado**
   - Botão "Atualizar" no sidebar precisa comunicar com todas as páginas
   - Possível usar Context API ou evento global
   - Complexidade adicional de gerenciamento de estado

5. **Experiência de Navegação**
   - Usuário troca de página → perde dados → precisa clicar "Atualizar" novamente
   - Pode ser frustrante se não houver cache inteligente

---

## 💡 Sugestão de Implementação

### Opção 1: Mudança Completa (Mais Disruptiva)

**Arquitetura:**
```typescript
// Novo Context Global
interface DataLoadContext {
  shouldLoadData: boolean;
  triggerLoad: () => void;
  clearData: () => void;
}

// Sidebar
<ProjectSelector />
<PesquisaSelector />
<Button onClick={triggerLoad}>Atualizar Dados</Button>

// Páginas
const { shouldLoadData } = useDataLoad();
const { data } = trpc.mercados.list.useQuery(
  { projectId, pesquisaId },
  { enabled: shouldLoadData } // Só carrega se botão foi clicado
);
```

**Prós:**
- Controle total do usuário
- Performance otimizada
- Fluxo explícito

**Contras:**
- Refatoração massiva (16 páginas)
- Mudança de UX significativa
- Risco de frustração do usuário

---

### Opção 2: Híbrida (Menos Disruptiva) ⭐ **RECOMENDADA**

**Arquitetura:**
```typescript
// Sidebar com seletores destacados + auto-load mantido
<div className="bg-blue-50 p-4 border-b">
  <ProjectSelector /> {/* Troca automática */}
  <PesquisaSelector /> {/* Troca automática */}
  <Button onClick={forceRefresh}>
    🔄 Atualizar Dados
  </Button>
</div>

// Páginas mantêm auto-load, mas botão força refresh
const utils = trpc.useUtils();
const forceRefresh = () => {
  utils.invalidate(); // Força recarregar todas as queries
  toast.success("Dados atualizados!");
};
```

**Prós:**
- Menor refatoração (apenas sidebar + botão de refresh)
- Mantém conveniência do auto-load
- Adiciona controle explícito quando necessário
- Melhor UX (não quebra fluxo existente)

**Contras:**
- Não economiza API calls (ainda carrega automaticamente)
- Botão "Atualizar" é redundante (mas útil para refresh manual)

---

### Opção 3: Lazy Load com Cache (Mais Sofisticada)

**Arquitetura:**
```typescript
// Sidebar com seletores + indicador de cache
<ProjectSelector />
<PesquisaSelector />
<div className="flex items-center gap-2">
  <Badge variant={hasCachedData ? "success" : "secondary"}>
    {hasCachedData ? "Dados em cache" : "Sem dados"}
  </Badge>
  <Button onClick={loadData}>
    {hasCachedData ? "Atualizar" : "Carregar"}
  </Button>
</div>

// Páginas carregam do cache primeiro, depois fazem request
const { data, isStale } = trpc.mercados.list.useQuery(
  { projectId, pesquisaId },
  { 
    enabled: userRequestedLoad,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
  }
);
```

**Prós:**
- Melhor performance (cache inteligente)
- Controle do usuário mantido
- Indicador visual de estado

**Contras:**
- Complexidade alta de implementação
- Gerenciamento de cache pode ter bugs
- Refatoração média (8-10 páginas principais)

---

## 🎯 Recomendação Final

### **Opção 2: Híbrida** é a melhor escolha porque:

1. **Menor Risco**
   - Não quebra fluxo existente
   - Usuários avançados ganham controle extra
   - Usuários casuais não são afetados

2. **Implementação Rápida**
   - ~2-3 horas de trabalho
   - Apenas sidebar + hook de refresh
   - Sem refatoração massiva

3. **Melhor UX**
   - Seletores sempre visíveis (sidebar)
   - Auto-load mantido (conveniente)
   - Botão "Atualizar" para refresh manual (útil)

4. **Evolutiva**
   - Pode migrar para Opção 3 no futuro
   - Base sólida para melhorias incrementais

---

## 📝 Plano de Implementação (Opção 2)

### Fase 1: Sidebar (1h)
- [ ] Criar seção destacada no topo do sidebar
- [ ] Adicionar `<ProjectSelector />` grande e visível
- [ ] Adicionar `<PesquisaSelector />` dependente do projeto
- [ ] Adicionar botão "🔄 Atualizar Dados" com ícone
- [ ] Estilizar com bg-blue-50, bordas, destaque visual

### Fase 2: Hook de Refresh (30min)
- [ ] Criar hook `useGlobalRefresh()`
- [ ] Implementar função `invalidateAll()` usando `trpc.useUtils()`
- [ ] Adicionar toast de feedback

### Fase 3: Integração (30min)
- [ ] Conectar botão do sidebar ao hook
- [ ] Testar em 3-4 páginas principais
- [ ] Validar que dados recarregam corretamente

### Fase 4: Melhorias Visuais (1h)
- [ ] Adicionar loading state no botão
- [ ] Mostrar timestamp da última atualização
- [ ] Adicionar badge de "Dados atualizados há X minutos"
- [ ] Ícone de refresh animado durante carregamento

### Fase 5: Testes (30min)
- [ ] Testar troca de projeto
- [ ] Testar troca de pesquisa
- [ ] Testar botão de atualizar
- [ ] Validar em todas as 16 páginas

---

## 🚀 Alternativa: Opção 1 (Se Preferir Controle Total)

Se você **realmente** quer que páginas iniciem vazias e só carreguem ao clicar:

### Mudanças Necessárias:

1. **Context Global** (novo arquivo)
2. **16 páginas** modificadas (enabled: shouldLoad)
3. **Empty states** em todas as páginas
4. **Mensagens de onboarding** ("Clique em Atualizar")
5. **Testes extensivos** (risco de bugs)

**Tempo estimado:** 8-12 horas
**Risco:** Alto (mudança de paradigma)

---

## ❓ Decisão

Qual opção você prefere?

1. **Opção 2 (Híbrida)** - Rápida, segura, mantém auto-load + adiciona controle manual
2. **Opção 1 (Completa)** - Controle total, páginas vazias, load manual obrigatório
3. **Opção 3 (Cache)** - Sofisticada, cache inteligente, mais complexa

**Minha recomendação:** Opção 2, depois podemos evoluir para Opção 3 se necessário.
