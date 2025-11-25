/**
 * Types for DetailPopup Component
 * Uses Drizzle schema types for consistency
 */

import type {
  Cliente,
  Concorrente,
  Lead,
  ClienteHistory,
  ConcorrenteHistory,
  LeadHistory,
  Produto,
} from '@/drizzle/schema';

// ============================================================================
// RE-EXPORT DRIZZLE TYPES
// ============================================================================

export type { Cliente, Concorrente, Lead };

// ============================================================================
// ENTITY TYPE UNION
// ============================================================================

export type Entity = Cliente | Concorrente | Lead;

export type PartialEntity = Partial<Cliente> | Partial<Concorrente> | Partial<Lead>;

export type EntityType = 'cliente' | 'concorrente' | 'lead';

// ============================================================================
// HISTORY TYPES
// ============================================================================

export type HistoryEntry = ClienteHistory | ConcorrenteHistory | LeadHistory;

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type Product = Produto;

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface DetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: PartialEntity;
  type: EntityType;
}

export interface DetailPopupHeaderProps {
  item: PartialEntity;
  type: EntityType;
  onClose: () => void;
  produtos: Product[];
}

export interface DetailPopupFooterProps {
  item: PartialEntity;
  type: EntityType;
  onValidate: () => void;
  onDiscard: () => void;
  isValidating: boolean;
  isDiscarding: boolean;
}

export interface DiscardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface DetailsTabProps {
  item: PartialEntity;
  type: EntityType;
  produtos: Product[];
}

export interface HistoryTabProps {
  history: HistoryEntry[];
}

export interface ProductsTabProps {
  produtos: Product[];
}

// ============================================================================
// SECTION PROPS INTERFACES
// ============================================================================

export interface BasicInfoSectionProps {
  item: PartialEntity;
  type: EntityType;
}

export interface ContactSectionProps {
  item: PartialEntity;
}

export interface LocationSectionProps {
  item: PartialEntity;
}

export interface ProductsSectionProps {
  item: PartialEntity;
}

export interface FinancialSectionProps {
  item: Partial<Cliente>;
}

export interface ValidationSectionProps {
  item: PartialEntity;
}

export interface QualitySectionProps {
  item: PartialEntity;
}

export interface MetadataSectionProps {
  item: PartialEntity;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseDetailPopupDataReturn {
  history: HistoryEntry[];
  produtos: Product[];
  isLoadingHistory: boolean;
  isLoadingProdutos: boolean;
}

export interface UseDetailPopupActionsReturn {
  handleValidate: () => void;
  handleDiscard: () => void;
  isValidating: boolean;
  isDiscarding: boolean;
}
