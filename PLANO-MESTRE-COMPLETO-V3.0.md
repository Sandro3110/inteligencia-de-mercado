# 🎯 PLANO MESTRE COMPLETO - IntelMarket v3.0

**Data:** 01/12/2025  
**Status:** Plano Assistido e Estruturado  
**Objetivo:** Garantir governança, arquitetura, lógica de implantação e performance de primeiro mundo

---

## 📋 PRINCÍPIOS FUNDAMENTAIS

### **Equipe Multidisciplinar:**

1. **Engenharia de Dados** - Estrutura, performance, escalabilidade
2. **Arquitetura da Informação** - Organização, navegação, taxonomia
3. **Analista de Inteligência de Mercado** - Regras de negócio, qualidade de dados
4. **Arquiteto de UI/Frontend** - Experiência do usuário, usabilidade

### **Critérios de Qualidade:**

- ✅ **Análise profunda** antes de qualquer ação
- ✅ **SEM placeholders** ou mockups
- ✅ **SEM ações sem análise**
- ✅ **Checkpoints de segurança** em cada fase
- ✅ **Discussões completas** antes de construção
- ✅ **Revisão minuciosa** do que já foi feito

---

## 🏗️ RESPOSTAS VALIDADAS (Incorporadas ao Plano)

### **1. Cadastro de Projeto e Pesquisa**

✅ **Controle rígido:**

- Projeto: cadastro prévio com nome, descrição, centro de custos
- Pesquisa: cadastro prévio com nome, descrição, objetivo
- Na importação: usuário **escolhe** projeto e pesquisa existentes
- **Benefício:** Evita textos errados e multiplicação descontrolada

### **2. Status Flutua por Projeto/Pesquisa**

✅ **Confirmado:**

- Cliente pode ser "ativo" em Projeto A e "inativo" em Projeto B
- Status está em `fato_entidade_contexto` (não em `dim_entidade`)

### **3. Apagar Pesquisa vs Enriquecer**

✅ **Regras:**

- Apagar pesquisa: **permitido** (DELETE físico ou soft delete)
- Enriquecer: **sempre cria nova versão** (nova pesquisa)
- **Benefício:** Rastreabilidade completa

### **4. CNPJ Único = Entidade Única**

✅ **Regras:**

- Mesmo CNPJ (matriz ou filial) = **uma entidade**
- **Novos campos:**
  - `num_filiais` (quantas filiais tem)
  - `num_lojas` (quantas lojas físicas)
  - **Benefício:** Dimensionar porte da empresa

### **5. Merge para Nomes Semelhantes**

✅ **Regras:**

- Similaridade > 60%: **perguntar sempre** ao usuário
- CNPJ idêntico: **merge automático**
- **UI futura:** Criar rotina para facilitar experiência (discussão futura)

### **6. Mercado Padrão**

✅ **Decisão:**

- Mercado padrão: **"NÃO CLASSIFICADO"**
- Criado automaticamente no seed do banco
- Substituído no enriquecimento

---

## 📊 FASES DO PLANO MESTRE

### **FASE 0: FUNDAÇÃO (Já Executada - Revisão Necessária)** ✅ 70%

#### **0.1. Limpeza e Reestruturação do Banco** ✅ 100%

**O que foi feito:**

- Banco limpo (0 registros)
- 7 tabelas criadas (dim_geografia, dim_mercados, dim_produtos, fato_entidades, etc)
- 48 índices criados
- 15 Foreign Keys
- Campo `status_qualificacao` adicionado

**Revisão necessária:**

- ⚠️ Tabela `fato_entidades` deve ser **substituída** por `fato_entidade_contexto`
- ⚠️ Faltam campos de auditoria (created_by, updated_by)
- ⚠️ Faltam campos de origem (origem_tipo, origem_arquivo, etc)
- ⚠️ Faltam campos de filiais/lojas (num_filiais, num_lojas)
- ⚠️ Falta mercado padrão "NÃO CLASSIFICADO"

**Ação:** Revisar e corrigir na FASE 1

---

