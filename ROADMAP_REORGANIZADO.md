# 🗺️ Roadmap Reorganizado - Gestor PAV

## 📊 Status Atual do Projeto

**Funcionalidades Implementadas:**
- ✅ Sistema completo de navegação em cascata (Mercados → Clientes → Concorrentes → Leads)
- ✅ Sistema de validação com status (Pendente, Validado, Ajuste, Descartado)
- ✅ Busca global avançada com seletor multi-campo (8 campos configuráveis)
- ✅ Sistema de tags customizáveis com cores
- ✅ Filtros avançados por segmentação, UF, porte, tipo
- ✅ Exportação básica para CSV
- ✅ Validação em lote
- ✅ Animações e transições suaves
- ✅ Skeleton loading
- ✅ Atalhos de teclado (Ctrl+K, /, Esc)
- ✅ Dashboard com gráficos

**Total de Registros:** 2.991 (73 Mercados, 800 Clientes, 591 Concorrentes, 727 Leads)

---

## 🎯 Fases Prioritárias (Próximos Passos)

### **Fase 34: Exportação Inteligente** 📤 (4h)
**Prioridade:** ALTA | **Impacto:** ALTO

Modificar sistema de exportação para respeitar filtros ativos.

**Tarefas:**
- [ ] Atualizar função exportToCSV para aceitar dados filtrados
- [ ] Passar dados visíveis (após busca + tags + filtros avançados + status) para exportação
- [ ] Adicionar nome do arquivo com timestamp e filtros aplicados
- [ ] Adicionar contador "Exportando X de Y itens" no toast
- [ ] Testar exportação com múltiplos filtros combinados
- [ ] Criar checkpoint

**Benefício:** Usuário exporta apenas dados relevantes sem precisar limpar manualmente.

---

### **Fase 35: Paginação Server-Side** 📄 (8h)
**Prioridade:** ALTA | **Impacto:** ALTO

Implementar paginação real no backend para melhorar performance com grandes volumes.

**Tarefas:**
- [ ] Atualizar routers tRPC com parâmetros `page` e `pageSize`
- [ ] Atualizar funções db.ts com `LIMIT` e `OFFSET`
- [ ] Retornar `{ data, total, page, pageSize, totalPages }` nas queries
- [ ] Criar componente `Pagination.tsx` com controles
- [ ] Atualizar CascadeView para usar paginação
- [ ] Adicionar indicador "Página X de Y" no header
- [ ] Persistir página atual no estado
- [ ] Testar com datasets grandes (>1000 itens)
- [ ] Criar checkpoint

**Benefício:** Carregamento instantâneo mesmo com milhares de registros.

---

### **Fase 36: Filtros Salvos** 💾 (12h)
**Prioridade:** MÉDIA | **Impacto:** ALTO

Permitir salvar combinações de filtros para reutilizar rapidamente.

**Tarefas:**
- [ ] Criar tabela `saved_filters` no schema (id, name, user_id, filters_json, created_at)
- [ ] Adicionar routers tRPC (savedFilters.list, create, delete, apply)
- [ ] Adicionar funções no db.ts
- [ ] Criar componente `SavedFilters.tsx` com dropdown
- [ ] Implementar modal "Salvar Filtro Atual" com campo de nome
- [ ] Serializar estado de filtros (searchQuery, searchFields, selectedTagIds, filtros avançados, statusFilter)
- [ ] Implementar botão "Aplicar Filtro Salvo"
- [ ] Adicionar indicador visual de filtro salvo ativo
- [ ] Permitir editar/deletar filtros salvos
- [ ] Testar persistência e aplicação
- [ ] Criar checkpoint

**Benefício:** Usuário cria "views" personalizadas (ex: "B2B SP Validados", "Leads Prioritários").

---

### **Fase 37: Audit Log (Histórico de Alterações)** 📜 (18h)
**Prioridade:** MÉDIA | **Impacto:** MÉDIO

Rastrear quem modificou cada registro e quando (essencial para compliance).

**Tarefas:**
- [ ] Criar tabela `audit_logs` no schema (id, entity_type, entity_id, action, user_id, old_data, new_data, timestamp)
- [ ] Criar middleware de auditoria para interceptar mutations
- [ ] Registrar INSERT/UPDATE/DELETE automaticamente
- [ ] Adicionar rota `auditLogs.getByEntity(entityType, entityId)`
- [ ] Criar componente `AuditLogViewer.tsx` (timeline de alterações)
- [ ] Integrar no DetailPopup (aba "Histórico")
- [ ] Adicionar filtro por usuário e período
- [ ] Implementar diff visual (old vs new)
- [ ] Testar com múltiplas alterações
- [ ] Criar checkpoint

