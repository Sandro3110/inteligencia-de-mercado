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
  Eye,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Plus,
  Users,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
  color: string;
  section?: string;
}

const menuSections = [
  {
    title: 'Início',
    items: [
      {
        icon: Home,
        label: 'Dashboard',
        path: '/',
        color: 'text-primary'
      }
    ]
  },
  {
    title: 'Configuração',
    items: [
      {
        icon: FolderKanban,
        label: 'Projetos',
        path: '/projetos',
        color: 'text-secondary'
      },
      {
        icon: Plus,
        label: 'Novo Projeto',
        path: '/projetos/novo',
        color: 'text-secondary'
      },
      {
        icon: Search,
        label: 'Pesquisas',
        path: '/pesquisas',
        color: 'text-secondary'
      },
      {
        icon: Plus,
        label: 'Nova Pesquisa',
        path: '/pesquisas/novo',
        color: 'text-secondary'
      }
    ]
  },
  {
    title: 'Coleta de Dados',
    items: [
      {
        icon: Upload,
        label: 'Importar Dados',
        path: '/importacao',
        color: 'text-info'
      },
      {
        icon: FileText,
        label: 'Histórico',
        path: '/importacoes',
        color: 'text-info'
      }
    ]
  },
  {
    title: 'Enriquecimento',
    items: [
      {
        icon: Sparkles,
        label: 'Processar com IA',
        path: '/enriquecimento',
        color: 'text-warning'
      },
      {
        icon: Database,
        label: 'Base de Entidades',
        path: '/entidades',
        color: 'text-warning'
      }
    ]
  },
  {
    title: 'Análise',
    items: [
      {
        icon: Layers,
        label: 'Explorador Inteligente',
        path: '/cubo',
        color: 'text-success'
      },
      {
        icon: TrendingUp,
        label: 'Tendências no Tempo',
        path: '/analise/temporal',
        color: 'text-success'
      },
      {
        icon: MapPin,
        label: 'Mapa de Oportunidades',
        path: '/analise/geografica',
        color: 'text-success'
      },
      {
        icon: Network,
        label: 'Hierarquia de Mercados',
        path: '/analise/mercado',
        color: 'text-success'
      },
      {
        icon: Eye,
        label: 'Visão 360°',
        path: '/entidade/:id',
        color: 'text-success'
      }
    ]
  },
  {
    title: 'Administração',
    items: [
      {
        icon: Users,
        label: 'Gestão de Usuários',
        path: '/usuarios',
        color: 'text-purple-600'
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
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-border bg-card',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
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
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path || 
                    (item.path !== '/' && location.startsWith(item.path));

                  return (
                    <Link key={item.path} href={item.path}>
                      <a
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          'hover:bg-accent hover:text-accent-foreground',
                          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                          isCollapsed && 'justify-center'
                        )}
                        title={isCollapsed ? item.label : undefined}
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
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
