# Análise de Limpeza da Base de Dados

**Data:** 30 de novembro de 2024  
**Objetivo:** Preparar base para implementação do Sistema V2

---

## 1. Situação Atual da Base

### 1.1 Projeto e Pesquisa

✅ **MANTER:**

- **Projeto:** TechFilms (ID: 1)
- **Pesquisa:** Base Inicial (ID: 1)
- **Clientes:** 807 registros

### 1.2 Registros Existentes

| Tabela              | Total | Base Inicial | Outros | Status          |
| ------------------- | ----- | ------------ | ------ | --------------- |
| **clientes**        | 807   | 807          | 0      | ✅ MANTER TODOS |
| **leads**           | 5.226 | 5.226        | 0      | ❌ APAGAR TODOS |
| **concorrentes**    | 8.710 | 8.710        | 0      | ❌ APAGAR TODOS |
| **produtos**        | 2.613 | 2.613        | 0      | ❌ APAGAR TODOS |
| **mercados_unicos** | 870   | 870          | 0      | ❌ APAGAR TODOS |

**Total de registros a apagar:** 17.419

### 1.3 Tabelas Auxiliares

| Tabela                | Total | Ação                                    |
| --------------------- | ----- | --------------------------------------- |
| **clientes_mercados** | 871   | ❌ APAGAR (relacionamento com mercados) |
| **enrichment_jobs**   | 1     | ❌ APAGAR (jobs antigos)                |
| **enrichment_runs**   | 2     | ❌ APAGAR (runs antigas)                |
| **enrichment_queue**  | 0     | ✅ Já vazia                             |
| **enrichment_cache**  | 0     | ✅ Já vazia                             |
| **geocoding_jobs**    | 0     | ✅ Já vazia                             |

**Total auxiliares a apagar:** 874

### 1.4 Tabelas de Histórico

| Tabela                   | Total | Status      |
| ------------------------ | ----- | ----------- |
| **clientes_history**     | 0     | ✅ Já vazia |
| **leads_history**        | 0     | ✅ Já vazia |
| **concorrentes_history** | 0     | ✅ Já vazia |
| **mercados_history**     | 0     | ✅ Já vazia |

---

## 2. Análise de Impacto

### 2.1 O que será MANTIDO

✅ **807 clientes** da pesquisa "Base Inicial"

- Todos os campos atuais preservados
- IDs mantidos (não há re-sequenciamento)
- Relacionamento com pesquisaId=1 preservado

✅ **Estrutura da base**

- Todas as tabelas mantidas
- Todos os índices e constraints preservados
- Todas as funções e triggers mantidos

### 2.2 O que será APAGADO

❌ **17.419 registros de entidades enriquecidas:**

- 5.226 leads (gerados pelo sistema atual)
- 8.710 concorrentes (gerados pelo sistema atual)
- 2.613 produtos (gerados pelo sistema atual)
- 870 mercados (gerados pelo sistema atual)

❌ **874 registros auxiliares:**

- 871 relacionamentos cliente-mercado
- 1 job de enriquecimento
- 2 runs de enriquecimento

**Total geral a apagar:** 18.293 registros

### 2.3 Justificativa da Limpeza

A limpeza é necessária pelos seguintes motivos:

1. **Dados do Sistema Atual com Gaps Críticos:**
   - 94,5% dos CNPJs inventados
   - 0% dos mercados enriquecidos
   - 88,48% dos clientes sem localização
   - Quantidades inconsistentes

2. **Incompatibilidade com Sistema V2:**
   - Estrutura de dados diferente
   - Campos obrigatórios ausentes
   - Relacionamentos diferentes

3. **Evitar Conflitos:**
   - IDs duplicados
   - Dados inconsistentes
   - Confusão entre dados antigos e novos

4. **Fresh Start:**
   - Sistema V2 gerará dados de alta qualidade (score 100%)
   - Ciclo fechado de inteligência
   - Dados honestos (sem invenção)

---

## 3. Estratégia de Limpeza

### 3.1 Ordem de Execução (Segura)

Para evitar violação de constraints de chave estrangeira, a ordem DEVE ser:

1. ✅ **Tabelas auxiliares** (sem dependências)
   - enrichment_jobs
   - enrichment_runs
   - clientes_mercados

2. ✅ **Tabelas de entidades** (com foreign keys)
   - produtos (depende de clientes)
   - leads (depende de clientes)
   - concorrentes (depende de clientes)
   - mercados_unicos (depende de pesquisas)

### 3.2 Validações de Segurança

Antes de cada DELETE, validar:

