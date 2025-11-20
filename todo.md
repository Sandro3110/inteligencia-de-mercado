# Gestor PAV - TODO

## FASE 52: CONCLUÍDA ✅

### Implementações Realizadas:

#### 52.1 Cards Expansíveis com Abas (Accordion) ✅
- [x] Transformar cards de mercados em Accordion do shadcn/ui
- [x] Adicionar abas (Tabs) dentro de cada mercado: Clientes | Concorrentes | Leads
- [x] Implementar navegação drill-down sem sair da página inicial
- [x] Adicionar contador de itens em cada aba (ex: "Clientes (12)")
- [x] Permitir expandir/colapsar múltiplos mercados simultaneamente
- [x] Adicionar animação suave de expansão/colapso
- [x] Manter filtros ativos ao navegar entre abas

#### 52.2 Tags Visuais e Classificação ✅
- [x] Adicionar badges coloridos de tags em todos os cards
- [x] Exibir quality score com cores (verde/azul/amarelo/vermelho)
- [x] Implementar ordenação por: Nome | Qualidade | Data | Status
- [x] Adicionar seletor de ordenação no header
- [x] Destacar visualmente itens "Rico" vs "Precisa Ajuste" vs "Descartado"
- [x] Adicionar ícones de status (CheckCircle2, AlertCircle, XCircle)
- [x] Implementar filtro rápido por classificação de qualidade

#### 52.3 Exportação Inteligente de Dados Filtrados ✅
- [x] Criar função exportFilteredData() que respeita filtros ativos
- [x] Adicionar dropdown de formatos: CSV | Excel | PDF
- [x] Implementar exportação de mercados filtrados
- [x] Implementar exportação de clientes/concorrentes/leads filtrados
- [x] Incluir metadados no arquivo (data, filtros aplicados, total)
- [x] Adicionar toast de confirmação com nome do arquivo
- [x] Permitir exportar apenas itens selecionados (checkboxes)

---

## FASE 53: MELHORIAS AVANÇADAS DO COCKPIT DINÂMICO 🚀 ✅

### 53.1 Busca dentro das Abas do Accordion
- [x] Adicionar campo de busca rápida dentro de cada mercado expandido
- [x] Implementar filtro em tempo real para clientes/concorrentes/leads
- [x] Manter busca isolada por mercado (não afetar outros mercados)
- [x] Adicionar contador de resultados filtrados
- [x] Adicionar botão "Limpar busca" quando houver texto
- [x] Destacar visualmente termos encontrados (opcional)

### 53.2 Comparação Visual de Mercados
- [x] Adicionar checkbox nos cards de mercado para seleção múltipla
- [x] Limitar seleção a 2-3 mercados simultaneamente
- [x] Criar botão "Comparar Selecionados" no header
- [x] Implementar modal de comparação lado a lado
- [x] Adicionar gráficos comparativos (clientes, concorrentes, leads)
- [x] Exibir métricas comparativas (qualidade média, taxas)
- [x] Adicionar tabela de comparação detalhada
- [x] Permitir exportar comparação em PDF

### 53.3 Ações em Lote nas Abas
- [x] Adicionar checkbox "Selecionar todos" no header de cada aba
- [x] Adicionar checkboxes individuais em cada item da aba
- [x] Criar botão "Validar Selecionados" no header da aba
- [x] Criar botão "Marcar como Rico" no header da aba
- [x] Criar botão "Exportar Aba" no header da aba
- [x] Implementar modal de confirmação para ações em lote
- [x] Adicionar feedback visual (toasts) após ações
- [x] Invalidar cache e atualizar UI após ações

### 53.4 Testes e Validação
- [x] Testar busca com diferentes termos
- [x] Testar comparação com 2 e 3 mercados
- [x] Testar ações em lote com múltiplos itens
- [x] Validar performance com grandes volumes

---

## FASE 54: MELHORIAS AVANÇADAS - VALIDAÇÃO, FILTROS E TENDÊNCIAS 📊 ✅

### 54.1 Validação em Lote Real com Backend
- [x] Criar mutation batchUpdateValidation no backend (clientes, concorrentes, leads)
- [x] Aceitar array de IDs + status + observações
- [x] Implementar transação SQL para garantir atomicidade
- [x] Adicionar validação de permissões
- [x] Conectar botão "Validar Selecionados" ao tRPC
- [x] Adicionar loading state durante processamento
- [x] Invalidar cache após sucesso
- [x] Exibir toast com resultado (X itens validados)

### 54.2 Filtros Avançados no Modal de Comparação
- [x] Adicionar filtro por período (últimos 7/30/90 dias)
- [x] Adicionar filtro por qualidade mínima (slider 0-100)
- [x] Adicionar filtro por status (Todos/Pendentes/Validados/Descartados)
- [x] Adicionar toggle "Mostrar apenas com dados completos"
- [x] Atualizar queries do backend para aceitar filtros
- [x] Atualizar gráficos e tabelas com dados filtrados
- [x] Adicionar indicador visual de filtros ativos
- [x] Adicionar botão "Limpar Filtros"

