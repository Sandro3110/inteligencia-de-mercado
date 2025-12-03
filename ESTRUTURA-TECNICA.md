# 📊 ESTRUTURA TÉCNICA DO PROJETO INTELMARKET

**Projeto:** Inteligência de Mercado com IA  
**Stack:** React 19 + Node.js + PostgreSQL + OpenAI  
**Deploy:** Vercel (Frontend + Serverless Functions)  
**Banco:** Supabase (PostgreSQL)  

---

## 🏗️ ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │ Components │  │   Hooks    │        │
│  │  (Routes)  │  │    (UI)    │  │ (Logic)    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│         │                │                │              │
│         └────────────────┴────────────────┘              │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Vercel Serverless)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    API     │  │     IA     │  │  Security  │        │
│  │ Endpoints  │  │  Services  │  │ Middleware │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│         │                │                │              │
│         └────────────────┴────────────────┘              │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Entities  │  │  IA Data   │  │   Audit    │        │
│  │  (Core)    │  │  (Cache)   │  │   Logs     │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  OpenAI    │  │  BrasilAPI │  │   GitHub   │        │
│  │  GPT-4o    │  │   (CNPJ)   │  │   (Auth)   │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DE DIRETÓRIOS

### **ROOT**
```
inteligencia-de-mercado/
├── api/                    # Backend (Serverless Functions)
├── client/                 # Frontend (React 19)
├── database/               # SQL Schemas & Migrations
├── docs/                   # Documentação técnica
├── drizzle/                # ORM Migrations (Drizzle Kit)
├── package.json            # Dependencies
├── pnpm-lock.yaml          # Lock file
├── tsconfig.json           # TypeScript config
├── vercel.json             # Vercel deployment config
└── vite.config.ts          # Vite build config
```

---

## 🎨 FRONTEND (`/client`)

### **Estrutura:**
```
client/
├── public/                 # Static assets
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/         # UI Components
│   │   ├── ui/            # shadcn/ui primitives
│   │   ├── security/      # Security dashboard components
│   │   ├── audit/         # Audit log components
│   │   ├── reports/       # Report components
│   │   ├── Layout.tsx     # Main layout with sidebar
│   │   ├── TourGuide.tsx  # Onboarding tours
│   │   ├── FunnelInput.tsx
│   │   ├── FunnelOutput.tsx
│   │   └── EnrichmentProgressModal.tsx
│   ├── contexts/          # React Contexts
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom Hooks
│   │   ├── useFeedback.ts      # Global feedback system
│   │   ├── useSecurityAlerts.ts
│   │   ├── useAuditLogs.ts
│   │   ├── useRateLimits.ts
│   │   └── useBlockedUsers.ts
│   ├── lib/               # Utilities
│   │   └── utils.ts
│   ├── pages/             # Route Pages
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProjetosPage.tsx
│   │   ├── PesquisasPage.tsx
│   │   ├── EntidadesPage.tsx
│   │   ├── ImportacaoPage.tsx
│   │   ├── EnriquecimentoPage.tsx
│   │   ├── ProcessamentoIA.tsx
│   │   ├── CuboExplorador.tsx
│   │   ├── AnaliseTemporal.tsx
│   │   ├── AnaliseGeografica.tsx
│   │   ├── AnaliseMercado.tsx
│   │   ├── GestaoUsuarios.tsx
│   │   └── GestaoIA.tsx
│   ├── schemas/           # Validation schemas
│   ├── test/              # Tests
│   ├── App.tsx            # Root component & routes
│   ├── index.css          # Global styles (Tailwind)
│   └── main.tsx           # Entry point
└── index.html             # HTML template
```

### **Tecnologias Frontend:**
- **React 19** - UI framework
- **Wouter** - Client-side routing
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library (Radix UI)
- **Vite 6** - Build tool
- **TypeScript 5** - Type safety
- **Driver.js** - Onboarding tours
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **Lucide React** - Icons

---

## ⚙️ BACKEND (`/api`)

