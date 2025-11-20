# Gestor PAV - TODO

## Fase 22: Refatoração Completa - Hierarquia PROJECT → PESQUISA → DADOS 🏗️

### 22.1 Correção Imediata
- [x] Verificar nomes reais dos 3 projetos no banco
- [x] Corrigir getDashboardStats para retornar dados corretos
- [x] Testar estatísticas na página inicial
- [x] Validar seletor de projetos

### 22.2 Funções de Banco (db.ts)
- [x] Criar getPesquisas() - listar pesquisas
- [x] Criar getPesquisaById(id) - buscar pesquisa específica
- [x] Criar getPesquisasByProject(projectId) - pesquisas de um projeto
- [x] Manter getDashboardStats(projectId) funcionando
- [x] Criar getDashboardStatsByPesquisa(pesquisaId) - opcional

### 22.3 CascadeView (Página Inicial)
- [x] Manter useSelectedProject como filtro principal
- [x] Adicionar seletor opcional de pesquisa (preparado)
- [x] Corrigir estatísticas para usar dados reais
- [x] Atualizar queries de mercados para respeitar projectId
- [x] Implementar cache de pesquisa corretamente

### 22.4 Dashboard Avançado
- [ ] Verificar se usa projectId corretamente
- [ ] Adicionar filtro opcional de pesquisa
- [ ] Atualizar KPIs para respeitar hierarquia
- [ ] Testar gráficos e visualizações

### 22.5 Analytics
- [ ] Verificar queries de analytics
- [ ] Garantir filtro por projectId
- [ ] Adicionar opção de filtrar por pesquisa
- [ ] Validar métricas

### 22.6 Enriquecimento
- [ ] Verificar processo de enriquecimento
- [ ] Garantir vinculação correta a projectId e pesquisaId
- [ ] Testar fluxo completo

### 22.7 Outras Páginas
- [ ] Monitoramento
- [ ] Relatórios
- [ ] ROI
- [ ] Funil
- [ ] Agendamento
- [ ] Atividade

### 22.8 Validação Final
- [ ] Testar navegação entre páginas
- [ ] Validar persistência de filtros
- [ ] Verificar consistência de dados
- [ ] Criar checkpoint final

**Hierarquia Oficial:**
```
PROJECT (nível 1) 
  └─> PESQUISA (nível 2)
      └─> MERCADOS/CLIENTES/CONCORRENTES/LEADS (nível 3)
```


## Fase 23: Melhorias de UX/UI - Página Inicial 🎨

### 23.1 Título e Textos
- [x] Alterar "GESTOR PAV" para "Inteligência de Mercado"
- [x] Mostrar título apenas uma vez no canto superior esquerdo
- [x] Ajustar tamanho para médio (text-lg ou text-xl)
- [x] Reduzir "ESTATÍSTICAS" em 60% (de text-2xl para text-sm)
- [x] Reduzir "Selecione um Mercado" em 60% (de text-3xl para text-lg)

### 23.2 Botões → Ícones com Tooltips
- [x] Salvar Filtros → ícone Save com tooltip
- [x] Limpar Filtros → ícone X/Eraser com tooltip
- [x] Filtrar por Tags → ícone Tag com tooltip (já existia)
- [x] Segmentação → ícone Filter com tooltip (já existia)
- [x] Botões de status (Todos, Pendentes, Validados, Descartados) → ícones
- [x] Usar padrão do Tour (Tooltip component do shadcn/ui)

### 23.3 Seletor de Pesquisa
- [x] Verificar componente ProjectSelector
- [x] Corrigir para buscar apenas projetos reais do banco
- [x] Validar que mostra "Agro", "Embalagens" e terceiro projeto
- [x] Confirmado: Agro tem 0 dados, Embalagens tem 470/806/3453/2433

### 23.4 Validação
- [x] Testar visual dos ícones
- [x] Verificar tooltips funcionando
- [x] Validar seletor de projetos
- [x] Criar checkpoint final


## Fase 24: Correções de Layout e Responsividade 🔧

### 24.1 Logo Principal
- [x] Substituir "Gestor PAV" por "Inteligência de Mercado" no logo/cabeçalho principal (MainNav.tsx)
- [x] Remover box duplicado "Inteligência de Mercado" do CascadeView

### 24.2 Scroll Horizontal
- [x] Adicionar overflow-x-hidden no container principal
- [x] Adicionar flex-wrap no header para responsividade
- [x] Ajustar larguras para caber na tela

### 24.3 Redução Adicional de Textos
- [x] Reduzir "ESTATÍSTICAS" mais 50% (de text-[0.65rem] para text-[0.5rem])
- [x] Reduzir "Selecione um Mercado" mais 50% (de text-sm para text-xs)

