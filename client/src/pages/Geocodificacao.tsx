import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Geocodificacao() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState(0);

  // Buscar projetos
  const { data: projects } = trpc.projects.list.useQuery();

  // Selecionar primeiro projeto automaticamente
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Buscar estatísticas
  const { data: stats, refetch: refetchStats } = trpc.geo.getStats.useQuery(
    { projetoId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Buscar registros sem coordenadas
  const { data: recordsSemCoord, refetch: refetchRecords } = trpc.geo.getRecordsSemCoordenadas.useQuery(
    { projetoId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Mutations
  const geocodeAddress = trpc.geo.geocodeAddress.useMutation();
  const geocodeBatch = trpc.geo.geocodeBatch.useMutation();

  // Handler para geocodificar todos
  const handleGeocodeAll = async () => {
    if (!selectedProjectId) return;

    setIsGeocoding(true);
    setProgress(0);

    try {
      const result = await geocodeBatch.mutateAsync({
        projetoId: selectedProjectId,
      });

      if (result.success) {
        toast.success(
          `Geocodificação concluída! ${result.succeeded}/${result.processed} registros atualizados`
        );
        refetchStats();
        refetchRecords();
      } else {
        toast.error(result.error || "Erro ao geocodificar registros");
      }
    } catch (error) {
      toast.error("Erro ao geocodificar registros");
      console.error(error);
    } finally {
      setIsGeocoding(false);
      setProgress(0);
    }
  };

  // Handler para geocodificar individual
  const handleGeocodeIndividual = async (
    id: number,
    tipo: "cliente" | "concorrente" | "lead",
    cidade: string,
    uf: string
  ) => {
    if (!selectedProjectId) return;

    try {
      const result = await geocodeAddress.mutateAsync({
        projetoId: selectedProjectId,
        id,
        tipo,
        cidade,
        uf,
      });

      if (result.success) {
        toast.success(
          `Coordenadas atualizadas: ${result.latitude}, ${result.longitude}`
        );
        refetchStats();
        refetchRecords();
      } else {
        toast.error(result.error || "Erro ao geocodificar endereço");
      }
    } catch (error) {
      toast.error("Erro ao geocodificar endereço");
      console.error(error);
    }
  };

  if (!selectedProjectId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Nenhum projeto encontrado
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const clientesSemCoord = recordsSemCoord?.filter((r) => r.tipo === "cliente") || [];
  const concorrentesSemCoord = recordsSemCoord?.filter((r) => r.tipo === "concorrente") || [];
  const leadsSemCoord = recordsSemCoord?.filter((r) => r.tipo === "lead") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Geocodificação</h1>
          <p className="text-muted-foreground mt-2">
            Adicione coordenadas geográficas aos registros usando Google Maps API
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.clientes.comCoordenadas || 0}/{stats?.clientes.total || 0}
              </div>
              <Progress
                value={stats?.clientes.percentual || 0}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.clientes.percentual || 0}% com coordenadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concorrentes</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.concorrentes.comCoordenadas || 0}/{stats?.concorrentes.total || 0}
              </div>
              <Progress
                value={stats?.concorrentes.percentual || 0}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.concorrentes.percentual || 0}% com coordenadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.leads.comCoordenadas || 0}/{stats?.leads.total || 0}
              </div>
              <Progress
                value={stats?.leads.percentual || 0}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.leads.percentual || 0}% com coordenadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total.comCoordenadas || 0}/{stats?.total.total || 0}
              </div>
              <Progress
                value={stats?.total.percentual || 0}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.total.percentual || 0}% com coordenadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações em Lote</CardTitle>
            <CardDescription>
              Geocodifique todos os registros sem coordenadas de uma vez
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {stats?.total.semCoordenadas || 0} registros sem coordenadas
                </p>
                <p className="text-sm text-muted-foreground">
                  Clientes: {stats?.clientes.semCoordenadas || 0} | 
                  Concorrentes: {stats?.concorrentes.semCoordenadas || 0} | 
                  Leads: {stats?.leads.semCoordenadas || 0}
                </p>
              </div>
              <Button
                onClick={handleGeocodeAll}
                disabled={isGeocoding || (stats?.total.semCoordenadas || 0) === 0}
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Geocodificando...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Geocodificar Todos
                  </>
                )}
              </Button>
            </div>

            {isGeocoding && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Processando... {progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de registros sem coordenadas */}
        <Card>
          <CardHeader>
            <CardTitle>Registros Sem Coordenadas</CardTitle>
            <CardDescription>
              Geocodifique registros individualmente ou visualize os que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clientes">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="clientes">
                  Clientes ({clientesSemCoord.length})
                </TabsTrigger>
                <TabsTrigger value="concorrentes">
                  Concorrentes ({concorrentesSemCoord.length})
                </TabsTrigger>
                <TabsTrigger value="leads">
                  Leads ({leadsSemCoord.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clientes" className="space-y-2">
                {clientesSemCoord.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                    <p>Todos os clientes têm coordenadas!</p>
                  </div>
                ) : (
                  clientesSemCoord.map((record) => (
                    <div
                      key={`cliente-${record.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.cidade} - {record.uf}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleGeocodeIndividual(
                            record.id,
                            "cliente",
                            record.cidade,
                            record.uf
                          )
                        }
                        disabled={geocodeAddress.isPending}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Geocodificar
                      </Button>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="concorrentes" className="space-y-2">
                {concorrentesSemCoord.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                    <p>Todos os concorrentes têm coordenadas!</p>
                  </div>
                ) : (
                  concorrentesSemCoord.map((record) => (
                    <div
                      key={`concorrente-${record.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.cidade} - {record.uf}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleGeocodeIndividual(
                            record.id,
                            "concorrente",
                            record.cidade,
                            record.uf
                          )
                        }
                        disabled={geocodeAddress.isPending}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Geocodificar
                      </Button>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="leads" className="space-y-2">
                {leadsSemCoord.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                    <p>Todos os leads têm coordenadas!</p>
                  </div>
                ) : (
                  leadsSemCoord.map((record) => (
                    <div
                      key={`lead-${record.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.cidade} - {record.uf}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleGeocodeIndividual(
                            record.id,
                            "lead",
                            record.cidade,
                            record.uf
                          )
                        }
                        disabled={geocodeAddress.isPending}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Geocodificar
                      </Button>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
