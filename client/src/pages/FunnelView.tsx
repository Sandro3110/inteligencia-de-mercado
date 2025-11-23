import { Breadcrumbs } from "@/components/Breadcrumbs";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
export default function FunnelView() {
  const { selectedProjectId } = useSelectedProject();

  const { data: funnelData, isLoading } = trpc.funnel.data.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen ml-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="min-h-screen ml-60 bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Funil de Vendas" }]} />
          <div className="text-center text-slate-400 mt-12">
            Nenhum dado de funil disponível
          </div>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico de funil
  const chartData = funnelData.funnelData.map((item: any) => ({
    name: item.stage.charAt(0).toUpperCase() + item.stage.slice(1),
    value: item.count,
    fill: getStageColor(item.stage),
  }));

  function getStageColor(stage: string) {
    const colors: Record<string, string> = {
      novo: "#3b82f6",
      qualificado: "#10b981",
      negociacao: "#f59e0b",
      fechado: "#8b5cf6",
      perdido: "#ef4444",
    };
    return colors[stage] || "#6b7280";
  }

  function getStageName(stage: string) {
    const names: Record<string, string> = {
      novo: "Novo",
      qualificado: "Qualificado",
      negociacao: "Negociação",
      fechado: "Fechado",
      perdido: "Perdido",
    };
    return names[stage] || stage;
  }

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Funil de Vendas" }]} />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Funil de Vendas</h1>
          <p className="text-slate-600 mt-1">
            Visualize o fluxo de leads através dos estágios
          </p>
        </div>

        {/* Métrica Total */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Total de Leads no Funil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              {funnelData.totalLeads}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Funil */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Visualização do Funil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Funnel dataKey="value" data={chartData} isAnimationActive>
                  <LabelList
                    position="right"
                    fill="#fff"
                    stroke="none"
                    dataKey="name"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxas de Conversão */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Taxas de Conversão Entre Estágios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.conversionRates.map((rate: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">
                        {getStageName(rate.from)}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-300">
                        {getStageName(rate.to)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rate.rate >= 50 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-lg font-bold ${rate.rate >= 50 ? "text-green-400" : "text-red-400"}`}
                    >
                      {rate.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento por Estágio */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Detalhamento por Estágio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {funnelData.funnelData.map((item: any) => (
                <div
                  key={item.stage}
                  className="p-4 bg-slate-800/50 rounded-lg text-center"
                >
                  <div className="text-sm text-slate-400 mb-2">
                    {getStageName(item.stage)}
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {item.count}
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full"
                    style={{ backgroundColor: getStageColor(item.stage) }}
                  ></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
