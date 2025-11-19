# ⚖️ Análise: Timestamp vs UPSERT

**Data:** 19 de Novembro de 2025 - 16:15 GMT-3  
**Autor:** Manus AI

---

## 🎯 A Pergunta

**"Qual o ganho de timestamp e UPSERT em todas as entidades?"**

Esta é uma questão fundamental de **design de sistema**. Vamos analisar os trade-offs de cada abordagem.

---

## 📊 Comparação: Duas Abordagens

### Abordagem 1: Hash com Timestamp (Atual para Concorrentes/Leads)

**Como funciona:**
```typescript
hash = `${nome}-${mercadoId}-${Date.now()}`
// Exemplo: "empresa-abc-5-1732035600000"
```

**Comportamento:**
- ✅ Sempre cria novo registro
- ✅ Mantém histórico completo
- ❌ Permite duplicação

### Abordagem 2: Hash sem Timestamp + UPSERT (Atual para Clientes)

**Como funciona:**
```typescript
hash = `${nome}-${mercadoId}-${projectId}`
// Exemplo: "empresa-abc-5-1"

// Lógica UPSERT
if (existe) {
  UPDATE // Atualiza registro existente
} else {
  INSERT // Cria novo registro
}
```

**Comportamento:**
- ✅ Garante unicidade
- ✅ Atualiza dados automaticamente
- ❌ Perde histórico de mudanças

---

## 🔍 Análise Detalhada por Cenário

### Cenário 1: Primeira Execução (Dados Novos)

**Timestamp:**
```typescript
// Execução 1 (10:00:00)
Input: { nome: "Empresa ABC", mercadoId: 5 }
Hash: "empresa-abc-5-1732035600000"
Ação: INSERT
Resultado: 1 registro criado
```

**UPSERT:**
```typescript
// Execução 1 (10:00:00)
Input: { nome: "Empresa ABC", mercadoId: 5 }
Hash: "empresa-abc-5-1"
Ação: INSERT (não existe)
Resultado: 1 registro criado
```

**Conclusão:** Ambos funcionam igual na primeira execução.

---

### Cenário 2: Reprocessamento (Mesmos Dados)

**Timestamp:**
```typescript
// Execução 2 (10:00:01) - MESMOS dados
Input: { nome: "Empresa ABC", mercadoId: 5 }
Hash: "empresa-abc-5-1732035601000" (diferente!)
Ação: INSERT
Resultado: 2 registros (duplicata)

// Banco após 10 execuções:
[
  { id: 1, nome: "Empresa ABC", hash: "...-1732035600000" },
  { id: 2, nome: "Empresa ABC", hash: "...-1732035601000" },
  { id: 3, nome: "Empresa ABC", hash: "...-1732035602000" },
  // ... 7 duplicatas adicionais
]
Total: 10 registros para a mesma empresa
```

**UPSERT:**
```typescript
// Execução 2 (10:00:01) - MESMOS dados
Input: { nome: "Empresa ABC", mercadoId: 5 }
Hash: "empresa-abc-5-1" (mesmo!)
Ação: UPDATE (já existe)
Resultado: 1 registro (sem duplicata)

// Banco após 10 execuções:
[
  { id: 1, nome: "Empresa ABC", hash: "empresa-abc-5-1" }
]
Total: 1 registro (sempre o mesmo)
```

**Conclusão:** UPSERT evita duplicação em reprocessamentos.

---

### Cenário 3: Dados Atualizados (Enriquecimento)

**Timestamp:**
```typescript
// Execução 1
Input: { 
  nome: "Empresa ABC", 
  site: null,
  email: null 
}
Hash: "empresa-abc-5-1732035600000"
Ação: INSERT
ID: 1

// Execução 2 (após enriquecer via ReceitaWS)
Input: { 
  nome: "Empresa ABC", 
  site: "https://abc.com.br",
  email: "contato@abc.com.br"
}
Hash: "empresa-abc-5-1732035601000" (diferente!)
Ação: INSERT
ID: 2

// Resultado: 2 registros
[
  { id: 1, nome: "ABC", site: null, email: null }, // Desatualizado
  { id: 2, nome: "ABC", site: "...", email: "..." } // Atualizado
]
```

**UPSERT:**
```typescript
// Execução 1
Input: { 
  nome: "Empresa ABC", 
  site: null,
  email: null 
}
Hash: "empresa-abc-5-1"
Ação: INSERT
ID: 1

// Execução 2 (após enriquecer via ReceitaWS)
Input: { 
  nome: "Empresa ABC", 
  site: "https://abc.com.br",
  email: "contato@abc.com.br"
}
Hash: "empresa-abc-5-1" (mesmo!)
Ação: UPDATE (ID 1)

// Resultado: 1 registro atualizado
[
  { id: 1, nome: "ABC", site: "...", email: "..." } // Sempre atualizado
]
```

