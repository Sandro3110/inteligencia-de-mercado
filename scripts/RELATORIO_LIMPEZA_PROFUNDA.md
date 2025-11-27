# 🗑️ RELATÓRIO DE LIMPEZA PROFUNDA - IntelMarket

## 📋 RESUMO EXECUTIVO

Este script realiza uma **limpeza profunda e completa** do banco de dados, mantendo apenas o usuário admin `sandrodireto@gmail.com` e apagando TODOS os outros dados.

---

## 🎯 OBJETIVO

1. ✅ **Aprovar e configurar** `sandrodireto@gmail.com` como admin
2. ✅ **Apagar TODOS os outros usuários**
3. ✅ **Apagar TODOS os dados relacionados a outros usuários**
4. ✅ **Apagar TODOS os dados de teste**
5. ✅ **Resetar sequences** (IDs começam do 1)

---

## 📊 O QUE SERÁ APAGADO

### 1. **USUÁRIOS** (Tabela: `users`)

**Mantido:**
- ✅ `sandrodireto@gmail.com` (configurado como admin, ativo = 1)

**Apagado:**
- ❌ TODOS os outros usuários cadastrados

---

### 2. **DADOS DE OUTROS USUÁRIOS** (10 tabelas)

#### 2.1 `export_history`
- **Descrição:** Histórico de exports
- **Campo:** `userId`
- **Ação:** Apagar registros de outros usuários

#### 2.2 `saved_filters_export`
- **Descrição:** Filtros salvos para export
- **Campo:** `userId`
- **Ação:** Apagar filtros de outros usuários

#### 2.3 `notifications`
- **Descrição:** Notificações
- **Campo:** `userId`
- **Ação:** Apagar notificações de outros usuários

#### 2.4 `notification_preferences`
- **Descrição:** Preferências de notificação
- **Campo:** `userId`
- **Ação:** Apagar preferências de outros usuários

#### 2.5 `project_audit_log`
- **Descrição:** Log de auditoria de projetos
- **Campo:** `userId`
- **Ação:** Apagar logs de outros usuários

#### 2.6 `saved_filters`
- **Descrição:** Filtros salvos
- **Campo:** `userId`
- **Ação:** Apagar filtros de outros usuários

#### 2.7 `research_drafts`
- **Descrição:** Rascunhos de pesquisas
- **Campo:** `userId`
- **Ação:** Apagar rascunhos de outros usuários

#### 2.8 `push_subscriptions`
- **Descrição:** Inscrições push
- **Campo:** `userId`
- **Ação:** Apagar inscrições de outros usuários

#### 2.9 `report_schedules`
- **Descrição:** Agendamentos de relatórios
- **Campo:** `userId`
- **Ação:** Apagar agendamentos de outros usuários

#### 2.10 `password_resets`
- **Descrição:** Tokens de reset de senha
- **Campo:** `userId`
- **Ação:** Apagar tokens de outros usuários

---

### 3. **CONVITES E LOGIN** (2 tabelas)

#### 3.1 `user_invites`
- **Descrição:** Convites de usuários
- **Ação:** Apagar TODOS os convites

#### 3.2 `login_attempts`
- **Descrição:** Tentativas de login
- **Campo:** `userId` (se existir)
- **Ação:** Apagar tentativas de outros usuários

---

### 4. **DADOS PRINCIPAIS** (8 tabelas)

#### 4.1 `projects`
- **Descrição:** Projetos
- **Ação:** Apagar TODOS os projetos

#### 4.2 `pesquisas`
- **Descrição:** Pesquisas
- **Ação:** Apagar TODAS as pesquisas

#### 4.3 `mercados_unicos`
- **Descrição:** Mercados
- **Ação:** Apagar TODOS os mercados

#### 4.4 `leads`
- **Descrição:** Leads
- **Ação:** Apagar TODOS os leads

#### 4.5 `clientes`
- **Descrição:** Clientes
- **Ação:** Apagar TODOS os clientes

#### 4.6 `concorrentes`
- **Descrição:** Concorrentes
- **Ação:** Apagar TODOS os concorrentes

#### 4.7 `produtos`
- **Descrição:** Produtos
- **Ação:** Apagar TODOS os produtos

#### 4.8 `lead_conversions`
- **Descrição:** Conversões de leads
- **Ação:** Apagar TODAS as conversões

---

### 5. **HISTÓRICO E ANALYTICS** (12 tabelas)

#### 5.1 `activity_log`
- **Descrição:** Logs de atividades
- **Ação:** Apagar TODOS os logs

#### 5.2 `alert_configs`
- **Descrição:** Configurações de alertas
- **Ação:** Apagar TODAS as configurações

