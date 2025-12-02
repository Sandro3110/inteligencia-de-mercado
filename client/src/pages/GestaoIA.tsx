// client/src/pages/GestaoIA.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, Users, Zap, DollarSign, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface IAStats {
  config: {
    plataforma: string;
    modelo: string;
    budgetMensal: number;
  };
  resumoMensal: {
    totalChamadas: number;
    totalTokens: number;
    custoTotal: number;
    budgetMensal: number;
    percentualUsado: number;
  };
  usoPorDia: Array<{
    data: string;
    chamadas: number;
    tokens: number;
    custo: number;
  }>;
  usoPorMes: Array<{
    mes: string;
    chamadas: number;
    tokens: number;
    custo: number;
  }>;
  usoPorUsuario: Array<{
    user_id: string;
    usuario_nome: string;
    usuario_email: string;
    chamadas: number;
    tokens: number;
    custo: number;
  }>;
  usoPorProcesso: Array<{
    processo: string;
    chamadas: number;
    tokens: number;
    custo: number;
    duracao_media: number;
  }>;
  atividadesRecentes: Array<{
    id: number;
    processo: string;
    usuario_nome: string;
    tokens: number;
    custo: number;
    duracao: number;
    sucesso: boolean;
    erro: string | null;
    created_at: string;
  }>;
}

const PROCESSO_LABELS: Record<string, string> = {
  enriquecimento: 'Enriquecimento',
  analise_mercado: 'Análise de Mercado',
  sugestoes: 'Sugestões',
};

export default function GestaoIA() {
  const [stats, setStats] = useState<IAStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [plataforma, setPlataforma] = useState('openai');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch('https://inteligencia-de-mercado.vercel.app/api/ia-stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setPlataforma(result.data.config.plataforma);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
          <p className="text-lg text-gray-600">Carregando estatísticas de IA...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg text-gray-600">Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  const percentualUsado = stats.resumoMensal.percentualUsado;
  const corBudget = percentualUsado > 90 ? 'bg-red-500' : percentualUsado > 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Gestão de IA
          </h1>
          <p className="text-gray-600 mt-1">
            Monitore o uso, custos e performance da inteligência artificial
          </p>
        </div>
      </div>

      {/* Configuração Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração Atual</CardTitle>
          <CardDescription>Plataforma e modelo de IA em uso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Plataforma</label>
              <Select value={plataforma} onValueChange={setPlataforma}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="google">Google Gemini</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Modelo</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md">
                <Badge variant="outline">{stats.config.modelo}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Budget Mensal</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md font-semibold">
                ${stats.config.budgetMensal.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resumoMensal.totalChamadas}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Consumidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.resumoMensal.totalTokens / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground">Total de tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.resumoMensal.custoTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentualUsado.toFixed(1)}% do budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Restante</CardTitle>
            <AlertCircle className={`h-4 w-4 ${percentualUsado > 80 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.resumoMensal.budgetMensal - stats.resumoMensal.custoTotal).toFixed(2)}
            </div>
            <Progress value={percentualUsado} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tokens por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Uso de Tokens por Dia</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.usoPorDia.slice(0, 30).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: any) => [(value / 1000).toFixed(1) + 'k', 'Tokens']}
                />
                <Legend />
                <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} name="Tokens" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Custo por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Custo por Mês</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.usoPorMes.slice(0, 12).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  formatter={(value: any) => ['$' + Number(value).toFixed(2), 'Custo']}
                />
                <Legend />
                <Bar dataKey="custo" fill="#10b981" name="Custo ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Consumo por Processo */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo por Processo</CardTitle>
          <CardDescription>Uso de IA por tipo de processamento (mês atual)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.usoPorProcesso.map((processo) => (
              <div key={processo.processo} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{PROCESSO_LABELS[processo.processo] || processo.processo}</Badge>
                    <span className="text-sm text-gray-600">{processo.chamadas} chamadas</span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>{(processo.tokens / 1000).toFixed(1)}k tokens</span>
                    <span>•</span>
                    <span>${Number(processo.custo).toFixed(4)}</span>
                    <span>•</span>
                    <span>{processo.duracao_media}ms médio</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    ${Number(processo.custo).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consumo por Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo por Usuário</CardTitle>
          <CardDescription>Top usuários por custo (mês atual)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Usuário</th>
                  <th className="text-right py-2 px-4">Chamadas</th>
                  <th className="text-right py-2 px-4">Tokens</th>
                  <th className="text-right py-2 px-4">Custo</th>
                </tr>
              </thead>
              <tbody>
                {stats.usoPorUsuario.map((usuario) => (
                  <tr key={usuario.user_id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <div>
                        <div className="font-medium">{usuario.usuario_nome}</div>
                        <div className="text-sm text-gray-600">{usuario.usuario_email}</div>
                      </div>
                    </td>
                    <td className="text-right py-2 px-4">{usuario.chamadas}</td>
                    <td className="text-right py-2 px-4">{(usuario.tokens / 1000).toFixed(1)}k</td>
                    <td className="text-right py-2 px-4 font-semibold">${Number(usuario.custo).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas 50 chamadas de IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.atividadesRecentes.map((atividade) => (
              <div key={atividade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {atividade.sucesso ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{PROCESSO_LABELS[atividade.processo] || atividade.processo}</Badge>
                      <span className="text-sm text-gray-600">{atividade.usuario_nome}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(atividade.created_at).toLocaleString('pt-BR')}
                    </div>
                    {atividade.erro && (
                      <div className="text-xs text-red-600 mt-1">{atividade.erro}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">${Number(atividade.custo).toFixed(4)}</div>
                  <div className="text-xs text-gray-600">{atividade.tokens} tokens</div>
                  <div className="text-xs text-gray-600">{atividade.duracao}ms</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
