# 🏗️ Plano de Implementação: Drill-Down de Setores/Segmentos

**Equipe:** Engenharia de Dados + Arquitetura de Aplicação  
**Data:** 30/11/2025  
**Projeto:** IntelMarket - Inteligência de Mercado  
**Versão:** 2.0 (Baseado em lições de Geoposição)

---

## 📋 Executive Summary

### Objetivo

Implementar módulo de drill-down hierárquico **Setores → Subsetores → Empresas** com performance otimizada desde o início, aplicando as 3 fases de otimização aprendidas no módulo de Geoposição.

### Hierarquia

```
Setor (ex: Tecnologia)
  └─ Subsetor (ex: Software)
      └─ Segmento (ex: ERP)
          └─ Empresas (Clientes/Leads/Concorrentes)
```

### Performance Target

- **Inicial:** < 0.2s (com otimizações desde o início)
- **Escalabilidade:** Suportar >100k registros
- **Disponibilidade:** 99.9% (fallback automático)

---

## 🎯 Análise de Dados

### 1. Estrutura de Dados Atual

**Tabelas envolvidas:**

- `clientes` → campo `setor` (VARCHAR 100) - ❌ **NÃO tem subsetor**
- `leads` → campo `setor` (VARCHAR 100) - ✅ **TEM subsetor**
- `concorrentes` → campo `setor` (VARCHAR 100) - ✅ **TEM subsetor**

**Problema identificado:**

- Clientes não têm campo `subsetor` no schema
- Precisamos derivar subsetor de outras fontes ou criar lógica de mapeamento

### 2. Mapeamento de Hierarquia

**Opção A: Criar tabela de referência (RECOMENDADO)**

```sql
CREATE TABLE setores_hierarquia (
  id SERIAL PRIMARY KEY,
  setor VARCHAR(100) NOT NULL,
  subsetor VARCHAR(100),
  segmento VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_setores_setor ON setores_hierarquia(setor);
CREATE INDEX idx_setores_subsetor ON setores_hierarquia(subsetor);
```

**Opção B: Derivar de CNAE**

- Usar campo `cnae` para mapear setor/subsetor
- Criar tabela de mapeamento CNAE → Setor → Subsetor

**Decisão:** Opção A (mais flexível e permite customização)

### 3. Volumetria Estimada

| Nível      | Quantidade Estimada | Exemplo                         |
| ---------- | ------------------- | ------------------------------- |
| Setores    | 15-20               | Tecnologia, Saúde, Educação     |
| Subsetores | 50-80               | Software, Hardware, Consultoria |
| Segmentos  | 150-200             | ERP, CRM, BI, Infraestrutura    |
| Empresas   | >50k                | Todas as entidades              |

---

## 🏛️ Arquitetura Técnica

### 1. Schema do Banco de Dados

#### 1.1 Nova Tabela: `setores_hierarquia`

```typescript
export const setoresHierarquia = pgTable(
  'setores_hierarquia',
  {
    id: serial('id').primaryKey(),
    setor: varchar('setor', { length: 100 }).notNull(),
    subsetor: varchar('subsetor', { length: 100 }),
    segmento: varchar('segmento', { length: 100 }),
    descricao: text('descricao'),
    ativo: integer('ativo').default(1).notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_setores_setor').on(table.setor),
    index('idx_setores_subsetor').on(table.subsetor),
    index('idx_setores_segmento').on(table.segmento),
  ]
);
```

#### 1.2 Índices de Performance (FASE 1)

**Aplicar desde o início:**

```sql
-- CLIENTES
CREATE INDEX idx_clientes_setor_pesquisa
ON clientes("pesquisaId", setor)
WHERE setor IS NOT NULL;

CREATE INDEX idx_clientes_setor_filtros
ON clientes("pesquisaId", setor, porte)
WHERE setor IS NOT NULL;

-- LEADS
CREATE INDEX idx_leads_setor_pesquisa
ON leads("pesquisaId", setor)
WHERE setor IS NOT NULL;

CREATE INDEX idx_leads_setor_filtros
ON leads("pesquisaId", setor, porte, "qualidadeClassificacao")
WHERE setor IS NOT NULL;

-- CONCORRENTES
CREATE INDEX idx_concorrentes_setor_pesquisa
ON concorrentes("pesquisaId", setor)
WHERE setor IS NOT NULL;

CREATE INDEX idx_concorrentes_setor_filtros
ON concorrentes("pesquisaId", setor, porte)
WHERE setor IS NOT NULL;

-- PESQUISAS (já existe do módulo de Geoposição)
-- idx_pesquisas_projectId
```

