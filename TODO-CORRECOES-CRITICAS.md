# ✅ CHECKLIST DE CORREÇÕES CRÍTICAS

**Data:** 02/12/2025  
**Objetivo:** Implementar 100% das funcionalidades  
**Tempo Estimado:** 10-11 horas

---

## 🔧 FASE 1: Gaps Menores (1h)

### **1.1 Limpeza de Marcadores Google Maps**
- [ ] Criar função clearMarkers() em google-maps.ts
- [ ] Implementar em AnaliseGeografica.tsx
- [ ] Testar troca de visualização

### **1.2 Validações de Dados**
- [ ] Adicionar validações em DAL de tempo
- [ ] Adicionar validações em DAL de canal
- [ ] Adicionar validações em DAL de contexto

---

## 🔌 FASE 2: Conectar tRPC (2-3h)

### **2.1 CuboExplorador.tsx**
- [ ] Substituir mock de buscaSemantica por trpc.cubo.buscaSemantica.useMutation()
- [ ] Substituir mock de consultar por trpc.cubo.consultar.useQuery()
- [ ] Remover dados mockados (linhas 34-56)
- [ ] Testar busca real

### **2.2 AnaliseTemporal.tsx**
- [ ] Conectar trpc.temporal.evolucao.useQuery()
- [ ] Conectar trpc.temporal.sazonalidade.useQuery()
- [ ] Conectar trpc.temporal.comparacao.useQuery()
- [ ] Remover mocks (linhas 20-90)

### **2.3 AnaliseGeografica.tsx**
- [ ] Conectar trpc.geografia.mapa.useQuery()
- [ ] Conectar trpc.geografia.heatmap.useQuery()
- [ ] Conectar trpc.geografia.drillDown.useQuery()
- [ ] Remover mocks (linhas 30-50)

### **2.4 AnaliseMercado.tsx**
- [ ] Conectar trpc.mercado.hierarquia.useQuery()
- [ ] Conectar trpc.mercado.concorrencia.useQuery()
- [ ] Conectar trpc.mercado.oportunidades.useQuery()
- [ ] Remover mocks (linhas 15-100)

### **2.5 DetalhesEntidade.tsx**
- [ ] Conectar trpc.entidade.detalhes.useQuery()
- [ ] Conectar trpc.entidade.metricas.useQuery()
- [ ] Conectar trpc.entidade.historico.useQuery()
- [ ] Remover mocks (linhas 20-80)

### **2.6 ExportButton.tsx**
- [ ] Conectar trpc.cubo.exportar.useMutation()
- [ ] Remover TODO (linha 45)
- [ ] Testar exportação real

---

## 🤖 FASE 3: Busca Semântica OpenAI (2h)

### **3.1 Configurar Variável de Ambiente**
- [ ] Verificar OPENAI_API_KEY no Vercel
- [ ] Adicionar ao .env local para testes
- [ ] Atualizar server/context.ts

### **3.2 Implementar Busca Real**
- [ ] Atualizar server/helpers/busca-semantica.ts
- [ ] Conectar ao cuboRouter.buscaSemantica
- [ ] Testar interpretação de queries
- [ ] Validar filtros gerados

### **3.3 Testes**
- [ ] "Empresas de tecnologia no sul"
- [ ] "Leads com alta receita em SP"
- [ ] "Concorrentes no mercado de ERP"

---

## 🔐 FASE 4: Autenticação Supabase (6h)

### **4.1 Configurar Supabase Auth**
- [ ] Instalar @supabase/auth-helpers-react
- [ ] Configurar AuthProvider
- [ ] Criar componente de Login
- [ ] Criar componente de Logout

### **4.2 Atualizar Context**
- [ ] Implementar getUser() em server/context.ts
- [ ] Remover TODO: user: null

### **4.3 Atualizar Routers (35 TODOs)**
- [ ] server/routers/projetos.ts (7 TODOs)
- [ ] server/routers/pesquisas.ts (6 TODOs)
- [ ] server/routers/cubo.ts (1 TODO)
- [ ] Substituir todos os TODOs de userId/ownerId

### **4.4 Proteger Rotas**
- [ ] Adicionar middleware de autenticação
- [ ] Redirecionar não autenticados para login
- [ ] Testar controle de acesso

---

## ✅ FASE 5: Testes e Validação (1h)

### **5.1 Testes Funcionais**
- [ ] Busca semântica retorna resultados corretos
- [ ] Filtros funcionam corretamente
- [ ] Exportação gera arquivos válidos
- [ ] Mapas carregam sem erros
- [ ] Autenticação funciona

### **5.2 Testes de Performance**
- [ ] Queries executam em < 2s
- [ ] Mapas renderizam em < 3s
- [ ] Exportação completa em < 5s

### **5.3 Testes de Qualidade**
- [ ] Zero TODOs no código
- [ ] Zero mocks em produção
- [ ] Zero console.errors
- [ ] Zero warnings de build

---

## 📊 FASE 6: Entrega Final (30min)

### **6.1 Documentação**
- [ ] Atualizar README.md
- [ ] Criar guia de deploy
- [ ] Documentar variáveis de ambiente

### **6.2 Git**
- [ ] Commit final
- [ ] Push para GitHub
- [ ] Tag de versão (v1.0.0)

### **6.3 Deploy**
- [ ] Verificar build sem erros
- [ ] Configurar variáveis no Vercel
- [ ] Deploy para produção
- [ ] Testar em www.intelmarket.app

---

## 📈 PROGRESSO

**Total de Tarefas:** 60  
**Concluídas:** 0  
**Pendentes:** 60  
**Progresso:** 0%

**Tempo Estimado Total:** 10-11 horas  
**Tempo Gasto:** 0 horas  
**Tempo Restante:** 10-11 horas

---

**Última Atualização:** 02/12/2025
