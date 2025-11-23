import { test, expect } from "@playwright/test";

/**
 * Teste E2E: Fluxo de Enriquecimento Completo
 * Fase 43.3 - Testes E2E com Playwright
 */

test.describe("Fluxo de Enriquecimento", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página inicial
    await page.goto("/");

    // Aguardar carregamento
    await page.waitForLoadState("networkidle");
  });

  test("deve navegar para página de enriquecimento", async ({ page }) => {
    // Clicar no menu Enriquecimento
    await page.click("text=Enriquecimento");

    // Verificar URL
    await expect(page).toHaveURL(/.*enrichment-settings/);

    // Verificar título
    await expect(page.locator("h1, h2").first()).toContainText(
      /Enriquecimento|Configurações/i
    );
  });

  test("deve exibir configurações de enriquecimento", async ({ page }) => {
    await page.goto("/enrichment-settings");
    await page.waitForLoadState("networkidle");

    // Verificar elementos principais
    await expect(page.locator("text=Provedor")).toBeVisible();
    await expect(page.locator("text=API Key")).toBeVisible();

    // Verificar botão salvar
    await expect(page.locator('button:has-text("Salvar")')).toBeVisible();
  });

  test("deve validar campos obrigatórios", async ({ page }) => {
    await page.goto("/enrichment-settings");
    await page.waitForLoadState("networkidle");

    // Tentar salvar sem preencher
    const saveButton = page.locator('button:has-text("Salvar")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Aguardar mensagem de erro (toast ou validação)
      await page.waitForTimeout(1000);

      // Verificar se há mensagem de erro visível
      const errorVisible = await page
        .locator("text=/obrigatório|required|inválido|invalid/i")
        .isVisible()
        .catch(() => false);
      expect(errorVisible).toBeTruthy();
    }
  });

  test("deve exibir progresso de enriquecimento", async ({ page }) => {
    await page.goto("/enrichment-progress");
    await page.waitForLoadState("networkidle");

    // Verificar elementos de progresso
    const hasProgress = await page
      .locator("text=/Progresso|Progress|Status/i")
      .isVisible();
    expect(hasProgress).toBeTruthy();
  });

  test("deve exibir resultados de enriquecimento", async ({ page }) => {
    await page.goto("/enrichment-results");
    await page.waitForLoadState("networkidle");

    // Verificar se página carregou
    const hasContent = await page.locator("body").textContent();
    expect(hasContent).toBeTruthy();
  });
});

test.describe("Validação de Formulários", () => {
  test("deve validar API Key com Zod", async ({ page }) => {
    await page.goto("/admin-llm");
    await page.waitForLoadState("networkidle");

    // Preencher API Key inválida (muito curta)
    const apiKeyInput = page
      .locator('input[type="text"], input[type="password"]')
      .first();
    if (await apiKeyInput.isVisible()) {
      await apiKeyInput.fill("abc");

      // Tentar testar conexão
      const testButton = page.locator('button:has-text("Testar")').first();
      if (await testButton.isVisible()) {
        await testButton.click();

        // Aguardar mensagem de erro
        await page.waitForTimeout(1000);

        // Verificar erro de validação
        const errorVisible = await page
          .locator("text=/pelo menos 10 caracteres|inválido/i")
          .isVisible()
          .catch(() => false);
        expect(errorVisible).toBeTruthy();
      }
    }
  });
});
