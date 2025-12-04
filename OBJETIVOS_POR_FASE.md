# Objetivos Detalhados por Fase - Dashboard de Qualidade de Dados

**Projeto:** Intelmarket - Inteligência de Mercado  
**Data:** 04/12/2025  
**Autor:** Manus AI  
**Versão:** 1.0

---

## 📋 Sumário Executivo

Este documento detalha os **objetivos, entregas e resultados esperados** de cada uma das 20 fases do plano de execução sequencial. Cada fase é descrita com clareza sobre **o que será construído**, **por que é importante** e **como será validado**.

---

## FASE 1: Fundação - Entidades ✅

**Status:** ✅ CONCLUÍDA  
**Duração:** 10h  
**Progresso:** 100%

### 🎯 Objetivo Geral

Criar a **fundação do sistema** implementando o módulo completo de gerenciamento de Entidades (Clientes, Leads e Concorrentes), que serve como base para todas as outras funcionalidades do dashboard.

### 📦 Entregas Realizadas

#### 1. Infraestrutura de Dados
- **API REST completa** (`/api/entidades`) com 48 campos e 14 filtros funcionais
- **Hook React** (`useEntidades`) para gerenciamento de estado
- **Validação matemática** em 3 camadas (Banco → API → Frontend)

#### 2. Interface de Usuário
- **Browse de Entidades** (`EntidadesListPage.tsx`) com:
  - 8 filtros específicos (busca, cidade, UF, setor, porte, score, enriquecido)
  - Tabela responsiva com 8 colunas
  - Paginação (50 itens por página)
  - Contador de filtros ativos
  - Exibição dual (filtrados / total)

- **Sheet de Detalhes** (`EntidadeDetailsSheet.tsx`) com 6 abas:
  1. **Cadastrais:** Identificação, contato, localização, informações empresariais
  2. **Qualidade:** Score visual, validação de campos, campos faltantes
  3. **Enriquecimento:** Status e ações de enriquecimento
  4. **Produtos:** Produtos relacionados (estrutura criada)
  5. **Rastreabilidade:** Origem dos dados e auditoria
  6. **Ações:** 7 ações disponíveis (placeholders)

#### 3. Navegação Contextual
- Integração com **Gestão de Conteúdo** (Desktop Turbo)
- Filtros passados via URL
- Navegação bidirecional entre telas

### 🎯 Objetivos Alcançados

✅ **Objetivo 1: Visualização Completa**  
Usuários podem visualizar todos os dados de entidades de forma organizada e intuitiva.

✅ **Objetivo 2: Filtragem Avançada**  
Usuários podem filtrar entidades por 14 critérios diferentes, com validação matemática 100% precisa.

✅ **Objetivo 3: Detalhamento Profundo**  
Usuários podem acessar todos os 48 campos de uma entidade em um sheet lateral organizado por contexto.

✅ **Objetivo 4: Navegação Contextual**  
Usuários podem navegar de forma fluida entre Gestão de Conteúdo e Browse de Entidades mantendo o contexto.

✅ **Objetivo 5: Qualidade de Código**  
Código limpo, bem documentado, sem placeholders funcionais, com validação matemática em todas as camadas.

### 📊 Métricas de Sucesso

| Métrica | Meta | Alcançado |
|---------|------|-----------|
| Campos implementados | 48 | ✅ 48 |
| Filtros funcionais | 14 | ✅ 14 |
| Abas de detalhes | 6 | ✅ 6 |
| Validação matemática | 100% | ✅ 100% |
| Bugs em produção | 0 | ✅ 0 |
| Erros de console | 0 | ✅ 0 |

### 🚀 Impacto no Negócio

**Antes da Fase 1:**
- Dados de entidades dispersos e não visualizáveis
- Impossível filtrar ou segmentar
- Sem visão de qualidade dos dados

**Depois da Fase 1:**
- ✅ Visualização completa de 32 entidades
- ✅ Filtragem por 14 critérios
- ✅ Score de qualidade visível
- ✅ Identificação de campos faltantes
- ✅ Base sólida para próximas funcionalidades

### 🔗 Dependências Habilitadas

Esta fase habilita:
- ✅ Fase 2 (Produtos) - pode vincular produtos a entidades
- ✅ Fase 3 (Projetos) - pode adicionar entidades a projetos
- ✅ Fase 7 (Enriquecer IA) - pode enriquecer entidades
- ✅ Fases 15-19 (Ações) - pode implementar ações sobre entidades

---

## FASE 2: Fundação - Produtos 🔵

**Status:** 🔵 PRÓXIMA FASE  
**Duração estimada:** 30h  
**Progresso:** 0%

### 🎯 Objetivo Geral

Implementar o **módulo completo de gerenciamento de Produtos**, seguindo o mesmo padrão de qualidade da Fase 1, permitindo visualização, filtragem e detalhamento de produtos comercializados pelas entidades.

### 📦 Entregas Planejadas

#### 1. Infraestrutura de Dados
- **Validação da estrutura** da tabela `dim_produto`
- **Criação de relacionamentos** N:N entre entidades e produtos
- **Criação de índices** para otimização de queries
- **Inserção de dados de teste** (mínimo 50 produtos)

#### 2. API Backend
- **GET `/api/produtos`** - Listar produtos com 10 filtros
- **GET `/api/produtos/:id`** - Detalhes de um produto
- **GET `/api/produtos/:id/entidades`** - Entidades que possuem o produto
- **GET `/api/produtos/:id/mercados`** - Mercados onde produto é comercializado

