import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  ArrowLeft,
  FolderKanban,
  Search,
  Users,
  UserPlus,
  Building2,
  Package,
  Target,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus,
  FileSpreadsheet,
  Download,
  Copy,
  MessageCircle,
  Send,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { BrowseInline, BrowseColumn, BrowseFilter } from '@/components/BrowseInline';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToCSV, copyToClipboard, generateShareMessage, shareToWhatsApp, shareToTelegram, ExportData } from '@/components/ExportUtils';

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onNavigate?: () => void;
  onDoubleClick?: () => void;
}

function KPICard({ title, value, icon, color, trend, onNavigate, onDoubleClick }: KPICardProps) {
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={onNavigate}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <Badge variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'} className="text-xs">
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
            {trend.direction === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </Badge>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value.toLocaleString('pt-BR')}</p>
      </div>
    </Card>
  );
}

export default function DesktopTurboPage() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { toast } = useToast();
  
  // Filtros centrais
  const [selectedProjeto, setSelectedProjeto] = useState<string>('all');
  const [selectedPesquisa, setSelectedPesquisa] = useState<string>('all');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('all');
  
  // Estado do browse inline
  const [activeBrowse, setActiveBrowse] = useState<string | null>(null);
  
  // Queries
  // Usar REST API ao invés de tRPC
  const { data: dashboardData, isLoading: loadingDashboard, error: dashboardError } = useDashboard();
  
  // TODO: Migrar estas queries para REST API também
  // const { data: projetos } = trpc.projetos.listAtivos.useQuery();
  // const { data: pesquisas } = trpc.pesquisas.listEmProgresso.useQuery();
  // const { data: statusQualificacao } = trpc.statusQualificacao.list.useQuery();

  // KPIs
  const kpis = dashboardData?.kpis || {
    totalProjetos: 0,
    totalPesquisas: 0,
    totalClientes: 0,
    totalLeads: 0,
    totalConcorrentes: 0,
    totalProdutos: 0,
    totalMercados: 0,
  };

  // Funções de exportação
  const handleExportAll = async (format: 'excel' | 'csv' | 'clipboard' | 'whatsapp' | 'telegram') => {
    const exportData: ExportData = {
      title: 'Desktop Turbo - Resumo Geral',
      headers: ['Métrica', 'Valor'],
      rows: [
        ['Projetos Ativos', kpis.totalProjetos.toString()],
        ['Pesquisas', kpis.totalPesquisas.toString()],
        ['Clientes', kpis.totalClientes.toString()],
        ['Leads', kpis.totalLeads.toString()],
        ['Concorrentes', kpis.totalConcorrentes.toString()],
        ['Produtos', kpis.totalProdutos.toString()],
        ['Mercados', kpis.totalMercados.toString()],
      ],
    };

    try {
      switch (format) {
        case 'excel':
          exportToExcel(exportData, 'desktop-turbo-resumo');
          toast({ title: '✅ Exportado para Excel', description: 'Arquivo baixado com sucesso' });
          break;
        case 'csv':
          exportToCSV(exportData, 'desktop-turbo-resumo');
          toast({ title: '✅ Exportado para CSV', description: 'Arquivo baixado com sucesso' });
          break;
        case 'clipboard':
          await copyToClipboard(exportData);
          toast({ title: '✅ Copiado', description: 'Dados copiados para área de transferência' });
          break;
        case 'whatsapp':
          shareToWhatsApp(generateShareMessage(exportData));
          break;
        case 'telegram':
          shareToTelegram(generateShareMessage(exportData));
          break;
      }
    } catch (error) {
      toast({ 
        title: '❌ Erro ao exportar', 
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  // Colunas para browse inline
  const projetosColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'nome', label: 'Nome', width: 'auto' },
    { key: 'descricao', label: 'Descrição', width: 'auto' },
    { key: 'status', label: 'Status', width: '120px' },
  ];

  const pesquisasColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'nome', label: 'Nome', width: 'auto' },
    { key: 'tipo', label: 'Tipo', width: '150px' },
    { key: 'status', label: 'Status', width: '120px' },
  ];

  const entidadesColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'nome', label: 'Nome', width: 'auto' },
    { key: 'tipo_entidade', label: 'Tipo', width: '120px' },
    { key: 'cnpj', label: 'CNPJ', width: '150px' },
  ];

  const produtosColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'nome', label: 'Nome', width: 'auto' },
    { key: 'categoria', label: 'Categoria', width: '150px' },
  ];

  const mercadosColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'nome', label: 'Nome', width: 'auto' },
    { key: 'categoria', label: 'Categoria', width: '150px' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Desktop Turbo</h1>
          </div>
          <p className="text-muted-foreground ml-12">Central de comando inteligente</p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Tudo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportAll('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('clipboard')}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('whatsapp')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('telegram')}>
                <Send className="h-4 w-4 mr-2" />
                Telegram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Filtros Centrais */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Filtrar por Projeto</label>
            <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {/* TODO: Migrar API de projetos para REST */}
                {/* {projetos?.map((projeto) => (
                  <SelectItem key={projeto.id} value={projeto.id.toString()}>
                    {projeto.nome}
                  </SelectItem>
                ))} */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Filtrar por Pesquisa</label>
            <Select value={selectedPesquisa} onValueChange={setSelectedPesquisa}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as pesquisas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as pesquisas</SelectItem>
                {/* TODO: Migrar API de pesquisas para REST */}
                {/* {pesquisas?.map((pesquisa) => (
                  <SelectItem key={pesquisa.id} value={pesquisa.id.toString()}>
                    {pesquisa.nome}
                  </SelectItem>
                ))} */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Todo o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <KPICard
          title="Projetos Ativos"
          value={kpis.totalProjetos}
          icon={<FolderKanban className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
          trend={{ value: 12, direction: 'up' }}
          onNavigate={() => navigate('/projetos')}
          onDoubleClick={() => setActiveBrowse('projetos')}
        />
        
        <KPICard
          title="Pesquisas"
          value={kpis.totalPesquisas}
          icon={<Search className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
          trend={{ value: 8, direction: 'up' }}
          onNavigate={() => navigate('/pesquisas')}
          onDoubleClick={() => setActiveBrowse('pesquisas')}
        />
        
        <KPICard
          title="Clientes"
          value={kpis.totalClientes}
          icon={<Users className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
          trend={{ value: 15, direction: 'up' }}
          onNavigate={() => navigate('/entidades?tipo=cliente')}
          onDoubleClick={() => setActiveBrowse('clientes')}
        />
        
        <KPICard
          title="Leads"
          value={kpis.totalLeads}
          icon={<UserPlus className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
          trend={{ value: 5, direction: 'up' }}
          onNavigate={() => navigate('/entidades?tipo=lead')}
          onDoubleClick={() => setActiveBrowse('leads')}
        />
        
        <KPICard
          title="Concorrentes"
          value={kpis.totalConcorrentes}
          icon={<Building2 className="h-5 w-5 text-red-600" />}
          color="bg-red-100"
          trend={{ value: 0, direction: 'neutral' }}
          onNavigate={() => navigate('/entidades?tipo=concorrente')}
          onDoubleClick={() => setActiveBrowse('concorrentes')}
        />
        
        <KPICard
          title="Produtos"
          value={kpis.totalProdutos}
          icon={<Package className="h-5 w-5 text-orange-600" />}
          color="bg-orange-100"
          trend={{ value: 10, direction: 'up' }}
          onNavigate={() => navigate('/produtos')}
          onDoubleClick={() => setActiveBrowse('produtos')}
        />
        
        <KPICard
          title="Mercados"
          value={kpis.totalMercados}
          icon={<Target className="h-5 w-5 text-teal-600" />}
          color="bg-teal-100"
          trend={{ value: 20, direction: 'up' }}
          onNavigate={() => navigate('/mercados')}
          onDoubleClick={() => setActiveBrowse('mercados')}
        />
      </div>

      {/* Ações Rápidas */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ações Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="p-4 hover:shadow-lg cursor-pointer transition-all border-2 hover:border-primary group"
            onClick={() => navigate('/projetos/novo')}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Novo Projeto</p>
                <p className="text-xs text-muted-foreground">Criar projeto de análise</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 hover:shadow-lg cursor-pointer transition-all border-2 hover:border-secondary group"
            onClick={() => navigate('/pesquisas/novo')}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Nova Pesquisa</p>
                <p className="text-xs text-muted-foreground">Iniciar pesquisa de mercado</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 hover:shadow-lg cursor-pointer transition-all border-2 hover:border-info group"
            onClick={() => navigate('/importacao')}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="font-semibold mb-1">Importar Dados</p>
                <p className="text-xs text-muted-foreground">Upload CSV/Excel</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 hover:shadow-lg cursor-pointer transition-all border-2 hover:border-warning group"
            onClick={() => navigate('/enriquecimento')}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-semibold mb-1">Processar com IA</p>
                <p className="text-xs text-muted-foreground">Enriquecer dados</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Browse Inline */}
      {activeBrowse === 'projetos' && (
        <BrowseInline
          title="Projetos"
          endpoint="projetos.list"
          columns={projetosColumns}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/projetos/${row.id}`)}
        />
      )}

      {activeBrowse === 'pesquisas' && (
        <BrowseInline
          title="Pesquisas"
          endpoint="pesquisas.list"
          columns={pesquisasColumns}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/pesquisas/${row.id}`)}
        />
      )}

      {activeBrowse === 'clientes' && (
        <BrowseInline
          title="Clientes"
          endpoint="entidade.list"
          columns={entidadesColumns}
          filters={[{ key: 'tipoEntidade', value: 'cliente' }]}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/entidades/${row.id}`)}
        />
      )}

      {activeBrowse === 'leads' && (
        <BrowseInline
          title="Leads"
          endpoint="entidade.list"
          columns={entidadesColumns}
          filters={[{ key: 'tipoEntidade', value: 'lead' }]}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/entidades/${row.id}`)}
        />
      )}

      {activeBrowse === 'concorrentes' && (
        <BrowseInline
          title="Concorrentes"
          endpoint="entidade.list"
          columns={entidadesColumns}
          filters={[{ key: 'tipoEntidade', value: 'concorrente' }]}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/entidades/${row.id}`)}
        />
      )}

      {activeBrowse === 'produtos' && (
        <BrowseInline
          title="Produtos"
          endpoint="produto.list"
          columns={produtosColumns}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/produtos/${row.id}`)}
        />
      )}

      {activeBrowse === 'mercados' && (
        <BrowseInline
          title="Mercados"
          endpoint="mercado.list"
          columns={mercadosColumns}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/mercados/${row.id}`)}
        />
      )}
    </div>
  );
}
