import { useQuery } from '@tanstack/react-query';

export interface Entidade {
  id: number;
  entidade_hash: string;
  tipo_entidade: string;
  nome: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  site: string | null;
  num_filiais: number | null;
  num_lojas: number | null;
  num_funcionarios: number | null;
  origem_tipo: string;
  origem_arquivo: string | null;
  origem_processo: string | null;
  origem_prompt: string | null;
  origem_confianca: number | null;
  origem_data: string;
  origem_usuario_id: number | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: number | null;
  importacao_id: number | null;
  cnpj_hash: string | null;
  cpf_hash: string | null;
  email_hash: string | null;
  telefone_hash: string | null;
  cidade: string | null;
  uf: string | null;
  porte: string | null;
  setor: string | null;
  produto_principal: string | null;
  segmentacao_b2b_b2c: string | null;
  score_qualidade: number | null;
  enriquecido_em: string | null;
  enriquecido_por: string | null;
  cache_hit: boolean | null;
  cache_expires_at: string | null;
  score_qualidade_dados: number | null;
  validacao_cnpj: boolean | null;
  validacao_email: boolean | null;
  validacao_telefone: boolean | null;
  campos_faltantes: string | null;
  ultima_validacao: string | null;
  status_qualificacao_id: number | null;
}

export interface EntidadesFilters {
  tipo?: string;
  projeto_id?: number;
  pesquisa_id?: number;
  busca?: string;
  cidade?: string;
  uf?: string;
  setor?: string;
  porte?: string;
  score_min?: number;
  score_max?: number;
  enriquecido?: 'true' | 'false' | '';
  data_inicio?: string;
  data_fim?: string;
  validacao_cnpj?: boolean;
  validacao_email?: boolean;
  validacao_telefone?: boolean;
  limit?: number;
  offset?: number;
}

export interface EntidadesResponse {
  success: boolean;
  data: Entidade[];
  total: number;
  limit: number;
  offset: number;
  filters: EntidadesFilters;
}

export function useEntidades(filters: EntidadesFilters = {}) {
  return useQuery<EntidadesResponse>({
    queryKey: ['entidades', filters],
    queryFn: async () => {
      // Construir query params
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/entidades?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar entidades');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