### 24.4 Validação
- [x] Testar responsividade
- [x] Verificar sem scroll horizontal
- [x] Criar checkpoint


---


## FASE 25: REFATORAÇÃO COM SIDEBAR LATERAL FIXO 🎯

### 25.1 Análise e Planejamento
- [x] Mapear todas as funcionalidades da página inicial
- [x] Definir estrutura de temas do sidebar (6 seções)
- [x] Criar mockup visual da nova estrutura
- [x] Definir plano de implementação em fases

### 25.2 Criar Componente AppSidebar
- [x] Criar client/src/components/AppSidebar.tsx
- [x] Implementar 6 seções temáticas:
  - [x] 📊 Visão Geral (Dashboard, Estatísticas)
  - [x] 🗂️ Dados (Mercados, Clientes, Concorrentes, Leads, Produtos)
  - [x] 🔍 Busca & Filtros (Busca Global, Filtros, Tags)
  - [x] ⚙️ Ações (Novo Projeto, Exportar, Comparar, Validação)
  - [x] 📈 Análise (Analytics, ROI, Funil, Relatórios, Atividades)
  - [x] 🔧 Configurações (Enriquecimento, Alertas, Agendamentos, Cache)
- [x] Adicionar estatísticas compactas no sidebar (4 cards)
- [x] Implementar indicador de página ativa (highlight)
- [x] Adicionar ícones Lucide para cada item
- [x] Estilizar com tema light moderno (bg-white, borders sutis)
- [x] Largura fixa 240px

### 25.3 Refatorar Página Inicial (CascadeView)
- [x] Simplificar header (apenas logo + seletor de projeto + ícones essenciais)
- [x] Remover sidebar esquerdo antigo de estatísticas
- [x] Mover filtros para dentro da área principal (abaixo do header)
- [x] Integrar AppSidebar no layout (posição fixa à esquerda)
- [x] Ajustar largura da área principal: calc(100% - 240px)
- [x] Manter navegação Mercados → Clientes → Concorrentes → Leads
- [x] Testar scroll e responsividade

### 25.4 Validação com Usuário ⚠️ CHECKPOINT
- [ ] Capturar screenshot da nova interface
- [ ] Apresentar para aprovação do usuário
- [ ] Coletar feedback detalhado
- [ ] Ajustar conforme necessário
- [ ] **AGUARDAR APROVAÇÃO ANTES DE CONTINUAR**

### 25.5 Adaptar Outras Páginas (SOMENTE APÓS APROVAÇÃO)
- [ ] Dashboard.tsx
- [ ] DashboardPage.tsx (Analytics)
- [ ] ROIDashboard.tsx
- [ ] FunnelView.tsx
- [ ] AnalyticsPage.tsx
- [ ] EnrichmentProgress.tsx
- [ ] AlertsPage.tsx
- [ ] ReportsPage.tsx
- [ ] Mercados.tsx
- [ ] MercadoDetalhes.tsx
- [ ] AtividadePage.tsx
- [ ] ResultadosEnriquecimento.tsx
- [ ] Remover MainNav.tsx (substituído por AppSidebar)

### 25.6 Polimento Final
- [ ] Animações de transição entre páginas (fade-in)
- [ ] Estados hover/active no sidebar (bg-slate-100)
- [ ] Atalho de teclado Ctrl+B para toggle sidebar
- [ ] Responsividade mobile (sidebar colapsável com overlay)
- [ ] Testar em diferentes resoluções (1920x1080, 1366x768, mobile)
- [ ] Criar checkpoint final

**Estrutura Visual do Sidebar:**
```
┌─────────────────────┐
│ 📊 Inteligência    │ ← Logo compacto
│    de Mercado      │
├─────────────────────┤
│ 📊 VISÃO GERAL     │
│   • Dashboard       │
│   • Estatísticas    │
│                     │
│ 🗂️ DADOS           │
│   • Mercados ◄      │ ← Ativo
│   • Clientes        │
│   • Concorrentes    │
│   • Leads           │
│   • Produtos        │
│                     │
│ 🔍 BUSCA & FILTROS │
│   • Busca Global    │
│   • Filtros         │
│   • Tags            │
│                     │
│ ⚙️ AÇÕES           │
│   • Novo Projeto    │
│   • Exportar        │
│   • Comparar        │
│   • Validação       │
│                     │
│ 📈 ANÁLISE         │
│   • Analytics       │
│   • ROI             │
│   • Funil           │
│   • Relatórios      │
│   • Atividades      │
│                     │
│ 🔧 CONFIGURAÇÕES   │
│   • Enriquecimento  │
│   • Alertas         │
│   • Agendamentos    │
│   • Cache           │
└─────────────────────┘
```