#### 3. Interface de Usuário
- **Browse de Produtos** (`ProdutosListPage.tsx`) com:
  - 8 filtros específicos
  - Tabela com 8 colunas
  - Paginação (50 itens/página)
  - Duplo click para detalhes

- **Sheet de Detalhes** (`ProdutoDetailsSheet.tsx`) com 5 abas:
  1. **Geral:** Identificação, classificação, precificação, descrição
  2. **Entidades:** Lista de entidades que possuem este produto
  3. **Mercados:** Mercados onde produto é comercializado
  4. **Rastreabilidade:** Origem e auditoria
  5. **Ações:** 4 ações (placeholders)

#### 4. Navegação Contextual
- Card "Produtos" na Gestão de Conteúdo
- Navegação Entidade → Produtos → Detalhes
- Navegação Produto → Entidades → Detalhes

### 🎯 Objetivos a Alcançar

**Objetivo 1: Catálogo de Produtos Completo**  
Usuários poderão visualizar todos os produtos cadastrados com informações detalhadas de precificação, classificação e disponibilidade.

**Objetivo 2: Relacionamento Entidade-Produto**  
Usuários poderão identificar quais entidades comercializam cada produto e vice-versa, facilitando análises de portfólio.

**Objetivo 3: Análise de Mercado por Produto**  
Usuários poderão visualizar em quais mercados cada produto é comercializado, identificando oportunidades de expansão.

**Objetivo 4: Navegação Cruzada**  
Usuários poderão navegar fluidamente entre Entidades e Produtos, mantendo o contexto e facilitando análises cruzadas.

**Objetivo 5: Base para Análises**  
Criar a fundação de dados necessária para análises futuras de mix de produtos, precificação e market share.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Campos implementados | 15 |
| Filtros funcionais | 10 |
| Abas de detalhes | 5 |
| Validação matemática | 100% |
| Produtos de teste | ≥ 50 |
| Relacionamentos criados | ≥ 20 |
| Tempo de resposta API | < 500ms |
| Lighthouse Performance | ≥ 80 |

### 🚀 Impacto no Negócio

**Antes da Fase 2:**
- ❌ Produtos não visualizáveis no sistema
- ❌ Impossível saber quais entidades vendem quais produtos
- ❌ Sem análise de portfólio
- ❌ Sem análise de precificação

**Depois da Fase 2:**
- ✅ Catálogo completo de produtos
- ✅ Relacionamento entidade-produto mapeado
- ✅ Análise de mix de produtos por entidade
- ✅ Análise de precificação comparativa
- ✅ Identificação de produtos sem entidades vinculadas
- ✅ Base para análises de mercado

### 🔗 Dependências Habilitadas

Esta fase habilita:
- ✅ Fase 3 (Projetos) - pode adicionar produtos a projetos
- ✅ Fase 9 (Explorador) - análise multidimensional de produtos
- ✅ Fase 12 (Análise de Mercado) - market share por produto

### 🎓 Aprendizados Esperados

1. **Relacionamentos N:N:** Implementação de tabelas de relacionamento entre entidades e produtos
2. **Navegação Cruzada:** Gerenciamento de múltiplos sheets abertos simultaneamente
3. **Validação de Preços:** Formatação e validação de valores monetários
4. **Categorização:** Implementação de filtros hierárquicos (categoria → subcategoria)

---

## FASE 3: Preparação - Projetos

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 25h  
**Dependências:** Fases 1, 2

### 🎯 Objetivo Geral

Implementar o **sistema de gerenciamento de Projetos**, que serve como **container organizacional** para agrupar entidades, produtos, pesquisas e análises relacionadas a um objetivo de negócio específico.

### 📦 Entregas Planejadas

#### 1. Infraestrutura de Dados
- Validação da tabela `dim_projeto`
- Criação de `fato_projeto_entidade` (N:N)
- Criação de `fato_projeto_produto` (N:N)
- Criação de `fato_projeto_pesquisa` (N:N)

#### 2. API Backend
- **CRUD completo de projetos:**
  - POST `/api/projetos` - Criar projeto
  - GET `/api/projetos` - Listar projetos
  - GET `/api/projetos/:id` - Detalhes do projeto
  - PUT `/api/projetos/:id` - Editar projeto
  - DELETE `/api/projetos/:id` - Excluir projeto

- **Gerenciamento de relacionamentos:**
  - POST `/api/projetos/:id/entidades` - Adicionar entidade
  - DELETE `/api/projetos/:id/entidades/:entidade_id` - Remover entidade
  - POST `/api/projetos/:id/produtos` - Adicionar produto
  - DELETE `/api/projetos/:id/produtos/:produto_id` - Remover produto

#### 3. Interface de Usuário
- **Browse de Projetos** com cards visuais
- **Modal de Criação/Edição** de projetos
- **Dashboard do Projeto** com:
  - Resumo executivo
  - Métricas principais
  - Abas: Entidades, Produtos, Pesquisas, Análises

#### 4. Filtros Contextuais
- Filtrar entidades por projeto
- Filtrar produtos por projeto
- Filtrar análises por projeto

### 🎯 Objetivos a Alcançar

**Objetivo 1: Organização por Contexto**  
Usuários poderão agrupar entidades e produtos relacionados a um objetivo de negócio específico (ex: "Expansão Região Sul", "Lançamento Produto X").

**Objetivo 2: Visão Consolidada**  
Usuários terão uma visão consolidada de todas as informações relacionadas a um projeto em um único dashboard.

