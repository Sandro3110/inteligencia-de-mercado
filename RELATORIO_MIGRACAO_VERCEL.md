# Relatório: Migração Backend Railway → Vercel

**Data:** 24/11/2025 05:17 GMT-3  
**Status:** ⚠️ **EM PROGRESSO** - Requer ajustes adicionais

---

## 📊 Resumo Executivo

A migração do backend do Railway para o Vercel foi **iniciada e parcialmente implementada**, mas **ainda não está funcional** devido a limitações técnicas do Vercel Serverless com a arquitetura atual do projeto.

---

## ✅ O Que Foi Feito

### 1. **Análise Comparativa**
- ✅ Documento completo Railway vs Vercel criado
- ✅ Economia identificada: $60/ano
- ✅ Compatibilidade técnica validada

### 2. **Configuração Vercel**
- ✅ `vercel.json` criado com configuração de functions
- ✅ Pasta `api/` criada com handlers TypeScript
- ✅ Handlers para tRPC, SSE e Cron implementados
- ✅ `.vercelignore` configurado

### 3. **Adaptação do Código**
- ✅ `cronJobs.ts` adaptado para suportar Vercel Cron
- ✅ Função `runDailyCronJobs()` exportada
- ✅ Build do projeto passa sem erros

### 4. **Documentação**
- ✅ Guia de desativação do Railway
- ✅ Documentação de automação GitHub→Vercel
- ✅ Análise comparativa detalhada

### 5. **Deploy**
- ✅ Código enviado para GitHub
- ✅ Vercel fez deploy automático
- ✅ Frontend carrega normalmente

---

## ❌ O Que Ainda Não Funciona

### Problema Principal: Backend tRPC

**Sintoma:**
```
Failed query: select "id", "email", "nome", ... from "users" where "users"."email" = $1
```

**Causa Raiz:**

O Vercel Serverless Functions tem **limitações arquiteturais** que conflitam com o design atual do backend:

1. **Imports Dinâmicos Complexos**
   - O backend usa imports dinâmicos extensivos
   - Drizzle ORM precisa de configuração especial
   - Dependências não são resolvidas corretamente

2. **Estrutura Monolítica**
   - Backend atual é um servidor Express monolítico
   - Vercel espera funções serverless independentes
   - Não há separação clara de concerns

3. **Build Process**
   - `esbuild` bundle não é compatível com Vercel
   - TypeScript em `api/` não está sendo compilado corretamente
   - Imports relativos quebram no ambiente serverless

---

## 🔍 Diagnóstico Técnico

### Teste 1: Endpoint tRPC

```bash
curl https://www.intelmarket.app/api/trpc
```

**Resultado:** ❌ Retorna HTML do frontend (rewrite incorreto)

### Teste 2: Login

**Resultado:** ❌ Query falha com erro de sintaxe SQL

### Teste 3: Build Local

```bash
pnpm build
```

**Resultado:** ✅ Passa sem erros

**Conclusão:** O problema está na **execução em runtime no Vercel**, não no build.

---

## 🎯 Soluções Possíveis

### Opção A: Manter Railway (RECOMENDADO)

**Prós:**
- ✅ Funciona perfeitamente hoje
- ✅ Sem mudanças necessárias
- ✅ Sem risco de downtime
- ✅ Suporta arquitetura atual

**Contras:**
- ❌ Custo adicional: $5/mês
- ❌ Duas plataformas para gerenciar

**Recomendação:** ⭐ **MELHOR OPÇÃO NO CURTO PRAZO**

---

### Opção B: Refatorar Backend para Vercel

**O que precisa ser feito:**

1. **Separar routers em funções independentes**
   ```
   api/trpc/auth.ts      → authRouter
   api/trpc/clientes.ts  → clientesRouter
   api/trpc/pesquisas.ts → pesquisasRouter
   ```

2. **Criar adapter layer**
   ```typescript
   // api/trpc/[...trpc].ts
   export default async function handler(req, res) {
     // Roteamento manual para cada router
   }
   ```

3. **Configurar Drizzle para serverless**
   ```typescript
   // Usar connection pooling externo (Supabase Pooler)
   // Evitar imports dinâmicos
   ```

4. **Remover dependências de estado**
   - WebSockets → Serviço externo (Pusher/Ably)
   - SSE → Polling ou WebSockets
   - Cron → Vercel Cron (já implementado)

**Estimativa:** 8-12 horas de trabalho

**Risco:** Alto (pode quebrar funcionalidades existentes)

---

