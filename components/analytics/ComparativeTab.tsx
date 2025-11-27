'use client';

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] as const;

const PERIOD_OPTIONS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
] as const;

interface ComparativeTabProps {
  projectId: number;
}

interface StageData {
  name: string;
  value: number;
}

interface MercadoData {
  nome: string;
  leads: number;
}

interface QualityData {
  date: string;
  score: string;
  count: number;
}

interface GrowthData {
  date: string;
  novos: number;
  total: number;
}

interface LeadsByStageItem {
  stage: string | null;
  count: string | number;
}

interface LeadsByMercadoItem {
  mercadoNome: string | null;
  leadCount: string | number;
}

interface QualityEvolutionItem {
  date: string | Date;
  avgScore: string | number;
  count: string | number;
}

interface LeadsGrowthItem {
  date: string | Date;
  count: string | number;
  cumulative: string | number;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export default function ComparativeTab({ projectId }: ComparativeTabProps) {
  const [period, setPeriod] = useState<number>(30);

  const { data: kpis } = trpc.analytics.kpis.useQuery({ projectId }, { enabled: !!projectId });

  const { data: leadsByStage } = trpc.analytics.leadsByStage.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: leadsByMercado } = trpc.analytics.leadsByMercado.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: qualityEvolution } = trpc.analytics.qualityEvolution.useQuery(
    { projectId, days: period },
    { enabled: !!projectId }
  );

  const { data: leadsGrowth } = trpc.analytics.leadsGrowth.useQuery(
    { projectId, days: period },
    { enabled: !!projectId }
  );

  const handlePeriodChange = useCallback((value: string) => {
    setPeriod(Number(value));
  }, []);

  // Formatar dados para gráficos
  const stageData = useMemo<StageData[]>(
    () =>
      (leadsByStage as LeadsByStageItem[] | undefined)?.map((item) => ({
        name: item.stage || 'Sem estágio',
        value: Number(item.count),
      })) || [],
    [leadsByStage]
  );

  const mercadoData = useMemo<MercadoData[]>(
    () =>
      (leadsByMercado as LeadsByMercadoItem[] | undefined)?.map((item) => ({
        nome: item.mercadoNome || 'Sem mercado',
        leads: Number(item.leadCount),
      })) || [],
    [leadsByMercado]
  );

  const qualityData = useMemo<QualityData[]>(
    () =>
      (qualityEvolution as QualityEvolutionItem[] | undefined)?.map((item) => ({
        date: formatDate(item.date),
        score: Number(item.avgScore).toFixed(1),
        count: Number(item.count),
      })) || [],
    [qualityEvolution]
  );

  const growthData = useMemo<GrowthData[]>(
    () =>
      (leadsGrowth as LeadsGrowthItem[] | undefined)?.map((item) => ({
        date: formatDate(item.date),
        novos: Number(item.count),
        total: Number(item.cumulative),
      })) || [],
    [leadsGrowth]
  );

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Análises Comparativas</h2>
          <p className="text-sm text-muted-foreground">
            Visualize métricas e insights detalhados
          </p>
        </div>

        <Select value={period.toString()} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.conversionRate ? `${kpis.conversionRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">{kpis?.closedLeads || 0} fechados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.avgQualityScore ? kpis.avgQualityScore.toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">de 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mercados Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalMercados || 0}</div>
            <p className="text-xs text-muted-foreground">
              {kpis?.totalConcorrentes || 0} concorrentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos com Tabs */}
      <Tabs defaultValue="stage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stage">Por Estágio</TabsTrigger>
          <TabsTrigger value="mercado">Por Mercado</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
        </TabsList>

        <TabsContent value="stage">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Leads por Estágio</CardTitle>
              <CardDescription>
                Visualize como seus leads estão distribuídos no funil de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mercado">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Mercados por Número de Leads</CardTitle>
              <CardDescription>Mercados com maior volume de leads identificados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mercadoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Score de Qualidade</CardTitle>
              <CardDescription>
                Acompanhe a evolução da qualidade dos leads ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Score Médio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Leads</CardTitle>
              <CardDescription>Novos leads e total acumulado ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="novos"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="Novos Leads"
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="2"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    name="Total Acumulado"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
