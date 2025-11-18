# Guia de Uso: Navegação em Cascata - Gestor PAV

**Versão**: 2.0  
**Data**: 18 de novembro de 2025  
**Autor**: Manus AI

---

## Visão Geral

O Gestor PAV agora utiliza uma **interface em cascata (drill-down)** que permite navegar hierarquicamente pelos dados de pesquisa de mercado. A estrutura segue o fluxo natural:

```
MERCADO → CLIENTES | CONCORRENTES | LEADS
```

Ao expandir um mercado, você visualiza simultaneamente os três tipos de dados em colunas lado a lado, facilitando a análise holística e a validação organizada.

---

## Interface Principal

### Header Global

O header fixo no topo contém todos os controles globais:

**Lado Esquerdo**:
- **Logo e Título**: "GESTOR PAV"
- **Subtitle**: Mostra o total de mercados disponíveis

**Centro**:
- **Filtros de Status**: 4 botões para filtrar dados
  - **Todos**: Exibe todos os itens (padrão)
  - **Pendentes**: Apenas itens não validados
  - **Validados**: Apenas itens marcados como "Rico"
  - **Descartados**: Apenas itens descartados

**Lado Direito**:
- **Botão Fila**: Abre o painel lateral com itens selecionados (badge mostra quantidade)
- **Botão Light/Dark**: Ícone de sol/lua para alternar tema

---

## Navegação Hierárquica

### Nível 1: Lista de Mercados

A tela inicial exibe todos os 73 mercados em cards compactos:

**Informações em cada card**:
- Nome do mercado
- Segmentação (B2B, B2C, B2B2C) em pill badge
- Categoria (se disponível)
- Contadores:
  - Clientes (ícone azul)
  - Concorrentes (ícone laranja, ~8)
  - Leads (ícone verde, ~10)
- Ícone de expansão (chevron)

**Interação**:
- **Clique no card**: Expande o mercado e mostra as 3 colunas
- **Hover**: Leve elevação do card
- **Mercado expandido**: Borda colorida destacada

### Nível 2: Conteúdo Expandido (3 Colunas)

Ao clicar em um mercado, aparecem 3 colunas lado a lado:

#### Coluna 1: Clientes
- Lista de todos os clientes associados ao mercado
- Cada item mostra:
  - **Checkbox**: Para seleção múltipla
  - **Nome**: Nome do cliente
  - **Badge de status**: Pendente/Rico/Precisa Ajuste/Descartado
  - **Botão "Validar"**: Abre modal de validação individual

#### Coluna 2: Concorrentes
- Lista de concorrentes mapeados para o mercado
- Mesma estrutura da coluna de clientes

#### Coluna 3: Leads
- Lista de leads qualificados para o mercado
- Mesma estrutura da coluna de clientes

**Comportamento**:
- **Scroll independente**: Cada coluna tem scroll próprio (altura máxima: 96 unidades)
- **Filtro aplicado**: As colunas respeitam o filtro de status selecionado no header
- **Animação**: Expansão suave com slide-in (300ms)
- **Scroll automático**: A página rola automaticamente para o mercado expandido

### Colapsar Mercado

Para colapsar um mercado expandido:
- Clique novamente no card do mercado
- Clique em outro mercado (o anterior colapsa automaticamente - accordion behavior)

---

## Fila de Trabalho

A fila de trabalho permite organizar itens para validação em lote.

### Adicionar Itens à Fila

1. **Expanda um mercado**
2. **Marque os checkboxes** dos itens que deseja adicionar
3. **Observe o contador** no botão "Fila" aumentar
4. **Navegue para outros mercados** e continue selecionando itens

**Dica**: Você pode selecionar itens de múltiplos mercados diferentes!

### Abrir Painel Lateral

Clique no botão **"Fila"** no header para abrir o painel lateral.

**Conteúdo do painel**:
- **Header**: Título e contador de itens
- **Lista agrupada por mercado**: Itens organizados por mercado de origem
- **Badges de tipo**: Cada item mostra se é Cliente/Concorrente/Lead
- **Botão X**: Remove item individual da fila
- **Ações em lote** (rodapé):
  - **Validar Todos como Rico**: Marca todos os itens da fila como "Rico"
  - **Descartar Todos**: Marca todos como "Descartado"
  - **Limpar Fila**: Remove todos os itens sem validar

### Validar em Lote

1. Adicione itens à fila (de um ou mais mercados)
2. Abra o painel lateral
3. Revise a lista
4. Clique em **"Validar Todos como Rico"** ou **"Descartar Todos"**
5. Aguarde a confirmação (toast de sucesso)
6. A fila é limpa automaticamente

**Vantagem**: Valide 10, 20 ou mais itens com apenas 1 clique!

---

## Validação Individual

Para validar um item específico com mais controle:

1. **Expanda o mercado**
2. **Clique no botão "Validar"** ao lado do item
3. **Modal abre** com opções:
   - **Status**: Rico / Precisa Ajuste / Descartado
   - **Observações**: Campo de texto livre para anotações
4. **Confirme** clicando em "Salvar"

**Quando usar**:
- Itens que precisam de notas detalhadas
- Validação com status "Precisa Ajuste" (não disponível em lote)
- Revisão cuidadosa de itens críticos

---

## Filtros de Status

Os filtros no header afetam **todos os níveis** da interface:

### Filtro "Todos" (padrão)
- Exibe todos os mercados
- Nas colunas expandidas, mostra todos os itens

### Filtro "Pendentes"
- Exibe apenas mercados que têm itens pendentes
- Nas colunas, mostra apenas itens com status "Pendente"
- **Uso recomendado**: Identificar rapidamente o que precisa ser validado

