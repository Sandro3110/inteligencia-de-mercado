import { logger } from '@/lib/logger';

('use client');

import { useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

// ============================================================================
// CONSTANTS
// ============================================================================

const PUBLIC_ROUTES = ['/login', '/register'] as const;

const BYPASS_ENABLED = true; // ⚠️ VERSÃO DE TESTE - BYPASS DE AUTENTICAÇÃO

const LOG_MESSAGES = {
  BYPASS_ACTIVE: '🔓 AUTH BYPASS ATIVO - Permitindo acesso sem autenticação',
  LOCATION: 'Location:',
  IS_AUTHENTICATED: 'IsAuthenticated:',
  USER: 'User:',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface AuthGuardProps {
  children: React.ReactNode;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isPublicRoute(location: string): boolean {
  return PUBLIC_ROUTES.includes(location as (typeof PUBLIC_ROUTES)[number]);
}

function logBypassInfo(location: string, isAuthenticated: boolean, user: unknown): void {
  if (BYPASS_ENABLED) {
    logger.debug(LOG_MESSAGES.BYPASS_ACTIVE);
    logger.debug(LOG_MESSAGES.LOCATION, location);
    logger.debug(LOG_MESSAGES.IS_AUTHENTICATED, isAuthenticated);
    logger.debug(LOG_MESSAGES.USER, user);
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AuthGuard
 *
 * ⚠️ VERSÃO DE TESTE - BYPASS DE AUTENTICAÇÃO ATIVADO
 *
 * Esta versão permite acesso sem login para testes.
 * Em produção, este componente deve verificar autenticação e redirecionar para login.
 *
 * @example
 * ```tsx
 * <AuthGuard>
 *   <App />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children }: AuthGuardProps) {
  // Auth
  const { user, loading, isAuthenticated } = useAuth();

  // Location
  const [location] = useLocation();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isPublic = useMemo(() => isPublicRoute(location), [location]);

  // ============================================================================
  // SIDE EFFECTS
  // ============================================================================

  // Log bypass info for debugging
  logBypassInfo(location, isAuthenticated, user);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Se está em rota pública, renderizar normalmente
  if (isPublic) {
    return <>{children}</>;
  }

  // 🔓 BYPASS: Renderizar conteúdo mesmo sem autenticação
  if (BYPASS_ENABLED) {
    return <>{children}</>;
  }

  // Em produção, verificar autenticação e redirecionar se necessário
  // if (!isAuthenticated && !loading) {
  //   return <Redirect to="/login" />;
  // }

  return <>{children}</>;
}
