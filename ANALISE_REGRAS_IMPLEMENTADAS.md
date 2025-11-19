# Análise: Constraints Unique, Timestamps e Upsert

**Data:** 19/11/2025  
**Versão:** enrichmentV2.ts

---

## 📋 Resumo Executivo

| Regra | Status Atual | Implementação | Observações |
|-------|--------------|---------------|-------------|
| **1. Constraints UNIQUE** | ⚠️ **Parcial** | Lógica no código | Falta constraint no banco |
| **2. Timestamps Automáticos** | ✅ **Implementado** | Schema Drizzle | createdAt, updatedAt |
| **3. Upsert** | ⚠️ **Parcial** | Apenas mercados | Falta produtos, concorrentes, leads |

---

## 1️⃣ Constraints UNIQUE

### ✅ O que está funcionando

**Mercados Únicos:**
```typescript
// Hash único: nome + projectId
const hash = normalizeHash(`${mercadoData.nome}-${projectId}`);

// Verifica se já existe ANTES de inserir
const [existing] = await db.select().from(mercadosUnicos)
  .where(eq(mercadosUnicos.mercadoHash, hash))
  .limit(1);

if (existing) {
  mercadoId = existing.id; // Reutiliza existente
} else {
  // Insere novo
}
```

**Concorrentes Únicos:**
```typescript
// Hash único: nome + cnpj
const hash = normalizeHash(`${concorrenteData.nome}-${concorrenteData.cnpj || ""}`);

// Verifica se já existe
const [existing] = await db.select().from(concorrentes)
  .where(eq(concorrentes.concorrenteHash, hash))
  .limit(1);

if (!existing) {
  // Insere apenas se não existir
}
```

**Leads Únicos:**
```typescript
// Hash único: nome + cnpj
const hash = normalizeHash(`${leadData.nome}-${leadData.cnpj || ""}`);

// Verifica se já existe
const [existing] = await db.select().from(leads)
  .where(eq(leads.leadHash, hash))
  .limit(1);

if (!existing) {
  // Insere apenas se não existir
}
```

### ⚠️ O que está faltando

**Constraints UNIQUE no banco de dados:**

Atualmente, a unicidade é garantida apenas pela **lógica no código** (verificação manual antes de inserir). Isso funciona, mas tem riscos:

1. **Race conditions:** Se 2 processos tentarem inserir o mesmo registro simultaneamente, pode duplicar
2. **Integridade:** Não há garantia a nível de banco de dados
3. **Performance:** Consulta extra antes de cada insert

**Solução recomendada:**

```sql
-- Adicionar constraints UNIQUE no banco
ALTER TABLE mercados_unicos ADD UNIQUE INDEX idx_mercado_hash (mercadoHash);
ALTER TABLE concorrentes ADD UNIQUE INDEX idx_concorrente_hash (concorrenteHash);
ALTER TABLE leads ADD UNIQUE INDEX idx_lead_hash (leadHash);
ALTER TABLE produtos ADD UNIQUE INDEX idx_produto_unique (clienteId, mercadoId, nome);
ALTER TABLE clientes_mercados ADD UNIQUE INDEX idx_cliente_mercado (clienteId, mercadoId);
```

Com constraints no banco, podemos usar `INSERT IGNORE` ou `ON DUPLICATE KEY UPDATE` para evitar consultas extras.

---

## 2️⃣ Timestamps Automáticos

### ✅ Implementação Completa

Todos os schemas têm timestamps automáticos:

**Clientes:**
```typescript
createdAt: timestamp("createdAt").defaultNow(),
updatedAt: timestamp("updatedAt").defaultNow(),
```

**Mercados:**
```typescript
createdAt: timestamp("createdAt").defaultNow(),
```

**Produtos:**
```typescript
createdAt: timestamp("createdAt").defaultNow(),
updatedAt: timestamp("updatedAt").defaultNow(),
```

**Concorrentes:**
```typescript
createdAt: timestamp("createdAt").defaultNow(),
```

**Leads:**
```typescript
createdAt: timestamp("createdAt").defaultNow(),
```

