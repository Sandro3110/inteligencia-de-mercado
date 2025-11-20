import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export type NotificationType =
  | "all"
  | "enrichment_complete"
  | "enrichment_started"
  | "enrichment_error"
  | "lead_high_quality"
  | "quality_alert"
  | "circuit_breaker"
  | "project_created"
  | "project_hibernated"
  | "project_reactivated"
  | "pesquisa_created"
  | "validation_batch_complete"
  | "export_complete"
  | "report_generated"
  | "system";

export type NotificationStatus = "all" | "unread" | "read";

interface NotificationFiltersProps {
  type: NotificationType;
  status: NotificationStatus;
  onTypeChange: (type: NotificationType) => void;
  onStatusChange: (status: NotificationStatus) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const typeLabels: Record<NotificationType, string> = {
  all: "Todos os tipos",
  enrichment_complete: "Enriquecimento concluído",
  enrichment_started: "Enriquecimento iniciado",
  enrichment_error: "Erro no enriquecimento",
  lead_high_quality: "Lead de alta qualidade",
  quality_alert: "Alerta de qualidade",
  circuit_breaker: "Circuit breaker",
  project_created: "Projeto criado",
  project_hibernated: "Projeto hibernado",
  project_reactivated: "Projeto reativado",
  pesquisa_created: "Pesquisa criada",
  validation_batch_complete: "Validação em lote",
  export_complete: "Exportação concluída",
  report_generated: "Relatório gerado",
  system: "Sistema",
};

const statusLabels: Record<NotificationStatus, string> = {
  all: "Todas",
  unread: "Não lidas",
  read: "Lidas",
};

export function NotificationFilters({
  type,
  status,
  onTypeChange,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filtros:
      </div>

      <Select value={type} onValueChange={(v) => onTypeChange(v as NotificationType)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tipo de notificação" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(typeLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatusChange(v as NotificationStatus)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar filtros
        </Button>
      )}

      {hasActiveFilters && (
        <div className="flex items-center gap-2 ml-auto">
          {type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {typeLabels[type]}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onTypeChange("all")}
              />
            </Badge>
          )}
          {status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {statusLabels[status]}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onStatusChange("all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