### **Estrutura:**
```
api/
├── lib/                    # Shared libraries
│   ├── cache.js           # Cache management (30 days TTL)
│   ├── cnpj-enricher.js   # CNPJ validation & enrichment
│   ├── security.js        # Auth + Rate limiting + Audit
│   └── validacao.js       # Data validation (CNPJ, email, phone)
├── [ENDPOINTS]            # Serverless functions
│   ├── login.js           # Authentication
│   ├── usuarios.js        # User management
│   ├── projetos.js        # Projects CRUD
│   ├── pesquisas.js       # Research CRUD
│   ├── entidades.js       # Entities CRUD
│   ├── upload.js          # File upload (CSV/Excel)
│   ├── ia-enriquecer.js   # AI enrichment (single)
│   ├── ia-enriquecer-completo.js  # AI enrichment (full)
│   ├── ia-enriquecer-batch.js     # AI enrichment (batch)
│   ├── ia-gerar-concorrentes.js   # Generate competitors
│   ├── ia-gerar-leads.js          # Generate leads
│   ├── ia-job-status.js           # Job status tracking
│   ├── ia-stats.js        # IA usage statistics
│   ├── audit-logs.js      # Audit logs query
│   ├── alertas-seguranca.js       # Security alerts
│   ├── usuarios-bloqueados.js     # Blocked users management
│   ├── rate-limits.js     # Rate limits query
│   ├── exportar-relatorio.js      # Export reports (CSV)
│   └── detectar-duplicados.js     # Duplicate detection
└── [MIGRATIONS]           # Database migrations
    ├── migrate-cache.js
    ├── migrate-jobs.js
    ├── migrate-produtos.js
    ├── migrate-qualidade.js
    ├── migrate-seguranca.js
    └── migrate-sentimento.js
```

### **Tecnologias Backend:**
- **Node.js 22** - Runtime
- **Vercel Serverless** - Deployment
- **PostgreSQL** (via `postgres` lib) - Database client
- **OpenAI GPT-4o-mini** - AI enrichment
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **ExcelJS** - Excel processing
- **PapaParse** - CSV parsing

---

## 🗄️ DATABASE (`/database`)

### **Tabelas Principais:**

#### **1. CORE (Entidades)**
```sql
-- Dimensões
dim_cliente          # Clientes/empresas
dim_mercado          # Mercados e segmentos
dim_produto          # Produtos e serviços
dim_concorrente      # Concorrentes
dim_lead             # Leads potenciais
dim_projeto          # Projetos
dim_pesquisa         # Pesquisas

-- Fatos
fato_interacao       # Interações
```

#### **2. IA & CACHE**
```sql
ia_usage             # Uso de IA (tokens, custos)
ia_jobs              # Jobs de enriquecimento (progresso)
ia_cache             # Cache de resultados (30 dias)
```

#### **3. SEGURANÇA & AUDITORIA**
```sql
audit_logs           # Logs de auditoria
rate_limits          # Rate limiting por usuário
usuarios_bloqueados  # Usuários bloqueados temporariamente
alertas_seguranca    # Alertas de segurança
```

#### **4. AUTENTICAÇÃO**
```sql
usuarios             # Usuários do sistema
roles                # Roles (admin, user)
permissoes           # Permissões granulares
```

### **Índices Otimizados:**
- `idx_cliente_cnpj` - Busca por CNPJ
- `idx_score_qualidade_dados` - Ordenação por qualidade
- `idx_validacao_cnpj` - Filtro de CNPJs válidos
- `idx_cache_key` - Lookup de cache
- `idx_audit_logs_user_id` - Logs por usuário
- `idx_rate_limits_user_endpoint` - Rate limiting

---

## 🔐 SEGURANÇA

### **Middleware de Segurança (`/api/lib/security.js`)**

```javascript
verificarSeguranca(req, client, opcoes)
  ├─ verificarAuth(req)              // JWT validation
  ├─ verificarBloqueio(userId)       // Check if blocked
  ├─ verificarRateLimit(userId, endpoint)  // Rate limiting
  └─ detectarAbuso(userId)           // Abuse detection
```

**Funcionalidades:**
- ✅ Autenticação JWT
- ✅ Rate Limiting (10 req/min por padrão)
- ✅ Detecção de abuso (30 req/5min = bloqueio)
- ✅ Bloqueios temporários (5 minutos)
- ✅ Logs de auditoria (100%)
- ✅ Alertas de segurança

**Endpoints Protegidos:**
- `/api/ia-enriquecer` (10/min)
- `/api/ia-enriquecer-completo` (5/min)
- `/api/ia-enriquecer-batch` (3/min)
- `/api/ia-gerar-concorrentes` (5/min)
- `/api/ia-gerar-leads` (5/min)

---

## 🤖 INTELIGÊNCIA ARTIFICIAL

### **Fluxo de Enriquecimento:**

```
1. ENTRADA
   ↓
2. CACHE CHECK (ia_cache)
   ├─ HIT → Retorna cached (0.1s, $0)
   └─ MISS → Continua
   ↓
3. VALIDAÇÃO (validacao.js)
   ├─ CNPJ válido?
   ├─ Email válido?
   └─ Telefone válido?
   ↓
4. ENRIQUECIMENTO IA (OpenAI GPT-4o-mini)
   ├─ Cliente (4s, $0.0002)
   ├─ Mercado (5s, $0.0002)
   ├─ Produtos (6s, $0.0003)
   ├─ Concorrentes (7s, $0.0003)
   └─ Leads (8s, $0.0002)
   ↓
5. VALIDAÇÃO PÓS-IA
   ├─ Normalizar CNPJ
   ├─ Normalizar telefone
   ├─ Validar email
   └─ Calcular score de qualidade
   ↓
6. PERSISTÊNCIA
   ├─ Salvar no banco
   ├─ Salvar no cache (30 dias)
   └─ Registrar uso (ia_usage)
   ↓
7. AUDITORIA
   └─ Log de sucesso/erro (audit_logs)
```

