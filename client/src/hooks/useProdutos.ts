import { trpc } from '@/lib/trpc';

/**
 * Hook para gerenciar produtos
 */

export interface ProdutoFiltros {
  search?: string;
  categoria?: string;
  subcategoria?: string;
  sku?: string;
  ean?: string;
  ncm?: string;
  preco_min?: number;
  preco_max?: number;
  ativo?: boolean;
  ordenacao?: {
    campo: 'nome' | 'preco' | 'data_cadastro' | 'categoria';
    direcao: 'ASC' | 'DESC';
  };
  pagina?: number;
  porPagina?: number;
}

export interface Produto {
  produto_id: number;
  nome: string;
  sku?: string;
  ean?: string;
  ncm?: string;
  categoria?: string;
  subcategoria?: string;
  preco?: number;
  moeda?: string;
  unidade?: string;
  descricao?: string;
  ativo: boolean;
  data_cadastro: string;
  data_atualizacao: string;
  criado_por?: string;
  atualizado_por?: string;
  fonte?: string;
}

/**
 * Hook para listar produtos com filtros
 */
export function useProdutos(filtros: ProdutoFiltros = {}) {
  const query = trpc.produto.list.useQuery(filtros, {
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    produtos: query.data?.dados as Produto[] | undefined,
    total: query.data?.paginacao?.total || 0,
    pagina: query.data?.paginacao?.pagina || 1,
    porPagina: query.data?.paginacao?.porPagina || 20,
    totalPaginas: query.data?.paginacao?.totalPaginas || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para buscar produto por ID
 */
export function useProduto(id: number) {
  const query = trpc.produto.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );

  return {
    produto: query.data as Produto | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para listar entidades vinculadas a um produto
 */
export function useProdutoEntidades(produtoId: number, pagina = 1, porPagina = 20) {
  const query = trpc.produto.getEntidades.useQuery(
    { produtoId, pagina, porPagina },
    {
      enabled: !!produto_id,
      staleTime: 5 * 60 * 1000,
    }
  );

  return {
    entidades: query.data?.dados || [],
    total: query.data?.paginacao?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para listar mercados vinculados a um produto
 */
export function useProdutoMercados(produtoId: number, pagina = 1, porPagina = 20) {
  const query = trpc.produto.getMercados.useQuery(
    { produtoId, pagina, porPagina },
    {
      enabled: !!produto_id,
      staleTime: 5 * 60 * 1000,
    }
  );

  return {
    mercados: query.data?.dados || [],
    total: query.data?.paginacao?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obter estatísticas de produtos
 */
export function useProdutosStats() {
  const query = trpc.produto.getStats.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para listar categorias
 */
export function useCategorias() {
  const query = trpc.produto.getCategorias.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  return {
    categorias: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para listar subcategorias de uma categoria
 */
export function useSubcategorias(categoria?: string) {
  const query = trpc.produto.getSubcategorias.useQuery(
    { categoria: categoria || '' },
    {
      enabled: !!categoria,
      staleTime: 30 * 60 * 1000, // 30 minutos
    }
  );

  return {
    subcategorias: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
