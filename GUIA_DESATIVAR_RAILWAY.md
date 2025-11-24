# Guia: Como Desativar o Railway

**Data:** 24/11/2025  
**Motivo:** Backend migrado para Vercel Serverless  
**Economia:** $5/mês ($60/ano)

---

## ✅ Pré-requisitos

Antes de desativar o Railway, confirme que:

- [x] Backend no Vercel está funcionando
- [x] Login funciona em https://intelmarket.app/login
- [x] Queries ao banco estão executando
- [x] Variáveis de ambiente configuradas no Vercel

---

## 📋 Passo a Passo para Desativar Railway

### Passo 1: Fazer Backup das Variáveis de Ambiente

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto do backend
3. Vá em **Settings** → **Variables**
4. **Copie todas as variáveis** para um arquivo seguro:

```env
DATABASE_URL=postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000%21%40%23%24%25@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret-change-in-production
NODE_ENV=production
PORT=3000
```

⚠️ **IMPORTANTE:** Guarde essas variáveis em local seguro (gerenciador de senhas)

---

### Passo 2: Confirmar que Vercel Está Funcionando

**Teste 1: Acessar o Site**
```
https://intelmarket.app/login
```
- ✅ Deve carregar a página de login

**Teste 2: Fazer Login**
- Email: `sandrodireto@gmail.com`
- Senha: `Ss311000!`
- ✅ Deve fazer login com sucesso

**Teste 3: Verificar Dashboard**
- ✅ Deve carregar dados dos clientes
- ✅ Deve mostrar métricas

---

### Passo 3: Pausar o Serviço Railway (Teste)

Antes de deletar permanentemente, pause o serviço para testar:

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto do backend
3. Clique em **Settings** (engrenagem)
4. Role até **Service**
5. Clique em **Pause Service**

**Aguarde 5 minutos** e teste novamente:
- ✅ Site continua funcionando?
- ✅ Login funciona?
- ✅ Dados carregam?

Se **tudo funcionar**, o Railway não é mais necessário! ✅

---

### Passo 4: Deletar o Projeto Railway

⚠️ **ATENÇÃO:** Esta ação é **irreversível**!

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto do backend
3. Clique em **Settings** (engrenagem)
4. Role até o final da página
5. Clique em **Delete Project**
6. Digite o nome do projeto para confirmar
7. Clique em **Delete**

✅ **Pronto!** O Railway foi desativado.

---

### Passo 5: Cancelar Assinatura Railway (Opcional)

Se você não tem outros projetos no Railway:

1. Acesse: https://railway.app/account/billing
2. Clique em **Cancel Subscription**
3. Confirme o cancelamento

💰 **Economia confirmada:** $5/mês ($60/ano)

---

## 🔄 Como Reverter (Se Necessário)

Se algo der errado e você precisar voltar para o Railway:

### Opção A: Reativar Serviço Pausado

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto
3. Clique em **Resume Service**

### Opção B: Criar Novo Projeto

1. Acesse: https://railway.app/new
2. Conecte ao GitHub: `Sandro3110/inteligencia-de-mercado`
3. Selecione branch `main`
4. Adicione variáveis de ambiente (do backup do Passo 1)
5. Deploy automático

---

## 📊 Comparação Antes/Depois

| Item | Antes (Railway) | Depois (Vercel) |
|------|-----------------|-----------------|
| **Custo** | $25/mês | $20/mês |
| **Plataformas** | 2 (Vercel + Railway) | 1 (Vercel) |
| **Deploy** | 2 lugares | 1 lugar |
| **Logs** | 7 dias | 30 dias |
| **Timeout** | Ilimitado | 60s |
| **Auto-scaling** | Manual | Automático |

---

## ✅ Checklist Final

Antes de desativar o Railway, confirme:

- [ ] Backup de variáveis de ambiente feito
- [ ] Vercel está funcionando (login OK)
- [ ] Serviço Railway pausado por 5+ minutos
- [ ] Testes realizados com Railway pausado
- [ ] Tudo funciona sem o Railway

**Se todos os itens estão marcados:** ✅ Pode deletar o Railway!

---

## 🆘 Suporte

Se encontrar problemas:

1. **Logs do Vercel:** https://vercel.com/dashboard → Projeto → Logs
2. **Reativar Railway:** Seguir "Como Reverter" acima
3. **Suporte Manus:** https://help.manus.im

---

## 📝 Notas Técnicas

### O Que Foi Migrado

✅ **tRPC API** → `/api/trpc`  
✅ **Cron Jobs** → `/api/cron/daily` (Vercel Cron)  
⚠️ **SSE (Server-Sent Events)** → Não suportado (usar polling)  
⚠️ **WebSockets** → Não suportado (usar serviço externo no futuro)

### Limitações do Vercel Serverless

- ⏱️ Timeout máximo: 60 segundos
- 🔌 Sem conexões persistentes
- 📡 Sem WebSockets nativos
- 💾 Sem armazenamento de arquivos (usar S3/Supabase Storage)

**Para o Intelmarket:** Nenhuma dessas limitações afeta o funcionamento atual! ✅

---

**Última Atualização:** 24/11/2025 05:15 GMT-3  
**Status:** Pronto para desativar Railway
