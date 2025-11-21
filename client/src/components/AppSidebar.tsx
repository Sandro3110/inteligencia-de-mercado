import { useLocation, Link } from "wouter";
import {
  BarChart3,
  Home,
  Package,
  FileText,
  Zap,
  Activity,
  TrendingUp,
  DollarSign,
  Filter,
  Settings,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Download,
  History,
  Folder,
  PlayCircle,
  Eye,
  CheckCircle,
  FileStack,
  Clock,
  Sparkles,
  FolderOpen,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useSelectedPesquisa } from "@/hooks/useSelectedPesquisa";
import { useGlobalRefresh } from "@/hooks/useGlobalRefresh";
import { ProjectSelector } from "@/components/ProjectSelector";
import { PesquisaSelector } from "@/components/PesquisaSelector";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  shortcut?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: any;
  items: NavItem[];
  defaultOpen?: boolean;
  priority?: 'core' | 'high' | 'medium' | 'low';
}

/**
 * Fase 58: Reorganização completa do menu
 * Prioridades:
 * 1. CORE: Enriquecimento, Exportação, Gestão de Projetos
 * 2. Análise e Inteligência
 * 3. Configurações e Automação
 * 4. Sistema e Histórico
 */
const navSections: NavSection[] = [
  // ========================================
  // 🎯 CORE DO SISTEMA (Prioridade Máxima)
  // ========================================
  {
    title: "🎯 Core",
    icon: Zap,
    priority: 'core',
    defaultOpen: true,
    items: [
      { title: "Visão Geral", href: "/", icon: Home, shortcut: "Ctrl+H" },
      { title: "Nova Pesquisa", href: "/research/new", icon: Plus, badge: "Criar" },
      { title: "Enriquecer Dados", href: "/enrichment", icon: Sparkles, shortcut: "Ctrl+E" },
      { title: "Acompanhar Progresso", href: "/enrichment-progress", icon: Activity },
      { title: "Ver Resultados", href: "/resultados-enriquecimento", icon: CheckCircle },
      { title: "Exportar Dados", href: "/export", icon: Download, shortcut: "Ctrl+X" },
      { title: "Gerenciar Projetos", href: "/projetos", icon: FolderOpen, badge: "Novo" },
    ],
  },

  // ========================================
  // 📊 ANÁLISE E INTELIGÊNCIA
  // ========================================
  {
    title: "📊 Análise",
    icon: BarChart3,
    priority: 'high',
    defaultOpen: false,
    items: [
      { title: "Mercados", href: "/mercados", icon: Package, shortcut: "Ctrl+M" },
      { title: "Analytics Avançado", href: "/analytics", icon: BarChart3, shortcut: "Ctrl+A" },
      { title: "Dashboard Avançado", href: "/dashboard-avancado", icon: BarChart3 },
      { title: "Analytics Dashboard", href: "/analytics-dashboard", icon: BarChart3 },
      { title: "Tendências", href: "/tendencias", icon: TrendingUp },
      { title: "ROI e Performance", href: "/roi", icon: DollarSign, shortcut: "Ctrl+R" },
      { title: "Funil de Conversão", href: "/funil", icon: Filter },
      { title: "Relatórios", href: "/relatorios", icon: FileText },
      { title: "Visão Pesquisa", href: "/research-overview", icon: Eye },
    ],
  },

  // ========================================
  // ⚙️ CONFIGURAÇÕES E AUTOMAÇÃO
  // ========================================
  {
    title: "⚙️ Configurações",
    icon: Settings,
    priority: 'medium',
    defaultOpen: false,
    items: [
      { title: "Templates Exportação", href: "/export/templates", icon: FileText },
      { title: "Parâmetros Enriquecimento", href: "/enrichment-settings", icon: Settings },
      { title: "Alertas Inteligentes", href: "/intelligent-alerts", icon: Sparkles },
      { title: "Configurar Alertas", href: "/alertas", icon: Bell },
      { title: "Agendamentos", href: "/agendamento", icon: Calendar },
      { title: "Configurar IA (LLM)", href: "/admin/llm", icon: Zap },
    ],
  },

  // ========================================
  // 📁 SISTEMA E HISTÓRICO
  // ========================================
  {
    title: "📁 Sistema",
    icon: FileStack,
    priority: 'low',
    defaultOpen: false,
    items: [
      { title: "Notificações", href: "/notificacoes", icon: Bell, badge: "Novo" },
      { title: "Histórico de Notificações", href: "/notificacoes/historico", icon: FileText },
      { title: "Histórico de Exportações", href: "/export/historico", icon: Download },
      { title: "Geocodificação", href: "/geocodificacao", icon: MapPin, badge: "Novo" },
      { title: "Preferências de Notificações", href: "/configuracoes/notificacoes", icon: Settings },
      { title: "Monitoramento", href: "/monitoring", icon: Activity },
      { title: "Atividade de Projetos", href: "/projetos/atividade", icon: FolderOpen, badge: "Novo" },
      { title: "Registro de Atividades", href: "/atividade", icon: Clock },
      { title: "Histórico de Alertas", href: "/alertas/historico", icon: Bell },
      { title: "Dashboard Geral", href: "/dashboard", icon: BarChart3, shortcut: "Ctrl+D" },
    ],
  },
];

