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
