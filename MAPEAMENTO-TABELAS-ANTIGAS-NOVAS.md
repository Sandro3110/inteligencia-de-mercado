# 🔄 Mapeamento: Tabelas Antigas → Novas

## 📋 RESUMO DA RE-ARQUITETURA

**Objetivo:** Unificar clientes, leads e concorrentes em uma única tabela fato com campos padronizados.

**Benefícios:**

- ✅ Campos com mesmo nome e estrutura
- ✅ Queries simplificadas (uma tabela para tudo)
- ✅ Manutenção fácil (mudança em um lugar)
- ✅ Performance otimizada (índices compostos)

---

## 🗺️ MAPEAMENTO DE TABELAS

| Tabela Antiga              | Tabela Nova    | Transformação                       |
| -------------------------- | -------------- | ----------------------------------- |
| **clientes**               | fato_entidades | tipo_entidade = 'cliente'           |
| **leads**                  | fato_entidades | tipo_entidade = 'lead'              |
| **concorrentes**           | fato_entidades | tipo_entidade = 'concorrente'       |
| **produtos**               | dim_produtos   | Normalizado                         |
| **mercados_unicos**        | dim_mercados   | Normalizado                         |
| **clientes_mercados**      | ❌ REMOVIDO    | mercado_id direto em fato_entidades |
| **clientes.cidade/uf**     | dim_geografia  | Normalizado (JOIN)                  |
| **leads.cidade/uf**        | dim_geografia  | Normalizado (JOIN)                  |
| **concorrentes.cidade/uf** | dim_geografia  | Normalizado (JOIN)                  |

---

## 📊 MAPEAMENTO DE CAMPOS: CLIENTES → FATO_ENTIDADES

| Campo Antigo (clientes) | Campo Novo (fato_entidades) | Transformação                               |
| ----------------------- | --------------------------- | ------------------------------------------- |
| id                      | id                          | Direto                                      |
| clienteHash             | entidade_hash               | Renomeado                                   |
| nome                    | nome                        | Direto                                      |
| cnpj                    | cnpj                        | Direto                                      |
| siteOficial             | site_oficial                | Renomeado                                   |
| produtoPrincipal        | ❌ REMOVIDO                 | Usar entidade_produtos (N:N)                |
| segmentacaoB2BB2C       | segmentacao_b2b_b2c         | Renomeado                                   |
| email                   | email                       | Direto                                      |
| telefone                | telefone                    | Direto                                      |
| linkedin                | linkedin                    | Direto                                      |
| instagram               | instagram                   | Direto                                      |
| cidade                  | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.cidade    |
| uf                      | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.uf        |
| cnae                    | cnae                        | Direto                                      |
| porte                   | porte                       | Direto                                      |
| qualidadeScore          | qualidade_score             | Renomeado                                   |
| qualidadeClassificacao  | qualidade_classificacao     | Renomeado                                   |
| validationStatus        | validation_status           | Direto                                      |
| validationNotes         | validation_notes            | Direto                                      |
| validatedBy             | validated_by                | Direto                                      |
| validatedAt             | validated_at                | Direto                                      |
| createdAt               | created_at                  | Direto                                      |
| projectId               | project_id                  | Direto                                      |
| regiao                  | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.regiao    |
| faturamentoDeclarado    | faturamento_declarado       | Renomeado                                   |
| numeroEstabelecimentos  | numero_estabelecimentos     | Renomeado                                   |
| pesquisaId              | pesquisa_id                 | Direto                                      |
| latitude                | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.latitude  |
| longitude               | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.longitude |
| geocodedAt              | ❌ REMOVIDO                 | Não necessário                              |
| **NOVO**                | tipo_entidade               | 'cliente'                                   |
| **NOVO**                | geografia_id                | FK → dim_geografia                          |
| **NOVO**                | mercado_id                  | FK → dim_mercados (via clientes_mercados)   |
| **NOVO**                | updated_at                  | NOW()                                       |

---

## 📊 MAPEAMENTO DE CAMPOS: LEADS → FATO_ENTIDADES

