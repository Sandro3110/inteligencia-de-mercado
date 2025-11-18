# Gestor PAV - TODO

## Fases Concluídas ✅

### Fase 1: Configuração e Migração
- [x] Definir schema completo do banco de dados
- [x] Adicionar colunas de validação (validation_status, validation_notes, etc.)
- [x] Migrar dados do Supabase para o banco local
- [x] Criar helpers de consulta no server/db.ts

### Fase 2: Dashboard e Lista de Mercados
- [x] Implementar Dashboard com estatísticas gerais
- [x] Criar cards de métricas (Total Mercados, Clientes, Leads, etc.)
- [x] Adicionar gráfico de progresso de validação
- [x] Implementar Lista de Mercados com busca
- [x] Criar cards de mercado com hover effect
- [x] Adicionar rotas no App.tsx

### Fase 3: Detalhes do Mercado
- [x] Criar tela de Detalhes do Mercado
- [x] Implementar sistema de abas (Clientes, Concorrentes, Leads)
- [x] Exibir tabelas interativas com dados de cada aba
- [x] Adicionar coluna de Status com ícones visuais
- [x] Implementar navegação entre mercados

### Fase 4: Sistema de Validação
- [x] Criar Modal de Edição/Validação
- [x] Implementar formulário de edição de dados
- [x] Adicionar botões de seleção de status (Rico, Ajuste, Descartar)
- [x] Implementar campo de notas de validação
- [x] Salvar validações no banco de dados
- [x] Atualizar UI em tempo real após validação

### Fase 5: Filtros e Exportação
- [x] Implementar filtros por status de validação
- [x] Adicionar busca por nome/texto
- [x] Implementar exportação para CSV
- [x] Adicionar feedback visual (toasts, loading states)
- [x] Implementar tratamento de erros

### Fase 6: Testes e Entrega
- [x] Testar todas as funcionalidades
- [x] Verificar responsividade
- [x] Validar integração com dados reais
- [x] Criar checkpoint final
- [x] Documentar uso do sistema

### Fase 7: Redesign Inspirado no MciGlobal
- [x] Analisar estrutura e estética do HTML de referência
- [x] Adaptar tema dark com background radial gradient
- [x] Implementar paleta de cores moderna (slate/blue)
- [x] Habilitar alternância entre tema light e dark
- [x] Criar cards com glassmorphism e gradientes radiais
- [x] Adicionar borders sutis com transparência
- [x] Implementar hover effects suaves com transform
- [x] Melhorar tipografia (uppercase titles, letter-spacing)
- [x] Adicionar pills/badges coloridos para categorias
- [x] Criar breadcrumbs visuais na navegação
- [x] Implementar layout em cascata (hierarquia clara)
- [x] Adicionar semáforos visuais (dots coloridos)
- [x] Melhorar espaçamento e densidade visual
- [x] Testar responsividade do novo design
- [x] Criar checkpoint do redesign

---

## Fase 8: Navegação em Cascata (Drill-Down) 🚧

### 8.1 Análise e Design
- [x] Analisar requisitos de navegação hierárquica
- [x] Projetar wireframe da interface em cascata
- [x] Definir comportamento de expansão/colapso
- [x] Documentar fluxo de navegação

### 8.2 Interface em Cascata
- [x] Criar componente CascadeView principal
- [x] Implementar nível 1: Lista de Mercados (cards compactos)
- [x] Implementar nível 2: Clientes do mercado selecionado
- [x] Implementar nível 3: Concorrentes do mercado selecionado
- [x] Implementar nível 4: Leads do mercado selecionado
- [x] Adicionar animações de expansão/colapso suaves
- [x] Implementar scroll automático ao expandir níveis

### 8.3 Filtros e Controles
- [x] Adicionar botão de alternância Light/Dark no header
- [x] Criar filtro global de status (Pendente/Validado/Descartado)
- [x] Implementar contadores de status em cada nível
- [x] Adicionar badges visuais de status nos cards
- [x] Criar botão "Limpar Filtros"

### 8.4 Fila de Trabalho
- [x] Implementar seleção múltipla de itens
- [x] Criar painel lateral de "Fila de Trabalho"
- [x] Adicionar ações em lote (validar/descartar múltiplos)
- [x] Persistir estado da navegação (localStorage)
- [ ] Adicionar atalhos de teclado (setas, Enter, Esc)

### 8.5 Finalização
- [x] Testar navegação em cascata completa
- [x] Verificar performance com 2.991 registros
- [x] Validar responsividade mobile
- [x] Criar checkpoint da navegação em cascata
- [x] Documentar novo fluxo de uso

---

## Notas Técnicas

**Estrutura de Dados**:
- 73 Mercados
- 800 Clientes
- 591 Concorrentes
- 727 Leads
- Total: 2.991 registros

**Status de Validação**:
- `pending` (Pendente)
- `rich` (Validado/Rico)
- `needs_adjustment` (Precisa Ajuste)
- `discarded` (Descartado)



## Fase 9: Melhorias de Navegação e Layout 🚧

### 9.1 Pop-up de Detalhes
- [x] Criar componente DetailPopup para exibir informações completas
- [x] Implementar clique em item para abrir pop-up
- [x] Adicionar botão de fechar (X) e overlay
- [x] Exibir todos os campos do item no pop-up
- [x] Adicionar animação de entrada/saída

