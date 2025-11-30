# Relatório de Limpeza da Base de Dados

**Autor:** Manus AI  
**Data:** 30 de novembro de 2024  
**Projeto:** Intelmarket (TechFilms)  
**Objetivo:** Preparar base para implementação do Sistema de Enriquecimento V2

---

## Sumário Executivo

Este relatório apresenta uma análise completa da base de dados do projeto Intelmarket, identificando todos os registros que devem ser mantidos e apagados para preparar a implementação do Sistema de Enriquecimento V2. A varredura incluiu análise de código-fonte, mapeamento de relacionamentos entre tabelas e identificação de todas as operações que geram registros no banco de dados.

**Situação Atual:**

A base de dados contém 18.293 registros distribuídos em entidades enriquecidas (leads, concorrentes, produtos, mercados), tabelas auxiliares (relacionamentos, jobs, runs) e dados de analytics. Todos estes registros foram gerados pelo sistema atual, que apresenta gaps críticos de qualidade (94,5% de CNPJs inventados, 0% de mercados enriquecidos, 88,48% de clientes sem localização).

**Decisão de Limpeza:**

Para garantir implementação limpa do Sistema V2 e evitar conflitos entre dados antigos e novos, recomenda-se apagar todos os 18.293 registros de entidades enriquecidas, mantendo apenas os 807 clientes da pesquisa Base Inicial. Esta abordagem elimina dados de baixa qualidade, evita duplicação e permite fresh start com arquitetura correta.

**Segurança:**

O script de limpeza foi desenvolvido com múltiplas camadas de validação, execução em transação única (rollback automático em caso de erro) e verificações pré e pós-limpeza. Os 807 clientes são preservados integralmente, e backup automático do Supabase permite restauração via Point-in-Time Recovery se necessário.

**Recomendação:** Aprovação para execução do script de limpeza em horário de baixo uso, seguida de validação da aplicação e início da Fase 1 do rollout do Sistema V2.

---

## 1. Varredura Completa da Base

### 1.1 Metodologia da Varredura

A varredura foi executada em três etapas complementares para garantir identificação completa de todos os registros e relacionamentos.

**Etapa 1: Análise de Estrutura**

Foram consultadas 53 tabelas no schema público do Supabase através de `information_schema.tables`. As tabelas foram categorizadas em quatro grupos: entidades de negócio (clientes, leads, concorrentes, produtos, mercados), tabelas auxiliares (relacionamentos, jobs, cache), tabelas de sistema (users, projects, pesquisas, settings) e tabelas de analytics (métricas agregadas, timeline, dimensões).

**Etapa 2: Análise de Código-Fonte**

Foram analisados 48 pontos de inserção de dados no código TypeScript através de busca por padrões `INSERT INTO`, `.insert(` e `.create(`. Os arquivos críticos identificados incluem `/app/api/enrichment/process/route.ts` (processo principal de enriquecimento), `/server/db.ts` (funções de CRUD), `/server/analyticsAggregation.ts` (agregação de métricas) e `/server/routers/*.ts` (endpoints tRPC).

**Etapa 3: Contagem de Registros**

Foram executadas consultas SQL diretas no Supabase para contar registros em todas as tabelas relevantes, filtrando por `projectId = 1` e `pesquisaId = 1` para identificar dados do projeto TechFilms e pesquisa Base Inicial.

### 1.2 Projeto e Pesquisa Alvo

A varredura confirmou a existência e integridade do projeto e pesquisa que devem ser preservados.

**Projeto TechFilms:**

- ID: 1
- Nome: TechFilms
- Status: ativo
- Pesquisas: 1 (Base Inicial)

**Pesquisa Base Inicial:**

- ID: 1
- Nome: Base Inicial
- Project ID: 1
- Clientes: 807
- Status: enriquecido (será resetado para "rascunho" após limpeza)

### 1.3 Registros Existentes por Tabela

A tabela a seguir apresenta contagem completa de registros em todas as tabelas relevantes, categorizadas por tipo e ação recomendada.

| Categoria      | Tabela              | Total | Base Inicial | Outros | Ação              |
| -------------- | ------------------- | ----- | ------------ | ------ | ----------------- |
| **Entidades**  | clientes            | 807   | 807          | 0      | ✅ MANTER         |
|                | leads               | 5.226 | 5.226        | 0      | ❌ APAGAR         |
|                | concorrentes        | 8.710 | 8.710        | 0      | ❌ APAGAR         |
|                | produtos            | 2.613 | 2.613        | 0      | ❌ APAGAR         |
|                | mercados_unicos     | 870   | 870          | 0      | ❌ APAGAR         |
| **Auxiliares** | clientes_mercados   | 871   | -            | -      | ❌ APAGAR         |
|                | enrichment_jobs     | 1     | -            | -      | ❌ APAGAR         |
|                | enrichment_runs     | 2     | -            | -      | ❌ APAGAR         |
|                | enrichment_queue    | 0     | -            | -      | ✅ Já vazia       |
|                | enrichment_cache    | 0     | -            | -      | ✅ Já vazia       |
|                | geocoding_jobs      | 0     | -            | -      | ✅ Já vazia       |
| **Analytics**  | analytics_mercados  | 0     | 0            | 0      | ✅ Já vazia       |
|                | analytics_pesquisas | 0     | 0            | 0      | ✅ Já vazia       |
|                | analytics_dimensoes | 0     | 0            | 0      | ✅ Já vazia       |
|                | analytics_timeline  | 0     | 0            | 0      | ✅ Já vazia       |
| **Tags**       | entity_tags         | 4     | 2            | 2      | ⚠️ LIMPAR ÓRFÃS   |
|                | tags                | 6     | -            | -      | ⚠️ LIMPAR SEM USO |
| **Sistema**    | projects            | 1     | -            | -      | ✅ MANTER         |
|                | pesquisas           | 1     | -            | -      | ✅ MANTER         |
|                | users               | -     | -            | -      | ✅ MANTER         |
|                | system_settings     | -     | -            | -      | ✅ MANTER         |
|                | notifications       | 1     | -            | -      | ✅ MANTER         |
|                | audit_logs          | 1     | -            | -      | ✅ MANTER         |
|                | project_audit_log   | 8     | 0            | 8      | ✅ MANTER         |

