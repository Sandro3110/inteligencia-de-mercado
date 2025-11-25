/**
 * DetailPopupHeader Component
 * Header section of the detail popup with title, badges, and close button
 */

'use client';

import { useMemo } from 'react';
import { Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLASSES, ICON_SIZES } from '../constants';
import {
  getStatusBadge,
  getLeadStageBadge,
  getQualityScoreBadge,
  getProductsCountBadge,
  getSegmentationBadge,
} from '../utils/badges';
import { getTypeLabel } from '../utils/formatters';
import type { DetailPopupHeaderProps, Lead } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Header component for DetailPopup
 * Displays entity name, type, status, and relevant badges
 */
export function DetailPopupHeader({
  item,
  type,
  onClose,
  produtos,
}: DetailPopupHeaderProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const entityName = useMemo(
    () => item.nome || (item as { empresa?: string }).empresa || 'Sem nome',
    [item]
  );

  const typeLabel = useMemo(() => getTypeLabel(type), [type]);

  const showProductsBadge = useMemo(
    () => type === 'cliente' && produtos.length > 0,
    [type, produtos.length]
  );

  const leadStage = useMemo(
    () => (type === 'lead' ? (item as Lead).leadStage : undefined),
    [type, item]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.HEADER}>
      <div className="flex items-start justify-between gap-4">
        {/* Left side: Entity info and badges */}
        <div className="flex-1">
          {/* Entity name and type */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Building2 className={`${ICON_SIZES.XLARGE} text-blue-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {entityName}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {typeLabel}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className={CLASSES.BADGE_CONTAINER}>
            {getStatusBadge((item as { validationStatus?: string | null }).validationStatus)}
            {getSegmentationBadge((item as { segmentacaoB2bB2c?: string | null }).segmentacaoB2bB2c)}
            {getSegmentationBadge((item as { segmentacao?: string | null }).segmentacao)}
            {leadStage && getLeadStageBadge(leadStage)}
            {getQualityScoreBadge((item as { qualidadeScore?: number | null }).qualidadeScore)}
            {showProductsBadge && getProductsCountBadge(produtos.length)}
          </div>
        </div>

        {/* Right side: Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-white/50"
          aria-label="Fechar"
        >
          <X className={ICON_SIZES.LARGE} />
        </Button>
      </div>
    </div>
  );
}
