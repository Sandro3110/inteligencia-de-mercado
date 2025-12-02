# 🔍 FASE 1.2: Revisão do Modelo Existente

**Data:** 01/12/2025  
**Objetivo:** Identificar gaps entre modelo atual e modelo final

---

## 📊 TABELAS ATUAIS NO BANCO

Total: 43 tabelas

### **Tabelas Relevantes para o Modelo:**

1. `fato_entidades` ⚠️ (deve ser substituída por `fato_entidade_contexto`)
2. `dim_geografia` ✅
3. `dim_mercados` ✅
4. `dim_produtos` ✅
5. `entidade_produtos` ⚠️ (deve ser `fato_entidade_produto`)
6. `entidade_competidores` ⚠️ (deve ser `fato_entidade_competidor`)
7. `pesquisas` ⚠️ (deve ser `dim_pesquisa`)
8. `projects` ⚠️ (deve ser `dim_projeto`)
9. `cidades_brasil` ✅ (fonte para dim_geografia)

### **Tabelas que NÃO existem ainda:**

- ❌ `dim_entidade` (entidades separadas do contexto)
- ❌ `fato_entidade_contexto` (fato central)
- ❌ `dim_status_qualificacao` (tabela de domínio)

---

## 🔍 ANÁLISE DETALHADA: `fato_entidades` (ATUAL)

### **Colunas Atuais (32):**

1. id
2. tipo_entidade
3. entidade_hash
4. nome
5. cnpj
6. pesquisa_id
7. project_id
8. geografia_id
9. mercado_id
10. email
11. telefone
12. site_oficial
13. linkedin
14. instagram
15. cnae
16. porte
17. segmentacao_b2b_b2c
18. faturamento_declarado
19. faturamento_estimado
20. numero_estabelecimentos
21. qualidade_score
22. qualidade_classificacao
23. validation_status
24. validation_notes
25. validated_by
26. validated_at
27. lead_stage
28. stage_updated_at
29. cliente_origem_id
30. created_at
31. updated_at
32. status_qualificacao

### **Problemas Identificados:**

#### **1. Mistura de Dimensão + Fato**

- ⚠️ Campos de entidade (nome, cnpj, email, telefone) estão misturados com contexto (pesquisa_id, project_id)
- ⚠️ Não permite entidade em múltiplos projetos sem duplicar dados

#### **2. Campos de Auditoria Incompletos**

- ❌ Falta `created_by` (quem criou)
- ❌ Falta `updated_by` (quem atualizou)
- ❌ Falta `deleted_at` (soft delete)
- ❌ Falta `deleted_by` (quem deletou)

#### **3. Campos de Origem Faltando**

- ❌ Falta `origem_tipo` (importacao, ia_prompt, api, manual)
- ❌ Falta `origem_arquivo` (nome do CSV)
- ❌ Falta `origem_processo` (nome do processo IA)
- ❌ Falta `origem_prompt` (prompt usado)
- ❌ Falta `origem_confianca` (0-100)
- ❌ Falta `origem_data` (quando foi criado)
- ❌ Falta `origem_usuario_id` (quem criou)

#### **4. Campos de Filiais/Lojas Faltando**

- ❌ Falta `num_filiais` (quantas filiais)
- ❌ Falta `num_lojas` (quantas lojas)

#### **5. Campos de Logs de Contexto Faltando**

- ❌ Falta `added_at` (quando foi adicionado ao projeto/pesquisa)
- ❌ Falta `added_by` (quem adicionou)
- ❌ Falta `enriched_at` (quando foi enriquecido)
- ❌ Falta `enriched_by` (quem enriqueceu)

#### **6. Campos Obsoletos**

- ⚠️ `site_oficial` (deve ser `site`)
- ⚠️ `linkedin`, `instagram` (redes sociais - não prioritários)
- ⚠️ `cnae` (deve estar em dim_mercado ou dim_entidade)
- ⚠️ `porte` (deve ser calculado por num_filiais, num_lojas, num_funcionarios)
- ⚠️ `segmentacao_b2b_b2c` (deve estar em dim_mercado.categoria)
- ⚠️ `faturamento_declarado`, `faturamento_estimado` (tipo TEXT, deve ser DECIMAL)
- ⚠️ `numero_estabelecimentos` (tipo TEXT, deve ser INTEGER)
- ⚠️ `validation_status`, `validation_notes`, `validated_by`, `validated_at` (não prioritários)
- ⚠️ `lead_stage`, `stage_updated_at` (deve estar em fato_entidade_contexto)
- ⚠️ `cliente_origem_id` (conversão de lead → cliente, não prioritário agora)

