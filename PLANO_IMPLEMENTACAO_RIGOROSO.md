# 🏗️ Plano de Implementação Rigoroso - Otimizações de Performance

**Data:** 01/12/2025  
**Metodologia:** Engenharia de Dados + Arquitetura de Software  
**Objetivo:** Otimizar performance sem quebrar funcionalidades em produção

---

## 🎯 Princípios de Implementação

### 1. **Zero Downtime**

- ✅ Todas as alterações devem ser **backward compatible**
- ✅ Stored procedures são **adicionadas**, nunca substituem código existente
- ✅ Fallback automático para código TypeScript se SP falhar

### 2. **Validação Rigorosa**

- ✅ Testar SP isoladamente ANTES de integrar
- ✅ Comparar resultados SP vs TypeScript (devem ser idênticos)
- ✅ Validar tipos de dados e formato de retorno

### 3. **Rollback Seguro**

- ✅ Cada fase pode ser revertida independentemente
- ✅ Código TypeScript original mantido como fallback
- ✅ Logs detalhados para debugging

### 4. **Documentação Completa**

- ✅ Documentar cada SP criada
- ✅ Explicar lógica de agregação
- ✅ Manter histórico de alterações

---

## 📋 Fases de Implementação

### **FASE 1: Análise e Preparação** ⏳

**Objetivo:** Entender schema atual e mapear dependências

**Ações:**

1. ✅ Analisar schema das tabelas envolvidas
   - `pesquisas` (campos, tipos, constraints)
   - `clientes` (campos, tipos, constraints)
   - `leads` (campos, tipos, constraints)
   - `concorrentes` (campos, tipos, constraints)
   - `mercadosUnicos` (campos, tipos, constraints)
   - `produtos` (campos, tipos, constraints)

2. ✅ Mapear queries atuais em `pesquisas.ts`
   - Identificar todas as queries em `getByIdWithCounts`
   - Documentar campos retornados
   - Documentar tipos esperados pelo frontend

3. ✅ Mapear queries atuais em `reports.ts`
   - Identificar todas as queries em `generateProjectReport`
   - Documentar agregações feitas em JavaScript
   - Documentar formato esperado pela IA

4. ✅ Verificar índices existentes
   - Listar índices em todas as tabelas envolvidas
   - Identificar gaps de índices

**Validação:**

- ✅ Schema documentado
- ✅ Queries mapeadas
- ✅ Dependências identificadas

**Tempo estimado:** 30 minutos

---

### **FASE 2: Criar SP `get_pesquisa_details`** ⏳

**Objetivo:** Criar stored procedure para substituir 9 queries de `pesquisas.getByIdWithCounts`

**Ações:**

1. ✅ Criar arquivo SQL da migration
   - `drizzle/migrations/create_get_pesquisa_details.sql`

2. ✅ Implementar SP com CTEs

   ```sql
   CREATE OR REPLACE FUNCTION get_pesquisa_details(p_pesquisa_id INTEGER)
   RETURNS TABLE(
     -- Dados da pesquisa
     pesquisa_id INTEGER,
     pesquisa_nome TEXT,
     pesquisa_descricao TEXT,
     pesquisa_status TEXT,
     -- Contadores
     clientes_total INTEGER,
     clientes_enriquecidos INTEGER,
     leads_count INTEGER,
     mercados_count INTEGER,
     produtos_count INTEGER,
     concorrentes_count INTEGER,
     -- Qualidade média
     clientes_qualidade_media INTEGER,
     leads_qualidade_media INTEGER,
     concorrentes_qualidade_media INTEGER,
     -- Geo
     geo_total INTEGER
   )
   ```

3. ✅ Adicionar comentários explicativos
   - Explicar cada CTE
   - Documentar lógica de agregação

4. ✅ Adicionar query de teste no final
   ```sql
   -- Testar com pesquisa ID 1
   -- SELECT * FROM get_pesquisa_details(1);
   ```

**Validação:**

- ✅ SQL sintaxe válida
- ✅ Tipos de retorno corretos
- ✅ Comentários completos

**Tempo estimado:** 45 minutos

---

### **FASE 3: Testar SP `get_pesquisa_details` Isoladamente** ⏳

**Objetivo:** Validar que SP retorna dados corretos ANTES de integrar

**Ações:**

1. ✅ Aplicar migration via Supabase MCP

   ```bash
   manus-mcp-cli tool call execute_sql --server supabase ...
   ```

