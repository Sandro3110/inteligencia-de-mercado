import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GeoCockpitProps {
  entityType: "cliente" | "concorrente" | "lead";
  entityId: number;
  entityName: string;
  address: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onSave: (lat: number, lng: number) => Promise<void>;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function GeoCockpit({
  entityType,
  entityId,
  entityName,
  address,
  initialLat,
  initialLng,
  onSave,
}: GeoCockpitProps) {
  const [step, setStep] = useState(1);
  const [lat, setLat] = useState<number>(initialLat || -23.5505);
  const [lng, setLng] = useState<number>(initialLng || -46.6333);
  const [manualLat, setManualLat] = useState<string>(String(initialLat || -23.5505));
  const [manualLng, setManualLng] = useState<string>(String(initialLng || -46.6333));
  const [isValidated, setIsValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
      setLat(initialLat);
      setLng(initialLng);
      setManualLat(String(initialLat));
      setManualLng(String(initialLng));
      setIsValidated(true);
    }
  }, [initialLat, initialLng]);

  const handleValidate = () => {
    if (!initialLat || !initialLng) {
      toast.error("Coordenadas não disponíveis", {
        description: "A IA não retornou coordenadas para este endereço.",
      });
      return;
    }

    setIsValidated(true);
    setStep(2);
    toast.success("Coordenadas validadas!", {
      description: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
    });
  };

  const handleMapClick = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setManualLat(String(newLat));
    setManualLng(String(newLng));
    toast.info("Marcador atualizado", {
      description: `Nova posição: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`,
    });
  };

  const handleManualUpdate = () => {
    const newLat = parseFloat(manualLat);
    const newLng = parseFloat(manualLng);

    if (isNaN(newLat) || isNaN(newLng)) {
      toast.error("Coordenadas inválidas", {
        description: "Digite valores numéricos válidos.",
      });
      return;
    }

    if (newLat < -90 || newLat > 90 || newLng < -180 || newLng > 180) {
      toast.error("Coordenadas fora do intervalo", {
        description: "Latitude: -90 a 90, Longitude: -180 a 180",
      });
      return;
    }

    setLat(newLat);
    setLng(newLng);
    toast.success("Coordenadas atualizadas!", {
      description: `Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(lat, lng);
      toast.success("Coordenadas salvas!", {
        description: `${entityName} atualizado com sucesso.`,
      });
      setStep(3);
    } catch (error) {
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GeoCockpit</h2>
          <p className="text-sm text-muted-foreground">
            Validação e ajuste de coordenadas geográficas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <span className="text-xs font-medium">1. Validar</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <span className="text-xs font-medium">2. Ajustar</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <span className="text-xs font-medium">3. Salvar</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Informações da Entidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {entityName}
          </CardTitle>
          <CardDescription>
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} #{entityId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <p className="text-sm">{address || "Não informado"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <p className="text-sm font-mono">{lat.toFixed(6)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <p className="text-sm font-mono">{lng.toFixed(6)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passo 1: Validar Coordenadas */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Passo 1: Validar Coordenadas da IA</CardTitle>
            <CardDescription>
              Verifique se as coordenadas retornadas pela IA estão corretas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialLat && initialLng ? (
              <>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]}>
                      <Popup>{entityName}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={handleValidate}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Validar e Avançar
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Coordenadas não disponíveis. Pule para o ajuste manual.
                </p>
                <Button onClick={() => setStep(2)} className="mt-4">
                  Ir para Ajuste Manual
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Passo 2: Ajustar Coordenadas */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Passo 2: Ajustar Coordenadas</CardTitle>
            <CardDescription>
              Clique no mapa ou insira coordenadas manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>{entityName}</Popup>
                </Marker>
                <MapClickHandler onClick={handleMapClick} />
              </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-lat">Latitude</Label>
                <Input
                  id="manual-lat"
                  type="number"
                  step="0.000001"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="-23.550500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-lng">Longitude</Label>
                <Input
                  id="manual-lng"
                  type="number"
                  step="0.000001"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  placeholder="-46.633300"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleManualUpdate}>
                  <Navigation className="mr-2 h-4 w-4" />
                  Atualizar Mapa
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Coordenadas"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passo 3: Confirmação */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Coordenadas Salvas com Sucesso!
            </CardTitle>
            <CardDescription>
              As coordenadas foram atualizadas no banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[300px] rounded-lg overflow-hidden border">
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>{entityName}</Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Coordenadas Finais:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="ml-2 font-mono">{lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="ml-2 font-mono">{lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
