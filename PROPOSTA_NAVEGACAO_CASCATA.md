# Proposta: Navegação em Cascata (Drill-Down) - Gestor PAV

**Data**: 18 de novembro de 2025  
**Autor**: Manus AI  
**Versão**: 1.0

---

## Resumo Executivo

Esta proposta apresenta uma solução completa de redesign da navegação do Gestor PAV, transformando a interface atual baseada em páginas separadas em um sistema de **navegação hierárquica em cascata (drill-down)**. O objetivo é criar uma experiência fluida e organizada que permita ao usuário navegar naturalmente pela hierarquia **Mercado → Clientes → Concorrentes → Leads**, com filtros de status integrados e um sistema de fila de trabalho para validação eficiente dos 2.991 registros.

---

## Análise da Situação Atual

### Problemas Identificados

A interface atual do Gestor PAV apresenta os seguintes desafios de usabilidade:

**Navegação fragmentada**: O usuário precisa clicar em um mercado, navegar para uma página separada, alternar entre abas (Clientes/Concorrentes/Leads) e voltar para selecionar outro mercado. Este fluxo quebra a continuidade do trabalho e dificulta a comparação entre mercados.

**Falta de contexto visual**: Ao visualizar clientes de um mercado, o usuário perde a visão geral dos outros mercados. Não há como ver rapidamente quantos itens pendentes existem em cada nível da hierarquia sem navegar manualmente.

**Ausência de fila de trabalho**: Não existe um mecanismo para o usuário criar uma lista organizada de itens que precisam ser validados. O trabalho é feito de forma ad-hoc, sem priorização ou rastreamento de progresso.

**Filtros limitados**: Os filtros de status (pendente/validado/descartado) não estão presentes de forma consistente em todos os níveis, dificultando a identificação rápida de itens que precisam de atenção.

**Tema não acessível**: Embora o sistema suporte alternância entre temas light e dark, não há um botão visível no header para facilitar a troca, tornando a funcionalidade pouco descobrível.

### Oportunidades de Melhoria

A estrutura hierárquica natural dos dados (Mercado → Clientes/Concorrentes/Leads) permite implementar uma interface em cascata que aproveita o padrão mental do usuário. Ao expandir um mercado, os três níveis subordinados (Clientes, Concorrentes, Leads) podem ser exibidos simultaneamente em cards compactos, permitindo uma visão holística e navegação fluida.

---

## Solução Proposta: Interface em Cascata

### Conceito Central

A nova interface será organizada em **níveis hierárquicos expansíveis**, onde cada elemento pode ser expandido para revelar seus subitens. A navegação segue o fluxo natural:

```
NÍVEL 1: Mercados (73 itens)
    ↓ [clique para expandir]
NÍVEL 2: Clientes (800 total) + Concorrentes (591 total) + Leads (727 total)
    ↓ [exibidos simultaneamente em 3 colunas]
NÍVEL 3: Detalhes e validação individual
```

### Estrutura Visual

A interface será dividida em **4 seções principais**:

#### 1. Header Global (fixo no topo)

O header conterá os controles globais que afetam toda a visualização:

- **Logo e título** "GESTOR PAV" (esquerda)
- **Filtro de status** com 4 opções: Todos, Pendentes, Validados, Descartados (centro)
- **Contador de selecionados** para fila de trabalho (centro-direita)
- **Botão Light/Dark** com ícone de sol/lua (direita)
- **Botão "Fila de Trabalho"** que abre painel lateral (direita)

#### 2. Área de Navegação em Cascata (scrollável)

Esta é a área principal onde a hierarquia é exibida. A visualização funciona da seguinte forma:

**Estado inicial** (nenhum mercado selecionado):
- Grid de cards compactos (3-4 colunas) mostrando os 73 mercados
- Cada card exibe: nome do mercado, segmentação (pill badge), contadores de status (pendente/validado/descartado) para cada tipo (clientes/concorrentes/leads)
- Hover effect: elevação sutil do card
- Click: expande o mercado e mostra os níveis subordinados

**Estado expandido** (mercado selecionado):
- O card do mercado selecionado se destaca visualmente (borda colorida, leve aumento de tamanho)
- Abaixo do mercado, aparecem **3 seções em colunas** lado a lado:
  - **Coluna 1: Clientes** (lista compacta com nome, status, botão validar)
  - **Coluna 2: Concorrentes** (lista compacta com nome, status, botão validar)
  - **Coluna 3: Leads** (lista compacta com nome, status, botão validar)
- Cada item nas colunas tem checkbox para adicionar à fila de trabalho
- Scroll automático para o mercado expandido
- Botão "Fechar" ou click fora para colapsar

