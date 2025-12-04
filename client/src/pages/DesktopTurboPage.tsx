import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  ChevronRight, 
  Loader2, 
  Users, 
  UserPlus, 
  Building2, 
  Package, 
  Target, 
  FolderOpen, 
  Search,
  Upload,
  Sparkles,
  FileText,
  TrendingUp,
  Activity,
  Shield,
  Mail
} from 'lucide-react';
import { useTotalizadores, Totalizador } from '@/hooks/useTotalizadores';
import { useToast } from '@/hooks/use-toast';

// Mapeamento de ícones do lucide-react
const iconMap = {
  clientes: Users,
  leads: UserPlus,
  concorrentes: Building2,
  produtos: Package,
  mercados: Target,
  projetos: FolderOpen,
  pesquisas: Search,
};

// Mapeamento de cores para classes Tailwind (dark mode friendly)
const colorClasses = {
  green: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-500/20',
    hover: 'hover:bg-green-500/20 dark:hover:bg-green-500/30',
  },
  yellow: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-500/20',
    hover: 'hover:bg-yellow-500/20 dark:hover:bg-yellow-500/30',
  },
  red: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/20',
    hover: 'hover:bg-red-500/20 dark:hover:bg-red-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/30',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/20',
    hover: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/30',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    hover: 'hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30',
  },
  pink: {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-700 dark:text-pink-400',
    border: 'border-pink-500/20',
    hover: 'hover:bg-pink-500/20 dark:hover:bg-pink-500/30',
  },
};

const statusBadgeColors = {
  green: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

// Ações rápidas
const quickActions = [
  {
    id: 'importar',
    title: 'Importar Dados',
    description: 'Importar CSV, Excel ou JSON',
    icon: Upload,
    color: 'blue',
    route: '/importacao',
  },
  {
    id: 'enriquecer',
    title: 'Enriquecer com IA',
    description: 'Análise inteligente de dados',
    icon: Sparkles,
    color: 'purple',
    route: '/enriquecimento',
  },
  {
    id: 'exportar',
    title: 'Exportar Relatório',
    description: 'PDF, Excel ou Dashboard',
    icon: FileText,
    color: 'green',
    route: '/relatorios',
  },
];

export default function DesktopTurboPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);

  // Buscar totalizadores
  const { data, isLoading, error } = useTotalizadores();

  const handleRowClick = (totalizador: Totalizador) => {
    toast({
      title: `${totalizador.label}`,
      description: `Abrindo lista de ${totalizador.label.toLowerCase()}...`,
    });
    
    // Navega para a página correspondente
    const routes: Record<string, string> = {
      clientes: '/entidades?tipo=cliente',
      leads: '/entidades?tipo=lead',
      concorrentes: '/entidades?tipo=concorrente',
      produtos: '/produtos',
      mercados: '/mercados',
      projetos: '/projetos',
      pesquisas: '/pesquisas',
    };
    
    const route = routes[totalizador.tipo];
    if (route) {
      navigate(route);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    toast({
      title: action.title,
      description: action.description,
    });
    navigate(action.route);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header - Compacto */}
      <div className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 h-8"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Desktop Turbo
                </h1>
                <p className="text-xs text-muted-foreground">
                  Visão consolidada de todas as entidades do sistema
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1 text-xs h-6">
              <TrendingUp className="h-3 w-3" />
              Atualizado em tempo real
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-3">
          {/* Totalizador */}
          <Card className="border-border/50 shadow-lg mb-3">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent py-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Totalizador de Entidades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-3 text-sm text-muted-foreground">
                    Carregando totalizadores...
                  </span>
                </div>
              )}

              {error && (
                <div className="m-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-sm text-red-700 dark:text-red-400">
                  <p className="font-semibold text-xs">Erro ao carregar totalizadores</p>
                  <p className="text-xs">{(error as Error).message}</p>
                </div>
              )}

              {data?.totalizadores && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[45%] font-semibold text-xs h-7">Tipo de Entidade</TableHead>
                      <TableHead className="text-center font-semibold text-xs h-7">Total</TableHead>
                      <TableHead className="text-center font-semibold text-xs h-7">Status</TableHead>
                      <TableHead className="text-right font-semibold text-xs h-7">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.totalizadores.map((totalizador) => {
                      const colors = colorClasses[totalizador.color as keyof typeof colorClasses];
                      const statusColor = statusBadgeColors[totalizador.statusColor as keyof typeof statusBadgeColors];
                      const Icon = iconMap[totalizador.tipo as keyof typeof iconMap];

                      return (
                        <TableRow
                          key={totalizador.tipo}
                          className={`cursor-pointer transition-all duration-200 ${colors.hover} border-border/30 h-11`}
                          onClick={() => handleRowClick(totalizador)}
                        >
                          <TableCell className="py-1.5">
                            <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${colors.bg} ${colors.border} transition-all duration-200 hover:scale-[1.01]`}>
                              {Icon && <Icon className={`h-3.5 w-3.5 ${colors.text}`} />}
                              <span className={`font-semibold text-xs ${colors.text}`}>
                                {totalizador.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-1.5">
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                                {totalizador.total}
                              </span>
                              <span className="text-[9px] text-muted-foreground">registros</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-1.5">
                            <Badge variant="outline" className={`${statusColor} font-medium text-[10px] h-5 px-2`}>
                              {totalizador.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-primary/10 h-6 w-6 p-0"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {data?.totalizadores && data.totalizadores.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="mx-auto h-8 w-8 opacity-20 mb-2" />
                  <p className="text-xs">Nenhuma entidade encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas - Cards */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-border/50 bg-gradient-to-br ${
                    action.color === 'blue' ? 'from-blue-500/5 to-blue-500/10' :
                    action.color === 'purple' ? 'from-purple-500/5 to-purple-500/10' :
                    'from-green-500/5 to-green-500/10'
                  }`}
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                    <div className={`rounded-lg p-2 ${
                      action.color === 'blue' ? 'bg-blue-500/10' :
                      action.color === 'purple' ? 'bg-purple-500/10' :
                      'bg-green-500/10'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer - LGPD e Contato */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Conforme LGPD (Lei 13.709/2018)</span>
              </div>
              <a href="/privacidade" className="hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="/termos" className="hover:text-primary transition-colors">
                Termos de Uso
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>DPO: </span>
              <a href="mailto:dpo@intelmarket.app" className="hover:text-primary transition-colors">
                dpo@intelmarket.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
