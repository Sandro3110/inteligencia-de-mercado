'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "@/contexts/FilterContext";
import { X, Filter, Search } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

export function UnifiedFilterPanel() {
  const { filters, updateFilters, clearFilters, hasActiveFilters } =
    useFilters();
  const [isOpen, setIsOpen] = useState(false);

  // Buscar opções de filtros do backend
  const { data: filterOptions } = trpc.mercados.getFilterOptions.useQuery();

  const handleQualityChange = (values: number[]) => {
    updateFilters({
      qualidadeMin: values[0],
      qualidadeMax: values[1],
    });
  };

  const toggleEstado = (estado: string) => {
    const newEstados = filters.estados.includes(estado)
      ? filters.estados.filter(e => e !== estado)
      : [...filters.estados, estado];
    updateFilters({ estados: newEstados });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.statusValidacao.includes(status)
      ? filters.statusValidacao.filter(s => s !== status)
      : [...filters.statusValidacao, status];
    updateFilters({ statusValidacao: newStatus });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Busca rápida */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar em todos os dados..."
          value={filters.searchTerm}
          onChange={e => updateFilters({ searchTerm: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <Badge variant="secondary" className="gap-1">
          <Filter className="h-3 w-3" />
          {[
            filters.estados.length,
            filters.cidades.length,
            filters.tags.length,
            filters.statusValidacao.length,
          ].reduce((a, b) => a + b, 0)}{" "}
          filtros ativos
        </Badge>
      )}

      {/* Painel de filtros avançados */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>
              Configure filtros que serão aplicados em todas as visualizações
              (Lista, Mapa, Kanban)
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Filtro de Qualidade */}
            <div className="space-y-3">
              <Label>
                Qualidade ({filters.qualidadeMin} - {filters.qualidadeMax})
              </Label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[filters.qualidadeMin, filters.qualidadeMax]}
                onValueChange={handleQualityChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mínima</span>
                <span>Máxima</span>
              </div>
            </div>

            {/* Filtro por Tipo de Entidade */}
            <div className="space-y-3">
              <Label>Tipo de Entidade</Label>
              <Select
                value={filters.tipoEntidade}
                onValueChange={value => updateFilters({ tipoEntidade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="concorrentes">Concorrentes</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Status de Validação */}
            <div className="space-y-3">
              <Label>Status de Validação</Label>
              <div className="space-y-2">
                {["pendente", "validado", "descartado"].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statusValidacao.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro por Estados */}
            {filterOptions?.estados && filterOptions.estados.length > 0 && (
              <div className="space-y-3">
                <Label>Estados</Label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.estados.map((estado: string) => (
                    <Badge
                      key={estado}
                      variant={
                        filters.estados.includes(estado) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleEstado(estado)}
                    >
                      {estado}
                      {filters.estados.includes(estado) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Filtro por Tags */}
            {filterOptions?.tags && filterOptions.tags.length > 0 && (
              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant={
                        filters.tags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {filters.tags.includes(tag) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  clearFilters();
                  setIsOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Todos os Filtros
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Botão rápido para limpar filtros */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
