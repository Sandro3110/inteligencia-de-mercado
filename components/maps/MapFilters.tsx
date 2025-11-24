'use client';

/**
 * Filtros Avançados do Mapa Unificado
 * Busca, qualidade, mercados, regiões, período
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export interface MapFiltersState {
  searchText: string;
  minQuality: number;
  selectedMercados: number[];
  selectedUFs: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MapFiltersProps {
  projectId: number;
  pesquisaId?: number;
  filters: MapFiltersState;
  onChange: (filters: MapFiltersState) => void;
}

const UFS_BRASIL = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

const QUALITY_SLIDER_CONFIG = {
  min: 0,
  max: 100,
  step: 5,
} as const;

export default function MapFilters({ projectId, pesquisaId, filters, onChange }: MapFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Buscar mercados disponíveis
  const { data: mercados } = trpc.mercados.list.useQuery({
    projectId,
    pesquisaId,
  });

  const handleSearchChange = useCallback(
    (text: string) => {
      onChange({ ...filters, searchText: text });
    },
    [filters, onChange]
  );

  const handleQualityChange = useCallback(
    (value: number[]) => {
      onChange({ ...filters, minQuality: value[0] });
    },
    [filters, onChange]
  );

  const handleMercadoToggle = useCallback(
    (mercadoId: number) => {
      const selected = filters.selectedMercados.includes(mercadoId)
        ? filters.selectedMercados.filter((id) => id !== mercadoId)
        : [...filters.selectedMercados, mercadoId];
      onChange({ ...filters, selectedMercados: selected });
    },
    [filters, onChange]
  );

  const handleUFToggle = useCallback(
    (uf: string) => {
      const selected = filters.selectedUFs.includes(uf)
        ? filters.selectedUFs.filter((u) => u !== uf)
        : [...filters.selectedUFs, uf];
      onChange({ ...filters, selectedUFs: selected });
    },
    [filters, onChange]
  );

  const handleClearFilters = useCallback(() => {
    onChange({
      searchText: '',
      minQuality: 0,
      selectedMercados: [],
      selectedUFs: [],
      dateFrom: undefined,
      dateTo: undefined,
    });
  }, [onChange]);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced((prev) => !prev);
  }, []);

  const activeFiltersCount = useMemo(
    () =>
      (filters.searchText ? 1 : 0) +
      (filters.minQuality > 0 ? 1 : 0) +
      (filters.selectedMercados.length > 0 ? 1 : 0) +
      (filters.selectedUFs.length > 0 ? 1 : 0) +
      (filters.dateFrom || filters.dateTo ? 1 : 0),
    [filters]
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca por texto */}
        <div className="space-y-2">
          <Label className="text-xs">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nome, cidade..."
              value={filters.searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
            {filters.searchText && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Qualidade mínima */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Qualidade Mínima</Label>
            <span className="text-xs text-muted-foreground">{filters.minQuality}%</span>
          </div>
          <Slider
            value={[filters.minQuality]}
            onValueChange={handleQualityChange}
            min={QUALITY_SLIDER_CONFIG.min}
            max={QUALITY_SLIDER_CONFIG.max}
            step={QUALITY_SLIDER_CONFIG.step}
            className="w-full"
          />
        </div>

        {/* Botão para mostrar filtros avançados */}
        <Button variant="outline" size="sm" onClick={toggleAdvanced} className="w-full">
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Filtros Avançados
        </Button>

        {/* Filtros avançados */}
        {showAdvanced && (
          <>
            {/* Mercados */}
            {mercados && mercados.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Mercados</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                  {mercados.map((mercado) => (
                    <div key={mercado.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mercado-${mercado.id}`}
                        checked={filters.selectedMercados.includes(mercado.id)}
                        onCheckedChange={() => handleMercadoToggle(mercado.id)}
                      />
                      <label
                        htmlFor={`mercado-${mercado.id}`}
                        className="text-xs cursor-pointer flex-1"
                      >
                        {mercado.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UFs */}
            <div className="space-y-2">
              <Label className="text-xs">Estados (UF)</Label>
              <div className="max-h-40 overflow-y-auto grid grid-cols-3 gap-2 border rounded-md p-2">
                {UFS_BRASIL.map((uf) => (
                  <div key={uf} className="flex items-center space-x-2">
                    <Checkbox
                      id={`uf-${uf}`}
                      checked={filters.selectedUFs.includes(uf)}
                      onCheckedChange={() => handleUFToggle(uf)}
                    />
                    <label htmlFor={`uf-${uf}`} className="text-xs cursor-pointer">
                      {uf}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Botão limpar filtros */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