**Navegação fluida**:
- Ao clicar em outro mercado, o anterior colapsa automaticamente (accordion behavior)
- Animação suave de expansão/colapso (300ms ease-in-out)
- Indicador visual de qual mercado está expandido

#### 3. Painel Lateral: Fila de Trabalho (deslizante)

Um painel que desliza da direita quando ativado, contendo:

- **Lista de itens selecionados** agrupados por mercado
- **Ações em lote**: Validar Todos, Descartar Todos, Limpar Fila
- **Contador de progresso**: X de Y itens validados
- **Botão "Processar Fila"**: abre modal de validação em lote

#### 4. Modal de Validação (overlay)

Mantém a funcionalidade atual de validação individual, mas com melhorias:

- Exibe contexto: "Validando Cliente X do Mercado Y"
- Botões rápidos: Rico, Precisa Ajuste, Descartar
- Campo de notas (opcional)
- Navegação: "Anterior" e "Próximo" para validar em sequência
- Atalho de teclado: Enter para confirmar, Esc para fechar

---

## Especificações Técnicas

### Componentes React

A implementação será baseada em componentes reutilizáveis e modulares:

**CascadeView** (componente principal):
- Gerencia estado global da navegação (mercado expandido, filtros ativos)
- Renderiza header, lista de mercados e painel lateral
- Controla animações de expansão/colapso

**MercadoCard** (card compacto de mercado):
- Props: mercado (dados), isExpanded (boolean), onToggle (callback)
- Exibe nome, segmentação, contadores de status
- Renderiza MercadoDetails quando expandido

**MercadoDetails** (conteúdo expandido):
- Renderiza 3 colunas: ClientesList, ConcorrentesList, LeadsList
- Gerencia seleção de itens para fila de trabalho

**ItemRow** (linha de cliente/concorrente/lead):
- Props: item (dados), type (cliente|concorrente|lead), onSelect (callback)
- Exibe nome, status badge, checkbox, botão validar
- Hover effect: destaque sutil

**FilaTrabalho** (painel lateral):
- Gerencia lista de itens selecionados
- Renderiza ações em lote
- Persiste estado no localStorage

**ThemeToggle** (botão de tema):
- Ícone animado (sol ↔ lua)
- Alterna entre light/dark
- Persiste preferência no localStorage

### Estado e Lógica

O estado da aplicação será gerenciado com React hooks:

```typescript
// Estado global da navegação
const [expandedMercadoId, setExpandedMercadoId] = useState<number | null>(null);
const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'rich' | 'discarded'>('all');
const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
const [filaOpen, setFilaOpen] = useState(false);

// Tipos
interface SelectedItem {
  id: number;
  type: 'cliente' | 'concorrente' | 'lead';
  mercadoId: number;
  name: string;
  status: string;
}
```

### Queries tRPC

As queries existentes serão otimizadas para suportar filtros:

```typescript
// Mercados com contadores de status
trpc.mercados.listWithStats.useQuery({ statusFilter });

// Itens de um mercado específico (clientes, concorrentes, leads)
trpc.mercados.getDetails.useQuery({ 
  mercadoId, 
  statusFilter 
});

// Validação em lote
trpc.validation.batchUpdate.useMutation();
```

### Persistência de Estado

O estado da navegação será persistido no localStorage para manter a experiência do usuário entre sessões:

- **Mercado expandido**: restaura o último mercado visualizado
- **Filtro de status**: mantém o filtro selecionado
- **Fila de trabalho**: preserva itens selecionados
- **Tema**: light/dark preference

---

## Wireframe da Interface

### Visão Geral (Estado Inicial)

