# Guia: Como Limpar o Cache do Vercel

**Problema:** O domínio `intelmarket.app` ainda está servindo a versão antiga do código, mesmo após o deploy mais recente ter sido concluído com sucesso.

**Causa:** O CDN (Content Delivery Network) do Vercel mantém em cache as versões antigas do site para melhorar a performance. Esse cache pode levar de 24 a 48 horas para expirar naturalmente.

**Solução:** Limpar manualmente o cache do projeto no painel do Vercel.

---

## Passo a Passo para Limpar o Cache

### 1. Acesse o Dashboard do Vercel

Faça login em https://vercel.com com sua conta.

### 2. Selecione o Projeto

No dashboard, clique no projeto **`inteligencia-de-mercado`**.

### 3. Vá para Settings

No menu superior do projeto, clique na aba **Settings**.

### 4. Acesse a Seção Advanced

No menu lateral esquerdo, role para baixo e clique em **Advanced**.

### 5. Encontre "Purge All Caches"

Role a página para baixo até encontrar a seção **"Caching"**.

Você verá um botão vermelho escrito **"Purge All Caches"**.

### 6. Clique em "Purge All Caches"

Clique no botão. O Vercel pedirá confirmação.

### 7. Confirme a Ação

Clique em **"Purge"** ou **"Confirm"** para confirmar a limpeza do cache.

### 8. Aguarde a Propagação

A limpeza do cache pode levar de **5 a 10 minutos** para se propagar globalmente em todos os servidores do CDN.

### 9. Teste o Site

Após aguardar 5-10 minutos, acesse:

- https://intelmarket.app/login

Você deverá ver a **nova página de login** do sistema JWT.

---

## Como Saber se Funcionou?

Quando o cache for limpo e a nova versão estiver ativa, você verá:

1. **Página de Login:** Um formulário de login com campos de email e senha (não mais o redirecionamento OAuth).
2. **Página de Registro:** Acessível em `/register`, com campos para criar uma nova conta.
3. **Proteção de Rotas:** Ao tentar acessar `/` sem estar logado, você será redirecionado automaticamente para `/login`.

---

## Alternativa: Aguardar Expiração Natural

Se você preferir não fazer a limpeza manual, o cache expirará naturalmente em **24 a 48 horas**. Após esse período, o domínio `intelmarket.app` automaticamente servirá a versão mais recente.

---

## Verificação Técnica (Opcional)

Se você quiser verificar tecnicamente qual versão está sendo servida, pode:

1. Abrir o **DevTools** do navegador (F12).
2. Ir para a aba **Network**.
3. Recarregar a página (Ctrl+Shift+R).
4. Procurar pelo arquivo `index.html` ou `index-*.js`.
5. Verificar o **hash** do arquivo (ex: `index-AG5HgDhg.js`).

O hash `AG5HgDhg` corresponde ao deployment mais recente. Se você ver um hash diferente, significa que ainda está servindo a versão antiga em cache.

---

## Suporte

Se após seguir esses passos você ainda tiver problemas, entre em contato com o suporte do Vercel ou verifique os logs de deployment no painel.