#### **0.2. Schema Drizzle ORM** ✅ 100%

**O que foi feito:**

- Schema antigo substituído por schema novo
- Migration gerada
- Erros TypeScript documentados (esperado)

**Revisão necessária:**

- ⚠️ Schema atual usa `fato_entidades` (deve ser `fato_entidade_contexto`)
- ⚠️ Faltam campos de auditoria
- ⚠️ Faltam campos de origem
- ⚠️ Faltam campos de filiais/lojas

**Ação:** Revisar e corrigir na FASE 1

---

#### **0.3. Camada de Acesso a Dados (DAL)** ✅ 100%

**O que foi feito:**

- Types TypeScript criados (shared/types/entidades.ts)
- DAL criado (server/dal/entidades.ts)
- Query unificada, CRUD, estatísticas

**Revisão necessária:**

- ⚠️ DAL usa `fato_entidades` (deve ser `fato_entidade_contexto`)
- ⚠️ Faltam helpers de auditoria (auto-preencher created_by, updated_by)
- ⚠️ Faltam helpers de origem (registrar importação vs IA)

**Ação:** Revisar e corrigir na FASE 2

---

### **FASE 1: MODELO DE DADOS DEFINITIVO** (0% - Próxima)

#### **1.1. Discussão: Modelo Dimensional Final** (8-12h)

**Objetivo:** Validar modelo com todas as respostas incorporadas

**Participantes:**

- Engenheiro de Dados (estrutura, performance)
- Arquiteto da Informação (organização)
- Analista de Inteligência de Mercado (regras de negócio)

**Entregáveis:**

1. **Documento de Modelo Dimensional Final** (MD)
   - 7 dimensões (entidade, projeto, pesquisa, geografia, mercado, produto, status)
   - 1 fato central (fato_entidade_contexto)
   - 2 fatos N:N (entidade_produto, entidade_competidor)
   - Todos os campos de auditoria
   - Todos os campos de origem
   - Campos de filiais/lojas
   - Mercado padrão "NÃO CLASSIFICADO"

2. **Diagrama ER Completo** (Mermaid ou draw.io)
   - Todas as tabelas
   - Todos os relacionamentos
   - Todos os índices
   - Todas as constraints

3. **Documento de Regras de Negócio** (MD)
   - CNPJ único = entidade única
   - Status flutua por projeto/pesquisa
   - Merge > 60% sempre pergunta
   - Enriquecer sempre cria nova versão
   - Apagar pesquisa permitido

**Checkpoint:**

- [ ] Modelo validado por todos os participantes
- [ ] Diagrama ER aprovado
- [ ] Regras de negócio documentadas

---

#### **1.2. Revisão do Modelo Existente** (4-6h)

**Objetivo:** Identificar gaps entre modelo atual e modelo final

**Atividades:**

1. Comparar `fato_entidades` (atual) vs `fato_entidade_contexto` (final)
2. Listar campos faltantes (auditoria, origem, filiais/lojas)
3. Listar índices faltantes
4. Listar constraints faltantes
5. Criar plano de migração

**Entregáveis:**

1. **Documento de Gaps** (MD)
   - Tabelas a criar
   - Tabelas a modificar
   - Tabelas a deletar
   - Campos a adicionar
   - Índices a criar
   - Constraints a adicionar

2. **Plano de Migração** (MD)
   - Ordem de execução
   - Scripts SQL
   - Rollback plan
   - Testes de validação

**Checkpoint:**

- [ ] Gaps identificados
- [ ] Plano de migração aprovado
- [ ] Rollback plan documentado

---

#### **1.3. Implementação do Modelo Final** (8-12h)

**Objetivo:** Criar/atualizar schema do banco com modelo final

**Atividades:**

1. Criar script SQL de migração completo
2. Adicionar campos de auditoria (TODAS as tabelas)
3. Adicionar campos de origem (dim_entidade)
4. Adicionar campos de filiais/lojas (dim_entidade)
5. Criar `fato_entidade_contexto` (substituir `fato_entidades`)
6. Criar mercado padrão "NÃO CLASSIFICADO"
7. Criar índices otimizados
8. Criar constraints (Foreign Keys, UNIQUE, CHECK)
9. Executar migration no banco Supabase
10. Validar estrutura (queries de teste)

