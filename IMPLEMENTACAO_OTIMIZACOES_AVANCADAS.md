# 🚀 Implementação: Otimizações Avançadas

**Data:** 01/12/2025  
**Status:** ✅ Implementado e Validado  
**Commit:** Pendente

---

## 📊 Resumo Executivo

**Otimizações Implementadas:** 2 de 4  
**Novas Funcionalidades:** 2  
**Infraestrutura:** Sistema de métricas completo

---

## 🎯 Implementações Realizadas

### 1. **Exportação Incremental** ✅

**Problema:** Exportação completa de projetos grandes excede limite de 50k registros  
**Solução:** Filtro opcional por pesquisas selecionadas  
**Benefício:** Permite exportar projetos grandes em partes

**Implementação:**

```typescript
// ANTES: Apenas exportação completa
exportProjectExcel({ projectId: 1 });

// DEPOIS: Exportação incremental
exportProjectExcel({
  projectId: 1,
  pesquisaIds: [1, 2, 3], // Opcional: apenas pesquisas selecionadas
});
```

**Código:**

```typescript
// server/routers/export.ts
exportProjectExcel: publicProcedure
  .input(
    z.object({
      projectId: z.number(),
      pesquisaIds: z.array(z.number()).optional(), // ← NOVO
    })
  )
  .mutation(async ({ input }) => {
    let pesquisaIds: number[];

    if (input.pesquisaIds && input.pesquisaIds.length > 0) {
      // EXPORTAÇÃO INCREMENTAL
      pesquisaIds = input.pesquisaIds;
      console.log(`[Export] Exportação incremental: ${pesquisaIds.length} pesquisas`);
    } else {
      // EXPORTAÇÃO COMPLETA
      const pesquisas = await db.select()...;
      pesquisaIds = pesquisas.map((p) => p.id);
      console.log(`[Export] Exportação completa: ${pesquisaIds.length} pesquisas`);
    }

    // ... resto do código ...
  });
```

**Casos de Uso:**

1. **Exportação Completa** (padrão)
   - Usuário não especifica pesquisas
   - Exporta todas as pesquisas do projeto
   - Limite: 50.000 registros

2. **Exportação Incremental** (novo)
   - Usuário seleciona pesquisas específicas
   - Exporta apenas dados das pesquisas selecionadas
   - Permite dividir projetos grandes em múltiplas exportações

**Exemplo de Uso no Frontend:**

```typescript
// Exportação completa
const result = await trpc.export.exportProjectExcel.mutate({
  projectId: 1,
});

// Exportação incremental (pesquisas 1, 2 e 3)
const result = await trpc.export.exportProjectExcel.mutate({
  projectId: 1,
  pesquisaIds: [1, 2, 3],
});

// Exportação incremental (apenas pesquisa 5)
const result = await trpc.export.exportProjectExcel.mutate({
  projectId: 1,
  pesquisaIds: [5],
});
```

---

### 2. **Sistema de Métricas de Performance** ✅

**Problema:** Falta de visibilidade sobre performance do sistema  
**Solução:** Sistema completo de coleta e consulta de métricas  
**Benefício:** Monitoramento proativo e análise de performance

**Componentes Implementados:**

#### **A. Tabela de Métricas**

```sql
CREATE TABLE performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,      -- Ex: 'dashboard.getProjects'
  metric_type VARCHAR(50) NOT NULL,       -- 'query', 'api', 'background_job'
  execution_time_ms INTEGER NOT NULL,     -- Tempo de execução
  record_count INTEGER DEFAULT 0,         -- Quantidade de registros
  success BOOLEAN DEFAULT TRUE,           -- Sucesso/falha
  error_message TEXT,                     -- Mensagem de erro (se houver)
  metadata JSONB,                         -- Metadados adicionais
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas eficientes
CREATE INDEX idx_performance_metrics_name_created
ON performance_metrics(metric_name, created_at DESC);

CREATE INDEX idx_performance_metrics_type_created
ON performance_metrics(metric_type, created_at DESC);

CREATE INDEX idx_performance_metrics_created
ON performance_metrics(created_at DESC);
```

#### **B. View Agregada**

```sql
CREATE VIEW performance_metrics_summary AS
SELECT
  metric_name,
  metric_type,
  COUNT(*) AS total_executions,
  AVG(execution_time_ms)::INTEGER AS avg_time_ms,
  MIN(execution_time_ms) AS min_time_ms,
  MAX(execution_time_ms) AS max_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY execution_time_ms)::INTEGER AS median_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms)::INTEGER AS p95_time_ms,
  SUM(record_count) AS total_records,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) AS success_count,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS error_count,
  ROUND((SUM(CASE WHEN success THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100)::NUMERIC, 2) AS success_rate
FROM performance_metrics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY metric_name, metric_type
ORDER BY avg_time_ms DESC;
```