**Total de registros a apagar:** 18.293

**Detalhamento:**

- Entidades enriquecidas: 17.419 (leads + concorrentes + produtos + mercados)
- Auxiliares: 874 (clientes_mercados + jobs + runs)
- Tags órfãs: ~2 (entity_tags sem cliente válido)

---

## 2. Análise de Dependências e Relacionamentos

### 2.1 Mapeamento de Foreign Keys

O mapeamento de foreign keys é crítico para determinar a ordem segura de execução dos DELETEs, evitando violação de constraints.

**Relacionamentos Identificados:**

**clientes (tabela principal)**

- ← produtos.clienteId (FK para clientes.id)
- ← leads.clienteId (FK para clientes.id, se existir)
- ← concorrentes.clienteId (FK para clientes.id, se existir)
- ← entity_tags.entityId (quando entityType = 'cliente')
- ← clientes_mercados.clienteId (FK para clientes.id)

**mercados_unicos**

- ← concorrentes.mercadoId (FK para mercados_unicos.id)
- ← leads.mercadoId (FK para mercados_unicos.id)
- ← clientes_mercados.mercadoId (FK para mercados_unicos.id)
- ← analytics_mercados.mercadoId (FK para mercados_unicos.id)

**pesquisas**

- ← clientes.pesquisaId (FK para pesquisas.id)
- ← leads.pesquisaId (FK para pesquisas.id)
- ← concorrentes.pesquisaId (FK para pesquisas.id)
- ← produtos.pesquisaId (FK para pesquisas.id)
- ← mercados_unicos.pesquisaId (FK para pesquisas.id)

**tags**

- ← entity_tags.tagId (FK para tags.id)

### 2.2 Ordem Segura de Execução

Para evitar violação de constraints, a ordem DEVE ser:

**Fase 1: Tabelas auxiliares sem dependências**

1. clientes_mercados (relacionamento N:N)
2. enrichment_jobs (sem FK)
3. enrichment_runs (sem FK)
4. enrichment_queue (sem FK)
5. enrichment_cache (sem FK)

**Fase 2: Entidades com FK para clientes/mercados** 6. produtos (depende de clientes) 7. leads (depende de clientes e mercados) 8. concorrentes (depende de clientes e mercados) 9. mercados_unicos (após leads e concorrentes)

**Fase 3: Tags órfãs** 10. entity_tags (onde entityId não existe mais) 11. tags (sem nenhuma entity_tag associada)

**Fase 4: Analytics (dados calculados)** 12. analytics_mercados 13. analytics_pesquisas 14. analytics_dimensoes 15. analytics_timeline

### 2.3 Análise de Impacto por Processo

A análise de código-fonte identificou todos os processos que geram registros e como serão afetados pela limpeza.

**Processo de Enriquecimento (`/app/api/enrichment/process/route.ts`)**

Este é o processo principal que gera entidades enriquecidas. O fluxo atual é:

1. Buscar clientes não enriquecidos da pesquisa
2. Para cada cliente, chamar OpenAI
3. Atualizar cliente com dados enriquecidos
4. Inserir mercados (`INSERT INTO mercados_unicos`)
5. Inserir concorrentes (`INSERT INTO concorrentes`)
6. Inserir leads (`INSERT INTO leads`)
7. Atualizar job com progresso
8. Atualizar pesquisa com status "enriquecido"

**Impacto da Limpeza:**

Todos os registros gerados nas etapas 4, 5 e 6 serão apagados. Os clientes (etapa 3) serão preservados, mas seus campos enriquecidos serão mantidos (nome, CNPJ, site, cidade, UF, setor, descrição). O Sistema V2 irá re-enriquecer estes clientes com qualidade superior.

**Agregação de Analytics (`/server/analyticsAggregation.ts`)**

Este processo executa diariamente via cron job e gera métricas agregadas:

1. `aggregateMercadoMetrics()` → `INSERT INTO analytics_mercados`
2. `aggregatePesquisaMetrics()` → `INSERT INTO analytics_pesquisas`
3. `aggregateDimensaoMetrics()` → `INSERT INTO analytics_dimensoes`
4. `aggregateTimelineMetrics()` → `INSERT INTO analytics_timeline`

