/**
 * Controles do Mapa Unificado
 * Seletor de modo de visualização, zoom e clustering
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Layers, Map as MapIcon, Flame } from "lucide-react";

export interface MapControlsConfig {
  viewMode: "markers" | "heatmap" | "hybrid";
  enableClustering: boolean;
  clusterRadius: number;
  autoAdjustZoom: boolean;
}

export interface MapControlsProps {
  config: MapControlsConfig;
  onChange: (config: MapControlsConfig) => void;
}

export default function MapControls({ config, onChange }: MapControlsProps) {
  const handleViewModeChange = (mode: string) => {
    onChange({ ...config, viewMode: mode as MapControlsConfig["viewMode"] });
  };

  const handleClusteringToggle = (enabled: boolean) => {
    onChange({ ...config, enableClustering: enabled });
  };

  const handleClusterRadiusChange = (value: number[]) => {
    onChange({ ...config, clusterRadius: value[0] });
  };

  const handleAutoAdjustToggle = (enabled: boolean) => {
    onChange({ ...config, autoAdjustZoom: enabled });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Controles de Visualização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Modo de Visualização */}
        <div className="space-y-2">
          <Label className="text-xs">Modo de Visualização</Label>
          <Select value={config.viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markers">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  <span>Pontos Individuais</span>
                </div>
              </SelectItem>
              <SelectItem value="heatmap">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>Mapa de Calor</span>
                </div>
              </SelectItem>
              <SelectItem value="hybrid">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Híbrido (Calor + Pontos)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clustering (apenas para markers e hybrid) */}
        {(config.viewMode === "markers" || config.viewMode === "hybrid") && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="clustering" className="text-xs">
                Agrupar Pontos Próximos
              </Label>
              <Switch
                id="clustering"
                checked={config.enableClustering}
                onCheckedChange={handleClusteringToggle}
              />
            </div>

            {config.enableClustering && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Raio de Agrupamento</Label>
                  <span className="text-xs text-muted-foreground">
                    {config.clusterRadius}px
                  </span>
                </div>
                <Slider
                  value={[config.clusterRadius]}
                  onValueChange={handleClusterRadiusChange}
                  min={20}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            )}
          </>
        )}

        {/* Auto-ajustar Zoom */}
        <div className="flex items-center justify-between">
          <Label htmlFor="autoZoom" className="text-xs">
            Auto-ajustar Zoom
          </Label>
          <Switch
            id="autoZoom"
            checked={config.autoAdjustZoom}
            onCheckedChange={handleAutoAdjustToggle}
          />
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          <p>
            <strong>Dica:</strong> Use o modo híbrido para ver densidade e
            pontos específicos simultaneamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