**Total:** 6 novos índices

### 2. API Layer (tRPC)

#### 2.1 Router: `sector-hierarchical.ts`

```typescript
export const sectorHierarchicalRouter = router({
  /**
   * Buscar dados hierárquicos (Setor → Subsetor → Segmento)
   */
  getHierarchicalData: publicProcedure
    .input(
      z.object({
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']).default('clientes'),
        filters: z
          .object({
            porte: z.string().nullable().optional(),
            qualidade: z.string().nullable().optional(),
            regiao: z.string().nullable().optional(),
          })
          .optional()
          .default({}),
      })
    )
    .query(async ({ input }) => {
      // Implementação com FASE 2 e FASE 3 desde o início
    }),

  /**
   * Buscar entidades de um segmento específico
   */
  getSegmentEntities: publicProcedure
    .input(
      z.object({
        setor: z.string(),
        subsetor: z.string().optional(),
        segmento: z.string().optional(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']),
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      // Implementação com paginação
    }),
});
```

#### 2.2 Tipos TypeScript

```typescript
interface SectorCount {
  clientes: number;
  leads: number;
  concorrentes: number;
}

interface SegmentData {
  name: string;
  setor: string;
  subsetor: string;
  totals: SectorCount;
}

interface SubsectorData {
  name: string;
  setor: string;
  segments: SegmentData[];
  totals: SectorCount;
}

interface SectorData {
  name: string;
  subsectors: SubsectorData[];
  totals: SectorCount;
}

interface HierarchicalResponse {
  sectors: SectorData[];
  grandTotals: SectorCount;
}
```

### 3. Stored Procedures (FASE 3)

#### 3.1 Funções PostgreSQL

**Criar 3 stored procedures (uma para cada entityType):**

```sql
-- Função para CLIENTES
CREATE OR REPLACE FUNCTION get_sector_hierarchy_clientes(
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  setor TEXT,
  subsetor TEXT,
  segmento TEXT,
  entity_count INTEGER
)
LANGUAGE sql
STABLE
AS $$
  WITH sector_counts AS (
    SELECT
      c.setor,
      COALESCE(sh.subsetor, 'Outros') as subsetor,
      COALESCE(sh.segmento, 'Geral') as segmento,
      COUNT(*)::INTEGER as count
    FROM clientes c
    LEFT JOIN setores_hierarquia sh ON c.setor = sh.setor
    WHERE c.setor IS NOT NULL
      AND c."pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY c.setor, sh.subsetor, sh.segmento
  )
  SELECT
    setor,
    subsetor,
    segmento,
    count as entity_count
  FROM sector_counts
  ORDER BY setor, subsetor, segmento;
$$;

-- Função para LEADS (similar)
CREATE OR REPLACE FUNCTION get_sector_hierarchy_leads(...);

-- Função para CONCORRENTES (similar)
CREATE OR REPLACE FUNCTION get_sector_hierarchy_concorrentes(...);
```

**Ganho esperado:** 50-70% de redução (similar ao módulo de Geoposição)

---

## 📊 Implementação em 3 Fases

### FASE 1: Índices Compostos (Implementar PRIMEIRO)

**Objetivo:** Criar índices antes de qualquer código

**Tarefas:**

1. ✅ Criar migration SQL com 6 índices
2. ✅ Executar no Supabase
3. ✅ Verificar criação com query de validação

**Ganho:** 60-80% de redução no tempo de query

**Tempo estimado:** 15 minutos

**Arquivo:** `drizzle/migrations/add_sector_indexes.sql`

---

### FASE 2: Eliminar Subquery (Implementar no Código)

**Objetivo:** Buscar pesquisaIds ANTES da query principal

**Implementação:**

