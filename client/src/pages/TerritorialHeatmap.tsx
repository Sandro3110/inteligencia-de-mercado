import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, Target, Filter, Layers } from "lucide-react";

export default function TerritorialHeatmap() {
  const { selectedProjectId } = useSelectedProject();
  const [entityType, setEntityType] = useState<"clientes" | "leads" | "concorrentes" | undefined>();
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | undefined>();

  // Buscar pesquisas do projeto
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(undefined, {
    enabled: !!selectedProjectId,
  });

  // Buscar dados de densidade
  const { data: densityData, isLoading: isLoadingDensity } = trpc.territorial.getDensity.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId,
      entityType,
    },
    { enabled: !!selectedProjectId }
  );

  // Buscar estatísticas por região
  const { data: statsData, isLoading: isLoadingStats } = trpc.territorial.getDensityStats.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId,
    },
    { enabled: !!selectedProjectId }
  );

  // Processar dados para visualização
  const processedData = useMemo(() => {
    if (!densityData) return { byCity: [], byUF: [] };

    // Agrupar por cidade
    const cityMap = new Map<string, any>();
    densityData.forEach((item: any) => {
      const key = `${item.cidade}-${item.uf}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          cidade: item.cidade,
          uf: item.uf,
          count: 0,
          avgQuality: 0,
          qualitySum: 0,
          entityTypes: { clientes: 0, leads: 0, concorrentes: 0 },
        });
      }
      const entry = cityMap.get(key)!;
      entry.count++;
      entry.qualitySum += item.qualidadeScore || 0;
      entry.avgQuality = entry.qualitySum / entry.count;
      entry.entityTypes[item.entityType as keyof typeof entry.entityTypes]++;
    });

    const byCity = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Agrupar por UF
    const ufMap = new Map<string, any>();
    densityData.forEach((item: any) => {
      if (!ufMap.has(item.uf)) {
        ufMap.set(item.uf, {
          uf: item.uf,
          count: 0,
          avgQuality: 0,
          qualitySum: 0,
        });
      }
      const entry = ufMap.get(item.uf)!;
      entry.count++;
      entry.qualitySum += item.qualidadeScore || 0;
      entry.avgQuality = entry.qualitySum / entry.count;
    });

    const byUF = Array.from(ufMap.values()).sort((a, b) => b.count - a.count);

    return { byCity, byUF };
  }, [densityData]);

  const getIntensityColor = (count: number, max: number) => {
    const intensity = count / max;
    if (intensity > 0.7) return "bg-red-500";
    if (intensity > 0.5) return "bg-orange-500";
    if (intensity > 0.3) return "bg-yellow-500";
    if (intensity > 0.1) return "bg-green-500";
    return "bg-blue-500";
  };

  const getIntensityLabel = (count: number, max: number) => {
    const intensity = count / max;
    if (intensity > 0.7) return "Muito Alta";
    if (intensity > 0.5) return "Alta";
    if (intensity > 0.3) return "Média";
    if (intensity > 0.1) return "Baixa";
    return "Muito Baixa";
  };

  if (!selectedProjectId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-slate-600">Selecione um projeto para visualizar o heatmap</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxCount = Math.max(...(processedData.byCity.map((c) => c.count) || [1]));

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-500" />
            Heatmap de Concentração Territorial
          </h1>
          <p className="text-slate-600 mt-1">
            Visualize a densidade de clientes, leads e concorrentes por região
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Entidade</label>
              <Select value={entityType ?? "all"} onValueChange={(v) => setEntityType(v === "all" ? undefined : v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="concorrentes">Concorrentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisa</label>
              <Select
                value={selectedPesquisaId?.toString() ?? "all"}
                onValueChange={(v) => setSelectedPesquisaId(v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Pesquisas</SelectItem>
                  {pesquisas?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      {statsData && statsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Estados</p>
                  <p className="text-2xl font-bold text-slate-900">{statsData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Entidades</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsData.reduce((sum: number, s: any) => sum + Number(s.total), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Alta Qualidade</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsData.reduce((sum: number, s: any) => sum + Number(s.altaQualidade), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Qualidade Média</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(
                      statsData.reduce((sum: number, s: any) => sum + Number(s.qualidadeMedia), 0) /
                      statsData.length
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Heatmap por Cidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            Top 20 Cidades por Densidade
          </CardTitle>
          <CardDescription>Cidades com maior concentração de entidades</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDensity ? (
            <p className="text-center py-8 text-slate-600">Carregando dados...</p>
          ) : processedData.byCity.length === 0 ? (
            <p className="text-center py-8 text-slate-600">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {processedData.byCity.map((city, index) => (
                <div key={`${city.cidade}-${city.uf}`} className="flex items-center gap-3">
                  <div className="w-8 text-center font-bold text-slate-400">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">
                        {city.cidade} - {city.uf}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{city.count} entidades</Badge>
                        <Badge className={getIntensityColor(city.count, maxCount)}>
                          {getIntensityLabel(city.count, maxCount)}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`${getIntensityColor(city.count, maxCount)} rounded-full h-3 transition-all`}
                        style={{ width: `${(city.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                      <span>Clientes: {city.entityTypes.clientes}</span>
                      <span>Leads: {city.entityTypes.leads}</span>
                      <span>Concorrentes: {city.entityTypes.concorrentes}</span>
                      <span>Qualidade Média: {city.avgQuality.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Heatmap por Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            Densidade por Estado
          </CardTitle>
          <CardDescription>Distribuição de entidades por UF</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDensity ? (
            <p className="text-center py-8 text-slate-600">Carregando dados...</p>
          ) : processedData.byUF.length === 0 ? (
            <p className="text-center py-8 text-slate-600">Nenhum dado disponível</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {processedData.byUF.map((uf) => (
                <Card key={uf.uf} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{uf.uf}</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{uf.count}</div>
                    <div className="text-xs text-slate-600">
                      Qualidade: {uf.avgQuality.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda de Intensidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-slate-600">Muito Alta (&gt;70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-slate-600">Alta (50-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-slate-600">Média (30-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-slate-600">Baixa (10-30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-slate-600">Muito Baixa (&lt;10%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
