# Guia Completo de Funcionalidades - Inteligência de Mercado

**Versão:** 1.0  
**Data:** 19 de Novembro de 2025  
**Autor:** Manus AI

---

## Sumário Executivo

Este documento apresenta um guia completo de todas as funcionalidades, telas, dashboards e relatórios da aplicação **Inteligência de Mercado** (anteriormente Gestor PAV). A aplicação foi desenvolvida para gerenciar pesquisas de mercado, enriquecimento de dados de clientes, concorrentes e leads, com foco em análise estratégica e tomada de decisão baseada em dados.

O sistema oferece **17 módulos principais** organizados em uma arquitetura moderna com React 19, tRPC 11, Express 4 e MySQL/TiDB, garantindo performance, escalabilidade e experiência de usuário otimizada.

---

## 1. Visão Geral da Aplicação

### 1.1 Arquitetura e Tecnologias

A aplicação utiliza uma arquitetura **full-stack TypeScript** com as seguintes tecnologias principais:

| Camada | Tecnologia | Versão | Descrição |
|--------|-----------|--------|-----------|
| **Frontend** | React | 19 | Interface de usuário moderna e responsiva |
| **Estilização** | Tailwind CSS | 4 | Design system consistente |
| **Componentes** | shadcn/ui | - | Biblioteca de componentes acessíveis |
| **Backend** | Express | 4 | Servidor HTTP robusto |
| **API** | tRPC | 11 | Comunicação type-safe entre frontend e backend |
| **Banco de Dados** | MySQL/TiDB | - | Armazenamento persistente |
| **ORM** | Drizzle | - | Mapeamento objeto-relacional |
| **Autenticação** | Manus OAuth | - | Sistema de autenticação integrado |

### 1.2 Estrutura de Projetos

O sistema permite gerenciar **múltiplos projetos** de pesquisa de mercado simultaneamente, cada um com seus próprios:

- **Mercados únicos** identificados e validados
- **Clientes** (empresas B2C ou B2B2C)
- **Concorrentes** diretos e indiretos
- **Leads** qualificados para prospecção
- **Tags** personalizadas para categorização
- **Filtros salvos** para análises recorrentes

---

## 2. Módulos e Funcionalidades

### 2.1 Início (Cascade View)

**Rota:** `/`  
**Ícone:** Home  
**Descrição:** Tela principal da aplicação com visão estratégica em cascata.

#### Funcionalidades Principais

A tela de início apresenta uma **visualização em cascata** que permite navegar hierarquicamente pelos dados do projeto selecionado. O usuário pode selecionar um mercado único e visualizar todos os clientes, concorrentes e leads associados a ele.

**Componentes da Tela:**

1. **Seletor de Projeto**
   - Dropdown dinâmico com lista de projetos ativos
   - Opção "Todos os Projetos" para visão agregada
   - Persistência da seleção no localStorage

2. **Estatísticas Globais**
   - Total de mercados únicos identificados
   - Total de clientes cadastrados
   - Total de concorrentes mapeados
   - Total de leads qualificados
   - Atualização em tempo real

3. **Barra de Ações**
   - **Dashboard:** Acesso rápido ao dashboard principal
   - **Monitorar Enriquecimento:** Acompanhamento em tempo real
   - **Exportar Filtrados:** Download de dados filtrados em CSV/Excel
   - **Novo Projeto:** Criação de novo projeto de pesquisa
   - **Gerenciar Tags:** Administração de tags personalizadas

4. **Sistema de Filtros**
   - **Filtrar por Tags:** Seleção múltipla de tags
   - **Segmentação:** Filtro por tipo de segmentação (B2C, B2B2C)
   - **Salvar Filtros:** Persistência de combinações de filtros
   - **Limpar Filtros:** Reset rápido de todos os filtros

5. **Abas de Visualização**
   - **Todos:** Visão completa de todos os registros
   - **Pendentes:** Registros aguardando validação
   - **Validados:** Registros confirmados
   - **Descartados:** Registros rejeitados

6. **Seleção de Mercado**
   - Grid de cards com mercados únicos
   - Informações: nome, segmentação, número de clientes
   - Botão de adicionar mercado manualmente
   - Paginação para grandes volumes

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| CV-01 | Seleção de projeto | Selecionar projeto no dropdown | Estatísticas e mercados atualizados |
| CV-02 | Filtro por tag | Aplicar filtro de tag específica | Apenas mercados com a tag exibidos |
| CV-03 | Mudança de aba | Clicar em "Pendentes" | Apenas mercados pendentes exibidos |
| CV-04 | Exportar dados | Clicar em "Exportar Filtrados" | Download de arquivo CSV iniciado |
| CV-05 | Busca global | Digitar termo na busca | Resultados filtrados em tempo real |

---

### 2.2 Mercados

**Rota:** `/mercados`  
**Ícone:** Database  
**Descrição:** Exploração detalhada de mercados identificados.

#### Funcionalidades Principais

O módulo de mercados oferece uma **visão aprofundada** de cada mercado único identificado durante a pesquisa, permitindo análise detalhada de características, validação e gerenciamento de dados associados.

**Componentes da Tela:**

1. **Lista de Mercados**
   - Tabela com colunas: Nome, Segmentação, Clientes, Status
   - Ordenação por qualquer coluna
   - Busca por nome ou características
   - Indicadores visuais de status (pendente/validado/descartado)

2. **Detalhes do Mercado** (`/mercado/:id`)
   - Informações completas do mercado
   - Lista de clientes associados
   - Lista de concorrentes identificados
   - Lista de leads qualificados
   - Histórico de alterações

3. **Ações de Validação**
   - **Validar:** Confirmar mercado como relevante
   - **Descartar:** Marcar mercado como não relevante
   - **Editar:** Modificar informações do mercado
   - **Adicionar Tags:** Categorização personalizada

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| MER-01 | Visualizar detalhes | Clicar em mercado da lista | Página de detalhes carregada |
| MER-02 | Validar mercado | Clicar em "Validar" | Status alterado para "Validado" |
| MER-03 | Adicionar tag | Selecionar tag e salvar | Tag associada ao mercado |
| MER-04 | Buscar mercado | Digitar nome na busca | Lista filtrada exibida |
| MER-05 | Ordenar lista | Clicar em cabeçalho de coluna | Lista reordenada |

---

### 2.3 Dashboard

**Rota:** `/dashboard`  
**Ícone:** BarChart3  
**Descrição:** Estatísticas e métricas gerais do projeto.

#### Funcionalidades Principais

O dashboard principal apresenta uma **visão consolidada** das métricas mais importantes do projeto selecionado, com gráficos interativos e indicadores de performance.

**Componentes da Tela:**

1. **Cards de Métricas**
   - Total de mercados (com variação percentual)
   - Total de clientes (com variação percentual)
   - Total de concorrentes (com variação percentual)
   - Total de leads (com variação percentual)
   - Taxa de conversão de leads
   - ROI estimado

2. **Gráficos Principais**
   - **Distribuição por Segmentação:** Gráfico de pizza mostrando B2C vs B2B2C
   - **Evolução Temporal:** Gráfico de linha com crescimento ao longo do tempo
   - **Top 10 Mercados:** Gráfico de barras com mercados mais relevantes
   - **Status de Validação:** Gráfico de rosca com pendentes/validados/descartados

