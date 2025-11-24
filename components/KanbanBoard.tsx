'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const STAGES = [
  { id: 'novo', label: 'Novo', color: 'bg-blue-500' },
  { id: 'em_contato', label: 'Em Contato', color: 'bg-yellow-500' },
  { id: 'negociacao', label: 'Negociação', color: 'bg-orange-500' },
  { id: 'fechado', label: 'Fechado', color: 'bg-green-500' },
  { id: 'perdido', label: 'Perdido', color: 'bg-red-500' },
] as const;

const SENSOR_CONFIG = {
  ACTIVATION_DISTANCE: 8,
} as const;

const TOAST_MESSAGES = {
  SUCCESS: 'Lead movido com sucesso!',
  ERROR: (message: string) => `Erro ao mover lead: ${message}`,
} as const;

const GRID_CLASSES = 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4';
const COLUMN_MIN_HEIGHT = 500;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  TINY: 'w-3 h-3',
} as const;

const CURSOR_CLASSES = {
  GRAB: 'cursor-grab',
  GRABBING: 'active:cursor-grabbing',
  DRAGGING: 'opacity-50',
} as const;

const DEFAULT_STAGE = 'novo';

// ============================================================================
// TYPES
// ============================================================================

type StageId = (typeof STAGES)[number]['id'];

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

type KanbanColumnProps = {
  id: string;
  label: string;
  color: string;
  leads: Lead[];
  isLoading: boolean;
};

type KanbanCardProps = {
  lead: Lead;
  isDragging?: boolean;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getLeadStage(lead: Lead): string {
  return lead.stage || DEFAULT_STAGE;
}

function filterLeadsByStage(leads: Lead[], stage: string): Lead[] {
  return leads.filter((lead) => getLeadStage(lead) === stage);
}

function findLeadById(leads: Lead[], id: number | null): Lead | undefined {
  if (id === null) return undefined;
  return leads.find((lead) => lead.id === id);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

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
      className="flex flex-col gap-2 bg-slate-50/30 p-4 rounded-lg"
      style={{ minHeight: COLUMN_MIN_HEIGHT }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className={`${ICON_SIZES.TINY} rounded-full ${color}`} />
          {label}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {leads.length}
        </Badge>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className={`${ICON_SIZES.SMALL} animate-spin`} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ lead, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = useMemo(
    () =>
      transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined,
    [transform]
  );

  const cardClasses = useMemo(
    () =>
      `${CURSOR_CLASSES.GRAB} ${CURSOR_CLASSES.GRABBING} ${
        isDragging ? CURSOR_CLASSES.DRAGGING : ''
      }`,
    [isDragging]
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cardClasses}
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KanbanBoard({ mercadoId, leads }: KanbanBoardProps) {
  // State
  const [activeId, setActiveId] = useState<number | null>(null);

  // tRPC
  const utils = trpc.useUtils();

  const updateStageMutation = trpc.leads.updateStage.useMutation({
    onSuccess: () => {
      utils.leads.byMercado.invalidate({ mercadoId });
      utils.leads.byStage.invalidate({ mercadoId });
      toast.success(TOAST_MESSAGES.SUCCESS);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR(error.message));
    },
  });

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: SENSOR_CONFIG.ACTIVATION_DISTANCE,
      },
    })
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        return;
      }

      const leadId = active.id as number;
      const newStage = over.id as StageId;

      updateStageMutation.mutate({
        id: leadId,
        stage: newStage,
      });

      setActiveId(null);
    },
    [updateStageMutation]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeLead = useMemo(
    () => findLeadById(leads, activeId),
    [leads, activeId]
  );

  const getStageLeads = useCallback(
    (stageId: string) => filterLeadsByStage(leads, stageId),
    [leads]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={GRID_CLASSES}>
        {STAGES.map((stage) => {
          const stageLeads = getStageLeads(stage.id);
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
