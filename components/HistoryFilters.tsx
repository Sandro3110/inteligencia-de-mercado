import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Download, FileDown, Filter } from "lucide-react";
import { Card } from "./ui/card";

interface HistoryFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  status: string;
  durationMin: string;
  durationMax: string;
}

export default function HistoryFilters({
  onFilterChange,
  onExportCSV,
  onExportPDF,
}: HistoryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    status: "all",
    durationMin: "",
    durationMax: "",
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      dateFrom: "",
      dateTo: "",
      status: "all",
      durationMin: "",
      durationMax: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro por Data */}
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Data Inicial</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={e => handleFilterChange("dateFrom", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo">Data Final</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={e => handleFilterChange("dateTo", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filtro por Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={value => handleFilterChange("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="running">Em Execução</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Duração */}
        <div className="space-y-2">
          <Label htmlFor="durationMin">Duração Mínima (min)</Label>
          <Input
            id="durationMin"
            type="number"
            placeholder="0"
            value={filters.durationMin}
            onChange={e => handleFilterChange("durationMin", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMax">Duração Máxima (min)</Label>
          <Input
            id="durationMax"
            type="number"
            placeholder="999"
            value={filters.durationMax}
            onChange={e => handleFilterChange("durationMax", e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Limpar Filtros
        </Button>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          Exportar CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportPDF}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>
    </Card>
  );
}