```
┌─────────────────────────────────────────────────────────────────┐
│ GESTOR PAV    [Todos▼] [Pendentes] [Validados] [Descartados]   │
│                                              [☀/🌙] [Fila: 0]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Mercado 1│  │ Mercado 2│  │ Mercado 3│  │ Mercado 4│       │
│  │ B2B      │  │ B2C      │  │ B2B2C    │  │ B2B      │       │
│  │ ─────────│  │ ─────────│  │ ─────────│  │ ─────────│       │
│  │ 🟡 12    │  │ ✅ 8     │  │ 🟡 15    │  │ ✅ 10    │       │
│  │ ✅ 3     │  │ 🟡 5     │  │ ✅ 2     │  │ 🟡 4     │       │
│  │ ❌ 1     │  │ ❌ 0     │  │ ❌ 0     │  │ ❌ 1     │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Mercado 5│  │ Mercado 6│  │ Mercado 7│  │ Mercado 8│       │
│  │ ...      │  │ ...      │  │ ...      │  │ ...      │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visão Expandida (Mercado Selecionado)

```
┌─────────────────────────────────────────────────────────────────┐
│ GESTOR PAV    [Pendentes▼]                   [☀/🌙] [Fila: 3]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ▼ Embalagens Plásticas B2B            [Fechar X]  │        │
│  │   B2B · Indústria · 12 clientes                    │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐             │
│  │ CLIENTES    │ │ CONCORRENTES │ │ LEADS       │             │
│  │ 🟡 8 pend.  │ │ 🟡 5 pend.   │ │ 🟡 10 pend. │             │
│  ├─────────────┤ ├──────────────┤ ├─────────────┤             │
│  │ □ Cliente A │ │ □ Conc. X    │ │ □ Lead 1    │             │
│  │   🟡 Pend.  │ │   🟡 Pend.   │ │   🟡 Pend.  │             │
│  │   [Validar] │ │   [Validar]  │ │   [Validar] │             │
│  │             │ │              │ │             │             │
│  │ □ Cliente B │ │ □ Conc. Y    │ │ □ Lead 2    │             │
│  │   🟡 Pend.  │ │   ✅ Rico    │ │   🟡 Pend.  │             │
│  │   [Validar] │ │   [Ver]      │ │   [Validar] │             │
│  │             │ │              │ │             │             │
│  │ ...         │ │ ...          │ │ ...         │             │
│  └─────────────┘ └──────────────┘ └─────────────┘             │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Mercado 2│  │ Mercado 3│  │ Mercado 4│  (colapsados)       │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Painel Lateral: Fila de Trabalho

```
                                              ┌──────────────────┐
                                              │ FILA DE TRABALHO │
                                              │ [X Fechar]       │
                                              ├──────────────────┤
                                              │ 3 itens          │
                                              │ ─────────────    │
                                              │                  │
                                              │ Mercado 1:       │
                                              │ • Cliente A      │
                                              │ • Cliente B      │
                                              │                  │
                                              │ Mercado 3:       │
                                              │ • Lead 5         │
                                              │                  │
                                              │ ─────────────    │
                                              │ [Validar Todos]  │
                                              │ [Descartar Todos]│
                                              │ [Limpar Fila]    │
                                              │                  │
                                              └──────────────────┘
```

---

## Fluxo de Uso

### Cenário 1: Validar Itens Pendentes de um Mercado

O usuário deseja validar todos os clientes pendentes do mercado "Embalagens Plásticas B2B":

1. **Filtrar**: Seleciona "Pendentes" no filtro global do header
2. **Localizar**: Visualiza apenas mercados que têm itens pendentes (os cards mostram contadores filtrados)
3. **Expandir**: Clica no card "Embalagens Plásticas B2B"
4. **Visualizar**: As 3 colunas (Clientes, Concorrentes, Leads) aparecem, mostrando apenas itens pendentes
5. **Selecionar**: Marca os checkboxes dos clientes que deseja validar (ou usa "Selecionar Todos")
6. **Adicionar à fila**: Os itens selecionados aparecem no contador do header "Fila: 8"
7. **Processar**: Clica em "Fila de Trabalho", revisa a lista e clica "Validar Todos"
8. **Validar em lote**: Modal abre com opções Rico/Precisa Ajuste/Descartar e campo de notas
9. **Confirmar**: Aplica o status a todos os itens da fila
10. **Atualizar**: Os contadores são atualizados automaticamente, itens validados desaparecem do filtro "Pendentes"

### Cenário 2: Comparar Concorrentes de Múltiplos Mercados

O usuário deseja comparar os concorrentes de 3 mercados similares:

1. **Expandir mercado 1**: Clica no primeiro mercado
2. **Visualizar concorrentes**: Foca na coluna "Concorrentes"
3. **Anotar**: Mentalmente registra os principais concorrentes
4. **Colapsar**: Clica em outro mercado (o anterior colapsa automaticamente)
5. **Expandir mercado 2**: Visualiza concorrentes do segundo mercado
6. **Repetir**: Navega pelo terceiro mercado
7. **Exportar** (opcional): Usa botão de exportação para gerar CSV dos concorrentes filtrados

### Cenário 3: Criar Fila de Trabalho Organizada

O usuário deseja criar uma lista priorizada de itens para validar ao longo do dia:

1. **Filtrar**: Seleciona "Pendentes"
2. **Navegar**: Expande mercados um por um
3. **Selecionar**: Marca checkboxes de itens prioritários (ex: clientes com maior potencial)
4. **Acumular**: A fila cresce conforme seleciona itens de diferentes mercados
5. **Revisar**: Abre painel lateral "Fila de Trabalho" para ver lista completa
6. **Organizar**: Remove itens menos prioritários clicando no X ao lado de cada item
7. **Persistir**: Fecha o sistema - a fila é salva no localStorage
8. **Retomar**: Ao abrir o sistema novamente, a fila está preservada
9. **Processar**: Valida itens um por um ou em lote