**Impacto da Limpeza:**

Todas as tabelas de analytics estão atualmente vazias (0 registros), portanto não há impacto direto. Após implementação do V2, o cron job irá gerar novas métricas baseadas nos dados de alta qualidade.

**Gestão de Tags (`/server/db.ts`)**

Funções `createTag()` e `addTagToEntity()` permitem usuários criarem tags e associarem a entidades (clientes, leads, concorrentes).

**Impacto da Limpeza:**

Das 4 entity_tags existentes, 2 referenciam clientes da pesquisa Base Inicial (IDs 2205 e 2407) e serão preservadas. As outras 2 referenciam clientes inexistentes (IDs 1755 e 2) e serão apagadas. Das 6 tags existentes, apenas aquelas com associações válidas serão mantidas.

**Auditoria e Logs (`/server/utils/auditLog.ts`)**

Funções `logEnrichmentStarted()`, `logEnrichmentCompleted()` e `logEnrichmentFailed()` registram eventos de auditoria.

**Impacto da Limpeza:**

Logs de auditoria (`audit_logs` e `project_audit_log`) serão preservados integralmente, pois são dados de sistema e não de negócio. Isto permite rastreabilidade histórica mesmo após limpeza.

---

## 3. Estratégia de Limpeza

### 3.1 Princípios de Segurança

A estratégia de limpeza foi desenvolvida com cinco princípios fundamentais de segurança.

**Princípio 1: Transação Única**

Todo o script executa em uma única transação SQL (`BEGIN ... COMMIT`). Se qualquer comando falhar, a transação inteira é revertida automaticamente (`ROLLBACK`), garantindo que a base não fique em estado inconsistente.

**Princípio 2: Validações Pré-Execução**

Antes de apagar qualquer registro, o script valida que o projeto TechFilms (ID: 1) existe, a pesquisa Base Inicial (ID: 1) existe e exatamente 807 clientes estão presentes. Se qualquer validação falhar, o script aborta com `RAISE EXCEPTION`.

**Princípio 3: Contagem e Logging**

Cada fase do script registra quantos registros foram apagados através de `RAISE NOTICE`, permitindo auditoria completa da execução. As contagens pré e pós-limpeza são comparadas para garantir consistência.

**Princípio 4: Validações Pós-Execução**

Após todos os DELETEs, o script valida que os 807 clientes estão intactos e que todas as entidades enriquecidas foram completamente apagadas (0 registros). Se qualquer validação falhar, a transação é revertida.

**Princípio 5: Backup Automático**

O Supabase mantém backups automáticos com Point-in-Time Recovery (últimos 7 dias) e snapshots diários (últimos 30 dias). Em caso de problema não detectado pelas validações, é possível restaurar a base para qualquer momento anterior.

### 3.2 Fases de Execução

O script está organizado em nove fases sequenciais para máxima clareza e segurança.

**Fase 1: Validações de Segurança**

Valida existência do projeto TechFilms, pesquisa Base Inicial e exatos 807 clientes. Aborta com erro se qualquer validação falhar.

**Fase 2: Contagem Pré-Limpeza**

Conta e registra em log a quantidade de registros em cada tabela antes da limpeza. Isto permite comparação com contagem pós-limpeza e auditoria completa.

**Fase 3: Limpeza de Tabelas Auxiliares**

Apaga registros de tabelas sem foreign keys (clientes_mercados, enrichment_jobs, enrichment_runs, enrichment_queue, enrichment_cache). Estas tabelas podem ser limpas primeiro sem risco de violação de constraints.

**Fase 4: Limpeza de Entidades Enriquecidas**

Apaga produtos, leads, concorrentes e mercados_unicos, nesta ordem específica para respeitar foreign keys. Todos os DELETEs filtram por `pesquisaId = 1` para garantir que apenas dados da pesquisa Base Inicial sejam afetados.

**Fase 5: Limpeza de Tags Órfãs**

Apaga entity_tags que referenciam clientes inexistentes ou de outras pesquisas, e tags que não possuem mais nenhuma associação.

**Fase 6: Limpeza de Analytics**

Apaga dados calculados de analytics_mercados, analytics_pesquisas, analytics_dimensoes e analytics_timeline. Estes dados serão regenerados automaticamente pelo cron job após implementação do V2.

**Fase 7: Reset de Status da Pesquisa**

Atualiza a pesquisa Base Inicial para status "rascunho" e zera o contador de clientes enriquecidos, preparando-a para re-enriquecimento pelo Sistema V2.

**Fase 8: Validações Pós-Limpeza**

Valida que os 807 clientes estão intactos e que todas as entidades enriquecidas foram completamente apagadas. Aborta com erro se qualquer validação falhar.

**Fase 9: Commit da Transação**

Se todas as validações passarem, a transação é commitada e as mudanças são persistidas permanentemente.

### 3.3 Tratamento de Casos Edge

Três casos edge foram identificados e tratados no script.

**Caso 1: Entity Tags Órfãs**

Existem 4 entity_tags na base, mas 2 delas referenciam clientes que não existem (IDs 1755 e 2). O script identifica e apaga apenas estas tags órfãs, preservando as 2 tags válidas que referenciam clientes da pesquisa Base Inicial.

