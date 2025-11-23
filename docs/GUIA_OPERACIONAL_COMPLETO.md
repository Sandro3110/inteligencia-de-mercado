# Guia Operacional Completo - Inteligência de Mercado

**Sistema:** Inteligência de Mercado  
**Versão:** 2.0  
**Data:** 20 de Novembro de 2025  
**Autor:** Manus AI  
**Tipo:** Guia Operacional e Documentação Técnica

---

## 📋 Sobre Este Documento

Este guia documenta o **estado atual completo** da plataforma Inteligência de Mercado, servindo como referência técnica e operacional para validação, manutenção e operação do sistema. O documento cobre arquitetura, funcionalidades, banco de dados, APIs e procedimentos operacionais.

---

## 🎯 Visão Geral do Sistema

A plataforma **Inteligência de Mercado** é uma solução full-stack desenvolvida para gerenciar pesquisas de mercado, enriquecimento de dados de clientes, concorrentes e leads, com foco em análise estratégica e tomada de decisão baseada em dados. O sistema oferece **23 módulos funcionais** organizados em uma arquitetura moderna, garantindo performance, escalabilidade e experiência de usuário otimizada.

### Propósito e Objetivos

O sistema permite que empresas identifiquem mercados potenciais, mapeiem clientes e concorrentes, gerem leads qualificados e analisem oportunidades de negócio através de enriquecimento automatizado de dados e dashboards interativos. A plataforma centraliza informações de múltiplos projetos de pesquisa, oferecendo visibilidade completa do pipeline de inteligência de mercado.

### Arquitetura Tecnológica

A aplicação utiliza uma arquitetura **full-stack TypeScript** com comunicação type-safe entre frontend e backend através de tRPC. A stack tecnológica foi escolhida para garantir produtividade de desenvolvimento, manutenibilidade e escalabilidade.

| Camada             | Tecnologia   | Versão | Descrição                                            |
| ------------------ | ------------ | ------ | ---------------------------------------------------- |
| **Frontend**       | React        | 19     | Interface de usuário moderna e responsiva            |
| **Estilização**    | Tailwind CSS | 4      | Design system consistente e customizável             |
| **Componentes**    | shadcn/ui    | -      | Biblioteca de componentes acessíveis e reutilizáveis |
| **Backend**        | Express      | 4      | Servidor HTTP robusto e performático                 |
| **API**            | tRPC         | 11     | Comunicação type-safe com validação automática       |
| **Banco de Dados** | MySQL/TiDB   | -      | Armazenamento persistente e escalável                |
| **ORM**            | Drizzle      | -      | Mapeamento objeto-relacional type-safe               |
| **Autenticação**   | Manus OAuth  | -      | Sistema de autenticação integrado e seguro           |
| **Agendamento**    | node-cron    | -      | Execução de tarefas recorrentes                      |

### Hierarquia de Dados

O sistema implementa uma hierarquia de três níveis para organização lógica dos dados, permitindo isolamento, rastreabilidade e análises comparativas.

```
PROJECT (Nível 1) - Workspace isolado por unidade de negócio
  │
  └─> PESQUISA (Nível 2) - Batch de importação/enriquecimento
       │
       └─> DADOS (Nível 3) - Mercados, Clientes, Concorrentes, Leads, Produtos
```

**Benefícios desta estrutura:**

- **Isolamento de dados** por projeto (ex: Agro, Embalagens, Industrial)
- **Rastreabilidade** de cada batch de enriquecimento com data e status
- **Análises comparativas** entre pesquisas e projetos diferentes
- **Filtros granulares** em todos os módulos do sistema

### Estatísticas Gerais

| Métrica                         | Valor Atual                             |
| ------------------------------- | --------------------------------------- |
| **Páginas/Rotas Implementadas** | 23 rotas funcionais                     |
| **Tabelas no Banco de Dados**   | 34 tabelas (schema.ts: 836 linhas)      |
| **Endpoints tRPC**              | ~80 endpoints (routers.ts: 1560 linhas) |
| **Componentes React**           | 23 páginas + componentes auxiliares     |
| **Projetos Ativos**             | 3 projetos configurados                 |
| **Registros no Banco**          | 28.869 registros (snapshot 19/11/2025)  |

---

## 🗺️ Estrutura de Navegação

### Sidebar Principal

O sistema utiliza um **sidebar lateral fixo** como navegação principal, organizado em 6 seções temáticas. O sidebar é colapsável (60px collapsed, 240px expanded) com persistência de estado no localStorage.

#### 1. 📊 Visão Geral

Esta seção oferece acesso rápido aos dashboards e estatísticas principais do sistema.

- **Dashboard** (`/dashboard`) - Dashboard principal com métricas gerais, gráficos de evolução e últimas atividades
- **Estatísticas** (`/dashboard-avancado`) - Dashboard avançado com análises detalhadas e customizáveis
- **Research Overview** (`/research-overview`) - Dashboard de inteligência de lead generation com funil de qualificação

#### 2. 🗂️ Dados

Seção dedicada ao gerenciamento de entidades de dados do sistema.

- **Mercados** (`/mercados`) - Lista e gerenciamento de mercados únicos identificados
- **Produtos** - Catálogo de produtos por cliente e mercado

#### 3. 🔍 Busca & Filtros

Ferramentas de busca e organização de dados.

- **Busca Global** - Busca unificada em todas as entidades
- **Filtros** - Filtros salvos e personalizados
- **Tags** - Gerenciamento de tags personalizadas

#### 4. ⚙️ Ações

Ações rápidas e operações principais do sistema.

- **Novo Projeto** - Criação de novo projeto de pesquisa
- **Exportar** - Exportação de dados filtrados (CSV/Excel)
- **Comparar** - Comparação entre projetos ou pesquisas
- **Validação** - Validação em lote de registros

#### 5. 📈 Análise

Módulos de análise e inteligência de dados.

- **Analytics** (`/analytics`) - Análises avançadas com cruzamento de dados
- **Analytics Dashboard** (`/analytics-dashboard`) - Dashboard avançado de analytics
- **ROI** (`/roi`) - Dashboard de ROI e conversões
- **Funil** (`/funil`) - Funil de vendas e conversão de leads
- **Relatórios** (`/relatorios`) - Geração de relatórios executivos em PDF
- **Atividades** (`/atividade`) - Log de atividades do sistema

#### 6. 🔧 Configurações

Configurações e automações do sistema.

- **Enriquecimento** (`/enrichment`) - Configuração e execução de enriquecimento
- **Alertas** (`/alertas`) - Configuração de alertas personalizados
- **Agendamentos** (`/agendamento`) - Agendamento de tarefas recorrentes

### Atalhos de Teclado

O sistema oferece atalhos de teclado para navegação rápida entre módulos principais.

| Atalho     | Ação                               |
| ---------- | ---------------------------------- |
| **Ctrl+1** | Navegar para Dashboard             |
| **Ctrl+2** | Navegar para Mercados              |
| **Ctrl+3** | Navegar para Analytics             |
| **Ctrl+4** | Navegar para ROI                   |
| **Ctrl+B** | Toggle sidebar (expandir/colapsar) |

### Breadcrumbs Dinâmicos

Todas as páginas principais incluem **breadcrumbs dinâmicos** no topo, oferecendo navegação contextual e indicação clara da localização atual no sistema. Os breadcrumbs são clicáveis e permitem retornar rapidamente a níveis superiores da hierarquia.

---

## 📄 Módulos e Funcionalidades

### 1. Página Inicial (Cascade View) - Rota: `/`

A tela inicial apresenta uma **visualização em cascata** que permite navegar hierarquicamente pelos dados do projeto selecionado. O usuário pode selecionar um mercado único e visualizar todos os clientes, concorrentes e leads associados a ele.

#### Componentes da Tela

**Seletor de Projeto**

Dropdown dinâmico localizado no topo da página que permite alternar entre projetos ativos. A seleção é persistida no localStorage e afeta todos os módulos do sistema. Opção "Todos os Projetos" disponível para visão agregada.

**Estatísticas Globais**

Quatro cards de métricas exibidos no sidebar esquerdo:

- **Mercados:** Total de mercados únicos identificados no projeto selecionado
- **Clientes:** Total de clientes cadastrados (empresas B2C ou B2B2C)
- **Concorrentes:** Total de concorrentes mapeados nos mercados
- **Leads:** Total de leads qualificados para prospecção

As estatísticas são atualizadas em tempo real conforme o projeto selecionado.

**Barra de Ações**

Localizada abaixo do seletor de projeto, oferece acesso rápido a ações principais:

- **Dashboard:** Acesso rápido ao dashboard principal
- **Monitorar Enriquecimento:** Acompanhamento em tempo real do progresso de enriquecimento
- **Exportar Filtrados:** Download de dados filtrados em formato CSV ou Excel
- **Novo Projeto:** Criação de novo projeto de pesquisa
- **Gerenciar Tags:** Administração de tags personalizadas

**Sistema de Filtros**

Área de filtros localizada abaixo da barra de ações:

- **Filtrar por Tags:** Seleção múltipla de tags para filtrar mercados
- **Segmentação:** Filtro por tipo de segmentação (B2C, B2B2C, B2B)
- **Salvar Filtros:** Persistência de combinações de filtros para reutilização
- **Limpar Filtros:** Reset rápido de todos os filtros aplicados

**Abas de Visualização**

Quatro abas para filtrar mercados por status de validação:

- **Todos:** Visão completa de todos os registros
- **Pendentes:** Registros aguardando validação manual
- **Validados:** Registros confirmados como relevantes
- **Descartados:** Registros rejeitados como não relevantes

**Grid de Mercados**

Exibição em grid de cards com mercados únicos. Cada card apresenta:

- Nome do mercado
- Segmentação (B2C/B2B2C/B2B)
- Número de clientes associados
- Indicador visual de status (pendente/validado/descartado)
- Botão para visualizar detalhes

Paginação disponível para grandes volumes de dados.

#### Fluxo de Uso

1. Usuário seleciona projeto no dropdown
2. Estatísticas globais são atualizadas
3. Usuário aplica filtros (tags, segmentação) se necessário
4. Usuário seleciona aba de visualização (Todos/Pendentes/Validados/Descartados)
5. Usuário clica em um mercado para visualizar detalhes em cascata
6. Sistema exibe clientes, concorrentes e leads associados ao mercado

---

### 2. Mercados - Rota: `/mercados`

O módulo de mercados oferece uma **visão aprofundada** de cada mercado único identificado durante a pesquisa, permitindo análise detalhada de características, validação e gerenciamento de dados associados.

#### Componentes da Tela

**Lista de Mercados**

Tabela com colunas principais:

- **Nome:** Nome do mercado identificado
- **Segmentação:** Tipo de segmentação (B2C/B2B2C/B2B)
- **Categoria:** Categoria do mercado (ex: Alimentos, Construção)
- **Clientes:** Número de clientes associados
- **Status:** Status de validação (pendente/validado/descartado)

A tabela oferece ordenação por qualquer coluna e busca por nome ou características. Indicadores visuais de status facilitam identificação rápida.

**Detalhes do Mercado** (`/mercado/:id`)

Ao clicar em um mercado, o usuário é direcionado para a página de detalhes que apresenta:

**Informações Completas do Mercado:**

- Nome e descrição do mercado
- Segmentação e categoria
- Tamanho estimado do mercado
- Taxa de crescimento anual
- Tendências identificadas
- Principais players do mercado

**Abas de Dados Associados:**

- **Clientes:** Lista de clientes que atuam neste mercado com dados completos (CNPJ, site, contato, porte, faturamento)
- **Concorrentes:** Lista de concorrentes identificados neste mercado com análise competitiva
- **Leads:** Lista de leads qualificados para este mercado com scoring de qualidade
- **Produtos:** Catálogo de produtos oferecidos por clientes neste mercado

**Histórico de Alterações:**

Timeline com todas as modificações realizadas no registro do mercado, incluindo:

- Data e hora da alteração
- Usuário responsável
- Tipo de alteração (criação/edição/validação/descarte)
- Campos modificados
- Valores anteriores e novos

#### Ações de Validação

Botões de ação disponíveis na página de detalhes:

- **Validar:** Confirmar mercado como relevante (status → validado)
- **Descartar:** Marcar mercado como não relevante (status → descartado)
- **Editar:** Modificar informações do mercado (abre modal de edição)
- **Adicionar Tags:** Categorização personalizada com tags

#### Fluxo de Uso

1. Usuário acessa `/mercados`
2. Usuário busca ou filtra mercados na lista
3. Usuário clica em um mercado para ver detalhes
4. Usuário navega pelas abas (Clientes/Concorrentes/Leads/Produtos)
5. Usuário valida, descarta ou edita o mercado conforme necessário
6. Usuário adiciona tags para categorização

---

### 3. Dashboard - Rota: `/dashboard`

O dashboard principal apresenta uma **visão consolidada** das métricas mais importantes do projeto selecionado, com gráficos interativos e indicadores de performance.

#### Componentes da Tela

**Cards de Métricas**

Seis cards principais exibidos no topo:

- **Total de Mercados:** Número absoluto com variação percentual (comparado ao período anterior)
- **Total de Clientes:** Número absoluto com variação percentual
- **Total de Concorrentes:** Número absoluto com variação percentual
- **Total de Leads:** Número absoluto com variação percentual
- **Taxa de Conversão:** Percentual de leads convertidos em oportunidades
- **ROI Estimado:** Retorno sobre investimento estimado baseado em conversões

**Gráficos Principais**

**Distribuição por Segmentação (Pie Chart):**

Gráfico de pizza mostrando a proporção entre B2C, B2B2C e B2B nos dados do projeto. Permite identificar rapidamente o foco principal do projeto.

