import { trpc } from "@/lib/trpc";

/**
 * Hook para gerenciar configurações de enriquecimento
 */
export function useEnrichmentConfig(projectId: number | undefined) {
  const utils = trpc.useUtils();

  // Buscar configuração
  const { data: config, isLoading, error } = trpc.enrichmentConfig.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  // Salvar configuração
  const saveMutation = trpc.enrichmentConfig.save.useMutation({
    onSuccess: () => {
      utils.enrichmentConfig.get.invalidate({ projectId: projectId! });
    },
  });

  // Testar API keys
  const testKeysMutation = trpc.enrichmentConfig.testKeys.useMutation();

  return {
    config,
    isLoading,
    error,
    saveConfig: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    testKeys: testKeysMutation.mutate,
    isTesting: testKeysMutation.isPending,
    testResults: testKeysMutation.data,
  };
}