**Benefício:** Transparência total sobre quem fez o quê e quando.

---

### **Fase 38: Dashboard de Métricas Avançado** 📊 (16h)
**Prioridade:** MÉDIA | **Impacto:** MÉDIO

Expandir dashboard com gráficos de distribuição e análises.

**Tarefas:**
- [ ] Instalar biblioteca de gráficos avançados (recharts já instalado)
- [ ] Criar gráfico de distribuição por segmentação (B2B vs B2C vs Ambos)
- [ ] Criar gráfico de distribuição geográfica (mapa de calor por UF)
- [ ] Criar gráfico de distribuição por porte
- [ ] Criar gráfico de timeline de validações (últimos 30 dias)
- [ ] Adicionar filtro de período no dashboard
- [ ] Criar cards de "Top 5 Mercados" (por clientes, leads, etc.)
- [ ] Adicionar gráfico de funil (Leads → Clientes)
- [ ] Implementar exportação de gráficos como imagem
- [ ] Testar performance com dados reais
- [ ] Criar checkpoint

**Benefício:** Insights visuais para tomada de decisão estratégica.

---

### **Fase 39: Modo Kanban para Leads** 🎯 (20h)
**Prioridade:** BAIXA | **Impacto:** ALTO

Visualização em quadros para gerenciar pipeline de leads.

**Tarefas:**
- [ ] Criar tabela `lead_stages` no schema (id, name, order, color)
- [ ] Adicionar coluna `stage_id` na tabela `leads`
- [ ] Criar routers para stages (list, create, update, delete, reorder)
- [ ] Criar routers para mover lead entre stages
- [ ] Instalar biblioteca de drag-and-drop (dnd-kit)
- [ ] Criar componente `KanbanBoard.tsx`
- [ ] Criar componente `KanbanColumn.tsx`
- [ ] Criar componente `KanbanCard.tsx`
- [ ] Implementar drag-and-drop entre colunas
- [ ] Atualizar stage no backend ao soltar card
- [ ] Adicionar contador de leads por stage
- [ ] Implementar filtros no Kanban (tags, segmentação)
- [ ] Adicionar rota `/leads/kanban`
- [ ] Testar com múltiplos leads
- [ ] Criar checkpoint

**Benefício:** Gestão visual do pipeline de vendas (Novo → Contato → Negociação → Fechado).

---

### **Fase 40: Histórico de Buscas** 🔍 (6h)
**Prioridade:** BAIXA | **Impacto:** BAIXO

Salvar últimas buscas para repetir rapidamente.

**Tarefas:**
- [ ] Criar estado `searchHistory` no CascadeView
- [ ] Persistir histórico no localStorage (últimas 10 buscas)
- [ ] Criar dropdown de sugestões ao focar no campo de busca
- [ ] Adicionar botão "Limpar Histórico"
- [ ] Implementar clique em sugestão para aplicar busca
- [ ] Adicionar timestamp nas buscas salvas
- [ ] Testar persistência entre sessões
- [ ] Criar checkpoint

**Benefício:** Usuário repete buscas frequentes com um clique.

---

### **Fase 41: Busca com Operadores Lógicos** 🔬 (10h)
**Prioridade:** BAIXA | **Impacto:** MÉDIO

Adicionar suporte a operadores AND/OR entre termos.

**Tarefas:**
- [ ] Criar parser de query (detectar AND, OR, NOT)
- [ ] Implementar lógica de busca booleana
- [ ] Adicionar suporte a aspas para busca exata ("termo exato")
- [ ] Criar tooltip explicativo com exemplos
- [ ] Adicionar indicador visual de query complexa
- [ ] Testar com queries complexas (ex: "São Paulo AND móveis OR madeira")
- [ ] Criar checkpoint

**Benefício:** Buscas mais precisas para usuários avançados.

---

### **Fase 42: Integração com Email** 📧 (14h)
**Prioridade:** BAIXA | **Impacto:** MÉDIO

Enviar relatórios por email automaticamente.

**Tarefas:**
- [ ] Integrar serviço de email (SendGrid/Resend)
- [ ] Criar template de email HTML para relatórios
- [ ] Criar rota `reports.sendByEmail(filters, recipientEmail)`
- [ ] Gerar CSV/PDF anexado ao email
- [ ] Criar componente `EmailReportDialog.tsx`
- [ ] Adicionar botão "Enviar por Email" no Dashboard
- [ ] Implementar agendamento de relatórios (diário, semanal, mensal)
- [ ] Testar envio de emails
- [ ] Criar checkpoint

