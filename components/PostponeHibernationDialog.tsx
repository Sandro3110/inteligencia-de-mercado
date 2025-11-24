'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const POSTPONE_OPTIONS = [
  { days: 7, label: '7 dias', description: 'Adiar por uma semana' },
  { days: 15, label: '15 dias', description: 'Adiar por duas semanas' },
  { days: 30, label: '30 dias', description: 'Adiar por um mês' },
] as const;

const DEFAULT_DAYS = 30;

const LABELS = {
  TITLE: 'Adiar Hibernação',
  POSTPONE_BY: 'Adiar por:',
  NEW_DATE_LABEL: 'Nova data prevista de hibernação:',
  CANCEL: 'Cancelar',
  CONFIRM: 'Confirmar Adiamento',
  LOADING: 'Adiando...',
} as const;

const MESSAGES = {
  DESCRIPTION: (projectName: string) =>
    `Escolha por quanto tempo deseja adiar a hibernação do projeto `,
  PROJECT_ACTIVE: 'O projeto será marcado como ativo novamente e o aviso será removido',
  WARNING:
    'Após o adiamento, o projeto voltará a ser monitorado. Se não houver atividade, um novo aviso será enviado 7 dias antes da nova data de hibernação.',
} as const;

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
  MEDIUM: 'h-5 w-5',
} as const;

const COLORS = {
  BLUE: {
    TEXT: 'text-blue-600',
    TEXT_DARK: 'text-blue-700',
    TEXT_DARKER: 'text-blue-900',
    BG: 'bg-blue-50',
    BORDER: 'border-blue-200',
  },
  ORANGE: {
    TEXT: 'text-orange-600',
    TEXT_DARK: 'text-orange-700',
    BG: 'bg-orange-50',
    BORDER: 'border-orange-200',
  },
} as const;

const DATE_FORMAT = "dd 'de' MMMM 'de' yyyy";

// ============================================================================
// TYPES
// ============================================================================

interface PostponeHibernationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: (days: number) => void;
  isLoading?: boolean;
}

interface PostponeOption {
  days: number;
  label: string;
  description: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateNewDate(days: number): string {
  return format(addDays(new Date(), days), DATE_FORMAT, {
    locale: ptBR,
  });
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PostponeOption({
  option,
  isSelected,
  onSelect,
}: {
  option: PostponeOption;
  isSelected: boolean;
  onSelect: (days: number) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(option.days);
  }, [onSelect, option.days]);

  return (
    <div
      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <RadioGroupItem value={option.days.toString()} id={`option-${option.days}`} />
      <div className="flex-1">
        <Label htmlFor={`option-${option.days}`} className="font-medium cursor-pointer">
          {option.label}
        </Label>
        <p className="text-sm text-muted-foreground">{option.description}</p>
      </div>
    </div>
  );
}

function NewDatePreview({ newDate }: { newDate: string }) {
  return (
    <div className={`rounded-lg ${COLORS.BLUE.BG} border ${COLORS.BLUE.BORDER} p-4`}>
      <div className="flex items-start gap-3">
        <Calendar className={`${ICON_SIZES.MEDIUM} ${COLORS.BLUE.TEXT} mt-0.5`} />
        <div>
          <p className={`text-sm font-medium ${COLORS.BLUE.TEXT_DARKER}`}>
            {LABELS.NEW_DATE_LABEL}
          </p>
          <p className={`text-lg font-bold ${COLORS.BLUE.TEXT_DARK} mt-1`}>{newDate}</p>
          <p className={`text-xs ${COLORS.BLUE.TEXT} mt-1`}>
            {MESSAGES.PROJECT_ACTIVE}
          </p>
        </div>
      </div>
    </div>
  );
}

function WarningMessage() {
  return (
    <div
      className={`rounded-lg ${COLORS.ORANGE.BG} border ${COLORS.ORANGE.BORDER} p-3`}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className={`${ICON_SIZES.SMALL} ${COLORS.ORANGE.TEXT} mt-0.5`} />
        <p className={`text-xs ${COLORS.ORANGE.TEXT_DARK}`}>{MESSAGES.WARNING}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PostponeHibernationDialog({
  open,
  onOpenChange,
  projectName,
  onConfirm,
  isLoading = false,
}: PostponeHibernationDialogProps) {
  // State
  const [selectedDays, setSelectedDays] = useState<number>(DEFAULT_DAYS);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleConfirm = useCallback(() => {
    onConfirm(selectedDays);
  }, [onConfirm, selectedDays]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleValueChange = useCallback((value: string) => {
    setSelectedDays(Number(value));
  }, []);

  const handleOptionSelect = useCallback((days: number) => {
    setSelectedDays(days);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const newHibernationDate = useMemo(
    () => calculateNewDate(selectedDays),
    [selectedDays]
  );

  const selectedValue = useMemo(() => selectedDays.toString(), [selectedDays]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDialogHeader = useCallback(
    () => (
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Clock className={`${ICON_SIZES.MEDIUM} ${COLORS.BLUE.TEXT}`} />
          {LABELS.TITLE}
        </DialogTitle>
        <DialogDescription>
          {MESSAGES.DESCRIPTION(projectName)}
          <strong>{projectName}</strong>
        </DialogDescription>
      </DialogHeader>
    ),
    [projectName]
  );

  const renderOptions = useCallback(
    () => (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{LABELS.POSTPONE_BY}</Label>
        <RadioGroup value={selectedValue} onValueChange={handleValueChange}>
          {POSTPONE_OPTIONS.map((option) => (
            <PostponeOption
              key={option.days}
              option={option}
              isSelected={selectedDays === option.days}
              onSelect={handleOptionSelect}
            />
          ))}
        </RadioGroup>
      </div>
    ),
    [selectedValue, selectedDays, handleValueChange, handleOptionSelect]
  );

  const renderFooter = useCallback(
    () => (
      <DialogFooter>
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          {LABELS.CANCEL}
        </Button>
        <Button onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Clock className={`${ICON_SIZES.SMALL} mr-2 animate-spin`} />
              {LABELS.LOADING}
            </>
          ) : (
            <>
              <Calendar className={`${ICON_SIZES.SMALL} mr-2`} />
              {LABELS.CONFIRM}
            </>
          )}
        </Button>
      </DialogFooter>
    ),
    [handleCancel, handleConfirm, isLoading]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {renderDialogHeader()}

        <div className="space-y-4 py-4">
          {renderOptions()}
          <NewDatePreview newDate={newHibernationDate} />
          <WarningMessage />
        </div>

        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}
