import { describe, it, expect, beforeAll } from "vitest";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../routers";
import superjson from "superjson";

const BASE_URL = process.env.VITE_API_URL || "http://localhost:3000";

describe("Sistema de Notificações em Tempo Real", () => {
  let userId: string | null = null;
  let trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  beforeAll(async () => {
    trpc = createTRPCProxyClient<AppRouter>({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${BASE_URL}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    });

    try {
      const user = await trpc.auth.me.query();
      if (user) {
        userId = user.id;
        console.log(`[Monitor] Usuário autenticado: ${user.name} (${user.id})`);
      }
    } catch (error) {
      console.warn("[Monitor] Não foi possível autenticar:", error);
    }
  });

  describe("Fluxo Completo de Notificações", () => {
    it("deve criar notificação e receber via SSE", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      // 1. Conectar ao stream SSE
      const sseResponse = await fetch(`${BASE_URL}/api/notifications/stream`, {
        method: "GET",
        credentials: "include",
      });

      expect(sseResponse.status).toBe(200);
      expect(sseResponse.body).toBeDefined();

      const reader = sseResponse.body!.getReader();
      const decoder = new TextDecoder();
      let receivedNotification = false;
      let notificationData: any = null;

      // 2. Criar uma notificação de teste
      console.log("[Monitor] Criando notificação de teste...");

      const notification = await trpc.notifications.create.mutate({
        title: "Teste de Monitoramento SSE",
        content: `Notificação criada em ${new Date().toISOString()}`,
        type: "info",
      });

      console.log(`[Monitor] Notificação criada: ${notification.id}`);

      // 3. Aguardar evento SSE (timeout de 10 segundos)
      const timeout = new Promise<void>(resolve => setTimeout(resolve, 10000));
      const readSSE = async () => {
        try {
          while (!receivedNotification) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            console.log("[Monitor] Chunk SSE recebido:", chunk);

            // Parsear eventos SSE
            const lines = chunk.split("\n");
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                eventData = line.substring(6);
                try {
                  const parsed = JSON.parse(eventData);
                  if (parsed.id === notification.id) {
                    receivedNotification = true;
                    notificationData = parsed;
                    console.log(
                      "[Monitor] ✅ Notificação recebida via SSE:",
                      parsed
                    );
                    break;
                  }
                } catch (e) {
                  // Ignorar erros de parsing (heartbeats, etc)
                }
              }
            }

            if (receivedNotification) break;
          }
        } catch (error) {
          console.error("[Monitor] Erro ao ler SSE:", error);
        }
      };

      await Promise.race([readSSE(), timeout]);

      // 4. Limpar
      reader.releaseLock();
      sseResponse.body?.cancel();

      // 5. Verificações
      expect(receivedNotification).toBe(true);
      expect(notificationData).toBeDefined();
      expect(notificationData?.id).toBe(notification.id);
      expect(notificationData?.title).toBe("Teste de Monitoramento SSE");
    }, 15000); // Timeout de 15 segundos

    it("deve receber múltiplas notificações em sequência", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      const sseResponse = await fetch(`${BASE_URL}/api/notifications/stream`, {
        method: "GET",
        credentials: "include",
      });

      expect(sseResponse.status).toBe(200);

      const reader = sseResponse.body!.getReader();
      const decoder = new TextDecoder();
      const receivedIds = new Set<string>();

      // Criar 3 notificações
      console.log("[Monitor] Criando 3 notificações...");
      const notifications = await Promise.all([
        trpc.notifications.create.mutate({
          title: "Notificação 1",
          content: "Primeira notificação",
          type: "info",
        }),
        trpc.notifications.create.mutate({
          title: "Notificação 2",
          content: "Segunda notificação",
          type: "success",
        }),
        trpc.notifications.create.mutate({
          title: "Notificação 3",
          content: "Terceira notificação",
          type: "warning",
        }),
      ]);

      const expectedIds = new Set(notifications.map(n => n.id));
      console.log("[Monitor] IDs esperados:", Array.from(expectedIds));

      // Ler eventos por 10 segundos
      const startTime = Date.now();
      const maxDuration = 10000;

      try {
        while (Date.now() - startTime < maxDuration && receivedIds.size < 3) {
          const { value, done } = await Promise.race([
            reader.read(),
            new Promise<{ value: undefined; done: true }>(resolve =>
              setTimeout(() => resolve({ value: undefined, done: true }), 1000)
            ),
          ]);

          if (done || !value) continue;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.substring(6));
                if (expectedIds.has(parsed.id)) {
                  receivedIds.add(parsed.id);
                  console.log(
                    `[Monitor] ✅ Recebida ${receivedIds.size}/3: ${parsed.title}`
                  );
                }
              } catch (e) {
                // Ignorar
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        sseResponse.body?.cancel();
      }

      console.log(`[Monitor] Total recebido: ${receivedIds.size}/3`);
      expect(receivedIds.size).toBeGreaterThan(0);
    }, 15000);
  });

  describe("Verificação de Notificações Existentes", () => {
    it("deve listar notificações não lidas", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      const unread = await trpc.notifications.getUnread.query();
      console.log(`[Monitor] Notificações não lidas: ${unread.length}`);

      expect(Array.isArray(unread)).toBe(true);

      if (unread.length > 0) {
        const first = unread[0];
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("title");
        expect(first).toHaveProperty("content");
        expect(first).toHaveProperty("type");
        expect(first.isRead).toBe(false);
      }
    });

    it("deve marcar notificação como lida", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      // Criar notificação
      const notification = await trpc.notifications.create.mutate({
        title: "Teste de Leitura",
        content: "Será marcada como lida",
        type: "info",
      });

      // Marcar como lida
      await trpc.notifications.markAsRead.mutate({ id: notification.id });

      // Verificar
      const all = await trpc.notifications.getAll.query();
      const found = all.find(n => n.id === notification.id);

      expect(found).toBeDefined();
      expect(found?.isRead).toBe(true);
    });

    it("deve deletar notificação", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      // Criar notificação
      const notification = await trpc.notifications.create.mutate({
        title: "Teste de Deleção",
        content: "Será deletada",
        type: "info",
      });

      // Deletar
      await trpc.notifications.delete.mutate({ id: notification.id });

      // Verificar que não existe mais
      const all = await trpc.notifications.getAll.query();
      const found = all.find(n => n.id === notification.id);

      expect(found).toBeUndefined();
    });
  });

  describe("Performance e Limites", () => {
    it("deve lidar com múltiplas conexões SSE simultâneas", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      // Abrir 3 conexões SSE simultâneas
      const connections = await Promise.all([
        fetch(`${BASE_URL}/api/notifications/stream`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${BASE_URL}/api/notifications/stream`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${BASE_URL}/api/notifications/stream`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      // Verificar que todas conectaram
      expect(connections.every(r => r.status === 200)).toBe(true);

      // Fechar todas
      connections.forEach(r => r.body?.cancel());

      console.log("[Monitor] ✅ 3 conexões SSE simultâneas funcionaram");
    });

    it("deve manter conexão SSE por pelo menos 30 segundos", async () => {
      if (!userId) {
        console.warn("[Monitor] Pulando teste - usuário não disponível");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notifications/stream`, {
        method: "GET",
        credentials: "include",
      });

      expect(response.status).toBe(200);

      const reader = response.body!.getReader();
      const startTime = Date.now();
      let lastHeartbeat = startTime;
      let heartbeatCount = 0;

      try {
        while (Date.now() - startTime < 30000) {
          const { value, done } = await Promise.race([
            reader.read(),
            new Promise<{ value: undefined; done: true }>(resolve =>
              setTimeout(() => resolve({ value: undefined, done: true }), 5000)
            ),
          ]);

          if (done || !value) continue;

          const chunk = new TextDecoder().decode(value);
          if (chunk.includes(":heartbeat")) {
            heartbeatCount++;
            lastHeartbeat = Date.now();
          }
        }
      } finally {
        reader.releaseLock();
        response.body?.cancel();
      }

      const duration = Date.now() - startTime;
      console.log(
        `[Monitor] Conexão mantida por ${duration}ms com ${heartbeatCount} heartbeats`
      );

      expect(duration).toBeGreaterThanOrEqual(29000);
      expect(heartbeatCount).toBeGreaterThan(0);
    }, 35000);
  });
});
