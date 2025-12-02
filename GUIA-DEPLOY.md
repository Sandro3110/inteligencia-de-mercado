# 🚀 GUIA DE DEPLOY - Vercel + Supabase + Upstash

**Projeto:** Inteligência de Mercado  
**Stack:** React + Node.js + PostgreSQL + Redis  
**Tempo estimado:** 30-40 minutos

---

## 📋 PRÉ-REQUISITOS

- ✅ Conta GitHub (já tem)
- ✅ Conta Supabase (já tem - projeto Intelmarket)
- ⏳ Conta Vercel (vamos criar se não tiver)
- ⏳ Conta Upstash (vamos criar)

---

## 🗂️ PARTE 1: CONFIGURAR SUPABASE (10 min)

### **1.1. Acessar projeto Intelmarket**

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **Intelmarket** (ecnzlynmuerbmqingyfl)

### **1.2. Obter credenciais do banco**

1. No menu lateral, clique em **"Settings"** (⚙️)
2. Clique em **"Database"**
3. Role até **"Connection string"**
4. Copie a **"Connection string"** no formato:
   ```
   postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
   ```
5. **IMPORTANTE:** Substitua `[PASSWORD]` pela senha do banco
   - Se não lembra, clique em "Reset database password"

**Exemplo:**
```
postgresql://postgres.ecnzlynmuerbmqingyfl:SuaSenhaAqui@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

**Guarde essa string!** Vamos usar depois.

---

### **1.3. Executar migrations no Supabase**

**Opção A: Via SQL Editor (Recomendado)**

1. No Supabase, vá em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole o conteúdo de cada migration:

**Migration 1: Audit Logs**
```sql
-- drizzle/migrations/005_create_audit_logs.sql

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

4. Clique em **"Run"**
5. Verifique se apareceu "Success"

**Migration 2: Encryption Hash Columns**
```sql
-- drizzle/migrations/006_add_encryption_hash_columns.sql

-- Adicionar colunas de hash para busca de dados criptografados
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS cnpj_hash VARCHAR(64);
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS cpf_hash VARCHAR(64);
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64);
ALTER TABLE entidades ADD COLUMN IF NOT EXISTS telefone_hash VARCHAR(64);

-- Criar índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_entidades_cnpj_hash ON entidades(cnpj_hash);
CREATE INDEX IF NOT EXISTS idx_entidades_cpf_hash ON entidades(cpf_hash);
CREATE INDEX IF NOT EXISTS idx_entidades_email_hash ON entidades(email_hash);
CREATE INDEX IF NOT EXISTS idx_entidades_telefone_hash ON entidades(telefone_hash);
```

6. Clique em **"Run"**
7. Verifique se apareceu "Success"

**Pronto! Banco configurado!** ✅

---

## 🔴 PARTE 2: CONFIGURAR REDIS (UPSTASH) (5 min)

### **2.1. Criar conta Upstash**

1. Acesse: https://upstash.com
2. Clique em **"Sign up"**
3. Use **"Continue with GitHub"** (mais rápido)

### **2.2. Criar banco Redis**

1. No dashboard, clique em **"Create database"**
2. Preencha:
   - **Name:** inteligencia-mercado-redis
   - **Type:** Regional
   - **Region:** us-west-2 (mesma do Supabase)
   - **Eviction:** No eviction
3. Clique em **"Create"**

### **2.3. Obter URL de conexão**

1. No dashboard do banco criado, vá em **"Details"**
2. Copie a **"UPSTASH_REDIS_REST_URL"**
   ```
   https://us2-merry-gopher-12345.upstash.io
   ```
3. Copie o **"UPSTASH_REDIS_REST_TOKEN"**
   ```
   AXlsASQgNzM4...
   ```

**IMPORTANTE:** Na verdade, para este projeto, precisamos da URL no formato `redis://`:

4. Role até **"Redis Connect"**
5. Copie a URL no formato:
   ```
   redis://default:AXlsASQgNzM4...@us2-merry-gopher-12345.upstash.io:6379
   ```

**Guarde essa URL!** ✅

---

## ▲ PARTE 3: DEPLOY NO VERCEL (10 min)

### **3.1. Criar conta Vercel**

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Use **"Continue with GitHub"** (conecta automaticamente)

### **3.2. Importar projeto do GitHub**

1. No dashboard Vercel, clique em **"Add New..."** → **"Project"**
2. Procure o repositório: **Sandro3110/inteligencia-de-mercado**
3. Clique em **"Import"**

### **3.3. Configurar projeto**

**Framework Preset:** Vite  
**Root Directory:** `./` (raiz)  
**Build Command:** `pnpm run build`  
**Output Directory:** `dist`  
**Install Command:** `pnpm install`

### **3.4. Configurar variáveis de ambiente**

**ANTES de clicar em "Deploy"**, clique em **"Environment Variables"**

Adicione as seguintes variáveis:

#### **Banco de Dados (Supabase)**
```
DATABASE_URL
postgresql://postgres.ecnzlynmuerbmqingyfl:SuaSenhaAqui@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

#### **Criptografia**
```
ENCRYPTION_KEY
6dc8b34953cabc4d8806fee96f7fa99b9ee3d3a14fe038ca3cabbf8610526e1b
```

```
ENCRYPTION_SALT
bd19188adc1445200b56d1308047307d
```

#### **Redis (Upstash)**
```
REDIS_URL
redis://default:SeuTokenAqui@us2-merry-gopher-12345.upstash.io:6379
```

#### **JWT (gere uma chave aleatória)**
```
JWT_SECRET
sua-chave-super-secreta-aqui-min-32-caracteres
```

#### **OAuth (se usar)**
```
OAUTH_SERVER_URL
https://oauth.seudominio.com
```

```
OAUTH_CLIENT_ID
seu-client-id
```

```
OAUTH_CLIENT_SECRET
seu-client-secret
```

### **3.5. Deploy!**

1. Clique em **"Deploy"**
2. Aguarde ~3-5 minutos
3. ✅ **Deploy concluído!**

---

## ✅ PARTE 4: VERIFICAR DEPLOY (5 min)

### **4.1. Acessar aplicação**

1. No Vercel, clique no link gerado:
   ```
   https://inteligencia-de-mercado-xxx.vercel.app
   ```

2. Verifique se:
   - ✅ Página carrega
   - ✅ Sidebar aparece
   - ✅ Footer com links legais aparece
   - ✅ Consegue fazer login (se tiver usuário)

### **4.2. Testar funcionalidades**

1. **Teste Rate Limiting:**
   - Tente fazer login com senha errada 6 vezes
   - Deve bloquear após 5 tentativas

2. **Teste Auditoria:**
   - Faça login
   - Crie um projeto
   - Verifique no Supabase (tabela `audit_logs`) se foi registrado

3. **Teste Criptografia:**
   - Adicione uma entidade com CNPJ
   - Verifique no Supabase se o CNPJ está criptografado

### **4.3. Verificar logs**

1. No Vercel, vá em **"Deployments"**
2. Clique no deployment ativo
3. Vá em **"Functions"** → **"Logs"**
4. Verifique se não há erros

---

## 🔧 PARTE 5: CONFIGURAÇÕES EXTRAS (10 min)

### **5.1. Configurar domínio customizado (Opcional)**

1. No Vercel, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite seu domínio: `inteligenciademercado.com.br`
4. Siga as instruções para configurar DNS

### **5.2. Criar email DPO**

**OBRIGATÓRIO para LGPD!**

1. Configure email: **dpo@seudominio.com**
2. Redirecione para seu email pessoal
3. Atualize footer se necessário

### **5.3. Configurar Analytics (Opcional)**

Se quiser analytics, adicione no Vercel:

```
VITE_GA_ID
G-XXXXXXXXXX
```

```
VITE_PLAUSIBLE_DOMAIN
seudominio.com
```

---

## 📊 RESUMO DAS VARIÁVEIS

**Copie e cole no Vercel:**

```env
# Banco de Dados
DATABASE_URL=postgresql://postgres.ecnzlynmuerbmqingyfl:SUA_SENHA@aws-0-us-west-2.pooler.supabase.com:6543/postgres

# Criptografia
ENCRYPTION_KEY=6dc8b34953cabc4d8806fee96f7fa99b9ee3d3a14fe038ca3cabbf8610526e1b
ENCRYPTION_SALT=bd19188adc1445200b56d1308047307d

# Redis
REDIS_URL=redis://default:SEU_TOKEN@us2-merry-gopher-12345.upstash.io:6379

# JWT
JWT_SECRET=sua-chave-super-secreta-aqui-minimo-32-caracteres

# OAuth (opcional)
OAUTH_SERVER_URL=https://oauth.seudominio.com
OAUTH_CLIENT_ID=seu-client-id
OAUTH_CLIENT_SECRET=seu-client-secret
```

---

## ⚠️ TROUBLESHOOTING

### **Erro: "Cannot connect to database"**

**Solução:**
1. Verifique se a senha do Supabase está correta
2. Verifique se a URL tem o formato correto
3. No Supabase, vá em Settings → Database → Connection Pooling → **Enable**

### **Erro: "Redis connection failed"**

**Solução:**
1. Verifique se a URL do Upstash está correta
2. Verifique se o token não expirou
3. Tente recriar o banco Redis

### **Erro: "Build failed"**

**Solução:**
1. Verifique se todas as variáveis estão configuradas
2. Vá em Vercel → Settings → General → Node.js Version → **20.x**
3. Redeploy

### **Erro: "Function timeout"**

**Solução:**
1. Vá em Vercel → Settings → Functions
2. Aumente o timeout para 60s (plano Pro)
3. Ou otimize as queries do banco

---

## ✅ CHECKLIST FINAL

**Antes de considerar pronto:**

- [ ] Supabase configurado
- [ ] Migrations executadas
- [ ] Upstash Redis criado
- [ ] Vercel deploy concluído
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação acessível
- [ ] Login funcionando
- [ ] Rate limiting testado
- [ ] Auditoria testada
- [ ] Email DPO criado
- [ ] Domínio customizado (opcional)
- [ ] Analytics configurado (opcional)

---

## 🎉 PRONTO!

**Sua aplicação está no ar!**

**URL:** https://inteligencia-de-mercado-xxx.vercel.app

**Próximos passos:**
1. Criar primeiro usuário admin
2. Testar todas as funcionalidades
3. Configurar domínio customizado
4. Divulgar! 🚀

---

## 📞 SUPORTE

**Dúvidas?**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Upstash: https://upstash.com/docs

**Problemas?**
- Verifique logs no Vercel
- Verifique logs no Supabase (SQL Editor)
- Teste localmente primeiro

---

**Criado por:** Manus AI  
**Data:** 02/12/2025  
**Tempo estimado:** 30-40 minutos  
**Dificuldade:** ⭐⭐⭐ (Médio)
