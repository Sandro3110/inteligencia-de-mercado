# 🔍 GUIA DE DEBUG - Email de Notificação Admin

## 📋 RESUMO DO PROBLEMA

**Situação:**

- ✅ Email de **boas-vindas** para usuário funciona perfeitamente
- ❌ Email de **notificação** para admin NÃO está chegando
- ✅ `RESEND_API_KEY` está configurada corretamente (confirmado pelo funcionamento do email de boas-vindas)
- ✅ Domínio `contato@intelmarket.app` está verificado no Resend

**Conclusão:**
O problema **NÃO é** a configuração do Resend ou a chave API. É algo específico no envio do email de notificação.

---

## 🛠️ MELHORIAS IMPLEMENTADAS

### 1. **Logs Detalhados Adicionados**

Adicionei logs completos na função `sendAdminNotification()` em `server/services/emailService.ts`:

```typescript
🔔 [sendAdminNotification] Iniciando envio de notificação para admin
📧 [sendAdminNotification] Destinatários: ['sandrodireto@gmail.com']
📤 [sendAdminNotification] Remetente: contato@intelmarket.app
👤 [sendAdminNotification] Usuário: Nome (email@example.com)
📝 [sendAdminNotification] Template gerado, assunto: 🔔 Novo Cadastro Pendente
📤 [sendAdminNotification] Chamando Resend API...
✅ [sendAdminNotification] Notificação enviada com sucesso!
📊 [sendAdminNotification] Resposta: { id: "...", ... }
```

**Se houver erro:**

```typescript
❌ [sendAdminNotification] ERRO ao enviar notificação:
❌ [sendAdminNotification] Detalhes: { ... erro completo em JSON ... }
```

### 2. **Script de Teste Criado**

Arquivo: `scripts/test-admin-email.ts`

Para testar localmente (se tiver a chave real):

```bash
npx tsx scripts/test-admin-email.ts
```

---

## 🔎 PRÓXIMOS PASSOS PARA INVESTIGAÇÃO

### **PASSO 1: Fazer Cadastro de Teste**

1. Acesse: https://www.intelmarket.app/cadastro
2. Preencha com dados fictícios:
   - Nome: Teste Debug
   - Email: teste-debug@example.com
   - Empresa: Empresa Teste
   - Cargo: Gerente
   - Setor: TI
   - Senha: qualquer senha
3. Clique em "Cadastrar"

### **PASSO 2: Verificar Logs no Vercel**

1. Acesse: https://vercel.com/sandro-dos-santos-projects/inteligencia-de-mercado
2. Clique em **"Logs"** no menu lateral
3. Filtre por **"Runtime Logs"**
4. Procure pelos logs com prefixo `[sendAdminNotification]`

**O que procurar:**

#### ✅ **Cenário 1: Email Enviado com Sucesso**

```
🔔 [sendAdminNotification] Iniciando envio...
📧 [sendAdminNotification] Destinatários: ['sandrodireto@gmail.com']
...
✅ [sendAdminNotification] Notificação enviada com sucesso!
📊 [sendAdminNotification] Resposta: { id: "abc123", ... }
```

**Ação:** Se os logs mostram sucesso mas email não chegou:

