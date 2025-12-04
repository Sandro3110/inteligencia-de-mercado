import { useQuery } from '@tanstack/react-query';

export interface Pesquisa {
  id: number;
  projeto_id: number;
  nome: string;
  descricao: string;
  status: string;
  created_at: string;
}

export interface PesquisasResponse {
  success: boolean;
  pesquisas: Pesquisa[];
  total: number;
}

export interface UsePesquisasParams {
  projetoId?: number | null;
}

export function usePesquisas(params?: UsePesquisasParams) {
  const { projetoId } = params || {};

  return useQuery<PesquisasResponse>({
    queryKey: ['pesquisas', projetoId],
    queryFn: async () => {
      const url = projetoId 
        ? `/api/pesquisas?projeto_id=${projetoId}`
        : '/api/pesquisas';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar pesquisas');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: true, // Sempre habilitado
  });
}