### 9.2 Correção do Tema Light
- [x] Corrigir cores dos cards no tema light (devem ser claros)
- [x] Ajustar contraste de texto no tema light
- [x] Garantir legibilidade em ambos os temas
- [x] Testar alternância entre temas

### 9.3 Layout Horizontal
- [x] Analisar layout horizontal do HTML de referência
- [x] Reestruturar CascadeView para layout em boxes lado a lado
- [x] Implementar grid horizontal responsivo
- [x] Ajustar espaçamento e proporções
- [x] Manter hierarquia visual clara

### 9.4 Gráficos de Proporção
- [x] Adicionar gráfico de tamanho de mercado vs total
- [x] Adicionar gráfico de clientes por mercado vs total
- [x] Adicionar gráfico de leads por mercado vs total
- [x] Implementar barras de progresso visuais
- [x] Usar cores consistentes com o design

### 9.5 Finalização
- [x] Testar todas as melhorias
- [x] Validar responsividade
- [x] Criar checkpoint das melhorias
- [x] Atualizar documentação

---



## Fase 10: Reestruturação com Menu Lateral 🚧

### 10.1 Menu Lateral Fixo
- [x] Criar sidebar fixo à esquerda (250-280px)
- [x] Mover KPIs informativos para o sidebar
- [x] Adicionar filtros de status no sidebar
- [x] Implementar navegação hierárquica no sidebar
- [x] Adicionar botão de colapsar/expandir sidebar

### 10.2 Área Principal Ampla
- [x] Expandir área principal para ocupar espaço restante
- [x] Aumentar tamanho dos cards de clientes/concorrentes/leads
- [x] Melhorar legibilidade com fonte maior
- [x] Adicionar mais informações visíveis por card
- [x] Implementar grid responsivo (2-3 colunas)

### 10.3 Navegação Hierárquica
- [x] Implementar sistema de níveis (Mercados → Itens → Detalhes)
- [x] Criar breadcrumbs visuais no topo
- [x] Adicionar botões "Avançar" e "Voltar"
- [x] Implementar transições suaves entre níveis
- [ ] Persistir estado de navegação no localStorage

### 10.4 Finalização
- [x] Testar navegação completa
- [x] Validar responsividade mobile
- [x] Criar checkpoint da reestruturação
- [x] Atualizar documentação

---



## Fase 11: Navegação Sequencial por Páginas 🚧

### 11.1 Lista Vertical com Cards Maiores
- [x] Mudar de grid 3 colunas para lista vertical (1 coluna)
- [x] Aumentar largura dos cards para ocupar toda a área
- [x] Aumentar altura dos cards para mais informações
- [x] Implementar rolagem vertical suave

### 11.2 Navegação Sequencial
- [x] Implementar fluxo: Mercados → Clientes → Concorrentes → Leads
- [x] Criar botões "Avançar" e "Voltar" no rodapé
- [x] Adicionar indicador de página atual (ex: "Página 2 de 4")
- [x] Implementar transições suaves entre páginas
- [x] Desabilitar "Avançar" na última página
- [x] Desabilitar "Voltar" na primeira página

### 11.3 Finalização
- [x] Testar navegação completa (ida e volta)
- [x] Validar responsividade
- [x] Criar checkpoint da navegação sequencial
- [x] Atualizar documentação

---



## Fase 12: Lista Compacta com Caixa Fixa 🚧

### 12.1 Lista Compacta
- [x] Mudar de cards para linhas de lista (table-like)
- [x] Reduzir altura das linhas (40-50px)
- [x] Adicionar hover effect nas linhas
- [x] Manter ícone de status e informações principais

### 12.2 Caixa Fixa com Rolagem Interna
- [x] Criar container fixo com altura definida (calc(100vh - header - footer))
- [x] Implementar ScrollArea interno (sem scroll da página)
- [x] Centralizar visualização em uma única tela
- [x] Remover scroll externo da página

### 12.3 Finalização
- [x] Testar visualização centralizada
- [x] Validar quantidade de itens visíveis
- [x] Criar checkpoint da lista compacta
- [x] Atualizar documentação

---



## Fase 13: Melhorias Finais 🚧

### 13.1 Validação em Lote
- [x] Adicionar checkbox à esquerda de cada linha
- [x] Implementar estado de seleção múltipla
- [x] Criar botão "Validar Selecionados (X)" no footer
- [x] Criar modal de validação em lote
- [x] Implementar mutation para validar múltiplos itens
- [x] Adicionar feedback de sucesso/erro

### 13.2 Busca Global Inteligente
- [x] Adicionar campo de busca no sidebar
- [x] Implementar filtro em tempo real por nome/CNPJ/produto/cidade
- [x] Mostrar contador de resultados por tipo
- [x] Adicionar navegação automática para primeira página com resultados
- [x] Implementar highlight visual nos resultados

### 13.3 Exportação de Dados Filtrados
- [x] Adicionar botão "Exportar Filtrados" no header
- [x] Implementar exportação apenas dos itens visíveis
- [x] Gerar CSV com dados filtrados
- [x] Adicionar feedback de download

### 13.4 Finalização
- [x] Testar todas as funcionalidades
- [x] Validar performance com múltiplas seleções
- [x] Criar checkpoint das melhorias finais
- [x] Atualizar documentação

---



## Fase 14: Correção da Barra de Rolagem 🚧

### 14.1 Investigação do Problema
- [x] Analisar código do ScrollArea nas listas
- [x] Identificar causa da limitação de itens visíveis
- [x] Verificar altura do container

