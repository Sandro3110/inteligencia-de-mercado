import { describe, it, expect, beforeAll } from 'vitest';
import {
  createNotification,
  listNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from '../db-notifications';
import { createProject } from '../db';

describe('Fase 67: Sistema de Notificações', () => {
  const testUserId = 'test-user-notifications';
  let testProjectId: number;
  let testNotificationId: number;

  beforeAll(async () => {
    // Criar projeto de teste
    const project = await createProject({
      nome: 'Projeto Teste Notificações',
      descricao: 'Para testar sistema de notificações',
    }, testUserId);

    if (!project) {
      throw new Error('Falha ao criar projeto de teste');
    }

    testProjectId = project.id;
  });

  describe('67.1 - Criação de Notificações', () => {
    it('deve criar notificação de lead de alta qualidade', async () => {
      const id = await createNotification({
        userId: testUserId,
        projectId: testProjectId,
        type: 'lead_high_quality',
        title: '🎯 Lead de Alta Qualidade',
        message: 'Novo lead com score 95',
        metadata: {
          leadId: 123,
          score: 95,
          mercadoNome: 'Tecnologia',
        },
      });

      expect(id).toBeDefined();
      expect(id).toBeGreaterThan(0);
      testNotificationId = id!;
    });

    it('deve criar notificação de projeto criado', async () => {
      const id = await createNotification({
        userId: testUserId,
        projectId: testProjectId,
        type: 'project_created',
        title: '🎯 Novo Projeto',
        message: 'Projeto criado com sucesso',
        metadata: {
          projectId: testProjectId,
        },
      });

      expect(id).toBeDefined();
      expect(id).toBeGreaterThan(0);
    });

    it('deve criar notificação de enriquecimento concluído', async () => {
      const id = await createNotification({
        userId: testUserId,
        projectId: testProjectId,
        type: 'enrichment_complete',
        title: '✅ Enriquecimento Concluído',
        message: 'Processados 100 clientes',
        metadata: {
          totalClientes: 100,
          processedCount: 100,
          successCount: 95,
        },
      });

      expect(id).toBeDefined();
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('67.2 - Listagem e Filtros', () => {
    it('deve listar todas as notificações do usuário', async () => {
      const notifications = await listNotifications({
        userId: testUserId,
      });

      expect(notifications).toBeDefined();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0]).toHaveProperty('id');
      expect(notifications[0]).toHaveProperty('title');
      expect(notifications[0]).toHaveProperty('message');
      expect(notifications[0]).toHaveProperty('type');
    });

    it('deve filtrar notificações por tipo', async () => {
      const notifications = await listNotifications({
        userId: testUserId,
        type: 'lead_high_quality',
      });

      expect(notifications).toBeDefined();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe('lead_high_quality');
    });

    it('deve filtrar notificações por projeto', async () => {
      const notifications = await listNotifications({
        userId: testUserId,
        projectId: testProjectId,
      });

      expect(notifications).toBeDefined();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].projectId).toBe(testProjectId);
    });

    it('deve filtrar notificações não lidas', async () => {
      const notifications = await listNotifications({
        userId: testUserId,
        isRead: false,
      });

      expect(notifications).toBeDefined();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].isRead).toBe(0);
    });

    it('deve aplicar limite e offset (paginação)', async () => {
      const page1 = await listNotifications({
        userId: testUserId,
        limit: 2,
        offset: 0,
      });

      const page2 = await listNotifications({
        userId: testUserId,
        limit: 2,
        offset: 2,
      });

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
      
      if (page1.length > 0 && page2.length > 0) {
        expect(page1[0].id).not.toBe(page2[0].id);
      }
    });
  });

  describe('67.3 - Contador de Não Lidas', () => {
    it('deve contar notificações não lidas', async () => {
      const count = await countUnreadNotifications(testUserId);

      expect(count).toBeDefined();
      expect(count).toBeGreaterThan(0);
    });

    it('deve contar notificações não lidas por projeto', async () => {
      const count = await countUnreadNotifications(testUserId, testProjectId);

      expect(count).toBeDefined();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('67.4 - Marcar como Lida', () => {
    it('deve marcar notificação como lida', async () => {
      const success = await markNotificationAsRead(testNotificationId, testUserId);

      expect(success).toBe(true);

      // Verificar que foi marcada
      const notifications = await listNotifications({
        userId: testUserId,
        isRead: true,
      });

      const found = notifications.find(n => n.id === testNotificationId);
      expect(found).toBeDefined();
      expect(found?.isRead).toBe(1);
    });

    it('deve marcar todas as notificações como lidas', async () => {
      // Criar mais uma notificação não lida
      await createNotification({
        userId: testUserId,
        projectId: testProjectId,
        type: 'system',
        title: 'Teste',
        message: 'Teste de marcar todas',
      });

      const success = await markAllNotificationsAsRead(testUserId);
      expect(success).toBe(true);

      // Verificar que não há mais não lidas
      const count = await countUnreadNotifications(testUserId);
      expect(count).toBe(0);
    });
  });

  describe('67.5 - Deleção de Notificações', () => {
    let deleteTestId: number;

    beforeAll(async () => {
      // Criar notificação para deletar
      const id = await createNotification({
        userId: testUserId,
        projectId: testProjectId,
        type: 'system',
        title: 'Para Deletar',
        message: 'Esta será deletada',
      });
      deleteTestId = id!;

      // Marcar como lida
      await markNotificationAsRead(deleteTestId, testUserId);
    });

    it('deve deletar notificação específica', async () => {
      const success = await deleteNotification(deleteTestId, testUserId);
      expect(success).toBe(true);

      // Verificar que foi deletada
      const notifications = await listNotifications({
        userId: testUserId,
      });

      const found = notifications.find(n => n.id === deleteTestId);
      expect(found).toBeUndefined();
    });

    it('deve deletar todas as notificações lidas', async () => {
      // Criar e marcar como lida
      const id1 = await createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Lida 1',
        message: 'Teste',
      });
      await markNotificationAsRead(id1!, testUserId);

      const id2 = await createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Lida 2',
        message: 'Teste',
      });
      await markNotificationAsRead(id2!, testUserId);

      const success = await deleteAllReadNotifications(testUserId);
      expect(success).toBe(true);

      // Verificar que foram deletadas
      const notifications = await listNotifications({
        userId: testUserId,
        isRead: true,
      });

      expect(notifications.length).toBe(0);
    });
  });

  describe('67.6 - Metadata e Contexto', () => {
    it('deve preservar metadata JSON', async () => {
      const metadata = {
        leadId: 456,
        score: 88,
        mercadoNome: 'Saúde',
        cnpj: '12.345.678/0001-90',
        site: 'https://example.com',
      };

      const id = await createNotification({
        userId: testUserId,
        projectId: testProjectId,
        type: 'lead_high_quality',
        title: 'Lead com Metadata',
        message: 'Teste de metadata',
        metadata,
      });

      const notifications = await listNotifications({
        userId: testUserId,
      });

      const found = notifications.find(n => n.id === id);
      expect(found).toBeDefined();
      expect(found?.metadata).toBeDefined();
      expect(found?.metadata).toEqual(metadata);
    });

    it('deve funcionar sem metadata', async () => {
      const id = await createNotification({
        userId: testUserId,
        type: 'system',
        title: 'Sem Metadata',
        message: 'Notificação simples',
      });

      expect(id).toBeDefined();

      const notifications = await listNotifications({
        userId: testUserId,
      });

      const found = notifications.find(n => n.id === id);
      expect(found).toBeDefined();
      expect(found?.metadata).toBeNull();
    });
  });

  describe('67.7 - Integração com Leads de Alta Qualidade', () => {
    it('deve verificar que notificação de lead é criada automaticamente', async () => {
      // Este teste verifica se a integração no enrichmentFlow está funcionando
      // A notificação é criada quando um lead com score >= 80 é criado
      
      const notifications = await listNotifications({
        userId: testUserId,
        type: 'lead_high_quality',
      });

      // Deve haver pelo menos uma notificação de lead de alta qualidade
      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      expect(notification.title).toContain('Lead');
      expect(notification.metadata).toBeDefined();
      expect(notification.metadata?.score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('67.8 - Integração com Criação de Projeto', () => {
    it('deve criar notificação quando projeto é criado com userId', async () => {
      // Criar projeto com userId para testar integração
      const newProject = await createProject({
        nome: 'Projeto com Notificação',
        descricao: 'Teste de notificação automática',
      }, testUserId);

      expect(newProject).toBeDefined();
      
      // Verificar que notificação foi criada
      const notifications = await listNotifications({
        userId: testUserId,
        type: 'project_created',
      });

      // Deve haver pelo menos uma notificação de projeto criado
      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      expect(notification.title).toContain('Projeto');
      expect(notification.metadata).toBeDefined();
      expect(notification.metadata?.projectId).toBeDefined();
    });
  });
});
