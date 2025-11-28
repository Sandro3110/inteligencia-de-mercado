# 🚀 Guia de Deploy - IntelMarket v2.0

## Visão Geral

Este documento contém instruções completas para fazer o deploy do IntelMarket v2.0 em produção.

---

## 📋 Pré-requisitos

### Contas Necessárias:

- ✅ Conta no GitHub
- ✅ Conta no Vercel (recomendado) ou Netlify
- ✅ Conta no Supabase (banco de dados)
- ✅ API Key da OpenAI (obrigatória)
- ⚪ API Key do Gemini (opcional)
- ⚪ API Key do Anthropic (opcional)

### Ferramentas Locais:

- Node.js 22.x
- pnpm 10.x
- Git

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# OpenAI (Obrigatório)
OPENAI_API_KEY=sk-...

# Gemini (Opcional)
GEMINI_API_KEY=...

# Anthropic (Opcional)
ANTHROPIC_API_KEY=...

# Next.js
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 2. Banco de Dados Supabase

**Opção A: Usar banco existente**

- Use as credenciais do Supabase que você já tem

**Opção B: Criar novo banco**

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute as migrations:
   ```bash
   pnpm supabase db push
   ```

### 3. Configurar API Keys no Sistema

Após o primeiro deploy, acesse a aplicação e configure as API keys:

1. Faça login como admin
2. Vá em **Configurações**
3. Configure as API keys:
   - OpenAI (obrigatória)
   - Gemini (opcional)
   - Anthropic (opcional)
4. Teste a conexão

---

## 🚀 Deploy no Vercel (Recomendado)

### Passo 1: Preparar Repositório

```bash
# Certifique-se de estar na branch correta
git checkout feature/simplificacao-completa

# Push para GitHub
git push origin feature/simplificacao-completa
```

### Passo 2: Importar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe o repositório do GitHub
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Passo 3: Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Acesse a URL fornecida

---

## 🌐 Deploy no Netlify (Alternativa)

### Passo 1: Preparar Repositório

```bash
git push origin feature/simplificacao-completa
```

### Passo 2: Importar no Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em **"Add new site"**
3. Importe o repositório do GitHub
4. Configure:
   - **Build command**: `pnpm build`
   - **Publish directory**: `.next`

### Passo 3: Configurar Variáveis de Ambiente

Em **Site settings > Environment variables**, adicione as mesmas variáveis do Vercel.

### Passo 4: Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build
3. Acesse a URL fornecida

---

## 🔐 Segurança

### Variáveis Sensíveis:

- ❌ **NUNCA** commite arquivos `.env` ou `.env.local`
- ✅ Use variáveis de ambiente na plataforma de deploy
- ✅ Rotacione API keys regularmente

### CORS:

- Configure o Supabase para aceitar requisições do seu domínio
- Em **Authentication > URL Configuration**, adicione sua URL de produção

### Rate Limiting:

- Configure rate limiting no Supabase
- Monitore uso da API OpenAI

---

## 🧪 Validação Pós-Deploy

### Checklist:

1. **Autenticação**
   - [ ] Login funciona
   - [ ] Registro funciona
   - [ ] Aprovação de usuários funciona

2. **Funcionalidades Core**
   - [ ] Dashboard carrega
   - [ ] Criar projeto funciona
   - [ ] Criar pesquisa funciona
   - [ ] Upload CSV funciona
   - [ ] Enriquecimento IA funciona ⭐
   - [ ] Resultados aparecem
   - [ ] Exportação CSV funciona
   - [ ] Mapa geográfico funciona

3. **UI/UX**
   - [ ] Sidebar recolhe/expande
   - [ ] Mobile funciona
   - [ ] Tooltips aparecem
   - [ ] Loading states funcionam

4. **Performance**
   - [ ] Páginas carregam rápido (< 2s)
   - [ ] Queries otimizadas
   - [ ] Sem erros no console

---

## 🐛 Troubleshooting

### Erro: "Supabase connection failed"

**Solução**: Verifique as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Erro: "OpenAI API key not found"

**Solução**:

1. Verifique se `OPENAI_API_KEY` está configurada
2. Ou configure no sistema em **Configurações > IA**

### Erro: "Build failed"

**Solução**:

1. Verifique logs do build
2. Execute `pnpm build` localmente
3. Corrija erros TypeScript/lint

### Erro: "Database migration failed"

**Solução**:

1. Execute migrations manualmente:
   ```bash
   pnpm supabase db push
   ```

---

## 📊 Monitoramento

### Métricas Importantes:

- **Uptime**: Use Vercel Analytics ou UptimeRobot
- **Performance**: Vercel Speed Insights
- **Erros**: Sentry (recomendado)
- **Uso de API**: Dashboard OpenAI

### Logs:

- **Vercel**: Functions > Logs
- **Supabase**: Logs & Analytics
- **Browser**: Console do navegador

---

## 🔄 Atualizações Futuras

### Para atualizar a aplicação:

```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: Nova funcionalidade"

# 2. Push para GitHub
git push origin feature/simplificacao-completa

# 3. Vercel faz deploy automático
# Ou trigger manualmente no painel
```

---

## 📞 Suporte

### Documentação:

- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- OpenAI: https://platform.openai.com/docs

### Contato:

- GitHub Issues: [seu-repo]/issues
- Email: [seu-email]

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados Supabase funcionando
- [ ] API Keys configuradas no sistema
- [ ] Testes de funcionalidades passando
- [ ] UI/UX validada
- [ ] Performance aceitável
- [ ] Monitoramento configurado
- [ ] Documentação atualizada
- [ ] Usuário admin criado
- [ ] Domínio customizado configurado (opcional)

---

**🎉 Parabéns! Sua aplicação está em produção!**
