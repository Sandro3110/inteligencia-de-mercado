'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_COLOR = '#3b82f6';

// ============================================================================
// TYPES
// ============================================================================

type EntityType = 'mercado' | 'cliente' | 'concorrente' | 'lead';

interface EntityTag {
  tagId: number;
  name: string;
  color: string;
}

interface RawEntityTag {
  tagId: number;
  name: string;
  color: string | null;
}

export interface EntityTagPickerProps {
  entityType: EntityType;
  entityId: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * EntityTagPicker
 * 
 * Componente que busca e exibe tags de uma entidade específica.
 * Utiliza tRPC para buscar as tags e exibe como badges.
 * 
 * @example
 * <EntityTagPicker entityType="mercado" entityId={123} />
 */
export function EntityTagPicker({
  entityType,
  entityId,
}: EntityTagPickerProps) {
  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: rawTags = [], isLoading } = trpc.tags.getEntityTags.useQuery({
    entityType,
    entityId,
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const mappedTags: EntityTag[] = useMemo(
    () =>
      rawTags.map((tag: RawEntityTag) => ({
        tagId: tag.tagId,
        name: tag.name,
        color: tag.color || DEFAULT_COLOR,
      })),
    [rawTags]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando tags...</div>;
  }

  if (mappedTags.length === 0) {
    return <div className="text-sm text-gray-400">Sem tags</div>;
  }

  return (
    <div className="inline-flex gap-2 flex-wrap">
      {mappedTags.map((tag) => (
        <Badge 
          key={tag.tagId} 
          style={{ backgroundColor: tag.color }}
          className="text-white"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
