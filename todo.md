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


---

## FASE 29: AUDITORIA COMPLETA + MELHORIAS DE ANALYTICS 🔍📈

### 29.1 Auditoria e Mapeamento (22 páginas)
- [x] Auditar AlertHistoryPage.tsx
- [x] Auditar AlertsPage.tsx
- [x] Auditar AnalyticsDashboard.tsx
- [x] Auditar AnalyticsPage.tsx (já corrigida)
- [x] Auditar AtividadePage.tsx
- [x] Auditar CascadeView.tsx
- [x] Auditar ComponentShowcase.tsx
- [x] Auditar Dashboard.tsx
- [x] Auditar DashboardPage.tsx
- [x] Auditar EnrichmentFlow.tsx
- [x] Auditar EnrichmentProgress.tsx
- [x] Auditar EnrichmentReview.tsx
- [x] Auditar EnrichmentSettings.tsx
- [x] Auditar FunnelView.tsx
- [x] Auditar MercadoDetalhes.tsx
- [x] Auditar Mercados.tsx
- [x] Auditar NotFound.tsx
- [x] Auditar OnboardingPage.tsx
- [x] Auditar ROIDashboard.tsx
- [x] Auditar ReportsPage.tsx (já corrigida)
- [x] Auditar ResultadosEnriquecimento.tsx
- [x] Auditar SchedulePage.tsx
- [x] Criar relatório consolidado de problemas

### 29.2 Correções de Tema Light (em lote)
- [x] Corrigir text-white → text-slate-900/foreground
- [x] Corrigir glass-card → bg-white border-slate-200
- [x] Corrigir bg-slate-800/900/950 → bg-slate-50/100
- [x] Padronizar cores de texto (slate-900, slate-600, slate-700)
- [x] Padronizar gradientes (from-blue-50 to-purple-50)

### 29.3 Correções de Breadcrumbs (em lote)
- [x] Substituir Breadcrumbs por DynamicBreadcrumbs
- [x] Adicionar DynamicBreadcrumbs onde falta
- [x] Remover imports duplicados

### 29.4 Melhorias de Analytics - Filtro por Pesquisa
- [x] Adicionar seletor de pesquisa em AnalyticsPage
- [x] Atualizar backend: analytics.evolution com pesquisaId
- [x] Atualizar backend: analytics.geographic com pesquisaId
- [x] Atualizar backend: analytics.segmentation com pesquisaId
- [x] Testar filtros combinados (project + pesquisa)

### 29.5 Melhorias de Analytics - Exportação de Gráficos
- [ ] Instalar biblioteca html2canvas ou recharts export
- [ ] Adicionar botão "Exportar PNG" em cada gráfico
- [ ] Adicionar botão "Exportar SVG" em cada gráfico
- [ ] Implementar função de download de imagem
- [ ] Testar exportação em todos os gráficos

### 29.6 Melhorias de Analytics - Dashboard de Comparação
- [ ] Criar nova página ComparisonDashboard.tsx
- [ ] Adicionar seletor de 2+ projetos/pesquisas
- [ ] Criar gráficos lado a lado (evolução, distribuição)
- [ ] Adicionar tabela de métricas comparativas
- [ ] Adicionar rota /comparison no App.tsx
- [ ] Adicionar item no sidebar

### 29.7 Melhorias de Relatórios - Filtro por Pesquisa
- [x] Adicionar seletor de pesquisa em ReportGenerator
- [x] Atualizar backend: reports.generate com pesquisaId
- [x] Testar geração de PDF com filtro de pesquisa

### 29.8 Validação Final
- [ ] Testar todas as 22 páginas visualmente
- [ ] Verificar consistência de tema light
- [ ] Verificar navegação e breadcrumbs
- [ ] Testar exportação de gráficos
- [ ] Testar dashboard de comparação
- [ ] Criar checkpoint final


---

## FASE 30: ANALYTICS DE LEAD GENERATION - INTELIGÊNCIA PRÉ-VENDAS 📊🎯

### 30.1 Fundação - Tabelas de Analytics
- [x] Criar tabela analytics_mercados (métricas por mercado)
- [x] Criar tabela analytics_pesquisas (métricas por pesquisa/batch)
- [x] Criar tabela analytics_dimensoes (eficácia por UF/porte/segmentação)
- [x] Criar tabela analytics_timeline (evolução temporal diária)
- [x] Implementar motor de agregação (cron job diário)
- [ ] Criar índices de performance

### 30.2 Sistema de Scoring e Métricas
- [ ] Implementar modelo de scoring otimizado (0-100 pontos)
- [ ] Criar biblioteca de métricas de qualidade
- [ ] Criar biblioteca de métricas de eficiência operacional
- [ ] Criar biblioteca de métricas de ROI
- [ ] Implementar cálculo automático de ROI por mercado/pesquisa

