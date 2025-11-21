/**
 * Testes para Sistema de Preferências de Usuário
 * Fase 69: Sistema Completo de Notificações em Tempo Real
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getUserPreferences, updateUserPreferences, resetUserPreferences } from './userPreferences';

describe('User Preferences System', () => {
  const testUserId = 'test-user-preferences-' + Date.now();

  describe('getUserPreferences', () => {
    it('deve criar preferências padrão se não existir', async () => {
      const prefs = await getUserPreferences(testUserId);
      
      expect(prefs).toBeDefined();
      expect(prefs?.userId).toBe(testUserId);
      expect(prefs?.notificationSoundEnabled).toBe(1);
      expect(prefs?.notificationVolume).toBe(50);
      expect(prefs?.desktopNotificationsEnabled).toBe(1);
    });

    it('deve retornar preferências existentes', async () => {
      // Buscar novamente
      const prefs = await getUserPreferences(testUserId);
      
      expect(prefs).toBeDefined();
      expect(prefs?.userId).toBe(testUserId);
    });
  });

  describe('updateUserPreferences', () => {
    it('deve atualizar som de notificação', async () => {
      const result = await updateUserPreferences(testUserId, {
        notificationSoundEnabled: false,
      });
      
      expect(result.success).toBe(true);
      
      const prefs = await getUserPreferences(testUserId);
      expect(prefs?.notificationSoundEnabled).toBe(0);
    });

    it('deve atualizar volume', async () => {
      const result = await updateUserPreferences(testUserId, {
        notificationVolume: 75,
      });
      
      expect(result.success).toBe(true);
      
      const prefs = await getUserPreferences(testUserId);
      expect(prefs?.notificationVolume).toBe(75);
    });

    it('deve validar range de volume (0-100)', async () => {
      // Volume acima de 100 deve ser limitado a 100
      await updateUserPreferences(testUserId, {
        notificationVolume: 150,
      });
      
      let prefs = await getUserPreferences(testUserId);
      expect(prefs?.notificationVolume).toBe(100);
      
      // Volume abaixo de 0 deve ser limitado a 0
      await updateUserPreferences(testUserId, {
        notificationVolume: -10,
      });
      
      prefs = await getUserPreferences(testUserId);
      expect(prefs?.notificationVolume).toBe(0);
    });

    it('deve atualizar notificações desktop', async () => {
      const result = await updateUserPreferences(testUserId, {
        desktopNotificationsEnabled: false,
      });
      
      expect(result.success).toBe(true);
      
      const prefs = await getUserPreferences(testUserId);
      expect(prefs?.desktopNotificationsEnabled).toBe(0);
    });

    it('deve atualizar múltiplas preferências de uma vez', async () => {
      const result = await updateUserPreferences(testUserId, {
        notificationSoundEnabled: true,
        notificationVolume: 80,
        desktopNotificationsEnabled: true,
      });
      
      expect(result.success).toBe(true);
      
      const prefs = await getUserPreferences(testUserId);
      expect(prefs?.notificationSoundEnabled).toBe(1);
      expect(prefs?.notificationVolume).toBe(80);
      expect(prefs?.desktopNotificationsEnabled).toBe(1);
    });
  });

  describe('resetUserPreferences', () => {
    it('deve resetar preferências para valores padrão', async () => {
      // Primeiro alterar valores
      await updateUserPreferences(testUserId, {
        notificationSoundEnabled: false,
        notificationVolume: 10,
        desktopNotificationsEnabled: false,
      });
      
      // Resetar
      const result = await resetUserPreferences(testUserId);
      expect(result.success).toBe(true);
      
      // Verificar valores padrão
      const prefs = await getUserPreferences(testUserId);
      expect(prefs?.notificationSoundEnabled).toBe(1);
      expect(prefs?.notificationVolume).toBe(50);
      expect(prefs?.desktopNotificationsEnabled).toBe(1);
    });
  });
});
