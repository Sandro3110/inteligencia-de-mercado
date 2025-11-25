'use client';

import { useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Redirect } from 'wouter';

// ============================================================================
// CONSTANTS
// ============================================================================

const DIMENSIONS = {
  SPINNER: 'h-12 w-12',
} as const;

const CLASSES = {
  CONTAINER: 'flex items-center justify-center min-h-screen',
  SPINNER: 'animate-spin rounded-full border-b-2 border-blue-600',
  ACCESS_DENIED_CONTAINER: 'text-center',
  ACCESS_DENIED_TITLE: 'text-2xl font-bold text-gray-900 mb-2',
  ACCESS_DENIED_TEXT: 'text-gray-600',
} as const;

const ROUTES = {
  LOGIN: '/login',
} as const;

const LABELS = {
  ACCESS_DENIED_TITLE: 'Acesso Negado',
  ACCESS_DENIED_TEXT: 'Você não tem permissão para acessar esta página.',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LoadingSpinner() {
  return (
    <div className={CLASSES.CONTAINER}>
      <div className={`${CLASSES.SPINNER} ${DIMENSIONS.SPINNER}`} />
    </div>
  );
}

function AccessDenied() {
  return (
    <div className={CLASSES.CONTAINER}>
      <div className={CLASSES.ACCESS_DENIED_CONTAINER}>
        <h1 className={CLASSES.ACCESS_DENIED_TITLE}>
          {LABELS.ACCESS_DENIED_TITLE}
        </h1>
        <p className={CLASSES.ACCESS_DENIED_TEXT}>
          {LABELS.ACCESS_DENIED_TEXT}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ProtectedRoute
 * 
 * Componente que protege rotas requerendo autenticação.
 * Opcionalmente pode requerer permissões de administrador.
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requireAdmin>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  // Auth
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const shouldShowLoading = useMemo(() => isLoading, [isLoading]);

  const shouldRedirectToLogin = useMemo(
    () => !isAuthenticated || !user,
    [isAuthenticated, user]
  );

  const shouldShowAccessDenied = useMemo(
    () => requireAdmin && !isAdmin,
    [requireAdmin, isAdmin]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (shouldShowLoading) {
    return <LoadingSpinner />;
  }

  if (shouldRedirectToLogin) {
    return <Redirect to={ROUTES.LOGIN} />;
  }

  if (shouldShowAccessDenied) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
