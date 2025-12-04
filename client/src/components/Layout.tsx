import { Link, useLocation } from 'wouter';
import { ReactNode, useState } from 'react';
import {
  Home,
  FolderKanban,
  Search,
  Upload,
  FileText,
  Sparkles,
  Database,
  Layers,
  TrendingUp,
  MapPin,
  Network,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Users,
  Shield,
  Cpu,
  HelpCircle,
  BookOpen,
  Rocket,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { startTour } from './TourGuide';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: typeof Home;
  label: string;
  path?: string;
  action?: string;
  color: string;
  tooltip: string;
  section?: string;
}

const menuSections = [
  {
    title: 'Visão Geral',
    items: [
      {
        icon: Zap,
        label: 'Gestão de Conteúdo',
        path: '/desktop-turbo',
        color: 'text-purple-600',
        tooltip: 'Visão consolidada de todas as entidades do sistema'
      }
    ]
  },
  {
    title: 'Preparação',
    items: [
      {
        icon: FolderKanban,
        label: 'Projetos',
        path: '/projetos',
        color: 'text-indigo-600',
        tooltip: 'Criar e gerenciar projetos de inteligência de mercado'
      },
      {
        icon: Search,
        label: 'Pesquisas',
        path: '/pesquisas',
        color: 'text-indigo-600',
        tooltip: 'Configurar pesquisas de mercado e segmentação'
      },
      {
        icon: Upload,
        label: 'Importar Dados',
        path: '/importacao',
        color: 'text-indigo-600',
        tooltip: 'Importar dados de clientes, leads e empresas (CSV, Excel)'
      },
      {
        icon: FileText,
        label: 'Histórico de Importações',
        path: '/importacoes',
        color: 'text-indigo-600',
        tooltip: 'Visualizar histórico e status de importações anteriores'
      }
    ]
  },
  {
    title: 'Enriquecimento',
    items: [
      {
        icon: Sparkles,
        label: 'Enriquecer com IA',
        path: '/enriquecimento',
        color: 'text-amber-600',
        tooltip: 'Enriquecer dados de empresas com inteligência artificial'
      },
      {
        icon: Cpu,
        label: 'Processamento Avançado',
        path: '/processamento-ia',
        color: 'text-amber-600',
        tooltip: 'Processar lotes de dados e gerar insights automatizados'
      }
    ]
  },
  {
    title: 'Inteligência',
    items: [
      {
        icon: Layers,
        label: 'Explorador Multidimensional',
        path: '/cubo',
        color: 'text-emerald-600',
        tooltip: 'Análise interativa por múltiplas dimensões (setor, porte, região)'
      },
      {
        icon: TrendingUp,
        label: 'Análise Temporal',
        path: '/analise/temporal',
        color: 'text-emerald-600',
        tooltip: 'Identificar tendências e padrões ao longo do tempo'
      },
      {
        icon: MapPin,
        label: 'Análise Geográfica',
        path: '/analise/geografica',
        color: 'text-emerald-600',
        tooltip: 'Visualizar distribuição geográfica e oportunidades por região'
      },
      {
        icon: Network,
        label: 'Análise de Mercado',
        path: '/analise/mercado',
        color: 'text-emerald-600',
        tooltip: 'Explorar hierarquia de mercados e segmentos de atuação'
      }
    ]
  },
  {
    title: 'Administração',
    items: [
      {
        icon: Users,
        label: 'Usuários',
        path: '/usuarios',
        color: 'text-purple-600',
        tooltip: 'Gerenciar usuários, permissões e controle de acesso'
      },
      {
        icon: Shield,
        label: 'Gestão de IA',
        path: '/gestao-ia',
        color: 'text-purple-600',
        tooltip: 'Monitorar uso, custos e segurança da inteligência artificial'
      }
    ]
  },
  {
    title: 'Ajuda',
    items: [
      {
        icon: HelpCircle,
        label: 'Tour Completo',
        action: 'tour:complete',
        color: 'text-blue-600',
        tooltip: 'Tour guiado por todas as funcionalidades (3-4 min)'
      },
      {
        icon: Rocket,
        label: 'Primeiros Passos',
        action: 'tour:firstSteps',
        color: 'text-blue-600',
        tooltip: 'Fluxo básico para começar a usar (1-2 min)'
      },
      {
        icon: BarChart3,
        label: 'Tour: Análises',
        action: 'tour:analytics',
        color: 'text-blue-600',
        tooltip: 'Conheça as ferramentas de inteligência (1 min)'
      },
      {
        icon: Zap,
        label: 'Tour: IA',
        action: 'tour:aiEnrichment',
        color: 'text-blue-600',
        tooltip: 'Descubra o poder do enriquecimento com IA (1 min)'
      },
      {
        icon: BookOpen,
        label: 'Documentação',
        path: '/documentacao',
        color: 'text-blue-600',
        tooltip: 'Acesse a documentação completa'
      }
    ]
  }
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 border-r border-border bg-card',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">IM</span>
              </div>
              <div>
                <span className="font-bold text-base">Intelmarket</span>
                <p className="text-xs text-muted-foreground">Inteligência de Mercado</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = item.path && (location === item.path || 
                    (item.path !== '/' && location.startsWith(item.path)));

                  // Tour action
                  if (item.action?.startsWith('tour:')) {
                    const tourName = item.action.replace('tour:', '') as any;
                    return (
                      <button
                        key={`${section.title}-${idx}`}
                        onClick={() => startTour(tourName)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left',
                          'hover:bg-accent hover:text-accent-foreground',
                          isCollapsed && 'justify-center'
                        )}
                        title={item.tooltip}
                      >
                        <Icon className={cn('h-5 w-5 flex-shrink-0', item.color)} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  }

                  // Link externo
                  if (item.path?.startsWith('http')) {
                    return (
                      <a
                        key={`${section.title}-${idx}`}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          'hover:bg-accent hover:text-accent-foreground',
                          isCollapsed && 'justify-center'
                        )}
                        title={item.tooltip}
                      >
                        <Icon className={cn('h-5 w-5 flex-shrink-0', item.color)} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </a>
                    );
                  }

                  // Link interno
                  return (
                    <Link key={`${section.title}-${idx}`} href={item.path!}>
                      <a
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          'hover:bg-accent hover:text-accent-foreground',
                          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                          isCollapsed && 'justify-center'
                        )}
                        title={item.tooltip}
                      >
                        <Icon className={cn('h-5 w-5 flex-shrink-0', !isActive && item.color)} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={toggleTheme}
            className={cn("w-full", isCollapsed && "justify-center")}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5" />
                {!isCollapsed && <span className="ml-2">Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-2">Modo Escuro</span>}
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300 flex flex-col',
          isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl flex-1">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="border-t bg-muted/30 mt-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sobre */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Inteligência de Mercado</h3>
                <p className="text-sm text-muted-foreground">
                  Plataforma de análise dimensional de empresas e inteligência de mercado B2B.
                </p>
              </div>

              {/* Links Legais */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                      Política de Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                      Termos de Uso
                    </a>
                  </li>
                  <li className="text-muted-foreground">
                    Conforme LGPD (Lei 13.709/2018)
                  </li>
                </ul>
              </div>

              {/* DPO */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Proteção de Dados</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Encarregado de Dados (DPO)
                </p>
                <a 
                  href="mailto:dpo@inteligenciademercado.com" 
                  className="text-sm text-primary hover:underline"
                >
                  dpo@inteligenciademercado.com
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Resposta em até 15 dias úteis
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} Inteligência de Mercado. Todos os direitos reservados.
              </p>
              <p className="mt-1 text-xs">
                Dados públicos de empresas coletados de fontes legítimas (Receita Federal, portais governamentais).
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