3. **Tabela de Últimas Atividades**
   - Registro das 10 últimas ações realizadas
   - Timestamp, usuário, tipo de ação e detalhes
   - Link direto para o registro afetado

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| DASH-01 | Visualizar métricas | Acessar dashboard | Cards com números atualizados |
| DASH-02 | Interagir com gráfico | Hover sobre gráfico de pizza | Tooltip com detalhes exibido |
| DASH-03 | Filtrar período | Selecionar "Último mês" | Dados filtrados por período |
| DASH-04 | Acessar atividade | Clicar em item da tabela | Redirecionado para registro |
| DASH-05 | Atualizar dados | Aguardar 30 segundos | Dados atualizados automaticamente |

---

### 2.4 Analytics

**Rota:** `/analytics`  
**Ícone:** TrendingUp  
**Descrição:** Análises avançadas e insights estratégicos.

#### Funcionalidades Principais

O módulo de analytics oferece **análises aprofundadas** com cruzamento de dados, identificação de padrões e geração de insights acionáveis para tomada de decisão estratégica.

**Componentes da Tela:**

1. **Análise de Mercado**
   - Mapa de calor de concentração geográfica
   - Análise de saturação por mercado
   - Identificação de oportunidades (mercados subexplorados)
   - Análise de competitividade

2. **Análise de Clientes**
   - Segmentação por porte (pequeno/médio/grande)
   - Análise de faturamento estimado
   - Distribuição geográfica
   - Padrões de comportamento

3. **Análise de Concorrentes**
   - Matriz de posicionamento competitivo
   - Análise de market share estimado
   - Identificação de gaps competitivos
   - Benchmarking de estratégias

4. **Análise de Leads**
   - Scoring de qualificação
   - Probabilidade de conversão
   - Análise de fit com ICP (Ideal Customer Profile)
   - Recomendações de priorização

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| ANA-01 | Visualizar mapa de calor | Acessar análise de mercado | Mapa interativo exibido |
| ANA-02 | Filtrar por segmento | Selecionar "B2C" | Análises filtradas por B2C |
| ANA-03 | Exportar insights | Clicar em "Exportar Análise" | PDF com insights gerado |
| ANA-04 | Comparar períodos | Selecionar dois períodos | Gráficos comparativos exibidos |
| ANA-05 | Drill-down | Clicar em segmento do gráfico | Detalhamento do segmento |

---

### 2.5 Enriquecimento

**Rota:** `/enrichment`  
**Ícone:** Settings  
**Descrição:** Configuração e execução de enriquecimento de dados.

#### Funcionalidades Principais

O módulo de enriquecimento permite **configurar e executar** processos automatizados de coleta e enriquecimento de dados de clientes, concorrentes e leads utilizando fontes externas e APIs.

**Componentes da Tela:**

1. **Seletor de Template**
   - Templates pré-configurados de enriquecimento
   - Personalização de campos a enriquecer
   - Configuração de fontes de dados
   - Preview de estrutura de dados

2. **Seletor de Modo de Execução**
   - **Modo Simultâneo (Parallel):** Processa até N jobs ao mesmo tempo
   - **Modo Fila (Sequential):** Processa um job por vez
   - Configuração de máximo de jobs paralelos
   - Status em tempo real da fila

3. **Configurações de Enriquecimento**
   - Seleção de entidades a enriquecer (clientes/concorrentes/leads)
   - Limite de registros por execução
   - Priorização de registros
   - Agendamento de execução

4. **Botões de Ação**
   - **Iniciar Enriquecimento:** Executar processo imediatamente
   - **Agendar:** Configurar execução recorrente
   - **Pausar:** Interromper execução em andamento
   - **Retomar:** Continuar execução pausada

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| ENR-01 | Selecionar template | Escolher template de clientes | Campos configurados automaticamente |
| ENR-02 | Iniciar enriquecimento | Clicar em "Iniciar" | Processo iniciado, progresso exibido |
| ENR-03 | Pausar execução | Clicar em "Pausar" | Execução pausada, status atualizado |
| ENR-04 | Alternar modo | Mudar de Parallel para Sequential | Modo alterado, fila reorganizada |
| ENR-05 | Configurar limite | Definir limite de 100 registros | Enriquecimento limitado a 100 |

---

### 2.6 Monitoramento

**Rota:** `/enrichment-progress`  
**Ícone:** Clock  
**Descrição:** Acompanhamento em tempo real do progresso de enriquecimento.

#### Funcionalidades Principais

O módulo de monitoramento oferece **visibilidade completa** do progresso de enriquecimento em tempo real, com métricas detalhadas, logs de execução e alertas de erro.

**Componentes da Tela:**

1. **Indicador de Progresso**
   - Barra de progresso geral (0-100%)
   - Percentual de conclusão em tempo real
   - Tempo decorrido e tempo estimado restante (ETA)
   - Taxa de processamento (registros/minuto)

2. **Métricas Detalhadas**
   - Total de registros a processar
   - Registros processados com sucesso
   - Registros com erro
   - Registros pendentes
   - Taxa de sucesso (%)

3. **Log de Execução**
   - Stream em tempo real de eventos
   - Filtros por tipo de evento (info/warning/error)
   - Timestamp de cada evento
   - Detalhes técnicos expandíveis

4. **Notificações de Progresso**
   - Toast notification a cada 25% de progresso
   - Notificação de conclusão
   - Alertas de erro crítico
   - Notificações de jobs concluídos na fila

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| MON-01 | Visualizar progresso | Acessar durante enriquecimento | Barra de progresso atualizada |
| MON-02 | Filtrar logs | Selecionar "Apenas erros" | Apenas logs de erro exibidos |
| MON-03 | Expandir detalhes | Clicar em evento do log | Detalhes técnicos expandidos |
| MON-04 | Receber notificação | Aguardar 25% de progresso | Toast notification exibido |
| MON-05 | Pausar via monitor | Clicar em "Pausar" | Execução pausada imediatamente |

---

### 2.7 Evolução

**Rota:** `/enrichment-evolution`  
**Ícone:** TrendingUp  
**Descrição:** Evolução temporal e previsões de enriquecimento.

#### Funcionalidades Principais

O módulo de evolução apresenta **análise temporal** do progresso de enriquecimento com gráficos de evolução, previsões de término e estimativas de totais finais do banco de dados.

**Componentes da Tela:**

1. **Cards de Previsão**
   - **Previsão de Término:** Data e hora estimada de conclusão (ETA)
   - **Taxa de Processamento:** Registros processados por hora
   - **Totais Atuais:** Quantidade atual de registros no banco
   - **Estimativa Final:** Projeção de totais após conclusão

2. **Gráfico de Evolução Temporal**
   - Gráfico de linha com evolução dos últimos 30 dias
   - Duas linhas: Processados vs Total
   - Eixo X: Datas
   - Eixo Y: Quantidade de registros
   - Tooltip interativo com detalhes

3. **Detalhamento de Totais Atuais**
   - Clientes: quantidade atual
   - Concorrentes: quantidade atual
   - Leads: quantidade atual
   - Mercados: quantidade atual

4. **Detalhamento de Estimativas Finais**
   - Clientes: projeção final
   - Concorrentes: projeção final
   - Leads: projeção final
   - Mercados: projeção final

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| EVO-01 | Visualizar ETA | Acessar página | ETA calculado e exibido |
| EVO-02 | Interagir com gráfico | Hover sobre ponto da linha | Tooltip com dados do dia |
| EVO-03 | Atualização automática | Aguardar 10 segundos | Dados atualizados automaticamente |
| EVO-04 | Comparar totais | Visualizar cards lado a lado | Diferença entre atual e estimado |
| EVO-05 | Verificar precisão | Comparar ETA com conclusão real | Margem de erro < 10% |

