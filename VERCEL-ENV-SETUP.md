# 🚀 Configuração de Variáveis de Ambiente no Vercel

## 📋 Passo a Passo

### 1. Acesse o Projeto no Vercel
- Vá para: https://vercel.com/dashboard
- Selecione o projeto: **inteligencia-de-mercado**

### 2. Acesse Environment Variables
- Clique em **Settings** (no menu superior)
- Clique em **Environment Variables** (menu lateral esquerdo)

### 3. Adicione as Variáveis (uma por vez)

Clique em **Add New** e adicione cada variável abaixo:

---

## 🔐 VARIÁVEIS OBRIGATÓRIAS

### **ENCRYPTION_KEY**
```
6dc8b34953cabc4d8806fee96f7fa99b9ee3d3a14fe038ca3cabbf8610526e1b
```
- Environment: **Production**, **Preview**, **Development**

---

### **ENCRYPTION_SALT**
```
bd19188adc1445200b56d1308047307d
```
- Environment: **Production**, **Preview**, **Development**

---

### **REDIS_URL**
```
redis://default:AYAxAAIncDI3MDU0MWI0M2Y5NGM0ODQyOWNkNDgyZjRiMWFiYjhiMHAyMzI4MTc@chief-yak-32817.upstash.io:6379
```
- Environment: **Production**, **Preview**, **Development**

---

### **JWT_SECRET**
```
inteligencia-mercado-jwt-secret-2025-super-seguro-12345
```
- Environment: **Production**, **Preview**, **Development**

---

### **DATABASE_URL**
```
postgresql://postgres.ecnzlynmuerbmqingyfl:SUA_SENHA_AQUI@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```
⚠️ **IMPORTANTE:** Substitua `SUA_SENHA_AQUI` pela senha real do Supabase!

**Como pegar a senha:**
1. Acesse: https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/settings/database
2. Copie a senha do banco de dados
3. Cole no lugar de `SUA_SENHA_AQUI`

- Environment: **Production**, **Preview**, **Development**

---

### **NEXT_PUBLIC_SUPABASE_URL**
```
https://ecnzlynmuerbmqingyfl.supabase.co
```
- Environment: **Production**, **Preview**, **Development**

---

### **NEXT_PUBLIC_SUPABASE_ANON_KEY**

**Como pegar:**
1. Acesse: https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/settings/api
2. Copie a chave **anon public**
3. Cole aqui

- Environment: **Production**, **Preview**, **Development**

---

### **SUPABASE_SERVICE_ROLE_KEY**

**Como pegar:**
1. Acesse: https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/settings/api
2. Copie a chave **service_role** (⚠️ SECRETA!)
3. Cole aqui

- Environment: **Production**, **Preview**, **Development**

---

## 🌐 VARIÁVEIS DE URL (OPCIONAL)

### **APP_URL**
```
https://inteligencia-de-mercado.vercel.app
```
- Environment: **Production**

---

### **VITE_API_URL**
```
https://inteligencia-de-mercado.vercel.app/api
```
- Environment: **Production**

---

## 🤖 VARIÁVEIS OPCIONAIS (se usar)

### **OPENAI_API_KEY** (se usar IA)
```
sk-...
```
- Environment: **Production**, **Preview**, **Development**

---

### **RESEND_API_KEY** (se usar email)
```
re_...
```
- Environment: **Production**, **Preview**, **Development**

---

### **EMAIL_FROM** (se usar email)
```
noreply@seudominio.com
```
- Environment: **Production**, **Preview**, **Development**

---

## ✅ Verificação Final

Após adicionar todas as variáveis:

1. ✅ Total de variáveis: **mínimo 8** (obrigatórias)
2. ✅ Todas marcadas para: **Production**, **Preview**, **Development**
3. ✅ DATABASE_URL com senha correta
4. ✅ SUPABASE keys copiadas do dashboard

---

## 🚀 Deploy

Após configurar todas as variáveis:

1. Vá para a aba **Deployments**
2. Clique em **Redeploy** no último deployment
3. Marque **Use existing Build Cache**
4. Clique em **Redeploy**

---

## 📞 Suporte

Se tiver problemas:
- Verifique os logs em: **Deployments → [último deploy] → View Function Logs**
- Confirme que todas as variáveis estão presentes em: **Settings → Environment Variables**

---

## 🔗 Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Redis (Upstash):** https://console.upstash.com/redis/chief-yak-32817

---

**Última atualização:** 02/12/2025
