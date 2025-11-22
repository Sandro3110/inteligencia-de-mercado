import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useSelectedPesquisa } from "@/hooks/useSelectedPesquisa";
import { Loader2, MapPin, Users, Building2, Target, CheckCircle, AlertCircle, XCircle, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Tipos de entidades
type EntityType = "all" | "clientes" | "concorrentes" | "leads";
type LeadStatus = "all" | "aprovado" | "enriquecido" | "descartado";

// Ícones personalizados para cada tipo
const createIcon = (color: string) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const icons = {
  cliente: createIcon("blue"),
  concorrente: createIcon("red"),
  lead: createIcon("green"),
};

// Componente para ajustar zoom automaticamente
function AutoZoom({ markers }: { markers: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    const bounds = new LatLngBounds(
      markers.map(m => [m.latitude, m.longitude])
    );
    
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [markers, map]);

  return null;
}

// Componente de controles de zoom
function ZoomControls() {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.zoomIn()}
        className="shadow-lg"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.zoomOut()}
        className="shadow-lg"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function GeoCockpitAdvanced() {
  const { selectedProjectId } = useSelectedProject();
  const { selectedPesquisaId } = useSelectedPesquisa();
  
  const [selectedMercado, setSelectedMercado] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<EntityType>("all");
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<LeadStatus>("all");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Queries
  const { data: mercados, isLoading: loadingMercados } = trpc.mercados.list.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  const { data: clientes, isLoading: loadingClientes } = trpc.clientes.list.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId && (selectedType === "all" || selectedType === "clientes") }
  );

  const { data: concorrentes, isLoading: loadingConcorrentes } = trpc.concorrentes.list.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId && (selectedType === "all" || selectedType === "concorrentes") }
  );

  const { data: leads, isLoading: loadingLeads } = trpc.leads.list.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!selectedProjectId && (selectedType === "all" || selectedType === "leads") }
  );

  // Mutation para qualificar leads
  const updateLeadMutation = trpc.leads.updateValidation.useMutation({
    onSuccess: () => {
      toast.success("Lead atualizado com sucesso!");
      setSelectedEntity(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    },
  });

  // Processar dados para o mapa
  const markers = useMemo(() => {
    const result: any[] = [];

    // Filtrar por mercado
    const filterByMercado = (item: any) => {
      if (selectedMercado === "all") return true;
      return String(item.mercadoId) === selectedMercado;
    };

    // Adicionar clientes
    if (selectedType === "all" || selectedType === "clientes") {
      clientes?.filter(filterByMercado).forEach((cliente) => {
        if (cliente.latitude && cliente.longitude) {
          result.push({
            ...cliente,
            type: "cliente",
            icon: icons.cliente,
          });
        }
      });
    }

    // Adicionar concorrentes
    if (selectedType === "all" || selectedType === "concorrentes") {
      concorrentes?.filter(filterByMercado).forEach((concorrente) => {
        if (concorrente.latitude && concorrente.longitude) {
          result.push({
            ...concorrente,
            type: "concorrente",
            icon: icons.concorrente,
          });
        }
      });
    }

    // Adicionar leads (com filtro de status)
    if (selectedType === "all" || selectedType === "leads") {
      leads
        ?.filter(filterByMercado)
        .filter((lead) => {
          if (selectedLeadStatus === "all") return true;
          return lead.validationStatus?.toLowerCase() === selectedLeadStatus;
        })
        .forEach((lead) => {
          if (lead.latitude && lead.longitude) {
            result.push({
              ...lead,
              type: "lead",
              icon: icons.lead,
            });
          }
        });
    }

    return result;
  }, [clientes, concorrentes, leads, selectedMercado, selectedType, selectedLeadStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const clientesCount = markers.filter((m) => m.type === "cliente").length;
    const concorrentesCount = markers.filter((m) => m.type === "concorrente").length;
    const leadsCount = markers.filter((m) => m.type === "lead").length;

    return {
      total: markers.length,
      clientes: clientesCount,
      concorrentes: concorrentesCount,
      leads: leadsCount,
    };
  }, [markers]);

  const handleQualifyLead = (leadId: number, status: string) => {
    updateLeadMutation.mutate({
      id: leadId,
      status,
    });
  };

  const getNavigationUrl = (entity: any) => {
    if (entity.type === "cliente") return `/mercado/${entity.mercadoId}?tab=clientes`;
    if (entity.type === "concorrente") return `/mercado/${entity.mercadoId}?tab=concorrentes`;
    if (entity.type === "lead") return `/mercado/${entity.mercadoId}?tab=leads`;
    return "/";
  };

  const isLoading = loadingMercados || loadingClientes || loadingConcorrentes || loadingLeads;

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione um projeto no menu lateral para visualizar o GeoCockpit
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Título e Estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GeoCockpit Avançado</h1>
          <p className="text-muted-foreground">Mesa de trabalho geográfica dinâmica</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.clientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-red-600" />
              Concorrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.concorrentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.leads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Hierárquicos */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro de Mercado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mercado</label>
              <Select value={selectedMercado} onValueChange={setSelectedMercado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os mercados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os mercados</SelectItem>
                  {mercados?.map((mercado) => (
                    <SelectItem key={mercado.id} value={String(mercado.id)}>
                      {mercado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EntityType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="concorrentes">Concorrentes</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Status de Lead */}
            {(selectedType === "all" || selectedType === "leads") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status do Lead</label>
                <Select value={selectedLeadStatus} onValueChange={(v) => setSelectedLeadStatus(v as LeadStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="enriquecido">Enriquecido</SelectItem>
                    <SelectItem value="descartado">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Botão Limpar Filtros */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMercado("all");
                  setSelectedType("all");
                  setSelectedLeadStatus("all");
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : markers.length === 0 ? (
            <div className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum marcador para exibir</p>
            </div>
          ) : (
            <div className="h-[600px] relative">
              <MapContainer
                center={[-23.5505, -46.6333]} // São Paulo como centro padrão
                zoom={10}
                className="h-full w-full rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <AutoZoom markers={markers} />
                <ZoomControls />

                <MarkerClusterGroup>
                  {markers.map((marker, index) => (
                    <Marker
                      key={`${marker.type}-${marker.id}-${index}`}
                      position={[marker.latitude, marker.longitude]}
                      icon={marker.icon}
                      eventHandlers={{
                        click: () => setSelectedEntity(marker),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <p className="font-semibold">{marker.nome}</p>
                          <p className="text-sm text-muted-foreground capitalize">{marker.type}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntity?.type === "cliente" && <Users className="h-5 w-5 text-blue-600" />}
              {selectedEntity?.type === "concorrente" && <Building2 className="h-5 w-5 text-red-600" />}
              {selectedEntity?.type === "lead" && <Target className="h-5 w-5 text-green-600" />}
              {selectedEntity?.nome}
            </DialogTitle>
          </DialogHeader>

          {selectedEntity && (
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <Badge variant="outline" className="capitalize mt-1">
                    {selectedEntity.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p className="text-sm mt-1">{selectedEntity.endereco || "N/A"}</p>
                </div>
                {selectedEntity.qualityScore !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Qualidade</p>
                    <p className="text-sm mt-1">{selectedEntity.qualityScore}%</p>
                  </div>
                )}
                {selectedEntity.validationStatus && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline" className="capitalize mt-1">
                      {selectedEntity.validationStatus}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Ações para Leads */}
              {selectedEntity.type === "lead" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Qualificação Rápida</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleQualifyLead(selectedEntity.id, "rich")}
                      disabled={updateLeadMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleQualifyLead(selectedEntity.id, "needs_adjustment")}
                      disabled={updateLeadMutation.isPending}
                    >
                      <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Enriquecer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleQualifyLead(selectedEntity.id, "discarded")}
                      disabled={updateLeadMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Descartar
                    </Button>
                  </div>
                </div>
              )}

              {/* Navegação */}
              <div className="pt-4 border-t">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    window.location.href = getNavigationUrl(selectedEntity);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Detalhes Completos
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
