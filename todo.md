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


## Fase 23: Melhorias de UX/UI - Página Inicial 🎨

### 23.1 Título e Textos
- [x] Alterar "GESTOR PAV" para "Inteligência de Mercado"
- [x] Mostrar título apenas uma vez no canto superior esquerdo
- [x] Ajustar tamanho para médio (text-lg ou text-xl)
- [x] Reduzir "ESTATÍSTICAS" em 60% (de text-2xl para text-sm)
- [x] Reduzir "Selecione um Mercado" em 60% (de text-3xl para text-lg)

### 23.2 Botões → Ícones com Tooltips
- [x] Salvar Filtros → ícone Save com tooltip
- [x] Limpar Filtros → ícone X/Eraser com tooltip
- [x] Filtrar por Tags → ícone Tag com tooltip (já existia)
- [x] Segmentação → ícone Filter com tooltip (já existia)
- [x] Botões de status (Todos, Pendentes, Validados, Descartados) → ícones
- [x] Usar padrão do Tour (Tooltip component do shadcn/ui)

### 23.3 Seletor de Pesquisa
- [x] Verificar componente ProjectSelector
- [x] Corrigir para buscar apenas projetos reais do banco
- [x] Validar que mostra "Agro", "Embalagens" e terceiro projeto
- [x] Confirmado: Agro tem 0 dados, Embalagens tem 470/806/3453/2433

### 23.4 Validação
- [x] Testar visual dos ícones
- [x] Verificar tooltips funcionando
- [x] Validar seletor de projetos
- [x] Criar checkpoint final


## Fase 24: Correções de Layout e Responsividade 🔧

### 24.1 Logo Principal
- [x] Substituir "Gestor PAV" por "Inteligência de Mercado" no logo/cabeçalho principal (MainNav.tsx)
- [x] Remover box duplicado "Inteligência de Mercado" do CascadeView

### 24.2 Scroll Horizontal
- [x] Adicionar overflow-x-hidden no container principal
- [x] Adicionar flex-wrap no header para responsividade
- [x] Ajustar larguras para caber na tela

### 24.3 Redução Adicional de Textos
- [x] Reduzir "ESTATÍSTICAS" mais 50% (de text-[0.65rem] para text-[0.5rem])
- [x] Reduzir "Selecione um Mercado" mais 50% (de text-sm para text-xs)

### 24.4 Validação
- [x] Testar responsividade
- [x] Verificar sem scroll horizontal
- [x] Criar checkpoint
