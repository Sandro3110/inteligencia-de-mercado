import { useQuery } from '@tanstack/react-query';

export interface Projeto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  status: string;
  centro_custo: string;
  created_at: string;
}

export interface ProjetosResponse {
  success: boolean;
  projetos: Projeto[];
  total: number;
}

export function useProjetos() {
  return useQuery<ProjetosResponse>({
    queryKey: ['projetos'],
    queryFn: async () => {
      const response = await fetch('/api/projetos');
      if (!response.ok) {
        throw new Error('Erro ao buscar projetos');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
