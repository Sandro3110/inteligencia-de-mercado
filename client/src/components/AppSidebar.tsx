import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Home,
  Package,
  FileText,
  Zap,
  Activity,
  CheckSquare,
  TrendingUp,
  DollarSign,
  Filter,
  Settings,
  Bell,
  Calendar,
  Clock,
  FileStack,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  shortcut?: string;
}

interface NavSection {
  title: string;
  icon: any;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Início",
    icon: Home,
    defaultOpen: true,
    items: [
      { title: "Visão Geral", href: "/", icon: Home, shortcut: "Ctrl+1" },
    ],
  },
  {
    title: "Inteligência",
    icon: BarChart3,
    defaultOpen: true,
    items: [
      { title: "Mercados", href: "/mercados", icon: Package, shortcut: "Ctrl+2" },
      { title: "Research Overview", href: "/research-overview", icon: TrendingUp },
      { title: "Analytics", href: "/analytics", icon: BarChart3, shortcut: "Ctrl+3" },
      { title: "Relatórios", href: "/relatorios", icon: FileText },
      { title: "Exportação Inteligente", href: "/export", icon: Download, shortcut: "Ctrl+E" },
      { title: "Templates de Exportação", href: "/export/templates", icon: FileText },
    ],
  },
  {
    title: "Enriquecimento",
    icon: Zap,
    defaultOpen: false,
    items: [
      { title: "Nova Pesquisa", href: "/research/new", icon: Plus },
      { title: "Iniciar", href: "/enrichment", icon: Zap },
      { title: "Acompanhar", href: "/enrichment-progress", icon: Activity },
      { title: "Resultados", href: "/resultados-enriquecimento", icon: CheckSquare },
    ],
  },
  {
    title: "Performance",
    icon: TrendingUp,
    defaultOpen: false,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: BarChart3, shortcut: "Ctrl+4" },
      { title: "ROI", href: "/roi", icon: DollarSign },
      { title: "Funil", href: "/funil", icon: Filter },
    ],
  },
  {
    title: "Configurações",
    icon: Settings,
    defaultOpen: false,
    items: [
      { title: "Enriquecimento", href: "/enrichment-settings", icon: Settings },
      { title: "Alertas", href: "/alertas", icon: Bell },
      { title: "Agendamentos", href: "/agendamento", icon: Calendar },
    ],
  },
  {
    title: "Sistema",
    icon: FileStack,
    defaultOpen: false,
    items: [
      { title: "Atividades", href: "/atividade", icon: Activity },
      { title: "Histórico de Alertas", href: "/alertas/historico", icon: Clock },
      { title: "🧪 Teste Pré-Pesquisa", href: "/pre-pesquisa-teste", icon: FileStack },
    ],
  },
];

const STORAGE_KEY = 'sidebar-collapsed';

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    navSections.reduce((acc, section) => {
      acc[section.title] = section.defaultOpen ?? false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const { selectedProjectId } = useSelectedProject();
  const { data: stats } = trpc.dashboard.stats.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setLocation('/');
            break;
          case '2':
            e.preventDefault();
            setLocation('/mercados');
            break;
          case '3':
            e.preventDefault();
            setLocation('/analytics');
            break;
          case '4':
            e.preventDefault();
            setLocation('/dashboard');
            break;
          case 'b':
          case 'B':
            e.preventDefault();
            toggleSidebar();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      // Disparar evento para outras páginas ajustarem margem
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newValue } }));
      return newValue;
    });
  };

  const toggleSection = (title: string) => {
    if (!collapsed) {
      setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
    }
  };

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    const cleanLocation = location.split("?")[0];
    return cleanLocation === cleanHref;
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 overflow-y-auto z-50 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo + Toggle */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {!collapsed && (
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">Inteligência</span>
                <span className="text-sm font-semibold text-slate-900">de Mercado</span>
              </div>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/">
            <BarChart3 className="w-6 h-6 text-blue-600 cursor-pointer mx-auto" />
          </Link>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn("h-8 w-8", collapsed && "mx-auto")}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{collapsed ? "Expandir" : "Recolher"} (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Estatísticas Compactas */}
      {stats && !collapsed && (
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="text-[0.65rem] font-semibold text-slate-500 mb-2">ESTATÍSTICAS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="text-xs text-slate-600">Mercados</div>
              <div className="text-lg font-bold text-blue-600">{stats.totals?.mercados || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200 hover:border-green-300 transition-colors">
              <div className="text-xs text-slate-600">Clientes</div>
              <div className="text-lg font-bold text-green-600">{stats.totals?.clientes || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="text-xs text-slate-600">Concorrentes</div>
              <div className="text-lg font-bold text-purple-600">{stats.totals?.concorrentes || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200 hover:border-orange-300 transition-colors">
              <div className="text-xs text-slate-600">Leads</div>
              <div className="text-lg font-bold text-orange-600">{stats.totals?.leads || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="p-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            {/* Section Header */}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-center p-3 text-slate-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <section.icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{section.title}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </div>
                {openSections[section.title] ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Section Items */}
            {(openSections[section.title] || collapsed) && (
              <div className={cn("mt-1 space-y-0.5", collapsed ? "ml-0" : "ml-2")}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            <span
                              className={cn(
                                "flex items-center justify-center p-3 rounded-lg transition-all cursor-pointer",
                                active
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                              )}
                            >
                              <Icon className="w-5 h-5" />
                            </span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="flex flex-col gap-1">
                            <p>{item.title}</p>
                            {item.shortcut && (
                              <p className="text-xs text-muted-foreground">{item.shortcut}</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all cursor-pointer group relative",
                          active
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.shortcut && (
                          <span className="text-[0.65rem] text-slate-400 group-hover:text-blue-500">
                            {item.shortcut.replace('Ctrl+', '⌘')}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