**Benefício:** Relatórios automáticos sem precisar exportar manualmente.

---

### **Fase 43: Visualização em Mapa** 🗺️ (24h)
**Prioridade:** BAIXA | **Impacto:** MÉDIO

Mostrar clientes/concorrentes geograficamente.

**Tarefas:**
- [ ] Instalar biblioteca de mapas (Leaflet/Mapbox)
- [ ] Criar componente `MapView.tsx`
- [ ] Geocodificar endereços (API Google Maps/OpenStreetMap)
- [ ] Adicionar marcadores por tipo (cliente, concorrente, lead)
- [ ] Implementar clusters para múltiplos pontos próximos
- [ ] Adicionar popup ao clicar em marcador
- [ ] Implementar filtros no mapa (tags, segmentação, status)
- [ ] Adicionar rota `/mapa`
- [ ] Testar com dados reais
- [ ] Criar checkpoint

**Benefício:** Análise geográfica visual da distribuição de clientes.

---

### **Fase 44: Alertas Automáticos** 🔔 (12h)
**Prioridade:** BAIXA | **Impacto:** BAIXO

Notificar quando novos leads/clientes são adicionados.

**Tarefas:**
- [ ] Criar tabela `notification_rules` no schema
- [ ] Implementar sistema de triggers no backend
- [ ] Criar rota `notifications.list` e `notifications.markAsRead`
- [ ] Criar componente `NotificationBell.tsx` no header
- [ ] Implementar dropdown de notificações
- [ ] Adicionar badge com contador de não lidas
- [ ] Implementar regras customizáveis (ex: "Notificar quando lead B2B for adicionado")
- [ ] Testar com múltiplas notificações
- [ ] Criar checkpoint

**Benefício:** Usuário fica informado sobre mudanças importantes em tempo real.

---

### **Fase 45: Exportação Avançada (Excel + PDF)** 📊 (12h)
**Prioridade:** MÉDIA | **Impacto:** MÉDIO

Expandir exportação para múltiplos formatos com formatação.

**Tarefas:**
- [ ] Instalar biblioteca xlsx
- [ ] Criar função `exportToExcel` com formatação (cores, bordas, larguras)
- [ ] Criar função `exportToPDF` com relatório formatado (logo, cabeçalho, rodapé)
- [ ] Adicionar seletor de formato no botão de exportação (CSV, Excel, PDF)
- [ ] Implementar exportação de gráficos como imagem no PDF
- [ ] Adicionar opção de incluir/excluir colunas
- [ ] Testar exportações com dados reais
- [ ] Criar checkpoint

**Benefício:** Relatórios profissionais prontos para apresentação.

---

### **Fase 46: Temas Customizados** 🎨 (8h)
**Prioridade:** BAIXA | **Impacto:** BAIXO

Permitir usuário escolher cores do sistema.

**Tarefas:**
- [ ] Criar tabela `user_preferences` no schema
- [ ] Adicionar campo `theme_colors` (JSON)
- [ ] Criar componente `ThemeCustomizer.tsx`
- [ ] Implementar seletor de cores para primary, secondary, accent
- [ ] Aplicar cores customizadas via CSS variables
- [ ] Persistir preferências no banco de dados
- [ ] Adicionar presets de temas (Azul, Verde, Roxo, Laranja)
- [ ] Testar com múltiplas combinações de cores
- [ ] Criar checkpoint

**Benefício:** Personalização visual para cada usuário.

---

### **Fase 47: Tarefas e Follow-ups** ✅ (18h)
**Prioridade:** MÉDIA | **Impacto:** MÉDIO

Sistema de lembretes para acompanhamento de leads/clientes.

**Tarefas:**
- [ ] Criar tabela `tasks` no schema (id, entity_type, entity_id, title, description, due_date, status, user_id)
- [ ] Adicionar routers tRPC (tasks.list, create, update, delete, complete)
- [ ] Criar componente `TaskManager.tsx`
- [ ] Criar componente `TaskCard.tsx`
- [ ] Implementar filtro por status (Pendente, Concluída, Atrasada)
- [ ] Adicionar notificações de tarefas vencidas
- [ ] Integrar no DetailPopup (aba "Tarefas")
- [ ] Adicionar calendário de tarefas
- [ ] Testar com múltiplas tarefas
- [ ] Criar checkpoint

**Benefício:** Gestão de follow-ups sem precisar de ferramenta externa.

---