**Evolução Temporal (Line Chart):**

Gráfico de linha com crescimento ao longo do tempo de:

- Número de mercados identificados
- Número de clientes cadastrados
- Número de leads gerados

Permite visualizar a velocidade de crescimento da base de dados.

**Top 10 Mercados (Bar Chart):**

Gráfico de barras horizontais com os 10 mercados mais relevantes, ordenados por:

- Número de clientes
- Número de leads
- Qualidade média dos leads

**Status de Validação (Donut Chart):**

Gráfico de rosca mostrando a proporção entre:

- Registros pendentes de validação
- Registros validados
- Registros descartados

Permite identificar rapidamente o progresso de validação.

**Tabela de Últimas Atividades**

Registro das 10 últimas ações realizadas no sistema:

- **Timestamp:** Data e hora da ação
- **Usuário:** Nome do usuário que realizou a ação
- **Tipo de Ação:** Criação/Edição/Validação/Descarte/Exportação
- **Detalhes:** Descrição breve da ação
- **Link:** Link direto para o registro afetado

#### Fluxo de Uso

1. Usuário acessa `/dashboard`
2. Sistema carrega métricas do projeto selecionado
3. Usuário visualiza cards de métricas principais
4. Usuário explora gráficos interativos (hover para detalhes)
5. Usuário clica em elementos dos gráficos para drill-down
6. Usuário revisa últimas atividades na tabela

---

### 4. Analytics - Rota: `/analytics`

O módulo de analytics oferece **análises aprofundadas** com cruzamento de dados, identificação de padrões e geração de insights acionáveis para tomada de decisão estratégica.

#### Componentes da Tela

**Filtros Globais**

Filtros aplicáveis a todas as análises:

- **Projeto:** Seleção de projeto específico ou "Todos"
- **Pesquisa:** Seleção de pesquisa específica dentro do projeto
- **Período:** Seleção de intervalo de datas para análise

**Análise de Mercado**

**Mapa de Calor de Concentração Geográfica:**

Visualização geográfica mostrando concentração de mercados por estado/região. Cores mais intensas indicam maior concentração. Permite identificar regiões com maior potencial.

**Análise de Saturação por Mercado:**

Tabela com métricas de saturação:

- Nome do mercado
- Número de concorrentes identificados
- Índice de saturação (0-100)
- Oportunidade estimada (baixa/média/alta)

**Identificação de Oportunidades:**

Lista de mercados subexplorados com alto potencial, ordenados por:

- Tamanho estimado do mercado
- Baixo número de concorrentes
- Taxa de crescimento anual

**Análise de Competitividade:**

Matriz mostrando nível de competitividade por mercado baseado em:

- Número de concorrentes
- Porte dos concorrentes
- Market share estimado

**Análise de Clientes**

**Segmentação por Porte:**

Gráfico de barras mostrando distribuição de clientes por porte:

- Pequeno (até 50 funcionários)
- Médio (51-500 funcionários)
- Grande (500+ funcionários)

**Análise de Faturamento Estimado:**

Histograma com distribuição de faturamento estimado dos clientes. Permite identificar perfil financeiro predominante.

**Distribuição Geográfica:**

Mapa mostrando distribuição de clientes por estado/região. Permite identificar concentração geográfica e oportunidades de expansão.

**Padrões de Comportamento:**

Análise de padrões identificados:

- Clientes multi-mercado (atuam em múltiplos mercados)
- Clientes com maior número de produtos
- Clientes com melhor qualidade de dados

**Análise de Concorrentes**

**Matriz de Posicionamento Competitivo:**

Matriz 2x2 com eixos:

- Eixo X: Porte do concorrente
- Eixo Y: Número de mercados em que atua

Permite identificar concorrentes mais relevantes e ameaças competitivas.

**Análise de Market Share Estimado:**

Gráfico de barras com market share estimado dos principais concorrentes por mercado. Baseado em:

- Porte do concorrente
- Número de estabelecimentos
- Faturamento declarado

**Identificação de Gaps Competitivos:**

Lista de mercados com baixa presença de concorrentes de grande porte, representando oportunidades de entrada.

**Benchmarking de Estratégias:**

Análise comparativa de estratégias de concorrentes:

- Canais de distribuição utilizados
- Segmentos atendidos
- Posicionamento de preço

**Análise de Leads**

**Scoring de Qualificação:**

Distribuição de leads por faixa de qualidade:

- Excelente (90-100 pontos)
- Bom (70-89 pontos)
- Regular (50-69 pontos)
- Baixo (0-49 pontos)

**Probabilidade de Conversão:**

Modelo preditivo que calcula probabilidade de conversão baseado em:

- Qualidade do lead (score)
- Porte da empresa
- Segmento de atuação
- Região geográfica

**Análise de Fit com ICP (Ideal Customer Profile):**

Comparação de cada lead com o perfil de cliente ideal definido. Métricas de fit:

- Fit de porte (pequeno/médio/grande)
- Fit de segmento
- Fit de região
- Fit de faturamento

**Recomendações de Priorização:**

Lista ordenada de leads recomendados para prospecção, baseada em:

- Score de qualidade
- Probabilidade de conversão
- Fit com ICP
- Urgência estimada

#### Exportação de Insights

Botão "Exportar Insights" disponível no topo da página. Gera relatório PDF com:

- Resumo executivo das análises
- Gráficos principais
- Tabelas de dados
- Recomendações estratégicas

#### Drill-Down em Gráficos

Todos os gráficos são interativos e permitem drill-down:

- Clicar em uma barra/fatia do gráfico filtra os dados
- Breadcrumb de filtros aplicados aparece no topo
- Botão "Limpar Filtros" para resetar

#### Fluxo de Uso

1. Usuário acessa `/analytics`
2. Usuário seleciona filtros globais (projeto, pesquisa, período)
3. Usuário explora análises de mercado
4. Usuário explora análises de clientes
5. Usuário explora análises de concorrentes
6. Usuário explora análises de leads
7. Usuário exporta insights em PDF

---

### 5. Enriquecimento - Rota: `/enrichment`

O módulo de enriquecimento permite configurar e executar processos automatizados de coleta e enriquecimento de dados de clientes, concorrentes e leads utilizando fontes externas e APIs.

#### Componentes da Tela

**Seletor de Template**

Dropdown com templates pré-configurados de enriquecimento:

- **Template Básico:** Enriquecimento de dados cadastrais (CNPJ, endereço, telefone)
- **Template Completo:** Enriquecimento completo incluindo dados financeiros, sociais e comerciais
- **Template Personalizado:** Seleção manual de campos a enriquecer

Cada template exibe preview da estrutura de dados que será enriquecida.

**Seletor de Modo de Execução**

Dois modos disponíveis:

**Modo Simultâneo (Parallel):**

Processa até N jobs ao mesmo tempo para maior velocidade. Configurações:

- Máximo de jobs paralelos (1-10)
- Timeout por job (segundos)
- Retry automático em caso de erro

**Modo Fila (Sequential):**

Processa um job por vez em ordem de prioridade. Configurações:

- Ordem de processamento (FIFO/LIFO/Prioridade)
- Intervalo entre jobs (segundos)
- Pausar fila em caso de erro

Status em tempo real da fila exibido abaixo do seletor.

**Configurações de Enriquecimento**

**Seleção de Entidades:**

Checkboxes para selecionar quais entidades enriquecer:

- Clientes
- Concorrentes
- Leads
- Mercados

**Limite de Registros por Execução:**

Input numérico para definir máximo de registros a processar em uma execução. Útil para testes ou controle de custos.

**Priorização de Registros:**

Dropdown com critérios de priorização:

- Mais recentes primeiro
- Mais antigos primeiro
- Maior qualidade primeiro
- Menor qualidade primeiro
- Aleatório

**Agendamento de Execução:**

Opção de agendar execução para data/hora específica ou configurar recorrência:

- Diária (horário específico)
- Semanal (dia da semana + horário)
- Mensal (dia do mês + horário)

**Botões de Ação**

Quatro botões principais:

- **Iniciar Enriquecimento:** Executar processo imediatamente com configurações atuais
- **Agendar:** Configurar execução recorrente (abre modal de agendamento)
- **Pausar:** Interromper execução em andamento (preserva estado)
- **Retomar:** Continuar execução pausada do ponto onde parou

#### Fluxo de Uso

1. Usuário acessa `/enrichment`
2. Usuário seleciona template de enriquecimento
3. Usuário seleciona modo de execução (Parallel/Sequential)
4. Usuário configura limite de registros e priorização
5. Usuário seleciona entidades a enriquecer
6. Usuário clica em "Iniciar Enriquecimento" ou "Agendar"
7. Sistema redireciona para `/enrichment-progress` para monitoramento

---

### 6. Monitoramento - Rota: `/enrichment-progress`

O módulo de monitoramento oferece **visibilidade completa** do progresso de enriquecimento em tempo real, com métricas detalhadas, logs de execução e alertas de erro.

#### Componentes da Tela

**Indicador de Progresso**

Barra de progresso visual no topo da página:

- **Barra de Progresso:** 0-100% com animação suave
- **Percentual de Conclusão:** Número grande e destacado
- **Tempo Decorrido:** Cronômetro desde o início da execução
- **Tempo Estimado Restante (ETA):** Cálculo baseado na taxa de processamento atual
- **Taxa de Processamento:** Registros por minuto

**Métricas Detalhadas**

Grid com 6 cards de métricas:

- **Total de Registros:** Número total a processar
- **Processados com Sucesso:** Número e percentual de registros enriquecidos com sucesso
- **Registros com Erro:** Número e percentual de registros que falharam
- **Registros Pendentes:** Número e percentual de registros aguardando processamento
- **Taxa de Sucesso:** Percentual geral de sucesso (processados / total)
- **Tempo Médio por Registro:** Tempo médio de processamento em segundos

**Log de Execução**

Stream em tempo real de eventos do processo de enriquecimento:

**Filtros de Log:**

Checkboxes para filtrar tipos de evento:

- Info (eventos informativos)
- Warning (avisos não críticos)
- Error (erros críticos)

**Estrutura de Cada Evento:**

- **Timestamp:** Data e hora do evento (HH:MM:SS)
- **Tipo:** Ícone e cor indicando tipo (info/warning/error)
- **Mensagem:** Descrição do evento
- **Detalhes:** Botão "Ver Detalhes" que expande informações técnicas (stack trace, payload, response)

**Auto-scroll:**

Toggle para ativar/desativar scroll automático para o evento mais recente.

**Notificações de Progresso**

Sistema de notificações toast que aparece automaticamente:

- **A cada 25% de progresso:** "25% concluído", "50% concluído", "75% concluído"
- **Ao concluir:** "Enriquecimento concluído com sucesso!"
- **Em caso de erro crítico:** "Erro crítico detectado. Verifique o log."
- **Ao concluir jobs na fila:** "Job X de Y concluído"

#### Fluxo de Uso

1. Usuário inicia enriquecimento em `/enrichment`
2. Sistema redireciona automaticamente para `/enrichment-progress`
3. Usuário acompanha barra de progresso e métricas
4. Usuário monitora log de execução em tempo real
5. Usuário recebe notificações toast a cada marco de progresso
6. Ao concluir, usuário pode retornar ao dashboard ou iniciar novo enriquecimento

---

### 7. Alertas - Rota: `/alertas`

O módulo de alertas permite configurar **notificações automáticas** baseadas em condições específicas, garantindo que o usuário seja informado sobre eventos importantes em tempo real.

#### Componentes da Tela

**Lista de Alertas Configurados**

Tabela com alertas existentes:

- **Nome:** Nome identificador do alerta
- **Condição:** Descrição da regra de disparo
- **Status:** Ativo/Inativo (toggle switch)
- **Última Execução:** Data e hora do último disparo
- **Ações:** Botões de editar, excluir, ativar/desativar

**Formulário de Criação de Alerta**

Modal ou seção expansível com campos:

**Nome do Alerta:**

Input de texto para identificação do alerta (ex: "Novo mercado de alto potencial").

**Tipo de Entidade:**

Dropdown para selecionar entidade monitorada:

- Mercado
- Cliente
- Concorrente
- Lead
- Sistema

**Condição de Disparo:**

Dropdown com regras pré-definidas:

- Novo registro criado
- Registro validado
- Registro descartado
- Campo específico alterado
- Threshold atingido (ex: "Mais de 100 leads em um mercado")
- Erro no sistema
- Enriquecimento concluído
- Enriquecimento com erro

**Configuração de Threshold (se aplicável):**

Inputs para configurar valores de threshold:

- Campo a monitorar
- Operador (>, <, =, >=, <=)
- Valor de referência

**Canal de Notificação:**

Checkboxes para selecionar canais:

- **Email:** Enviar email para endereço configurado
- **Notificação in-app:** Exibir notificação no sistema
- **Webhook:** Enviar POST request para URL configurada

**Configuração de Email (se selecionado):**

- Endereço de email destinatário
- Assunto do email
- Template de mensagem

**Configuração de Webhook (se selecionado):**

- URL do webhook
- Método HTTP (POST/PUT)
- Headers customizados
- Payload template (JSON)

**Frequência de Notificação:**

Radio buttons para selecionar frequência:

- **Imediato:** Notificar a cada ocorrência
- **Diário:** Resumo diário (horário configurável)
- **Semanal:** Resumo semanal (dia da semana + horário configurável)

**Histórico de Alertas** (`/alertas/historico`)

Página dedicada ao histórico de alertas disparados:

**Filtros:**

- Período (data início e fim)
- Tipo de alerta
- Status de entrega (enviado/falha)