### 14.2 Correção
- [x] Ajustar altura do ScrollArea para exibir todos os itens
- [x] Garantir que a barra de rolagem apareça corretamente
- [x] Testar com os 73 mercados completos

### 14.3 Validação
- [x] Testar rolagem em todas as páginas (Mercados/Clientes/Concorrentes/Leads)
- [x] Verificar responsividade mobile
- [x] Criar checkpoint da correção


## Fase 15: Melhorias de UX - Navegação e Scroll 🚧

### 15.1 Indicador Visual de Scroll
- [x] Adicionar contador "Exibindo X-Y de Z itens" no header da lista
- [x] Calcular itens visíveis dinamicamente
- [x] Atualizar contador ao rolar a lista
- [x] Estilizar de forma discreta e informativa

### 15.2 Scroll Automático ao Selecionar
- [x] Implementar scroll para o topo ao selecionar mercado
- [x] Implementar scroll para o topo ao avançar/voltar páginas
- [x] Adicionar animação suave de scroll
- [x] Testar em todas as transições de página

### 15.3 Botão "Voltar ao Topo"
- [x] Criar botão flutuante no canto inferior direito
- [x] Mostrar botão apenas após rolar 200px
- [x] Adicionar animação de fade in/out
- [x] Implementar scroll suave ao clicar
- [x] Estilizar com glassmorphism consistente

### 15.4 Finalização
- [x] Testar todas as melhorias
- [x] Validar responsividade
- [x] Criar checkpoint das melhorias de UX


## Fase 16: Quick Wins - Melhorias de Alto Impacto 🚀

### 16.1 Performance - Índices no Banco de Dados
- [x] Criar índice para clientes_mercados(mercadoId)
- [x] Criar índice para concorrentes(mercadoId)
- [x] Criar índice para leads(mercadoId)
- [x] Criar índice para clientes(validationStatus)
- [x] Criar índice para clientes(cnpj)
- [x] Testar impacto nas queries

### 16.2 Performance - Cache de Queries
- [x] Configurar staleTime no tRPC client
- [x] Configurar gcTime no tRPC client
- [x] Testar navegação com cache ativo

### 16.3 Qualidade - Score Visual
- [x] Criar função calculateQualityScore()
- [x] Adicionar badge de score nos cards
- [x] Adicionar cores por classificação (Verde/Amarelo/Vermelho)
- [x] Sistema de classificação (Excelente/Bom/Regular/Ruim)

### 16.4 Navegação - Breadcrumbs
- [x] Criar componente Breadcrumbs
- [x] Integrar no CascadeView
- [x] Adicionar navegação clicável
- [x] Estilizar consistentemente

### 16.5 Validação - CNPJ
- [x] Criar função isValidCNPJFormat()
- [x] Adicionar validação visual nos cards
- [x] Adicionar ícone de alerta para CNPJs inválidos
- [x] Tooltip explicativo

### 16.6 Finalização
- [x] Testar todas as melhorias
- [x] Validar funcionamento
- [x] Criar checkpoint dos Quick Wins
- [x] Documentar resultados


## Fase 17: Paginação Server-Side 📄

### 17.1 Backend - Routers
- [ ] Adicionar parâmetros page e pageSize aos routers de clientes
- [ ] Adicionar parâmetros page e pageSize aos routers de concorrentes
- [ ] Adicionar parâmetros page e pageSize aos routers de leads
- [ ] Retornar metadata (total, totalPages, currentPage)

### 17.2 Backend - Database
- [ ] Criar função getClientesByMercadoPaginated()
- [ ] Criar função getConcorrentesByMercadoPaginated()
- [ ] Criar função getLeadsByMercadoPaginated()
- [ ] Otimizar queries com LIMIT e OFFSET

### 17.3 Frontend - UI
- [ ] Criar componente Pagination
- [ ] Adicionar controles de paginação no CascadeView
- [ ] Implementar navegação entre páginas
- [ ] Mostrar "Exibindo X-Y de Z itens"

### 17.4 Testes
- [ ] Testar paginação com datasets grandes
- [ ] Validar performance
- [ ] Criar checkpoint

---

## Fase 18: Sistema de Favoritos ⭐

### 18.1 Database Schema
- [ ] Criar tabela favoritos
- [ ] Adicionar índices (userId, entityType, entityId)
- [ ] Executar migration

### 18.2 Backend
- [ ] Criar router favoritos.add
- [ ] Criar router favoritos.remove
- [ ] Criar router favoritos.list
- [ ] Criar router favoritos.updateTags
- [ ] Criar funções no db.ts

### 18.3 Frontend
- [ ] Criar componente FavoriteButton
- [ ] Adicionar botão de estrela nos cards
- [ ] Criar modal de tags
- [ ] Implementar filtro "Apenas Favoritos"
- [ ] Criar página "Meus Favoritos"

### 18.4 Testes
- [ ] Testar adicionar/remover favoritos
- [ ] Testar tags customizáveis
- [ ] Validar persistência
- [ ] Criar checkpoint

---

## Fase 19: Enriquecimento Automático 🤖

### 19.1 API Integration
- [ ] Pesquisar API pública da Receita Federal
- [ ] Criar função fetchReceitaFederal()
- [ ] Implementar rate limiting
- [ ] Tratamento de erros

### 19.2 Backend
- [ ] Criar router enriquecimento.enrichCliente
- [ ] Criar router enriquecimento.enrichBatch
- [ ] Validar e normalizar dados retornados
- [ ] Atualizar registro no banco