**Entregáveis:**

1. **Migration SQL** (migrations/003_modelo_final.sql)
2. **Script de Validação** (SQL)
3. **Documento de Validação** (MD)
   - Todas as tabelas criadas
   - Todos os campos presentes
   - Todos os índices criados
   - Todas as constraints ativas

**Checkpoint:**

- [ ] Migration executada com sucesso
- [ ] Validação 100% aprovada
- [ ] Rollback testado

---

#### **1.4. Atualização do Schema Drizzle** (4-6h)

**Objetivo:** Sincronizar schema TypeScript com banco

**Atividades:**

1. Atualizar `drizzle/schema.ts` com modelo final
2. Adicionar campos de auditoria
3. Adicionar campos de origem
4. Adicionar campos de filiais/lojas
5. Criar `fatoEntidadeContexto` (substituir `fatoEntidades`)
6. Gerar types TypeScript (drizzle-kit generate)
7. Validar types (tsc --noEmit)

**Entregáveis:**

1. **drizzle/schema.ts** (atualizado)
2. **Documento de Validação TypeScript** (MD)

**Checkpoint:**

- [ ] Schema sincronizado com banco
- [ ] Types gerados sem erros
- [ ] TypeScript compila sem erros

---

### **FASE 2: CAMADA DE DADOS (DAL)** (0%)

#### **2.1. Discussão: Arquitetura da Camada de Dados** (4-6h)

**Objetivo:** Definir padrões e helpers da DAL

**Participantes:**

- Engenheiro de Dados
- Arquiteto de Software

**Tópicos:**

1. **Helpers de Auditoria**
   - Auto-preencher `created_by`, `updated_by`
   - Pegar usuário do contexto (session)
   - Validar permissões

2. **Helpers de Origem**
   - Registrar importação (arquivo, data, usuário)
   - Registrar IA (processo, prompt, confiança)
   - Registrar API (fonte, endpoint)

3. **Helpers de Deduplicação**
   - Gerar `entidade_hash` (CNPJ ou nome+cidade+uf)
   - Buscar entidade existente
   - Calcular similaridade (Levenshtein distance)

4. **Helpers de Contexto**
   - Criar contexto (entidade + projeto + pesquisa)
   - Buscar contexto existente
   - Atualizar contexto

5. **Helpers de Validação**
   - Validar CNPJ (formato + dígitos verificadores)
   - Validar email (formato)
   - Validar telefone (formato)
   - Validar cidade (existe em dim_geografia)

**Entregáveis:**

1. **Documento de Arquitetura DAL** (MD)
   - Padrões de nomenclatura
   - Estrutura de pastas
   - Helpers obrigatórios
   - Exemplos de uso

**Checkpoint:**

- [ ] Arquitetura aprovada
- [ ] Padrões documentados

---

#### **2.2. Implementação da DAL** (12-16h)

**Objetivo:** Criar camada de acesso a dados completa

**Atividades:**

1. Criar helpers de auditoria
2. Criar helpers de origem
3. Criar helpers de deduplicação
4. Criar helpers de contexto
5. Criar helpers de validação
6. Criar DAL para dim_entidade
7. Criar DAL para dim_projeto
8. Criar DAL para dim_pesquisa
9. Criar DAL para fato_entidade_contexto
10. Criar DAL para relacionamentos N:N
11. Criar testes unitários (Jest)

**Entregáveis:**

1. **server/dal/helpers/** (auditoria, origem, deduplicação, etc)
2. **server/dal/entidade.ts** (CRUD completo)
3. **server/dal/projeto.ts** (CRUD completo)
4. **server/dal/pesquisa.ts** (CRUD completo)
5. **server/dal/contexto.ts** (CRUD completo)
6. **server/dal/**tests**/** (testes unitários)

**Checkpoint:**

