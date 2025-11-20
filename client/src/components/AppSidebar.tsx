import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Database,
  Users,
  Target,
  TrendingUp,
  Package,
  Search,
  Filter,
  Tag,
  Plus,
  Download,
  GitCompare,
  CheckSquare,
  PieChart,
  DollarSign,
  FileText,
  Activity,
  Settings,
  Bell,
  Calendar,
  HardDrive,
  Home,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

interface NavSection {
  title: string;
  icon: any;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Visão Geral",
    icon: Home,
    defaultOpen: true,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "Dados",
    icon: Database,
    defaultOpen: true,
    items: [
      { title: "Mercados", href: "/cascade", icon: Target },
      { title: "Clientes", href: "/cascade?view=clientes", icon: Users },
      { title: "Concorrentes", href: "/cascade?view=concorrentes", icon: GitCompare },
      { title: "Leads", href: "/cascade?view=leads", icon: TrendingUp },
      { title: "Produtos", href: "/mercados", icon: Package },
    ],
  },
  {
    title: "Busca & Filtros",
    icon: Search,
    defaultOpen: false,
    items: [
      { title: "Busca Global", href: "/cascade?focus=search", icon: Search },
      { title: "Filtros Avançados", href: "/cascade?focus=filters", icon: Filter },
      { title: "Tags", href: "/cascade?focus=tags", icon: Tag },
    ],
  },
  {
    title: "Ações",
    icon: Settings,
    defaultOpen: false,
    items: [
      { title: "Novo Projeto", href: "/enrichment-flow", icon: Plus },
      { title: "Exportar Dados", href: "/cascade?action=export", icon: Download },
      { title: "Comparar Mercados", href: "/cascade?action=compare", icon: GitCompare },
      { title: "Validação em Lote", href: "/cascade?action=validate", icon: CheckSquare },
    ],
  },
  {
    title: "Análise",
    icon: PieChart,
    defaultOpen: false,
    items: [
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
      { title: "ROI & Conversão", href: "/roi", icon: DollarSign },
      { title: "Funil de Vendas", href: "/funil", icon: TrendingUp },
      { title: "Relatórios", href: "/relatorios", icon: FileText },
      { title: "Atividades", href: "/atividade", icon: Activity },
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
      { title: "Cache", href: "/admin/cache", icon: HardDrive },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
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

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => {
    // Remove query params for comparison
    const cleanHref = href.split("?")[0];
    const cleanLocation = location.split("?")[0];
    return cleanLocation === cleanHref;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 overflow-y-auto z-50">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Inteligência</span>
              <span className="text-sm font-semibold text-slate-900">de Mercado</span>
            </div>
          </span>
        </Link>
      </div>

      {/* Estatísticas Compactas */}
      {stats && (
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="text-[0.65rem] font-semibold text-slate-500 mb-2">ESTATÍSTICAS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <div className="text-xs text-slate-600">Mercados</div>
              <div className="text-lg font-bold text-blue-600">{stats.totals?.mercados || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <div className="text-xs text-slate-600">Clientes</div>
              <div className="text-lg font-bold text-green-600">{stats.totals?.clientes || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <div className="text-xs text-slate-600">Concorrentes</div>
              <div className="text-lg font-bold text-purple-600">{stats.totals?.concorrentes || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200">
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
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
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

            {/* Section Items */}
            {openSections[section.title] && (
              <div className="ml-2 mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                          active
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
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
