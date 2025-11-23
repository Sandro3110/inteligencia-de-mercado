# 📊 Análise de Performance - Enriquecimento Faseado

## ⏱️ Performance Atual (Baseline)

**Teste:** Petrobras (1 cliente → 3 mercados → 20 concorrentes → 20 leads)  
**Tempo Total:** ~3 minutos (180 segundos)

### Breakdown por Fase:

| Fase | Descrição                                             | Tempo Estimado | % do Total |
| ---- | ----------------------------------------------------- | -------------- | ---------- |
| 1    | Enriquecer Cliente (1 chamada LLM)                    | ~5s            | 3%         |
| 2    | Identificar Produtos (1 chamada LLM)                  | ~5s            | 3%         |
| 3    | Identificar Mercados (1 chamada LLM + 3 INSERTs)      | ~10s           | 6%         |
| 4    | Gerar 20 Concorrentes (1-2 chamadas LLM + 20 INSERTs) | ~60s           | 33%        |
| 5    | Gerar 20 Leads (1-2 chamadas LLM + 20 INSERTs)        | ~60s           | 33%        |
| -    | Consultas de unicidade (50+ SELECTs)                  | ~40s           | 22%        |

**Gargalos Identificados:**

1. **Chamadas LLM sequenciais** - Fases 4 e 5 executam sequencialmente (120s total)
2. **INSERTs individuais** - 40 INSERTs separados para concorrentes + leads
3. **Consultas de unicidade** - 50+ SELECTs para verificar duplicatas
4. **Geração excessiva** - Gemini gera 30 quando precisa de 20 (50% overhead)

---

## 🚀 Otimizações Propostas

### 1. **Paralelização de Fases 4 e 5** ⚡⚡⚡ (Prioridade ALTA)

**Ganho Estimado:** -60s (33% mais rápido)

**Implementação:**

```typescript
// ANTES (sequencial)
const fase4 = await enrichClienteFase4(...);
const fase5 = await enrichClienteFase5(...);

// DEPOIS (paralelo)
const [fase4, fase5] = await Promise.all([
  enrichClienteFase4(...),
  enrichClienteFase5(...)
]);
```

**Impacto:** Reduz tempo de 120s para 60s (execução paralela)

---

### 2. **Batch Insert no Banco de Dados** ⚡⚡ (Prioridade MÉDIA)

**Ganho Estimado:** -10s (6% mais rápido)

**Implementação:**

```typescript
// ANTES (20 INSERTs individuais)
for (const concorrente of concorrentes) {
  await createConcorrente(concorrente);
}

// DEPOIS (1 INSERT com 20 registros)
await db.insert(concorrentes).values(concorrentesData);
```

**Impacto:** Reduz 40 INSERTs para 2 INSERTs (20x menos round-trips ao banco)

---

### 3. **Cache de Empresas Existentes** ⚡⚡ (Prioridade MÉDIA)

**Ganho Estimado:** -30s (17% mais rápido)

**Implementação:**

```typescript
// ANTES (50+ SELECTs)
for (const empresa of empresas) {
  const existe = await isEmpresaUnica(empresa.nome, projectId);
}

// DEPOIS (1 SELECT + cache em memória)
const empresasExistentes = await getAllEmpresasNomes(projectId);
const cache = new Set(empresasExistentes.map(normalizarNome));
const existe = cache.has(normalizarNome(empresa.nome));
```

**Impacto:** Reduz 50+ SELECTs para 1 SELECT inicial

---

### 4. **Reduzir Overhead de Geração** ⚡ (Prioridade BAIXA)

**Ganho Estimado:** -10s (6% mais rápido)

**Implementação:**

```typescript
// ANTES: Gera 30 (1.5x) para garantir 20 únicos
const quantidade = Math.ceil(quantidadeDesejada * 1.5);

// DEPOIS: Gera 25 (1.25x) - mais eficiente com cache
const quantidade = Math.ceil(quantidadeDesejada * 1.25);
```

**Impacto:** Reduz tokens LLM consumidos em 17%

---

### 5. **Streaming de Respostas LLM** ⚡ (Prioridade BAIXA)

**Ganho Estimado:** -5s (3% mais rápido)

**Implementação:**

- Processar resultados conforme chegam (não esperar resposta completa)
- Requer mudança na API do Gemini (usar `stream: true`)

**Impacto:** Reduz latência percebida, mas não tempo total

---

## 📈 Performance Projetada (Após Otimizações)

| Otimização                | Ganho | Tempo Acumulado |
| ------------------------- | ----- | --------------- |
| **Baseline**              | -     | 180s            |
| Paralelização (Fases 4+5) | -60s  | **120s** ✅     |
| Batch Insert              | -10s  | **110s** ✅     |
| Cache de Empresas         | -30s  | **80s** ✅      |
| Reduzir Overhead          | -10s  | **70s** ✅      |

**Resultado Final:** **70 segundos** (~1 minuto)  
**Melhoria:** **61% mais rápido** (de 3min para 1min)

---

## 🎯 Plano de Implementação

### Fase 1: Otimizações de Alto Impacto (Prioridade ALTA)

1. ✅ Implementar paralelização de Fases 4 e 5
2. ✅ Implementar cache de empresas existentes
3. ✅ Testar e validar (ganho esperado: -90s)

### Fase 2: Otimizações de Médio Impacto (Prioridade MÉDIA)

4. ✅ Implementar batch insert
5. ✅ Reduzir overhead de geração
6. ✅ Testar e validar (ganho esperado: -20s)

### Fase 3: Validação Final

7. ✅ Comparar performance antes/depois
8. ✅ Validar que não há regressão de qualidade
9. ✅ Criar checkpoint com otimizações

---

## 📊 Métricas de Sucesso

- **Tempo total** < 90 segundos (50% mais rápido que baseline)
- **Qualidade dos dados** mantida (100% empresas únicas)
- **Custo LLM** reduzido em 17% (menos tokens consumidos)
- **Carga no banco** reduzida em 95% (2 INSERTs ao invés de 40)

---

## 🔧 Considerações Técnicas

### Paralelização

- **Vantagem:** Reduz tempo total significativamente
- **Desvantagem:** Aumenta consumo de memória (2 chamadas LLM simultâneas)
- **Mitigação:** Limitar paralelização a 2-3 chamadas simultâneas

### Cache de Empresas

- **Vantagem:** Reduz drasticamente consultas ao banco
- **Desvantagem:** Pode ficar desatualizado se outro processo inserir empresas
- **Mitigação:** Recarregar cache a cada nova fase ou usar TTL de 5 minutos

### Batch Insert

- **Vantagem:** Reduz round-trips ao banco
- **Desvantagem:** Falha em 1 registro cancela todo o batch
- **Mitigação:** Validar todos os registros antes do INSERT

---

## 🚨 Riscos e Limitações

1. **Rate Limiting do Gemini** - Paralelização pode atingir limites de taxa
2. **Memória** - Cache de 10.000+ empresas pode consumir ~10MB RAM
3. **Consistência** - Cache pode ficar desatualizado em ambientes multi-processo

**Recomendação:** Implementar otimizações 1, 2 e 3 primeiro (maior impacto, menor risco)
