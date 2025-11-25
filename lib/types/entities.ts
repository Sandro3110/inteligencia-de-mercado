/**
 * Entity List Item Types
 * Types for entity list views (subset of full entity data)
 */

import type { Cliente, Concorrente, Lead } from '@/drizzle/schema';

// ============================================================================
// LIST ITEM TYPES (Subset returned by paginated APIs)
// ============================================================================

export interface ClienteListItem {
  id: number;
  nome: string;
  cnpj: string | null;
  siteOficial: string | null;
  produtoPrincipal: string | null;
  segmentacaoB2BB2C: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  uf: string | null;
  validationStatus: string | null;
  validationNotes: string | null;
  validatedAt: string | null;
}

export interface ConcorrenteListItem {
  id: number;
  nome: string;
  cnpj: string | null;
  siteOficial: string | null;
  produtoPrincipal: string | null;
  segmentacaoB2BB2C: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  uf: string | null;
  validationStatus: string | null;
  validationNotes: string | null;
  validatedAt: string | null;
}

export interface LeadListItem {
  id: number;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  cidade: string | null;
  uf: string | null;
  leadStage: string | null;
  validationStatus: string | null;
  validationNotes: string | null;
  validatedAt: string | null;
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
    siteOficial: item.siteOficial,
    produtoPrincipal: item.produtoPrincipal,
    segmentacaoB2BB2C: item.segmentacaoB2BB2C,
    email: item.email,
    telefone: item.telefone,
    cidade: item.cidade,
    uf: item.uf,
    validationStatus: item.validationStatus,
    validationNotes: item.validationNotes,
    validatedAt: item.validatedAt,
  };
}

export function concorrenteListItemToConcorrente(item: ConcorrenteListItem): Partial<Concorrente> {
  return {
    id: item.id,
    nome: item.nome,
    cnpj: item.cnpj,
    siteOficial: item.siteOficial,
    produtoPrincipal: item.produtoPrincipal,
    segmentacaoB2BB2C: item.segmentacaoB2BB2C,
    email: item.email,
    telefone: item.telefone,
    cidade: item.cidade,
    uf: item.uf,
    validationStatus: item.validationStatus,
    validationNotes: item.validationNotes,
    validatedAt: item.validatedAt,
  };
}

export function leadListItemToLead(item: LeadListItem): Partial<Lead> {
  return {
    id: item.id,
    nome: item.nome,
    empresa: item.empresa,
    email: item.email,
    telefone: item.telefone,
    cargo: item.cargo,
    cidade: item.cidade,
    uf: item.uf,
    leadStage: item.leadStage,
    validationStatus: item.validationStatus,
    validationNotes: item.validationNotes,
    validatedAt: item.validatedAt,
  };
}
