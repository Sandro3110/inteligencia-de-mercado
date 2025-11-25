/**
 * useDetailPopupData Hook
 * Manages data fetching for the DetailPopup component
 */

'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import type {
  Entity,
  PartialEntity,
  EntityType,
  HistoryEntry,
  Product,
  UseDetailPopupDataReturn,
} from '../types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the appropriate history based on entity type
 */
function getCurrentHistory(
  type: EntityType,
  clienteHistory: HistoryEntry[],
  concorrenteHistory: HistoryEntry[],
  leadHistory: HistoryEntry[]
): HistoryEntry[] {
  switch (type) {
    case 'cliente':
      return clienteHistory;
    case 'concorrente':
      return concorrenteHistory;
    case 'lead':
      return leadHistory;
    default:
      return [];
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook to fetch and manage DetailPopup data
 * 
 * @param item - The entity item to fetch data for
 * @param type - The type of entity (cliente, concorrente, or lead)
 * @param isOpen - Whether the popup is open
 * @returns Object containing history, produtos, and loading states
 */
export function useDetailPopupData(
  item: Entity | PartialEntity | null,
  type: EntityType,
  isOpen: boolean
): UseDetailPopupDataReturn {
  // ============================================================================
  // QUERIES
  // ============================================================================

  // Cliente history
  const {
    data: clienteHistory = [],
    isLoading: isLoadingClienteHistory,
  } = trpc.clientes.history.useQuery(
    { id: item?.id ?? 0 },
    { enabled: isOpen && type === 'cliente' && !!item?.id }
  );

  // Concorrente history
  const {
    data: concorrenteHistory = [],
    isLoading: isLoadingConcorrenteHistory,
  } = trpc.concorrentes.history.useQuery(
    { id: item?.id ?? 0 },
    { enabled: isOpen && type === 'concorrente' && !!item?.id }
  );

  // Lead history
  const {
    data: leadHistory = [],
    isLoading: isLoadingLeadHistory,
  } = trpc.leads.history.useQuery(
    { id: item?.id ?? 0 },
    { enabled: isOpen && type === 'lead' && !!item?.id }
  );

  // Produtos (only for clientes)
  const {
    data: produtos = [],
    isLoading: isLoadingProdutos,
  } = trpc.clientes.produtos.useQuery(
    { id: item?.id ?? 0 },
    { enabled: isOpen && type === 'cliente' && !!item?.id }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Get the appropriate history based on entity type
   */
  const history = useMemo(
    () => getCurrentHistory(type, clienteHistory, concorrenteHistory, leadHistory),
    [type, clienteHistory, concorrenteHistory, leadHistory]
  );

  /**
   * Determine if history is loading based on entity type
   */
  const isLoadingHistory = useMemo(() => {
    switch (type) {
      case 'cliente':
        return isLoadingClienteHistory;
      case 'concorrente':
        return isLoadingConcorrenteHistory;
      case 'lead':
        return isLoadingLeadHistory;
      default:
        return false;
    }
  }, [type, isLoadingClienteHistory, isLoadingConcorrenteHistory, isLoadingLeadHistory]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    history,
    produtos,
    isLoadingHistory,
    isLoadingProdutos,
  };
}
