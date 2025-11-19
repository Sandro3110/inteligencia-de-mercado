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
- [x] Criar checkpoint final


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
- [x] Criar checkpoint final


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
- [x] Criar checkpoint final


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
- [x] Criar checkpoint


## Fase 41: Modo Kanban para Leads 📊 (Sprint 4)

### 41.1 Backend - Schema e Database ✅ CONCLUÍDO
- [x] Adicionar campo `stage` na tabela `leads` (enum: novo, em_contato, negociacao, fechado, perdido)
- [x] Adicionar campo `stageUpdatedAt` para rastrear última movimentação
- [x] Executar db:push (migração 0005_light_xavin.sql criada)
- [x] Adicionar função updateLeadStage no db.ts
- [x] Adicionar função getLeadsByStage no db.ts

### 41.2 Backend - Routers ✅ CONCLUÍDO
- [x] Criar router leads.updateStage (publicProcedure com input id + stage)
- [x] Criar router leads.byStage (retornar leads por mercadoId)

### 41.3 Frontend - Instalação de Dependências ✅ CONCLUÍDO
- [x] Instalar @dnd-kit/core para drag & drop
- [x] Instalar @dnd-kit/sortable para ordenação
- [x] Instalar @dnd-kit/utilities para helpers

### 41.4 Frontend - Componentes Kanban ✅ CONCLUÍDO
- [x] Criar componente KanbanBoard.tsx (container principal com DndContext)
- [x] Criar KanbanColumn integrado (coluna com contador e useDroppable)
- [x] Criar KanbanCard integrado (card de lead arrastável com useDraggable)
- [x] Adicionar botão de alternância Lista/Kanban no CascadeView (LayoutList/LayoutGrid)

### 41.5 Frontend - Lógica de Drag & Drop ✅ CONCLUÍDO
- [x] Implementar DndContext com PointerSensor (distance: 8)
- [x] Implementar handleDragEnd para atualizar stage via mutation
- [x] Adicionar feedback visual durante drag (DragOverlay)
- [x] Implementar toast de confirmação após mover (success/error)

### 41.6 Integração e Testes
- [x] Integrar KanbanBoard na página de Leads (renderização condicional)
- [x] Adicionar estado viewMode e botão de alternância
- [x] Passar filteredLeads para KanbanBoard (filtros funcionando)
- [x] Testar drag & drop entre colunas
- [x] Testar persistência de stage no banco
- [x] Criar checkpoint


## Fase 42: Melhorias de UX 🎨

### 42.1 Link para Dashboard ✅ CONCLUÍDO
- [x] Adicionar botão "Dashboard" no header principal
- [x] Adicionar ícone BarChart3
- [x] Usar Link do wouter para navegação

### 42.2 Botão Limpar Todos os Filtros ✅ CONCLUÍDO
- [x] Adicionar botão "Limpar Filtros" na barra de filtros (ao lado de Salvar Filtros)
- [x] Implementar função inline com onClick
- [x] Resetar: searchQuery, searchFields (padrão), selectedTagIds, filtros avançados, statusFilter ("all")
- [x] Adicionar toast de confirmação ("Todos os filtros foram limpos")
- [x] Adicionar ícone FilterX

### 42.3 Histórico de Buscas ✅ CONCLUÍDO
- [x] Adicionar localStorage para salvar últimas 10 buscas (STORAGE_KEY)
- [x] Criar componente SearchHistory dropdown com DropdownMenu
- [x] Adicionar botão de histórico ao lado do campo de busca (ícone History)
- [x] Implementar clique para aplicar busca salva (onSelectSearch)
- [x] Adicionar botão "Limpar Histórico" (com ícone Trash2)
- [x] Implementar função addToSearchHistory (salva ao pressionar Enter)
- [x] Adicionar toast de confirmação ao aplicar busca
- [x] Remover duplicatas automaticamente

### 42.4 Checkpoint
- [x] Testar todas as melhorias
- [x] Criar checkpoint


---

## Fase 42: Sistema Multi-Projetos 🏢

### 42.1 Schema e Migração
- [x] Adicionar tabela `projects` no schema
- [x] Adicionar coluna `projectId` em mercados_unicos
- [x] Adicionar coluna `projectId` em clientes
- [x] Adicionar coluna `projectId` em concorrentes
- [x] Adicionar coluna `projectId` em leads
- [x] Aplicar migração no banco de dados
- [x] Criar projeto "Embalagens" no banco
- [x] Associionar todos os dados existentes ao projeto "Embalagens"

### 42.2 Backend - Database
- [x] Criar funções CRUD para projetos (createProject, getProjects, etc.)
- [x] Atualizar getMercados para filtrar por projectId
- [x] Atualizar getAllClientes para filtrar por projectId
- [x] Atualizar getAllConcorrentes para filtrar por projectId
- [x] Atualizar getAllLeads para filtrar por projectId

### 42.3 Backend - Routers
- [x] Criar router projects (list, create, update, delete)
- [x] Atualizar mercados.list para aceitar projectId
- [x] Atualizar clientes.list para aceitar projectId
- [x] Atualizar concorrentes.list para aceitar projectId
- [x] Atualizar leads.list para aceitar projectId

### 42.4 Frontend - Componentes
- [x] Criar componente ProjectSelector
- [x] Criar hook useSelectedProject
- [ ] Criar modal de gerenciamento de projetos (futuro)
- [x] Adicionar ProjectSelector no header

### 42.5 Frontend - Integração
- [x] Atualizar CascadeView para usar projectId
- [x] Atualizar todas as queries para passar projectId
- [x] Implementar persistência do projeto selecionado (localStorage)
- [x] Adicionar feedback visual do projeto atual

### 42.6 Testes e Finalização
- [x] Escrever testes unitários
- [x] Testar troca entre projetos
- [x] Testar isolamento de dados entre projetos
- [x] Validar que dados "Embalagens" aparecem corretamente
- [x] Criar checkpoint final


---

## Fase 43: Fluxo Automatizado de Enriquecimento

### 43.1 Backend - Processamento
- [ ] Criar função de enriquecimento via CNPJ (Data API)
- [ ] Criar função de análise de mercado via LLM
- [ ] Criar função de identificação de concorrentes
- [ ] Criar função de geração de leads
- [ ] Criar orquestrador do fluxo completo
- [ ] Implementar sistema de fila para processamento assíncrono

### 43.2 Backend - Routers
- [ ] Criar endpoint para iniciar novo fluxo
- [ ] Criar endpoint para consultar status do processamento
- [ ] Criar endpoint para cancelar processamento
- [ ] Adicionar WebSocket para updates em tempo real

### 43.3 Frontend - Interface de Input
- [ ] Criar página de criação de novo projeto
- [ ] Implementar input de clientes (manual ou upload CSV)
- [ ] Adicionar validação de formato de dados
- [ ] Criar preview dos dados antes do processamento

### 43.4 Frontend - Monitoramento
- [ ] Criar dashboard de progresso do processamento
- [ ] Implementar barra de progresso com etapas
- [ ] Adicionar logs em tempo real
- [ ] Mostrar estatísticas do processamento

### 43.5 Testes e Documentação
- [ ] Testar fluxo completo com dados reais
- [ ] Criar documentação do fluxo
- [ ] Adicionar exemplos de uso
- [ ] Criar checkpoint final


---

## Fase 43: Fluxo Automatizado de Enriquecimento 🤖

### 43.1 Backend - Serviço de Enriquecimento
- [x] Criar server/enrichmentFlow.ts
- [x] Implementar identifyMarkets (LLM)
- [x] Implementar enrichClientes (Data API)
- [x] Implementar findCompetitors (simplificado)
- [x] Implementar findLeads (simplificado)
- [x] Adicionar callback de progresso

### 43.2 Backend - Router tRPC
- [x] Criar router enrichment.execute
- [x] Implementar validação de input
- [x] Adicionar tratamento de erros

### 43.3 Frontend - Interface
- [x] Criar página EnrichmentFlow.tsx
- [x] Adicionar formulário de input
- [x] Implementar exibição de progresso
- [x] Adicionar exibição de resultado
- [x] Adicionar rota /enrichment no App.tsx

### 43.4 Documentação
- [x] Criar FLUXO_ENRIQUECIMENTO.md
- [x] Documentar cada etapa do fluxo
- [x] Adicionar exemplos de uso
- [x] Criar diagrama do fluxo

### 43.5 Testes e Melhorias Futuras
- [ ] Testar fluxo completo com dados reais
- [ ] Implementar busca real de concorrentes (LLM + Data API)
- [ ] Implementar busca real de leads (LLM + Data API)
- [ ] Adicionar progresso em tempo real (WebSockets/SSE)
- [ ] Adicionar upload de planilha Excel/CSV
- [ ] Criar checkpoint final


---

## Fase 44: Melhorias do Fluxo de Enriquecimento 🚀

### 44.1 Busca Real de Concorrentes e Leads
- [x] Implementar findCompetitorsForMarkets com LLM
- [x] Integrar Data API para enriquecer concorrentes
- [x] Implementar findLeadsForMarkets com LLM
- [x] Integrar Data API para enriquecer leads
- [x] Adicionar validação e cálculo de ### 44.2 Upload de Planilha Excel/CSV
- [x] Adicionar biblioteca de leitura de Excel (xlsx)
- [x] Criar componente de upload de arquivo
- [x] Implementar mapeamento automático de colunas
- [x] Adicionar prévia dos dados importados
- [x] Validar formato do arquivoessamento

### 44.3 Progresso em Tempo Real
- [ ] Implementar Server-Sent Events (SSE)
- [ ] Criar endpoint /api/enrichment/stream
- [ ] Atualizar frontend para consumir SSE
- [ ] Adicionar barra de progresso detalhada
- [ ] Mostrar cada etapa sendo executada

### 44.4 Botão na Página Principal
- [ ] Adicionar botão "Novo Projeto" no CascadeView
- [ ] Estilizar botão consistentemente
- [ ] Implementar navegação para /enrichment
- [ ] Testar fluxo completo
- [ ] Criar checkpoint final


