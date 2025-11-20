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
- [x] Capturar screenshot da nova interface
- [x] Apresentar para aprovação do usuário
- [x] Coletar feedback detalhado
- [x] Ajustar conforme necessário
- [x] **APROVADO PELO USUÁRIO**

### 25.5 Adaptar Outras Páginas (SOMENTE APÓS APROVAÇÃO)
- [x] Dashboard.tsx
- [x] DashboardPage.tsx (Analytics)
- [x] ROIDashboard.tsx
- [x] FunnelView.tsx
- [x] AnalyticsPage.tsx
- [x] EnrichmentProgress.tsx
- [x] AlertsPage.tsx
- [x] AlertHistoryPage.tsx
- [x] ReportsPage.tsx
- [x] Mercados.tsx
- [x] MercadoDetalhes.tsx
- [x] AtividadePage.tsx
- [x] ResultadosEnriquecimento.tsx
- [x] EnrichmentFlow.tsx
- [x] SchedulePage.tsx
- [x] EnrichmentSettings.tsx
- [x] EnrichmentReview.tsx
- [x] Remover MainNav.tsx (substituído por AppSidebar)
- [x] Corrigir ordenação de projetos (por ID em vez de nome)
- [x] Deletar projetos Agro duplicados do banco

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


---

## FASE 26: POLIMENTO FINAL - ANIMAÇÕES E UX 🎨

### 26.1 Animações e Estados Visuais
- [x] Adicionar transições suaves entre páginas (fade-in)
- [x] Melhorar estados hover no sidebar (bg-blue-50)
- [x] Adicionar estados active mais destacados (bg-blue-100 + shadow)
- [x] Animação de abertura/fechamento de seções colápsáveis

### 26.2 Sidebar Colápsável
- [x] Adicionar botão toggle no topo do sidebar
- [x] Implementar estado collapsed (apenas ícones, 60px/ml-16)
- [x] Implementar estado expanded (completo, 240px/ml-60)
- [x] Salvar preferência no localStorage
- [x] Ajustar margem das páginas dinamicamente (CascadeView e Dashboard)
- [x] Adicionar tooltips nos ícones quando collapsed

### 26.3 Atalhos de Teclado
- [x] Implementar Ctrl+1 → Dashboard
- [x] Implementar Ctrl+2 → Mercados (Dados)
- [x] Implementar Ctrl+3 → Analytics
- [x] Implementar Ctrl+4 → ROI
- [x] Implementar Ctrl+B → Toggle sidebar
- [x] Adicionar indicador visual de atalhos no sidebar (⌘ symbols)
- [ ] Criar modal de ajuda (Ctrl+?) com lista de atalhos (opcional)

### 26.4 Validação Final
- [ ] Testar todas as animações
- [ ] Testar sidebar colapsável em todas as páginas
- [ ] Testar atalhos de teclado
- [ ] Verificar responsividade
- [ ] Criar checkpoint final


### 26.5 Correção de Rotas do Sidebar
- [x] Corrigir rotas do sidebar para corresponder às rotas reais do App.tsx
- [x] Remover rotas inexistentes (Clientes, Concorrentes, Leads standalone)
- [x] Simplificar navegação para rotas funcionais
- [x] Ajustar atalhos de teclado para rotas corretas


### 26.6 Adicionar Analytics Dashboard ao Menu
- [x] Adicionar rota /analytics-dashboard na seção "Análise" do sidebar


---

## FASE 27: MELHORIAS DE NAVEGAÇÃO E ONBOARDING 🎯

### 27.1 Breadcrumbs Dinâmicos
- [x] Criar componente DynamicBreadcrumbs que detecta rota atual
- [x] Mapear rotas para títulos legíveis
- [x] Adicionar breadcrumbs no header de todas as páginas principais
- [x] Suportar navegação clicável nos breadcrumbs

### 27.2 Indicadores de Página Atual
- [x] Adicionar borda lateral colorida (border-l-4) no item ativo
- [x] Aumentar contraste do background ativo (bg-blue-100 → bg-blue-200)
- [x] Adicionar sombra mais forte no item ativo
- [x] Melhorar transição de estados (hover → active)

### 27.3 Onboarding/Tour Guiado
- [x] Criar página /onboarding com tour interativo
- [x] Implementar steps do tour (Início → Dados → Enriquecimento → Análise)
- [x] Adicionar highlights visuais nos elementos importantes
- [x] Salvar estado "tour completado" no localStorage
- [x] Adicionar botão "Pular tour" e "Próximo"
- [x] Redirecionar para dashboard após conclusão


---

## FASE 28: AJUSTES DE ANALYTICS E RELATÓRIOS 📊

### 28.1 Análise de Problemas
- [x] Analisar funcionalidade atual de AnalyticsPage
- [x] Analisar funcionalidade atual de ReportsPage
- [x] Identificar problemas de hierarquia de dados
- [x] Identificar problemas de tema escuro hardcoded

### 28.2 Correções de Hierarquia
- [ ] Adicionar filtro por PESQUISA em AnalyticsPage (além de PROJECT)
- [ ] Adicionar filtro por PESQUISA em ReportsPage
- [ ] Atualizar queries backend para suportar pesquisaId
- [ ] Testar filtros combinados (project + pesquisa)

### 28.3 Correções de Tema
- [x] Corrigir text-white → text-foreground em ReportGenerator
- [x] Corrigir glass-card → bg-white border-slate-200 em ReportGenerator
- [x] Corrigir bg-slate-800 → bg-slate-100 em ReportGenerator
- [x] Padronizar cores de texto (text-slate-900, text-slate-600)
- [x] Corrigir erro de import Breadcrumbs em AnalyticsPage (linha 49)
- [x] Adicionar DynamicBreadcrumbs em ReportsPage

### 28.4 Validação Final
- [x] Testar Analytics com filtros de projeto e pesquisa
- [x] Testar Relatórios com filtros de data
- [x] Verificar tema light consistente
- [x] Criar checkpoint final
