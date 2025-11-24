import { Link, useLocation } from "wouter";
import { CompactModeToggle } from "./CompactModeToggle";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Home,
  BarChart3,
  Database,
  TrendingUp,
  Settings,
  Clock,
  FileText,
  Bell,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: "Início",
    href: "/",
    icon: Home,
    description: "Visão geral e seleção de mercados",
  },
  {
    title: "Mercados",
    href: "/mercados",
    icon: Database,
    description: "Explorar mercados identificados",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Estatísticas e métricas gerais",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    description: "Análises avançadas e insights",
  },
  {
    title: "Enriquecimento",
    href: "/enrichment",
    icon: Settings,
    description: "Configurar e executar enriquecimento",
  },
  {
    title: "Configurações",
    href: "/enrichment-settings",
    icon: Settings,
    description: "API keys e critérios de enriquecimento",
  },
  {
    title: "Monitoramento",
    href: "/enrichment-progress",
    icon: Clock,
    description: "Acompanhar progresso em tempo real",
  },
  {
    title: "Alertas",
    href: "/alertas",
    icon: Bell,
    description: "Configurar alertas personalizados",
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: FileText,
    description: "Gerar relatórios executivos em PDF",
  },
  {
    title: "ROI",
    href: "/roi",
    icon: TrendingUp,
    description: "Dashboard de ROI e conversões",
  },
  {
    title: "Funil",
    href: "/funil",
    icon: BarChart3,
    description: "Visualizar funil de vendas",
  },
  {
    title: "Agendamento",
    href: "/agendamento",
    icon: Clock,
    description: "Agendar enriquecimentos recorrentes",
  },
  {
    title: "Atividade",
    href: "/atividade",
    icon: Activity,
    description: "Timeline de atividades do sistema",
  },
];

export default function MainNav() {
  const [location] = useLocation();
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Inteligência de Mercado</span>
        </div>

        <div className="flex flex-1 items-center space-x-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.title}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {!hasCompletedOnboarding && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startOnboarding}
              className="text-xs"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Tour
            </Button>
          )}
          <div className="compact-mode-toggle">
            <CompactModeToggle />
          </div>
          <button
            className="relative p-2 rounded-md hover:bg-accent transition-colors"
            title="Alertas e notificações"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </nav>
  );
}
