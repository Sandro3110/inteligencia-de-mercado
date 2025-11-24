/**
 * Badge Utilities
 * Functions to generate badges for status, stages, and change types
 */

import { Badge } from '@/components/ui/badge';
import {
  STATUS_CONFIG,
  LEAD_STAGE_CONFIG,
  CHANGE_TYPE_CONFIG,
  ICON_SIZES,
} from '../constants';
import type { ValidationStatus, LeadStage, ChangeType } from '../types';

// ============================================================================
// STATUS BADGE
// ============================================================================

/**
 * Get status badge component
 * 
 * @param status - The validation status
 * @returns Badge component with appropriate styling and icon
 */
export function getStatusBadge(status?: string): JSX.Element {
  const validStatus = (status || 'default') as ValidationStatus | 'default';
  const config = STATUS_CONFIG[validStatus] || STATUS_CONFIG.default;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className={ICON_SIZES.SMALL} />
      {config.label}
    </Badge>
  );
}

// ============================================================================
// LEAD STAGE BADGE
// ============================================================================

/**
 * Get lead stage badge component
 * 
 * @param stage - The lead stage
 * @returns Badge component with appropriate styling
 */
export function getLeadStageBadge(stage?: string): JSX.Element | null {
  if (!stage) return null;

  const validStage = stage as LeadStage;
  const config = LEAD_STAGE_CONFIG[validStage];

  if (!config) {
    return (
      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
        {stage}
      </Badge>
    );
  }

  return <Badge className={config.color}>{config.label}</Badge>;
}

// ============================================================================
// CHANGE TYPE ICON
// ============================================================================

/**
 * Get change type icon component
 * 
 * @param changeType - The type of change
 * @returns Icon component with appropriate styling
 */
export function getChangeIcon(changeType?: string): JSX.Element {
  const validChangeType = (changeType || 'default') as ChangeType | 'default';
  const config = CHANGE_TYPE_CONFIG[validChangeType] || CHANGE_TYPE_CONFIG.default;
  const Icon = config.icon;

  return <Icon className={`${ICON_SIZES.MEDIUM} ${config.color}`} />;
}

// ============================================================================
// QUALITY SCORE BADGE
// ============================================================================

/**
 * Get quality score badge component
 * 
 * @param score - The quality score (0-100)
 * @returns Badge component with score
 */
export function getQualityScoreBadge(score?: number): JSX.Element | null {
  if (score === undefined || score === null) return null;

  return (
    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
      Score: {score}%
    </Badge>
  );
}

// ============================================================================
// PRODUCTS COUNT BADGE
// ============================================================================

/**
 * Get products count badge component
 * 
 * @param count - The number of products
 * @returns Badge component with product count
 */
export function getProductsCountBadge(count: number): JSX.Element | null {
  if (count === 0) return null;

  return (
    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
      {count} produto{count > 1 ? 's' : ''}
    </Badge>
  );
}

// ============================================================================
// SEGMENTATION BADGE
// ============================================================================

/**
 * Get segmentation badge component
 * 
 * @param segmentation - The segmentation value
 * @returns Badge component with segmentation
 */
export function getSegmentationBadge(segmentation?: string): JSX.Element | null {
  if (!segmentation) return null;

  return (
    <Badge variant="outline" className="bg-white">
      {segmentation}
    </Badge>
  );
}
