# 🚀 Guia de Deployment

Este documento descreve como fazer deploy da aplicação Intelmarket Next.js.

## 📋 Índice

- [Deployment na Vercel](#deployment-na-vercel)
- [Deployment com Docker](#deployment-com-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Checklist de Produção](#checklist-de-produção)

---

## 🚀 Deployment na Vercel

A Vercel é a forma recomendada de fazer deploy desta aplicação.

### Passos

1. **Crie uma conta na Vercel:**
   - Acesse [vercel.com](https://vercel.com/) e crie uma conta.

2. **Importe o projeto:**
   - No dashboard da Vercel, clique em "Add New..." → "Project".
   - Conecte sua conta do GitHub e selecione o repositório `inteligencia-de-mercado`.

3. **Configure o projeto:**
   - A Vercel detectará automaticamente que é um projeto Next.js.
   - Configure as variáveis de ambiente na seção "Environment Variables".

4. **Faça o deploy:**
   - Clique em "Deploy".
   - A Vercel fará o build e deploy da aplicação.

### CI/CD

A Vercel integra-se automaticamente com o GitHub para CI/CD:
- **Push para `main`:** Trigger de um novo deploy de produção.
- **Pull Request:** Trigger de um deploy de preview.

---

## 🐳 Deployment com Docker

Você pode fazer deploy da aplicação em qualquer provedor de nuvem que suporte Docker.

### Build da Imagem Docker

1. **Construa a imagem:**
   ```bash
   docker build -t intelmarket-nextjs .
   ```

### Executando o Container

1. **Execute o container:**
   ```bash
   docker run -p 3000:3000 -d \
     --env-file .env.production \
     intelmarket-nextjs
   ```

### Docker Compose

Para um ambiente de produção completo com banco de dados e Redis, use o Docker Compose:

1. **Inicie os serviços:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## ⚙️ Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias para produção:

```env
# Banco de Dados
DATABASE_URL="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Sentry
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."

# Aplicação
NEXT_PUBLIC_APP_VERSION="1.0.0"
NODE_ENV="production"

# Redis
REDIS_URL="..."
```

---

## ✅ Checklist de Produção

Antes de fazer deploy para produção, verifique os seguintes itens:

### Configuração
- [ ] Variáveis de ambiente de produção estão configuradas.
- [ ] `NODE_ENV` está definido como `production`.
- [ ] Domínio customizado está configurado.
- [ ] Certificado SSL está ativo.

### Segurança
- [ ] Chaves de API e segredos estão seguros.
- [ ] CORS está configurado corretamente.
- [ ] Security headers estão implementados.
- [ ] Auditoria de dependências foi executada.

### Performance
- [ ] Build de produção está otimizado.
- [ ] Imagens estão otimizadas.
- [ ] Caching está configurado (CDN, Redis).
- [ ] Bundle size foi analisado.

### Monitoramento
- [ ] Sentry DSN de produção está configurado.
- [ ] Alertas estão configurados.
- [ ] Health checks estão sendo monitorados.

### Banco de Dados
- [ ] Banco de dados de produção está provisionado.
- [ ] Migrações foram aplicadas.
- [ ] Backups estão configurados.

### Testes
- [ ] Todos os testes (unit, integration, E2E) estão passando.
- [ ] Cobertura de testes atinge os thresholds.

---

## 📞 Suporte

Para problemas com o deploy, consulte a documentação da Vercel ou do seu provedor de nuvem, ou entre em contato com a equipe de DevOps.
