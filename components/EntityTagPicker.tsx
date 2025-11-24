'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TagPicker } from './TagPicker';

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
// HELPER FUNCTIONS
// ============================================================================

function mapEntityTag(tag: RawEntityTag): EntityTag {
  return {
    tagId: tag.tagId,
    name: tag.name,
    color: tag.color || DEFAULT_COLOR,
  };
}

function mapEntityTags(tags: RawEntityTag[]): EntityTag[] {
  return tags.map(mapEntityTag);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EntityTagPicker
 * 
 * Componente que busca e exibe tags associadas a uma entidade específica.
 * Utiliza tRPC para buscar as tags e delega a renderização para TagPicker.
 * 
 * @example
 * ```tsx
 * <EntityTagPicker entityType="mercado" entityId={123} />
 * ```
 */
export function EntityTagPicker({
  entityType,
  entityId,
}: EntityTagPickerProps) {
  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: entityTags = [] } = trpc.tags.getEntityTags.useQuery({
    entityType,
    entityId,
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const mappedTags = useMemo(
    () => mapEntityTags(entityTags),
    [entityTags]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <TagPicker
      entityType={entityType}
      entityId={entityId}
      currentTags={mappedTags}
    />
  );
}