const STORAGE_KEY = 'sidebar-collapsed';
const PINNED_KEY = 'sidebar-pinned';

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });
  const [pinned, setPinned] = useState(() => {
    const stored = localStorage.getItem(PINNED_KEY);
    return stored === 'true';
  });
  const [hovering, setHovering] = useState(false);
  // Sidebar está expandida se estiver fixada OU em hover
  const isExpanded = pinned || hovering;
  const [peekLabel, setPeekLabel] = useState<string | null>(null);
  const [peekTimeout, setPeekTimeout] = useState<NodeJS.Timeout | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    return navSections.reduce((acc, section) => {
      acc[section.title] = section.defaultOpen ?? false;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const { selectedProjectId } = useSelectedProject();
  const { 
    refreshAll, 
    isRefreshing, 
    timeSinceRefresh, 
    autoRefreshEnabled, 
    toggleAutoRefresh,
    isDataStale,
  } = useGlobalRefresh({ enableAutoRefresh: false });
  const { data: stats } = trpc.dashboard.stats.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  // Listener para evento de toggle sidebar
  useEffect(() => {
    const handleToggle = () => toggleSidebar();
    window.addEventListener('toggle-sidebar' as any, handleToggle);
    return () => window.removeEventListener('toggle-sidebar' as any, handleToggle);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      // Disparar evento para outras páginas ajustarem margem
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newValue } }));
      return newValue;
    });
  };

  const togglePinned = () => {
    setPinned(prev => {
      const newValue = !prev;
      localStorage.setItem(PINNED_KEY, String(newValue));
      return newValue;
    });
  };

  const toggleSection = (title: string) => {
    if (isExpanded) {
      setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
    }
  };

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    const cleanLocation = location.split("?")[0];
    return cleanLocation === cleanHref;
  };

  // Cores por prioridade
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'core': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600';
    }
  };

  return (
    <aside 
      onMouseEnter={() => !pinned && setHovering(true)}
      onMouseLeave={() => !pinned && setHovering(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 overflow-y-auto overflow-x-hidden z-50 transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Logo + Toggle + Pin */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
        {isExpanded && (
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">Gestor PAV</span>
                <span className="text-xs text-slate-500">Inteligência de Mercado</span>
              </div>
            </span>
          </Link>
        )}
        {!isExpanded && (
          <Link href="/">
            <BarChart3 className="w-6 h-6 text-blue-600 cursor-pointer mx-auto" />
          </Link>
        )}
        {/* Botão de Fixar - SEMPRE VISÍVEL quando expandido */}
        {isExpanded && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePinned}
                className={cn(
                  "h-8 w-8 shrink-0",
                  pinned ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "hover:bg-slate-100"
                )}
              >
                {pinned ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {pinned ? 'Desafixar menu' : 'Fixar menu'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Seção de Seleção de Projeto e Pesquisa */}
      {isExpanded && (
        <div className="p-4 border-b-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 max-w-full overflow-hidden">
          <div className="space-y-3 max-w-full overflow-hidden">
            {/* Seletor de Projeto */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  📁 Projeto
                </label>
              </div>
              <ProjectSelector />
            </div>

            {/* Seletor de Pesquisa */}
            {selectedProjectId ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    🔍 Pesquisa
                  </label>
                  <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    Ativa
                  </span>
                </div>
                <PesquisaSelector />
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-2">
                Selecione um projeto primeiro
              </div>
            )}

            {/* Botão de Atualização */}
            <Button
              onClick={() => refreshAll()}
              disabled={isRefreshing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              <Activity className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Atualizando..." : "Atualizar Dados"}
            </Button>

            {/* Timestamp da última atualização + Indicador de dados desatualizados */}
            <div className="flex items-center justify-between gap-2">
              {timeSinceRefresh && (
                <div className={cn(
                  "text-[10px] text-slate-500 flex items-center gap-1",
                  isDataStale && "text-orange-600 font-semibold"
                )}>
                  {isDataStale && <span className="animate-pulse">⚠️</span>}
                  ⏱️ Atualizado {timeSinceRefresh}
                </div>
              )}
              
              {/* Toggle Auto-refresh */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleAutoRefresh}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 px-2 text-[10px]",
                      autoRefreshEnabled 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {autoRefreshEnabled ? (
                      <>
                        <Activity className="w-3 h-3 mr-1 animate-pulse" />
                        Auto
                      </>
                    ) : (
                      <>
                        <Activity className="w-3 h-3 mr-1" />
                        Manual
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {autoRefreshEnabled 
                    ? "Auto-refresh ativo (5min)" 
                    : "Clique para ativar auto-refresh"}
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Badge de dados desatualizados (destaque maior) */}
            {isDataStale && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-orange-50 border border-orange-200 rounded-md">
                <span className="text-orange-600 text-xs font-semibold animate-pulse">
                  ⚠️ Dados podem estar desatualizados
                </span>
              </div>
            )}

            {/* Estatísticas Rápidas */}
            {selectedProjectId && stats && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-md shadow-sm">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Mercados</span>
                    <span className="text-xs font-bold text-slate-900">{stats.totals.mercados}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-md shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Leads</span>
                    <span className="text-xs font-bold text-slate-900">{stats.totals.leads}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-2">
        {navSections.map((section) => {
          const isOpen = openSections[section.title];
          const SectionIcon = section.icon;

          return (
            <div key={section.title} className="mb-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors",
                  !isExpanded ? "justify-center" : "",
                  section.priority === 'core' ? "hover:bg-blue-50" : "hover:bg-slate-100"
                )}
              >
                {!isExpanded ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <SectionIcon className={cn("w-5 h-5", section.priority === 'core' ? 'text-blue-600' : 'text-slate-600')} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {section.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <SectionIcon className={cn("w-4 h-4", section.priority === 'core' ? 'text-blue-600' : 'text-slate-600')} />
                      <span className={cn(
                        "text-sm font-semibold",
                        section.priority === 'core' ? 'text-blue-700' : 'text-slate-700'
                      )}>
                        {section.title}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </>
                )}
              </button>

              {/* Section Items */}
              {(isOpen || collapsed) && (
                <div className={cn("mt-1", collapsed ? "space-y-1" : "ml-2 space-y-0.5")}>
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link key={item.href} href={item.href}>
                        {!isExpanded ? (
                          <div className="relative">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  onClick={(e) => {
                                    // Mostrar peek animation
                                    e.preventDefault();
                                    setPeekLabel(item.title);
                                    
                                    // Limpar timeout anterior se existir
                                    if (peekTimeout) clearTimeout(peekTimeout);
                                    
                                    // Navegar após 1.2 segundos
                                    const timeout = setTimeout(() => {
                                      setLocation(item.href);
                                      setPeekLabel(null);
                                    }, 1200);
                                    
                                    setPeekTimeout(timeout);
                                  }}
                                  className={cn(
                                    "flex items-center justify-center p-2 rounded-md transition-colors relative cursor-pointer",
                                    active
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-slate-600 hover:bg-slate-100"
                                  )}
                                >
                                  {/* Dot colorido quando item está ativo */}
                                  {active && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                  )}
                                  <ItemIcon className="w-5 h-5" />
                                {/* Badge de notificações não lidas (collapsed) */}
                                {item.href === "/notificacoes" && unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold">
                                      {unreadCount > 9 ? '9' : unreadCount}
                                    </span>
                                  </span>
                                )}
                              </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div>
                                {item.title}
                                {item.shortcut && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    {item.shortcut}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Peek animation - tooltip expandido */}
                          <AnimatePresence>
                            {peekLabel === item.title && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                              >
                                <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border whitespace-nowrap">
                                  {item.title}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        ) : (
                          <a
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-md transition-colors group",
                              active
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <ItemIcon className="w-4 h-4" />
                              <span className="text-sm">{item.title}</span>
                            </div>
                            {/* Badge de notificações não lidas */}
                            {item.href === "/notificacoes" && unreadCount > 0 ? (
                              <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              </span>
                            ) : item.badge ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                {item.badge}
                              </span>
                            ) : null}
                            {item.shortcut && !item.badge && (
                              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.shortcut}
                              </span>
                            )}
                          </a>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 text-center">
            Gestor PAV v2.0
          </div>
        </div>
      )}
    </aside>
  );
}
