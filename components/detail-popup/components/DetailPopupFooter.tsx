/**
 * DetailPopupFooter Component
 * Footer section with action buttons (validate, discard, close)
 */

'use client';

import { useMemo } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLASSES, ICON_SIZES, LABELS, VALIDATION } from '../constants';
import type { DetailPopupFooterProps } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Footer component for DetailPopup
 * Displays action buttons based on current validation status
 */
export function DetailPopupFooter({
  item,
  type,
  onValidate,
  onDiscard,
  isValidating,
  isDiscarding,
}: DetailPopupFooterProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const showValidateButton = useMemo(
    () => item.validationStatus !== VALIDATION.RICH_STATUS,
    [item.validationStatus]
  );

  const showDiscardButton = useMemo(
    () => item.validationStatus !== VALIDATION.DISCARDED_STATUS,
    [item.validationStatus]
  );

  const isLoading = useMemo(
    () => isValidating || isDiscarding,
    [isValidating, isDiscarding]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.FOOTER}>
      {/* Left side: Close button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled={isLoading}>
          {LABELS.CLOSE}
        </Button>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2">
        {showValidateButton && (
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onValidate}
            disabled={isLoading}
          >
            <CheckCircle2 className={`${ICON_SIZES.MEDIUM} mr-2`} />
            {LABELS.VALIDATE} como Rico
          </Button>
        )}

        {showDiscardButton && (
          <Button
            variant="destructive"
            onClick={onDiscard}
            disabled={isLoading}
          >
            <Trash2 className={`${ICON_SIZES.MEDIUM} mr-2`} />
            {LABELS.DISCARD}
          </Button>
        )}
      </div>
    </div>
  );
}
