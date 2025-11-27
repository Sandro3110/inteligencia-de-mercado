# 🔍 ANÁLISE - PROVIDERS FALTANTES NO LAYOUT

**Data:** 27 de Novembro de 2025  
**Status:** ❌ **ERRO CRÍTICO DETECTADO**

---

## 🚨 ERRO ATUAL

```
Error: useOnboarding must be used within an OnboardingProvider
```

**URL:** https://www.intelmarket.app  
**Causa:** Componentes dinâmicos no layout usam Contexts mas os Providers não foram adicionados

---

## 📊 COMPONENTES DINÂMICOS NO LAYOUT

### Componentes Carregados
```typescript
const OnboardingTour = nextDynamic(() => import('@/components/OnboardingTour'), { ssr: false });
const ContextualTour = nextDynamic(() => import('@/components/ContextualTour'), { ssr: false });
const ThemeToggle = nextDynamic(() => import('@/components/ThemeToggle'), { ssr: false });
const CompactModeToggle = nextDynamic(() => import('@/components/CompactModeToggle'), { ssr: false });
const NotificationBell = nextDynamic(() => import('@/components/NotificationBell'), { ssr: false });
const GlobalSearch = nextDynamic(() => import('@/components/GlobalSearch'), { ssr: false });
const GlobalShortcuts = nextDynamic(() => import('@/components/GlobalShortcuts'), { ssr: false });
const DraftRecoveryModal = nextDynamic(() => import('@/components/DraftRecoveryModal'), { ssr: false });
```

---

## ❌ PROVIDERS FALTANTES

### 1. **OnboardingProvider** (CRÍTICO)
**Componentes que dependem:**
- `OnboardingTour` - usa `useOnboarding()`
- `ContextualTour` - usa `useTour()` (não precisa de provider)

**Import necessário:**
```typescript
import { OnboardingProvider } from '@/contexts/OnboardingContext';
```

**Localização:** `contexts/OnboardingContext.tsx` ✅ (existe)

---

### 2. **ThemeProvider** (CRÍTICO)
**Componentes que dependem:**
- `ThemeToggle` - usa `useTheme()`

**Import necessário:**
```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';
```

**Localização:** `contexts/ThemeContext.tsx` ✅ (existe)

---

### 3. **CompactModeProvider** (CRÍTICO)
**Componentes que dependem:**
- `CompactModeToggle` - usa `useCompactMode()`

**Import necessário:**
```typescript
import { CompactModeProvider } from '@/contexts/CompactModeContext';
```

**Localização:** `contexts/CompactModeContext.tsx` ✅ (existe)

---

### 4. **NotificationsProvider** (VERIFICAR)
**Componentes que dependem:**
- `NotificationBell` - usa `useNotifications()`

**Status:** Verificar se `useNotifications` é um hook standalone ou precisa de provider

---

## ✅ PROVIDERS JÁ PRESENTES

### 1. **ProjectProvider**
```typescript
import { ProjectProvider } from '@/lib/contexts/ProjectContext';
```
✅ Já está no layout

---

## 🔧 SOLUÇÃO

### Estrutura Correta do Layout

```typescript
'use client';

import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CompactModeProvider } from '@/contexts/CompactModeContext';
import { ProjectProvider } from '@/lib/contexts/ProjectContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CompactModeProvider>
        <OnboardingProvider>
          <ProjectProvider>
            {/* Componentes dinâmicos */}
            <GlobalShortcuts />
            <OnboardingTour />
            <ContextualTour />
            <DraftRecoveryModal />
            
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Header>
                  {/* Header content */}
                </Header>
                <main className="flex-1 overflow-auto">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </div>
          </ProjectProvider>
        </OnboardingProvider>
      </CompactModeProvider>
    </ThemeProvider>
  );
}
```

---

## 📋 ORDEM DE PROVIDERS (IMPORTANTE)

**Hierarquia recomendada (de fora para dentro):**

1. **ThemeProvider** (mais externo - afeta tudo)
2. **CompactModeProvider** (UI global)
3. **OnboardingProvider** (tour/onboarding)
4. **ProjectProvider** (dados de projeto)
5. **Componentes e children** (mais interno)

---

## 🎯 COMPONENTES QUE NÃO PRECISAM DE PROVIDER

### Hooks Standalone (sem Context)
- `GlobalSearch` - usa `useSearch()` (hook standalone)
- `GlobalShortcuts` - usa `useKeyboardShortcuts()` (hook standalone)
- `ContextualTour` - usa `useTour()` (hook standalone)
- `DraftRecoveryModal` - usa `useDrafts()` (hook standalone)

Estes componentes funcionam sem provider porque seus hooks não usam `createContext`.

---

## ⚠️ VERIFICAÇÕES ADICIONAIS

### 1. Verificar useNotifications
```bash
grep -E "(createContext|useContext)" hooks/useNotifications.ts
```

Se retornar algo, precisa de `NotificationsProvider`.

### 2. Verificar FilterContext
```bash
grep -l "FilterContext" components/*.tsx
```

Se algum componente no layout usar, precisa de `FilterProvider`.

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Adicionar `OnboardingProvider` no layout
2. ✅ Adicionar `ThemeProvider` no layout
3. ✅ Adicionar `CompactModeProvider` no layout
4. ⚠️ Verificar se `NotificationsProvider` é necessário
5. ✅ Testar site em produção
6. ✅ Fazer novo deploy

---

## 📊 RESUMO

| Provider | Status | Componente Dependente | Crítico |
|----------|--------|----------------------|---------|
| OnboardingProvider | ❌ Faltando | OnboardingTour | ✅ SIM |
| ThemeProvider | ❌ Faltando | ThemeToggle | ✅ SIM |
| CompactModeProvider | ❌ Faltando | CompactModeToggle | ✅ SIM |
| NotificationsProvider | ⚠️ Verificar | NotificationBell | ⚠️ Talvez |
| ProjectProvider | ✅ Presente | Vários | ✅ SIM |

---

**Status:** Análise Completa - Pronto para Correção