### 19.3 Frontend
- [ ] Criar botão "Enriquecer Dados" nos cards
- [ ] Criar modal de confirmação
- [ ] Mostrar loading durante enriquecimento
- [ ] Exibir diff (antes/depois)
- [ ] Implementar enriquecimento em lote

### 19.4 Testes
- [ ] Testar enriquecimento individual
- [ ] Testar enriquecimento em lote
- [ ] Validar dados retornados
- [ ] Criar checkpoint

---

## Fase 20: Polimento Visual e UX Moderna 🎨

### 20.1 Proposta de Polimento
- [ ] Analisar tendências de design moderno
- [ ] Criar documento de proposta detalhado
- [ ] Definir paleta de cores refinada
- [ ] Especificar animações e transições
- [ ] Listar melhorias de micro-interações

### 20.2 Implementação Prioritária
- [ ] Aplicar melhorias de maior impacto
- [ ] Refinar tipografia e espaçamento
- [ ] Adicionar animações suaves
- [ ] Melhorar feedback visual
- [ ] Polir responsividade mobile

### 20.3 Testes e Validação
- [ ] Testar em diferentes resoluções
- [ ] Validar acessibilidade
- [ ] Verificar performance de animações
- [ ] Criar checkpoint final


## Fase 17: Polimento Visual e UX Moderna 🎨

### 17.1 Proposta Criada
- [x] Analisar estado atual e oportunidades
- [x] Documentar 9 níveis de melhorias
- [x] Criar roadmap de implementação
- [x] Definir métricas de sucesso

### 17.2 Quick Wins Implementados
- [x] Escala tipográfica refinada (ratio 1.25)
- [x] Sistema de espaçamento consistente (base 4px)
- [x] Focus visible aprimorado (outline + offset)
- [x] Hover states aprimorados (transform + box-shadow)
- [x] Componente EmptyState criado

### 17.3 Correções Técnicas
- [x] Corrigir erros de TypeScript em MercadoDetalhes
- [x] Adicionar verificações Array.isArray()
- [x] Garantir compatibilidade com dados paginados

### 17.4 Finalização
- [x] Testar melhorias visuais no navegador
- [x] Validar acessibilidade (focus visible)
- [x] Criar checkpoint final
- [x] Entregar documentação completa


## Fase 18: Animações e Fluidez ✨

### 18.1 Instalação e Configuração
- [x] Instalar framer-motion
- [x] Configurar AnimatePresence global
- [x] Criar variantes de animação reutilizáveis

### 18.2 Transições de Página
- [x] Adicionar AnimatePresence no CascadeView
- [x] Implementar fade + slide nas transições
- [x] Configurar timing (0.3s ease-in-out)
- [x] Testar navegação Mercados → Clientes → Concorrentes

### 18.3 Stagger Animations
- [x] Criar variantes de lista (staggerChildren)
- [x] Aplicar em lista de mercados
- [ ] Aplicar em lista de clientes (roadmap futuro)
- [ ] Aplicar em lista de concorrentes/leads (roadmap futuro)
- [x] Ajustar delay (0.05s entre itens)

### 18.4 Skeleton Loading (Roadmap Futuro)
- [ ] Criar SkeletonCard component
- [ ] Criar SkeletonList component
- [ ] Substituir spinners por skeletons
- [ ] Adicionar animação de pulse

### 18.5 Ripple Effect (Roadmap Futuro)
- [ ] Criar RippleButton component
- [ ] Implementar lógica de ripple
- [ ] Adicionar animação CSS (@keyframes)
- [ ] Aplicar em botões principais

### 18.6 Toast Notifications (Roadmap Futuro)
- [ ] Configurar Sonner com ícones
- [ ] Adicionar ações (Desfazer, Tentar Novamente)
- [ ] Implementar toast.promise para operações async
- [ ] Customizar duração e posição

### 18.7 Testes e Validação
- [x] Testar performance das animações
- [x] Validar em diferentes navegadores
- [x] Verificar acessibilidade (prefers-reduced-motion)
- [x] Criar checkpoint


## Fase 19: Skeleton Loading 💀

### 19.1 Componentes
- [x] Criar SkeletonCard component
- [x] Criar SkeletonList component
- [x] Adicionar animação pulse
- [x] Criar variantes por tipo (mercado, cliente, concorrente, lead)

### 19.2 Integração
- [x] Substituir spinner em mercados por skeleton
- [ ] Substituir spinner em clientes por skeleton (não aplicável - dados em cache)
- [ ] Substituir spinner em concorrentes por skeleton (não aplicável - dados em cache)
- [ ] Substituir spinner em leads por skeleton (não aplicável - dados em cache)

## Fase 20: Atalhos de Teclado ⌨️

### 20.1 Atalhos Globais
- [ ] Implementar Ctrl+K para busca rápida (roadmap futuro)
- [ ] Implementar Esc para fechar modals/popups (roadmap futuro)
- [ ] Implementar / para focar na busca (roadmap futuro)
- [x] Criar hook useKeyboardShortcuts

### 20.2 Navegação por Lista
- [ ] Setas ↑↓ para navegar entre itens
- [ ] Enter para abrir detalhes
- [ ] Espaço para marcar checkbox
- [ ] Setas ←→ para mudar de página

### 20.3 Indicadores Visuais
- [ ] Adicionar tooltips com atalhos
- [ ] Criar modal de ajuda (? ou Ctrl+/)
- [ ] Highlight do item selecionado por teclado

