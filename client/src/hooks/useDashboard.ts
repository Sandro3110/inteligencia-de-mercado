import { useQuery } from '@tanstack/react-query';

/**
 * Interface para os KPIs do dashboard
 */
export interface DashboardKPIs {
  totalProjetos: number;
  totalPesquisas: number;
  totalEntidades: number;
  totalClientes: number;
  totalLeads: number;
  totalConcorrentes: number;
  totalProdutos: number;
  totalMercados: number;
}

/**
 * Interface para a resposta da API
 */
export interface DashboardResponse {
  success: boolean;
  kpis: DashboardKPIs;
  timestamp: string;
}

/**
 * Hook para buscar dados do dashboard via REST API
 * 
 * @returns Query object com dados, loading e error states
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDashboard();
 * 
 * if (isLoading) return <div>Carregando...</div>;
 * if (error) return <div>Erro: {error.message}</div>;
 * 
 * const kpis = data?.kpis || {};
 * ```
 */
export function useDashboard() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dashboard: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro desconhecido');
      }
      
      return data;
    },
    // Cache por 30 segundos
    staleTime: 30 * 1000,
    // Refetch ao focar na janela
    refetchOnWindowFocus: true,
    // Retry 3 vezes em caso de erro
    retry: 3,
  });
}
