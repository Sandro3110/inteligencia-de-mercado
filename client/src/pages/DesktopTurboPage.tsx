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
  Activity
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
    gradient: 'from-green-500/20 to-transparent',
  },
  yellow: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-500/20',
    hover: 'hover:bg-yellow-500/20 dark:hover:bg-yellow-500/30',
    gradient: 'from-yellow-500/20 to-transparent',
  },
  red: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/20',
    hover: 'hover:bg-red-500/20 dark:hover:bg-red-500/30',
    gradient: 'from-red-500/20 to-transparent',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/30',
    gradient: 'from-blue-500/20 to-transparent',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/20',
    hover: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/30',
    gradient: 'from-purple-500/20 to-transparent',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    hover: 'hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30',
    gradient: 'from-indigo-500/20 to-transparent',
  },
  pink: {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-700 dark:text-pink-400',
    border: 'border-pink-500/20',
    hover: 'hover:bg-pink-500/20 dark:hover:bg-pink-500/30',
    gradient: 'from-pink-500/20 to-transparent',
  },
};

const statusBadgeColors = {
  green: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

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

  const handleQuickAction = (action: string) => {
    const routes: Record<string, string> = {
      importar: '/importacao',
      enriquecer: '/enriquecimento',
      exportar: '/relatorios',
    };
    
    toast({
      title: 'Ação rápida',
      description: `Abrindo ${action}...`,
    });
    
    const route = routes[action];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Desktop Turbo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visão consolidada de todas as entidades do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Atualizado em tempo real
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Totalizador de Entidades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">
                    Carregando totalizadores...
                  </span>
                </div>
              )}

              {error && (
                <div className="m-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-700 dark:text-red-400">
                  <p className="font-semibold">Erro ao carregar totalizadores</p>
                  <p className="text-sm">{(error as Error).message}</p>
                </div>
              )}

              {data?.totalizadores && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[45%] font-semibold">Tipo de Entidade</TableHead>
                      <TableHead className="text-center font-semibold">Total</TableHead>
                      <TableHead className="text-center font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Ações</TableHead>
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
                          className={`cursor-pointer transition-all duration-200 ${colors.hover} border-border/30`}
                          onClick={() => handleRowClick(totalizador)}
                        >
                          <TableCell>
                            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${colors.bg} ${colors.border} transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}>
                              {Icon && <Icon className={`h-5 w-5 ${colors.text}`} />}
                              <span className={`font-semibold ${colors.text}`}>
                                {totalizador.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                                {totalizador.total}
                              </span>
                              <span className="text-xs text-muted-foreground">registros</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`${statusColor} font-medium`}>
                              {totalizador.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-primary/10"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {data?.totalizadores && data.totalizadores.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 opacity-20 mb-4" />
                  <p>Nenhuma entidade encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - Ações Rápidas */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Clique em uma linha para ver detalhes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('importar')}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar Dados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('enriquecer')}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Enriquecer com IA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('exportar')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
