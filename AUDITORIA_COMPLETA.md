# 🚨 AUDITORIA COMPLETA + ARQUITETURA + PLANO DE EXECUÇÃO

**Projeto:** Intelmarket - Inteligência de Mercado  
**Data Auditoria:** 05/12/2025  
**Revisores:** Engenheiro de Dados + Arquiteto da Informação + Designer Frontend + Usuário de Teste  
**Versão:** 2.0 (com auditoria)

---

## 🚨 AUDITORIA: O QUE FOI FEITO ATÉ AGORA

### ✅ Implementações Corretas (Fase 1)

**Backend - Entidades:**
- ✅ Router TRPC `entidade.ts` completo
- ✅ Endpoints: listar, porId, atualizar, excluir
- ✅ Tabela `dim_entidade` existe no Supabase (32 entidades)

**Frontend - Entidades:**
- ✅ `EntidadesListPage.tsx` (browse com filtros)
- ✅ `EntidadeDetailsSheet.tsx` (6 abas: Cadastrais, Qualidade, Enriquecimento, Produtos, Rastreabilidade, Ações)
- ✅ `EditEntidadeDialog.tsx` criado (13 campos editáveis)
- ✅ Integração completa

**Commits:**
- ✅ `66c77b3` - Entidades: Editar Dados (GitHub ✅, Vercel ⏳)
- ✅ `829a228` - Mercados: Editar + Excluir (GitHub ✅, Vercel ⏳)
- ✅ `4f6515f` - Documentação de pendências

---

### ❌ DIVERGÊNCIAS CRIADAS (Comportamento Descuidado)

**1. Criação Manual de Tabelas SEM Schema Drizzle**

**O que fiz de errado:**
```sql
-- ERRADO: Criei dim_produto manualmente com campos inventados
CREATE TABLE dim_produto (
  sku VARCHAR(100),        -- ❌ NÃO está no schema Drizzle
  ean VARCHAR(50),         -- ❌ NÃO está no schema Drizzle
  preco_base DECIMAL,      -- ❌ NÃO está no schema Drizzle
  estoque_minimo INTEGER   -- ❌ NÃO está no schema Drizzle
);
```

**Schema Drizzle correto:**
```typescript
export const dimProduto = pgTable('dim_produto', {
  produto_hash: varchar('produto_hash', { length: 64 }).unique().notNull(), // ✅
  nome: varchar('nome', { length: 255 }).notNull(),
  categoria: varchar('categoria', { length: 100 }),
  descricao: text('descricao'),
  preco_medio: decimal('preco_medio', { precision: 12, scale: 2 }),
  unidade: varchar('unidade', { length: 20 }),
  ncm: varchar('ncm', { length: 10 }),
  enriquecido: boolean('enriquecido').default(false),  // ✅ CRÍTICO!
  enriquecido_em: timestamp('enriquecido_em'),         // ✅ CRÍTICO!
  enriquecido_por: varchar('enriquecido_por', { length: 50 }) // ✅ CRÍTICO!
});
```

**Correção aplicada:**
- ✅ DROP TABLE dim_produto CASCADE (tabela errada removida)
- ✅ CREATE TABLE dim_produto (schema Drizzle correto)
- ✅ 10 produtos de teste inseridos

---

**2. Não Considerei Processos de Importação/Enriquecimento**

**Campos críticos ignorados:**
- ❌ `produto_hash` (chave única para deduplicação)
- ❌ `enriquecido`, `enriquecido_em`, `enriquecido_por` (rastreamento de enriquecimento)
- ❌ `created_by`, `updated_by` (auditoria)

**Impacto:**
- 🚨 Processo de enriquecimento IA poderia quebrar
- 🚨 Importação CSV poderia criar duplicatas
- 🚨 Auditoria de dados comprometida

---

**3. Pendências de Deploy Não Resolvidas**

**Commits no GitHub mas não deployados:**
- ⏳ `66c77b3` - EditEntidadeDialog (código correto, bundle antigo)
- ⏳ `829a228` - MercadoDetailsSheet (código correto, bundle antigo)

**Causa raiz:**
- Vercel não disparou auto-deploy OU
- Build falhou silenciosamente OU
- Cache agressivo do CDN

---

## 📐 ARQUITETURA: FONTES DA VERDADE

### 🎯 Hierarquia de Autoridade

```
1. SCHEMA DRIZZLE (drizzle/schema.ts)
   └─> Fonte única da verdade para estrutura de dados
   └─> NUNCA criar tabelas sem consultar este arquivo

2. SUPABASE (ecnzlynmuerbmqingyfl.supabase.co)
   └─> Banco de dados PostgreSQL em produção
   └─> Acessível via MCP (manus-mcp-cli)

3. GITHUB (github.com/Sandro3110/inteligencia-de-mercado)
   └─> Repositório de código-fonte
   └─> Branch: main

4. VERCEL (inteligencia-de-mercado.vercel.app)
   └─> Frontend em produção
   └─> Auto-deploy via GitHub webhook

5. DOMÍNIO PÚBLICO (www.intelmarket.app)
   └─> Aplicação final acessível aos usuários
```