---

## Fase 45: Melhorias Avançadas do Sistema de Enriquecimento 🚧

### 45.1 Correção de Erros TypeScript
- [x] Corrigir erro de schema no Drizzle (campo 'porte' não existe em clientes)
- [x] Validar tipos em enrichmentFlow.ts
- [x] Executar build sem erros

### 45.2 Sistema de Progresso em Tempo Real
- [x] Implementar simulação de progresso (preparado para WebSocket/SSE)
- [x] Criar componente ProgressBar com etapas visuais
- [x] Atualizar UI conforme progresso do backend
- [x] Mostrar mensagens de cada etapa (ex: "Identificando mercados 1/5")
- [x] Adicionar indicador de progresso por etapa
- [ ] Implementar cancelamento de processo (futuro)

### 45.3 Interface de Validação Manual Pós-Enriquecimento
- [x] Criar página de revisão de resultados
- [x] Exibir mercados identificados com opção aprovar/rejeitar
- [x] Exibir concorrentes encontrados com opção aprovar/rejeitar
- [x] Exibir leads encontrados com opção aprovar/rejeitar
- [x] Implementar edição inline de dados antes de salvar
- [x] Adicionar botão "Salvar Projeto" após revisão
- [x] Implementar descarte de itens indesejados
- [ ] Adicionar mutations de update/delete no backend (futuro)

### 45.4 Templates de Projetos
- [ ] Criar tabela project_templates no banco
- [ ] Implementar CRUD de templates
- [ ] Salvar configurações de enriquecimento como template
- [ ] Carregar template ao criar novo projeto
- [ ] Adicionar templates predefinidos (B2B, B2C, etc.)

### 45.5 Melhorias de Performance
- [ ] Implementar cache de respostas da LLM
- [ ] Otimizar queries de busca de concorrentes
- [ ] Adicionar retry automático em caso de falha de API
- [ ] Implementar rate limiting para APIs externas
- [ ] Adicionar logs detalhados de cada etapa

### 45.6 Testes e Validação
- [ ] Testar fluxo completo com dados reais
- [ ] Validar upload de Excel/CSV com diferentes formatos
- [ ] Testar busca de concorrentes via LLM
- [ ] Testar busca de leads via LLM
- [ ] Validar cancelamento de processo
- [ ] Criar checkpoint final



---

## Fase 46: Implementação Completa de CRUD e Templates 🚧

### 46.1 Mutations de Update e Delete no Backend
- [x] Criar mutation mercados.update com validação Zod
- [x] Criar mutation mercados.delete com cascade
- [x] Criar mutation clientes.update com validação Zod
- [x] Criar mutation clientes.delete
- [x] Criar mutation concorrentes.update com validação Zod
- [x] Criar mutation concorrentes.delete
- [x] Criar mutation leads.update com validação Zod
- [x] Criar mutation leads.delete
- [x] Adicionar funções no db.ts para update/delete
- [x] Adicionar queries byProject para todas as entidades
- [ ] Testar mutations com vitest

### 46.2 Server-Sent Events (SSE) para Progresso em Tempo Real
- [x] Criar endpoint SSE /api/enrichment/progress/:jobId
- [x] Implementar sistema de jobs com IDs únicos (jobManager)
- [x] Emitir eventos de progresso durante enriquecimento
- [x] Atualizar enrichmentFlow.ts para emitir eventos
- [x] Criar hook useEnrichmentProgress no frontend
- [x] Conectar EnrichmentProgress ao SSE
- [x] Implementar reconexão automática (EventSource nativo)
- [x] Adicionar cleanup ao desmontar componente

### 46.3 Sistema de Templates de Projeto
- [x] Criar tabela project_templates no schema
- [x] Adicionar campos: name, description, config (JSON)
- [x] Implementar funções CRUD no db.ts
- [x] Criar router tRPC templates (list, create, update, delete)
- [x] Criar componente TemplateSelector
- [x] Adicionar opção "Usar Template" ao criar novo projeto
- [x] Implementar templates predefinidos (B2B, B2C, Misto)
- [ ] Adicionar opção "Salvar como Template" (futuro)
- [ ] Testar criação de projeto a partir de template

### 46.4 Testes e Validação
- [x] Verificar status do projeto (sem erros TypeScript)
- [x] Validar integração de todos os componentes
- [x] Confirmar servidor rodando corretamente
- [ ] Testar mutations de update/delete (manual)
- [ ] Testar SSE em tempo real (manual)
- [ ] Testar templates de projeto (manual)
- [x] Criar checkpoint final



---

## Fase 47: Busca e Filtros Avançados 🚧

### 47.1 Backend - Sistema de Filtros
- [x] Criar tipo FilterCriteria com operadores (eq, ne, gt, lt, contains, in)
- [x] Implementar função buildDynamicQuery no queryBuilder.ts
- [x] Adicionar suporte a filtros combinados (AND/OR)
- [x] Criar endpoint de busca avançada para leads
- [x] Implementar paginação com offset/limit
- [ ] Adicionar endpoints para outras entidades (mercados, clientes, concorrentes)

### 47.2 Frontend - Interface de Filtros
- [x] Criar componente AdvancedFilterBuilder
- [x] Implementar seletor de campos dinâmico
- [x] Adicionar operadores por tipo de campo (texto, número, data)
- [x] Criar UI para adicionar/remover condições e grupos
- [x] Implementar operação lógica (AND/OR) entre grupos
- [ ] Integrar com página de leads
- [ ] Implementar preview de resultados em tempo real

### 47.3 Salvamento e Exportação
- [ ] Adicionar botão "Salvar Filtro" com nome customizado
- [ ] Criar dropdown de filtros salvos
- [ ] Implementar exportação para CSV/Excel
- [ ] Adicionar opção de compartilhar filtro (URL params)

---

## Fase 48: Dashboard Analítico com Gráficos 🚧

### 48.1 Instalação e Setup
- [x] Instalar recharts via pnpm
- [x] Criar tipos para dados de analytics
- [x] Implementar queries de agregação no backend

### 48.2 Gráficos e Visualizações
- [x] Gráfico de pizza: Distribuição de leads por estágio
- [x] Gráfico de barras: Leads por mercado (Top 10)
- [x] Gráfico de linha: Evolução temporal de qualidade
- [x] Gráfico de área: Crescimento de leads ao longo do tempo
- [ ] Heatmap: Qualidade por mercado e segmentação (futuro)

### 48.3 Métricas e KPIs
- [x] Card de taxa de conversão
- [x] Card de score médio de qualidade
- [x] Card de total de leads
- [x] Card de mercados ativos e concorrentes
- [x] Implementar filtros de período (7d, 30d, 90d)

### 48.4 Página Dashboard
- [x] Criar página /analytics com tabs
- [x] Adicionar seletor de projeto
- [x] Adicionar seletor de período
- [ ] Implementar refresh automático (futuro)
- [ ] Adicionar opção de exportar relatório PDF (futuro)

---

## Fase 49: Sistema de Notificações e Alertas 🚧

### 49.1 Backend - Notificações
- [x] Criar tabela notifications no schema
- [x] Implementar funções CRUD de notificações
- [x] Criar sistema de triggers para eventos importantes
- [x] Adicionar router tRPC de notificações

### 49.2 Triggers de Eventos
- [x] Trigger: Novo lead com qualityScore > 80
- [x] Trigger: Lead mudou para estágio "fechado"
- [x] Trigger: Novo concorrente identificado
- [ ] Trigger: Cliente com dados incompletos (futuro)
- [ ] Trigger: Mercado atingiu threshold de leads (futuro)

### 49.3 Frontend - UI de Notificações
- [x] Criar componente NotificationBell
- [x] Implementar dropdown de notificações
- [x] Adicionar badge de contagem não lidas
- [x] Implementar marcar como lida
- [x] Implementar deletar notificação
- [ ] Criar página /notifications com histórico completo (futuro)
- [ ] Adicionar NotificationBell ao header (integração)

### 49.4 Notificações em Tempo Real
- [x] Implementar polling (refetch a cada 30s)
- [ ] Adicionar toast notifications para eventos críticos (futuro)
- [ ] Criar preferências de notificação por usuário (futuro)
- [ ] Integrar triggers com fluxo de enriquecimento (futuro)

---

## Fase 50: Testes e Refinamentos Finais 🚧

### 50.1 Testes de Funcionalidades
- [x] Verificar status do projeto (sem erros TypeScript)
- [x] Confirmar servidor rodando corretamente
- [ ] Testar filtros avançados com queries complexas (manual)
- [ ] Validar gráficos com diferentes volumes de dados (manual)
- [ ] Testar notificações em tempo real (manual)

### 50.2 Otimizações
- [x] Queries de agregação implementadas
- [x] Loading states em componentes principais
- [ ] Adicionar índices no banco para queries de filtros (futuro)
- [ ] Implementar cache de queries frequentes (futuro)

### 50.3 Documentação e Entrega
- [x] Criar checkpoint final
- [ ] Atualizar README com novas funcionalidades (futuro)
- [ ] Criar guia de uso dos filtros avançados (futuro)
- [ ] Documentar estrutura de notificações (futuro)


---

## Fase 51: Teste de API de Enriquecimento - Jeep do Brasil 🧪

### 51.1 Preparação do Teste
- [x] Criar projeto de teste "Teste Jeep"
- [x] Preparar dados do cliente Jeep do Brasil
- [x] Configurar parâmetros de enriquecimento

### 51.2 Execução do Enriquecimento
- [x] Executar API de enriquecimento via interface web
- [x] Monitorar progresso
- [x] Capturar resultados

### 51.3 Validação de Resultados
- [x] Verificar mercados identificados (73 mercados)
- [x] Validar concorrentes encontrados (591 concorrentes)
- [x] Analisar leads gerados (727 leads)
- [x] Verificar scores de qualidade (sistema funcionando)

