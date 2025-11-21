import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_NAMES = {
  openai: { label: "OpenAI", color: "bg-green-500", icon: Zap },
  serpapi: { label: "SERPAPI", color: "bg-blue-500", icon: Activity },
  receitaws: { label: "ReceitaWS", color: "bg-purple-500", icon: Activity },
} as const;

type APIName = keyof typeof API_NAMES;

export default function APIHealthDashboard() {
  const [days, setDays] = useState(7);
  const [testingAPI, setTestingAPI] = useState<APIName | null>(null);

  const {
    data: stats,
    isLoading,
    refetch,
  } = trpc.apiHealth.stats.useQuery({ days });
  const { data: history } = trpc.apiHealth.history.useQuery({ limit: 20 });
  const testMutation = trpc.apiHealth.test.useMutation();

  const handleTestAPI = async (apiName: APIName) => {
    setTestingAPI(apiName);
    try {
      const result = await testMutation.mutateAsync({ apiName });

      if (result.success) {
        toast.success(`${API_NAMES[apiName].label} está operacional`, {
          description: `Tempo de resposta: ${result.responseTime}ms`,
        });
      } else {
        toast.error(`${API_NAMES[apiName].label} falhou no teste`, {
          description: result.error,
        });
      }

      refetch();
    } catch (error) {
      toast.error("Erro ao testar API", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setTestingAPI(null);
    }
  };

  const getStatusBadge = (successRate: number) => {
    if (successRate >= 95) {
      return <Badge className="bg-green-500">Excelente</Badge>;
    } else if (successRate >= 80) {
      return <Badge className="bg-yellow-500">Bom</Badge>;
    } else if (successRate >= 60) {
      return <Badge className="bg-orange-500">Atenção</Badge>;
    } else {
      return <Badge className="bg-red-500">Crítico</Badge>;
    }
  };

  const getTrendIcon = (successRate: number) => {
    if (successRate >= 95) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    if (successRate >= 80) {
      return <Minus className="w-4 h-4 text-yellow-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saúde das APIs</h1>
          <p className="text-slate-600 mt-1">
            Monitoramento em tempo real das integrações externas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Últimas 24h</option>
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : stats?.map(stat => {
              const apiConfig = API_NAMES[stat.apiName as APIName];
              const IconComponent = apiConfig.icon;

              return (
                <Card key={stat.apiName} className="relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${apiConfig.color}`}
                  />

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        <CardTitle>{apiConfig.label}</CardTitle>
                      </div>
                      {getTrendIcon(stat.successRate)}
                    </div>
                    <CardDescription>
                      {stat.totalCalls} chamadas nos últimos {days} dias
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Taxa de Sucesso */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">
                          Taxa de Sucesso
                        </span>
                        {getStatusBadge(stat.successRate)}
                      </div>
                      <div className="text-3xl font-bold">
                        {stat.successRate}%
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${apiConfig.color}`}
                          style={{ width: `${stat.successRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">
                            {stat.successCount}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Sucesso
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="font-semibold">
                            {stat.errorCount}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Erros</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">
                            {stat.timeoutCount}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Timeout
                        </div>
                      </div>
                    </div>

                    {/* Tempo Médio de Resposta */}
                    <div className="pt-3 border-t">
                      <div className="text-xs text-slate-500">
                        Tempo Médio de Resposta
                      </div>
                      <div className="text-xl font-semibold mt-1">
                        {stat.avgResponseTime}ms
                      </div>
                    </div>

                    {/* Último Erro */}
                    {stat.lastError && (
                      <div className="pt-3 border-t">
                        <div className="text-xs text-slate-500 mb-1">
                          Último Erro
                        </div>
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {stat.lastError}
                        </div>
                      </div>
                    )}

                    {/* Botão de Teste */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleTestAPI(stat.apiName as APIName)}
                      disabled={testingAPI === stat.apiName}
                    >
                      {testingAPI === stat.apiName ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4 mr-2" />
                          Testar Conexão
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Gráfico de Tendências */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências de Desempenho</CardTitle>
          <CardDescription>
            Taxa de sucesso por API nos últimos {days} dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stats || stats.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum dado disponível ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={stats.map(stat => ({
                  name:
                    API_NAMES[stat.apiName as APIName]?.label || stat.apiName,
                  "Taxa de Sucesso": stat.successRate,
                  "Tempo Médio (ms)": stat.avgResponseTime,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Taxa de Sucesso (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Tempo (ms)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Taxa de Sucesso"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Tempo Médio (ms)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Chamadas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamadas</CardTitle>
          <CardDescription>Últimas 20 chamadas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhuma chamada registrada ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo de Resposta</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {API_NAMES[item.apiName as APIName]?.label ||
                        item.apiName}
                    </TableCell>
                    <TableCell>
                      {item.status === "success" ? (
                        <Badge className="bg-green-500">Sucesso</Badge>
                      ) : item.status === "error" ? (
                        <Badge className="bg-red-500">Erro</Badge>
                      ) : (
                        <Badge className="bg-orange-500">Timeout</Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.responseTime}ms</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {item.endpoint || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(item.createdAt).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs text-red-600 max-w-xs truncate">
                      {item.errorMessage || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
