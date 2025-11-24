# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Em Desenvolvimento
- Finalização da refatoração completa
- Preparação para produção

## [3.5.0] - 2024-11-24

### Adicionado
- **Infraestrutura e Testes (Fase C - 100%)**
  - 121 testes unitários e de integração com Jest e React Testing Library
  - 36 testes E2E com Playwright
  - Integração completa com Sentry (client, server, edge)
  - Health checks (`/api/health`, `/api/live`, `/api/ready`)
  - Sistema de logging estruturado em JSON
  - Sistema de métricas customizadas (business, performance, system, user)
  - Sistema de alertas automáticos com thresholds
  - Endpoint de métricas (`/api/metrics`)
  - Error boundary integrado com Sentry

- **Documentação (Fase D - 10%)**
  - README.md completo com guias e badges
  - Guia de arquitetura com diagramas
  - Guia de deployment (Vercel e Docker)
  - Guia de performance
  - Guia de segurança
  - Checklist de produção

- **Performance (Fase D - 15%)**
  - SWC minification
  - Otimização de imagens (AVIF, WebP)
  - Responsive images
  - Cache de longo prazo (1 ano)
  - Bundle compression
  - ETags generation

- **Segurança (Fase D - 20%)**
  - Security headers (HSTS, CSP, X-Frame-Options, etc.)
  - Auditoria de dependências
  - Guia de segurança completo
  - Checklist de segurança

### Modificado
- Configuração do Next.js otimizada para produção
- Middleware de logging com métricas e alertas
- Error boundary com integração Sentry

### Corrigido
- Problemas de TypeScript com JSX
- Imports de componentes
- Health checks com async database

## [3.0.0] - 2024-11-23

### Adicionado
- **Frontend (Fase A - 100%)**
  - Refatoração completa de componentes para Shadcn/UI
  - Sistema de design consistente
  - Componentes reutilizáveis e tipados
  - Hooks customizados

- **Backend (Fase B - 100%)**
  - Migração para Drizzle ORM
  - tRPC para type-safe APIs
  - Supabase Auth integration
  - API routes refatoradas

- **Infraestrutura (Fase C - Início)**
  - Docker e Docker Compose
  - GitHub Actions CI/CD
  - Configuração de ambiente

### Modificado
- Estrutura de diretórios reorganizada
- Configuração do TypeScript otimizada
- Configuração do Next.js atualizada

## [2.0.0] - 2024-11-20

### Adicionado
- Migração inicial para Next.js 14
- App Router
- React Server Components
- TypeScript strict mode

### Modificado
- Estrutura de rotas para App Router
- Componentes para Server/Client Components

## [1.0.0] - 2024-11-15

### Adicionado
- Versão inicial do projeto
- Next.js 13 com Pages Router
- Componentes básicos
- Integração com banco de dados

---

## Tipos de Mudanças

- **Adicionado** - para novas funcionalidades
- **Modificado** - para mudanças em funcionalidades existentes
- **Depreciado** - para funcionalidades que serão removidas
- **Removido** - para funcionalidades removidas
- **Corrigido** - para correções de bugs
- **Segurança** - para vulnerabilidades corrigidas

---

## Links

- [Unreleased]: https://github.com/Sandro3110/inteligencia-de-mercado/compare/v3.5.0...HEAD
- [3.5.0]: https://github.com/Sandro3110/inteligencia-de-mercado/compare/v3.0.0...v3.5.0
- [3.0.0]: https://github.com/Sandro3110/inteligencia-de-mercado/compare/v2.0.0...v3.0.0
- [2.0.0]: https://github.com/Sandro3110/inteligencia-de-mercado/compare/v1.0.0...v2.0.0
- [1.0.0]: https://github.com/Sandro3110/inteligencia-de-mercado/releases/tag/v1.0.0
