# Gestor PAV - TODO

## Fase 22: Refatoração Completa - Hierarquia PROJECT → PESQUISA → DADOS 🏗️

### 22.1 Correção Imediata
- [x] Verificar nomes reais dos 3 projetos no banco
- [x] Corrigir getDashboardStats para retornar dados corretos
- [x] Testar estatísticas na página inicial
- [x] Validar seletor de projetos

### 22.2 Funções de Banco (db.ts)
- [x] Criar getPesquisas() - listar pesquisas
- [x] Criar getPesquisaById(id) - buscar pesquisa específica
- [x] Criar getPesquisasByProject(projectId) - pesquisas de um projeto
- [x] Manter getDashboardStats(projectId) funcionando
- [x] Criar getDashboardStatsByPesquisa(pesquisaId) - opcional

### 22.3 CascadeView (Página Inicial)
- [x] Manter useSelectedProject como filtro principal
- [x] Adicionar seletor opcional de pesquisa (preparado)
- [x] Corrigir estatísticas para usar dados reais
- [x] Atualizar queries de mercados para respeitar projectId
- [x] Implementar cache de pesquisa corretamente

### 22.4 Dashboard Avançado
- [ ] Verificar se usa projectId corretamente
- [ ] Adicionar filtro opcional de pesquisa
- [ ] Atualizar KPIs para respeitar hierarquia
- [ ] Testar gráficos e visualizações

### 22.5 Analytics
- [ ] Verificar queries de analytics
- [ ] Garantir filtro por projectId
- [ ] Adicionar opção de filtrar por pesquisa
- [ ] Validar métricas

### 22.6 Enriquecimento
- [ ] Verificar processo de enriquecimento
- [ ] Garantir vinculação correta a projectId e pesquisaId
- [ ] Testar fluxo completo

### 22.7 Outras Páginas
- [ ] Monitoramento
- [ ] Relatórios
- [ ] ROI
- [ ] Funil
- [ ] Agendamento
- [ ] Atividade

### 22.8 Validação Final
- [ ] Testar navegação entre páginas
- [ ] Validar persistência de filtros
- [ ] Verificar consistência de dados
- [ ] Criar checkpoint final

**Hierarquia Oficial:**
```
PROJECT (nível 1) 
  └─> PESQUISA (nível 2)
      └─> MERCADOS/CLIENTES/CONCORRENTES/LEADS (nível 3)
```
