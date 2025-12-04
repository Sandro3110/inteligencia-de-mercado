import { useQuery } from '@tanstack/react-query';

export interface Totalizador {
  tipo: string;
  label: string;
  total_geral: number;
  total_filtrado: number;
  percentual: number;
  icon: string;
  color: string;
  status: string;
  statusColor: string;
  endpoint: string;
}

export interface TotalizadoresResponse {
  success: boolean;
  filtros: {
    projeto_id: number | null;
    projeto_nome: string | null;
    pesquisa_id: number | null;
    pesquisa_nome: string | null;
  };
  totalizadores: Totalizador[];
  timestamp: string;
}

export interface UseTotalizadoresParams {
  projetoId?: number | null;
  pesquisaId?: number | null;
}

export function useTotalizadores(params?: UseTotalizadoresParams) {
  const { projetoId, pesquisaId } = params || {};

  return useQuery<TotalizadoresResponse>({
    queryKey: ['totalizadores', projetoId, pesquisaId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (projetoId) queryParams.append('projeto_id', projetoId.toString());
      if (pesquisaId) queryParams.append('pesquisa_id', pesquisaId.toString());

      const url = `/api/totalizadores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar totalizadores');
      }
      return response.json();
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });
}