**Tabela de Histórico:**

- **Timestamp:** Data e hora do disparo
- **Nome do Alerta:** Nome do alerta que disparou
- **Condição Atendida:** Descrição do que acionou o alerta
- **Canal:** Email/In-app/Webhook
- **Status de Entrega:** Enviado com sucesso/Falha
- **Detalhes:** Botão para ver payload completo e resposta

#### Fluxo de Uso

1. Usuário acessa `/alertas`
2. Usuário clica em "Novo Alerta"
3. Usuário preenche formulário de criação
4. Usuário seleciona condição de disparo e threshold
5. Usuário seleciona canais de notificação
6. Usuário configura frequência
7. Usuário salva alerta (status = ativo)
8. Sistema monitora condição e dispara alerta quando atendida
9. Usuário recebe notificação conforme canal configurado
10. Usuário pode acessar `/alertas/historico` para revisar disparos

---

### 8. Relatórios - Rota: `/relatorios`

O módulo de relatórios permite gerar **documentos executivos em formato PDF** com análises consolidadas, gráficos e insights para apresentação a stakeholders.

#### Componentes da Tela

**Seletor de Tipo de Relatório**

Dropdown com tipos pré-definidos:

- **Relatório Executivo:** Visão geral do projeto com métricas principais e insights estratégicos
- **Relatório de Mercados:** Análise detalhada de mercados identificados com oportunidades
- **Relatório de Clientes:** Perfil de clientes identificados com segmentação e distribuição
- **Relatório de Concorrentes:** Análise competitiva com matriz de posicionamento
- **Relatório de Leads:** Pipeline de oportunidades com scoring e priorização
- **Relatório Personalizado:** Seleção manual de seções a incluir

**Configurações do Relatório**

**Filtros de Dados:**

- **Projeto:** Seleção de projeto específico
- **Pesquisa:** Seleção de pesquisa específica dentro do projeto
- **Período de Análise:** Data início e data fim
- **Tags:** Filtro por tags específicas
- **Segmentação:** Filtro por tipo de segmentação (B2C/B2B2C/B2B)
- **Status:** Filtro por status de validação (pendente/validado/descartado)

**Seções a Incluir (para Relatório Personalizado):**

Checklist de seções disponíveis:

- Sumário Executivo
- Métricas Principais (KPIs)
- Análise de Mercados
- Análise de Clientes
- Análise de Concorrentes
- Análise de Leads
- Distribuição Geográfica
- Evolução Temporal
- Oportunidades Identificadas
- Recomendações Estratégicas
- Anexos (tabelas de dados)

**Formato de Exportação:**

Radio buttons para selecionar formato:

- **PDF:** Documento PDF formatado para impressão
- **Excel:** Planilha Excel com múltiplas abas (uma por seção)

**Preview do Relatório**

Área de preview que exibe visualização das páginas do relatório:

- Navegação entre páginas (anterior/próxima)
- Zoom in/out
- Ajustes de formatação (margens, fonte, cores)

**Agendamento de Envio**

Seção para configurar envio recorrente do relatório:

- **Frequência:** Diária/Semanal/Mensal
- **Dia e Horário:** Configuração de quando enviar
- **Destinatários:** Lista de emails separados por vírgula
- **Assunto do Email:** Template de assunto
- **Mensagem:** Template de corpo do email

**Salvar Template**

Botão para salvar configuração atual como template reutilizável:

- Nome do template
- Descrição do template
- Configurações salvas (tipo, filtros, seções, formato)

**Botões de Ação**

Três botões principais:

- **Gerar Relatório:** Criar documento final e fazer download
- **Agendar Envio:** Configurar envio recorrente por email
- **Salvar Template:** Salvar configuração para reutilização

#### Fluxo de Uso

1. Usuário acessa `/relatorios`
2. Usuário seleciona tipo de relatório
3. Usuário configura filtros de dados (projeto, pesquisa, período)
4. Usuário seleciona seções a incluir (se personalizado)
5. Usuário seleciona formato de exportação (PDF/Excel)
6. Usuário visualiza preview do relatório
7. Usuário ajusta formatação se necessário
8. Usuário clica em "Gerar Relatório"
9. Sistema processa relatório e inicia download
10. Opcionalmente, usuário configura agendamento de envio
11. Opcionalmente, usuário salva template para reutilização

---

### 9. ROI - Rota: `/roi`

O módulo de ROI oferece **análise financeira** do retorno sobre investimento em pesquisa de mercado e enriquecimento de dados, com métricas de conversão e projeções de receita.

#### Componentes da Tela

**Cards de Métricas Financeiras**

Quatro cards principais:

- **ROI Total:** Percentual de retorno sobre investimento calculado como (Receita Gerada - Custo Total) / Custo Total × 100
- **Custo por Lead:** Valor médio investido por lead qualificado (Custo Total / Número de Leads)
- **Taxa de Conversão:** Percentual de leads convertidos em oportunidades fechadas
- **Receita Gerada:** Receita total atribuída aos leads gerados pelo sistema

**Gráficos de ROI**

**Evolução de ROI ao Longo do Tempo (Line Chart):**

Gráfico de linha mostrando evolução mensal de:

- ROI percentual
- Receita gerada
- Custo total

Permite identificar tendências e sazonalidade.

**Comparação de ROI por Mercado (Bar Chart):**

Gráfico de barras comparando ROI de diferentes mercados. Permite identificar mercados mais rentáveis.

**Análise de Custo-Benefício (Scatter Plot):**

Gráfico de dispersão com:

- Eixo X: Custo investido
- Eixo Y: Receita gerada
- Tamanho do ponto: Número de leads

Linha diagonal representa break-even. Pontos acima da linha têm ROI positivo.

**Análise de Custos**

Tabela detalhada de custos:

**Custo de Ferramentas e Equipe:**

- Licenças de software
- APIs de enriquecimento
- Salários da equipe
- Infraestrutura (servidores, banco de dados)

**Custo por Registro Enriquecido:**

Cálculo de custo médio por registro enriquecido, segmentado por:

- Clientes
- Concorrentes
- Leads

**Custo por Lead Qualificado:**

Cálculo de custo médio por lead qualificado (score ≥ 70).

**Projeções de Receita**

Seção com projeções financeiras baseadas em dados históricos:

**Projeção Baseada em Taxa de Conversão Histórica:**

Cálculo de receita esperada para os próximos 3/6/12 meses baseado em:

- Taxa de conversão histórica
- Ticket médio de venda
- Número de leads no pipeline

**Cenários:**

Três cenários de projeção:

- **Otimista:** Taxa de conversão +20% acima da média histórica
- **Realista:** Taxa de conversão igual à média histórica
- **Pessimista:** Taxa de conversão -20% abaixo da média histórica

Cada cenário apresenta:

- Receita projetada
- ROI projetado
- Número de conversões esperadas

#### Fluxo de Uso

1. Usuário acessa `/roi`
2. Usuário visualiza cards de métricas financeiras
3. Usuário explora gráficos de ROI
4. Usuário revisa análise de custos
5. Usuário analisa projeções de receita
6. Usuário identifica mercados mais rentáveis
7. Usuário ajusta estratégia baseado em insights financeiros

---

### 10. Funil - Rota: `/funil`

O módulo de funil apresenta a **evolução de leads pelos estágios** do processo de vendas, identificando gargalos e oportunidades de melhoria.

#### Componentes da Tela

**Visualização de Funil**

Gráfico de funil vertical mostrando 5 estágios:

1. **Novo:** Leads recém-gerados aguardando primeiro contato
2. **Em Contato:** Leads em processo de qualificação e descoberta
3. **Negociação:** Leads em negociação ativa com proposta enviada
4. **Fechado:** Leads convertidos em clientes (oportunidade ganha)
5. **Perdido:** Leads descartados (oportunidade perdida)

Cada estágio exibe:

- Número absoluto de leads
- Percentual do total inicial
- Taxa de conversão para o próximo estágio

**Métricas de Conversão**

Cards com métricas principais:

- **Taxa de Conversão Geral:** Percentual de leads que chegam ao estágio "Fechado"
- **Tempo Médio no Funil:** Tempo médio desde "Novo" até "Fechado"
- **Tempo Médio por Estágio:** Tempo médio que leads permanecem em cada estágio
- **Taxa de Abandono:** Percentual de leads que vão para "Perdido"

**Análise por Estágio**

Tabela detalhada por estágio:

| Estágio    | Leads | % do Total | Tempo Médio | Taxa de Conversão | Taxa de Abandono |
| ---------- | ----- | ---------- | ----------- | ----------------- | ---------------- |
| Novo       | 1000  | 100%       | 3 dias      | 80%               | 20%              |
| Em Contato | 800   | 80%        | 7 dias      | 62.5%             | 37.5%            |
| Negociação | 500   | 50%        | 14 dias     | 60%               | 40%              |
| Fechado    | 300   | 30%        | -           | -                 | -                |
| Perdido    | 700   | 70%        | -           | -                 | -                |

**Identificação de Gargalos**

Seção destacando estágios com problemas:

**Gargalos Identificados:**

Lista de estágios com:

- Taxa de conversão abaixo da média
- Tempo médio acima da média
- Alta taxa de abandono

**Recomendações de Ações:**

Para cada gargalo identificado, o sistema sugere ações:

- "Taxa de conversão baixa em 'Em Contato': Revisar script de qualificação"
- "Tempo médio alto em 'Negociação': Simplificar processo de proposta"
- "Alta taxa de abandono em 'Novo': Melhorar qualidade dos leads gerados"

**Evolução do Funil ao Longo do Tempo**

Gráfico de linha mostrando evolução de cada estágio ao longo dos últimos 6 meses. Permite identificar tendências e sazonalidade.

#### Fluxo de Uso

1. Usuário acessa `/funil`
2. Usuário visualiza funil principal
3. Usuário analisa métricas de conversão
4. Usuário revisa análise por estágio
5. Usuário identifica gargalos
6. Usuário lê recomendações de ações
7. Usuário implementa melhorias no processo de vendas

---

### 11. Agendamento - Rota: `/agendamento`

O módulo de agendamento permite configurar **execuções automáticas** de enriquecimento e outras tarefas em intervalos regulares.

#### Componentes da Tela

**Calendário de Agendamentos**

Visualização em calendário (mensal) com agendamentos futuros:

- Cada agendamento aparece como evento no calendário
- Cores diferentes para tipos de tarefa (enriquecimento/relatório/exportação)
- Clique em evento abre modal de edição

**Lista de Agendamentos Ativos**

Tabela com agendamentos configurados:

- **Nome:** Nome identificador do agendamento
- **Tipo:** Enriquecimento/Relatório/Exportação
- **Frequência:** Diária/Semanal/Mensal
- **Próxima Execução:** Data e hora da próxima execução
- **Status:** Ativo/Inativo (toggle switch)
- **Ações:** Editar/Excluir/Executar Agora

**Configuração de Recorrência**

Modal de configuração com campos:

**Tipo de Tarefa:**

Dropdown para selecionar tipo:

- Enriquecimento
- Geração de Relatório
- Exportação de Dados

**Configurações Específicas da Tarefa:**

Campos dinâmicos baseados no tipo selecionado:

**Para Enriquecimento:**

- Template de enriquecimento
- Entidades a enriquecer
- Limite de registros
- Modo de execução (Parallel/Sequential)

**Para Geração de Relatório:**

- Tipo de relatório
- Filtros de dados
- Formato de exportação
- Destinatários de email

**Para Exportação de Dados:**

- Entidades a exportar
- Formato (CSV/Excel)
- Filtros de dados
- Destino (email/FTP/S3)

**Frequência:**

Radio buttons para selecionar:

- **Diária:** Executar todos os dias em horário específico
- **Semanal:** Executar em dias da semana específicos
- **Mensal:** Executar em dia do mês específico

**Horário de Execução:**

Time picker para selecionar hora e minuto.

**Notificações:**

Checkboxes para configurar notificações:

- Notificar ao iniciar execução
- Notificar ao concluir execução
- Notificar em caso de erro

**Histórico de Execuções**

Tabela com execuções passadas:

- **Data/Hora:** Timestamp da execução
- **Agendamento:** Nome do agendamento que executou
- **Status:** Sucesso/Erro/Cancelado
- **Duração:** Tempo de execução
- **Registros Processados:** Número de registros (se aplicável)
- **Logs:** Botão para ver logs detalhados

#### Fluxo de Uso

1. Usuário acessa `/agendamento`
2. Usuário clica em "Novo Agendamento"
3. Usuário seleciona tipo de tarefa
4. Usuário configura parâmetros da tarefa
5. Usuário seleciona frequência e horário
6. Usuário configura notificações
7. Usuário salva agendamento (status = ativo)
8. Sistema executa tarefa automaticamente conforme configurado
9. Usuário recebe notificações conforme configurado
10. Usuário pode revisar histórico de execuções

---

### 12. Atividade - Rota: `/atividade`

O módulo de atividade registra todas as ações realizadas no sistema, permitindo **auditoria e rastreabilidade**.

#### Componentes da Tela

**Log de Atividades**

Tabela com todas as atividades registradas:

- **Timestamp:** Data e hora da ação (formato: DD/MM/YYYY HH:MM:SS)
- **Usuário:** Nome e email do usuário que realizou a ação
- **Tipo de Ação:** Ícone e label indicando tipo (criar/editar/deletar/validar/exportar)
- **Entidade Afetada:** Tipo de entidade (mercado/cliente/concorrente/lead)
- **Nome da Entidade:** Nome específico do registro afetado
- **Detalhes:** Descrição breve da ação realizada
- **Ver Mais:** Botão que expande detalhes completos