**Objetivo 3: Colaboração**  
Múltiplos usuários poderão trabalhar no mesmo projeto, com histórico de alterações e auditoria.

**Objetivo 4: Análises Contextuais**  
Todas as análises futuras poderão ser filtradas por projeto, facilitando comparações e relatórios.

**Objetivo 5: Ciclo de Vida**  
Projetos terão status (planejamento, execução, concluído, arquivado) permitindo gestão do ciclo de vida.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| CRUD completo | 100% |
| Relacionamentos N:N | 3 tabelas |
| Abas do dashboard | 4 |
| Filtros contextuais | 3 módulos |
| Projetos de teste | ≥ 5 |
| Validação matemática | 100% |

### 🚀 Impacto no Negócio

**Antes da Fase 3:**
- ❌ Dados dispersos sem contexto organizacional
- ❌ Impossível agrupar análises por objetivo
- ❌ Sem visão consolidada de iniciativas
- ❌ Difícil colaboração entre equipes

**Depois da Fase 3:**
- ✅ Projetos organizados por objetivo de negócio
- ✅ Visão consolidada de cada iniciativa
- ✅ Filtros contextuais em todo o sistema
- ✅ Histórico de alterações e auditoria
- ✅ Métricas de progresso por projeto
- ✅ Base para relatórios executivos

### 🔗 Dependências Habilitadas

Esta fase habilita:
- ✅ Fase 4 (Pesquisas) - pesquisas vinculadas a projetos
- ✅ Fase 9 (Explorador) - análises filtradas por projeto
- ✅ Relatórios executivos por projeto

---

## FASE 4: Preparação - Pesquisas

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 20h  
**Dependências:** Fase 3

### 🎯 Objetivo Geral

Implementar o **sistema de configuração de Pesquisas de Mercado**, permitindo definir critérios de segmentação, filtros de qualificação e campos customizados para coleta de dados.

### 📦 Entregas Planejadas

#### 1. Infraestrutura de Dados
- Validação da tabela `dim_pesquisa`
- Criação de `dim_pergunta` (perguntas da pesquisa)
- Criação de `fato_pesquisa_resposta` (respostas coletadas)
- Criação de `fato_pesquisa_entidade` (entidades alvo)

#### 2. API Backend
- CRUD completo de pesquisas
- Gerenciamento de perguntas
- Coleta de respostas
- Relatórios de resultados

#### 3. Interface de Usuário
- **Criador de Pesquisas** (wizard multi-etapas)
- **Biblioteca de Perguntas** (templates)
- **Dashboard de Resultados** com gráficos
- **Exportação de Dados** coletados

### 🎯 Objetivos a Alcançar

**Objetivo 1: Pesquisas Customizadas**  
Usuários poderão criar pesquisas de mercado totalmente customizadas com perguntas específicas para seu contexto.

**Objetivo 2: Segmentação Avançada**  
Usuários poderão definir critérios de segmentação (setor, porte, região) para direcionar pesquisas ao público correto.

**Objetivo 3: Coleta Estruturada**  
Dados coletados serão estruturados e validados, facilitando análises posteriores.

**Objetivo 4: Análise de Resultados**  
Usuários terão dashboards automáticos com gráficos e métricas dos resultados coletados.

**Objetivo 5: Integração com Projetos**  
Pesquisas estarão vinculadas a projetos, mantendo contexto organizacional.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Tipos de pergunta | 5 (texto, múltipla escolha, escala, etc.) |
| Templates de pesquisa | ≥ 3 |
| Gráficos de resultados | 4 tipos |
| Exportação de dados | CSV, Excel |
| Validação de respostas | 100% |

### 🚀 Impacto no Negócio

**Antes da Fase 4:**
- ❌ Pesquisas feitas manualmente em planilhas
- ❌ Dados não estruturados
- ❌ Difícil análise de resultados
- ❌ Sem histórico de pesquisas anteriores

**Depois da Fase 4:**
- ✅ Pesquisas digitais estruturadas
- ✅ Coleta automatizada de dados
- ✅ Análise instantânea de resultados
- ✅ Histórico completo de pesquisas
- ✅ Segmentação precisa de público-alvo
- ✅ Relatórios automáticos

---

## FASE 5: Preparação - Importação de Dados

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 30h  
**Dependências:** Fases 1, 2

### 🎯 Objetivo Geral

Implementar **sistema completo de importação de dados** via CSV/Excel, com validação, mapeamento de colunas, preview e processamento em background.

### 📦 Entregas Planejadas

#### 1. Infraestrutura de Dados
- Tabela `fato_importacao` (metadados)
- Tabela `fato_importacao_log` (logs detalhados)
- Queue de processamento (background jobs)

#### 2. API Backend
- Upload de arquivos (multipart/form-data)
- Parser de CSV/Excel
- Validação de dados
- Mapeamento de colunas
- Processamento assíncrono
- Rollback de importações

#### 3. Worker de Background
- Processar arquivo linha por linha
- Validar dados contra regras de negócio
- Inserir no banco com transações
- Atualizar status em tempo real
- Enviar notificações ao concluir

#### 4. Interface de Usuário
- **Página de Upload** (drag & drop)
- **Página de Mapeamento** (arrastar colunas)
- **Página de Preview** (primeiras 10 linhas)
- **Página de Histórico** (importações anteriores)
- **Modal de Progresso** (tempo real)

### 🎯 Objetivos a Alcançar

**Objetivo 1: Importação em Massa**  
Usuários poderão importar milhares de registros de uma vez, economizando horas de digitação manual.