## Fase 21: Dashboard de Progresso 📊

### 21.1 Backend
- [ ] Criar rota analytics.getProgress
- [ ] Calcular % validação por mercado
- [ ] Calcular timeline de trabalho
- [ ] Calcular metas diárias

### 21.2 Frontend
- [ ] Criar página Dashboard
- [ ] Gráfico de pizza (status de validação)
- [ ] Gráfico de barras (validação por mercado)
- [ ] Timeline de progresso
- [ ] Cards de KPIs principais

### 21.3 Navegação
- [ ] Adicionar link no sidebar
- [ ] Adicionar rota /dashboard
- [ ] Breadcrumbs

## Fase 22: Acessibilidade (Fase 3 do Roadmap) ♿

### 22.1 ARIA Labels e Roles
- [ ] Adicionar role="navigation" no sidebar
- [ ] Adicionar aria-label em botões sem texto
- [ ] Adicionar aria-current em navegação ativa
- [ ] Adicionar aria-live para notificações

### 22.2 Focus Management
- [ ] Garantir focus visible em todos os elementos
- [ ] Implementar focus trap em modals
- [ ] Skip to content link
- [ ] Restaurar focus ao fechar modals

### 22.3 Testes
- [ ] Testar com screen reader (NVDA/JAWS)
- [ ] Validar contraste de cores (WCAG AA)
- [ ] Testar navegação apenas por teclado
- [ ] Criar checkpoint final


## Fase 23: Implementação Final - Dashboard + Atalhos + Paginação 🚀

### 23.1 Backend Analytics
- [x] Criar rota analytics.getProgress
- [x] Calcular estatísticas de validação
- [x] Calcular progresso por mercado
- [x] Otimizar queries com índices

### 23.2 Dashboard Frontend
- [x] Instalar recharts
- [x] Melhorar página Dashboard existente
- [x] Gráfico de pizza (status validação)
- [x] Gráfico de barras (entidades por tipo)
- [x] Cards de KPIs (já existiam)
- [x] Rota /dashboard (já existia)

### 23.3 Atalhos de Teclado
- [x] Integrar useKeyboardShortcuts no CascadeView
- [x] Implementar Ctrl+K para busca
- [x] Implementar / para busca
- [x] Implementar Escape para fechar modals
- [ ] Implementar setas para navegação (roadmap futuro)
- [ ] Implementar Enter para abrir (roadmap futuro)
- [ ] Implementar Espaço para checkbox (roadmap futuro)
- [x] Adicionar hint no placeholder

### 23.4 Paginação Server-Side (Roadmap Futuro)
- [ ] Atualizar routers com paginação
- [ ] Atualizar db.ts com limit/offset
- [ ] Atualizar frontend para usar paginação
- [ ] Adicionar controles de paginação na UI

### 23.5 Finalização
- [x] Testar todas as funcionalidades
- [x] Validar performance
- [x] Criar checkpoint final


## Fase 24: Funcionalidades Finais - Paginação + Favoritos + Exportação 🚀

### 24.1 Paginação Server-Side (Roadmap Futuro)
- [ ] Verificar routers já preparados (byMercado com page/pageSize)
- [ ] Atualizar CascadeView para usar paginação corretamente
- [ ] Adicionar controles de paginação na UI (Anterior/Próximo)
- [ ] Testar com datasets grandes

### 24.2 Sistema de Favoritos (Roadmap Futuro)
- [ ] Criar tabela favoritos no schema
- [ ] Adicionar routers favoritos (add, remove, list)
- [ ] Adicionar funções no db.ts
- [ ] Criar componente de botão favorito (estrela)
- [ ] Integrar no CascadeView
- [ ] Adicionar filtro "Favoritos"

### 24.3 Exportação Avançada (Roadmap Futuro)
- [ ] Instalar biblioteca para Excel (xlsx)
- [ ] Criar função exportToExcel com formatação
- [ ] Criar função exportToPDF com relatório formatado
- [ ] Adicionar botões de exportação no Dashboard
- [ ] Testar exportações

### 24.4 Correção de Bugs
- [x] Corrigir erro de JSX no CascadeView (motion.div)
- [x] Validar funcionamento

### 24.5 Finalização
- [x] Testar todas as funcionalidades
- [x] Validar performance
- [x] Criar checkpoint final


## Fase 25: Correção de Layout e Responsividade 🎨

### 25.1 Investigação
- [x] Identificar elementos com overflow horizontal
- [x] Verificar larguras fixas que causam problemas
- [x] Analisar scroll desnecessário
- [x] Verificar centralização inadequada

### 25.2 Correções
- [x] Corrigir overflow horizontal (não havia)
- [x] Ajustar Dashboard para h-screen overflow-hidden
- [x] Reduzir padding do header (py-6 → py-3)
- [x] Reduzir padding do CascadeView header (py-4 → py-2)
- [x] Reduzir gap dos cards (gap-3 → gap-2, mb-6 → mb-4)
- [x] Garantir que tudo rode em uma única página (100vh)

### 25.3 Testes
- [x] Testar em diferentes resoluções
- [x] Validar responsividade
- [x] Criar checkpoint


## Fase 26: Ajustes Finais de UX 🎯

### 26.1 Modo Compacto Toggle
- [ ] Criar contexto CompactModeContext
- [ ] Adicionar botão toggle no header
- [ ] Aplicar espaçamentos reduzidos quando ativo
- [ ] Persistir preferência no localStorage

