/**
 * Testes para o sistema RBAC
 * FASE 1 - Sessão 1.2
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  isAdmin,
  canManageUsers,
  canExport
} from './permissions';
import { Role, Permission } from '@/shared/types/permissions';

describe('RBAC - Sistema de Permissões', () => {
  describe('hasPermission', () => {
    it('Admin deve ter todas as permissões', () => {
      expect(hasPermission(Role.ADMIN, Permission.PROJETO_CREATE)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.USER_CREATE)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.AUDIT_READ)).toBe(true);
    });

    it('Viewer não deve poder criar projetos', () => {
      expect(hasPermission(Role.VIEWER, Permission.PROJETO_CREATE)).toBe(false);
    });

    it('Manager deve poder criar projetos', () => {
      expect(hasPermission(Role.MANAGER, Permission.PROJETO_CREATE)).toBe(true);
    });

    it('Analyst não deve poder deletar entidades', () => {
      expect(hasPermission(Role.ANALYST, Permission.ENTIDADE_DELETE)).toBe(false);
    });

    it('Analyst deve poder exportar entidades', () => {
      expect(hasPermission(Role.ANALYST, Permission.ENTIDADE_EXPORT)).toBe(true);
    });

    it('Viewer não deve poder executar enriquecimento', () => {
      expect(hasPermission(Role.VIEWER, Permission.ENRIQUECIMENTO_EXECUTE)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('Manager deve ter pelo menos uma permissão de projeto', () => {
      expect(hasAnyPermission(Role.MANAGER, [
        Permission.PROJETO_CREATE,
        Permission.PROJETO_UPDATE
      ])).toBe(true);
    });

    it('Viewer não deve ter permissões de escrita', () => {
      expect(hasAnyPermission(Role.VIEWER, [
        Permission.PROJETO_CREATE,
        Permission.PROJETO_UPDATE,
        Permission.PROJETO_DELETE
      ])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('Admin deve ter todas as permissões de projeto', () => {
      expect(hasAllPermissions(Role.ADMIN, [
        Permission.PROJETO_CREATE,
        Permission.PROJETO_READ,
        Permission.PROJETO_UPDATE,
        Permission.PROJETO_DELETE
      ])).toBe(true);
    });

    it('Analyst não deve ter todas as permissões de projeto', () => {
      expect(hasAllPermissions(Role.ANALYST, [
        Permission.PROJETO_CREATE,
        Permission.PROJETO_READ
      ])).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('Admin deve ter mais de 25 permissões', () => {
      const permissions = getUserPermissions(Role.ADMIN);
      expect(permissions.length).toBeGreaterThan(25);
    });

    it('Viewer deve ter exatamente 4 permissões', () => {
      const permissions = getUserPermissions(Role.VIEWER);
      expect(permissions.length).toBe(4);
    });

    it('Manager deve ter mais permissões que Analyst', () => {
      const managerPerms = getUserPermissions(Role.MANAGER);
      const analystPerms = getUserPermissions(Role.ANALYST);
      expect(managerPerms.length).toBeGreaterThan(analystPerms.length);
    });
  });

  describe('isAdmin', () => {
    it('Deve identificar admin corretamente', () => {
      expect(isAdmin(Role.ADMIN)).toBe(true);
      expect(isAdmin(Role.MANAGER)).toBe(false);
      expect(isAdmin(Role.ANALYST)).toBe(false);
      expect(isAdmin(Role.VIEWER)).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('Admin deve poder gerenciar usuários', () => {
      expect(canManageUsers(Role.ADMIN)).toBe(true);
    });

    it('Manager não deve poder gerenciar usuários', () => {
      expect(canManageUsers(Role.MANAGER)).toBe(false);
    });
  });

  describe('canExport', () => {
    it('Admin deve poder exportar', () => {
      expect(canExport(Role.ADMIN)).toBe(true);
    });

    it('Analyst deve poder exportar', () => {
      expect(canExport(Role.ANALYST)).toBe(true);
    });

    it('Manager deve poder exportar', () => {
      expect(canExport(Role.MANAGER)).toBe(true);
    });

    it('Viewer não deve poder exportar', () => {
      expect(canExport(Role.VIEWER)).toBe(false);
    });
  });

  describe('Hierarquia de Papéis', () => {
    it('Admin deve ter mais permissões que Manager', () => {
      const adminPerms = getUserPermissions(Role.ADMIN);
      const managerPerms = getUserPermissions(Role.MANAGER);
      expect(adminPerms.length).toBeGreaterThan(managerPerms.length);
    });

    it('Manager deve ter mais permissões que Analyst', () => {
      const managerPerms = getUserPermissions(Role.MANAGER);
      const analystPerms = getUserPermissions(Role.ANALYST);
      expect(managerPerms.length).toBeGreaterThan(analystPerms.length);
    });

    it('Analyst deve ter mais permissões que Viewer', () => {
      const analystPerms = getUserPermissions(Role.ANALYST);
      const viewerPerms = getUserPermissions(Role.VIEWER);
      expect(analystPerms.length).toBeGreaterThan(viewerPerms.length);
    });
  });
});
