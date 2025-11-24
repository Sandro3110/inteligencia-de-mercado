'use client';

/**
 * TagManager - Gerenciador de Tags
 * Criação, edição e remoção de tags do sistema
 */

import { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { TagBadge } from './TagBadge';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
] as const;

const DEFAULT_COLOR = PRESET_COLORS[0];

const INPUT_LIMITS = {
  MAX_LENGTH: 50,
} as const;

const LAYOUT = {
  MAX_HEIGHT: '300px',
  DIALOG_MAX_WIDTH: 'sm:max-w-[500px]',
  COLOR_BUTTON_SIZE: 'w-8 h-8',
} as const;

const LABELS = {
  TRIGGER_BUTTON: 'Gerenciar Tags',
  DIALOG_TITLE: 'Gerenciar Tags',
  NEW_TAG: 'Nova Tag',
  EXISTING_TAGS: (count: number) => `Tags Existentes (${count})`,
  PLACEHOLDER: 'Nome da tag',
  EMPTY_STATE: 'Nenhuma tag criada ainda',
  COLOR_ARIA: (color: string) => `Selecionar cor ${color}`,
} as const;

const TOAST_MESSAGES = {
  CREATE_SUCCESS: 'Tag criada com sucesso!',
  CREATE_ERROR: (message: string) => `Erro ao criar tag: ${message}`,
  DELETE_SUCCESS: 'Tag removida com sucesso!',
  DELETE_ERROR: (message: string) => `Erro ao remover tag: ${message}`,
  VALIDATION_EMPTY: 'Digite um nome para a tag',
} as const;

const CONFIRM_MESSAGES = {
  DELETE:
    'Tem certeza que deseja remover esta tag? Ela será removida de todas as entidades.',
} as const;

const KEYBOARD_KEYS = {
  ENTER: 'Enter',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Tag {
  id: number;
  name: string;
  color: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTagColor(color: string | null): string {
  return color || DEFAULT_COLOR;
}

function isColorSelected(color: string, selectedColor: string): boolean {
  return selectedColor === color;
}

function getColorButtonClasses(isSelected: boolean): string {
  return `${LAYOUT.COLOR_BUTTON_SIZE} rounded-full border-2 transition-all ${
    isSelected ? 'border-white scale-110' : 'border-transparent'
  }`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TagManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  const utils = trpc.useUtils();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: tags = [] } = trpc.tags.list.useQuery();

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      setNewTagName('');
      toast.success(TOAST_MESSAGES.CREATE_SUCCESS);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.CREATE_ERROR(error.message));
    },
  });

  const deleteMutation = trpc.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.DELETE_ERROR(error.message));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const trimmedTagName = useMemo(() => newTagName.trim(), [newTagName]);

  const canCreate = useMemo(
    () => !createMutation.isPending && !!trimmedTagName,
    [createMutation.isPending, trimmedTagName]
  );

  const tagsCount = useMemo(() => tags.length, [tags.length]);

  const hasTags = useMemo(() => tagsCount > 0, [tagsCount]);

  const existingTagsLabel = useMemo(
    () => LABELS.EXISTING_TAGS(tagsCount),
    [tagsCount]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreate = useCallback(() => {
    if (!trimmedTagName) {
      toast.error(TOAST_MESSAGES.VALIDATION_EMPTY);
      return;
    }

    createMutation.mutate({
      name: trimmedTagName,
      color: selectedColor,
    });
  }, [trimmedTagName, selectedColor, createMutation]);

  const handleDelete = useCallback(
    (tagId: number) => {
      if (confirm(CONFIRM_MESSAGES.DELETE)) {
        deleteMutation.mutate(tagId);
      }
    },
    [deleteMutation]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewTagName(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEYBOARD_KEYS.ENTER) {
        handleCreate();
      }
    },
    [handleCreate]
  );

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderColorButton = useCallback(
    (color: string) => {
      const isSelected = isColorSelected(color, selectedColor);

      return (
        <button
          key={color}
          onClick={() => handleColorSelect(color)}
          className={getColorButtonClasses(isSelected)}
          style={{ backgroundColor: color }}
          aria-label={LABELS.COLOR_ARIA(color)}
        />
      );
    },
    [selectedColor, handleColorSelect]
  );

  const renderTagItem = useCallback(
    (tag: Tag) => (
      <div
        key={tag.id}
        className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
      >
        <TagBadge name={tag.name} color={getTagColor(tag.color)} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(tag.id)}
          disabled={deleteMutation.isPending}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
    [handleDelete, deleteMutation.isPending]
  );

  const renderNewTagForm = useCallback(
    () => (
      <div className="space-y-3">
        <label className="text-sm font-medium">{LABELS.NEW_TAG}</label>
        <div className="flex gap-2">
          <Input
            placeholder={LABELS.PLACEHOLDER}
            value={newTagName}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            maxLength={INPUT_LIMITS.MAX_LENGTH}
          />
          <Button onClick={handleCreate} disabled={!canCreate} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Color picker */}
        <div className="flex gap-2">{PRESET_COLORS.map(renderColorButton)}</div>
      </div>
    ),
    [
      newTagName,
      canCreate,
      handleNameChange,
      handleKeyDown,
      handleCreate,
      renderColorButton,
    ]
  );

  const renderTagsList = useCallback(
    () => (
      <div className="space-y-2">
        <label className="text-sm font-medium">{existingTagsLabel}</label>
        <div
          className="overflow-y-auto space-y-2"
          style={{ maxHeight: LAYOUT.MAX_HEIGHT }}
        >
          {hasTags ? (
            tags.map(renderTagItem)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {LABELS.EMPTY_STATE}
            </p>
          )}
        </div>
      </div>
    ),
    [existingTagsLabel, hasTags, tags, renderTagItem]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {LABELS.TRIGGER_BUTTON}
        </Button>
      </DialogTrigger>
      <DialogContent className={LAYOUT.DIALOG_MAX_WIDTH}>
        <DialogHeader>
          <DialogTitle>{LABELS.DIALOG_TITLE}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new tag */}
          {renderNewTagForm()}

          {/* List existing tags */}
          {renderTagsList()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
