# SISTEMA DE DESIGN PREMIUM - INTELMARKET
**Temperatura 1.0 - Máxima Qualidade e Criatividade**

Data: 02/12/2025  
Versão: 2.0 Premium

---

## 🎨 DESIGN SYSTEM COMPLETO

### **1. PALETA DE CORES - DARK & LIGHT MODE**

#### **Light Mode**
```css
/* Background */
--background: 0 0% 100%           /* Branco puro */
--foreground: 222 47% 11%         /* Quase preto */

/* Cards & Containers */
--card: 0 0% 100%                 /* Branco */
--card-foreground: 222 47% 11%

/* Popover */
--popover: 0 0% 100%
--popover-foreground: 222 47% 11%

/* Primary (Roxo Inteligente) */
--primary: 262 83% 58%            /* #8b5cf6 */
--primary-foreground: 0 0% 100%

/* Secondary (Azul Confiança) */
--secondary: 217 91% 60%          /* #3b82f6 */
--secondary-foreground: 0 0% 100%

/* Muted (Cinza Suave) */
--muted: 210 40% 96%              /* #f9fafb */
--muted-foreground: 215 16% 47%   /* #6b7280 */

/* Accent (Destaque) */
--accent: 262 83% 58%
--accent-foreground: 0 0% 100%

/* Destructive (Vermelho) */
--destructive: 0 84% 60%          /* #ef4444 */
--destructive-foreground: 0 0% 100%

/* Border & Input */
--border: 214 32% 91%             /* #e5e7eb */
--input: 214 32% 91%

/* Ring (Focus) */
--ring: 262 83% 58%

/* Success */
--success: 142 71% 45%            /* #10b981 */
--success-foreground: 0 0% 100%

/* Warning */
--warning: 38 92% 50%             /* #f59e0b */
--warning-foreground: 0 0% 100%

/* Info */
--info: 217 91% 60%               /* #3b82f6 */
--info-foreground: 0 0% 100%
```

#### **Dark Mode**
```css
/* Background */
--background: 222 47% 11%         /* #0f172a - Azul escuro profundo */
--foreground: 210 40% 98%         /* Branco suave */

/* Cards & Containers */
--card: 217 33% 17%               /* #1e293b - Card elevado */
--card-foreground: 210 40% 98%

/* Popover */
--popover: 217 33% 17%
--popover-foreground: 210 40% 98%

/* Primary (Roxo Vibrante) */
--primary: 262 83% 58%            /* #8b5cf6 */
--primary-foreground: 0 0% 100%

/* Secondary (Azul Brilhante) */
--secondary: 217 91% 60%          /* #3b82f6 */
--secondary-foreground: 0 0% 100%

/* Muted (Cinza Escuro) */
--muted: 217 33% 24%              /* #334155 */
--muted-foreground: 215 20% 65%   /* #94a3b8 */

/* Accent (Destaque) */
--accent: 262 83% 58%
--accent-foreground: 0 0% 100%

/* Destructive (Vermelho Vibrante) */
--destructive: 0 84% 60%          /* #ef4444 */
--destructive-foreground: 0 0% 100%

/* Border & Input */
--border: 217 33% 24%             /* #334155 */
--input: 217 33% 24%

/* Ring (Focus) */
--ring: 262 83% 58%

/* Success */
--success: 142 71% 45%            /* #10b981 */
--success-foreground: 0 0% 100%

/* Warning */
--warning: 38 92% 50%             /* #f59e0b */
--warning-foreground: 222 47% 11%

/* Info */
--info: 217 91% 60%               /* #3b82f6 */
--info-foreground: 0 0% 100%
```

---

### **2. TIPOGRAFIA ELEGANTE**

```css
/* Escala Hierárquica */
--font-display: 'Inter', sans-serif;  /* Display/Títulos */
--font-body: 'Inter', sans-serif;     /* Corpo */
--font-mono: 'JetBrains Mono', monospace; /* Código */

/* Tamanhos */
--text-xs:   0.75rem   /* 12px - Metadados */
--text-sm:   0.875rem  /* 14px - Corpo pequeno */
--text-base: 1rem      /* 16px - Corpo padrão */
--text-lg:   1.125rem  /* 18px - Destaque */
--text-xl:   1.25rem   /* 20px - Subtítulos */
--text-2xl:  1.5rem    /* 24px - Títulos seção */
--text-3xl:  1.875rem  /* 30px - Títulos página */
--text-4xl:  2.25rem   /* 36px - Hero */
--text-5xl:  3rem      /* 48px - Display */

/* Pesos */
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800

/* Line Heights */
--leading-tight: 1.25
--leading-snug: 1.375
--leading-normal: 1.5
--leading-relaxed: 1.625
--leading-loose: 2

/* Letter Spacing */
--tracking-tight: -0.025em
--tracking-normal: 0
--tracking-wide: 0.025em
```

---

### **3. ESPAÇAMENTO SISTEMA 8px**

