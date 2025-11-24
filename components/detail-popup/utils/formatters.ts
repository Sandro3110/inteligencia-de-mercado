/**
 * Formatter Utilities
 * Functions to format data for display
 */

import { TYPE_LABELS, LABELS } from '../constants';
import type { EntityType } from '../types';

// ============================================================================
// TYPE LABEL
// ============================================================================

/**
 * Get human-readable label for entity type
 * 
 * @param type - The entity type
 * @returns Human-readable label
 */
export function getTypeLabel(type: EntityType): string {
  return TYPE_LABELS[type] || type;
}

// ============================================================================
// CURRENCY FORMATTER
// ============================================================================

/**
 * Format number as Brazilian currency (BRL)
 * 
 * @param value - The numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return LABELS.NO_DATA;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// ============================================================================
// NUMBER FORMATTER
// ============================================================================

/**
 * Format number with thousand separators
 * 
 * @param value - The numeric value
 * @returns Formatted number string
 */
export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null) return LABELS.NO_DATA;

  return new Intl.NumberFormat('pt-BR').format(value);
}

// ============================================================================
// DATE FORMATTER
// ============================================================================

/**
 * Format date to Brazilian format
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date?: Date | string | null): string {
  if (!date) return LABELS.NO_DATA;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// ============================================================================
// DATE TIME FORMATTER
// ============================================================================

/**
 * Format date with time to Brazilian format
 * 
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date?: Date | string | null): string {
  if (!date) return LABELS.NO_DATA;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

// ============================================================================
// CNPJ FORMATTER
// ============================================================================

/**
 * Format CNPJ with mask
 * 
 * @param cnpj - The CNPJ string
 * @returns Formatted CNPJ string
 */
export function formatCNPJ(cnpj?: string | null): string {
  if (!cnpj) return LABELS.NO_DATA;

  // Remove non-numeric characters
  const numbers = cnpj.replace(/\D/g, '');

  // Apply mask: 00.000.000/0000-00
  if (numbers.length === 14) {
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }

  return cnpj;
}

// ============================================================================
// PHONE FORMATTER
// ============================================================================

/**
 * Format phone number with mask
 * 
 * @param phone - The phone string
 * @returns Formatted phone string
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return LABELS.NO_DATA;

  // Remove non-numeric characters
  const numbers = phone.replace(/\D/g, '');

  // Apply mask based on length
  if (numbers.length === 11) {
    // Celular: (00) 00000-0000
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }

  return phone;
}

// ============================================================================
// CEP FORMATTER
// ============================================================================

/**
 * Format CEP with mask
 * 
 * @param cep - The CEP string
 * @returns Formatted CEP string
 */
export function formatCEP(cep?: string | null): string {
  if (!cep) return LABELS.NO_DATA;

  // Remove non-numeric characters
  const numbers = cep.replace(/\D/g, '');

  // Apply mask: 00000-000
  if (numbers.length === 8) {
    return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  return cep;
}

// ============================================================================
// URL FORMATTER
// ============================================================================

/**
 * Format URL to ensure it has protocol
 * 
 * @param url - The URL string
 * @returns Formatted URL with protocol
 */
export function formatURL(url?: string | null): string {
  if (!url) return LABELS.NO_DATA;

  // Add https:// if no protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}

// ============================================================================
// EMPTY VALUE HANDLER
// ============================================================================

/**
 * Return formatted value or "Não informado" if empty
 * 
 * @param value - The value to check
 * @returns The value or "Não informado"
 */
export function formatOrEmpty(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') {
    return LABELS.NO_DATA;
  }

  return String(value);
}

// ============================================================================
// TRUNCATE TEXT
// ============================================================================

/**
 * Truncate text to specified length
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text?: string | null, maxLength: number = 100): string {
  if (!text) return LABELS.NO_DATA;

  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
}