```typescript
// FASE 2: Buscar pesquisaIds ANTES
let pesquisaIds: number[] = [];
if (pesquisaId) {
  pesquisaIds = [pesquisaId];
} else if (projectId) {
  const pesquisasResult = await db
    .select({ id: pesquisas.id })
    .from(pesquisas)
    .where(eq(pesquisas.projectId, projectId));
  pesquisaIds = pesquisasResult.map((p) => p.id);

  if (pesquisaIds.length === 0) {
    return {
      sectors: [],
      grandTotals: { clientes: 0, leads: 0, concorrentes: 0 },
    };
  }
}

// Usar inArray ao invés de subquery
if (pesquisaIds.length > 0) {
  conditions.push(inArray(table.pesquisaId, pesquisaIds));
}
```

**Ganho:** +20-30% de redução adicional

**Tempo estimado:** 30 minutos

---

### FASE 3: Stored Procedures (Implementar no PostgreSQL)

**Objetivo:** Mover agregação para o banco de dados

**Tarefas:**

1. ✅ Criar 3 stored procedures (clientes/leads/concorrentes)
2. ✅ Executar no Supabase
3. ✅ Atualizar código TypeScript para chamar procedures
4. ✅ Implementar fallback automático

**Implementação TypeScript:**

```typescript
// FASE 3: Tentar usar stored procedure
try {
  const functionName = `get_sector_hierarchy_${input.entityType}`;
  const result: any = await db.execute(
    sql.raw(`SELECT * FROM ${functionName}(ARRAY[${pesquisaIds.join(', ')}])`)
  );

  // Processar resultado...
} catch (error) {
  // Fallback: usar query FASE 2
  console.warn('Stored procedure failed, using fallback query:', error);
}
```

**Ganho:** +50-70% de redução adicional

**Tempo estimado:** 1 hora

---

## 🎨 Frontend Components

### 1. Estrutura de Componentes

```
components/sectors/
├─ SectorDrillTable.tsx        # Componente principal
├─ SectorRow.tsx               # Linha de setor (nível 1)
├─ SubsectorRow.tsx            # Linha de subsetor (nível 2)
├─ SegmentRow.tsx              # Linha de segmento (nível 3)
├─ SectorFilters.tsx           # Filtros específicos
└─ SectorStats.tsx             # Estatísticas e cards
```

### 2. Página Principal

**Rota:** `/app/(app)/sectors/page.tsx`

**Layout:**

```tsx
<div className="flex h-screen">
  {/* Sidebar com estatísticas */}
  <aside className="w-80">
    <SectorStats projectId={projectId} pesquisaId={pesquisaId} />
  </aside>

  {/* Tabela drill-down */}
  <main className="flex-1">
    <SectorFilters />
    <SectorDrillTable entityType={activeTab} projectId={projectId} pesquisaId={pesquisaId} />
  </main>
</div>
```

### 3. Reutilização de Componentes

**Componentes existentes a reutilizar:**

- ✅ `EntityDetailCard` (modal de detalhes)
- ✅ `ErrorBoundary` (tratamento de erros)
- ✅ Padrão de abas (Clientes/Leads/Concorrentes)

---

## 🧪 Testes e Validação

### 1. Testes de Performance

**Cenários:**

| Cenário      | Volume | Tempo Target | Método |
| ------------ | ------ | ------------ | ------ |
| Poucos dados | <1k    | <0.1s        | FASE 2 |
| Médio volume | 1k-10k | <0.2s        | FASE 3 |
| Alto volume  | >10k   | <0.3s        | FASE 3 |

**Query de teste:**

```sql
EXPLAIN ANALYZE
SELECT * FROM get_sector_hierarchy_clientes(ARRAY[1, 2, 3]);
```

### 2. Testes Funcionais

**Checklist:**

- [ ] Expansão/colapso de níveis funciona
- [ ] Totalizadores corretos em cada nível
- [ ] Filtros aplicam corretamente
- [ ] Paginação funciona na lista de entidades
- [ ] Modal de detalhes abre corretamente
- [ ] Fallback funciona se procedure falhar
- [ ] Performance < 0.3s em todos os cenários

---

## 📦 Entregáveis

### 1. Banco de Dados

