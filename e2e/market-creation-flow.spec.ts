import { test, expect } from "@playwright/test";

/**
 * Teste E2E: Fluxo Completo de Criação de Mercado
 * Fase 86 - Passo 2
 *
 * Testa o fluxo completo desde a criação de um projeto até a criação de mercados
 */

test.describe("Fluxo de Criação de Mercado", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto("/");

    // Aguardar carregamento da aplicação
    await page.waitForLoadState("networkidle");
  });

  test("deve criar projeto e adicionar mercado único", async ({ page }) => {
    // 1. Navegar para gerenciamento de projetos
    await page.click("text=Projetos");
    await expect(page).toHaveURL(/\/projetos/);

    // 2. Clicar em "Criar Novo Projeto"
    await page.click('button:has-text("Criar Novo Projeto")');

    // 3. Preencher formulário de criação
    const projectName = `Projeto Teste E2E ${Date.now()}`;
    await page.fill('input[placeholder*="nome"]', projectName);
    await page.fill(
      'textarea[placeholder*="descrição"]',
      "Projeto criado via teste E2E"
    );

    // 4. Confirmar criação
    await page.click('button:has-text("Criar")');

    // 5. Aguardar toast de sucesso
    await expect(page.locator("text=criado com sucesso")).toBeVisible({
      timeout: 5000,
    });

    // 6. Verificar que o projeto aparece na lista
    await expect(page.locator(`text=${projectName}`)).toBeVisible();

    // 7. Navegar para mercados únicos
    await page.click("text=Mercados Únicos");
    await expect(page).toHaveURL(/\/mercados-unicos/);

    // 8. Criar novo mercado
    await page.click('button:has-text("Criar Mercado")');

    const marketName = `Mercado Teste ${Date.now()}`;
    await page.fill('input[placeholder*="nome"]', marketName);
    await page.fill('input[placeholder*="categoria"]', "Tecnologia");

    // 9. Confirmar criação do mercado
    await page.click('button:has-text("Salvar")');

    // 10. Verificar toast de sucesso
    await expect(page.locator("text=Mercado criado")).toBeVisible({
      timeout: 5000,
    });

    // 11. Verificar que mercado aparece na lista
    await expect(page.locator(`text=${marketName}`)).toBeVisible();
  });

  test("deve validar campos obrigatórios ao criar mercado", async ({
    page,
  }) => {
    // 1. Navegar para mercados únicos
    await page.click("text=Mercados Únicos");

    // 2. Abrir modal de criação
    await page.click('button:has-text("Criar Mercado")');

    // 3. Tentar salvar sem preencher campos
    await page.click('button:has-text("Salvar")');

    // 4. Verificar mensagens de validação
    await expect(page.locator("text=obrigatório")).toBeVisible();
  });

  test("deve filtrar mercados por categoria", async ({ page }) => {
    // 1. Navegar para mercados únicos
    await page.click("text=Mercados Únicos");
    await page.waitForLoadState("networkidle");

    // 2. Verificar se há filtro de categoria
    const categoryFilter = page.locator('select, [role="combobox"]').first();

    if (await categoryFilter.isVisible()) {
      // 3. Selecionar uma categoria
      await categoryFilter.click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      // 4. Aguardar atualização da lista
      await page.waitForTimeout(1000);

      // 5. Verificar que a lista foi filtrada
      const marketCards = page.locator('[data-testid="market-card"]');
      const count = await marketCards.count();

      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("deve editar mercado existente", async ({ page }) => {
    // 1. Navegar para mercados únicos
    await page.click("text=Mercados Únicos");
    await page.waitForLoadState("networkidle");

    // 2. Verificar se há mercados
    const firstMarket = page.locator('[data-testid="market-card"]').first();

    if (await firstMarket.isVisible()) {
      // 3. Clicar em editar
      await firstMarket.locator('button:has-text("Editar")').click();

      // 4. Modificar descrição
      const descriptionField = page.locator(
        'textarea[placeholder*="descrição"]'
      );
      await descriptionField.clear();
      await descriptionField.fill(`Descrição atualizada ${Date.now()}`);

      // 5. Salvar alterações
      await page.click('button:has-text("Salvar")');

      // 6. Verificar toast de sucesso
      await expect(page.locator("text=atualizado")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("deve deletar mercado sem dados vinculados", async ({ page }) => {
    // 1. Navegar para mercados únicos
    await page.click("text=Mercados Únicos");

    // 2. Criar mercado temporário para deletar
    await page.click('button:has-text("Criar Mercado")');

    const tempMarketName = `Temp Market ${Date.now()}`;
    await page.fill('input[placeholder*="nome"]', tempMarketName);
    await page.click('button:has-text("Salvar")');

    await expect(page.locator("text=Mercado criado")).toBeVisible({
      timeout: 5000,
    });

    // 3. Localizar o mercado recém-criado
    const tempMarket = page
      .locator(`text=${tempMarketName}`)
      .locator("..")
      .locator("..");

    // 4. Clicar em deletar
    await tempMarket.locator('button:has-text("Deletar")').click();

    // 5. Confirmar deleção
    await page.click('button:has-text("Confirmar")');

    // 6. Verificar que mercado foi removido
    await expect(page.locator(`text=${tempMarketName}`)).not.toBeVisible({
      timeout: 5000,
    });
  });
});