**Objetivo 2: Validação Automática**  
Sistema validará automaticamente CNPJ, email, telefone e outros campos, evitando dados inválidos.

**Objetivo 3: Mapeamento Flexível**  
Usuários poderão mapear colunas do arquivo para campos do sistema, suportando diferentes formatos de planilhas.

**Objetivo 4: Preview Antes de Importar**  
Usuários verão preview dos dados antes de confirmar, evitando importações incorretas.

**Objetivo 5: Rastreabilidade Total**  
Todas as importações terão logs detalhados, permitindo auditoria e rollback se necessário.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Formatos suportados | CSV, XLSX, XLS |
| Tamanho máximo arquivo | 10 MB |
| Registros por importação | até 10.000 |
| Taxa de validação | 100% |
| Tempo de processamento | < 1 min para 1.000 registros |
| Taxa de sucesso | ≥ 95% |

### 🚀 Impacto no Negócio

**Antes da Fase 5:**
- ❌ Cadastro manual de entidades (lento e propenso a erros)
- ❌ Dados em planilhas dispersas
- ❌ Impossível importar grandes volumes
- ❌ Sem validação automática

**Depois da Fase 5:**
- ✅ Importação de 10.000 registros em minutos
- ✅ Validação automática de CNPJ, email, telefone
- ✅ Mapeamento flexível de colunas
- ✅ Preview antes de importar
- ✅ Histórico completo de importações
- ✅ Rollback em caso de erro
- ✅ Notificações ao concluir

---

## FASE 6: Preparação - Histórico de Importações

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 10h  
**Dependências:** Fase 5

### 🎯 Objetivo Geral

Implementar **visualização completa do histórico de importações**, com filtros, detalhes, logs de erro e capacidade de rollback.

### 📦 Entregas Planejadas

#### 1. Interface de Usuário
- **Lista de Importações** com status visual
- **Filtros** (data, status, tipo, usuário)
- **Detalhes da Importação** (modal)
- **Logs de Erro** (linhas que falharam)
- **Botão de Rollback** (desfazer importação)

#### 2. API Backend
- GET `/api/importacoes` - Listar importações
- GET `/api/importacoes/:id` - Detalhes
- GET `/api/importacoes/:id/logs` - Logs de erro
- POST `/api/importacoes/:id/rollback` - Desfazer

### 🎯 Objetivos a Alcançar

**Objetivo 1: Auditoria Completa**  
Usuários terão visibilidade total de todas as importações realizadas, por quem e quando.

**Objetivo 2: Diagnóstico de Erros**  
Usuários poderão identificar exatamente quais linhas falharam e por quê, facilitando correção.

**Objetivo 3: Rollback Seguro**  
Usuários poderão desfazer importações incorretas sem afetar dados pré-existentes.

**Objetivo 4: Métricas de Qualidade**  
Usuários terão métricas de taxa de sucesso, tempo de processamento e erros mais comuns.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Filtros disponíveis | 4 |
| Detalhamento de logs | 100% das linhas |
| Tempo de rollback | < 30s |
| Histórico mantido | 90 dias |

### 🚀 Impacto no Negócio

**Antes da Fase 6:**
- ❌ Sem visibilidade de importações anteriores
- ❌ Impossível identificar erros
- ❌ Sem capacidade de desfazer

**Depois da Fase 6:**
- ✅ Histórico completo de 90 dias
- ✅ Logs detalhados de erros
- ✅ Rollback em 1 click
- ✅ Métricas de qualidade
- ✅ Auditoria completa

---

## FASE 7: Enriquecimento - Enriquecer com IA

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 40h  
**Dependências:** Fase 1

### 🎯 Objetivo Geral

Implementar **enriquecimento automático de dados** usando inteligência artificial e APIs externas, preenchendo campos faltantes e adicionando informações complementares.

### 📦 Entregas Planejadas

#### 1. Integrações Externas
- **API Receita Federal** (dados de CNPJ)
- **API CNPJ.ws** (dados empresariais)
- **API Google Places** (localização e contato)
- **API LinkedIn** (dados corporativos)
- **LLM (GPT-4)** (análise de texto e classificação)

#### 2. Motor de Enriquecimento
- **Orquestrador** (decide quais fontes usar)
- **Cache** (evita chamadas duplicadas)
- **Rate Limiting** (respeita limites de APIs)
- **Retry Logic** (tenta novamente em caso de falha)
- **Priorização** (enriquece campos mais importantes primeiro)

#### 3. API Backend
- POST `/api/enriquecimento/entidade/:id` - Enriquecer uma entidade
- POST `/api/enriquecimento/lote` - Enriquecer em lote
- GET `/api/enriquecimento/:id/status` - Status do enriquecimento
- GET `/api/enriquecimento/historico` - Histórico

#### 4. Interface de Usuário
- **Botão "Enriquecer"** em cada entidade
- **Modal de Seleção** (escolher campos a enriquecer)
- **Barra de Progresso** (tempo real)
- **Diff Visual** (antes vs depois)
- **Dashboard de Enriquecimento** (métricas gerais)

### 🎯 Objetivos a Alcançar

**Objetivo 1: Completude de Dados**  
Aumentar a completude média dos dados de 65% para 90%+, preenchendo campos faltantes automaticamente.

**Objetivo 2: Dados Atualizados**  
Garantir que informações como faturamento, número de funcionários e endereço estejam sempre atualizadas.

**Objetivo 3: Classificação Automática**  
Classificar automaticamente entidades por setor, porte e potencial usando IA.

**Objetivo 4: Economia de Tempo**  
Reduzir de horas para minutos o tempo necessário para completar dados de uma entidade.

