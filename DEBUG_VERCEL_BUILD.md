# Debug: Erros de Build do Vercel - Migração PostgreSQL

**Data:** 06/12/2024  
**Projeto:** Inteligencia de Mercado  
**Problema:** 662 erros de build no Vercel após migração MySQL → PostgreSQL

---

## 📊 Contexto

### Migração Completa Realizada:
- ✅ 33 tabelas migradas de MySQL para PostgreSQL (Supabase)
- ✅ Schema Drizzle ORM 100% sincronizado (477 campos)
- ✅ 33 DALs (Data Access Layers) reconstruídos
- ✅ 134 índices otimizados
- ✅ 33 routers tRPC criados
- ✅ Todos resquícios MySQL removidos

### Problema Encontrado:
Build local funciona perfeitamente, mas Vercel falha com:
```
export 'dim_produto' (reexported as 'dim_produto') was not found in './schema' (module has no exports)
```

---

## 🔍 Investigação Realizada

### Tentativa 1: Corrigir imports nos DALs (commit 70a7595)
**Ação:** Alterado imports de `'../../../drizzle/schema'` para `'../../../drizzle'`  
**Resultado:** ❌ Erro persistiu  
**Aprendizado:** Imports estavam corretos, problema era mais profundo

### Tentativa 2: Exports explícitos (commit f05640f)
**Ação:** Substituído `export * from './schema'` por 33 exports nomeados explícitos  
**Resultado:** ❌ Erro mudou para "module has no exports"  
**Aprendizado:** Webpack não estava conseguindo processar schema.ts

### Tentativa 3: Adicionar 'use server' (commit 894d786)
**Ação:** Adicionado diretiva `'use server'` em schema.ts e index.ts  
**Resultado:** ❌ Novo erro: "Only async functions allowed in 'use server' file"  
**Aprendizado:** 'use server' é apenas para Server Actions (funções async)

### Tentativa 4: import 'server-only' (commit 69c3454)
**Ação:** Substituído 'use server' por `import 'server-only'`  
**Resultado:** ❌ Erro original persistiu  
**Aprendizado:** Não era problema de client/server bundle

### Tentativa 5: Webpack externals básico (commit bffbf65)
**Ação:** Adicionado externals para bun:sqlite, @libsql, @neon  
**Fonte:** GitHub Issue #3016 do Drizzle ORM  
**Resultado:** ❌ Erro persistiu  
**Aprendizado:** Solução da comunidade não foi suficiente

### Tentativa 6: Webpack externals completo (commit 2615854) - ATUAL
**Ação:** Expandido externals para TODOS os dialetos não usados:
- mysql2, mysql2/promise
- @planetscale/database
- better-sqlite3
- sql.js
- @vercel/postgres
- bun:sqlite
- @libsql/client
- @neondatabase/serverless

**Análise:** TypeScript local mostra 60 erros de mysql-core no Drizzle. Webpack pode estar tentando resolver essas dependências e falhando.

**Resultado:** ⏳ Aguardando build do Vercel...

---

## 🎯 Hipóteses Atuais

### Hipótese Principal:
O Drizzle ORM importa internamente TODOS os dialetos (MySQL, SQLite, etc.), mesmo que não sejam usados. O Webpack no Vercel tenta resolver essas dependências, falha (porque não estão instaladas), e marca o módulo inteiro como vazio.

### Evidências:
1. Local funciona (Node.js ignora imports não usados)
2. Vercel falha (Webpack tenta resolver tudo)
3. TypeScript mostra 60 erros de mysql-core
4. Erro: "module has no exports" (módulo considerado vazio)

---

## 📁 Arquivos Chave

### `/drizzle/schema.ts`
- 33 tabelas exportadas com `export const`
- Usa apenas `drizzle-orm/pg-core`
- Compila localmente sem problemas

### `/drizzle/index.ts`
```typescript
export {
  audit_logs,
  data_audit_logs,
  // ... 33 tabelas explicitamente
} from './schema';
```

### `/next.config.mjs`
```javascript
webpack: (config) => {
  config.externals.push(
    'bun:sqlite',
    '@libsql/client',
    '@neondatabase/serverless',
    'mysql2',
    'mysql2/promise',
    '@planetscale/database',
    'better-sqlite3',
    'sql.js',
    '@vercel/postgres'
  );
  return config;
}
```

---

## 🔄 Próximos Passos

Se commit 2615854 falhar:

1. **Verificar versões do Drizzle:**
   - Pode haver incompatibilidade com Next.js 15
   - Considerar downgrade ou upgrade

2. **Testar build local com Vercel CLI:**
   ```bash
   vercel build
   ```

3. **Investigar tsconfig.json:**
   - Verificar se há configurações que afetam module resolution

4. **Considerar alternativas:**
   - Separar schema em arquivos menores
   - Usar drizzle-kit generate para criar arquivos .js
   - Migrar para estrutura diferente de imports

---

## 📚 Referências

- [Drizzle ORM Issue #3016](https://github.com/drizzle-team/drizzle-orm/issues/3016)
- Next.js 15.1.9
- Drizzle ORM 0.38.4
- PostgreSQL (Supabase)
- Vercel deployment