| Campo Antigo (leads)   | Campo Novo (fato_entidades) | Transformação                               |
| ---------------------- | --------------------------- | ------------------------------------------- |
| id                     | id                          | Direto                                      |
| leadHash               | entidade_hash               | Renomeado                                   |
| mercadoId              | mercado_id                  | Direto                                      |
| nome                   | nome                        | Direto                                      |
| cnpj                   | cnpj                        | Direto                                      |
| site                   | site_oficial                | Renomeado                                   |
| email                  | email                       | Direto                                      |
| telefone               | telefone                    | Direto                                      |
| tipo                   | ❌ REMOVIDO                 | Usar tipo_entidade = 'lead'                 |
| porte                  | porte                       | Direto                                      |
| regiao                 | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.regiao    |
| setor                  | ❌ REMOVIDO                 | Usar mercado_id → dim_mercados.categoria    |
| qualidadeScore         | qualidade_score             | Renomeado                                   |
| qualidadeClassificacao | qualidade_classificacao     | Renomeado                                   |
| leadStage              | lead_stage                  | Direto                                      |
| stageUpdatedAt         | stage_updated_at            | Direto                                      |
| validationStatus       | validation_status           | Direto                                      |
| validationNotes        | validation_notes            | Direto                                      |
| validatedBy            | validated_by                | Direto                                      |
| validatedAt            | validated_at                | Direto                                      |
| createdAt              | created_at                  | Direto                                      |
| projectId              | project_id                  | Direto                                      |
| cidade                 | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.cidade    |
| uf                     | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.uf        |
| faturamentoDeclarado   | faturamento_declarado       | Renomeado                                   |
| numeroEstabelecimentos | numero_estabelecimentos     | Renomeado                                   |
| pesquisaId             | pesquisa_id                 | Direto                                      |
| stage                  | ❌ DUPLICADO                | Usar lead_stage                             |
| latitude               | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.latitude  |
| longitude              | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.longitude |
| geocodedAt             | ❌ REMOVIDO                 | Não necessário                              |
| cnae                   | cnae                        | Direto                                      |
| **NOVO**               | tipo_entidade               | 'lead'                                      |
| **NOVO**               | geografia_id                | FK → dim_geografia                          |
| **NOVO**               | cliente_origem_id           | NULL (conversão futura)                     |
| **NOVO**               | updated_at                  | NOW()                                       |

---

## 📊 MAPEAMENTO DE CAMPOS: CONCORRENTES → FATO_ENTIDADES

| Campo Antigo (concorrentes) | Campo Novo (fato_entidades) | Transformação                               |
| --------------------------- | --------------------------- | ------------------------------------------- |
| id                          | id                          | Direto                                      |
| concorrenteHash             | entidade_hash               | Renomeado                                   |
| mercadoId                   | mercado_id                  | Direto                                      |
| nome                        | nome                        | Direto                                      |
| cnpj                        | cnpj                        | Direto                                      |
| site                        | site_oficial                | Renomeado                                   |
| produto                     | ❌ REMOVIDO                 | Usar entidade_produtos (N:N)                |
| porte                       | porte                       | Direto                                      |
| faturamentoEstimado         | faturamento_estimado        | Direto                                      |
| qualidadeScore              | qualidade_score             | Renomeado                                   |
| qualidadeClassificacao      | qualidade_classificacao     | Renomeado                                   |
| validationStatus            | validation_status           | Direto                                      |
| validationNotes             | validation_notes            | Direto                                      |
| validatedBy                 | validated_by                | Direto                                      |
| validatedAt                 | validated_at                | Direto                                      |
| createdAt                   | created_at                  | Direto                                      |
| projectId                   | project_id                  | Direto                                      |
| cidade                      | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.cidade    |
| uf                          | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.uf        |
| faturamentoDeclarado        | faturamento_declarado       | Direto                                      |
| numeroEstabelecimentos      | numero_estabelecimentos     | Renomeado                                   |
| pesquisaId                  | pesquisa_id                 | Direto                                      |
| latitude                    | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.latitude  |
| longitude                   | ❌ REMOVIDO                 | Usar geografia_id → dim_geografia.longitude |
| geocodedAt                  | ❌ REMOVIDO                 | Não necessário                              |
| cnae                        | cnae                        | Direto                                      |
| setor                       | ❌ REMOVIDO                 | Usar mercado_id → dim_mercados.categoria    |
| email                       | email                       | Direto                                      |
| telefone                    | telefone                    | Direto                                      |
| **NOVO**                    | tipo_entidade               | 'concorrente'                               |
| **NOVO**                    | geografia_id                | FK → dim_geografia                          |
| **NOVO**                    | updated_at                  | NOW()                                       |

---

## 📦 MAPEAMENTO DE CAMPOS: PRODUTOS → DIM_PRODUTOS