2. ✅ Executar SP com pesquisa real

   ```sql
   SELECT * FROM get_pesquisa_details(1);
   ```

3. ✅ Executar queries TypeScript originais

   ```typescript
   // Copiar código de pesquisas.ts linhas 100-130
   // Executar manualmente
   ```

4. ✅ Comparar resultados lado a lado
   - Verificar TODOS os campos
   - Verificar tipos de dados
   - Verificar valores numéricos

5. ✅ Testar com 3 pesquisas diferentes
   - Pesquisa com muitos dados
   - Pesquisa com poucos dados
   - Pesquisa vazia

**Validação:**

- ✅ SP retorna mesmos dados que TypeScript
- ✅ Tipos corretos
- ✅ Performance melhor (< 0.2s)

**Critério de Sucesso:**

- ❌ Se resultados diferentes → PARAR e corrigir SP
- ✅ Se resultados idênticos → Prosseguir para Fase 4

**Tempo estimado:** 30 minutos

---

### **FASE 4: Refatorar `pesquisas.ts` com Fallback** ⏳

**Objetivo:** Integrar SP no router mantendo código original como fallback

**Ações:**

1. ✅ Fazer backup do código original

   ```bash
   cp server/routers/pesquisas.ts server/routers/pesquisas.ts.backup
   ```

2. ✅ Refatorar `getByIdWithCounts`

   ```typescript
   getByIdWithCounts: publicProcedure.input(z.number()).query(async ({ input: id }) => {
     const db = await getDb();
     if (!db) throw new Error('Database connection failed');

     try {
       // CAMINHO PRINCIPAL: Stored Procedure
       try {
         const result = await db.execute(sql`SELECT * FROM get_pesquisa_details(${id})`);

         if (result.rows.length === 0) return null;

         const row = result.rows[0];
         return {
           id: row.pesquisa_id,
           nome: row.pesquisa_nome,
           descricao: row.pesquisa_descricao,
           status: row.pesquisa_status,
           totalClientes: row.clientes_total,
           clientesEnriquecidos: row.clientes_enriquecidos,
           leadsCount: row.leads_count,
           mercadosCount: row.mercados_count,
           produtosCount: row.produtos_count,
           concorrentesCount: row.concorrentes_count,
           clientesQualidadeMedia: row.clientes_qualidade_media,
           leadsQualidadeMedia: row.leads_qualidade_media,
           concorrentesQualidadeMedia: row.concorrentes_qualidade_media,
           geoTotal: row.geo_total,
         };
       } catch (spError) {
         // FALLBACK: Queries TypeScript originais
         console.warn('[Pesquisas] SP failed, using fallback:', spError);

         // ... código original mantido intacto ...
       }
     } catch (error) {
       console.error('[Pesquisas] Error:', error);
       throw error;
     }
   });
   ```

3. ✅ Adicionar log de qual caminho foi usado

   ```typescript
   console.log('[Pesquisas] Using stored procedure');
   // ou
   console.warn('[Pesquisas] Using TypeScript fallback');
   ```

4. ✅ Manter código TypeScript original COMPLETO
   - Não deletar nada
   - Apenas mover para bloco catch

**Validação:**

- ✅ Código compila sem erros
- ✅ Fallback está completo
- ✅ Logs adicionados

**Tempo estimado:** 30 minutos

---

### **FASE 5: Validar `pesquisas.ts` em Ambiente de Teste** ⏳

**Objetivo:** Testar router refatorado em cenários reais

**Ações:**

1. ✅ Testar caminho principal (SP)
   - Acessar `/projects/[id]/surveys/[surveyId]/results`
   - Verificar dados carregam corretamente
   - Verificar logs: deve mostrar "Using stored procedure"

2. ✅ Testar fallback (simular falha da SP)
   - Temporariamente renomear SP no banco
   - Acessar mesma página
   - Verificar dados carregam corretamente
   - Verificar logs: deve mostrar "Using TypeScript fallback"
   - Restaurar SP

3. ✅ Testar performance
   - Medir tempo de carregamento antes (TypeScript)
   - Medir tempo de carregamento depois (SP)
   - Confirmar ganho de -80%

4. ✅ Testar casos extremos
   - Pesquisa com 0 clientes
   - Pesquisa com 10.000 clientes
   - Pesquisa inexistente

**Validação:**

- ✅ SP funciona corretamente
- ✅ Fallback funciona corretamente
- ✅ Performance melhorou
- ✅ Nenhum erro no console

**Critério de Sucesso:**

