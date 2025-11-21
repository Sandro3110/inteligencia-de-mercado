import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

const STORAGE_KEY = "selected-pesquisa-id";

export function useSelectedPesquisa(projectId?: number | null) {
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Buscar lista de pesquisas do projeto
  const { data: pesquisas = [], isLoading: isLoadingPesquisas } =
    trpc.pesquisas.list.useQuery(
      { projectId: projectId! },
      { enabled: !!projectId }
    );

  // Inicializar pesquisa selecionada
  useEffect(() => {
    if (!projectId) {
      setSelectedPesquisaId(null);
      setIsLoading(false);
      return;
    }

    if (isLoadingPesquisas) {
      return;
    }

    // Tentar carregar do localStorage (por projeto)
    const storageKey = `${STORAGE_KEY}-${projectId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const pesquisaId = parseInt(stored, 10);
      // Verificar se a pesquisa ainda existe
      if (pesquisas.some(p => p.id === pesquisaId)) {
        setSelectedPesquisaId(pesquisaId);
        setIsLoading(false);
        return;
      }
    }

    // Se não há pesquisa salva ou ela não existe mais, usar a primeira disponível
    if (pesquisas.length > 0) {
      setSelectedPesquisaId(pesquisas[0].id);
      localStorage.setItem(storageKey, pesquisas[0].id.toString());
    } else {
      setSelectedPesquisaId(null);
    }

    setIsLoading(false);
  }, [pesquisas, isLoadingPesquisas, projectId]);

  // Função para trocar de pesquisa
  const selectPesquisa = (pesquisaId: number | null) => {
    setSelectedPesquisaId(pesquisaId);
    if (projectId && pesquisaId) {
      const storageKey = `${STORAGE_KEY}-${projectId}`;
      localStorage.setItem(storageKey, pesquisaId.toString());
    }
  };

  const selectedPesquisa = pesquisas.find(p => p.id === selectedPesquisaId);

  return {
    selectedPesquisaId,
    selectedPesquisa,
    pesquisas,
    selectPesquisa,
    isLoading: isLoading || isLoadingPesquisas,
  };
}
