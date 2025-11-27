'use client';

/**
 * TagFilter - Filtro de Tags
 * Permite filtrar entidades por tags com preview visual
 */

import { useState, useCallback, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// TagBadge removido - usar Badge diretamente
import { Badge } from '@/components/ui/badge';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TAG_COLOR = '#3b82f6';
const MAX_TAGS_HEIGHT = 300;
const POPOVER_WIDTH = 300;

const LABELS = {
  FILTER_BY_TAGS: 'Filtrar por Tags',
  CLEAR: 'Limpar',
  NO_TAGS_AVAILABLE: 'Nenhuma tag disponível. Crie tags no Gerenciador de Tags.',
} as const;

const BADGE_SIZE = 'sm' as const;

// ============================================================================
// TYPES
// ============================================================================

interface TagFilterProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
}

interface Tag {
  id: number;
  name: string;
  color: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
}

function getTagColor(color: string | null): string {
  return color || DEFAULT_TAG_COLOR;
}

function filterSelectedTags(allTags: Tag[], selectedIds: number[]): Tag[] {
  return allTags.filter((tag) => selectedIds.includes(tag.id));
}

// ============================================================================
// COMPONENT
// ============================================================================

function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: allTags = [] } = trpc.tags.list.useQuery();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedTagObjects = useMemo(
    () => filterSelectedTags(allTags, selectedTags),
    [allTags, selectedTags]
  );

  const hasSelectedTags = useMemo(
    () => selectedTags.length > 0,
    [selectedTags.length]
  );

  const hasAvailableTags = useMemo(
    () => allTags.length > 0,
    [allTags.length]
  );

  const selectedCount = useMemo(
    () => selectedTags.length,
    [selectedTags.length]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleTag = useCallback(
    (tagId: number) => {
      const newTags = toggleArrayItem(selectedTags, tagId);
      onTagsChange(newTags);
    },
    [selectedTags, onTagsChange]
  );

  const clearFilters = useCallback(() => {
    onTagsChange([]);
    setIsOpen(false);
  }, [onTagsChange]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSelectedBadge = useCallback(
    () => (
      <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
        {selectedCount}
      </Badge>
    ),
    [selectedCount]
  );

  const renderClearButton = useCallback(
    () => (
      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="h-6 px-2 text-xs"
      >
        {LABELS.CLEAR}
      </Button>
    ),
    [clearFilters]
  );

  const renderEmptyState = useCallback(
    () => (
      <p className="text-xs text-muted-foreground text-center py-4">
        {LABELS.NO_TAGS_AVAILABLE}
      </p>
    ),
    []
  );

  const renderTagItem = useCallback(
    (tag: Tag) => {
      const isSelected = selectedTags.includes(tag.id);
      const tagColor = getTagColor(tag.color);

      return (
        <button
          key={tag.id}
          onClick={() => toggleTag(tag.id)}
          className={`w-full flex items-center justify-between p-2 rounded transition-colors ${
            isSelected
              ? 'bg-accent border border-border'
              : 'hover:bg-accent/50 border border-transparent'
          }`}
        >
          <Badge style={{ backgroundColor: tagColor }} className="text-white text-xs">
            {tag.name}
          </Badge>
          {isSelected && (
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <X className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>
      );
    },
    [selectedTags, toggleTag]
  );

  const renderTagsList = useCallback(
    () => (
      <div className={`space-y-1 max-h-[${MAX_TAGS_HEIGHT}px] overflow-y-auto`}>
        {hasAvailableTags ? (
          allTags.map(renderTagItem)
        ) : (
          renderEmptyState()
        )}
      </div>
    ),
    [hasAvailableTags, allTags, renderTagItem, renderEmptyState]
  );

  const renderSelectedTagsPreview = useCallback(
    () => (
      <div className="flex flex-wrap gap-1.5">
        {selectedTagObjects.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
            className="text-white text-xs"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    ),
    [selectedTagObjects, toggleTag]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            {LABELS.FILTER_BY_TAGS}
            {hasSelectedTags && renderSelectedBadge()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-[${POPOVER_WIDTH}px] p-3`} align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {LABELS.FILTER_BY_TAGS}
              </label>
              {hasSelectedTags && renderClearButton()}
            </div>

            {renderTagsList()}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected tags preview */}
      {hasSelectedTags && renderSelectedTagsPreview()}
    </div>
  );
}

export default TagFilter;