---

## Benefícios da Solução

### Eficiência Operacional

A navegação em cascata reduz significativamente o número de cliques necessários para validar itens. Na interface atual, validar 10 clientes de um mercado requer: 1 clique no mercado + 1 clique na aba "Clientes" + 10 cliques em "Validar" + 10 cliques em "Confirmar" = **22 cliques**. Na nova interface, o usuário pode selecionar os 10 clientes com checkboxes, adicionar à fila e validar em lote: 1 clique no mercado + 10 cliques nos checkboxes + 1 clique em "Fila" + 1 clique em "Validar Todos" = **13 cliques** (redução de 41%).

### Contexto Visual Contínuo

Ao manter a lista de mercados visível mesmo quando um está expandido, o usuário nunca perde a visão geral. Os contadores de status em cada card de mercado fornecem feedback instantâneo sobre o progresso da validação, permitindo identificar rapidamente quais mercados precisam de atenção.

### Fila de Trabalho Organizada

A capacidade de selecionar itens de múltiplos mercados e agrupá-los em uma fila permite ao usuário criar um plano de trabalho estruturado. Isso é especialmente útil para equipes que precisam priorizar validações com base em critérios de negócio (ex: validar primeiro os leads de mercados de maior potencial).

### Descoberta de Padrões

A visualização simultânea de Clientes, Concorrentes e Leads de um mercado facilita a identificação de padrões e relações. Por exemplo, o usuário pode notar que mercados com muitos concorrentes grandes tendem a ter leads de menor qualidade, informação valiosa para estratégia de negócio.

### Acessibilidade e Usabilidade

O botão de alternância de tema no header torna a funcionalidade light/dark imediatamente descobrível. Usuários que trabalham em ambientes com diferentes condições de iluminação podem alternar facilmente sem precisar procurar nas configurações.

---

## Considerações de Performance

### Otimização de Renderização

Com 73 mercados e potencialmente centenas de itens visíveis simultaneamente, a performance é crítica. As seguintes otimizações serão implementadas:

**Virtualização de listas**: Usar `react-window` ou `react-virtual` para renderizar apenas os itens visíveis na viewport, reduzindo o número de elementos DOM.

**Memoização de componentes**: Usar `React.memo` nos componentes MercadoCard e ItemRow para evitar re-renderizações desnecessárias quando o estado global muda.

**Lazy loading**: Carregar os detalhes de um mercado (clientes/concorrentes/leads) apenas quando ele é expandido, não antecipadamente.

**Debouncing de filtros**: Aplicar debounce de 300ms nos filtros de busca para evitar queries excessivas ao banco de dados.

### Estratégia de Cache

As queries tRPC serão configuradas com cache agressivo para dados que mudam raramente (ex: lista de mercados) e invalidação seletiva para dados que mudam frequentemente (ex: status de validação).

---

## Cronograma de Implementação

A implementação será dividida em 4 fases incrementais:

### Fase 1: Estrutura Base (2-3 horas)
- Criar componente CascadeView
- Implementar lista de mercados com cards compactos
- Adicionar botão de tema light/dark no header
- Implementar expansão/colapso de mercados (sem conteúdo ainda)

### Fase 2: Conteúdo Expandido (3-4 horas)
- Criar componente MercadoDetails com 3 colunas
- Implementar ItemRow para clientes/concorrentes/leads
- Adicionar badges de status e contadores
- Integrar queries tRPC para carregar dados

### Fase 3: Filtros e Fila (2-3 horas)
- Implementar filtro global de status no header
- Criar componente FilaTrabalho (painel lateral)
- Adicionar checkboxes e seleção de itens
- Implementar persistência no localStorage

### Fase 4: Validação e Polimento (2-3 horas)
- Adaptar modal de validação para suportar lote
- Adicionar animações suaves de expansão/colapso
- Implementar scroll automático ao expandir
- Testar performance e responsividade
- Criar checkpoint final

**Tempo total estimado**: 9-13 horas de desenvolvimento

---

## Próximos Passos

Após aprovação desta proposta, o desenvolvimento seguirá o cronograma acima. Recomendo que você revise especialmente:

1. **Wireframes**: Confirme se a estrutura visual atende às suas expectativas
2. **Fluxo de uso**: Valide se os cenários cobrem seus casos de uso reais
3. **Fila de trabalho**: Confirme se a funcionalidade de seleção múltipla e validação em lote atende às necessidades

Estou pronto para iniciar a implementação assim que você aprovar a proposta ou sugerir ajustes!

---

**Documentação preparada por**: Manus AI  
**Projeto**: Gestor de Pesquisa de Mercado PAV  
**Versão do sistema**: 4e584f8e (Redesign MciGlobal)

