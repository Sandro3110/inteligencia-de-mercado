# 🔍 ANÁLISE COMPLETA - Tabelas com Referências a Usuários

## 📊 TABELAS IDENTIFICADAS

### 1. **Tabela Principal: `users`**
- **Campos:**
  - `id` (PK)
  - `email`
  - `nome`
  - `empresa`
  - `cargo`
  - `setor`
  - `senha_hash`
  - `role`
  - `ativo`
  - `liberado_por` (FK para users.id)
  - `liberado_em`
  - `created_at`
  - `last_signed_in`

**AÇÃO:** Manter apenas `sandrodireto@gmail.com`, apagar todos os outros

---

### 2. **Tabelas com `userId` (referência direta)**

#### 2.1 `export_history`
- `userId` varchar(64)
- **AÇÃO:** Apagar registros de outros usuários

#### 2.2 `saved_filters_export`
- `userId` varchar(64)
- **AÇÃO:** Apagar filtros salvos de outros usuários

#### 2.3 `notifications`
- `userId` varchar(64)
- **AÇÃO:** Apagar notificações de outros usuários

#### 2.4 `notification_preferences`
- `userId` varchar(64)
- **AÇÃO:** Apagar preferências de outros usuários

#### 2.5 `project_audit_log`
- `userId` varchar(64)
- **AÇÃO:** Apagar logs de auditoria de outros usuários

#### 2.6 `saved_filters`
- `userId` varchar(64)
- **AÇÃO:** Apagar filtros salvos de outros usuários

#### 2.7 `research_drafts`
- `userId` varchar(64)
- **AÇÃO:** Apagar rascunhos de outros usuários

#### 2.8 `push_subscriptions`
- `userId` varchar(64)
- **AÇÃO:** Apagar inscrições push de outros usuários

#### 2.9 `report_schedules`
- `userId` varchar(64)
- **AÇÃO:** Apagar agendamentos de relatórios de outros usuários

#### 2.10 `password_resets`
- `userId` varchar(64)
- **AÇÃO:** Apagar tokens de reset de outros usuários

---

### 3. **Tabelas Relacionadas (sem referência direta, mas devem ser limpas)**

#### 3.1 `user_invites`
- Convites de usuários
- **AÇÃO:** Apagar TODOS os convites

#### 3.2 `login_attempts`
- Tentativas de login
- **AÇÃO:** Apagar tentativas de outros usuários (se tiver userId)

---

### 4. **Tabelas de Dados (limpar tudo)**

Estas tabelas não têm referência direta a usuários, mas contêm dados de teste que devem ser apagados:

- `projects` - Projetos
- `pesquisas` - Pesquisas
- `mercados_unicos` - Mercados
- `leads` - Leads
- `clientes` - Clientes
- `concorrentes` - Concorrentes
- `produtos` - Produtos

**AÇÃO:** Apagar TODOS os registros

---

### 5. **Tabelas de Histórico e Analytics**

- `activity_log` - Logs de atividades
- `alert_configs` - Configurações de alertas
- `alert_history` - Histórico de alertas
- `analytics_dimensoes` - Analytics por dimensão
- `analytics_mercados` - Analytics de mercados
- `analytics_pesquisas` - Analytics de pesquisas
- `analytics_timeline` - Timeline de analytics
- `clientes_history` - Histórico de clientes
- `clientes_mercados` - Relação clientes-mercados
- `concorrentes_history` - Histórico de concorrentes
- `leads_history` - Histórico de leads
- `mercados_history` - Histórico de mercados

**AÇÃO:** Apagar TODOS os registros

---

### 6. **Tabelas de Configuração e Sistema**

- `enrichment_cache` - Cache de enriquecimento
- `enrichment_configs` - Configurações de enriquecimento
- `enrichment_jobs` - Jobs de enriquecimento
- `enrichment_queue` - Fila de enriquecimento
- `enrichment_runs` - Execuções de enriquecimento
- `entity_tags` - Tags de entidades
- `hibernation_warnings` - Avisos de hibernação
- `intelligent_alerts_configs` - Configurações de alertas inteligentes
- `intelligent_alerts_history` - Histórico de alertas inteligentes
- `lead_conversions` - Conversões de leads
- `operational_alerts` - Alertas operacionais
- `recommendations` - Recomendações
- `salesforce_sync_log` - Log de sync Salesforce
- `scheduled_enrichments` - Enriquecimentos agendados

**AÇÃO:** Apagar TODOS os registros

---

### 7. **Tabelas de Configuração Global (NÃO APAGAR)**

- `email_config` - Configuração de email
- `llm_provider_configs` - Configuração de LLM
- `system_settings` - Configurações do sistema
- `tags` - Tags globais
- `project_templates` - Templates de projetos

**AÇÃO:** MANTER (configurações globais)

---

## 📋 RESUMO

### Tabelas com Referência Direta a Usuários (10)
1. export_history
2. saved_filters_export
3. notifications
4. notification_preferences
5. project_audit_log
6. saved_filters
7. research_drafts
8. push_subscriptions
9. report_schedules
10. password_resets

### Tabela de Usuários (1)
11. users

### Tabelas de Convites (1)
12. user_invites

### Tabelas de Dados (7)
13. projects
14. pesquisas
15. mercados_unicos
16. leads
17. clientes
18. concorrentes
19. produtos

### Tabelas de Histórico/Analytics (12)
20. activity_log
21. alert_configs
22. alert_history
23. analytics_dimensoes
24. analytics_mercados
25. analytics_pesquisas
26. analytics_timeline
27. clientes_history
28. clientes_mercados
29. concorrentes_history
30. leads_history
31. mercados_history

### Tabelas de Sistema/Configuração (14)
32. enrichment_cache
33. enrichment_configs
34. enrichment_jobs
35. enrichment_queue
36. enrichment_runs
37. entity_tags
38. hibernation_warnings
39. intelligent_alerts_configs
40. intelligent_alerts_history
41. lead_conversions
42. operational_alerts
43. recommendations
44. salesforce_sync_log
45. scheduled_enrichments

---

## 🎯 TOTAL

**45 tabelas** precisam ser limpas ou ter dados de outros usuários removidos.

**4 tabelas** devem ser mantidas intactas (configurações globais).