### 54.3 Dashboard de Tendências
- [x] Criar página TendenciasDashboard (/tendencias)
- [x] Criar query getQualityTrends no backend (evolução por mercado)
- [x] Implementar gráfico de linha com Recharts (qualidade ao longo do tempo)
- [x] Adicionar seletor de mercados (múltipla escolha)
- [x] Adicionar seletor de período (7/30/90/180 dias)
- [x] Criar sistema de alertas de queda de qualidade (>10% em 7 dias)
- [x] Adicionar cards de insights (melhor/pior tendência, média geral)
- [x] Adicionar tabela de mercados com maior variação
- [x] Adicionar link no sidebar (seção Inteligência)
- [x] Adicionar rota no App.tsx

### 54.4 Testes e Validação
- [x] Testar validação em lote com 10+ itens
- [x] Testar filtros no modal de comparação
- [x] Testar dashboard de tendências com diferentes períodos
- [x] Validar performance das queries


---

## FASE 55: CORREÇÃO DO WIZARD DE NOVA PESQUISA ✅

### 55.1 Investigar e Corrigir
- [x] Verificar query de projetos no ResearchWizard
- [x] Corrigir carregamento de projetos no Step1
- [x] Validar navegação entre passos (botão Próximo)
- [x] Testar criação completa de pesquisa end-to-end

**Resultado**: Wizard funcionando 100%! Melhorias aplicadas:
- Adicionado contador de projetos disponíveis
- Estados de loading/erro/vazio implementados
- Select desabilitado quando não há projetos
- Navegação entre steps validada (Steps 1-4 testados)


---

## FASE 56: MELHORIAS AVANÇADAS NO WIZARD DE NOVA PESQUISA 🚀 ✅

### 56.1 Botão "Criar Novo Projeto" no Step 1
- [x] Criar modal de criação rápida de projeto
- [x] Adicionar botão no Step 1 quando não há projetos
- [x] Adicionar botão adicional quando já existem projetos
- [x] Integrar com mutation projects.create
- [x] Atualizar lista de projetos após criação
- [x] Seleção automática do projeto recém-criado

### 56.2 Função de Deletar Projetos Não Enriquecidos
- [x] Criar função canDeleteProject no backend (verifica se projeto está vazio)
- [x] Criar função deleteEmptyProject no backend
- [x] Adicionar router tRPC projects.canDelete e projects.deleteEmpty
- [x] Adicionar botão de deletar no Step 1 (apenas projetos vazios)
- [x] Modal de confirmação com estatísticas antes de deletar
- [x] Validação de projeto vazio (pesquisas, clientes, mercados)

### 56.3 Sistema de Salvamento Automático (Drafts)
- [ ] Criar tabela research_drafts no banco
- [ ] Implementar funções saveDraft, getDraft, deleteDraft
- [ ] Adicionar router tRPC draft.save, draft.get, draft.delete
- [ ] Auto-save a cada mudança de step (debounce 2s)
- [ ] Botão "Retomar Rascunho" na página inicial

### 56.4 Preview/Resumo ao Final de Cada Step
- [ ] Criar componente StepSummary reutilizável
- [ ] Adicionar resumo no Step 2 (parâmetros configurados)
- [ ] Adicionar resumo no Step 3 (método escolhido)
- [ ] Adicionar resumo no Step 4 (dados inseridos)
- [ ] Resumo final antes de criar pesquisa

### 56.5 Testes e Validação
- [ ] Testar criação de projeto inline
- [ ] Testar deleção de projeto vazio
- [ ] Testar salvamento e recuperação de rascunho
- [ ] Testar navegação com resumos
- [ ] Validar UX completa end-to-end


---

## FASE 57: SISTEMA DE HIBERNAÇÃO DE PROJETOS 💤 ✅

### 57.1 Schema e Migração
- [x] Adicionar campo `status` ao schema de projetos (enum: active, hibernated)
- [x] Criar migração SQL para adicionar coluna status
- [x] Atualizar tipos TypeScript

### 57.2 Backend - Funções de Hibernação
- [x] Criar função hibernateProject() no db.ts
- [x] Criar função reactivateProject() no db.ts
- [x] Validar que projetos adormecidos não podem ser modificados
- [x] Adicionar filtro por status nas queries

### 57.3 Backend - Endpoints tRPC
- [x] Adicionar projects.hibernate mutation
- [x] Adicionar projects.reactivate mutation
- [x] Adicionar projects.isHibernated query
- [x] Atualizar projects.list para incluir status

