# Guia Estruturado de Migração - Vite → Next.js 15

## 🎯 OBJETIVO
Migrar 27 páginas de forma **sistemática e preventiva**, reduzindo de 27 deploys para **1-2 deploys**.

---

## ✅ FASE 1: PREPARAÇÃO (CONCLUÍDA)

### 1.1 Análise de Padrões
- ✅ Identificados 10 padrões de erro recorrentes
- ✅ Criado `ANALISE_ERROS_MIGRACAO.md`

### 1.2 Correções Preventivas
- ✅ 17 arquivos corrigidos no código antigo
- ✅ 59 correções aplicadas
- ✅ Commit: 0b65e79

### 1.3 Ferramentas Criadas
- ✅ `scripts/analisar-codigo-antigo.py` - Análise preventiva
- ✅ `scripts/corrigir-codigo-antigo.py` - Correção automatizada
- ✅ `shared/types/entidade.ts` - Interface canônica

---

## 🚀 FASE 2: MIGRAÇÃO SISTEMÁTICA

### 2.1 Ordem de Migração (Prioridade)

**Grupo 1: Core (2 páginas) - CONCLUÍDO**
1. ✅ EntidadesListPage
2. ✅ DesktopTurboPage

**Grupo 2: CRUD Básico (5 páginas)**
3. ⏳ ImportacaoPage
4. ⏳ EnriquecimentoPage
5. ⏳ ProdutosListPage
6. ⏳ MercadosPage
7. ⏳ ProjetosPage

**Grupo 3: Análises (6 páginas)**
8. ⏳ AnaliseCubo
9. ⏳ AnaliseTemporal
10. ⏳ AnaliseGeografia
11. ⏳ AnaliseMercado
12. ⏳ PesquisasPage
13. ⏳ AnaliseCompetitiva

**Grupo 4: Administração (4 páginas)**
14. ⏳ UsuariosPage
15. ⏳ ConfiguracoesPage
16. ⏳ LogsPage
17. ⏳ DocumentacaoPage

**Grupo 5: Detalhes (10 páginas)**
18-27. ⏳ Páginas de detalhes individuais

### 2.2 Checklist por Página

Para cada página:

**A. PRÉ-MIGRAÇÃO**
- [ ] Executar análise preventiva
- [ ] Aplicar correções automatizadas
- [ ] Verificar dependências de componentes

**B. MIGRAÇÃO**
- [ ] Criar arquivo em `app/(dashboard)/[nome]/page.tsx`
- [ ] Adicionar `'use client'` directive
- [ ] Atualizar imports:
  - `useLocation()` → `useRouter()` + `useSearchParams()`
  - `navigate()` → `router.push()`
  - `Link` do wouter → `Link` do next/link
- [ ] Usar interface canônica: `import { Entidade } from '@shared/types/entidade'`
- [ ] Copiar componentes dependentes

**C. VALIDAÇÃO**
- [ ] Build local: `pnpm build`
- [ ] Verificar tipos: `tsc --noEmit`
- [ ] Testar no browser

**D. DEPLOY**
- [ ] Commit com mensagem descritiva
- [ ] Push para GitHub
- [ ] Aguardar Vercel build
- [ ] Validar em produção

---

## 📋 PADRÕES DE CORREÇÃO AUTOMÁTICA

### Pattern 1: Toast
```typescript
// ❌ ANTES
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
toast({ title: 'Sucesso', description: 'Operação concluída' });

// ✅ DEPOIS
import { toast } from 'sonner';
toast.success('Operação concluída');
```

### Pattern 2: Estrutura Paginada
```typescript
// ❌ ANTES
projetosData?.projetos.map(...)

// ✅ DEPOIS
projetosData?.data.map(...)
```

### Pattern 3: Routers tRPC
```typescript
// ❌ ANTES
trpc.entidade.atualizar.useMutation()

// ✅ DEPOIS
trpc.entidades.update.useMutation()
```

### Pattern 4: Null vs Undefined
```typescript
// ❌ ANTES
email: formData.email || null

// ✅ DEPOIS
email: formData.email || undefined
```

### Pattern 5: Propriedades Opcionais
```typescript
// ❌ ANTES
interface Entidade {
  celular?: string | null; // Resulta em string | null | undefined
}

// ✅ DEPOIS
interface Entidade {
  celular: string | null; // Apenas string | null
}
```

---

## 🛠️ COMANDOS ÚTEIS

### Análise Preventiva
```bash
python3 scripts/analisar-codigo-antigo.py
```

### Correção Automatizada
```bash
python3 scripts/corrigir-codigo-antigo.py
```

### Build Local
```bash
cd /home/ubuntu/inteligencia-de-mercado
NODE_ENV=production pnpm build
```

### Verificar Tipos
```bash
tsc --noEmit
```

---

## 📊 MÉTRICAS DE SUCESSO

### Antes da Abordagem Sistemática
- ❌ 15 deploys para 2 páginas
- ❌ 1 erro por deploy
- ❌ Correções reativas

### Depois da Abordagem Sistemática (Meta)
- ✅ 1-2 deploys por grupo de 5 páginas
- ✅ 90%+ de sucesso no primeiro deploy
- ✅ Correções preventivas

---

## 🎓 LIÇÕES APRENDIDAS

1. **Análise Preventiva > Correção Reativa**
   - Identificar padrões ANTES de migrar
   - Corrigir código antigo PRIMEIRO

2. **Automação é Essencial**
   - Scripts de análise e correção
   - Interface canônica compartilhada

3. **Build Local Antes de Deploy**
   - Validar tipos localmente
   - Reduzir ciclos de feedback

4. **Migração em Grupos**
   - Agrupar páginas similares
   - Compartilhar componentes

5. **Documentação Contínua**
   - Registrar padrões encontrados
   - Atualizar guia conforme aprende

---

## 🚦 PRÓXIMOS PASSOS

1. ✅ Aguardar feedback do Vercel (commit 7e578c7)
2. ✅ Aplicar correções preventivas (commit 0b65e79)
3. ⏳ Migrar Grupo 2 (5 páginas) em batch
4. ⏳ Build + Deploy único
5. ⏳ Validar em produção
6. ⏳ Repetir para Grupos 3, 4, 5

---

**Data de criação:** 2025-12-05
**Última atualização:** 2025-12-05
**Status:** Fase 1 concluída, iniciando Fase 2