**Caso 2: Tags Sem Associação**

Após apagar entity_tags órfãs, algumas tags podem ficar sem nenhuma associação. O script identifica e apaga estas tags automaticamente através de `WHERE id NOT IN (SELECT DISTINCT tagId FROM entity_tags)`.

**Caso 3: Analytics Já Vazias**

As 4 tabelas de analytics estão atualmente vazias (0 registros). O script executa DELETE mesmo assim para garantir consistência, mas nenhum registro será afetado.

---

## 4. Script SQL de Limpeza

### 4.1 Estrutura do Script

O script completo possui 300+ linhas de código SQL com comentários detalhados, validações e logging. A estrutura é:

```
BEGIN;                                    -- Iniciar transação

-- FASE 1: Validações de Segurança
DO $$ ... END $$;                        -- Validar projeto, pesquisa, clientes

-- FASE 2: Contagem Pré-Limpeza
DO $$ ... END $$;                        -- Contar registros antes

-- FASE 3: Limpeza de Tabelas Auxiliares
DELETE FROM clientes_mercados;
DELETE FROM enrichment_jobs;
DELETE FROM enrichment_runs;
DELETE FROM enrichment_queue;
DELETE FROM enrichment_cache;

-- FASE 4: Limpeza de Entidades Enriquecidas
DELETE FROM produtos WHERE "pesquisaId" = 1;
DELETE FROM leads WHERE "pesquisaId" = 1;
DELETE FROM concorrentes WHERE "pesquisaId" = 1;
DELETE FROM mercados_unicos WHERE "pesquisaId" = 1;

-- FASE 5: Limpeza de Tags Órfãs
DELETE FROM entity_tags WHERE ...;
DELETE FROM tags WHERE ...;

-- FASE 6: Limpeza de Analytics
DELETE FROM analytics_mercados WHERE ...;
DELETE FROM analytics_pesquisas WHERE ...;
DELETE FROM analytics_dimensoes WHERE ...;
DELETE FROM analytics_timeline WHERE ...;

-- FASE 7: Reset de Status da Pesquisa
UPDATE pesquisas SET status = 'rascunho', ... WHERE id = 1;

-- FASE 8: Validações Pós-Limpeza
DO $$ ... END $$;                        -- Validar clientes intactos

COMMIT;                                   -- Commit da transação
```

### 4.2 Exemplo de Validação

Cada fase de validação utiliza blocos PL/pgSQL para executar verificações complexas:

```sql
DO $$
DECLARE
    v_clientes_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_clientes_count
    FROM clientes
    WHERE "pesquisaId" = 1;

    IF v_clientes_count != 807 THEN
        RAISE EXCEPTION 'ERRO: Esperado 807 clientes, encontrado %', v_clientes_count;
    END IF;

    RAISE NOTICE '✅ Clientes: % (intactos)', v_clientes_count;
END $$;
```

### 4.3 Exemplo de Limpeza com Filtro

Todos os DELETEs de entidades enriquecidas filtram explicitamente por `pesquisaId = 1`:

```sql
DELETE FROM leads WHERE "pesquisaId" = 1;
DELETE FROM concorrentes WHERE "pesquisaId" = 1;
DELETE FROM produtos WHERE "pesquisaId" = 1;
DELETE FROM mercados_unicos WHERE "pesquisaId" = 1;
```

Isto garante que, se houver outras pesquisas no futuro, seus dados não serão afetados.

---

## 5. Análise de Impacto

### 5.1 Impacto na Aplicação

A limpeza terá impacto mínimo na aplicação em produção, pois apenas dados de negócio são afetados, não estrutura ou configurações.

**Funcionalidades NÃO Afetadas:**

- Login e autenticação (tabela `users` preservada)
- Gestão de projetos (tabela `projects` preservada)
- Gestão de pesquisas (tabela `pesquisas` preservada)
- Listagem de clientes (807 clientes preservados)
- Configurações do sistema (tabela `system_settings` preservada)
- Notificações (tabela `notifications` preservada)
- Auditoria (tabelas `audit_logs` e `project_audit_log` preservadas)

**Funcionalidades Temporariamente Afetadas:**

- **Listagem de leads:** Retornará lista vazia (0 registros) até re-enriquecimento
- **Listagem de concorrentes:** Retornará lista vazia (0 registros) até re-enriquecimento
- **Listagem de produtos:** Retornará lista vazia (0 registros) até re-enriquecimento
- **Listagem de mercados:** Retornará lista vazia (0 registros) até re-enriquecimento
- **Dashboard de analytics:** Retornará métricas zeradas até agregação diária

**Tempo de Indisponibilidade:**

A execução do script levará aproximadamente 5-10 segundos. Durante este período, a aplicação continuará funcionando normalmente, mas queries que buscam entidades enriquecidas retornarão resultados vazios. Não há necessidade de colocar a aplicação em modo de manutenção.

### 5.2 Impacto nos Dados

A tabela a seguir resume o impacto quantitativo da limpeza em cada categoria de dados.