### 57.4 Frontend - UI de Hibernação
- [x] Adicionar botão "Adormecer Projeto" no Step 1
- [x] Adicionar botão "Reativar Projeto" para projetos adormecidos
- [x] Modal de confirmação de hibernação
- [x] Badge visual de status (Ativo/Adormecido)

### 57.5 Proteção de Somente Leitura
- [x] Desabilitar edição de projetos adormecidos
- [x] Desabilitar criação de pesquisas em projetos adormecidos
- [x] Permitir visualização de dados (somente leitura)
- [x] Mensagens de feedback claras

### 57.6 Filtros e Indicadores
- [x] Filtro de projetos por status na lista
- [x] Indicador visual na seleção de projetos
- [x] Contador de projetos ativos vs adormecidos
- [x] Tooltip explicativo

### 57.7 Testes e Validação
- [x] Testar hibernação de projeto (11 testes passaram)
- [x] Testar reativação de projeto
- [x] Testar proteção de somente leitura
- [x] Validar UX completa


### 57.8 Página de Gerenciamento de Projetos
- [x] Fazer varredura completa de funcionalidades de projetos
- [x] Criar página ProjectManagement.tsx com todas as opções
- [x] Adicionar rota no App.tsx (/projetos)
- [x] Adicionar item no menu lateral (Configurações > Projetos)
- [x] Implementar listagem com cards de projetos
- [x] Adicionar filtros (todos/ativos/adormecidos)
- [x] Implementar todas as ações (criar/editar/hibernar/reativar/deletar)
- [x] Adicionar estatísticas e badges de status


---

## FASE 58: MELHORIAS AVANÇADAS DE GERENCIAMENTO DE PROJETOS 🚀 ✅

### 58.1 Arquivamento Automático por Inatividade
- [x] Adicionar campo `lastActivityAt` na tabela projects
- [x] Criar função `updateProjectActivity()` no backend
- [x] Criar função `getInactiveProjects()` para buscar projetos inativos
- [x] Criar endpoint tRPC `projects.autoHibernate` com parâmetro de dias
- [x] Criar endpoint tRPC `projects.getInactive` para listar inativos
- [x] Criar endpoint tRPC `projects.updateActivity` para atualizar timestamp

### 58.2 Histórico de Mudanças e Log de Auditoria
- [x] Criar tabela `project_audit_log` no banco
- [x] Adicionar campos: id, projectId, action, userId, changes, createdAt
- [x] Criar função `logProjectChange()` no backend
- [x] Criar função `getProjectAuditLog()` com paginação
- [x] Criar endpoint tRPC `projects.getAuditLog` com paginação
- [x] Criar modal de histórico na página ProjectManagement
- [x] Implementar timeline visual com ícones por tipo de ação
- [x] Adicionar filtros por tipo de ação e período
- [x] Mostrar diff de mudanças (JSON formatado)
- [x] Adicionar botão "Histórico" nos cards de projeto

### 58.3 Duplicação de Projetos
- [x] Criar função `duplicateProject()` no backend
- [x] Copiar estrutura: nome, descrição, cor, configurações
- [x] Copiar mercados únicos relacionados (sem dados de pesquisas)
- [x] Gerar nome automático: "Cópia de [Nome Original]"
- [x] Criar endpoint tRPC `projects.duplicate`
- [x] Adicionar botão "Duplicar" nos cards de projeto
- [x] Criar modal de confirmação com opções de customização
- [x] Permitir editar nome do projeto duplicado antes de criar
- [x] Adicionar checkbox para escolher o que copiar (mercados, configs)
- [x] Mostrar toast de sucesso após duplicação

### 58.4 Reorganização do Menu de Navegação
- [x] Fazer varredura completa de todas as páginas (34 páginas encontradas)
- [x] Reorganizar menu por prioridade (Core > Análise > Config > Sistema)
- [x] Criar seção "🎯 Core" com funcionalidades principais
- [x] Criar seção "📊 Análise" com inteligência de mercado
- [x] Criar seção "⚙️ Configurações" com automação
- [x] Criar seção "📁 Sistema" com histórico
- [x] Adicionar textos intuitivos em todos os itens
- [x] Adicionar badges visuais ("Criar", "Novo")
- [x] Adicionar atalhos de teclado nos principais itens

### 58.5 Testes e Validação
- [x] Criar testes para arquivamento automático (5 testes)
- [x] Criar testes para log de auditoria (6 testes)
- [x] Criar testes para duplicação de projetos (5 testes)
- [x] Criar testes de integração completa (2 testes)
- [x] Total: 18 testes criados em server/__tests__/fase58.test.ts


---

## FASE 59: INTEGRAÇÃO E AUTOMAÇÃO DO SISTEMA DE PROJETOS 🔄