#### 5.3 `alert_history`
- **Descrição:** Histórico de alertas
- **Ação:** Apagar TODO o histórico

#### 5.4 `analytics_dimensoes`
- **Descrição:** Analytics por dimensão
- **Ação:** Apagar TODOS os dados

#### 5.5 `analytics_mercados`
- **Descrição:** Analytics de mercados
- **Ação:** Apagar TODOS os dados

#### 5.6 `analytics_pesquisas`
- **Descrição:** Analytics de pesquisas
- **Ação:** Apagar TODOS os dados

#### 5.7 `analytics_timeline`
- **Descrição:** Timeline de analytics
- **Ação:** Apagar TODOS os dados

#### 5.8 `clientes_history`
- **Descrição:** Histórico de clientes
- **Ação:** Apagar TODO o histórico

#### 5.9 `clientes_mercados`
- **Descrição:** Relação clientes-mercados
- **Ação:** Apagar TODAS as relações

#### 5.10 `concorrentes_history`
- **Descrição:** Histórico de concorrentes
- **Ação:** Apagar TODO o histórico

#### 5.11 `leads_history`
- **Descrição:** Histórico de leads
- **Ação:** Apagar TODO o histórico

#### 5.12 `mercados_history`
- **Descrição:** Histórico de mercados
- **Ação:** Apagar TODO o histórico

---

### 6. **SISTEMA E CONFIGURAÇÃO** (14 tabelas)

#### 6.1 `enrichment_cache`
- **Descrição:** Cache de enriquecimento
- **Ação:** Apagar TODO o cache

#### 6.2 `enrichment_configs`
- **Descrição:** Configurações de enriquecimento
- **Ação:** Apagar TODAS as configurações

#### 6.3 `enrichment_jobs`
- **Descrição:** Jobs de enriquecimento
- **Ação:** Apagar TODOS os jobs

#### 6.4 `enrichment_queue`
- **Descrição:** Fila de enriquecimento
- **Ação:** Apagar TODA a fila

#### 6.5 `enrichment_runs`
- **Descrição:** Execuções de enriquecimento
- **Ação:** Apagar TODAS as execuções

#### 6.6 `entity_tags`
- **Descrição:** Tags de entidades
- **Ação:** Apagar TODAS as tags

#### 6.7 `hibernation_warnings`
- **Descrição:** Avisos de hibernação
- **Ação:** Apagar TODOS os avisos

#### 6.8 `intelligent_alerts_configs`
- **Descrição:** Configurações de alertas inteligentes
- **Ação:** Apagar TODAS as configurações

#### 6.9 `intelligent_alerts_history`
- **Descrição:** Histórico de alertas inteligentes
- **Ação:** Apagar TODO o histórico

#### 6.10 `operational_alerts`
- **Descrição:** Alertas operacionais
- **Ação:** Apagar TODOS os alertas

#### 6.11 `recommendations`
- **Descrição:** Recomendações
- **Ação:** Apagar TODAS as recomendações

#### 6.12 `salesforce_sync_log`
- **Descrição:** Log de sync Salesforce
- **Ação:** Apagar TODO o log

#### 6.13 `scheduled_enrichments`
- **Descrição:** Enriquecimentos agendados
- **Ação:** Apagar TODOS os agendamentos

---

### 7. **SEQUENCES RESETADAS** (43 sequences)

Todas as sequences serão resetadas para começar do 1:

1. projects_id_seq
2. pesquisas_id_seq
3. mercados_unicos_id_seq
4. leads_id_seq
5. clientes_id_seq
6. concorrentes_id_seq
7. produtos_id_seq
8. activity_log_id_seq
9. notifications_id_seq
10. alert_configs_id_seq
11. alert_history_id_seq
12. saved_filters_export_id_seq
13. saved_filters_id_seq
14. research_drafts_id_seq
15. enrichment_cache_id_seq
16. enrichment_queue_id_seq
17. enrichment_jobs_id_seq
18. enrichment_runs_id_seq
19. export_history_id_seq
20. user_invites_id_seq
21. login_attempts_id_seq
22. password_resets_id_seq
23. push_subscriptions_id_seq
24. report_schedules_id_seq
25. project_audit_log_id_seq
26. notification_preferences_id_seq
27. entity_tags_id_seq
28. hibernation_warnings_id_seq
29. intelligent_alerts_configs_id_seq
30. intelligent_alerts_history_id_seq
31. lead_conversions_id_seq
32. operational_alerts_id_seq
33. recommendations_id_seq
34. salesforce_sync_log_id_seq
35. scheduled_enrichments_id_seq
36. analytics_dimensoes_id_seq
37. analytics_mercados_id_seq
38. analytics_pesquisas_id_seq
39. analytics_timeline_id_seq
40. clientes_history_id_seq
41. clientes_mercados_id_seq
42. concorrentes_history_id_seq
43. leads_history_id_seq
44. mercados_history_id_seq