| Categoria           | Antes | Depois | Impacto                      |
| ------------------- | ----- | ------ | ---------------------------- |
| **Clientes**        | 807   | 807    | ✅ Preservados (0% de perda) |
| **Leads**           | 5.226 | 0      | ❌ 100% apagados             |
| **Concorrentes**    | 8.710 | 0      | ❌ 100% apagados             |
| **Produtos**        | 2.613 | 0      | ❌ 100% apagados             |
| **Mercados**        | 870   | 0      | ❌ 100% apagados             |
| **Relacionamentos** | 871   | 0      | ❌ 100% apagados             |
| **Jobs/Runs**       | 3     | 0      | ❌ 100% apagados             |
| **Tags Válidas**    | 2     | 2      | ✅ Preservadas               |
| **Tags Órfãs**      | 2     | 0      | ❌ 100% apagadas             |
| **Analytics**       | 0     | 0      | ✅ Já vazias                 |
| **Sistema**         | -     | -      | ✅ 100% preservado           |

**Total de registros apagados:** 18.293  
**Total de registros preservados:** 809 (807 clientes + 2 tags)

### 5.3 Benefícios da Limpeza

A limpeza oferece cinco benefícios principais que justificam a perda temporária de dados.

**Benefício 1: Eliminação de Dados de Baixa Qualidade**

Os 18.293 registros a serem apagados possuem gaps críticos de qualidade (94,5% de CNPJs inventados, 0% de mercados enriquecidos, 88,48% sem localização). Mantê-los na base compromete a confiabilidade do sistema e dificulta análises.

**Benefício 2: Evita Conflitos e Duplicação**

O Sistema V2 possui estrutura de dados e regras diferentes do sistema atual (sempre 3 produtos, 5 concorrentes, 5 leads). Manter dados antigos criaria inconsistência e confusão entre registros gerados pelo sistema atual vs V2.

**Benefício 3: Fresh Start com Arquitetura Correta**

A limpeza permite que o Sistema V2 comece do zero com arquitetura correta, ciclo fechado de inteligência e dados honestos (sem invenção). Isto garante que 100% dos dados na base terão qualidade superior (score 100%).

**Benefício 4: Facilita Validação e Testes**

Com a base limpa, é fácil validar que o Sistema V2 está funcionando corretamente. Qualquer lead, concorrente ou produto na base após implementação foi gerado pelo V2, eliminando ambiguidade.

**Benefício 5: Reduz Tamanho da Base**

Apagar 18.293 registros reduz significativamente o tamanho da base de dados, melhorando performance de queries e reduzindo custos de armazenamento.

---

## 6. Plano de Execução

### 6.1 Pré-Requisitos

Antes de executar o script de limpeza, três pré-requisitos devem ser cumpridos.

**Pré-Requisito 1: Backup Manual**

Exportar backup completo da base de dados através do Supabase Dashboard (Settings → Database → Backups → Create Backup). Embora o Supabase mantenha backups automáticos, um backup manual adicional oferece camada extra de segurança.

**Pré-Requisito 2: Notificação da Equipe**

Avisar toda a equipe sobre a manutenção programada, incluindo horário de início, duração estimada (5-10 segundos) e impacto esperado (listas de leads/concorrentes/produtos vazias temporariamente).

**Pré-Requisito 3: Acesso ao Supabase Dashboard**

Garantir que pelo menos dois membros da equipe tenham acesso ao Supabase Dashboard durante a execução, para monitorar logs em tempo real e executar rollback manual se necessário.

### 6.2 Horário Recomendado

A execução deve ocorrer em horário de baixo uso para minimizar impacto em usuários ativos.

**Opções Recomendadas:**

- **Madrugada (02:00-04:00 BRT):** Menor probabilidade de usuários ativos
- **Fim de semana (Sábado 08:00-10:00 BRT):** Baixo uso corporativo
- **Horário de almoço (12:00-13:00 BRT):** Janela curta mas aceitável

**Duração Estimada:** 5-10 segundos de execução + 5 minutos de validação pós-execução.

### 6.3 Procedimento de Execução

O procedimento de execução consiste em sete passos sequenciais.

**Passo 1: Criar Backup Manual**

Acessar Supabase Dashboard → Settings → Database → Backups → Create Backup. Aguardar confirmação de que backup foi criado com sucesso.

**Passo 2: Abrir SQL Editor**

Acessar Supabase Dashboard → SQL Editor → New Query. Copiar conteúdo completo do arquivo `script_limpeza_base.sql`.

**Passo 3: Revisar Script**

Ler atentamente o script, verificando que todos os filtros `WHERE "pesquisaId" = 1` estão presentes e que nenhuma linha foi modificada acidentalmente.

**Passo 4: Executar Script**

Clicar em "Run" no SQL Editor. Monitorar output em tempo real, observando mensagens de `RAISE NOTICE` que indicam progresso de cada fase.

**Passo 5: Verificar Resultado**

Confirmar que a última mensagem é "✅✅✅ LIMPEZA CONCLUÍDA COM SUCESSO! ✅✅✅". Se houver erro, a transação será revertida automaticamente e nenhuma mudança será persistida.

**Passo 6: Validar Aplicação**

Abrir a aplicação web e verificar que funcionalidades básicas continuam funcionando (login, listagem de clientes, navegação). Confirmar que listas de leads/concorrentes/produtos estão vazias conforme esperado.

