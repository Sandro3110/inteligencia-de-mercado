/**
 * Componente de Filtro Geográfico
 * Usa campo regiao de dim_geografia
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

interface FiltroGeograficoProps {
  onChange: (filtros: FiltroGeo) => void;
  value?: FiltroGeo;
}

export interface FiltroGeo {
  pais?: string;
  regiao?: string;
  estado?: string;
  cidade?: string;
}

const REGIOES = [
  'Norte',
  'Nordeste',
  'Centro-Oeste',
  'Sudeste',
  'Sul'
];

const ESTADOS_POR_REGIAO: Record<string, string[]> = {
  'Norte': ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
  'Sul': ['PR', 'RS', 'SC']
};

export function FiltroGeografico({ onChange, value = {} }: FiltroGeograficoProps) {
  const [filtros, setFiltros] = useState<FiltroGeo>(value);

  const handleChange = (campo: keyof FiltroGeo, valor: string | undefined) => {
    const novosFiltros = { ...filtros, [campo]: valor };

    // Se mudar região, limpar estado e cidade
    if (campo === 'regiao') {
      novosFiltros.estado = undefined;
      novosFiltros.cidade = undefined;
    }

    // Se mudar estado, limpar cidade
    if (campo === 'estado') {
      novosFiltros.cidade = undefined;
    }

    setFiltros(novosFiltros);
    onChange(novosFiltros);
  };

  const limparFiltros = () => {
    setFiltros({});
    onChange({});
  };

  const estadosDisponiveis = filtros.regiao 
    ? ESTADOS_POR_REGIAO[filtros.regiao] || []
    : Object.values(ESTADOS_POR_REGIAO).flat();

  const temFiltros = Object.values(filtros).some(v => v !== undefined);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Filtro Geográfico</Label>
        </div>
        {temFiltros && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* País */}
        <div>
          <Label className="text-xs text-muted-foreground">País</Label>
          <Select
            value={filtros.pais || 'Brasil'}
            onValueChange={(v) => handleChange('pais', v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Brasil">Brasil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Região */}
        <div>
          <Label className="text-xs text-muted-foreground">Região</Label>
          <Select
            value={filtros.regiao}
            onValueChange={(v) => handleChange('regiao', v === 'todos' ? undefined : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas as regiões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as regiões</SelectItem>
              {REGIOES.map(regiao => (
                <SelectItem key={regiao} value={regiao}>
                  {regiao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div>
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select
            value={filtros.estado}
            onValueChange={(v) => handleChange('estado', v === 'todos' ? undefined : v)}
            disabled={!filtros.regiao && estadosDisponiveis.length > 27}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {estadosDisponiveis.map(estado => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cidade - Placeholder (seria carregado dinamicamente) */}
        <div>
          <Label className="text-xs text-muted-foreground">Cidade</Label>
          <Select
            value={filtros.cidade}
            onValueChange={(v) => handleChange('cidade', v === 'todos' ? undefined : v)}
            disabled={!filtros.estado}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as cidades</SelectItem>
              {/* Cidades seriam carregadas dinamicamente baseado no estado */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo dos filtros ativos */}
      {temFiltros && (
        <div className="mt-4 pt-4 border-t">
          <Label className="text-xs text-muted-foreground mb-2 block">Filtros Ativos:</Label>
          <div className="flex flex-wrap gap-2">
            {filtros.regiao && (
              <Badge variant="secondary" className="text-xs">
                Região: {filtros.regiao}
              </Badge>
            )}
            {filtros.estado && (
              <Badge variant="secondary" className="text-xs">
                Estado: {filtros.estado}
              </Badge>
            )}
            {filtros.cidade && (
              <Badge variant="secondary" className="text-xs">
                Cidade: {filtros.cidade}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