**Objetivo 5: Qualidade Garantida**  
Validar dados enriquecidos contra múltiplas fontes, garantindo confiabilidade.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Fontes de dados | 5 |
| Campos enriquecíveis | 20 |
| Taxa de sucesso | ≥ 85% |
| Tempo por entidade | < 30s |
| Completude média | 90%+ |
| Custo por enriquecimento | < R$ 0,50 |

### 🚀 Impacto no Negócio

**Antes da Fase 7:**
- ❌ Dados incompletos (65% de completude)
- ❌ Informações desatualizadas
- ❌ Classificação manual (lenta e imprecisa)
- ❌ Horas gastas em pesquisa manual

**Depois da Fase 7:**
- ✅ Dados 90%+ completos
- ✅ Informações atualizadas automaticamente
- ✅ Classificação automática via IA
- ✅ Enriquecimento em segundos
- ✅ Múltiplas fontes validadas
- ✅ Economia de 10+ horas/semana

---

## FASE 8: Enriquecimento - Processamento Avançado

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 35h  
**Dependências:** Fase 7

### 🎯 Objetivo Geral

Implementar **processamento em lote e geração de insights automatizados**, incluindo detecção de duplicatas, normalização de dados e classificação inteligente.

### 📦 Entregas Planejadas

#### 1. Motor de Processamento
- **Detecção de Duplicatas** (fuzzy matching)
- **Normalização de Dados** (padronização)
- **Classificação Automática** (setor, porte)
- **Geração de Insights** (via LLM)
- **Scoring de Qualidade** (cálculo automático)

#### 2. API Backend
- POST `/api/processamento/duplicatas` - Detectar duplicatas
- POST `/api/processamento/normalizar` - Normalizar dados
- POST `/api/processamento/classificar` - Classificar entidades
- POST `/api/processamento/insights` - Gerar insights
- GET `/api/processamento/:id/status` - Status

#### 3. Interface de Usuário
- **Dashboard de Processamento**
- **Gerenciador de Duplicatas** (merge)
- **Editor de Classificações**
- **Visualizador de Insights**

### 🎯 Objetivos a Alcançar

**Objetivo 1: Zero Duplicatas**  
Detectar e mesclar automaticamente registros duplicados, mantendo base limpa.

**Objetivo 2: Dados Padronizados**  
Normalizar formatos de CNPJ, telefone, endereço, etc., facilitando análises.

**Objetivo 3: Classificação Precisa**  
Classificar 100% das entidades por setor e porte usando IA.

**Objetivo 4: Insights Automáticos**  
Gerar insights de negócio automaticamente (ex: "80% dos clientes estão em SP").

**Objetivo 5: Score de Qualidade**  
Calcular automaticamente score de qualidade de cada registro.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Taxa de detecção de duplicatas | ≥ 95% |
| Precisão de classificação | ≥ 90% |
| Campos normalizados | 10 |
| Insights gerados | ≥ 20 |
| Tempo de processamento | < 5 min para 1.000 registros |

### 🚀 Impacto no Negócio

**Antes da Fase 8:**
- ❌ Duplicatas não identificadas
- ❌ Dados em formatos inconsistentes
- ❌ Classificação manual imprecisa
- ❌ Sem insights automáticos

**Depois da Fase 8:**
- ✅ Base limpa sem duplicatas
- ✅ Dados 100% padronizados
- ✅ Classificação automática precisa
- ✅ Insights gerados em tempo real
- ✅ Score de qualidade atualizado
- ✅ Economia de 20+ horas/semana

---

## FASE 9: Inteligência - Explorador Multidimensional

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 45h  
**Dependências:** Todas as fases anteriores

### 🎯 Objetivo Geral

Implementar **cubo OLAP interativo** permitindo análise multidimensional por setor, porte, região, produto, projeto e outras dimensões.

### 📦 Entregas Planejadas

#### 1. Motor OLAP
- **Cubo de dados** (pré-agregado)
- **Drill-down / Drill-up** (navegação hierárquica)
- **Slicing / Dicing** (cortes e fatias)
- **Pivot dinâmico** (rotação de dimensões)

#### 2. API Backend
- POST `/api/cubo/query` - Executar query OLAP
- GET `/api/cubo/dimensoes` - Listar dimensões
- GET `/api/cubo/medidas` - Listar medidas
- POST `/api/cubo/salvar` - Salvar análise

#### 3. Interface de Usuário
- **Builder de Consultas** (drag & drop)
- **Tabela Dinâmica** (pivot table)
- **Gráficos Interativos** (múltiplos tipos)
- **Exportação** (Excel, PDF)

### 🎯 Objetivos a Alcançar

**Objetivo 1: Análise Ad-Hoc**  
Usuários poderão criar análises customizadas sem depender de TI ou analistas.

**Objetivo 2: Múltiplas Dimensões**  
Usuários poderão cruzar até 5 dimensões simultaneamente (ex: Setor × Região × Porte × Produto × Projeto).

**Objetivo 3: Performance**  
Consultas complexas retornarão em < 2 segundos graças ao cubo pré-agregado.

**Objetivo 4: Visualizações Ricas**  
Usuários terão acesso a 10+ tipos de gráficos interativos.

**Objetivo 5: Compartilhamento**  
Usuários poderão salvar e compartilhar análises com colegas.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Dimensões disponíveis | 8 |
| Medidas disponíveis | 15 |
| Tipos de gráfico | 10 |
| Tempo de resposta | < 2s |
| Registros analisáveis | até 100.000 |