- [ ] Todos os helpers criados
- [ ] Todos os DALs criados
- [ ] Testes unitários 80%+ cobertura

---

### **FASE 3: CADASTROS (Projeto e Pesquisa)** (0%)

#### **3.1. Discussão: UI de Cadastros** (6-8h)

**Objetivo:** Definir fluxo e UI de cadastro de Projeto e Pesquisa

**Participantes:**

- Arquiteto de UI/Frontend
- Analista de Inteligência de Mercado
- Engenheiro de Dados

**Tópicos:**

1. **Cadastro de Projeto**
   - Campos obrigatórios: nome, owner
   - Campos opcionais: descrição, centro_custo, unidade_negocio, orcamento
   - Validações: nome único por owner
   - Fluxo: criar → validar → salvar

2. **Cadastro de Pesquisa**
   - Campos obrigatórios: nome, projeto_id
   - Campos opcionais: descrição, objetivo
   - Validações: nome único por projeto
   - Fluxo: selecionar projeto → criar pesquisa → validar → salvar

3. **Listagem e Busca**
   - Filtros: status, owner, data
   - Ordenação: data, nome
   - Paginação: 20 por página

4. **Edição e Exclusão**
   - Editar: todos os campos exceto id
   - Excluir: soft delete (marcar como inativo)
   - Permissões: só owner pode editar/excluir

**Entregáveis:**

1. **Documento de Fluxos** (MD)
   - Fluxograma de cadastro
   - Fluxograma de edição
   - Fluxograma de exclusão

2. **Documento de Validações** (MD)
   - Regras de validação
   - Mensagens de erro
   - Casos edge

3. **Wireframes** (Figma ou draw.io)
   - Tela de cadastro de projeto
   - Tela de cadastro de pesquisa
   - Tela de listagem
   - Tela de edição

**Checkpoint:**

- [ ] Fluxos aprovados
- [ ] Validações documentadas
- [ ] Wireframes aprovados

---

#### **3.2. Implementação Backend (Routers)** (8-12h)

**Objetivo:** Criar endpoints TRPC para cadastros

**Atividades:**

1. Criar router `projetos.ts`
   - `list` (listar projetos)
   - `getById` (buscar por ID)
   - `create` (criar projeto)
   - `update` (atualizar projeto)
   - `delete` (soft delete)
   - `getByOwner` (projetos do usuário)

2. Criar router `pesquisas.ts`
   - `list` (listar pesquisas)
   - `getById` (buscar por ID)
   - `getByProjeto` (pesquisas de um projeto)
   - `create` (criar pesquisa)
   - `update` (atualizar pesquisa)
   - `delete` (soft delete)

3. Adicionar validações (Zod)
4. Adicionar testes unitários

**Entregáveis:**

1. **server/routers/projetos.ts**
2. **server/routers/pesquisas.ts**
3. **server/routers/**tests**/**

**Checkpoint:**

- [ ] Routers criados
- [ ] Validações implementadas
- [ ] Testes 80%+ cobertura

---

#### **3.3. Implementação Frontend (UI)** (12-16h)

**Objetivo:** Criar telas de cadastro

**Atividades:**

1. Criar componentes de formulário
   - `FormProjeto.tsx`
   - `FormPesquisa.tsx`

2. Criar páginas
   - `app/(app)/projetos/page.tsx` (listagem)
   - `app/(app)/projetos/novo/page.tsx` (cadastro)
   - `app/(app)/projetos/[id]/page.tsx` (detalhes)
   - `app/(app)/projetos/[id]/editar/page.tsx` (edição)
   - `app/(app)/pesquisas/page.tsx` (listagem)
   - `app/(app)/pesquisas/novo/page.tsx` (cadastro)

3. Integrar com TRPC
4. Adicionar validações client-side
5. Adicionar feedback (toasts, loading states)

**Entregáveis:**

