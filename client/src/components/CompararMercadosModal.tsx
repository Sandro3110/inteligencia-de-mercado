import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, Users, Target, TrendingUp } from "lucide-react";

interface CompararMercadosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mercadoIds: number[];
}

export function CompararMercadosModal({ open, onOpenChange, mercadoIds }: CompararMercadosModalProps) {
  const { data: comparison, isLoading } = trpc.compare.mercados.useQuery(
    { mercadoIds },
    { enabled: open && mercadoIds.length > 0 }
  );

  if (!comparison || comparison.length === 0) {
    return null;
  }

  // Preparar dados para o gráfico
  const chartData = [
    {
      metric: "Clientes",
      ...Object.fromEntries(
        comparison.map((c) => [c.mercado.nome.substring(0, 20), c.metrics.clientes])
      ),
    },
    {
      metric: "Concorrentes",
      ...Object.fromEntries(
        comparison.map((c) => [c.mercado.nome.substring(0, 20), c.metrics.concorrentes])
      ),
    },
    {
      metric: "Leads",
      ...Object.fromEntries(
        comparison.map((c) => [c.mercado.nome.substring(0, 20), c.metrics.leads])
      ),
    },
  ];

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparação de Mercados</DialogTitle>
          <DialogDescription>
            Análise comparativa de {comparison.length} mercados selecionados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.map((item, index) => (
              <Card key={item.mercado.id} className="border-2" style={{ borderColor: colors[index % colors.length] }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: colors[index % colors.length] }} />
                    {item.mercado.nome}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Segmentação: {item.mercado.segmentacao || "N/A"}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Clientes
                    </div>
                    <div className="text-lg font-bold">{item.metrics.clientes}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      Concorrentes
                    </div>
                    <div className="text-lg font-bold">{item.metrics.concorrentes}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      Leads
                    </div>
                    <div className="text-lg font-bold">{item.metrics.leads}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Qualidade Média</div>
                    <div className="text-lg font-bold text-primary">
                      {item.metrics.qualidadeMedia.toFixed(1)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparison.map((item, index) => (
                    <Bar
                      key={item.mercado.id}
                      dataKey={item.mercado.nome.substring(0, 20)}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela Comparativa Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento Comparativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Métrica</th>
                      {comparison.map((item, index) => (
                        <th key={item.mercado.id} className="text-right p-2 font-medium" style={{ color: colors[index % colors.length] }}>
                          {item.mercado.nome.substring(0, 20)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 text-muted-foreground">Clientes</td>
                      {comparison.map((item) => (
                        <td key={item.mercado.id} className="text-right p-2 font-medium">
                          {item.metrics.clientes}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-muted-foreground">Concorrentes</td>
                      {comparison.map((item) => (
                        <td key={item.mercado.id} className="text-right p-2 font-medium">
                          {item.metrics.concorrentes}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-muted-foreground">Leads</td>
                      {comparison.map((item) => (
                        <td key={item.mercado.id} className="text-right p-2 font-medium">
                          {item.metrics.leads}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-muted-foreground">Qualidade Média</td>
                      {comparison.map((item) => (
                        <td key={item.mercado.id} className="text-right p-2 font-medium text-primary">
                          {item.metrics.qualidadeMedia.toFixed(1)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-muted-foreground">Leads/Cliente</td>
                      {comparison.map((item) => (
                        <td key={item.mercado.id} className="text-right p-2 font-medium">
                          {item.metrics.clientes > 0 
                            ? (item.metrics.leads / item.metrics.clientes).toFixed(2)
                            : "0.00"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 text-muted-foreground">Concorrentes/Cliente</td>
                      {comparison.map((item) => (
                        <td key={item.mercado.id} className="text-right p-2 font-medium">
                          {item.metrics.clientes > 0 
                            ? (item.metrics.concorrentes / item.metrics.clientes).toFixed(2)
                            : "0.00"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
