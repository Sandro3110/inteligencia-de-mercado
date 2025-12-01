# 🔍 INVESTIGAÇÃO CRÍTICA: PROBLEMA DE SETORES

## 📊 EVIDÊNCIAS OBSERVADAS

### **Screenshot do Usuário:**

1. URL: `intelmarket.app/sectors` (rota antiga)
2. Página mostra: "Análise de Setores" (versão antiga)
3. Abas visíveis: "Clientes", "Leads", "Concorrentes" (design antigo)
4. Mensagem: "Nenhum setor encontrado"
5. Filtros: Projeto "TechFilms", Pesquisa "Base Inicial"

### **Problema Relatado:**

1. ❌ Setores não carregou nada
2. ❌ Abas antigas (Leads, Concorrentes) ainda aparecem

---

## 🧩 ANÁLISE CRÍTICA - CAMADA POR CAMADA

### **HIPÓTESE 1: Usuário está na página ANTIGA (não na nova)**

**Probabilidade:** ALTA (95%)

**Evidências:**

- URL é `/sectors` (rota global antiga)
- Design mostra abas antigas (Clientes/Leads/Concorrentes)
- Não é a nova rota `/projects/[id]/surveys/[surveyId]/sectors`

**Causa Raiz:**

- Usuário clicou no link do Sidebar que aponta para `/sectors` (rota antiga)
- Banner de migração não foi visto ou foi fechado
- Nova página não foi acessada

**Solução:**

- Atualizar Sidebar para apontar para nova rota
- Ou criar redirecionamento automático

---

### **HIPÓTESE 2: Query do router antigo está falhando**

**Probabilidade:** MÉDIA (60%)

**Evidências:**

- Mensagem "Nenhum setor encontrado"
- Filtros estão selecionados (TechFilms, Base Inicial)
- Página antiga usa `sectorAnalysis.getSectorRanking`

**Possíveis Causas:**

1. Router `sectorAnalysis` não existe ou está quebrado
2. Query retorna array vazio
3. Filtros incompatíveis com dados reais

**Investigação Necessária:**

- Verificar se router `sectorAnalysis` existe
- Verificar se há dados de setores no banco
- Verificar logs de erro

---

### **HIPÓTESE 3: Dados de setores não existem no banco**

**Probabilidade:** BAIXA (30%)

**Evidências:**

- Campo `setor` existe nas tabelas (clientes, leads, concorrentes)
- Implementação nova usa esses campos

**Possíveis Causas:**

1. Dados não foram populados
2. Campo `setor` está NULL em todos os registros
3. Pesquisa "Base Inicial" não tem dados de setores

**Investigação Necessária:**

- Query direta no banco: `SELECT DISTINCT setor FROM clientes WHERE setor IS NOT NULL`
- Verificar se pesquisa "Base Inicial" tem dados

---

### **HIPÓTESE 4: Router antigo usa stored procedure que não existe**

**Probabilidade:** MÉDIA (50%)

**Evidências:**

- Código de produtos usa stored procedure `get_product_ranking`
- Setores provavelmente usa `get_sector_ranking`
- SP pode não existir ou estar quebrada

**Investigação Necessária:**

- Verificar se SP `get_sector_ranking` existe
- Verificar código do router antigo

---

### **HIPÓTESE 5: Problema de permissões/contexto**

**Probabilidade:** BAIXA (20%)

**Possíveis Causas:**

1. Usuário não tem acesso ao projeto TechFilms
2. Pesquisa "Base Inicial" não pertence ao projeto
3. Filtros incompatíveis

---

## 🎯 PLANO DE INVESTIGAÇÃO SISTEMÁTICA

### **FASE 1: Identificar qual página está sendo usada**

1. Verificar URL exata
2. Verificar código da página antiga
3. Confirmar que é a página antiga (não a nova)

### **FASE 2: Verificar dados no banco**

1. Query: `SELECT COUNT(*) FROM clientes WHERE setor IS NOT NULL`
2. Query: `SELECT DISTINCT setor FROM clientes LIMIT 10`
3. Query: `SELECT COUNT(*) FROM leads WHERE setor IS NOT NULL`
4. Query: `SELECT COUNT(*) FROM concorrentes WHERE setor IS NOT NULL`

### **FASE 3: Verificar router antigo**

1. Localizar arquivo do router `sectorAnalysis`
2. Verificar procedure `getSectorRanking`
3. Verificar se usa stored procedure
4. Testar query manualmente

### **FASE 4: Verificar stored procedures**

1. Listar SPs: `SELECT * FROM pg_proc WHERE proname LIKE '%sector%'`
2. Verificar se `get_sector_ranking` existe
3. Testar SP manualmente

### **FASE 5: Verificar logs de erro**

1. Analisar arquivo de logs fornecido
2. Procurar por erros relacionados a setores
3. Identificar stack trace

---

## 🔧 SOLUÇÕES PROPOSTAS (POR PRIORIDADE)

### **SOLUÇÃO 1: Redirecionar rota antiga para nova (RECOMENDADO)**

**Prioridade:** ALTA

**Implementação:**

```typescript
// app/(app)/sectors/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function SectorsRedirect() {
  const router = useRouter();
  const { selectedProject } = useSelectedProject();

  useEffect(() => {
    if (selectedProject) {
      // Redirecionar para nova rota
      router.replace(`/projects/${selectedProject.id}/surveys/latest/sectors`);
    } else {
      // Fallback: mostrar mensagem
      router.replace('/projects');
    }
  }, [selectedProject, router]);

  return <div>Redirecionando...</div>;
}
```

**Vantagens:**

- ✅ Força uso da nova página
- ✅ Não quebra links existentes
- ✅ Simples de implementar

---

### **SOLUÇÃO 2: Corrigir router antigo**

**Prioridade:** MÉDIA

**Se router antigo está quebrado:**

1. Verificar se `sectorAnalysis` router existe
2. Corrigir query para usar campos corretos
3. Remover dependência de stored procedure

**Desvantagens:**

- ❌ Mantém código legado
- ❌ Duplica esforço

---

### **SOLUÇÃO 3: Popular dados de setores**

**Prioridade:** BAIXA (apenas se dados não existem)

**Se campo `setor` está vazio:**

1. Script de migração para popular setores
2. Usar CNAE ou outros campos para inferir setor
3. Atualizar registros existentes

---

### **SOLUÇÃO 4: Atualizar Sidebar**

**Prioridade:** ALTA

**Mudar links do Sidebar:**

```typescript
// components/Sidebar.tsx
const menuItems: MenuItem[] = [
  // ...
  {
    name: 'Setores',
    href: '/projects/[id]/surveys/[surveyId]/sectors', // Nova rota
    icon: BarChart3,
  },
  {
    name: 'Produtos',
    href: '/projects/[id]/surveys/[surveyId]/products', // Nova rota
    icon: Package,
  },
  // ...
];
```

**Problema:** Precisa de contexto (projectId, surveyId)

**Solução:** Links dinâmicos baseados em contexto

---

## 🚨 AÇÕES IMEDIATAS

1. **INVESTIGAR:** Verificar dados no banco
2. **INVESTIGAR:** Verificar router antigo
3. **CORRIGIR:** Implementar redirecionamento
4. **CORRIGIR:** Atualizar Sidebar com links dinâmicos
5. **TESTAR:** Validar nova rota funciona

---

## 📝 PRÓXIMOS PASSOS

Vou executar a investigação na ordem:

1. Verificar dados no banco (queries SQL)
2. Verificar código do router antigo
3. Analisar logs de erro
4. Implementar correções
5. Testar solução

Aguarde...
