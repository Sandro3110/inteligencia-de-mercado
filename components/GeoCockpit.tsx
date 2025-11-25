'use client';

/**
 * GeoCockpit - Validação e Ajuste de Coordenadas Geográficas
 * Workflow de 3 passos para validar e ajustar coordenadas de entidades
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle2, MapPin, Navigation } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// ============================================================================
// LEAFLET CONFIGURATION
// ============================================================================

const DefaultIcon = L.icon({
  iconUrl: typeof icon === 'string' ? icon : icon.src,
  shadowUrl: typeof iconShadow === 'string' ? iconShadow : iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_COORDS = {
  LAT: -23.5505, // São Paulo
  LNG: -46.6333,
} as const;

const COORD_LIMITS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
} as const;

const STEPS = {
  VALIDATE: 1,
  ADJUST: 2,
  CONFIRM: 3,
} as const;

const STEP_LABELS = {
  [STEPS.VALIDATE]: '1. Validar',
  [STEPS.ADJUST]: '2. Ajustar',
  [STEPS.CONFIRM]: '3. Salvar',
} as const;

const MAP_CONFIG = {
  ZOOM: 15,
  HEIGHT: '400px',
  HEIGHT_CONFIRM: '300px',
  ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
} as const;

const INPUT_CONFIG = {
  STEP: '0.000001',
  DECIMAL_PLACES: 6,
  PLACEHOLDER_LAT: '-23.550500',
  PLACEHOLDER_LNG: '-46.633300',
} as const;

const LABELS = {
  TITLE: 'GeoCockpit',
  SUBTITLE: 'Validação e ajuste de coordenadas geográficas',
  ADDRESS: 'Endereço',
  LATITUDE: 'Latitude',
  LONGITUDE: 'Longitude',
  NO_ADDRESS: 'Não informado',
  STEP1_TITLE: 'Passo 1: Validar Coordenadas da IA',
  STEP1_DESCRIPTION: 'Verifique se as coordenadas retornadas pela IA estão corretas',
  STEP2_TITLE: 'Passo 2: Ajustar Coordenadas',
  STEP2_DESCRIPTION: 'Clique no mapa ou insira coordenadas manualmente',
  STEP3_TITLE: 'Coordenadas Salvas com Sucesso!',
  STEP3_DESCRIPTION: 'As coordenadas foram atualizadas no banco de dados',
  NO_COORDS_MESSAGE: 'Coordenadas não disponíveis. Pule para o ajuste manual.',
  FINAL_COORDS: 'Coordenadas Finais:',
  VALIDATE_BUTTON: 'Validar e Avançar',
  BACK_BUTTON: 'Voltar',
  UPDATE_MAP_BUTTON: 'Atualizar Mapa',
  SAVE_BUTTON: 'Salvar Coordenadas',
  SAVING_BUTTON: 'Salvando...',
  GO_TO_MANUAL: 'Ir para Ajuste Manual',
} as const;

const TOAST_MESSAGES = {
  NO_COORDS_ERROR: 'Coordenadas não disponíveis',
  NO_COORDS_DESCRIPTION: 'A IA não retornou coordenadas para este endereço.',
  VALIDATED_SUCCESS: 'Coordenadas validadas!',
  VALIDATED_DESCRIPTION: (lat: number, lng: number) =>
    `Lat: ${lat.toFixed(INPUT_CONFIG.DECIMAL_PLACES)}, Lng: ${lng.toFixed(INPUT_CONFIG.DECIMAL_PLACES)}`,
  MARKER_UPDATED: 'Marcador atualizado',
  MARKER_DESCRIPTION: (lat: number, lng: number) =>
    `Nova posição: ${lat.toFixed(INPUT_CONFIG.DECIMAL_PLACES)}, ${lng.toFixed(INPUT_CONFIG.DECIMAL_PLACES)}`,
  INVALID_COORDS_ERROR: 'Coordenadas inválidas',
  INVALID_COORDS_DESCRIPTION: 'Digite valores numéricos válidos.',
  OUT_OF_RANGE_ERROR: 'Coordenadas fora do intervalo',
  OUT_OF_RANGE_DESCRIPTION: 'Latitude: -90 a 90, Longitude: -180 a 180',
  COORDS_UPDATED_SUCCESS: 'Coordenadas atualizadas!',
  SAVE_SUCCESS: 'Coordenadas salvas!',
  SAVE_DESCRIPTION: (entityName: string) => `${entityName} atualizado com sucesso.`,
  SAVE_ERROR: 'Erro ao salvar',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface GeoCockpitProps {
  entityType: 'cliente' | 'concorrente' | 'lead';
  entityId: number;
  entityName: string;
  address: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onSave: (lat: number, lng: number) => Promise<void>;
}

interface MapClickHandlerProps {
  onClick: (lat: number, lng: number) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCoordinate(value: number): string {
  return value.toFixed(INPUT_CONFIG.DECIMAL_PLACES);
}

function isValidLatitude(lat: number): boolean {
  return lat >= COORD_LIMITS.LAT_MIN && lat <= COORD_LIMITS.LAT_MAX;
}

function isValidLongitude(lng: number): boolean {
  return lng >= COORD_LIMITS.LNG_MIN && lng <= COORD_LIMITS.LNG_MAX;
}

function isValidCoordinates(lat: number, lng: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

function parseCoordinate(value: string): number {
  return parseFloat(value);
}

function capitalizeEntityType(entityType: string): string {
  return entityType.charAt(0).toUpperCase() + entityType.slice(1);
}

function getStepClasses(currentStep: number, targetStep: number): string {
  return `flex items-center gap-2 px-3 py-1 rounded-full ${
    currentStep >= targetStep
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted'
  }`;
}

// ============================================================================
// MAP CLICK HANDLER COMPONENT
// ============================================================================

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GeoCockpit({
  entityType,
  entityId,
  entityName,
  address,
  initialLat,
  initialLng,
  onSave,
}: GeoCockpitProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [step, setStep] = useState<number>(STEPS.VALIDATE);
  const [lat, setLat] = useState<number>(initialLat || DEFAULT_COORDS.LAT);
  const [lng, setLng] = useState<number>(initialLng || DEFAULT_COORDS.LNG);
  const [manualLat, setManualLat] = useState<string>(
    String(initialLat || DEFAULT_COORDS.LAT)
  );
  const [manualLng, setManualLng] = useState<string>(
    String(initialLng || DEFAULT_COORDS.LNG)
  );
  const [isValidated, setIsValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (initialLat && initialLng) {
      setLat(initialLat);
      setLng(initialLng);
      setManualLat(String(initialLat));
      setManualLng(String(initialLng));
      setIsValidated(true);
    }
  }, [initialLat, initialLng]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasInitialCoords = useMemo(
    () => !!(initialLat && initialLng),
    [initialLat, initialLng]
  );

  const formattedLat = useMemo(() => formatCoordinate(lat), [lat]);
  const formattedLng = useMemo(() => formatCoordinate(lng), [lng]);

  const capitalizedEntityType = useMemo(
    () => capitalizeEntityType(entityType),
    [entityType]
  );

  const displayAddress = useMemo(
    () => address || LABELS.NO_ADDRESS,
    [address]
  );

  const saveButtonText = useMemo(
    () => (isSaving ? LABELS.SAVING_BUTTON : LABELS.SAVE_BUTTON),
    [isSaving]
  );

  const mapCenter = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleValidate = useCallback(() => {
    if (!hasInitialCoords) {
      toast.error(TOAST_MESSAGES.NO_COORDS_ERROR, {
        description: TOAST_MESSAGES.NO_COORDS_DESCRIPTION,
      });
      return;
    }

    setIsValidated(true);
    setStep(STEPS.ADJUST);
    toast.success(TOAST_MESSAGES.VALIDATED_SUCCESS, {
      description: TOAST_MESSAGES.VALIDATED_DESCRIPTION(lat, lng),
    });
  }, [hasInitialCoords, lat, lng]);

  const handleMapClick = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setManualLat(String(newLat));
    setManualLng(String(newLng));
    toast.info(TOAST_MESSAGES.MARKER_UPDATED, {
      description: TOAST_MESSAGES.MARKER_DESCRIPTION(newLat, newLng),
    });
  }, []);

  const handleManualUpdate = useCallback(() => {
    const newLat = parseCoordinate(manualLat);
    const newLng = parseCoordinate(manualLng);

    if (isNaN(newLat) || isNaN(newLng)) {
      toast.error(TOAST_MESSAGES.INVALID_COORDS_ERROR, {
        description: TOAST_MESSAGES.INVALID_COORDS_DESCRIPTION,
      });
      return;
    }

    if (!isValidCoordinates(newLat, newLng)) {
      toast.error(TOAST_MESSAGES.OUT_OF_RANGE_ERROR, {
        description: TOAST_MESSAGES.OUT_OF_RANGE_DESCRIPTION,
      });
      return;
    }

    setLat(newLat);
    setLng(newLng);
    toast.success(TOAST_MESSAGES.COORDS_UPDATED_SUCCESS, {
      description: TOAST_MESSAGES.VALIDATED_DESCRIPTION(newLat, newLng),
    });
  }, [manualLat, manualLng]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(lat, lng);
      toast.success(TOAST_MESSAGES.SAVE_SUCCESS, {
        description: TOAST_MESSAGES.SAVE_DESCRIPTION(entityName),
      });
      setStep(STEPS.CONFIRM);
    } catch (error) {
      toast.error(TOAST_MESSAGES.SAVE_ERROR, {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsSaving(false);
    }
  }, [lat, lng, onSave, entityName]);

  const handleGoToManual = useCallback(() => {
    setStep(STEPS.ADJUST);
  }, []);

  const handleBackToValidate = useCallback(() => {
    setStep(STEPS.VALIDATE);
  }, []);

  const handleManualLatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManualLat(e.target.value);
    },
    []
  );

  const handleManualLngChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManualLng(e.target.value);
    },
    []
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgressSteps = useCallback(
    () => (
      <div className="flex items-center gap-2">
        {Object.entries(STEP_LABELS).map(([stepNum, label]) => (
          <div key={stepNum} className={getStepClasses(step, Number(stepNum))}>
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
    ),
    [step]
  );

  const renderEntityInfo = useCallback(
    () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {entityName}
          </CardTitle>
          <CardDescription>
            {capitalizedEntityType} #{entityId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                {LABELS.ADDRESS}
              </Label>
              <p className="text-sm">{displayAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {LABELS.LATITUDE}
                </Label>
                <p className="text-sm font-mono">{formattedLat}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {LABELS.LONGITUDE}
                </Label>
                <p className="text-sm font-mono">{formattedLng}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [
      entityName,
      capitalizedEntityType,
      entityId,
      displayAddress,
      formattedLat,
      formattedLng,
    ]
  );

  const renderMap = useCallback(
    (height: string) => (
      <div className="rounded-lg overflow-hidden border" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={MAP_CONFIG.ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution={MAP_CONFIG.ATTRIBUTION}
            url={MAP_CONFIG.TILE_URL}
          />
          <Marker position={mapCenter}>
            <Popup>{entityName}</Popup>
          </Marker>
        </MapContainer>
      </div>
    ),
    [mapCenter, entityName]
  );

  const renderStep1 = useCallback(
    () => (
      <Card>
        <CardHeader>
          <CardTitle>{LABELS.STEP1_TITLE}</CardTitle>
          <CardDescription>{LABELS.STEP1_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasInitialCoords ? (
            <>
              {renderMap(MAP_CONFIG.HEIGHT)}
              <div className="flex justify-end gap-2">
                <Button onClick={handleValidate}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {LABELS.VALIDATE_BUTTON}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {LABELS.NO_COORDS_MESSAGE}
              </p>
              <Button onClick={handleGoToManual} className="mt-4">
                {LABELS.GO_TO_MANUAL}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    ),
    [hasInitialCoords, handleValidate, handleGoToManual, renderMap]
  );

  const renderStep2 = useCallback(
    () => (
      <Card>
        <CardHeader>
          <CardTitle>{LABELS.STEP2_TITLE}</CardTitle>
          <CardDescription>{LABELS.STEP2_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg overflow-hidden border" style={{ height: MAP_CONFIG.HEIGHT }}>
            <MapContainer
              center={mapCenter}
              zoom={MAP_CONFIG.ZOOM}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution={MAP_CONFIG.ATTRIBUTION}
                url={MAP_CONFIG.TILE_URL}
              />
              <Marker position={mapCenter}>
                <Popup>{entityName}</Popup>
              </Marker>
              <MapClickHandler onClick={handleMapClick} />
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manual-lat">{LABELS.LATITUDE}</Label>
              <Input
                id="manual-lat"
                type="number"
                step={INPUT_CONFIG.STEP}
                value={manualLat}
                onChange={handleManualLatChange}
                placeholder={INPUT_CONFIG.PLACEHOLDER_LAT}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-lng">{LABELS.LONGITUDE}</Label>
              <Input
                id="manual-lng"
                type="number"
                step={INPUT_CONFIG.STEP}
                value={manualLng}
                onChange={handleManualLngChange}
                placeholder={INPUT_CONFIG.PLACEHOLDER_LNG}
              />
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={handleBackToValidate}>
              {LABELS.BACK_BUTTON}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleManualUpdate}>
                <Navigation className="mr-2 h-4 w-4" />
                {LABELS.UPDATE_MAP_BUTTON}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {saveButtonText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [
      mapCenter,
      entityName,
      manualLat,
      manualLng,
      isSaving,
      saveButtonText,
      handleMapClick,
      handleManualLatChange,
      handleManualLngChange,
      handleBackToValidate,
      handleManualUpdate,
      handleSave,
    ]
  );

  const renderStep3 = useCallback(
    () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            {LABELS.STEP3_TITLE}
          </CardTitle>
          <CardDescription>{LABELS.STEP3_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderMap(MAP_CONFIG.HEIGHT_CONFIRM)}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">{LABELS.FINAL_COORDS}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{LABELS.LATITUDE}:</span>
                <span className="ml-2 font-mono">{formattedLat}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {LABELS.LONGITUDE}:
                </span>
                <span className="ml-2 font-mono">{formattedLng}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [formattedLat, formattedLng, renderMap]
  );

  const renderCurrentStep = useCallback(() => {
    switch (step) {
      case STEPS.VALIDATE:
        return renderStep1();
      case STEPS.ADJUST:
        return renderStep2();
      case STEPS.CONFIRM:
        return renderStep3();
      default:
        return null;
    }
  }, [step, renderStep1, renderStep2, renderStep3]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{LABELS.TITLE}</h2>
          <p className="text-sm text-muted-foreground">{LABELS.SUBTITLE}</p>
        </div>
        {renderProgressSteps()}
      </div>

      <Separator />

      {/* Informações da Entidade */}
      {renderEntityInfo()}

      {/* Passo Atual */}
      {renderCurrentStep()}
    </div>
  );
}
