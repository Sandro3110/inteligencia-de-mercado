# 🎯 PLANO OTIMIZADO - FOCO EM PRODUTIVIDADE

**Projeto:** Intelmarket - Inteligência de Mercado  
**Auditor:** Digital Productivity Auditor  
**Data:** 05/12/2025  
**Versão:** 3.0 (Otimizado para Execução em Lote)

---

## 🧭 PRINCÍPIOS DO AUDITOR

### 1. **VARREDURA COMPLETA ANTES DE AGIR**

❌ **Abordagem antiga (ineficiente):**
```
Fase 1: Criar tabela dim_entidade
Fase 2: Criar tabela dim_produto  ← Descobrir que faltam campos
Fase 3: Criar tabela dim_mercado   ← Descobrir que faltam FKs
Fase 4: Voltar e corrigir tudo     ← RETRABALHO!
```

✅ **Abordagem otimizada:**
```
LOTE 1: VARREDURA COMPLETA
  ├─ Ler schema Drizzle INTEIRO (1 vez)
  ├─ Listar TODAS as tabelas necessárias
  ├─ Mapear TODOS os relacionamentos
  ├─ Identificar TODOS os índices
  └─ Criar TODAS as tabelas de uma vez

LOTE 2: VALIDAÇÃO COMPLETA
  ├─ Testar TODAS as queries
  ├─ Inserir dados de teste em TODAS
  └─ Validar integridade referencial
```

**Ganho:** Evita 70% do retrabalho

---

### 2. **FOCO NO CORE DO SISTEMA**

**CORE = 4 Pilares:**

```
1. IMPORTAÇÃO
   └─ CSV → Validação → Hash → INSERT

2. ENRIQUECIMENTO
   └─ Seleção → API IA → Parsing → UPDATE

3. GRAVAÇÃO
   └─ Auditoria → Soft Delete → Versionamento

4. GESTÃO
   └─ Browse → Detalhes → Editar → Excluir
```

**Tudo que NÃO é CORE é secundário!**

Exemplos de secundário:
- Tours guiados
- Exportação CSV
- Análises avançadas
- Dashboards bonitos

**Regra:** CORE primeiro, secundário depois.

---

### 3. **EQUIPE MULTIDISCIPLINAR COM PAPÉIS CLAROS**

**🗄️ Engenheiro de Dados (ED)**
- Responsável: Schema, migrations, índices
- Entrega: Tabelas + dados de teste + queries validadas
- Critério: 100% das queries < 100ms

**🏗️ Arquiteto da Informação (AI)**
- Responsável: Fluxos, relacionamentos, integridade
- Entrega: Diagramas + documentação + validação de FKs
- Critério: 0 inconsistências de dados

**🎨 Designer de Frontend (DF)**
- Responsável: Componentes, navegação, UX
- Entrega: Páginas + componentes + testes visuais
- Critério: 100% das ações funcionais

**🧪 Usuário de Teste (UT)**
- Responsável: Validação end-to-end, bugs, usabilidade
- Entrega: Relatório de testes + bugs encontrados
- Critério: 0 bugs críticos, < 3 bugs médios

---

### 4. **PROTOCOLO DE PENDÊNCIAS**

**Se houver falhas ou não atingimento de objetivos:**

```
1. PARAR execução da fase
2. CRIAR documento PENDENCIAS_FASE_X.md
3. REGISTRAR:
   - O que deveria funcionar
   - O que não funciona
   - Causa raiz
   - Impacto
   - Responsável
4. DISCUSSÃO multidisciplinar (30 min)
5. DECISÃO: corrigir agora OU documentar e seguir
6. ATUALIZAR PENDENCIAS.md consolidado
```

**Documento único:** `PENDENCIAS.md` (já existe)

---

## 🚀 PLANO REORGANIZADO EM LOTES

---

## 📦 LOTE 0: VARREDURA E CORREÇÃO (URGENTE)

**Duração:** 6h  
**Objetivo:** Descobrir TUDO que está faltando/errado de uma vez

