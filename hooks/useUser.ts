import { trpc } from '@/lib/trpc/client';

/**
 * Hook para obter informações do usuário autenticado
 */
export function useUser() {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });

  return {
    user: user || null,
    isLoading,
    isAdmin: user?.role === 'admin',
  };
}