### 26.2 Zoom Customizável
- [ ] Criar contexto ZoomContext
- [ ] Adicionar controles de zoom (80%, 90%, 100%, 110%)
- [ ] Aplicar font-size no root
- [ ] Persistir preferência no localStorage

### 26.3 Exportação com Filtros
- [ ] Atualizar função exportToCSV para aceitar dados filtrados
- [ ] Passar dados visíveis (após filtros/busca) para exportação
- [ ] Testar exportação filtrada

### 26.4 Plano de Roadmap
- [ ] Criar documento PLANO_IMPLEMENTACAO_ROADMAP.md
- [ ] Organizar todas as funcionalidades em fases
- [ ] Adicionar estimativas de tempo por fase
- [ ] Incluir dependências e priorização

### 26.5 Finalização
- [ ] Testar todas as funcionalidades
- [ ] Criar checkpoint final


## Fase 27: Padronização de Layout e Fontes 🎨

### 27.1 Análise de Diferenças
- [ ] Comparar layout atual com imagem de referência
- [ ] Identificar diferenças de tamanho de fonte
- [ ] Identificar diferenças de espaçamento
- [ ] Identificar diferenças de ícones e badges

### 27.2 Ajustes de Layout
- [ ] Reduzir altura das linhas (mais compacto)
- [ ] Ajustar tamanho de fonte (menor e mais discreta)
- [ ] Reduzir tamanho dos badges
- [ ] Ajustar espaçamento entre elementos
- [ ] Garantir alinhamento consistente

### 27.3 Finalização
- [x] Testar em todas as páginas
- [x] Validar consistência visual
- [ ] Criar checkpoint

## Fase 28: Padronização de Tamanhos de Texto 📝

### 28.1 Identificação
- [x] Verificar tamanho de texto em cards de mercados
- [x] Verificar tamanho de texto em cards de clientes
- [x] Verificar tamanho de texto em cards de concorrentes
- [x] Verificar tamanho de texto em cards de leads

### 28.2 Padronização
- [x] Definir tamanho padrão de título (text-base para melhor legibilidade)
- [x] Definir tamanho padrão de descrição (text-sm)
- [x] Aplicar em todos os cards de clientes
- [x] Aplicar em todos os cards de concorrentes
- [x] Aplicar em todos os cards de leads
- [x] Reduzir padding de p-4 para p-3
- [x] Reduzir tamanho de badges (text-[11px] px-2 py-0.5)
- [x] Garantir consistência com cards de mercados

### 28.3 Finalização
- [x] Testar legibilidade em todas as páginas
- [x] Validar consistência visual
- [x] Criar checkpoint


## Fase 29: Implementação do Roadmap - Fase 1 e 2 (Q1 2026) 🚀

### 29.1 Sistema de Tags Customizáveis (20h) ✅ CONCLUÍDO
- [x] Criar tabela `tags` no schema
- [x] Criar tabela `entity_tags` (junction table)
- [x] Adicionar routers tRPC para tags (list, create, delete, getEntityTags, addToEntity, removeFromEntity, getEntitiesByTag)
- [x] Adicionar funções no db.ts (getAllTags, createTag, deleteTag, getEntityTags, addTagToEntity, removeTagFromEntity, getEntitiesByTag)
- [x] Criar componente TagManager.tsx (dialog com CRUD + seletor de cores)
- [x] Criar componente TagPicker.tsx (popover para adicionar/remover tags)
- [x] Criar componente TagBadge.tsx (badge visual com cor customizada)
- [x] Criar componente TagFilter.tsx (filtro multi-seleção)
- [x] Criar componente EntityTagPicker.tsx (wrapper que carrega tags dinamicamente)
- [x] Integrar tags no CascadeView (TagManager no header, EntityTagPicker em todos os cards)
- [x] Adicionar filtro multi-tag no sidebar
- [x] Implementar lógica de filtragem por tags (queries + useMemo)
- [x] Testar CRUD de tags

### 29.2 Paginação Server-Side (8h)
- [ ] Atualizar routers com page/pageSize
- [ ] Atualizar funções db.ts com limit/offset
- [ ] Retornar { data, total, page, pageSize, totalPages }
- [ ] Atualizar CascadeView para usar paginação
- [ ] Criar componente Pagination.tsx
- [ ] Testar com datasets grandes

### 29.3 Audit Log (18h)
- [ ] Criar tabela `audit_logs` no schema
- [ ] Criar middleware de auditoria
- [ ] Registrar INSERT/UPDATE/DELETE automaticamente
- [ ] Adicionar routers para visualizar logs
- [ ] Criar página AuditLog.tsx
- [ ] Filtrar logs por entidade/usuário/data
- [ ] Testar rastreabilidade

### 29.4 Exportação Avançada (12h)
- [ ] Instalar biblioteca xlsx
- [ ] Criar função exportToExcel com formatação
- [ ] Criar função exportToPDF
- [ ] Integrar Google Sheets API
- [ ] Adicionar botões de exportação no Dashboard
- [ ] Testar exportações

### 29.5 Modo Compacto + Zoom (6h)
- [ ] Integrar CompactModeContext já criado
- [ ] Integrar ZoomContext já criado
- [ ] Criar botão toggle no header
- [ ] Criar controles de zoom (80%, 90%, 100%, 110%)
- [ ] Testar em diferentes densidades

