# 🗺️ Mapeamento Completo do Sistema - Auditoria de Performance

**Data:** 01/12/2025  
**Objetivo:** Identificar todas as telas, consultas e oportunidades de otimização

---

## 📱 Frontend - Rotas Mapeadas (11 páginas)

| #   | Rota                                        | Arquivo                                                       | Status Otimização           |
| --- | ------------------------------------------- | ------------------------------------------------------------- | --------------------------- |
| 1   | `/dashboard`                                | `app/(app)/dashboard/page.tsx`                                | ✅ Otimizado (Fase 6)       |
| 2   | `/projects`                                 | `app/(app)/projects/page.tsx`                                 | ✅ Otimizado (Fase 6)       |
| 3   | `/projects/[id]`                            | `app/(app)/projects/[id]/page.tsx`                            | ⚠️ Auditar                  |
| 4   | `/projects/[id]/surveys/[surveyId]/results` | `app/(app)/projects/[id]/surveys/[surveyId]/results/page.tsx` | ✅ Otimizado (já eficiente) |
| 5   | `/projects/[id]/surveys/[surveyId]/enrich`  | `app/(app)/projects/[id]/surveys/[surveyId]/enrich/page.tsx`  | ⚠️ Auditar                  |
| 6   | `/map`                                      | `app/(app)/map/page.tsx`                                      | ✅ Otimizado (Fase 1-3)     |
| 7   | `/sectors`                                  | `app/(app)/sectors/page.tsx`                                  | ✅ Otimizado (Fase 4)       |
| 8   | `/products`                                 | `app/(app)/products/page.tsx`                                 | ✅ Otimizado (Fase 4)       |
| 9   | `/settings`                                 | `app/(app)/settings/page.tsx`                                 | ⚠️ Auditar                  |
| 10  | `/users`                                    | `app/(app)/users/page.tsx`                                    | ⚠️ Auditar                  |
| 11  | `/admin/users`                              | `app/(app)/admin/users/page.tsx`                              | ⚠️ Auditar                  |

**Status:**

- ✅ **5 otimizadas** (Dashboard, Projetos, Map, Sectors, Products)
- ⚠️ **6 pendentes de auditoria**

---

## 🔧 Backend - Routers Mapeados (21 routers)

| #   | Router             | Arquivo                       | Função Principal           | Status              |
| --- | ------------------ | ----------------------------- | -------------------------- | ------------------- |
| 1   | `dashboard`        | `routers/dashboard.ts`        | Stats, projetos, pesquisas | ✅ Otimizado        |
| 2   | `projects`         | `routers/projects.ts`         | CRUD projetos              | ⚠️ Auditar          |
| 3   | `pesquisas`        | `routers/pesquisas.ts`        | CRUD pesquisas             | ⚠️ Auditar          |
| 4   | `results`          | `routers/results.ts`          | KPIs, clientes, leads      | ✅ Otimizado        |
| 5   | `map`              | `routers/map.ts`              | Dados geográficos          | ✅ Otimizado        |
| 6   | `map-hierarchical` | `routers/map-hierarchical.ts` | Hierarquia geo             | ✅ Otimizado        |
| 7   | `sector-analysis`  | `routers/sector-analysis.ts`  | Análise setores            | ✅ Otimizado        |
| 8   | `product-analysis` | `routers/product-analysis.ts` | Ranking produtos           | ✅ Otimizado        |
| 9   | `enrichment`       | `routers/enrichment.ts`       | Enriquecimento dados       | ⚠️ Auditar          |
| 10  | `export`           | `routers/export.ts`           | Exportação Excel/CSV       | ⚠️ Auditar          |
| 11  | `exportRouter`     | `routers/exportRouter.ts`     | Exportação (v2?)           | ⚠️ Auditar          |
| 12  | `reports`          | `routers/reports.ts`          | Relatórios                 | ⚠️ Auditar          |
| 13  | `reports-enhanced` | `routers/reports-enhanced.ts` | Relatórios avançados       | ⚠️ Auditar          |
| 14  | `geocodingRouter`  | `routers/geocodingRouter.ts`  | Geocodificação             | ⚠️ Auditar          |
| 15  | `import-cidades`   | `routers/import-cidades.ts`   | Importação cidades         | ⚠️ Auditar          |
| 16  | `notifications`    | `routers/notifications.ts`    | Notificações               | ⚠️ Auditar          |
| 17  | `settings`         | `routers/settings.ts`         | Configurações              | ⚠️ Auditar          |
| 18  | `usersRouter`      | `routers/usersRouter.ts`      | Usuários                   | ⚠️ Auditar          |
| 19  | `authRouter`       | `routers/authRouter.ts`       | Autenticação               | ✅ OK (não crítico) |
| 20  | `_app`             | `routers/_app.ts`             | Agregador routers          | ✅ OK               |
| 21  | `index`            | `routers/index.ts`            | Export routers             | ✅ OK               |

**Status:**

- ✅ **5 otimizados** (dashboard, results, map, sector-analysis, product-analysis)
- ⚠️ **13 pendentes de auditoria**
- ✅ **3 não críticos** (auth, \_app, index)

---

## 🎯 Priorização de Auditoria

### 🔴 PRIORIDADE ALTA (impacto direto no usuário)

1. **`/projects/[id]`** + `projects.ts`
   - Detalhes de projeto individual
   - Pode ter N+1 em pesquisas/leads

2. **`enrichment.ts`**
   - Enriquecimento de dados (processo crítico)
   - Pode ter loops de queries

3. **`export.ts` / `exportRouter.ts`**
   - Exportação Excel/CSV
   - Pode ter queries pesadas sem paginação

4. **`reports.ts` / `reports-enhanced.ts`**
   - Relatórios (geralmente lentos)
   - Agregações complexas

### 🟡 PRIORIDADE MÉDIA (impacto moderado)

5. **`pesquisas.ts`**
   - CRUD pesquisas
   - Pode ter queries de listagem lentas

6. **`geocodingRouter.ts`**
   - Geocodificação (pode ser lenta)
   - Verificar se usa batch

7. **`/users`** + `usersRouter.ts`\*\*
   - Gestão de usuários
   - Pode ter N+1 em permissões

### 🟢 PRIORIDADE BAIXA (impacto mínimo)

8. **`settings.ts`**
   - Configurações (poucas queries)

9. **`notifications.ts`**
   - Notificações (geralmente rápidas)

10. **`import-cidades.ts`**
    - Importação (processo batch, não crítico)

---

## 📋 Plano de Auditoria

### Fase 1: Mapear queries de cada router ⏳

- Ler código de cada router pendente
- Identificar todas as queries
- Contar queries por endpoint

### Fase 2: Identificar N+1 e gargalos ⏳

- Buscar loops de queries
- Verificar JOINs complexos
- Analisar agregações em JavaScript

### Fase 3: Verificar índices existentes ⏳

- Listar índices do banco
- Comparar com queries identificadas
- Identificar gaps de índices

### Fase 4: Criar plano de otimização ⏳

- Priorizar por impacto
- Estimar ganho de performance
- Definir stored procedures necessárias

### Fase 5: Implementar otimizações ⏳

- Criar migrations de índices
- Criar stored procedures
- Refatorar routers

### Fase 6: Documentar e entregar ⏳

- Criar relatório final
- Atualizar documentação
- Fazer commit

---

## 📊 Status Atual

**Módulos Auditados:** 5/11 (45%)  
**Routers Auditados:** 5/21 (24%)  
**Próxima Etapa:** Auditar routers de prioridade alta

---

_Documento em construção - será atualizado conforme auditoria avança_