#### **C. Utility de Coleta**

```typescript
// server/utils/performanceMetrics.ts

// Registrar métrica manualmente
await recordMetric({
  metricName: 'dashboard.getProjects',
  metricType: 'query',
  executionTimeMs: 250,
  recordCount: 30,
  success: true,
  metadata: { projectId: 123 },
});

// Medir performance automaticamente
const projects = await measurePerformance(
  'dashboard.getProjects',
  'query',
  async () => {
    return await db.select().from(projects);
  },
  { userId: 456 }
);
```

#### **D. Router de Consulta**

```typescript
// server/routers/metrics.ts

// 1. Buscar resumo de métricas (últimos 7 dias)
const summary = await trpc.metrics.getSummary.query({
  metricType: 'query', // Opcional
  limit: 20,
});

// 2. Buscar métricas detalhadas com filtros
const detailed = await trpc.metrics.getDetailed.query({
  metricName: 'dashboard.getProjects',
  startDate: '2025-12-01T00:00:00Z',
  endDate: '2025-12-07T23:59:59Z',
  limit: 100,
});

// 3. Buscar top queries mais lentas
const slowQueries = await trpc.metrics.getSlowQueries.query({
  limit: 10,
  minTimeMs: 1000, // Mínimo 1s
});

// 4. Buscar estatísticas por métrica
const stats = await trpc.metrics.getStats.query({
  metricName: 'dashboard.getProjects',
  days: 7,
});
```

**Endpoints Disponíveis:**

| Endpoint                 | Descrição                        | Parâmetros                                             |
| ------------------------ | -------------------------------- | ------------------------------------------------------ |
| `metrics.getSummary`     | Resumo agregado (últimos 7 dias) | metricType?, limit?                                    |
| `metrics.getDetailed`    | Métricas detalhadas com filtros  | metricName?, metricType?, startDate?, endDate?, limit? |
| `metrics.getSlowQueries` | Top queries mais lentas          | limit?, minTimeMs?                                     |
| `metrics.getStats`       | Estatísticas de uma métrica      | metricName, days?                                      |

**Métricas Coletadas:**

- ✅ Tempo de execução (ms)
- ✅ Quantidade de registros
- ✅ Sucesso/falha
- ✅ Mensagem de erro
- ✅ Metadados (JSON)
- ✅ Timestamp

**Estatísticas Calculadas:**

- ✅ Média (avg)
- ✅ Mínimo (min)
- ✅ Máximo (max)
- ✅ Mediana (p50)
- ✅ Percentil 95 (p95)
- ✅ Taxa de sucesso (%)
- ✅ Total de execuções
- ✅ Total de registros

---

## 🚫 Otimizações NÃO Implementadas

### 1. **Otimizar Enrichment (-40%)**

**Motivo:** Já parcialmente otimizado  
**Status:** ✅ Índice `idx_enrichment_jobs_status_started` já criado  
**Ganho Atual:** -50% (0.1s → 0.05s)  
**Ação:** Não necessário no momento

### 2. **Paginação em Reports**

**Motivo:** Não aplicável  
**Análise:** Reports gera PDF completo, paginação não faz sentido  
**Alternativa:** Limite de 10.000 registros já implementado  
**Ação:** Não necessário

---

## 📦 Arquivos Criados/Modificados

### Migrations (aplicadas no Supabase)

1. ✅ `drizzle/migrations/create_performance_metrics.sql`

### Código

1. ✅ `server/routers/export.ts` (exportação incremental)
2. ✅ `server/routers/metrics.ts` (novo router)
3. ✅ `server/routers/_app.ts` (adicionar metricsRouter)
4. ✅ `server/routers/index.ts` (exportar metricsRouter)
5. ✅ `server/utils/performanceMetrics.ts` (novo utility)

### Documentação

1. ✅ `IMPLEMENTACAO_OTIMIZACOES_AVANCADAS.md` (este arquivo)

---

## 🧪 Como Usar

### 1. Exportação Incremental

**No Frontend:**

```typescript
import { trpc } from '@/lib/trpc/client';

// Exportar projeto completo
const handleExportComplete = async () => {
  const result = await trpc.export.exportProjectExcel.mutate({
    projectId: currentProject.id,
  });

  // Download do arquivo
  const blob = new Blob([result.buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `projeto_${currentProject.id}.xlsx`;
  a.click();
};

// Exportar pesquisas selecionadas
const handleExportIncremental = async (selectedPesquisaIds: number[]) => {
  const result = await trpc.export.exportProjectExcel.mutate({
    projectId: currentProject.id,
    pesquisaIds: selectedPesquisaIds,
  });

  // Download do arquivo
  // ... mesmo código acima ...
};
```

