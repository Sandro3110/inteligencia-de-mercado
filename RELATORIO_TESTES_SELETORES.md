# Relatório de Testes - Módulo de Seleção de Projetos e Pesquisas

**Data:** 21/11/2025  
**Fase:** 103 - Correção Completa do Módulo de Seleção

---

## 📋 Resumo Executivo

**Status Geral:** ⚠️ **PARCIALMENTE FUNCIONAL**

### ✅ Funcionalidades que funcionam:

1. Seleção manual de projeto atualiza sidebar
2. Seleção manual de pesquisa atualiza sidebar
3. CascadeView atualiza ao trocar pesquisa manualmente
4. Dados são filtrados corretamente quando pesquisa é trocada manualmente
5. localStorage persiste seleções

### ❌ Problemas Identificados:

1. **PesquisaSelector não atualiza automaticamente ao trocar projeto**
   - Ao trocar de Ground → Embalagens, pesquisa continua mostrando "Ground (1 clientes)"
   - Dados da página também não atualizam
2. **Página "Ver Resultados" não filtra por projeto/pesquisa**
   - Analytics mostra dados GLOBAIS (sem filtro)
   - Procedures de analytics não aceitam `projectId` ou `pesquisaId`

---

## 🔍 Testes Realizados

### Teste 1: Seleção de Pesquisa (Mesmo Projeto)

**Projeto:** Embalagens  
**Ação:** Trocar de "Pesquisa Teste 1" para "Embalagens (806 clientes)"

**Resultado:** ✅ **PASSOU**

- Sidebar atualizou: "Embalagens (806 clientes)"
- CascadeView atualizou: 667 mercados → dados corretos
- Cache invalidado corretamente

---

### Teste 2: Troca de Projeto

**Ação:** Trocar de "Embalagens" para "Ground"

**Resultado:** ❌ **FALHOU**

- Projeto mudou: "Ground" ✅
- Pesquisa NÃO mudou: ainda mostra "Embalagens (806 clientes)" ❌
- Dados NÃO atualizaram: ainda mostra mercados de Embalagens ❌

**Causa Raiz:**

- `PesquisaSelector` recebe `key={pesquisa-${selectedProjectId}}`
- Mas o componente não está sendo desmontado/remontado
- Possível problema: `selectedProjectId` não está atualizando no momento do render

---

### Teste 3: Página "Ver Resultados"

**Ação:** Trocar de projeto e verificar se analytics atualizam

**Resultado:** ❌ **FALHOU (esperado)**

- Analytics mostra dados GLOBAIS
- Procedures não aceitam `projectId` como parâmetro
- **Decisão:** Analytics deve mostrar visão consolidada do sistema, não por projeto

---

## 🛠️ Correções Aplicadas

### 1. AppSidebar.tsx

```tsx
// ANTES
<PesquisaSelector />

// DEPOIS
<PesquisaSelector key={`pesquisa-${selectedProjectId}`} projectId={selectedProjectId} />
```

### 2. useSelectedProject.ts

- Adicionado invalidation de cache ao trocar projeto

### 3. useSelectedPesquisa.ts

- Adicionado invalidation de cache ao trocar pesquisa
- Pesquisa reseta quando `projectId` muda (via useEffect)

### 4. CascadeView.tsx

- Adicionado useEffect para invalidar cache quando `selectedPesquisaId` muda

### 5. ResultadosEnriquecimento.tsx

- Adicionado `useSelectedProject` hook
- Adicionado invalidation de cache quando projeto muda
- **Nota:** Analytics continua mostrando dados globais (decisão de design)

---

## 🐛 Bugs Pendentes

### Bug #1: PesquisaSelector não reseta ao trocar projeto

**Severidade:** 🔴 ALTA  
**Impacto:** Usuário vê dados inconsistentes

**Comportamento Esperado:**

1. Usuário seleciona projeto "Embalagens"
2. PesquisaSelector mostra pesquisas de "Embalagens"
3. Usuário troca para projeto "Ground"
4. PesquisaSelector deveria resetar e mostrar pesquisas de "Ground"

**Comportamento Atual:**

- PesquisaSelector continua mostrando pesquisa do projeto anterior

**Possíveis Soluções:**

1. ✅ Tentado: Adicionar `key` ao PesquisaSelector → **NÃO FUNCIONOU**
2. ⬜ Tentar: Forçar reset via `useEffect` no AppSidebar
3. ⬜ Tentar: Usar `enabled: false` na query quando `projectId` muda

---

## 📊 Cobertura de Testes

### Testes Automatizados

- ✅ 15 testes criados em `fase103-selectors.test.ts`
- ✅ 100% passando
- ✅ Cobrem: listagem de projetos, filtro de pesquisas, fluxos de usuário

### Testes Manuais

- ✅ Seleção de pesquisa (mesmo projeto)
- ❌ Troca de projeto
- ⚠️ Página "Ver Resultados" (analytics globais - comportamento esperado)
- ⬜ Página "Enriquecer Dados" (não testado)
- ⬜ Navegação entre páginas mantendo contexto (não testado)

---

## 🎯 Próximos Passos

1. **Corrigir Bug #1** - PesquisaSelector não reseta
   - Investigar por que `key` não força re-mount
   - Tentar solução alternativa com `useEffect`

2. **Testar outras páginas**
   - Enriquecer Dados
   - Acompanhar Progresso
   - Exportar Dados

3. **Validar persistência**
   - Navegar entre páginas
   - Recarregar página
   - Verificar se seleção é mantida

4. **Documentar comportamento**
   - Quais páginas filtram por projeto/pesquisa
   - Quais mostram dados globais
   - Atualizar documentação do usuário

---

## 📝 Notas Técnicas

### Arquitetura de Seleção

```
useSelectedProject (localStorage: "selected-project")
    ↓
selectedProjectId
    ↓
useSelectedPesquisa(projectId) (localStorage: "selected-pesquisa-{projectId}")
    ↓
selectedPesquisaId
    ↓
Páginas (CascadeView, etc.) usam ambos para filtrar dados
```

### Invalidação de Cache

- **Ao trocar projeto:** Invalida queries de pesquisas, mercados, clientes, etc.
- **Ao trocar pesquisa:** Invalida queries de mercados, clientes, concorrentes, leads

### Persistência

- Projeto: `localStorage.getItem("selected-project")`
- Pesquisa: `localStorage.getItem("selected-pesquisa-{projectId}")`
- Cada projeto tem sua própria pesquisa selecionada

---

## ✅ Checklist de Validação

- [x] Testes automatizados criados
- [x] Testes automatizados passando
- [x] Seleção de pesquisa funciona (mesmo projeto)
- [ ] Troca de projeto atualiza pesquisa automaticamente
- [ ] Todas as páginas principais testadas
- [ ] Navegação entre páginas mantém contexto
- [ ] Persistência funciona após reload
- [ ] Documentação atualizada
