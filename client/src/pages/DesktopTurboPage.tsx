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
  BarChart3,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { BrowseInline, BrowseColumn, BrowseFilter } from '@/components/BrowseInline';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToCSV, copyToClipboard, generateShareMessage, shareToWhatsApp, shareToTelegram, ExportData } from '@/components/ExportUtils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onDoubleClick: () => void;
  onExport: () => void;
  onNavigate: () => void;
}

function KPICard({ title, value, icon, color, trend, onDoubleClick, onExport, onNavigate }: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow relative"
      onDoubleClick={onDoubleClick}
    >
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNavigate}>
              <Target className="h-4 w-4 mr-2" />
              Abrir Browse
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon()}
              <span className={`text-sm ${
                trend.direction === 'up' ? 'text-green-600' : 
                trend.direction === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
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
  const [dateRange, setDateRange] = useState<string>('all');
  
  // Browse ativo
  const [activeBrowse, setActiveBrowse] = useState<string | null>(null);
  
  // Queries
  const { data: dashboardData } = trpc.dashboard.getDashboardData.useQuery();
  const { data: projetos } = trpc.projetos.listAtivos.useQuery();
  const { data: pesquisas } = trpc.pesquisas.listEmProgresso.useQuery();
  const { data: statusQualificacao } = trpc.statusQualificacao.list.useQuery();
  
  // Queries condicionais para browse
  const { data: clientesData } = trpc.entidades.list.useQuery(
    {
      tipo: 'cliente',
      projetoId: selectedProjeto !== 'all' ? parseInt(selectedProjeto) : undefined,
      pesquisaId: selectedPesquisa !== 'all' ? parseInt(selectedPesquisa) : undefined,
      limit: 1000,
      offset: 0,
    },
    { enabled: activeBrowse === 'clientes' }
  );
  
  const { data: leadsData } = trpc.entidades.list.useQuery(
    {
      tipo: 'lead',
      projetoId: selectedProjeto !== 'all' ? parseInt(selectedProjeto) : undefined,
      pesquisaId: selectedPesquisa !== 'all' ? parseInt(selectedPesquisa) : undefined,
      limit: 1000,
      offset: 0,
    },
    { enabled: activeBrowse === 'leads' }
  );
  
  const { data: concorrentesData } = trpc.entidades.list.useQuery(
    {
      tipo: 'concorrente',
      projetoId: selectedProjeto !== 'all' ? parseInt(selectedProjeto) : undefined,
      pesquisaId: selectedPesquisa !== 'all' ? parseInt(selectedPesquisa) : undefined,
      limit: 1000,
      offset: 0,
    },
    { enabled: activeBrowse === 'concorrentes' }
  );
  
  const { data: produtosData } = trpc.produto.list.useQuery(
    {},
    { enabled: activeBrowse === 'produtos' }
  );
  
  const { data: mercadosData } = trpc.mercado.list.useQuery(
    {},
    { enabled: activeBrowse === 'mercados' }
  );
  
  // KPIs
  const kpis = {
    projetos: dashboardData?.kpis?.totalProjetos || 0,
    pesquisas: dashboardData?.kpis?.totalPesquisas || 0,
    clientes: dashboardData?.kpis?.totalClientes || 0,
    leads: dashboardData?.kpis?.totalLeads || 0,
    concorrentes: dashboardData?.kpis?.totalConcorrentes || 0,
    produtos: dashboardData?.kpis?.totalProdutos || 0,
    mercados: dashboardData?.kpis?.totalMercados || 0,
  };
  
  // Dados para gráficos
  const distribuicaoEntidades = [
    { name: 'Clientes', value: kpis.clientes, color: '#10b981' },
    { name: 'Leads', value: kpis.leads, color: '#3b82f6' },
    { name: 'Concorrentes', value: kpis.concorrentes, color: '#ef4444' },
  ];
  
  const evolucaoMensal = [
    { mes: 'Jul', clientes: 15, leads: 5, concorrentes: 3 },
    { mes: 'Ago', clientes: 17, leads: 6, concorrentes: 4 },
    { mes: 'Set', clientes: 18, leads: 6, concorrentes: 5 },
    { mes: 'Out', clientes: 19, leads: 7, concorrentes: 5 },
    { mes: 'Nov', clientes: 20, leads: 7, concorrentes: 5 },
    { mes: 'Dez', clientes: 20, leads: 7, concorrentes: 5 },
  ];
  
  // Colunas para cada browse
  const clientesColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'nome', label: 'Nome' },
    { key: 'tipo_entidade', label: 'Tipo', render: (v) => <Badge>{v}</Badge> },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado' },
  ];
  
  const produtosColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria', render: (v) => <Badge variant="secondary">{v}</Badge> },
    { key: 'descricao', label: 'Descrição' },
  ];
  
  const mercadosColumns: BrowseColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria', render: (v) => <Badge>{v}</Badge> },
    { key: 'segmentacao', label: 'Segmentação', render: (v) => <Badge variant="outline">{v}</Badge> },
    { key: 'tamanho_mercado', label: 'Tamanho' },
    { key: 'crescimento_anual', label: 'Crescimento' },
  ];
  
  // Filtros para cada browse
  const entidadeFilters: BrowseFilter[] = [
    {
      key: 'status_qualificacao_id',
      label: 'Status',
      type: 'select',
      options: statusQualificacao?.data?.map((s: any) => ({
        value: s.id.toString(),
        label: s.nome,
      })) || [],
    },
  ];
  
  // Handlers de exportação
  const handleExportKPI = (title: string, value: number) => {
    const exportData: ExportData = {
      headers: ['Métrica', 'Valor', 'Data'],
      rows: [[title, value.toString(), new Date().toLocaleDateString('pt-BR')]],
      sheetName: title,
    };
    
    exportToExcel(exportData, title.toLowerCase().replace(/\s+/g, '_'));
    toast({ title: 'Exportado!', description: `${title} exportado com sucesso.` });
  };
  
  const handleExportAll = () => {
    const allData: ExportData[] = [
      {
        headers: ['Métrica', 'Valor'],
        rows: [
          ['Projetos Ativos', kpis.projetos.toString()],
          ['Pesquisas em Andamento', kpis.pesquisas.toString()],
          ['Clientes', kpis.clientes.toString()],
          ['Leads', kpis.leads.toString()],
          ['Concorrentes', kpis.concorrentes.toString()],
          ['Produtos', kpis.produtos.toString()],
          ['Mercados', kpis.mercados.toString()],
        ],
        sheetName: 'Resumo',
      },
    ];
    
    exportToExcel(allData, 'desktop_turbo_completo');
    toast({ title: 'Exportado!', description: 'Relatório completo gerado.' });
  };
  
  const handleShareAll = (platform: 'whatsapp' | 'telegram') => {
    const summary = {
      '📁 Projetos': kpis.projetos,
      '🔍 Pesquisas': kpis.pesquisas,
      '👥 Clientes': kpis.clientes,
      '📈 Leads': kpis.leads,
      '⚡ Concorrentes': kpis.concorrentes,
      '📦 Produtos': kpis.produtos,
      '🌍 Mercados': kpis.mercados,
    };
    
    const message = generateShareMessage('Desktop Turbo - Resumo Executivo', summary);
    
    if (platform === 'whatsapp') {
      shareToWhatsApp(message);
    } else {
      shareToTelegram(message);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Desktop Turbo</h1>
            <p className="text-gray-600">Central de comando inteligente</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAll}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Tudo
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShareAll('whatsapp')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareAll('telegram')}>
                <Send className="h-4 w-4 mr-2" />
                Telegram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Filtros Centrais */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filtrar por Projeto</label>
            <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {projetos?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filtrar por Pesquisa</label>
            <Select value={selectedPesquisa} onValueChange={setSelectedPesquisa}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as pesquisas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as pesquisas</SelectItem>
                {pesquisas?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
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
      
      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        <KPICard
          title="Projetos Ativos"
          value={kpis.projetos}
          icon={<FolderKanban className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          trend={{ value: 12, direction: 'up' }}
          onDoubleClick={() => setActiveBrowse('projetos')}
          onExport={() => handleExportKPI('Projetos', kpis.projetos)}
          onNavigate={() => navigate('/projetos')}
        />
        
        <KPICard
          title="Pesquisas"
          value={kpis.pesquisas}
          icon={<Search className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          trend={{ value: 8, direction: 'up' }}
          onDoubleClick={() => setActiveBrowse('pesquisas')}
          onExport={() => handleExportKPI('Pesquisas', kpis.pesquisas)}
          onNavigate={() => navigate('/pesquisas')}
        />
        
        <KPICard
          title="Clientes"
          value={kpis.clientes}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-green-500"
          trend={{ value: 15, direction: 'up' }}
          onDoubleClick={() => setActiveBrowse('clientes')}
          onExport={() => handleExportKPI('Clientes', kpis.clientes)}
          onNavigate={() => navigate('/entidades')}
        />
        
        <KPICard
          title="Leads"
          value={kpis.leads}
          icon={<UserPlus className="h-6 w-6 text-white" />}
          color="bg-blue-400"
          trend={{ value: 5, direction: 'up' }}
          onDoubleClick={() => setActiveBrowse('leads')}
          onExport={() => handleExportKPI('Leads', kpis.leads)}
          onNavigate={() => navigate('/entidades')}
        />
        
        <KPICard
          title="Concorrentes"
          value={kpis.concorrentes}
          icon={<Building2 className="h-6 w-6 text-white" />}
          color="bg-red-500"
          trend={{ value: 0, direction: 'neutral' }}
          onDoubleClick={() => setActiveBrowse('concorrentes')}
          onExport={() => handleExportKPI('Concorrentes', kpis.concorrentes)}
          onNavigate={() => navigate('/entidades')}
        />
        
        <KPICard
          title="Produtos"
          value={kpis.produtos}
          icon={<Package className="h-6 w-6 text-white" />}
          color="bg-indigo-500"
          trend={{ value: 10, direction: 'up' }}
          onDoubleClick={() => setActiveBrowse('produtos')}
          onExport={() => handleExportKPI('Produtos', kpis.produtos)}
          onNavigate={() => navigate('/produtos')}
        />
        
        <KPICard
          title="Mercados"
          value={kpis.mercados}
          icon={<Target className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
          trend={{ value: 20, direction: 'up' }}
          onDoubleClick={() => setActiveBrowse('mercados')}
          onExport={() => handleExportKPI('Mercados', kpis.mercados)}
          onNavigate={() => navigate('/mercados')}
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Pizza - Distribuição de Entidades */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição de Entidades
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoEntidades}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distribuicaoEntidades.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Gráfico de Linha - Evolução Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolução Mensal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clientes" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="concorrentes" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Gráfico de Barras - Comparação */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparação por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { tipo: 'Clientes', quantidade: kpis.clientes },
              { tipo: 'Leads', quantidade: kpis.leads },
              { tipo: 'Concorrentes', quantidade: kpis.concorrentes },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Gráfico de Área - Projetos e Pesquisas */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projetos e Pesquisas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { categoria: 'Projetos', valor: kpis.projetos },
              { categoria: 'Pesquisas', valor: kpis.pesquisas },
              { categoria: 'Produtos', valor: kpis.produtos },
              { categoria: 'Mercados', valor: kpis.mercados },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Browse Inline */}
      {activeBrowse === 'clientes' && clientesData && (
        <BrowseInline
          title="Clientes"
          data={clientesData.data || []}
          columns={clientesColumns}
          filters={entidadeFilters}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/entidades/${row.id}`)}
        />
      )}
      
      {activeBrowse === 'leads' && leadsData && (
        <BrowseInline
          title="Leads"
          data={leadsData.data || []}
          columns={clientesColumns}
          filters={entidadeFilters}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/entidades/${row.id}`)}
        />
      )}
      
      {activeBrowse === 'concorrentes' && concorrentesData && (
        <BrowseInline
          title="Concorrentes"
          data={concorrentesData.data || []}
          columns={clientesColumns}
          filters={entidadeFilters}
          onClose={() => setActiveBrowse(null)}
          onRowClick={(row) => navigate(`/entidades/${row.id}`)}
        />
      )}
      
      {activeBrowse === 'produtos' && produtosData && (
        <BrowseInline
          title="Produtos"
          data={produtosData.data || []}
          columns={produtosColumns}
          onClose={() => setActiveBrowse(null)}
        />
      )}
      
      {activeBrowse === 'mercados' && mercadosData && (
        <BrowseInline
          title="Mercados"
          data={mercadosData.data || []}
          columns={mercadosColumns}
          onClose={() => setActiveBrowse(null)}
        />
      )}
    </div>
  );
}
