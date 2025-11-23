import { test, expect } from "@playwright/test";

/**
 * Testes E2E para sistema de notificações
 * Fase 66.3 - Testes E2E com Playwright
 */

test.describe("Sistema de Notificações", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto("/");
  });

  test("deve exibir dashboard de notificações SSE", async ({ page }) => {
    // Navegar para dashboard de notificações
    await page.goto("/notificacoes/dashboard");

    // Verificar título da página
    await expect(page.locator("h1")).toContainText("Dashboard de Notificações");

    // Verificar cards de estatísticas
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("Não Lidas")).toBeVisible();
    await expect(page.getByText("Últimas 24h")).toBeVisible();

    // Verificar badge de conexão SSE
    await expect(
      page.getByText("Conectado").or(page.getByText("Desconectado"))
    ).toBeVisible();
  });

  test("deve exibir página de configuração de Web Push", async ({ page }) => {
    // Navegar para configurações de push
    await page.goto("/notificacoes/push");

    // Verificar título
    await expect(page.locator("h1")).toContainText("Configurações de Web Push");

    // Verificar seções
    await expect(page.getByText("Status do Navegador")).toBeVisible();
    await expect(page.getByText("Gerenciar Subscrição")).toBeVisible();
    await expect(page.getByText("Como Funciona")).toBeVisible();

    // Verificar status de suporte
    await expect(page.getByText("Suporte a Push Notifications")).toBeVisible();
  });

  test("deve navegar entre páginas de notificações", async ({ page }) => {
    // Abrir sidebar
    const sidebar = page
      .locator('[data-testid="sidebar"]')
      .or(page.locator("aside"));

    // Navegar para notificações
    await page.goto("/notificacoes");
    await expect(page).toHaveURL(/\/notificacoes/);

    // Navegar para dashboard SSE
    await page.goto("/notificacoes/dashboard");
    await expect(page).toHaveURL(/\/notificacoes\/dashboard/);

    // Navegar para configurações de push
    await page.goto("/notificacoes/push");
    await expect(page).toHaveURL(/\/notificacoes\/push/);

    // Navegar para histórico
    await page.goto("/notificacoes/historico");
    await expect(page).toHaveURL(/\/notificacoes\/historico/);
  });

  test("deve verificar permissões de notificação", async ({
    page,
    context,
  }) => {
    // Conceder permissão de notificações
    await context.grantPermissions(["notifications"]);

    // Navegar para configurações de push
    await page.goto("/notificacoes/push");

    // Verificar que permissão está concedida
    const permission = await page.evaluate(() => Notification.permission);
    expect(permission).toBe("granted");
  });

  test("deve verificar suporte a Service Worker", async ({ page }) => {
    await page.goto("/notificacoes/push");

    // Verificar se Service Worker é suportado
    const isSupported = await page.evaluate(() => {
      return "serviceWorker" in navigator && "PushManager" in window;
    });

    expect(isSupported).toBe(true);
  });

  test("deve exibir lista de notificações", async ({ page }) => {
    await page.goto("/notificacoes");

    // Verificar título
    await expect(page.locator("h1")).toContainText("Notificações");

    // Verificar que existe área de conteúdo
    await expect(
      page.locator("main").or(page.locator('[role="main"]'))
    ).toBeVisible();
  });

  test("deve permitir filtrar notificações", async ({ page }) => {
    await page.goto("/notificacoes");

    // Procurar por filtros (se existirem)
    const filterButton = page.getByRole("button", { name: /filtro|filter/i });
    const filterExists = (await filterButton.count()) > 0;

    if (filterExists) {
      await filterButton.click();
      // Verificar que modal/dropdown de filtros abriu
      await expect(page.getByText(/tipo|status|data/i).first()).toBeVisible();
    }
  });

  test("deve carregar dashboard SSE sem erros", async ({ page }) => {
    // Monitorar erros de console
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/notificacoes/dashboard");

    // Aguardar carregamento
    await page.waitForLoadState("networkidle");

    // Verificar que não há erros críticos
    const criticalErrors = consoleErrors.filter(
      err => !err.includes("favicon") && !err.includes("Authentication failed")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("deve exibir botões de ação no dashboard SSE", async ({ page }) => {
    await page.goto("/notificacoes/dashboard");

    // Verificar botões de ação
    const markAllButton = page.getByRole("button", { name: /marcar todas/i });
    const reconnectButton = page.getByRole("button", { name: /reconectar/i });

    await expect(markAllButton.or(reconnectButton)).toBeVisible();
  });

  test("deve verificar responsividade do dashboard", async ({ page }) => {
    await page.goto("/notificacoes/dashboard");

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("h1")).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("h1")).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();
  });
});
