import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface EvolutionChartsProps {
  runId: number;
}

type Period = "24h" | "7d" | "30d";

export default function EvolutionCharts({ runId }: EvolutionChartsProps) {
  const [period, setPeriod] = useState<Period>("24h");

  // Buscar dados reais do backend
  const { data: evolutionData, isLoading } = trpc.stats.evolution.useQuery({ 
    projectId: 1, // TODO: usar projectId dinâmico
    period 
  });

  const clientsOverTime = evolutionData?.clientsOverTime || [];
  const successRateByBatch = evolutionData?.successRateByBatch || [];
  const avgTimePerClient = evolutionData?.avgTimePerClient || [];

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <div className="flex gap-2">
        <Button
          variant={period === "24h" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("24h")}
        >
          24 Horas
        </Button>
        <Button
          variant={period === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("7d")}
        >
          7 Dias
        </Button>
        <Button
          variant={period === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("30d")}
        >
          30 Dias
        </Button>
      </div>

      {/* Gráfico 1: Clientes Processados ao Longo do Tempo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          📈 Clientes Processados ao Longo do Tempo
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={clientsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
            <XAxis
              dataKey="time"
              stroke="oklch(0.6 0 0)"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="oklch(0.6 0 0)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.2 0 0)",
                border: "1px solid oklch(0.3 0 0)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "oklch(0.9 0 0)" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="clientes"
              stroke="oklch(0.7 0.15 200)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.7 0.15 200)", r: 4 }}
              activeDot={{ r: 6 }}
              name="Clientes"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico 2: Taxa de Sucesso por Lote */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          📊 Taxa de Sucesso por Lote
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={successRateByBatch}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
            <XAxis
              dataKey="lote"
              stroke="oklch(0.6 0 0)"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="oklch(0.6 0 0)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.2 0 0)",
                border: "1px solid oklch(0.3 0 0)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "oklch(0.9 0 0)" }}
            />
            <Legend />
            <Bar
              dataKey="sucesso"
              fill="oklch(0.7 0.15 150)"
              name="Sucesso (%)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="erro"
              fill="oklch(0.6 0.15 30)"
              name="Erro (%)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico 3: Tempo Médio por Cliente */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          ⏱️ Tempo Médio por Cliente (segundos)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={avgTimePerClient}>
            <defs>
              <linearGradient id="colorTempo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.7 0.15 280)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.7 0.15 280)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
            <XAxis
              dataKey="hora"
              stroke="oklch(0.6 0 0)"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="oklch(0.6 0 0)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.2 0 0)",
                border: "1px solid oklch(0.3 0 0)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "oklch(0.9 0 0)" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="tempo"
              stroke="oklch(0.7 0.15 280)"
              strokeWidth={2}
              fill="url(#colorTempo)"
              name="Tempo (s)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