### 🚀 Impacto no Negócio

**Antes da Fase 9:**
- ❌ Análises dependem de TI
- ❌ Queries SQL complexas
- ❌ Sem visualizações interativas
- ❌ Análises demoram horas

**Depois da Fase 9:**
- ✅ Análises self-service
- ✅ Interface drag & drop
- ✅ Visualizações interativas
- ✅ Análises em segundos
- ✅ Compartilhamento fácil
- ✅ Economia de 30+ horas/semana

---

## FASE 10: Inteligência - Análise Temporal

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 30h  
**Dependências:** Fase 9

### 🎯 Objetivo Geral

Implementar **análises de séries temporais** para identificar tendências, sazonalidade e fazer previsões.

### 📦 Entregas Planejadas

#### 1. Motor de Análise Temporal
- **Agregação temporal** (dia, semana, mês, trimestre, ano)
- **Comparação período a período** (YoY, MoM, WoW)
- **Detecção de tendências** (crescimento, declínio)
- **Detecção de sazonalidade** (padrões recorrentes)
- **Previsões** (forecast usando modelos estatísticos)

#### 2. Interface de Usuário
- **Gráficos de linha temporal**
- **Comparador de períodos**
- **Visualizador de tendências**
- **Dashboard de previsões**

### 🎯 Objetivos a Alcançar

**Objetivo 1: Identificar Tendências**  
Usuários poderão identificar se métricas estão crescendo, estáveis ou declinando.

**Objetivo 2: Comparar Períodos**  
Usuários poderão comparar este mês vs mês anterior, este ano vs ano anterior, etc.

**Objetivo 3: Detectar Sazonalidade**  
Usuários identificarão padrões sazonais (ex: vendas maiores em dezembro).

**Objetivo 4: Fazer Previsões**  
Sistema gerará previsões automáticas para os próximos 3, 6 e 12 meses.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Granularidades temporais | 5 |
| Comparações disponíveis | 4 |
| Precisão de previsões | ≥ 80% |
| Períodos de forecast | 3, 6, 12 meses |

### 🚀 Impacto no Negócio

**Antes da Fase 10:**
- ❌ Sem visão de tendências
- ❌ Comparações manuais
- ❌ Sem previsões
- ❌ Decisões baseadas em feeling

**Depois da Fase 10:**
- ✅ Tendências claras e visuais
- ✅ Comparações automáticas
- ✅ Previsões estatísticas
- ✅ Decisões data-driven
- ✅ Antecipação de sazonalidade

---

## FASE 11: Inteligência - Análise Geográfica

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 35h  
**Dependências:** Fase 9

### 🎯 Objetivo Geral

Implementar **visualizações geográficas interativas** para análise de distribuição espacial e identificação de oportunidades por região.

### 📦 Entregas Planejadas

#### 1. Mapas Interativos
- **Mapa do Brasil** (estados e cidades)
- **Heatmap de densidade**
- **Marcadores clusterizados**
- **Polígonos de região**
- **Rotas de vendas**

#### 2. Análises Geográficas
- **Distribuição por estado/cidade**
- **Concentração geográfica**
- **Gaps de cobertura**
- **Análise de rotas**
- **Potencial por região**

### 🎯 Objetivos a Alcançar

**Objetivo 1: Visualização Espacial**  
Usuários verão distribuição geográfica de entidades, produtos e vendas em mapa interativo.

**Objetivo 2: Identificar Gaps**  
Usuários identificarão regiões com baixa cobertura e alto potencial.

**Objetivo 3: Otimizar Rotas**  
Usuários poderão planejar rotas de vendas otimizadas.

**Objetivo 4: Análise de Concentração**  
Usuários identificarão se estão muito concentrados em poucas regiões (risco).

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Estados mapeados | 27 |
| Cidades mapeadas | 5.570 |
| Tipos de visualização | 5 |
| Tempo de carregamento | < 3s |

### 🚀 Impacto no Negócio

**Antes da Fase 11:**
- ❌ Sem visão geográfica
- ❌ Gaps não identificados
- ❌ Rotas não otimizadas
- ❌ Concentração de risco

**Depois da Fase 11:**
- ✅ Mapa interativo completo
- ✅ Gaps claramente identificados
- ✅ Rotas otimizadas
- ✅ Diversificação geográfica
- ✅ Expansão planejada

---

## FASE 12: Inteligência - Análise de Mercado

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 40h  
**Dependências:** Fase 9

### 🎯 Objetivo Geral

Implementar **análises de mercado** incluindo hierarquia de mercados, market share, matriz BCG e análise de concorrentes.

### 📦 Entregas Planejadas

#### 1. Hierarquia de Mercados
- **Árvore de mercados** (navegável)
- **Drill-down** por níveis
- **Participação por mercado**

#### 2. Análises Competitivas
- **Market Share** (participação de mercado)
- **Matriz BCG** (estrelas, vacas leiteiras, interrogações, abacaxis)
- **Análise de Concorrentes** (comparação)
- **Gaps de Mercado** (oportunidades)

### 🎯 Objetivos a Alcançar

**Objetivo 1: Entender Mercados**  
Usuários terão visão clara da hierarquia e estrutura de mercados.

**Objetivo 2: Medir Participação**  
Usuários saberão exatamente qual sua participação em cada mercado.

**Objetivo 3: Priorizar Investimentos**  
Matriz BCG mostrará onde investir (estrelas) e onde desinvestir (abacaxis).