---

### 🗄️ STACK TECNOLÓGICO

**Backend:**
- Node.js 22.13.0
- TRPC (routers em `server/routers/`)
- Drizzle ORM (`drizzle/schema.ts`)
- PostgreSQL (Supabase)

**Frontend:**
- React 19
- Wouter (routing)
- Tailwind CSS 4
- shadcn/ui
- TanStack Query (TRPC client)

**Infraestrutura:**
- Vercel (hosting + serverless functions)
- Supabase (PostgreSQL + Auth)
- GitHub (source control)

---

### 🔄 FLUXOS CRÍTICOS

#### 1. Fluxo de Importação de Dados

```
CSV Upload
  ↓
Validação de Schema
  ↓
Geração de Hash (produto_hash, entidade_hash)
  ↓
Deduplicação (via hash único)
  ↓
INSERT INTO dim_* (created_by, created_at)
  ↓
Registro em dim_importacao
```

**Campos obrigatórios:**
- `*_hash` (deduplicação)
- `created_by` (auditoria)
- `created_at` (rastreamento)

---

#### 2. Fluxo de Enriquecimento com IA

```
Seleção de Entidade/Produto
  ↓
Chamada API IA (OpenAI/Anthropic)
  ↓
Parsing de Resposta
  ↓
UPDATE dim_* SET
  enriquecido = true,
  enriquecido_em = NOW(),
  enriquecido_por = 'user@email.com',
  updated_at = NOW()
  ↓
Registro em ia_usage (custo, tokens)
```

**Campos obrigatórios:**
- `enriquecido` (flag booleana)
- `enriquecido_em` (timestamp)
- `enriquecido_por` (rastreamento)

---

#### 3. Fluxo de Navegação Frontend

```
/gestao-conteudo (Desktop Turbo)
  ↓
Clique em "20 Clientes"
  ↓
/entidades/list?tipo=cliente (EntidadesListPage)
  ↓
Duplo clique em entidade
  ↓
EntidadeDetailsSheet (6 abas)
  ↓
Aba "Ações" → Botão "Editar Dados"
  ↓
EditEntidadeDialog (modal)
  ↓
Salvar → TRPC mutation → Refresh
```

---

## 🔑 CHAVES DE OURO (Regras Invioláveis)

### 1. 🗄️ SCHEMA DRIZZLE É A FONTE ÚNICA

```typescript
// ✅ SEMPRE fazer isso ANTES de criar tabelas:
1. Abrir drizzle/schema.ts
2. Localizar definição (ex: export const dimProduto)
3. Copiar EXATAMENTE os campos
4. Gerar SQL PostgreSQL compatível
5. Executar no Supabase
```

**❌ NUNCA:**
- Criar tabelas "na cabeça"
- Inventar campos sem consultar schema
- Usar sintaxe MySQL em PostgreSQL

---

### 2. 🔄 PROCESSOS DE IMPORTAÇÃO/ENRIQUECIMENTO SÃO SAGRADOS

**Campos obrigatórios em TODAS as tabelas dim_*:**
```sql
-- Deduplicação
*_hash VARCHAR(64) UNIQUE NOT NULL

-- Enriquecimento
enriquecido BOOLEAN DEFAULT false
enriquecido_em TIMESTAMP
enriquecido_por VARCHAR(50)

-- Auditoria
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
created_by INTEGER
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_by INTEGER
```

---

### 3. 📦 VALIDAÇÃO EM 3 CAMADAS

**Antes de marcar fase como concluída:**

```sql
-- 1. BANCO DE DADOS
SELECT COUNT(*) FROM dim_produto; -- Esperado: >= 10

-- 2. BACKEND (TRPC)
// Testar endpoint via MCP ou Postman
trpc.produto.listar.query({ limit: 10 })

-- 3. FRONTEND (Browser)
// Abrir página em produção
https://intelmarket.app/produtos
// Verificar se lista carrega
```

**✅ Fase só é concluída quando as 3 camadas funcionam!**

---

### 4. 🚀 DEPLOY É PARTE DA FASE

**Checklist obrigatório:**

```bash
# 1. Commit
git add .
git commit -m "feat(fase-X): descrição"

# 2. Push
git push origin main

# 3. Aguardar deploy Vercel (2-5 min)

# 4. Validar em produção
curl https://intelmarket.app/api/health

# 5. Testar no browser
# Abrir URL, fazer fluxo completo

# 6. Documentar em PENDENCIAS.md se houver bloqueio
```

