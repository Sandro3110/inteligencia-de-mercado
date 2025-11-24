# 🚀 Guia de Deploy no Vercel

## Pré-requisitos

✅ Código no GitHub: `Sandro3110/inteligencia-de-mercado`  
✅ Conta Vercel conectada ao GitHub  
✅ Variáveis de ambiente configuradas

---

## 📋 Variáveis de Ambiente Necessárias

### **Obrigatórias**

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

### **Opcionais (Monitoramento)**

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## 🔧 Passos para Deploy

### **1. Importar Projeto no Vercel**

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione o repositório: `Sandro3110/inteligencia-de-mercado`
4. Clique em **"Import"**

### **2. Configurar Build Settings**

O Vercel detectará automaticamente Next.js, mas verifique:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### **3. Adicionar Variáveis de Ambiente**

1. Na aba **"Environment Variables"**
2. Adicione todas as variáveis listadas acima
3. Selecione os ambientes: **Production**, **Preview**, **Development**

### **4. Deploy**

1. Clique em **"Deploy"**
2. Aguarde o build (5-10 minutos)
3. Vercel fornecerá uma URL: `https://seu-app.vercel.app`

---

## ✅ Pós-Deploy

### **1. Verificar Health Checks**

```bash
curl https://seu-app.vercel.app/api/health
curl https://seu-app.vercel.app/api/live
curl https://seu-app.vercel.app/api/ready
```

### **2. Configurar Domínio Customizado** (Opcional)

1. Na aba **"Settings" → "Domains"**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### **3. Ativar Sentry** (Opcional)

1. Adicione variáveis Sentry
2. Redeploy para ativar monitoramento

---

## 🔄 Deploy Automático

O Vercel faz deploy automático quando você:

- ✅ Push para `main` → Deploy em **Production**
- ✅ Push para outras branches → Deploy em **Preview**
- ✅ Pull Request → Deploy de **Preview** com URL única

---

## 🐛 Troubleshooting

### **Build Falha**

1. Verifique logs no Vercel Dashboard
2. Teste build localmente: `npm run build`
3. Verifique variáveis de ambiente

### **Erro de Database**

1. Verifique `DATABASE_URL` e `DIRECT_URL`
2. Confirme que o banco está acessível
3. Execute migrations: `npm run db:push`

### **Erro 500**

1. Verifique logs no Sentry (se configurado)
2. Acesse `/api/health` para diagnóstico
3. Verifique variáveis de ambiente

---

## 📊 Monitoramento

### **Vercel Analytics**

Ative em: **Settings → Analytics**

### **Sentry**

Acesse: `https://sentry.io/organizations/[org]/projects/[project]`

### **Logs**

Acesse: **Vercel Dashboard → Deployments → [Deployment] → Logs**

---

## 🎯 Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Database acessível e migrations aplicadas
- [ ] Build local funciona: `npm run build`
- [ ] Testes passando: `npm test`
- [ ] Código no GitHub atualizado
- [ ] Domínio configurado (se aplicável)
- [ ] Sentry configurado (se aplicável)

---

## 🚀 Deploy Agora!

**Repositório:** https://github.com/Sandro3110/inteligencia-de-mercado  
**Vercel:** https://vercel.com/new

**Boa sorte com o deploy! 🎉**
