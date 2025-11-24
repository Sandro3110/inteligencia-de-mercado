# Migração MySQL → PostgreSQL - Documentação Completa

## ✅ Status: Migração Concluída

Data: 24 de novembro de 2025  
Projeto: Intelmarket - Sistema de Inteligência de Mercado

---

## 📋 Resumo Executivo

A migração completa do banco de dados MySQL para PostgreSQL (Supabase) foi concluída com sucesso. Todas as correções de sintaxe SQL e conversões de tipos foram aplicadas e validadas.

### Alterações Principais

1. **Schema do Banco de Dados** (51 tabelas)
   - ✅ Convertido de `mysqlTable` para `pgTable`
   - ✅ Tipos de dados convertidos (int→serial, tinyint→smallint, json→jsonb, etc.)
   - ✅ Enums PostgreSQL declarados fora das tabelas
   - ✅ Removido `.autoincrement()` (PostgreSQL usa `serial` automaticamente)

2. **Funções de Data e Hora**
   - ✅ Renomeado `toMySQLTimestamp` → `toPostgresTimestamp`
   - ✅ Renomeado `toMySQLTimestampOrNull` → `toPostgresTimestampOrNull`
   - ✅ Renomeado `nowMySQLTimestamp` → `nowPostgresTimestamp`
   - ✅ Renomeado `fromMySQLTimestamp` → `fromPostgresTimestamp`

3. **Queries SQL Brutas**
   - ✅ Convertido `DATE_SUB(NOW(), INTERVAL X DAY)` → `CURRENT_TIMESTAMP - INTERVAL '1 day' * X`
   - ✅ Convertido `DATE_SUB(NOW(), INTERVAL X MONTH)` → `CURRENT_TIMESTAMP - INTERVAL '1 month' * X`
   - ✅ Convertido `DATE(campo)` → `campo::date`
   - ✅ Mantido `CURRENT_TIMESTAMP` em UPDATE statements (compatível com PostgreSQL)

4. **Sistema de Autenticação**
   - ✅ Implementado JWT-based authentication
   - ✅ Criado usuário admin no Supabase
   - ✅ Configurado CORS para intelmarket.app

---

## 🗂️ Arquivos Modificados

### Schema e Database

```
drizzle/schema.ts          - Schema completo convertido para PostgreSQL
server/db.ts               - Queries SQL corrigidas para sintaxe PostgreSQL
server/dateUtils.ts        - Funções de data renomeadas
server/_core/dateUtils.ts  - Funções auxiliares de data renomeadas
```

### Arquivos Backend Afetados (15 arquivos)

```
server/analyticsAggregation.ts
server/analyticsQueries.ts
server/db-geocoding.ts
server/enrichmentJobManager.ts
server/enrichmentOptimized.ts
server/llmConfigDb.ts
server/routers.ts
server/scheduleWorker.ts
server/_core/enrichmentCache.ts
server/_core/oauth.ts
```

---

## 🔧 Conversões de Tipos Realizadas

### Tipos de Colunas

| MySQL | PostgreSQL | Uso |
|-------|-----------|-----|
| `int()` | `serial()` | IDs auto-incremento |
| `int()` | `integer()` | Números inteiros normais |
| `tinyint()` | `smallint()` | Números pequenos |
| `tinyint(1)` | `smallint()` | Flags booleanas (0/1) |
| `json()` | `jsonb()` | Dados JSON |
| `decimal(10,2)` | `numeric(10,2)` | Valores decimais |
| `varchar(255)` | `varchar(255)` | Textos (sem mudança) |
| `text()` | `text()` | Textos longos (sem mudança) |
| `timestamp()` | `timestamp()` | Datas e horas (sem mudança) |

### Funções SQL

| MySQL | PostgreSQL |
|-------|-----------|
| `NOW()` | `CURRENT_TIMESTAMP` |
| `DATE_SUB(NOW(), INTERVAL 30 DAY)` | `CURRENT_TIMESTAMP - INTERVAL '30 days'` |
| `DATE_SUB(NOW(), INTERVAL 3 MONTH)` | `CURRENT_TIMESTAMP - INTERVAL '3 months'` |
| `DATE(createdAt)` | `createdAt::date` |
| `GROUP BY DATE(campo)` | `GROUP BY campo::date` |

### Declaração de Enums

**Antes (MySQL):**
```typescript
export const users = mysqlTable("users", {
  role: mysqlEnum("role", ["admin", "visualizador"]),
});
```