---

### 5. 🧪 FRONTEND SÓ DEPOIS DO BACKEND

**Ordem correta:**

```
1. ✅ Criar tabela (schema Drizzle)
2. ✅ Inserir dados de teste (10+ registros)
3. ✅ Criar router TRPC
4. ✅ Testar endpoint via MCP
5. ✅ Criar componente frontend
6. ✅ Testar em produção
```

**❌ NUNCA:**
- Criar frontend sem backend funcional
- Assumir que "API vai funcionar depois"
- Deixar placeholders sem documentar

---

## 📊 ESTADO ATUAL DAS TABELAS (Auditoria Supabase)

### ✅ Tabelas Corretas (Schema Drizzle)

| Tabela | Registros | Status | Observações |
|--------|-----------|--------|-------------|
| `dim_entidade` | 32 | ✅ OK | Clientes, Leads, Concorrentes |
| `dim_mercado` | 1 | ✅ OK | "Varejo de Eletrônicos e Móveis Online" |
| `dim_produto` | 10 | ✅ OK | Recém criada (schema correto) |
| `dim_produto_catalogo` | ? | ⚠️ Verificar | Tabela separada (catálogo interno) |
| `fato_entidade_contexto` | ? | ✅ OK | Relacionamento entidades |
| `fato_entidade_produto` | 0 | ✅ OK | Recém criada (aguardando dados) |
| `fato_produto_mercado` | 0 | ❌ NÃO EXISTE | Precisa criar |

---

### ❌ Tabelas Removidas (Criadas Incorretamente)

| Tabela | Motivo da Remoção |
|--------|-------------------|
| `dim_produto` (v1) | Campos errados (sku, ean, estoque) - não seguia schema Drizzle |
| `fato_entidade_produto` (v1) | FK errada (entidade_id vs id) |
| `fato_produto_mercado` (v1) | Criada sem validar schema |

---

## 📋 PENDÊNCIAS CONSOLIDADAS

### 🚨 CRÍTICAS (Bloqueiam progresso)

**PENDÊNCIA #1: Deploy Vercel Travado**
- **Commits:** `66c77b3`, `829a228`
- **Código:** ✅ Correto no GitHub
- **Bundle:** ❌ Não atualizado em produção
- **Ação:** Verificar painel Vercel + forçar redeploy

**PENDÊNCIA #2: Frontend de Produtos Não Implementado**
- **Backend:** ✅ Tabela + API OK
- **Frontend:** ❌ Só placeholder ("Funcionalidade em desenvolvimento")
- **Ação:** Implementar ProdutosListPage + ProdutoDetailsSheet (FASE 2)

**PENDÊNCIA #3: Tabela fato_produto_mercado Ausente**
- **Schema Drizzle:** ⚠️ Precisa verificar se existe definição
- **Supabase:** ❌ Não criada
- **Ação:** Verificar schema + criar se necessário

---

### ⚠️ MÉDIAS (Não bloqueiam, mas precisam atenção)

**PENDÊNCIA #4: Validação de Processos ETL**
- **Importação:** ⚠️ Não testada com dim_produto nova
- **Enriquecimento:** ⚠️ Não testada com dim_produto nova
- **Ação:** Testar fluxo completo (CSV → Import → Enrich)

**PENDÊNCIA #5: Índices de Performance**
- **dim_produto:** ⚠️ Índices básicos criados, mas não validados
- **Ação:** Executar EXPLAIN ANALYZE em queries críticas

---

## 🚀 PLANO DE EXECUÇÃO REVISADO

### FASE 0: CORREÇÃO DE DIVERGÊNCIAS (NOVA - URGENTE)

**Duração:** 4h  
**Responsáveis:** Engenheiro de Dados + Arquiteto

#### Subfase 0.1: Resolver Deploy Vercel (1h)

**Tarefas:**
1. [ ] Acessar painel Vercel
2. [ ] Verificar logs de build dos commits `66c77b3` e `829a228`
3. [ ] Identificar erro (se houver)
4. [ ] Forçar redeploy manual
5. [ ] Aguardar 5-10 min
6. [ ] Validar em https://intelmarket.app

**Validação:**
```bash
# Testar EditEntidadeDialog
1. Login em intelmarket.app
2. Gestão de Conteúdo → Clientes
3. Duplo clique em Magazine Luiza
4. Aba Ações → Editar Dados
5. Modal deve abrir com 13 campos
```

---

#### Subfase 0.2: Validar Schema Completo (2h)

**Tarefas:**
1. [ ] Ler `drizzle/schema.ts` linha por linha
2. [ ] Listar TODAS as tabelas definidas
3. [ ] Comparar com Supabase (via MCP)
4. [ ] Criar tabelas faltantes
5. [ ] Documentar divergências em ARQUITETURA.md