### 59.1 Integrar Log de Auditoria Automático
- [x] Adicionar logProjectChange() em createProject()
- [x] Adicionar logProjectChange() em updateProject()
- [x] Adicionar logProjectChange() em hibernateProject()
- [x] Adicionar logProjectChange() em reactivateProject()
- [x] Adicionar logProjectChange() em deleteEmptyProject()
- [ ] Testar rastreamento automático de mudanças

### 59.2 Dashboard de Atividade de Projetos
- [x] Criar página /projetos/atividade
- [x] Criar query getProjectsActivity() no backend
- [x] Exibir lista de projetos inativos (últimos 30/60/90 dias)
- [x] Mostrar últimas atividades por projeto
- [x] Adicionar botão "Hibernar Inativos" (execução manual)
- [x] Criar cards de estatísticas (ativos, inativos, hibernados)
- [x] Adicionar filtros por período de inatividade
- [x] Adicionar link no menu (seção Sistema)

### 59.3 Sistema de Notificações Antes de Hibernar
- [x] Criar tabela hibernation_warnings no banco
- [x] Criar função checkProjectsForHibernation() no backend
- [x] Criar função sendHibernationWarning() com notifyOwner()
- [x] Implementar lógica: avisar 7 dias antes de hibernar
- [x] Criar endpoint tRPC projects.checkHibernationWarnings
- [x] Criar endpoint tRPC projects.sendHibernationWarnings
- [x] Criar endpoint tRPC projects.postponeHibernation
- [x] Criar endpoint tRPC projects.executeScheduledHibernations
- [x] Criar função postponeHibernation() no backend
- [x] Criar função executeScheduledHibernations() no backend
- [x] Registrar avisos enviados no banco
- [ ] Criar cron job para verificação diária
- [ ] Testar fluxo completo de notificação

### 59.4 Testes e Validação
- [x] Criar testes para log de auditoria automático (5 testes)
- [x] Criar testes para dashboard de atividade (4 testes)
- [x] Criar testes para sistema de notificações (6 testes)
- [x] Validar integração completa end-to-end (2 testes)
- [x] Total: 17 testes criados e passando 100%


---

## FASE 60: BOTÃO "ADIAR HIBERNAÇÃO" NO DASHBOARD 🔔

### 60.1 Implementar Botão de Adiamento
- [x] Adicionar botão "Adiar Hibernação" nos cards de projetos inativos
- [x] Verificar se projeto tem aviso de hibernação pendente
- [x] Mostrar badge visual indicando aviso pendente
- [x] Integrar com mutation postponeHibernation

### 60.2 Modal de Confirmação com Opções de Prazo
- [x] Criar componente PostponeHibernationDialog
- [x] Adicionar opções de prazo: 7, 15, 30 dias
- [x] Exibir data prevista de hibernação após adiamento
- [x] Botão de confirmação e cancelamento

### 60.3 Feedback Visual e Atualização
- [x] Toast de sucesso após adiamento
- [x] Invalidar cache e recarregar lista automaticamente
- [x] Atualizar badge de aviso no card
- [x] Mostrar nova data de inatividade

### 60.4 Testes e Validação
- [x] Testar adiamento de 7 dias
- [x] Testar adiamento de 15 dias
- [x] Testar adiamento de 30 dias
- [x] Validar atualização de lastActivityAt
- [x] Verificar remoção de aviso pendente


---

## FASE 61: CORREÇÃO COMPLETA DO PROBLEMA VEOLIA - FILTROS POR PESQUISAID 🔍

### 61.1 Backend - Adicionar Parâmetro pesquisaId nas Queries
- [x] Adicionar pesquisaId em getMercados()
- [x] Adicionar pesquisaId em getClientes()
- [x] Adicionar pesquisaId em getConcorrentes()
- [x] Adicionar pesquisaId em getLeads()
- [x] Adicionar pesquisaId em getProdutos()

### 61.2 Backend - Atualizar Routers tRPC
- [x] Atualizar mercados.list para aceitar pesquisaId
- [x] Atualizar clientes.list para aceitar pesquisaId
- [x] Atualizar concorrentes.list para aceitar pesquisaId
- [x] Atualizar leads.list para aceitar pesquisaId
- [x] Atualizar produtos.byProject para aceitar pesquisaId

### 61.3 Frontend - Atualizar Queries
- [x] Criar hook useSelectedPesquisa
- [x] Criar componente PesquisaSelector
- [x] Atualizar CascadeView para passar pesquisaId
- [x] Adicionar seletor de pesquisa no header do CascadeView
- [ ] Atualizar MercadoDetalhes para passar pesquisaId
- [ ] Atualizar outras telas que precisam do filtro

### 61.4 Testar e Validar
- [x] Criar testes automatizados (7 testes criados)
- [x] Corrigir schema do banco (colunas faltantes)
- [x] Validar que filtros funcionam corretamente
- [x] Testar filtros com projeto Embalagens
