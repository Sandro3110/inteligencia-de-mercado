import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import GeoCockpit from "@/components/GeoCockpit";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

export default function GeoCockpitTest() {
  const [selectedType, setSelectedType] = useState<"cliente" | "concorrente" | "lead">("cliente");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Queries
  const { data: clientes, isLoading: loadingClientes } = trpc.clientes.list.useQuery({});
  const { data: concorrentes, isLoading: loadingConcorrentes } = trpc.concorrentes.list.useQuery({});
  const { data: leads, isLoading: loadingLeads } = trpc.leads.list.useQuery({});

  // Mutations
  const updateClienteCoords = trpc.clientes.updateCoordinates.useMutation();
  const updateConcorrenteCoords = trpc.concorrentes.updateCoordinates.useMutation();
  const updateLeadCoords = trpc.leads.updateCoordinates.useMutation();

  const entities = selectedType === "cliente" 
    ? clientes || [] 
    : selectedType === "concorrente" 
    ? concorrentes || [] 
    : leads || [];

  const isLoading = selectedType === "cliente" 
    ? loadingClientes 
    : selectedType === "concorrente" 
    ? loadingConcorrentes 
    : loadingLeads;

  const handleSelectEntity = (id: string) => {
    const entityId = parseInt(id);
    setSelectedId(entityId);
    const entity = entities.find((e: any) => e.id === entityId);
    setSelectedEntity(entity);
  };

  const handleSaveCoordinates = async (lat: number, lng: number) => {
    if (!selectedId) return;

    try {
      if (selectedType === "cliente") {
        await updateClienteCoords.mutateAsync({ id: selectedId, latitude: lat, longitude: lng });
      } else if (selectedType === "concorrente") {
        await updateConcorrenteCoords.mutateAsync({ id: selectedId, latitude: lat, longitude: lng });
      } else {
        await updateLeadCoords.mutateAsync({ id: selectedId, latitude: lat, longitude: lng });
      }
      
      toast.success("Coordenadas salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar coordenadas");
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GeoCockpit - Teste</h1>
        <p className="text-muted-foreground">
          Sistema de validação e ajuste de coordenadas geográficas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Entidade */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Selecionar Entidade
            </CardTitle>
            <CardDescription>
              Escolha uma entidade para validar coordenadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={selectedType} onValueChange={(v: any) => {
                setSelectedType(v);
                setSelectedId(null);
                setSelectedEntity(null);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="concorrente">Concorrente</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Entidade</label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : entities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum {selectedType} encontrado
                </p>
              ) : (
                <Select value={selectedId?.toString()} onValueChange={handleSelectEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity: any) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.nome || entity.name || `ID: ${entity.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedEntity && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{selectedEntity.nome || selectedEntity.name}</p>
                  </div>
                  {selectedEntity.endereco && (
                    <div>
                      <span className="text-muted-foreground">Endereço:</span>
                      <p className="font-medium">{selectedEntity.endereco}</p>
                    </div>
                  )}
                  {selectedEntity.cidade && (
                    <div>
                      <span className="text-muted-foreground">Cidade:</span>
                      <p className="font-medium">{selectedEntity.cidade} - {selectedEntity.uf}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Coordenadas:</span>
                    <p className="font-mono text-xs">
                      {selectedEntity.latitude && selectedEntity.longitude
                        ? `${selectedEntity.latitude.toFixed(6)}, ${selectedEntity.longitude.toFixed(6)}`
                        : "Não disponível"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* GeoCockpit */}
        <div className="lg:col-span-2">
          {selectedEntity ? (
            <GeoCockpit
              entityType={selectedType}
              entityId={selectedEntity.id}
              entityName={selectedEntity.nome || selectedEntity.name}
              address={selectedEntity.endereco || `${selectedEntity.cidade || ""} - ${selectedEntity.uf || ""}`}
              initialLat={selectedEntity.latitude}
              initialLng={selectedEntity.longitude}
              onSave={handleSaveCoordinates}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Selecione uma entidade para começar
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Escolha um tipo e uma entidade no painel ao lado
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Informações */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">📍 Passo 1: Validar Coordenadas da IA</h3>
            <p className="text-sm text-muted-foreground">
              Visualize as coordenadas retornadas pela IA no mapa. Se estiverem corretas, clique em "Validar e Avançar".
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🗺️ Passo 2: Ajustar Coordenadas</h3>
            <p className="text-sm text-muted-foreground">
              Clique no mapa para reposicionar o marcador ou insira coordenadas manualmente. Depois clique em "Salvar Coordenadas".
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✅ Passo 3: Confirmação</h3>
            <p className="text-sm text-muted-foreground">
              As coordenadas são salvas no banco de dados e você pode visualizar o resultado final.
            </p>
          </div>
          <Separator />
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>💡 Dica:</strong> Este sistema usa <strong>OpenStreetMap (Leaflet)</strong> como alternativa gratuita ao Google Maps. 
              Futuramente, você pode integrar o Google Maps API para geocodificação automática.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