| Campo Antigo (produtos) | Campo Novo (dim_produtos) | Transformação                |
| ----------------------- | ------------------------- | ---------------------------- |
| id                      | id                        | Direto                       |
| projectId               | project_id                | Direto                       |
| clienteId               | ❌ REMOVIDO               | Usar entidade_produtos (N:N) |
| mercadoId               | mercado_id                | Direto                       |
| nome                    | nome                      | Direto                       |
| descricao               | descricao                 | Direto                       |
| categoria               | categoria                 | Direto                       |
| preco                   | preco                     | Direto                       |
| unidade                 | unidade                   | Direto                       |
| ativo                   | ativo                     | Direto                       |
| createdAt               | created_at                | Direto                       |
| updatedAt               | updated_at                | Direto                       |
| pesquisaId              | pesquisa_id               | Direto                       |
| **NOVO**                | produto_hash              | MD5(nome + categoria)        |

---

## 🏢 MAPEAMENTO DE CAMPOS: MERCADOS_UNICOS → DIM_MERCADOS

| Campo Antigo (mercados_unicos) | Campo Novo (dim_mercados) | Transformação      |
| ------------------------------ | ------------------------- | ------------------ |
| id                             | id                        | Direto             |
| mercadoHash                    | mercado_hash              | Direto             |
| nome                           | nome                      | Direto             |
| segmentacao                    | segmentacao               | Direto             |
| categoria                      | categoria                 | Direto             |
| tamanhoMercado                 | tamanho_mercado           | Renomeado          |
| crescimentoAnual               | crescimento_anual         | Renomeado          |
| tendencias                     | tendencias                | Direto             |
| principaisPlayers              | principais_players        | Renomeado          |
| quantidadeClientes             | ❌ REMOVIDO               | Calcular via COUNT |
| createdAt                      | created_at                | Direto             |
| projectId                      | project_id                | Direto             |
| pesquisaId                     | pesquisa_id               | Direto             |
| **NOVO**                       | updated_at                | NOW()              |

---

## 🔗 NOVOS RELACIONAMENTOS

### **entidade_produtos** (N:N)

```sql
-- Migrar de produtos.clienteId
INSERT INTO entidade_produtos (entidade_id, produto_id, tipo_relacao)
SELECT
  fe.id as entidade_id,
  dp.id as produto_id,
  'fabricante' as tipo_relacao
FROM produtos p
INNER JOIN fato_entidades fe ON fe.id = p.clienteId AND fe.tipo_entidade = 'cliente'
INNER JOIN dim_produtos dp ON dp.id = p.id;
```

### **entidade_competidores** (N:N)

```sql
-- Criar relacionamento automático entre clientes e concorrentes do mesmo mercado
INSERT INTO entidade_competidores (entidade_id, competidor_id, mercado_id, nivel_competicao)
SELECT DISTINCT
  c.id as entidade_id,
  co.id as competidor_id,
  c.mercado_id,
  'direto' as nivel_competicao
FROM fato_entidades c
INNER JOIN fato_entidades co ON co.mercado_id = c.mercado_id AND co.tipo_entidade = 'concorrente'
WHERE c.tipo_entidade = 'cliente';
```

---

## 📝 SCRIPT DE MIGRAÇÃO DE DADOS (EXEMPLO)

