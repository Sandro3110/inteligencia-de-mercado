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
import { Card, CardContent } from "@/components/ui/card";
import { X, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export interface NotificationFiltersState {
  type?: string;
  period?: string;
  projectId?: number;
  status?: "all" | "read" | "unread";
  searchText?: string;
}

interface NotificationFiltersProps {
  filters: NotificationFiltersState;
  onFiltersChange: (filters: NotificationFiltersState) => void;
  projects?: Array<{ id: number; nome: string }>;
}

const NOTIFICATION_TYPES = [
  { value: "all", label: "Todos os Tipos" },
  { value: "enrichment", label: "Enriquecimento" },
  { value: "validation", label: "Validação" },
  { value: "export", label: "Exportação" },
  { value: "lead_quality", label: "Qualidade de Lead" },
  { value: "lead_closed", label: "Lead Fechado" },
  { value: "new_competitor", label: "Novo Concorrente" },
  { value: "market_threshold", label: "Limite de Mercado" },
  { value: "data_incomplete", label: "Dados Incompletos" },
];

const PERIODS = [
  { value: "all", label: "Todos os Períodos" },
  { value: "today", label: "Hoje" },
  { value: "7days", label: "Últimos 7 dias" },
  { value: "30days", label: "Últimos 30 dias" },
  { value: "90days", label: "Últimos 90 dias" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Não Lidas" },
  { value: "read", label: "Lidas" },
];

export function NotificationFilters({
  filters,
  onFiltersChange,
  projects = [],
}: NotificationFiltersProps) {
  const [searchText, setSearchText] = useState(filters.searchText || "");
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== filters.searchText) {
        onFiltersChange({ ...filters, searchText });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.period !== "all" ||
    filters.projectId !== undefined ||
    filters.status !== "all" ||
    filters.searchText;

  const clearFilters = () => {
    setSearchText("");
    onFiltersChange({
      type: "all",
      period: "all",
      status: "all",
      projectId: undefined,
      searchText: "",
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou mensagem..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className={isExpanded ? "bg-primary/10" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Advanced Filters (Collapsible) */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter">Tipo</Label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, type: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Filter */}
              <div className="space-y-2">
                <Label htmlFor="period-filter">Período</Label>
                <Select
                  value={filters.period || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, period: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger id="period-filter">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      status: value as "all" | "read" | "unread",
                    })
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="project-filter">Projeto</Label>
                  <Select
                    value={filters.projectId?.toString() || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        projectId: value === "all" ? undefined : parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="project-filter">
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Projetos</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Filtros ativos:</span>
              {filters.type && filters.type !== "all" && (
                <span className="px-2 py-1 bg-primary/10 rounded">
                  {NOTIFICATION_TYPES.find((t) => t.value === filters.type)?.label}
                </span>
              )}
              {filters.period && filters.period !== "all" && (
                <span className="px-2 py-1 bg-primary/10 rounded">
                  {PERIODS.find((p) => p.value === filters.period)?.label}
                </span>
              )}
              {filters.status && filters.status !== "all" && (
                <span className="px-2 py-1 bg-primary/10 rounded">
                  {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
                </span>
              )}
              {filters.projectId && (
                <span className="px-2 py-1 bg-primary/10 rounded">
                  Projeto #{filters.projectId}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
