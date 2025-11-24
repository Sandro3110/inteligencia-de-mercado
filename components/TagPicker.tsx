'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { TagBadge } from './TagBadge';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
} as const;

const DIMENSIONS = {
  BUTTON_HEIGHT: 'h-6',
  POPOVER_WIDTH: 'w-[250px]',
} as const;

const SPACING = {
  BUTTON_PADDING: 'px-2',
  POPOVER_PADDING: 'p-2',
  CONTAINER_GAP: 'gap-1.5',
  LIST_GAP: 'space-y-1',
} as const;

const CLASSES = {
  CONTAINER: 'flex flex-wrap items-center',
  BUTTON: 'text-xs text-muted-foreground hover:text-foreground',
  EMPTY_STATE: 'text-xs text-muted-foreground text-center py-2',
  TAG_BUTTON: 'w-full flex items-center justify-between p-2 rounded hover:bg-accent transition-colors text-left',
  CHECK_ICON: 'text-muted-foreground',
} as const;

const LABELS = {
  ADD_TAG_SUCCESS: 'Tag adicionada!',
  REMOVE_TAG_SUCCESS: 'Tag removida!',
  ADD_TAG_ERROR: (message: string) => `Erro ao adicionar tag: ${message}`,
  REMOVE_TAG_ERROR: (message: string) => `Erro ao remover tag: ${message}`,
  NO_TAGS_AVAILABLE: 'Nenhuma tag disponível. Crie tags no Gerenciador de Tags.',
  ALL_TAGS_ADDED: 'Todas as tags já foram adicionadas',
} as const;

const DEFAULT_TAG_COLOR = '#3b82f6';

// ============================================================================
// TYPES
// ============================================================================

export type EntityType = 'mercado' | 'cliente' | 'concorrente' | 'lead';

export interface TagPickerProps {
  entityType: EntityType;
  entityId: number;
  currentTags: Array<{ tagId: number; name: string; color: string }>;
  onTagsChange?: () => void;
}

interface Tag {
  id: number;
  name: string;
  color: string | null;
}

interface CurrentTag {
  tagId: number;
  name: string;
  color: string;
}

interface TagButtonProps {
  tag: Tag;
  onAdd: (tagId: number) => void;
  isLoading: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentTagIds(currentTags: CurrentTag[]): Set<number> {
  return new Set(currentTags.map((t) => t.tagId));
}

function getAvailableTags(allTags: Tag[], currentTagIds: Set<number>): Tag[] {
  return allTags.filter((tag) => !currentTagIds.has(tag.id));
}

function getTagColor(tag: Tag): string {
  return tag.color || DEFAULT_TAG_COLOR;
}

function getEmptyMessage(allTagsCount: number): string {
  return allTagsCount === 0 ? LABELS.NO_TAGS_AVAILABLE : LABELS.ALL_TAGS_ADDED;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmptyState({ allTagsCount }: { allTagsCount: number }) {
  const message = useMemo(() => getEmptyMessage(allTagsCount), [allTagsCount]);

  return <p className={CLASSES.EMPTY_STATE}>{message}</p>;
}

function TagButton({ tag, onAdd, isLoading }: TagButtonProps) {
  const tagColor = useMemo(() => getTagColor(tag), [tag]);

  const handleClick = useCallback(() => {
    onAdd(tag.id);
  }, [tag.id, onAdd]);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={CLASSES.TAG_BUTTON}
    >
      <TagBadge name={tag.name} color={tagColor} size="sm" />
      <Check className={`${ICON_SIZES.SMALL} ${CLASSES.CHECK_ICON}`} />
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TagPicker
 * 
 * Componente para adicionar e remover tags de entidades.
 * Suporta múltiplos tipos de entidades (mercado, cliente, concorrente, lead).
 * 
 * @example
 * ```tsx
 * <TagPicker
 *   entityType="cliente"
 *   entityId={123}
 *   currentTags={currentTags}
 *   onTagsChange={handleTagsChange}
 * />
 * ```
 */
export function TagPicker({
  entityType,
  entityId,
  currentTags,
  onTagsChange,
}: TagPickerProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);

  // TRPC
  const utils = trpc.useUtils();
  const { data: allTags = [] } = trpc.tags.list.useQuery();

  const addMutation = trpc.tags.addToEntity.useMutation({
    onSuccess: () => {
      utils.tags.getEntityTags.invalidate({ entityType, entityId });
      onTagsChange?.();
      toast.success(LABELS.ADD_TAG_SUCCESS);
    },
    onError: (error) => {
      toast.error(LABELS.ADD_TAG_ERROR(error.message));
    },
  });

  const removeMutation = trpc.tags.removeFromEntity.useMutation({
    onSuccess: () => {
      utils.tags.getEntityTags.invalidate({ entityType, entityId });
      onTagsChange?.();
      toast.success(LABELS.REMOVE_TAG_SUCCESS);
    },
    onError: (error) => {
      toast.error(LABELS.REMOVE_TAG_ERROR(error.message));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentTagIds = useMemo(() => getCurrentTagIds(currentTags), [currentTags]);

  const availableTags = useMemo(
    () => getAvailableTags(allTags, currentTagIds),
    [allTags, currentTagIds]
  );

  const hasAvailableTags = useMemo(
    () => availableTags.length > 0,
    [availableTags.length]
  );

  const isLoading = useMemo(
    () => addMutation.isPending,
    [addMutation.isPending]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAddTag = useCallback(
    (tagId: number) => {
      addMutation.mutate({ tagId, entityType, entityId });
      setIsOpen(false);
    },
    [addMutation, entityType, entityId]
  );

  const handleRemoveTag = useCallback(
    (tagId: number) => {
      removeMutation.mutate({ tagId, entityType, entityId });
    },
    [removeMutation, entityType, entityId]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${CLASSES.CONTAINER} ${SPACING.CONTAINER_GAP}`}>
      {/* Current tags */}
      {currentTags.map((tag) => (
        <TagBadge
          key={tag.tagId}
          name={tag.name}
          color={tag.color}
          size="sm"
          onRemove={() => handleRemoveTag(tag.tagId)}
        />
      ))}

      {/* Add tag button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${DIMENSIONS.BUTTON_HEIGHT} ${SPACING.BUTTON_PADDING} ${CLASSES.BUTTON}`}
          >
            <Plus className={ICON_SIZES.SMALL} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={`${DIMENSIONS.POPOVER_WIDTH} ${SPACING.POPOVER_PADDING}`}
          align="start"
        >
          <div className={SPACING.LIST_GAP}>
            {!hasAvailableTags ? (
              <EmptyState allTagsCount={allTags.length} />
            ) : (
              availableTags.map((tag) => (
                <TagButton
                  key={tag.id}
                  tag={tag}
                  onAdd={handleAddTag}
                  isLoading={isLoading}
                />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
