'use client';

import GeoCockpit from '@/components/GeoCockpit';

// ============================================================================
// TYPES
// ============================================================================

interface UnifiedFilters {
  [key: string]: any;
}

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
      <GeoCockpit 
        entityType="lead" 
        entityId={0} 
        entityName="" 
        address="" 
        onSave={async () => {}} 
      />
    </div>
  );
}
