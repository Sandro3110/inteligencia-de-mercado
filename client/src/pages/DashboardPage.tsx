import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Users, Target, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  
  const { data: distribuicaoGeo, refetch: refetchGeo } = trpc.dashboard.distribuicaoGeografica.useQuery();
  const { data: distribuicaoSeg, refetch: refetchSeg } = trpc.dashboard.distribuicaoSegmentacao.useQuery();
  const { data: timeline, refetch: refetchTimeline } = trpc.dashboard.timelineValidacoes.useQuery({ days });
  const { data: funil, refetch: refetchFunil } = trpc.dashboard.funilConversao.useQuery();
  const { data: top10, refetch: refetchTop10 } = trpc.dashboard.top10Mercados.useQuery();

  const handleRefreshAll = () => {
    refetchGeo();
    refetchSeg();
    refetchTimeline();
    refetchFunil();
    refetchTop10();
  };

  // Preparar dados do funil
  const funilData = funil
    ? [
        { name: "Leads", value: funil.leads, fill: "#3b82f6" },
        { name: "Clientes", value: funil.clientes, fill: "#10b981" },
        { name: "Validados", value: funil.validados, fill: "#f59e0b" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: "Analytics" }]} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Avançado</h1>
              <p className="text-sm text-muted-foreground">Análise e visualização de dados</p>
            </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={days === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(7)}
              >
                7 dias
              </Button>
              <Button
                variant={days === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(30)}
              >
                30 dias
              </Button>
              <Button
                variant={days === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(90)}
              >
                90 dias
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold text-foreground">{funil?.leads || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold text-foreground">{funil?.clientes || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Validados</p>
                <p className="text-2xl font-bold text-foreground">{funil?.validados || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {funil?.clientes ? `${((funil.validados / funil.clientes) * 100).toFixed(1)}% do total` : ""}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição Geográfica */}
          <Card className="p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição Geográfica (Top 10 UFs)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoGeo?.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="uf" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="count" fill="#3b82f6" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição por Segmentação */}
          <Card className="p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição por Segmentação</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoSeg}
                  dataKey="count"
                  nameKey="segmentacao"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.segmentacao}: ${entry.count}`}
                >
                  {distribuicaoSeg?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Timeline de Validações */}
          <Card className="p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Timeline de Validações ({days} dias)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#10b981" name="Validações" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Funil de Conversão */}
          <Card className="p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Funil de Conversão</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="value" name="Quantidade">
                  {funilData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top 10 Mercados */}
          <Card className="p-6 bg-white shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Mercados por Volume de Clientes</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="nome" type="category" stroke="#94a3b8" width={300} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="quantidadeClientes" fill="#8b5cf6" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