**Conclusão:** UPSERT mantém dados sempre atualizados sem duplicação.

---

### Cenário 4: Rastreamento de Mudanças

**Timestamp:**
```typescript
// Histórico completo de mudanças
[
  { id: 1, nome: "ABC", site: null, createdAt: "2025-11-19 10:00:00" },
  { id: 2, nome: "ABC", site: "abc.com", createdAt: "2025-11-19 10:00:01" },
  { id: 3, nome: "ABC", site: "abc.com.br", createdAt: "2025-11-19 10:00:02" }
]

// Posso ver:
// - Site mudou de null → abc.com → abc.com.br
// - Quando cada mudança ocorreu
```

**UPSERT:**
```typescript
// Apenas estado atual
[
  { id: 1, nome: "ABC", site: "abc.com.br", updatedAt: "2025-11-19 10:00:02" }
]

// Posso ver:
// - Estado atual: site = "abc.com.br"
// - Última atualização: 10:00:02
// ❌ Não sei o que mudou nem quando
```

**Conclusão:** Timestamp mantém histórico completo, UPSERT perde histórico.

---

## 💰 Análise de Custos

### Custo de Armazenamento

**Timestamp (800 clientes, 10 execuções):**
```
Clientes: 800 × 10 = 8.000 registros
Concorrentes: 800 × 23 × 10 = 184.000 registros
Leads: 800 × 23 × 10 = 184.000 registros
Total: 376.000 registros

Tamanho médio: 2 KB/registro
Armazenamento: 376.000 × 2 KB = 752 MB
```

**UPSERT (800 clientes, 10 execuções):**
```
Clientes: 800 registros (sempre os mesmos)
Concorrentes: 800 × 23 = 18.400 registros (sempre os mesmos)
Leads: 800 × 23 = 18.400 registros (sempre os mesmos)
Total: 37.600 registros

Tamanho médio: 2 KB/registro
Armazenamento: 37.600 × 2 KB = 75 MB
```

**Economia:** 677 MB (90% de redução)

### Custo de APIs

**Timestamp:**
```
Execução 1: 800 clientes × 23 concorrentes = 18.400 chamadas SerpAPI
Execução 2: 800 clientes × 23 concorrentes = 18.400 chamadas SerpAPI
Execução 3: 800 clientes × 23 concorrentes = 18.400 chamadas SerpAPI
...
Total (10 execuções): 184.000 chamadas

Custo SerpAPI: $0.002/busca
Custo total: 184.000 × $0.002 = $368
```

**UPSERT:**
```
Execução 1: 800 clientes × 23 concorrentes = 18.400 chamadas SerpAPI
Execução 2: 0 chamadas (já existem, apenas UPDATE)
Execução 3: 0 chamadas (já existem, apenas UPDATE)
...
Total (10 execuções): 18.400 chamadas

Custo SerpAPI: $0.002/busca
Custo total: 18.400 × $0.002 = $36.80
```

**Economia:** $331.20 (90% de redução)

---

## 🎯 Casos de Uso

### Quando Usar TIMESTAMP

**1. Auditoria e Compliance**
```
Necessidade: Rastrear TODAS as mudanças
Exemplo: Sistema financeiro, dados médicos
Benefício: Histórico completo, imutável
```

**2. Análise de Tendências**
```
Necessidade: Ver como dados evoluem ao longo do tempo
Exemplo: Preços de concorrentes, posicionamento de mercado
Benefício: Análise temporal
```

**3. Machine Learning**
```
Necessidade: Treinar modelos com dados históricos
Exemplo: Prever mudanças de preço, detectar padrões
Benefício: Dataset rico
```

**4. Debugging e Troubleshooting**
```
Necessidade: Investigar quando/como dados mudaram
Exemplo: "Por que o score caiu de 100 para 50?"
Benefício: Rastreabilidade completa
```

### Quando Usar UPSERT

**1. Dados de Referência**
```
Necessidade: Manter catálogo atualizado
Exemplo: Lista de empresas, produtos, mercados
Benefício: Sempre atualizado, sem duplicatas
```

**2. Enriquecimento Incremental**
```
Necessidade: Adicionar dados progressivamente
Exemplo: Começar com nome, depois adicionar email, telefone, etc
Benefício: Dados se acumulam no mesmo registro
```

