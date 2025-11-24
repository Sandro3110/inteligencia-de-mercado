import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();

  // Não fazer query em rotas públicas
  const isPublicRoute = location === "/login" || location === "/register";

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !isPublicRoute, // Desabilitar query em rotas públicas
    // Tratar erro UNAUTHORIZED como estado válido (não autenticado)
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        // Não fazer nada, é um estado válido
        return;
      }
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      // Limpar localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // Redirecionar para login
      setLocation("/login");
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Mesmo sem autenticação, limpar dados locais
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setLocation("/login");
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils, setLocation]);

  const state = useMemo(() => {
    // Salvar dados do usuário no localStorage para compatibilidade
    if (meQuery.data) {
      localStorage.setItem("user", JSON.stringify(meQuery.data));
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
    
    // Se há erro UNAUTHORIZED, não está loading
    const isUnauthorizedError = meQuery.error?.data?.code === "UNAUTHORIZED";
    const isLoading = isUnauthorizedError ? false : (meQuery.isLoading || logoutMutation.isPending);
    
    return {
      user: meQuery.data ?? null,
      loading: isLoading,
      error: isUnauthorizedError ? null : (meQuery.error ?? logoutMutation.error ?? null),
      isAuthenticated: Boolean(meQuery.data),
      isAdmin: meQuery.data?.role === "admin",
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    if (window.location.pathname === "/register") return; // Permitir acesso à página de registro

    setLocation(redirectPath);
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    setLocation,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
