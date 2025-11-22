/**
 * Página de Gerenciamento de Geocodificação
 * 
 * Permite configurar API Key do Google Maps e executar geocodificação em lote
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  Settings,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

export default function GeoAdmin() {
  const [selectedProject] = useState(1);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Queries
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.geo.getStats.useQuery({
    projetoId: selectedProject,
  });

  const { data: pendingRecords, isLoading: pendingLoading } = trpc.geo.getRecordsSemCoordenadas.useQuery({
    projetoId: selectedProject,
  });

  // Mutations
  const testConnection = trpc.geo.testConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Conexão com Google Maps API estabelecida com sucesso!');
      } else {
        toast.error(result.message || 'Falha ao conectar com Google Maps API');
      }
    },
    onError: () => {
      toast.error('Erro ao testar conexão');
    },
  });

  const geocodeBatch = trpc.geo.geocodeBatch.useMutation({
    onSuccess: (result) => {
      setIsGeocoding(false);
      if (result.success) {
        toast.success(
          `Geocodificação concluída! ${result.succeeded} registros processados com sucesso, ${result.failed} falharam.`
        );
        refetchStats();
      } else {
        toast.error(result.error || 'Erro ao geocodificar registros');
      }
    },
    onError: () => {
      setIsGeocoding(false);
      toast.error('Erro ao executar geocodificação em lote');
    },
  });

  const handleTestConnection = () => {
    testConnection.mutate({ projetoId: selectedProject });
  };

  const handleGeocodeAll = () => {
    if (!pendingRecords || pendingRecords.length === 0) {
      toast.info('Nenhum registro pendente de geocodificação');
      return;
    }

    setIsGeocoding(true);
    geocodeBatch.mutate({ projetoId: selectedProject });
  };

  const handleGeocodeByType = (tipo: 'cliente' | 'concorrente' | 'lead') => {
    setIsGeocoding(true);
    geocodeBatch.mutate({ projetoId: selectedProject, tipo });
  };

  // Calcular progresso geral
  const overallProgress = stats
    ? Math.round((stats.total.comCoordenadas / stats.total.total) * 100) || 0
    : 0;

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Gerenciamento de Geocodificação
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure a API do Google Maps e execute a geocodificação da base de dados
            </p>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total.total.toLocaleString()}</div>
                  <Progress value={overallProgress} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{overallProgress}% geocodificados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Geocodificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.total.comCoordenadas.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total.percentual}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.total.semCoordenadas.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {100 - stats.total.percentual}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-16">
                  {overallProgress === 100 ? (
                    <Badge variant="default" className="text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completo
                    </Badge>
                  ) : overallProgress > 0 ? (
                    <Badge variant="secondary" className="text-sm">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Em Progresso
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Não Iniciado
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Alerta de API Key */}
            {stats.total.semCoordenadas > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ação Necessária</AlertTitle>
                <AlertDescription>
                  Há {stats.total.semCoordenadas.toLocaleString()} registros pendentes de geocodificação.
                  Configure a API Key do Google Maps e execute a geocodificação em lote.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : null}

        {/* Tabs */}
        <Tabs defaultValue="execute" className="space-y-4">
          <TabsList>
            <TabsTrigger value="execute">Executar Geocodificação</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="details">Detalhes por Tipo</TabsTrigger>
          </TabsList>

          {/* Tab: Executar Geocodificação */}
          <TabsContent value="execute" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geocodificação em Lote</CardTitle>
                <CardDescription>
                  Execute a geocodificação de todos os registros pendentes ou por tipo específico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleGeocodeAll}
                    disabled={isGeocoding || !pendingRecords || pendingRecords.length === 0}
                    size="lg"
                  >
                    {isGeocoding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Geocodificando...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Geocodificar Todos ({pendingRecords?.length || 0})
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    disabled={testConnection.isPending}
                  >
                    {testConnection.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Button
                    onClick={() => handleGeocodeByType('cliente')}
                    variant="outline"
                    disabled={isGeocoding}
                  >
                    Geocodificar Clientes
                  </Button>
                  <Button
                    onClick={() => handleGeocodeByType('concorrente')}
                    variant="outline"
                    disabled={isGeocoding}
                  >
                    Geocodificar Concorrentes
                  </Button>
                  <Button
                    onClick={() => handleGeocodeByType('lead')}
                    variant="outline"
                    disabled={isGeocoding}
                  >
                    Geocodificar Leads
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configuração */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração da API</CardTitle>
                <CardDescription>
                  Configure a API Key do Google Maps para habilitar a geocodificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Como obter a API Key</AlertTitle>
                  <AlertDescription>
                    1. Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a><br />
                    2. Crie um projeto ou selecione um existente<br />
                    3. Habilite a "Geocoding API"<br />
                    4. Crie uma API Key em "Credenciais"<br />
                    5. Cole a chave abaixo
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">Google Maps API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="AIzaSy..."
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure a API Key através da interface de gerenciamento de configurações do projeto
                  </p>
                </div>

                <Alert variant="default">
                  <BarChart3 className="h-4 w-4" />
                  <AlertTitle>Limites da API Gratuita</AlertTitle>
                  <AlertDescription>
                    • 40.000 requisições/mês grátis<br />
                    • ~1.300 requisições/dia<br />
                    • Recomendado: geocodificar em lotes pequenos
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Detalhes por Tipo */}
          <TabsContent value="details" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Clientes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-semibold">{stats.clientes.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Geocodificados:</span>
                      <span className="font-semibold">{stats.clientes.comCoordenadas.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-yellow-600">
                      <span className="text-sm">Pendentes:</span>
                      <span className="font-semibold">{stats.clientes.semCoordenadas.toLocaleString()}</span>
                    </div>
                    <Progress value={stats.clientes.percentual} className="mt-2" />
                    <p className="text-xs text-center text-muted-foreground">{stats.clientes.percentual}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Concorrentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-semibold">{stats.concorrentes.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Geocodificados:</span>
                      <span className="font-semibold">{stats.concorrentes.comCoordenadas.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-yellow-600">
                      <span className="text-sm">Pendentes:</span>
                      <span className="font-semibold">{stats.concorrentes.semCoordenadas.toLocaleString()}</span>
                    </div>
                    <Progress value={stats.concorrentes.percentual} className="mt-2" />
                    <p className="text-xs text-center text-muted-foreground">{stats.concorrentes.percentual}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-semibold">{stats.leads.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Geocodificados:</span>
                      <span className="font-semibold">{stats.leads.comCoordenadas.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-yellow-600">
                      <span className="text-sm">Pendentes:</span>
                      <span className="font-semibold">{stats.leads.semCoordenadas.toLocaleString()}</span>
                    </div>
                    <Progress value={stats.leads.percentual} className="mt-2" />
                    <p className="text-xs text-center text-muted-foreground">{stats.leads.percentual}%</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
