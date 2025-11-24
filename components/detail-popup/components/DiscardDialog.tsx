/**
 * DiscardDialog Component
 * Confirmation dialog for discarding items
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LABELS } from '../constants';
import type { DiscardDialogProps } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dialog to confirm item discard action
 */
export function DiscardDialog({ isOpen, onClose, onConfirm }: DiscardDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{LABELS.DISCARD_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>
            {LABELS.DISCARD_DESCRIPTION}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{LABELS.DISCARD_CANCEL}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {LABELS.DISCARD_CONFIRM}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
