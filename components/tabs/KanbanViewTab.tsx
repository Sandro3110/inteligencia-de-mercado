'use client';

import { useMemo } from 'react';
import { UnifiedFilters } from '@/pages/UnifiedCockpit';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, type LucideIcon } from 'lucide-react';

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

const SKELETON_COLUMNS = [1, 2, 3, 4, 5] as const;

const DEFAULT_STAGE = 'novo';

const MESSAGES = {
  NO_LEADS: 'Nenhum lead encontrado. Crie uma pesquisa para começar.',
  NO_LEADS_IN_STAGE: 'Nenhum lead',
} as const;

// ============================================================================
// TYPES
// ============================================================================

type StageId = (typeof STAGES)[number]['id'];

interface Lead {
  id: string;
  nome: string;
  cnpj?: string;
  tipo?: string;
  stage?: string;
}

interface KanbanViewTabProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
}

type LeadsByStage = Record<string, Lead[]>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function groupLeadsByStage(leads: Lead[]): LeadsByStage {
  return STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(
      (lead) => (lead.stage || DEFAULT_STAGE) === stage.id
    );
    return acc;
  }, {} as LeadsByStage);
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Aba de visualização Kanban
 * Mostra leads organizados por estágio (novo, em contato, negociação, fechado, perdido)
 */
export default function KanbanViewTab({
  filters,
  onFiltersChange,
}: KanbanViewTabProps) {
  const { selectedProjectId } = useSelectedProject();
  const { selectedPesquisaId } = useSelectedPesquisa(selectedProjectId);

  const { data: leads, isLoading } = trpc.leads.list.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId || undefined,
    },
    { enabled: !!selectedProjectId }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const leadsByStage = useMemo(() => {
    if (!leads) return {} as LeadsByStage;
    return groupLeadsByStage(leads);
  }, [leads]);

  const hasLeads = useMemo(() => leads && leads.length > 0, [leads]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <div className="grid grid-cols-5 gap-4">
          {SKELETON_COLUMNS.map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasLeads) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{MESSAGES.NO_LEADS}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="grid grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageLeads = leadsByStage[stage.id] || [];
          const hasStageLeads = stageLeads.length > 0;

          return (
            <Card key={stage.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  {stage.label}
                  <span className="text-sm text-muted-foreground ml-auto">
                    ({stageLeads.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hasStageLeads ? (
                  stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="font-medium text-sm">{lead.nome}</div>
                      {lead.cnpj && (
                        <div className="text-xs text-muted-foreground">
                          {lead.cnpj}
                        </div>
                      )}
                      {lead.tipo && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {lead.tipo}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    {MESSAGES.NO_LEADS_IN_STAGE}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