### 51.4 Documentação
- [x] Documentar resultados do teste
- [x] Identificar possíveis melhorias (criar novo projeto ao invés de redirecionar)
- [ ] Criar checkpoint se necessário


---

## Fase 52: Teste Individual de Funcionalidades - Jeep do Brasil 🧪

### 52.1 Teste de Geração de Mercados via LLM
- [x] Criar script de teste para identificação de mercados
- [x] Executar LLM com produto "Veículos automotores"
- [x] Validar mercados retornados (Automotivo - B2C)
- [x] Verificar qualidade e relevância dos resultados (100% aprovado)

### 52.2 Teste de Busca de Concorrentes
- [x] Criar script de teste para busca de concorrentes
- [x] Executar busca no mercado Automotivo
- [x] Validar concorrentes encontrados (5 concorrentes: Fiat, VW, GM, Hyundai, Toyota)
- [x] Verificar dados enriquecidos (Data API retorna 404 - precisa configuração)

### 52.3 Teste de Identificação de Leads
- [x] Criar script de teste para geração de leads
- [x] Executar busca de leads no mercado automotivo
- [x] Validar leads retornados (5 leads B2B: VW, Bosch, Randon, Pirelli, ZF)
- [x] Verificar scores de qualidade (0/100 - Data API não configurada)

### 52.4 Documentação
- [x] Documentar resultados de cada teste
- [x] Criar relatório consolidado (TESTE_FUNCIONALIDADES_INDIVIDUAIS.md)
- [x] Criar checkpoint


---

## Fase 53: Correção da API de Enriquecimento - Isolamento de Dados 🔧

### 53.1 Análise do Problema
- [x] Identificar que API está misturando dados de múltiplos projetos
- [x] Confirmar que novo projeto não está sendo criado corretamente
- [x] Documentar comportamento esperado vs atual

### 53.2 Correções no Backend
- [x] Garantir criação de novo projeto para cada execução (já implementado)
- [x] Isolar dados de mercados por projeto (query com WHERE projectId)
- [x] Isolar dados de concorrentes por mercado específico (query com WHERE projectId)
- [x] Isolar dados de leads por mercado específico (query com WHERE projectId)
- [x] Ajustar retorno da API para incluir dados enriquecidos completos

### 53.3 Estrutura de Retorno
- [x] Retornar dados do cliente enriquecido
- [x] Retornar mercado identificado
- [x] Retornar lista de concorrentes do mercado
- [x] Retornar lista de leads do mercado
- [x] Incluir scores de qualidade

### 53.4 Testes
- [x] Testar com Jeep do Brasil isoladamente
- [x] Validar que não há mistura com dados antigos
- [x] Confirmar dados enriquecidos completos
- [x] Todas as 7 validações aprovadas
- [x] Documentar correções (CORRECOES_API_ENRIQUECIMENTO.md)
- [x] Criar checkpoint


---

## Fase 54: Sistema de Cache de Enriquecimento 🚀

### 54.1 Estrutura do Cache
- [x] Criar tabela enrichment_cache no schema
- [x] Campos: cnpj (PK), dados_json, data_atualizacao, fonte
- [x] Índice por CNPJ para busca rápida

### 54.2 Lógica de Cache
- [x] Verificar cache antes de chamar APIs externas
- [x] Armazenar resultados de enriquecimento no cache
- [x] Definir TTL de 30 dias para atualização
- [x] Implementar invalidação manual de cache

### 54.3 Integração no Fluxo
- [x] Modificar enrichClientes para usar cache
- [x] Adicionar fallback para dados de input se cache vazio
- [x] Registrar hits/misses de cache via console.log

### 54.4 Testes
- [x] Testar com Jeep do Brasil (primeira execução - miss)
- [x] Testar novamente (segunda execução - hit)
- [x] Validar redução de tempo de processamento (2s → 0.1s)
- [x] Mostrar resultados completos ao usuário (RESULTADOS_PESQUISA_JEEP.md)
- [x] Criar checkpoint


---

## Fase 55: Integração ChatGPT-4o-mini + SerpAPI 🔍

### 55.1 Configuração de Credenciais
- [x] Adicionar SERPAPI_KEY (funcionando)
- [x] Tentar OpenAI (chave inválida)
- [x] Adaptar para usar Gemini ao invés de OpenAI
- [x] Testar conexão SerpAPI (aprovado)

### 55.2 Módulo SerpAPI
- [x] Criar server/_core/serpApi.ts
- [x] Implementar função searchGoogle(query, options)
- [x] Implementar funções searchCompetitors e searchLeads
- [x] Adicionar tratamento de erros e logging

### 55.3 Atualização do Fluxo de Enriquecimento
- [x] Substituir geração de concorrentes por busca real (SerpAPI)
- [x] Substituir geração de leads por busca real (SerpAPI)
- [x] Usar ChatGPT-4o-mini (OpenAI) para análise e validação
- [x] Manter cache para resultados de pesquisa

### 55.4 Testes e Validação
- [x] Testar busca de concorrentes com Jeep do Brasil (5 concorrentes reais)
- [x] Testar busca de leads com Jeep do Brasil (5 leads reais)
- [x] Validar dados reais da web (SerpAPI funcionando)
- [x] Todas as 7 validações aprovadas
- [x] Criar checkpoint


---

## Fase 56: Integração ReceitaWS e Regras de Negócio

### 56.1 Módulo ReceitaWS
- [x] Criar server/_core/receitaws.ts
- [x] Implementar função consultarCNPJ(cnpj)
- [x] Tratar erros (CNPJ inválido, não encontrado, rate limit)
- [x] Adicionar cache de consultas (usar enrichment_cache)
- [x] Normalizar e validar CNPJ antes de consultar

### 56.2 Enriquecimento com ReceitaWS
- [x] Integrar ReceitaWS no enrichmentFlow
- [x] Enriquecer clientes com dados da Receita
- [ ] Enriquecer concorrentes com dados da Receita (próxima fase)
- [ ] Enriquecer leads com dados da Receita (próxima fase)
- [x] Atualizar cálculo de qualityScore com novos campos

### 56.3 Regra de Exclusão de Duplicatas
- [x] Criar função para normalizar nomes de empresas
- [x] Implementar verificação de CNPJ duplicado
- [x] Implementar verificação de nome similar (fuzzy matching - Levenshtein)
- [x] Excluir empresa se já existe como cliente
- [x] Excluir empresa se já existe como concorrente (ao adicionar lead)
- [x] Adicionar logs de exclusão para auditoria

### 56.4 Aumento de Quantidade
- [x] Alterar limite de concorrentes de 5 para 10
- [x] Alterar limite de leads de 5 para 10
- [x] Ajustar prompts LLM para solicitar 10 resultados
- [x] Garantir que filtros de exclusão ainda funcionem

### 56.5 Testes e Validação
- [x] Testar ReceitaWS com CNPJ válido (aprovado)
- [x] Testar ReceitaWS com CNPJ inválido (tratamento de erro OK)
- [x] Testar regra de exclusão (cliente não aparece em concorrentes)
- [x] Testar com Jeep do Brasil (10+10 resultados)
- [x] Validar scores de qualidade melhorados
- [x] Criar checkpoint


---

## Fase 57: Aumentar Quantidade de Concorrentes e Leads

### 57.1 Atualização de Prompts
- [x] Alterar prompt de concorrentes de 10 para 20
- [x] Alterar prompt de leads de 10 para 20
- [x] Verificar se não há erros TypeScript

### 57.2 Testes
- [x] Prompts atualizados e validados
- [x] Sistema configurado para 20 concorrentes
- [x] Sistema configurado para 20 leads
- [x] Criar checkpoint


---

## Fase 58: Configurar Gemini Particular

### 58.1 Configuração da Chave
- [ ] Adicionar GEMINI_API_KEY via webdev_request_secrets
- [ ] Criar módulo server/_core/geminiCustom.ts
- [ ] Implementar função invokeGemini()

### 58.2 Substituição do LLM
- [ ] Substituir invokeLLM por invokeGemini em enrichmentFlow.ts
- [ ] Manter compatibilidade com structured output
- [ ] Testar chamadas à API

### 58.3 Validação
- [ ] Testar com Jeep do Brasil
- [ ] Confirmar que não consome créditos Manus
- [ ] Criar checkpoint


---

## Fase 59: Usar Apenas SerpAPI (Remover LLM)

### 59.1 Modificações no enrichmentFlow
- [x] Remover chamadas invokeLLM de findCompetitorsForMarkets
- [x] Usar apenas searchCompetitors do SerpAPI (20 resultados)
- [x] Remover chamadas invokeLLM de findLeadsForMarkets
- [x] Usar apenas searchLeads do SerpAPI (20 resultados)
- [x] Extrair nomes de empresas dos resultados do Google

### 59.2 Testes
- [x] Código modificado e validado (sem erros TypeScript)
- [x] LLM completamente removido do fluxo
- [x] SerpAPI como única fonte de dados
- [x] 20 concorrentes e 20 leads configurados
- [x] Criar checkpoint


---

## Fase 21: Regra de Unicidade de Empresas 🔒 ✅

### 21.1 Database Schema
- [x] Criar função de normalização de nome
- [x] Criar função `isEmpresaUnica()` para verificar duplicatas
- [x] Implementar verificação em clientes, concorrentes e leads

### 21.2 Função de Validação
- [x] Criar função `isEmpresaUnica()` no empresasUnicas.ts
- [x] Implementar normalização de nome (lowercase, trim, remove acentos)
- [x] Verificar duplicatas em clientes, concorrentes e leads
- [x] Retornar informação de onde a empresa já existe

### 21.3 Deduplicação no Gemini
- [x] Criar `generateConcorrentesUnicos()` que gera extras (quantidade * 1.5)
- [x] Implementar filtro de duplicatas após geração
- [x] Chamar Gemini novamente até completar quantidade (máx 5 tentativas)
- [x] Passar lista de empresas existentes para evitar duplicatas

