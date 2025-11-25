"use client";

/**
 * useSelectedPesquisa - Hook for managing selected pesquisa
 * Fetches pesquisas for a project and manages selection state
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc} from '@/lib/trpc/client';

// ============================================================================
// TYPES
// ============================================================================

interface Pesquisa {
  id: number;
  nome: string;
  descricao?: string | null;
  status?: string | null;
  createdAt?: string | null;
  totalClientes: number | null;
  totalConcorrentes: number | null;
  totalLeads: number | null;
  totalMercados: number | null;
}

interface UseSelectedPesquisaReturn {
  selectedPesquisaId: number | null;
  pesquisas: Pesquisa[];
  selectPesquisa: (id: number | null) => void;
  isLoading: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSelectedPesquisa(projectId: number | null | undefined): UseSelectedPesquisaReturn {
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | null>(null);

  // Fetch pesquisas for the project
  const { data: pesquisasData, isLoading } = trpc.getPesquisasByProject.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const pesquisas = (pesquisasData?.data as Pesquisa[]) || [];

  // Auto-select first pesquisa if none selected
  useEffect(() => {
    if (pesquisas.length > 0 && !selectedPesquisaId) {
      setSelectedPesquisaId(pesquisas[0].id);
    }
  }, [pesquisas, selectedPesquisaId]);

  const selectPesquisa = useCallback((id: number | null) => {
    setSelectedPesquisaId(id);
  }, []);

  return {
    selectedPesquisaId,
    pesquisas,
    selectPesquisa,
    isLoading,
  };
}