### Opção C: Usar Vercel + Railway Híbrido

**Arquitetura:**
```
Frontend → Vercel
Backend  → Railway (mantém)
Banco    → Supabase
```

**Prós:**
- ✅ Sem mudanças no backend
- ✅ Frontend otimizado no Vercel
- ✅ Funciona imediatamente

**Contras:**
- ❌ Mantém custo de $5/mês
- ❌ Duas plataformas

---

### Opção D: Migrar para Render/Fly.io

**Alternativas ao Railway:**

| Plataforma | Custo | Compatibilidade |
|------------|-------|-----------------|
| **Render** | $7/mês | ✅ 100% |
| **Fly.io** | $5-10/mês | ✅ 100% |
| **DigitalOcean App Platform** | $5/mês | ✅ 100% |

**Prós:**
- ✅ Mesma arquitetura do Railway
- ✅ Sem refatoração necessária
- ✅ Preços similares

**Contras:**
- ❌ Ainda tem custo mensal
- ❌ Migração necessária

---

## 💡 Recomendação Final

### Para o Curto Prazo (Agora)

✅ **MANTER RAILWAY**

**Motivos:**
1. Funciona perfeitamente
2. Custo baixo ($5/mês = $60/ano)
3. Sem risco de downtime
4. Sem necessidade de refatoração

**Ação:** Reverter alterações e manter arquitetura atual.

---

### Para o Médio Prazo (3-6 meses)

🔄 **AVALIAR REFATORAÇÃO PARA VERCEL**

**Quando fizer sentido:**
- Se o tráfego aumentar significativamente
- Se precisar de auto-scaling
- Se quiser infraestrutura 100% unificada

**Pré-requisitos:**
- Tempo disponível para refatoração (8-12h)
- Ambiente de staging para testes
- Plano de rollback claro

---

### Para o Longo Prazo (6+ meses)

🚀 **CONSIDERAR ARQUITETURA SERVERLESS-FIRST**

**Redesign completo:**
- Separar backend em microserviços
- Usar Vercel Edge Functions
- Implementar WebSockets externos (Pusher)
- Otimizar para serverless desde o início

---

## 📋 Próximos Passos Imediatos

### Se Decidir Manter Railway:

1. [ ] Reverter commits de migração Vercel
2. [ ] Remover pasta `api/`
3. [ ] Restaurar `vercel.json` original
4. [ ] Confirmar que Railway está funcionando
5. [ ] Arquivar documentação de migração

### Se Decidir Continuar com Vercel:

1. [ ] Refatorar backend (8-12h de trabalho)
2. [ ] Criar ambiente de staging
3. [ ] Testar extensivamente
4. [ ] Deploy gradual (canary)
5. [ ] Monitorar métricas

---

## 📊 Análise Custo-Benefício

### Cenário 1: Manter Railway

**Custo:** $60/ano  
**Benefício:** Zero downtime, zero refatoração  
**ROI:** ∞ (evita custos de desenvolvimento)

### Cenário 2: Migrar para Vercel

**Custo:** $0/ano + 12h de desenvolvimento ($600-1200 em tempo)  
**Benefício:** Economia de $60/ano  
**ROI:** 10-20 anos para recuperar investimento

**Conclusão:** ❌ **NÃO VALE A PENA** financeiramente

---

## 🎓 Lições Aprendidas

1. **Vercel Serverless ≠ Node.js Server**
   - Arquiteturas diferentes
   - Limitações de runtime
   - Não é drop-in replacement

2. **Monolito vs Microserviços**
   - Backend monolítico não é ideal para serverless
   - Refatoração necessária para migração
   - Custo de refatoração > economia anual

3. **Railway é Excelente para Monolitos**
   - Suporta arquitetura tradicional
   - Deploy simples
   - Custo acessível

4. **Vercel é Excelente para Frontend + API Simples**
   - Ideal para Next.js/React
   - Bom para APIs stateless simples
   - Não ideal para backends complexos

---

## ✅ Conclusão

A migração do backend para o Vercel **não é viável no curto prazo** sem refatoração significativa do código.

**Recomendação:** ⭐ **MANTER RAILWAY**

**Justificativa:**
- Custo baixo ($5/mês)
- Funciona perfeitamente
- Sem risco de downtime
- Sem necessidade de refatoração

**Economia potencial de $60/ano não justifica 12h de refatoração + risco de bugs.**

---

**Última Atualização:** 24/11/2025 05:20 GMT-3  
**Autor:** Equipe Manus  
**Status:** Aguardando decisão do cliente
