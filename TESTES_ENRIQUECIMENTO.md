# Testes de Enriquecimento - Sistema Pronto

## 🎯 Objetivo

Validar o sistema de enriquecimento modular em 3 testes progressivos:
1. **Teste 1**: 1 cliente (validar todas as 5 etapas)
2. **Teste 2**: 10 clientes (validar unicidade e performance)
3. **Teste 3**: 50 clientes (validar checkpoint e retomada)

---

## 📋 TESTE 1: Enriquecer 1 Cliente Completo

### Objetivo
Validar que todas as 5 etapas funcionam corretamente para um único cliente.

### Comando tRPC
```typescript
// Via tRPC client
const result = await trpc.enrichmentV2.enrichOne.mutate({
  clienteId: 1,  // Substituir pelo ID real
  projectId: 1   // Substituir pelo projectId real
});
```

### Resultado Esperado
```json
{
  "success": true,
  "mercados": 2,          // 1-5 mercados identificados
  "produtos": 6,          // 2-5 produtos por mercado
  "concorrentes": 5,      // Exatamente 5 concorrentes
  "leads": 5              // Exatamente 5 leads
}
```

### Validações
- ✅ Cliente enriquecido com todos os campos preenchidos
- ✅ Mercados criados sem duplicação (verificar hash único)
- ✅ Produtos criados com chave única (clienteId + mercadoId + nome)
- ✅ Concorrentes NÃO estão na tabela clientes
- ✅ Leads NÃO estão em clientes ou concorrentes
- ✅ Quality scores calculados corretamente

### SQL de Validação
```sql
-- Verificar cliente enriquecido
SELECT * FROM clientes WHERE id = 1;

-- Verificar mercados
SELECT m.* FROM mercados_unicos m
INNER JOIN clientes_mercados cm ON cm.mercadoId = m.id
WHERE cm.clienteId = 1;

-- Verificar produtos
SELECT * FROM produtos WHERE clienteId = 1;

-- Verificar concorrentes
SELECT * FROM concorrentes WHERE projectId = 1 LIMIT 5;

-- Verificar leads
SELECT * FROM leads WHERE projectId = 1 LIMIT 5;

-- Validar que concorrentes NÃO são clientes
SELECT c.nome FROM concorrentes c
INNER JOIN clientes cl ON LOWER(TRIM(c.nome)) = LOWER(TRIM(cl.nome))
WHERE c.projectId = 1;
-- Deve retornar 0 linhas

-- Validar que leads NÃO são clientes ou concorrentes
SELECT l.nome FROM leads l
WHERE l.projectId = 1
AND (
  EXISTS (SELECT 1 FROM clientes WHERE LOWER(TRIM(nome)) = LOWER(TRIM(l.nome)))
  OR EXISTS (SELECT 1 FROM concorrentes WHERE LOWER(TRIM(nome)) = LOWER(TRIM(l.nome)))
);
-- Deve retornar 0 linhas
```

### Tempo Estimado
- **Duração**: ~50 segundos (12s + 10s + 6s + 8s + 8s + overhead)
- **Custo**: ~$0,001 USD (~8.000 tokens)

---

## 📋 TESTE 2: Enriquecer 10 Clientes

### Objetivo
Validar unicidade, deduplicação e performance com múltiplos clientes.

### Comando tRPC
```typescript
// Via tRPC client
const result = await trpc.enrichmentV2.enrichMultiple.mutate({
  clienteIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  // IDs reais
  projectId: 1
});
```

### Resultado Esperado
```json
[
  {
    "clienteId": 1,
    "success": true,
    "mercados": 2,
    "produtos": 6,
    "concorrentes": 5,
    "leads": 5
  },
  {
    "clienteId": 2,
    "success": true,
    "mercados": 3,
    "produtos": 9,
    "concorrentes": 5,
    "leads": 5
  },
  // ... mais 8 clientes
]
```

### Validações
- ✅ Todos os 10 clientes processados com sucesso
- ✅ Mercados deduplicados (mesmos mercados reutilizados)
- ✅ Concorrentes deduplicados (empresas grandes aparecem múltiplas vezes)
- ✅ Leads deduplicados (empresas grandes aparecem múltiplas vezes)
- ✅ Nenhum concorrente é cliente
- ✅ Nenhum lead é cliente ou concorrente