### ⚠️ Problema: `updatedAt` não atualiza automaticamente

O `updatedAt` tem `.defaultNow()` mas **NÃO atualiza automaticamente** em updates.

**Solução 1: Trigger no banco (recomendado)**
```sql
CREATE TRIGGER update_clientes_timestamp 
BEFORE UPDATE ON clientes
FOR EACH ROW 
SET NEW.updatedAt = NOW();

CREATE TRIGGER update_produtos_timestamp 
BEFORE UPDATE ON produtos
FOR EACH ROW 
SET NEW.updatedAt = NOW();
```

**Solução 2: Atualizar manualmente no código**
```typescript
await db.update(clientes).set({
  ...updateData,
  updatedAt: new Date()
}).where(eq(clientes.id, clienteId));
```

---

## 3️⃣ Upsert (Insert or Update)

### ✅ O que está funcionando

**Mercados (UPSERT completo):**
```typescript
if (existing) {
  mercadoId = existing.id; // Reutiliza (não atualiza)
} else {
  // Insere novo
}
```

**Clientes_Mercados (UPSERT completo):**
```typescript
const [assoc] = await db.select().from(clientesMercados)
  .where(and(
    eq(clientesMercados.clienteId, clienteId),
    eq(clientesMercados.mercadoId, mercadoId)
  ))
  .limit(1);

if (!assoc) {
  await db.insert(clientesMercados).values({ clienteId, mercadoId });
}
```

### ⚠️ O que está faltando

**Produtos (SEM UPSERT):**
```typescript
// ❌ Sempre insere, mesmo se já existir
await db.insert(produtos).values({
  projectId,
  clienteId,
  mercadoId: produtoData.mercadoId,
  nome: produtoData.nome,
  // ...
});
```

**Problema:** Se executar enriquecimento 2x no mesmo cliente, vai duplicar produtos.

**Solução:**
```typescript
// ✅ Verificar se produto já existe
const [existingProduto] = await db.select().from(produtos)
  .where(and(
    eq(produtos.clienteId, clienteId),
    eq(produtos.mercadoId, produtoData.mercadoId),
    eq(produtos.nome, produtoData.nome)
  ))
  .limit(1);

if (existingProduto) {
  // UPDATE: atualizar preço, descrição, etc
  await db.update(produtos).set({
    descricao: produtoData.descricao,
    categoria: produtoData.categoria,
    preco: produtoData.preco,
    updatedAt: new Date()
  }).where(eq(produtos.id, existingProduto.id));
} else {
  // INSERT: criar novo
  await db.insert(produtos).values({ /* ... */ });
}
```

**Concorrentes (INSERT ONLY):**
```typescript
if (!existing) {
  await db.insert(concorrentes).values({ /* ... */ });
}
// ❌ Se já existe, não faz nada (não atualiza)
```

**Problema:** Se dados do concorrente mudarem (novo site, telefone, etc), não atualiza.

**Solução:**
```typescript
if (existing) {
  // UPDATE: atualizar dados
  await db.update(concorrentes).set({
    site: concorrenteData.site,
    produto: concorrenteData.produto,
    cidade: concorrenteData.cidade,
    // ... outros campos
  }).where(eq(concorrentes.id, existing.id));
} else {
  // INSERT: criar novo
}
```

**Leads (INSERT ONLY):**
Mesmo problema dos concorrentes.

---

## 📊 Tabela Comparativa

| Entidade | Unique Hash | Verifica Duplicata | Insert | Update | Upsert Completo |
|----------|-------------|-------------------|--------|--------|-----------------|
| **Clientes** | ❌ | ❌ | ✅ | ✅ | ⚠️ Parcial |
| **Mercados** | ✅ | ✅ | ✅ | ❌ | ⚠️ Parcial |
| **Produtos** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Concorrentes** | ✅ | ✅ | ✅ | ❌ | ⚠️ Parcial |
| **Leads** | ✅ | ✅ | ✅ | ❌ | ⚠️ Parcial |
| **Clientes_Mercados** | ❌ | ✅ | ✅ | ❌ | ⚠️ Parcial |

---

