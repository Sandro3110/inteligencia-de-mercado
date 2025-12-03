# ✅ TODO - BLOCO 1: UI/UX Fixes

**Status:** Aguardando confirmação para implementar  
**Data:** 03/12/2025 07:17  
**Problemas:** 12

---

## 📋 PROBLEMAS IDENTIFICADOS

### 1. Tela de Login (`LoginPage.tsx`)

#### P1.1 - Centralização
- [ ] Remover padding desnecessário
- [ ] Garantir `flex items-center justify-center` funcionando

#### P1.2 - Fundo cor sólida
- [ ] Remover `bg-gradient-to-br from-blue-50 to-indigo-100`
- [ ] Adicionar cor sólida (ex: `bg-slate-50` ou `bg-gray-50`)

#### P1.3 - Espaço em branco oculto
- [ ] Mudar `min-h-screen` para `h-screen`

---

### 2. Sidebar (`Layout.tsx`)

#### P1.4 - Menu ultrapassando limite
- [ ] **Linha 221-226:** Mudar estrutura para flexbox
- [ ] **Linha 251:** Adicionar altura calculada no nav

#### P1.5 - Toggle Dark/Light sobrepondo
- [ ] **Linha 330:** Remover `position: absolute`
- [ ] Usar `flex-shrink-0` no footer

---

### 3. Dashboard (`HomePage.tsx`)

#### P1.6 - Remover card "Cidades"
- [ ] **Linha 81-86:** Remover StatCard "Cidades no Banco"

#### P1.7 - Adicionar 3 novos cards de resumo
- [ ] Adicionar hook: `const { data: stats } = trpc.dashboard.stats.useQuery();`
- [ ] **Card 1:** Total de Clientes + Leads + Concorrentes
- [ ] **Card 2:** Total de Produtos
- [ ] **Card 3:** Total de Mercados

#### P1.8 - Reduzir tamanho dos cards de Ações Rápidas
- [ ] Reduzir padding `p-6` → `p-4`
- [ ] Reduzir ícone `h-14 w-14` → `h-12 w-12`
- [ ] Reduzir ícone interno `h-7 w-7` → `h-6 w-6`
- [ ] Reduzir gap `gap-4` → `gap-3`

---

### 4. Base de Dados (`EntidadesPage.tsx`)

#### P1.9 - Duplo click abre modal
- [ ] **Linha 184:** Mudar `onClick` para `onDoubleClick`
- [ ] Criar modal com todas as informações da entidade
- [ ] Adicionar botão "Voltar"
- [ ] Adicionar botão "Copiar" (copiar dados para clipboard)

#### P1.10 - Filtros não funcionam
- [ ] **Backend:** Implementar filtro por `tipo` no `api/trpc.js`

#### P1.11 - Busca não funciona
- [ ] **Backend:** Implementar busca por `nome`, `cnpj`, `email` no `api/trpc.js`

#### P1.12 - Remover botão "Nova Entidade"
- [ ] **Linha 62-67:** Remover prop `actions` do PageHeader

---

### 5. Backend - API (`api/trpc.js`)

#### Implementar filtros no endpoint entidades.list (linha 676-682)

**Código atual:**
```javascript
if (procedure === 'list') {
  const result = await client`
    SELECT * FROM dim_entidade 
    LIMIT 100
  `;
  data = result;
}
```

**Código corrigido:**
```javascript
if (procedure === 'list') {
  const { busca, tipo, limit = 100, offset = 0 } = input || {};
  
  let whereConditions = [];
  let params = [];
  
  // Filtro de busca
  if (busca) {
    whereConditions.push(`(
      nome ILIKE '%' || $${params.length + 1} || '%' OR 
      cnpj ILIKE '%' || $${params.length + 1} || '%' OR 
      email ILIKE '%' || $${params.length + 1} || '%'
    )`);
    params.push(busca);
  }
  
  // Filtro de tipo
  if (tipo) {
    whereConditions.push(`tipo_entidade = $${params.length + 1}`);
    params.push(tipo);
  }
  
  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';
  
  const query = `
    SELECT * FROM dim_entidade 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT $${params.length + 1} 
    OFFSET $${params.length + 2}
  `;
  
  params.push(limit, offset);
  
  const result = await client.unsafe(query, params);
  data = result;
}
```

#### Adicionar contagens ao endpoint dashboard.stats (linha ~730)

```javascript
// Contar clientes
const [{ count: totalClientes }] = await client`
  SELECT COUNT(*)::int as count FROM dim_cliente
`;

// Contar leads
const [{ count: totalLeads }] = await client`
  SELECT COUNT(*)::int as count FROM dim_lead
`;

// Contar concorrentes
const [{ count: totalConcorrentes }] = await client`
  SELECT COUNT(*)::int as count FROM dim_concorrente
`;

// Contar produtos
const [{ count: totalProdutos }] = await client`
  SELECT COUNT(*)::int as count FROM dim_produto
`;

// Contar mercados
const [{ count: totalMercados }] = await client`
  SELECT COUNT(*)::int as count FROM dim_mercado
`;

return {
  totalProjetos,
  totalPesquisas,
  totalEntidades,
  totalClientes,
  totalLeads,
  totalConcorrentes,
  totalProdutos,
  totalMercados
};
```

---

## 📦 ARQUIVOS A MODIFICAR

1. **`api/trpc.js`**
   - Implementar filtros de busca e tipo no endpoint entidades.list
   - Adicionar contagens ao endpoint dashboard.stats

2. **`client/src/pages/EntidadesPage.tsx`**
   - Mudar onClick para onDoubleClick
   - Criar modal de detalhes
   - Remover botão "Nova Entidade"

3. **`client/src/pages/HomePage.tsx`**
   - Remover card "Cidades"
   - Adicionar 3 novos cards (Clientes+Leads+Concorrentes, Produtos, Mercados)
   - Reduzir tamanho dos cards de Ações Rápidas

4. **`client/src/pages/LoginPage.tsx`**
   - Corrigir centralização
   - Mudar fundo para cor sólida

5. **`client/src/components/Layout.tsx`**
   - Corrigir sidebar overflow com flexbox

---

## 🚀 PRÓXIMOS PASSOS

1. ⏳ Aguardar confirmação do usuário
2. ⏳ Implementar correções
3. ⏳ Testar localmente
4. ⏳ Commit + Push + Deploy
5. ⏳ Verificar em produção

---

**Última atualização:** 03/12/2025 07:17
