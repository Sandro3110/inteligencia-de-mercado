/**
 * Geo Cockpit Unificado - Fusão de 5 páginas em 1
 * 
 * Modos disponíveis:
 * - Cockpit: Visualização de heatmap dinâmico com marcadores
 * - Análise Territorial: Insights e relatórios de concentração geográfica
 * - Heatmap: Densidade por cidade/UF com exportação visual
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MapPin, Users, Building2, Target, AlertCircle, Loader2, Map as MapIcon, 
  Search, Filter, X, Calendar, Sliders, TrendingUp, Award, BarChart3, 
  PieChart, Download, Layers
} from 'lucide-react';
import MapContainer from '@/components/maps/MapContainer';
import HeatmapLayer from '@/components/maps/HeatmapLayer';
import CustomMarker, { MarkerType } from '@/components/maps/CustomMarker';
import DashboardLayout from '@/components/DashboardLayout';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type ViewMode = 'cockpit' | 'territorial' | 'heatmap';

export default function GeoCockpit() {
  const { selectedProjectId } = useSelectedProject();
  const { selectedPesquisaId } = useSelectedPesquisa();
  const exportRef = useRef<HTMLDivElement>(null);

  // Estado principal - modo de visualização
  const [viewMode, setViewMode] = useState<ViewMode>('cockpit');
  
  // Estados do modo Cockpit
  const [selectedTipo, setSelectedTipo] = useState<'cliente' | 'concorrente' | 'lead' | undefined>();
  const [mapViewMode, setMapViewMode] = useState<'heatmap' | 'markers'>('heatmap');
  const [searchText, setSearchText] = useState('');
  const [selectedMercados, setSelectedMercados] = useState<number[]>([]);
  const [minQuality, setMinQuality] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [enableClustering, setEnableClustering] = useState(true);

  // Estados do modo Heatmap
  const [entityType, setEntityType] = useState<'clientes' | 'leads' | 'concorrentes' | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Queries do modo Cockpit
  const { data: stats, isLoading: statsLoading } = trpc.geo.getStats.useQuery(
    { projetoId: selectedProjectId! },
    { enabled: !!selectedProjectId && viewMode === 'cockpit' }
  );
  
  const { data: locations, isLoading: locationsLoading } = trpc.geo.getLocations.useQuery({
    projectId: selectedProjectId!,
    pesquisaId: selectedPesquisaId ?? undefined,
    tipo: selectedTipo,
  }, { enabled: !!selectedProjectId && viewMode === 'cockpit' });
  
  const { data: regionStats, isLoading: regionStatsLoading } = trpc.geo.getRegionStats.useQuery({
    projectId: selectedProjectId!,
    pesquisaId: selectedPesquisaId ?? undefined,
  }, { enabled: !!selectedProjectId && viewMode === 'cockpit' });

  // Queries do modo Territorial
  const { data: insights, isLoading: loadingInsights } = trpc.geo.getTerritorialInsights.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId && viewMode === 'territorial' }
  );

  const { data: analysis, isLoading: loadingAnalysis } = trpc.geo.getRegionAnalysis.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId && viewMode === 'territorial' }
  );

  // Queries do modo Heatmap
  const { data: densityData, isLoading: isLoadingDensity } = trpc.territorial.getDensity.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId ?? undefined,
      entityType,
    },
    { enabled: !!selectedProjectId && viewMode === 'heatmap' }
  );

  const { data: densityStats, isLoading: isLoadingStats } = trpc.territorial.getDensityStats.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId ?? undefined,
    },
    { enabled: !!selectedProjectId && viewMode === 'heatmap' }
  );

  // Query de mercados para filtros
  const { data: mercados } = trpc.mercados.list.useQuery({ 
    projectId: selectedProjectId!,
    pesquisaId: selectedPesquisaId ?? undefined 
  }, { enabled: !!selectedProjectId });

  // Filtrar locations (modo Cockpit)
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    
    return locations.filter(loc => {
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesName = loc.nome?.toLowerCase().includes(search);
        const matchesCidade = loc.cidade?.toLowerCase().includes(search);
        if (!matchesName && !matchesCidade) return false;
      }
      
      if (selectedMercados.length > 0 && loc.mercadoId) {
        if (!selectedMercados.includes(loc.mercadoId)) return false;
      }
      
      if (minQuality > 0 && loc.qualidadeScore) {
        if (loc.qualidadeScore < minQuality) return false;
      }
      
      return true;
    });
  }, [locations, searchText, selectedMercados, minQuality]);

  // Transformar para heatmap
  const heatmapPoints = useMemo(() => {
    if (!filteredLocations) return [];
    return filteredLocations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      intensity: (loc.qualidadeScore || 50) / 100,
    }));
  }, [filteredLocations]);

  // Centro do mapa
  const mapCenter = useMemo((): [number, number] => {
    if (!filteredLocations || filteredLocations.length === 0) {
      return [-14.235, -51.9253]; // Brasil
    }
    const avgLat = filteredLocations.reduce((sum, loc) => sum + loc.latitude, 0) / filteredLocations.length;
    const avgLng = filteredLocations.reduce((sum, loc) => sum + loc.longitude, 0) / filteredLocations.length;
    return [avgLat, avgLng];
  }, [filteredLocations]);

  // Processar dados de densidade (modo Heatmap)
  const processedDensityData = useMemo(() => {
    if (!densityData) return { byCity: [], byUF: [] };

    const cityMap = new Map<string, any>();
    densityData.forEach((item: any) => {
      const key = `${item.cidade}-${item.uf}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          cidade: item.cidade,
          uf: item.uf,
          clientes: 0,
          leads: 0,
          concorrentes: 0,
          total: 0,
        });
      }
      const city = cityMap.get(key);
      city[item.tipo] = item.count;
      city.total += item.count;
    });

    const byCity = Array.from(cityMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);

    const ufMap = new Map<string, any>();
    densityData.forEach((item: any) => {
      if (!ufMap.has(item.uf)) {
        ufMap.set(item.uf, {
          uf: item.uf,
          clientes: 0,
          leads: 0,
          concorrentes: 0,
          total: 0,
        });
      }
      const uf = ufMap.get(item.uf);
      uf[item.tipo] = (uf[item.tipo] || 0) + item.count;
      uf.total += item.count;
    });

    const byUF = Array.from(ufMap.values()).sort((a, b) => b.total - a.total);

    return { byCity, byUF };
  }, [densityData]);

  // Exportar visual (PNG/PDF)
  const handleExportVisual = async (format: 'png' | 'pdf') => {
    if (!exportRef.current) return;

    setIsExporting(true);
    toast.info(`Gerando ${format.toUpperCase()}...`);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const entityLabel = entityType ? entityType : 'todas';
      const fileName = `heatmap-territorial-${entityLabel}-${timestamp}`;

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success(`Imagem exportada: ${fileName}.png`);
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
        toast.success(`PDF exportado: ${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar relatório territorial
  const handleExportTerritorialPDF = () => {
    toast.info('Funcionalidade de exportação PDF em desenvolvimento');
  };

  // Renderizar modo Cockpit
  const renderCockpitMode = () => (
    <div className="space-y-6">
      {/* Painel de Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Controles de Visualização
              </CardTitle>
              <CardDescription>Configure os filtros e visualização do mapa</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Entidade</Label>
              <Select value={selectedTipo} onValueChange={(v: any) => setSelectedTipo(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">Todos os tipos</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                  <SelectItem value="concorrente">Concorrentes</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modo de Visualização</Label>
              <Select value={mapViewMode} onValueChange={(v: any) => setMapViewMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heatmap">Heatmap</SelectItem>
                  <SelectItem value="markers">Marcadores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Busca Rápida</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou cidade..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-8"
                />
                {searchText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setSearchText('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Qualidade Mínima: {minQuality}%</Label>
                <Slider
                  value={[minQuality]}
                  onValueChange={(v) => setMinQuality(v[0])}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clustering"
                    checked={enableClustering}
                    onCheckedChange={(checked) => setEnableClustering(checked as boolean)}
                  />
                  <Label htmlFor="clustering">Agrupar marcadores próximos</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Localizações</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.clientes?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concorrentes</CardTitle>
              <Building2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.concorrentes?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.leads?.total || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            Visualização Geográfica
          </CardTitle>
          <CardDescription>
            {filteredLocations?.length || 0} localizações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locationsLoading ? (
            <Skeleton className="h-[600px] w-full" />
          ) : filteredLocations && filteredLocations.length > 0 ? (
            <div className="h-[600px] rounded-lg overflow-hidden border">
              <MapContainer center={mapCenter} zoom={5}>
                {mapViewMode === 'heatmap' ? (
                  <HeatmapLayer points={heatmapPoints} />
                ) : enableClustering ? (
                  <MarkerClusterGroup>
                    {filteredLocations.map((loc, idx) => (
                      <CustomMarker
                        key={idx}
                        position={[loc.latitude, loc.longitude]}
                        type={(loc.tipo || 'lead') as MarkerType}
                        title={loc.nome || 'Sem nome'}
                      >
                        <div>
                          <p><strong>Cidade:</strong> {loc.cidade}</p>
                          {loc.qualidadeScore && (
                            <p><strong>Qualidade:</strong> {loc.qualidadeScore}%</p>
                          )}
                        </div>
                      </CustomMarker>
                    ))}
                  </MarkerClusterGroup>
                ) : (
                  <>
                    {filteredLocations.map((loc, idx) => (
                      <CustomMarker
                        key={idx}
                        position={[loc.latitude, loc.longitude]}
                        type={(loc.tipo || 'lead') as MarkerType}
                        title={loc.nome || 'Sem nome'}
                      >
                        <div>
                          <p><strong>Cidade:</strong> {loc.cidade}</p>
                          {loc.qualidadeScore && (
                            <p><strong>Qualidade:</strong> {loc.qualidadeScore}%</p>
                          )}
                        </div>
                      </CustomMarker>
                    ))}
                  </>
                )}
              </MapContainer>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma localização encontrada com os filtros aplicados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Regionais */}
      {regionStats && regionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Região</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {regionStats.map((region: any) => (
                <div key={region.uf} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{region.uf}</Badge>
                    <span className="text-sm font-medium">{region.cidade || 'Várias cidades'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-500">{region.clientes} clientes</span>
                    <span className="text-orange-500">{region.concorrentes} concorrentes</span>
                    <span className="text-green-500">{region.leads} leads</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Renderizar modo Territorial
  const renderTerritorialMode = () => {
    const isLoading = loadingInsights || loadingAnalysis;

    return (
      <div className="space-y-6">
        {/* Header com botão de exportação */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Análise Territorial</h2>
            <p className="text-muted-foreground">
              Insights e relatórios de concentração geográfica
            </p>
          </div>
          <Button
            onClick={handleExportTerritorialPDF}
            disabled={isGeneratingPDF || !insights || !analysis}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório PDF
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : insights && analysis ? (
          <>
            {/* Cards de Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Região com Maior Concentração</CardTitle>
                  <Award className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.topRegion?.name || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">
                    {insights.topRegion?.count || 0} entidades
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobertura Territorial</CardTitle>
                  <MapPin className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.totalRegions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    regiões com presença
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Densidade Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {insights.averageDensity?.toFixed(1) || '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    entidades por região
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Análise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Barras - Top Regiões */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top 10 Regiões por Concentração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(analysis as any)?.topRegions || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="clientes" fill="#3b82f6" name="Clientes" />
                      <Bar dataKey="concorrentes" fill="#f59e0b" name="Concorrentes" />
                      <Bar dataKey="leads" fill="#10b981" name="Leads" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Pizza - Distribuição por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição por Tipo de Entidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={(analysis as any)?.byType || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {((analysis as any)?.byType || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Análise Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada por Região</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Região</th>
                        <th className="text-right p-2">Clientes</th>
                        <th className="text-right p-2">Concorrentes</th>
                        <th className="text-right p-2">Leads</th>
                        <th className="text-right p-2">Total</th>
                        <th className="text-right p-2">% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((analysis as any)?.detailed || []).map((row: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="text-right p-2 text-blue-500">{row.clientes}</td>
                          <td className="text-right p-2 text-orange-500">{row.concorrentes}</td>
                          <td className="text-right p-2 text-green-500">{row.leads}</td>
                          <td className="text-right p-2 font-bold">{row.total}</td>
                          <td className="text-right p-2 text-muted-foreground">
                            {row.percentage?.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum dado disponível para análise territorial.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // Renderizar modo Heatmap
  const renderHeatmapMode = () => {
    const isLoading = isLoadingDensity || isLoadingStats;

    return (
      <div className="space-y-6" ref={exportRef}>
        {/* Header com controles */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Heatmap de Densidade Territorial</h2>
            <p className="text-muted-foreground">
              Visualização de densidade por cidade e UF
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={entityType} onValueChange={(v: any) => setEntityType(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Todas</SelectItem>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="concorrentes">Concorrentes</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportVisual('png')}>
                  Exportar como PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportVisual('pdf')}>
                  Exportar como PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : densityData && densityData.length > 0 ? (
          <>
            {/* Estatísticas */}
            {densityStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Cidades</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{densityStats.totalCities || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de UFs</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{densityStats.totalUFs || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cidade com Maior Densidade</CardTitle>
                    <Award className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{densityStats.topCity?.cidade || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">
                      {densityStats.topCity?.total || 0} entidades
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">UF com Maior Densidade</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{densityStats.topUF?.uf || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">
                      {densityStats.topUF?.total || 0} entidades
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top 10 Cidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top 10 Cidades por Densidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={processedDensityData.byCity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cidade" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="clientes" stackId="a" fill="#3b82f6" name="Clientes" />
                      <Bar dataKey="concorrentes" stackId="a" fill="#f59e0b" name="Concorrentes" />
                      <Bar dataKey="leads" stackId="a" fill="#10b981" name="Leads" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribuição por UF */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição por UF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPie>
                      <Pie
                        data={processedDensityData.byUF}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.uf}: ${entry.total}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {processedDensityData.byUF.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabela Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Densidade Detalhada por Cidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cidade</th>
                        <th className="text-left p-2">UF</th>
                        <th className="text-right p-2">Clientes</th>
                        <th className="text-right p-2">Concorrentes</th>
                        <th className="text-right p-2">Leads</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedDensityData.byCity.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{row.cidade}</td>
                          <td className="p-2">
                            <Badge variant="outline">{row.uf}</Badge>
                          </td>
                          <td className="text-right p-2 text-blue-500">{row.clientes}</td>
                          <td className="text-right p-2 text-orange-500">{row.concorrentes}</td>
                          <td className="text-right p-2 text-green-500">{row.leads}</td>
                          <td className="text-right p-2 font-bold">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum dado de densidade disponível.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Seletor de Modo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Modo de Visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cockpit">
                  <MapIcon className="h-4 w-4 mr-2" />
                  Cockpit
                </TabsTrigger>
                <TabsTrigger value="territorial">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análise Territorial
                </TabsTrigger>
                <TabsTrigger value="heatmap">
                  <Layers className="h-4 w-4 mr-2" />
                  Heatmap
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cockpit" className="mt-6">
                {renderCockpitMode()}
              </TabsContent>

              <TabsContent value="territorial" className="mt-6">
                {renderTerritorialMode()}
              </TabsContent>

              <TabsContent value="heatmap" className="mt-6">
                {renderHeatmapMode()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
