'use client';

import { UnifiedFilters } from '@/pages/UnifiedCockpit';
import GeoCockpit from '@/pages/GeoCockpit';

// ============================================================================
// TYPES
// ============================================================================

interface MapViewTabProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Aba de visualização em mapa
 * Atualmente renderiza o GeoCockpit completo
 * TODO: Extrair apenas o conteúdo do mapa sem DashboardLayout
 */
export default function MapViewTab({
  filters,
  onFiltersChange,
}: MapViewTabProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      <GeoCockpit />
    </div>
  );
}