---

### LOTE 0.1: VARREDURA COMPLETA DO SCHEMA (2h)

**Responsável:** 🗄️ ED + 🏗️ AI

**Tarefas:**

1. **Ler schema Drizzle completo** (drizzle/schema.ts)
   ```bash
   # Extrair TODAS as tabelas
   grep "export const.*pgTable" drizzle/schema.ts > tabelas_drizzle.txt
   
   # Contar: quantas tabelas?
   wc -l tabelas_drizzle.txt
   ```

2. **Listar TODAS as tabelas no Supabase**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

3. **Comparar e identificar GAPs**
   ```
   Drizzle: 25 tabelas
   Supabase: 18 tabelas
   GAP: 7 tabelas faltando!
   ```

4. **Mapear TODOS os relacionamentos**
   ```
   dim_entidade → fato_entidade_contexto (1:N)
   dim_produto → fato_entidade_produto (N:N via contexto)
   dim_mercado → fato_produto_mercado (N:N)
   ```

5. **Criar planilha de execução**
   ```
   | Tabela | Existe? | Campos OK? | FKs OK? | Índices OK? | Ação |
   |--------|---------|------------|---------|-------------|------|
   | dim_entidade | ✅ | ✅ | ✅ | ⚠️ | Criar índice ncm |
   | dim_produto | ✅ | ✅ | ✅ | ❌ | Criar índices |
   | dim_mercado | ✅ | ⚠️ | ✅ | ❌ | Adicionar campos + índices |
   | fato_produto_mercado | ❌ | - | - | - | CRIAR TUDO |
   ```

**Entrega:** `SCHEMA_AUDIT.xlsx` (planilha completa)

**Critério de sucesso:**
- ✅ 100% das tabelas Drizzle mapeadas
- ✅ GAPs identificados
- ✅ Plano de ação claro

---

### LOTE 0.2: EXECUÇÃO EM LOTE (3h)

**Responsável:** 🗄️ ED

**Tarefas:**

1. **Criar TODAS as tabelas faltantes de uma vez**
   ```sql
   -- Script único com TODAS as tabelas
   CREATE TABLE fato_produto_mercado (...);
   CREATE TABLE dim_canal (...);
   CREATE TABLE dim_geografia (...);
   -- etc.
   ```

2. **Adicionar TODOS os campos faltantes de uma vez**
   ```sql
   -- Script único com TODOS os ALTERs
   ALTER TABLE dim_mercado ADD COLUMN sentimento VARCHAR(50);
   ALTER TABLE dim_mercado ADD COLUMN score_atratividade DECIMAL(5,2);
   -- etc.
   ```

3. **Criar TODOS os índices de uma vez**
   ```sql
   -- Script único com TODOS os índices
   CREATE INDEX idx_produto_categoria ON dim_produto(categoria);
   CREATE INDEX idx_produto_ncm ON dim_produto(ncm);
   CREATE INDEX idx_entidade_cnpj ON dim_entidade(cnpj);
   -- etc. (20+ índices)
   ```

4. **Validar integridade referencial**
   ```sql
   -- Testar TODAS as FKs
   SELECT * FROM fato_entidade_produto fep
   LEFT JOIN dim_produto p ON fep.produto_id = p.id
   WHERE p.id IS NULL; -- Deve retornar 0 linhas
   ```

**Entrega:** 
- `migrations/001_schema_completo.sql` (script único)
- `SCHEMA_VALIDATION.md` (relatório de validação)

**Critério de sucesso:**
- ✅ 0 tabelas faltando
- ✅ 0 campos faltando
- ✅ 0 FKs quebradas
- ✅ Todos os índices criados

---

### LOTE 0.3: DADOS DE TESTE EM LOTE (1h)

**Responsável:** 🗄️ ED + 🏗️ AI

**Tarefas:**

