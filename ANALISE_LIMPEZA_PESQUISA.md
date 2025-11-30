# Análise: Cancelar e Limpar Pesquisa

## 🎯 Objetivo

Permitir que o usuário **cancele o enriquecimento** e **limpe todos os dados enriquecidos** de uma pesquisa específica, possibilitando recomeçar do zero quando houver erros.

---

## 📊 Dados a Serem Limpos

### **1. Leads** (tabela `leads`)

- Todos os leads gerados para clientes da pesquisa
- **Filtro:** `clienteId IN (SELECT id FROM clientes WHERE pesquisaId = X)`
- **Ação:** `DELETE FROM leads WHERE clienteId IN (...)`

### **2. Concorrentes** (tabela `concorrentes`)

- Todos os concorrentes identificados para clientes da pesquisa
- **Filtro:** `clienteId IN (SELECT id FROM clientes WHERE pesquisaId = X)`
- **Ação:** `DELETE FROM concorrentes WHERE clienteId IN (...)`

### **3. Produtos** (tabela `produtos`)

- Todos os produtos gerados para clientes da pesquisa
- **Filtro:** `clienteId IN (SELECT id FROM clientes WHERE pesquisaId = X)`
- **Ação:** `DELETE FROM produtos WHERE clienteId IN (...)`

### **4. Mercados** (tabela `mercados_unicos`)

- Mercados associados à pesquisa
- **Filtro:** `id IN (SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (...))`
- **Ação:** `DELETE FROM mercados_unicos WHERE id IN (...)`

### **5. Clientes-Mercados** (tabela `clientes_mercados`)

- Relacionamentos entre clientes e mercados
- **Filtro:** `clienteId IN (SELECT id FROM clientes WHERE pesquisaId = X)`
- **Ação:** `DELETE FROM clientes_mercados WHERE clienteId IN (...)`

### **6. Clientes** (atualizar, não deletar)

- **NÃO deletar** os clientes (são dados originais)
- **Resetar campos enriquecidos:**
  - `site = NULL`
  - `cidade = NULL`
  - `uf = NULL`
  - `latitude = NULL`
  - `longitude = NULL`
  - `setor = NULL`
  - `descricao = NULL`
  - `qualidadeScore = NULL`
  - `qualidadeClassificacao = NULL`
  - `enriquecido = FALSE`
  - `enriquecidoEm = NULL`

### **7. Pesquisa** (resetar contadores)

- **Resetar campos:**
  - `clientesEnriquecidos = 0`
  - `status = 'rascunho'`
  - `updatedAt = NOW()`

### **8. Enrichment Jobs** (cancelar/limpar)

- Cancelar jobs em andamento
- **Ação:** `UPDATE enrichment_jobs SET status = 'cancelled' WHERE pesquisaId = X AND status IN ('running', 'paused')`

### **9. Enrichment Runs** (limpar histórico)

- Remover runs da pesquisa
- **Ação:** `DELETE FROM enrichment_runs WHERE pesquisaId = X`

---

## 🔄 Ordem de Execução (Respeitar Foreign Keys)

```sql
BEGIN TRANSACTION;

-- 1. Cancelar jobs em andamento
UPDATE enrichment_jobs
SET status = 'cancelled', updatedAt = NOW()
WHERE pesquisaId = ? AND status IN ('running', 'paused');

-- 2. Limpar enrichment runs
DELETE FROM enrichment_runs WHERE pesquisaId = ?;

-- 3. Buscar IDs dos clientes da pesquisa
WITH clientes_pesquisa AS (
  SELECT id FROM clientes WHERE pesquisaId = ?
)

-- 4. Deletar leads
DELETE FROM leads WHERE clienteId IN (SELECT id FROM clientes_pesquisa);

-- 5. Deletar concorrentes
DELETE FROM concorrentes WHERE clienteId IN (SELECT id FROM clientes_pesquisa);

-- 6. Deletar produtos
DELETE FROM produtos WHERE clienteId IN (SELECT id FROM clientes_pesquisa);

-- 7. Buscar mercados órfãos (sem outros clientes)
WITH mercados_pesquisa AS (
  SELECT DISTINCT mercadoId
  FROM clientes_mercados
  WHERE clienteId IN (SELECT id FROM clientes_pesquisa)
),
mercados_orfaos AS (
  SELECT m.mercadoId
  FROM mercados_pesquisa m
  WHERE NOT EXISTS (
    SELECT 1 FROM clientes_mercados cm
    WHERE cm.mercadoId = m.mercadoId
    AND cm.clienteId NOT IN (SELECT id FROM clientes_pesquisa)
  )
)

-- 8. Deletar relacionamentos clientes-mercados
DELETE FROM clientes_mercados WHERE clienteId IN (SELECT id FROM clientes_pesquisa);

-- 9. Deletar mercados órfãos
DELETE FROM mercados_unicos WHERE id IN (SELECT mercadoId FROM mercados_orfaos);

-- 10. Resetar campos enriquecidos dos clientes
UPDATE clientes
SET
  site = NULL,
  cidade = NULL,
  uf = NULL,
  latitude = NULL,
  longitude = NULL,
  setor = NULL,
  descricao = NULL,
  qualidadeScore = NULL,
  qualidadeClassificacao = NULL,
  enriquecido = FALSE,
  enriquecidoEm = NULL,
  updatedAt = NOW()
WHERE pesquisaId = ?;

-- 11. Resetar contadores da pesquisa
UPDATE pesquisas
SET
  clientesEnriquecidos = 0,
  status = 'rascunho',
  updatedAt = NOW()
WHERE id = ?;

COMMIT;
```