---

### 2.8 Alertas

**Rota:** `/alertas`  
**Ícone:** Bell  
**Descrição:** Configuração de alertas personalizados.

#### Funcionalidades Principais

O módulo de alertas permite **configurar notificações automáticas** baseadas em condições específicas, garantindo que o usuário seja informado sobre eventos importantes em tempo real.

**Componentes da Tela:**

1. **Lista de Alertas Configurados**
   - Nome do alerta
   - Condição configurada
   - Status (ativo/inativo)
   - Última execução
   - Ações (editar/excluir/ativar/desativar)

2. **Formulário de Criação de Alerta**
   - **Nome:** Identificação do alerta
   - **Tipo:** Mercado/Cliente/Concorrente/Lead/Sistema
   - **Condição:** Regra de disparo (ex: "Novo mercado identificado")
   - **Canal:** Email/Notificação in-app/Webhook
   - **Frequência:** Imediato/Diário/Semanal

3. **Histórico de Alertas** (`/alertas/historico`)
   - Lista de alertas disparados
   - Timestamp de disparo
   - Detalhes da condição atendida
   - Status de entrega

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| ALE-01 | Criar alerta | Preencher formulário e salvar | Alerta criado e ativo |
| ALE-02 | Desativar alerta | Clicar em toggle de status | Alerta desativado |
| ALE-03 | Testar condição | Criar condição e simular evento | Alerta disparado corretamente |
| ALE-04 | Visualizar histórico | Acessar histórico | Lista de alertas disparados |
| ALE-05 | Editar alerta | Modificar condição e salvar | Alerta atualizado |

---

### 2.9 Relatórios

**Rota:** `/relatorios`  
**Ícone:** FileText  
**Descrição:** Geração de relatórios executivos em PDF.

#### Funcionalidades Principais

O módulo de relatórios permite **gerar documentos executivos** em formato PDF com análises consolidadas, gráficos e insights para apresentação a stakeholders.

**Componentes da Tela:**

1. **Seletor de Tipo de Relatório**
   - **Relatório Executivo:** Visão geral do projeto
   - **Relatório de Mercados:** Análise detalhada de mercados
   - **Relatório de Clientes:** Perfil de clientes identificados
   - **Relatório de Concorrentes:** Análise competitiva
   - **Relatório de Leads:** Pipeline de oportunidades
   - **Relatório Personalizado:** Seleção manual de seções

2. **Configurações do Relatório**
   - Período de análise (data início e fim)
   - Filtros de dados (tags, segmentação, status)
   - Seções a incluir (checklist)
   - Formato de exportação (PDF/Excel)

3. **Preview do Relatório**
   - Visualização prévia das páginas
   - Navegação entre seções
   - Ajustes de formatação

4. **Botões de Ação**
   - **Gerar Relatório:** Criar documento final
   - **Agendar Envio:** Programar envio recorrente por email
   - **Salvar Template:** Salvar configuração para reutilização

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| REL-01 | Gerar relatório executivo | Selecionar tipo e gerar | PDF criado e disponível para download |
| REL-02 | Filtrar por período | Definir últimos 30 dias | Dados filtrados no relatório |
| REL-03 | Personalizar seções | Desmarcar seções desnecessárias | Relatório gerado sem seções desmarcadas |
| REL-04 | Agendar envio | Configurar envio semanal | Agendamento criado |
| REL-05 | Salvar template | Salvar configuração personalizada | Template salvo e reutilizável |

---

### 2.10 ROI

**Rota:** `/roi`  
**Ícone:** TrendingUp  
**Descrição:** Dashboard de ROI e conversões.

#### Funcionalidades Principais

O módulo de ROI oferece **análise financeira** do retorno sobre investimento em pesquisa de mercado e enriquecimento de dados, com métricas de conversão e projeções de receita.

**Componentes da Tela:**

1. **Cards de Métricas Financeiras**
   - **ROI Total:** Percentual de retorno sobre investimento
   - **Custo por Lead:** Valor médio investido por lead qualificado
   - **Taxa de Conversão:** Percentual de leads convertidos em clientes
   - **Receita Gerada:** Valor total de receita atribuída ao projeto

2. **Gráfico de Funil de Conversão**
   - Visualização do funil completo
   - Taxas de conversão entre estágios
   - Identificação de gargalos

3. **Análise de Investimento**
   - Custo de ferramentas e APIs
   - Custo de tempo de equipe
   - Custo de oportunidade
   - ROI por mercado

4. **Projeções Financeiras**
   - Projeção de receita para próximos 3/6/12 meses
   - Análise de payback period
   - Valor do lifetime value (LTV) estimado

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| ROI-01 | Visualizar ROI | Acessar dashboard | Métricas financeiras exibidas |
| ROI-02 | Filtrar por mercado | Selecionar mercado específico | ROI filtrado por mercado |
| ROI-03 | Analisar funil | Visualizar gráfico de funil | Taxas de conversão exibidas |
| ROI-04 | Projetar receita | Selecionar período de projeção | Gráfico de projeção exibido |
| ROI-05 | Exportar análise | Clicar em "Exportar" | Relatório financeiro gerado |

---

### 2.11 Funil

**Rota:** `/funil`  
**Ícone:** BarChart3  
**Descrição:** Visualização do funil de vendas.

#### Funcionalidades Principais

O módulo de funil apresenta **visualização gráfica** do fluxo de leads através dos estágios do processo de vendas, com métricas de conversão e identificação de oportunidades de melhoria.

**Componentes da Tela:**

1. **Métrica Total**
   - Total de leads no funil
   - Variação em relação ao período anterior