**Passo 7: Registrar Execução**

Documentar em log interno: data/hora de execução, usuário responsável, resultado (sucesso/falha), tempo de execução e observações.

### 6.4 Plano de Rollback

Se algo der errado durante ou após a execução, três opções de rollback estão disponíveis.

**Opção 1: Rollback Automático (Durante Execução)**

Se qualquer validação falhar durante a execução do script, a transação será revertida automaticamente através de `RAISE EXCEPTION`. Nenhuma mudança será persistida e a base permanecerá no estado original.

**Opção 2: Point-in-Time Recovery (Até 7 Dias)**

Se um problema for detectado após a execução (até 7 dias depois), é possível restaurar a base para qualquer timestamp específico através do Supabase Dashboard (Settings → Database → Backups → Point-in-Time Recovery). Selecionar timestamp imediatamente anterior à execução do script.

**Opção 3: Restore de Backup Manual**

Se o backup manual foi criado no Passo 1, é possível restaurá-lo através do Supabase Dashboard (Settings → Database → Backups → Restore). Esta opção restaura a base exatamente para o estado do backup.

**Tempo de Rollback:** 5-10 minutos para Point-in-Time Recovery, 10-20 minutos para restore de backup manual.

---

## 7. Validações Pós-Limpeza

### 7.1 Validações Automáticas

O script executa validações automáticas na Fase 8, mas validações manuais adicionais são recomendadas.

**Validação Automática 1: Clientes Intactos**

```sql
SELECT COUNT(*) FROM clientes WHERE "pesquisaId" = 1;
-- Esperado: 807
```

**Validação Automática 2: Entidades Apagadas**

```sql
SELECT COUNT(*) FROM leads WHERE "pesquisaId" = 1;
SELECT COUNT(*) FROM concorrentes WHERE "pesquisaId" = 1;
SELECT COUNT(*) FROM produtos WHERE "pesquisaId" = 1;
SELECT COUNT(*) FROM mercados_unicos WHERE "pesquisaId" = 1;
-- Esperado: 0 para todas
```

### 7.2 Validações Manuais Recomendadas

Após execução do script, executar as seguintes validações manuais através do SQL Editor.

**Validação Manual 1: Integridade dos Clientes**

```sql
SELECT
    COUNT(*) as total,
    COUNT(nome) as com_nome,
    COUNT(cnpj) as com_cnpj,
    COUNT(cidade) as com_cidade,
    COUNT(uf) as com_uf
FROM clientes
WHERE "pesquisaId" = 1;
```

Esperado: 807 clientes com nome, CNPJ, cidade e UF preservados.

**Validação Manual 2: Status da Pesquisa**

```sql
SELECT id, nome, status, "clientesEnriquecidos"
FROM pesquisas
WHERE id = 1;
```

Esperado: status = 'rascunho', clientesEnriquecidos = 0.

**Validação Manual 3: Tags Válidas**

```sql
SELECT et.id, et."entityId", c.nome as cliente_nome, t.name as tag_name
FROM entity_tags et
LEFT JOIN clientes c ON et."entityId" = c.id AND et."entityType" = 'cliente'
LEFT JOIN tags t ON et."tagId" = t.id
WHERE c."pesquisaId" = 1;
```

Esperado: 2 entity_tags válidas (IDs 30002 e 30003) referenciando clientes da pesquisa Base Inicial.

**Validação Manual 4: Tabelas Auxiliares Vazias**

```sql
SELECT COUNT(*) FROM clientes_mercados;
SELECT COUNT(*) FROM enrichment_jobs;
SELECT COUNT(*) FROM enrichment_runs;
```

Esperado: 0 para todas.

### 7.3 Testes de Funcionalidade

Além das validações SQL, testar funcionalidades críticas da aplicação.

**Teste 1: Listagem de Clientes**

Acessar página de listagem de clientes e confirmar que 807 clientes são exibidos corretamente com nome, CNPJ, cidade e UF.

**Teste 2: Detalhes do Cliente**

Abrir detalhes de um cliente aleatório e confirmar que campos básicos (nome, CNPJ, site, localização, setor, descrição) estão preservados.

**Teste 3: Listas Vazias**

Confirmar que listas de leads, concorrentes, produtos e mercados estão vazias (0 registros) conforme esperado.

**Teste 4: Criação de Novo Enriquecimento**

Tentar iniciar novo job de enriquecimento e confirmar que o sistema permite criar job sem erros (não é necessário executar, apenas validar criação).

---

## 8. Próximos Passos

### 8.1 Após Limpeza Bem-Sucedida

Se a limpeza for executada com sucesso e todas as validações passarem, seguir os próximos passos.

**Passo 1: Documentar Execução**

Registrar em documento interno: data/hora de execução, resultado das validações, tempo total, observações e responsável pela execução.

**Passo 2: Comunicar Equipe**

Notificar equipe de que limpeza foi concluída com sucesso e que base está pronta para implementação do Sistema V2.

**Passo 3: Iniciar Fase 1 do Rollout V2**

Executar Fase 1 do plano de rollout do Sistema V2: processar 50 clientes aleatórios com Sistema V2 completo (8 fases incluindo geocodificação e gravação).

**Passo 4: Validar Qualidade V2**

