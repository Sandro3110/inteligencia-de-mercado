'use client';

import { useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { exportToCSV, formatDataForExport } from '@/lib/exportUtils';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { CardSkeleton, ChartSkeleton } from '@/components/skeletons';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] as const;

interface OverviewTabProps {
  projectId: number;
}

interface StatusItem {
  status: string | null;
  count: number;
}

interface ValidationData {
  name: string;
  value: number;
  color: string;
}

interface EntityData {
  name: string;
  value: number;
}

function getStatusCount(statusArray: StatusItem[], status: string): number {
  const item = statusArray.find((s) => s.status === status);
  return item?.count ?? 0;
}

export default function OverviewTab({ projectId }: OverviewTabProps) {
  const { data: stats, isLoading } = trpc.analytics.stats.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: allClientes } = trpc.clientes.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: allConcorrentes } = trpc.concorrentes.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: allLeads } = trpc.leads.list.useQuery({ projectId }, { enabled: !!projectId });

  const handleExportClientes = useCallback(() => {
    if (!allClientes || allClientes.length === 0) {
      toast.error('Nenhum cliente para exportar');
      return;
    }
    const { headers, rows } = formatDataForExport(
      allClientes,
      Object.keys(allClientes[0] || {}).map((key) => ({ key: key as any, label: key }))
    );
    exportToCSV({ headers, rows, filename: 'clientes-pav.csv' });
    toast.success('Clientes exportados com sucesso!');
  }, [allClientes]);

  const handleExportConcorrentes = useCallback(() => {
    if (!allConcorrentes || allConcorrentes.length === 0) {
      toast.error('Nenhum concorrente para exportar');
      return;
    }
    const { headers, rows } = formatDataForExport(
      allConcorrentes,
      Object.keys(allConcorrentes[0] || {}).map((key) => ({ key: key as any, label: key }))
    );
    exportToCSV({ headers, rows, filename: 'concorrentes-pav.csv' });
    toast.success('Concorrentes exportados com sucesso!');
  }, [allConcorrentes]);

  const handleExportLeads = useCallback(() => {
    if (!allLeads || allLeads.length === 0) {
      toast.error('Nenhum lead para exportar');
      return;
    }
    const { headers, rows } = formatDataForExport(
      allLeads,
      Object.keys(allLeads[0] || {}).map((key) => ({ key: key as any, label: key }))
    );
    exportToCSV({ headers, rows, filename: 'leads-pav.csv' });
    toast.success('Leads exportados com sucesso!');
  }, [allLeads]);

  const validationMetrics = useMemo(() => {
    if (!stats) return null;

    const clientesPending = getStatusCount(stats.validation.clientes, 'pending');
    const clientesRich = getStatusCount(stats.validation.clientes, 'rich');
    const clientesNeedsAdjustment = getStatusCount(stats.validation.clientes, 'needs_adjustment');
    const clientesDiscarded = getStatusCount(stats.validation.clientes, 'discarded');

    const concorrentesPending = getStatusCount(stats.validation.concorrentes, 'pending');
    const concorrentesRich = getStatusCount(stats.validation.concorrentes, 'rich');

    const leadsPending = getStatusCount(stats.validation.leads, 'pending');
    const leadsRich = getStatusCount(stats.validation.leads, 'rich');

    const totalValidated = clientesRich + concorrentesRich + leadsRich;
    const totalPending = clientesPending + concorrentesPending + leadsPending;
    const totalRecords = stats.totals.clientes + stats.totals.concorrentes + stats.totals.leads;
    const validationProgress = Math.round((totalValidated / totalRecords) * 100);

    return {
      clientesPending,
      clientesRich,
      clientesNeedsAdjustment,
      clientesDiscarded,
      concorrentesPending,
      concorrentesRich,
      leadsPending,
      leadsRich,
      totalValidated,
      totalPending,
      totalRecords,
      validationProgress,
    };
  }, [stats]);

  const validationData = useMemo<ValidationData[]>(() => {
    if (!validationMetrics) return [];
    return [
      { name: 'Validados', value: validationMetrics.totalValidated, color: COLORS[1] },
      { name: 'Pendentes', value: validationMetrics.totalPending, color: COLORS[2] },
      { name: 'Ajuste', value: validationMetrics.clientesNeedsAdjustment, color: COLORS[2] },
      { name: 'Descartados', value: validationMetrics.clientesDiscarded, color: COLORS[3] },
    ];
  }, [validationMetrics]);

  const entityData = useMemo<EntityData[]>(() => {
    if (!stats) return [];
    return [
      { name: 'Mercados', value: stats.totals.mercados },
      { name: 'Clientes', value: stats.totals.clientes },
      { name: 'Concorrentes', value: stats.totals.concorrentes },
      { name: 'Leads', value: stats.totals.leads },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton count={4} showHeader={true} contentHeight="h-16" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton type="pie" />
          <ChartSkeleton type="bar" />
        </div>
      </div>
    );
  }

  if (!stats || !validationMetrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mercados</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totals.mercados}</div>
            <Link href="/mercados">
              <a className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Ver mercados →
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totals.clientes}</div>
            <Button
              variant="link"
              size="sm"
              onClick={handleExportClientes}
              className="text-xs text-green-600 hover:underline mt-1 p-0 h-auto"
            >
              Exportar CSV →
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concorrentes
            </CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totals.concorrentes}</div>
            <Button
              variant="link"
              size="sm"
              onClick={handleExportConcorrentes}
              className="text-xs text-purple-600 hover:underline mt-1 p-0 h-auto"
            >
              Exportar CSV →
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totals.leads}</div>
            <Button
              variant="link"
              size="sm"
              onClick={handleExportLeads}
              className="text-xs text-orange-600 hover:underline mt-1 p-0 h-auto"
            >
              Exportar CSV →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Validation Progress */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Progresso de Validação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${validationMetrics.validationProgress}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {validationMetrics.validationProgress}%
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-slate-600">
                Validados: <strong>{validationMetrics.totalValidated}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-slate-600">
                Pendentes: <strong>{validationMetrics.totalPending}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-slate-600">
                Ajuste: <strong>{validationMetrics.clientesNeedsAdjustment}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-slate-600">
                Descartados: <strong>{validationMetrics.clientesDiscarded}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Status de Validação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={validationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {validationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Distribuição por Entidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={entityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