### SQL de Validação
```sql
-- Contar mercados únicos (deve ser < 10 * 2.5 = 25)
SELECT COUNT(DISTINCT id) FROM mercados_unicos WHERE projectId = 1;

-- Contar produtos (deve ser ~60, 6 por cliente)
SELECT COUNT(*) FROM produtos WHERE projectId = 1;

-- Contar concorrentes únicos (deve ser < 50, devido a deduplicação)
SELECT COUNT(DISTINCT concorrenteHash) FROM concorrentes WHERE projectId = 1;

-- Contar leads únicos (deve ser < 50, devido a deduplicação)
SELECT COUNT(DISTINCT leadHash) FROM leads WHERE projectId = 1;

-- Ver mercados mais populares (deduplicação)
SELECT m.nome, COUNT(cm.clienteId) as qtd_clientes
FROM mercados_unicos m
INNER JOIN clientes_mercados cm ON cm.mercadoId = m.id
WHERE m.projectId = 1
GROUP BY m.id
ORDER BY qtd_clientes DESC
LIMIT 10;

-- Ver concorrentes mais citados (deduplicação)
SELECT nome, COUNT(*) as qtd_mencoes
FROM concorrentes
WHERE projectId = 1
GROUP BY concorrenteHash
ORDER BY qtd_mencoes DESC
LIMIT 10;
```

### Tempo Estimado
- **Duração**: ~8 minutos (10 clientes × 50s)
- **Custo**: ~$0,01 USD (~80.000 tokens)

---

## 📋 TESTE 3: Enriquecer 50 Clientes (com Checkpoint)

### Objetivo
Validar processamento em lote, checkpoint e capacidade de retomada.

### Comando tRPC
```typescript
// Via tRPC client
const result = await trpc.enrichmentV2.enrichMultiple.mutate({
  clienteIds: [1, 2, 3, ..., 50],  // 50 IDs reais
  projectId: 1
});
```

### Resultado Esperado
```json
[
  { "clienteId": 1, "success": true, "mercados": 2, "produtos": 6, "concorrentes": 5, "leads": 5 },
  { "clienteId": 2, "success": true, "mercados": 3, "produtos": 9, "concorrentes": 5, "leads": 5 },
  // ... 48 clientes
]
```

### Validações
- ✅ Todos os 50 clientes processados
- ✅ Taxa de deduplicação de mercados ~30%
- ✅ Taxa de deduplicação de concorrentes ~60%
- ✅ Taxa de deduplicação de leads ~40%
- ✅ Quality scores médios > 60
- ✅ Nenhuma violação de unicidade

### SQL de Validação
```sql
-- Estatísticas gerais
SELECT 
  COUNT(DISTINCT id) as total_clientes,
  AVG(qualidadeScore) as avg_quality_score
FROM clientes WHERE projectId = 1;

SELECT COUNT(DISTINCT id) as total_mercados FROM mercados_unicos WHERE projectId = 1;
SELECT COUNT(*) as total_produtos FROM produtos WHERE projectId = 1;
SELECT COUNT(DISTINCT concorrenteHash) as total_concorrentes FROM concorrentes WHERE projectId = 1;
SELECT COUNT(DISTINCT leadHash) as total_leads FROM leads WHERE projectId = 1;

-- Taxa de deduplicação de mercados
SELECT 
  COUNT(*) as total_identificacoes,
  COUNT(DISTINCT mercadoId) as mercados_unicos,
  ROUND((1 - COUNT(DISTINCT mercadoId) / COUNT(*)) * 100, 2) as taxa_deduplicacao_pct
FROM clientes_mercados
WHERE clienteId IN (SELECT id FROM clientes WHERE projectId = 1);

-- Taxa de deduplicação de concorrentes
SELECT 
  COUNT(*) as total_identificacoes,
  COUNT(DISTINCT concorrenteHash) as concorrentes_unicos,
  ROUND((1 - COUNT(DISTINCT concorrenteHash) / COUNT(*)) * 100, 2) as taxa_deduplicacao_pct
FROM concorrentes
WHERE projectId = 1;

-- Taxa de deduplicação de leads
SELECT 
  COUNT(*) as total_identificacoes,
  COUNT(DISTINCT leadHash) as leads_unicos,
  ROUND((1 - COUNT(DISTINCT leadHash) / COUNT(*)) * 100, 2) as taxa_deduplicacao_pct
FROM leads
WHERE projectId = 1;

-- Distribuição de quality scores
SELECT 
  qualidadeClassificacao,
  COUNT(*) as qtd,
  ROUND(AVG(qualidadeScore), 2) as avg_score
FROM clientes
WHERE projectId = 1
GROUP BY qualidadeClassificacao;
```

### Tempo Estimado
- **Duração**: ~42 minutos (50 clientes × 50s)
- **Custo**: ~$0,05 USD (~400.000 tokens)

