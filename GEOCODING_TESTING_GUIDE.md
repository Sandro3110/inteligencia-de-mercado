# 🗺️ Guia de Teste - Sistema de Geocodificação

## ✅ Commit Realizado

**Commit:** `1712aac`  
**Branch:** `main`  
**Status:** Pushed para GitHub

---

## 📋 O Que Foi Implementado

### 1. **API de Geocodificação** (`server/routers/geocodingRouter.ts`)

- ✅ `startGeocoding`: Inicia processo de geocodificação
- ✅ `processBatch`: Processa 100 entidades por lote
- ✅ `getJobStatus`: Obtém status do job
- ✅ `getLatestJob`: Obtém último job de uma pesquisa
- ✅ JOIN com `cidades_brasil` para obter coordenadas
- ✅ Atualiza `latitude` e `longitude` nas tabelas

### 2. **Banco de Dados**

- ✅ Tabela `geocoding_jobs` criada no Supabase
- ✅ Schema atualizado em `drizzle/schema.ts`
- ✅ Lógica de enriquecimento geográfico corrigida

### 3. **Frontend**

- ✅ Botão "Geocodificar" (verde esmeralda)
- ✅ TAG de status com progresso
- ✅ Animação de pulse durante processamento
- ✅ Polling automático a cada 30s

### 4. **Notificações**

- ✅ Tipo 'geocoding' adicionado
- ✅ Notificação ao concluir
- ✅ Flag `notifiedCompletion`

---

## 🧪 Como Testar

### **Passo 1: Atualizar Código Local**

```bash
cd inteligencia-de-mercado
git pull origin main
pnpm install
```

### **Passo 2: Verificar Tabela no Supabase**

A tabela `geocoding_jobs` deve estar criada. Se não estiver, execute no SQL Editor:

```sql
SELECT * FROM geocoding_jobs LIMIT 1;
```

### **Passo 3: Iniciar Aplicação**

```bash
pnpm dev
```

### **Passo 4: Testar Geocodificação**

1. **Acesse:** http://localhost:3000/dashboard
2. **Selecione um projeto** com pesquisas
3. **Localize o card de uma pesquisa**
4. **Observe:**
   - Botão verde "Geocodificar" ao lado de "Enriquecer"
   - Linha "Enriquecimento Geográfico: X/Y (Z%)"

5. **Clique em "Geocodificar"**
6. **Observe:**
   - Toast: "Iniciando geocodificação..."
   - TAG muda para "Geocodificando X/Y" (com pulse)
   - Botão fica desabilitado
   - Toast: "Geocodificação concluída!"
   - TAG muda para "Geocodificado"
   - Notificação aparece no sino 🔔

7. **Clique em "Atualizar"** no card
   - A linha "Enriquecimento Geográfico" deve mostrar aumento na porcentagem

---

## 🔍 Validações

### **Verificar Job no Banco**

```sql
SELECT
  id,
  "pesquisaId",
  status,
  "totalEntities",
  "processedEntities",
  "currentBatch",
  "totalBatches",
  "startedAt",
  "completedAt"
FROM geocoding_jobs
ORDER BY id DESC
LIMIT 5;
```

### **Verificar Coordenadas Atualizadas**

```sql
-- Clientes com coordenadas
SELECT COUNT(*)
FROM clientes
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Leads com coordenadas
SELECT COUNT(*)
FROM leads
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Concorrentes com coordenadas
SELECT COUNT(*)
FROM concorrentes
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

### **Verificar Notificação**

```sql
SELECT *
FROM notifications
WHERE type = 'geocoding'
ORDER BY "createdAt" DESC
LIMIT 5;
```

---

## 🐛 Troubleshooting

### **Erro: "Nenhuma entidade precisa de geocodificação"**

**Causa:** Todas as entidades já têm coordenadas ou não têm cidade/UF.

**Solução:** Verificar dados:

```sql
-- Entidades SEM coordenadas mas COM cidade e UF
SELECT COUNT(*) FROM clientes
WHERE cidade IS NOT NULL AND cidade != ''
  AND uf IS NOT NULL AND uf != ''
  AND latitude IS NULL AND longitude IS NULL;
```

### **Erro: "Job não encontrado"**

**Causa:** Job foi deletado ou não foi criado.

**Solução:** Verificar logs no console do browser (F12).

### **TAG não atualiza**

**Causa:** Polling não está funcionando.

**Solução:**

1. Verificar console do browser
2. Verificar se `trpc.geo.getLatestJob` está retornando dados
3. Aguardar 30s (intervalo de polling)

### **Coordenadas não aparecem**

**Causa:** Cidade não encontrada na tabela `cidades_brasil`.

**Solução:** Verificar match:

```sql
SELECT c.nome, c.cidade, c.uf, cb.latitude, cb.longitude
FROM clientes c
LEFT JOIN cidades_brasil cb
  ON LOWER(TRIM(c.cidade)) = LOWER(TRIM(cb.nome))
  AND LOWER(TRIM(c.uf)) = LOWER(TRIM(cb.uf))
WHERE c.cidade IS NOT NULL
LIMIT 10;
```

---

## 📊 Métricas Esperadas

### **Performance**

- **Tempo por lote:** ~2-5 segundos (100 entidades)
- **Taxa de sucesso:** ~95% (baseado na simulação anterior)
- **Entidades processadas:** Todas com cidade + UF válidos

### **Cobertura**

- **Clientes:** Esperado ~11% (baseado em 88.5% sem cidade/UF)
- **Leads:** Esperado ~99%
- **Concorrentes:** Esperado ~99%

---

## 🎯 Checklist de Teste

- [ ] Código atualizado (`git pull`)
- [ ] Tabela `geocoding_jobs` existe no Supabase
- [ ] Aplicação iniciou sem erros
- [ ] Botão "Geocodificar" aparece no card
- [ ] TAG de status aparece quando há job
- [ ] Clique no botão inicia geocodificação
- [ ] Toast de início aparece
- [ ] TAG mostra progresso (X/Y)
- [ ] Botão fica desabilitado durante processo
- [ ] Toast de conclusão aparece
- [ ] TAG muda para "Geocodificado"
- [ ] Notificação aparece no sino
- [ ] Linha de enriquecimento geográfico atualiza
- [ ] Coordenadas foram salvas no banco
- [ ] Job marcado como `completed` no banco

---

## 📝 Notas Importantes

1. **Primeira execução:** Pode demorar mais devido ao JOIN com 5,570 cidades
2. **Processamento assíncrono:** O frontend chama `processBatch` recursivamente
3. **Polling:** A cada 30s o status é atualizado automaticamente
4. **Idempotência:** Rodar geocodificação novamente só processa entidades ainda sem coordenadas

---

## 🚀 Próximos Passos (Futuro)

- [ ] Adicionar botão "Geocodificar Todas" (similar a "Enriquecer Todas")
- [ ] Adicionar progresso visual com barra de progresso
- [ ] Adicionar log de erros de geocodificação
- [ ] Adicionar opção de re-geocodificar entidades com coordenadas
- [ ] Integrar com módulo de mapas

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do browser (F12 → Console)
2. Verificar logs do servidor (terminal)
3. Verificar tabela `geocoding_jobs` no Supabase
4. Reportar issue no GitHub com prints e logs

---

**Desenvolvido por:** Manus AI  
**Data:** 30/11/2024  
**Versão:** 1.0.0
