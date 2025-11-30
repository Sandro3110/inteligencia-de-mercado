# 🏗️ Plano de Implementação: Drill-Down de Produtos/Mercados

**Equipe:** Engenharia de Dados + Arquitetura de Aplicação  
**Data:** 30/11/2025  
**Projeto:** IntelMarket - Inteligência de Mercado  
**Versão:** 2.0 (Baseado em lições de Geoposição)

---

## 📋 Executive Summary

### Objetivo

Implementar módulo de drill-down hierárquico **Produtos → Mercados → Região → Estado → Cidade** com performance otimizada desde o início, aplicando as 3 fases de otimização aprendidas no módulo de Geoposição.

### Hierarquia

```
Produto (ex: ERP Cloud)
  └─ Mercado (ex: Indústria Automotiva)
      └─ Região (ex: Sudeste)
          └─ Estado (ex: SP)
              └─ Cidade (ex: São Paulo)
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

- `produtos` → Produtos cadastrados (relacionados a clientes)
- `mercadosUnicos` → Mercados únicos identificados
- `clientes` → Possui produtos via `produtos.clienteId`
- `leads` → Relacionados a mercados via `mercadoId`
- `concorrentes` → Relacionados a mercados via `mercadoId`

**Relacionamentos:**

```
produtos
  ├─ clienteId → clientes.id (1:N)
  ├─ mercadoId → mercadosUnicos.id (N:1)
  └─ projectId → projects.id (N:1)

clientes
  ├─ produtos (1:N via produtos.clienteId)
  └─ localização (uf, cidade)

leads
  ├─ mercadoId → mercadosUnicos.id (N:1)
  └─ localização (uf, cidade)

concorrentes
  ├─ mercadoId → mercadosUnicos.id (N:1)
  └─ localização (uf, cidade)
```

### 2. Schema Atual

```typescript
// Tabela produtos
export const produtos = pgTable('produtos', {
  id: serial('id').primaryKey(),
  projectId: integer('projectId').notNull(),
  clienteId: integer('clienteId').notNull(),
  mercadoId: integer('mercadoId').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  categoria: varchar('categoria', { length: 100 }),
  preco: text('preco'),
  unidade: varchar('unidade', { length: 50 }),
  ativo: integer('ativo').default(1).notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow(),
});

// Índices existentes
index('idx_produtos_clienteId').on(table.clienteId),
index('idx_produtos_mercadoId').on(table.mercadoId),
```

### 3. Volumetria Estimada

| Nível    | Quantidade Estimada | Exemplo                                     |
| -------- | ------------------- | ------------------------------------------- |
| Produtos | 500-1000            | ERP Cloud, CRM Mobile, Sistema Logística    |
| Mercados | 50-100              | Indústria Automotiva, Varejo, Saúde         |
| Regiões  | 5                   | Sul, Sudeste, Centro-Oeste, Nordeste, Norte |
| Estados  | 27                  | SP, RJ, MG, RS, PR, SC...                   |
| Cidades  | 1000+               | São Paulo, Rio, Curitiba...                 |
| Empresas | >50k                | Todas as entidades                          |

**Complexidade:** ALTA (5 níveis hierárquicos)

---

## 🏛️ Arquitetura Técnica

### 1. Schema do Banco de Dados

#### 1.1 Índices de Performance (FASE 1)

**Aplicar desde o início:**

```sql
-- PRODUTOS
CREATE INDEX idx_produtos_nome_mercado
ON produtos(nome, "mercadoId", "projectId");

CREATE INDEX idx_produtos_categoria
ON produtos(categoria, "projectId");

-- CLIENTES (adicionar índice composto com produtos)
CREATE INDEX idx_clientes_produto_geo
ON clientes("projectId", uf, cidade);

