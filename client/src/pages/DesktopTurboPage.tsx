import { useState } from 'react';
import { useNavigate } from 'wouter';
import { trpc } from '@/lib/trpc';
import { 
  FolderKanban, 
  Search, 
  UserCheck, 
  UserPlus, 
  Zap, 
  Package, 
  Globe,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Copy,
  MoreVertical,
  Filter,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type BrowseType = 'projetos' | 'pesquisas' | 'clientes' | 'leads' | 'concorrentes' | 'produtos' | 'mercados' | null;

export default function DesktopTurboPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado dos filtros globais
  const [filtroProjetoId, setFiltroProjetoId] = useState<number | null>(null);
  const [filtroPesquisaId, setFiltroPesquisaId] = useState<number | null>(null);
  
  // Estado do browse aberto
  const [browseAberto, setBrowseAberto] = useState<BrowseType>(null);
  
  // Queries de dados
  const { data: dashboardData } = trpc.dashboard.getDashboardData.useQuery();
  const { data: projetos } = trpc.projetos.listAtivos.useQuery();
  const { data: pesquisas } = trpc.pesquisas.listEmProgresso.useQuery();
  
  const kpis = dashboardData?.kpis || {};
  
  // Função de exportação
  const handleExport = (tipo: string, formato: 'excel' | 'csv' | 'copiar') => {
    toast({
      title: `Exportar ${tipo}`,
      description: `Exportando para ${formato.toUpperCase()}...`,
    });
    // TODO: Implementar exportação real
  };
  
  // Cards de KPIs
  const cards = [
    {
      id: 'projetos',
      title: 'Projetos',
      value: kpis.totalProjetos || 0,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
      trendUp: true,
    },
    {
      id: 'pesquisas',
      title: 'Pesquisas',
      value: pesquisas?.length || 0,
      icon: Search,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+8%',
      trendUp: true,
    },
    {
      id: 'clientes',
      title: 'Clientes',
      value: kpis.totalClientes || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '0%',
      trendUp: false,
    },
    {
      id: 'leads',
      title: 'Leads',
      value: kpis.totalLeads || 0,
      icon: UserPlus,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      trend: '+15%',
      trendUp: true,
    },
    {
      id: 'concorrentes',
      title: 'Concorrentes',
      value: kpis.totalConcorrentes || 0,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '-2%',
      trendUp: false,
    },
    {
      id: 'produtos',
      title: 'Produtos',
      value: kpis.totalProdutos || 0,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: '0%',
      trendUp: false,
    },
    {
      id: 'mercados',
      title: 'Mercados',
      value: kpis.totalMercados || 0,
      icon: Globe,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      trend: '0%',
      trendUp: false,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Desktop Turbo</h1>
            <p className="text-gray-600">Central de comando inteligente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('Todos', 'excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Todos', 'csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>
      
      {/* Filtro Central */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Projeto
              </label>
              <Select
                value={filtroProjetoId?.toString() || 'todos'}
                onValueChange={(v) => setFiltroProjetoId(v === 'todos' ? null : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os projetos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os projetos</SelectItem>
                  {projetos?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Pesquisa
              </label>
              <Select
                value={filtroPesquisaId?.toString() || 'todas'}
                onValueChange={(v) => setFiltroPesquisaId(v === 'todas' ? null : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as pesquisas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as pesquisas</SelectItem>
                  {pesquisas?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiltroProjetoId(null);
                  setFiltroPesquisaId(null);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onDoubleClick={() => setBrowseAberto(card.id as BrowseType)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setBrowseAberto(card.id as BrowseType)}>
                      Ver Browse
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(card.title, 'excel')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(card.title, 'csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(card.title, 'copiar')}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Dados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <div className="flex items-center mt-2">
                  <Badge variant={card.trendUp ? 'default' : 'secondary'} className="text-xs">
                    {card.trend}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Browse Panel */}
      {browseAberto && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Browse: {cards.find(c => c.id === browseAberto)?.title}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setBrowseAberto(null)}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            Browse de {browseAberto} em desenvolvimento...
            <br />
            <Button
              variant="link"
              onClick={() => {
                if (browseAberto === 'clientes' || browseAberto === 'leads' || browseAberto === 'concorrentes') {
                  navigate('/entidades');
                } else if (browseAberto === 'mercados') {
                  navigate('/mercados');
                } else if (browseAberto === 'produtos') {
                  navigate('/produtos');
                }
              }}
            >
              Ir para página dedicada →
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