**Detalhes Expandidos:**

Ao clicar em "Ver Mais", exibe:

- Campos modificados (antes/depois)
- Payload completo da requisição
- Response da API
- Duração da operação
- IP do usuário

**Filtros**

Painel de filtros no topo da página:

**Filtro por Tipo de Ação:**

Checkboxes para selecionar tipos:

- Criar
- Editar
- Deletar
- Validar
- Descartar
- Exportar
- Login
- Logout

**Filtro por Usuário:**

Dropdown com lista de usuários do sistema. Opção "Todos os usuários" disponível.

**Filtro por Período:**

Date range picker para selecionar intervalo de datas. Atalhos disponíveis:

- Hoje
- Últimos 7 dias
- Últimos 30 dias
- Este mês
- Mês passado

**Filtro por Entidade:**

Dropdown para selecionar tipo de entidade:

- Mercados
- Clientes
- Concorrentes
- Leads
- Produtos
- Projetos
- Pesquisas

**Exportação de Log**

Botão "Exportar Log" que gera arquivo CSV com todas as atividades filtradas. Colunas do CSV:

- Timestamp
- Usuário
- Email do Usuário
- Tipo de Ação
- Entidade Afetada
- Nome da Entidade
- Detalhes
- IP do Usuário

#### Fluxo de Uso

1. Usuário acessa `/atividade`
2. Usuário aplica filtros (tipo de ação, usuário, período, entidade)
3. Usuário visualiza log de atividades filtrado
4. Usuário clica em "Ver Mais" para ver detalhes de uma ação específica
5. Usuário exporta log em CSV se necessário
6. Usuário identifica padrões ou anomalias nas atividades

---

### 13. Research Overview - Rota: `/research-overview`

O módulo Research Overview apresenta **métricas consolidadas** de lead generation com funil de qualificação interativo, distribuição de qualidade e evolução temporal.

#### Componentes da Tela

**Filtros Globais**

Dois filtros principais:

- **Pesquisa:** Dropdown para selecionar pesquisa específica ou "Todas as pesquisas"
- **Período:** Dropdown com opções pré-definidas (Últimos 7/30/90 dias)

**KPIs Principais**

Quatro cards de métricas:

- **Total de Mercados:** Número de mercados mapeados no período selecionado
- **Total de Leads Gerados:** Número de leads gerados no período
- **Qualidade Média:** Score médio de qualidade dos leads (0-100)
- **Taxa de Aprovação:** Percentual de leads aprovados (validados como "rich")

**Funil de Qualificação**

Gráfico de barras horizontais mostrando progressão de leads:

1. **Clientes Identificados:** Base inicial de clientes cadastrados
2. **Leads Gerados:** Leads criados a partir dos clientes
3. **Leads Enriquecidos:** Leads com dados enriquecidos
4. **Leads Validados:** Leads que passaram por validação manual
5. **Leads Aprovados:** Leads com status "rich" (alta qualidade)
6. **Leads Exportados para Salesforce:** Leads enviados para CRM

Cada barra exibe:

- Número absoluto
- Percentual em relação ao estágio anterior
- Cor indicando saúde (verde/amarelo/vermelho)

**Distribuição de Qualidade**

Gráfico de pizza mostrando classificação dos leads por score:

- **Excelente (90-100):** Leads de altíssima qualidade (cor verde)
- **Bom (70-89):** Leads de boa qualidade (cor azul)
- **Regular (50-69):** Leads de qualidade média (cor amarela)
- **Baixo (0-49):** Leads de baixa qualidade (cor vermelha)

Cada fatia exibe:

- Percentual do total
- Número absoluto
- Label com classificação

**Evolução Temporal**

Gráfico de linha com dois eixos:

**Eixo Esquerdo (Quantidade):**

Linha azul mostrando número de leads gerados por dia nos últimos 30 dias.

**Eixo Direito (Qualidade):**

Linha verde mostrando qualidade média dos leads por dia (score 0-100).

Permite identificar correlação entre volume e qualidade ao longo do tempo.

**Top 10 Mercados por Volume**

Tabela com os 10 mercados que geraram mais leads:

| Mercado                 | Total de Leads | Qualidade Média | Taxa de Aprovação |
| ----------------------- | -------------- | --------------- | ----------------- |
| Embalagens Plásticas    | 450            | 78              | 65%               |
| Materiais de Construção | 320            | 82              | 72%               |
| Varejo Alimentício      | 280            | 71              | 58%               |
| ...                     | ...            | ...             | ...               |

Tabela ordenável por qualquer coluna. Clique em mercado redireciona para `/mercado/:id`.

#### Fluxo de Uso

1. Usuário acessa `/research-overview`
2. Usuário seleciona filtros (pesquisa e período)
3. Usuário visualiza KPIs principais
4. Usuário analisa funil de qualificação
5. Usuário revisa distribuição de qualidade
6. Usuário explora evolução temporal
7. Usuário identifica top 10 mercados
8. Usuário clica em mercado para ver detalhes

---

### 14. Onboarding - Rota: `/onboarding`

O módulo de onboarding oferece um **tour interativo** que guia novos usuários pelas principais funcionalidades do sistema.

#### Componentes da Tela

**Steps do Tour**

Quatro steps principais:

**Step 1: Início - Visão Geral do Sistema**

- Explicação da hierarquia de dados (PROJECT → PESQUISA → DADOS)
- Apresentação do sidebar e navegação principal
- Demonstração de seletor de projeto

**Step 2: Dados - Como Gerenciar Mercados e Clientes**

- Tour pela página inicial (Cascade View)
- Demonstração de filtros e abas
- Como visualizar detalhes de um mercado
- Como validar/descartar registros

**Step 3: Enriquecimento - Como Enriquecer Dados**

- Explicação do processo de enriquecimento
- Demonstração de configuração de enriquecimento
- Como monitorar progresso
- Como agendar execuções recorrentes

**Step 4: Análise - Como Usar Analytics e Relatórios**

- Tour pelos módulos de análise (Analytics, ROI, Funil)
- Como gerar relatórios executivos
- Como exportar dados
- Como configurar alertas

**Highlights Visuais**

Cada step destaca elementos importantes da interface:

- Overlay escuro cobrindo resto da tela
- Spotlight circular ou retangular destacando elemento
- Tooltip explicativo ao lado do elemento
- Seta apontando para elemento destacado

**Controles**

Botões de navegação:

- **Pular Tour:** Fecha o tour e marca como completado
- **Anterior:** Volta para step anterior
- **Próximo:** Avança para próximo step
- **Concluir:** Finaliza o tour (último step)

**Indicador de Progresso**

Barra de progresso ou dots indicando:

- Step atual (1/4, 2/4, 3/4, 4/4)
- Steps completados (checkmark verde)
- Steps pendentes (círculo vazio)

**Persistência**

Estado "tour completado" salvo no localStorage. Usuários que completaram o tour não veem o onboarding novamente, mas podem acessá-lo manualmente via `/onboarding`.

#### Fluxo de Uso

1. Novo usuário faz primeiro login
2. Sistema detecta que tour não foi completado
3. Sistema redireciona automaticamente para `/onboarding`
4. Usuário segue steps do tour
5. Usuário interage com elementos destacados
6. Usuário avança pelos steps
7. Ao concluir, sistema marca tour como completado
8. Sistema redireciona para dashboard principal

---

## 🗄️ Banco de Dados

### Estrutura Geral

O banco de dados utiliza **MySQL/TiDB** com 34 tabelas organizadas em 10 categorias funcionais. O schema é gerenciado via Drizzle ORM, garantindo type-safety e migrations controladas.

### Categorias de Tabelas

#### 1. Entidades Core (3 tabelas)

Tabelas fundamentais para operação do sistema.

**users**

Armazena usuários do sistema com autenticação via Manus OAuth.

| Campo        | Tipo                  | Descrição                               |
| ------------ | --------------------- | --------------------------------------- |
| id           | varchar(64) PK        | ID único do usuário (gerado pelo OAuth) |
| name         | text                  | Nome completo do usuário                |
| email        | varchar(320)          | Email do usuário                        |
| loginMethod  | varchar(64)           | Método de login utilizado (oauth/email) |
| role         | enum('user', 'admin') | Papel do usuário no sistema             |
| createdAt    | timestamp             | Data de criação do registro             |
| lastSignedIn | timestamp             | Data do último login                    |

**projects**

Representa workspaces isolados por unidade de negócio.

| Campo     | Tipo                  | Descrição                         |
| --------- | --------------------- | --------------------------------- |
| id        | int PK AUTO_INCREMENT | ID único do projeto               |
| nome      | varchar(255)          | Nome do projeto                   |
| descricao | text                  | Descrição do projeto              |
| cor       | varchar(7)            | Cor hex para identificação visual |
| ativo     | int                   | Flag de ativo (1) ou inativo (0)  |
| createdAt | timestamp             | Data de criação                   |
| updatedAt | timestamp             | Data da última atualização        |

**pesquisas**

Representa batches de importação/enriquecimento dentro de projetos.

| Campo                | Tipo                  | Descrição                                      |
| -------------------- | --------------------- | ---------------------------------------------- |
| id                   | int PK AUTO_INCREMENT | ID único da pesquisa                           |
| projectId            | int FK                | Referência ao projeto                          |
| nome                 | varchar(255)          | Nome da pesquisa                               |
| descricao            | text                  | Descrição da pesquisa                          |
| dataImportacao       | timestamp             | Data de importação dos dados                   |
| totalClientes        | int                   | Total de clientes importados                   |
| clientesEnriquecidos | int                   | Total de clientes enriquecidos                 |
| status               | enum                  | Status (importado/enriquecendo/concluido/erro) |
| ativo                | int                   | Flag de ativo (1) ou inativo (0)               |
| createdAt            | timestamp             | Data de criação                                |
| updatedAt            | timestamp             | Data da última atualização                     |

#### 2. Entidades de Dados (5 tabelas)

Tabelas que armazenam os dados principais do sistema.

**mercados_unicos**

Mercados únicos identificados durante pesquisa.

| Campo              | Tipo                  | Descrição                           |
| ------------------ | --------------------- | ----------------------------------- |
| id                 | int PK AUTO_INCREMENT | ID único do mercado                 |
| projectId          | int FK                | Referência ao projeto               |
| pesquisaId         | int FK                | Referência à pesquisa               |
| mercadoHash        | varchar(255)          | Hash único para deduplicação        |
| nome               | varchar(255)          | Nome do mercado                     |
| segmentacao        | varchar(50)           | Tipo de segmentação (B2C/B2B2C/B2B) |
| categoria          | varchar(100)          | Categoria do mercado                |
| tamanhoMercado     | text                  | Tamanho estimado do mercado         |
| crescimentoAnual   | text                  | Taxa de crescimento anual           |
| tendencias         | text                  | Tendências identificadas            |
| principaisPlayers  | text                  | Principais players do mercado       |
| quantidadeClientes | int                   | Número de clientes associados       |
| createdAt          | timestamp             | Data de criação                     |

**clientes**

Empresas B2C ou B2B2C identificadas.

| Campo                  | Tipo                  | Descrição                               |
| ---------------------- | --------------------- | --------------------------------------- |
| id                     | int PK AUTO_INCREMENT | ID único do cliente                     |
| projectId              | int FK                | Referência ao projeto                   |
| pesquisaId             | int FK                | Referência à pesquisa                   |
| clienteHash            | varchar(255)          | Hash único para deduplicação            |
| nome                   | varchar(255)          | Nome da empresa                         |
| cnpj                   | varchar(20)           | CNPJ da empresa                         |
| siteOficial            | varchar(500)          | URL do site oficial                     |
| produtoPrincipal       | text                  | Produto principal oferecido             |
| segmentacaoB2bB2c      | varchar(20)           | Tipo de segmentação                     |
| email                  | varchar(320)          | Email de contato                        |
| telefone               | varchar(50)           | Telefone de contato                     |
| linkedin               | varchar(500)          | URL do LinkedIn                         |
| instagram              | varchar(500)          | URL do Instagram                        |
| cidade                 | varchar(100)          | Cidade da sede                          |
| uf                     | varchar(2)            | Estado da sede                          |
| regiao                 | varchar(100)          | Região geográfica                       |
| cnae                   | varchar(20)           | Código CNAE                             |
| porte                  | varchar(50)           | Porte da empresa (pequeno/médio/grande) |
| faturamentoDeclarado   | text                  | Faturamento declarado                   |
| numeroEstabelecimentos | text                  | Número de estabelecimentos              |
| qualidadeScore         | int                   | Score de qualidade (0-100)              |
| qualidadeClassificacao | varchar(50)           | Classificação de qualidade              |
| validationStatus       | enum                  | Status de validação                     |
| validationNotes        | text                  | Notas de validação                      |
| validatedBy            | varchar(64) FK        | ID do usuário que validou               |
| validatedAt            | timestamp             | Data de validação                       |
| createdAt              | timestamp             | Data de criação                         |

**concorrentes**

Concorrentes identificados nos mercados.