- ❌ Se qualquer teste falhar → PARAR e corrigir
- ✅ Se todos os testes passarem → Prosseguir para Fase 6

**Tempo estimado:** 45 minutos

---

### **FASE 6: Criar SP `get_report_summary`** ⏳

**Objetivo:** Criar stored procedure para substituir agregações em JavaScript de `reports.ts`

**Ações:**

1. ✅ Criar arquivo SQL da migration
   - `drizzle/migrations/create_get_report_summary.sql`

2. ✅ Implementar SP com agregações complexas

   ```sql
   CREATE OR REPLACE FUNCTION get_report_summary(p_project_id INTEGER)
   RETURNS TABLE(
     -- Estatísticas gerais
     total_clientes INTEGER,
     total_leads INTEGER,
     total_concorrentes INTEGER,
     total_mercados INTEGER,
     -- Top 20 mercados (JSON)
     top_mercados JSONB,
     -- Top 20 produtos (JSON)
     top_produtos JSONB,
     -- Top 10 estados (JSON)
     top_estados JSONB,
     -- Top 10 cidades (JSON)
     top_cidades JSONB,
     -- Distribuição geográfica completa (JSON)
     distribuicao_geo JSONB
   )
   ```

3. ✅ Implementar agregações no PostgreSQL
   - Top 20 mercados com ORDER BY e LIMIT
   - Top 20 produtos com COUNT e GROUP BY
   - Distribuição geográfica com JOINs

4. ✅ Retornar JSON estruturado
   - Usar `json_agg()` para arrays
   - Usar `json_build_object()` para objetos

**Validação:**

- ✅ SQL sintaxe válida
- ✅ JSON bem formatado
- ✅ Agregações corretas

**Tempo estimado:** 60 minutos

---

### **FASE 7: Testar SP `get_report_summary` Isoladamente** ⏳

**Objetivo:** Validar que SP retorna dados corretos ANTES de integrar

**Ações:**

1. ✅ Aplicar migration via Supabase MCP

2. ✅ Executar SP com projeto real

   ```sql
   SELECT * FROM get_report_summary(1);
   ```

3. ✅ Executar agregações JavaScript originais
   - Copiar código de reports.ts linhas 64-150
   - Executar manualmente

4. ✅ Comparar resultados lado a lado
   - Verificar top 20 mercados (mesma ordem?)
   - Verificar top 20 produtos (mesmas contagens?)
   - Verificar distribuição geográfica

5. ✅ Testar performance
   - Medir tempo SP vs JavaScript
   - Confirmar ganho de -70%

**Validação:**

- ✅ SP retorna mesmos dados que JavaScript
- ✅ JSON bem formatado
- ✅ Performance melhor (< 2.5s)

**Critério de Sucesso:**

- ❌ Se resultados diferentes → PARAR e corrigir SP
- ✅ Se resultados idênticos → Prosseguir para Fase 8

**Tempo estimado:** 45 minutos

---

### **FASE 8: Refatorar `reports.ts` com Fallback** ⏳

**Objetivo:** Integrar SP no router mantendo código original como fallback

**Ações:**

1. ✅ Fazer backup do código original

   ```bash
   cp server/routers/reports.ts server/routers/reports.ts.backup
   ```

2. ✅ Refatorar `generateProjectReport`

   ```typescript
   generateProjectReport: publicProcedure
     .input(z.object({ projectId: z.number() }))
     .mutation(async ({ input }) => {
       const db = await getDb();
       if (!db) throw new Error('Database connection failed');

       try {
         // CAMINHO PRINCIPAL: Stored Procedure
         const result = await db.execute(sql`SELECT * FROM get_report_summary(${input.projectId})`);

         const summary = result.rows[0];

         // Usar dados agregados da SP
         const topMercados = summary.top_mercados;
         const topProdutos = summary.top_produtos;
         // ... etc
       } catch (spError) {
         // FALLBACK: Agregações JavaScript originais
         console.warn('[Reports] SP failed, using fallback:', spError);

         // ... código original mantido intacto ...
       }
     });
   ```

3. ✅ Adicionar logs

4. ✅ Manter código JavaScript original COMPLETO

**Validação:**

- ✅ Código compila sem erros
- ✅ Fallback está completo
- ✅ Logs adicionados

**Tempo estimado:** 45 minutos

---

### **FASE 9: Validar `reports.ts` em Ambiente de Teste** ⏳

**Objetivo:** Testar router refatorado em cenários reais

**Ações:**

