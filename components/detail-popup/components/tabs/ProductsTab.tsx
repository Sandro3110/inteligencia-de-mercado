/**
 * ProductsTab Component
 * Displays products associated with a cliente
 */

'use client';

import { useMemo } from 'react';
import { ShoppingBag, Package, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { TABS_CONFIG, LABELS, ICON_SIZES } from '../../constants';
import { truncateText } from '../../utils/formatters';
import type { ProductsTabProps, Product } from '../../types';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Empty state when no products are available
 */
function EmptyProductsState() {
  return (
    <div className="text-center py-12">
      <ShoppingBag className={`${ICON_SIZES.XLARGE} w-12 h-12 text-slate-300 mx-auto mb-3`} />
      <p className="text-slate-500">{LABELS.NO_PRODUCTS}</p>
    </div>
  );
}

/**
 * Single product card
 */
interface ProductCardProps {
  produto: Product & { mercadoNome?: string };
}

function ProductCard({ produto }: ProductCardProps) {
  const truncatedDescription = useMemo(
    () => truncateText(produto.descricao, 100),
    [produto.descricao]
  );

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-slate-900">
          {produto.nome}
        </h4>
        <Package className={`${ICON_SIZES.MEDIUM} text-blue-600 flex-shrink-0`} />
      </div>

      {/* Description */}
      {produto.descricao && (
        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
          {truncatedDescription}
        </p>
      )}

      {/* Category badge */}
      {produto.categoria && (
        <Badge variant="outline" className="text-xs mb-2">
          {produto.categoria}
        </Badge>
      )}

      {/* Market info */}
      {produto.mercadoNome && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
          <Building2 className={`${ICON_SIZES.SMALL} text-slate-500`} />
          <span className="text-xs text-slate-600 truncate">
            {produto.mercadoNome}
          </span>
          <ExternalLink className={`${ICON_SIZES.SMALL} text-slate-400 ml-auto flex-shrink-0`} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Tab component displaying products for a cliente
 */
export function ProductsTab({ produtos }: ProductsTabProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasProducts = useMemo(() => produtos.length > 0, [produtos.length]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <TabsContent value={TABS_CONFIG.VALUES.PRODUCTS} className="p-6 mt-0">
      {!hasProducts ? (
        <EmptyProductsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto as Product & { mercadoNome?: string }} />
          ))}
        </div>
      )}
    </TabsContent>
  );
}
