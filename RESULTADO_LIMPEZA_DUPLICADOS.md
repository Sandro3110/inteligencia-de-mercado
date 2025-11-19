# ⚠️ Resultado da Limpeza de Duplicados

**Data:** 19 de Novembro de 2025 - 14:50 GMT-3  
**Status:** LIMPEZA NÃO EXECUTADA CONFORME ESPERADO  
**Autor:** Manus AI

---

## 🔍 Situação Encontrada

A query de limpeza foi executada, mas **NENHUM registro foi deletado** (rows: 0).

### Dados Atuais no Banco

| Métrica | Valor |
|---------|-------|
| **Total de clientes** | 1.510 |
| **CNPJs únicos** | 727 |
| **Duplicatas restantes** | **783** |
| **Originais (21/10)** | 783 |
| **Enriquecidos (19/11)** | 727 |
| **Score médio geral** | 64.09 |

### Duplicados Ainda Presentes

Ainda existem **5+ CNPJs com duplicação** no banco (amostra verificada).

---

## 🤔 Análise do Problema

### Hipótese 1: Scores Iguais

A query usa critério `qualidadeScore < max_score`, mas se **todos os duplicados têm o mesmo score**, nenhum será deletado.

**Verificação necessária:**
```sql
SELECT 
  cnpj,
  GROUP_CONCAT(DISTINCT qualidadeScore) as scores_distintos,
  COUNT(DISTINCT qualidadeScore) as qtd_scores
FROM clientes
WHERE cnpj IS NOT NULL AND cnpj != ''
GROUP BY cnpj
HAVING COUNT(*) > 1
LIMIT 10;
```

### Hipótese 2: Campo qualidadeScore NULL

Se o campo `qualidadeScore` for NULL em alguns registros, a comparação falhará.

**Verificação necessária:**
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN qualidadeScore IS NULL THEN 1 ELSE 0 END) as nulos,
  SUM(CASE WHEN qualidadeScore = 0 THEN 1 ELSE 0 END) as zeros
FROM clientes;
```

### Hipótese 3: Sintaxe MySQL

A sintaxe `DELETE c1 FROM clientes c1 INNER JOIN ...` pode não estar funcionando corretamente.

**Alternativa mais segura:**
```sql
-- Criar tabela temporária com IDs a deletar
CREATE TEMPORARY TABLE ids_deletar AS
SELECT c1.id
FROM clientes c1
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

-- Verificar quantos serão deletados
SELECT COUNT(*) FROM ids_deletar;

-- Deletar usando IN
DELETE FROM clientes WHERE id IN (SELECT id FROM ids_deletar);
```

---

## 🔧 Próximos Passos

### 1. Investigar Causa Raiz

Executar queries de verificação para entender por que nenhum registro foi deletado:

1. Verificar se scores são todos iguais
2. Verificar se há NULLs no campo qualidadeScore
3. Testar sintaxe alternativa

### 2. Ajustar Estratégia

Dependendo da causa, ajustar query de limpeza:

**Se scores são iguais:**
- Usar apenas critério de ID (manter mais recente)
- Usar data de criação como critério principal

**Se há NULLs:**
- Tratar NULLs como score 0
- Usar COALESCE(qualidadeScore, 0)

**Se sintaxe falhou:**
- Usar abordagem de tabela temporária
- Usar DELETE com subquery IN

### 3. Re-executar Limpeza

Após ajuste, re-executar limpeza com query corrigida.

---

## 📊 Impacto Atual

**Situação:** Base de dados ainda com 783 duplicados (52% de duplicação)

**Impacto:**
- ❌ Análise de dados comprometida
- ❌ Estatísticas infladas
- ❌ Performance de queries reduzida
- ❌ Risco de inconsistências

**Urgência:** Alta - necessário resolver antes de continuar análise

---

## 💡 Recomendação Imediata

1. **Executar queries de investigação** para identificar causa
2. **Ajustar query de limpeza** conforme necessário
3. **Re-executar limpeza** com query corrigida
4. **Validar resultado** (deve chegar a 727 clientes únicos)

**Aguardando decisão do usuário para prosseguir com investigação.**

---

**Documento gerado por:** Manus AI  
**Última atualização:** 19 de Novembro de 2025 - 14:50 GMT-3  
**Status:** LIMPEZA PENDENTE - Investigação necessária