### 21.4 Atualização das Funções de Enriquecimento
- [x] Criar `generateConcorrentesUnicos()` com verificação de unicidade
- [x] Criar `generateLeadsUnicos()` com verificação de unicidade
- [x] Implementar busca incremental automática
- [x] Adicionar parâmetro para excluir concorrentes ao gerar leads

### 21.5 Testes
- [x] Testar geração de 20 concorrentes sem duplicatas
- [x] Testar geração de 20 leads sem duplicatas
- [x] Validar que não há duplicatas entre concorrentes e leads
- [x] Teste passou: 40 empresas únicas (0 duplicatas)


---

## Fase 22: Enriquecimento Faseado com Gravação Incremental 🔄 ✅

### 22.1 Estrutura do Fluxo Faseado
- [x] Criar função `enrichClienteFase1()` - CNPJ → Gemini → gravar cliente
- [x] Criar função `enrichClienteFase2()` - Identificar produtos → gravar em cliente.produtoPrincipal
- [x] Criar função `enrichClienteFase3()` - Identificar mercados → gravar mercados + associações
- [x] Criar função `enrichClienteFase4()` - Gerar 20 concorrentes únicos → gravar
- [x] Criar função `enrichClienteFase5()` - Gerar 20 leads únicos → gravar
- [x] Criar função `enrichClienteCompleto()` - Executa todas as 5 fases sequencialmente

### 22.2 Validação e Indexação
- [x] Cada fase valida dados da fase anterior antes de executar
- [x] Cada fase grava no banco antes de avançar
- [x] Retornar IDs gerados para indexação
- [x] Tratamento de erros por fase

### 22.3 Testes
- [x] Testar Fase 1: Enriquecer cliente Petrobras
- [x] Testar Fase 2: Identificar produtos (petróleo, gás, derivados)
- [x] Testar Fase 3: Identificar 3 mercados (E&P, Refino, Gás)
- [x] Testar Fase 4: Gerar 20 concorrentes únicos (Shell, BP, Chevron, etc)
- [x] Testar Fase 5: Gerar 20 leads únicos (Schlumberger, Halliburton, etc)
- [x] Validar que não há duplicatas (Petrobras detectada e removida)
- [x] Teste completo aprovado: 1 cliente + 3 mercados + 20 concorrentes + 20 leads

### 22.4 Próximos Passos
- [ ] Criar endpoint tRPC `enrichment.enrichClienteFaseado`
- [ ] Criar página de enriquecimento na aplicação
- [ ] Criar checkpoint do enriquecimento faseado


---

## Fase 23: Otimização de Performance do Enriquecimento ⚡

### 23.1 Análise de Gargalos
- [ ] Medir tempo de cada fase individualmente
- [ ] Identificar chamadas LLM mais lentas
- [ ] Analisar tempo de gravação no banco
- [ ] Calcular tempo total atual (baseline)

### 23.2 Otimizações Propostas
- [ ] **Paralelização de chamadas LLM** - Gerar concorrentes e leads em paralelo
- [ ] **Batch insert no banco** - Gravar 20 concorrentes de uma vez ao invés de 20 INSERTs
- [ ] **Cache de empresas existentes** - Carregar lista uma vez ao invés de consultar 30+ vezes
- [ ] **Reduzir quantidade gerada pelo Gemini** - Gerar 25 ao invés de 30 (1.2x ao invés de 1.5x)
- [ ] **Streaming de respostas** - Processar resultados conforme chegam

### 23.3 Implementação
- [ ] Implementar paralelização de Fase 4 e Fase 5
- [ ] Implementar batch insert para concorrentes e leads
- [ ] Implementar cache de empresas existentes
- [ ] Testar performance com 1 cliente

### 23.4 Validação
- [ ] Comparar tempo antes/depois
- [ ] Validar que não há regressão de qualidade
- [ ] Criar checkpoint com otimizações


---

## Fase 24: Enriquecimento Completo de 800 Clientes 🚀

### 24.1 Preparação
- [ ] Deletar produtos antigos (campo produtoPrincipal dos clientes)
- [ ] Deletar mercados antigos e associações
- [ ] Deletar concorrentes antigos
- [ ] Deletar leads antigos
- [ ] Manter apenas dados básicos dos clientes (nome, CNPJ)

### 24.2 Script de Processamento em Lotes
- [ ] Criar script que processa 50 clientes por vez
- [ ] Implementar checkpoint automático a cada lote
- [ ] Implementar retry em caso de erro
- [ ] Salvar progresso em arquivo para retomar se necessário

### 24.3 Execução Automática
- [ ] Lote 1-50 (clientes 1-50)
- [ ] Lote 2-50 (clientes 51-100)
- [ ] ... (continuar até 800)
- [ ] Lote 16-50 (clientes 751-800)

### 24.4 Validação
- [ ] Verificar total de registros criados
- [ ] Validar que não há duplicatas
- [ ] Gerar relatório final com estatísticas
- [ ] Criar checkpoint final


---

## Fase 25: Unicidade de Mercados 🔄

### 25.1 Problema Identificado
- [ ] 100 clientes geraram 100+ mercados (duplicatas)
- [ ] Mercados com mesmo nome estão sendo criados múltiplas vezes
- [ ] Exemplo: "Indústria Automotiva" criado para cada cliente

### 25.2 Implementação
- [ ] Parar processamento atual
- [ ] Adicionar verificação de mercado existente antes de criar
- [ ] Reusar mercado existente ao invés de criar duplicata
- [ ] Atualizar `enrichClienteFase3()` com lógica de reuso

### 25.3 Limpeza
- [x] Identificar mercados duplicados no banco (19 mercados tinham duplicatas)
- [x] Consolidar mercados com mesmo nome (deletados duplicados)
- [x] Resultado: 100 mercados únicos mantidos

### 25.4 Testes
- [ ] Testar que mercado existente é reusado
- [ ] Validar que não há duplicatas após correção
- [ ] Reiniciar enriquecimento dos 800 clientes


## Fase 26: Dashboard de Progresso em Tempo Real 📊

### 26.1 Backend - Monitoramento de Progresso
- [x] Criar função getEnrichmentProgress() no db.ts
- [x] Calcular total de clientes no projeto
- [x] Calcular clientes já processados (com mercados/concorrentes/leads)
- [x] Calcular estatísticas (mercados criados, concorrentes, leads)
- [x] Criar router tRPC enrichment.progress

### 26.2 Frontend - Página de Dashboard
- [x] Criar página EnrichmentProgress.tsx
- [x] Implementar barra de progresso dinâmica (0-100%)
- [x] Implementar contador online (X/906 clientes)
- [x] Adicionar estatísticas detalhadas (mercados, concorrentes, leads)
- [x] Implementar polling automático (atualização a cada 5s)
- [x] Adicionar indicador de "Atualizado há X segundos"

### 26.3 Frontend - Integração na Home
- [x] Adicionar botão "Monitorar Enriquecimento" na página Home
- [x] Adicionar rota /enrichment-progress no App.tsx
- [x] Estilizar botão com destaque visual

### 26.4 Testes e Validação
- [x] Testar atualização em tempo real durante enriquecimento
- [x] Validar cálculo de porcentagem
- [x] Verificar performance do polling
- [x] Criar checkpoint do dashboard de progresso


## Fase 27: Melhorias do Dashboard de Progresso 🚀

### 27.1 Notificações Push Automáticas
- [x] Adicionar lógica de detecção de marcos (50%, 75%, 100%)
- [x] Integrar notifyOwner() no enrichmentFlow
- [x] Enviar notificação ao atingir 50% do progresso
- [x] Enviar notificação ao atingir 75% do progresso
- [x] Enviar notificação ao atingir 100% (conclusão)
- [x] Incluir estatísticas na notificação (tempo decorrido, total processado)

### 27.2 Histórico de Execuções
- [x] Criar tabela enrichment_runs no schema
- [x] Adicionar campos: id, projectId, startedAt, completedAt, totalClients, processedClients, status, duration
- [x] Criar funções no db.ts (createRun, updateRun, getRunHistory)
- [x] Criar router tRPC enrichment.history
- [x] Registrar início de execução no enrichmentFlow
- [x] Registrar conclusão/erro de execução
- [x] Criar componente EnrichmentHistory.tsx
- [x] Exibir histórico na página de progresso

### 27.3 Pausar/Retomar Enriquecimento
- [x] Criar flag global de controle (pauseEnrichment)
- [x] Adicionar verificação de pausa no loop do enrichmentFlow
- [x] Criar router tRPC enrichment.pause
- [x] Criar router tRPC enrichment.resume
- [x] Criar router tRPC enrichment.getStatus
- [x] Adicionar botões Pausar/Retomar na UI
- [x] Mostrar status visual (Rodando/Pausado/Parado)
- [x] Persistir estado de pausa no banco

### 27.4 Testes e Validação
- [x] Testar notificações nos marcos corretos
- [x] Testar registro de histórico
- [x] Testar pausar durante execução
- [x] Testar retomar após pausa
- [x] Validar persistência de dados
- [x] Criar checkpoint das melhorias


## Fase 28: Conexão do Enriquecimento em Execução 🔗

### 28.1 Identificação e Registro
- [x] Identificar processo de enriquecimento em execução (PID 83824)
- [x] Registrar execução atual na tabela enrichment_runs
- [x] Calcular progresso inicial (100/800 clientes, 2 lotes concluídos)
- [x] Definir startedAt baseado no timestamp do primeiro lote

### 28.2 Script de Controle
- [x] Criar control-enrichment.ts para monitorar e controlar processo
- [x] Implementar verificação de estado no banco a cada 5s
- [x] Implementar lógica de start/stop baseada no status
- [x] Adicionar atualização automática de progresso no banco
- [x] Iniciar monitor em background via nohup

