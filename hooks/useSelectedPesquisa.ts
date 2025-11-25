"use client";

/**
 * useSelectedPesquisa - Hook for managing selected pesquisa
 * Fetches pesquisas for a project and manages selection state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { trpc} from '@/lib/trpc/client';

// ============================================================================
// TYPES
// ============================================================================

interface Pesquisa {
  id: number;
  projectId: number;
  nome: string;
  descricao: string | null;
  dataImportacao: string | null;
  totalClientes: number | null;
  clientesEnriquecidos: number | null;
  status: string | null;
  qtdConcorrentesPorMercado: number | null;
  qtdLeadsPorMercado: number | null;
  qtdProdutosPorCliente: number | null;
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
  const { data: pesquisasData, isLoading } = trpc.pesquisas.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const pesquisas = (pesquisasData as Pesquisa[]) || [];

  // Auto-select first pesquisa if none selected
  const defaultPesquisaId = useMemo(() => {
    if (pesquisas.length > 0 && !selectedPesquisaId) {
      return pesquisas[0].id;
    }
    return selectedPesquisaId;
  }, [pesquisas, selectedPesquisaId]);

  useEffect(() => {
    if (defaultPesquisaId && defaultPesquisaId !== selectedPesquisaId) {
      setSelectedPesquisaId(defaultPesquisaId);
    }
  }, [defaultPesquisaId]);

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
