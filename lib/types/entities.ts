/**
 * Entity List Item Types
 * Types for entity list views (subset of full entity data)
 */

import type { Cliente, Concorrente, Lead } from '@/drizzle/schema-snake-case';

// ============================================================================
// LIST ITEM TYPES (Subset returned by paginated APIs)
// ============================================================================

export interface ClienteListItem {
  id: number;
  nome: string;
  cnpj: string | null;
  site_oficial: string | null;
  produto_principal: string | null;
  segmentacao_b2b_b2c: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  uf: string | null;
  validation_status: string | null;
  validation_notes: string | null;
  validated_at: string | null;
}

export interface ConcorrenteListItem {
  id: number;
  nome: string;
  cnpj: string | null;
  site: string | null;
  produto: string | null;
  cidade: string | null;
  uf: string | null;
  validation_status: string | null;
  validation_notes: string | null;
  validated_at: string | null;
}

export interface LeadListItem {
  id: number;
  nome: string;
  cnpj: string | null;
  site: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  uf: string | null;
  leadStage: string | null;
  validation_status: string | null;
  validation_notes: string | null;
  validated_at: string | null;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isClienteListItem(item: unknown): item is ClienteListItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'nome' in item &&
    'cnpj' in item
  );
}

export function isConcorrenteListItem(item: unknown): item is ConcorrenteListItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'nome' in item &&
    'cnpj' in item
  );
}

export function isLeadListItem(item: unknown): item is LeadListItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'nome' in item &&
    'leadStage' in item
  );
}

// ============================================================================
// CONVERTERS (List Item -> Full Entity)
// ============================================================================

export function clienteListItemToCliente(item: ClienteListItem): Partial<Cliente> {
  return {
    id: item.id,
    nome: item.nome,
    cnpj: item.cnpj,
    site_oficial: item.site_oficial,
    produto_principal: item.produto_principal,
    segmentacao_b2b_b2c: item.segmentacao_b2b_b2c,
    email: item.email,
    telefone: item.telefone,
    cidade: item.cidade,
    uf: item.uf,
    validation_status: item.validation_status,
    validation_notes: item.validation_notes,
    validated_at: item.validated_at,
  };
}

export function concorrenteListItemToConcorrente(item: ConcorrenteListItem): Partial<Concorrente> {
  return {
    id: item.id,
    nome: item.nome,
    cnpj: item.cnpj,
    site: item.site,
    produto: item.produto,
    cidade: item.cidade,
    uf: item.uf,
    validation_status: item.validation_status,
    validation_notes: item.validation_notes,
    validated_at: item.validated_at,
  };
}

export function leadListItemToLead(item: LeadListItem): Partial<Lead> {
  return {
    id: item.id,
    nome: item.nome,
    cnpj: item.cnpj,
    site: item.site,
    email: item.email,
    telefone: item.telefone,
    cidade: item.cidade,
    uf: item.uf,
    leadStage: item.leadStage,
    validation_status: item.validation_status,
    validation_notes: item.validation_notes,
    validated_at: item.validated_at,
  };
}