### **Fase 48: Comparação de Mercados** ⚖️ (10h)
**Prioridade:** BAIXA | **Impacto:** BAIXO

Visualização lado a lado de 2+ mercados.

**Tarefas:**
- [ ] Criar componente `CompareMarkets.tsx`
- [ ] Implementar seleção múltipla de mercados (checkboxes)
- [ ] Criar tabela comparativa (lado a lado)
- [ ] Adicionar gráficos de comparação (barras, radar)
- [ ] Implementar exportação da comparação
- [ ] Adicionar rota `/comparar`
- [ ] Testar com 2-5 mercados
- [ ] Criar checkpoint

**Benefício:** Análise comparativa rápida entre mercados.

---

### **Fase 49: Validação de Email** ✉️ (4h)
**Prioridade:** BAIXA | **Impacto:** BAIXO

Validar emails e destacar inválidos.

**Tarefas:**
- [ ] Criar função `isValidEmail()` com regex
- [ ] Adicionar validação visual nos cards (ícone de alerta)
- [ ] Adicionar tooltip explicativo para emails inválidos
- [ ] Criar filtro "Emails Inválidos"
- [ ] Testar com múltiplos formatos de email
- [ ] Criar checkpoint

**Benefício:** Identificar rapidamente dados de contato problemáticos.

---

### **Fase 50: Modo Compacto + Zoom** 🔍 (6h)
**Prioridade:** BAIXA | **Impacto:** BAIXO

Controles de densidade visual.

**Tarefas:**
- [ ] Criar contexto `CompactModeContext`
- [ ] Criar contexto `ZoomContext`
- [ ] Adicionar botão toggle "Modo Compacto" no header
- [ ] Adicionar controles de zoom (80%, 90%, 100%, 110%, 120%)
- [ ] Aplicar espaçamentos reduzidos quando modo compacto ativo
- [ ] Aplicar font-size no root conforme zoom
- [ ] Persistir preferências no localStorage
- [ ] Testar em diferentes densidades
- [ ] Criar checkpoint

**Benefício:** Usuário ajusta densidade conforme preferência pessoal.

---

## 📈 Estimativa Total de Tempo

| Fase | Horas | Prioridade |
|------|-------|------------|
| 34. Exportação Inteligente | 4h | ALTA |
| 35. Paginação Server-Side | 8h | ALTA |
| 36. Filtros Salvos | 12h | MÉDIA |
| 37. Audit Log | 18h | MÉDIA |
| 38. Dashboard Avançado | 16h | MÉDIA |
| 39. Modo Kanban | 20h | BAIXA |
| 40. Histórico de Buscas | 6h | BAIXA |
| 41. Busca com Operadores | 10h | BAIXA |
| 42. Integração Email | 14h | BAIXA |
| 43. Visualização Mapa | 24h | BAIXA |
| 44. Alertas Automáticos | 12h | BAIXA |
| 45. Exportação Avançada | 12h | MÉDIA |
| 46. Temas Customizados | 8h | BAIXA |
| 47. Tarefas e Follow-ups | 18h | MÉDIA |
| 48. Comparação de Mercados | 10h | BAIXA |
| 49. Validação de Email | 4h | BAIXA |
| 50. Modo Compacto + Zoom | 6h | BAIXA |
| **TOTAL** | **202h** | - |

---

## 🎯 Recomendação de Sequência

### **Sprint 1 (20h) - Otimizações Essenciais**
1. Exportação Inteligente (4h)
2. Paginação Server-Side (8h)
3. Filtros Salvos (12h) - Parcial

### **Sprint 2 (24h) - Rastreabilidade e Analytics**
1. Filtros Salvos (conclusão)
2. Audit Log (18h)
3. Histórico de Buscas (6h)

### **Sprint 3 (28h) - Visualização e Relatórios**
1. Dashboard Avançado (16h)
2. Exportação Avançada (12h)

### **Sprint 4 (32h) - Gestão de Pipeline**
1. Modo Kanban (20h)
2. Tarefas e Follow-ups (18h) - Parcial

### **Sprint 5+ (98h) - Funcionalidades Avançadas**
1. Restante conforme prioridade e necessidade do negócio

---

## 📝 Notas Importantes

- **Dependências:** Algumas fases dependem de outras (ex: Exportação Avançada depende de Filtros funcionando)
- **Flexibilidade:** Ordem pode ser ajustada conforme feedback do usuário
- **Performance:** Paginação Server-Side deve ser priorizada se houver lentidão com grandes volumes
- **Compliance:** Audit Log é essencial se houver requisitos regulatórios

---

**Última atualização:** 18/11/2025
