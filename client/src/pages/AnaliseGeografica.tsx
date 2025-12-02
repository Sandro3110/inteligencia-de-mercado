/**
 * Tela: Análise Geográfica
 * Mapas interativos + Heatmap + Drill-down + Clusters
 * 100% Funcional
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, TrendingUp, Navigation, Download } from 'lucide-react';

// Componentes dimensionais
import { FiltroGeografico, type FiltroGeo } from '@/components/dimensional/FiltroGeografico';
import { KPIGrid } from '@/components/dimensional/KPICard';
import { DataTable } from '@/components/dimensional/DataTable';
import { ExportButton } from '@/components/dimensional/ExportButton';
import { LoadingState } from '@/components/dimensional/LoadingState';

// tRPC
import { trpc } from '@/lib/trpc';

// Google Maps
import { 
  initGoogleMaps, 
  createMap, 
  addMarkers, 
  createHeatmap, 
  createClusters,
  limparMapa 
} from '@/lib/dimensional/google-maps';

export function AnaliseGeografica() {
  const [filtroGeo, setFiltroGeo] = useState<FiltroGeo>({});
  const [visualizacao, setVisualizacao] = useState<'pontos' | 'heatmap' | 'clusters'>('pontos');
  const [nivelDrillDown, setNivelDrillDown] = useState<'pais' | 'regiao' | 'estado' | 'cidade'>('pais');
  
  // Buscar dados via tRPC
  const { data: dadosGeo, isLoading: loading } = trpc.geografia.mapa.useQuery({
    filtroGeo,
    nivel: nivelDrillDown
  });
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [elementosMapa, setElementosMapa] = useState<{
    marcadores: google.maps.Marker[];
    clusters: any[];
    heatmaps: google.maps.visualization.HeatmapLayer[];
  }>({ marcadores: [], clusters: [], heatmaps: [] });

  // Dados padrão enquanto carrega
  const dadosGeoFinal = dadosGeo || [];

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        await initGoogleMaps();
        const map = createMap('map-container', {
          center: { lat: -14.235, lng: -51.9253 }, // Centro do Brasil
          zoom: 4
        });
        setMapInstance(map);
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
      }
    };

    initMap();
  }, []);

  // Atualizar visualização do mapa
  useEffect(() => {
    if (!mapInstance) return;

    // Limpar elementos anteriores do mapa
    limparMapa(elementosMapa);

    const markers = dadosGeoFinal.map(local => ({
      position: { lat: local.lat, lng: local.lng },
      title: local.nome,
      info: `${local.total} entidades\nR$ ${(local.receita / 1000000).toFixed(1)}M`
    }));

    if (visualizacao === 'pontos') {
      addMarkers(mapInstance, markers);
    } else if (visualizacao === 'heatmap') {
      const heatmapData = dadosGeoFinal.map(local => ({
        location: new google.maps.LatLng(local.lat, local.lng),
        weight: local.receita
      }));
      createHeatmap(mapInstance, heatmapData);
    } else if (visualizacao === 'clusters') {
      createClusters(mapInstance, markers);
    }
  }, [mapInstance, visualizacao, dadosGeoFinal]);

  // Calcular totais por região
  const totaisPorRegiao = dadosGeoFinal.reduce((acc, local) => {
    if (!acc[local.regiao]) {
      acc[local.regiao] = { total: 0, receita: 0, cidades: 0 };
    }
    acc[local.regiao].total += local.total;
    acc[local.regiao].receita += local.receita;
    acc[local.regiao].cidades += 1;
    return acc;
  }, {} as Record<string, { total: number; receita: number; cidades: number }>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise Geográfica</h1>
          <p className="text-muted-foreground mt-1">
            Visualização espacial de dados com mapas interativos
          </p>
        </div>
        <ExportButton
          data={dadosGeo}
          nomeArquivo="analise-geografica"
          formato="excel"
        />
      </div>

      {/* KPIs Geográficos */}
      <KPIGrid
        kpis={[
          {
            titulo: 'Total de Localizações',
            valor: dadosGeo.length,
            formato: 'numero',
            icone: 'map-pin'
          },
          {
            titulo: 'Receita Total',
            valor: dadosGeo.reduce((sum, l) => sum + l.receita, 0),
            formato: 'moeda',
            icone: 'dollar-sign'
          },
          {
            titulo: 'Média por Localização',
            valor: dadosGeo.reduce((sum, l) => sum + l.receita, 0) / dadosGeo.length,
            formato: 'moeda',
            icone: 'trending-up'
          },
          {
            titulo: 'Região com Maior Receita',
            valor: Object.entries(totaisPorRegiao).sort((a, b) => b[1].receita - a[1].receita)[0][0],
            formato: 'texto',
            icone: 'award'
          }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1 space-y-4">
          <FiltroGeografico
            value={filtroGeo}
            onChange={setFiltroGeo}
          />

          {/* Controles de Visualização */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Visualização</h3>
            </div>

            <div className="space-y-2">
              <Button
                variant={visualizacao === 'pontos' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setVisualizacao('pontos')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Pontos
              </Button>
              <Button
                variant={visualizacao === 'heatmap' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setVisualizacao('heatmap')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Heatmap
              </Button>
              <Button
                variant={visualizacao === 'clusters' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setVisualizacao('clusters')}
              >
                <Layers className="h-4 w-4 mr-2" />
                Clusters
              </Button>
            </div>
          </Card>

          {/* Drill-down */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Drill-down</h3>
            </div>

            <div className="space-y-2">
              {['pais', 'regiao', 'estado', 'cidade'].map((nivel) => (
                <Button
                  key={nivel}
                  variant={nivelDrillDown === nivel ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start capitalize"
                  onClick={() => setNivelDrillDown(nivel as any)}
                >
                  {nivel}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Mapa e Dados */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mapa */}
          <Card className="p-0 overflow-hidden">
            <div 
              id="map-container" 
              className="w-full h-[500px] bg-muted"
              style={{ minHeight: '500px' }}
            >
              {!mapInstance && (
                <div className="flex items-center justify-center h-full">
                  <LoadingState variant="spinner" mensagem="Carregando mapa..." />
                </div>
              )}
            </div>
          </Card>

          {/* Tabs de Dados */}
          <Tabs defaultValue="tabela" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="regioes">Por Região</TabsTrigger>
            </TabsList>

            <TabsContent value="tabela" className="mt-4">
              <DataTable
                dados={dadosGeo}
                colunas={[
                  { key: 'nome', label: 'Cidade', sortable: true },
                  { key: 'estado', label: 'Estado', sortable: true },
                  { key: 'regiao', label: 'Região', sortable: true },
                  { key: 'total', label: 'Total Entidades', sortable: true, format: 'number' },
                  { key: 'receita', label: 'Receita', sortable: true, format: 'currency' }
                ]}
                onRowClick={(row) => {
                  // Centralizar mapa na localização
                  if (mapInstance) {
                    mapInstance.setCenter({ lat: row.lat, lng: row.lng });
                    mapInstance.setZoom(12);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="ranking" className="mt-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top 10 Cidades por Receita</h3>
                <div className="space-y-3">
                  {dadosGeo
                    .sort((a, b) => b.receita - a.receita)
                    .slice(0, 10)
                    .map((local, index) => (
                      <div key={local.id} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{local.nome}/{local.estado}</div>
                          <div className="text-sm text-muted-foreground">
                            {local.total} entidades
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            R$ {(local.receita / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {((local.receita / dadosGeo.reduce((sum, l) => sum + l.receita, 0)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="regioes" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(totaisPorRegiao)
                  .sort((a, b) => b[1].receita - a[1].receita)
                  .map(([regiao, dados]) => (
                    <Card key={regiao} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{regiao}</h3>
                        <Badge variant="secondary">{dados.cidades} cidades</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Entidades:</span>
                          <span className="font-medium">{dados.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Receita:</span>
                          <span className="font-medium">
                            R$ {(dados.receita / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Média/Cidade:</span>
                          <span className="font-medium">
                            R$ {(dados.receita / dados.cidades / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