---

## 🔍 ANÁLISE DETALHADA: `pesquisas` (ATUAL)

### **Verificar estrutura:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pesquisas'
ORDER BY ordinal_position;
```

### **Campos Esperados (Modelo Final):**

- id
- projeto_id (FK)
- nome
- descricao
- objetivo
- status
- total_entidades
- entidades_enriquecidas
- entidades_falhadas
- qualidade_media
- started_at, started_by
- completed_at, duration_seconds
- error_message
- created_at, created_by
- updated_at, updated_by
- deleted_at, deleted_by

### **Ação:** Verificar e documentar gaps

---

## 🔍 ANÁLISE DETALHADA: `projects` (ATUAL)

### **Verificar estrutura:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
```

### **Campos Esperados (Modelo Final):**

- id
- codigo (centro de custos)
- nome
- descricao
- status
- owner_id (FK)
- unidade_negocio
- centro_custo
- orcamento_total
- created_at, created_by
- updated_at, updated_by
- deleted_at, deleted_by

### **Ação:** Verificar e documentar gaps

---

## 🔍 ANÁLISE DETALHADA: `dim_geografia` (ATUAL)

### **Verificar estrutura:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_geografia'
ORDER BY ordinal_position;
```

### **Campos Esperados (Modelo Final):**

- id
- cidade
- uf
- regiao
- latitude, longitude
- codigo_ibge
- populacao
- pib_per_capita
- created_at, created_by
- updated_at, updated_by

### **Ação:** Verificar e documentar gaps

---

## 🔍 ANÁLISE DETALHADA: `dim_mercados` (ATUAL)

### **Verificar estrutura:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_mercados'
ORDER BY ordinal_position;
```

### **Campos Esperados (Modelo Final):**

- id
- mercado_hash (UNIQUE)
- nome
- categoria
- segmentacao
- tamanho_mercado_br
- crescimento_anual_pct
- tendencias (array)
- principais_players (array)
- enriquecido, enriquecido_em, enriquecido_por
- created_at, created_by
- updated_at, updated_by

### **Ação:** Verificar e documentar gaps

---

## 🔍 ANÁLISE DETALHADA: `dim_produtos` (ATUAL)