1. ✅ Testar caminho principal (SP)
   - Gerar relatório de projeto
   - Verificar PDF gerado corretamente
   - Verificar dados no PDF estão corretos

2. ✅ Testar fallback
   - Simular falha da SP
   - Gerar relatório
   - Verificar PDF gerado corretamente

3. ✅ Testar performance
   - Medir tempo antes (JavaScript)
   - Medir tempo depois (SP)
   - Confirmar ganho de -70%

4. ✅ Comparar PDFs lado a lado
   - PDF gerado com SP
   - PDF gerado com JavaScript
   - Devem ser idênticos

**Validação:**

- ✅ SP funciona corretamente
- ✅ Fallback funciona corretamente
- ✅ PDFs idênticos
- ✅ Performance melhorou

**Critério de Sucesso:**

- ❌ Se qualquer teste falhar → PARAR e corrigir
- ✅ Se todos os testes passarem → Prosseguir para Fase 10

**Tempo estimado:** 60 minutos

---

### **FASE 10: Criar Índices Compostos Faltantes** ⏳

**Objetivo:** Adicionar índices para otimizar queries específicas

**Ações:**

1. ✅ Criar migration de índices
   - `drizzle/migrations/add_missing_indexes.sql`

2. ✅ Adicionar índices

   ```sql
   -- Otimizar enrichment.getActiveJobs
   CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status_started
   ON enrichment_jobs(status, "startedAt");

   -- Otimizar projects.list
   CREATE INDEX IF NOT EXISTS idx_projects_ativo_created
   ON projects(ativo, "createdAt");
   ```

3. ✅ Aplicar via Supabase MCP

4. ✅ Verificar índices criados
   ```sql
   SELECT * FROM pg_indexes
   WHERE indexname IN ('idx_enrichment_jobs_status_started', 'idx_projects_ativo_created');
   ```

**Validação:**

- ✅ Índices criados com sucesso
- ✅ Tamanho dos índices razoável (< 1MB cada)

**Tempo estimado:** 15 minutos

---

### **FASE 11: Validação Final de Performance e Integridade** ⏳

**Objetivo:** Garantir que TODAS as funcionalidades continuam funcionando

**Ações:**

1. ✅ Testar TODOS os módulos otimizados
   - Dashboard (SP `get_pesquisas_summary`)
   - Projetos (SP `get_projects_summary`)
   - Geoposição (SP `get_geo_hierarchy`)
   - Setores (SP `get_sector_summary`)
   - Produtos (SP `get_product_ranking`)
   - **Pesquisas (SP `get_pesquisa_details`)** ← NOVO
   - **Relatórios (SP `get_report_summary`)** ← NOVO

2. ✅ Medir performance de cada módulo
   - Antes (baseline)
   - Depois (otimizado)
   - Confirmar ganhos

3. ✅ Testar fluxos completos
   - Criar projeto → Criar pesquisa → Ver resultados
   - Enriquecer dados → Ver dashboard
   - Gerar relatório → Baixar PDF
   - Exportar Excel → Verificar dados

4. ✅ Verificar logs
   - Nenhum erro no console
   - Todos usando SPs (não fallback)

5. ✅ Verificar integridade dos dados
   - Comparar contadores antes/depois
   - Verificar nenhum dado foi perdido

**Validação:**

- ✅ Todas as funcionalidades funcionam
- ✅ Performance melhorou em todos os módulos
- ✅ Nenhum erro ou warning
- ✅ Dados íntegros

**Critério de Sucesso:**

- ❌ Se qualquer funcionalidade quebrou → ROLLBACK e corrigir
- ✅ Se tudo funciona → Prosseguir para Fase 12

**Tempo estimado:** 60 minutos

---

### **FASE 12: Documentação e Commit Controlado** ⏳

**Objetivo:** Documentar alterações e fazer commit seguro

**Ações:**

1. ✅ Atualizar documentação
   - `AUDITORIA_COMPLETA_PERFORMANCE.md` (marcar como implementado)
   - `IMPLEMENTACAO_DASHBOARD_PROJETOS.md` (adicionar novas otimizações)

2. ✅ Criar documento de implementação
   - `IMPLEMENTACAO_PESQUISAS_REPORTS.md`
   - Documentar SPs criadas
   - Documentar ganhos de performance
   - Documentar testes realizados

3. ✅ Adicionar arquivos ao git

   ```bash
   git add drizzle/migrations/create_get_pesquisa_details.sql
   git add drizzle/migrations/create_get_report_summary.sql
   git add drizzle/migrations/add_missing_indexes.sql
   git add server/routers/pesquisas.ts
   git add server/routers/reports.ts
   git add *.md
   ```