```css
/* Escala de Espaçamento */
--space-0: 0
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

---

### **4. BOTÕES POR FUNÇÃO**

#### **Variantes e Uso**

```tsx
// PRIMARY - Ação principal (salvar, criar, confirmar)
<Button variant="default" className="bg-primary hover:bg-primary/90">
  Salvar Projeto
</Button>

// SECONDARY - Ação secundária (cancelar, voltar)
<Button variant="secondary" className="bg-secondary hover:bg-secondary/90">
  Ver Detalhes
</Button>

// OUTLINE - Ação terciária (filtros, opções)
<Button variant="outline">
  Filtrar
</Button>

// GHOST - Ação sutil (fechar, minimizar)
<Button variant="ghost">
  Cancelar
</Button>

// DESTRUCTIVE - Ação destrutiva (deletar, remover)
<Button variant="destructive">
  Excluir Projeto
</Button>

// SUCCESS - Ação de sucesso (aprovar, ativar)
<Button className="bg-success hover:bg-success/90 text-white">
  Aprovar
</Button>

// WARNING - Ação de aviso (pausar, adiar)
<Button className="bg-warning hover:bg-warning/90 text-white">
  Pausar Processamento
</Button>

// INFO - Ação informativa (ajuda, tutorial)
<Button className="bg-info hover:bg-info/90 text-white">
  Ver Tutorial
</Button>
```

#### **Tamanhos**

```tsx
<Button size="sm">Pequeno</Button>     /* h-8 px-3 text-xs */
<Button size="default">Padrão</Button> /* h-10 px-4 text-sm */
<Button size="lg">Grande</Button>      /* h-11 px-8 text-base */
<Button size="icon">🔍</Button>        /* h-10 w-10 */
```

---

### **5. SIDEBAR COLAPSÁVEL**

#### **Estrutura**

```tsx
<aside className={cn(
  "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
  "bg-card border-r border-border",
  isCollapsed ? "w-16" : "w-64"
)}>
  {/* Header */}
  <div className="flex items-center justify-between p-4 border-b border-border">
    {!isCollapsed && (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
        <span className="font-bold text-lg">Intelmarket</span>
      </div>
    )}
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
    </Button>
  </div>

  {/* Menu */}
  <nav className="p-2 space-y-1">
    {menuItems.map(item => (
      <SidebarItem 
        key={item.path}
        icon={item.icon}
        label={item.label}
        path={item.path}
        isCollapsed={isCollapsed}
        isActive={location.pathname === item.path}
      />
    ))}
  </nav>

  {/* Footer */}
  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
    <ThemeToggle />
  </div>
</aside>
```

#### **Menu Items**

```tsx
const menuItems = [
  // INÍCIO
  {
    icon: Home,
    label: "Dashboard",
    path: "/",
    color: "text-primary"
  },

  // CONFIGURAÇÃO
  {
    icon: FolderKanban,
    label: "Projetos",
    path: "/projetos",
    color: "text-secondary"
  },
  {
    icon: Search,
    label: "Pesquisas",
    path: "/pesquisas",
    color: "text-secondary"
  },

  // COLETA DE DADOS
  {
    icon: Upload,
    label: "Importar Dados",
    path: "/importacao",
    color: "text-info"
  },
  {
    icon: FileText,
    label: "Histórico",
    path: "/importacoes",
    color: "text-info"
  },

  // ENRIQUECIMENTO
  {
    icon: Sparkles,
    label: "Processar com IA",
    path: "/enriquecimento",
    color: "text-warning"
  },
  {
    icon: Database,
    label: "Base de Entidades",
    path: "/entidades",
    color: "text-warning"
  },

  // ANÁLISE
  {
    icon: Layers,
    label: "Explorador Inteligente",
    path: "/dimensional/cubo",
    color: "text-success"
  },
  {
    icon: TrendingUp,
    label: "Tendências no Tempo",
    path: "/dimensional/temporal",
    color: "text-success"
  },
  {
    icon: MapPin,
    label: "Mapa de Oportunidades",
    path: "/dimensional/geografia",
    color: "text-success"
  },
  {
    icon: Network,
    label: "Hierarquia de Mercados",
    path: "/dimensional/mercado",
    color: "text-success"
  },
  {
    icon: Eye,
    label: "Visão 360°",
    path: "/dimensional/entidade",
    color: "text-success"
  }
];
```

---

### **6. FEEDBACK SYSTEM**

#### **Toast Notifications**

```tsx
import { toast } from "sonner";

// SUCCESS
toast.success("Projeto criado com sucesso!", {
  description: "Você pode começar a importar dados agora.",
  duration: 4000
});

// ERROR
toast.error("Erro ao processar arquivo", {
  description: "O arquivo CSV está corrompido. Tente novamente.",
  duration: 5000
});

// WARNING
toast.warning("Processamento em andamento", {
  description: "Aguarde a conclusão antes de fazer novas importações.",
  duration: 4000
});

