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

## FASE 53: MELHORIAS AVANÇADAS DO COCKPIT DINÂMICO 🚀

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

## FASE 54: MELHORIAS AVANÇADAS - VALIDAÇÃO, FILTROS E TENDÊNCIAS 📊

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

## FASE 56: MELHORIAS AVANÇADAS NO WIZARD DE NOVA PESQUISA 🚀

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