- [ ] Migration: `add_sector_indexes.sql` (6 índices)
- [ ] Migration: `create_setores_hierarquia_table.sql` (nova tabela)
- [ ] Migration: `create_sector_hierarchy_functions.sql` (3 stored procedures)
- [ ] Script: `seed_setores_hierarquia.sql` (dados iniciais)

### 2. Backend

- [ ] Router: `server/routers/sector-hierarchical.ts`
- [ ] Tipos: Adicionar em `server/db.ts`
- [ ] Registrar router em `server/routers/_app.ts`

### 3. Frontend

- [ ] Página: `app/(app)/sectors/page.tsx`
- [ ] Componentes: `components/sectors/*`
- [ ] Tipos: `types/sectors.ts`

### 4. Documentação

- [ ] `PLANO_DRILL_SETORES.md` (este documento)
- [ ] `IMPLEMENTACAO_DRILL_SETORES.md` (após implementação)
- [ ] Atualizar README com novo módulo

---

## ⏱️ Cronograma

| Fase           | Tarefa                             | Tempo | Responsável |
| -------------- | ---------------------------------- | ----- | ----------- |
| **Preparação** | Criar tabela setores_hierarquia    | 30min | Backend     |
| **Preparação** | Popular dados iniciais             | 1h    | Backend     |
| **FASE 1**     | Criar e executar índices           | 15min | DBA         |
| **FASE 2**     | Implementar router com otimizações | 2h    | Backend     |
| **FASE 3**     | Criar stored procedures            | 1h    | DBA         |
| **FASE 3**     | Integrar procedures no código      | 30min | Backend     |
| **Frontend**   | Criar componentes                  | 3h    | Frontend    |
| **Frontend**   | Criar página                       | 1h    | Frontend    |
| **Testes**     | Testes de performance              | 1h    | QA          |
| **Testes**     | Testes funcionais                  | 1h    | QA          |
| **Deploy**     | Deploy e validação                 | 30min | DevOps      |

**Total:** ~11 horas (~1.5 dias)

---

## 🚨 Riscos e Mitigações

### Risco 1: Dados de Setor Inconsistentes

**Problema:** Valores de `setor` podem estar em formatos diferentes (ex: "Tecnologia" vs "tecnologia")

**Mitigação:**

- Normalizar dados antes de criar hierarquia
- Criar script de limpeza: `scripts/normalize-sectors.ts`
- Adicionar validação no frontend

### Risco 2: Subsetor Ausente em Clientes

**Problema:** Tabela `clientes` não tem campo `subsetor`

**Mitigação:**

- Usar LEFT JOIN com `setores_hierarquia`
- Valor padrão: "Outros" quando subsetor não existir
- Considerar adicionar campo no futuro

### Risco 3: Performance com Muitos Setores

**Problema:** Se houver >100 setores, interface pode ficar lenta

**Mitigação:**

- Implementar paginação no nível de setores
- Adicionar busca/filtro de setores
- Lazy loading de subsetores

---

## 📈 Métricas de Sucesso

### Performance

- ✅ Tempo de query < 0.3s (95% das requisições)
- ✅ Tempo de renderização < 0.5s
- ✅ Suporta >50k registros sem degradação

### Funcionalidade

- ✅ 100% dos setores mapeados
- ✅ Totalizadores corretos em todos os níveis
- ✅ Filtros funcionando corretamente

### Qualidade

- ✅ Zero erros em produção
- ✅ Fallback funcionando (testado)
- ✅ Documentação completa

---

## 🔄 Próximos Passos (Pós-Implementação)

### Melhorias Futuras

1. **Adicionar campo `subsetor` em clientes**
   - Migration para adicionar coluna
   - Script de migração de dados

2. **Cache de hierarquia**
   - Implementar Redis cache
   - Invalidar ao adicionar/atualizar dados

3. **Exportação**
   - Excel com hierarquia
   - CSV planificado

4. **Análise Avançada**
   - Gráficos de distribuição por setor
   - Heatmap de concentração
   - Comparação temporal

---

**Documento criado por:** Equipe de Engenharia de Dados + Arquitetura  
**Baseado em:** Lições do módulo de Geoposição  
**Aprovação:** Aguardando validação do usuário