| Campo                  | Tipo                  | Descrição                    |
| ---------------------- | --------------------- | ---------------------------- |
| id                     | int PK AUTO_INCREMENT | ID único do concorrente      |
| projectId              | int FK                | Referência ao projeto        |
| pesquisaId             | int FK                | Referência à pesquisa        |
| concorrenteHash        | varchar(255)          | Hash único para deduplicação |
| mercadoId              | int FK                | Referência ao mercado        |
| nome                   | varchar(255)          | Nome da empresa concorrente  |
| cnpj                   | varchar(20)           | CNPJ da empresa              |
| site                   | varchar(500)          | URL do site                  |
| produto                | text                  | Produto oferecido            |
| cidade                 | varchar(100)          | Cidade da sede               |
| uf                     | varchar(2)            | Estado da sede               |
| porte                  | varchar(50)           | Porte da empresa             |
| faturamentoEstimado    | text                  | Faturamento estimado         |
| faturamentoDeclarado   | text                  | Faturamento declarado        |
| numeroEstabelecimentos | text                  | Número de estabelecimentos   |
| qualidadeScore         | int                   | Score de qualidade (0-100)   |
| qualidadeClassificacao | varchar(50)           | Classificação de qualidade   |
| validationStatus       | enum                  | Status de validação          |
| validationNotes        | text                  | Notas de validação           |
| validatedBy            | varchar(64) FK        | ID do usuário que validou    |
| validatedAt            | timestamp             | Data de validação            |
| createdAt              | timestamp             | Data de criação              |

**leads**

Leads qualificados para prospecção.

| Campo                  | Tipo                  | Descrição                    |
| ---------------------- | --------------------- | ---------------------------- |
| id                     | int PK AUTO_INCREMENT | ID único do lead             |
| projectId              | int FK                | Referência ao projeto        |
| pesquisaId             | int FK                | Referência à pesquisa        |
| leadHash               | varchar(255)          | Hash único para deduplicação |
| mercadoId              | int FK                | Referência ao mercado        |
| nome                   | varchar(255)          | Nome da empresa lead         |
| cnpj                   | varchar(20)           | CNPJ da empresa              |
| email                  | varchar(320)          | Email de contato             |
| telefone               | varchar(50)           | Telefone de contato          |
| site                   | varchar(500)          | URL do site                  |
| linkedin               | varchar(500)          | URL do LinkedIn              |
| cidade                 | varchar(100)          | Cidade da sede               |
| uf                     | varchar(2)            | Estado da sede               |
| porte                  | varchar(50)           | Porte da empresa             |
| segmentacao            | varchar(50)           | Tipo de segmentação          |
| produto                | text                  | Produto oferecido            |
| faturamentoEstimado    | text                  | Faturamento estimado         |
| numeroFuncionarios     | text                  | Número de funcionários       |
| qualidadeScore         | int                   | Score de qualidade (0-100)   |
| qualidadeClassificacao | varchar(50)           | Classificação de qualidade   |
| leadStage              | enum                  | Estágio do lead no funil     |
| validationStatus       | enum                  | Status de validação          |
| validationNotes        | text                  | Notas de validação           |
| validatedBy            | varchar(64) FK        | ID do usuário que validou    |
| validatedAt            | timestamp             | Data de validação            |
| createdAt              | timestamp             | Data de criação              |

**produtos**

Catálogo de produtos por cliente e mercado.

| Campo      | Tipo                  | Descrição                        |
| ---------- | --------------------- | -------------------------------- |
| id         | int PK AUTO_INCREMENT | ID único do produto              |
| projectId  | int FK                | Referência ao projeto            |
| pesquisaId | int FK                | Referência à pesquisa            |
| clienteId  | int FK                | Referência ao cliente            |
| mercadoId  | int FK                | Referência ao mercado            |
| nome       | varchar(255)          | Nome do produto                  |
| descricao  | text                  | Descrição do produto             |
| categoria  | varchar(100)          | Categoria do produto             |
| preco      | text                  | Preço do produto                 |
| unidade    | varchar(50)           | Unidade (kg/litro/unidade)       |
| ativo      | int                   | Flag de ativo (1) ou inativo (0) |
| createdAt  | timestamp             | Data de criação                  |
| updatedAt  | timestamp             | Data da última atualização       |

#### 3. Relacionamentos (1 tabela)

**clientes_mercados**

Junction table para relacionamento many-to-many entre clientes e mercados.

| Campo     | Tipo                  | Descrição                  |
| --------- | --------------------- | -------------------------- |
| id        | int PK AUTO_INCREMENT | ID único do relacionamento |
| clienteId | int FK                | Referência ao cliente      |
| mercadoId | int FK                | Referência ao mercado      |
| createdAt | timestamp             | Data de criação            |

#### 4. Gerenciamento (4 tabelas)

**tags**

Tags personalizadas para categorização.

| Campo     | Tipo                  | Descrição                         |
| --------- | --------------------- | --------------------------------- |
| id        | int PK AUTO_INCREMENT | ID único da tag                   |
| projectId | int FK                | Referência ao projeto             |
| nome      | varchar(100)          | Nome da tag                       |
| cor       | varchar(7)            | Cor hex para identificação visual |
| createdAt | timestamp             | Data de criação                   |

**entity_tags**

Associação de tags a entidades.

| Campo      | Tipo                  | Descrição                                           |
| ---------- | --------------------- | --------------------------------------------------- |
| id         | int PK AUTO_INCREMENT | ID único da associação                              |
| tagId      | int FK                | Referência à tag                                    |
| entityType | varchar(50)           | Tipo de entidade (mercado/cliente/concorrente/lead) |
| entityId   | int                   | ID da entidade                                      |
| createdAt  | timestamp             | Data de criação                                     |

**saved_filters**

Filtros salvos para reutilização.

| Campo        | Tipo                  | Descrição                     |
| ------------ | --------------------- | ----------------------------- |
| id           | int PK AUTO_INCREMENT | ID único do filtro            |
| userId       | varchar(64) FK        | Referência ao usuário         |
| projectId    | int FK                | Referência ao projeto         |
| nome         | varchar(255)          | Nome do filtro                |
| filterConfig | text                  | Configuração do filtro (JSON) |
| createdAt    | timestamp             | Data de criação               |

**project_templates**

Templates de projeto para reutilização.

| Campo     | Tipo                  | Descrição                       |
| --------- | --------------------- | ------------------------------- |
| id        | int PK AUTO_INCREMENT | ID único do template            |
| nome      | varchar(255)          | Nome do template                |
| descricao | text                  | Descrição do template           |
| config    | text                  | Configuração do template (JSON) |
| createdAt | timestamp             | Data de criação                 |

#### 5. Notificações e Alertas (4 tabelas)

**notifications**

Notificações do sistema.

| Campo     | Tipo                  | Descrição                        |
| --------- | --------------------- | -------------------------------- |
| id        | int PK AUTO_INCREMENT | ID único da notificação          |
| userId    | varchar(64) FK        | Referência ao usuário            |
| tipo      | varchar(50)           | Tipo de notificação              |
| titulo    | varchar(255)          | Título da notificação            |
| mensagem  | text                  | Mensagem da notificação          |
| lida      | int                   | Flag de lida (1) ou não lida (0) |
| createdAt | timestamp             | Data de criação                  |

**alert_configs**

Configurações de alertas personalizados.

| Campo      | Tipo                  | Descrição                            |
| ---------- | --------------------- | ------------------------------------ |
| id         | int PK AUTO_INCREMENT | ID único do alerta                   |
| userId     | varchar(64) FK        | Referência ao usuário                |
| projectId  | int FK                | Referência ao projeto                |
| nome       | varchar(255)          | Nome do alerta                       |
| entityType | varchar(50)           | Tipo de entidade monitorada          |
| condition  | text                  | Condição de disparo (JSON)           |
| channels   | text                  | Canais de notificação (JSON)         |
| frequency  | varchar(50)           | Frequência (imediato/diário/semanal) |
| ativo      | int                   | Flag de ativo (1) ou inativo (0)     |
| createdAt  | timestamp             | Data de criação                      |

**alert_history**

Histórico de alertas disparados.

| Campo          | Tipo                  | Descrição                           |
| -------------- | --------------------- | ----------------------------------- |
| id             | int PK AUTO_INCREMENT | ID único do histórico               |
| alertConfigId  | int FK                | Referência à configuração de alerta |
| triggeredAt    | timestamp             | Data e hora do disparo              |
| condition      | text                  | Condição que acionou o alerta       |
| deliveryStatus | varchar(50)           | Status de entrega (enviado/falha)   |
| payload        | text                  | Payload completo (JSON)             |

**operational_alerts**

Alertas operacionais do sistema.

| Campo      | Tipo                  | Descrição                        |
| ---------- | --------------------- | -------------------------------- |
| id         | int PK AUTO_INCREMENT | ID único do alerta               |
| projectId  | int FK                | Referência ao projeto            |
| alertType  | varchar(50)           | Tipo de alerta operacional       |
| severity   | varchar(50)           | Severidade (info/warning/error)  |
| message    | text                  | Mensagem do alerta               |
| metadata   | text                  | Metadados adicionais (JSON)      |
| resolved   | int                   | Flag de resolvido (1) ou não (0) |
| resolvedAt | timestamp             | Data de resolução                |
| createdAt  | timestamp             | Data de criação                  |

#### 6. Enriquecimento (5 tabelas)

**enrichment_cache**

Cache de enriquecimento para evitar chamadas duplicadas.

| Campo      | Tipo                  | Descrição                  |
| ---------- | --------------------- | -------------------------- |
| id         | int PK AUTO_INCREMENT | ID único do cache          |
| entityType | varchar(50)           | Tipo de entidade           |
| entityId   | int                   | ID da entidade             |
| source     | varchar(100)          | Fonte de enriquecimento    |
| data       | text                  | Dados enriquecidos (JSON)  |
| expiresAt  | timestamp             | Data de expiração do cache |
| createdAt  | timestamp             | Data de criação            |

**enrichment_runs**

Execuções de enriquecimento.

| Campo            | Tipo                  | Descrição                               |
| ---------------- | --------------------- | --------------------------------------- |
| id               | int PK AUTO_INCREMENT | ID único da execução                    |
| projectId        | int FK                | Referência ao projeto                   |
| pesquisaId       | int FK                | Referência à pesquisa                   |
| templateId       | int FK                | Referência ao template                  |
| mode             | varchar(50)           | Modo de execução (parallel/sequential)  |
| status           | varchar(50)           | Status (running/completed/error/paused) |
| totalRecords     | int                   | Total de registros a processar          |
| processedRecords | int                   | Registros processados                   |
| successRecords   | int                   | Registros com sucesso                   |
| errorRecords     | int                   | Registros com erro                      |
| startedAt        | timestamp             | Data de início                          |
| completedAt      | timestamp             | Data de conclusão                       |
| createdAt        | timestamp             | Data de criação                         |

**enrichment_jobs**

Jobs individuais de enriquecimento.

| Campo       | Tipo                  | Descrição                                 |
| ----------- | --------------------- | ----------------------------------------- |
| id          | int PK AUTO_INCREMENT | ID único do job                           |
| runId       | int FK                | Referência à execução                     |
| entityType  | varchar(50)           | Tipo de entidade                          |
| entityId    | int                   | ID da entidade                            |
| status      | varchar(50)           | Status (pending/processing/success/error) |
| priority    | int                   | Prioridade do job                         |
| attempts    | int                   | Número de tentativas                      |
| error       | text                  | Mensagem de erro (se houver)              |
| startedAt   | timestamp             | Data de início                            |
| completedAt | timestamp             | Data de conclusão                         |
| createdAt   | timestamp             | Data de criação                           |

**enrichment_configs**

Configurações de enriquecimento.

| Campo        | Tipo                  | Descrição                    |
| ------------ | --------------------- | ---------------------------- |
| id           | int PK AUTO_INCREMENT | ID único da configuração     |
| projectId    | int FK                | Referência ao projeto        |
| templateName | varchar(255)          | Nome do template             |
| config       | text                  | Configuração completa (JSON) |
| createdAt    | timestamp             | Data de criação              |
| updatedAt    | timestamp             | Data da última atualização   |

**scheduled_enrichments**

Agendamentos de enriquecimento.

| Campo     | Tipo                  | Descrição                         |
| --------- | --------------------- | --------------------------------- |
| id        | int PK AUTO_INCREMENT | ID único do agendamento           |
| projectId | int FK                | Referência ao projeto             |
| configId  | int FK                | Referência à configuração         |
| frequency | varchar(50)           | Frequência (daily/weekly/monthly) |
| schedule  | text                  | Configuração de schedule (JSON)   |
| nextRun   | timestamp             | Data da próxima execução          |
| ativo     | int                   | Flag de ativo (1) ou inativo (0)  |
| createdAt | timestamp             | Data de criação                   |

#### 7. Analytics (4 tabelas)

**analytics_mercados**

Métricas agregadas por mercado.

| Campo             | Tipo                  | Descrição                         |
| ----------------- | --------------------- | --------------------------------- |
| id                | int PK AUTO_INCREMENT | ID único da métrica               |
| projectId         | int FK                | Referência ao projeto             |
| pesquisaId        | int FK                | Referência à pesquisa             |
| mercadoId         | int FK                | Referência ao mercado             |
| dataAgregacao     | date                  | Data da agregação                 |
| totalClientes     | int                   | Total de clientes no mercado      |
| totalConcorrentes | int                   | Total de concorrentes no mercado  |
| totalLeads        | int                   | Total de leads no mercado         |
| leadsEnriquecidos | int                   | Leads com dados enriquecidos      |
| leadsValidados    | int                   | Leads validados manualmente       |
| leadsAprovados    | int                   | Leads com status "rich"           |
| leadsExportados   | int                   | Leads exportados para Salesforce  |
| qualidadeMedia    | decimal(5,2)          | Qualidade média dos leads (0-100) |
| taxaAprovacao     | decimal(5,2)          | Taxa de aprovação (%)             |
| taxaExportacao    | decimal(5,2)          | Taxa de exportação (%)            |
| createdAt         | timestamp             | Data de criação                   |
| updatedAt         | timestamp             | Data da última atualização        |

