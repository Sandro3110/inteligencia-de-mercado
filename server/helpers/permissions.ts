/**
 * Helper de Permissões
 * Funções utilitárias para verificar permissões de usuários
 * 
 * FASE 1 - Sessão 1.2
 */

import { Role, Permission, ROLE_PERMISSIONS } from '@/shared/types/permissions';

/**
 * Verifica se um papel tem uma permissão específica
 * 
 * @param role - Papel do usuário
 * @param permission - Permissão a verificar
 * @returns true se o papel tem a permissão
 * 
 * @example
 * hasPermission(Role.ADMIN, Permission.PROJETO_CREATE) // true
 * hasPermission(Role.VIEWER, Permission.PROJETO_CREATE) // false
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Verifica se um papel tem pelo menos uma das permissões fornecidas
 * 
 * @param role - Papel do usuário
 * @param permissions - Array de permissões a verificar
 * @returns true se o papel tem pelo menos uma permissão
 * 
 * @example
 * hasAnyPermission(Role.MANAGER, [
 *   Permission.PROJETO_CREATE,
 *   Permission.PROJETO_UPDATE
 * ]) // true
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Verifica se um papel tem todas as permissões fornecidas
 * 
 * @param role - Papel do usuário
 * @param permissions - Array de permissões a verificar
 * @returns true se o papel tem todas as permissões
 * 
 * @example
 * hasAllPermissions(Role.ADMIN, [
 *   Permission.PROJETO_CREATE,
 *   Permission.USER_MANAGE
 * ]) // true
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Retorna todas as permissões de um papel
 * 
 * @param role - Papel do usuário
 * @returns Array de permissões
 * 
 * @example
 * getUserPermissions(Role.VIEWER)
 * // ['projeto:read', 'pesquisa:read', ...]
 */
export function getUserPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verifica se um papel é administrador
 * 
 * @param role - Papel do usuário
 * @returns true se é admin
 */
export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN;
}

/**
 * Verifica se um papel pode gerenciar usuários
 * 
 * @param role - Papel do usuário
 * @returns true se pode gerenciar usuários
 */
export function canManageUsers(role: Role): boolean {
  return hasAnyPermission(role, [
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.ROLE_MANAGE
  ]);
}

/**
 * Verifica se um papel pode exportar dados
 * 
 * @param role - Papel do usuário
 * @returns true se pode exportar
 */
export function canExport(role: Role): boolean {
  return hasAnyPermission(role, [
    Permission.ENTIDADE_EXPORT,
    Permission.ANALISE_EXPORT
  ]);
}
