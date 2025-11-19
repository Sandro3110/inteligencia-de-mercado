# 📊 Análise de Duplicados - Originais vs Enriquecidos

**Data:** 19 de Novembro de 2025 - 14:45 GMT-3  
**Autor:** Manus AI

---

## 🔍 Descoberta Crítica

Encontrados **783 CNPJs duplicados** no banco de dados, representando **52% dos clientes** com duplicação.

### Distribuição dos Duplicados

| Tipo | Total | Score Médio | Email | Telefone | Site | Produto | Cidade | UF | Mantidos |
|------|-------|-------------|-------|----------|------|---------|--------|----|----|
| **ENRIQUECIDO** (19/11) | 783 | **92.18** | **0%** | **0%** | **0%** | **100%** | **0%** | **0%** | **783** |
| **ORIGINAL** (21/10) | 783 | **36.00** | **0%** | **0%** | **0%** | **100%** | **0%** | **0%** | **0** |

---

## 📈 Análise Detalhada

### Registros ENRIQUECIDOS (19/11/2025)

**Características:**
- ✅ **Score médio: 92.18** (Excelente)
- ✅ **100% têm produto** (descrições geradas via LLM)
- ❌ **0% têm email** (campo não enriquecido)
- ❌ **0% têm telefone** (campo não enriquecido)
- ❌ **0% têm site** (campo não enriquecido)
- ❌ **0% têm cidade/UF** (campos não enriquecidos)

**Qualidade:** Alta em campos de produto, baixa em dados de contato.

### Registros ORIGINAIS (21/10/2025)

**Características:**
- ❌ **Score médio: 36.00** (Ruim)
- ✅ **100% têm produto** (dados originais)
- ❌ **0% têm email** (não havia na base original)
- ❌ **0% têm telefone** (não havia na base original)
- ❌ **0% têm site** (não havia na base original)
- ❌ **0% têm cidade/UF** (não havia na base original)

**Qualidade:** Baixa em todos os aspectos.

---

## 🎯 Conclusão da Análise

### Critério de Manutenção: **Score de Qualidade**

Baseado na análise, o melhor critério é **manter o registro com maior qualidadeScore**, pois:

1. **Enriquecidos são superiores** (92.18 vs 36.00 = +156% de qualidade)
2. **Produtos mais completos** nos enriquecidos (descrições via LLM)
3. **Ambos têm mesma falta** de dados de contato (email, telefone, site)
4. **Enriquecidos são mais recentes** (19/11 vs 21/10)

### Estratégia de Limpeza

**Manter:** Registro com **maior qualidadeScore** (desempate por ID mais recente)

**Deletar:** Registros com menor qualidadeScore

**Resultado esperado:**
- 783 registros ENRIQUECIDOS mantidos
- 783 registros ORIGINAIS deletados
- **Total final: 727 clientes únicos** (1.510 - 783 = 727)

---

## 🔧 Query de Limpeza Inteligente

```sql
-- Deletar duplicados mantendo o de MAIOR qualidadeScore
DELETE c1 FROM clientes c1
INNER JOIN (
  SELECT 
    cnpj,
    MAX(qualidadeScore) as max_score,
    MAX(id) as max_id
  FROM clientes
  WHERE cnpj IS NOT NULL AND cnpj != ''
  GROUP BY cnpj
  HAVING COUNT(*) > 1
) c2 ON c1.cnpj = c2.cnpj
WHERE c1.qualidadeScore < c2.max_score
   OR (c1.qualidadeScore = c2.max_score AND c1.id < c2.max_id);
```

**Lógica:**
1. Agrupa por CNPJ
2. Identifica maior qualidadeScore de cada grupo
3. Deleta registros com score menor
4. Em caso de empate, mantém ID maior (mais recente)

---

## ✅ Validação Antes da Limpeza

### Contagem Atual

```sql
SELECT 
  COUNT(*) as total_clientes,
  COUNT(DISTINCT cnpj) as cnpjs_unicos,
  COUNT(*) - COUNT(DISTINCT cnpj) as duplicatas
FROM clientes
WHERE cnpj IS NOT NULL AND cnpj != '';
```

**Resultado esperado:**
- Total: 1.510 clientes
- Únicos: 727 CNPJs
- Duplicatas: 783

### Contagem Após Limpeza (Simulação)

```sql
SELECT COUNT(*) as clientes_apos_limpeza
FROM (
  SELECT cnpj, MAX(qualidadeScore) as max_score, MAX(id) as max_id
  FROM clientes
  WHERE cnpj IS NOT NULL AND cnpj != ''
  GROUP BY cnpj
) simulacao;
```

**Resultado esperado:** 727 clientes únicos

---

## 🚀 Recomendação Final

**APROVAR LIMPEZA** pelos seguintes motivos:

1. ✅ **Registros enriquecidos são superiores** (92.18 vs 36.00)
2. ✅ **Critério inteligente** (qualidadeScore + ID como desempate)
3. ✅ **Sem perda de dados valiosos** (originais têm score baixo)
4. ✅ **Redução de 52% no banco** (1.510 → 727)
5. ✅ **Base limpa para análise** (sem duplicação)

**Próximo passo:** Executar query de limpeza e validar resultado.

---

**Documento gerado por:** Manus AI  
**Última atualização:** 19 de Novembro de 2025 - 14:45 GMT-3