---

## 🚀 Como Executar os Testes

### Opção 1: Via tRPC Client (Frontend)
```typescript
import { trpc } from "@/lib/trpc";

// Teste 1
const teste1 = await trpc.enrichmentV2.enrichOne.mutate({
  clienteId: 1,
  projectId: 1
});
console.log("Teste 1:", teste1);

// Teste 2
const teste2 = await trpc.enrichmentV2.enrichMultiple.mutate({
  clienteIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  projectId: 1
});
console.log("Teste 2:", teste2);

// Teste 3
const teste3 = await trpc.enrichmentV2.enrichMultiple.mutate({
  clienteIds: Array.from({ length: 50 }, (_, i) => i + 1),
  projectId: 1
});
console.log("Teste 3:", teste3);
```

### Opção 2: Via Script Node.js
```bash
cd /home/ubuntu/gestor-pav
node scripts/test-enrichment.mjs
```

### Opção 3: Via Vitest
```bash
cd /home/ubuntu/gestor-pav
pnpm test enrichment
```

---

## 📊 Métricas de Sucesso

### Teste 1 (1 cliente)
- ✅ Tempo < 60s
- ✅ Success = true
- ✅ Mercados: 1-5
- ✅ Produtos: 2-10
- ✅ Concorrentes: 5
- ✅ Leads: 5
- ✅ Quality score > 50

### Teste 2 (10 clientes)
- ✅ Tempo < 10 minutos
- ✅ Todos success = true
- ✅ Mercados únicos: 10-20 (deduplicação ~30%)
- ✅ Produtos: 60-100
- ✅ Concorrentes únicos: 20-30 (deduplicação ~60%)
- ✅ Leads únicos: 30-40 (deduplicação ~40%)
- ✅ Nenhuma violação de unicidade

### Teste 3 (50 clientes)
- ✅ Tempo < 45 minutos
- ✅ Todos success = true
- ✅ Mercados únicos: 50-100
- ✅ Produtos: 300-500
- ✅ Concorrentes únicos: 100-150
- ✅ Leads únicos: 150-200
- ✅ Quality score médio > 60
- ✅ Taxa de erro < 5%

---

## 🐛 Troubleshooting

### Erro: "Cliente não encontrado"
```sql
-- Verificar se cliente existe
SELECT * FROM clientes WHERE id = 1;
```

### Erro: "Concorrente é cliente"
```sql
-- Verificar violações
SELECT c.nome, cl.nome as cliente_nome
FROM concorrentes c
INNER JOIN clientes cl ON LOWER(TRIM(c.nome)) = LOWER(TRIM(cl.nome))
WHERE c.projectId = 1;
```

### Erro: "Lead é cliente ou concorrente"
```sql
-- Verificar violações
SELECT l.nome, 
  CASE 
    WHEN EXISTS (SELECT 1 FROM clientes WHERE LOWER(TRIM(nome)) = LOWER(TRIM(l.nome))) THEN 'É cliente'
    WHEN EXISTS (SELECT 1 FROM concorrentes WHERE LOWER(TRIM(nome)) = LOWER(TRIM(l.nome))) THEN 'É concorrente'
  END as tipo_violacao
FROM leads l
WHERE l.projectId = 1
AND (
  EXISTS (SELECT 1 FROM clientes WHERE LOWER(TRIM(nome)) = LOWER(TRIM(l.nome)))
  OR EXISTS (SELECT 1 FROM concorrentes WHERE LOWER(TRIM(nome)) = LOWER(TRIM(l.nome)))
);
```

### Erro: "Timeout na LLM"
- Aumentar timeout nas configurações do Gemini
- Reduzir tamanho do batch (processar menos clientes por vez)
- Verificar rate limits da API

---

## ✅ Checklist Final

Antes de executar os testes:
- [ ] Schema do banco atualizado com todos os campos
- [ ] Arquivo `enrichmentV2.ts` criado
- [ ] Router `enrichmentV2` adicionado em `routers.ts`
- [ ] Gemini API key configurada
- [ ] Pelo menos 50 clientes na tabela `clientes`
- [ ] ProjectId correto identificado

Após executar os testes:
- [ ] Teste 1 passou (1 cliente)
- [ ] Teste 2 passou (10 clientes)
- [ ] Teste 3 passou (50 clientes)
- [ ] Todas as validações SQL passaram
- [ ] Nenhuma violação de unicidade
- [ ] Quality scores dentro do esperado

---

**Sistema pronto para testes! 🚀**