1. **app/(app)/projetos/**
2. **app/(app)/pesquisas/**
3. **components/forms/**

**Checkpoint:**

- [ ] Componentes criados
- [ ] Páginas criadas
- [ ] Integração TRPC funcionando
- [ ] Validações client-side OK

---

### **FASE 4: IMPORTAÇÃO** (0%)

#### **4.1. Discussão: Fluxo de Importação Completo** (8-12h)

**Objetivo:** Definir TODOS os detalhes do fluxo de importação

**Participantes:**

- Engenheiro de Dados
- Arquiteto da Informação
- Analista de Inteligência de Mercado
- Arquiteto de UI/Frontend

**Tópicos:**

1. **Upload de CSV**
   - Formatos aceitos: CSV, XLSX
   - Tamanho máximo: 10MB
   - Encoding: UTF-8, ISO-8859-1
   - Validação: headers, formato, tipos

2. **Seleção de Projeto e Pesquisa**
   - Usuário escolhe projeto existente
   - Usuário escolhe pesquisa existente
   - Ou cria novo projeto/pesquisa inline

3. **Mapeamento de Colunas**
   - Sistema detecta headers automaticamente
   - Usuário confirma mapeamento
   - Campos obrigatórios: nome, cidade, uf, status
   - Campos opcionais: cnpj, email, telefone, etc

4. **Validação de Dados**
   - Validar campos obrigatórios
   - Validar formato CNPJ
   - Validar formato email
   - Validar cidade (existe em dim_geografia)
   - Sugerir correções (Levenshtein distance)

5. **Deduplicação**
   - Gerar `entidade_hash`
   - Buscar entidade existente
   - Se CNPJ idêntico: merge automático
   - Se similaridade > 60%: perguntar ao usuário
   - Se similaridade < 60%: criar novo

6. **UI de Resolução de Conflitos**
   - Mostrar entidade do CSV vs entidade existente
   - Opções: usar existente, criar novo, atualizar existente, pular
   - Aplicar decisão em lote (se múltiplos conflitos)

7. **Criação de Contexto**
   - Inserir em `dim_entidade` (se novo)
   - Inserir em `fato_entidade_contexto` (entidade + projeto + pesquisa)
   - Mercado padrão: "NÃO CLASSIFICADO"
   - Geografia: buscar em `dim_geografia`

8. **Resumo da Importação**
   - Total de linhas processadas
   - Novos clientes criados
   - Clientes existentes vinculados
   - Registros pulados
   - Erros encontrados

**Entregáveis:**

1. **Documento de Fluxo de Importação** (MD)
   - Fluxograma completo (8 passos)
   - Regras de validação
   - Regras de deduplicação
   - Casos edge

2. **Documento de UI de Importação** (MD)
   - Wireframes de cada tela
   - Interações
   - Feedback ao usuário

3. **Documento de Regras de Negócio** (MD)
   - CNPJ único = entidade única
   - Merge > 60% sempre pergunta
   - Mercado padrão "NÃO CLASSIFICADO"

**Checkpoint:**

- [ ] Fluxo completo documentado
- [ ] UI aprovada
- [ ] Regras de negócio validadas

---

#### **4.2. Implementação Backend (Importação)** (16-24h)

**Objetivo:** Criar lógica de importação completa

**Atividades:**

1. Criar parser de CSV/XLSX
2. Criar validador de dados
3. Criar deduplicador
4. Criar resolvedor de conflitos
5. Criar criador de contexto
6. Criar router `importacao.ts`
   - `upload` (upload de arquivo)
   - `validate` (validar dados)
   - `preview` (preview de importação)
   - `execute` (executar importação)
   - `getStatus` (status da importação)
7. Adicionar testes unitários

**Entregáveis:**

1. **server/services/importacao/**
   - parser.ts
   - validator.ts
   - deduplicator.ts
   - resolver.ts
   - creator.ts
2. **server/routers/importacao.ts**
3. **server/routers/**tests**/**

**Checkpoint:**

- [ ] Parser criado e testado
- [ ] Validador criado e testado
- [ ] Deduplicador criado e testado
- [ ] Router criado e testado
- [ ] Testes 80%+ cobertura

---

#### **4.3. Implementação Frontend (UI de Importação)** (16-24h)

**Objetivo:** Criar UI de importação completa

