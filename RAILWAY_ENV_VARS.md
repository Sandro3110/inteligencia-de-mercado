# Variáveis de Ambiente para Railway

Configure as seguintes variáveis de ambiente no painel do Railway:

## Obrigatórias

### DATABASE_URL
```
postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000!@#$%@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres
```

**IMPORTANTE**: Se a senha contém caracteres especiais (`!@#$%`), pode ser necessário fazer URL encoding:
```
postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000%21%40%23%24%25@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres
```

Onde:
- `!` = `%21`
- `@` = `%40`
- `#` = `%23`
- `$` = `%24`
- `%` = `%25`

### JWT_SECRET
```
intelmarket_jwt_secret_2024_production_key_change_this_in_production
```

### NODE_ENV
```
production
```

### PORT
```
${{PORT}}
```
(Railway injeta automaticamente esta variável)

## Opcionais (mas recomendadas)

### OAUTH_SERVER_URL
```
https://vidabiz.butterfly-effect.dev
```
(Apenas se você ainda usar OAuth legacy)

---

## Como configurar no Railway

1. Acesse: https://railway.app/project/web-production-6679c
2. Clique na aba **Variables**
3. Adicione cada variável acima
4. Clique em **Deploy** para aplicar as mudanças

---

## Verificação

Após configurar, o backend deve responder em:
- https://web-production-6679c.up.railway.app/
- https://web-production-6679c.up.railway.app/api/trpc/auth.login

O login no frontend (https://intelmarket.app/login) deve funcionar com:
- Email: sandrodireto@gmail.com
- Senha: Ss311000!