```sql
-- Confirmar que estamos deletando APENAS da pesquisa Base Inicial
SELECT COUNT(*) FROM <tabela> WHERE "pesquisaId" = 1;

-- Confirmar que NÃO há outros projetos/pesquisas
SELECT COUNT(*) FROM <tabela> WHERE "pesquisaId" != 1 OR "pesquisaId" IS NULL;
```

### 3.3 Backup Automático

Antes de executar, o Supabase mantém backups automáticos:

- Point-in-time recovery (últimos 7 dias)
- Snapshots diários (últimos 30 dias)

**Recomendação:** Confirmar backup manual antes de executar.

---

## 4. Impacto no Sistema V2

### 4.1 Após a Limpeza

A base ficará com:

- ✅ 807 clientes prontos para enriquecimento
- ✅ 0 leads (serão gerados pelo V2)
- ✅ 0 concorrentes (serão gerados pelo V2)
- ✅ 0 produtos (serão gerados pelo V2)
- ✅ 0 mercados (serão gerados pelo V2)

### 4.2 Geração de Novos Dados (V2)

Com Sistema V2, serão gerados:

- **2.421 produtos** (807 clientes × 3 produtos)
- **4.035 concorrentes** (807 clientes × 5 concorrentes)
- **4.035 leads** (807 clientes × 5 leads)
- **~200-300 mercados únicos** (estimativa)

**Total de novos registros:** ~10.691 a 10.791

### 4.3 Comparação de Qualidade

| Métrica                | Sistema Atual | Sistema V2 (Esperado) |
| ---------------------- | ------------- | --------------------- |
| Score de Qualidade     | 66,67%        | 100%                  |
| CNPJs Honestos         | 0%            | 100%                  |
| Mercados Enriquecidos  | 0%            | 100%                  |
| Localização Completa   | 11,52%        | 100%                  |
| Quantidade Consistente | Variável      | Sempre 3:5:5          |
| Ciclo Fechado          | 0%            | 60%                   |

---

## 5. Riscos e Mitigações

### 5.1 Riscos Identificados

**Risco 1: Perda de dados históricos**

- **Probabilidade:** Alta
- **Impacto:** Médio
- **Mitigação:** Backup manual antes de executar + Possibilidade de restauração via PITR

**Risco 2: Aplicação quebrar durante limpeza**

- **Probabilidade:** Baixa
- **Impacto:** Alto
- **Mitigação:** Executar em horário de baixo uso + Transação única (rollback automático em caso de erro)

**Risco 3: Constraints de FK bloquearem DELETE**

- **Probabilidade:** Média
- **Impacto:** Baixo
- **Mitigação:** Ordem correta de execução (auxiliares → entidades)

### 5.2 Plano de Rollback

Se algo der errado:

1. **Durante execução:** Transação será revertida automaticamente
2. **Após execução:** Restaurar via Point-in-Time Recovery (PITR) do Supabase
3. **Dados críticos:** Clientes NÃO serão afetados (apenas entidades relacionadas)

---

## 6. Recomendações

### 6.1 Antes de Executar

1. ✅ **Backup manual:** Exportar base completa via Supabase Dashboard
2. ✅ **Notificar equipe:** Avisar sobre manutenção programada
3. ✅ **Horário:** Executar em horário de baixo uso (madrugada/fim de semana)
4. ✅ **Monitoramento:** Ter acesso ao Supabase Dashboard durante execução

### 6.2 Durante Execução

1. ✅ **Transação única:** Todo script em uma única transação
2. ✅ **Logs detalhados:** Registrar quantidade de registros deletados por tabela
3. ✅ **Validações:** Confirmar contagens antes de cada DELETE

### 6.3 Após Execução

1. ✅ **Validar clientes:** Confirmar que 807 clientes estão intactos
2. ✅ **Validar limpeza:** Confirmar que tabelas de entidades estão vazias
3. ✅ **Testar aplicação:** Verificar se sistema continua funcionando
4. ✅ **Iniciar V2:** Começar Fase 1 do rollout (50 clientes)

---

## 7. Próximos Passos

1. **Revisar este relatório** com a equipe
2. **Aprovar execução** da limpeza
3. **Agendar horário** de manutenção
4. **Executar script** de limpeza
5. **Validar resultado**
6. **Iniciar implementação V2**

---

## Conclusão

A limpeza da base é **essencial e segura** para a implementação do Sistema V2.

**Benefícios:**

- ✅ Elimina 18.293 registros de baixa qualidade
- ✅ Prepara base para dados de alta qualidade (score 100%)
- ✅ Evita conflitos entre sistema atual e V2
- ✅ Permite fresh start com arquitetura correta

**Riscos mitigados:**

- ✅ Clientes preservados (807 intactos)
- ✅ Backup automático disponível
- ✅ Rollback possível via PITR
- ✅ Execução em transação única

**Recomendação:** **APROVAR** execução da limpeza.