### 29.6 Validação de Email (4h)
- [ ] Criar função isValidEmail()
- [ ] Adicionar validação visual nos cards
- [ ] Adicionar ícone de alerta para emails inválidos
- [ ] Adicionar tooltip explicativo

### 29.7 Filtros Salvos (12h)
- [ ] Criar tabela `saved_filters` no schema
- [ ] Adicionar routers para salvar/carregar filtros
- [ ] Criar componente SavedFilters.tsx
- [ ] Permitir nomear e salvar combinações de filtros
- [ ] Adicionar dropdown de filtros salvos
- [ ] Testar persistência

### 29.8 Finalização
- [ ] Testar todas as funcionalidades
- [ ] Validar integração entre componentes
- [ ] Criar checkpoint da Fase 1 e 2


## Fase 30: Melhorias de Visibilidade do Filtro de Tags 🔧

### 30.1 Ajustes de UX
- [x] Sempre exibir seção "TAGS" no sidebar (mesmo sem tags criadas)
- [x] Mover seção Tags para cima no sidebar (após Busca Global)
- [x] Melhorar feedback visual

## Fase 31: Filtros Avançados de Qualificação 🎯

### 31.1 Componente Base ✅ CONCLUÍDO
- [x] Criar componente MultiSelectFilter reutilizável
- [x] Adicionar suporte a checkboxes múltiplos
- [x] Implementar contador de seleções
- [x] Adicionar botão "Limpar filtros"

### 31.2 Filtros por Entidade ✅ CONCLUÍDO
- [x] Filtro de Clientes (Segmentação, UF)
- [x] Filtro de Concorrentes (Porte)
- [x] Filtro de Leads (Tipo, Porte)

### 31.3 Integração ✅ CONCLUÍDO
- [x] Adicionar estados de filtro no CascadeView
- [x] Implementar lógica de filtragem nos useMemo
- [x] Combinar com filtros existentes (status, tags, busca)
- [x] Adicionar indicador visual de filtros ativos (contador + badges)

### 31.4 Testes
- [ ] Testar filtros individuais
- [ ] Testar combinação de múltiplos filtros
- [ ] Validar performance
- [ ] Criar checkpoint


## Fase 32: Correção - Filtros Avançados para Mercados 🔧 ✅ CONCLUÍDO

### 32.1 Implementação
- [x] Adicionar filtros de Segmentação na página de Mercados
- [x] Implementar lógica de filtragem em filteredMercados
- [x] Testar funcionamento


## Fase 33: Busca Global Avançada com Seletor Multi-Campo 🔍

### 33.1 Componente de Seleção ✅ CONCLUÍDO
- [x] Criar componente SearchFieldSelector
- [x] Adicionar checkboxes para campos (Nome, CNPJ, Produto, Cidade, UF, Email, Telefone, Observações)
- [x] Implementar botão de configuração (⚙️) ao lado do campo de busca
- [x] Adicionar popover com opções de campos
- [x] Adicionar botões "Todos" e "Limpar"
- [x] Mostrar contador de campos selecionados no badge

### 33.2 Estado e Lógica ✅ CONCLUÍDO
- [x] Adicionar estado searchFields no CascadeView (padrão: nome, cnpj, produto)
- [x] Criar função matchesSearch com lógica multi-campo
- [x] Implementar lógica de busca multi-campo em filteredMercados
- [x] Implementar lógica de busca multi-campo em filteredClientes
- [x] Implementar lógica de busca multi-campo em filteredConcorrentes
- [x] Implementar lógica de busca multi-campo em filteredLeads

### 33.3 Interface ✅ CONCLUÍDO
- [x] Integrar SearchFieldSelector no header de busca
- [x] Adicionar badges mostrando campos selecionados
- [x] Implementar preview de campos ativos
- [x] Testar busca em múltiplos campos
- [x] Criar checkpoint


## Fase 34: Exportação Inteligente 📤 (Sprint 1)

### 34.1 Atualização da Função de Exportação ✅ CONCLUÍDO
- [x] Modificar função exportToCSV para aceitar dados filtrados (já estava usando filteredX)
- [x] Adicionar suporte para exportar mercados
- [x] Adicionar nome do arquivo com timestamp (formato: entityType_YYYY-MM-DDTHH-MM-SS.csv)
- [x] Adicionar contador "Exportando X de Y itens (filtros aplicados)" no toast
- [x] Detectar automaticamente se filtros estão ativos
- [x] Remover condição que ocultava botão na página de mercados

### 34.2 Testes e Validação
- [x] Testar exportação com busca ativa
- [x] Testar exportação com tags selecionadas
- [x] Testar exportação com filtros avançados ativos
- [x] Testar exportação com status filter ativo
- [x] Testar exportação com múltiplos filtros combinados
- [x] Criar checkpoint


## Fase 34.5: Reorganização de Layout - Filtros Horizontais 🎨

### 34.5.1 Reestruturação ✅ CONCLUÍDO
- [x] Mover Busca Global do sidebar para header horizontal
- [x] Mover Filtro de Tags do sidebar para header horizontal
- [x] Mover Filtros Avançados do sidebar para header horizontal
- [x] Mover Filtro de Status para header horizontal
- [x] Organizar em linha única abaixo do título
- [x] Criar barra de filtros com fundo bg-slate-900/50

### 34.5.2 Ajustes de Layout
- [x] Manter sidebar apenas com Estatísticas e Mercado Atual
- [x] Ajustar espaçamento entre filtros (gap-4)
- [x] Usar flex-wrap para responsividade
- [x] Testar com múltiplos filtros ativos
- [x] Criar checkpoint


