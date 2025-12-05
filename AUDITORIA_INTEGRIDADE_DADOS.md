# 🔍 AUDITORIA DE INTEGRIDADE DE DADOS

**Data:** 2025-12-05  
**Objetivo:** Validar preenchimento de TODOS os campos nos processos de Importação, Enriquecimento e Gravação

---

## 📊 RESUMO EXECUTIVO

**dim_entidade (Tabela Principal):**
- ✅ **Preenchidos:** 25/48 campos (52.1%)
- ❌ **Vazios:** 23/48 campos (47.9%)
- 🚨 **Crítico:** 48% dos campos não estão sendo utilizados!

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. ENRIQUECIMENTO NÃO ESTÁ PREENCHENDO CAMPOS (7 campos)

**Campos que DEVERIAM ser preenchidos pela IA:**

| Campo | Tipo | Status | Impacto |
|-------|------|--------|---------|
| `cidade` | varchar | ❌ NULL | Análise geográfica quebrada |
| `uf` | varchar | ❌ NULL | Análise geográfica quebrada |
| `porte` | varchar | ❌ NULL | Segmentação por porte impossível |
| `setor` | varchar | ❌ NULL | Análise setorial impossível |
| `produto_principal` | varchar | ❌ NULL | Análise de produtos quebrada |
| `segmentacao_b2b_b2c` | varchar | ❌ NULL | Segmentação de mercado impossível |
| `score_qualidade` | decimal | ❌ NULL | Qualificação de leads quebrada |

**Metadados de enriquecimento:**
| Campo | Status | Problema |
|-------|--------|----------|
| `enriquecido_em` | ❌ NULL | Não sabemos QUANDO foi enriquecido |
| `enriquecido_por` | ❌ NULL | Não sabemos QUEM enriqueceu |

**Causa provável:** O código de enriquecimento não está atualizando esses campos após chamar a IA.

---

### 2. HASHES DE SEGURANÇA NÃO CRIADOS (4 campos)

**Campos de privacidade/LGPD:**

| Campo | Status | Impacto |
|-------|--------|---------|
| `cnpj_hash` | ❌ NULL | Deduplicação de CNPJ quebrada |
| `cpf_hash` | ❌ NULL | Deduplicação de CPF quebrada |
| `email_hash` | ❌ NULL | Deduplicação de email quebrada |
| `telefone_hash` | ❌ NULL | Deduplicação de telefone quebrada |

**Causa provável:** Função de hash não está sendo chamada na importação.

**Consequência:** Duplicatas não são detectadas corretamente!

---

### 3. AUDITORIA INCOMPLETA (4 campos)

**Campos de rastreabilidade:**

| Campo | Status | Problema |
|-------|--------|----------|
| `created_by` | ❌ NULL | Não sabemos QUEM criou |
| `updated_by` | ❌ NULL | Não sabemos QUEM atualizou |
| `origem_usuario_id` | ❌ NULL | Não sabemos QUEM importou |
| `deleted_by` | ✅ NULL | OK (não foi deletado) |

**Causa provável:** `ctx.userId` não está sendo passado corretamente.

**Consequência:** Impossível rastrear ações de usuários!

---

### 4. QUALIDADE DE DADOS (2 campos)

| Campo | Status | Observação |
|-------|--------|------------|
| `score_qualidade` | ❌ NULL | Diferente de `score_qualidade_dados` (20) |
| `campos_faltantes` | ❌ NULL | Deveria listar campos vazios |

**Causa provável:** Lógica de cálculo de qualidade incompleta.

---

### 5. METADADOS DE IA (3 campos)

| Campo | Status | Uso |
|-------|--------|-----|
| `origem_processo` | ❌ NULL | Qual processo de IA foi usado |
| `origem_prompt` | ❌ NULL | Prompt usado para enriquecimento |
| `origem_confianca` | ❌ NULL | Confiança da IA (0-100) |

**Causa provável:** Não está sendo gravado após enriquecimento.

---

## 📋 ANÁLISE POR PROCESSO

### PROCESSO 1: IMPORTAÇÃO

**Campos preenchidos corretamente:**
- ✅ `id`, `entidade_hash`, `tipo_entidade`
- ✅ `nome`, `nome_fantasia`, `cnpj`, `email`, `telefone`, `site`
- ✅ `num_filiais`, `num_lojas`, `num_funcionarios`
- ✅ `importacao_id`, `origem_tipo`, `origem_arquivo`, `origem_data`
- ✅ `created_at`, `updated_at`

**Campos que DEVERIAM ser preenchidos:**
- ❌ `cnpj_hash`, `cpf_hash`, `email_hash`, `telefone_hash` (hashes)
- ❌ `created_by`, `origem_usuario_id` (auditoria)

**Taxa de sucesso:** 15/19 campos (78.9%)

---

### PROCESSO 2: ENRIQUECIMENTO