- ✉️ Verifique **Spam** no Gmail
- 📬 Verifique **Promoções** no Gmail
- 🔍 Pesquise por "IntelMarket" ou "Novo Cadastro"
- 📊 Acesse o [Dashboard do Resend](https://resend.com/emails) e veja se o email aparece como enviado

#### ❌ **Cenário 2: Erro no Envio**

```
🔔 [sendAdminNotification] Iniciando envio...
❌ [sendAdminNotification] ERRO ao enviar notificação:
❌ [sendAdminNotification] Detalhes: { ... }
```

**Ação:** Copie o erro completo e analise:

- **"Invalid API key"** → Chave não configurada (improvável, pois boas-vindas funciona)
- **"Domain not verified"** → Domínio não verificado no Resend
- **"Invalid recipient"** → Email do admin está errado
- **"Rate limit"** → Limite de envios atingido

#### 🤔 **Cenário 3: Logs Não Aparecem**

Se os logs `[sendAdminNotification]` não aparecem:

**Ação:** Significa que a função não está sendo chamada. Verifique:

1. Logs da rota `/api/auth/register`
2. Se há erro antes de chegar na função
3. Se o try-catch está silenciando o erro

---

## 🎯 POSSÍVEIS CAUSAS E SOLUÇÕES

### **Causa 1: Email Indo para Spam**

**Probabilidade:** 🔴 Alta

**Como verificar:**

1. Abra Gmail: https://mail.google.com
2. Vá em **Spam** (menu lateral)
3. Pesquise por "IntelMarket" ou "Novo Cadastro"

**Solução:**

- Marque como "Não é spam"
- Adicione `contato@intelmarket.app` aos contatos

### **Causa 2: Email do Admin Errado**

**Probabilidade:** 🟡 Baixa

**Como verificar:**
Logs mostrarão:

```
📧 [sendAdminNotification] Destinatários: ['email@errado.com']
```

**Solução:**
Corrigir em `server/services/emailService.ts`:

```typescript
const ADMIN_EMAILS = ['sandrodireto@gmail.com']; // ← Verificar se está correto
```

### **Causa 3: Erro Silencioso na API**

**Probabilidade:** 🟡 Média

**Como verificar:**
Logs mostrarão erro detalhado

**Solução:**
Depende do erro específico

### **Causa 4: Domínio FROM_EMAIL Não Verificado**

**Probabilidade:** 🟢 Baixa (pois boas-vindas funciona)

**Como verificar:**

1. Acesse: https://resend.com/domains
2. Veja se `intelmarket.app` está verificado

**Solução:**

- Verificar domínio no Resend
- Ou usar email verificado diferente

### **Causa 5: Limite de Envios Atingido**

**Probabilidade:** 🟢 Muito Baixa

**Como verificar:**

- Logs mostrarão erro "Rate limit exceeded"
- Dashboard do Resend mostrará uso

**Solução:**

- Aguardar reset do limite
- Ou upgrade do plano

---

## 📊 DASHBOARD DO RESEND

**Acesse:** https://resend.com/emails

Lá você pode ver:

- ✅ Todos os emails enviados
- 📧 Status de cada email (sent, delivered, bounced, failed)
- 🔍 Filtrar por destinatário
- 📅 Histórico completo

**Como usar:**

1. Faça login no Resend
2. Vá em "Emails" no menu lateral
3. Procure por emails para `sandrodireto@gmail.com`
4. Veja se o email de notificação aparece
5. Se aparecer como "delivered" mas não chegou → está no Spam
6. Se aparecer como "failed" → veja o erro

---

## 🚀 SOLUÇÃO TEMPORÁRIA

**Enquanto investiga o problema de email:**

✅ Use a **página de administração de usuários**:

- URL: https://www.intelmarket.app/admin/users
- Não depende de email
- Funciona 100%
- Aprovação instantânea

---

## 📝 CHECKLIST DE INVESTIGAÇÃO

- [ ] Fazer cadastro de teste
- [ ] Verificar logs no Vercel
- [ ] Verificar pasta de Spam no Gmail
- [ ] Verificar Dashboard do Resend
- [ ] Verificar se email do admin está correto no código
- [ ] Verificar se domínio está verificado no Resend
- [ ] Copiar erro completo dos logs (se houver)

---

## 🆘 SE PRECISAR DE AJUDA

**Informações para compartilhar:**

1. **Logs do Vercel** (copie os logs completos com `[sendAdminNotification]`)
2. **Dashboard do Resend** (screenshot ou status do email)
3. **Email do admin** usado no código
4. **Se verificou Spam** (sim/não)

---

## 📌 OBSERVAÇÕES IMPORTANTES

1. ✅ **Resend e chave estão OK** (confirmado pelo funcionamento do email de boas-vindas)
2. ✅ **Código é idêntico** para ambos os emails (mesma função `resend.emails.send()`)
3. ✅ **Domínio está verificado** (senão boas-vindas também não funcionaria)
4. 🔍 **Problema é específico** do email de notificação

**Portanto, as causas mais prováveis são:**

- 📬 Email indo para Spam (mais provável)
- 🐛 Erro específico no envio (logs vão mostrar)
- 📧 Email do admin errado (improvável mas possível)

---

## 🎯 COMMIT

**Commit:** `756e6cc`
**Branch:** `main`
**Deploy:** Aguardando (~2 minutos)

**Mudanças:**

- ✅ Logs detalhados em `sendAdminNotification()`
- ✅ Script de teste criado
- ✅ Tratamento de erros melhorado

---

**Próximo passo:** Aguarde o deploy completar e faça um cadastro de teste para ver os logs! 🚀