---

## ✅ O QUE SERÁ MANTIDO

### Tabelas de Configuração Global (NÃO SERÃO APAGADAS)

1. **`email_config`** - Configuração de email
2. **`llm_provider_configs`** - Configuração de LLM
3. **`system_settings`** - Configurações do sistema
4. **`tags`** - Tags globais
5. **`project_templates`** - Templates de projetos

---

## 📊 ESTATÍSTICAS

### Total de Tabelas Afetadas: **46 tabelas**

**Por categoria:**
- Usuários: 1 tabela
- Dados de outros usuários: 10 tabelas
- Convites e login: 2 tabelas
- Dados principais: 8 tabelas
- Histórico e analytics: 12 tabelas
- Sistema e configuração: 14 tabelas

### Total de Sequences Resetadas: **44 sequences**

---

## 🔍 VERIFICAÇÃO FINAL

Após executar o script, você verá:

### ✅ Resultado Esperado

```
============================================
VERIFICAÇÃO FINAL:
============================================

📋 ADMIN CONFIGURADO:
  Email: sandrodireto@gmail.com
  Role: admin
  Ativo: 1

📊 USUÁRIOS:
  Total: 1

📊 DADOS RESTANTES:
  Projetos: 0
  Pesquisas: 0
  Mercados: 0
  Leads: 0
  Clientes: 0
  Concorrentes: 0
  Notificações: 0
  Export History: 0
  Filtros Salvos: 0
  Rascunhos: 0
  Convites: 0

============================================
✅✅✅ LIMPEZA CONCLUÍDA COM SUCESSO! ✅✅✅
============================================
```

---

## ⚠️ IMPORTANTE

**ESTE SCRIPT É EXTREMAMENTE DESTRUTIVO!**

- ❌ Apaga TODOS os usuários exceto sandrodireto@gmail.com
- ❌ Apaga TODOS os dados de teste
- ❌ Apaga TODOS os projetos, pesquisas, mercados, leads, etc.
- ❌ **NÃO HÁ COMO REVERTER APÓS EXECUTAR!**

**Use apenas se tiver ABSOLUTA CERTEZA!**

---

## 🚀 COMO EXECUTAR

1. **Acesse o Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

2. **Copie TODO o conteúdo do arquivo:**
   - `LIMPEZA_PROFUNDA_COMPLETA.sql`

3. **Cole no SQL Editor**

4. **Clique em "RUN"**

5. **Aguarde a execução** (pode levar alguns segundos)

6. **Verifique os logs** na parte inferior

7. **Confirme os resultados** nas consultas finais

---

## 📝 LOGS ESPERADOS

Durante a execução, você verá mensagens como:

```
NOTICE: ✅ Admin encontrado: sandrodireto@gmail.com (ID: xxx)
NOTICE: ============================================
NOTICE: DADOS ANTES DA LIMPEZA:
NOTICE: ============================================
NOTICE: Usuários: X
NOTICE: Projetos: X
NOTICE: ...
NOTICE: PASSO 3: Apagando dados de outros usuários...
NOTICE: ✅ Dados de outros usuários apagados
NOTICE: PASSO 4: Apagando convites e tentativas de login...
NOTICE: ✅ Convites e login attempts apagados
NOTICE: PASSO 5: Apagando TODOS os dados de teste...
NOTICE: ✅ Todos os dados de teste apagados
NOTICE: PASSO 6: Apagando outros usuários...
NOTICE:   Apagando: usuario1@email.com
NOTICE:   Apagando: usuario2@email.com
NOTICE: ✅ X usuários apagados
NOTICE: PASSO 7: Configurando admin...
NOTICE: ✅ Admin configurado
NOTICE: PASSO 8: Resetando sequences...
NOTICE: ✅ Sequences resetadas
NOTICE: ✅✅✅ LIMPEZA CONCLUÍDA COM SUCESSO! ✅✅✅
```

---

## 🎯 APÓS EXECUTAR

1. ✅ Faça login com `sandrodireto@gmail.com`
2. ✅ Você terá acesso total como admin
3. ✅ Banco de dados limpo e pronto para começar do zero
4. ✅ Todos os IDs começam do 1 novamente
5. ✅ Novos cadastros precisarão de sua aprovação

---

**Desenvolvido por:** Manus AI  
**Data:** 27 de Novembro de 2025  
**Versão:** 2.0.0 (Limpeza Profunda Completa)