// INFO
toast.info("Nova funcionalidade disponível!", {
  description: "Confira o novo Explorador Inteligente.",
  duration: 6000
});

// LOADING
toast.loading("Processando com IA...", {
  description: "Isso pode levar alguns minutos."
});

// PROMISE (com loading automático)
toast.promise(
  enrichmentMutation.mutateAsync(data),
  {
    loading: "Enriquecendo dados com IA...",
    success: "Enriquecimento concluído!",
    error: "Erro no enriquecimento"
  }
);
```

#### **Loading States**

```tsx
// Skeleton Loader
<Card className="p-6">
  <Skeleton className="h-8 w-48 mb-4" />
  <Skeleton className="h-4 w-full mb-2" />
  <Skeleton className="h-4 w-3/4" />
</Card>

// Spinner
<div className="flex items-center justify-center h-64">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>

// Progress Bar
<Progress value={progress} className="w-full" />
```

#### **Empty States**

```tsx
<div className="flex flex-col items-center justify-center h-64 text-center">
  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
    <Inbox className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">
    Nenhum projeto encontrado
  </h3>
  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
    Comece criando seu primeiro projeto para organizar suas análises de mercado.
  </p>
  <Button onClick={() => navigate("/projetos/novo")}>
    <Plus className="h-4 w-4 mr-2" />
    Criar Primeiro Projeto
  </Button>
</div>
```

#### **Error States**

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erro ao carregar dados</AlertTitle>
  <AlertDescription>
    Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
  </AlertDescription>
  <Button 
    variant="outline" 
    size="sm" 
    onClick={refetch}
    className="mt-4"
  >
    Tentar Novamente
  </Button>
</Alert>
```

---

### **7. TRANSIÇÕES FLUIDAS**

#### **Page Transitions**

```tsx
// Framer Motion
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
  {/* Conteúdo da página */}
</motion.div>
```

#### **Micro-interações**

```css
/* Hover suave */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Focus ring elegante */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Slide in */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
```

---

### **8. COMPONENTES BASE**

#### **PageHeader**

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  actions,
  breadcrumbs 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### **StatCard (KPI)**

```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = "neutral",
  color = "primary"
}: StatCardProps) {
  const colorClasses = {
    primary: "from-primary/10 to-primary/5 text-primary",
    secondary: "from-secondary/10 to-secondary/5 text-secondary",
    success: "from-success/10 to-success/5 text-success",
    warning: "from-warning/10 to-warning/5 text-warning",
    destructive: "from-destructive/10 to-destructive/5 text-destructive"
  };

  return (
    <Card className="p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
          colorClasses[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        {change !== undefined && (
          <Badge variant={trend === "up" ? "success" : trend === "down" ? "destructive" : "secondary"}>
            {trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
            {change > 0 ? "+" : ""}{change}%
          </Badge>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-1">
        {value}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {title}
      </div>
    </Card>
  );
}
```

---

### **9. TRATAMENTO DE ERROS**

#### **Error Boundary**

```tsx
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="max-w-md text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Algo deu errado
            </h2>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro inesperado. Por favor, recarregue a página ou entre em contato com o suporte.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### **Query Error Handler**

```tsx
function useQueryErrorHandler() {
  return (error: unknown) => {
    if (error instanceof Error) {
      toast.error("Erro ao carregar dados", {
        description: error.message
      });
    } else {
      toast.error("Erro desconhecido", {
        description: "Tente novamente mais tarde"
      });
    }
  };
}
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: Sistema de Design (1h)**
- [ ] Atualizar `index.css` com paleta dark/light completa
- [ ] Adicionar variáveis CSS customizadas
- [ ] Criar componentes base (PageHeader, StatCard, etc)
- [ ] Configurar Framer Motion para transições

### **FASE 2: Sidebar (1h)**
- [ ] Criar componente Sidebar colapsável
- [ ] Implementar menu com ícones intuitivos
- [ ] Adicionar ThemeToggle
- [ ] Configurar navegação ativa

### **FASE 3: Feedback System (1h)**
- [ ] Configurar Sonner para toasts
- [ ] Criar componentes de loading
- [ ] Criar componentes de empty state
- [ ] Criar componentes de error state
- [ ] Implementar ErrorBoundary

### **FASE 4: Refinar 15 Páginas (3h)**
- [ ] Aplicar PageHeader em todas as páginas
- [ ] Adicionar feedback em todas as ações
- [ ] Implementar tratamento de erros
- [ ] Ajustar cores de botões por função
- [ ] Adicionar transições fluidas

### **FASE 5: Polimento (1h)**
- [ ] Testar dark/light mode em todas as páginas
- [ ] Validar responsividade
- [ ] Testar micro-interações
- [ ] Corrigir bugs visuais

### **FASE 6: Deploy (30min)**
- [ ] Corrigir Tailwind config
- [ ] Testar build
- [ ] Deploy Vercel
- [ ] Validação final

---

**TOTAL:** ~7.5 horas

**Pronto para começar! 🚀**
