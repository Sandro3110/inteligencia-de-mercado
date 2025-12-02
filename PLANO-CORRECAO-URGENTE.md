# PLANO DE CORREÇÃO URGENTE
**www.intelmarket.app**

Data: 02/12/2025  
Status: 🔴 **CRÍTICO**

---

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. **Tailwind CSS não está sendo processado**
- **Sintoma:** Ícones gigantes, layout quebrado
- **Causa:** Build do Vite não processa diretivas `@tailwind`
- **Impacto:** 🔴 CRÍTICO - Aplicação inutilizável

### 2. **Navegação não funciona**
- **Sintoma:** Links do menu não navegam
- **Causa:** Rotas não configuradas corretamente
- **Impacto:** 🔴 CRÍTICO - Páginas inacessíveis

### 3. **15 páginas criadas mas não acessíveis**
- **Sintoma:** Apenas HomePage visível
- **Causa:** Falta configuração de rotas no App.tsx
- **Impacto:** 🟡 ALTO - Funcionalidades ocultas

---

## 📋 PLANO DE AÇÃO

### **FASE 1: Corrigir Tailwind CSS** (30 min) 🔴

**Problema:** Diretivas `@tailwind` não estão sendo processadas no build.

**Solução:**
1. Verificar `tailwind.config.js`
2. Verificar `postcss.config.js`
3. Verificar `vite.config.ts`
4. Garantir que Tailwind está instalado
5. Rebuild e redeploy

**Arquivos a verificar:**
- `/tailwind.config.js`
- `/postcss.config.js`
- `/vite.config.ts`
- `/client/src/index.css`

**Checklist:**
- [ ] tailwind.config.js existe e está correto
- [ ] postcss.config.js existe e tem plugin tailwind
- [ ] vite.config.ts tem configuração CSS
- [ ] tailwindcss instalado em package.json
- [ ] Build local funciona
- [ ] Deploy no Vercel

---

### **FASE 2: Corrigir Navegação** (20 min) 🔴

**Problema:** Links não navegam entre páginas.

**Solução:**
1. Verificar se wouter está instalado
2. Verificar rotas no App.tsx
3. Verificar se Layout tem <Link> correto
4. Testar navegação local

**Arquivos a corrigir:**
- `/client/src/App.tsx`
- `/client/src/components/Layout.tsx`

**Checklist:**
- [ ] wouter instalado
- [ ] Rotas definidas no App.tsx
- [ ] Links usam <Link> do wouter
- [ ] Navegação funciona localmente

---

### **FASE 3: Mapear e Organizar Rotas** (40 min) 🟡

**Objetivo:** Garantir que todas as 15 páginas sejam acessíveis.

**Estrutura de Rotas Proposta:**

```
/ ........................... HomePage
/projetos ................... ProjetosPage
/projetos/novo .............. ProjetoNovoPage
/pesquisas .................. PesquisasPage
/pesquisas/nova ............. PesquisaNovaPage
/importacao ................. ImportacaoPage
/importacoes ................ ImportacoesListPage
/enriquecimento ............. EnriquecimentoPage
/entidades .................. EntidadesPage
/entidades/lista ............ EntidadesListPage

📊 ANÁLISE DIMENSIONAL (NOVAS):
/analise/cubo ............... CuboExplorador
/analise/temporal ........... AnaliseTemporal
/analise/geografica ......... AnaliseGeografica
/analise/mercado ............ AnaliseMercado
/entidades/:id .............. DetalhesEntidade
```

**Checklist:**
- [ ] Todas as 15 rotas mapeadas
- [ ] Menu atualizado com links corretos
- [ ] Breadcrumbs funcionando
- [ ] 404 page criada

---

### **FASE 4: Corrigir Layout e Responsividade** (30 min) 🟡

**Problemas:**
- Ícones gigantes
- Falta padding/margin
- Mobile quebrado

**Solução:**
1. Revisar tamanhos de ícones (usar `h-5 w-5` ou `h-6 w-6`)
2. Adicionar container e padding
3. Testar responsividade
4. Adicionar breakpoints

**Checklist:**
- [ ] Ícones com tamanho correto
- [ ] Layout responsivo
- [ ] Mobile funcional
- [ ] Tablet funcional

---

### **FASE 5: Testar Todas as Páginas** (40 min) 🟢

**Objetivo:** Garantir que cada página funciona.

**Checklist por Página:**

**Sistema Base:**
- [ ] HomePage - Carrega e exibe conteúdo
- [ ] ProjetosPage - Lista projetos
- [ ] ProjetoNovoPage - Cria projeto
- [ ] PesquisasPage - Lista pesquisas
- [ ] PesquisaNovaPage - Cria pesquisa

**Importação:**
- [ ] ImportacaoPage - Upload CSV
- [ ] ImportacoesListPage - Lista importações
- [ ] EnriquecimentoPage - Enriquece dados
- [ ] EntidadesPage - Lista entidades
- [ ] EntidadesListPage - Filtros funcionam

**Análise Dimensional:**
- [ ] CuboExplorador - Busca semântica funciona
- [ ] AnaliseTemporal - Gráficos carregam
- [ ] AnaliseGeografica - Mapa carrega
- [ ] AnaliseMercado - Hierarquia funciona
- [ ] DetalhesEntidade - Detalhes carregam

---

### **FASE 6: Polimento Final** (30 min) 🟢

**Melhorias:**
1. Loading states em todas as páginas
2. Error handling
3. Toasts de feedback
4. Animações suaves
5. Acessibilidade (ARIA labels)

**Checklist:**
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toasts funcionando
- [ ] Animações suaves
- [ ] Acessibilidade OK

---

## ⏱️ CRONOGRAMA

| Fase | Tempo | Prioridade | Status |
|------|-------|------------|--------|
| FASE 1: Tailwind CSS | 30 min | 🔴 CRÍTICO | ⏳ Pendente |
| FASE 2: Navegação | 20 min | 🔴 CRÍTICO | ⏳ Pendente |
| FASE 3: Rotas | 40 min | 🟡 ALTO | ⏳ Pendente |
| FASE 4: Layout | 30 min | 🟡 ALTO | ⏳ Pendente |
| FASE 5: Testes | 40 min | 🟢 MÉDIO | ⏳ Pendente |
| FASE 6: Polimento | 30 min | 🟢 BAIXO | ⏳ Pendente |

**TOTAL:** ~3 horas

---

## 🎯 RESULTADO ESPERADO

Após todas as correções:

✅ **Layout profissional** (ícones corretos, espaçamento adequado)  
✅ **Navegação funcional** (todos os links funcionam)  
✅ **15 páginas acessíveis** (rotas configuradas)  
✅ **Responsivo** (mobile + desktop)  
✅ **Performance** (loading rápido)  
✅ **UX polida** (feedback visual, animações)

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Aprovar este plano
2. ⏳ Executar FASE 1 (Tailwind)
3. ⏳ Executar FASE 2 (Navegação)
4. ⏳ Executar FASE 3-6 sequencialmente
5. ✅ Deploy final em www.intelmarket.app

---

**Aguardando aprovação para iniciar! 🚀**
