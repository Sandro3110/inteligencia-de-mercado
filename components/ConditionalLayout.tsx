import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { AppSidebar } from './AppSidebar';

// ============================================================================
// CONSTANTS
// ============================================================================

const PUBLIC_ROUTES = ['/login', '/register'] as const;

// ============================================================================
// TYPES
// ============================================================================

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isPublicRoute(location: string): boolean {
  return PUBLIC_ROUTES.includes(location as (typeof PUBLIC_ROUTES)[number]);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ConditionalLayout
 * 
 * Renderiza o layout com ou sem sidebar baseado na rota atual.
 * Rotas públicas (login, register) não exibem o sidebar.
 * Rotas autenticadas exibem o sidebar.
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  // Hooks
  const [location] = useLocation();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const shouldShowSidebar = useMemo(
    () => !isPublicRoute(location),
    [location]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <AppSidebar />
      {children}
    </>
  );
}
