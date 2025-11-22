/**
 * Análise Territorial - Fase 69.7
 * Relatórios de concentração geográfica e identificação de regiões com maior potencial
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useSelectedPesquisa } from "@/hooks/useSelectedPesquisa";
import {
  Loader2,
  MapPin,
  TrendingUp,
  Award,
  BarChart3,
  PieChart,
  Download,
  Map,
} from "lucide-react";
import { toast } from "sonner";
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
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function TerritorialAnalysis() {
  const { selectedProjectId } = useSelectedProject();
  const { selectedPesquisaId } = useSelectedPesquisa();

  // Queries
  const { data: insights, isLoading: loadingInsights } = trpc.geo.getTerritorialInsights.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  const { data: analysis, isLoading: loadingAnalysis } = trpc.geo.getRegionAnalysis.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  const isLoading = loadingInsights || loadingAnalysis;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Mutation para gerar PDF
  const generatePDF = trpc.territorial.generateReport.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsGeneratingPDF(false);
      toast.success('Relatório PDF gerado com sucesso!', {
        description: `Arquivo: ${data.filename}`,
      });
    },
    onError: (error) => {
      setIsGeneratingPDF(false);
      toast.error('Erro ao gerar relatório', {
        description: error.message,
      });
    },
  });

  const handleExportPDF = () => {
    if (!insights || !analysis || !selectedProjectId) {
      toast.error('Dados insuficientes para gerar relatório');
      return;
    }

    setIsGeneratingPDF(true);

    // Preparar dados do relatório
    const stateRanking = (analysis.byUF || []).map((item: any) => ({
      state: item.uf,
      clients: Number(item.totalClientes) || 0,
      competitors: Number(item.totalConcorrentes) || 0,
      leads: Number(item.totalLeads) || 0,
      score: Number(item.qualidadeMedia) || 0,
    }));

    const cityRanking = (analysis.byCidade || []).map((item: any) => ({
      city: item.cidade,
      state: item.uf,
      clients: Number(item.totalClientes) || 0,
      competitors: Number(item.totalConcorrentes) || 0,
      leads: Number(item.totalLeads) || 0,
      score: Number(item.qualidadeMedia) || 0,
    }));

    // Gerar insights automáticos
    const autoInsights: string[] = [];
    if (insights.topRegion) {
      autoInsights.push(
        `A região de ${insights.topRegion.cidade}/${insights.topRegion.uf} lidera com ${insights.topRegion.total} registros.`
      );
    }
    if (insights.totalEstados) {
      const cobertura = ((insights.totalEstados / 27) * 100).toFixed(0);
      autoInsights.push(
        `Cobertura territorial de ${cobertura}% do Brasil (${insights.totalEstados} de 27 estados).`
      );
    }
    if (insights.qualidadeMediaGeral) {
      const qualidade = Number(insights.qualidadeMediaGeral);
      const nivel = qualidade >= 70 ? 'alta' : qualidade >= 50 ? 'média' : 'baixa';
      autoInsights.push(
        `Qualidade média dos dados: ${qualidade.toFixed(0)}/100 (${nivel}).`
      );
    }

    // Gerar recomendações automáticas
    const recommendations: string[] = [];
    if (stateRanking.length > 0) {
      const top3States = stateRanking.slice(0, 3).map((s: any) => s.state).join(', ');
      recommendations.push(
        `Priorizar esforços comerciais nos estados: ${top3States}.`
      );
    }
    if (cityRanking.length > 0) {
      const top3Cities = cityRanking.slice(0, 3).map((c: any) => `${c.city}/${c.state}`).join(', ');
      recommendations.push(
        `Focar ações de marketing nas cidades: ${top3Cities}.`
      );
    }
    if (insights.totalEstados && insights.totalEstados < 10) {
      recommendations.push(
        'Expandir cobertura territorial para outras regiões do Brasil.'
      );
    }
    if (insights.qualidadeMediaGeral && Number(insights.qualidadeMediaGeral) < 60) {
      recommendations.push(
        'Investir em enriquecimento de dados para melhorar a qualidade das informações.'
      );
    }

    generatePDF.mutate({
      projectId: selectedProjectId.toString(),
      projectName: 'Projeto Atual', // TODO: buscar nome real do projeto
      totalStates: insights.totalEstados || 0,
      totalCities: insights.totalCidades || 0,
      totalClients: insights.totalClientes || 0,
      totalCompetitors: insights.totalConcorrentes || 0,
      totalLeads: insights.totalLeads || 0,
      stateRanking,
      cityRanking,
      insights: autoInsights,
      recommendations,
    });
  };

  // Preparar dados para gráficos
  const ufChartData = useMemo(() => {
    if (!analysis?.byUF) return [];
    return analysis.byUF.slice(0, 10).map((item: any) => ({
      uf: item.uf,
      clientes: Number(item.totalClientes) || 0,
      concorrentes: Number(item.totalConcorrentes) || 0,
      leads: Number(item.totalLeads) || 0,
      total: Number(item.total) || 0,
    }));
  }, [analysis]);

  const cidadeChartData = useMemo(() => {
    if (!analysis?.byCidade) return [];
    return analysis.byCidade.slice(0, 10).map((item: any) => ({
      cidade: `${item.cidade}/${item.uf}`,
      clientes: Number(item.totalClientes) || 0,
      concorrentes: Number(item.totalConcorrentes) || 0,
      leads: Number(item.totalLeads) || 0,
      total: Number(item.total) || 0,
    }));
  }, [analysis]);

  const distributionData = useMemo(() => {
    if (!insights) return [];
    return [
      { name: "Clientes", value: Number(insights.totalClientes) || 0, color: "#3b82f6" },
      { name: "Concorrentes", value: Number(insights.totalConcorrentes) || 0, color: "#ef4444" },
      { name: "Leads", value: Number(insights.totalLeads) || 0, color: "#10b981" },
    ].filter(item => item.value > 0);
  }, [insights]);

  if (!selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto selecionado</h3>
          <p className="text-muted-foreground">
            Selecione um projeto no menu lateral para visualizar a análise territorial.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando análise territorial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="w-8 h-8" />
            Análise Territorial
          </h1>
          <p className="text-muted-foreground mt-1">
            Concentração geográfica e regiões com maior potencial de mercado
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleExportPDF}
          disabled={isGeneratingPDF || !insights || !analysis}
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGeneratingPDF ? 'Gerando...' : 'Exportar Relatório PDF'}
        </Button>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights?.totalRegistros || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Geocodificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estados Cobertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights?.totalEstados || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De 27 estados brasileiros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cidades Mapeadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights?.totalCidades || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Diferentes municípios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qualidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {insights?.qualidadeMediaGeral 
                ? Number(insights.qualidadeMediaGeral).toFixed(0) 
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Score de qualidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights de Destaque */}
      {insights?.topRegion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Região com Maior Concentração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{insights.topRegion.uf}</div>
              <p className="text-muted-foreground">
                {insights.topRegion.total} registros geocodificados
              </p>
              <Badge variant="secondary" className="mt-2">
                {((Number(insights.topRegion.total) / Number(insights.totalRegistros)) * 100).toFixed(1)}% do total
              </Badge>
            </CardContent>
          </Card>

          {insights.topCity && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Cidade com Maior Potencial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {insights.topCity.cidade}/{insights.topCity.uf}
                </div>
                <p className="text-muted-foreground">
                  {insights.topCity.totalLeads} leads de alta qualidade
                </p>
                <Badge variant="secondary" className="mt-2">
                  Qualidade média: {Number(insights.topCity.qualidadeMedia).toFixed(0)}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Top 10 Estados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top 10 Estados
            </CardTitle>
            <CardDescription>
              Distribuição de registros por unidade federativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ufChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="uf" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clientes" fill="#3b82f6" name="Clientes" />
                <Bar dataKey="concorrentes" fill="#ef4444" name="Concorrentes" />
                <Bar dataKey="leads" fill="#10b981" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribuição por Tipo
            </CardTitle>
            <CardDescription>
              Proporção de clientes, concorrentes e leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras - Top 10 Cidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top 10 Cidades
          </CardTitle>
          <CardDescription>
            Cidades com maior concentração de registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cidadeChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="cidade" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="clientes" fill="#3b82f6" name="Clientes" />
              <Bar dataKey="concorrentes" fill="#ef4444" name="Concorrentes" />
              <Bar dataKey="leads" fill="#10b981" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabelas de Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Estados */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Estados</CardTitle>
            <CardDescription>Ordenado por total de registros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis?.byUF?.slice(0, 10).map((item: any, index: number) => (
                <div
                  key={item.uf}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-lg text-muted-foreground w-6">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{item.uf}</div>
                      <div className="text-sm text-muted-foreground">
                        Qualidade média: {Number(item.qualidadeMedia).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.total}</div>
                    <div className="text-xs text-muted-foreground">
                      C:{item.totalClientes} | Co:{item.totalConcorrentes} | L:{item.totalLeads}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking de Cidades */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Cidades</CardTitle>
            <CardDescription>Ordenado por total de registros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis?.byCidade?.slice(0, 10).map((item: any, index: number) => (
                <div
                  key={`${item.cidade}-${item.uf}`}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-lg text-muted-foreground w-6">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {item.cidade}/{item.uf}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Qualidade média: {Number(item.qualidadeMedia).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.total}</div>
                    <div className="text-xs text-muted-foreground">
                      C:{item.totalClientes} | Co:{item.totalConcorrentes} | L:{item.totalLeads}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