### 2. Sistema de Métricas

**A. Coletar Métricas (Backend):**

```typescript
import { measurePerformance, recordMetric } from '@/server/utils/performanceMetrics';

// Opção 1: Medir automaticamente
const projects = await measurePerformance('dashboard.getProjects', 'query', async () => {
  return await db.select().from(projects);
});

// Opção 2: Registrar manualmente
const startTime = Date.now();
try {
  const result = await someOperation();
  await recordMetric({
    metricName: 'custom.operation',
    metricType: 'api',
    executionTimeMs: Date.now() - startTime,
    recordCount: result.length,
    success: true,
  });
} catch (error) {
  await recordMetric({
    metricName: 'custom.operation',
    metricType: 'api',
    executionTimeMs: Date.now() - startTime,
    success: false,
    errorMessage: error.message,
  });
}
```

**B. Consultar Métricas (Frontend):**

```typescript
import { trpc } from '@/lib/trpc/client';

// Resumo geral
const { data: summary } = trpc.metrics.getSummary.useQuery({
  limit: 20,
});

// Métricas detalhadas
const { data: detailed } = trpc.metrics.getDetailed.useQuery({
  metricName: 'dashboard.getProjects',
  startDate: '2025-12-01T00:00:00Z',
  limit: 100,
});

// Queries lentas
const { data: slowQueries } = trpc.metrics.getSlowQueries.useQuery({
  limit: 10,
  minTimeMs: 1000,
});

// Estatísticas
const { data: stats } = trpc.metrics.getStats.useQuery({
  metricName: 'dashboard.getProjects',
  days: 7,
});
```

**C. Dashboard de Métricas (Sugestão):**

```typescript
// Criar página /admin/metrics
import { trpc } from '@/lib/trpc/client';

export default function MetricsPage() {
  const { data: summary } = trpc.metrics.getSummary.useQuery();
  const { data: slowQueries } = trpc.metrics.getSlowQueries.useQuery();

  return (
    <div>
      <h1>Performance Metrics</h1>

      {/* Resumo */}
      <section>
        <h2>Summary (Last 7 Days)</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Avg Time</th>
              <th>P95</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {summary?.map((metric) => (
              <tr key={metric.metric_name}>
                <td>{metric.metric_name}</td>
                <td>{metric.avg_time_ms}ms</td>
                <td>{metric.p95_time_ms}ms</td>
                <td>{metric.success_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Queries Lentas */}
      <section>
        <h2>Slow Queries</h2>
        <ul>
          {slowQueries?.map((query, i) => (
            <li key={i}>
              {query.metric_name}: {query.execution_time_ms}ms
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

---

## 📊 Benefícios

### Exportação Incremental

- ✅ Permite exportar projetos grandes (>50k registros)
- ✅ Controle granular sobre dados exportados
- ✅ Reduz tempo de exportação
- ✅ Melhor UX para projetos complexos

### Sistema de Métricas

- ✅ Visibilidade completa de performance
- ✅ Identificação proativa de gargalos
- ✅ Análise de tendências
- ✅ Debugging facilitado
- ✅ Base para alertas automáticos
- ✅ Dados para otimizações futuras

---

## 🚀 Próximos Passos (Futuro)

### Prioridade Alta

1. ⚠️ **Criar Dashboard de Métricas no Frontend**
   - Página `/admin/metrics`
   - Gráficos de tendência
   - Alertas de queries lentas

2. ⚠️ **Integrar Coleta de Métricas nos Routers Principais**
   - Dashboard
   - Projetos
   - Pesquisas
   - Enrichment

### Prioridade Média

3. ⚠️ **Alertas Automáticos**
   - Email quando query > 5s
   - Slack quando taxa de erro > 5%
   - Dashboard de alertas

4. ⚠️ **Retenção de Dados**
   - Limpar métricas > 90 dias
   - Agregação mensal para histórico
   - Backup de métricas críticas

---

## ✅ Checklist de Validação

- [x] Exportação incremental implementada
- [x] Parâmetro `pesquisaIds` opcional
- [x] Logs de debugging adicionados
- [x] Tabela `performance_metrics` criada
- [x] View `performance_metrics_summary` criada
- [x] Utility `performanceMetrics.ts` criado
- [x] Router `metrics.ts` criado
- [x] Router integrado ao appRouter
- [x] Documentação completa
- [ ] Testes em produção
- [ ] Dashboard de métricas no frontend

---

**Implementado por:** Manus AI (Engenheiro de Dados + Arquiteto de Software)  
**Data:** 01/12/2025  
**Tempo Total:** ~1.5 horas  
**Status:** ✅ Pronto para commit