### 30.3 Dashboard 1 - Research Overview
- [ ] Criar página ResearchOverviewDashboard.tsx
- [ ] Implementar KPIs (Mercados, Leads, Qualidade Média, Taxa Aprovação)
- [ ] Criar Funil de Qualificação (Clientes → Leads → Enriquecidos → Validados → Aprovados → Exportados SF)
- [ ] Criar gráfico de Distribuição de Qualidade (pie chart)
- [ ] Criar Evolução Temporal (leads gerados, qualidade média)
- [ ] Criar Top 10 Mercados (volume, qualidade, aprovação)
- [ ] Adicionar rota /research-overview no App.tsx

### 30.4 Dashboard 2 - Lead Quality Intelligence
- [ ] Criar página LeadQualityDashboard.tsx
- [ ] Criar Heatmap de Qualidade por Dimensão (UF x Porte)
- [ ] Implementar Matriz Qualidade vs Volume (4 quadrantes)
- [ ] Criar Análise de Correlação (atributos vs qualidade)
- [ ] Gerar Perfil do Lead Ideal (características score > 90)
- [ ] Implementar Sistema de Recomendações Automáticas
- [ ] Adicionar rota /lead-quality no App.tsx

### 30.5 Dashboard 3 - Operational Efficiency
- [ ] Criar página OperationalEfficiencyDashboard.tsx
- [ ] Implementar Métricas de Enriquecimento (taxa sucesso, tempo, custo)
- [ ] Criar Métricas de Validação (tempo, taxa aprovação, backlog)
- [ ] Implementar Análise de Custos (waterfall chart)
- [ ] Criar Detecção de Gargalos (etapas lentas)
- [ ] Implementar Sistema de Alertas Operacionais
- [ ] Adicionar rota /operational-efficiency no App.tsx

### 30.6 Dashboard 4 - Salesforce Integration & ROI
- [ ] Criar página SalesforceROIDashboard.tsx
- [ ] Implementar Métricas de Pipeline Gerado (leads exportados, convertidos)
- [ ] Criar Análise de ROI por Dimensão (mercado, UF, porte)
- [ ] Implementar Sankey Diagram (fluxo de leads até venda)
- [ ] Criar Feedback Loop (SF → PAV)
- [ ] Implementar Ajuste Automático de Scoring baseado em conversões
- [ ] Adicionar rota /salesforce-roi no App.tsx

### 30.7 Componentes Reutilizáveis
- [ ] Criar MetricCard.tsx (KPI card com sparkline e trend)
- [ ] Criar QualificationFunnel.tsx (funil interativo com drill-down)
- [ ] Criar QualityMatrix.tsx (matriz qualidade vs volume)
- [ ] Criar RecommendationCard.tsx (card de recomendação acionável)
- [ ] Criar ExportButton.tsx (exportar Excel, PDF, PNG)
- [ ] Criar GlobalFilterPanel.tsx (filtros globais)

### 30.8 Integração Salesforce
- [ ] Criar interface de exportação para Salesforce
- [ ] Implementar mapeamento de campos PAV → Salesforce
- [ ] Criar filtros de exportação (qualidade mínima, status)
- [ ] Implementar webhook para receber feedback de conversão
- [ ] Criar tabela salesforce_sync_log (histórico de exportações)
- [ ] Implementar sincronização automática (cron job)

### 30.9 Alertas Operacionais
- [ ] Criar tabela operational_alerts
- [ ] Implementar alerta: Qualidade média baixa (<60)
- [ ] Implementar alerta: Enriquecimento lento (>10min/lead)
- [ ] Implementar alerta: Backlog de validação alto (>100 leads)
- [ ] Implementar alerta: Custo elevado (>1.5x média)
- [ ] Implementar alerta: Conversão SF baixa (<15%)
- [ ] Criar página OperationalAlerts.tsx

### 30.10 Sistema de Recomendações
- [ ] Criar tabela recommendations
- [ ] Implementar recomendações de mercados prioritários
- [ ] Implementar recomendações de regiões sub-exploradas
- [ ] Implementar recomendações de ajuste de filtros
- [ ] Implementar recomendações de otimização de custos
- [ ] Criar componente RecommendationsPanel.tsx

### 30.11 Performance & Otimização
- [ ] Criar índices nas tabelas de analytics
- [ ] Otimizar queries de agregação
- [ ] Implementar lazy loading de gráficos
- [ ] Cache de métricas calculadas (Redis opcional)
- [ ] Testes de performance

### 30.12 Validação Final
- [ ] Testar todos os 4 dashboards
- [ ] Testar sistema de recomendações
- [ ] Testar alertas operacionais
- [ ] Testar integração Salesforce (exportação + feedback)
- [ ] Testar motor de agregação (cron job)
- [ ] Criar checkpoint final