**analytics_pesquisas**

Métricas agregadas por pesquisa.

| Campo             | Tipo                  | Descrição                         |
| ----------------- | --------------------- | --------------------------------- |
| id                | int PK AUTO_INCREMENT | ID único da métrica               |
| projectId         | int FK                | Referência ao projeto             |
| pesquisaId        | int FK                | Referência à pesquisa             |
| dataAgregacao     | date                  | Data da agregação                 |
| totalMercados     | int                   | Total de mercados na pesquisa     |
| totalClientes     | int                   | Total de clientes na pesquisa     |
| totalConcorrentes | int                   | Total de concorrentes na pesquisa |
| totalLeads        | int                   | Total de leads na pesquisa        |
| leadsEnriquecidos | int                   | Leads com dados enriquecidos      |
| leadsValidados    | int                   | Leads validados manualmente       |
| leadsAprovados    | int                   | Leads com status "rich"           |
| leadsExportados   | int                   | Leads exportados para Salesforce  |
| qualidadeMedia    | decimal(5,2)          | Qualidade média dos leads (0-100) |
| taxaAprovacao     | decimal(5,2)          | Taxa de aprovação (%)             |
| taxaExportacao    | decimal(5,2)          | Taxa de exportação (%)            |
| createdAt         | timestamp             | Data de criação                   |
| updatedAt         | timestamp             | Data da última atualização        |

**analytics_dimensoes**

Eficácia por dimensão (UF/Porte/Segmentação/Categoria).

| Campo          | Tipo                  | Descrição                                         |
| -------------- | --------------------- | ------------------------------------------------- |
| id             | int PK AUTO_INCREMENT | ID único da métrica                               |
| projectId      | int FK                | Referência ao projeto                             |
| pesquisaId     | int FK                | Referência à pesquisa                             |
| dataAgregacao  | date                  | Data da agregação                                 |
| dimensaoTipo   | varchar(50)           | Tipo de dimensão (uf/porte/segmentacao/categoria) |
| dimensaoValor  | varchar(100)          | Valor da dimensão (ex: "SP", "Grande", "B2C")     |
| totalLeads     | int                   | Total de leads nesta dimensão                     |
| leadsAprovados | int                   | Leads aprovados nesta dimensão                    |
| qualidadeMedia | decimal(5,2)          | Qualidade média dos leads (0-100)                 |
| taxaAprovacao  | decimal(5,2)          | Taxa de aprovação (%)                             |
| createdAt      | timestamp             | Data de criação                                   |
| updatedAt      | timestamp             | Data da última atualização                        |

**analytics_timeline**

Evolução temporal diária.

| Campo             | Tipo                  | Descrição                      |
| ----------------- | --------------------- | ------------------------------ |
| id                | int PK AUTO_INCREMENT | ID único da métrica            |
| projectId         | int FK                | Referência ao projeto          |
| pesquisaId        | int FK                | Referência à pesquisa          |
| data              | date                  | Data da métrica                |
| leadsGerados      | int                   | Leads gerados no dia           |
| leadsEnriquecidos | int                   | Leads enriquecidos no dia      |
| leadsValidados    | int                   | Leads validados no dia         |
| leadsAprovados    | int                   | Leads aprovados no dia         |
| qualidadeMedia    | decimal(5,2)          | Qualidade média do dia (0-100) |
| createdAt         | timestamp             | Data de criação                |

#### 8. Conversões e ROI (1 tabela)

**lead_conversions**

Conversões de leads em oportunidades.

| Campo       | Tipo                  | Descrição               |
| ----------- | --------------------- | ----------------------- |
| id          | int PK AUTO_INCREMENT | ID único da conversão   |
| leadId      | int FK                | Referência ao lead      |
| projectId   | int FK                | Referência ao projeto   |
| convertedAt | timestamp             | Data da conversão       |
| dealValue   | decimal(15,2)         | Valor do negócio        |
| stage       | varchar(50)           | Estágio da oportunidade |
| closedAt    | timestamp             | Data de fechamento      |
| notes       | text                  | Notas sobre a conversão |
| createdAt   | timestamp             | Data de criação         |

#### 9. Auditoria e Histórico (5 tabelas)

**activity_log**

Log de atividades do sistema.

| Campo      | Tipo                  | Descrição                                  |
| ---------- | --------------------- | ------------------------------------------ |
| id         | int PK AUTO_INCREMENT | ID único da atividade                      |
| userId     | varchar(64) FK        | Referência ao usuário                      |
| projectId  | int FK                | Referência ao projeto                      |
| actionType | varchar(50)           | Tipo de ação (create/edit/delete/validate) |
| entityType | varchar(50)           | Tipo de entidade afetada                   |
| entityId   | int                   | ID da entidade afetada                     |
| details    | text                  | Detalhes da ação (JSON)                    |
| ipAddress  | varchar(45)           | IP do usuário                              |
| createdAt  | timestamp             | Data da ação                               |

**mercados_history**

Histórico de alterações em mercados.

| Campo      | Tipo                  | Descrição                                        |
| ---------- | --------------------- | ------------------------------------------------ |
| id         | int PK AUTO_INCREMENT | ID único do histórico                            |
| mercadoId  | int FK                | Referência ao mercado                            |
| changedBy  | varchar(64) FK        | ID do usuário que alterou                        |
| changeType | varchar(50)           | Tipo de alteração (create/edit/validate/discard) |
| fieldName  | varchar(100)          | Nome do campo alterado                           |
| oldValue   | text                  | Valor anterior                                   |
| newValue   | text                  | Novo valor                                       |
| createdAt  | timestamp             | Data da alteração                                |

**clientes_history**

Histórico de alterações em clientes.

| Campo      | Tipo                  | Descrição                 |
| ---------- | --------------------- | ------------------------- |
| id         | int PK AUTO_INCREMENT | ID único do histórico     |
| clienteId  | int FK                | Referência ao cliente     |
| changedBy  | varchar(64) FK        | ID do usuário que alterou |
| changeType | varchar(50)           | Tipo de alteração         |
| fieldName  | varchar(100)          | Nome do campo alterado    |
| oldValue   | text                  | Valor anterior            |
| newValue   | text                  | Novo valor                |
| createdAt  | timestamp             | Data da alteração         |

**concorrentes_history**

Histórico de alterações em concorrentes.

| Campo         | Tipo                  | Descrição                 |
| ------------- | --------------------- | ------------------------- |
| id            | int PK AUTO_INCREMENT | ID único do histórico     |
| concorrenteId | int FK                | Referência ao concorrente |
| changedBy     | varchar(64) FK        | ID do usuário que alterou |
| changeType    | varchar(50)           | Tipo de alteração         |
| fieldName     | varchar(100)          | Nome do campo alterado    |
| oldValue      | text                  | Valor anterior            |
| newValue      | text                  | Novo valor                |
| createdAt     | timestamp             | Data da alteração         |

**leads_history**

Histórico de alterações em leads.

| Campo      | Tipo                  | Descrição                 |
| ---------- | --------------------- | ------------------------- |
| id         | int PK AUTO_INCREMENT | ID único do histórico     |
| leadId     | int FK                | Referência ao lead        |
| changedBy  | varchar(64) FK        | ID do usuário que alterou |
| changeType | varchar(50)           | Tipo de alteração         |
| fieldName  | varchar(100)          | Nome do campo alterado    |
| oldValue   | text                  | Valor anterior            |
| newValue   | text                  | Novo valor                |
| createdAt  | timestamp             | Data da alteração         |

#### 10. Integrações (2 tabelas)

**salesforce_sync_log**

Log de sincronização com Salesforce.

| Campo        | Tipo                  | Descrição                                    |
| ------------ | --------------------- | -------------------------------------------- |
| id           | int PK AUTO_INCREMENT | ID único do log                              |
| projectId    | int FK                | Referência ao projeto                        |
| leadId       | int FK                | Referência ao lead                           |
| syncType     | varchar(50)           | Tipo de sincronização (export/import/update) |
| status       | varchar(50)           | Status (success/error)                       |
| salesforceId | varchar(100)          | ID do registro no Salesforce                 |
| error        | text                  | Mensagem de erro (se houver)                 |
| createdAt    | timestamp             | Data da sincronização                        |

**recommendations**

Recomendações automáticas do sistema.

| Campo              | Tipo                  | Descrição                          |
| ------------------ | --------------------- | ---------------------------------- |
| id                 | int PK AUTO_INCREMENT | ID único da recomendação           |
| projectId          | int FK                | Referência ao projeto              |
| recommendationType | varchar(50)           | Tipo de recomendação               |
| entityType         | varchar(50)           | Tipo de entidade relacionada       |
| entityId           | int                   | ID da entidade relacionada         |
| title              | varchar(255)          | Título da recomendação             |
| description        | text                  | Descrição da recomendação          |
| priority           | varchar(50)           | Prioridade (low/medium/high)       |
| status             | varchar(50)           | Status (pending/accepted/rejected) |
| createdAt          | timestamp             | Data de criação                    |

### Enums e Tipos

| Enum                | Valores                                        | Uso                                |
| ------------------- | ---------------------------------------------- | ---------------------------------- |
| `validationStatus`  | pending, rich, needs_adjustment, discarded     | Status de validação de entidades   |
| `leadStage`         | novo, em_contato, negociacao, fechado, perdido | Estágio do lead no funil de vendas |
| `role`              | user, admin                                    | Papel do usuário no sistema        |
| `status` (pesquisa) | importado, enriquecendo, concluido, erro       | Status da pesquisa                 |

---

## 🔌 Endpoints tRPC

O sistema utiliza **tRPC 11** para comunicação type-safe entre frontend e backend. Todos os endpoints são definidos em `server/routers.ts` e organizados por domínio funcional.

### Grupos de Endpoints (~80 endpoints)

#### 1. Auth (2 endpoints)

**auth.me**

Retorna informações do usuário autenticado.

```typescript
// Input: nenhum
// Output: User | null
```

**auth.logout**

Realiza logout do usuário.

```typescript
// Input: nenhum
// Output: { success: boolean }
```

#### 2. Analytics (16 endpoints)

**analytics.getProgress**

Retorna progresso geral de analytics.

```typescript
// Input: nenhum
// Output: { totalRecords: number, processedRecords: number, percentage: number }
```

**analytics.leadsByStage**

Retorna distribuição de leads por estágio.

```typescript
// Input: { projectId: number }
// Output: Array<{ stage: string, count: number, percentage: number }>
```

**analytics.leadsByMercado**

Retorna distribuição de leads por mercado.

```typescript
// Input: { projectId: number }
// Output: Array<{ mercadoId: number, mercadoNome: string, count: number }>
```

**analytics.qualityEvolution**

Retorna evolução de qualidade ao longo do tempo.

```typescript
// Input: { projectId: number, days?: number }
// Output: Array<{ date: Date, avgQuality: number }>
```

**analytics.leadsGrowth**

Retorna crescimento de leads ao longo do tempo.

```typescript
// Input: { projectId: number, days?: number }
// Output: Array<{ date: Date, count: number, cumulative: number }>
```

**analytics.kpis**

Retorna KPIs principais do dashboard.

```typescript
// Input: { projectId: number }
// Output: {
//   totalMercados: number,
//   totalClientes: number,
//   totalConcorrentes: number,
//   totalLeads: number,
//   taxaConversao: number,
//   roiEstimado: number
// }
```

**analytics.evolution**

Retorna evolução temporal com filtro de pesquisa.

```typescript
// Input: { projectId: number, pesquisaId?: number, months?: number }
// Output: Array<{ month: string, mercados: number, clientes: number, leads: number }>
```

**analytics.geographic**

Retorna distribuição geográfica com filtro de pesquisa.

```typescript
// Input: { projectId: number, pesquisaId?: number }
// Output: Array<{ uf: string, count: number, percentage: number }>
```

**analytics.segmentation**

Retorna distribuição por segmentação com filtro de pesquisa.

```typescript
// Input: { projectId: number, pesquisaId?: number }
// Output: Array<{ segmentacao: string, count: number, percentage: number }>
```

**analytics.byMercado**

Retorna métricas por mercado com filtros dinâmicos.

```typescript
// Input: {
//   projectId: number,
//   mercadoId?: number,
//   pesquisaId?: number,
//   dateFrom?: Date,
//   dateTo?: Date
// }
// Output: Array<{
//   mercadoId: number,
//   mercadoNome: string,
//   totalLeads: number,
//   leadsAprovados: number,
//   qualidadeMedia: number,
//   taxaAprovacao: number
// }>
```

**analytics.byPesquisa**

Retorna métricas agregadas por pesquisa.

```typescript
// Input: { projectId: number, pesquisaId?: number }
// Output: {
//   totalMercados: number,
//   totalLeads: number,
//   leadsAprovados: number,
//   qualidadeMedia: number,
//   taxaAprovacao: number
// }
```

**analytics.byDimensao**

Retorna métricas por dimensão (UF/Porte/Segmentação/Categoria).

```typescript
// Input: {
//   projectId: number,
//   dimensaoTipo: 'uf' | 'porte' | 'segmentacao' | 'categoria',
//   dimensaoValor?: string,
//   dateFrom?: Date,
//   dateTo?: Date
// }
// Output: Array<{
//   dimensaoValor: string,
//   totalLeads: number,
//   leadsAprovados: number,
//   qualidadeMedia: number,
//   taxaAprovacao: number
// }>
```

**analytics.timeline**

Retorna evolução temporal diária.

```typescript
// Input: {
//   projectId: number,
//   pesquisaId?: number,
//   dateFrom?: Date,
//   dateTo?: Date
// }
// Output: Array<{
//   data: Date,
//   leadsGerados: number,
//   leadsEnriquecidos: number,
//   leadsValidados: number,
//   leadsAprovados: number,
//   qualidadeMedia: number
// }>
```