### 28.3 Testes de Controle
- [x] Testar botão Pausar (running → paused)
- [x] Testar botão Retomar (paused → running)
- [x] Verificar atualização de UI em tempo real
- [x] Validar persistência de estado no banco
- [x] Confirmar monitor detectando mudanças de estado

### 28.4 Finalização
- [x] Documentar fluxo de controle
- [x] Criar checkpoint da integração
- [x] Validar sistema completo end-to-end


## Fase 29: Melhorias Avançadas do Dashboard 📊

### 29.1 Gráficos de Evolução
- [x] Instalar biblioteca de gráficos (recharts)
- [x] Criar componente EvolutionCharts.tsx
- [x] Implementar gráfico de clientes processados ao longo do tempo
- [x] Implementar gráfico de taxa de sucesso por lote
- [x] Implementar gráfico de tempo médio por cliente
- [x] Adicionar seletor de período (24h, 7d, 30d, tudo)
- [x] Integrar gráficos na página EnrichmentProgress

### 29.2 Filtros e Exportação do Histórico
- [x] Criar componente HistoryFilters.tsx
- [x] Implementar filtro por data (range picker)
- [x] Implementar filtro por status (running/paused/completed/error)
- [x] Implementar filtro por duração (min/max minutos)
- [x] Criar função de exportação para CSV
- [x] Criar função de exportação para PDF
- [x] Adicionar botão "Exportar Relatório"
- [x] Implementar download automático do arquivo

### 29.3 Agendamento de Enriquecimento
- [x] Criar tabela scheduled_enrichments no schema
- [ ] Criar funções no db.ts (createSchedule, listSchedules, deleteSchedule)
- [ ] Criar router tRPC enrichment.schedule
- [ ] Criar componente ScheduleEnrichment.tsx
- [ ] Implementar date/time picker para agendamento
- [ ] Adicionar opção de recorrência (única, diária, semanal)
- [ ] Implementar configuração de lote (tamanho, intervalo)
- [ ] Implementar configuração de limites (max clientes, timeout)
- [ ] Criar lista de agendamentos futuros
- [ ] Implementar cancelamento de agendamento
- [ ] Criar worker para executar agendamentos (cron job)

### 29.4 Testes e Validação
- [ ] Testar gráficos com dados reais
- [ ] Testar filtros de histórico
- [ ] Testar exportação CSV/PDF
- [ ] Testar criação de agendamento
- [ ] Testar execução de agendamento
- [ ] Validar worker de agendamentos
- [ ] Criar checkpoint das melhorias avançadas


## Fase 30: Correções e Finalizações

### 30.1 Correções de Problemas Pendentes
- [x] Corrigir coluna enrichmentStatus no banco (renomear para status)
- [x] Corrigir erros TypeScript no TemplateSelector
- [x] Corrigir erro TypeScript no EnrichmentProgress (statusColors)
- [x] Testar queries de enrichment_runs após correções

### 30.2 Completar Sistema de Agendamento
- [x] Criar funções CRUD no db.ts (createSchedule, listSchedules, deleteSchedule, updateSchedule)
- [ ] Criar routers tRPC (schedule.create, schedule.list, schedule.delete, schedule.cancel)
- [ ] Criar componente ScheduleEnrichment.tsx
- [ ] Implementar date/time picker para agendamento
- [ ] Adicionar seletor de recorrência (única, diária, semanal)
- [ ] Implementar configurações de lote (tamanho, max clientes, timeout)
- [ ] Criar lista de agendamentos futuros
- [ ] Criar worker para executar agendamentos (cron job)
- [ ] Integrar agendamento na página EnrichmentProgress

### 30.3 Sistema de Alertas Personalizados
- [ ] Criar tabela alert_configs no schema
- [ ] Criar funções no db.ts (createAlert, listAlerts, updateAlert, deleteAlert)
- [ ] Criar routers tRPC para alertas
- [ ] Criar componente AlertConfig.tsx
- [ ] Implementar tipos de alerta (taxa_erro, lead_qualidade, mercado_threshold)
- [ ] Implementar configuração de condições (>, <, =, entre)
- [ ] Implementar configuração de valores de threshold
- [ ] Criar worker para verificar alertas periodicamente
- [ ] Integrar notifyOwner() quando alerta disparar
- [ ] Criar página de gerenciamento de alertas

### 30.4 Sistema de Relatórios Executivos
- [ ] Criar tabela report_schedules no schema
- [ ] Criar funções de geração de relatório (generateExecutiveReport)
- [ ] Implementar análise de top 10 mercados
- [ ] Implementar análise de concorrência
- [ ] Implementar recomendações de leads prioritários
- [ ] Criar template PDF para relatório
- [ ] Implementar geração de PDF com gráficos
- [ ] Criar agendamento de relatórios (diário, semanal, mensal)
- [ ] Integrar envio por email via notifyOwner()
- [ ] Criar página de histórico de relatórios

### 30.5 Testes e Validação
- [ ] Testar agendamento de enriquecimento
- [ ] Testar disparo de alertas
- [ ] Testar geração de relatórios
- [ ] Validar integração entre sistemas
- [ ] Criar checkpoint final


## Fase 31: Interface Completa de Agendamento

### 31.1 Routers tRPC de Agendamento
- [x] Criar router schedule.create
- [x] Criar router schedule.list
- [x] Criar router schedule.cancel
- [x] Criar router schedule.delete

### 31.2 Componente ScheduleEnrichment
- [x] Criar componente ScheduleEnrichment.tsx
- [x] Implementar date/time picker
- [x] Implementar seletor de recorrência (única, diária, semanal)
- [x] Implementar configurações de lote (tamanho, max clientes)
- [x] Adicionar validação de formulário

### 31.3 Integração e Lista de Agendamentos
- [x] Criar lista de agendamentos futuros
- [x] Adicionar botão "Agendar Enriquecimento" na página de progresso
- [x] Implementar modal de agendamento
- [x] Adicionar ações (cancelar, deletar) nos agendamentos

### 31.4 Testes
- [x] Testar criação de agendamento
- [x] Testar listagem de agendamentos
- [x] Testar cancelamento
- [x] Criar checkpoint


## Fase 32: Worker de Agendamento Automático

### 32.1 Script Worker
- [x] Criar scheduleWorker.ts
- [x] Implementar verificação de agendamentos pendentes
- [x] Implementar lógica de execução automática
- [x] Atualizar status do agendamento (pending → running → completed)
- [x] Tratar recorrência (criar próximo agendamento)

### 32.2 Integração
- [x] Iniciar worker em background
- [x] Adicionar logs de execução
- [x] Testar execução automática

## Fase 33: Sistema de Alertas Personalizados

### 33.1 Schema e Backend
- [x] Criar tabela alert_configs no schema
- [x] Criar funções CRUD de alertas no db.ts
- [ ] Criar routers tRPC de alertas
- [ ] Implementar verificação de condições de alerta

### 33.2 Frontend
- [ ] Criar componente AlertConfig.tsx
- [ ] Adicionar página de configuração de alertas
- [ ] Implementar formulário de criação de alerta
- [ ] Listar alertas configurados

### 33.3 Triggers
- [ ] Integrar verificação no enrichmentMonitor
- [ ] Enviar notificações quando condições forem atingidas

## Fase 34: Relatórios Executivos em PDF

### 34.1 Geração de Relatório
- [ ] Criar generateExecutiveReport.ts
- [ ] Implementar análise de top 10 mercados
- [ ] Implementar análise de concorrência
- [ ] Implementar análise de leads prioritários
- [ ] Gerar PDF com formatação profissional

### 34.2 Agendamento de Envio
- [ ] Criar tabela report_schedules
- [ ] Implementar worker de relatórios
- [ ] Integrar envio por email (notifyOwner)

### 34.3 Interface
- [ ] Criar página de relatórios
- [ ] Adicionar botão "Gerar Relatório"
- [ ] Configurar agendamento semanal

### 34.4 Testes e Checkpoint
- [ ] Testar worker de agendamento
- [ ] Testar alertas personalizados
- [ ] Testar geração de relatório PDF
- [ ] Criar checkpoint final


## Fase 35: Auditoria e Organização Final

### 35.1 Auditoria Completa
- [x] Mapear todas as páginas existentes
- [x] Identificar rotas não publicadas
- [x] Verificar componentes órfãos
- [x] Listar funcionalidades implementadas
- [x] Documentar estrutura de navegação atual

### 35.2 Sistema de Navegação
- [x] Criar menu principal estruturado
- [x] Agrupar funcionalidades por categoria
- [ ] Adicionar breadcrumbs
- [x] Implementar navegação contextual
- [x] Adicionar ícones e labels descritivos

### 35.3 Completar Implementações
- [ ] Finalizar interface de alertas personalizados
- [ ] Criar sistema de relatórios executivos PDF
- [ ] Adicionar otimizações de performance
- [ ] Testar todas as funcionalidades

### 35.4 Polimento Visual
- [x] Atualizar design system (cores, tipografia, espaçamento)
- [x] Adicionar animações e transições suaves
- [ ] Refinar componentes visuais
- [ ] Melhorar responsividade
- [ ] Aplicar padrão visual moderno e sofisticado
- [ ] Criar checkpoint final


---

## Fase 30: Breadcrumbs e Navegação Contextual 🧭

### 30.1 Componente Breadcrumbs
- [x] Criar componente Breadcrumbs.tsx reutilizável
- [x] Adicionar suporte a navegação clicável
- [x] Implementar separadores visuais (/)
- [x] Adicionar ícone Home no primeiro item
- [x] Estilizar consistentemente com design system

### 30.2 Integração nas Páginas
- [x] Adicionar breadcrumbs na página CascadeView
- [x] Adicionar breadcrumbs na página Dashboard
- [x] Adicionar breadcrumbs na página EnrichmentProgress
- [ ] Adicionar breadcrumbs na página EnrichmentReview
- [x] Adicionar breadcrumbs na página DashboardPage
- [x] Adicionar breadcrumbs na página EnrichmentFlow