```sql
-- 1. Migrar CLIENTES
INSERT INTO fato_entidades (
  tipo_entidade, entidade_hash, nome, cnpj, pesquisa_id, project_id,
  geografia_id, mercado_id, email, telefone, site_oficial, linkedin, instagram,
  cnae, porte, segmentacao_b2b_b2c, faturamento_declarado, numero_estabelecimentos,
  qualidade_score, qualidade_classificacao, validation_status, validation_notes,
  validated_by, validated_at, created_at, updated_at
)
SELECT
  'cliente' as tipo_entidade,
  c.clienteHash as entidade_hash,
  c.nome,
  c.cnpj,
  c.pesquisaId as pesquisa_id,
  c.projectId as project_id,
  g.id as geografia_id,
  cm.mercadoId as mercado_id,
  c.email,
  c.telefone,
  c.siteOficial as site_oficial,
  c.linkedin,
  c.instagram,
  c.cnae,
  c.porte,
  c.segmentacaoB2BB2C as segmentacao_b2b_b2c,
  c.faturamentoDeclarado as faturamento_declarado,
  c.numeroEstabelecimentos as numero_estabelecimentos,
  c.qualidadeScore as qualidade_score,
  c.qualidadeClassificacao as qualidade_classificacao,
  c.validationStatus as validation_status,
  c.validationNotes as validation_notes,
  c.validatedBy as validated_by,
  c.validatedAt as validated_at,
  c.createdAt as created_at,
  NOW() as updated_at
FROM clientes c
INNER JOIN dim_geografia g ON g.cidade = c.cidade AND g.uf = c.uf
INNER JOIN clientes_mercados cm ON cm.clienteId = c.id
WHERE c.pesquisaId IS NOT NULL;

-- 2. Migrar LEADS
INSERT INTO fato_entidades (
  tipo_entidade, entidade_hash, nome, cnpj, pesquisa_id, project_id,
  geografia_id, mercado_id, email, telefone, site_oficial,
  cnae, porte, faturamento_declarado, numero_estabelecimentos,
  qualidade_score, qualidade_classificacao, validation_status, validation_notes,
  validated_by, validated_at, lead_stage, stage_updated_at, created_at, updated_at
)
SELECT
  'lead' as tipo_entidade,
  l.leadHash as entidade_hash,
  l.nome,
  l.cnpj,
  l.pesquisaId as pesquisa_id,
  l.projectId as project_id,
  g.id as geografia_id,
  l.mercadoId as mercado_id,
  l.email,
  l.telefone,
  l.site as site_oficial,
  l.cnae,
  l.porte,
  l.faturamentoDeclarado as faturamento_declarado,
  l.numeroEstabelecimentos as numero_estabelecimentos,
  l.qualidadeScore as qualidade_score,
  l.qualidadeClassificacao as qualidade_classificacao,
  l.validationStatus as validation_status,
  l.validationNotes as validation_notes,
  l.validatedBy as validated_by,
  l.validatedAt as validated_at,
  COALESCE(l.leadStage, l.stage) as lead_stage,
  l.stageUpdatedAt as stage_updated_at,
  l.createdAt as created_at,
  NOW() as updated_at
FROM leads l
INNER JOIN dim_geografia g ON g.cidade = l.cidade AND g.uf = l.uf
WHERE l.pesquisaId IS NOT NULL;

-- 3. Migrar CONCORRENTES
INSERT INTO fato_entidades (
  tipo_entidade, entidade_hash, nome, cnpj, pesquisa_id, project_id,
  geografia_id, mercado_id, email, telefone, site_oficial,
  cnae, porte, faturamento_declarado, faturamento_estimado, numero_estabelecimentos,
  qualidade_score, qualidade_classificacao, validation_status, validation_notes,
  validated_by, validated_at, created_at, updated_at
)
SELECT
  'concorrente' as tipo_entidade,
  co.concorrenteHash as entidade_hash,
  co.nome,
  co.cnpj,
  co.pesquisaId as pesquisa_id,
  co.projectId as project_id,
  g.id as geografia_id,
  co.mercadoId as mercado_id,
  co.email,
  co.telefone,
  co.site as site_oficial,
  co.cnae,
  co.porte,
  co.faturamentoDeclarado as faturamento_declarado,
  co.faturamentoEstimado as faturamento_estimado,
  co.numeroEstabelecimentos as numero_estabelecimentos,
  co.qualidadeScore as qualidade_score,
  co.qualidadeClassificacao as qualidade_classificacao,
  co.validationStatus as validation_status,
  co.validationNotes as validation_notes,
  co.validatedBy as validated_by,
  co.validatedAt as validated_at,
  co.createdAt as created_at,
  NOW() as updated_at
FROM concorrentes co
INNER JOIN dim_geografia g ON g.cidade = co.cidade AND g.uf = co.uf
WHERE co.pesquisaId IS NOT NULL;
```

---

## ✅ CHECKLIST DE MIGRAÇÃO

- [x] Criar dim_geografia
- [x] Popular dim_geografia com cidades_brasil
- [x] Criar dim_mercados
- [x] Criar dim_produtos
- [x] Criar fato_entidades
- [x] Criar entidade_produtos
- [x] Criar entidade_competidores
- [x] Criar fato_entidades_history
- [ ] Migrar dados de clientes
- [ ] Migrar dados de leads
- [ ] Migrar dados de concorrentes
- [ ] Migrar dados de mercados_unicos
- [ ] Migrar dados de produtos
- [ ] Criar relacionamentos entidade_produtos
- [ ] Criar relacionamentos entidade_competidores
- [ ] Atualizar schema.ts do Drizzle
- [ ] Refatorar routers
- [ ] Refatorar queries
- [ ] Atualizar enriquecimento
- [ ] Testar performance