Após Fase 1, validar que score médio ≥ 90%, localização 100% completa, mercados 100% enriquecidos e ciclo fechado funcionando (taxa de aproveitamento 50-70%).

**Passo 5: Continuar Rollout**

Se Fase 1 for bem-sucedida, continuar com Fase 2 (200 clientes) e Fase 3 (557 clientes restantes) conforme plano de rollout.

### 8.2 Monitoramento Contínuo

Após implementação do Sistema V2, monitorar continuamente as seguintes métricas.

**Métricas de Qualidade (diárias):**

- Score médio de enriquecimento (meta: ≥ 90%)
- Taxa de rejeição por score < 70% (meta: < 5%)
- Localização completa (meta: 100%)
- CNPJ honesto (meta: 100%, zero inventados)

**Métricas de Consistência (semanais):**

- Quantidade de produtos por cliente (meta: sempre 3)
- Quantidade de concorrentes por cliente (meta: sempre 5)
- Quantidade de leads por cliente (meta: sempre 5)
- Taxa de aproveitamento do ciclo fechado (meta: 50-70%)

**Métricas de Custo (mensais):**

- Custo médio por cliente (meta: $0,036 ± 10%)
- Custo total mensal (meta: dentro do orçamento)
- Taxa de retrabalho manual (meta: < 10%)

### 8.3 Melhorias Futuras

Três melhorias foram identificadas para implementação após estabilização do Sistema V2.

**Melhoria 1: Integração com ReceitaWS**

Implementar validação automática de CNPJs através da API ReceitaWS. Isto aumentará a taxa de CNPJs válidos de 0% para aproximadamente 30-40% sem inventar dados, e fornecerá dados oficiais de localização.

**Melhoria 2: Validação Automática de Sites**

Implementar verificação HTTP automatizada para confirmar que URLs retornadas estão ativas. Sites inativos seriam substituídos por null, aumentando confiabilidade dos dados de contato.

**Melhoria 3: Re-enriquecimento Inteligente**

Implementar lógica para identificar automaticamente quando dados estão desatualizados (mercados com tendências > 6 meses antigas, crescimento anual com período expirado, players sem atualização > 1 ano) e re-enriquecer automaticamente em background.

---

## 9. Riscos e Mitigações

### 9.1 Matriz de Riscos

| Risco                               | Probabilidade | Impacto | Severidade | Mitigação                        |
| ----------------------------------- | ------------- | ------- | ---------- | -------------------------------- |
| Perda de dados históricos           | Alta          | Médio   | **Médio**  | Backup manual + PITR             |
| Aplicação quebrar durante limpeza   | Baixa         | Alto    | **Médio**  | Transação única + Rollback       |
| Constraints de FK bloquearem DELETE | Média         | Baixo   | **Baixo**  | Ordem correta de execução        |
| Validações falharem incorretamente  | Baixa         | Médio   | **Baixo**  | Testes prévios do script         |
| Usuários ativos durante execução    | Média         | Baixo   | **Baixo**  | Executar em horário de baixo uso |
| Rollback necessário após execução   | Baixa         | Médio   | **Baixo**  | PITR disponível (7 dias)         |

### 9.2 Plano de Contingência

Para cada risco identificado, um plano de contingência específico foi desenvolvido.

**Contingência 1: Perda de Dados Históricos**

Se após a limpeza for identificada necessidade de recuperar dados históricos (ex: para auditoria externa), restaurar backup via PITR para timestamp anterior à limpeza, exportar dados necessários para arquivo CSV e re-executar limpeza.

**Contingência 2: Aplicação Quebrar**

Se a aplicação apresentar erros após limpeza, verificar logs de erro para identificar queries que falharam. Se erro for causado por ausência de dados (ex: query que assume existência de leads), ajustar query para tratar caso de lista vazia. Se erro for mais grave, executar rollback via PITR.

**Contingência 3: Constraints de FK**

Se algum DELETE falhar por violação de constraint (improvável devido à ordem de execução), a transação será revertida automaticamente. Revisar ordem de execução no script, ajustar se necessário e re-executar.

**Contingência 4: Validações Falharem**

Se validações pós-limpeza falharem (ex: clientes != 807), a transação será revertida automaticamente. Investigar causa raiz (possível corrupção de dados pré-existente), corrigir problema e re-executar.

**Contingência 5: Usuários Ativos**

Se usuários estiverem ativos durante execução (improvável em horário de baixo uso), eles podem ver listas vazias temporariamente por 5-10 segundos. Não há impacto permanente, mas comunicar equipe para evitar confusão.

**Contingência 6: Rollback Necessário**

Se for identificado problema grave após limpeza que requer rollback (ex: dados críticos apagados incorretamente), executar PITR imediatamente para timestamp anterior à limpeza. Investigar causa raiz, ajustar script e re-executar após correção.

---

## 10. Conclusões e Recomendações

### 10.1 Conclusões

A varredura completa da base de dados identificou 18.293 registros que devem ser apagados para preparar a implementação do Sistema de Enriquecimento V2. Estes registros incluem 17.419 entidades enriquecidas (leads, concorrentes, produtos, mercados), 874 registros auxiliares (relacionamentos, jobs, runs) e dados de analytics calculados.