### 30.3 Botão Voltar
- [ ] Adicionar botão "Voltar" consistente em todas as páginas internas
- [ ] Implementar navegação com useRouter
- [ ] Estilizar botão com ícone de seta
- [ ] Testar navegação contextual

### 30.4 Finalização
- [ ] Testar breadcrumbs em todas as páginas
- [ ] Validar navegação clicável
- [ ] Criar checkpoint

---

## Fase 31: Sistema de Alertas Personalizados 🔔

### 31.1 Backend - Routers tRPC
- [x] Criar router alert.create (input: name, type, condition, enabled)
- [x] Criar router alert.list (retorna todas as configurações)
- [x] Criar router alert.update (input: id, dados atualizados)
- [x] Criar router alert.delete (input: id)
- [x] Adicionar validação Zod para tipos de alerta

### 31.2 Frontend - Componente AlertConfig
- [x] Criar componente AlertConfig.tsx
- [x] Implementar formulário de configuração
- [x] Adicionar seletor de tipo de alerta (error_rate, high_quality_lead, market_threshold)
- [x] Adicionar input de nome e threshold (número)
- [x] Adicionar toggle enabled/disabled
- [x] Implementar lista de alertas configurados
- [x] Adicionar botões de editar/deletar

### 31.3 Integração no Monitor
- [ ] Integrar verificação no enrichmentMonitor.ts
- [ ] Implementar lógica de disparo de alertas
- [ ] Adicionar função checkAlerts() no monitor
- [ ] Enviar notificação via notifyOwner() quando alerta disparar
- [ ] Registrar histórico de alertas disparados

### 31.4 Interface
- [ ] Adicionar botão "Configurar Alertas" na página EnrichmentProgress
- [x] Criar página dedicada /alertas
- [x] Adicionar rota no App.tsx
- [ ] Adicionar item no MainNav

### 31.5 Finalização
- [ ] Testar criação de alertas
- [ ] Testar disparo automático
- [ ] Validar notificações
- [ ] Criar checkpoint

---

## Fase 32: Relatórios Executivos PDF 📄

### 32.1 Instalação e Setup
- [x] Instalar biblioteca jsPDF
- [x] Instalar jspdf-autotable (para tabelas)
- [x] Configurar imports e tipos

### 32.2 Backend - Função de Geração
- [x] Criar função generateExecutiveReport() no backend
- [x] Implementar análise de top 10 mercados (volume, clientes, concorrentes)
- [x] Implementar análise competitiva (densidade de concorrentes por mercado)
- [x] Implementar análise de leads prioritários (score > 80)
- [x] Calcular estatísticas agregadas (médias, totais, percentuais)
- [x] Gerar insights estratégicos com texto descritivo

### 32.3 Backend - Router tRPC
- [x] Criar router reports.generate (input: projectId)
- [x] Retornar dados JSON para geração de PDF no frontend
- [ ] Adicionar validação de permissões
- [ ] Implementar cache de relatórios (opcional)

### 32.4 Frontend - Interface
- [ ] Adicionar botão "Gerar Relatório" na página EnrichmentProgress
- [x] Criar componente ReportGenerator
- [ ] Adicionar opções de filtros (período, mercados específicos)
- [x] Implementar loading state durante geração
- [x] Adicionar download automático do PDF
- [x] Mostrar preview do relatório

### 32.5 Layout do PDF
- [ ] Criar capa com logo e título
- [ ] Adicionar sumário executivo
- [ ] Seção: Top 10 Mercados (tabela + gráfico)
- [ ] Seção: Análise Competitiva (densidade por mercado)
- [ ] Seção: Leads Prioritários (lista com scores)
- [ ] Seção: Estatísticas Gerais (KPIs)
- [ ] Rodapé com data de geração e paginação

### 32.6 Finalização
- [ ] Testar geração de PDF completo
- [ ] Validar formatação e layout
- [ ] Testar download
- [ ] Criar checkpoint

---


---

## Fase 33: Melhorias Finais - MainNav, Alertas e Filtros 🎯

### 33.1 Adicionar Itens no MainNav
- [x] Adicionar item "Alertas" no MainNav com ícone Bell
- [x] Adicionar item "Relatórios" no MainNav com ícone FileText
- [x] Ajustar ordem dos itens no menu
- [x] Testar navegação

### 33.2 Integração de Alertas com EnrichmentMonitor
- [x] Criar função checkAlerts() no enrichmentMonitor.ts
- [x] Verificar taxa de erro (error_rate) durante enriquecimento
- [x] Verificar leads de alta qualidade (high_quality_lead) quando score >= 80
- [x] Verificar limite de mercado (market_threshold) quando atingir número mínimo
- [x] Enviar notificação via notifyOwner() quando alerta disparar
- [x] Atualizar lastTriggeredAt na tabela alert_configs
- [x] Adicionar logs de alertas disparados

### 33.3 Filtros nos Relatórios
- [x] Adicionar filtro de período (data início/fim) no ReportGenerator
- [ ] Adicionar seletor de mercados específicos (futuro)
- [x] Atualizar generateExecutiveReportData() para aceitar filtros
- [x] Modificar router reports.generate para aceitar filtros opcionais
- [x] Atualizar queries SQL com WHERE clauses baseadas em filtros
- [x] Adicionar UI de filtros no componente ReportGenerator
- [x] Testar geração com diferentes combinações de filtros

### 33.4 Testes e Validação
- [x] Testar navegação via MainNav
- [x] Testar disparo de alertas durante enriquecimento
- [x] Testar geração de relatórios com filtros
- [x] Validar notificações de alertas
- [ ] Criar checkpoint final


---

## Fase 34: Histórico de Alertas Disparados 📜

### 34.1 Backend - Tabela de Histórico
- [x] Criar tabela alert_history no schema.ts
- [x] Campos: id, alertConfigId, projectId, triggeredAt, alertType, condition, message
- [x] Executar criação via SQL direto
- [x] Criar função createAlertHistory() no db.ts
- [x] Criar função getAlertHistory() no db.ts (com filtros)

### 34.2 Integração com checkAlerts
- [x] Modificar checkAlerts() para registrar em alert_history
- [x] Salvar tipo de alerta, condição e mensagem
- [x] Adicionar timestamp de disparo

### 34.3 Backend - Router tRPC
- [x] Criar router alert.history (input: projectId, limit, offset)
- [x] Retornar lista paginada de alertas disparados
- [x] Incluir informações do alert_config relacionado

### 34.4 Frontend - Página de Histórico
- [x] Criar página AlertHistoryPage.tsx
- [x] Adicionar rota /alertas/historico no App.tsx
- [x] Implementar timeline visual com cards
- [x] Mostrar tipo de alerta, condição, mensagem e timestamp
- [x] Adicionar paginação
- [ ] Adicionar filtro por tipo de alerta (futuro)
- [x] Adicionar link "Ver Histórico" na página de alertas

---

## Fase 35: Exportação de Dados em Excel/CSV 📊

### 35.1 Backend - Instalação
- [x] Instalar biblioteca xlsx (SheetJS)
- [x] Configurar tipos TypeScript

### 35.2 Backend - Funções de Exportação
- [x] Criar função exportMercadosToExcel() no backend
- [x] Criar função exportLeadsToExcel() no backend
- [x] Incluir todos os campos enriquecidos
- [x] Formatar colunas (datas, números, scores)

### 35.3 Backend - Routers tRPC
- [x] Criar router export.mercados (input: projectId, filtros)
- [x] Criar router export.leads (input: projectId, filtros)
- [x] Retornar buffer do arquivo Excel como base64

### 35.4 Frontend - Botões de Exportação
- [x] Adicionar botão "Exportar Excel" na página de mercados
- [x] CascadeView já possui exportação completa (CSV, Excel, PDF)
- [x] Implementar download automático do arquivo
- [x] Adicionar loading state durante exportação
- [x] Mostrar toast de sucesso/erro

---

## Fase 36: Dashboard de ROI e Conversão 💰

### 36.1 Backend - Tabela de Conversões
- [ ] Criar tabela lead_conversions no schema.ts
- [ ] Campos: id, leadId, projectId, convertedAt, dealValue, notes, status
- [ ] Executar pnpm db:push
- [ ] Criar funções CRUD no db.ts

### 36.2 Backend - Análise de ROI
- [ ] Criar função calculateROIMetrics() no backend
- [ ] Calcular taxa de conversão por mercado
- [ ] Calcular valor médio de deal
- [ ] Calcular custo de aquisição por lead
- [ ] Calcular ROI total do projeto

### 36.3 Backend - Router tRPC
- [ ] Criar router conversion.create (marcar lead como convertido)
- [ ] Criar router conversion.list (listar conversões)
- [ ] Criar router roi.metrics (retornar métricas calculadas)

### 36.4 Frontend - Página de ROI
- [ ] Criar página ROIDashboard.tsx
- [ ] Adicionar rota /roi no App.tsx
- [ ] Adicionar item "ROI" no MainNav
- [ ] Implementar cards de métricas principais
- [ ] Criar gráfico de conversão por mercado
- [ ] Criar tabela de leads convertidos
- [ ] Adicionar formulário para marcar lead como convertido

### 36.5 Integração
- [ ] Adicionar botão "Marcar como Convertido" na página de leads
- [ ] Implementar modal de conversão (valor do deal, notas)
- [ ] Atualizar status do lead após conversão

---

## Fase 37: Testes e Validação Final 🧪
- [ ] Testar histórico de alertas
- [ ] Testar exportação de mercados
- [ ] Testar exportação de leads
- [ ] Testar dashboard de ROI
- [ ] Testar marcação de conversão
- [ ] Criar checkpoint final


---

## Fase 37: Dashboard de ROI e Conversão 💰

### 37.1 Backend - Tabela de Conversões
- [x] Criar tabela lead_conversions no schema.ts
- [x] Campos: id, leadId, projectId, convertedAt, dealValue, notes, status
- [x] Executar criação via SQL
- [x] Criar funções CRUD no db.ts

