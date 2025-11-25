'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { APP_LOGO, APP_TITLE } from '@/const';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================================
// CONSTANTS
// ============================================================================

const DIMENSIONS = {
  DIALOG_WIDTH: 'w-[400px]',
  ICON_CONTAINER: 'w-16 h-16',
  ICON_IMAGE: 'w-10 h-10',
  BUTTON_HEIGHT: 'h-10',
} as const;

const COLORS = {
  BACKGROUND: 'bg-[#f8f8f7]',
  ICON_BG: 'bg-white',
  TITLE: 'text-[#34322d]',
  DESCRIPTION: 'text-[#858481]',
  BUTTON_BG: 'bg-[#1a1a19]',
  BUTTON_HOVER: 'hover:bg-[#1a1a19]/90',
  BUTTON_TEXT: 'text-slate-900',
} as const;

const BORDER_RADIUS = {
  DIALOG: 'rounded-[20px]',
  ICON_CONTAINER: 'rounded-xl',
  ICON_IMAGE: 'rounded-md',
  BUTTON: 'rounded-[10px]',
} as const;

const CLASSES = {
  DIALOG_CONTENT: 'py-5 shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center',
  HEADER_CONTAINER: 'flex flex-col items-center gap-2 p-5 pt-12',
  ICON_CONTAINER: 'border border-[rgba(0,0,0,0.08)] flex items-center justify-center',
  TITLE: 'text-xl font-semibold leading-[26px] tracking-[-0.44px]',
  DESCRIPTION: 'text-sm leading-5 tracking-[-0.154px]',
  FOOTER: 'px-5 py-5',
  BUTTON: 'w-full text-sm font-medium leading-5 tracking-[-0.154px]',
} as const;

const LABELS = {
  ICON_ALT: 'App icon',
  DESCRIPTION: 'Please login with Manus to continue',
  BUTTON: 'Login with Manus',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface ManusDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDialogContentClasses(): string {
  return `${CLASSES.DIALOG_CONTENT} ${COLORS.BACKGROUND} ${BORDER_RADIUS.DIALOG} ${DIMENSIONS.DIALOG_WIDTH}`;
}

function getIconContainerClasses(): string {
  return `${DIMENSIONS.ICON_CONTAINER} ${COLORS.ICON_BG} ${BORDER_RADIUS.ICON_CONTAINER} ${CLASSES.ICON_CONTAINER}`;
}

function getTitleClasses(): string {
  return `${CLASSES.TITLE} ${COLORS.TITLE}`;
}

function getDescriptionClasses(): string {
  return `${CLASSES.DESCRIPTION} ${COLORS.DESCRIPTION}`;
}

function getButtonClasses(): string {
  return `${CLASSES.BUTTON} ${DIMENSIONS.BUTTON_HEIGHT} ${COLORS.BUTTON_BG} ${COLORS.BUTTON_HOVER} ${COLORS.BUTTON_TEXT} ${BORDER_RADIUS.BUTTON}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ManusDialog
 * 
 * Dialog de autenticação com Manus.
 * Exibe logo, título e botão de login.
 * Suporta controle de estado interno ou externo.
 * 
 * @example
 * ```tsx
 * <ManusDialog
 *   open={isOpen}
 *   onLogin={handleLogin}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export function ManusDialog({
  title = APP_TITLE,
  logo = APP_LOGO,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: ManusDialogProps) {
  // State
  const [internalOpen, setInternalOpen] = useState(open);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isControlled = useMemo(() => !!onOpenChange, [onOpenChange]);

  const currentOpen = useMemo(
    () => (isControlled ? open : internalOpen),
    [isControlled, open, internalOpen]
  );

  const dialogContentClasses = useMemo(() => getDialogContentClasses(), []);
  const iconContainerClasses = useMemo(() => getIconContainerClasses(), []);
  const titleClasses = useMemo(() => getTitleClasses(), []);
  const descriptionClasses = useMemo(() => getDescriptionClasses(), []);
  const buttonClasses = useMemo(() => getButtonClasses(), []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }

      if (!nextOpen) {
        onClose?.();
      }
    },
    [isControlled, onOpenChange, onClose]
  );

  const handleLogin = useCallback(() => {
    onLogin();
  }, [onLogin]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (!isControlled && internalOpen !== open) {
      setInternalOpen(open);
    }
  }, [open, isControlled, internalOpen]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={dialogContentClasses}>
        <div className={CLASSES.HEADER_CONTAINER}>
          <div className={iconContainerClasses}>
            <img
              src={logo}
              alt={LABELS.ICON_ALT}
              className={`${DIMENSIONS.ICON_IMAGE} ${BORDER_RADIUS.ICON_IMAGE}`}
            />
          </div>

          <DialogTitle className={titleClasses}>{title}</DialogTitle>

          <DialogDescription className={descriptionClasses}>
            {LABELS.DESCRIPTION}
          </DialogDescription>
        </div>

        <DialogFooter className={CLASSES.FOOTER}>
          <Button onClick={handleLogin} className={buttonClasses}>
            {LABELS.BUTTON}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