### **Custos de IA:**
| Operação | Tokens | Custo | Tempo |
|----------|--------|-------|-------|
| Enriquecimento básico | ~1.200 | $0.0004 | 15s |
| Enriquecimento completo | ~3.000 | $0.0012 | 30s |
| Batch (10 empresas) | ~12.000 | $0.012 | 60s |

**Taxa de cache hit:** ~40%  
**Economia mensal:** ~R$ 0,15  

---

## 📊 QUALIDADE DE DADOS

### **Score de Qualidade (0-100)**

```javascript
PESOS:
- Nome: 10 pontos
- CNPJ válido: 15 pontos ⭐
- Email válido: 10 pontos
- Telefone válido: 10 pontos
- Site: 10 pontos
- Cidade: 5 pontos
- UF: 5 pontos
- Porte: 5 pontos
- Setor: 10 pontos
- Produto principal: 10 pontos
- Segmentação: 5 pontos
- Enriquecido: 5 pontos
```

**Trigger automático:**
```sql
CREATE TRIGGER atualizar_score_qualidade
AFTER INSERT OR UPDATE ON dim_cliente
FOR EACH ROW
EXECUTE FUNCTION calcular_score_qualidade();
```

---

## 🎯 PERFORMANCE

### **Otimizações Implementadas:**

1. **Cache Inteligente (30 dias)**
   - Hit rate: ~40%
   - Redução de custo: 40%
   - Tempo de resposta: 20s → 0.1s

2. **Batch Processing**
   - Lotes de 3 paralelos
   - Pausa de 1s entre lotes
   - 10 empresas: 200s → 60s (-70%)

3. **Validações Otimizadas**
   - CNPJ: dígitos verificadores
   - Email: regex + domínios válidos
   - Telefone: normalização automática

4. **Índices de Banco**
   - 15+ índices estratégicos
   - Queries < 100ms

5. **Lazy Loading**
   - Driver.js importado dinamicamente
   - Reduz bundle inicial

---

## 🚀 DEPLOY

### **Vercel Configuration (`vercel.json`)**

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "OPENAI_API_KEY": "@openai_api_key",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### **Ambiente:**
- **Frontend:** Vercel Edge Network (CDN global)
- **Backend:** Vercel Serverless Functions (AWS Lambda)
- **Banco:** Supabase (PostgreSQL)
- **Região:** Washington D.C. (iad1)

---

## 📈 MÉTRICAS

### **Tamanho do Projeto:**
- **Commits:** 30+
- **Arquivos:** 100+
- **Linhas de código:** 10.000+
- **Endpoints:** 35+
- **Tabelas:** 20+
- **Componentes React:** 50+
- **Hooks customizados:** 10+

### **Performance:**
- **Build time:** ~30s
- **Bundle size:** ~500KB (gzipped)
- **Time to Interactive:** <3s
- **Lighthouse Score:** 90+

---

## 🔧 COMANDOS ÚTEIS

```bash
# Desenvolvimento
pnpm install          # Instalar dependências
pnpm dev              # Rodar dev server (frontend + backend)
pnpm build            # Build para produção
pnpm preview          # Preview do build

# Database
pnpm db:push          # Aplicar migrations (Drizzle)
pnpm db:studio        # Abrir Drizzle Studio

# Deploy
git push origin main  # Auto-deploy no Vercel

# Testes
pnpm test             # Rodar testes (Vitest)
pnpm test:ui          # Rodar testes com UI
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- `MELHORIAS-IMPLEMENTADAS.md` - Melhorias de performance
- `MIDDLEWARE-SEGURANCA.md` - Documentação de segurança
- `IMPLEMENTACAO-FINAL.md` - Resumo da implementação
- `PENDENCIAS.md` - Pendências e próximos passos
- `docs/DETALHAMENTO_API_IA.md` - Detalhes da API de IA
- `docs/DETALHAMENTO_CACHE_REDIS.md` - Sistema de cache
- `docs/DETALHAMENTO_NOTIFICACOES_TEMPO_REAL.md` - Notificações
- `docs/DETALHAMENTO_TESTES_AUTOMATIZADOS.md` - Testes

---

**Última atualização:** 03/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ Produção
