import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Não fazer nada durante o loading
    if (loading) return;

    // Se está em rota pública, permitir acesso
    if (PUBLIC_ROUTES.includes(location)) {
      // Se já está autenticado e tenta acessar login/register, redirecionar para home
      if (isAuthenticated && user) {
        setLocation("/");
      }
      return;
    }

    // Se não está autenticado e tenta acessar rota protegida, redirecionar para login
    if (!isAuthenticated || !user) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, user, location, setLocation]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se está em rota pública, renderizar normalmente
  if (PUBLIC_ROUTES.includes(location)) {
    return <>{children}</>;
  }

  // Se não está autenticado, não renderizar nada (vai redirecionar)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}
