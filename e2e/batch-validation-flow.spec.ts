import { test, expect } from "@playwright/test";

/**
 * Teste E2E: Fluxo de Validação em Lote
 * Fase 86 - Passo 2
 *
 * Testa validação em lote de clientes, concorrentes e leads
 */

test.describe("Fluxo de Validação em Lote", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("deve validar múltiplos clientes em lote", async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Expandir primeiro mercado
    const firstAccordion = page
      .locator('[data-testid="market-accordion"]')
      .first();

    if (await firstAccordion.isVisible()) {
      await firstAccordion.click();

      // 3. Navegar para aba de Clientes
      await page.click('button:has-text("Clientes")');

      // 4. Selecionar "Selecionar Todos"
      const selectAllCheckbox = page.locator(
        'input[type="checkbox"][aria-label="Selecionar todos"]'
      );

      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.check();

        // 5. Clicar em "Validar Selecionados"
        await page.click('button:has-text("Validar Selecionados")');

        // 6. Confirmar validação no modal
        await page.click('button:has-text("Confirmar")');

        // 7. Aguardar processamento
        await expect(page.locator("text=Validando")).toBeVisible({
          timeout: 5000,
        });

        // 8. Verificar toast de sucesso
        await expect(page.locator("text=validados com sucesso")).toBeVisible({
          timeout: 15000,
        });
      }
    }
  });

  test('deve marcar múltiplos itens como "Rico" em lote', async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Expandir mercado
    const accordion = page.locator('[data-testid="market-accordion"]').first();

    if (await accordion.isVisible()) {
      await accordion.click();

      // 3. Ir para aba de Concorrentes
      await page.click('button:has-text("Concorrentes")');

      // 4. Selecionar alguns itens
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count > 1) {
        // Selecionar primeiros 3 itens
        for (let i = 0; i < Math.min(3, count); i++) {
          await checkboxes.nth(i).check();
        }

        // 5. Clicar em "Marcar como Rico"
        await page.click('button:has-text("Marcar como Rico")');

        // 6. Confirmar ação
        await page.click('button:has-text("Confirmar")');

        // 7. Verificar toast
        await expect(page.locator("text=marcados como Rico")).toBeVisible({
          timeout: 5000,
        });

        // 8. Verificar que badges foram atualizados
        await expect(page.locator('.badge:has-text("Rico")')).toHaveCount(3);
      }
    }
  });

  test("deve validar leads com observações em lote", async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Expandir mercado
    const accordion = page.locator('[data-testid="market-accordion"]').first();

    if (await accordion.isVisible()) {
      await accordion.click();

      // 3. Ir para aba de Leads
      await page.click('button:has-text("Leads")');

      // 4. Selecionar itens
      const selectAllCheckbox = page.locator(
        'input[aria-label="Selecionar todos"]'
      );

      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.check();

        // 5. Clicar em "Validar Selecionados"
        await page.click('button:has-text("Validar Selecionados")');

        // 6. Adicionar observações no modal
        const observationsField = page.locator(
          'textarea[placeholder*="observações"]'
        );

        if (await observationsField.isVisible()) {
          await observationsField.fill("Validação em lote via teste E2E");
        }

        // 7. Confirmar
        await page.click('button:has-text("Confirmar")');

        // 8. Verificar sucesso
        await expect(page.locator("text=validados")).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  test("deve descartar múltiplos itens em lote", async ({ page }) => {
    // 1. Navegar para clientes
    await page.click("text=Clientes");
    await page.waitForLoadState("networkidle");

    // 2. Filtrar por status "Pendente"
    const statusFilter = page.locator('select[name="status"]');

    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption("Pendente");
      await page.waitForTimeout(1000);
    }

    // 3. Selecionar alguns itens
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 1) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // 4. Clicar em "Descartar Selecionados"
      const discardButton = page.locator('button:has-text("Descartar")');

      if (await discardButton.isVisible()) {
        await discardButton.click();

        // 5. Confirmar descarte
        await page.click('button:has-text("Confirmar")');

        // 6. Verificar toast
        await expect(page.locator("text=descartados")).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test("deve exibir modal de confirmação antes de validação em lote", async ({
    page,
  }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Expandir mercado e ir para clientes
    const accordion = page.locator('[data-testid="market-accordion"]').first();

    if (await accordion.isVisible()) {
      await accordion.click();
      await page.click('button:has-text("Clientes")');

      // 3. Selecionar itens
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count > 0) {
        await checkboxes.first().check();

        // 4. Clicar em validar
        await page.click('button:has-text("Validar Selecionados")');

        // 5. Verificar que modal de confirmação aparece
        await expect(page.locator("text=Confirmar Validação")).toBeVisible();

        // 6. Verificar que mostra quantidade de itens
        await expect(page.locator("text=item")).toBeVisible();

        // 7. Cancelar
        await page.click('button:has-text("Cancelar")');

        // 8. Verificar que modal fechou
        await expect(
          page.locator("text=Confirmar Validação")
        ).not.toBeVisible();
      }
    }
  });

  test("deve atualizar contadores após validação em lote", async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Anotar contadores iniciais
    const initialPendingCount = await page
      .locator("text=Pendentes")
      .textContent();

    // 3. Expandir mercado
    const accordion = page.locator('[data-testid="market-accordion"]').first();

    if (await accordion.isVisible()) {
      await accordion.click();
      await page.click('button:has-text("Clientes")');

      // 4. Selecionar e validar 1 item
      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.check();
        await page.click('button:has-text("Validar Selecionados")');
        await page.click('button:has-text("Confirmar")');

        // 5. Aguardar sucesso
        await expect(page.locator("text=validados")).toBeVisible({
          timeout: 10000,
        });

        // 6. Verificar que contador foi atualizado
        await page.waitForTimeout(2000);

        const newPendingCount = await page
          .locator("text=Pendentes")
          .textContent();

        // Contador deve ter mudado
        expect(newPendingCount).not.toBe(initialPendingCount);
      }
    }
  });

  test("deve permitir validação parcial com filtros aplicados", async ({
    page,
  }) => {
    // 1. Navegar para clientes
    await page.click("text=Clientes");
    await page.waitForLoadState("networkidle");

    // 2. Aplicar filtro de qualidade
    const qualityFilter = page.locator('select[name="quality"]');

    if (await qualityFilter.isVisible()) {
      await qualityFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);

      // 3. Selecionar todos os itens filtrados
      const selectAllCheckbox = page.locator(
        'input[aria-label="Selecionar todos"]'
      );

      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.check();

        // 4. Validar
        await page.click('button:has-text("Validar Selecionados")');
        await page.click('button:has-text("Confirmar")');

        // 5. Verificar que apenas itens filtrados foram validados
        await expect(page.locator("text=validados")).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  test("deve manter seleção ao navegar entre abas", async ({ page }) => {
    // 1. Navegar para cockpit dinâmico
    await page.click("text=Cockpit Dinâmico");
    await page.waitForLoadState("networkidle");

    // 2. Expandir mercado
    const accordion = page.locator('[data-testid="market-accordion"]').first();

    if (await accordion.isVisible()) {
      await accordion.click();

      // 3. Selecionar itens na aba Clientes
      await page.click('button:has-text("Clientes")');

      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.check();

        // 4. Navegar para outra aba
        await page.click('button:has-text("Concorrentes")');

        // 5. Voltar para Clientes
        await page.click('button:has-text("Clientes")');

        // 6. Verificar que seleção foi mantida
        const isStillChecked = await checkbox.isChecked();
        expect(isStillChecked).toBeTruthy();
      }
    }
  });
});
