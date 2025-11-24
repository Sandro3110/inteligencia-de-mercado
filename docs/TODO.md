# TODO List

Este arquivo consolida todos os TODOs, FIXMEs e melhorias identificadas no projeto.

## 🔴 Alta Prioridade

### Testes

- [ ] Aumentar cobertura de testes de componentes de 2.4% para 70%+
- [ ] Criar testes para componentes críticos:
  - [ ] AppSidebar
  - [ ] DetailPopup
  - [ ] FileUploadParser
  - [ ] MapView
  - [ ] ProjectsList

### Migração xlsx → exceljs

- [ ] Migrar `server/renderers/ExcelRenderer.ts`
- [ ] Migrar `server/services/export/renderers/ExcelRenderer.ts`
- [ ] Migrar `server/services/spreadsheetParser.ts`
- [ ] Migrar `server/exportToExcel.ts`
- [ ] Migrar `components/research-wizard/FileUploadZone.tsx`
- [ ] Migrar `components/FileUploadParser.tsx`
- [ ] Testar migração com arquivos reais

### Code Quality

- [ ] Remover 320 `console.log` do código (substituir por logger)
- [ ] Substituir 29 tipos `any` por tipos específicos
- [ ] Resolver 77 TODOs/FIXMEs espalhados no código

## 🟡 Média Prioridade

### Segurança

- [ ] Atualizar drizzle-kit para resolver 4 vulnerabilidades moderadas
- [ ] Implementar rate limiting em todas as rotas públicas
- [ ] Adicionar CSRF protection em forms

### Performance

- [ ] Implementar code splitting mais agressivo
- [ ] Otimizar bundle size (atualmente 40MB)
- [ ] Implementar lazy loading para componentes pesados
- [ ] Adicionar service worker para PWA

### Documentação

- [ ] Adicionar JSDoc para funções públicas
- [ ] Criar guia de contribuição (CONTRIBUTING.md)
- [ ] Documentar arquitetura de cada módulo
- [ ] Criar diagramas de fluxo

## 🟢 Baixa Prioridade

### Features

- [ ] Implementar feature flags system
- [ ] Adicionar internacionalização (i18n)
- [ ] Implementar dark mode
- [ ] Adicionar offline support (PWA)

### Developer Experience

- [ ] Configurar Storybook para componentes
- [ ] Adicionar pre-push hook com testes
- [ ] Configurar VS Code workspace settings
- [ ] Criar snippets para componentes comuns

### Monitoring

- [ ] Configurar alertas no Sentry
- [ ] Implementar custom dashboards
- [ ] Adicionar user session replay
- [ ] Configurar performance budgets

## 📝 Notas

- TODOs devem ser criados como issues no GitHub
- Prioridade pode mudar baseado em feedback
- Revisar esta lista mensalmente

---

**Última atualização:** 24 de Novembro de 2024
