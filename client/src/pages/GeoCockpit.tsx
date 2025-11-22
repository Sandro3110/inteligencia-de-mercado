/**
 * Cockpit Geográfico - Visualização de Heatmap Dinâmico
 * 
 * Página principal para visualização geográfica de clientes, concorrentes e leads
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Building2, Target, AlertCircle, Loader2, Map as MapIcon } from 'lucide-react';
import MapContainer from '@/components/maps/MapContainer';
import HeatmapLayer from '@/components/maps/HeatmapLayer';
import CustomMarker from '@/components/maps/CustomMarker';
import DashboardLayout from '@/components/DashboardLayout';

export default function GeoCockpit() {
  // Estado dos filtros
  const [selectedProject, setSelectedProject] = useState<number>(1);
  const [selectedPesquisa, setSelectedPesquisa] = useState<number | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<'cliente' | 'concorrente' | 'lead' | undefined>();
  const [viewMode, setViewMode] = useState<'heatmap' | 'markers'>('heatmap');

  // Queries
  const { data: stats, isLoading: statsLoading } = trpc.geo.getStats.useQuery({ projetoId: selectedProject });
  const { data: locations, isLoading: locationsLoading } = trpc.geo.getLocations.useQuery({
    projectId: selectedProject,
    pesquisaId: selectedPesquisa,
    tipo: selectedTipo,
  });
  const { data: regionStats, isLoading: regionStatsLoading } = trpc.geo.getRegionStats.useQuery({
    projectId: selectedProject,
    pesquisaId: selectedPesquisa,
  });

  // Transformar locations para formato do heatmap
  const heatmapPoints = useMemo(() => {
    if (!locations) return [];
    return locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      intensity: (loc.qualidadeScore || 50) / 100, // Normalizar 0-1
    }));
  }, [locations]);

  // Calcular centro do mapa baseado nos dados
  const mapCenter = useMemo((): [number, number] => {
    if (!locations || locations.length === 0) {
      return [-14.235, -51.925]; // Centro do Brasil
    }
    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    return [avgLat, avgLng];
  }, [locations]);

  // Verificar se há dados geocodificados
  const hasGeocodedData = stats && stats.total.comCoordenadas > 0;

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MapIcon className="h-8 w-8 text-primary" />
              Cockpit Geográfico
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualização geográfica e heatmap dinâmico de clientes, concorrentes e leads
            </p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total.percentual}% geocodificados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.clientes.comCoordenadas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  de {stats.clientes.total.toLocaleString()} ({stats.clientes.percentual}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Concorrentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.concorrentes.comCoordenadas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  de {stats.concorrentes.total.toLocaleString()} ({stats.concorrentes.percentual}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leads.comCoordenadas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  de {stats.leads.total.toLocaleString()} ({stats.leads.percentual}%)
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Alerta se não há dados geocodificados */}
        {!hasGeocodedData && !statsLoading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum registro geocodificado encontrado. Configure a API Key do Google Maps e execute a geocodificação
              na página de <a href="/geo-admin" className="underline font-medium">Gerenciamento de Geocodificação</a>.
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros e Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel Lateral - Filtros */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filtros</CardTitle>
                <CardDescription>Configure a visualização do mapa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtro de Tipo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Registro</label>
                  <Select
                    value={selectedTipo || 'all'}
                    onValueChange={(value) => setSelectedTipo(value === 'all' ? undefined : value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="cliente">Clientes</SelectItem>
                      <SelectItem value="concorrente">Concorrentes</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Modo de Visualização */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modo de Visualização</label>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                      <TabsTrigger value="markers">Marcadores</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Estatísticas do Filtro Atual */}
                {locations && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Registros Visíveis</div>
                    <div className="text-2xl font-bold text-primary">{locations.length}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas por Região */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Estados</CardTitle>
                <CardDescription>Distribuição por UF</CardDescription>
              </CardHeader>
              <CardContent>
                {regionStatsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-8" />)}
                  </div>
                ) : regionStats && regionStats.length > 0 ? (
                  <div className="space-y-2">
                    {regionStats
                      .sort((a, b) => b.comCoordenadas - a.comCoordenadas)
                      .slice(0, 5)
                      .map((stat: any) => (
                        <div key={stat.uf} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{stat.uf}</Badge>
                            <span className="text-sm">{stat.comCoordenadas}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {stat.percentualGeolocalizado}%
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mapa Principal */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Mapa Geográfico</span>
                  {locationsLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {hasGeocodedData ? (
                  <MapContainer center={mapCenter} zoom={locations && locations.length > 0 ? 5 : 4}>
                    {viewMode === 'heatmap' && heatmapPoints.length > 0 && (
                      <HeatmapLayer points={heatmapPoints} options={{ radius: 30, blur: 20 }} />
                    )}
                    
                    {viewMode === 'markers' && locations && locations.map((loc: any) => (
                      <CustomMarker
                        key={`${loc.tipo}-${loc.id}`}
                        position={[loc.latitude, loc.longitude]}
                        type={loc.tipo}
                        title={loc.nome}
                      >
                        <div className="text-xs space-y-1">
                          <p><strong>Cidade:</strong> {loc.cidade}/{loc.uf}</p>
                          {loc.qualidadeScore && (
                            <p><strong>Qualidade:</strong> {loc.qualidadeScore}</p>
                          )}
                          {loc.validationStatus && (
                            <Badge variant="outline" className="text-xs">
                              {loc.validationStatus}
                            </Badge>
                          )}
                        </div>
                      </CustomMarker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-2">
                      <MapPin className="h-12 w-12 mx-auto opacity-50" />
                      <p>Nenhum dado geocodificado disponível</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/geo-admin">Configurar Geocodificação</a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
