import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeMap: Record<string, string> = {
  "/": "Início",
  "/dashboard": "Dashboard",
  "/dashboard-avancado": "Dashboard Avançado",
  "/mercados": "Mercados",
  "/enrichment": "Novo Enriquecimento",
  "/enrichment-progress": "Monitorar Progresso",
  "/enrichment-settings": "Configurações de Enriquecimento",
  "/resultados-enriquecimento": "Resultados do Enriquecimento",
  "/analytics": "Analytics",
  "/analytics-dashboard": "Analytics Dashboard",
  "/roi": "ROI & Conversão",
  "/funil": "Funil de Vendas",
  "/relatorios": "Relatórios",
  "/atividade": "Atividades",
  "/alertas": "Alertas",
  "/alertas/historico": "Histórico de Alertas",
  "/agendamento": "Agendamentos",
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
    const label = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;
        
        return (
          <div key={item.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-1">
                {isFirst && <Home className="w-4 h-4" />}
                {item.label}
              </span>
            ) : (
              <Link href={item.href}>
                <span className={cn(
                  "hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1",
                  isFirst && "flex items-center gap-1"
                )}>
                  {isFirst && <Home className="w-4 h-4" />}
                  {item.label}
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
