# 🔍 RELATÓRIO DE INVESTIGAÇÃO - FLUXO DE ENRIQUECIMENTO VEOLIA

**Data**: 2025-11-20  
**Problema Reportado**: Dados de enriquecimento da Veolia não aparecem na tela  
**Status**: ✅ PROBLEMA IDENTIFICADO

---

## 📋 RESUMO EXECUTIVO

O problema **NÃO é** na API OpenAI nem na gravação no banco. Os dados **ESTÃO SENDO GRAVADOS**, mas **sem associação a uma pesquisa (`pesquisaId`)**, causando invisibilidade nas telas que filtram por pesquisa.

---

## 🔬 METODOLOGIA DE INVESTIGAÇÃO

### 1. Teste da API OpenAI
- **Arquivo**: `test-veolia.ts`
- **Resultado**: ✅ API retornou dados completos
  - 1 mercado: "Gestão de Resíduos Sólidos"
  - 3 produtos
  - 5 concorrentes
  - 5 leads
  - Tempo: 23.97s

### 2. Verificação do Banco de Dados
- **Resultado**: ✅ Dados gravados com sucesso
  - 156 mercados
  - 1.173 produtos
  - 1.564 concorrentes
  - 1.564 leads

### 3. Busca do Cliente Veolia
- **Resultado**: ❌ Cliente "Veolia" não encontrado no banco
- **Conclusão**: Cliente nunca foi criado, logo nenhum dado foi associado

---

## 🔴 PROBLEMA RAIZ IDENTIFICADO

### Localização do Bug
**Arquivo**: `server/enrichmentFlow.ts`  
**Função**: `enrichClientes()`  
**Linha**: 476

### Código Problemático

```typescript
const novoCliente = await createCliente({
  projectId,              // ✅ Presente
  nome: dadosEnriquecidos?.nome || cliente.nome,
  cnpj: cliente.cnpj || null,
  siteOficial: dadosEnriquecidos?.site || cliente.site || null,
  email: dadosEnriquecidos?.email || null,
  telefone: dadosEnriquecidos?.telefone || null,
  cidade: dadosEnriquecidos?.cidade || null,
  uf: dadosEnriquecidos?.uf || null,
  produtoPrincipal: cliente.produto || null,
  qualidadeScore,
  qualidadeClassificacao,
  validationStatus: 'pending',
  // ❌ FALTA: pesquisaId
});
```

### Fluxo Atual (INCORRETO)

```
1. Frontend → enrichmentFlow.execute({ clientes, projectName })
2. Backend → Criar/Reusar PROJETO
3. Backend → Identificar mercados
4. Backend → Criar clientes com projectId
5. Backend → Criar produtos/concorrentes/leads
   ❌ PROBLEMA: Nenhum dado tem pesquisaId
```

### Consequência

```sql
-- Dados no banco:
SELECT * FROM clientes WHERE projectId = 1;  -- ✅ 100 clientes
SELECT * FROM clientes WHERE pesquisaId = 1; -- ❌ 0 clientes

-- Tela filtra por pesquisaId:
SELECT * FROM mercados_unicos WHERE pesquisaId = ?; -- ❌ Retorna vazio
```

---

## 📊 DADOS COLETADOS

### Estado Atual do Banco

| Tabela | Total Registros | Com projectId | Com pesquisaId |
|--------|----------------|---------------|----------------|
| clientes | ~100 | 100 | **0** ❌ |
| mercados_unicos | 156 | 156 | **?** |
| produtos | 1.173 | 1.173 | **?** |
| concorrentes | 1.564 | 1.564 | **?** |
| leads | 1.564 | 1.564 | **?** |

### Projetos Cadastrados

```sql
SELECT id, nome, status FROM projects WHERE projectId = 1;
-- Resultado: 2 projetos (ex: "Ground", "Teste")
```

### Pesquisas Cadastradas

```sql
SELECT id, nome, status FROM pesquisas WHERE projectId = 1;
-- Resultado: 2 pesquisas
```

---

## 🎯 CAUSA RAIZ

### Arquitetura Esperada

```
Projeto (projectId)
  └── Pesquisa (pesquisaId)
       ├── Clientes
       ├── Mercados
       ├── Produtos
       ├── Concorrentes
       └── Leads
```

### Arquitetura Atual (BUG)

