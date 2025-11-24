/**
 * Types for DetailPopup Component
 * Centralized type definitions for the detail popup system
 */

// ============================================================================
// ENUMS AND LITERALS
// ============================================================================

export type EntityType = 'cliente' | 'concorrente' | 'lead';

export type ValidationStatus = 'rich' | 'needs_adjustment' | 'discarded' | 'pending';

export type LeadStage = 'novo' | 'em_contato' | 'negociacao' | 'fechado' | 'perdido';

export type ChangeType = 'created' | 'updated' | 'enriched' | 'validated';

// ============================================================================
// ENTITY INTERFACES
// ============================================================================

export interface BaseEntity {
  id: number;
  nome?: string;
  empresa?: string;
  validationStatus?: ValidationStatus;
  qualidadeScore?: number;
  segmentacao?: string;
  segmentacaoB2bB2c?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cliente extends BaseEntity {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
  latitude?: number;
  longitude?: number;
  setor?: string;
  porte?: string;
  faturamento?: number;
  numeroFuncionarios?: number;
  descricao?: string;
  observacoes?: string;
  tags?: string[];
}

export interface Concorrente extends BaseEntity {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  website?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  setor?: string;
  porte?: string;
  descricao?: string;
}

export interface Lead extends BaseEntity {
  leadStage?: LeadStage;
  email?: string;
  telefone?: string;
  celular?: string;
  cargo?: string;
  empresa?: string;
  website?: string;
  linkedin?: string;
  cidade?: string;
  estado?: string;
  origem?: string;
  interesse?: string;
  observacoes?: string;
}

export type Entity = Cliente | Concorrente | Lead;

// ============================================================================
// HISTORY INTERFACES
// ============================================================================

export interface HistoryEntry {
  id: number;
  changeType: ChangeType;
  changedBy?: string;
  changedAt: Date;
  changes?: Record<string, { old: unknown; new: unknown }>;
  notes?: string;
}

// ============================================================================
// PRODUCT INTERFACES
// ============================================================================

export interface Product {
  id: number;
  clienteId: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco?: number;
  unidade?: string;
  ativo: boolean;
  createdAt: Date;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface DetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: Entity;
  type: EntityType;
}

export interface DetailPopupHeaderProps {
  item: Entity;
  type: EntityType;
  onClose: () => void;
  produtos: Product[];
}

export interface DetailPopupFooterProps {
  item: Entity;
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
  item: Entity;
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
  item: Entity;
  type: EntityType;
}

export interface ContactSectionProps {
  item: Entity;
}

export interface LocationSectionProps {
  item: Entity;
}

export interface ProductsSectionProps {
  item: Entity;
}

export interface FinancialSectionProps {
  item: Cliente;
}

export interface ValidationSectionProps {
  item: Entity;
}

export interface QualitySectionProps {
  item: Entity;
}

export interface MetadataSectionProps {
  item: Entity;
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