**Atividades:**

1. Criar wizard de importação (multi-step)
   - Passo 1: Upload de arquivo
   - Passo 2: Seleção de projeto/pesquisa
   - Passo 3: Mapeamento de colunas
   - Passo 4: Validação de dados
   - Passo 5: Resolução de conflitos
   - Passo 6: Confirmação
   - Passo 7: Execução
   - Passo 8: Resumo

2. Criar componentes
   - `UploadCSV.tsx`
   - `SelecionarProjetoPesquisa.tsx`
   - `MapearColunas.tsx`
   - `ValidarDados.tsx`
   - `ResolverConflitos.tsx`
   - `ResumoImportacao.tsx`

3. Integrar com TRPC
4. Adicionar feedback (progress bar, toasts)

**Entregáveis:**

1. **app/(app)/importacao/page.tsx**
2. **components/importacao/**

**Checkpoint:**

- [ ] Wizard criado
- [ ] Todos os passos implementados
- [ ] Integração TRPC funcionando
- [ ] Feedback ao usuário OK

---

### **FASE 5: ENRIQUECIMENTO** (0%)

#### **5.1. Discussão: Processo de Enriquecimento** (12-16h)

**Objetivo:** Definir COMPLETAMENTE o processo de enriquecimento

**Participantes:**

- Analista de Inteligência de Mercado (líder)
- Engenheiro de Dados
- Arquiteto da Informação

**Tópicos:**

1. **O QUÊ enriquecer?**
   - Dados básicos: cidade, uf, geocodificação
   - Mercado: identificar, enriquecer
   - Produtos: identificar, vincular
   - Concorrentes: identificar, vincular
   - Leads: identificar, criar

2. **POR QUÊ enriquecer?**
   - Valor de cada dado
   - Custo de cada enriquecimento
   - Prioridade (crítico, importante, opcional)

3. **QUANDO enriquecer?**
   - Síncrono vs Assíncrono
   - Incremental vs Completo
   - Quando re-enriquecer (criar nova versão)
   - Ordem de enriquecimento (camadas)

4. **COMO enriquecer?**
   - Fontes: LLM, APIs, scraping, cache
   - Garantia de qualidade (validação cruzada)
   - Tratamento de falhas (retry, fallback)
   - Otimização de custo (cache, batch)

5. **Camadas de Enriquecimento**
   - Camada 1: Básico (obrigatório, síncrono, 5-10s)
   - Camada 2: Mercado (importante, assíncrono, 5-10min)
   - Camada 3: Produtos (importante, assíncrono, 10-20min)
   - Camada 4: Concorrentes (opcional, assíncrono, 30-60min)
   - Camada 5: Leads (opcional, sob demanda)

6. **Prompts de Enriquecimento**
   - Revisar prompts existentes
   - Otimizar para nova estrutura
   - Adicionar validação de output
   - Adicionar cache inteligente

**Entregáveis:**

1. **Documento de Processo de Enriquecimento** (MD)
   - Fluxograma completo
   - Camadas de enriquecimento
   - Regras de negócio
   - Casos edge

2. **Documento de Prompts** (MD)
   - Prompts otimizados
   - Exemplos de input/output
   - Validações

3. **Documento de Cache** (MD)
   - Estratégia de cache
   - TTL por tipo de dado
   - Invalidação de cache

**Checkpoint:**

- [ ] Processo completo documentado
- [ ] Camadas definidas
- [ ] Prompts otimizados
- [ ] Cache planejado

---

**NOTA:** Esta discussão é **CRÍTICA** e será feita **SEPARADAMENTE** após validação da importação.

---

### **FASE 6: VISUALIZAÇÃO E DRILL-DOWN** (0%)

#### **6.1. Discussão: UI de Visualização** (8-12h)

**Objetivo:** Definir UI de dashboards e drill-down

**Participantes:**

- Arquiteto de UI/Frontend (líder)
- Analista de Inteligência de Mercado
- Engenheiro de Dados

**Tópicos:**

1. **Dashboard Principal**
   - KPIs: total de clientes, leads, concorrentes
   - Gráficos: por mercado, por geografia, por status
   - Filtros: projeto, pesquisa, status

2. **Drill-Down de Setores**
   - Hierarquia: Categoria → Mercado → Entidades
   - Filtros: projeto, pesquisa, geografia
   - Métricas: total, qualidade média

3. **Drill-Down de Produtos**
   - Hierarquia: Categoria → Produto → Entidades
   - Filtros: projeto, pesquisa, mercado
   - Métricas: total, volume estimado

4. **Drill-Down de Geografia**
   - Hierarquia: Região → Estado → Cidade → Entidades
   - Mapa interativo
   - Filtros: projeto, pesquisa, mercado

**Entregáveis:**

1. **Documento de UI de Visualização** (MD)
   - Wireframes
   - Interações
   - Filtros

**Checkpoint:**

- [ ] UI aprovada
- [ ] Wireframes validados

---

**NOTA:** Esta discussão será feita **APÓS** importação e enriquecimento.

---

### **FASE 7: TESTES E VALIDAÇÃO** (0%)

#### **7.1. Testes Unitários** (12-16h)

**Objetivo:** Garantir qualidade do código

**Atividades:**

1. Testes de DAL (80%+ cobertura)
2. Testes de Routers (80%+ cobertura)
3. Testes de Helpers (90%+ cobertura)
4. Testes de Validações (90%+ cobertura)

**Checkpoint:**

- [ ] Cobertura 80%+
- [ ] Todos os testes passando

---

#### **7.2. Testes de Integração** (8-12h)

**Objetivo:** Garantir fluxos end-to-end

**Atividades:**

1. Teste de importação completa
2. Teste de enriquecimento completo
3. Teste de drill-down completo

**Checkpoint:**

- [ ] Fluxos end-to-end funcionando
- [ ] Performance aceitável

---

#### **7.3. Testes de Performance** (8-12h)

**Objetivo:** Garantir escalabilidade

**Atividades:**

1. Teste de carga (1000 clientes)
2. Teste de carga (10000 clientes)
3. Teste de queries (< 100ms)

**Checkpoint:**

- [ ] Performance aceitável
- [ ] Escalabilidade validada

---

### **FASE 8: DOCUMENTAÇÃO E DEPLOY** (0%)

#### **8.1. Documentação Técnica** (8-12h)

**Objetivo:** Documentar sistema completo

**Entregáveis:**

1. README.md (visão geral)
2. ARCHITECTURE.md (arquitetura)
3. DATABASE.md (modelo de dados)
4. API.md (endpoints)
5. DEPLOYMENT.md (deploy)

**Checkpoint:**

- [ ] Documentação completa
- [ ] Revisada e aprovada

---

#### **8.2. Deploy Final** (4-6h)

**Objetivo:** Colocar em produção

**Atividades:**

1. Criar checkpoint final
2. Testar em produção
3. Monitorar logs
4. Validar funcionamento

**Checkpoint:**

- [ ] Deploy realizado
- [ ] Sistema funcionando
- [ ] Monitoramento ativo

---

## 📊 RESUMO DE TEMPO ESTIMADO

| Fase                          | Tempo        | Status                   |
| ----------------------------- | ------------ | ------------------------ |
| FASE 0: Fundação (Revisão)    | 8-12h        | ⚠️ 70% (precisa revisão) |
| FASE 1: Modelo de Dados       | 24-36h       | ⏳ 0%                    |
| FASE 2: Camada de Dados (DAL) | 16-22h       | ⏳ 0%                    |
| FASE 3: Cadastros             | 26-36h       | ⏳ 0%                    |
| FASE 4: Importação            | 40-60h       | ⏳ 0%                    |
| FASE 5: Enriquecimento        | 40-60h       | ⏳ 0%                    |
| FASE 6: Visualização          | 24-36h       | ⏳ 0%                    |
| FASE 7: Testes                | 28-40h       | ⏳ 0%                    |
| FASE 8: Documentação e Deploy | 12-18h       | ⏳ 0%                    |
| **TOTAL**                     | **218-320h** | **3%**                   |

**Tempo real estimado:** 27-40 dias úteis (8h/dia)

---

## 🎯 CHECKPOINTS DE SEGURANÇA

### **Checkpoint 1: Modelo de Dados Validado**

- [ ] Modelo dimensional aprovado
- [ ] Diagrama ER aprovado
- [ ] Regras de negócio documentadas
- [ ] Migration executada com sucesso

### **Checkpoint 2: DAL Completa**

- [ ] Helpers criados e testados
- [ ] DALs criados e testados
- [ ] Cobertura de testes 80%+

### **Checkpoint 3: Cadastros Funcionando**

- [ ] UI de cadastros aprovada
- [ ] Routers criados e testados
- [ ] Integração TRPC funcionando

### **Checkpoint 4: Importação Funcionando**

- [ ] Fluxo de importação completo
- [ ] Deduplicação funcionando
- [ ] UI de resolução de conflitos aprovada

### **Checkpoint 5: Enriquecimento Funcionando**

- [ ] Processo de enriquecimento definido
- [ ] Prompts otimizados
- [ ] Cache implementado

### **Checkpoint 6: Visualização Funcionando**

- [ ] Dashboards criados
- [ ] Drill-down funcionando
- [ ] Performance aceitável

### **Checkpoint 7: Testes Completos**

- [ ] Testes unitários 80%+
- [ ] Testes de integração passando
- [ ] Testes de performance OK

### **Checkpoint 8: Deploy Realizado**

- [ ] Sistema em produção
- [ ] Documentação completa
- [ ] Monitoramento ativo

---

## 🔄 REVISÃO DO QUE JÁ FOI FEITO

### **O que precisa ser REVISADO:**

#### **1. Banco de Dados (FASE 0.1)**

- ⚠️ Substituir `fato_entidades` por `fato_entidade_contexto`
- ⚠️ Adicionar campos de auditoria (TODAS as tabelas)
- ⚠️ Adicionar campos de origem (dim_entidade)
- ⚠️ Adicionar campos de filiais/lojas (dim_entidade)
- ⚠️ Criar mercado padrão "NÃO CLASSIFICADO"

#### **2. Schema Drizzle (FASE 0.2)**

- ⚠️ Atualizar para usar `fato_entidade_contexto`
- ⚠️ Adicionar campos de auditoria
- ⚠️ Adicionar campos de origem
- ⚠️ Adicionar campos de filiais/lojas

#### **3. DAL (FASE 0.3)**

- ⚠️ Atualizar para usar `fato_entidade_contexto`
- ⚠️ Adicionar helpers de auditoria
- ⚠️ Adicionar helpers de origem

### **O que está CORRETO e pode ser mantido:**

- ✅ Limpeza do banco (0 registros)
- ✅ Estrutura de 7 dimensões (conceito)
- ✅ Índices básicos (serão expandidos)
- ✅ Foreign Keys básicas (serão expandidas)

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### **Passo 1: Validar Plano Mestre**

- [ ] Você aprova este plano?
- [ ] Alguma fase precisa ser ajustada?
- [ ] Alguma discussão precisa ser adicionada?

### **Passo 2: Iniciar FASE 1.1**

- [ ] Discussão: Modelo Dimensional Final
- [ ] Criar documento completo
- [ ] Criar diagrama ER
- [ ] Validar com você

### **Passo 3: Executar FASE 1.2 e 1.3**

- [ ] Revisar modelo existente
- [ ] Identificar gaps
- [ ] Criar migration
- [ ] Executar migration

---

## ❓ PERGUNTAS FINAIS

1. **Você aprova este Plano Mestre?**
2. **Alguma fase precisa ser mais detalhada?**
3. **Alguma discussão precisa ser adicionada?**
4. **Posso começar a FASE 1.1 (Discussão: Modelo Dimensional Final)?**

---

**Este é um plano ASSISTIDO e ESTRUTURADO para garantir o melhor resultado.**

**Aguardo sua aprovação para começar! 🚀**
