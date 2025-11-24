/**
 * DetailPopup Component
 * Main component that displays detailed information about an entity
 * Supports three entity types: cliente, concorrente, and lead
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { FileText, History, ShoppingBag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CLASSES, TABS_CONFIG, LABELS, ICON_SIZES } from './constants';
import { useDetailPopupData } from './hooks/useDetailPopupData';
import { useDetailPopupActions } from './hooks/useDetailPopupActions';
import { DetailPopupHeader } from './components/DetailPopupHeader';
import { DetailPopupFooter } from './components/DetailPopupFooter';
import { DiscardDialog } from './components/DiscardDialog';
import { DetailsTab } from './components/tabs/DetailsTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { ProductsTab } from './components/tabs/ProductsTab';
import type { DetailPopupProps } from './types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DetailPopup - Modal component for displaying entity details
 * 
 * Features:
 * - Three tabs: Details, History, Products (for clientes)
 * - Validation and discard actions
 * - Responsive design
 * - Type-safe for three entity types
 * 
 * @example
 * ```tsx
 * <DetailPopup
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   item={selectedItem}
 *   type="cliente"
 * />
 * ```
 */
export function DetailPopup({ isOpen, onClose, item, type }: DetailPopupProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // ============================================================================
  // HOOKS
  // ============================================================================

  const { history, produtos, isLoadingHistory, isLoadingProdutos } = useDetailPopupData(
    item,
    type,
    isOpen
  );

  const { handleValidate, handleDiscard, isValidating, isDiscarding } = useDetailPopupActions(
    type,
    item?.id ?? 0,
    onClose
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle overlay click to close popup
   */
  const handleOverlayClick = useCallback(() => {
    if (!isValidating && !isDiscarding) {
      onClose();
    }
  }, [onClose, isValidating, isDiscarding]);

  /**
   * Handle discard button click
   */
  const handleDiscardClick = useCallback(() => {
    setShowDiscardDialog(true);
  }, []);

  /**
   * Handle discard confirmation
   */
  const handleDiscardConfirm = useCallback(() => {
    handleDiscard();
    setShowDiscardDialog(false);
  }, [handleDiscard]);

  /**
   * Handle discard dialog close
   */
  const handleDiscardDialogClose = useCallback(() => {
    setShowDiscardDialog(false);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Show products tab only for clientes
   */
  const showProductsTab = useMemo(() => type === 'cliente', [type]);

  // ============================================================================
  // EARLY RETURN
  // ============================================================================

  if (!isOpen || !item) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Overlay */}
      <div className={CLASSES.OVERLAY} onClick={handleOverlayClick} />

      {/* Popup Container */}
      <div className={CLASSES.POPUP_CONTAINER}>
        <div
          className={CLASSES.POPUP_CONTENT}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <DetailPopupHeader
            item={item}
            type={type}
            onClose={onClose}
            produtos={produtos}
          />

          {/* Tabs */}
          <Tabs defaultValue={TABS_CONFIG.DEFAULT_VALUE} className="flex-1">
            {/* Tab List */}
            <div className="border-b border-slate-200 px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value={TABS_CONFIG.VALUES.DETAILS} className="gap-2">
                  <FileText className={ICON_SIZES.MEDIUM} />
                  {LABELS.TAB_DETAILS}
                </TabsTrigger>
                <TabsTrigger value={TABS_CONFIG.VALUES.HISTORY} className="gap-2">
                  <History className={ICON_SIZES.MEDIUM} />
                  {LABELS.TAB_HISTORY}
                </TabsTrigger>
                {showProductsTab && (
                  <TabsTrigger value={TABS_CONFIG.VALUES.PRODUCTS} className="gap-2">
                    <ShoppingBag className={ICON_SIZES.MEDIUM} />
                    {LABELS.TAB_PRODUCTS}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 max-h-[calc(90vh-280px)]">
              <DetailsTab item={item} type={type} produtos={produtos} />
              <HistoryTab history={history} />
              {showProductsTab && <ProductsTab produtos={produtos} />}
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <DetailPopupFooter
            item={item}
            type={type}
            onValidate={handleValidate}
            onDiscard={handleDiscardClick}
            isValidating={isValidating}
            isDiscarding={isDiscarding}
          />
        </div>
      </div>

      {/* Discard Confirmation Dialog */}
      <DiscardDialog
        isOpen={showDiscardDialog}
        onClose={handleDiscardDialogClose}
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}