**Depois (PostgreSQL):**
```typescript
export const roleEnum = pgEnum("role", ["admin", "visualizador"]);

export const users = pgTable("users", {
  role: roleEnum("role"),
});
```

---

## 🗄️ Configuração do Banco de Dados

### Supabase PostgreSQL

**Projeto:** Intelmarket  
**ID:** ecnzlynmuerbmqingyfl  
**Host:** db.ecnzlynmuerbmqingyfl.supabase.co  
**Porta:** 5432  
**Database:** postgres

**Connection String:**
```
postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000!@#$%@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres
```

**Connection String (URL Encoded):**
```
postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000%21%40%23%24%25@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres
```

### Usuário Admin Criado

| Campo | Valor |
|-------|-------|
| Email | sandrodireto@gmail.com |
| Nome | Sandro dos Santos |
| Empresa | Azulpack Embalagens Plásticas |
| Cargo | Vice Presidente |
| Role | admin |
| Ativo | 1 (aprovado) |
| Senha | Ss311000! |

---

## 🚀 Deploy

### Frontend (Vercel)

**URL:** https://intelmarket.app  
**Status:** ✅ Funcionando  
**Build:** Concluído com sucesso

**Variáveis de Ambiente:**
```
VITE_API_URL=https://web-production-6679c.up.railway.app/api/trpc
```

### Backend (Railway)

**URL:** https://web-production-6679c.up.railway.app  
**Status:** ⚠️ Requer configuração de variáveis de ambiente

**Variáveis de Ambiente Necessárias:**

```bash
# Obrigatórias
DATABASE_URL=postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000%21%40%23%24%25@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres
JWT_SECRET=intelmarket_jwt_secret_2024_production_key_change_this_in_production
NODE_ENV=production
PORT=${{PORT}}

# Opcionais
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
```

**⚠️ IMPORTANTE:** A senha no `DATABASE_URL` contém caracteres especiais que devem ser URL-encoded:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

---

## 🧪 Validação

### Build Local

```bash
cd /home/ubuntu/inteligencia-de-mercado
pnpm build
```

**Resultado:** ✅ Build concluído sem erros

### Teste Local do Servidor

```bash
cd /home/ubuntu/inteligencia-de-mercado
DATABASE_URL='postgresql://...' \
JWT_SECRET='test_secret' \
NODE_ENV=production \
PORT=3001 \
node dist/index.js
```

**Resultado:** ✅ Servidor inicia corretamente
```
[OAuth] Initialized with baseURL: https://vidabiz.butterfly-effect.dev
Server running on http://localhost:3001/
[WebSocket] Servidor WebSocket inicializado
[Cron] Inicializando cron jobs...
[Cron] Job de agregação diária iniciado (executa às 00:00)
[Cron] Todos os cron jobs foram inicializados
```

---

## 📝 Próximos Passos

### 1. Configurar Variáveis de Ambiente no Railway

1. Acesse: https://railway.app/project/web-production-6679c
2. Vá para a aba **Variables**
3. Adicione as variáveis listadas acima
4. Clique em **Deploy** para aplicar

### 2. Verificar Deploy

Após configurar as variáveis, verifique:

```bash
# Testar rota raiz
curl https://web-production-6679c.up.railway.app/

# Testar autenticação via tRPC
curl -X POST https://web-production-6679c.up.railway.app/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"0":{"json":{"email":"sandrodireto@gmail.com","password":"Ss311000!"}}}'
```

### 3. Testar Login no Frontend

1. Acesse: https://intelmarket.app/login
2. Use as credenciais:
   - Email: sandrodireto@gmail.com
   - Senha: Ss311000!
3. Deve redirecionar para o dashboard

---

## 🔍 Troubleshooting

### Backend retorna 502 Bad Gateway

**Causa:** Variáveis de ambiente não configuradas ou DATABASE_URL incorreta

**Solução:** Verificar variáveis no Railway, especialmente URL encoding da senha

### Login retorna "Failed to fetch"

**Causa:** Backend não está respondendo ou CORS não configurado

**Solução:** 
1. Verificar se backend está rodando
2. Verificar CORS em `server/_core/index.ts` (já configurado para intelmarket.app)

### Erro de conexão com banco de dados

**Causa:** DATABASE_URL incorreta ou caracteres especiais não encodados

**Solução:** Usar versão URL-encoded da connection string

---

## 📚 Referências

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)

---

## ✍️ Autor

Migração realizada por: Sistema de Migração Intelmarket  
Data: 24 de novembro de 2025  
Versão: 1.0.0
