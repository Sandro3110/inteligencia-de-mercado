/**
 * useDetailPopupActions Hook
 * Manages actions (mutations) for the DetailPopup component
 */

'use client';

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import type { EntityType, UseDetailPopupActionsReturn } from '../types';
import { TOAST_MESSAGES, VALIDATION } from '../constants';

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook to manage DetailPopup actions (validate, discard)
 * 
 * @param type - The type of entity (cliente, concorrente, or lead)
 * @param itemId - The ID of the item
 * @param onClose - Callback to close the popup
 * @returns Object containing action handlers and loading states
 */
export function useDetailPopupActions(
  type: EntityType,
  itemId: number,
  onClose: () => void
): UseDetailPopupActionsReturn {
  const utils = trpc.useUtils();

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Cliente validation mutation
  const validateClienteMutation = trpc.clientes.updateValidation.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.VALIDATION_SUCCESS);
      utils.clientes.list.invalidate();
      utils.clientes.byMercado.invalidate();
      onClose();
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.VALIDATION_ERROR);
    },
  });

  // Concorrente validation mutation
  const validateConcorrenteMutation = trpc.concorrentes.updateValidation.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.VALIDATION_SUCCESS);
      utils.concorrentes.list.invalidate();
      utils.concorrentes.byMercado.invalidate();
      onClose();
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.VALIDATION_ERROR);
    },
  });

  // Lead validation mutation
  const validateLeadMutation = trpc.leads.updateValidation.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.VALIDATION_SUCCESS);
      utils.leads.list.invalidate();
      utils.leads.byMercado.invalidate();
      onClose();
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.VALIDATION_ERROR);
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle validation action
   * Marks the item as "rich" (validated)
   */
  const handleValidate = useCallback(() => {
    switch (type) {
      case 'cliente':
        validateClienteMutation.mutate({
          id: itemId,
          status: VALIDATION.RICH_STATUS,
        });
        break;
      case 'concorrente':
        validateConcorrenteMutation.mutate({
          id: itemId,
          status: VALIDATION.RICH_STATUS,
        });
        break;
      case 'lead':
        validateLeadMutation.mutate({
          id: itemId,
          status: VALIDATION.RICH_STATUS,
        });
        break;
    }
  }, [type, itemId, validateClienteMutation, validateConcorrenteMutation, validateLeadMutation]);

  /**
   * Handle discard action
   * Marks the item as "discarded"
   */
  const handleDiscard = useCallback(() => {
    switch (type) {
      case 'cliente':
        validateClienteMutation.mutate({
          id: itemId,
          status: VALIDATION.DISCARDED_STATUS,
          notes: VALIDATION.DISCARD_NOTES,
        });
        break;
      case 'concorrente':
        validateConcorrenteMutation.mutate({
          id: itemId,
          status: VALIDATION.DISCARDED_STATUS,
          notes: VALIDATION.DISCARD_NOTES,
        });
        break;
      case 'lead':
        validateLeadMutation.mutate({
          id: itemId,
          status: VALIDATION.DISCARDED_STATUS,
          notes: VALIDATION.DISCARD_NOTES,
        });
        break;
    }
  }, [type, itemId, validateClienteMutation, validateConcorrenteMutation, validateLeadMutation]);

  // ============================================================================
  // LOADING STATES
  // ============================================================================

  const isValidating =
    validateClienteMutation.isLoading ||
    validateConcorrenteMutation.isLoading ||
    validateLeadMutation.isLoading;

  const isDiscarding =
    validateClienteMutation.isLoading ||
    validateConcorrenteMutation.isLoading ||
    validateLeadMutation.isLoading;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    handleValidate,
    handleDiscard,
    isValidating,
    isDiscarding,
  };
}
