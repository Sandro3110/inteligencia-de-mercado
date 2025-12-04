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
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTotalizadores, Totalizador } from '@/hooks/useTotalizadores';
import { useToast } from '@/hooks/use-toast';

// Mapeamento de cores para classes Tailwind
const colorClasses = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-100',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    hover: 'hover:bg-red-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-100',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-100',
  },
};

const statusBadgeColors = {
  green: 'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  red: 'bg-red-100 text-red-800 border-red-300',
};

export default function DesktopTurboPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);

  // Buscar totalizadores
  const { data, isLoading, error } = useTotalizadores();

  const handleRowClick = (totalizador: Totalizador) => {
    // TODO: Implementar browse secundário
    toast({
      title: `${totalizador.icon} ${totalizador.label}`,
      description: `Abrindo lista de ${totalizador.label.toLowerCase()}...`,
    });
    
    // Por enquanto, navega para a página correspondente
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">Desktop Turbo</h1>
            <p className="text-muted-foreground">
              Totalizador de entidades do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Totalizador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Totalizador de Entidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">
                Carregando totalizadores...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Erro ao carregar totalizadores</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          )}

          {data?.totalizadores && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Tipo</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.totalizadores.map((totalizador) => {
                  const colors = colorClasses[totalizador.color as keyof typeof colorClasses];
                  const statusColor = statusBadgeColors[totalizador.statusColor as keyof typeof statusBadgeColors];

                  return (
                    <TableRow
                      key={totalizador.tipo}
                      className={`cursor-pointer transition-colors ${colors.hover}`}
                      onClick={() => handleRowClick(totalizador)}
                    >
                      <TableCell>
                        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${colors.bg} ${colors.border}`}>
                          <span className="text-2xl">{totalizador.icon}</span>
                          <span className={`font-semibold ${colors.text}`}>
                            {totalizador.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-2xl font-bold">
                          {totalizador.total}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={statusColor}>
                          {totalizador.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
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
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma entidade encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Clique em uma linha para ver detalhes da entidade</p>
      </div>
    </div>
  );
}
