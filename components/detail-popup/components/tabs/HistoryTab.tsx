/**
 * HistoryTab Component
 * Displays the history of changes for an entity
 */

'use client';

import { useMemo } from 'react';
import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { TABS_CONFIG, LABELS, ICON_SIZES } from '../../constants';
import { getChangeIcon } from '../../utils/badges';
import { formatDateTime } from '../../utils/formatters';
import type { HistoryTabProps } from '../../types';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Empty state when no history is available
 */
function EmptyHistoryState() {
  return (
    <div className="text-center py-12">
      <History className={`${ICON_SIZES.XLARGE} w-12 h-12 text-slate-300 mx-auto mb-3`} />
      <p className="text-slate-500">{LABELS.NO_HISTORY}</p>
    </div>
  );
}

/**
 * Single history entry item
 */
interface HistoryItemProps {
  change: {
    changeType?: string | null;
    field?: string | null;
    changedBy?: string | null;
    changedAt: Date | string | null;
    oldValue?: string | null;
    newValue?: string | null;
  };
  index: number;
}

function HistoryItem({ change, index }: HistoryItemProps) {
  const isCreation = useMemo(
    () => change.field === '_created',
    [change.field]
  );

  const fieldLabel = useMemo(
    () => (isCreation ? 'Criação' : `Campo: ${change.field || 'Desconhecido'}`),
    [isCreation, change.field]
  );

  const formattedDate = useMemo(
    () => formatDateTime(change.changedAt),
    [change.changedAt]
  );

  return (
    <div
      key={index}
      className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getChangeIcon(change.changeType)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {fieldLabel}
            </p>
            <p className="text-xs text-slate-500">
              {change.changedBy || 'Sistema'} • {formattedDate}
            </p>
          </div>
          {change.changeType && (
            <Badge variant="outline" className="text-xs">
              {change.changeType}
            </Badge>
          )}
        </div>

        {/* Value comparison (only for non-creation changes) */}
        {!isCreation && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {/* Old value */}
            <div className="p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700 mb-1">Anterior</p>
              <p className="text-sm text-slate-900 truncate">
                {change.oldValue || (
                  <span className="text-slate-400 italic">vazio</span>
                )}
              </p>
            </div>

            {/* New value */}
            <div className="p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 mb-1">Novo</p>
              <p className="text-sm text-slate-900 truncate">
                {change.newValue || (
                  <span className="text-slate-400 italic">vazio</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Tab component displaying entity change history
 */
export function HistoryTab({ history }: HistoryTabProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasHistory = useMemo(() => history.length > 0, [history.length]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <TabsContent value={TABS_CONFIG.VALUES.HISTORY} className="p-6 mt-0">
      {!hasHistory ? (
        <EmptyHistoryState />
      ) : (
        <div className="space-y-4">
          {history.map((change, index) => (
            <HistoryItem key={index} change={change} index={index} />
          ))}
        </div>
      )}
    </TabsContent>
  );
}
