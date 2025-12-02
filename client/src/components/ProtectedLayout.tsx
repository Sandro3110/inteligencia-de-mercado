import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from './Layout';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar o layout (PrivateRoute vai redirecionar)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Se autenticado, renderizar com Layout completo
  return <Layout>{children}</Layout>;
}
