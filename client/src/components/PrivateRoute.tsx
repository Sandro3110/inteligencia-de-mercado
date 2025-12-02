import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: string[];
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Verificar papel do usuário se especificado
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role.nome);
    
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Papel necessário: {requiredRole.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Seu papel: {user.role.nome}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