**Query de auditoria:**
```sql
-- Listar tabelas no schema Drizzle
grep "export const.*pgTable" drizzle/schema.ts

-- Listar tabelas no Supabase
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Comparar (manual)
```

---

#### Subfase 0.3: Testar Processos ETL (1h)

**Tarefas:**
1. [ ] Criar CSV de teste com 5 produtos
2. [ ] Importar via interface /importar-dados
3. [ ] Verificar se `produto_hash` é gerado
4. [ ] Verificar se `created_by` é preenchido
5. [ ] Testar enriquecimento IA em 1 produto
6. [ ] Verificar se `enriquecido = true` após enriquecimento

**CSV de teste:**
```csv
nome,categoria,descricao,preco_medio,unidade,ncm
"Produto Teste 1","Eletrônicos","Descrição teste",100.00,"unidade","12345678"
```

---

### FASE 1: Fundação - Entidades (✅ 95% CONCLUÍDA)

**Status:** ✅ Quase completa  
**Pendente:** Validar deploy de EditEntidadeDialog

**Checklist final:**
- [x] Backend completo
- [x] Frontend completo
- [x] EditEntidadeDialog criado
- [ ] Deploy validado em produção ← **BLOQUEIO**
- [ ] Teste end-to-end completo

---

### FASE 2: Fundação - Produtos (🔄 30% CONCLUÍDA)

**Status:** 🔄 Em andamento  
**Concluído:**
- [x] Tabela dim_produto (schema Drizzle correto)
- [x] 10 produtos de teste
- [x] Tabela fato_entidade_produto

**Pendente:**
- [ ] Router TRPC `produto.ts` (verificar se existe)
- [ ] Frontend ProdutosListPage (implementar)
- [ ] Frontend ProdutoDetailsSheet (implementar)
- [ ] Ações Editar/Excluir produtos
- [ ] Validação em produção

---

### FASE 3: Fundação - Mercados (🔄 60% CONCLUÍDA)

**Status:** 🔄 Em andamento  
**Concluído:**
- [x] Tabela dim_mercado (1 mercado)
- [x] Router TRPC `mercado.ts`
- [x] MercadoDetailsSheet criado
- [x] EditMercadoDialog criado

**Pendente:**
- [ ] Deploy validado em produção ← **BLOQUEIO**
- [ ] Teste end-to-end completo
- [ ] Inserir mais mercados de teste (mínimo 10)

---

### FASES 4-20: (⚪ NÃO INICIADAS)

Manter conforme PLANO_EXECUCAO_SEQUENCIAL.md original.

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### 1. RESOLVER PENDÊNCIA #1 (Deploy Vercel)
**Tempo:** 30 min  
**Ação:** Forçar redeploy manual no painel Vercel

### 2. VALIDAR FASE 1 (Entidades)
**Tempo:** 15 min  
**Ação:** Testar EditEntidadeDialog em produção

### 3. COMPLETAR FASE 2 (Produtos)
**Tempo:** 6h  
**Ação:** Implementar ProdutosListPage + ProdutoDetailsSheet

### 4. VALIDAR FASE 3 (Mercados)
**Tempo:** 15 min  
**Ação:** Testar MercadoDetailsSheet em produção

---

## 📝 LIÇÕES APRENDIDAS

### ❌ O QUE NÃO FAZER NUNCA MAIS

1. **Criar tabelas sem consultar Schema Drizzle**
   - Sempre ler `drizzle/schema.ts` ANTES
   
2. **Ignorar processos de Importação/Enriquecimento**
   - Campos `*_hash`, `enriquecido*`, `created_by` são CRÍTICOS

3. **Assumir que deploy funcionou**
   - SEMPRE validar em produção após commit

4. **Criar frontend sem backend testado**
   - Backend → Teste → Frontend (nessa ordem)

---

### ✅ O QUE FAZER SEMPRE

1. **Consultar 4 fontes da verdade:**
   - Schema Drizzle
   - Supabase (via MCP)
   - GitHub (código)
   - Vercel/intelmarket.app (produção)

2. **Validar em 3 camadas:**
   - Banco de dados (SQL)
   - Backend (TRPC)
   - Frontend (Browser)

3. **Documentar divergências imediatamente:**
   - PENDENCIAS.md
   - Commits descritivos

4. **Testar processos críticos:**
   - Importação CSV
   - Enriquecimento IA
   - Navegação end-to-end

---

**FIM DA AUDITORIA**

---

*As 20 fases originais do PLANO_EXECUCAO_SEQUENCIAL.md continuam válidas e devem ser seguidas após correção das pendências acima.*