4. ✅ Fazer commit descritivo

   ```bash
   git commit -m "feat: otimizar Pesquisas e Relatórios com stored procedures

   - Pesquisas: redução de 80% (1.0s → 0.2s)
     * Criada SP get_pesquisa_details() elimina N+1 de 9 queries
     * Fallback automático para queries TypeScript

   - Relatórios: redução de 70% (8s → 2.5s)
     * Criada SP get_report_summary() agrega no PostgreSQL
     * Elimina processamento pesado em JavaScript
     * Fallback automático para agregações TypeScript

   - Índices: criados 2 índices compostos
     * idx_enrichment_jobs_status_started
     * idx_projects_ativo_created

   - Padrão consistente com módulos anteriores
   - Total: 7/11 módulos otimizados (-87% média)
   - Zero quebra de funcionalidades (100% testado)"
   ```

5. ✅ Push para repositório
   ```bash
   git push origin main
   ```

**Validação:**

- ✅ Documentação completa
- ✅ Commit descritivo
- ✅ Push bem-sucedido

**Tempo estimado:** 30 minutos

---

## 📊 Resumo do Plano

| Fase | Ação                   | Tempo | Validação Crítica       |
| ---- | ---------------------- | ----- | ----------------------- |
| 1    | Análise schema         | 30min | Schema documentado      |
| 2    | Criar SP pesquisas     | 45min | SQL válido              |
| 3    | Testar SP pesquisas    | 30min | ✅ Resultados idênticos |
| 4    | Refatorar pesquisas.ts | 30min | Código compila          |
| 5    | Validar pesquisas.ts   | 45min | ✅ Tudo funciona        |
| 6    | Criar SP reports       | 60min | SQL válido              |
| 7    | Testar SP reports      | 45min | ✅ Resultados idênticos |
| 8    | Refatorar reports.ts   | 45min | Código compila          |
| 9    | Validar reports.ts     | 60min | ✅ Tudo funciona        |
| 10   | Criar índices          | 15min | Índices criados         |
| 11   | Validação final        | 60min | ✅ Zero quebras         |
| 12   | Documentar e commit    | 30min | Push bem-sucedido       |

**Tempo Total:** ~7 horas (1 dia de trabalho)

---

## 🚨 Critérios de Parada

**PARAR IMEDIATAMENTE se:**

1. ❌ SP retorna dados diferentes do TypeScript
2. ❌ Qualquer funcionalidade para de funcionar
3. ❌ Erros no console que não existiam antes
4. ❌ Performance piora ao invés de melhorar
5. ❌ Dados são perdidos ou corrompidos

**Ação em caso de parada:**

1. ✅ Reverter última alteração
2. ✅ Analisar logs e erro
3. ✅ Corrigir problema
4. ✅ Repetir fase com correção
5. ✅ Só prosseguir quando validação passar

---

## ✅ Garantias de Segurança

### 1. **Backward Compatibility**

- ✅ Código TypeScript original mantido como fallback
- ✅ SPs são adicionadas, não substituem
- ✅ Rollback automático se SP falhar

### 2. **Validação Rigorosa**

- ✅ Comparação lado a lado de resultados
- ✅ Testes em 3+ cenários diferentes
- ✅ Validação de tipos e formatos

### 3. **Monitoramento**

- ✅ Logs detalhados em cada caminho
- ✅ Métricas de performance antes/depois
- ✅ Alertas se fallback for usado

### 4. **Rollback Fácil**

- ✅ Backups de código antes de alterações
- ✅ Migrations podem ser revertidas
- ✅ Git permite voltar a qualquer commit

---

## 🎯 Resultado Esperado

**Antes:**

- 5/11 módulos otimizados (45%)
- Performance média: -93% nos otimizados
- 3 gargalos críticos

**Depois:**

- 7/11 módulos otimizados (64%)
- Performance média: -87% nos otimizados
- 0 gargalos críticos
- 100% funcionalidades preservadas

**Ganho Total:**

- +2 módulos otimizados
- +2 stored procedures
- +2 índices compostos
- -6s de tempo de resposta total
- ✅ Zero quebras de funcionalidade

---

**Elaborado por:** Manus AI (Engenheiro de Dados + Arquiteto de Software)  
**Data:** 01/12/2025  
**Status:** ✅ Pronto para execução fase a fase