2. **Gráfico de Funil**
   - Visualização em formato de funil
   - Estágios: Novo → Qualificado → Negociação → Fechado / Perdido
   - Labels com nomes dos estágios (cor escura #1e293b)
   - Números em branco dentro das barras
   - Cores diferenciadas por estágio

3. **Taxas de Conversão Entre Estágios**
   - Cards com transições (ex: Novo → Qualificado)
   - Percentual de conversão
   - Indicador visual (TrendingUp/TrendingDown)
   - Fundo claro (bg-slate-100) com textos escuros

4. **Detalhamento por Estágio**
   - Grid com cards de cada estágio
   - Quantidade de leads em cada estágio
   - Barra de cor representativa
   - Fundo claro com boa legibilidade

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| FUN-01 | Visualizar funil | Acessar página | Gráfico de funil exibido corretamente |
| FUN-02 | Verificar legibilidade | Visualizar labels | Textos visíveis em cor escura |
| FUN-03 | Analisar conversões | Visualizar cards de taxa | Percentuais e indicadores exibidos |
| FUN-04 | Filtrar por projeto | Selecionar projeto | Funil filtrado por projeto |
| FUN-05 | Responsividade | Acessar em mobile | Layout adaptado, sem scroll horizontal |

---

### 2.12 Agendamento

**Rota:** `/agendamento`  
**Ícone:** Clock  
**Descrição:** Agendamento de enriquecimentos recorrentes.

#### Funcionalidades Principais

O módulo de agendamento permite **programar execuções automáticas** de enriquecimento de dados em intervalos regulares, garantindo que os dados permaneçam atualizados sem intervenção manual.

**Componentes da Tela:**

1. **Lista de Agendamentos**
   - Nome do agendamento
   - Frequência (diária/semanal/mensal)
   - Próxima execução
   - Status (ativo/inativo)
   - Última execução e resultado

2. **Formulário de Criação**
   - **Nome:** Identificação do agendamento
   - **Tipo de Enriquecimento:** Template a utilizar
   - **Frequência:** Diária/Semanal/Mensal/Personalizada
   - **Horário:** Hora de execução
   - **Limite de Registros:** Quantidade máxima por execução
   - **Notificações:** Configurar alertas de conclusão

3. **Histórico de Execuções**
   - Lista de execuções passadas
   - Data/hora de execução
   - Duração
   - Registros processados
   - Status (sucesso/erro)

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| AGE-01 | Criar agendamento | Preencher formulário e salvar | Agendamento criado |
| AGE-02 | Executar agendamento | Aguardar horário programado | Enriquecimento executado automaticamente |
| AGE-03 | Desativar agendamento | Clicar em toggle de status | Agendamento desativado |
| AGE-04 | Visualizar histórico | Acessar histórico | Lista de execuções exibida |
| AGE-05 | Editar agendamento | Modificar frequência e salvar | Agendamento atualizado |

---

### 2.13 Atividade

**Rota:** `/atividade`  
**Ícone:** Activity  
**Descrição:** Timeline de atividades do sistema.

#### Funcionalidades Principais

O módulo de atividade apresenta uma **linha do tempo** com todas as ações realizadas no sistema, permitindo auditoria completa e rastreamento de mudanças.

**Componentes da Tela:**

1. **Timeline de Atividades**
   - Lista cronológica de eventos
   - Agrupamento por data
   - Ícones representativos por tipo de ação
   - Detalhes expandíveis

2. **Filtros de Atividade**
   - **Por Tipo:** Criação/Edição/Exclusão/Validação
   - **Por Entidade:** Mercado/Cliente/Concorrente/Lead
   - **Por Usuário:** Filtrar por quem realizou a ação
   - **Por Período:** Data início e fim

3. **Detalhes da Atividade**
   - Timestamp preciso
   - Usuário responsável
   - Tipo de ação
   - Entidade afetada
   - Valores antes e depois (diff)
   - Link para o registro

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| ATI-01 | Visualizar timeline | Acessar página | Timeline completa exibida |
| ATI-02 | Filtrar por tipo | Selecionar "Criação" | Apenas ações de criação exibidas |
| ATI-03 | Expandir detalhes | Clicar em atividade | Detalhes expandidos com diff |
| ATI-04 | Acessar registro | Clicar em link da atividade | Redirecionado para registro |
| ATI-05 | Buscar atividade | Digitar termo na busca | Atividades filtradas |

---

### 2.14 Cache

**Rota:** `/admin/cache`  
**Ícone:** Database  
**Descrição:** Dashboard de cache e performance.

#### Funcionalidades Principais

O módulo de cache oferece **visibilidade e controle** sobre o sistema de cache da aplicação, permitindo monitorar performance e limpar cache quando necessário.

**Componentes da Tela:**

1. **Métricas de Cache**
   - **Hit Rate:** Percentual de requisições atendidas pelo cache
   - **Entradas Ativas:** Quantidade de chaves no cache
   - **Hits:** Total de acertos
   - **Misses:** Total de falhas
   - **TTL Médio:** Tempo de vida médio das entradas

2. **Recomendações de Performance**
   - Sugestões automáticas baseadas em métricas
   - Identificação de queries lentas
   - Oportunidades de otimização

3. **Controles de Cache**
   - **Limpar Cache:** Botão para invalidar todo o cache
   - **Limpar por Entidade:** Invalidar cache específico
   - **Configurar TTL:** Ajustar tempo de vida padrão

4. **Gráfico de Performance**
   - Evolução do hit rate ao longo do tempo
   - Comparação de performance antes/depois de otimizações

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| CAC-01 | Visualizar métricas | Acessar dashboard | Métricas de cache exibidas |
| CAC-02 | Limpar cache | Clicar em "Limpar Cache" | Cache invalidado, métricas zeradas |
| CAC-03 | Verificar hit rate | Visualizar card de hit rate | Percentual > 70% (ideal) |
| CAC-04 | Analisar recomendações | Visualizar seção de recomendações | Sugestões exibidas |
| CAC-05 | Configurar TTL | Ajustar valor de TTL | Configuração salva |

---

### 2.15 Histórico de Jobs

**Rota:** `/admin/queue-history`  
**Ícone:** Clock  
**Descrição:** Histórico completo da fila de processamento.

#### Funcionalidades Principais

O módulo de histórico de jobs apresenta **registro completo** de todos os jobs de enriquecimento executados, com filtros avançados e visualização de erros.

**Componentes da Tela:**

1. **Tabela de Jobs**
   - ID do job
   - Tipo (enriquecimento de clientes/concorrentes/leads)
   - Status (pending/running/completed/error)
   - Data de início
   - Data de conclusão
   - Duração
   - Registros processados
   - Tentativas (retry count)

2. **Filtros Avançados**
   - **Por Status:** Filtrar por status específico
   - **Por Tipo:** Filtrar por tipo de job
   - **Por Projeto:** Filtrar por projeto
   - **Por Data:** Seletor de intervalo de datas (DateRangePicker)
   - **Presets:** Última semana, último mês, customizado

3. **Detalhes do Job**
   - Informações completas do job
   - Log de execução
   - Mensagem de erro (se houver)
   - Estatísticas de processamento

4. **Paginação**
   - Navegação entre páginas
   - Seletor de itens por página (10/25/50/100)

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| HIS-01 | Visualizar histórico | Acessar página | Tabela de jobs exibida |
| HIS-02 | Filtrar por status | Selecionar "Error" | Apenas jobs com erro exibidos |
| HIS-03 | Filtrar por data | Selecionar "Última semana" | Jobs da última semana exibidos |
| HIS-04 | Visualizar detalhes | Clicar em job | Modal com detalhes completos |
| HIS-05 | Paginar resultados | Clicar em "Próxima página" | Página 2 carregada |

---

### 2.16 Métricas da Fila

**Rota:** `/admin/queue-metrics`  
**Ícone:** TrendingUp  
**Descrição:** Dashboard de performance e estatísticas da fila.

#### Funcionalidades Principais

O módulo de métricas da fila oferece **análise de performance** do sistema de processamento, com gráficos de throughput, taxa de erro e comparação entre modos de execução.

**Componentes da Tela:**

1. **Cards de Métricas**
   - **Throughput:** Jobs processados por hora
   - **Taxa de Erro:** Percentual de jobs com erro
   - **Tempo Médio:** Duração média de processamento
   - **Jobs Pendentes:** Quantidade na fila

2. **Gráfico de Throughput**
   - Gráfico de linha com evolução temporal
   - Comparação de throughput ao longo do tempo
   - Identificação de picos e vales

3. **Gráfico de Taxa de Erro**
   - Gráfico de área com evolução da taxa de erro
   - Threshold de alerta (ex: > 5%)
   - Correlação com eventos do sistema

4. **Comparativo Parallel vs Sequential**
   - Gráfico de barras comparando modos
   - Métricas: tempo médio, throughput, taxa de erro
   - Recomendação de modo ideal

5. **Recomendações de Performance**
   - Sugestões automáticas de otimização
   - Identificação de gargalos
   - Ajustes de configuração recomendados

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| MET-01 | Visualizar métricas | Acessar dashboard | Métricas de fila exibidas |
| MET-02 | Analisar throughput | Visualizar gráfico | Evolução temporal exibida |
| MET-03 | Comparar modos | Visualizar gráfico comparativo | Diferenças entre modos claras |
| MET-04 | Verificar recomendações | Visualizar seção de recomendações | Sugestões exibidas |
| MET-05 | Exportar métricas | Clicar em "Exportar" | CSV com métricas gerado |

---

### 2.17 Dashboard Avançado

**Rota:** `/dashboard-avancado`  
**Ícone:** BarChart3  
**Descrição:** Dashboard personalizável com widgets.

#### Funcionalidades Principais

O dashboard avançado oferece **personalização completa** da visualização de dados, permitindo que o usuário configure widgets, layout e métricas de acordo com suas necessidades.

**Componentes da Tela:**

1. **Grid de Widgets**
   - Layout responsivo com drag-and-drop
   - Redimensionamento de widgets
   - Adição/remoção de widgets

2. **Widgets Disponíveis**
   - **Métricas Rápidas:** Cards de números
   - **Gráficos:** Linha/Barra/Pizza/Rosca/Área
   - **Tabelas:** Listas de dados
   - **Mapas:** Visualização geográfica
   - **Calendário:** Eventos e agendamentos
   - **Timeline:** Atividades recentes

3. **Personalização**
   - Escolha de cores e temas
   - Configuração de métricas por widget
   - Filtros globais do dashboard
   - Salvamento de layouts personalizados

4. **Compartilhamento**
   - Gerar link compartilhável do dashboard
   - Exportar dashboard como imagem
   - Agendar envio por email

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| ADV-01 | Adicionar widget | Clicar em "Adicionar Widget" | Modal de seleção exibido |
| ADV-02 | Reorganizar layout | Arrastar widget para nova posição | Layout reorganizado |
| ADV-03 | Redimensionar widget | Arrastar canto do widget | Widget redimensionado |
| ADV-04 | Salvar layout | Clicar em "Salvar Layout" | Layout salvo e persistido |
| ADV-05 | Compartilhar dashboard | Gerar link compartilhável | Link copiado para clipboard |

---

## 3. Funcionalidades Transversais

### 3.1 Sistema de Projetos

**Descrição:** Gerenciamento de múltiplos projetos de pesquisa de mercado.

#### Funcionalidades

O sistema permite criar e gerenciar múltiplos projetos simultaneamente, cada um com dados isolados e configurações independentes.

**Operações Disponíveis:**

1. **Criar Projeto**
   - Nome do projeto
   - Descrição
   - Cor de identificação
   - Configurações iniciais

2. **Selecionar Projeto**
   - Dropdown global no header
   - Opção "Todos os Projetos" para visão agregada
   - Persistência da seleção

3. **Editar Projeto**
   - Modificar nome, descrição e cor
   - Ajustar configurações
   - Gerenciar permissões

4. **Arquivar Projeto**
   - Desativar projeto sem excluir dados
   - Manter histórico acessível

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| PRO-01 | Criar projeto | Preencher formulário e salvar | Projeto criado e selecionado |
| PRO-02 | Alternar projeto | Selecionar outro projeto no dropdown | Dados filtrados pelo projeto |
| PRO-03 | Editar projeto | Modificar nome e salvar | Projeto atualizado |
| PRO-04 | Arquivar projeto | Clicar em "Arquivar" | Projeto arquivado, não aparece na lista |
| PRO-05 | Visualizar todos | Selecionar "Todos os Projetos" | Dados agregados de todos os projetos |

---

### 3.2 Sistema de Tags

**Descrição:** Categorização flexível de entidades com tags personalizadas.

#### Funcionalidades

O sistema de tags permite criar categorias personalizadas e aplicá-las a mercados, clientes, concorrentes e leads para facilitar organização e filtragem.

**Operações Disponíveis:**

1. **Criar Tag**
   - Nome da tag
   - Cor de identificação
   - Descrição (opcional)

2. **Aplicar Tag**
   - Seleção múltipla de tags
   - Aplicação em massa
   - Remoção de tags

3. **Filtrar por Tag**
   - Seleção múltipla de tags
   - Operador AND/OR
   - Combinação com outros filtros

4. **Gerenciar Tags**
   - Editar nome e cor
   - Excluir tag (com confirmação)
   - Visualizar uso da tag

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| TAG-01 | Criar tag | Preencher formulário e salvar | Tag criada |
| TAG-02 | Aplicar tag | Selecionar entidade e adicionar tag | Tag aplicada |
| TAG-03 | Filtrar por tag | Selecionar tag no filtro | Apenas entidades com a tag exibidas |
| TAG-04 | Editar tag | Modificar nome e salvar | Tag atualizada em todas as entidades |
| TAG-05 | Excluir tag | Confirmar exclusão | Tag removida de todas as entidades |

---

### 3.3 Sistema de Filtros Salvos

**Descrição:** Persistência de combinações de filtros para análises recorrentes.

#### Funcionalidades

O sistema permite salvar combinações complexas de filtros e compartilhá-las com outros usuários ou acessá-las rapidamente.

**Operações Disponíveis:**

1. **Salvar Filtro**
   - Nome do filtro
   - Combinação de filtros aplicados
   - Tornar público ou privado

2. **Carregar Filtro**
   - Seleção de filtro salvo
   - Aplicação automática de todos os filtros

3. **Compartilhar Filtro**
   - Gerar link compartilhável
   - Definir permissões (visualização/edição)
   - Expiração do link (opcional)

4. **Gerenciar Filtros**
   - Editar filtro salvo
   - Excluir filtro
   - Visualizar filtros públicos

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| FIL-01 | Salvar filtro | Aplicar filtros e clicar em "Salvar" | Filtro salvo |
| FIL-02 | Carregar filtro | Selecionar filtro salvo | Filtros aplicados automaticamente |
| FIL-03 | Compartilhar filtro | Gerar link e copiar | Link copiado, acessível por outros |
| FIL-04 | Acessar filtro compartilhado | Abrir link `/filtros/:token` | Filtros aplicados na visualização |
| FIL-05 | Excluir filtro | Confirmar exclusão | Filtro removido |

---

### 3.4 Sistema de Exportação

**Descrição:** Exportação de dados em múltiplos formatos.

#### Funcionalidades

O sistema oferece exportação flexível de dados filtrados em diversos formatos para análise externa ou compartilhamento.

**Formatos Disponíveis:**

1. **CSV**
   - Formato padrão para planilhas
   - Encoding UTF-8
   - Separador configurável

2. **Excel (XLSX)**
   - Múltiplas abas
   - Formatação preservada
   - Fórmulas básicas

3. **PDF**
   - Relatórios formatados
   - Gráficos incluídos
   - Layout profissional

4. **JSON**
   - Formato para integração com APIs
   - Estrutura completa de dados
   - Metadados incluídos

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| EXP-01 | Exportar CSV | Clicar em "Exportar" e selecionar CSV | Download de arquivo CSV |
| EXP-02 | Exportar Excel | Selecionar Excel e confirmar | Download de arquivo XLSX |
| EXP-03 | Exportar PDF | Selecionar PDF e aguardar geração | Download de arquivo PDF |
| EXP-04 | Exportar filtrados | Aplicar filtros e exportar | Apenas dados filtrados no arquivo |
| EXP-05 | Exportar JSON | Selecionar JSON | Download de arquivo JSON estruturado |

---

### 3.5 Sistema de Busca Global

**Descrição:** Busca unificada em todas as entidades do sistema.

#### Funcionalidades

A busca global permite encontrar rapidamente qualquer registro (mercado, cliente, concorrente, lead) através de uma única interface.

**Características:**

1. **Busca em Tempo Real**
   - Resultados instantâneos conforme digitação
   - Debounce de 300ms para performance

2. **Busca Multi-Entidade**
   - Resultados agrupados por tipo
   - Indicadores visuais de tipo de entidade

3. **Busca Inteligente**
   - Busca por nome, descrição, tags
   - Busca fuzzy (tolerância a erros de digitação)
   - Sugestões de termos relacionados

4. **Atalhos de Teclado**
   - `Ctrl+K` ou `Cmd+K` para abrir busca
   - Navegação com setas
   - `Enter` para acessar resultado

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| BUS-01 | Buscar mercado | Digitar nome de mercado | Resultados exibidos em tempo real |
| BUS-02 | Buscar com erro | Digitar "Nutricao" (sem ç) | Resultados de "Nutrição" exibidos |
| BUS-03 | Usar atalho | Pressionar Ctrl+K | Modal de busca aberto |
| BUS-04 | Navegar resultados | Usar setas para navegar | Resultado destacado muda |
| BUS-05 | Acessar resultado | Pressionar Enter | Redirecionado para página do resultado |

---

### 3.6 Sistema de Notificações

**Descrição:** Notificações in-app e por email de eventos importantes.

#### Funcionalidades

O sistema de notificações mantém o usuário informado sobre eventos relevantes através de múltiplos canais.

**Tipos de Notificações:**

1. **Notificações In-App**
   - Toast notifications para eventos imediatos
   - Badge no ícone de sino com contador
   - Centro de notificações com histórico

2. **Notificações por Email**
   - Resumo diário de atividades
   - Alertas críticos imediatos
   - Relatórios agendados

3. **Eventos Notificados**
   - Conclusão de enriquecimento
   - Erros críticos
   - Novos mercados identificados
   - Alertas personalizados disparados
   - Progresso de enriquecimento (25%, 50%, 75%, 100%)

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| NOT-01 | Receber notificação | Concluir enriquecimento | Toast notification exibido |
| NOT-02 | Visualizar histórico | Clicar no ícone de sino | Centro de notificações aberto |
| NOT-03 | Marcar como lida | Clicar em notificação | Notificação marcada como lida |
| NOT-04 | Configurar preferências | Desativar notificações de email | Emails não enviados |
| NOT-05 | Receber email | Aguardar evento configurado | Email recebido |

---

### 3.7 Sistema de Fila de Processamento

**Descrição:** Gerenciamento de jobs de enriquecimento com suporte a parallel e sequential.

#### Funcionalidades

O sistema de fila gerencia a execução de jobs de enriquecimento com controle de concorrência, retry automático e monitoramento em tempo real.

**Modos de Execução:**

1. **Modo Parallel (Simultâneo)**
   - Processa até N jobs ao mesmo tempo (configurável)
   - Ideal para grandes volumes
   - Maior throughput

2. **Modo Sequential (Fila)**
   - Processa um job por vez
   - Maior controle e previsibilidade
   - Menor carga no sistema

**Funcionalidades Avançadas:**

1. **Retry Automático**
   - Até 3 tentativas por job
   - Backoff exponencial (1s, 2s, 4s)
   - Registro de erros

2. **Priorização**
   - Jobs com prioridade alta processados primeiro
   - Configuração manual de prioridade

3. **Pausar/Retomar**
   - Pausar fila temporariamente
   - Retomar processamento sem perder jobs

4. **Estimativa de Tempo (ETA)**
   - Cálculo baseado em taxa média de processamento
   - Atualização em tempo real
   - Consideração do modo de execução

#### Casos de Teste

| ID | Cenário | Ação | Resultado Esperado |
|----|---------|------|-------------------|
| FIL-01 | Alternar modo | Mudar de Parallel para Sequential | Modo alterado, fila reorganizada |
| FIL-02 | Configurar paralelos | Definir máximo de 5 jobs paralelos | Configuração salva e aplicada |
| FIL-03 | Retry automático | Simular erro em job | Job reprocessado automaticamente |
| FIL-04 | Pausar fila | Clicar em "Pausar" | Fila pausada, jobs em execução concluídos |
| FIL-05 | Verificar ETA | Visualizar previsão de término | ETA calculado e exibido |

---

## 4. Checklist de Validação Completa

### 4.1 Validação de Funcionalidades Core

| Módulo | Funcionalidade | Status | Observações |
|--------|---------------|--------|-------------|
| **Início** | Seleção de projeto | ☐ | Testar com 1, 5 e 10+ projetos |
| **Início** | Estatísticas globais | ☐ | Verificar atualização em tempo real |
| **Início** | Filtros por tag | ☐ | Testar filtros múltiplos |
| **Início** | Abas de visualização | ☐ | Testar transição entre abas |
| **Início** | Exportação de dados | ☐ | Testar CSV e Excel |
| **Mercados** | Lista de mercados | ☐ | Testar ordenação e busca |
| **Mercados** | Detalhes do mercado | ☐ | Verificar dados completos |
| **Mercados** | Validação de mercado | ☐ | Testar validar/descartar |
| **Dashboard** | Métricas principais | ☐ | Verificar cálculos corretos |
| **Dashboard** | Gráficos interativos | ☐ | Testar hover e drill-down |
| **Analytics** | Análise de mercado | ☐ | Verificar mapa de calor |
| **Analytics** | Análise de clientes | ☐ | Testar segmentação |
| **Enriquecimento** | Seleção de template | ☐ | Testar todos os templates |
| **Enriquecimento** | Modo de execução | ☐ | Testar parallel e sequential |
| **Enriquecimento** | Iniciar enriquecimento | ☐ | Verificar execução completa |
| **Monitoramento** | Progresso em tempo real | ☐ | Verificar atualização a cada 5s |
| **Monitoramento** | Notificações de progresso | ☐ | Testar toasts em 25%, 50%, 75%, 100% |
| **Evolução** | Gráfico de evolução | ☐ | Verificar dados dos últimos 30 dias |
| **Evolução** | Cálculo de ETA | ☐ | Comparar ETA com tempo real |
| **Evolução** | Estimativas de totais | ☐ | Verificar projeções |
| **Alertas** | Criação de alerta | ☐ | Testar todos os tipos |
| **Alertas** | Disparo de alerta | ☐ | Verificar condições |
| **Relatórios** | Geração de PDF | ☐ | Testar todos os tipos |
| **Relatórios** | Agendamento de envio | ☐ | Verificar envio automático |
| **ROI** | Cálculo de ROI | ☐ | Verificar fórmulas |
| **ROI** | Projeções financeiras | ☐ | Testar diferentes períodos |
| **Funil** | Visualização do funil | ☐ | Verificar legibilidade |
| **Funil** | Taxas de conversão | ☐ | Verificar cálculos |
| **Agendamento** | Criar agendamento | ☐ | Testar execução automática |
| **Atividade** | Timeline de atividades | ☐ | Verificar registro de ações |
| **Cache** | Métricas de cache | ☐ | Verificar hit rate |
| **Cache** | Limpar cache | ☐ | Testar invalidação |
| **Histórico** | Lista de jobs | ☐ | Verificar paginação |
| **Histórico** | Filtros de data | ☐ | Testar DateRangePicker |
| **Métricas** | Throughput | ☐ | Verificar gráficos |
| **Métricas** | Comparativo de modos | ☐ | Testar parallel vs sequential |

### 4.2 Validação de Funcionalidades Transversais

| Funcionalidade | Teste | Status | Observações |
|----------------|-------|--------|-------------|
| **Projetos** | Criar projeto | ☐ | Verificar isolamento de dados |
| **Projetos** | Alternar projeto | ☐ | Verificar atualização de dados |
| **Projetos** | Opção "Todos" | ☐ | Verificar agregação |
| **Tags** | Criar tag | ☐ | Testar cores personalizadas |
| **Tags** | Aplicar tag | ☐ | Testar aplicação em massa |
| **Tags** | Filtrar por tag | ☐ | Testar operadores AND/OR |
| **Filtros** | Salvar filtro | ☐ | Verificar persistência |
| **Filtros** | Compartilhar filtro | ☐ | Testar link compartilhável |
| **Exportação** | Exportar CSV | ☐ | Verificar encoding UTF-8 |
| **Exportação** | Exportar Excel | ☐ | Verificar formatação |
| **Exportação** | Exportar PDF | ☐ | Verificar layout |
| **Busca** | Busca global | ☐ | Testar em tempo real |
| **Busca** | Atalho Ctrl+K | ☐ | Verificar funcionamento |
| **Notificações** | Toast notifications | ☐ | Verificar visibilidade |
| **Notificações** | Centro de notificações | ☐ | Verificar histórico |
| **Fila** | Modo parallel | ☐ | Testar com 3, 5, 10 paralelos |
| **Fila** | Modo sequential | ☐ | Verificar ordem de execução |
| **Fila** | Retry automático | ☐ | Simular erros |
| **Fila** | Pausar/Retomar | ☐ | Verificar estado da fila |

### 4.3 Validação de Performance

| Métrica | Alvo | Teste | Status | Observações |
|---------|------|-------|--------|-------------|
| **Tempo de carregamento** | < 2s | Carregar página inicial | ☐ | Medir com DevTools |
| **Tempo de resposta API** | < 500ms | Executar query simples | ☐ | Medir com Network tab |
| **Hit rate de cache** | > 70% | Verificar dashboard de cache | ☐ | Após uso normal |
| **Throughput de fila** | > 100 reg/min | Executar enriquecimento | ☐ | Modo parallel |
| **Taxa de erro** | < 5% | Verificar métricas da fila | ☐ | Após múltiplas execuções |
| **Tempo de geração PDF** | < 10s | Gerar relatório executivo | ☐ | Com dados reais |
| **Responsividade mobile** | 100% | Testar em mobile | ☐ | Sem scroll horizontal |

### 4.4 Validação de Usabilidade

| Critério | Teste | Status | Observações |
|----------|-------|--------|-------------|
| **Navegação intuitiva** | Usuário encontra funcionalidade sem ajuda | ☐ | Teste com usuário real |
| **Feedback visual** | Ações têm feedback imediato | ☐ | Verificar loading states |
| **Mensagens de erro** | Erros são claros e acionáveis | ☐ | Simular erros comuns |
| **Consistência visual** | Design consistente em todas as páginas | ☐ | Verificar cores e fontes |
| **Acessibilidade** | Navegação por teclado funciona | ☐ | Testar Tab, Enter, Esc |
| **Responsividade** | Layout adaptado em mobile | ☐ | Testar em 320px, 768px, 1024px |
| **Tooltips** | Informações contextuais disponíveis | ☐ | Verificar hover em ícones |

### 4.5 Validação de Segurança

| Aspecto | Teste | Status | Observações |
|---------|-------|--------|-------------|
| **Autenticação** | Login com Manus OAuth | ☐ | Verificar redirecionamento |
| **Autorização** | Acesso a recursos protegidos | ☐ | Testar sem autenticação |
| **Isolamento de dados** | Projetos isolados | ☐ | Verificar queries |
| **Validação de entrada** | Inputs validados no backend | ☐ | Testar com dados inválidos |
| **SQL Injection** | Queries parametrizadas | ☐ | Verificar código |
| **XSS** | Sanitização de HTML | ☐ | Testar com scripts |
| **CSRF** | Tokens CSRF implementados | ☐ | Verificar formulários |

---

## 5. Fluxos de Teste End-to-End

### 5.1 Fluxo: Criar Projeto e Enriquecer Dados

**Objetivo:** Validar o fluxo completo desde criação de projeto até visualização de dados enriquecidos.

**Passos:**

1. **Criar Novo Projeto**
   - Acessar página inicial
   - Clicar em "Novo Projeto"
   - Preencher nome: "Teste E2E"
   - Salvar projeto
   - **Verificar:** Projeto criado e selecionado automaticamente

2. **Adicionar Mercado Manualmente**
   - Na tela de início, clicar em "Adicionar Mercado"
   - Preencher nome: "Nutrição Esportiva"
   - Selecionar segmentação: "B2C"
   - Salvar mercado
   - **Verificar:** Mercado aparece na lista

3. **Configurar Enriquecimento**
   - Acessar `/enrichment`
   - Selecionar template "Clientes B2C"
   - Configurar modo "Parallel" com 3 jobs
   - Definir limite de 50 registros
   - **Verificar:** Configurações salvas

4. **Executar Enriquecimento**
   - Clicar em "Iniciar Enriquecimento"
   - **Verificar:** Redirecionado para `/enrichment-progress`
   - **Verificar:** Barra de progresso iniciada

5. **Monitorar Progresso**
   - Aguardar notificação de 25%
   - Aguardar notificação de 50%
   - Aguardar notificação de 75%
   - Aguardar notificação de 100%
   - **Verificar:** Todas as notificações recebidas

6. **Visualizar Dados Enriquecidos**
   - Acessar página inicial
   - Verificar estatísticas atualizadas
   - Clicar no mercado "Nutrição Esportiva"
   - **Verificar:** Clientes enriquecidos listados

7. **Gerar Relatório**
   - Acessar `/relatorios`
   - Selecionar "Relatório Executivo"
   - Clicar em "Gerar Relatório"
   - **Verificar:** PDF gerado e disponível para download

**Resultado Esperado:** Fluxo completo executado sem erros, dados enriquecidos visíveis e relatório gerado.

---

### 5.2 Fluxo: Análise de Mercado com Filtros e Exportação

**Objetivo:** Validar análise de dados com filtros avançados e exportação.

**Passos:**

1. **Selecionar Projeto**
   - Acessar página inicial
   - Selecionar projeto "Teste E2E" no dropdown
   - **Verificar:** Dados filtrados pelo projeto

2. **Criar Tag Personalizada**
   - Clicar em "Gerenciar Tags"
   - Criar tag "Alta Prioridade" (cor vermelha)
   - Salvar tag
   - **Verificar:** Tag criada

3. **Aplicar Tag a Mercado**
   - Selecionar mercado "Nutrição Esportiva"
   - Adicionar tag "Alta Prioridade"
   - **Verificar:** Tag aplicada

4. **Filtrar por Tag**
   - Clicar em "Filtrar por Tags"
   - Selecionar "Alta Prioridade"
   - **Verificar:** Apenas mercados com a tag exibidos

5. **Salvar Filtro**
   - Clicar em "Salvar Filtros"
   - Nome: "Mercados Prioritários"
   - Tornar público
   - **Verificar:** Filtro salvo

6. **Exportar Dados Filtrados**
   - Clicar em "Exportar Filtrados"
   - Selecionar formato "Excel"
   - **Verificar:** Download iniciado

7. **Compartilhar Filtro**
   - Acessar filtros salvos
   - Clicar em "Compartilhar" no filtro "Mercados Prioritários"
   - Copiar link
   - Abrir link em nova aba anônima
   - **Verificar:** Filtros aplicados automaticamente

**Resultado Esperado:** Filtros funcionam corretamente, exportação bem-sucedida e compartilhamento funcional.

---

### 5.3 Fluxo: Monitoramento de Performance e Otimização

**Objetivo:** Validar ferramentas de monitoramento e otimização de performance.

**Passos:**

1. **Verificar Métricas de Cache**
   - Acessar `/admin/cache`
   - Verificar hit rate
   - **Verificar:** Hit rate > 70%

2. **Analisar Histórico de Jobs**
   - Acessar `/admin/queue-history`
   - Filtrar por "Última semana"
   - **Verificar:** Lista de jobs exibida

3. **Identificar Jobs com Erro**
   - Filtrar por status "Error"
   - Clicar em job com erro
   - Visualizar detalhes do erro
   - **Verificar:** Mensagem de erro clara

4. **Analisar Métricas da Fila**
   - Acessar `/admin/queue-metrics`
   - Verificar throughput
   - Verificar taxa de erro
   - **Verificar:** Métricas dentro do esperado

5. **Comparar Modos de Execução**
   - Visualizar gráfico comparativo
   - Identificar modo mais eficiente
   - **Verificar:** Recomendação exibida

6. **Otimizar Configuração**
   - Acessar `/enrichment`
   - Ajustar modo de execução conforme recomendação
   - Ajustar número de jobs paralelos
   - **Verificar:** Configuração salva

7. **Limpar Cache**
   - Acessar `/admin/cache`
   - Clicar em "Limpar Cache"
   - Confirmar ação
   - **Verificar:** Cache invalidado, métricas zeradas

**Resultado Esperado:** Ferramentas de monitoramento fornecem insights acionáveis e otimizações aplicadas com sucesso.

---

## 6. Cenários de Erro e Recuperação

### 6.1 Erro: Falha de Conexão com Banco de Dados

**Cenário:** Banco de dados indisponível durante operação.

**Comportamento Esperado:**
- Mensagem de erro clara: "Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes."
- Botão "Tentar Novamente"
- Log de erro no console do servidor
- Não perda de dados em memória

**Teste:**
1. Desconectar banco de dados
2. Tentar carregar página inicial
3. Verificar mensagem de erro
4. Reconectar banco de dados
5. Clicar em "Tentar Novamente"
6. Verificar carregamento bem-sucedido

---

### 6.2 Erro: Timeout em API Externa

**Cenário:** API de enriquecimento não responde dentro do timeout.

**Comportamento Esperado:**
- Job marcado como "error"
- Retry automático após backoff exponencial
- Mensagem de erro registrada no log
- Notificação ao usuário após 3 tentativas falhadas

**Teste:**
1. Simular timeout em API externa
2. Iniciar enriquecimento
3. Verificar primeira tentativa falha
4. Aguardar retry automático (1s)
5. Verificar segunda tentativa falha
6. Aguardar retry automático (2s)
7. Verificar terceira tentativa falha
8. Verificar job marcado como "error"
9. Verificar notificação ao usuário

---

### 6.3 Erro: Sessão Expirada

**Cenário:** Sessão do usuário expira durante uso da aplicação.

**Comportamento Esperado:**
- Redirecionamento automático para login
- Preservação do estado da aplicação (URL atual)
- Após login, retorno à página anterior
- Mensagem: "Sua sessão expirou. Por favor, faça login novamente."

**Teste:**
1. Fazer login na aplicação
2. Aguardar expiração de sessão (ou forçar logout no backend)
3. Tentar executar ação que requer autenticação
4. Verificar redirecionamento para login
5. Fazer login novamente
6. Verificar retorno à página anterior

---

## 7. Métricas de Sucesso

### 7.1 Métricas de Performance

| Métrica | Alvo | Crítico | Observações |
|---------|------|---------|-------------|
| **Tempo de carregamento inicial** | < 2s | < 5s | First Contentful Paint |
| **Tempo de resposta API** | < 500ms | < 2s | 95th percentile |
| **Hit rate de cache** | > 70% | > 50% | Após uso estável |
| **Throughput de enriquecimento** | > 100 reg/min | > 50 reg/min | Modo parallel |
| **Taxa de erro de jobs** | < 5% | < 10% | Incluindo retries |
| **Tempo de geração de PDF** | < 10s | < 30s | Relatório executivo |

### 7.2 Métricas de Usabilidade

| Métrica | Alvo | Método de Medição |
|---------|------|-------------------|
| **Taxa de conclusão de tarefas** | > 90% | Teste com usuários |
| **Tempo para completar tarefa** | < 5 min | Tarefa: criar projeto e enriquecer |
| **Número de cliques para ação** | < 3 cliques | Ações principais |
| **Taxa de erro do usuário** | < 10% | Ações incorretas / total de ações |
| **Satisfação do usuário** | > 4/5 | Questionário pós-uso |

### 7.3 Métricas de Qualidade

| Métrica | Alvo | Observações |
|---------|------|-------------|
| **Cobertura de testes** | > 80% | Backend e frontend |
| **Bugs críticos** | 0 | Em produção |
| **Bugs médios** | < 5 | Em produção |
| **Tempo de resolução de bugs** | < 48h | Para bugs críticos |
| **Disponibilidade** | > 99% | Uptime mensal |

---

## 8. Conclusão

Este guia completo de funcionalidades documenta todas as telas, dashboards, relatórios e funcionalidades da aplicação **Inteligência de Mercado**. O sistema oferece uma solução robusta e completa para gerenciamento de pesquisas de mercado, enriquecimento de dados e análise estratégica.

### 8.1 Resumo de Módulos

A aplicação conta com **17 módulos principais** organizados em:

- **6 módulos de visualização de dados** (Início, Mercados, Dashboard, Analytics, ROI, Funil)
- **5 módulos de processamento** (Enriquecimento, Monitoramento, Evolução, Agendamento, Atividade)
- **3 módulos de administração** (Cache, Histórico de Jobs, Métricas da Fila)
- **3 módulos de comunicação** (Alertas, Relatórios, Notificações)

### 8.2 Próximos Passos

Para validação completa da aplicação, recomenda-se:

1. **Executar todos os casos de teste** documentados neste guia
2. **Preencher o checklist de validação** seção por seção
3. **Executar os fluxos end-to-end** para validar integrações
4. **Testar cenários de erro** para garantir resiliência
5. **Medir métricas de sucesso** e comparar com alvos definidos
6. **Realizar testes com usuários reais** para validar usabilidade
7. **Documentar bugs encontrados** e priorizar correções

### 8.3 Suporte e Documentação

Para dúvidas ou suporte técnico:
- **Documentação técnica:** Consultar README.md do projeto
- **Código-fonte:** Disponível em `/home/ubuntu/gestor-pav`
- **Logs do sistema:** Acessíveis via console do servidor
- **Monitoramento:** Dashboards de cache e métricas da fila

---

**Documento gerado por:** Manus AI  
**Data:** 19 de Novembro de 2025  
**Versão:** 1.0
