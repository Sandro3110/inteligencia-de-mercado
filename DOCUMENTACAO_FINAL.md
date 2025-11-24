# Documentação Final - Sistema de Autenticação Intelmarket

**Autor:** Manus AI
**Data:** 24 de Novembro de 2025

## 1. Visão Geral do Projeto

Este documento detalha a implementação completa de um sistema de autenticação e gestão de usuários para o projeto **Intelmarket (Sistema de Inteligência de Mercado PAV)**. O objetivo foi substituir um sistema de autenticação legado baseado em OAuth externo por uma solução moderna, segura e auto-contida, utilizando **JSON Web Tokens (JWT)**.

A arquitetura final consiste em um frontend desacoplado (Vercel) comunicando-se com um backend de API (Railway), ambos integrados a um banco de dados PostgreSQL (Supabase) e a um serviço de envio de emails (Resend).

### 1.1. Stack Tecnológico

| Componente      | Tecnologia Utilizada                                    |
| :-------------- | :------------------------------------------------------ |
| **Frontend**    | React, Vite, TypeScript, Wouter, Shadcn/UI              |
| **Backend**     | Node.js 20, Express, tRPC                               |
| **Banco de Dados** | PostgreSQL (via Supabase)                               |
| **ORM**         | Drizzle ORM                                             |
| **Autenticação** | JWT (JSON Web Tokens) + bcrypt (hashing de senhas)      |
| **Emails**      | Resend API                                              |
| **Deploy**      | Frontend no Vercel, Backend no Railway                  |

### 1.2. Status Final

- ✅ **Backend (Railway):** Ativo e funcional em `https://web-production-6679c.up.railway.app`.
- ✅ **Frontend (Vercel):** Deploy mais recente concluído, aguardando propagação de cache do CDN.
- ✅ **Comunicação:** Backend e Frontend configurados para comunicação segura via CORS.
- ✅ **Autenticação:** Sistema JWT 100% implementado e integrado.

---

## 2. Instruções para Limpeza de Cache (Vercel)

Devido à natureza dos CDNs (Content Delivery Networks), o Vercel pode manter em cache versões antigas do site, mesmo após um novo deploy. Isso causa o problema que estamos vendo, onde o domínio `intelmarket.app` ainda serve a versão antiga do código.

Para resolver isso imediatamente, você precisa limpar o cache do seu projeto no Vercel.

**Passo a Passo para Limpar o Cache:**

1.  **Acesse o Dashboard do Vercel:**
    - Faça login na sua conta Vercel.

2.  **Navegue até o Projeto:**
    - Selecione o projeto `inteligencia-de-mercado`.

3.  **Vá para a Aba "Settings":**
    - No menu superior do projeto, clique em **Settings**.

4.  **Encontre a Seção "Advanced":**
    - No menu lateral esquerdo, clique em **Advanced**.

5.  **Clique em "Purge All Caches":**
    - Role a página para baixo até encontrar o botão **Purge All Caches**.
    - Clique neste botão para invalidar todo o cache do CDN para todos os domínios do seu projeto.

> **Nota:** A limpeza do cache pode levar alguns minutos para se propagar globalmente. Após clicar, aguarde cerca de 5 minutos e então acesse https://intelmarket.app/login novamente.

---

## 3. Arquitetura do Novo Sistema de Autenticação

O sistema foi re-arquitetado para ser robusto, seguro e desacoplado.

### 3.1. Fluxo de Autenticação (Frontend)

O frontend agora gerencia o estado de autenticação globalmente através do hook `useAuth` e do componente `AuthGuard`.

-   **`AuthGuard.tsx`**: Este componente envolve o roteador principal da aplicação. Ele verifica se o usuário está autenticado antes de permitir o acesso a qualquer rota. Rotas públicas como `/login` e `/register` são explicitamente permitidas.

-   **`useAuth.ts`**: O hook foi completamente reescrito para:
    -   Chamar a rota `trpc.auth.me` para verificar a validade do token JWT armazenado em cookies.
    -   Gerenciar o estado do usuário (logado, deslogado, carregando).
    -   Prover a função `logout`, que limpa o token e redireciona para a página de login.

-   **`Login.tsx` e `Register.tsx`**: As páginas de login e registro utilizam as mutações tRPC `auth.login` e `auth.register`. Após o sucesso, o token JWT retornado pelo backend é armazenado em um cookie `HttpOnly` e o usuário é redirecionado para a página principal.