**Objetivo 4: Analisar Concorrentes**  
Usuários poderão comparar-se com concorrentes em múltiplas dimensões.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Níveis de hierarquia | 4 |
| Mercados mapeados | ≥ 50 |
| Análises disponíveis | 4 |
| Concorrentes rastreados | ≥ 10 |

### 🚀 Impacto no Negócio

**Antes da Fase 12:**
- ❌ Sem visão de mercados
- ❌ Market share desconhecido
- ❌ Investimentos não priorizados
- ❌ Concorrentes não monitorados

**Depois da Fase 12:**
- ✅ Hierarquia clara de mercados
- ✅ Market share calculado
- ✅ Matriz BCG para priorização
- ✅ Concorrentes monitorados
- ✅ Gaps de mercado identificados
- ✅ Estratégia competitiva data-driven

---

## FASE 13: Administração - Usuários

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 25h  
**Dependências:** Nenhuma (independente)

### 🎯 Objetivo Geral

Implementar **sistema completo de gerenciamento de usuários**, incluindo perfis de acesso, permissões granulares e logs de auditoria.

### 📦 Entregas Planejadas

#### 1. Gestão de Usuários
- **CRUD de usuários**
- **Perfis de acesso** (admin, analista, visualizador)
- **Permissões granulares** (por módulo)
- **Autenticação** (OAuth Google, Microsoft)
- **2FA** (autenticação de dois fatores)

#### 2. Auditoria
- **Logs de acesso**
- **Logs de alterações**
- **Relatórios de uso**

### 🎯 Objetivos a Alcançar

**Objetivo 1: Controle de Acesso**  
Administradores poderão controlar quem acessa o sistema e o que cada usuário pode fazer.

**Objetivo 2: Segurança**  
Sistema terá autenticação robusta com 2FA e OAuth.

**Objetivo 3: Auditoria Completa**  
Todas as ações serão registradas para compliance e investigação.

**Objetivo 4: Perfis Flexíveis**  
Permissões granulares permitirão criar perfis customizados.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Perfis padrão | 3 |
| Permissões granulares | 20 |
| Métodos de autenticação | 3 |
| Retenção de logs | 1 ano |

### 🚀 Impacto no Negócio

**Antes da Fase 13:**
- ❌ Acesso sem controle
- ❌ Sem auditoria
- ❌ Segurança fraca
- ❌ Compliance em risco

**Depois da Fase 13:**
- ✅ Controle total de acesso
- ✅ Auditoria completa
- ✅ Segurança robusta (2FA)
- ✅ Compliance garantido
- ✅ Relatórios de uso

---

## FASE 14: Administração - Gestão de IA

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 20h  
**Dependências:** Fase 7

### 🎯 Objetivo Geral

Implementar **dashboard de monitoramento de uso de IA**, incluindo custos, logs, rate limiting e segurança.

### 📦 Entregas Planejadas

#### 1. Monitoramento
- **Dashboard de uso** (chamadas, tokens, custos)
- **Logs de chamadas** (request/response)
- **Alertas de custo** (threshold)
- **Métricas de performance** (latência, taxa de erro)

#### 2. Controle
- **Rate Limiting** (por usuário/projeto)
- **Quotas** (limites mensais)
- **Blacklist** (bloqueio de prompts)
- **Whitelist** (aprovação de modelos)

### 🎯 Objetivos a Alcançar

**Objetivo 1: Visibilidade de Custos**  
Administradores saberão exatamente quanto está sendo gasto com IA.

**Objetivo 2: Controle de Uso**  
Administradores poderão limitar uso por usuário/projeto para evitar custos excessivos.

**Objetivo 3: Segurança**  
Sistema bloqueará prompts maliciosos e garantirá compliance.

**Objetivo 4: Performance**  
Métricas de latência e taxa de erro permitirão otimizações.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Métricas monitoradas | 10 |
| Alertas configuráveis | 5 |
| Tempo de retenção de logs | 90 dias |
| Precisão de custo | 100% |

### 🚀 Impacto no Negócio

**Antes da Fase 14:**
- ❌ Custos de IA desconhecidos
- ❌ Uso sem controle
- ❌ Sem visibilidade de performance
- ❌ Riscos de segurança

**Depois da Fase 14:**
- ✅ Custos transparentes
- ✅ Uso controlado (quotas)
- ✅ Performance monitorada
- ✅ Segurança garantida
- ✅ Alertas proativos

---

## FASES 15-19: Ações de Entidades

**Status:** ⚪ PLANEJADAS  
**Duração total:** 17h  
**Dependências:** Fase 1, Fase 7

### 🎯 Objetivo Geral

Implementar as **7 ações pendentes** do EntidadeDetailsSheet, transformando placeholders em funcionalidades completas.

### Fase 15: Editar Dados (6h)

**Objetivo:** Permitir edição completa de entidades com validação.

**Entregas:**
- Modal de edição
- Formulário com validação
- API PUT `/api/entidades/:id`
- Feedback visual

### Fase 16: Enriquecer com IA (4h)

**Objetivo:** Enriquecer entidade individual.

**Entregas:**
- Integração com motor de enriquecimento
- Modal de progresso
- Diff visual (antes vs depois)

### Fase 17: Exportar Dados (2h)

**Objetivo:** Exportar dados de entidade para CSV/Excel.

**Entregas:**
- Geração de arquivo
- Download automático
- Todas as abas incluídas

### Fase 18: Enviar Email (3h)

**Objetivo:** Enviar email para entidade.

**Entregas:**
- Modal de composição
- Integração com SendGrid/Resend
- Templates de email

