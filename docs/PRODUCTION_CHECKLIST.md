# ✅ Checklist de Produção

Este documento contém uma checklist completa para garantir que a aplicação está pronta para produção.

## 📋 Índice

- [Configuração](#configuração)
- [Segurança](#segurança)
- [Performance](#performance)
- [Monitoramento](#monitoramento)
- [Banco de Dados](#banco-de-dados)
- [Testes](#testes)
- [Documentação](#documentação)
- [Deployment](#deployment)

---

## ⚙️ Configuração

### Variáveis de Ambiente
- [ ] Todas as variáveis de ambiente de produção estão configuradas
- [ ] `NODE_ENV` está definido como `production`
- [ ] Secrets estão armazenados de forma segura (não no código)
- [ ] URLs de produção estão corretas (database, APIs, etc.)
- [ ] Chaves de API de produção estão configuradas

### Domínio e DNS
- [ ] Domínio customizado está configurado
- [ ] DNS está apontando corretamente
- [ ] Certificado SSL está ativo e válido
- [ ] Redirecionamento de www para apex (ou vice-versa) está configurado
- [ ] HTTPS está forçado

### Build
- [ ] Build de produção compila sem erros
- [ ] Build de produção compila sem warnings críticos
- [ ] TypeScript type-check passa
- [ ] Linter passa sem erros
- [ ] Bundle size está otimizado (< 200KB first load)

---

## 🔒 Segurança

### Headers
- [ ] Security headers estão configurados (HSTS, CSP, X-Frame-Options, etc.)
- [ ] CORS está configurado corretamente
- [ ] Cookies têm flags `Secure` e `HttpOnly`

### Autenticação
- [ ] Senhas são hasheadas (bcrypt, argon2)
- [ ] MFA está disponível (opcional mas recomendado)
- [ ] Sessions expiram após inatividade
- [ ] Password reset funciona corretamente
- [ ] Rate limiting está implementado em login

### Autorização
- [ ] RBAC está implementado
- [ ] Rotas protegidas verificam permissões
- [ ] API routes verificam autenticação/autorização

### Dados
- [ ] Inputs são validados e sanitizados
- [ ] Queries usam prepared statements (ORM)
- [ ] XSS está prevenido
- [ ] CSRF está prevenido
- [ ] Não há secrets no código

### Dependências
- [ ] Auditoria de dependências foi executada (`npm audit`)
- [ ] Vulnerabilidades críticas foram corrigidas
- [ ] Dependências estão atualizadas
- [ ] Licenças foram verificadas

---

## ⚡ Performance

### Build
- [ ] SWC minification está ativo
- [ ] Tree shaking está funcionando
- [ ] Code splitting está otimizado
- [ ] Bundle analysis foi executado

### Imagens
- [ ] Imagens estão otimizadas (AVIF, WebP)
- [ ] Lazy loading está ativo
- [ ] Responsive images estão configuradas
- [ ] Cache de longo prazo está configurado

### Caching
- [ ] Static pages são cacheadas
- [ ] API responses têm cache headers apropriados
- [ ] CDN está configurado (Vercel Edge Network)
- [ ] Redis está configurado para cache de dados

### Fonts
- [ ] Fonts são otimizadas com `next/font`
- [ ] Fonts são self-hosted (não de CDN externo)

### Scripts
- [ ] Scripts de terceiros usam `next/script` com strategy apropriada
- [ ] Scripts não-essenciais são carregados com `lazyOnload`

### Métricas
- [ ] Lighthouse Performance > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI < 3s

---

## 📊 Monitoramento

### Sentry
- [ ] Sentry DSN de produção está configurado
- [ ] Error tracking está funcionando
- [ ] Performance monitoring está ativo
- [ ] Alertas estão configurados
- [ ] Source maps estão sendo enviadas

### Health Checks
- [ ] `/api/health` retorna status correto
- [ ] `/api/live` funciona (liveness probe)
- [ ] `/api/ready` funciona (readiness probe)
- [ ] Health checks são monitorados

### Logging
- [ ] Logs estruturados estão ativos
- [ ] Logs são enviados para serviço centralizado
- [ ] Logs não contêm informações sensíveis
- [ ] Níveis de log estão configurados corretamente

### Alertas
- [ ] Alertas de erro estão configurados
- [ ] Alertas de performance estão configurados
- [ ] Alertas de downtime estão configurados
- [ ] Canais de notificação estão configurados (email, Slack, etc.)

---

## 💾 Banco de Dados

### Configuração
- [ ] Banco de dados de produção está provisionado
- [ ] Connection pooling está configurado
- [ ] Timeouts estão configurados
- [ ] SSL está ativo para conexões

### Migrações
- [ ] Todas as migrações foram aplicadas
- [ ] Migrações foram testadas
- [ ] Rollback plan existe

### Backups
- [ ] Backups automáticos estão configurados
- [ ] Backup retention policy está definida
- [ ] Restore procedure foi testada
- [ ] Backups são armazenados em região diferente

### Performance
- [ ] Índices estão otimizados
- [ ] Queries lentas foram identificadas e otimizadas
- [ ] Query monitoring está ativo

---

## 🧪 Testes

### Unit Tests
- [ ] Todos os testes unitários passam
- [ ] Cobertura atinge thresholds (70%+)
- [ ] Testes são executados no CI

### Integration Tests
- [ ] Testes de integração passam
- [ ] APIs são testadas
- [ ] Banco de dados é testado

### E2E Tests
- [ ] Testes E2E passam
- [ ] Fluxos críticos são testados
- [ ] Testes são executados no CI

### Manual Testing
- [ ] Fluxos principais foram testados manualmente
- [ ] Responsividade foi testada em diferentes dispositivos
- [ ] Compatibilidade com navegadores foi testada
- [ ] Acessibilidade foi testada

---

## 📚 Documentação

### Código
- [ ] Código está documentado (JSDoc)
- [ ] Componentes complexos têm comentários
- [ ] APIs têm documentação

### Projeto
- [ ] README está completo
- [ ] Guia de arquitetura existe
- [ ] Guia de deployment existe
- [ ] Guia de contribuição existe

### Operacional
- [ ] Runbooks para incidentes comuns
- [ ] Procedimentos de rollback
- [ ] Contatos de emergência
- [ ] SLAs documentados

---

## 🚀 Deployment

### CI/CD
- [ ] Pipeline de CI está configurado
- [ ] Pipeline de CD está configurado
- [ ] Testes são executados automaticamente
- [ ] Deploy automático funciona

### Vercel (ou outro provedor)
- [ ] Projeto está configurado
- [ ] Domínio está conectado
- [ ] Environment variables estão configuradas
- [ ] Preview deployments funcionam

### Rollback
- [ ] Procedimento de rollback está documentado
- [ ] Rollback foi testado
- [ ] Versões anteriores são mantidas

### Monitoring
- [ ] Uptime monitoring está ativo
- [ ] Performance monitoring está ativo
- [ ] Error tracking está ativo
- [ ] Alertas estão funcionando

---

## 🎯 Pós-Deploy

### Validação
- [ ] Aplicação está acessível
- [ ] Login funciona
- [ ] Fluxos principais funcionam
- [ ] APIs respondem corretamente
- [ ] Não há erros no Sentry

### Performance
- [ ] Lighthouse audit foi executado
- [ ] Core Web Vitals estão dentro dos limites
- [ ] Tempo de resposta está aceitável

### Monitoramento
- [ ] Logs estão sendo coletados
- [ ] Métricas estão sendo coletadas
- [ ] Alertas estão funcionando
- [ ] Dashboard de monitoramento está acessível

### Comunicação
- [ ] Stakeholders foram notificados
- [ ] Documentação de release foi criada
- [ ] Changelog foi atualizado
- [ ] Usuários foram notificados (se necessário)

---

## 📞 Contatos de Emergência

- **DevOps:** devops@intelmarket.com.br
- **Backend:** backend@intelmarket.com.br
- **Frontend:** frontend@intelmarket.com.br
- **Suporte:** suporte@intelmarket.com.br

---

## 📝 Notas

- Esta checklist deve ser revisada antes de cada deploy de produção.
- Itens marcados como críticos não podem ser ignorados.
- Documente qualquer desvio da checklist.
- Atualize a checklist conforme o projeto evolui.

---

**Data da última revisão:** 24 de Novembro de 2024  
**Versão:** 1.0.0
