# 🔧 GUIA: Configurar SUPABASE_SERVICE_ROLE_KEY no Vercel

## ❌ PROBLEMA

Ao tentar cadastrar novo usuário, aparece erro:

```
Invalid API key
```

**Causa:** A variável `SUPABASE_SERVICE_ROLE_KEY` não está configurada no Vercel.

---

## ✅ SOLUÇÃO

### Passo 1: Pegar a Service Role Key do Supabase

1. **Acesse o Supabase Dashboard:**
   - https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/settings/api

2. **Localize a seção "Project API keys"**

3. **Copie a chave "service_role":**
   - ⚠️ **NÃO** copie a "anon" ou "public"
   - ✅ Copie a **"service_role"** (secret)
   - Ela começa com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Passo 2: Adicionar no Vercel

1. **Acesse o Vercel Dashboard:**
   - https://vercel.com/sandro3110s-projects/inteligencia-de-mercado/settings/environment-variables

2. **Clique em "Add New"**

3. **Preencha:**
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Cole a service_role key que você copiou
   - **Environment:** Marque **Production**, **Preview**, **Development**

4. **Clique em "Save"**

---

### Passo 3: Fazer Redeploy

1. **Acesse a aba "Deployments":**
   - https://vercel.com/sandro3110s-projects/inteligencia-de-mercado/deployments

2. **Clique nos 3 pontinhos** do último deploy

3. **Clique em "Redeploy"**

4. **Aguarde** o deploy completar (~2 minutos)

---

## 🔍 VERIFICAR SE ESTÁ CONFIGURADO

### Método 1: Via Vercel Dashboard

1. Acesse: https://vercel.com/sandro3110s-projects/inteligencia-de-mercado/settings/environment-variables
2. Procure por: `SUPABASE_SERVICE_ROLE_KEY`
3. Deve aparecer com valor oculto: `••••••••••••••••`

### Método 2: Via Vercel CLI (se tiver instalado)

```bash
vercel env ls
```

Deve aparecer:
```
SUPABASE_SERVICE_ROLE_KEY (Production, Preview, Development)
```

---

## 📋 VARIÁVEIS NECESSÁRIAS

Para o sistema funcionar completamente, você precisa ter estas variáveis configuradas no Vercel:

### ✅ Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ← **Esta que está faltando!**

### ✅ Resend (Emails)
- `RESEND_API_KEY`

### ✅ Database
- `DATABASE_URL`

### ✅ App
- `NEXT_PUBLIC_APP_URL`

---

## 🧪 TESTAR APÓS CONFIGURAR

1. **Aguarde o redeploy completar**

2. **Acesse a página de cadastro:**
   - https://www.intelmarket.app/register

3. **Preencha o formulário:**
   - Nome: Teste
   - Email: teste@example.com
   - Empresa: Empresa Teste
   - Cargo: Cargo Teste
   - Setor: Setor Teste
   - Senha: Teste123!
   - Confirmar Senha: Teste123!

4. **Clique em "Criar conta"**

5. **Resultado esperado:**
   - ✅ Mensagem de sucesso
   - ✅ Redirecionamento para tela de "Aguardando Aprovação"
   - ✅ Email de boas-vindas enviado para teste@example.com
   - ✅ Email de notificação enviado para sandrodireto@gmail.com

---

## ⚠️ IMPORTANTE

### Segurança da Service Role Key

- ❌ **NUNCA** compartilhe a service_role key publicamente
- ❌ **NUNCA** commite no Git
- ❌ **NUNCA** use no frontend (apenas backend)
- ✅ **SEMPRE** use apenas em variáveis de ambiente
- ✅ **SEMPRE** mantenha em segredo

### Por que precisamos dela?

A `service_role` key permite:
- ✅ Criar usuários **sem enviar email de confirmação do Supabase**
- ✅ Marcar email como confirmado automaticamente
- ✅ Usar apenas nossos emails personalizados via Resend
- ✅ Bypass de políticas RLS (Row Level Security)

---

## 🆘 TROUBLESHOOTING

### Erro persiste após configurar?

1. **Verifique se fez redeploy:**
   - Variáveis só são aplicadas após redeploy

2. **Verifique se copiou a chave correta:**
   - Deve ser a **service_role** (não anon)
   - Deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

3. **Verifique se marcou todos os ambientes:**
   - Production ✅
   - Preview ✅
   - Development ✅

4. **Limpe o cache do browser:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

### Ainda não funciona?

1. **Verifique os logs do Vercel:**
   - https://vercel.com/sandro3110s-projects/inteligencia-de-mercado/logs
   - Procure por erros relacionados a "Invalid API key"

2. **Teste localmente:**
   ```bash
   # Adicione no .env.local
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
   
   # Rode o projeto
   pnpm dev
   
   # Teste o cadastro em localhost:3000/register
   ```

---

## 📝 CHECKLIST

Antes de testar, confirme:

- [ ] Copiou a **service_role** key do Supabase
- [ ] Adicionou `SUPABASE_SERVICE_ROLE_KEY` no Vercel
- [ ] Marcou **Production**, **Preview**, **Development**
- [ ] Salvou a variável
- [ ] Fez **Redeploy**
- [ ] Aguardou deploy completar
- [ ] Limpou cache do browser

---

## ✅ RESULTADO ESPERADO

Após configurar corretamente:

1. **Cadastro funciona** sem erro "Invalid API key"
2. **Usuário criado** no Supabase Auth
3. **Registro criado** na tabela `users` com `ativo = 0`
4. **Email de boas-vindas** enviado via Resend
5. **Email de notificação** enviado para admin
6. **Tela de sucesso** mostrando "Aguardando Aprovação"

---

**Desenvolvido por:** Manus AI  
**Data:** 27 de Novembro de 2025  
**Versão:** 1.0.0