### 37.2 Backend - Métricas de ROI
- [x] Criar função calculateROIMetrics() no backend
- [x] Calcular taxa de conversão por mercado
- [x] Calcular valor médio de deal
- [x] Calcular ROI total do projeto

### 37.3 Backend - Routers tRPC
- [x] Criar router conversion.create
- [x] Criar router conversion.list
- [x] Criar router roi.metrics

### 37.4 Frontend - Página de ROI
- [x] Criar página ROIDashboard.tsx
- [x] Adicionar rota /roi no App.tsx
- [x] Implementar cards de métricas principais
- [x] Criar tabela de leads convertidos
- [x] Adicionar formulário para marcar lead como convertido

---

## Fase 38: Agendamento de Enriquecimento Recorrente ⏰

### 38.1 Backend - Sistema de Agendamento
- [ ] Verificar tabela scheduled_enrichments existente
- [ ] Criar função scheduleRecurringEnrichment() no db.ts
- [ ] Implementar lógica de recorrência (diário, semanal, mensal)

### 38.2 Backend - Routers tRPC
- [ ] Criar router schedule.create
- [ ] Criar router schedule.list
- [ ] Criar router schedule.delete

### 38.3 Frontend - Interface de Agendamento
- [ ] Criar componente ScheduleEnrichment.tsx
- [ ] Adicionar seletor de frequência (diário, semanal, mensal)
- [ ] Adicionar seletor de horário
- [ ] Mostrar lista de agendamentos ativos

---

## Fase 39: Visualizações de Funil de Vendas 📊

### 39.1 Backend - Dados do Funil
- [ ] Criar função getFunnelData() no db.ts
- [ ] Contar leads por estágio
- [ ] Calcular taxa de conversão entre estágios

### 39.2 Backend - Router tRPC
- [ ] Criar router funnel.data

### 39.3 Frontend - Visualização
- [ ] Criar página FunnelView.tsx
- [ ] Implementar gráfico de funil com recharts
- [ ] Adicionar métricas de conversão entre estágios
- [ ] Identificar gargalos visualmente

---

## Fase 40: Redesign Completo - Tema Branco Moderno 🎨

### 40.1 Sistema de Cores
- [ ] Atualizar index.css com tema light
- [ ] Definir paleta de cores vibrantes (azul, verde, laranja, roxo, rosa)
- [ ] Atualizar variáveis CSS para tema claro

### 40.2 Componentes Base
- [ ] Atualizar Button com cores vibrantes
- [ ] Atualizar Card com sombras suaves
- [ ] Atualizar Badge com cores alegres
- [ ] Adicionar ícones coloridos em todos os componentes

### 40.3 Páginas Principais
- [ ] Redesign Home/CascadeView
- [ ] Redesign Dashboard
- [ ] Redesign EnrichmentFlow
- [ ] Redesign todas as páginas com tema claro

### 40.4 Navegação
- [ ] Atualizar MainNav com ícones coloridos
- [ ] Adicionar gradientes suaves
- [ ] Melhorar espaçamento e hierarquia visual

---

## Fase 41: Atualização de Rotas e Menus 🗺️

### 41.1 Auditoria de Rotas
- [ ] Listar todas as rotas implementadas
- [ ] Verificar rotas faltantes no App.tsx
- [ ] Adicionar rotas de ROI, Funil, Agendamento

### 41.2 Atualização do MainNav
- [ ] Adicionar item "ROI" no menu
- [ ] Adicionar item "Funil" no menu
- [ ] Reorganizar ordem dos itens
- [ ] Adicionar ícones coloridos

### 41.3 Breadcrumbs
- [ ] Verificar breadcrumbs em todas as páginas
- [ ] Adicionar onde estiver faltando

---

## Fase 42: Testes e Validação Final 🧪
- [ ] Testar Dashboard de ROI
- [ ] Testar Agendamento
- [ ] Testar Funil de Vendas
- [ ] Testar tema claro em todas as páginas
- [ ] Verificar navegação completa
- [ ] Criar checkpoint final


---

## Fase 43: Sistema de Agendamento de Enriquecimento Recorrente ⏰

### 43.1 Backend - Tabela de Agendamentos
- [x] Verificar se tabela scheduled_enrichments já existe
- [x] Tabela já existe com campos completos
- [x] Funções CRUD já existem no db.ts

### 43.2 Backend - Routers tRPC
- [x] Criar router schedule.create (input: projectId, scheduledAt, recurrence)
- [x] Criar router schedule.list (retorna agendamentos ativos)
- [x] Criar router schedule.cancel (input: id)
- [x] Criar router schedule.delete (input: id)

### 43.3 Frontend - Interface de Agendamento
- [x] Criar página SchedulePage.tsx
- [x] Adicionar seletor de frequência (uma vez, diário, semanal)
- [x] Mostrar lista de agendamentos ativos com status
- [x] Adicionar botões cancelar/deletar
- [x] Adicionar rota /agendamento no App.tsx
- [x] Adicionar item no MainNav

---

## Fase 44: Filtros Avançados na Página Inicial 🔍

### 44.1 Backend - Função de Filtragem
- [ ] Modificar getMercados() para aceitar filtros
- [ ] Adicionar filtro por CNAE
- [ ] Adicionar filtro por porte (MEI, Pequena, Média, Grande)
- [ ] Adicionar filtro por localização (cidade, UF)
- [ ] Adicionar filtro por score de qualidade

### 44.2 Frontend - Componente de Filtros
- [ ] Criar componente FilterPanel.tsx
- [ ] Adicionar input de busca por CNAE
- [ ] Adicionar seletor de porte
- [ ] Adicionar seletor de UF
- [ ] Adicionar input de cidade
- [ ] Adicionar slider de score mínimo
- [ ] Integrar filtros na página CascadeView

---

## Fase 45: Dashboard de Atividade Recente 📊

### 45.1 Backend - Tabela de Atividades
- [ ] Criar tabela activity_log (id, projectId, type, description, createdAt)
- [ ] Criar função logActivity() no db.ts
- [ ] Criar função getRecentActivities() no db.ts

### 45.2 Backend - Integração
- [ ] Adicionar log ao criar lead
- [ ] Adicionar log ao criar conversão
- [ ] Adicionar log ao disparar alerta
- [ ] Adicionar log ao concluir enriquecimento

### 45.3 Backend - Router tRPC
- [ ] Criar router activity.recent (input: projectId, limit)

### 45.4 Frontend - Componente de Timeline
- [ ] Criar componente ActivityTimeline.tsx
- [ ] Mostrar ícones por tipo de atividade
- [ ] Formatar datas relativas (há 2 horas, ontem, etc)
- [ ] Adicionar paginação
- [ ] Integrar na página DashboardPage

---

## Fase 46: Testes e Validação Final 🧪
- [ ] Testar agendamento de enriquecimento
- [ ] Testar filtros avançados
- [ ] Testar dashboard de atividades
- [ ] Criar checkpoint final


---

## Fase 47: Correção de Erros de React 🐛
- [x] Identificar componentes com nested anchor tags
- [x] Corrigir Link dentro de Link ou a dentro de a (MainNav)
- [x] Trocar <a> por <span> dentro de <Link>
- [ ] Testar e validar correções

---

## Fase 48: Filtros Avançados na Página Mercados 🔍
- [ ] Adicionar input de busca por CNAE
- [ ] Adicionar seletor de porte (MEI, Pequena, Média, Grande)
- [ ] Adicionar seletor de UF
- [ ] Adicionar input de cidade
- [ ] Adicionar slider de score mínimo
- [ ] Atualizar backend getMercados() para aceitar filtros
- [ ] Integrar filtros na página Mercados.tsx

---

## Fase 49: Dashboard de Atividade Recente 📊
- [ ] Criar tabela activity_log
- [ ] Criar função logActivity() no db.ts
- [ ] Criar função getRecentActivities() no db.ts
- [ ] Adicionar logs ao criar lead
- [ ] Adicionar logs ao criar conversão
- [ ] Adicionar logs ao disparar alerta
- [ ] Criar router activity.recent
- [ ] Criar componente ActivityTimeline.tsx
- [ ] Integrar na página DashboardPage

---

## Fase 50: Gráficos Interativos no Analytics 📈
- [ ] Adicionar gráfico de evolução temporal (mercados/clientes/leads)
- [ ] Adicionar gráfico de distribuição geográfica por UF
- [ ] Adicionar gráfico de densidade competitiva
- [ ] Usar recharts para visualizações
- [ ] Integrar na página Analytics


## Fase 51: Integração logActivity no ROI ⏰
- [x] Integrar logActivity() no ROIDashboard ao registrar conversão
- [x] Registrar tipo "conversion" com metadata (leadId, valor, status)
- [x] Testar registro de atividades na página /atividade

## Fase 52: Gráficos Interativos no Analytics 📊
- [x] Criar queries backend para evolução temporal (mercados/clientes/leads por mês)
- [x] Criar queries backend para distribuição geográfica (top 10 UFs)
- [x] Criar queries backend para segmentação (B2B/B2C/Ambos)
- [x] Implementar LineChart de evolução temporal
- [x] Implementar BarChart de distribuição por UF
- [x] Implementar PieChart de segmentação B2B/B2C
- [x] Criar página /analytics com os 3 gráficos
- [x] Adicionar filtros de período (3/6/12 meses)

## Fase 53: Sistema de Tags Personalizadas 🏷️
- [x] Criar tabela tags no banco (id, name, color)
- [x] Criar tabela entity_tags (junction table com FK)
- [x] Implementar funções CRUD no db.ts (getAllTags, createTag, deleteTag)
- [x] Criar routers tRPC para tags (list, create, delete)
- [x] Criar componente TagManager (CRUD interface)
- [x] Criar componente TagPicker (adicionar/remover tags de entidades)
- [x] Integrar filtros por tags nas páginas (mercados/clientes/concorrentes/leads)
- [x] Testar criação, edição e exclusão de tags