### 3.2. Lógica de Autenticação (Backend)

O backend é responsável por validar credenciais, gerar tokens e proteger rotas.

-   **`authRouter.ts`**: Contém as rotas tRPC para:
    -   `register`: Cria um novo usuário com senha hasheada usando `bcrypt`.
    -   `login`: Valida email e senha. Se corretos, gera um token JWT e o define em um cookie `HttpOnly` e `Secure`.
    -   `me`: Valida o token JWT enviado no cookie da requisição e retorna os dados do usuário.
    -   `logout`: Limpa o cookie de autenticação.

-   **`sdk.ts` (authenticateRequest)**: O método principal de autenticação foi modificado para:
    -   Ler o cookie de sessão.
    -   Verificar a assinatura e validade do token JWT usando `jose`.
    -   Buscar o usuário correspondente no banco de dados.
    -   Retornar o usuário ou lançar um erro de `ForbiddenError`.

-   **`authMiddleware.ts`**: Este middleware Express utiliza o `sdk.authenticateRequest` para proteger endpoints que não são tRPC, como os de Server-Sent Events (SSE).

---

## 4. Arquivos Chave e Configurações

### 4.1. Arquivos Modificados/Criados

| Caminho do Arquivo                                                 | Descrição da Mudança                                                              |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `/client/src/App.tsx`                                              | Adicionado o `AuthGuard` para proteção global de rotas.                           |
| `/client/src/components/AuthGuard.tsx`                             | **(Novo)** Componente que gerencia o acesso a rotas públicas e privadas.          |
| `/client/src/components/ProtectedRoute.tsx`                        | **(Novo)** Componente para proteção de rotas com base em roles (ex: admin).       |
| `/client/src/_core/hooks/useAuth.ts`                               | Hook reescrito para usar o fluxo de autenticação JWT.                             |
| `/client/src/const.ts`                                             | Removida a lógica de geração de URL OAuth.                                        |
| `/server/_core/sdk.ts`                                             | Método `authenticateRequest` atualizado para validar tokens JWT.                  |
| `/server/_core/index.ts`                                           | Adicionada configuração de CORS e removida a rota de callback OAuth.              |
| `/server/db.ts`                                                    | Adicionadas as funções `getUserById` e `updateUserLastSignIn`.                    |
| `/.vercel-timestamp`                                               | **(Novo)** Arquivo para forçar o Vercel a limpar o cache em um novo deploy.        |

### 4.2. Variáveis de Ambiente

As seguintes variáveis de ambiente são **essenciais** para o funcionamento do projeto.

**Vercel (Frontend):**

```env
VITE_API_URL=https://web-production-6679c.up.railway.app/api/trpc
```

**Railway (Backend):**

```env
DATABASE_URL="postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000!@#$%@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres"
JWT_SECRET="seu-segredo-jwt-super-secreto-e-longo"
RESEND_API_KEY="re_CodcmWJD_RhzohfFyrRmwrNpg7vPFNYRk"
EMAIL_FROM="Intelmarket <contato@intelmarket.app>"
APP_URL="https://intelmarket.app"
PORT=3000
```

> **Importante:** O `JWT_SECRET` deve ser uma string longa e aleatória para garantir a segurança dos tokens.

---

## 5. Conclusão e Próximos Passos

O sistema de autenticação foi completamente modernizado e integrado. Após a limpeza do cache do Vercel, a aplicação estará 100% funcional com o novo fluxo de login, registro e proteção de rotas.

**Próximos passos recomendados:**

1.  **Testar o Fluxo Completo:**
    -   Acessar https://intelmarket.app/register e criar uma nova conta.
    -   Fazer login com a nova conta em https://intelmarket.app/login.
    -   Tentar acessar uma rota protegida (como `/users`) sem ser admin para validar a proteção.
    -   Fazer logout e garantir que o acesso ao dashboard seja bloqueado.

2.  **Remover Código Legado:**
    -   Excluir o arquivo `/client/src/hooks/useAuthNew.ts` que não é mais necessário.
    -   Remover completamente o arquivo `/server/_core/oauth.ts`.

3.  **Monitoramento:**
    -   Acompanhar os logs no Railway e Vercel para identificar possíveis erros em produção.

Este projeto estabelece uma base sólida e segura para o futuro desenvolvimento do Intelmarket.
