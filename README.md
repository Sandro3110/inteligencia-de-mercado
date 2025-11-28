<div align="center">
  <a href="https://www.intelmarket.com.br" target="_blank">
    <img src="https://www.intelmarket.com.br/wp-content/uploads/2022/07/logo-intel-market.svg" alt="Intelmarket Logo" width="300" />
  </a>

  <h1 align="center">IntelMarket v2.0 - Simplificado</h1>

  <p align="center">
    Plataforma de Inteligência de Mercado para prospecção B2B com IA
    <br />
    <strong>Versão 2.0 - Refatorada e Otimizada</strong>
    <br />
    <br />
    <a href="#funcionalidades">Funcionalidades</a>
    ·
    <a href="#começando">Começar</a>
    ·
    <a href="./DEPLOY.md">Deploy</a>
  </p>
</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Novidades v2.0](#novidades-v20)
- [Funcionalidades](#funcionalidades)
- [Tech Stack](#tech-stack)
- [Começando](#começando)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)

---

## 🚀 Sobre o Projeto

O **IntelMarket** é uma plataforma SaaS de Inteligência de Mercado que ajuda empresas a encontrar, analisar e enriquecer dados de clientes B2B usando **Inteligência Artificial**.

A versão 2.0 foi **completamente refatorada** com foco em:

- ✅ **Simplicidade**: 80% menos código, 5 páginas principais
- ✅ **Performance**: Queries otimizadas, loading states
- ✅ **IA Funcional**: Bug crítico do enriquecimento corrigido
- ✅ **UX Moderna**: Sidebar recolhível, mobile-first
- ✅ **100% Dados Reais**: Zero placeholders

---

## ✨ Novidades v2.0

### 🎯 Simplificação Radical

- **Menu**: 15+ itens → 5 itens essenciais
- **Código**: -38% de linhas (redução de ~5.000 linhas)
- **Routers**: 23 → 9 routers TRPC
- **Páginas**: Apenas funcionalidades core

### 🔧 Funcionalidades Core

1. **📊 Dashboard**
   - KPIs globais e por projeto
   - Drill down (projetos → pesquisas)
   - Cards de projeto com ações

2. **📁 Projetos**
   - CRUD completo
   - Upload CSV
   - Gestão de pesquisas

3. **🗺️ Mapa Geográfico** (NOVO!)
   - Visualização de clientes, leads e concorrentes
   - 3 modos: Marcadores, Clusters, Heatmap
   - Filtros avançados
   - Cards detalhados

4. **🤖 Enriquecimento IA** (CORRIGIDO!)
   - Processamento em background
   - Progresso em tempo real
   - Busca API key do banco (fix crítico)
   - Logs ao vivo

5. **📊 Resultados**
   - Tabs (clientes/leads/concorrentes/mercados)
   - Filtros e paginação
   - Exportação CSV

6. **👥 Usuários**
   - Aprovação de novos usuários
   - Gerenciamento de roles

7. **⚙️ Configurações**
   - API keys (OpenAI, Gemini, Anthropic)
   - Teste de conexão

### 🎨 UI/UX Moderna

- **Sidebar Recolhível**: 256px → 64px (+30% espaço)
- **Header Consolidado**: Breadcrumbs inline
- **Mobile-First**: Overlay, backdrop, responsivo
- **Loading Skeletons**: Percepção de velocidade
- **Tooltips**: Acessibilidade

---

## 🛠️ Tech Stack

### Frontend:

- **Next.js 15** - App Router, Server Components
- **React 19** - Hooks, Context API
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

### Backend:

- **TRPC** - Type-safe API
- **Drizzle ORM** - Database queries
- **Supabase** - PostgreSQL + Auth
- **Zod** - Validação de schemas

### IA:

- **OpenAI GPT-4** - Enriquecimento de dados
- **Gemini** (opcional)
- **Anthropic Claude** (opcional)

### Mapas:

- **Leaflet** - Mapas interativos
- **React-Leaflet** - Wrapper React
- **Leaflet.markercluster** - Clustering
- **Leaflet.heat** - Heatmap

### DevOps:

- **Vercel** - Hosting e CI/CD
- **GitHub Actions** - Testes automatizados
- **ESLint + Prettier** - Code quality
- **Husky** - Git hooks

---

## 🚀 Começando

### Pré-requisitos

```bash
Node.js 22.x
pnpm 10.x
```

### Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/Sandro3110/inteligencia-de-mercado.git
   cd inteligencia-de-mercado
   ```

2. **Instale as dependências**

   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   Edite `.env.local` com suas credenciais:
   - Supabase (URL, anon key, service role key)
   - OpenAI API key (obrigatória)
   - Gemini/Anthropic (opcional)

4. **Execute o projeto**

   ```bash
   pnpm dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

### Primeiro Acesso

1. Faça login com suas credenciais Supabase
2. Configure API keys em **Configurações > IA**
3. Crie seu primeiro projeto
4. Faça upload de um CSV de clientes
5. Execute o enriquecimento IA
6. Visualize resultados e exporte

---

## 🚀 Deploy

Para fazer deploy em produção, consulte o guia completo:

**[📖 Guia de Deploy](./DEPLOY.md)**

### Deploy Rápido no Vercel

```bash
# 1. Push para GitHub
git push origin feature/simplificacao-completa

# 2. Importe no Vercel
# https://vercel.com/new

# 3. Configure variáveis de ambiente
# Settings > Environment Variables

# 4. Deploy!
```

---

## 📁 Estrutura do Projeto

```
inteligencia-de-mercado/
├── app/                      # Next.js App Router
│   ├── (app)/               # Rotas autenticadas
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── projects/        # Gestão de projetos
│   │   ├── map/             # Mapa geográfico
│   │   ├── users/           # Gestão de usuários
│   │   └── settings/        # Configurações
│   └── api/                 # API Routes
│       └── enrichment/      # Processamento IA
├── components/              # Componentes React
│   ├── dashboard/           # Componentes do dashboard
│   ├── projects/            # Componentes de projetos
│   ├── map/                 # Componentes do mapa
│   ├── results/             # Componentes de resultados
│   ├── ui/                  # Componentes base (shadcn)
│   └── skeletons/           # Loading skeletons
├── server/                  # Backend TRPC
│   ├── routers/             # Routers TRPC
│   │   ├── dashboard.ts     # Dashboard queries
│   │   ├── projects.ts      # Projetos CRUD
│   │   ├── pesquisas.ts     # Pesquisas CRUD
│   │   ├── enrichment.ts    # Enriquecimento IA
│   │   ├── results.ts       # Resultados consolidados
│   │   ├── export.ts        # Exportação CSV
│   │   ├── map.ts           # Dados geográficos
│   │   ├── usersRouter.ts   # Usuários
│   │   └── settings.ts      # Configurações
│   └── integrations/        # Integrações externas
│       └── openaiOptimized.ts # OpenAI client
├── lib/                     # Utilitários
│   ├── contexts/            # React contexts
│   │   ├── AppContext.tsx   # Estado global
│   │   └── SidebarContext.tsx # Sidebar state
│   └── supabase/            # Supabase client
├── drizzle/                 # Database schema
│   └── schema.ts            # Tabelas e relações
└── public/                  # Assets estáticos
```

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em watch mode
pnpm test:watch

# Executar testes de cobertura
pnpm test:coverage
```

**Status atual**: ✅ 196 testes passando

---

## 📊 Qualidade de Código

```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check

# Build
pnpm build
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é proprietário e confidencial.

---

## 📞 Contato

**IntelMarket**

- Website: [www.intelmarket.com.br](https://www.intelmarket.com.br)
- Email: contato@intelmarket.com.br

---

## 🎉 Agradecimentos

- Next.js team
- Vercel
- Supabase
- OpenAI
- Comunidade open-source

---

<div align="center">
  <strong>IntelMarket v2.0</strong> - Simplificado e Poderoso
  <br />
  Feito com ❤️ para revolucionar a prospecção B2B
</div>