A análise de código-fonte mapeou todos os processos que geram registros no banco de dados, confirmando que a limpeza não afetará funcionalidades críticas do sistema. Os 807 clientes da pesquisa Base Inicial serão preservados integralmente, e tabelas de sistema (users, projects, pesquisas, settings, auditoria) permanecerão intactas.

O script de limpeza foi desenvolvido com múltiplas camadas de segurança, incluindo transação única, validações pré e pós-execução, ordem correta de DELETEs respeitando foreign keys e logging detalhado de cada fase. Backups automáticos do Supabase (PITR + snapshots) oferecem camada adicional de proteção.

A limpeza é essencial para evitar conflitos entre dados do sistema atual (baixa qualidade, gaps críticos) e dados do Sistema V2 (alta qualidade, score 100%, ciclo fechado). Manter dados antigos criaria inconsistência, duplicação e confusão entre registros gerados por sistemas diferentes.

### 10.2 Recomendações

Com base na análise completa, as seguintes recomendações são apresentadas.

**Recomendação 1: Aprovar Execução da Limpeza**

Aprovar execução do script de limpeza em horário de baixo uso (madrugada ou fim de semana), precedida de backup manual e seguida de validações completas. Os benefícios (dados de alta qualidade, fresh start, eliminação de conflitos) superam amplamente os riscos (perda de dados de baixa qualidade, indisponibilidade de 5-10 segundos).

**Recomendação 2: Executar em Ambiente de Staging Primeiro**

Se disponível, executar o script primeiro em ambiente de staging (cópia da base de produção) para validar comportamento e timing. Isto reduz risco de problemas inesperados em produção.

**Recomendação 3: Comunicar Equipe com Antecedência**

Notificar toda a equipe com pelo menos 48 horas de antecedência sobre a manutenção programada, incluindo horário, duração e impacto esperado. Solicitar que usuários evitem acessar sistema durante janela de manutenção.

**Recomendação 4: Ter Equipe de Prontidão**

Garantir que pelo menos dois membros da equipe técnica estejam disponíveis durante execução para monitorar logs, validar resultado e executar rollback se necessário.

**Recomendação 5: Documentar Execução Detalhadamente**

Registrar em documento interno todos os detalhes da execução (data/hora, responsável, resultado, validações, observações) para auditoria futura e aprendizado organizacional.

**Recomendação 6: Iniciar Rollout V2 Imediatamente Após**

Após limpeza bem-sucedida e validações confirmadas, iniciar imediatamente Fase 1 do rollout do Sistema V2 (50 clientes) para minimizar tempo com listas vazias e demonstrar valor rapidamente.

### 10.3 Aprovação

Este relatório requer aprovação formal antes da execução do script de limpeza.

**Aprovadores Necessários:**

- [ ] Gestor do Projeto Intelmarket
- [ ] Responsável Técnico (DevOps/DBA)
- [ ] Líder da Equipe de Produto

**Após Aprovação:**

- [ ] Agendar horário de execução
- [ ] Criar backup manual
- [ ] Executar script de limpeza
- [ ] Validar resultado
- [ ] Iniciar Fase 1 do Rollout V2

---

## Apêndices

### Apêndice A: Arquivos Gerados

Os seguintes arquivos foram criados como parte desta análise:

1. `analise_limpeza_base.md` - Análise preliminar de limpeza
2. `script_limpeza_base.sql` - Script SQL completo de limpeza
3. `RELATORIO_LIMPEZA_BASE.md` - Este relatório (versão final)

### Apêndice B: Comandos SQL Úteis

**Verificar contagem de registros por tabela:**

```sql
SELECT
    'clientes' as tabela, COUNT(*) as total
FROM clientes WHERE "pesquisaId" = 1
UNION ALL
SELECT 'leads', COUNT(*) FROM leads WHERE "pesquisaId" = 1
UNION ALL
SELECT 'concorrentes', COUNT(*) FROM concorrentes WHERE "pesquisaId" = 1
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos WHERE "pesquisaId" = 1
UNION ALL
SELECT 'mercados', COUNT(*) FROM mercados_unicos WHERE "pesquisaId" = 1;
```

**Verificar status da pesquisa:**

```sql
SELECT id, nome, status, "clientesEnriquecidos", "createdAt", "updatedAt"
FROM pesquisas
WHERE id = 1;
```

**Verificar tags válidas:**

```sql
SELECT et.id, et."entityId", c.nome, t.name
FROM entity_tags et
LEFT JOIN clientes c ON et."entityId" = c.id AND et."entityType" = 'cliente'
LEFT JOIN tags t ON et."tagId" = t.id
WHERE c."pesquisaId" = 1;
```

### Apêndice C: Contatos de Suporte

Em caso de problemas durante ou após a execução:

- **Suporte Supabase:** https://supabase.com/support
- **Documentação PITR:** https://supabase.com/docs/guides/platform/backups
- **Documentação Backups:** https://supabase.com/docs/guides/platform/backups

---

**Documento preparado por:** Manus AI  
**Versão:** 1.0  
**Data de Publicação:** 30 de novembro de 2024  
**Classificação:** Interno - Crítico  
**Próxima Revisão:** Após execução da limpeza