**3. Integrações Externas**
```
Necessidade: Sincronizar com sistemas externos
Exemplo: CRM, ERP, plataformas de marketing
Benefício: Evita duplicação entre sistemas
```

**4. Performance e Custo**
```
Necessidade: Otimizar armazenamento e APIs
Exemplo: Aplicações com orçamento limitado
Benefício: 90% de redução de custos
```

---

## 🏆 Recomendação por Entidade

### Mercados

**Recomendação:** UPSERT (sem timestamp)

**Justificativa:**
- Mercados são **entidades de referência**
- Raramente mudam (nome, categoria, segmentação)
- Não precisa de histórico de mudanças
- Reprocessamento deve atualizar, não duplicar

**Hash Ideal:**
```typescript
hash = `${nome}-${projectId}`
// Exemplo: "embalagens-plasticas-1"
```

---

### Clientes

**Recomendação:** UPSERT (sem timestamp) ✅ JÁ IMPLEMENTADO

**Justificativa:**
- Clientes são **entidades principais**
- Enriquecimento incremental (começa básico, vai melhorando)
- Não precisa de histórico (apenas estado atual)
- Reprocessamento deve atualizar dados

**Hash Ideal:**
```typescript
// Com CNPJ
hash = `${nome}-${cnpj}-${projectId}`

// Sem CNPJ (CORRIGIR)
hash = `${nome}-${projectId}` // Remover timestamp
```

---

### Concorrentes

**Recomendação:** DEPENDE DO CASO DE USO

**Opção A: UPSERT (Recomendado para maioria)**
```typescript
hash = `${nome}-${mercadoId}-${projectId}`

Vantagens:
✅ Evita duplicação
✅ Mantém dados atualizados
✅ 90% menos armazenamento
✅ 90% menos custos de API

Desvantagens:
❌ Perde histórico de mudanças
❌ Não rastreia evolução de concorrentes
```

**Opção B: Timestamp (Para análise temporal)**
```typescript
hash = `${nome}-${mercadoId}-${Date.now()}`

Vantagens:
✅ Histórico completo
✅ Análise de tendências
✅ Rastreamento de mudanças

Desvantagens:
❌ Duplicação massiva
❌ 10x mais armazenamento
❌ 10x mais custos de API
```

**Decisão:**
- Se você precisa analisar **como concorrentes evoluem** → Timestamp
- Se você só precisa da **lista atual** → UPSERT

**Para seu caso (Gestor PAV):** UPSERT é mais adequado, pois:
- Você quer **lista atualizada** de concorrentes
- Não precisa rastrear mudanças históricas
- Orçamento limitado (evitar custos desnecessários)

---

### Leads

**Recomendação:** UPSERT (sem timestamp)

**Justificativa:**
- Leads são **oportunidades de vendas**
- Cada lead deve ser **único** no pipeline
- Duplicação polui o CRM
- Stage (novo, em_contato, negociacao) deve ser preservado

**Hash Ideal:**
```typescript
hash = `${nome}-${mercadoId}-${projectId}`
// Exemplo: "lead-xyz-5-1"
```

**Importante:** No UPSERT de leads, **NÃO atualizar o campo `stage`**:
```typescript
if (existing.length > 0) {
  await db.update(leads)
    .set({
      nome: data.nome,
      site: data.site || existing[0].site,
      email: data.email || existing[0].email,
      // ⚠️ NÃO atualizar stage (preservar progresso de vendas)
      // stage: data.stage, // ❌ NUNCA fazer isso
    })
    .where(eq(leads.id, existing[0].id));
}
```

---

## 🎨 Solução Híbrida (Melhor dos Dois Mundos)

### Abordagem: UPSERT + Tabela de Histórico

**Estrutura:**

```typescript
// Tabela principal (estado atual)
clientes = [
  { id: 1, nome: "ABC", site: "abc.com.br", email: "contato@abc.com.br" }
]

// Tabela de histórico (mudanças)
clientes_history = [
  { id: 1, clienteId: 1, field: "site", oldValue: null, newValue: "abc.com", changedAt: "10:00:00" },
  { id: 2, clienteId: 1, field: "site", oldValue: "abc.com", newValue: "abc.com.br", changedAt: "10:00:01" },
  { id: 3, clienteId: 1, field: "email", oldValue: null, newValue: "contato@abc.com.br", changedAt: "10:00:02" }
]
```

**Vantagens:**
- ✅ Estado atual sempre atualizado (tabela principal)
- ✅ Histórico completo de mudanças (tabela de histórico)
- ✅ Sem duplicação na tabela principal
- ✅ Performance otimizada (histórico separado)

**Implementação:**