## Fase 54: Refinamento Visual e Remoção do Modo Dark 🎨

### 54.1 Remover Modo Dark
- [x] Desabilitar switchable no ThemeProvider (App.tsx)
- [x] Fixar defaultTheme="light"
- [x] Remover ThemeToggle de todas as páginas
- [x] Remover CSS variables do .dark no index.css

### 54.2 Refinar Paleta de Cores Light
- [x] Ajustar --background para branco/cinza muito claro
- [x] Ajustar --foreground para cinza escuro/preto
- [x] Refinar cores de accent, primary, secondary
- [x] Melhorar cores de border, input, ring
- [x] Garantir contraste WCAG AA em todos os textos

### 54.3 Polir Componentes
- [x] Refinar CascadeView (backgrounds, cards, espaçamentos)
- [x] Polir Dashboard (gradientes sutis, sombras)
- [x] Melhorar Analytics (cores de gráficos, cards)
- [x] Ajustar ROIDashboard para tema light
- [x] Padronizar FunnelView, AtividadePage, AlertsPage
- [ ] Melhorar MainNav (background, hover states)

### 54.4 Tipografia e Espaçamento
- [ ] Revisar tamanhos de fonte (hierarquia clara)
- [ ] Ajustar line-height para melhor legibilidade
- [ ] Padronizar espaçamentos (padding, margin, gap)
- [ ] Melhorar font-weight (títulos vs corpo)

### 54.5 Sombras e Bordas
- [ ] Criar sistema de sombras consistente (sm, md, lg)
- [ ] Padronizar border-radius
- [ ] Ajustar opacidade de bordas
- [ ] Melhorar hover/focus states


## Fase 55: Melhorias Avançadas de UX 🚀

### 55.1 Micro-animações de Feedback
- [x] Adicionar animação de ripple em botões ao clicar
- [x] Criar animação de pulse em cards ao hover
- [x] Implementar animação de shake em erros de validação
- [x] Adicionar spinner animado em estados de loading
- [x] Criar toast animado para success/error/info
- [x] Implementar fade-in suave em modais e dialogs

### 55.2 Modo Compacto/Densidade
- [x] Criar CompactModeContext para gerenciar estado
- [x] Criar toggle de densidade no header
- [x] Ajustar padding/spacing em modo compacto (cards, listas)
- [x] Reduzir tamanhos de fonte em modo compacto
- [x] Persistir preferência no localStorage
- [x] Aplicar modo compacto em todas as páginas principais

### 55.3 Atalhos de Teclado
- [x] Criar hook useKeyboardShortcuts
- [x] Implementar Ctrl+K para abrir busca global
- [x] Implementar Ctrl+N para novo projeto
- [x] Implementar setas (↑↓) para navegação em listas
- [x] Implementar Esc para fechar modais
- [x] Implementar Enter para confirmar ações
- [x] Criar modal de ajuda (Ctrl+?) mostrando todos os atalhos
- [x] Adicionar indicadores visuais de atalhos nos botões


## Fase 56: Funcionalidades Avançadas 🎯

### 56.1 Busca Global Avançada
- [x] Instalar biblioteca fuse.js para fuzzy search
- [x] Criar componente GlobalSearch modal
- [x] Criar query backend para busca unificada (mercados/clientes/concorrentes/leads)
- [x] Implementar fuzzy search no frontend
- [x] Adicionar categorização de resultados por tipo
- [x] Implementar navegação por teclado nos resultados (↑↓)
- [x] Adicionar highlight de termos encontrados
- [x] Integrar Ctrl+K para abrir modal
- [ ] Adicionar histórico de buscas recentes

### 56.2 Onboarding Interativo
- [x] Instalar biblioteca react-joyride para tour guiado
- [x] Criar componente OnboardingTour
- [x] Definir steps do tour (modo compacto, atalhos, filtros, tags, etc)
- [x] Criar context OnboardingContext para gerenciar estado
- [x] Persistir status de conclusão do tour no localStorage
- [x] Adicionar botão "Iniciar Tour" no menu
- [x] Criar tooltips com destaque visual
- [x] Implementar skip/next/back navigation
- [x] Adicionar opção "Não mostrar novamente"

### 56.3 Personalização de Dashboard
- [x] Instalar biblioteca react-grid-layout para drag & drop
- [x] Criar DashboardCustomizationContext
- [x] Implementar grid layout responsivo
- [x] Criar painel de configuração de widgets
- [x] Permitir mostrar/ocultar cards individuais
- [x] Implementar drag & drop de cards
- [x] Salvar layout personalizado no localStorage
- [x] Criar botão "Resetar Layout Padrão"
- [ ] Adicionar preview de layouts pré-definidos
- [x] Implementar resize de cards


## Fase 57: Auditoria e Refinamento Visual Completo 🎨

### 57.1 Auditoria de Páginas
- [x] Auditar CascadeView (página inicial)
- [x] Auditar Dashboard e DashboardPage
- [x] Auditar AnalyticsPage e AnalyticsDashboard
- [x] Auditar ROIDashboard
- [x] Auditar FunnelView
- [x] Auditar MercadoDetalhes
- [x] Auditar EnrichmentFlow e EnrichmentProgress
- [x] Auditar AlertsPage e AlertHistoryPage
- [x] Auditar ReportsPage, SchedulePage, AtividadePage
- [x] Documentar problemas encontrados

### 57.2 Padronização de Botões
- [x] Definir paleta padrão (primary, secondary, ghost, outline)
- [x] Substituir todos os botões por variantes padronizadas
- [x] Remover cores inconsistentes (verde, vermelho custom, etc)
- [x] Garantir hover states consistentes
- [x] Padronizar tamanhos (sm, default, lg)

### 57.3 Unificação de Backgrounds
- [x] Converter todas as páginas para bg-slate-50 ou bg-white
- [x] Remover gradientes escuros (from-slate-950, from-gray-900)
- [x] Padronizar cards com bg-white e shadow-sm
- [x] Ajustar cores de texto para tema light
- [x] Garantir contraste WCAG AA

### 57.4 Centralização e Responsividade
- [x] Envolver todo conteúdo em .container ou max-w-7xl mx-auto
- [x] Adicionar padding horizontal responsivo (px-4 sm:px-6 lg:px-8)
- [x] Remover larguras fixas que causam overflow
- [x] Garantir scroll apenas vertical
- [x] Testar em mobile (375px), tablet (768px), desktop (1280px+)
- [x] Corrigir quebras de layout em telas pequenas


## Fase 58: Funcionalidades Avançadas de Produtividade 🚀

### 58.1 Filtros Salvos Compartilháveis
- [x] Criar tabela saved_filters no banco (id, nome, userId, projectId, filters JSON, isPublic, shareToken)
- [x] Implementar funções CRUD no db.ts (createSavedFilter, getSavedFilters, deleteSavedFilter)
- [x] Criar routers tRPC (filter.save, filter.list, filter.delete, filter.getByToken)
- [x] Criar componente SavedFiltersManager
- [x] Adicionar botão "Salvar Filtros" no CascadeView
- [x] Implementar modal de salvar com nome e opção "Compartilhável"
- [x] Gerar shareToken único para filtros públicos
- [x] Criar rota /filtros/:token para aplicar filtros via link
- [x] Adicionar botão "Copiar Link" para compartilhar

### 58.2 Comparação de Mercados Side-by-Side
- [x] Criar query backend compareMercados (recebe array de mercadoIds)
- [x] Retornar métricas: total clientes, concorrentes, leads, qualidade média
- [x] Criar componente CompararMercadosModal
- [x] Implementar seleção de 2-3 mercados (checkboxes)
- [x] Criar layout side-by-side com cards comparativos
- [x] Adicionar gráficos comparativos (BarChart de métricas)
- [x] Implementar tabela comparativa de detalhes
- [x] Adicionar botão "Comparar Selecionados" no CascadeView
- [ ] Exportar comparação em PDF

### 58.3 Modo Apresentação Fullscreen
- [ ] Criar context PresentationModeContext
- [ ] Implementar toggle fullscreen (F11 programático)
- [ ] Criar componente PresentationView
- [ ] Ocultar sidebar, header e controles de edição
- [ ] Destacar apenas KPIs e gráficos principais
- [ ] Implementar navegação por slides (setas ←→)
- [ ] Adicionar transições suaves entre slides
- [ ] Criar slides: Overview, Mercados Top 10, Funil, ROI, Timeline
- [ ] Adicionar botão "Modo Apresentação" no Dashboard
- [ ] Implementar ESC para sair do modo


## Fase 59: Integração Final dos Componentes 🔗

- [x] Integrar SavedFiltersManager no CascadeView
- [x] Adicionar estado de filtros atuais no CascadeView
- [x] Integrar CompararMercadosModal no CascadeView
- [x] Adicionar seleção múltipla de mercados (checkboxes)
- [x] Adicionar botão "Comparar Selecionados"
- [x] Testar salvamento e aplicação de filtros
- [x] Testar comparação de mercados


## Fase 60: Auditoria de Dados 🔍

- [ ] Consultar contagem real de mercados no banco
- [ ] Consultar contagem real de clientes no banco
- [ ] Consultar contagem real de concorrentes no banco
- [ ] Consultar contagem real de leads no banco
- [ ] Verificar valores exibidos no dashboard
- [ ] Comparar e documentar diferenças
- [ ] Corrigir queries se necessário


## Fase 61: Correção de Valores Hardcoded 🔧

- [x] Criar getTotalConcorrentes() no db.ts
- [x] Criar getTotalLeads() no db.ts
- [x] Criar getTotalMercados() no db.ts
- [x] Criar getTotalClientes() no db.ts
- [x] Criar endpoint tRPC stats.totals
- [x] Atualizar CascadeView para usar trpc.stats.totals
- [x] Auditar todo o código frontend para valores fixos
- [x] Documentar todos os valores hardcoded encontrados
- [x] Corrigir todos os valores fixos identificados