1. **Criar script de seed COMPLETO**
   ```sql
   -- Inserir dados em TODAS as tabelas de uma vez
   INSERT INTO dim_entidade (...) VALUES (...); -- 50 entidades
   INSERT INTO dim_produto (...) VALUES (...);  -- 50 produtos
   INSERT INTO dim_mercado (...) VALUES (...);  -- 10 mercados
   INSERT INTO fato_entidade_produto (...) VALUES (...); -- 200 relacionamentos
   -- etc.
   ```

2. **Executar seed**
   ```bash
   psql -f seed_completo.sql
   ```

3. **Validar contagens**
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM dim_entidade) as entidades,
     (SELECT COUNT(*) FROM dim_produto) as produtos,
     (SELECT COUNT(*) FROM dim_mercado) as mercados,
     (SELECT COUNT(*) FROM fato_entidade_produto) as relacoes;
   
   -- Esperado: 50, 50, 10, 200
   ```

**Entrega:** `seed_completo.sql`

**Critério de sucesso:**
- ✅ Todas as tabelas com >= 10 registros
- ✅ Relacionamentos válidos (FKs funcionando)

---

## 📦 LOTE 1: CORE - IMPORTAÇÃO (PRIORIDADE MÁXIMA)

**Duração:** 8h  
**Objetivo:** Sistema completo de importação CSV funcionando

---

### LOTE 1.1: VARREDURA DE REQUISITOS (1h)

**Responsável:** 🏗️ AI + 🗄️ ED

**Tarefas:**

1. **Mapear TODOS os tipos de importação**
   ```
   - Importação de Entidades (clientes, leads, concorrentes)
   - Importação de Produtos
   - Importação de Mercados
   - Importação de Relacionamentos (entidade-produto)
   ```

2. **Definir schema CSV para CADA tipo**
   ```csv
   # entidades.csv
   nome,cnpj,email,telefone,cidade,estado,tipo_entidade
   
   # produtos.csv
   nome,categoria,descricao,preco_medio,unidade,ncm
   
   # mercados.csv
   nome,categoria,segmentacao,tamanho_mercado
   ```

3. **Mapear TODAS as validações necessárias**
   ```
   - CNPJ: validar dígitos verificadores
   - Email: validar formato
   - Telefone: normalizar (11) 99999-9999
   - NCM: validar 8 dígitos
   - Hash: gerar MD5(nome + cnpj/sku)
   ```

4. **Identificar TODAS as tabelas auxiliares**
   ```
   - dim_importacao (registro de cada importação)
   - importacao_erros (log de erros)
   - dim_status_qualificacao (status de validação)
   ```

**Entrega:** `SPEC_IMPORTACAO.md` (especificação completa)

---

### LOTE 1.2: IMPLEMENTAÇÃO COMPLETA (5h)

**Responsável:** 🗄️ ED + 🎨 DF

**Tarefas:**

1. **Criar TODOS os endpoints de importação de uma vez**
   ```typescript
   // server/routers/importacao.ts
   export const importacaoRouter = router({
     importarEntidades: publicProcedure.input(...).mutation(...),
     importarProdutos: publicProcedure.input(...).mutation(...),
     importarMercados: publicProcedure.input(...).mutation(...),
     listarImportacoes: publicProcedure.query(...),
     obterErros: publicProcedure.input(...).query(...)
   });
   ```

2. **Implementar TODAS as validações de uma vez**
   ```typescript
   // lib/validators.ts
   export const validarCNPJ = (cnpj: string) => { ... }
   export const validarEmail = (email: string) => { ... }
   export const validarTelefone = (tel: string) => { ... }
   export const validarNCM = (ncm: string) => { ... }
   export const gerarHash = (tipo: string, dados: any) => { ... }
   ```

3. **Criar interface completa de importação**
   ```typescript
   // pages/ImportarDados.tsx
   - Upload CSV (drag & drop)
   - Seleção de tipo (entidades/produtos/mercados)
   - Preview de dados (10 primeiras linhas)
   - Validação em tempo real
   - Barra de progresso
   - Log de erros
   - Botão "Importar"
   ```

**Entrega:**
- `server/routers/importacao.ts`
- `lib/validators.ts`
- `pages/ImportarDados.tsx`
- `components/ImportacaoPreview.tsx`

---

### LOTE 1.3: VALIDAÇÃO END-TO-END (2h)

**Responsável:** 🧪 UT + 🏗️ AI

**Tarefas:**

1. **Testar TODOS os cenários de importação**
   ```
   ✅ CSV válido (50 linhas) → 50 inserções
   ✅ CSV com erros (10/50 inválidas) → 40 inserções + 10 erros logados
   ✅ CSV duplicado (hash existente) → 0 inserções + aviso
   ✅ CSV vazio → erro claro
   ✅ CSV com colunas faltando → erro claro
   ```

2. **Validar TODOS os campos após importação**
   ```sql
   -- Verificar se hash foi gerado
   SELECT COUNT(*) FROM dim_entidade WHERE entidade_hash IS NULL;
   -- Esperado: 0
   
   -- Verificar se created_by foi preenchido
   SELECT COUNT(*) FROM dim_produto WHERE created_by IS NULL;
   -- Esperado: 0
   ```

3. **Testar interface completa**
   ```
   1. Upload CSV entidades
   2. Preview mostra 10 linhas
   3. Clicar "Importar"
   4. Barra de progresso funciona
   5. Mensagem de sucesso aparece
   6. Ir para /entidades → ver dados importados
   ```

**Entrega:** `TESTE_IMPORTACAO.md` (relatório completo)

**Critério de sucesso:**
- ✅ 100% dos cenários testados passam
- ✅ 0 bugs críticos
- ✅ Tempo de importação < 5s para 100 linhas

---

## 📦 LOTE 2: CORE - ENRIQUECIMENTO (PRIORIDADE MÁXIMA)

**Duração:** 10h  
**Objetivo:** Sistema completo de enriquecimento com IA funcionando

---

### LOTE 2.1: VARREDURA DE REQUISITOS (2h)

**Responsável:** 🏗️ AI + 🗄️ ED

**Tarefas:**

1. **Mapear TODOS os tipos de enriquecimento**
   ```
   - Enriquecimento de Entidades
     ├─ Dados cadastrais (endereço completo, website)
     ├─ Dados financeiros (receita, funcionários)
     ├─ Dados de mercado (segmento, concorrentes)
     └─ Score de qualificação
   
   - Enriquecimento de Produtos
     ├─ Descrição detalhada
     ├─ Especificações técnicas
     ├─ Público-alvo
     └─ Diferenciais competitivos
   
   - Enriquecimento de Mercados
     ├─ Tamanho de mercado
     ├─ Tendências
     ├─ Principais players
     └─ Oportunidades e riscos
   ```

2. **Definir prompts de IA para CADA tipo**
   ```typescript
   // prompts/entidade.ts
   export const promptEnriquecerEntidade = (entidade) => `
   Você é um analista de mercado...
   Enriqueça os dados da empresa: ${entidade.nome}
   CNPJ: ${entidade.cnpj}
   ...
   Retorne JSON com: {receita, funcionarios, segmento, ...}
   `;
   
   // prompts/produto.ts
   export const promptEnriquecerProduto = (produto) => `...`;
   
   // prompts/mercado.ts
   export const promptEnriquecerMercado = (mercado) => `...`;
   ```

3. **Mapear TODAS as tabelas de controle**
   ```
   - ia_usage (log de uso de IA)
   - ia_cache (cache de respostas)
   - ia_config (configuração de modelos)
   - ia_alertas (alertas de custo/segurança)
   ```

4. **Definir estratégia de cache**
   ```
   - Cache por hash de prompt (evitar chamadas duplicadas)
   - TTL: 30 dias
   - Invalidação: manual ou por mudança de dados
   ```

**Entrega:** `SPEC_ENRIQUECIMENTO.md`

---

### LOTE 2.2: IMPLEMENTAÇÃO COMPLETA (6h)

**Responsável:** 🗄️ ED + 🎨 DF

**Tarefas:**

1. **Criar TODOS os endpoints de enriquecimento de uma vez**
   ```typescript
   // server/routers/enriquecimento.ts
   export const enriquecimentoRouter = router({
     enriquecerEntidade: publicProcedure.input(...).mutation(...),
     enriquecerProduto: publicProcedure.input(...).mutation(...),
     enriquecerMercado: publicProcedure.input(...).mutation(...),
     enriquecerLote: publicProcedure.input(...).mutation(...), // Múltiplos de uma vez
     obterHistorico: publicProcedure.query(...),
     obterCustos: publicProcedure.query(...)
   });
   ```

2. **Implementar TODOS os prompts e parsers**
   ```typescript
   // lib/ia/prompts.ts
   export const prompts = {
     entidade: (data) => `...`,
     produto: (data) => `...`,
     mercado: (data) => `...`
   };
   
   // lib/ia/parsers.ts
   export const parsers = {
     entidade: (response) => { /* parse JSON */ },
     produto: (response) => { /* parse JSON */ },
     mercado: (response) => { /* parse JSON */ }
   };
   ```

3. **Implementar sistema de cache completo**
   ```typescript
   // lib/ia/cache.ts
   export const cacheIA = {
     get: async (hash) => { /* buscar em ia_cache */ },
     set: async (hash, response, ttl) => { /* salvar */ },
     invalidate: async (tipo, id) => { /* limpar cache */ }
   };
   ```

4. **Criar interface completa de enriquecimento**
   ```typescript
   // pages/EnriquecerComIA.tsx
   - Seleção de tipo (entidades/produtos/mercados)
   - Filtros (não enriquecidos, por categoria, etc.)
   - Lista com checkboxes (seleção múltipla)
   - Botão "Enriquecer Selecionados"
   - Modal de confirmação (custo estimado)
   - Barra de progresso
   - Log de resultados
   ```

**Entrega:**
- `server/routers/enriquecimento.ts`
- `lib/ia/prompts.ts`
- `lib/ia/parsers.ts`
- `lib/ia/cache.ts`
- `pages/EnriquecerComIA.tsx`

---

### LOTE 2.3: VALIDAÇÃO END-TO-END (2h)

**Responsável:** 🧪 UT + 🏗️ AI

**Tarefas:**

1. **Testar TODOS os cenários de enriquecimento**
   ```
   ✅ Enriquecer 1 entidade → campos preenchidos + enriquecido=true
   ✅ Enriquecer 10 entidades em lote → todas processadas
   ✅ Enriquecer entidade já enriquecida → usar cache (0 custo)
   ✅ Enriquecer com erro de API → log de erro + retry
   ✅ Enriquecer sem créditos → erro claro
   ```

2. **Validar TODOS os campos após enriquecimento**
   ```sql
   -- Verificar se enriquecido foi marcado
   SELECT COUNT(*) FROM dim_entidade 
   WHERE enriquecido = true AND enriquecido_em IS NULL;
   -- Esperado: 0
   
   -- Verificar se dados foram preenchidos
   SELECT COUNT(*) FROM dim_entidade 
   WHERE enriquecido = true AND receita_estimada IS NULL;
   -- Esperado: < 10% (alguns podem não ter receita)
   ```

3. **Validar custos e cache**
   ```sql
   -- Verificar se uso foi registrado
   SELECT SUM(tokens_usados), SUM(custo_usd) FROM ia_usage;
   
   -- Verificar se cache está funcionando
   SELECT COUNT(*) FROM ia_cache;
   -- Esperado: >= número de enriquecimentos únicos
   ```

**Entrega:** `TESTE_ENRIQUECIMENTO.md`

**Critério de sucesso:**
- ✅ 100% dos cenários testados passam
- ✅ Cache funciona (2ª chamada = 0 custo)
- ✅ Tempo de enriquecimento < 10s por item

---

## 📦 LOTE 3: CORE - GRAVAÇÃO E AUDITORIA

**Duração:** 4h  
**Objetivo:** Sistema completo de auditoria e soft delete

---

### LOTE 3.1: IMPLEMENTAÇÃO EM LOTE (3h)

**Responsável:** 🗄️ ED

**Tarefas:**

1. **Adicionar campos de auditoria em TODAS as tabelas**
   ```sql
   -- Script único para TODAS as tabelas
   ALTER TABLE dim_entidade ADD COLUMN deleted_at TIMESTAMP;
   ALTER TABLE dim_entidade ADD COLUMN deleted_by INTEGER;
   ALTER TABLE dim_produto ADD COLUMN deleted_at TIMESTAMP;
   ALTER TABLE dim_produto ADD COLUMN deleted_by INTEGER;
   -- etc. (15+ tabelas)
   ```

2. **Criar triggers de auditoria para TODAS as tabelas**
   ```sql
   -- Trigger de UPDATE automático para updated_at
   CREATE OR REPLACE FUNCTION update_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = CURRENT_TIMESTAMP;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Aplicar em TODAS as tabelas
   CREATE TRIGGER trg_entidade_updated_at
   BEFORE UPDATE ON dim_entidade
   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   
   -- Repetir para dim_produto, dim_mercado, etc.
   ```

3. **Criar tabela de audit_logs**
   ```sql
   CREATE TABLE audit_logs (
     id SERIAL PRIMARY KEY,
     tabela VARCHAR(100) NOT NULL,
     registro_id INTEGER NOT NULL,
     acao VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
     dados_antigos JSONB,
     dados_novos JSONB,
     usuario_id INTEGER,
     ip_address VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

**Entrega:** `migrations/002_auditoria_completa.sql`

---

### LOTE 3.2: VALIDAÇÃO (1h)

**Responsável:** 🧪 UT

**Tarefas:**

1. **Testar soft delete**
   ```sql
   -- Deletar entidade
   UPDATE dim_entidade SET deleted_at = NOW(), deleted_by = 1 WHERE id = 1;
   
   -- Verificar se não aparece em queries
   SELECT * FROM dim_entidade WHERE deleted_at IS NULL;
   -- Não deve incluir id=1
   ```

2. **Testar auditoria**
   ```sql
   -- Fazer UPDATE
   UPDATE dim_produto SET preco_medio = 999.99 WHERE id = 1;
   
   -- Verificar log
   SELECT * FROM audit_logs WHERE tabela = 'dim_produto' AND registro_id = 1;
   -- Deve ter 1 registro com dados_antigos e dados_novos
   ```

**Entrega:** `TESTE_AUDITORIA.md`

---

## 📦 LOTE 4: CORE - GESTÃO (Browse + Detalhes + Ações)

**Duração:** 12h  
**Objetivo:** Interface completa de gestão para TODAS as entidades

---

### LOTE 4.1: VARREDURA DE COMPONENTES (1h)

**Responsável:** 🎨 DF + 🏗️ AI

**Tarefas:**

1. **Mapear TODOS os componentes necessários**
   ```
   BROWSE (Listagem):
   - EntidadesListPage ✅ (já existe)
   - ProdutosListPage ❌ (criar)
   - MercadosListPage ⚠️ (existe mas incompleto)
   
   DETALHES (Sheet):
   - EntidadeDetailsSheet ✅ (já existe)
   - ProdutoDetailsSheet ❌ (criar)
   - MercadoDetailsSheet ✅ (já existe, aguardando deploy)
   
   AÇÕES (Dialogs):
   - EditEntidadeDialog ✅ (já existe, aguardando deploy)
   - EditProdutoDialog ❌ (criar)
   - EditMercadoDialog ✅ (já existe, aguardando deploy)
   ```

2. **Identificar padrões reutilizáveis**
   ```typescript
   // Criar componentes genéricos
   - DataTable<T> (tabela genérica com filtros)
   - DetailsSheet<T> (sheet genérico com abas)
   - EditDialog<T> (modal genérico de edição)
   - ActionButtons (botões padrão: editar, excluir, exportar)
   ```

**Entrega:** `COMPONENTES_MAPEADOS.md`

---

### LOTE 4.2: IMPLEMENTAÇÃO EM LOTE (8h)

**Responsável:** 🎨 DF

**Tarefas:**

1. **Criar componentes genéricos PRIMEIRO**
   ```typescript
   // components/DataTable.tsx (2h)
   - Genérico com <T>
   - Filtros dinâmicos
   - Paginação
   - Ordenação
   - Seleção múltipla
   
   // components/DetailsSheet.tsx (2h)
   - Genérico com <T>
   - Sistema de abas
   - Carregamento lazy
   - Ações no footer
   
   // components/EditDialog.tsx (2h)
   - Genérico com <T>
   - Formulário dinâmico (baseado em schema)
   - Validações
   - Loading states
   ```

2. **Criar páginas específicas usando genéricos** (2h)
   ```typescript
   // pages/ProdutosListPage.tsx
   <DataTable<Produto>
     columns={produtoColumns}
     filters={produtoFilters}
     onRowClick={openProdutoSheet}
   />
   
   // Similar para outras entidades
   ```

**Entrega:**
- `components/DataTable.tsx`
- `components/DetailsSheet.tsx`
- `components/EditDialog.tsx`
- `pages/ProdutosListPage.tsx`
- `components/ProdutoDetailsSheet.tsx`
- `components/EditProdutoDialog.tsx`

---

### LOTE 4.3: VALIDAÇÃO END-TO-END (3h)

**Responsável:** 🧪 UT

**Tarefas:**

1. **Testar TODOS os fluxos de gestão**
   ```
   ENTIDADES:
   ✅ Browse → filtrar → ordenar → clicar → detalhes → editar → salvar
   
   PRODUTOS:
   ✅ Browse → filtrar → ordenar → clicar → detalhes → editar → salvar
   
   MERCADOS:
   ✅ Browse → filtrar → ordenar → clicar → detalhes → editar → salvar
   ```

2. **Testar TODAS as ações**
   ```
   ✅ Editar Dados (modal abre, campos preenchidos, salvar funciona)
   ✅ Excluir (confirmação, soft delete, desaparece da lista)
   ✅ Exportar (CSV gerado, dados corretos)
   ✅ Enriquecer (modal abre, enriquecimento funciona)
   ```

**Entrega:** `TESTE_GESTAO_COMPLETO.md`

**Critério de sucesso:**
- ✅ 100% dos fluxos funcionam
- ✅ 0 bugs críticos
- ✅ Tempo de carregamento < 2s

---

## 📊 RESUMO DE GANHOS DE PRODUTIVIDADE

### ❌ Abordagem Antiga (Sequencial)

```
Fase 1: Entidades (10h)
Fase 2: Produtos (10h) ← descobrir que schema está errado
Fase 3: Corrigir schema (2h) ← RETRABALHO
Fase 4: Mercados (10h) ← descobrir que faltam índices
Fase 5: Corrigir índices (1h) ← RETRABALHO
Fase 6: Implementar importação (8h)
Fase 7: Implementar enriquecimento (10h)
Fase 8: Descobrir que faltam campos de auditoria (2h) ← RETRABALHO
Fase 9: Corrigir auditoria (3h) ← RETRABALHO

TOTAL: 56h (com 8h de retrabalho = 14% desperdício)
```

---

### ✅ Abordagem Otimizada (Lotes)

```
LOTE 0: Varredura + Correção (6h)
  └─ Descobre TUDO de uma vez

LOTE 1: Importação (8h)
  └─ Implementa TUDO de uma vez

LOTE 2: Enriquecimento (10h)
  └─ Implementa TUDO de uma vez

LOTE 3: Auditoria (4h)
  └─ Implementa TUDO de uma vez

LOTE 4: Gestão (12h)
  └─ Implementa TUDO de uma vez

TOTAL: 40h (0h de retrabalho = 0% desperdício)
```

**GANHO: 16h (28% mais rápido)**

---

## 🎯 MISSÃO PARA A EQUIPE

### 📋 PROTOCOLO DE EXECUÇÃO

**Antes de cada LOTE:**

1. ✅ **Reunião de planejamento** (30 min)
   - Revisar objetivos do lote
   - Dividir tarefas por disciplina
   - Definir critérios de sucesso

2. ✅ **Execução paralela** (tempo do lote)
   - ED: trabalha no banco
   - DF: trabalha no frontend
   - AI: valida fluxos
   - UT: prepara testes

3. ✅ **Validação conjunta** (1h)
   - Testar TUDO junto
   - Identificar bugs
   - Documentar pendências

4. ✅ **Retrospectiva** (30 min)
   - O que funcionou?
   - O que não funcionou?
   - Ajustes para próximo lote

---

### 📝 DOCUMENTO ÚNICO DE PENDÊNCIAS

**Quando criar:**
- ❌ Objetivo do lote NÃO foi atingido
- ❌ Bugs críticos encontrados
- ❌ Funcionalidade incompleta

**Como criar:**

```markdown
# PENDENCIAS_LOTE_X.md

## Objetivos Não Atingidos

### 1. [Descrição]
- **O que deveria funcionar:** ...
- **O que não funciona:** ...
- **Causa raiz:** ...
- **Impacto:** Crítico/Médio/Baixo
- **Responsável:** ED/DF/AI/UT
- **Estimativa de correção:** Xh

## Decisão da Equipe

- [ ] Corrigir AGORA (bloqueia próximo lote)
- [ ] Documentar e seguir (não bloqueia)
- [ ] Replanejar lote

## Ações

1. [ ] ...
2. [ ] ...
```

**Discussão multidisciplinar:**
- 30 min ao final do lote
- Todos participam
- Decisão por consenso
- Atualizar PENDENCIAS.md consolidado

---

## 🔑 REGRAS DE OURO (Revisadas)

### 1. VARREDURA COMPLETA ANTES DE AGIR

**Nunca criar 1 tabela.** Criar TODAS de uma vez.  
**Nunca adicionar 1 campo.** Adicionar TODOS de uma vez.  
**Nunca criar 1 índice.** Criar TODOS de uma vez.

---

### 2. FOCO NO CORE

**Ordem de prioridade:**
1. Importação (sem isso, não há dados)
2. Enriquecimento (sem isso, dados são pobres)
3. Gravação/Auditoria (sem isso, dados são inseguros)
4. Gestão (sem isso, dados são inacessíveis)
5. Secundário (análises, dashboards, tours)

---

### 3. VALIDAÇÃO EM 3 CAMADAS (Sempre)

```sql
-- 1. BANCO
SELECT COUNT(*) FROM dim_produto;

-- 2. BACKEND
trpc.produto.listar.query()

-- 3. FRONTEND
https://intelmarket.app/produtos
```

---

### 4. DEPLOY É PARTE DO LOTE

**Lote só termina quando:**
- ✅ Código commitado
- ✅ Deploy validado
- ✅ Testes em produção passam

---

### 5. DOCUMENTO ÚNICO DE PENDÊNCIAS

**1 problema = 1 linha em PENDENCIAS.md**  
**Discussão multidisciplinar obrigatória**  
**Decisão documentada**

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### 1. EXECUTAR LOTE 0.1 (Varredura Schema)
**Tempo:** 2h  
**Responsável:** ED + AI  
**Entrega:** SCHEMA_AUDIT.xlsx

### 2. EXECUTAR LOTE 0.2 (Execução em Lote)
**Tempo:** 3h  
**Responsável:** ED  
**Entrega:** migrations/001_schema_completo.sql

### 3. EXECUTAR LOTE 0.3 (Dados de Teste)
**Tempo:** 1h  
**Responsável:** ED + AI  
**Entrega:** seed_completo.sql

---

**FIM DO PLANO OTIMIZADO**

---

*Este plano substitui a abordagem sequencial por uma abordagem em lotes, reduzindo retrabalho em 28% e garantindo foco no CORE do sistema.*