```typescript
export async function createClienteWithHistory(data: { ... }) {
  const db = await getDb();
  
  const clienteHash = `${data.nome}-${data.cnpj}-${data.projectId}`;
  
  // Verificar se existe
  const existing = await db.select().from(clientes)
    .where(eq(clientes.clienteHash, clienteHash))
    .limit(1);
  
  if (existing.length > 0) {
    // Registrar mudanças no histórico
    const changes = [];
    
    if (data.site && data.site !== existing[0].site) {
      changes.push({
        clienteId: existing[0].id,
        field: 'site',
        oldValue: existing[0].site,
        newValue: data.site
      });
    }
    
    if (data.email && data.email !== existing[0].email) {
      changes.push({
        clienteId: existing[0].id,
        field: 'email',
        oldValue: existing[0].email,
        newValue: data.email
      });
    }
    
    // Salvar histórico
    if (changes.length > 0) {
      await db.insert(clientesHistory).values(changes);
    }
    
    // Atualizar registro principal
    await db.update(clientes)
      .set({ ...data })
      .where(eq(clientes.id, existing[0].id));
    
    return existing[0];
  }
  
  // Criar novo registro
  const [result] = await db.insert(clientes).values({ ...data });
  return await getClienteById(Number(result.insertId));
}
```

**Quando Usar:**
- Você precisa de **histórico** mas também quer **evitar duplicação**
- Análise temporal é importante mas não crítica
- Orçamento permite armazenamento adicional (tabela de histórico)

---

## 📊 Resumo Executivo

### Para Seu Caso (Gestor PAV)

**Recomendação Final:**

| Entidade | Abordagem | Justificativa |
|----------|-----------|---------------|
| **Mercados** | UPSERT | Referência, raramente muda |
| **Clientes** | UPSERT | ✅ Já implementado corretamente |
| **Concorrentes** | UPSERT | Lista atual, sem histórico necessário |
| **Leads** | UPSERT | Pipeline de vendas, evitar duplicação |

**Benefícios:**
- ✅ 90% redução de armazenamento
- ✅ 90% redução de custos de API
- ✅ Reprocessamento seguro
- ✅ Dados sempre atualizados
- ✅ Sem duplicação

**Trade-off Aceito:**
- ❌ Perde histórico de mudanças
- ✅ Mas você pode adicionar tabela de histórico se necessário

---

## 🎯 Implementação Recomendada

### Passo 1: Corrigir Hash (Remover Timestamp)

```typescript
// Mercados
mercadoHash = `${nome}-${projectId}`;

// Clientes (com CNPJ)
clienteHash = `${nome}-${cnpj}-${projectId}`;

// Clientes (sem CNPJ) - CORRIGIR
clienteHash = `${nome}-${projectId}`; // Sem timestamp

// Concorrentes - CORRIGIR
concorrenteHash = `${nome}-${mercadoId}-${projectId}`; // Sem timestamp

// Leads - CORRIGIR
leadHash = `${nome}-${mercadoId}-${projectId}`; // Sem timestamp
```

### Passo 2: Implementar UPSERT

```typescript
// Para cada entidade:
// 1. Verificar se existe (SELECT)
// 2. Se existe, atualizar (UPDATE)
// 3. Se não existe, criar (INSERT)
```

### Passo 3: Adicionar Constraints UNIQUE

```sql
ALTER TABLE mercados_unicos ADD UNIQUE KEY (mercadoHash);
ALTER TABLE clientes ADD UNIQUE KEY (clienteHash); -- ✅ Já feito
ALTER TABLE concorrentes ADD UNIQUE KEY (concorrenteHash);
ALTER TABLE leads ADD UNIQUE KEY (leadHash);
```

### Passo 4: Limpar Duplicatas Existentes

```sql
-- Manter registro com maior qualidadeScore
-- Deletar duplicatas
```

---

## 💡 Conclusão

**Timestamp é útil para:**
- Auditoria e compliance
- Análise temporal
- Machine learning
- Debugging avançado

**UPSERT é melhor para:**
- Dados de referência (seu caso)
- Enriquecimento incremental (seu caso)
- Otimização de custos (seu caso)
- Evitar duplicação (seu caso)

**Para Gestor PAV:** UPSERT em todas as entidades é a escolha certa. Você economiza 90% de custos, evita duplicação e mantém dados sempre atualizados. Se no futuro precisar de histórico, pode adicionar tabela de histórico separada.

---

**Documento gerado por:** Manus AI  
**Última atualização:** 19 de Novembro de 2025 - 16:15 GMT-3  
**Status:** ANÁLISE COMPLETA - Aguardando decisão do usuário
