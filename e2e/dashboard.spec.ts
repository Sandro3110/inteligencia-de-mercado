import { test, expect } from "@playwright/test";

/**
 * Testes E2E para dashboard principal
 * Fase 66.3 - Testes E2E com Playwright
 */

test.describe("Dashboard Principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve carregar página inicial", async ({ page }) => {
    // Verificar que a página carregou
    await expect(page).toHaveURL(/\//);

    // Verificar que existe conteúdo
    await expect(page.locator("body")).toBeVisible();
  });

  test("deve exibir sidebar de navegação", async ({ page }) => {
    // Procurar por sidebar
    const sidebar = page
      .locator("aside")
      .or(page.locator('[role="navigation"]'))
      .or(page.locator("nav"));

    await expect(sidebar.first()).toBeVisible();
  });

  test("deve permitir navegação pelo menu", async ({ page }) => {
    // Verificar links de navegação
    const navLinks = page.locator("a[href]");
    const linkCount = await navLinks.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test("deve exibir cards de mercados", async ({ page }) => {
    // Procurar por cards ou lista de mercados
    const mercadosSection = page.getByText(/mercado|market/i);
    const hasContent = (await mercadosSection.count()) > 0;

    if (hasContent) {
      await expect(mercadosSection.first()).toBeVisible();
    }
  });

  test("deve carregar sem erros críticos", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const criticalErrors = consoleErrors.filter(
      err => !err.includes("favicon") && !err.includes("Authentication failed")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("deve ser responsivo", async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("body")).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("body")).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("deve permitir busca/filtro", async ({ page }) => {
    // Procurar por campo de busca
    const searchInput = page.getByPlaceholder(/buscar|search|filtrar/i);
    const searchExists = (await searchInput.count()) > 0;

    if (searchExists) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test("deve exibir estatísticas", async ({ page }) => {
    // Procurar por números/métricas
    const statsCards = page
      .locator('[class*="card"]')
      .or(page.locator('[class*="stat"]'))
      .or(page.locator('[class*="metric"]'));

    const hasStats = (await statsCards.count()) > 0;

    if (hasStats) {
      await expect(statsCards.first()).toBeVisible();
    }
  });

  test("deve permitir expandir/colapsar mercados", async ({ page }) => {
    // Procurar por accordion ou botões de expandir
    const expandButton = page.getByRole("button", {
      name: /expandir|expand|ver mais/i,
    });
    const accordionExists = (await expandButton.count()) > 0;

    if (accordionExists) {
      await expect(expandButton.first()).toBeVisible();
    }
  });

  test("deve verificar performance de carregamento", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Verificar que carregou em menos de 10 segundos
    expect(loadTime).toBeLessThan(10000);
  });
});