## 🎯 Recomendações

### Prioridade ALTA

1. **Adicionar constraint UNIQUE no banco**
   ```sql
   ALTER TABLE mercados_unicos ADD UNIQUE INDEX idx_mercado_hash (mercadoHash);
   ALTER TABLE concorrentes ADD UNIQUE INDEX idx_concorrente_hash (concorrenteHash);
   ALTER TABLE leads ADD UNIQUE INDEX idx_lead_hash (leadHash);
   ALTER TABLE produtos ADD UNIQUE INDEX idx_produto_unique (clienteId, mercadoId, nome);
   ```

2. **Implementar UPSERT em produtos**
   - Verificar se produto já existe (clienteId + mercadoId + nome)
   - Se existe: UPDATE
   - Se não existe: INSERT

3. **Adicionar triggers de updatedAt**
   ```sql
   CREATE TRIGGER update_clientes_timestamp BEFORE UPDATE ON clientes FOR EACH ROW SET NEW.updatedAt = NOW();
   CREATE TRIGGER update_produtos_timestamp BEFORE UPDATE ON produtos FOR EACH ROW SET NEW.updatedAt = NOW();
   ```

### Prioridade MÉDIA

4. **Implementar UPDATE em concorrentes/leads**
   - Atualizar dados quando já existir
   - Manter histórico de mudanças (opcional)

5. **Usar INSERT ... ON DUPLICATE KEY UPDATE**
   - Mais eficiente que SELECT + INSERT/UPDATE
   - Requer constraints UNIQUE no banco

### Prioridade BAIXA

6. **Adicionar índices de performance**
   ```sql
   CREATE INDEX idx_cliente_project ON clientes(projectId);
   CREATE INDEX idx_produto_cliente ON produtos(clienteId);
   CREATE INDEX idx_concorrente_mercado ON concorrentes(mercadoId);
   ```

---

## 🧪 Testes Necessários

### Teste 1: Duplicação de Produtos
```typescript
// Executar enriquecimento 2x no mesmo cliente
await enrichClienteCompleto(1, 1);
await enrichClienteCompleto(1, 1);

// Verificar se produtos duplicaram
SELECT nome, COUNT(*) as qtd 
FROM produtos 
WHERE clienteId = 1 
GROUP BY nome 
HAVING qtd > 1;
```

### Teste 2: Atualização de Concorrentes
```typescript
// 1. Enriquecer cliente A (gera concorrente X)
await enrichClienteCompleto(1, 1);

// 2. Enriquecer cliente B (gera mesmo concorrente X com dados atualizados)
await enrichClienteCompleto(2, 1);

// Verificar se concorrente X foi atualizado ou apenas reutilizado
SELECT * FROM concorrentes WHERE nome = 'Concorrente X';
```

### Teste 3: Race Condition
```typescript
// Executar 2 enriquecimentos simultâneos
await Promise.all([
  enrichClienteCompleto(1, 1),
  enrichClienteCompleto(2, 1)
]);

// Verificar se mercados duplicaram
SELECT mercadoHash, COUNT(*) as qtd 
FROM mercados_unicos 
GROUP BY mercadoHash 
HAVING qtd > 1;
```

---

## ✅ Conclusão

### Status Atual

- ✅ **Timestamps:** Implementados (com ressalva no updatedAt)
- ⚠️ **Unique:** Implementado na lógica, falta no banco
- ⚠️ **Upsert:** Parcialmente implementado (apenas mercados)

### Riscos

1. **Duplicação de produtos** ao re-enriquecer clientes
2. **Dados desatualizados** em concorrentes/leads
3. **Race conditions** sem constraints no banco
4. **updatedAt não atualiza** automaticamente

### Próximos Passos

1. Adicionar constraints UNIQUE no banco (5 min)
2. Implementar UPSERT em produtos (15 min)
3. Adicionar triggers de updatedAt (5 min)
4. Testar duplicação e race conditions (10 min)

**Tempo total estimado:** ~35 minutos

---

**Análise gerada em:** 19/11/2025  
**Sistema:** Gestor PAV - Enriquecimento V2