## Fase 36: Filtros Salvos 💾 (Sprint 2)

### 36.1 Backend - Schema e Database ✅ CONCLUÍDO
- [x] Criar tabela `saved_filters` no schema (id, userId, name, filtersJson, createdAt)
- [x] Adicionar FK para users com cascade delete
- [x] Executar db:push

### 36.2 Backend - Routers e Funções ✅ CONCLUÍDO
- [x] Criar router savedFilters.list (listar filtros do usuário)
- [x] Criar router savedFilters.create (salvar novo filtro)
- [x] Criar router savedFilters.delete (deletar filtro)
- [x] Adicionar funções no db.ts (getSavedFilters, createSavedFilter, deleteSavedFilter)

### 36.3 Frontend - Componentes ✅ CONCLUÍDO
- [x] Criar componente SavedFilters.tsx (dropdown com lista)
- [x] Criar componente SaveFilterDialog.tsx (modal para salvar)
- [x] Adicionar botão "Salvar Filtros" na barra de filtros
- [x] Adicionar dropdown "Filtros Salvos" na barra de filtros

### 36.4 Frontend - Lógica ✅ CONCLUÍDO
- [x] Serializar estado de filtros (searchQuery, searchFields, selectedTagIds, filtros avançados, statusFilter)
- [x] Implementar função applyFilter (deserializar e aplicar todos os filtros)
- [x] Implementar toast de confirmação

### 36.5 Testes ✅ CONCLUÍDO
- [x] Testar salvar filtro com múltiplos critérios
- [x] Testar listar filtros salvos
- [x] Testar parsear filtersJson corretamente
- [x] Testar deletar filtro
- [x] Testar retornar array vazio para usuário sem filtros
- [x] Criar checkpoint


## Fase 38: Dashboard Avançado 📊 (Sprint 3)

### 38.1 Backend - Queries de Analytics ✅ CONCLUÍDO
- [x] Criar função getDistribuicaoGeografica (count por UF)
- [x] Criar função getDistribuicaoSegmentacao (count por B2B/B2C/Ambos)
- [x] Criar função getTimelineValidacoes (validações por data com parâmetro days)
- [x] Criar função getFunilConversao (leads → clientes → validados)
- [x] Criar função getTop10Mercados (por quantidade de clientes)
- [x] Adicionar 5 procedures no router dashboard

### 38.2 Frontend - Instalação de Dependências ✅ CONCLUÍDO
- [x] Instalar recharts para gráficos

### 38.3 Frontend - Componentes de Gráficos ✅ CONCLUÍDO
- [x] Criar DistribuicaoGeograficaChart (BarChart) - integrado em DashboardPage
- [x] Criar DistribuicaoSegmentacaoChart (PieChart) - integrado em DashboardPage
- [x] Criar TimelineValidacoesChart (LineChart) - integrado em DashboardPage
- [x] Criar FunilConversaoChart (BarChart horizontal) - integrado em DashboardPage
- [x] Criar Top10MercadosChart (BarChart horizontal) - integrado em DashboardPage

### 38.4 Frontend - Página de Dashboard ✅ CONCLUÍDO
- [x] Criar página DashboardPage.tsx com 5 gráficos
- [x] Adicionar grid layout responsivo (1 col mobile, 2 cols desktop)
- [x] Adicionar 3 KPI cards (Leads, Clientes, Validados)
- [x] Adicionar filtros de período (7/30/90 dias)
- [x] Adicionar botão de refresh para todos os gráficos
- [x] Adicionar rota /dashboard-avancado no App.tsx

### 38.5 Testes ✅ CONCLUÍDO
- [x] Testar queries de analytics (6/6 testes passando)
- [x] Testar renderização de gráficos (validado visualmente)
- [x] Testar responsividade (grid layout adaptativo)
- [x] Criar checkpoint


## Fase 39: Exportação Avançada 📄 (Sprint 3)

### 39.1 Instalação de Dependências ✅ CONCLUÍDO
- [x] Instalar xlsx (SheetJS) para exportação Excel
- [x] Instalar jspdf e jspdf-autotable para exportação PDF

### 39.2 Funções de Exportação ✅ CONCLUÍDO
- [x] Criar função exportToExcel (formatação, largura de colunas, metadados)
- [x] Criar função exportToPDF (cabeçalho, tabelas formatadas com autoTable)
- [x] Criar função exportToCSV (manter compatibilidade)
- [x] Adicionar metadados (data de geração, filtros aplicados, total de registros)
- [x] Criar arquivo exportUtils.ts com 3 funções

### 39.3 Interface de Usuário ✅ CONCLUÍDO
- [x] Substituir botão "Exportar Filtrados" por DropdownMenu
- [x] Adicionar 3 opções: CSV, Excel (.xlsx), PDF
- [x] Adicionar ícones para cada formato (FileText, FileSpreadsheet, FileDown)
- [x] Refatorar handleExportFiltered para aceitar parâmetro format
- [x] Criar função prepareExportData para serializar dados
- [x] Manter funcionalidade de respeitar filtros ativos

### 39.4 Testes ✅ CONCLUÍDO
- [x] Testar exportação Excel com dados reais (73 mercados exportados com sucesso)
- [x] Testar dropdown com 3 opções visíveis
- [x] Testar toast de confirmação
- [ ] Criar checkpoint