-- LEADS (já tem índices de geoposição, adicionar mercado)
CREATE INDEX idx_leads_mercado_geo
ON leads("mercadoId", uf, cidade)
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- CONCORRENTES (já tem índices de geoposição, adicionar mercado)
CREATE INDEX idx_concorrentes_mercado_geo
ON concorrentes("mercadoId", uf, cidade)
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- MERCADOS ÚNICOS
CREATE INDEX idx_mercados_projectId
ON "mercadosUnicos"("projectId");
```

**Total:** 6 novos índices

### 2. API Layer (tRPC)

#### 2.1 Router: `product-hierarchical.ts`

```typescript
export const productHierarchicalRouter = router({
  /**
   * Buscar dados hierárquicos (Produto → Mercado → Região → Estado → Cidade)
   */
  getHierarchicalData: publicProcedure
    .input(
      z.object({
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']).default('clientes'),
        filters: z
          .object({
            categoria: z.string().nullable().optional(),
            mercado: z.string().nullable().optional(),
            porte: z.string().nullable().optional(),
            qualidade: z.string().nullable().optional(),
          })
          .optional()
          .default({}),
      })
    )
    .query(async ({ input }) => {
      // Implementação com FASE 2 e FASE 3 desde o início
    }),

  /**
   * Buscar produtos de um mercado específico
   */
  getMarketProducts: publicProcedure
    .input(
      z.object({
        mercadoId: z.number(),
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      // Retorna produtos do mercado
    }),

  /**
   * Buscar entidades de um produto em uma cidade específica
   */
  getProductCityEntities: publicProcedure
    .input(
      z.object({
        produtoNome: z.string(),
        mercadoId: z.number(),
        cidade: z.string(),
        uf: z.string(),
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
interface ProductCount {
  clientes: number;
  leads: number;
  concorrentes: number;
}

interface CityData {
  name: string;
  uf: string;
  totals: ProductCount;
}

interface StateData {
  uf: string;
  cities: CityData[];
  totals: ProductCount;
}

interface RegionData {
  name: string;
  states: StateData[];
  totals: ProductCount;
}

interface MarketData {
  id: number;
  name: string;
  regions: RegionData[];
  totals: ProductCount;
}

interface ProductData {
  id: number;
  name: string;
  categoria: string;
  markets: MarketData[];
  totals: ProductCount;
}

interface HierarchicalResponse {
  products: ProductData[];
  grandTotals: ProductCount;
}
```

### 3. Stored Procedures (FASE 3)

#### 3.1 Funções PostgreSQL

**Desafio:** Hierarquia de 5 níveis é complexa para stored procedure

**Estratégia:** Criar procedures para níveis críticos

```sql
-- Função 1: Agregar produtos por mercado
CREATE OR REPLACE FUNCTION get_product_market_summary(
  p_project_id INTEGER,
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  produto_nome TEXT,
  produto_categoria TEXT,
  mercado_id INTEGER,
  mercado_nome TEXT,
  cliente_count INTEGER,
  lead_count INTEGER,
  concorrente_count INTEGER
)
LANGUAGE sql
STABLE
AS $$
  WITH produto_clientes AS (
    SELECT
      p.nome as produto_nome,
      p.categoria as produto_categoria,
      p."mercadoId" as mercado_id,
      m.nome as mercado_nome,
      COUNT(DISTINCT c.id)::INTEGER as cliente_count
    FROM produtos p
    JOIN clientes c ON p."clienteId" = c.id
    JOIN "mercadosUnicos" m ON p."mercadoId" = m.id
    WHERE p."projectId" = p_project_id
      AND c."pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY p.nome, p.categoria, p."mercadoId", m.nome
  ),
  mercado_leads AS (
    SELECT
      l."mercadoId" as mercado_id,
      COUNT(*)::INTEGER as lead_count
    FROM leads l
    WHERE l."pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY l."mercadoId"
  ),
  mercado_concorrentes AS (
    SELECT
      co."mercadoId" as mercado_id,
      COUNT(*)::INTEGER as concorrente_count
    FROM concorrentes co
    WHERE co."pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY co."mercadoId"
  )
  SELECT
    pc.produto_nome,
    pc.produto_categoria,
    pc.mercado_id,
    pc.mercado_nome,
    pc.cliente_count,
    COALESCE(ml.lead_count, 0) as lead_count,
    COALESCE(mc.concorrente_count, 0) as concorrente_count
  FROM produto_clientes pc
  LEFT JOIN mercado_leads ml ON pc.mercado_id = ml.mercado_id
  LEFT JOIN mercado_concorrentes mc ON pc.mercado_id = mc.mercado_id
  ORDER BY pc.produto_nome, pc.mercado_nome;
$$;

-- Função 2: Distribuição geográfica de um produto em um mercado
CREATE OR REPLACE FUNCTION get_product_geo_distribution(
  p_produto_nome TEXT,
  p_mercado_id INTEGER,
  p_pesquisa_ids INTEGER[],
  p_entity_type TEXT
)
RETURNS TABLE (
  regiao TEXT,
  uf TEXT,
  cidade TEXT,
  entity_count INTEGER
)
LANGUAGE sql
STABLE
AS $$
  -- Implementação similar ao get_geo_hierarchy
  -- mas filtrado por produto e mercado
$$;
```

**Ganho esperado:** 40-60% de redução (menor que Geoposição devido à complexidade)

---

## 📊 Implementação em 3 Fases

### FASE 1: Índices Compostos (Implementar PRIMEIRO)

**Objetivo:** Criar índices antes de qualquer código

**Tarefas:**

1. ✅ Criar migration SQL com 6 índices
2. ✅ Executar no Supabase
3. ✅ Verificar criação com query de validação

**Ganho:** 50-70% de redução no tempo de query (menor que Geoposição devido à complexidade)

**Tempo estimado:** 20 minutos

**Arquivo:** `drizzle/migrations/add_product_indexes.sql`

---

### FASE 2: Eliminar Subquery + Otimizar JOINs

**Objetivo:** Buscar dados relacionados ANTES e usar JOINs eficientes

**Implementação:**

```typescript
// FASE 2A: Buscar pesquisaIds ANTES
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
      products: [],
      grandTotals: { clientes: 0, leads: 0, concorrentes: 0 },
    };
  }
}

// FASE 2B: Buscar produtos e mercados ANTES
const produtosResult = await db
  .select({
    id: produtos.id,
    nome: produtos.nome,
    categoria: produtos.categoria,
    mercadoId: produtos.mercadoId,
  })
  .from(produtos)
  .where(eq(produtos.projectId, projectId));

const mercadosMap = new Map();
const mercadosResult = await db
  .select()
  .from(mercadosUnicos)
  .where(eq(mercadosUnicos.projectId, projectId));

mercadosResult.forEach((m) => mercadosMap.set(m.id, m));

// FASE 2C: Usar dados pré-carregados nas queries subsequentes
```

**Ganho:** +15-25% de redução adicional

**Tempo estimado:** 1 hora

---

### FASE 3: Stored Procedures (Implementar Parcialmente)

**Objetivo:** Mover agregações críticas para o banco

**Estratégia:** Procedures para níveis 1-2, código para níveis 3-5

**Tarefas:**

1. ✅ Criar procedure `get_product_market_summary`
2. ✅ Criar procedure `get_product_geo_distribution`
3. ✅ Executar no Supabase
4. ✅ Atualizar código TypeScript
5. ✅ Implementar fallback automático

**Ganho:** +30-50% de redução adicional

**Tempo estimado:** 2 horas

---

## 🎨 Frontend Components

### 1. Estrutura de Componentes

```
components/products/
├─ ProductDrillTable.tsx       # Componente principal
├─ ProductRow.tsx              # Linha de produto (nível 1)
├─ MarketRow.tsx               # Linha de mercado (nível 2)
├─ RegionRow.tsx               # Linha de região (nível 3) - REUTILIZAR
├─ StateRow.tsx                # Linha de estado (nível 4) - REUTILIZAR
├─ CityRow.tsx                 # Linha de cidade (nível 5) - REUTILIZAR
├─ ProductFilters.tsx          # Filtros específicos
└─ ProductStats.tsx            # Estatísticas e cards
```

### 2. Página Principal

**Rota:** `/app/(app)/products/page.tsx`

**Layout:**

```tsx
<div className="flex h-screen">
  {/* Sidebar com estatísticas */}
  <aside className="w-80">
    <ProductStats projectId={projectId} pesquisaId={pesquisaId} />
  </aside>

  {/* Tabela drill-down */}
  <main className="flex-1">
    <ProductFilters />
    <ProductDrillTable entityType={activeTab} projectId={projectId} pesquisaId={pesquisaId} />
  </main>
</div>
```

### 3. Reutilização de Componentes

**Componentes existentes a reutilizar:**

- ✅ `RegionRow`, `StateRow`, `CityRow` (do módulo de Geoposição)
- ✅ `EntityDetailCard` (modal de detalhes)
- ✅ `ErrorBoundary` (tratamento de erros)
- ✅ Padrão de abas (Clientes/Leads/Concorrentes)

**Benefício:** ~40% de redução no tempo de desenvolvimento

---

## 🧪 Testes e Validação

### 1. Testes de Performance

**Cenários:**

| Cenário         | Volume  | Níveis | Tempo Target | Método |
| --------------- | ------- | ------ | ------------ | ------ |
| Poucos produtos | <100    | 1-2    | <0.2s        | FASE 2 |
| Médio volume    | 100-500 | 1-3    | <0.4s        | FASE 3 |
| Alto volume     | >500    | 1-5    | <0.6s        | FASE 3 |

**Query de teste:**

```sql
EXPLAIN ANALYZE
SELECT * FROM get_product_market_summary(1, ARRAY[1, 2, 3]);
```

### 2. Testes Funcionais

**Checklist:**

- [ ] Expansão/colapso de 5 níveis funciona
- [ ] Totalizadores corretos em cada nível
- [ ] Filtros aplicam corretamente
- [ ] Relacionamento produto-mercado correto
- [ ] Distribuição geográfica correta
- [ ] Paginação funciona na lista de entidades
- [ ] Modal de detalhes abre corretamente
- [ ] Fallback funciona se procedure falhar
- [ ] Performance < 0.6s em todos os cenários

### 3. Testes de Integridade de Dados

**Validações:**

- [ ] Produtos sem mercado são tratados
- [ ] Clientes sem produtos aparecem?
- [ ] Leads/concorrentes sem coordenadas aparecem
- [ ] Totalizadores batem com soma manual

---

## 📦 Entregáveis

### 1. Banco de Dados

- [ ] Migration: `add_product_indexes.sql` (6 índices)
- [ ] Migration: `create_product_hierarchy_functions.sql` (2 stored procedures)
- [ ] Script: `validate_product_data.sql` (validação de integridade)

### 2. Backend

- [ ] Router: `server/routers/product-hierarchical.ts`
- [ ] Tipos: Adicionar em `server/db.ts`
- [ ] Registrar router em `server/routers/_app.ts`
- [ ] Helpers: `server/lib/product-helpers.ts` (funções auxiliares)

### 3. Frontend

- [ ] Página: `app/(app)/products/page.tsx`
- [ ] Componentes: `components/products/*`
- [ ] Tipos: `types/products.ts`
- [ ] Hooks: `hooks/useProductHierarchy.ts`

### 4. Documentação

- [ ] `PLANO_DRILL_PRODUTOS.md` (este documento)
- [ ] `IMPLEMENTACAO_DRILL_PRODUTOS.md` (após implementação)
- [ ] Atualizar README com novo módulo

---

## ⏱️ Cronograma

| Fase           | Tarefa                             | Tempo | Responsável |
| -------------- | ---------------------------------- | ----- | ----------- |
| **Preparação** | Validar dados de produtos          | 1h    | Backend     |
| **Preparação** | Criar scripts de validação         | 1h    | Backend     |
| **FASE 1**     | Criar e executar índices           | 20min | DBA         |
| **FASE 2**     | Implementar router com otimizações | 3h    | Backend     |
| **FASE 3**     | Criar stored procedures            | 2h    | DBA         |
| **FASE 3**     | Integrar procedures no código      | 1h    | Backend     |
| **Frontend**   | Criar componentes novos            | 4h    | Frontend    |
| **Frontend**   | Reutilizar componentes geo         | 1h    | Frontend    |
| **Frontend**   | Criar página                       | 1h    | Frontend    |
| **Testes**     | Testes de performance              | 1.5h  | QA          |
| **Testes**     | Testes funcionais                  | 1.5h  | QA          |
| **Testes**     | Testes de integridade              | 1h    | QA          |
| **Deploy**     | Deploy e validação                 | 30min | DevOps      |

**Total:** ~18 horas (~2.5 dias)

---

## 🚨 Riscos e Mitigações

### Risco 1: Complexidade da Hierarquia (5 níveis)

**Problema:** Performance pode degradar com 5 níveis de drill-down

**Mitigação:**

- Lazy loading: carregar níveis sob demanda
- Limitar expansão simultânea (máx 3 níveis abertos)
- Cache de resultados intermediários

### Risco 2: Produtos sem Mercado

**Problema:** Produtos podem não ter mercado associado

**Mitigação:**

- Criar mercado "Não Classificado"
- Validação no cadastro de produtos
- Script de correção de dados

### Risco 3: Performance com Muitos Produtos

**Problema:** Se houver >1000 produtos, interface pode ficar lenta

**Mitigação:**

- Paginação no nível de produtos
- Busca/filtro de produtos
- Virtualização de lista (react-window)

### Risco 4: JOINs Complexos

**Problema:** Múltiplos JOINs podem ser lentos

**Mitigação:**

- Índices em todas as foreign keys
- Denormalização seletiva se necessário
- Monitoramento de query plans

---

## 📈 Métricas de Sucesso

### Performance

- ✅ Tempo de query nível 1-2: < 0.2s
- ✅ Tempo de query nível 3-5: < 0.4s
- ✅ Tempo de renderização: < 0.5s
- ✅ Suporta >50k registros sem degradação

### Funcionalidade

- ✅ 100% dos produtos mapeados
- ✅ Totalizadores corretos em todos os níveis
- ✅ Filtros funcionando corretamente
- ✅ Navegação fluida entre 5 níveis

### Qualidade

- ✅ Zero erros em produção
- ✅ Fallback funcionando (testado)
- ✅ Documentação completa
- ✅ Cobertura de testes > 80%

---

## 🔄 Próximos Passos (Pós-Implementação)

### Melhorias Futuras

1. **Análise de Penetração de Produto**
   - Identificar regiões com baixa penetração
   - Sugerir oportunidades de expansão

2. **Comparação de Produtos**
   - Comparar distribuição de 2+ produtos
   - Análise competitiva por produto

3. **Previsão de Demanda**
   - ML para prever demanda por região
   - Recomendação de produtos por mercado

4. **Exportação Avançada**
   - Excel com 5 níveis hierárquicos
   - Dashboard executivo (PDF)

5. **Integração com CRM**
   - Sincronizar oportunidades
   - Pipeline por produto/região

---

## 🎯 Diferencial Estratégico

Este módulo é o **mais complexo** dos 3 drill-downs, mas também o **mais valioso** para estratégia de negócio:

### Perguntas que Responde:

1. **Onde expandir?** Quais regiões têm baixa penetração de produtos específicos?
2. **Qual produto priorizar?** Quais produtos têm melhor distribuição geográfica?
3. **Onde está a concorrência?** Em quais regiões/mercados a concorrência é mais forte?
4. **Qual mercado atacar?** Quais mercados têm mais leads qualificados para cada produto?

### Vantagem Competitiva:

- **Visão produto-cêntrica** complementa visão geo-cêntrica
- **5 níveis de drill-down** oferecem granularidade única
- **Performance otimizada** permite análise em tempo real
- **Integração com outros módulos** cria visão 360°

---

**Documento criado por:** Equipe de Engenharia de Dados + Arquitetura  
**Baseado em:** Lições do módulo de Geoposição  
**Complexidade:** ALTA (5 níveis hierárquicos)  
**Aprovação:** Aguardando validação do usuário
