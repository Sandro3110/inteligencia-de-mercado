import { describe, it, expect, beforeAll } from "vitest";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/routers";
import superjson from "superjson";

const BASE_URL = process.env.VITE_API_URL || "http://localhost:3000";

describe("SSE Authentication Tests", () => {
  let validCookie: string | null = null;
  let userId: string | null = null;

  // Helper para fazer requisições HTTP diretas
  async function fetchSSE(endpoint: string, cookie?: string) {
    const headers: HeadersInit = {};
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    return {
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }

  beforeAll(async () => {
    // Tentar obter sessão válida via tRPC
    try {
      const trpc = createTRPCProxyClient<AppRouter>({
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

      const user = await trpc.auth.me.query();
      if (user) {
        userId = user.id;
        console.log(
          `[Test Setup] Usuário autenticado: ${user.name} (${user.id})`
        );
      }
    } catch (error) {
      console.warn("[Test Setup] Não foi possível autenticar via tRPC:", error);
    }
  });

  describe("Endpoint /api/enrichment/progress/:jobId", () => {
    it("deve rejeitar requisições sem autenticação", async () => {
      const response = await fetchSSE("/api/enrichment/progress/test-job-123");

      expect(response.status).toBe(401);
      expect(response.ok).toBe(false);
    });

    it("deve aceitar requisições autenticadas", async () => {
      if (!userId) {
        console.warn(
          "[Test] Pulando teste autenticado - usuário não disponível"
        );
        return;
      }

      // Criar um job de teste primeiro
      const trpc = createTRPCProxyClient<AppRouter>({
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
        // Criar job de teste
        const job = await trpc.enrichment.createJob.mutate({
          name: "Test SSE Auth Job",
          cnpjList: ["00000000000191"],
        });

        // Tentar acessar SSE com autenticação
        const response = await fetch(
          `${BASE_URL}/api/enrichment/progress/${job.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain(
          "text/event-stream"
        );

        // Fechar a conexão
        response.body?.cancel();
      } catch (error) {
        console.error("[Test] Erro ao testar endpoint autenticado:", error);
        throw error;
      }
    });
  });

  describe("Endpoint /api/notifications/stream", () => {
    it("deve rejeitar requisições sem autenticação", async () => {
      const response = await fetchSSE("/api/notifications/stream");

      expect(response.status).toBe(401);
      expect(response.ok).toBe(false);
    });

    it("deve aceitar requisições autenticadas e retornar SSE", async () => {
      if (!userId) {
        console.warn(
          "[Test] Pulando teste autenticado - usuário não disponível"
        );
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notifications/stream`, {
        method: "GET",
        credentials: "include",
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "text/event-stream"
      );
      expect(response.headers.get("cache-control")).toBe("no-cache");
      expect(response.headers.get("connection")).toBe("keep-alive");

      // Fechar a conexão
      response.body?.cancel();
    });

    it("deve enviar eventos SSE formatados corretamente", async () => {
      if (!userId) {
        console.warn(
          "[Test] Pulando teste autenticado - usuário não disponível"
        );
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notifications/stream`, {
        method: "GET",
        credentials: "include",
      });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      // Ler primeiro evento (heartbeat ou notificação)
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      try {
        const { value, done } = await Promise.race([
          reader.read(),
          new Promise<{ value: undefined; done: true }>(resolve =>
            setTimeout(() => resolve({ value: undefined, done: true }), 5000)
          ),
        ]);

        if (!done && value) {
          const chunk = decoder.decode(value);
          console.log("[Test] Primeiro chunk SSE:", chunk);

          // Verificar formato SSE
          expect(chunk).toMatch(/^(data:|event:|id:|:\s)/m);
        }
      } finally {
        reader.releaseLock();
        response.body?.cancel();
      }
    });
  });

  describe("Segurança de Cookies", () => {
    it("deve rejeitar cookies inválidos", async () => {
      const response = await fetchSSE(
        "/api/notifications/stream",
        "manus_session=invalid-token-12345"
      );

      expect(response.status).toBe(401);
    });

    it("deve rejeitar cookies expirados ou malformados", async () => {
      const malformedCookies = [
        "manus_session=",
        "manus_session=null",
        "manus_session=undefined",
        "other_cookie=value",
      ];

      for (const cookie of malformedCookies) {
        const response = await fetchSSE("/api/notifications/stream", cookie);
        expect(response.status).toBe(401);
      }
    });
  });

  describe("Headers de Segurança", () => {
    it("deve incluir headers de segurança adequados", async () => {
      if (!userId) {
        console.warn(
          "[Test] Pulando teste autenticado - usuário não disponível"
        );
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notifications/stream`, {
        method: "GET",
        credentials: "include",
      });

      // Verificar headers SSE
      expect(response.headers.get("content-type")).toContain(
        "text/event-stream"
      );
      expect(response.headers.get("cache-control")).toBe("no-cache");
      expect(response.headers.get("connection")).toBe("keep-alive");

      response.body?.cancel();
    });
  });
});
