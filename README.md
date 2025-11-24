<div align="center">
  <a href="https://www.intelmarket.com.br" target="_blank">
    <img src="https://www.intelmarket.com.br/wp-content/uploads/2022/07/logo-intel-market.svg" alt="Intelmarket Logo" width="300" />
  </a>

  <h1 align="center">Intelmarket Next.js</h1>

  <p align="center">
    Plataforma de Inteligência de Mercado para prospecção B2B e análise de dados
    <br />
    <a href="https://www.intelmarket.com.br/solucao/"><strong>Explore a solução »</strong></a>
    <br />
    <br />
    <a href="#">Ver Demo</a>
    ·
    <a href="#">Reportar Bug</a>
    ·
    <a href="#">Solicitar Feature</a>
  </p>
</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tech Stack](#tech-stack)
- [Começando](#começando)
- [Uso](#uso)
- [Testes](#testes)
- [Monitoramento](#monitoramento)
- [CI/CD](#cicd)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Contato](#contato)

---

## 🚀 Sobre o Projeto

O **Intelmarket Next.js** é uma plataforma SaaS de Inteligência de Mercado que ajuda empresas a encontrar e analisar clientes B2B. A plataforma oferece ferramentas para prospecção, enriquecimento de dados, análise de mercado e gestão de leads.

**Principais Funcionalidades:**
- **Prospecção Inteligente:** Encontre empresas com base em filtros avançados (localização, setor, porte, etc.).
- **Enriquecimento de Dados:** Obtenha informações detalhadas sobre empresas, como contatos, faturamento e tecnologias utilizadas.
- **Análise de Mercado:** Visualize dados de mercado em mapas interativos e dashboards.
- **Gestão de Leads:** Organize e exporte listas de leads para seu CRM.
- **API de Dados:** Integre dados do Intelmarket em suas próprias aplicações.

Este repositório contém o código-fonte completo da aplicação, refatorado para alta performance, escalabilidade e manutenibilidade.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **Estado:** [React Query](https://tanstack.com/query/latest), [Zustand](https://zustand-demo.pmnd.rs/)
- **Formulários:** [React Hook Form](https://react-hook-form.com/)
- **Validação:** [Zod](https://zod.dev/)

### Backend
- **Framework:** [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **API:** [tRPC](https://trpc.io/)
- **Autenticação:** [Supabase Auth](https://supabase.com/docs/guides/auth)

### Infraestrutura
- **Containerization:** [Docker](https://www.docker.com/)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)
- **Hosting:** [Vercel](https://vercel.com/)
- **Monitoramento:** [Sentry](https://sentry.io/)
- **Banco de Dados:** [Supabase](https://supabase.com/)
- **Cache:** [Redis](https://redis.io/)

---

## 🏁 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (v18+)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Sandro3110/inteligencia-de-mercado.git
   cd inteligencia-de-mercado
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env.local`
   - Preencha as variáveis (Supabase, Sentry, etc.)

4. **Inicie os containers Docker:**
   ```bash
   docker-compose up -d
   ```

5. **Execute as migrações do banco de dados:**
   ```bash
   npm run db:push
   ```

6. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

7. **Acesse a aplicação:**
   - Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🚀 Uso

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila a aplicação para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica os tipos do TypeScript

### Banco de Dados

- `npm run db:generate` - Gera migrações do Drizzle
- `npm run db:push` - Aplica migrações no banco de dados
- `npm run db:studio` - Abre o Drizzle Studio

---

## 🧪 Testes

O projeto possui uma suíte de testes completa para garantir a qualidade do código.

### Tipos de Testes

- **Unitários e de Componentes:** Jest + React Testing Library
- **Integração:** Jest
- **End-to-End (E2E):** Playwright

### Executando Testes

- **Todos os testes unitários/integração:**
  ```bash
  npm test
  ```

- **Testes em modo watch:**
  ```bash
  npm run test:watch
  ```

- **Cobertura de testes:**
  ```bash
  npm run test:coverage
  ```

- **Testes E2E:**
  ```bash
  npm run test:e2e
  ```

- **Testes E2E com UI:**
  ```bash
  npm run test:e2e:ui
  ```

Para mais detalhes, consulte a [documentação de testes](./docs/TESTING_AND_MONITORING.md).

---

## 📊 Monitoramento

O sistema de monitoramento garante a saúde e performance da aplicação.

### Ferramentas

- **Sentry:** Error tracking e performance monitoring
- **Health Checks:** Endpoints para liveness e readiness
- **Logging:** Logs estruturados em JSON
- **Métricas:** Métricas customizadas de negócio e sistema

### Endpoints

- `/api/health` - Status completo da aplicação
- `/api/live` - Liveness probe
- `/api/ready` - Readiness probe
- `/api/metrics` - Métricas customizadas

Para mais detalhes, consulte a [documentação de monitoramento](./docs/MONITORING_DASHBOARD.md).

---

## 🔄 CI/CD

O projeto utiliza **GitHub Actions** para integração e deployment contínuo.

### Workflows

- **CI:** Executa testes, lint e build a cada push/pull request.
- **CD:** Faz deploy para Vercel a cada merge na branch `main`.

**Arquivo de configuração:** `.github/workflows/ci.yml`

---

## 📚 Documentação

- [**Arquitetura**](./docs/ARCHITECTURE.md) - Visão geral da arquitetura do sistema.
- [**Testes e Monitoramento**](./docs/TESTING_AND_MONITORING.md) - Guia completo de testes e monitoramento.
- [**Dashboard de Monitoramento**](./docs/MONITORING_DASHBOARD.md) - Como usar o dashboard e métricas.
- [**Deployment**](./docs/DEPLOYMENT.md) - Instruções para deploy.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma nova branch (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'feat: Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 📞 Contato

Sandro - [@sandro_30](https://twitter.com/sandro_30) - sandro.tres@gmail.com

Link do Projeto: [https://github.com/Sandro3110/inteligencia-de-mercado](https://github.com/Sandro3110/inteligencia-de-mercado)
