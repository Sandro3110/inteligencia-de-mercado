# TODO: Implementação UI Dimensional

**Data Início:** 02/12/2025  
**Prazo:** 15 dias  
**Status:** 🔄 Em andamento

---

## FASE 1: Infraestrutura Base (2 dias)

### Configuração de APIs
- [ ] Configurar Google Maps API
  - [ ] Adicionar variável de ambiente GOOGLE_MAPS_API_KEY
  - [ ] Criar helper para carregar Google Maps script
  - [ ] Testar integração básica

- [ ] Configurar OpenAI API (busca semântica)
  - [ ] Verificar variável BUILT_IN_FORGE_API_KEY
  - [ ] Criar client OpenAI
  - [ ] Criar função de busca semântica
  - [ ] Testar interpretação de queries

### Types e Interfaces
- [ ] Criar types para dimensões (tempo, geografia, mercado)
- [ ] Criar types para filtros inteligentes
- [ ] Criar types para exportação
- [ ] Criar types para busca semântica

### Helpers
- [ ] Criar helper de exportação Excel
- [ ] Criar helper de exportação CSV
- [ ] Criar helper de exportação JSON
- [ ] Criar helper de exportação Markdown
- [ ] Criar helper de cópia (texto/markdown/json/csv)
- [ ] Criar helper de formatação de moeda
- [ ] Criar helper de formatação de datas

---

## FASE 2: Componentes Base (3 dias)

### Componentes Universais
- [ ] CopyButton (universal, multi-formato)
- [ ] ExportButton (Excel/CSV/JSON/Markdown)
- [ ] LoadingState (skeleton/spinner/progress)
- [ ] ErrorState (toast/alert/retry)
- [ ] EmptyState (mensagem + ação)

### Componentes de Filtro
- [ ] FilterPanel (painel de filtros)
- [ ] SemanticSearch (busca com IA)
- [ ] SmartFilters (filtros inteligentes com alertas)
- [ ] FilterSuggestions (sugestões de otimização)

### Componentes de Visualização
- [ ] Card clicável (hover/click/actions)
- [ ] KPICard (com copiar)
- [ ] DataTable (paginação/ordenação/filtros)
- [ ] Chart (wrapper para Recharts)

### Componentes de Mapa
- [ ] MapView (Google Maps integrado)
- [ ] MapCluster (agrupamento)
- [ ] MapHeatmap (mapa de calor)
- [ ] MapTooltip (tooltip rico)

### Componentes de Hierarquia
- [ ] TreeView (árvore navegável)
- [ ] Sunburst (círculos concêntricos)
- [ ] Treemap (retângulos proporcionais)
- [ ] Breadcrumb (navegação hierárquica)

---

## FASE 3: tRPC Routers (2 dias)

### Routers Principais
- [ ] cuboRouter
  - [ ] buscaSemantica (query)
  - [ ] consultar (query com alertas)
  - [ ] exportar (mutation)
  - [ ] copiar (query)

- [ ] temporalRouter
  - [ ] evolucao (query)
  - [ ] sazonalidade (query)
  - [ ] tendencias (query)
  - [ ] crescimento (query)
  - [ ] conversoes (query)

- [ ] geografiaRouter
  - [ ] mapa (query com clusters/heatmap)
  - [ ] drillDown (query)
  - [ ] top10Cidades (query)
  - [ ] distribuicaoPorRegiao (query)

- [ ] mercadoRouter
  - [ ] hierarquia (query)
  - [ ] drillDown (query)
  - [ ] detalhes (query)
  - [ ] tendencias (query)

- [ ] entidadeRouter
  - [ ] get360 (query completa)
  - [ ] copiar (query)
  - [ ] exportarFicha (mutation)

---

## FASE 4: Telas Principais (5 dias)

### Tela 1: Cubo Explorador
- [ ] Layout base
- [ ] Busca semântica (input + interpretação IA)
- [ ] Filtros inteligentes (com alertas)
- [ ] KPIs principais (4 cards)
- [ ] Visualizações (cards/mapa/gráfico/tabela/hierarquia)
- [ ] Exportação (Excel/CSV/JSON/Markdown)
- [ ] Copiar (em todos os elementos)

### Tela 2: Análise Temporal
- [ ] Layout com abas
- [ ] Aba: Visão Geral
- [ ] Aba: Tendências
- [ ] Aba: Sazonalidade
- [ ] Aba: Crescimento
- [ ] Aba: Conversões
- [ ] Gráficos interativos
- [ ] Exportação