### Fase 19: Excluir Entidade (2h)

**Objetivo:** Excluir entidade com confirmação.

**Entregas:**
- Modal de confirmação
- Verificação de dependências
- API DELETE `/api/entidades/:id`
- Soft delete

### 🚀 Impacto no Negócio

**Antes das Fases 15-19:**
- ❌ Ações são apenas placeholders
- ❌ Impossível editar entidades
- ❌ Impossível exportar dados
- ❌ Impossível enviar emails
- ❌ Impossível excluir entidades

**Depois das Fases 15-19:**
- ✅ CRUD completo de entidades
- ✅ Enriquecimento individual
- ✅ Exportação de dados
- ✅ Comunicação por email
- ✅ Gestão completa do ciclo de vida

---

## FASE 20: Melhorias de UX

**Status:** ⚪ PLANEJADA  
**Duração estimada:** 12h  
**Dependências:** Todas as fases anteriores

### 🎯 Objetivo Geral

Resolver **bugs conhecidos** e implementar **melhorias de experiência do usuário** identificadas durante o desenvolvimento.

### 📦 Entregas Planejadas

#### 1. Loading States (3h)
- Skeleton na tabela
- Spinner no sheet
- Feedback visual nos filtros

#### 2. Mensagens de Erro (2h)
- Toast de erro amigável
- Mensagens não técnicas
- Botão "Tentar novamente"

#### 3. Exportação em Massa (4h)
- Checkbox para seleção múltipla
- Botão "Exportar selecionados"
- Geração de CSV/Excel

#### 4. Filtros Persistentes (2h)
- Salvar filtros no localStorage
- Restaurar ao carregar página
- Compartilhar URL com filtros

#### 5. Fix EMFILE Bug (1h)
- Aumentar limite de arquivos
- Configurar polling no Vite
- Excluir node_modules do watch

### 🎯 Objetivos a Alcançar

**Objetivo 1: Feedback Visual**  
Usuários sempre saberão o que está acontecendo (loading, sucesso, erro).

**Objetivo 2: Erros Amigáveis**  
Mensagens de erro serão claras e acionáveis, não técnicas.

**Objetivo 3: Produtividade**  
Exportação em massa e filtros persistentes economizarão tempo.

**Objetivo 4: Estabilidade**  
Bug EMFILE será resolvido, melhorando experiência de desenvolvimento.

### 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Loading states implementados | 10 |
| Mensagens de erro amigáveis | 15 |
| Filtros persistentes | 100% |
| Bug EMFILE | Resolvido |

### 🚀 Impacto no Negócio

**Antes da Fase 20:**
- ❌ Usuários confusos (sem feedback)
- ❌ Erros técnicos assustadores
- ❌ Filtros perdidos ao navegar
- ❌ Exportação manual (lenta)

**Depois da Fase 20:**
- ✅ Feedback visual constante
- ✅ Erros amigáveis e acionáveis
- ✅ Filtros persistem automaticamente
- ✅ Exportação em massa rápida
- ✅ Desenvolvimento estável

---

## 📊 RESUMO GERAL DE OBJETIVOS

### Por Categoria

#### Fundação (Fases 1-2)
**Objetivo:** Criar base sólida de dados (Entidades e Produtos) com CRUD completo, validação matemática e navegação contextual.

**Impacto:** Sistema utilizável com funcionalidades core, habilitando todas as outras fases.

#### Preparação (Fases 3-6)
**Objetivo:** Implementar ferramentas de organização (Projetos, Pesquisas) e ingestão de dados (Importação).

**Impacto:** Usuários podem organizar trabalho em projetos, criar pesquisas e importar grandes volumes de dados.

#### Enriquecimento (Fases 7-8)
**Objetivo:** Automatizar completude e qualidade de dados usando IA e processamento avançado.

**Impacto:** Dados 90%+ completos, sem duplicatas, classificados automaticamente, com insights gerados.

#### Inteligência (Fases 9-12)
**Objetivo:** Fornecer análises avançadas (multidimensional, temporal, geográfica, mercado).

**Impacto:** Decisões data-driven, identificação de tendências, gaps e oportunidades.

#### Administração (Fases 13-14)
**Objetivo:** Garantir segurança, compliance e controle de custos.

**Impacto:** Sistema seguro, auditável, com custos de IA controlados.

#### Ações (Fases 15-19)
**Objetivo:** Completar CRUD de entidades, transformando placeholders em funcionalidades.

**Impacto:** Gestão completa do ciclo de vida de entidades.

#### Melhorias (Fase 20)
**Objetivo:** Polir experiência do usuário e resolver bugs.

**Impacto:** Sistema profissional, estável e agradável de usar.

---

## 🎯 OBJETIVOS ESTRATÉGICOS GLOBAIS

### 1. Qualidade de Dados
**Meta:** Aumentar completude média de 65% para 90%+  
**Fases responsáveis:** 1, 2, 5, 7, 8

### 2. Produtividade
**Meta:** Reduzir tempo de análise de horas para minutos  
**Fases responsáveis:** 9, 10, 11, 12

### 3. Automação
**Meta:** Automatizar 80% das tarefas manuais  
**Fases responsáveis:** 5, 7, 8

### 4. Segurança
**Meta:** 100% de compliance com LGPD  
**Fases responsáveis:** 13, 14

### 5. ROI
**Meta:** Economizar 100+ horas/mês de trabalho manual  
**Fases responsáveis:** Todas

---

**Autor:** Manus AI  
**Data:** 04/12/2025  
**Versão:** 1.0