```
Projeto (projectId)
  ├── Clientes (sem pesquisaId) ❌
  ├── Mercados (sem pesquisaId?) ❌
  ├── Produtos (sem pesquisaId?) ❌
  ├── Concorrentes (sem pesquisaId?) ❌
  └── Leads (sem pesquisaId?) ❌

Pesquisa (pesquisaId)
  └── (vazia) ❌
```

---

## 💡 SOLUÇÕES PROPOSTAS

### Opção 1: Criar Pesquisa Automaticamente (RECOMENDADO)

**Modificação**: `server/enrichmentFlow.ts`

```typescript
// Após criar/reusar projeto:
const { createPesquisa } = await import('./db');
const pesquisa = await createPesquisa({
  projectId: project.id,
  nome: input.projectName || `Pesquisa ${new Date().toLocaleDateString()}`,
  descricao: 'Pesquisa criada automaticamente via fluxo de enriquecimento',
  status: 'em_andamento',
});

// Passar pesquisaId para todas as funções:
const clientesEnriquecidos = await enrichClientes(
  input.clientes,
  project.id,
  pesquisa.id, // ← NOVO
  mercadosMap
);
```

**Vantagens**:
- ✅ Mantém hierarquia correta
- ✅ Compatível com sistema existente
- ✅ Permite múltiplas pesquisas por projeto

**Desvantagens**:
- ⚠️ Requer modificação em várias funções

---

### Opção 2: Buscar por ProjectId no Frontend

**Modificação**: Queries do frontend

```typescript
// Antes:
const mercados = await db.select()
  .from(mercadosUnicos)
  .where(eq(mercadosUnicos.pesquisaId, pesquisaId));

// Depois:
const mercados = await db.select()
  .from(mercadosUnicos)
  .where(
    pesquisaId 
      ? eq(mercadosUnicos.pesquisaId, pesquisaId)
      : eq(mercadosUnicos.projectId, projectId)
  );
```

**Vantagens**:
- ✅ Correção rápida
- ✅ Mostra dados existentes imediatamente

**Desvantagens**:
- ❌ Quebra hierarquia Projeto → Pesquisa
- ❌ Mistura dados de diferentes pesquisas

---

## 🚀 PLANO DE CORREÇÃO

### Fase 1: Correção Imediata (Opção 1)

1. Modificar `enrichmentFlow.ts`:
   - Criar pesquisa automaticamente
   - Passar `pesquisaId` para todas as funções

2. Modificar funções auxiliares:
   - `enrichClientes()` → aceitar `pesquisaId`
   - `findCompetitorsForMarkets()` → aceitar `pesquisaId`
   - `findLeadsForMarkets()` → aceitar `pesquisaId`

3. Atualizar schema se necessário:
   - Verificar se todas as tabelas têm `pesquisaId`

### Fase 2: Migração de Dados Existentes

```sql
-- Criar pesquisa "Migração Automática" para dados órfãos
INSERT INTO pesquisas (projectId, nome, descricao, status)
VALUES (1, 'Dados Migrados', 'Dados sem pesquisa associada', 'concluida');

-- Associar dados órfãos à pesquisa de migração
UPDATE clientes SET pesquisaId = (SELECT id FROM pesquisas WHERE nome = 'Dados Migrados')
WHERE pesquisaId IS NULL AND projectId = 1;

UPDATE mercados_unicos SET pesquisaId = (SELECT id FROM pesquisas WHERE nome = 'Dados Migrados')
WHERE pesquisaId IS NULL AND projectId = 1;

-- Repetir para produtos, concorrentes, leads
```

### Fase 3: Testes

1. Criar novo cliente via fluxo
2. Verificar `pesquisaId` em todas as tabelas
3. Verificar exibição na tela
4. Testar filtros por pesquisa

---

## 📝 LIÇÕES APRENDIDAS

1. **Validação de Dados**: Adicionar validação para garantir que `pesquisaId` sempre exista
2. **Logs Detalhados**: Adicionar logs em cada etapa do fluxo
3. **Testes End-to-End**: Criar testes que validem todo o fluxo
4. **Documentação**: Documentar hierarquia de dados claramente

---

## ✅ PRÓXIMOS PASSOS

1. [ ] Implementar Opção 1 (criar pesquisa automaticamente)
2. [ ] Migrar dados existentes
3. [ ] Adicionar validações
4. [ ] Criar testes automatizados
5. [ ] Atualizar documentação

---

**Investigador**: Manus AI  
**Aprovação**: Aguardando confirmação do usuário