### Tela 3: Análise Geográfica
- [ ] Layout base
- [ ] Navegação hierárquica (breadcrumb)
- [ ] Mapa interativo (Google Maps)
- [ ] Clusters dinâmicos
- [ ] Heatmap
- [ ] Drill-down geográfico
- [ ] Top 10 cidades
- [ ] Distribuição por região
- [ ] Exportação

### Tela 4: Análise de Mercado
- [ ] Layout base
- [ ] Hierarquia navegável (árvore)
- [ ] Visualizações alternativas (sunburst/treemap)
- [ ] Detalhes de mercado
- [ ] Principais players
- [ ] Tendências
- [ ] Exportação

### Tela 5: Detalhes da Entidade
- [ ] Layout com abas
- [ ] Aba: Geral
- [ ] Aba: Financeiro
- [ ] Aba: Produtos
- [ ] Aba: Concorrentes
- [ ] Aba: Leads
- [ ] Aba: Análises
- [ ] Aba: Histórico
- [ ] Recomendações acionáveis
- [ ] Rastreabilidade
- [ ] Exportação ficha completa

---

## FASE 5: Funcionalidades Avançadas (3 dias)

### Busca Semântica com IA
- [ ] Integração OpenAI
- [ ] Interpretação de queries
- [ ] Mapeamento para filtros
- [ ] Sugestões de refinamento
- [ ] Histórico de buscas

### Filtros Inteligentes
- [ ] Estimativa de quantidade de registros
- [ ] Alertas de performance (> 10.000 registros)
- [ ] Sugestões de otimização
- [ ] Combinações recomendadas
- [ ] Impacto antes de aplicar

### Sistema de Exportação
- [ ] Excel formatado (cores, fórmulas, gráficos)
- [ ] CSV formatado (UTF-8, separadores)
- [ ] JSON (API-ready)
- [ ] Markdown (documentação)
- [ ] Download automático

### Sistema de Cópia
- [ ] Copiar texto simples
- [ ] Copiar Markdown
- [ ] Copiar JSON
- [ ] Copiar CSV
- [ ] Feedback visual (toast)

### Rastreabilidade
- [ ] Origem dos dados
- [ ] Histórico de alterações
- [ ] Custo de enriquecimento
- [ ] Qualidade dos dados
- [ ] Modelo/temperatura usados

---

## FASE 6: Testes e Validação (2 dias)

### Testes Funcionais
- [ ] Busca semântica funciona
- [ ] Filtros aplicam corretamente
- [ ] Drill-down funciona
- [ ] Exportação gera arquivos corretos
- [ ] Copiar funciona em todos os elementos
- [ ] Mapas carregam corretamente
- [ ] Gráficos renderizam dados reais

### Testes de Performance
- [ ] Consultas < 3s (até 1.000 registros)
- [ ] Alertas aparecem para > 10.000 registros
- [ ] Virtualização funciona em listas grandes
- [ ] Cache funciona corretamente

### Testes de UX
- [ ] Navegação intuitiva
- [ ] Feedback visual em todas as ações
- [ ] Loading states aparecem
- [ ] Error states aparecem
- [ ] Toasts aparecem
- [ ] Responsivo (desktop/tablet/mobile)

### Testes de Integração
- [ ] tRPC queries funcionam
- [ ] DAL retorna dados corretos
- [ ] Banco de dados responde
- [ ] APIs externas funcionam (Google Maps, OpenAI)

---

## FASE 7: Entrega Final (1 dia)

- [ ] Documentação completa
- [ ] README atualizado
- [ ] Vídeo demo
- [ ] Apresentação final

---

## PROGRESSO GERAL

- [ ] FASE 1: Infraestrutura (0/7 tarefas)
- [ ] FASE 2: Componentes (0/15 tarefas)
- [ ] FASE 3: Routers (0/5 tarefas)
- [ ] FASE 4: Telas (0/5 tarefas)
- [ ] FASE 5: Avançadas (0/5 tarefas)
- [ ] FASE 6: Testes (0/4 tarefas)
- [ ] FASE 7: Entrega (0/4 tarefas)

**Total:** 0/45 tarefas concluídas (0%)

---

## NOTAS

- Zero placeholders
- Zero mockups
- Zero fake data
- 100% funcional
- Feedback visual em TUDO
- Copiar em TUDO
- Exportação real em TUDO