### **Verificar estrutura:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_produtos'
ORDER BY ordinal_position;
```

### **Campos Esperados (Modelo Final):**

- id
- produto_hash (UNIQUE)
- nome
- categoria
- descricao
- preco_medio
- unidade
- ncm
- enriquecido, enriquecido_em, enriquecido_por
- created_at, created_by
- updated_at, updated_by

### **Ação:** Verificar e documentar gaps

---

## 📋 PLANO DE MIGRAÇÃO

### **Estratégia: Criar Novas Tabelas + Migrar Dados**

#### **Passo 1: Criar Tabelas Novas**

1. `dim_entidade` (nova)
2. `dim_projeto` (renomear/migrar de `projects`)
3. `dim_pesquisa` (renomear/migrar de `pesquisas`)
4. `dim_status_qualificacao` (nova + seed)
5. `fato_entidade_contexto` (nova)
6. `fato_entidade_produto` (renomear de `entidade_produtos`)
7. `fato_entidade_competidor` (renomear de `entidade_competidores`)

#### **Passo 2: Adicionar Campos Faltantes**

1. Adicionar campos de auditoria (created_by, updated_by, deleted_at, deleted_by)
2. Adicionar campos de origem (dim_entidade)
3. Adicionar campos de filiais/lojas (dim_entidade)
4. Adicionar campos de logs (dim_pesquisa, fato_entidade_contexto)

#### **Passo 3: Migrar Dados**

1. Extrair entidades únicas de `fato_entidades` → `dim_entidade`
2. Migrar `projects` → `dim_projeto`
3. Migrar `pesquisas` → `dim_pesquisa`
4. Migrar `fato_entidades` → `fato_entidade_contexto`
5. Migrar `entidade_produtos` → `fato_entidade_produto`
6. Migrar `entidade_competidores` → `fato_entidade_competidor`

#### **Passo 4: Criar Índices**

1. Criar 71 índices otimizados

#### **Passo 5: Validar**

1. Contar registros (antes vs depois)
2. Verificar integridade referencial
3. Testar queries

#### **Passo 6: Remover Tabelas Antigas** (APÓS VALIDAÇÃO)

1. DROP TABLE `fato_entidades` (após backup)
2. DROP TABLE `entidade_produtos` (após backup)
3. DROP TABLE `entidade_competidores` (após backup)

---

## ✅ PRÓXIMOS PASSOS

1. Verificar estrutura de `pesquisas`, `projects`, `dim_geografia`, `dim_mercados`, `dim_produtos`
2. Documentar TODOS os gaps
3. Criar script SQL de migration completo
4. Executar migration
5. Validar

---

**Continuando verificação...**

---

## 🔍 ANÁLISE COMPLETA DAS TABELAS RESTANTES

### **1. `pesquisas` (ATUAL)**

**Colunas Atuais (14):**

1. id
2. projectId (camelCase ⚠️)
3. nome
4. descricao
5. status
6. ativo (integer, deve ser boolean)
7. totalClientes
8. clientesEnriquecidos (camelCase ⚠️)
9. qtdProdutosPorCliente (camelCase ⚠️)
10. qtdLeadsPorMercado (camelCase ⚠️)
11. qtdConcorrentesPorMercado (camelCase ⚠️)
12. dataImportacao (camelCase ⚠️)
13. createdAt (camelCase ⚠️)
14. updatedAt (camelCase ⚠️)

**Campos Faltantes:**

- ❌ `objetivo` (objetivo da pesquisa)
- ❌ `entidades_enriquecidas` (padronizado)
- ❌ `entidades_falhadas` (quantas falharam)
- ❌ `qualidade_media` (qualidade média 0-100)
- ❌ `started_at` (quando começou)
- ❌ `started_by` (FK → users)
- ❌ `completed_at` (quando terminou)
- ❌ `duration_seconds` (duração em segundos)
- ❌ `error_message` (mensagem de erro)
- ❌ `created_by` (FK → users)
- ❌ `updated_by` (FK → users)
- ❌ `deleted_at` (soft delete)
- ❌ `deleted_by` (FK → users)

**Campos Obsoletos:**

- ⚠️ `ativo` (deve ser parte do `status`)
- ⚠️ `clientesEnriquecidos` (renomear para `entidades_enriquecidas`)
- ⚠️ `qtdProdutosPorCliente`, `qtdLeadsPorMercado`, `qtdConcorrentesPorMercado` (não prioritários)
- ⚠️ `dataImportacao` (deve ser `started_at`)

**Problemas de Nomenclatura:**

- ⚠️ Todos os campos em camelCase (deve ser snake_case)

**Ações:**

1. Renomear para `dim_pesquisa`
2. Adicionar 13 campos faltantes
3. Padronizar nomenclatura (camelCase → snake_case)
4. Remover/mover campos obsoletos

---

### **2. `projects` (ATUAL)**

**Colunas Atuais (12):**

1. id
2. nome
3. descricao
4. status
5. ativo (integer, deve ser boolean)
6. cor (não prioritário)
7. executionMode (camelCase ⚠️, não prioritário)
8. isPaused (camelCase ⚠️, deve ser parte do status)
9. maxParallelJobs (camelCase ⚠️, não prioritário)
10. lastActivityAt (camelCase ⚠️)
11. createdAt (camelCase ⚠️)
12. updatedAt (camelCase ⚠️)

**Campos Faltantes:**

- ❌ `codigo` (código do centro de custos)
- ❌ `owner_id` (FK → users, responsável)
- ❌ `unidade_negocio` (unidade de negócio)
- ❌ `centro_custo` (código contábil)
- ❌ `orcamento_total` (orçamento total)
- ❌ `created_by` (FK → users)
- ❌ `updated_by` (FK → users)
- ❌ `deleted_at` (soft delete)
- ❌ `deleted_by` (FK → users)

**Campos Obsoletos:**

- ⚠️ `ativo` (deve ser parte do `status`)
- ⚠️ `cor` (não prioritário, pode ser removido)
- ⚠️ `executionMode` (não prioritário)
- ⚠️ `isPaused` (deve ser status='pausado')
- ⚠️ `maxParallelJobs` (não prioritário)
- ⚠️ `lastActivityAt` (não prioritário)

**Problemas de Nomenclatura:**

- ⚠️ Campos em camelCase (deve ser snake_case)

**Ações:**

1. Renomear para `dim_projeto`
2. Adicionar 9 campos faltantes
3. Padronizar nomenclatura (camelCase → snake_case)
4. Remover campos obsoletos

---

### **3. `dim_geografia` (ATUAL)**

**Colunas Atuais (8):**

1. id
2. cidade
3. uf
4. regiao
5. latitude
6. longitude
7. created_at
8. updated_at

**Campos Faltantes:**

- ❌ `codigo_ibge` (código IBGE)
- ❌ `populacao` (população)
- ❌ `pib_per_capita` (PIB per capita)
- ❌ `created_by` (FK → users)
- ❌ `updated_by` (FK → users)

**Ações:**

1. Adicionar 5 campos faltantes
2. ✅ Nomenclatura já está correta (snake_case)

---

### **4. `dim_mercados` (ATUAL)**

**Colunas Atuais (12):**

1. id
2. mercado_hash
3. nome
4. categoria
5. segmentacao
6. tamanho_mercado (TEXT ⚠️, deve ser DECIMAL)
7. crescimento_anual (TEXT ⚠️, deve ser DECIMAL)
8. tendencias (TEXT ⚠️, deve ser ARRAY)
9. principais_players (TEXT ⚠️, deve ser ARRAY)
10. pesquisa_id (⚠️ NÃO DEVE EXISTIR - dimensão não tem contexto)
11. project_id (⚠️ NÃO DEVE EXISTIR - dimensão não tem contexto)
12. created_at
13. updated_at

**Campos Faltantes:**

- ❌ `enriquecido` (boolean)
- ❌ `enriquecido_em` (timestamp)
- ❌ `enriquecido_por` (varchar - 'llm', 'api', 'manual')
- ❌ `created_by` (FK → users)
- ❌ `updated_by` (FK → users)

**Problemas Críticos:**

- ⚠️ `pesquisa_id` e `project_id` NÃO DEVEM EXISTIR (dimensão é global, não contextual)
- ⚠️ `tamanho_mercado` é TEXT (deve ser `tamanho_mercado_br DECIMAL(15,2)`)
- ⚠️ `crescimento_anual` é TEXT (deve ser `crescimento_anual_pct DECIMAL(5,2)`)
- ⚠️ `tendencias` é TEXT (deve ser `TEXT[]` - array)
- ⚠️ `principais_players` é TEXT (deve ser `TEXT[]` - array)

**Ações:**

1. **REMOVER** `pesquisa_id` e `project_id`
2. Adicionar 5 campos faltantes
3. Alterar tipos de dados (TEXT → DECIMAL, TEXT → ARRAY)
4. Criar seed para mercado "NÃO CLASSIFICADO" (id = 1)

---

### **5. `dim_produtos` (ATUAL)**

**Colunas Atuais (13):**

1. id
2. produto_hash
3. nome
4. categoria
5. descricao
6. preco (TEXT ⚠️, deve ser DECIMAL)
7. unidade
8. mercado_id (não prioritário)
9. ativo (boolean, não prioritário)
10. pesquisa_id (⚠️ NÃO DEVE EXISTIR)
11. project_id (⚠️ NÃO DEVE EXISTIR)
12. created_at
13. updated_at

**Campos Faltantes:**

- ❌ `preco_medio` (DECIMAL, renomear de `preco`)
- ❌ `ncm` (Nomenclatura Comum do Mercosul)
- ❌ `enriquecido` (boolean)
- ❌ `enriquecido_em` (timestamp)
- ❌ `enriquecido_por` (varchar - 'llm', 'api', 'manual')
- ❌ `created_by` (FK → users)
- ❌ `updated_by` (FK → users)

**Problemas Críticos:**

- ⚠️ `pesquisa_id` e `project_id` NÃO DEVEM EXISTIR (dimensão é global)
- ⚠️ `preco` é TEXT (deve ser `preco_medio DECIMAL(12,2)`)
- ⚠️ `mercado_id` (não prioritário, pode ser removido)
- ⚠️ `ativo` (não prioritário, pode ser removido)

**Ações:**

1. **REMOVER** `pesquisa_id`, `project_id`, `mercado_id`, `ativo`
2. Adicionar 7 campos faltantes
3. Alterar tipo de dados (preco TEXT → preco_medio DECIMAL)

---

## 📊 RESUMO DE GAPS

### **Tabelas que NÃO existem (3):**

1. ❌ `dim_entidade`
2. ❌ `fato_entidade_contexto`
3. ❌ `dim_status_qualificacao`

### **Tabelas que precisam ser renomeadas (4):**

1. `pesquisas` → `dim_pesquisa`
2. `projects` → `dim_projeto`
3. `entidade_produtos` → `fato_entidade_produto`
4. `entidade_competidores` → `fato_entidade_competidor`

### **Campos faltantes por tabela:**

- `fato_entidades`: 17 campos
- `pesquisas`: 13 campos
- `projects`: 9 campos
- `dim_geografia`: 5 campos
- `dim_mercados`: 5 campos
- `dim_produtos`: 7 campos

**Total de campos faltantes:** 56 campos

### **Campos com tipo errado:**

- `dim_mercados.tamanho_mercado`: TEXT → DECIMAL(15,2)
- `dim_mercados.crescimento_anual`: TEXT → DECIMAL(5,2)
- `dim_mercados.tendencias`: TEXT → TEXT[]
- `dim_mercados.principais_players`: TEXT → TEXT[]
- `dim_produtos.preco`: TEXT → DECIMAL(12,2)
- `fato_entidades.faturamento_declarado`: TEXT → DECIMAL(15,2)
- `fato_entidades.faturamento_estimado`: TEXT → DECIMAL(15,2)
- `fato_entidades.numero_estabelecimentos`: TEXT → INTEGER

**Total de campos com tipo errado:** 8 campos

### **Campos que NÃO DEVEM EXISTIR:**

- `dim_mercados.pesquisa_id` ⚠️ CRÍTICO
- `dim_mercados.project_id` ⚠️ CRÍTICO
- `dim_produtos.pesquisa_id` ⚠️ CRÍTICO
- `dim_produtos.project_id` ⚠️ CRÍTICO
- `dim_produtos.mercado_id`
- `dim_produtos.ativo`
- `projects.cor`, `projects.executionMode`, `projects.isPaused`, `projects.maxParallelJobs`, `projects.lastActivityAt`
- `pesquisas.ativo`, `pesquisas.qtdProdutosPorCliente`, `pesquisas.qtdLeadsPorMercado`, `pesquisas.qtdConcorrentesPorMercado`
- `fato_entidades`: 13 campos obsoletos

**Total de campos obsoletos:** 27 campos

### **Problemas de nomenclatura:**

- `pesquisas`: 7 campos em camelCase
- `projects`: 5 campos em camelCase

**Total de campos com nomenclatura errada:** 12 campos

---

## 🎯 ESTRATÉGIA DE MIGRAÇÃO

### **Fase 1: Criar Novas Estruturas**

1. Criar `dim_entidade` (nova)
2. Criar `dim_status_qualificacao` (nova + seed)
3. Criar `fato_entidade_contexto` (nova)

### **Fase 2: Adicionar Campos Faltantes**

1. Adicionar 56 campos nas tabelas existentes
2. Corrigir 8 tipos de dados

### **Fase 3: Remover Campos Obsoletos**

1. Remover 27 campos obsoletos
2. Padronizar 12 campos (camelCase → snake_case)

### **Fase 4: Migrar Dados**

1. Extrair entidades únicas de `fato_entidades` → `dim_entidade`
2. Migrar `fato_entidades` → `fato_entidade_contexto`
3. Limpar `dim_mercados` (remover pesquisa_id, project_id)
4. Limpar `dim_produtos` (remover pesquisa_id, project_id)

### **Fase 5: Renomear Tabelas**

1. Renomear `pesquisas` → `dim_pesquisa`
2. Renomear `projects` → `dim_projeto`
3. Renomear `entidade_produtos` → `fato_entidade_produto`
4. Renomear `entidade_competidores` → `fato_entidade_competidor`

### **Fase 6: Criar Índices**

1. Criar 71 índices otimizados

### **Fase 7: Validar**

1. Contar registros
2. Verificar integridade referencial
3. Testar queries

---

## ✅ CONCLUSÃO

**Complexidade da Migração:** ⚠️ **ALTA**

**Motivos:**

1. 3 tabelas novas
2. 56 campos faltantes
3. 8 tipos de dados errados
4. 27 campos obsoletos
5. 12 campos com nomenclatura errada
6. 4 tabelas para renomear
7. Migração de dados complexa (extrair entidades únicas)

**Tempo Estimado:** 8-12h

**Risco:** ⚠️ **MÉDIO-ALTO**

- Migração de dados pode falhar
- Integridade referencial pode quebrar
- Queries existentes vão quebrar

**Recomendação:**

1. Criar backup completo antes de iniciar
2. Executar migration em ambiente de teste primeiro
3. Validar cada fase antes de prosseguir
4. Manter tabelas antigas até validação completa

---

**FASE 1.2 CONCLUÍDA! ✅**

**Próximo:** FASE 1.3 - Implementação do Modelo Final (criar scripts SQL)