**analytics.researchOverview**

Retorna métricas consolidadas para dashboard Research Overview.

```typescript
// Input: { projectId: number, pesquisaId?: number }
// Output: {
//   kpis: {
//     totalMercados: number,
//     totalLeads: number,
//     qualidadeMedia: number,
//     taxaAprovacao: number,
//     totalValidados: number,
//     totalAprovados: number
//   },
//   distribuicaoQualidade: {
//     alta: number,
//     media: number,
//     baixa: number
//   },
//   topMercados: Array<{
//     mercadoId: number,
//     mercadoNome: string,
//     totalLeads: number,
//     qualidadeMedia: number,
//     taxaAprovacao: number
//   }>
// }
```

**analytics.timelineEvolution**

Retorna evolução temporal para gráficos de linha.

```typescript
// Input: { projectId: number, days?: number }
// Output: Array<{
//   data: Date,
//   leadsGerados: number,
//   qualidadeMedia: number
// }>
```

**analytics.runAggregation**

Executa agregação manual de métricas.

```typescript
// Input: { projectId: number }
// Output: { success: boolean, recordsProcessed: number }
```

#### 3. Projects (5 endpoints)

**projects.list**

Lista todos os projetos.

```typescript
// Input: nenhum
// Output: Array<Project>
```

**projects.getById**

Busca projeto por ID.

```typescript
// Input: { id: number }
// Output: Project | null
```

**projects.create**

Cria novo projeto.

```typescript
// Input: { nome: string, descricao?: string, cor?: string }
// Output: Project
```

**projects.update**

Atualiza projeto existente.

```typescript
// Input: { id: number, nome?: string, descricao?: string, cor?: string, ativo?: number }
// Output: Project
```

**projects.delete**

Deleta projeto (soft delete).

```typescript
// Input: { id: number }
// Output: { success: boolean }
```

#### 4. Pesquisas (5 endpoints)

**pesquisas.list**

Lista todas as pesquisas.

```typescript
// Input: { projectId: number }
// Output: Array<Pesquisa>
```

**pesquisas.getById**

Busca pesquisa por ID.

```typescript
// Input: { id: number }
// Output: Pesquisa | null
```

**pesquisas.getByProject**

Busca pesquisas de um projeto.

```typescript
// Input: { projectId: number }
// Output: Array<Pesquisa>
```

**pesquisas.create**

Cria nova pesquisa.

```typescript
// Input: { projectId: number, nome: string, descricao?: string }
// Output: Pesquisa
```

**pesquisas.update**

Atualiza pesquisa existente.

```typescript
// Input: { id: number, nome?: string, descricao?: string, status?: string }
// Output: Pesquisa
```

#### 5. Mercados, Clientes, Concorrentes, Leads (10 endpoints cada)

Cada entidade possui endpoints similares:

- `.list` - Listar com filtros
- `.getById` - Buscar por ID
- `.create` - Criar novo registro
- `.update` - Atualizar registro
- `.delete` - Deletar registro (soft delete)
- `.validate` - Validar registro (status → rich)
- `.discard` - Descartar registro (status → discarded)
- `.addTag` - Adicionar tag ao registro
- `.removeTag` - Remover tag do registro
- `.getHistory` - Histórico de alterações

#### 6. Enriquecimento (8 endpoints)

**enrichment.start**

Inicia processo de enriquecimento.

```typescript
// Input: {
//   projectId: number,
//   pesquisaId?: number,
//   templateId: number,
//   mode: 'parallel' | 'sequential',
//   limit?: number
// }
// Output: { runId: number }
```

**enrichment.pause**

Pausa execução em andamento.

```typescript
// Input: { runId: number }
// Output: { success: boolean }
```

**enrichment.resume**

Retoma execução pausada.

```typescript
// Input: { runId: number }
// Output: { success: boolean }
```

**enrichment.getProgress**

Retorna progresso de execução.

```typescript
// Input: { runId: number }
// Output: {
//   status: string,
//   totalRecords: number,
//   processedRecords: number,
//   successRecords: number,
//   errorRecords: number,
//   percentage: number,
//   eta: number
// }
```

**enrichment.getHistory**

Retorna histórico de execuções.

```typescript
// Input: { projectId: number }
// Output: Array<EnrichmentRun>
```

**enrichment.schedule**

Agenda execução recorrente.

```typescript
// Input: {
//   projectId: number,
//   configId: number,
//   frequency: 'daily' | 'weekly' | 'monthly',
//   schedule: object
// }
// Output: { scheduleId: number }
```

**enrichment.getConfig**

Retorna configuração de enriquecimento.

```typescript
// Input: { configId: number }
// Output: EnrichmentConfig
```

**enrichment.updateConfig**

Atualiza configuração de enriquecimento.

```typescript
// Input: { configId: number, config: object }
// Output: EnrichmentConfig
```

#### 7. Alertas, Relatórios, Tags, Filtros (5 endpoints cada)

Operações CRUD padrão para cada domínio.

---

## ⚙️ Configurações e Automações

### Autenticação

O sistema utiliza **Manus OAuth** para autenticação de usuários, garantindo segurança e facilidade de integração.

**Fluxo de Autenticação:**

1. Usuário acessa aplicação
2. Sistema detecta ausência de sessão
3. Sistema redireciona para Manus OAuth
4. Usuário faz login no Manus OAuth
5. Manus OAuth redireciona para `/api/oauth/callback`
6. Sistema cria sessão e armazena cookie
7. Usuário é redirecionado para dashboard

**Gestão de Sessões:**

Sessões são armazenadas em cookies HTTP-only com as seguintes configurações:

- **Nome do Cookie:** `session_token`
- **Expiração:** 7 dias
- **HTTP-Only:** Sim (não acessível via JavaScript)
- **Secure:** Sim (apenas HTTPS em produção)
- **SameSite:** Lax

**Roles (Papéis):**

O sistema suporta dois roles:

- **user:** Usuário padrão com acesso a todas as funcionalidades
- **admin:** Administrador com acesso a configurações avançadas

Roles são verificados em endpoints protegidos via `protectedProcedure` no tRPC.

### Enriquecimento

O sistema oferece dois modos de enriquecimento com configurações flexíveis.

**Modo Parallel:**

Processa até N jobs simultaneamente para maior velocidade. Configurações:

- **Máximo de jobs paralelos:** 1-10 (padrão: 5)
- **Timeout por job:** 30-300 segundos (padrão: 60)
- **Retry automático:** Sim (até 3 tentativas)
- **Backoff exponencial:** Sim (2^tentativa segundos)

**Modo Sequential:**

Processa um job por vez em ordem de prioridade. Configurações:

- **Ordem de processamento:** FIFO/LIFO/Prioridade (padrão: Prioridade)
- **Intervalo entre jobs:** 0-10 segundos (padrão: 1)
- **Pausar fila em caso de erro:** Sim/Não (padrão: Não)

**Cache de Enriquecimento:**

O sistema mantém cache de dados enriquecidos para evitar chamadas duplicadas:

- **TTL (Time To Live):** 30 dias
- **Chave de cache:** `{entityType}:{entityId}:{source}`
- **Invalidação:** Automática após TTL ou manual via API

**Retry Automático:**

Em caso de erro temporário, o sistema tenta novamente:

- **Máximo de tentativas:** 3
- **Backoff exponencial:** 2^tentativa segundos (2s, 4s, 8s)
- **Erros retriáveis:** Timeout, 429 (Rate Limit), 500-503

### Agendamento Recorrente

O sistema utiliza **node-cron** para execução de tarefas recorrentes.

**Cron Job de Agregação Diária:**

Executa diariamente às 00:00 para agregar métricas de analytics:

- **Cron Expression:** `0 0 0 * * *` (meia-noite todos os dias)
- **Tarefas Executadas:**
  - Agregação de métricas por mercado
  - Agregação de métricas por pesquisa
  - Agregação de métricas por dimensão
  - Agregação de evolução temporal
- **Duração Estimada:** 5-15 minutos (depende do volume de dados)
- **Logs:** Salvos em `activity_log`

**Agendamentos Personalizados:**

Usuários podem configurar agendamentos personalizados via `/agendamento`:

- **Enriquecimento recorrente:** Diário/Semanal/Mensal
- **Geração de relatórios:** Diário/Semanal/Mensal
- **Exportação de dados:** Diário/Semanal/Mensal

### Notificações

O sistema oferece três canais de notificação.

**Notificações In-App:**

Exibidas no sistema como toast notifications:

- **Tipos:** Info/Success/Warning/Error
- **Duração:** 3-5 segundos (auto-dismiss)
- **Persistência:** Salvas em tabela `notifications`
- **Badge:** Contador de não lidas no header

**Alertas por Email:**

Enviados via SMTP configurado:

- **Servidor SMTP:** Configurável via variáveis de ambiente
- **Templates:** HTML responsivo
- **Anexos:** Suportado (relatórios PDF)
- **Tracking:** Abertura e cliques rastreados

**Webhooks:**

Envio de POST request para URL configurada:

- **Método:** POST
- **Content-Type:** application/json
- **Headers:** Customizáveis
- **Payload:** JSON com dados do evento
- **Retry:** Até 3 tentativas em caso de erro

### Exportação

O sistema oferece múltiplos formatos de exportação.

**Exportação CSV/Excel:**

Disponível em todos os módulos com dados tabulares:

- **Formatos:** CSV, XLSX
- **Encoding:** UTF-8
- **Separador CSV:** Vírgula (,)
- **Campos:** Todos os campos visíveis na tabela
- **Limite:** Sem limite (exporta todos os registros filtrados)

**Geração de PDF (Relatórios):**

Relatórios executivos formatados para impressão:

- **Engine:** WeasyPrint
- **Tamanho:** A4
- **Orientação:** Retrato
- **Margens:** 2cm (todas)
- **Fontes:** Inter (sans-serif)
- **Gráficos:** Renderizados como imagens PNG

### Integrações Planejadas

**Salesforce:**

Integração para exportação de leads e feedback de conversões:

- **Exportação de Leads:** Envio automático de leads aprovados para Salesforce
- **Mapeamento de Campos:** Customizável via interface
- **Feedback de Conversões:** Importação de status de oportunidades
- **Sincronização:** Bidirecional (exportação + importação)

**APIs Externas de Enriquecimento:**

Integração com APIs de dados empresariais:

- **ReceitaWS:** Dados cadastrais de empresas (CNPJ, endereço, porte)
- **Google Places:** Dados de localização e contato
- **LinkedIn Sales Navigator:** Dados de empresas e contatos
- **Clearbit:** Enriquecimento de dados de empresas

---

## 📊 Dados do Sistema (Snapshot Atual)

### Totais no Banco de Dados (19/11/2025)

| Entidade            | Quantidade           | % do Total | Observação                      |
| ------------------- | -------------------- | ---------- | ------------------------------- |
| **Mercados Únicos** | 1.619                | 5.6%       | Mercados identificados          |
| **Clientes**        | 1.494 (1.474 únicos) | 5.0%       | Taxa de duplicação: 1.3%        |
| **Concorrentes**    | 12.908               | 44.7%      | Média: 8.0 concorrentes/mercado |
| **Leads**           | 12.885               | 44.6%      | Média: 8.0 leads/mercado        |
| **TOTAL GERAL**     | **28.869**           | **100%**   | -                               |

### Projetos Ativos

| #   | Nome               | Status | Descrição                                  |
| --- | ------------------ | ------ | ------------------------------------------ |
| 1   | Agro               | Ativo  | Projeto de pesquisa no setor agrícola      |
| 2   | Embalagens         | Ativo  | Projeto de pesquisa no setor de embalagens |
| 3   | (Terceiro projeto) | Ativo  | -                                          |

### Métricas de Enriquecimento

| Métrica                           | Valor | Status       |
| --------------------------------- | ----- | ------------ |
| **Total de Execuções**            | 3     | ✅           |
| **Execuções Completas**           | 2     | ✅           |
| **Em Execução**                   | 1     | 🔄           |
| **Com Erro**                      | 0     | ✅           |
| **Taxa de Sucesso (finalizadas)** | 100%  | ✅ Excelente |

### Qualidade de Dados

| Métrica                           | Valor                         | Avaliação               |
| --------------------------------- | ----------------------------- | ----------------------- |
| **Taxa de duplicação (clientes)** | 1.3% (20 de 1.494)            | ✅ Excelente            |
| **Clientes multi-mercado**        | 10 clientes (3 mercados cada) | ✅ Esperado             |
| **Proporção leads/clientes**      | 8.8:1                         | ✅ Alto potencial       |
| **Média de concorrentes/mercado** | 8.0                           | ✅ Alta competitividade |

### Crescimento

| Período                     | Métrica                   | Valor                          |
| --------------------------- | ------------------------- | ------------------------------ |
| **21/10/2025 - 19/11/2025** | Crescimento de clientes   | +86.75% (800 → 1.494)          |
| **29 dias**                 | Taxa diária               | +23.9 clientes/dia             |
| **19/11/2025**              | Enriquecimento automático | +694 clientes (46.5% do total) |

---

## 🏥 Saúde do Sistema

### Status dos Componentes

