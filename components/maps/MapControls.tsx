/**
 * MapControls Component
 * Unified map controls
 * View mode selector, zoom and clustering controls
 */

'use client';

import { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Layers, Map as MapIcon, Flame, type LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = 'markers' | 'heatmap' | 'hybrid';

export interface MapControlsConfig {
  viewMode: ViewMode;
  enableClustering: boolean;
  clusterRadius: number;
  autoAdjustZoom: boolean;
}

export interface MapControlsProps {
  config: MapControlsConfig;
  onChange: (config: MapControlsConfig) => void;
}

interface ViewModeOption {
  value: ViewMode;
  label: string;
  icon: LucideIcon;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SLIDER_CONFIG = {
  MIN: 20,
  MAX: 100,
  STEP: 10,
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
} as const;

const LABELS = {
  TITLE: 'Controles de Visualização',
  VIEW_MODE: 'Modo de Visualização',
  CLUSTERING: 'Agrupar Pontos Próximos',
  CLUSTER_RADIUS: 'Raio de Agrupamento',
  AUTO_ZOOM: 'Auto-ajustar Zoom',
  RADIUS_UNIT: 'px',
  TIP_LABEL: 'Dica:',
  TIP_TEXT: 'Use o modo híbrido para ver densidade e pontos específicos simultaneamente.',
} as const;

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  {
    value: 'markers',
    label: 'Pontos Individuais',
    icon: MapIcon,
  },
  {
    value: 'heatmap',
    label: 'Mapa de Calor',
    icon: Flame,
  },
  {
    value: 'hybrid',
    label: 'Híbrido (Calor + Pontos)',
    icon: Layers,
  },
] as const;

const IDS = {
  CLUSTERING: 'clustering',
  AUTO_ZOOM: 'autoZoom',
} as const;

const CLASSES = {
  CARD: 'w-full',
  HEADER: 'pb-3',
  TITLE: 'text-sm font-medium flex items-center gap-2',
  CONTENT: 'space-y-4',
  SECTION: 'space-y-2',
  ROW: 'flex items-center justify-between',
  LABEL: 'text-xs',
  OPTION_CONTAINER: 'flex items-center gap-2',
  RADIUS_VALUE: 'text-xs text-muted-foreground',
  SLIDER: 'w-full',
  TIP_CONTAINER: 'pt-2 border-t text-xs text-muted-foreground',
  TIP_STRONG: 'font-bold',
} as const;

const CLUSTERING_MODES: ViewMode[] = ['markers', 'hybrid'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if clustering controls should be shown
 */
function shouldShowClusteringControls(viewMode: ViewMode): boolean {
  return CLUSTERING_MODES.includes(viewMode);
}

/**
 * Format cluster radius value
 */
function formatClusterRadius(radius: number): string {
  return `${radius}${LABELS.RADIUS_UNIT}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * View mode select option
 */
interface ViewModeOptionItemProps {
  option: ViewModeOption;
}

function ViewModeOptionItem({ option }: ViewModeOptionItemProps) {
  const Icon = option.icon;

  return (
    <div className={CLASSES.OPTION_CONTAINER}>
      <Icon className={ICON_SIZES.SMALL} />
      <span>{option.label}</span>
    </div>
  );
}

/**
 * Cluster radius slider
 */
interface ClusterRadiusSliderProps {
  radius: number;
  onChange: (value: number[]) => void;
}

function ClusterRadiusSlider({ radius, onChange }: ClusterRadiusSliderProps) {
  return (
    <div className={CLASSES.SECTION}>
      <div className={CLASSES.ROW}>
        <Label className={CLASSES.LABEL}>{LABELS.CLUSTER_RADIUS}</Label>
        <span className={CLASSES.RADIUS_VALUE}>{formatClusterRadius(radius)}</span>
      </div>
      <Slider
        value={[radius]}
        onValueChange={onChange}
        min={SLIDER_CONFIG.MIN}
        max={SLIDER_CONFIG.MAX}
        step={SLIDER_CONFIG.STEP}
        className={CLASSES.SLIDER}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Map controls for view mode, clustering and zoom
 */
export default function MapControls({ config, onChange }: MapControlsProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleViewModeChange = useCallback(
    (mode: string) => {
      onChange({ ...config, viewMode: mode as ViewMode });
    },
    [config, onChange]
  );

  const handleClusteringToggle = useCallback(
    (enabled: boolean) => {
      onChange({ ...config, enableClustering: enabled });
    },
    [config, onChange]
  );

  const handleClusterRadiusChange = useCallback(
    (value: number[]) => {
      onChange({ ...config, clusterRadius: value[0] });
    },
    [config, onChange]
  );

  const handleAutoAdjustToggle = useCallback(
    (enabled: boolean) => {
      onChange({ ...config, autoAdjustZoom: enabled });
    },
    [config, onChange]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const showClusteringControls = useMemo(
    () => shouldShowClusteringControls(config.viewMode),
    [config.viewMode]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={CLASSES.CARD}>
      <CardHeader className={CLASSES.HEADER}>
        <CardTitle className={CLASSES.TITLE}>
          <Layers className={ICON_SIZES.SMALL} />
          {LABELS.TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent className={CLASSES.CONTENT}>
        {/* View Mode */}
        <div className={CLASSES.SECTION}>
          <Label className={CLASSES.LABEL}>{LABELS.VIEW_MODE}</Label>
          <Select value={config.viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_MODE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <ViewModeOptionItem option={option} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clustering (only for markers and hybrid) */}
        {showClusteringControls && (
          <>
            <div className={CLASSES.ROW}>
              <Label htmlFor={IDS.CLUSTERING} className={CLASSES.LABEL}>
                {LABELS.CLUSTERING}
              </Label>
              <Switch
                id={IDS.CLUSTERING}
                checked={config.enableClustering}
                onCheckedChange={handleClusteringToggle}
              />
            </div>

            {config.enableClustering && (
              <ClusterRadiusSlider
                radius={config.clusterRadius}
                onChange={handleClusterRadiusChange}
              />
            )}
          </>
        )}

        {/* Auto-adjust Zoom */}
        <div className={CLASSES.ROW}>
          <Label htmlFor={IDS.AUTO_ZOOM} className={CLASSES.LABEL}>
            {LABELS.AUTO_ZOOM}
          </Label>
          <Switch
            id={IDS.AUTO_ZOOM}
            checked={config.autoAdjustZoom}
            onCheckedChange={handleAutoAdjustToggle}
          />
        </div>

        {/* Tip */}
        <div className={CLASSES.TIP_CONTAINER}>
          <p>
            <strong>{LABELS.TIP_LABEL}</strong> {LABELS.TIP_TEXT}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
