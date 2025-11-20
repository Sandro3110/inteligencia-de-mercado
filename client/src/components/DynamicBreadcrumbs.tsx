import { Link, useLocation } from "wouter";
import { 
  ChevronRight, 
  Home, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Filter, 
  FileText, 
  Activity, 
  Bell, 
  Calendar,
  Settings,
  Zap,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Mapeamento de rotas para labels e ícones
const routeMap: Record<string, { label: string; icon?: any }> = {
  "/": { label: "Início", icon: Home },
  "/dashboard": { label: "Dashboard", icon: BarChart3 },
  "/dashboard-avancado": { label: "Dashboard Avançado", icon: BarChart3 },
  "/mercados": { label: "Mercados", icon: Target },
  "/enrichment": { label: "Novo Enriquecimento", icon: Zap },
  "/enrichment-progress": { label: "Monitorar Progresso", icon: Activity },
  "/enrichment-settings": { label: "Configurações", icon: Settings },
  "/resultados-enriquecimento": { label: "Resultados", icon: FileText },
  "/analytics": { label: "Analytics", icon: BarChart3 },
  "/analytics-dashboard": { label: "Analytics Dashboard", icon: BarChart3 },
  "/roi": { label: "ROI & Conversão", icon: TrendingUp },
  "/funil": { label: "Funil de Vendas", icon: Filter },
  "/relatorios": { label: "Relatórios", icon: FileText },
  "/atividade": { label: "Atividades", icon: Activity },
  "/alertas": { label: "Alertas", icon: Bell },
  "/alertas/historico": { label: "Histórico de Alertas", icon: Bell },
  "/agendamento": { label: "Agendamentos", icon: Calendar },
};

export function DynamicBreadcrumbs() {
  const [location] = useLocation();
  
  // Se estiver na home, não mostrar breadcrumbs
  if (location === "/") {
    return null;
  }

  const pathSegments = location.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Início", href: "/" }
  ];

  // Construir breadcrumbs baseado nos segmentos da URL
  let currentPath = "";
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const routeInfo = routeMap[currentPath];
    const label = routeInfo?.label || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  }

  const canGoBack = breadcrumbs.length > 2; // Mais de 2 níveis (Início + atual)

  return (
    <nav className="flex items-center gap-3 text-sm">
      {/* Botão Voltar */}
      {canGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}
      
      <div className="flex items-center gap-2 text-muted-foreground">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;
        
        return (
          <div key={item.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
            {(() => {
              const routeInfo = routeMap[item.href];
              const Icon = routeInfo?.icon;
              
              return isLast ? (
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              ) : (
                <Link href={item.href}>
                  <span className={cn(
                    "hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5",
                    "hover:underline"
                  )}>
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </span>
                </Link>
              );
            })()}
          </div>
        );
      })}
      </div>
    </nav>
  );
}
