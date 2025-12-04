import { useQuery } from '@tanstack/react-query';

export interface Totalizador {
  tipo: string;
  label: string;
  total: number;
  icon: string;
  color: string;
  status: string;
  statusColor: string;
  endpoint: string;
}

export interface TotalizadoresResponse {
  success: boolean;
  totalizadores: Totalizador[];
  timestamp: string;
}

export function useTotalizadores() {
  return useQuery<TotalizadoresResponse>({
    queryKey: ['totalizadores'],
    queryFn: async () => {
      const response = await fetch('/api/totalizadores');
      if (!response.ok) {
        throw new Error('Erro ao buscar totalizadores');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });
}