### Filtro "Validados"
- Exibe apenas mercados com itens validados
- Nas colunas, mostra apenas itens com status "Rico"
- **Uso recomendado**: Revisar trabalho concluído

### Filtro "Descartados"
- Exibe apenas mercados com itens descartados
- Nas colunas, mostra apenas itens com status "Descartado"
- **Uso recomendado**: Revisar decisões de descarte

**Dica**: Alterne entre filtros para diferentes fluxos de trabalho!

---

## Persistência de Dados

O sistema salva automaticamente seu progresso:

### LocalStorage
- **Fila de trabalho**: Itens selecionados são salvos no navegador
- **Restauração automática**: Ao reabrir o sistema, a fila é restaurada
- **Independente de sessão**: Funciona mesmo após fechar o navegador

### Banco de Dados
- **Status de validação**: Salvo permanentemente no banco
- **Notas**: Observações são armazenadas junto com cada item
- **Timestamp**: Data e hora da última validação

---

## Fluxos de Trabalho Recomendados

### Cenário 1: Validação Rápida de um Mercado

**Objetivo**: Validar todos os clientes pendentes de um mercado específico

1. Clique no filtro **"Pendentes"**
2. Localize o mercado desejado
3. Clique para expandir
4. Marque os checkboxes de todos os clientes
5. Clique em **"Fila"**
6. Clique em **"Validar Todos como Rico"**

**Tempo estimado**: ~30 segundos

### Cenário 2: Criar Fila Priorizada

**Objetivo**: Selecionar itens prioritários de múltiplos mercados para validar ao longo do dia

1. Clique no filtro **"Pendentes"**
2. Navegue pelos mercados
3. Selecione apenas itens de alta prioridade (ex: clientes com maior potencial)
4. Acumule itens de 5-10 mercados diferentes
5. Abra a fila e revise
6. Valide em lote ou individualmente conforme necessário

**Vantagem**: Crie um plano de trabalho estruturado

### Cenário 3: Revisão de Qualidade

**Objetivo**: Revisar itens já validados para garantir consistência

1. Clique no filtro **"Validados"**
2. Expanda mercados um por um
3. Revise os itens marcados como "Rico"
4. Se encontrar erro, clique em **"Validar"** e altere o status
5. Adicione notas explicativas

**Uso**: Controle de qualidade periódico

### Cenário 4: Análise Comparativa

**Objetivo**: Comparar concorrentes de mercados similares

1. Clique no filtro **"Todos"**
2. Expanda o primeiro mercado
3. Foque na coluna **"Concorrentes"**
4. Anote mentalmente os principais concorrentes
5. Colapsa e expanda o próximo mercado
6. Compare os concorrentes
7. (Opcional) Exporte dados via CSV para análise externa

**Uso**: Inteligência competitiva

---

## Atalhos e Dicas

### Navegação Eficiente

- **Scroll suave**: O sistema rola automaticamente para o mercado expandido
- **Accordion behavior**: Apenas um mercado expandido por vez (evita sobrecarga visual)
- **Filtros persistentes**: O filtro selecionado é mantido ao navegar entre mercados

### Seleção Múltipla

- **Checkbox individual**: Clique no checkbox para selecionar/desselecionar
- **Propagação de evento**: O checkbox não expande/colapsa o mercado (evento stopPropagation)
- **Feedback visual**: Contador no botão "Fila" atualiza em tempo real

### Performance

- **Lazy loading**: Dados de clientes/concorrentes/leads são carregados apenas ao expandir
- **Virtualização**: Listas longas são otimizadas (scroll suave mesmo com 100+ itens)
- **Cache**: Dados já carregados são mantidos em cache (navegação rápida)

---

## Alternância de Tema

O sistema suporta dois temas:

### Tema Dark (padrão)
- Background radial gradient profundo (#020617)
- Cards com glassmorphism
- Ideal para trabalho prolongado (menos cansaço visual)

### Tema Light
- Background claro
- Cards com bordas sutis
- Ideal para ambientes bem iluminados

**Alternar**: Clique no ícone de sol/lua no header (canto superior direito)

---

## Estatísticas e Dados

### Totais
- **73 mercados** únicos
- **800 clientes** enriquecidos
- **591 concorrentes** mapeados
- **727 leads** qualificados
- **Total**: 2.991 registros

### Média por Mercado
- ~10.96 clientes/mercado
- ~8.10 concorrentes/mercado
- ~9.96 leads/mercado

---

## Solução de Problemas

### Fila não está salvando

**Causa**: LocalStorage desabilitado no navegador  
**Solução**: Habilite cookies e armazenamento local nas configurações do navegador

### Mercado não expande

**Causa**: Dados ainda estão carregando  
**Solução**: Aguarde o spinner desaparecer antes de clicar

### Validação em lote falhou

**Causa**: Erro de conexão com o banco de dados  
**Solução**: Verifique a conexão e tente novamente. Os itens permanecem na fila.

### Filtro não está funcionando

**Causa**: Cache do navegador  
**Solução**: Recarregue a página (F5 ou Ctrl+R)

---

## Próximas Melhorias

Funcionalidades planejadas para futuras versões:

1. **Atalhos de teclado**: Navegação com setas, Enter para validar, Esc para fechar
2. **Exportação filtrada**: CSV apenas dos itens visíveis no filtro atual
3. **Busca por texto**: Campo de busca global para encontrar mercados/clientes por nome
4. **Visualizações gráficas**: Gráficos de progresso de validação no Dashboard
5. **Validação em sequência**: Botões "Anterior/Próximo" no modal para validar múltiplos itens sem fechar

---

**Documentação preparada por**: Manus AI  
**Projeto**: Gestor de Pesquisa de Mercado PAV  
**Versão**: Navegação em Cascata 2.0

