# Automação GitHub → Vercel

**Status:** ✅ Configurada e Funcionando  
**Data:** 24/11/2025

---

## 🎯 Visão Geral

O projeto Intelmarket está configurado com **deploy automático** do GitHub para o Vercel. Qualquer commit na branch `main` dispara um deploy automático de frontend + backend.

---

## 🔄 Fluxo de Deploy Automático

```
┌─────────────┐
│   Código    │
│  Modificado │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ git commit  │
│ git push    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   GitHub    │
│  (trigger)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vercel    │
│   Build     │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Frontend │   │ Backend  │   │   Cron   │
│  (Vite)  │   │  (tRPC)  │   │  Jobs    │
└──────────┘   └──────────┘   └──────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  Production │
              │   Deploy    │
              └─────────────┘
```

---

## ⚙️ Configuração Atual

### 1. **Integração GitHub ↔ Vercel**

✅ **Repositório:** `Sandro3110/inteligencia-de-mercado`  
✅ **Branch:** `main` (deploy automático)  
✅ **Preview:** Todas as branches (deploy de preview)

### 2. **Build Configuration** (`vercel.json`)

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "dist/public",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs22.x",
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### 3. **Variáveis de Ambiente**

Configuradas no Vercel Dashboard:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret-change-in-production
NODE_ENV=production
CRON_SECRET=<gerado pelo Vercel>
```

---

## 🚀 Como Fazer Deploy

### Deploy Automático (Recomendado)

```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: Nova funcionalidade"
git push origin main

# 2. Aguardar deploy automático (1-2 minutos)
# 3. Verificar em: https://intelmarket.app
```

✅ **Vercel detecta o push e faz deploy automaticamente!**

### Deploy Manual (Via Vercel CLI)

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🔍 Monitoramento de Deploys

### Via Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto
3. Veja lista de deploys em **Deployments**

### Via GitHub

1. Acesse: https://github.com/Sandro3110/inteligencia-de-mercado
2. Vá em **Actions** (se habilitado)
3. Ou veja status no commit (✅ ou ❌)

### Via Vercel CLI

```bash
# Ver deploys recentes
vercel ls

# Ver logs do último deploy
vercel logs
```

---

## 📋 Checklist de Deploy

Antes de fazer push para `main`:

- [ ] Build local passa: `pnpm build`
- [ ] Testes passam: `pnpm test` (se houver)
- [ ] Código revisado
- [ ] Commit message descritivo

Após push:

- [ ] Aguardar 1-2 minutos
- [ ] Verificar deploy no Vercel Dashboard
- [ ] Testar em https://intelmarket.app
- [ ] Verificar logs se houver erro

---

## 🎨 Preview Deployments

Vercel cria **preview deployments** para cada branch/PR:

```bash
# Criar branch de feature
git checkout -b feature/nova-funcionalidade

# Fazer alterações e push
git add .
git commit -m "feat: Nova funcionalidade"
git push origin feature/nova-funcionalidade

# Vercel cria URL de preview:
# https://inteligencia-de-mercado-git-feature-nova-funcionalidade-sandro3110.vercel.app
```

✅ **Vantagens:**
- Testar antes de mergear
- Compartilhar com time
- Não afeta produção

---

## 🔐 Variáveis de Ambiente

### Como Adicionar Nova Variável

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Preencha:
   - **Name:** `NOVA_VARIAVEL`
   - **Value:** `valor`
   - **Environments:** Production, Preview, Development
6. Clique em **Save**
7. **Redeploy** para aplicar

### Variáveis Sensíveis

⚠️ **NUNCA** commite variáveis sensíveis no código!

```bash
# ❌ ERRADO
const apiKey = "sk-1234567890";

# ✅ CORRETO
const apiKey = process.env.API_KEY;
```

---

## 📊 Logs e Debugging

### Ver Logs em Tempo Real

```bash
# Via Vercel CLI
vercel logs --follow

# Ou via Dashboard
# https://vercel.com/dashboard → Projeto → Logs
```

### Logs de Função Serverless

```typescript
// Em api/trpc.ts
console.log("[tRPC] Request received:", req.method, req.url);

// Aparece em: Vercel Dashboard → Functions → Logs
```

---

## 🔄 Rollback (Voltar Versão)

Se um deploy quebrar algo:

### Via Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Deployments**
4. Encontre deploy anterior que funcionava
5. Clique em **⋮** → **Promote to Production**

✅ **Rollback instantâneo!**

### Via Git

```bash
# Reverter último commit
git revert HEAD
git push origin main

# Ou voltar para commit específico
git reset --hard <commit-hash>
git push origin main --force
```

---

## 🎯 Cron Jobs

### Configuração

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Como Funciona

1. Vercel chama `/api/cron/daily` todo dia às 00:00 UTC
2. Handler valida token de autenticação
3. Executa `runDailyCronJobs()` do `server/cronJobs.ts`

### Monitorar Cron

```bash
# Ver logs de cron
vercel logs --filter="cron"

# Ou via Dashboard
# https://vercel.com/dashboard → Projeto → Cron Jobs
```

---

## 🚨 Troubleshooting

### Deploy Falha

**Erro:** `Build failed`

**Solução:**
1. Ver logs no Vercel Dashboard
2. Testar build local: `pnpm build`
3. Verificar dependências: `pnpm install`

---

### Função Serverless Timeout

**Erro:** `Function execution timed out after 60s`

**Solução:**
1. Otimizar query (adicionar índices no banco)
2. Dividir em múltiplas funções
3. Usar background job (Vercel Queue - futuro)

---

### Variável de Ambiente Não Encontrada

**Erro:** `process.env.DATABASE_URL is undefined`

**Solução:**
1. Verificar se variável está no Vercel Dashboard
2. Fazer redeploy após adicionar variável
3. Verificar nome exato (case-sensitive)

---

## 📚 Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## ✅ Status Atual

| Item | Status |
|------|--------|
| **GitHub Integration** | ✅ Configurado |
| **Auto Deploy** | ✅ Ativo |
| **Preview Deployments** | ✅ Ativo |
| **Environment Variables** | ✅ Configuradas |
| **Cron Jobs** | ✅ Configurados |
| **Logs** | ✅ Disponíveis (30 dias) |

---

**Última Atualização:** 24/11/2025 05:20 GMT-3  
**Próxima Revisão:** Quando necessário
