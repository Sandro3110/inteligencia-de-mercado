import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";
import { 
  Building2, 
  Users, 
  Target, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: allClientes } = trpc.clientes.list.useQuery({});
  const { data: allConcorrentes } = trpc.concorrentes.list.useQuery({});
  const { data: allLeads } = trpc.leads.list.useQuery({});

  const handleExportClientes = () => {
    if (!allClientes || allClientes.length === 0) {
      toast.error('Nenhum cliente para exportar');
      return;
    }
    exportToCSV(allClientes, 'clientes-pav.csv');
    toast.success('Clientes exportados com sucesso!');
  };

  const handleExportConcorrentes = () => {
    if (!allConcorrentes || allConcorrentes.length === 0) {
      toast.error('Nenhum concorrente para exportar');
      return;
    }
    exportToCSV(allConcorrentes, 'concorrentes-pav.csv');
    toast.success('Concorrentes exportados com sucesso!');
  };

  const handleExportLeads = () => {
    if (!allLeads || allLeads.length === 0) {
      toast.error('Nenhum lead para exportar');
      return;
    }
    exportToCSV(allLeads, 'leads-pav.csv');
    toast.success('Leads exportados com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  const getStatusCount = (statusArray: any[], status: string) => {
    const item = statusArray.find((s: any) => s.status === status);
    return item?.count || 0;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestor de Pesquisa de Mercado PAV
          </h1>
          <p className="text-muted-foreground">
            Visualize, valide e gerencie seus dados de pesquisa de mercado
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mercados
              </CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totals.mercados}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mercados únicos identificados
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totals.clientes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes associados aos mercados
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Concorrentes
              </CardTitle>
              <Target className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totals.concorrentes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Concorrentes mapeados
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leads
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totals.leads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Leads qualificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Validation Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Progresso da Validação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Total Validado</span>
                  <span className="text-sm font-medium">{validationProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${validationProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{totalPending}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalValidated}</p>
                    <p className="text-xs text-muted-foreground">Validados</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{clientesNeedsAdjustment}</p>
                    <p className="text-xs text-muted-foreground">Precisam Ajuste</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{clientesDiscarded}</p>
                    <p className="text-xs text-muted-foreground">Descartados</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/mercados">
                <Button size="lg" className="w-full sm:w-auto">
                  <Building2 className="mr-2 h-5 w-5" />
                  Ver Mercados
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleExportClientes}>
                <Target className="mr-2 h-5 w-5" />
                Exportar Clientes
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleExportConcorrentes}>
                <Target className="mr-2 h-5 w-5" />
                Exportar Concorrentes
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleExportLeads}>
                <Target className="mr-2 h-5 w-5" />
                Exportar Leads
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