**Campos preenchidos corretamente:**
- ❌ NENHUM!

**Campos que DEVERIAM ser preenchidos:**
- ❌ `cidade`, `uf`, `porte`, `setor`
- ❌ `produto_principal`, `segmentacao_b2b_b2c`
- ❌ `score_qualidade`
- ❌ `enriquecido_em`, `enriquecido_por`
- ❌ `origem_processo`, `origem_prompt`, `origem_confianca`

**Taxa de sucesso:** 0/11 campos (0%)

🚨 **CRÍTICO:** Enriquecimento não está gravando NADA!

---

### PROCESSO 3: VALIDAÇÃO/QUALIDADE

**Campos preenchidos corretamente:**
- ✅ `score_qualidade_dados` (20)
- ✅ `validacao_cnpj` (false)
- ✅ `validacao_email` (false)
- ✅ `validacao_telefone` (false)
- ✅ `ultima_validacao`
- ✅ `status_qualificacao_id` (1)

**Campos que DEVERIAM ser preenchidos:**
- ❌ `score_qualidade` (diferente de score_qualidade_dados)
- ❌ `campos_faltantes` (lista de campos vazios)

**Taxa de sucesso:** 6/8 campos (75%)

---

## 🔧 RECOMENDAÇÕES URGENTES

### 1. CORRIGIR ENRIQUECIMENTO (PRIORIDADE MÁXIMA)

**Arquivo:** `server/dal/enriquecimento.ts` (ou similar)

**Ação:** Adicionar UPDATE após chamada da IA:

```typescript
await db.update(dimEntidade)
  .set({
    cidade: resultadoIA.cidade,
    uf: resultadoIA.uf,
    porte: resultadoIA.porte,
    setor: resultadoIA.setor,
    produto_principal: resultadoIA.produto_principal,
    segmentacao_b2b_b2c: resultadoIA.segmentacao,
    score_qualidade: resultadoIA.score,
    enriquecido_em: new Date(),
    enriquecido_por: ctx.userId,
    origem_processo: 'enriquecimento_ia',
    origem_prompt: promptUsado,
    origem_confianca: resultadoIA.confianca,
    updated_at: new Date(),
    updated_by: ctx.userId
  })
  .where(eq(dimEntidade.id, entidadeId));
```

---

### 2. ADICIONAR HASHES NA IMPORTAÇÃO

**Arquivo:** `server/dal/importacao.ts`

**Ação:** Criar hashes antes de INSERT:

```typescript
import crypto from 'crypto';

function createHash(value: string | null): string | null {
  if (!value) return null;
  return crypto.createHash('sha256').update(value.toLowerCase()).digest('hex');
}

// No INSERT:
await db.insert(dimEntidade).values({
  ...dados,
  cnpj_hash: createHash(dados.cnpj),
  email_hash: createHash(dados.email),
  telefone_hash: createHash(dados.telefone),
  created_by: ctx.userId,
  origem_usuario_id: ctx.userId
});
```

---

### 3. CALCULAR CAMPOS DE QUALIDADE

**Arquivo:** `server/dal/qualidade.ts` (criar se não existir)

**Ação:** Calcular após importação/enriquecimento:

```typescript
function calcularCamposFaltantes(entidade: any): string[] {
  const camposObrigatorios = ['cidade', 'uf', 'porte', 'setor', 'produto_principal'];
  return camposObrigatorios.filter(c => !entidade[c]);
}

function calcularScoreQualidade(entidade: any): number {
  const totalCampos = 11; // Campos de enriquecimento
  const preenchidos = [
    entidade.cidade, entidade.uf, entidade.porte, entidade.setor,
    entidade.produto_principal, entidade.segmentacao_b2b_b2c,
    entidade.cnpj, entidade.email, entidade.telefone, entidade.site
  ].filter(Boolean).length;
  
  return (preenchidos / totalCampos) * 100;
}

// Atualizar após enriquecimento:
await db.update(dimEntidade).set({
  campos_faltantes: JSON.stringify(calcularCamposFaltantes(entidade)),
  score_qualidade: calcularScoreQualidade(entidade)
});
```

---

## 📈 PRÓXIMOS PASSOS

1. ✅ **Corrigir enriquecimento** (2h)
2. ✅ **Adicionar hashes** (1h)
3. ✅ **Implementar cálculo de qualidade** (1h)
4. ✅ **Testar com dados reais** (1h)
5. ✅ **Re-enriquecer entidades existentes** (2h)

**Tempo total estimado:** 7 horas

---

## 🎯 METAS DE SUCESSO

**Após correções:**
- ✅ dim_entidade: 90%+ campos preenchidos
- ✅ Enriquecimento: 100% dos campos de IA preenchidos
- ✅ Hashes: 100% criados
- ✅ Auditoria: 100% rastreável

---

**Gerado em:** 2025-12-05 06:30 UTC  
**Próxima auditoria:** Após implementação das correções
