/**
 * Service Worker para Web Push Notifications
 * Este arquivo é servido em /sw.js e registrado pelo navegador
 */

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

/**
 * Evento de recebimento de notificação push
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);

  let notificationData = {
    title: 'Nova Notificação',
    body: 'Você tem uma nova notificação',
    icon: '/logo.png',
    badge: '/badge.png',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        data: payload.data || {},
      };
    } catch (error) {
      console.error('[SW] Erro ao parsear payload:', error);
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      tag: 'gestor-pav-notification',
      requireInteraction: false,
    }
  );

  event.waitUntil(promiseChain);
});

/**
 * Evento de clique na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);

  event.notification.close();

  // Abrir ou focar na janela do app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já existe uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // Caso contrário, abrir nova janela
      if (self.clients.openWindow) {
        const targetUrl = event.notification.data?.url || '/notificacoes';
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

/**
 * Evento de fechamento da notificação
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event);
});