---

## 🎨 UX/UI

### **Botão "Cancelar e Limpar"**

**Localização:** PesquisaCard, ao lado de "Cancelar"

**Quando mostrar:**

- Sempre visível (mesmo quando não está enriquecendo)
- Desabilitado se `clientesEnriquecidos = 0`

**Cor:** Vermelho escuro (red-700) para indicar ação destrutiva

**Layout proposto:**

```
Quando enriquecendo:
[⏸️ Pausar] [✕ Cancelar] [🗑️ Limpar Tudo] [📍 Geocodificar]

Quando NÃO enriquecendo (mas tem dados):
[⚡ Enriquecer] [🗑️ Limpar Tudo] [📍 Geocodificar]
```

### **Modal de Confirmação**

**Título:** ⚠️ Limpar Todos os Dados Enriquecidos?

**Mensagem:**

```
Esta ação irá:
✓ Cancelar o enriquecimento em andamento
✓ Remover TODOS os dados enriquecidos:
  • 79 leads
  • 520 concorrentes
  • 45 produtos
  • 15 mercados
✓ Resetar 10 clientes enriquecidos

⚠️ ATENÇÃO: Esta ação NÃO pode ser desfeita!

Os dados originais dos clientes (nome, CNPJ) serão preservados.

Tem certeza que deseja continuar?
```

**Botões:**

- [Cancelar] (cinza, secundário)
- [Sim, Limpar Tudo] (vermelho, primário, requer digitação de "LIMPAR")

**Segurança extra:** Exigir digitação de "LIMPAR" para confirmar

---

## 🔒 Segurança

### **Validações:**

1. ✅ Verificar se pesquisa existe
2. ✅ Verificar se usuário tem permissão (owner do projeto)
3. ✅ Verificar se pesquisa não está em uso por outro processo
4. ✅ Transação SQL (rollback em caso de erro)
5. ✅ Log de auditoria (quem limpou, quando, quantos registros)

### **Auditoria:**

```typescript
await db.insert(auditLogs).values({
  userId: user.id,
  action: 'CLEAN_SURVEY',
  entityType: 'pesquisa',
  entityId: pesquisaId,
  details: JSON.stringify({
    leadsRemoved: 79,
    concorrentesRemoved: 520,
    produtosRemoved: 45,
    mercadosRemoved: 15,
    clientesReset: 10,
  }),
  createdAt: new Date(),
});
```

---

## 📊 Estatísticas Retornadas

```typescript
interface CleanSurveyResult {
  success: boolean;
  message: string;
  stats: {
    leadsRemoved: number;
    concorrentesRemoved: number;
    produtosRemoved: number;
    mercadosRemoved: number;
    clientesReset: number;
    jobsCancelled: number;
  };
}
```

---

## 🚀 Implementação

### **1. API/Mutation (tRPC)**

- `pesquisas.cleanEnrichment.useMutation()`
- Input: `{ pesquisaId: number }`
- Output: `CleanSurveyResult`

### **2. Frontend**

- Botão "Limpar Tudo" no PesquisaCard
- Modal de confirmação com estatísticas
- Toast de feedback
- Auto-refresh após limpeza

### **3. Testes**

- Testar com pesquisa vazia (0 enriquecidos)
- Testar com pesquisa parcial (50% enriquecidos)
- Testar com pesquisa completa (100% enriquecidos)
- Testar rollback em caso de erro

---

## ✅ Checklist de Implementação

- [ ] Criar mutation `pesquisas.cleanEnrichment`
- [ ] Implementar lógica de limpeza com transação
- [ ] Adicionar validações de segurança
- [ ] Criar modal de confirmação
- [ ] Adicionar botão no PesquisaCard
- [ ] Implementar feedback (toast + estatísticas)
- [ ] Adicionar log de auditoria
- [ ] Testar cenários (vazio, parcial, completo)
- [ ] Documentar processo

---

## 🎯 Resultado Esperado

**Antes:**

- ❌ Sem opção de recomeçar
- ❌ Dados incorretos ficam no banco
- ❌ Impossível corrigir erros

**Depois:**

- ✅ Botão "Limpar Tudo" sempre disponível
- ✅ Remove todos os dados enriquecidos
- ✅ Permite recomeçar do zero
- ✅ Seguro (confirmação + auditoria)
- ✅ Transparente (mostra estatísticas)
