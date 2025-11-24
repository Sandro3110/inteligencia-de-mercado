/**
 * Constants for DetailPopup Component
 * Centralized constants for styling, labels, and configurations
 */

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Edit,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { ValidationStatus, LeadStage, ChangeType } from './types';

// ============================================================================
// ICON SIZES
// ============================================================================

export const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  MEDIUM: 'w-4 h-4',
  LARGE: 'w-5 h-5',
  XLARGE: 'w-6 h-6',
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  SECTION_GAP: 'space-y-6',
  GRID_GAP: 'gap-4',
  BADGE_GAP: 'gap-2',
  ICON_MARGIN: 'gap-1',
} as const;

// ============================================================================
// CLASSES
// ============================================================================

export const CLASSES = {
  OVERLAY: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200',
  POPUP_CONTAINER: 'fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none',
  POPUP_CONTENT: 'bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200',
  HEADER: 'bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200 p-6',
  FOOTER: 'border-t border-slate-200 bg-slate-50 p-6 flex items-center justify-between gap-4',
  SECTION_TITLE: 'text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2',
  INFO_LABEL: 'text-sm text-slate-600',
  INFO_VALUE: 'text-sm font-medium text-slate-900',
  GRID_2_COLS: 'grid grid-cols-2 gap-4',
  BADGE_CONTAINER: 'flex items-center gap-2 flex-wrap',
} as const;

// ============================================================================
// TYPE LABELS
// ============================================================================

export const TYPE_LABELS: Record<string, string> = {
  cliente: 'Cliente',
  concorrente: 'Concorrente',
  lead: 'Lead',
} as const;

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

interface StatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const STATUS_CONFIG: Record<ValidationStatus | 'default', StatusConfig> = {
  rich: {
    label: 'Rico',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
  },
  needs_adjustment: {
    label: 'Precisa Ajuste',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
  },
  discarded: {
    label: 'Descartado',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
  pending: {
    label: 'Pendente',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
  default: {
    label: 'Pendente',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
} as const;

// ============================================================================
// LEAD STAGE CONFIGURATION
// ============================================================================

interface LeadStageConfig {
  label: string;
  color: string;
}

export const LEAD_STAGE_CONFIG: Record<LeadStage, LeadStageConfig> = {
  novo: {
    label: 'Novo',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  em_contato: {
    label: 'Em Contato',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  negociacao: {
    label: 'Negociação',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  fechado: {
    label: 'Fechado',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  perdido: {
    label: 'Perdido',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
} as const;

// ============================================================================
// CHANGE TYPE CONFIGURATION
// ============================================================================

interface ChangeTypeConfig {
  icon: LucideIcon;
  color: string;
}

export const CHANGE_TYPE_CONFIG: Record<ChangeType | 'default', ChangeTypeConfig> = {
  created: {
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  updated: {
    icon: Edit,
    color: 'text-blue-600',
  },
  enriched: {
    icon: TrendingUp,
    color: 'text-purple-600',
  },
  validated: {
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  default: {
    icon: Clock,
    color: 'text-slate-600',
  },
} as const;

// ============================================================================
// LABELS
// ============================================================================

export const LABELS = {
  // Header
  CLOSE: 'Fechar',
  SCORE: 'Score',
  PRODUCTS: (count: number) => `${count} produto${count > 1 ? 's' : ''}`,

  // Tabs
  TAB_DETAILS: 'Detalhes',
  TAB_HISTORY: 'Histórico',
  TAB_PRODUCTS: 'Produtos',

  // Sections
  BASIC_INFO: 'Informações Básicas',
  CONTACT: 'Contato',
  LOCATION: 'Localização',
  PRODUCTS_SERVICES: 'Produtos e Serviços',
  FINANCIAL: 'Informações Financeiras',
  VALIDATION: 'Validação',
  QUALITY: 'Qualidade',
  METADATA: 'Metadados',

  // Fields
  CNPJ: 'CNPJ',
  RAZAO_SOCIAL: 'Razão Social',
  NOME_FANTASIA: 'Nome Fantasia',
  SEGMENTACAO: 'Segmentação',
  SETOR: 'Setor',
  PORTE: 'Porte',
  EMAIL: 'E-mail',
  TELEFONE: 'Telefone',
  CELULAR: 'Celular',
  WEBSITE: 'Website',
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  ENDERECO: 'Endereço',
  CIDADE: 'Cidade',
  ESTADO: 'Estado',
  CEP: 'CEP',
  PAIS: 'País',
  FATURAMENTO: 'Faturamento Anual',
  FUNCIONARIOS: 'Número de Funcionários',
  DESCRICAO: 'Descrição',
  OBSERVACOES: 'Observações',
  CREATED_AT: 'Criado em',
  UPDATED_AT: 'Atualizado em',

  // Actions
  VALIDATE: 'Validar',
  DISCARD: 'Descartar',
  EDIT: 'Editar',
  DELETE: 'Excluir',

  // Messages
  NO_HISTORY: 'Nenhum histórico disponível',
  NO_PRODUCTS: 'Nenhum produto cadastrado',
  NO_DATA: 'Não informado',

  // Dialog
  DISCARD_TITLE: 'Confirmar Descarte',
  DISCARD_DESCRIPTION: 'Tem certeza que deseja descartar este item? Esta ação não pode ser desfeita.',
  DISCARD_CANCEL: 'Cancelar',
  DISCARD_CONFIRM: 'Descartar',

  // Toast
  VALIDATION_SUCCESS: 'Status atualizado com sucesso!',
  VALIDATION_ERROR: 'Erro ao atualizar status',
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const TOAST_MESSAGES = {
  VALIDATION_SUCCESS: LABELS.VALIDATION_SUCCESS,
  VALIDATION_ERROR: LABELS.VALIDATION_ERROR,
  DISCARD_SUCCESS: 'Item descartado com sucesso!',
  DISCARD_ERROR: 'Erro ao descartar item',
} as const;

// ============================================================================
// TABS CONFIGURATION
// ============================================================================

export const TABS_CONFIG = {
  DEFAULT_VALUE: 'details',
  VALUES: {
    DETAILS: 'details',
    HISTORY: 'history',
    PRODUCTS: 'produtos',
  },
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

export const VALIDATION = {
  DISCARD_NOTES: 'Descartado pelo usuário',
  RICH_STATUS: 'rich' as const,
  DISCARDED_STATUS: 'discarded' as const,
} as const;
