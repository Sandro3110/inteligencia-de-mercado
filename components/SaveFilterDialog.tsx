'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
} as const;

const SPACING = {
  ICON_MARGIN: 'mr-2',
} as const;

const CLASSES = {
  FORM_CONTAINER: 'grid gap-4 py-4',
  FIELD_CONTAINER: 'grid gap-2',
} as const;

const LABELS = {
  TITLE: 'Salvar Filtros Atuais',
  DESCRIPTION: 'Dê um nome para esta combinação de filtros para reutilizá-la rapidamente no futuro.',
  FIELD_LABEL: 'Nome do Filtro',
  PLACEHOLDER: 'Ex: B2B SP Validados',
  CANCEL: 'Cancelar',
  SAVE: 'Salvar',
} as const;

const INPUT_ID = 'name';
const ENTER_KEY = 'Enter';

// ============================================================================
// TYPES
// ============================================================================

export interface SaveFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isValidName(name: string): boolean {
  return name.trim().length > 0;
}

function trimName(name: string): string {
  return name.trim();
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SaveFilterDialog
 * 
 * Dialog para salvar combinação de filtros com um nome personalizado.
 * Permite reutilizar filtros salvos rapidamente no futuro.
 * 
 * @example
 * ```tsx
 * <SaveFilterDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSave={handleSaveFilter}
 * />
 * ```
 */
export function SaveFilterDialog({
  open,
  onOpenChange,
  onSave,
}: SaveFilterDialogProps) {
  // State
  const [name, setName] = useState('');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isNameValid = useMemo(() => isValidName(name), [name]);

  const isSaveDisabled = useMemo(() => !isNameValid, [isNameValid]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = useCallback(() => {
    if (isNameValid) {
      const trimmedName = trimName(name);
      onSave(trimmedName);
      setName('');
      handleClose();
    }
  }, [name, isNameValid, onSave, handleClose]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === ENTER_KEY) {
        handleSave();
      }
    },
    [handleSave]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{LABELS.TITLE}</DialogTitle>
          <DialogDescription>{LABELS.DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className={CLASSES.FORM_CONTAINER}>
          <div className={CLASSES.FIELD_CONTAINER}>
            <Label htmlFor={INPUT_ID}>{LABELS.FIELD_LABEL}</Label>
            <Input
              id={INPUT_ID}
              placeholder={LABELS.PLACEHOLDER}
              value={name}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {LABELS.CANCEL}
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled}>
            <Save className={`${ICON_SIZES.SMALL} ${SPACING.ICON_MARGIN}`} />
            {LABELS.SAVE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