| Componente                | Status       | Nota                    | Observação                         |
| ------------------------- | ------------ | ----------------------- | ---------------------------------- |
| **Banco de Dados**        | ✅ Excelente | 28.869 registros        | Online e responsivo                |
| **API Backend**           | ✅ Excelente | ~80 endpoints           | Sem erros reportados               |
| **Enriquecimento**        | ⚠️ Atenção   | 1 execução em andamento | Taxa de sucesso 100% (finalizadas) |
| **Fila de Processamento** | ✅ Excelente | Vazia e pronta          | Sem backlog                        |
| **Performance**           | ✅ Excelente | 0% de erros             | Nenhum erro registrado             |
| **Configuração**          | ⚠️ Atenção   | Poucas tags             | Recomenda-se criar mais tags       |
| **UI/UX**                 | ✅ Excelente | Refatorada              | Sidebar, breadcrumbs, onboarding   |
| **Analytics**             | ✅ Excelente | Implementado            | Lead generation analytics          |
| **Cron Jobs**             | ✅ Excelente | Ativo                   | Job diário às 00:00                |

### Nota Geral: 8.5/10

O sistema está **operacional, estável e pronto para escalar**, com excelente taxa de sucesso nas execuções finalizadas (100%) e nenhum erro registrado.

### Pontos Fortes

1. **Arquitetura sólida** - Full-stack TypeScript com tRPC garantindo type-safety
2. **Banco de dados robusto** - 34 tabelas bem estruturadas, 28.869 registros
3. **UI/UX moderna** - Sidebar colapsável, breadcrumbs dinâmicos, onboarding guiado
4. **Analytics avançados** - Lead generation analytics com agregação automática
5. **Qualidade de dados** - Taxa de duplicação de apenas 1.3%
6. **Performance** - 0% de erros, 100% de sucesso em execuções finalizadas
7. **Escalabilidade** - Hierarquia de dados (PROJECT → PESQUISA → DADOS), múltiplos projetos

### Pontos de Melhoria

1. **Configuração de tags** - Apenas 1 tag configurada (recomenda-se criar mais)
2. **Atividade baixa** - 0 atividades nas últimas 24h (sistema em período de baixa utilização)
3. **Limpeza de duplicados** - 20 registros duplicados (1.3%) aguardando limpeza
4. **Integrações** - Salesforce e APIs externas ainda não implementadas
5. **Dashboards avançados** - Lead Quality Intelligence, Operational Efficiency (planejados)

---

## 🚀 Próximos Passos Recomendados

### Curto Prazo (Próximas 24h)

**1. Aguardar conclusão da execução em andamento**

Monitorar progresso via `/enrichment-progress` e verificar se há erros ou travamentos. A execução atual está em andamento e deve ser concluída antes de iniciar novas ações.

**2. Configurar enriquecimento recorrente**

Acessar `/agendamento` e configurar execução diária ou semanal. Definir limite de registros por execução para controle de custos. Recomenda-se começar com execução semanal de 100 registros.

**3. Criar tags adicionais**

Acessar "Gerenciar Tags" e criar tags sugeridas:

- "Alta Prioridade" (cor vermelha)
- "B2C" (cor azul)
- "B2B2C" (cor verde)
- "Validado" (cor verde escuro)
- "Em Análise" (cor amarela)

Aplicar tags aos mercados existentes para melhor categorização.

### Médio Prazo (Próxima Semana)

**1. Validar mercados pendentes**

Acessar página inicial, filtrar por "Pendentes" e validar ou descartar mercados. Priorizar mercados com maior número de clientes associados.

**2. Configurar alertas personalizados**

Acessar `/alertas` e criar alertas sugeridos:

- "Novo mercado identificado" (notificação in-app + email)
- "Execução de enriquecimento com erro" (notificação in-app + email)
- "Lead de alta qualidade gerado" (notificação in-app)

**3. Gerar primeiro relatório executivo**

Acessar `/relatorios`, selecionar "Relatório Executivo", configurar filtros (projeto, período) e gerar PDF. Revisar relatório e ajustar seções conforme necessário.

### Longo Prazo (Próximo Mês)

**1. Análise de ROI**

Acessar `/roi`, configurar custos de ferramentas e equipe, acompanhar taxa de conversão de leads. Identificar mercados mais rentáveis e ajustar estratégia.

**2. Otimização de performance**

Verificar hit rate de cache de enriquecimento e ajustar TTL se necessário. Criar índices adicionais no banco de dados para queries mais lentas.

**3. Análise de funil de vendas**

Acessar `/funil`, acompanhar evolução de leads pelos estágios, identificar gargalos de conversão e implementar melhorias no processo de vendas.

**4. Limpeza de duplicados**

Executar script SQL para remover ou mesclar 20 registros duplicados identificados. Implementar constraint UNIQUE no banco de dados para prevenir duplicação futura.

---

## 📚 Procedimentos Operacionais

### Criação de Novo Projeto

**Objetivo:** Criar novo workspace isolado para pesquisa de mercado.

**Passos:**

1. Acessar página inicial
2. Clicar em botão "Novo Projeto" na barra de ações
3. Preencher formulário:
   - Nome do projeto (ex: "Setor Automotivo")
   - Descrição (opcional)
   - Cor de identificação (escolher cor hex)
4. Clicar em "Criar Projeto"
5. Sistema cria projeto e redireciona para página inicial
6. Selecionar novo projeto no dropdown de projetos

**Resultado Esperado:** Novo projeto criado e selecionado, pronto para importação de dados.

### Importação de Dados

**Objetivo:** Importar dados de clientes de arquivo CSV/Excel.

**Passos:**

1. Preparar arquivo CSV/Excel com colunas obrigatórias:
   - nome (nome da empresa)
   - cnpj (opcional)
   - cidade (opcional)
   - uf (opcional)
2. Acessar módulo de importação (em desenvolvimento)
3. Selecionar projeto de destino
4. Fazer upload do arquivo
5. Mapear colunas do arquivo para campos do sistema
6. Revisar preview dos dados
7. Clicar em "Importar"
8. Sistema cria nova pesquisa e importa dados
9. Aguardar conclusão da importação

**Resultado Esperado:** Nova pesquisa criada com dados importados, pronta para enriquecimento.

### Execução de Enriquecimento

**Objetivo:** Enriquecer dados de clientes com informações adicionais.

**Passos:**

1. Acessar `/enrichment`
2. Selecionar template de enriquecimento (Básico/Completo/Personalizado)
3. Selecionar modo de execução (Parallel/Sequential)
4. Configurar limite de registros (ex: 100)
5. Selecionar entidades a enriquecer (Clientes/Concorrentes/Leads)
6. Configurar priorização (Mais recentes primeiro)
7. Clicar em "Iniciar Enriquecimento"
8. Sistema redireciona para `/enrichment-progress`
9. Monitorar progresso em tempo real
10. Aguardar conclusão (notificação toast ao concluir)

**Resultado Esperado:** Registros enriquecidos com dados adicionais, prontos para validação.

### Validação de Mercados

**Objetivo:** Validar ou descartar mercados identificados.

**Passos:**

1. Acessar página inicial
2. Selecionar aba "Pendentes"
3. Clicar em um mercado para ver detalhes
4. Revisar informações do mercado:
   - Nome e descrição
   - Segmentação e categoria
   - Clientes associados
   - Concorrentes identificados
5. Avaliar relevância do mercado
6. Clicar em "Validar" (se relevante) ou "Descartar" (se não relevante)
7. Adicionar notas de validação (opcional)
8. Confirmar ação
9. Sistema atualiza status do mercado

**Resultado Esperado:** Mercado validado ou descartado, removido da aba "Pendentes".

### Geração de Relatório

**Objetivo:** Gerar relatório executivo em PDF.

**Passos:**

1. Acessar `/relatorios`
2. Selecionar tipo de relatório (Executivo/Mercados/Clientes/etc)
3. Configurar filtros:
   - Projeto (selecionar projeto específico)
   - Pesquisa (opcional)
   - Período (data início e fim)
   - Tags (opcional)
4. Selecionar formato de exportação (PDF)
5. Visualizar preview do relatório
6. Ajustar formatação se necessário
7. Clicar em "Gerar Relatório"
8. Aguardar processamento (5-30 segundos)
9. Download automático do PDF

**Resultado Esperado:** Relatório PDF gerado e baixado, pronto para apresentação.

### Configuração de Alerta

**Objetivo:** Configurar alerta automático para evento específico.

**Passos:**

1. Acessar `/alertas`
2. Clicar em "Novo Alerta"
3. Preencher formulário:
   - Nome do alerta (ex: "Novo mercado de alto potencial")
   - Tipo de entidade (Mercado)
   - Condição de disparo (Novo registro criado)
   - Threshold (se aplicável)
4. Selecionar canais de notificação:
   - Email (marcar checkbox e preencher endereço)
   - Notificação in-app (marcar checkbox)
5. Configurar frequência (Imediato)
6. Clicar em "Salvar Alerta"
7. Sistema ativa alerta

**Resultado Esperado:** Alerta configurado e ativo, pronto para disparar quando condição for atendida.

### Agendamento de Enriquecimento

**Objetivo:** Configurar enriquecimento recorrente automático.

**Passos:**

1. Acessar `/agendamento`
2. Clicar em "Novo Agendamento"
3. Selecionar tipo de tarefa (Enriquecimento)
4. Configurar parâmetros:
   - Template de enriquecimento (Completo)
   - Entidades a enriquecer (Clientes + Leads)
   - Limite de registros (100)
   - Modo de execução (Parallel)
5. Selecionar frequência (Semanal)
6. Selecionar dia da semana (Segunda-feira)
7. Selecionar horário (02:00)
8. Configurar notificações:
   - Notificar ao concluir execução (marcar)
   - Notificar em caso de erro (marcar)
9. Clicar em "Salvar Agendamento"
10. Sistema ativa agendamento

**Resultado Esperado:** Agendamento configurado e ativo, executará automaticamente toda segunda-feira às 02:00.

---

## 🔧 Manutenção e Troubleshooting

### Problemas Comuns

**1. Enriquecimento travado**

**Sintoma:** Execução de enriquecimento não progride após vários minutos.

**Diagnóstico:**

- Acessar `/enrichment-progress`
- Verificar log de execução para erros
- Verificar se há jobs com status "processing" há mais de 5 minutos

**Solução:**

- Clicar em "Pausar" e depois "Retomar"
- Se não resolver, acessar banco de dados e atualizar status dos jobs travados para "pending"
- Executar query: `UPDATE enrichment_jobs SET status = 'pending' WHERE status = 'processing' AND startedAt < NOW() - INTERVAL 10 MINUTE`

**2. Duplicação de registros**

**Sintoma:** Registros duplicados aparecem na lista.

**Diagnóstico:**

- Acessar módulo de atividade (`/atividade`)
- Filtrar por tipo de ação "Criar"
- Verificar se há criações duplicadas no mesmo timestamp

**Solução:**

- Identificar registros duplicados via query SQL
- Mesclar registros duplicados (manter o mais completo)
- Adicionar constraint UNIQUE no banco de dados para prevenir duplicação futura

**3. Alertas não disparando**

**Sintoma:** Alertas configurados não disparam quando condição é atendida.

**Diagnóstico:**

- Acessar `/alertas`
- Verificar se alerta está ativo (toggle switch)
- Verificar configuração de condição de disparo
- Acessar `/alertas/historico` para ver se há tentativas de disparo

**Solução:**

- Verificar se condição de disparo está correta
- Testar alerta manualmente criando registro que atenda a condição
- Verificar logs do sistema para erros de envio de email/webhook

**4. Relatório não gerando**

**Sintoma:** Clique em "Gerar Relatório" não inicia download.

**Diagnóstico:**

- Abrir console do navegador (F12)
- Verificar se há erros de JavaScript
- Verificar se há erros de rede (aba Network)

**Solução:**

- Limpar cache do navegador
- Tentar novamente em navegador diferente
- Verificar se filtros de dados estão corretos (período muito amplo pode causar timeout)
- Reduzir período de análise ou número de seções incluídas

### Logs do Sistema

**Localização dos Logs:**

- **Logs de Aplicação:** `activity_log` (tabela no banco de dados)
- **Logs de Enriquecimento:** `enrichment_runs` e `enrichment_jobs`
- **Logs de Alertas:** `alert_history`
- **Logs de Sincronização:** `salesforce_sync_log`

**Acesso aos Logs:**

- **Via Interface:** Acessar `/atividade` para logs de aplicação
- **Via Banco de Dados:** Executar queries SQL diretamente no banco

**Queries Úteis:**

```sql
-- Últimas 100 atividades
SELECT * FROM activity_log ORDER BY createdAt DESC LIMIT 100;

-- Execuções de enriquecimento com erro
SELECT * FROM enrichment_runs WHERE status = 'error' ORDER BY createdAt DESC;

-- Alertas que falharam ao enviar
SELECT * FROM alert_history WHERE deliveryStatus = 'falha' ORDER BY triggeredAt DESC;
```

### Backup e Restore

**Backup do Banco de Dados:**

Recomenda-se realizar backup diário do banco de dados MySQL/TiDB.

**Comando de Backup:**

```bash
mysqldump -u usuario -p nome_banco > backup_$(date +%Y%m%d).sql
```

**Restore do Banco de Dados:**

```bash
mysql -u usuario -p nome_banco < backup_20251120.sql
```

**Backup de Arquivos:**

Não há arquivos críticos no filesystem (dados estão no banco).

---

## 📞 Suporte e Contato

Para dúvidas, sugestões ou reportar problemas, entre em contato:

- **Email:** suporte@inteligenciademercado.com
- **Documentação Online:** https://docs.inteligenciademercado.com
- **Status do Sistema:** https://status.inteligenciademercado.com

---

**Documento gerado automaticamente por:** Manus AI  
**Data:** 20 de Novembro de 2025  
**Versão:** 2.0  
**Tipo:** Guia Operacional Completo
