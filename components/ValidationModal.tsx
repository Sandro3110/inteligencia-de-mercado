'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, AlertCircle, XCircle, LucideIcon } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const DIALOG_CONFIG = {
  MAX_WIDTH: 'sm:max-w-[500px]',
} as const;

const LABELS = {
  TITLE: 'Validar Item',
  DESCRIPTION_PREFIX: 'Valide e adicione observações para: ',
  STATUS_LABEL: 'Status de Validação',
  NOTES_LABEL: 'Observações',
  NOTES_PLACEHOLDER: 'Adicione observações sobre este item...',
  CANCEL_BUTTON: 'Cancelar',
  SUBMIT_BUTTON: 'Salvar Validação',
} as const;

const STATUS_OPTIONS = [
  {
    value: 'rich',
    id: 'rich',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    title: 'Rico',
    description: 'Dados completos e validados',
  },
  {
    value: 'needs_adjustment',
    id: 'needs_adjustment',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    title: 'Precisa Ajuste',
    description: 'Requer correções ou complementos',
  },
  {
    value: 'discarded',
    id: 'discarded',
    icon: XCircle,
    iconColor: 'text-red-600',
    title: 'Descartado',
    description: 'Dados incorretos ou irrelevantes',
  },
] as const;

const DEFAULT_VALUES = {
  STATUS: 'pending',
  NOTES: '',
} as const;

const TEXTAREA_CONFIG = {
  ROWS: 4,
} as const;

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
} as const;

const CLASSES = {
  SPACING: 'space-y-6 py-4',
  STATUS_CONTAINER: 'space-y-3',
  NOTES_CONTAINER: 'space-y-2',
  RADIO_ITEM:
    'flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors',
  RADIO_LABEL: 'flex items-center gap-2 cursor-pointer flex-1',
  DESCRIPTION_TEXT: 'text-xs text-muted-foreground',
  TITLE_TEXT: 'font-medium',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: string, notes: string) => void;
  itemName: string;
  currentStatus?: string;
  currentNotes?: string;
}

interface StatusOption {
  value: string;
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
}

interface RadioOptionProps {
  option: StatusOption;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function RadioOption({ option }: RadioOptionProps) {
  const Icon = option.icon;

  return (
    <div className={CLASSES.RADIO_ITEM}>
      <RadioGroupItem value={option.value} id={option.id} />
      <Label htmlFor={option.id} className={CLASSES.RADIO_LABEL}>
        <Icon className={`${ICON_SIZES.SMALL} ${option.iconColor}`} />
        <div>
          <p className={CLASSES.TITLE_TEXT}>{option.title}</p>
          <p className={CLASSES.DESCRIPTION_TEXT}>{option.description}</p>
        </div>
      </Label>
    </div>
  );
}

function StatusSection({
  status,
  onStatusChange,
}: {
  status: string;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className={CLASSES.STATUS_CONTAINER}>
      <Label>{LABELS.STATUS_LABEL}</Label>
      <RadioGroup value={status} onValueChange={onStatusChange}>
        {STATUS_OPTIONS.map((option) => (
          <RadioOption key={option.value} option={option} />
        ))}
      </RadioGroup>
    </div>
  );
}

function NotesSection({
  notes,
  onNotesChange,
}: {
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onNotesChange(e.target.value);
    },
    [onNotesChange]
  );

  return (
    <div className={CLASSES.NOTES_CONTAINER}>
      <Label htmlFor="notes">{LABELS.NOTES_LABEL}</Label>
      <Textarea
        id="notes"
        placeholder={LABELS.NOTES_PLACEHOLDER}
        value={notes}
        onChange={handleChange}
        rows={TEXTAREA_CONFIG.ROWS}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ValidationModal({
  open,
  onOpenChange,
  onSubmit,
  itemName,
  currentStatus = DEFAULT_VALUES.STATUS,
  currentNotes = DEFAULT_VALUES.NOTES,
}: ValidationModalProps) {
  // State
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = useCallback(() => {
    onSubmit(status, notes);
    onOpenChange(false);
  }, [status, notes, onSubmit, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
  }, []);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONFIG.MAX_WIDTH}>
        <DialogHeader>
          <DialogTitle>{LABELS.TITLE}</DialogTitle>
          <DialogDescription>
            {LABELS.DESCRIPTION_PREFIX}
            <strong>{itemName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className={CLASSES.SPACING}>
          <StatusSection status={status} onStatusChange={handleStatusChange} />
          <NotesSection notes={notes} onNotesChange={handleNotesChange} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {LABELS.CANCEL_BUTTON}
          </Button>
          <Button onClick={handleSubmit}>{LABELS.SUBMIT_BUTTON}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ValidationModal;
