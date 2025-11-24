import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Lead = {
  id: number;
  nome: string;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  tipo?: string | null;
  porte?: string | null;
  stage?: string | null;
};

type KanbanBoardProps = {
  mercadoId: number;
  leads: Lead[];
};

const STAGES = [
  { id: "novo", label: "Novo", color: "bg-blue-500" },
  { id: "em_contato", label: "Em Contato", color: "bg-yellow-500" },
  { id: "negociacao", label: "Negociação", color: "bg-orange-500" },
  { id: "fechado", label: "Fechado", color: "bg-green-500" },
  { id: "perdido", label: "Perdido", color: "bg-red-500" },
];

export default function KanbanBoard({ mercadoId, leads }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const updateStageMutation = trpc.leads.updateStage.useMutation({
    onSuccess: () => {
      utils.leads.byMercado.invalidate({ mercadoId });
      utils.leads.byStage.invalidate({ mercadoId });
      toast.success("Lead movido com sucesso!");
    },
    onError: error => {
      toast.error(`Erro ao mover lead: ${error.message}`);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as number;
    const newStage = over.id as string;

    updateStageMutation.mutate({
      id: leadId,
      stage: newStage as any,
    });

    setActiveId(null);
  };

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => (lead.stage || "novo") === stage);
  };

  const activeLead = leads.find(lead => lead.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAGES.map(stage => {
          const stageLeads = getLeadsByStage(stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              color={stage.color}
              leads={stageLeads}
              isLoading={updateStageMutation.isPending}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? <KanbanCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

type KanbanColumnProps = {
  id: string;
  label: string;
  color: string;
  leads: Lead[];
  isLoading: boolean;
};

function KanbanColumn({
  id,
  label,
  color,
  leads,
  isLoading,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 bg-slate-50/30 p-4 rounded-lg min-h-[500px]"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          {label}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {leads.length}
        </Badge>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {leads.map(lead => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

type KanbanCardProps = {
  lead: Lead;
  isDragging?: boolean;
};

function KanbanCard({ lead, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium line-clamp-2">
          {lead.nome}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1">
        {lead.cnpj && (
          <p className="text-xs text-muted-foreground">CNPJ: {lead.cnpj}</p>
        )}
        {lead.tipo && (
          <Badge variant="outline" className="text-xs">
            {lead.tipo}
          </Badge>
        )}
        {lead.porte && (
          <Badge variant="secondary" className="text-xs ml-1">
            {lead.porte}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Helper hooks from @dnd-kit
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
